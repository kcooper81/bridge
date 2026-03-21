import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { generateApiKey } from "@/lib/mcp/auth";

const ALL_SCOPES = ["search_prompts", "get_prompt", "list_templates", "check_dlp", "log_usage"];

/** GET — list API keys for the user's org */
export async function GET(request: NextRequest) {
  // Try admin auth first, fall back to regular user auth for org admins
  const authHeader = request.headers.get("authorization");
  const db = createServiceClient();

  let orgId: string | null = null;

  // Check if caller is an admin
  const admin = await verifyAdminAccess();
  if (admin) {
    // Super admin — need an org_id param
    orgId = request.nextUrl.searchParams.get("org_id");
  }

  if (!orgId) {
    // Regular user — get org from their profile via session
    const { data: { user } } = await db.auth.getUser(
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined
    );
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    orgId = profile.org_id;
  }

  const { data: keys, error } = await db
    .from("mcp_api_keys")
    .select("id, name, key_prefix, scopes, last_used_at, expires_at, revoked_at, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load keys" }, { status: 500 });
  }

  return NextResponse.json({ keys: keys || [] });
}

/** POST — create a new API key */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const db = createServiceClient();

  const { data: { user } } = await db.auth.getUser(
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined
  );
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { checkRateLimit } = await import("@/lib/rate-limit");
  const { limiters } = await import("@/lib/rate-limit");
  const rl = await checkRateLimit(limiters.mcpKeys, user.id);
  if (!rl.success) return rl.response;

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Key name is required" }, { status: 400 });

  const scopes = Array.isArray(body.scopes)
    ? body.scopes.filter((s: string) => ALL_SCOPES.includes(s))
    : ALL_SCOPES;

  const { rawKey, keyHash, keyPrefix } = generateApiKey();

  const { data: key, error } = await db
    .from("mcp_api_keys")
    .insert({
      org_id: profile.org_id,
      created_by: user.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      scopes,
      expires_at: body.expires_at || null,
    })
    .select("id, name, key_prefix, scopes, created_at")
    .single();

  if (error) {
    console.error("Failed to create API key:", error);
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }

  // Return the raw key ONCE — it cannot be retrieved after this
  return NextResponse.json({
    key: { ...key, raw_key: rawKey },
  });
}
