import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
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

    const rl = await checkRateLimit(limiters.extensionEmail, profile.org_id);
    if (!rl.success) return rl.response;

    const body = await request.json();
    const { emails, all } = body as { emails?: string[]; all?: boolean };

    if (!emails && !all) {
      return NextResponse.json(
        { error: "Provide either 'emails' (string[]) or 'all: true'" },
        { status: 400 }
      );
    }

    let recipientEmails: string[] = [];

    if (all) {
      // Send to all org members who don't have an extension installed
      const { data: members } = await db
        .from("profiles")
        .select("email")
        .eq("org_id", profile.org_id)
        .eq("has_extension", false)
        .neq("id", user.id);

      recipientEmails = (members || [])
        .map((m) => m.email)
        .filter((e): e is string => !!e);
    } else if (emails && Array.isArray(emails)) {
      // Validate that all emails belong to org members
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(
        (e) => typeof e === "string" && emailRegex.test(e)
      );

      if (validEmails.length === 0) {
        return NextResponse.json(
          { error: "No valid email addresses provided" },
          { status: 400 }
        );
      }

      // Only send to emails that are actual org members
      const { data: members } = await db
        .from("profiles")
        .select("email")
        .eq("org_id", profile.org_id)
        .in("email", validEmails);

      recipientEmails = (members || [])
        .map((m) => m.email)
        .filter((e): e is string => !!e);
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    // Verify Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Email service is not configured. Please set RESEND_API_KEY.",
        },
        { status: 503 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";

    // Get org name for email
    const { data: org } = await db
      .from("organizations")
      .select("name")
      .eq("id", profile.org_id)
      .single();

    const senderName = profile.name || "A team member";
    const orgName = org?.name || "your team";
    const extensionUrl = `${siteUrl}/extensions`;

    const emailHtml = buildEmail({
      heading: "Install the TeamPrompt Extension",
      body: `
        <p><strong>${senderName}</strong> wants you to install the TeamPrompt browser extension for <strong>${orgName}</strong>.</p>
        <p>The extension lets you search and insert shared prompts directly into ChatGPT, Claude, Gemini, and more &mdash; with built-in guardrails to protect sensitive data.</p>
      `,
      ctaText: "Get the Extension",
      ctaUrl: extensionUrl,
      footerNote: "Available for Chrome, Edge, and Firefox.",
    });

    let sent = 0;

    // Send emails in parallel (batches of 10 to avoid overwhelming Resend)
    const batchSize = 10;
    for (let i = 0; i < recipientEmails.length; i += batchSize) {
      const batch = recipientEmails.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((email) =>
          resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Install the TeamPrompt extension for ${orgName}`,
            html: emailHtml,
          })
        )
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          sent++;
        } else {
          console.error("Failed to send extension email:", result.reason);
        }
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Extension email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
