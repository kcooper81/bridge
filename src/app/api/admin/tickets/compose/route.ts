import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { Resend } from "resend";
import { buildTicketResponseEmail } from "@/lib/email-template";
import { logServiceError } from "@/lib/log-error";

/**
 * POST /api/admin/tickets/compose
 * Creates a new outbound ticket and sends the email in one shot.
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    to_email,
    to_name,
    subject,
    message,
    is_html = false,
    org_id,
    inbox_email = "support@teamprompt.app",
  } = body;

  if (!to_email || !subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "to_email, subject, and message are required" },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // 1. Create the ticket (feedback row)
  const { data: ticket, error: ticketError } = await db
    .from("feedback")
    .insert({
      sender_email: to_email,
      sender_name: to_name || null,
      subject: subject.trim(),
      message: message.trim(),
      html_body: is_html ? message.trim() : null,
      type: "email",
      status: "in_progress",
      priority: "normal",
      direction: "outbound",
      assigned_to: auth.userId,
      inbox_email,
      org_id: org_id || null,
    })
    .select("id, subject")
    .single();

  if (ticketError || !ticket) {
    console.error("Failed to create ticket:", ticketError);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }

  // 2. Send the email via Resend
  let emailSent = false;
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Look up mailbox settings for signature + display name
      const { data: mailbox } = await db
        .from("mailbox_settings")
        .select("display_name, signature_html, use_branded_template")
        .eq("email", inbox_email)
        .single();

      const label = mailbox?.display_name || "TeamPrompt";
      const fromEmail = `${label} <${inbox_email}>`;

      await resend.emails.send({
        from: fromEmail,
        to: to_email,
        subject: subject.trim(),
        html: buildTicketResponseEmail({
          ticketSubject: subject.trim(),
          responseBody: message.trim(),
          isHtml: is_html,
          originalMessage: "",
          senderLabel: label,
          senderEmail: inbox_email,
          signatureHtml: mailbox?.signature_html || undefined,
          useBrandedTemplate: mailbox?.use_branded_template !== false,
        }),
      });

      emailSent = true;
    } catch (emailError) {
      console.error("Failed to send compose email:", emailError);
      logServiceError("resend", emailError, { url: "/api/admin/tickets/compose" });
    }
  }

  return NextResponse.json({
    ticket_id: ticket.id,
    email_sent: emailSent,
  });
}
