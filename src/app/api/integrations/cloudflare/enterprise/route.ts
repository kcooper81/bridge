import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  createDlpProfile,
  createHttpDlpPolicy,
  listDlpProfiles,
  deleteDlpProfile,
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
    const profiles = await listDlpProfiles(config);
    const tpProfile = profiles.find((p) => p.name === "TeamPrompt DLP");
    return NextResponse.json({
      configured: !!tpProfile,
      profileId: tpProfile?.id || null,
    });
  }

  // ── Sync DLP rules to Cloudflare ──
  if (action === "sync-dlp") {
    // Fetch all active regex rules
    const { data: rules } = await db
      .from("security_rules")
      .select("name, description, pattern, pattern_type, category, severity")
      .eq("org_id", profile.org_id)
      .eq("is_active", true);

    if (!rules || rules.length === 0) {
      return NextResponse.json({ error: "No active rules to sync" }, { status: 400 });
    }

    // Check if profile already exists and delete it
    const existing = await listDlpProfiles(config);
    const existingProfile = existing.find((p) => p.name === "TeamPrompt DLP");
    if (existingProfile) {
      const deleteResult = await deleteDlpProfile(config, existingProfile.id);
      if (!deleteResult.success) {
        return NextResponse.json({ error: "Failed to remove existing DLP profile. Try again or delete it manually in Cloudflare." }, { status: 500 });
      }
    }

    // Create new DLP profile with current rules
    const profileResult = await createDlpProfile(config, "TeamPrompt DLP", rules as DlpRuleForExport[]);
    if (!profileResult.success || !profileResult.profileId) {
      return NextResponse.json({ error: profileResult.error || "Failed to create DLP profile" }, { status: 500 });
    }

    // Get approved tools for HTTP policy scope
    const approvedTools = (settings.approved_ai_tools as string[]) || ["chatgpt", "claude", "gemini", "copilot", "perplexity"];

    // Create HTTP policy using the DLP profile
    const policyResult = await createHttpDlpPolicy(config, profileResult.profileId, approvedTools);
    if (!policyResult.success) {
      return NextResponse.json({
        warning: "DLP profile created but HTTP policy failed. You may need to create the HTTP policy manually in Cloudflare.",
        profileId: profileResult.profileId,
        error: policyResult.error,
      });
    }

    // Save enterprise status to org settings
    const updatedSettings = { ...settings, cloudflare_enterprise_enabled: true, cloudflare_dlp_profile_id: profileResult.profileId };
    await db.from("organizations").update({ settings: updatedSettings }).eq("id", profile.org_id);

    const regexCount = (rules as DlpRuleForExport[]).filter((r) => r.pattern_type === "regex").length;
    return NextResponse.json({
      success: true,
      profileId: profileResult.profileId,
      rulesSynced: regexCount,
      totalRules: rules.length,
      skipped: rules.length - regexCount,
      message: `${regexCount} regex rules synced to Cloudflare DLP. ${rules.length - regexCount} non-regex rules skipped (Cloudflare DLP only supports regex).`,
    });
  }

  // ── Remove enterprise DLP ──
  if (action === "remove") {
    const profiles = await listDlpProfiles(config);
    const tpProfile = profiles.find((p) => p.name === "TeamPrompt DLP");
    if (tpProfile) {
      await deleteDlpProfile(config, tpProfile.id);
    }

    const updatedSettings = { ...settings, cloudflare_enterprise_enabled: false, cloudflare_dlp_profile_id: null };
    await db.from("organizations").update({ settings: updatedSettings }).eq("id", profile.org_id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
