import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  verifyConnection,
  syncBlockedTools,
  AI_TOOL_DOMAINS,
  type CloudflareConfig,
} from "@/lib/cloudflare-gateway";

/** Helper: get the current user's org and verify admin role */
async function getOrgAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return { error: "No organization", status: 400 };
  if (profile.role !== "admin") return { error: "Admin access required", status: 403 };

  return { userId: user.id, orgId: profile.org_id };
}

/** GET — Get Cloudflare connection status + current rules */
export async function GET(req: NextRequest) {
  const auth = await getOrgAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const db = createServiceClient();
  const { data: settings } = await db
    .from("org_settings")
    .select("cloudflare_account_id, cloudflare_api_token, cloudflare_blocked_tools")
    .eq("org_id", auth.orgId)
    .single();

  if (!settings?.cloudflare_account_id || !settings?.cloudflare_api_token) {
    return NextResponse.json({
      connected: false,
      tools: AI_TOOL_DOMAINS.map((t) => ({ ...t, blocked: false })),
    });
  }

  // Verify connection is still valid
  const config: CloudflareConfig = {
    account_id: settings.cloudflare_account_id,
    api_token: settings.cloudflare_api_token,
  };

  const verification = await verifyConnection(config);
  const blockedTools: string[] = settings.cloudflare_blocked_tools || [];

  return NextResponse.json({
    connected: verification.success,
    accountId: settings.cloudflare_account_id,
    blockedTools,
    tools: AI_TOOL_DOMAINS.map((t) => ({
      ...t,
      blocked: blockedTools.includes(t.id),
    })),
  });
}

/** POST — Connect Cloudflare account or sync tools */
export async function POST(req: NextRequest) {
  const auth = await getOrgAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { action } = body;

  const db = createServiceClient();

  // ── Connect account ──
  if (action === "connect") {
    const { account_id, api_token } = body;
    if (!account_id || !api_token) {
      return NextResponse.json({ error: "Account ID and API token are required" }, { status: 400 });
    }

    const config: CloudflareConfig = { account_id, api_token };
    const result = await verifyConnection(config);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Invalid credentials" }, { status: 400 });
    }

    // Store credentials
    await db
      .from("org_settings")
      .update({
        cloudflare_account_id: account_id,
        cloudflare_api_token: api_token,
        cloudflare_connected_at: new Date().toISOString(),
      })
      .eq("org_id", auth.orgId);

    return NextResponse.json({ success: true });
  }

  // ── Sync blocked tools ──
  if (action === "sync") {
    const { blockedToolIds } = body;
    if (!Array.isArray(blockedToolIds)) {
      return NextResponse.json({ error: "blockedToolIds must be an array" }, { status: 400 });
    }

    const { data: settings } = await db
      .from("org_settings")
      .select("cloudflare_account_id, cloudflare_api_token")
      .eq("org_id", auth.orgId)
      .single();

    if (!settings?.cloudflare_account_id || !settings?.cloudflare_api_token) {
      return NextResponse.json({ error: "Cloudflare not connected" }, { status: 400 });
    }

    const config: CloudflareConfig = {
      account_id: settings.cloudflare_account_id,
      api_token: settings.cloudflare_api_token,
    };

    const result = await syncBlockedTools(config, blockedToolIds);

    // Save the blocked tools list
    await db
      .from("org_settings")
      .update({ cloudflare_blocked_tools: blockedToolIds })
      .eq("org_id", auth.orgId);

    return NextResponse.json({
      success: true,
      created: result.created,
      deleted: result.deleted,
      errors: result.errors,
    });
  }

  // ── Disconnect ──
  if (action === "disconnect") {
    await db
      .from("org_settings")
      .update({
        cloudflare_account_id: null,
        cloudflare_api_token: null,
        cloudflare_blocked_tools: null,
        cloudflare_connected_at: null,
      })
      .eq("org_id", auth.orgId);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
