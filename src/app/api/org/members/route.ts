import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

/**
 * PATCH /api/org/members — Update a member's role
 * DELETE /api/org/members — Remove a member from the org
 *
 * Uses the service client to bypass RLS (profiles_update only allows
 * users to update their own profile, so admins can't modify others
 * via the browser client).
 */

async function getCallerProfile(db: ReturnType<typeof createServiceClient>, userId: string) {
  const { data } = await db
    .from("profiles")
    .select("id, org_id, role")
    .eq("id", userId)
    .single();
  return data;
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit(limiters.orgEnsure, user.id);
    if (!rl.success) return rl.response;

    const { memberId, role } = await request.json();
    if (!memberId || !role) {
      return NextResponse.json({ error: "memberId and role are required" }, { status: 400 });
    }

    const validRoles = ["admin", "manager", "member"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const caller = await getCallerProfile(db, user.id);
    if (!caller?.org_id || !["admin", "manager"].includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Managers cannot promote to admin
    if (caller.role === "manager" && role === "admin") {
      return NextResponse.json({ error: "Managers cannot assign admin role" }, { status: 403 });
    }

    // Verify target is in the same org
    const { data: target } = await db
      .from("profiles")
      .select("id, org_id, role")
      .eq("id", memberId)
      .single();

    if (!target || target.org_id !== caller.org_id) {
      return NextResponse.json({ error: "Member not found in your organization" }, { status: 404 });
    }

    // Cannot change own role via this endpoint
    if (memberId === user.id) {
      return NextResponse.json({ error: "Cannot change your own role here" }, { status: 400 });
    }

    const { error } = await db
      .from("profiles")
      .update({ role })
      .eq("id", memberId);

    if (error) {
      console.error("Failed to update member role:", error);
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update member role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit(limiters.orgEnsure, user.id);
    if (!rl.success) return rl.response;

    const { memberId } = await request.json();
    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const caller = await getCallerProfile(db, user.id);
    if (!caller?.org_id || !["admin", "manager"].includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot remove yourself via this endpoint
    if (memberId === user.id) {
      return NextResponse.json({ error: "Cannot remove yourself. Use leave-org instead." }, { status: 400 });
    }

    // Verify target is in the same org
    const { data: target } = await db
      .from("profiles")
      .select("id, org_id, role, email, name")
      .eq("id", memberId)
      .single();

    if (!target || target.org_id !== caller.org_id) {
      return NextResponse.json({ error: "Member not found in your organization" }, { status: 404 });
    }

    // Managers cannot remove admins
    if (caller.role === "manager" && target.role === "admin") {
      return NextResponse.json({ error: "Managers cannot remove admins" }, { status: 403 });
    }

    // Remove from all teams first
    await db.from("team_members").delete().eq("user_id", memberId);

    // Set org_id to null (removes from org)
    const { error } = await db
      .from("profiles")
      .update({ org_id: null })
      .eq("id", memberId);

    if (error) {
      console.error("Failed to remove member:", error);
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }

    // Revoke pending invites for this email so they can't auto-rejoin
    if (target.email) {
      await db
        .from("invites")
        .update({ status: "revoked" })
        .eq("org_id", caller.org_id)
        .ilike("email", target.email)
        .eq("status", "pending");
    }

    // Notify admins
    const { data: admins } = await db
      .from("profiles")
      .select("id")
      .eq("org_id", caller.org_id)
      .eq("role", "admin");

    if (admins?.length) {
      await db.from("notifications").insert(
        admins.map((a: { id: string }) => ({
          user_id: a.id,
          org_id: caller.org_id,
          type: "member_left" as const,
          title: "Member removed",
          message: `${target.name || target.email} was removed from the organization.`,
          metadata: { member_id: memberId, member_email: target.email, removed_by: user.id },
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
