import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role, is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return null;

  return {
    userId: user.id,
    orgId: profile.org_id,
    role: profile.is_super_admin ? "admin" : profile.role,
  };
}

// POST — create a pack install request (any role, but intended for members)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pack_id, pack_type } = body;

    if (!pack_id || !pack_type) {
      return NextResponse.json({ error: "pack_id and pack_type are required" }, { status: 400 });
    }

    if (!["builtin", "custom"].includes(pack_type)) {
      return NextResponse.json({ error: "Invalid pack_type" }, { status: 400 });
    }

    const db = createServiceClient();

    // Check for existing pending request from this user for this pack
    const { data: existing } = await db
      .from("pack_install_requests")
      .select("id")
      .eq("org_id", auth.orgId)
      .eq("pack_id", pack_id)
      .eq("requested_by", auth.userId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "You already have a pending request for this pack" }, { status: 409 });
    }

    const { data: req, error } = await db
      .from("pack_install_requests")
      .insert({
        org_id: auth.orgId,
        pack_id,
        pack_type,
        requested_by: auth.userId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(req, { status: 201 });
  } catch (error) {
    console.error("Pack request POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — list pack install requests for the org
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServiceClient();
    const isAdmin = auth.role === "admin" || auth.role === "manager";

    let query = db
      .from("pack_install_requests")
      .select("*")
      .eq("org_id", auth.orgId)
      .order("created_at", { ascending: false });

    // Members only see their own requests
    if (!isAdmin) {
      query = query.eq("requested_by", auth.userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with requester names
    const userIds = Array.from(new Set((data || []).map((r) => r.requested_by).filter(Boolean)));
    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);
      userMap = Object.fromEntries(
        (profiles || []).map((p) => [p.id, p.name || p.email || "Unknown"])
      );
    }

    const enriched = (data || []).map((r) => ({
      ...r,
      requester_name: userMap[r.requested_by] || "Unknown",
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Pack request GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
