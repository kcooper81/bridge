import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  createDlpProfile,
  createHttpDlpPolicy,
  listDlpProfiles,
  deleteDlpProfile,
  deleteHttpDlpPolicy,
  type DlpRuleForExport,
} from "@/lib/cloudflare-enterprise";
import type { CloudflareConfig } from "@/lib/cloudflare-gateway";

/**
 * POST /api/integrations/cloudflare/enterprise
 *
 * Enterprise-tier Cloudflare integration:
 * - action: "sync-dlp" — Push TeamPrompt DLP rules to Cloudflare as a DLP profile + HTTP policy
 * - action: "status" — Check if enterprise DLP is configured
 * - action: "remove" — Remove TeamPrompt DLP profile from Cloudflare
 */
export async function POST(req: NextRequest) {
  try {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });
  if (profile.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  // Get org settings for Cloudflare credentials
  const { data: org } = await db
    .from("organizations")
    .select("settings")
    .eq("id", profile.org_id)
    .single();

  const settings = (org?.settings || {}) as Record<string, unknown>;
  if (!settings.cloudflare_account_id || !settings.cloudflare_api_token) {
    return NextResponse.json({ error: "Cloudflare not connected. Connect in Settings → Integrations first." }, { status: 400 });
  }

  const config: CloudflareConfig = {
    account_id: settings.cloudflare_account_id as string,
    api_token: settings.cloudflare_api_token as string,
  };

  const body = await req.json();
  const { action } = body;

  // ── Check enterprise DLP status ──
  if (action === "status") {
    const listResult = await listDlpProfiles(config);
    if (!listResult.success) {
      return NextResponse.json({ error: `Failed to check DLP status: ${listResult.error}` }, { status: 502 });
    }
    const tpProfile = listResult.profiles.find((p) => p.name === "TeamPrompt DLP");
    return NextResponse.json({
      configured: !!tpProfile,
      profileId: tpProfile?.id || null,
    });
  }

  // ── Sync DLP rules to Cloudflare ──
  if (action === "sync-dlp") {
    // Fetch all active rules
    const { data: rules } = await db
      .from("security_rules")
      .select("name, description, pattern, pattern_type, category, severity")
      .eq("org_id", profile.org_id)
      .eq("is_active", true);

    if (!rules || rules.length === 0) {
      return NextResponse.json({ error: "No active rules to sync" }, { status: 400 });
    }

    const typedRules = rules as DlpRuleForExport[];
    const redactCount = typedRules.filter((r) => r.severity === "redact").length;
    const nonRegexCount = typedRules.filter((r) => r.pattern_type !== "regex").length;
    const blockRules = typedRules.filter((r) => r.severity === "block" && r.pattern_type === "regex");
    const warnRules = typedRules.filter((r) => r.severity === "warn" && r.pattern_type === "regex");

    if (blockRules.length === 0 && warnRules.length === 0) {
      const reasons = [];
      if (redactCount > 0) reasons.push(`${redactCount} are redact-severity (handled client-side by the extension, not at network level)`);
      if (nonRegexCount > 0) reasons.push(`${nonRegexCount} are non-regex (Cloudflare DLP only supports regex)`);
      return NextResponse.json({
        error: `No rules eligible for Cloudflare sync. ${reasons.join("; ")}.`,
      }, { status: 400 });
    }

    // Clean up existing profiles
    const existingResult = await listDlpProfiles(config);
    if (!existingResult.success) {
      return NextResponse.json({ error: `Failed to check existing DLP profiles: ${existingResult.error}` }, { status: 502 });
    }
    for (const profileName of ["TeamPrompt DLP", "TeamPrompt DLP (Warn)"]) {
      const existingProfile = existingResult.profiles.find((p) => p.name === profileName);
      if (existingProfile) {
        const deleteResult = await deleteDlpProfile(config, existingProfile.id);
        if (!deleteResult.success) {
          return NextResponse.json({ error: `Failed to remove existing profile "${profileName}". Try again or delete it manually in Cloudflare.` }, { status: 500 });
        }
      }
    }

    const approvedTools = (settings.approved_ai_tools as string[]) || ["chatgpt", "claude", "gemini", "copilot", "perplexity"];
    const profileIds: string[] = [];
    let blockSynced = 0;
    let warnSynced = 0;
    const warnings: string[] = [];

    // ── Block-severity rules → Cloudflare "block" action ──
    if (blockRules.length > 0) {
      const profileResult = await createDlpProfile(config, "TeamPrompt DLP", typedRules, "block");
      if (!profileResult.success || !profileResult.profileId) {
        return NextResponse.json({ error: profileResult.error || "Failed to create block DLP profile" }, { status: 500 });
      }
      profileIds.push(profileResult.profileId);
      blockSynced = profileResult.entryCount || 0;

      const policyResult = await createHttpDlpPolicy(config, profileResult.profileId, approvedTools, "block", "TeamPrompt: DLP Content Scan");
      if (!policyResult.success) {
        warnings.push(`Block DLP profile created but HTTP block policy failed: ${policyResult.error}. You may need to create it manually in Cloudflare.`);
      }
    }

    // ── Warn-severity rules → Cloudflare "audit" action (log only, no block) ──
    if (warnRules.length > 0) {
      const profileResult = await createDlpProfile(config, "TeamPrompt DLP (Warn)", typedRules, "warn");
      if (!profileResult.success || !profileResult.profileId) {
        warnings.push(`Failed to create warn DLP profile: ${profileResult.error}. Warn rules will not be audited at the network level.`);
      } else {
        profileIds.push(profileResult.profileId);
        warnSynced = profileResult.entryCount || 0;

        const policyResult = await createHttpDlpPolicy(config, profileResult.profileId, approvedTools, "audit", "TeamPrompt: DLP Warn Audit");
        if (!policyResult.success) {
          warnings.push(`Warn DLP profile created but HTTP audit policy failed: ${policyResult.error}. You may need to create it manually in Cloudflare.`);
        }
      }
    }

    // Only mark enterprise enabled if at least one profile was successfully created
    const fullyConfigured = profileIds.length > 0 && warnings.length === 0;
    const partiallyConfigured = profileIds.length > 0;
    const updatedSettings = {
      ...settings,
      cloudflare_enterprise_enabled: partiallyConfigured,
      cloudflare_dlp_profile_id: profileIds[0] || null,
    };
    await db.from("organizations").update({ settings: updatedSettings }).eq("id", profile.org_id);

    // Build summary message
    const parts = [];
    if (blockSynced > 0) parts.push(`${blockSynced} block rules → Cloudflare block policy`);
    if (warnSynced > 0) parts.push(`${warnSynced} warn rules → Cloudflare audit policy`);
    const skippedParts = [];
    if (redactCount > 0) skippedParts.push(`${redactCount} redact rules (client-side only)`);
    if (nonRegexCount > 0) skippedParts.push(`${nonRegexCount} non-regex rules`);

    return NextResponse.json({
      success: true,
      fullyConfigured,
      profileIds,
      rulesSynced: blockSynced + warnSynced,
      blockSynced,
      warnSynced,
      redactSkipped: redactCount,
      totalRules: rules.length,
      warnings: warnings.length > 0 ? warnings : undefined,
      message: `${parts.join("; ")}.${skippedParts.length > 0 ? ` Skipped: ${skippedParts.join(", ")}.` : ""}${!fullyConfigured && partiallyConfigured ? " Some policies had issues — check warnings." : ""}`,
    });
  }

  // ── Remove enterprise DLP ──
  if (action === "remove") {
    const errors: string[] = [];

    // Delete HTTP policy first (it references the DLP profile)
    const httpResult = await deleteHttpDlpPolicy(config);
    if (!httpResult.success) {
      errors.push(`Failed to remove HTTP policy: ${httpResult.error}`);
    }

    // Delete DLP profiles (both block and warn)
    const profilesResult = await listDlpProfiles(config);
    if (!profilesResult.success) {
      errors.push(`Failed to list DLP profiles for cleanup: ${profilesResult.error}`);
    }
    for (const profileName of ["TeamPrompt DLP", "TeamPrompt DLP (Warn)"]) {
      const tpProfile = profilesResult.profiles.find((p) => p.name === profileName);
      if (tpProfile) {
        const delResult = await deleteDlpProfile(config, tpProfile.id);
        if (!delResult.success) {
          errors.push(`Failed to remove DLP profile "${profileName}": ${delResult.error}`);
        }
      }
    }

    const updatedSettings = { ...settings, cloudflare_enterprise_enabled: false, cloudflare_dlp_profile_id: null };
    await db.from("organizations").update({ settings: updatedSettings }).eq("id", profile.org_id);

    if (errors.length > 0) {
      return NextResponse.json({ success: true, warnings: errors, message: "Removed from TeamPrompt but some Cloudflare resources may need manual cleanup." });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
