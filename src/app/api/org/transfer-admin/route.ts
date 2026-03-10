import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

/**
 * POST — Transfer admin role to another org member.
 * Promotes the target member to admin and demotes the current user.
 *
 * Body: { target_user_id: string; new_role?: "manager" | "member" }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit by user ID
  const rl = await checkRateLimit(limiters.transferAdmin, user.id);
  if (!rl.success) return rl.response;

  const body = await request.json();
  const { target_user_id, new_role = "member" } = body;

  if (!target_user_id) {
    return NextResponse.json(
      { error: "target_user_id is required" },
      { status: 400 }
    );
  }

  if (!["manager", "member"].includes(new_role)) {
    return NextResponse.json(
      { error: "new_role must be 'manager' or 'member'" },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // Get current user's profile
  const { data: currentProfile } = await db
    .from("profiles")
    .select("id, org_id, role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can transfer admin role" },
      { status: 403 }
    );
  }

  if (!currentProfile.org_id) {
    return NextResponse.json(
      { error: "You are not in an organization" },
      { status: 400 }
    );
  }

  if (target_user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot transfer to yourself" },
      { status: 400 }
    );
  }

  // Verify target user is in the same org
  const { data: targetProfile } = await db
    .from("profiles")
    .select("id, org_id, role, name, email")
    .eq("id", target_user_id)
    .single();

  if (!targetProfile || targetProfile.org_id !== currentProfile.org_id) {
    return NextResponse.json(
      { error: "Target user is not in your organization" },
      { status: 400 }
    );
  }

  // Perform transfer: promote target, demote current user
  const now = new Date().toISOString();

  try {
    const { error: promoteError } = await db
      .from("profiles")
      .update({ role: "admin", updated_at: now })
      .eq("id", target_user_id);

    if (promoteError) {
      console.error("Transfer admin promote error:", promoteError);
      return NextResponse.json(
        { error: "Failed to promote target user" },
        { status: 500 }
      );
    }

    const { error: demoteError } = await db
      .from("profiles")
      .update({ role: new_role, updated_at: now })
      .eq("id", user.id);

    if (demoteError) {
      // Rollback: revert target back to their original role
      await db
        .from("profiles")
        .update({ role: targetProfile.role, updated_at: now })
        .eq("id", target_user_id);

      console.error("Transfer admin demote error:", demoteError);
      return NextResponse.json(
        { error: "Failed to demote current admin. Transfer has been rolled back." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      new_admin: {
        id: targetProfile.id,
        name: targetProfile.name,
        email: targetProfile.email,
      },
      your_new_role: new_role,
    });
  } catch (error) {
    // If an unexpected error occurs after promote but before demote completes,
    // attempt to rollback the target's role to their original role.
    console.error("Transfer admin unexpected error:", error);
    try {
      await db
        .from("profiles")
        .update({ role: targetProfile.role, updated_at: now })
        .eq("id", target_user_id);
    } catch (rollbackError) {
      console.error("Transfer admin rollback also failed:", rollbackError);
    }
    return NextResponse.json(
      { error: "Transfer failed. Please verify roles and try again." },
      { status: 500 }
    );
  }
}
