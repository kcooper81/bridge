import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS } from "@/lib/constants";
import { buildEmail } from "@/lib/email-template";
import type { PlanTier } from "@/lib/types";
import { logServiceError } from "@/lib/log-error";

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

    const { token: inviteToken } = await request.json();
    if (!inviteToken) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Atomically claim the invite: update status to 'accepted' only if still 'pending'.
    // This prevents double-accept race conditions where two concurrent requests
    // both read the invite as 'pending'.
    const { data: invite, error: claimError } = await db
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("token", inviteToken)
      .eq("status", "pending")
      .select("*")
      .single();

    if (claimError || !invite) {
      // The trigger may have already accepted the invite during signup.
      // Check if this user is already in the invited org — if so, it's a success.
      const { data: alreadyAccepted } = await db
        .from("invites")
        .select("org_id, status")
        .eq("token", inviteToken)
        .single();

      if (alreadyAccepted?.status === "accepted") {
        const { data: currentProfile } = await db
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (currentProfile?.org_id === alreadyAccepted.org_id) {
          // Trigger already handled the org join — send extension email + notification
          // (the trigger can't send emails, so we handle it here)
          try {
            // Notify admins (non-fatal, skip if already notified)
            const { data: existingNotif } = await db
              .from("notifications")
              .select("id")
              .eq("org_id", alreadyAccepted.org_id)
              .eq("type", "member_joined")
              .contains("metadata", { member_id: user.id })
              .limit(1)
              .maybeSingle();

            if (!existingNotif) {
              const { data: admins } = await db
                .from("profiles")
                .select("id")
                .eq("org_id", alreadyAccepted.org_id)
                .eq("role", "admin")
                .neq("id", user.id);

              if (admins?.length) {
                const memberName = user.user_metadata?.name || user.email || "A new member";
                await db.from("notifications").insert(
                  admins.map((a: { id: string }) => ({
                    user_id: a.id,
                    org_id: alreadyAccepted.org_id,
                    type: "member_joined",
                    title: "New member joined",
                    message: `${memberName} joined the organization.`,
                    metadata: { member_id: user.id, member_email: user.email },
                  }))
                );
              }
            }

            // Send extension install email
            if (process.env.RESEND_API_KEY && user.email) {
              const resend = new Resend(process.env.RESEND_API_KEY);
              const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
              const fromEmail = process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";
              const { data: org } = await db
                .from("organizations")
                .select("name")
                .eq("id", alreadyAccepted.org_id)
                .single();
              const rawOrgName = org?.name || "your team";
              const escapeHtml = (str: string) =>
                str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
              const orgName = escapeHtml(rawOrgName);
              resend.emails
                .send({
                  from: fromEmail,
                  to: user.email,
                  subject: `Install the TeamPrompt extension for ${rawOrgName.replace(/[\r\n]/g, "")}`,
                  html: buildEmail({
                    heading: "Install the TeamPrompt Extension",
                    body: `<p>Welcome to <strong>${orgName}</strong>!</p><p>The extension lets you search and insert shared prompts directly into ChatGPT, Claude, Gemini, and more &mdash; with built-in guardrails to protect sensitive data.</p>`,
                    ctaText: "Get the Extension",
                    ctaUrl: `${siteUrl}/extensions`,
                    footerNote: "Available for Chrome, Edge, and Firefox.",
                  }),
                })
                .catch((err) => {
                  console.error("Failed to send extension email (trigger-accepted):", err);
                });
            }
          } catch (postAcceptErr) {
            console.error("Post-accept tasks failed:", postAcceptErr);
          }

          return NextResponse.json({ success: true, orgId: alreadyAccepted.org_id });
        }
      }

      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 404 }
      );
    }

    // Verify invite email matches authenticated user (case-insensitive)
    if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
      // Roll back the status change since this user cannot accept it
      const { error: rollbackError } = await db
        .from("invites")
        .update({ status: "pending", accepted_at: null })
        .eq("id", invite.id);
      if (rollbackError) {
        console.error("Failed to rollback invite status:", rollbackError.message);
      }
      return NextResponse.json(
        { error: "This invite was sent to a different email" },
        { status: 403 }
      );
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      await db
        .from("invites")
        .update({ status: "expired", accepted_at: null })
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
      const [{ count }, { data: userOrgProfile }] = await Promise.all([
        db
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("org_id", existingProfile.org_id),
        db
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .eq("org_id", existingProfile.org_id)
          .single(),
      ]);

      if (count && count > 1) {
        // Other members exist — can't silently abandon this org; roll back invite claim
        await db
          .from("invites")
          .update({ status: "pending", accepted_at: null })
          .eq("id", invite.id);
        return NextResponse.json(
          {
            error:
              "You already belong to an organization with other members. Please leave your current organization before accepting this invite.",
          },
          { status: 409 }
        );
      }

      // Verify user is admin of the old org before deleting it
      if (!userOrgProfile || userOrgProfile.role !== "admin") {
        await db
          .from("invites")
          .update({ status: "pending", accepted_at: null })
          .eq("id", invite.id);
        return NextResponse.json(
          {
            error:
              "You are not the admin of your current organization. Please leave your current organization before accepting this invite.",
          },
          { status: 409 }
        );
      }

    }

    // Check member limit before allowing join
    const { data: inviteOrg } = await db
      .from("organizations")
      .select("plan")
      .eq("id", invite.org_id)
      .single();

    const orgPlan = (inviteOrg?.plan || "free") as PlanTier;
    const limits = PLAN_LIMITS[orgPlan] || PLAN_LIMITS.free;

    if (limits.max_members !== -1) {
      const { count: memberCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", invite.org_id);

      if ((memberCount || 0) >= limits.max_members) {
        await db
          .from("invites")
          .update({ status: "pending", accepted_at: null })
          .eq("id", invite.id);
        return NextResponse.json(
          { error: "This organization has reached its member limit. Please ask an admin to upgrade the plan." },
          { status: 403 }
        );
      }
    }

    // Update user's profile with org and role BEFORE cleaning up old org
    const { error: profileUpdateError } = await db
      .from("profiles")
      .update({
        org_id: invite.org_id,
        role: invite.role,
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("Failed to update profile:", profileUpdateError);
      // Roll back the invite claim so it can be retried
      await db
        .from("invites")
        .update({ status: "pending", accepted_at: null })
        .eq("id", invite.id);
      return NextResponse.json(
        { error: "Failed to join organization. Please try again." },
        { status: 500 }
      );
    }

    // Now that profile is safely moved, clean up the old solo org (non-fatal)
    if (existingProfile?.org_id && existingProfile.org_id !== invite.org_id) {
      const oldOrgId = existingProfile.org_id;
      await Promise.allSettled([
        db.from("prompts").delete().eq("org_id", oldOrgId),
        db.from("folders").delete().eq("org_id", oldOrgId),
        db.from("teams").delete().eq("org_id", oldOrgId),
        db.from("standards").delete().eq("org_id", oldOrgId),
        db.from("invites").delete().eq("org_id", oldOrgId),
      ]);

      // Delete the orphaned org (non-fatal)
      await db.from("organizations").delete().eq("id", oldOrgId);
    }

    // Notify org admins that a new member joined (non-fatal)
    try {
      const { data: admins } = await db
        .from("profiles")
        .select("id")
        .eq("org_id", invite.org_id)
        .eq("role", "admin")
        .neq("id", user.id);

      if (admins?.length) {
        const memberName = user.user_metadata?.name || user.email || "A new member";
        await db.from("notifications").insert(
          admins.map((a: { id: string }) => ({
            user_id: a.id,
            org_id: invite.org_id,
            type: "member_joined",
            title: "New member joined",
            message: `${memberName} accepted an invite and joined the organization.`,
            metadata: { member_id: user.id, member_email: user.email },
          }))
        );
      }
    } catch (notifErr) {
      console.error("Failed to create member_joined notification:", notifErr);
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

    // Send extension install email (non-blocking)
    try {
      if (process.env.RESEND_API_KEY && user.email) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
        const fromEmail =
          process.env.RESEND_FROM_EMAIL ||
          "TeamPrompt <noreply@teamprompt.app>";

        // Get org name and inviter name for the email
        const [{ data: org }, { data: inviterProfile }] = await Promise.all([
          db
            .from("organizations")
            .select("name")
            .eq("id", invite.org_id)
            .single(),
          db
            .from("profiles")
            .select("name")
            .eq("id", invite.invited_by)
            .single(),
        ]);

        const escapeHtml = (str: string) =>
          str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const rawSenderName = inviterProfile?.name || "Your team";
        const rawOrgName = org?.name || "your team";
        const senderName = escapeHtml(rawSenderName);
        const orgName = escapeHtml(rawOrgName);
        const extensionUrl = `${siteUrl}/extensions`;

        resend.emails
          .send({
            from: fromEmail,
            to: user.email,
            subject: `Install the TeamPrompt extension for ${rawOrgName.replace(/[\r\n]/g, '')}`,
            html: buildEmail({
              heading: "Install the TeamPrompt Extension",
              body: `
                <p><strong>${senderName}</strong> wants you to install the TeamPrompt browser extension for <strong>${orgName}</strong>.</p>
                <p>The extension lets you search and insert shared prompts directly into ChatGPT, Claude, Gemini, and more &mdash; with built-in guardrails to protect sensitive data.</p>
              `,
              ctaText: "Get the Extension",
              ctaUrl: extensionUrl,
              footerNote: "Available for Chrome, Edge, and Firefox.",
            }),
          })
          .catch((err) => {
            console.error("Failed to send extension install email:", err);
            logServiceError("resend", err, { url: "/api/invite/accept" });
          });
      }
    } catch (emailErr) {
      console.error("Extension email setup error:", emailErr);
      logServiceError("resend", emailErr, { url: "/api/invite/accept" });
    }

    return NextResponse.json({ success: true, orgId: invite.org_id });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
