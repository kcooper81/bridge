import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";

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

    // Get sender's profile
    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role, name")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id || !["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, role = "member" } = await request.json();

    // Validate role
    const validRoles = ["admin", "manager", "member"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Managers cannot invite admins
    if (profile.role === "manager" && role === "admin") {
      return NextResponse.json(
        { error: "Managers cannot invite admins" },
        { status: 403 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check plan limits
    const { data: orgData } = await db
      .from("organizations")
      .select("plan")
      .eq("id", profile.org_id)
      .single();

    const currentPlan = (orgData?.plan || "free") as keyof typeof PLAN_LIMITS;
    const planLimits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

    if (planLimits.max_members !== -1) {
      const { count: memberCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id);

      const { count: pendingCount } = await db
        .from("invites")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id)
        .eq("status", "pending");

      if (
        (memberCount || 0) + (pendingCount || 0) >=
        planLimits.max_members
      ) {
        return NextResponse.json(
          { error: "Member limit reached. Upgrade your plan." },
          { status: 403 }
        );
      }
    }

    // Check for existing pending invite
    const { data: existingInvite } = await db
      .from("invites")
      .select("id")
      .eq("org_id", profile.org_id)
      .eq("email", email)
      .eq("status", "pending")
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invite is already pending for this email" },
        { status: 409 }
      );
    }

    // Create invite
    const { data: invite, error: insertError } = await db
      .from("invites")
      .insert({
        org_id: profile.org_id,
        email,
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert invite error:", insertError);
      return NextResponse.json(
        { error: "Failed to create invite" },
        { status: 500 }
      );
    }

    // Get org name for email
    const { data: org } = await db
      .from("organizations")
      .select("name")
      .eq("id", profile.org_id)
      .single();

    // Send invite email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
      const fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        "TeamPrompt <noreply@teamprompt.app>";

      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `You're invited to join ${org?.name || "a team"} on TeamPrompt`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #6366f1;">You've been invited!</h2>
            <p>${profile.name || "A team member"} has invited you to join <strong>${org?.name || "their team"}</strong> on TeamPrompt as a <strong>${role}</strong>.</p>
            <p>TeamPrompt helps teams manage, share, and secure their AI prompts across 15+ AI tools.</p>
            <a href="${siteUrl}/invite?token=${invite.token}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Accept Invite</a>
            <p style="color: #7f849c; font-size: 14px;">This invite expires in 7 days.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, inviteId: invite.id });
  } catch (error) {
    console.error("Send invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
