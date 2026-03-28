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

  return { userId: user.id, orgId: profile.org_id, db };
}

/** Helper: read org settings JSONB */
async function getOrgSettings(db: ReturnType<typeof createServiceClient>, orgId: string) {
  const { data: org } = await db
    .from("organizations")
    .select("settings")
    .eq("id", orgId)
    .single();
  return (org?.settings || {}) as Record<string, unknown>;
}

/** Helper: update org settings JSONB (merges keys) */
async function updateOrgSettings(db: ReturnType<typeof createServiceClient>, orgId: string, updates: Record<string, unknown>) {
  const current = await getOrgSettings(db, orgId);
  await db
    .from("organizations")
    .update({ settings: { ...current, ...updates } })
    .eq("id", orgId);
}

/** GET — Get Cloudflare connection status + current rules */
export async function GET(req: NextRequest) {
  const auth = await getOrgAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const settings = await getOrgSettings(auth.db, auth.orgId);

  if (!settings.cloudflare_account_id || !settings.cloudflare_api_token) {
    return NextResponse.json({
      connected: false,
      tools: AI_TOOL_DOMAINS.map((t) => ({ ...t, blocked: false })),
    });
  }

  const config: CloudflareConfig = {
    account_id: settings.cloudflare_account_id as string,
    api_token: settings.cloudflare_api_token as string,
  };

  const verification = await verifyConnection(config);
  const blockedTools = (settings.cloudflare_blocked_tools as string[]) || [];

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

    await updateOrgSettings(auth.db, auth.orgId, {
      cloudflare_account_id: account_id,
      cloudflare_api_token: api_token,
      cloudflare_connected_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  }

  // ── Sync blocked tools ──
  if (action === "sync") {
    const { blockedToolIds } = body;
    if (!Array.isArray(blockedToolIds)) {
      return NextResponse.json({ error: "blockedToolIds must be an array" }, { status: 400 });
    }

    const settings = await getOrgSettings(auth.db, auth.orgId);

    if (!settings.cloudflare_account_id || !settings.cloudflare_api_token) {
      return NextResponse.json({ error: "Cloudflare not connected" }, { status: 400 });
    }

    const config: CloudflareConfig = {
      account_id: settings.cloudflare_account_id as string,
      api_token: settings.cloudflare_api_token as string,
    };

    const result = await syncBlockedTools(config, blockedToolIds);

    await updateOrgSettings(auth.db, auth.orgId, {
      cloudflare_blocked_tools: blockedToolIds,
    });

    return NextResponse.json({
      success: true,
      created: result.created,
      deleted: result.deleted,
      errors: result.errors,
    });
  }

  // ── Disconnect ──
  if (action === "disconnect") {
    await updateOrgSettings(auth.db, auth.orgId, {
      cloudflare_account_id: null,
      cloudflare_api_token: null,
      cloudflare_blocked_tools: null,
      cloudflare_connected_at: null,
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
