import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

/**
 * PATCH /api/org/team-members — Update a team member's role
 * DELETE /api/org/team-members — Remove a member from a team
 * POST /api/org/team-members/shield — Toggle member shield
 *
 * Uses the service client to bypass RLS and enforce proper admin/manager checks.
 */

async function authenticateAndGetCaller(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser(token);

  if (authError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const rl = await checkRateLimit(limiters.orgEnsure, user.id);
  if (!rl.success) return { error: rl.response };

  const { data: caller } = await db
    .from("profiles")
    .select("id, org_id, role")
    .eq("id", user.id)
    .single();

  if (!caller?.org_id || !["admin", "manager"].includes(caller.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { db, user, caller };
}

// PATCH — update team member role
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateAndGetCaller(request);
    if ("error" in auth) return auth.error;
    const { db, caller } = auth;

    const { teamId, userId, role } = await request.json();
    if (!teamId || !userId || !role) {
      return NextResponse.json({ error: "teamId, userId, and role are required" }, { status: 400 });
    }

    const validRoles = ["admin", "member"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid team role" }, { status: 400 });
    }

    // Verify team belongs to caller's org
    const { data: team } = await db
      .from("teams")
      .select("id, org_id")
      .eq("id", teamId)
      .single();

    if (!team || team.org_id !== caller.org_id) {
      return NextResponse.json({ error: "Team not found in your organization" }, { status: 404 });
    }

    // Verify target user is in the same org
    const { data: target } = await db
      .from("profiles")
      .select("id, org_id")
      .eq("id", userId)
      .single();

    if (!target || target.org_id !== caller.org_id) {
      return NextResponse.json({ error: "User not found in your organization" }, { status: 404 });
    }

    const { error } = await db
      .from("team_members")
      .update({ role })
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to update team member role:", error);
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update team member role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove member from team
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateAndGetCaller(request);
    if ("error" in auth) return auth.error;
    const { db, caller } = auth;

    const { teamId, userId } = await request.json();
    if (!teamId || !userId) {
      return NextResponse.json({ error: "teamId and userId are required" }, { status: 400 });
    }

    // Verify team belongs to caller's org
    const { data: team } = await db
      .from("teams")
      .select("id, org_id")
      .eq("id", teamId)
      .single();

    if (!team || team.org_id !== caller.org_id) {
      return NextResponse.json({ error: "Team not found in your organization" }, { status: 404 });
    }

    // Verify target user is in the same org
    const { data: target } = await db
      .from("profiles")
      .select("id, org_id")
      .eq("id", userId)
      .single();

    if (!target || target.org_id !== caller.org_id) {
      return NextResponse.json({ error: "User not found in your organization" }, { status: 404 });
    }

    const { error } = await db
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to remove team member:", error);
      return NextResponse.json({ error: "Failed to remove from team" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove team member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — toggle member shield
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndGetCaller(request);
    if ("error" in auth) return auth.error;
    const { db, caller } = auth;

    const { memberId, disabled } = await request.json();
    if (!memberId || typeof disabled !== "boolean") {
      return NextResponse.json({ error: "memberId and disabled (boolean) are required" }, { status: 400 });
    }

    // Verify target is in the same org
    const { data: target } = await db
      .from("profiles")
      .select("id, org_id")
      .eq("id", memberId)
      .single();

    if (!target || target.org_id !== caller.org_id) {
      return NextResponse.json({ error: "Member not found in your organization" }, { status: 404 });
    }

    const { error } = await db
      .from("profiles")
      .update({ shield_disabled: disabled })
      .eq("id", memberId);

    if (error) {
      console.error("Failed to toggle shield:", error);
      return NextResponse.json({ error: "Failed to toggle shield" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle shield error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
