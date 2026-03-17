import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** DELETE — revoke an API key */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");
  const db = createServiceClient();

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

  // Verify key belongs to this org
  const { data: key } = await db
    .from("mcp_api_keys")
    .select("id, org_id")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single();

  if (!key) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  // Soft-revoke
  const { error } = await db
    .from("mcp_api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
