import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  verifyConnection,
  syncBlockedTools,
  AI_TOOL_DOMAINS,
  type CloudflareConfig,
} from "@/lib/cloudflare-gateway";
import { getOrgSecrets, updateOrgSecrets, clearOrgSecrets } from "@/lib/organization-secrets";
import { emitAuditEvent } from "@/lib/audit-events";

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
  try {
    const auth = await getOrgAdmin(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const secrets = await getOrgSecrets(auth.orgId);
    const settings = await getOrgSettings(auth.db, auth.orgId);

    if (!secrets.cloudflare_account_id || !secrets.cloudflare_api_token) {
      return NextResponse.json({
        connected: false,
        tools: AI_TOOL_DOMAINS.map((t) => ({ ...t, blocked: false })),
      });
    }

    const config: CloudflareConfig = {
      account_id: secrets.cloudflare_account_id,
      api_token: secrets.cloudflare_api_token,
    };

    const verification = await verifyConnection(config);
    const blockedTools = (settings.cloudflare_blocked_tools as string[]) || [];

    return NextResponse.json({
      connected: verification.success,
      connectionError: verification.success ? undefined : verification.error,
      accountId: secrets.cloudflare_account_id,
      blockedTools,
      tools: AI_TOOL_DOMAINS.map((t) => ({
        ...t,
        blocked: blockedTools.includes(t.id),
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

/** POST — Connect Cloudflare account or sync tools */
export async function POST(req: NextRequest) {
  try {
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

      await updateOrgSecrets(auth.orgId, {
        cloudflare_account_id: account_id,
        cloudflare_api_token: api_token,
        cloudflare_connected_at: new Date().toISOString(),
      });

      await emitAuditEvent({
        orgId: auth.orgId,
        actorId: auth.userId,
        action: "integration.connect",
        targetType: "cloudflare",
        targetLabel: `Cloudflare (account ${account_id})`,
        metadata: { account_id },
        request: req,
      });

      return NextResponse.json({ success: true });
    }

    // ── Sync blocked tools ──
    if (action === "sync") {
      const { blockedToolIds } = body;
      if (!Array.isArray(blockedToolIds)) {
        return NextResponse.json({ error: "blockedToolIds must be an array" }, { status: 400 });
      }

      const secrets = await getOrgSecrets(auth.orgId);

      if (!secrets.cloudflare_account_id || !secrets.cloudflare_api_token) {
        return NextResponse.json({ error: "Cloudflare not connected" }, { status: 400 });
      }

      const config: CloudflareConfig = {
        account_id: secrets.cloudflare_account_id,
        api_token: secrets.cloudflare_api_token,
      };

      const result = await syncBlockedTools(config, blockedToolIds);

      if (!result.success) {
        return NextResponse.json({ error: result.errors?.[0] || "Failed to sync with Cloudflare" }, { status: 502 });
      }

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
      await clearOrgSecrets(auth.orgId, [
        "cloudflare_account_id",
        "cloudflare_api_token",
        "cloudflare_connected_at",
      ]);
      await updateOrgSettings(auth.db, auth.orgId, {
        cloudflare_blocked_tools: null,
      });

      await emitAuditEvent({
        orgId: auth.orgId,
        actorId: auth.userId,
        action: "integration.disconnect",
        targetType: "cloudflare",
        targetLabel: "Cloudflare",
        request: req,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
