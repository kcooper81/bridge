import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { logServiceError } from "@/lib/log-error";
import { cancelOrgSubscription } from "@/lib/cancel-org-subscription";

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

    const rl = await checkRateLimit(limiters.accountDelete, user.id);
    if (!rl.success) return rl.response;

    // Get profile
    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.org_id && profile.role === "admin") {
      // Check if last admin
      const { count: adminCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id)
        .eq("role", "admin");

      const { count: memberCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id);

      if ((adminCount || 0) <= 1 && (memberCount || 0) > 1) {
        return NextResponse.json(
          {
            error:
              "You are the last admin. Go to Team page and transfer admin to another member before deleting your account.",
          },
          { status: 400 }
        );
      }

      // Sole org member — cancel Stripe subscription and delete the entire org (CASCADE)
      if ((memberCount || 0) <= 1) {
        await cancelOrgSubscription(db, profile.org_id);

        await db
          .from("organizations")
          .delete()
          .eq("id", profile.org_id);
      }
    }

    // Revoke any pending invites this user sent
    await db
      .from("invites")
      .update({ status: "revoked" })
      .eq("invited_by", user.id)
      .eq("status", "pending");

    // Delete the auth user FIRST. profiles.id references auth.users with
    // ON DELETE CASCADE, so this also removes the profile atomically. Doing it
    // the other way round risked the profile being gone while deleteUser fails,
    // leaving an auth user who can still log in and gets a fresh org minted by
    // /api/org/ensure. If deleteUser fails, abort before touching the profile.
    const { error: authDeleteError } = await db.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error("Delete account: failed to delete auth user", authDeleteError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // Defense-in-depth in case the cascade isn't present in some environment.
    await db.from("profiles").delete().eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    logServiceError("app", error, { url: "account/delete" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
