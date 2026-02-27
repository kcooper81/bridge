import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
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

// PATCH /api/approvals/prompts/[id] — approve or reject a prompt
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const db = createServiceClient();

    // Verify prompt belongs to the same org
    const { data: prompt } = await db
      .from("prompts")
      .select("id, org_id, owner_id, title")
      .eq("id", id)
      .single();

    if (!prompt || prompt.org_id !== auth.orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const newStatus = action === "approve" ? "approved" : "draft";
    const { error: updateError } = await db
      .from("prompts")
      .update({ status: newStatus })
      .eq("id", id);

    if (updateError) {
      console.error("Approval update error:", updateError);
      return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
    }

    // If rejecting with a reason, create a notification for the prompt owner
    if (action === "reject" && reason) {
      await db.from("notifications").insert({
        user_id: prompt.owner_id,
        org_id: auth.orgId,
        type: "prompt_rejected",
        title: "Prompt returned to draft",
        message: `"${prompt.title}" was returned to draft: ${reason}`,
        metadata: { prompt_id: id, reason, rejected_by: auth.userId },
      });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Approval PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
