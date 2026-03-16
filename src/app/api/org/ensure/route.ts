import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { seedOrgDefaults } from "@/lib/seed-defaults";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanTier } from "@/lib/types";

/**
 * POST /api/org/ensure
 *
 * Fallback for when the handle_new_user trigger fails silently.
 * If the authenticated user has no org_id, creates a personal org
 * and makes them admin — exactly what the trigger would have done.
 */
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

    const rl = await checkRateLimit(limiters.orgEnsure, user.id);
    if (!rl.success) return rl.response;

    // Check current profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, org_id, name, email")
      .eq("id", user.id)
      .single();

    // If profile already has an org, nothing to do
    if (profile?.org_id) {
      return NextResponse.json({ orgId: profile.org_id, created: false });
    }

    // Derive user info (same logic as the trigger)
    const userEmail = user.email || user.user_metadata?.email || "";
    const userName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.preferred_username ||
      profile?.name ||
      userEmail.split("@")[0] ||
      "My Organization";

    const domain = userEmail.split("@")[1] || "";

    // Check for pending invites before creating a personal org.
    // Only auto-accept if exactly ONE pending invite (avoids ambiguity).
    const { count: inviteCount } = await db
      .from("invites")
      .select("id", { count: "exact", head: true })
      .ilike("email", userEmail)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString());

    let pendingInvite: { id: string; org_id: string; role: string; team_id: string | null } | null = null;

    if (inviteCount === 1) {
      const { data } = await db
        .from("invites")
        .select("id, org_id, role, team_id")
        .ilike("email", userEmail)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .single();
      pendingInvite = data;
    }

    let orgId: string;
    let userRole: string;

    if (pendingInvite?.org_id) {
      // Join the invited org instead of creating a personal one
      orgId = pendingInvite.org_id;
      userRole = pendingInvite.role || "member";

      // Check member limit before joining
      const { data: inviteOrg } = await db
        .from("organizations")
        .select("plan")
        .eq("id", orgId)
        .single();

      const orgPlan = (inviteOrg?.plan || "free") as PlanTier;
      const limits = PLAN_LIMITS[orgPlan] || PLAN_LIMITS.free;

      if (limits.max_members !== -1) {
        const { count: memberCount } = await db
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId);

        if ((memberCount || 0) >= limits.max_members) {
          return NextResponse.json(
            { error: "Organization has reached its member limit" },
            { status: 403 }
          );
        }
      }

      // Mark invite as accepted
      await db
        .from("invites")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", pendingInvite.id);

      // Add to team if specified
      if (pendingInvite.team_id) {
        await db
          .from("team_members")
          .upsert({ team_id: pendingInvite.team_id, user_id: user.id, role: "member" });
      }

      // Notify org admins about the new member (non-fatal)
      try {
        const { data: admins } = await db
          .from("profiles")
          .select("id")
          .eq("org_id", orgId)
          .eq("role", "admin")
          .neq("id", user.id);

        if (admins?.length) {
          await db.from("notifications").insert(
            admins.map((a: { id: string }) => ({
              user_id: a.id,
              org_id: orgId,
              type: "member_joined",
              title: "New member joined",
              message: `${userName} joined the organization.`,
              metadata: { member_id: user.id, member_email: userEmail },
            }))
          );
        }
      } catch {
        // non-fatal
      }
    } else {
      // No pending invite — create a personal org
      const { data: org, error: orgError } = await db
        .from("organizations")
        .insert({
          name: `${userName}'s Org`,
          domain,
          plan: "free",
        })
        .select("id")
        .single();

      if (orgError || !org) {
        console.error("Failed to create org:", orgError);
        return NextResponse.json(
          { error: "Failed to create organization" },
          { status: 500 }
        );
      }
      orgId = org.id;
      userRole = "admin";
    }

    if (profileError || !profile) {
      // Profile doesn't exist at all — create it
      const { error: insertError } = await db.from("profiles").insert({
        id: user.id,
        email: userEmail,
        name: userName,
        avatar_url:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          "",
        role: userRole,
        org_id: orgId,
      });

      if (insertError) {
        console.error("Failed to create profile:", insertError);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }
    } else {
      // Profile exists but no org — update it
      const { error: updateError } = await db
        .from("profiles")
        .update({ org_id: orgId, role: userRole })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 }
        );
      }
    }

    // Seed default content only for personal orgs (not when joining via invite)
    if (!pendingInvite) {
      await seedOrgDefaults(db, orgId, user.id);
    }

    return NextResponse.json({ orgId, created: true });
  } catch (error) {
    console.error("Ensure org error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
