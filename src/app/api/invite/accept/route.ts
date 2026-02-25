import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    const { token: inviteToken } = await request.json();
    if (!inviteToken) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Look up invite
    const { data: invite, error: inviteError } = await db
      .from("invites")
      .select("*")
      .eq("token", inviteToken)
      .eq("status", "pending")
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 404 }
      );
    }

    // Verify invite email matches authenticated user
    if (invite.email !== user.email) {
      return NextResponse.json(
        { error: "This invite was sent to a different email" },
        { status: 403 }
      );
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      await db
        .from("invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 410 }
      );
    }

    // Check if user already belongs to an organization
    const { data: existingProfile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (existingProfile?.org_id && existingProfile.org_id !== invite.org_id) {
      // Check if user is the sole member of their current org (auto-created personal org)
      const { count } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", existingProfile.org_id);

      if (count && count > 1) {
        // Other members exist — can't silently abandon this org
        return NextResponse.json(
          {
            error:
              "You already belong to an organization with other members. Please leave your current organization before accepting this invite.",
          },
          { status: 409 }
        );
      }

      // Solo personal org — clean it up so user can join the invited org
      const oldOrgId = existingProfile.org_id;

      // Remove any teams, folders, prompts, etc. tied to the old org
      await Promise.all([
        db.from("prompts").delete().eq("org_id", oldOrgId),
        db.from("folders").delete().eq("org_id", oldOrgId),
        db.from("teams").delete().eq("org_id", oldOrgId),
        db.from("collections").delete().eq("org_id", oldOrgId),
        db.from("standards").delete().eq("org_id", oldOrgId),
        db.from("invites").delete().eq("org_id", oldOrgId),
      ]);

      // Delete the orphaned org
      await db.from("organizations").delete().eq("id", oldOrgId);
    }

    // Update user's profile with org and role
    const { error: profileUpdateError } = await db
      .from("profiles")
      .update({
        org_id: invite.org_id,
        role: invite.role,
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("Failed to update profile:", profileUpdateError);
      return NextResponse.json(
        { error: "Failed to join organization. Please try again." },
        { status: 500 }
      );
    }

    // If invite has a team_id, add user to that team
    if (invite.team_id) {
      const { error: teamMemberError } = await db
        .from("team_members")
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          role: "member",
        });

      if (teamMemberError) {
        console.error("Failed to add to team:", teamMemberError);
        // Non-fatal — user joined org successfully, team join failed
      }
    }

    // Mark invite as accepted
    await db
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    return NextResponse.json({ success: true, orgId: invite.org_id });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
