import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { AI_TOOL_DOMAINS, syncBlockedTools, verifyConnection, type CloudflareConfig } from "@/lib/cloudflare-gateway";

/** GET — Get current tool policy */
export async function GET(req: NextRequest) {
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

  // Get org settings
  const { data: org } = await db
    .from("organizations")
    .select("settings")
    .eq("id", profile.org_id)
    .single();

  const settings = (org?.settings || {}) as Record<string, unknown>;
  const approvedTools = (settings.approved_ai_tools as string[]) || ["chatgpt", "claude", "gemini", "copilot", "perplexity"];
  const policyEnabled = settings.allow_external_ai_tools === false;

  // Check Cloudflare connection (stored in same settings JSONB)
  const cloudflareConnected = !!(settings.cloudflare_account_id && settings.cloudflare_api_token);
  const cloudflareBlockedTools = (settings.cloudflare_blocked_tools as string[]) || [];

  // Build tool list with status
  const tools = AI_TOOL_DOMAINS.map((tool) => ({
    id: tool.id,
    name: tool.name,
    domains: tool.domains,
    category: tool.category,
    approved: approvedTools.includes(tool.id),
    cloudflareBlocked: cloudflareBlockedTools.includes(tool.id),
  }));

  return NextResponse.json({
    policyEnabled,
    cloudflareConnected,
    tools,
    approvedTools,
  });
}

/** POST — Update tool policy */
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

  const body = await req.json();
  const { approvedToolIds, policyEnabled } = body;

  if (!Array.isArray(approvedToolIds)) {
    return NextResponse.json({ error: "approvedToolIds must be an array" }, { status: 400 });
  }

  // Update org settings
  const { data: org } = await db
    .from("organizations")
    .select("settings")
    .eq("id", profile.org_id)
    .single();

  const currentSettings = (org?.settings || {}) as Record<string, unknown>;
  const updatedSettings = {
    ...currentSettings,
    approved_ai_tools: approvedToolIds,
    allow_external_ai_tools: !policyEnabled,
  };

  await db
    .from("organizations")
    .update({ settings: updatedSettings })
    .eq("id", profile.org_id);

  // Sync to Cloudflare if connected
  let cloudflareSynced = false;
  let cloudflareResult = null;

  if (currentSettings.cloudflare_account_id && currentSettings.cloudflare_api_token) {
    const config: CloudflareConfig = {
      account_id: currentSettings.cloudflare_account_id as string,
      api_token: currentSettings.cloudflare_api_token as string,
    };

    // Verify connection still works
    const verification = await verifyConnection(config);
    if (verification.success) {
      // Block tools that are NOT approved (inverse of approved list)
      const allToolIds = AI_TOOL_DOMAINS.map((t) => t.id);
      const blockedToolIds = policyEnabled
        ? allToolIds.filter((id) => !approvedToolIds.includes(id))
        : []; // If policy disabled, unblock everything

      cloudflareResult = await syncBlockedTools(config, blockedToolIds);
      cloudflareSynced = true;

      // Update cloudflare blocked list in org settings
      await db
        .from("organizations")
        .update({ settings: { ...updatedSettings, cloudflare_blocked_tools: blockedToolIds } })
        .eq("id", profile.org_id);
    }
  }

  // Log the policy change
  try {
    await db.from("conversation_logs").insert({
      org_id: profile.org_id,
      user_id: user.id,
      ai_tool: "system",
      action: "sent",
      prompt_text: `Tool policy updated: ${policyEnabled ? "enabled" : "disabled"}. Approved tools: ${approvedToolIds.join(", ")}${cloudflareSynced ? ". Synced to Cloudflare Gateway." : ""}`,
      risk_score: 0,
      metadata: { type: "tool_policy_change", approvedToolIds, policyEnabled, cloudflareSynced },
    });
  } catch {
    // Non-critical — don't fail the request
  }

  return NextResponse.json({
    success: true,
    cloudflareSynced,
    cloudflareResult,
  });
}
