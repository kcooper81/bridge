import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { buildEmail } from "@/lib/email-template";

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

    const rl = await checkRateLimit(limiters.invite, profile.org_id);
    if (!rl.success) return rl.response;

    const { email, role = "member", team_id = null } = await request.json();

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

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
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

    // Validate team_id belongs to this org (if provided)
    if (team_id) {
      const { data: teamRow } = await db
        .from("teams")
        .select("id")
        .eq("id", team_id)
        .eq("org_id", profile.org_id)
        .single();
      if (!teamRow) {
        return NextResponse.json({ error: "Invalid team" }, { status: 400 });
      }
    }

    // Create invite
    const { data: invite, error: insertError } = await db
      .from("invites")
      .insert({
        org_id: profile.org_id,
        email,
        role,
        invited_by: user.id,
        ...(team_id && { team_id }),
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

    // Get org name + settings for email
    const { data: org } = await db
      .from("organizations")
      .select("name, settings")
      .eq("id", profile.org_id)
      .single();

    // Send invite email
    if (!process.env.RESEND_API_KEY) {
      // Delete the invite row since we can't send the email
      await db.from("invites").delete().eq("id", invite.id);
      return NextResponse.json(
        { error: "Email service is not configured. Please set RESEND_API_KEY." },
        { status: 503 }
      );
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
      const fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        "TeamPrompt <noreply@teamprompt.app>";

      const inviteUrl = `${siteUrl}/invite?token=${invite.token}`;
      const senderName = profile.name || "A team member";
      const orgName = org?.name || "their team";

      // Build optional welcome message block
      const rawWelcome = org?.settings?.invite_welcome_message;
      const welcomeHtml = rawWelcome
        ? `<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:3px solid #2563EB;background:#f4f4f5;border-radius:4px;font-size:14px;line-height:1.5;color:#3f3f46;">${rawWelcome.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>")}</blockquote>`
        : "";

      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `You're invited to join ${orgName} on TeamPrompt`,
        html: buildEmail({
          heading: "You've been invited!",
          body: `
            ${welcomeHtml}
            <p><strong>${senderName}</strong> has invited you to join <strong>${orgName}</strong> on TeamPrompt as a <strong>${role}</strong>.</p>
            <p>TeamPrompt helps teams manage, share, and secure their AI prompts across ChatGPT, Claude, Gemini, and more.</p>
          `,
          ctaText: "Accept Invite",
          ctaUrl: inviteUrl,
          footerNote: "This invite expires in 7 days.",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send invite email:", emailError);
      // Delete the invite row to prevent stuck invites
      await db.from("invites").delete().eq("id", invite.id);
      return NextResponse.json(
        { error: "Failed to send invite email. Please try again." },
        { status: 500 }
      );
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
