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

// PATCH — approve or reject a request (admin/manager only)
// On approve: returns the pack details so the client can trigger the actual install
export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId } = params;
    const body = await request.json();
    const { action } = body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    const db = createServiceClient();

    // Fetch the request
    const { data: req } = await db
      .from("pack_install_requests")
      .select("*")
      .eq("id", requestId)
      .eq("org_id", auth.orgId)
      .single();

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (req.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { error: updateError } = await db
      .from("pack_install_requests")
      .update({
        status: newStatus,
        reviewed_by: auth.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      pack_id: req.pack_id,
      pack_type: req.pack_type,
    });
  } catch (error) {
    console.error("Pack request PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
