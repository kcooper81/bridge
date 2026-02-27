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

// PATCH — approve or reject a rule suggestion (admin/manager only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, admin_notes } = body;

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    // Fetch the suggestion and verify it belongs to this org
    const { data: suggestion } = await db
      .from("rule_suggestions")
      .select("*")
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .single();

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    if (suggestion.status !== "pending") {
      return NextResponse.json(
        { error: "Suggestion already reviewed" },
        { status: 400 }
      );
    }

    const { error: updateError } = await db
      .from("rule_suggestions")
      .update({
        status: action,
        reviewed_by: auth.userId,
        reviewed_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rule suggestion PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
