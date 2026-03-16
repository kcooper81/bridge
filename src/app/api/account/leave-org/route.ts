import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

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

    const rl = await checkRateLimit(limiters.inviteAccept, user.id);
    if (!rl.success) return rl.response;

    // Get current profile
    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json(
        { error: "You are not in an organization" },
        { status: 400 }
      );
    }

    const oldOrgId = profile.org_id;

    // Check if user is the last admin with other members
    if (profile.role === "admin") {
      const [{ count: adminCount }, { count: memberCount }] = await Promise.all([
        db
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("org_id", oldOrgId)
          .eq("role", "admin"),
        db
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("org_id", oldOrgId),
      ]);

      if ((adminCount || 0) <= 1 && (memberCount || 0) > 1) {
        return NextResponse.json(
          {
            error:
              "You are the only admin. Transfer admin to another member on the Team page before leaving.",
          },
          { status: 400 }
        );
      }
    }

    // Check how many members the org has
    const { count: orgMemberCount } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("org_id", oldOrgId);

    const isSoleMember = (orgMemberCount || 0) <= 1;

    // Remove user from any teams in this org
    const { data: orgTeams } = await db
      .from("teams")
      .select("id")
      .eq("org_id", oldOrgId);

    if (orgTeams && orgTeams.length > 0) {
      await db
        .from("team_members")
        .delete()
        .eq("user_id", user.id)
        .in(
          "team_id",
          orgTeams.map((t: { id: string }) => t.id)
        );
    }

    // Notify remaining org admins that this member left (non-fatal, only if not sole member)
    if (!isSoleMember) {
      try {
        const { data: admins } = await db
          .from("profiles")
          .select("id")
          .eq("org_id", oldOrgId)
          .eq("role", "admin")
          .neq("id", user.id);

        if (admins?.length) {
          const memberName = user.user_metadata?.name || user.email || "A member";
          await db.from("notifications").insert(
            admins.map((a: { id: string }) => ({
              user_id: a.id,
              org_id: oldOrgId,
              type: "member_left",
              title: "Member left",
              message: `${memberName} left the organization.`,
              metadata: { member_id: user.id, member_email: user.email },
            }))
          );
        }
      } catch {
        // non-fatal
      }

      // Revoke any pending invites for this user's email in the old org
      if (user.email) {
        await db
          .from("invites")
          .update({ status: "revoked" })
          .eq("org_id", oldOrgId)
          .ilike("email", user.email)
          .eq("status", "pending");
      }
    }

    // Create a new personal org for the user
    const { data: newOrg, error: newOrgError } = await db
      .from("organizations")
      .insert({
        name: `${user.email?.split("@")[0] || "User"}'s Org`,
        plan: "free",
      })
      .select("id")
      .single();

    if (newOrgError || !newOrg) {
      return NextResponse.json(
        { error: "Failed to create new organization" },
        { status: 500 }
      );
    }

    // Move user to the new org
    const { error: updateError } = await db
      .from("profiles")
      .update({ org_id: newOrg.id, role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      // Clean up the new org if profile update failed
      await db.from("organizations").delete().eq("id", newOrg.id);
      return NextResponse.json(
        { error: "Failed to leave organization" },
        { status: 500 }
      );
    }

    // If sole member, clean up the old org entirely
    if (isSoleMember) {
      await Promise.allSettled([
        db.from("prompts").delete().eq("org_id", oldOrgId),
        db.from("folders").delete().eq("org_id", oldOrgId),
        db.from("teams").delete().eq("org_id", oldOrgId),
        db.from("standards").delete().eq("org_id", oldOrgId),
        db.from("invites").delete().eq("org_id", oldOrgId),
        db.from("subscriptions").delete().eq("org_id", oldOrgId),
      ]);
      await db.from("organizations").delete().eq("id", oldOrgId);
    }

    return NextResponse.json({ success: true, newOrgId: newOrg.id });
  } catch (error) {
    console.error("Leave org error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
