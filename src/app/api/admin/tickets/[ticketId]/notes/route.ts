import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { Resend } from "resend";
import { buildTicketResponseEmail } from "@/lib/email-template";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ticketId } = await params;
  const body = await request.json();
  const { content, is_internal = true, is_html = false } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // Verify ticket exists and get details for potential email
  const { data: ticket, error: ticketError } = await db
    .from("feedback")
    .select("id, subject, message, status, user_id, inbox_email, sender_email, assigned_to")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Resolve the customer's email: sender_email column → profile → message extraction (legacy)
  let recipientEmail: string | null = ticket.sender_email || null;
  if (!recipientEmail && ticket.user_id) {
    const { data: ticketUser } = await db
      .from("profiles")
      .select("email")
      .eq("id", ticket.user_id)
      .single();
    recipientEmail = ticketUser?.email || null;
  }
  if (!recipientEmail) {
    // Legacy fallback: extract email from "From: Name <email>" line in message body
    const emailMatch = ticket.message.match(/From:.*?<([^>]+@[^>]+)>/i)
      || ticket.message.match(/From:.*?([^\s<]+@[^\s>]+)/i);
    if (emailMatch) recipientEmail = emailMatch[1];
  }

  // Insert the note FIRST — ensures we never lose data even if email fails
  const { data: note, error: insertError } = await db
    .from("ticket_notes")
    .insert({
      ticket_id: ticketId,
      author_id: auth.userId,
      content: content.trim(),
      is_internal: is_internal,
      email_sent: false,
    })
    .select("id, content, is_internal, email_sent, created_at")
    .single();

  if (insertError) {
    console.error("Insert ticket note error:", insertError);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }

  // Auto-assign + auto-progress: replying marks "new" tickets as "in_progress"
  const needsAssign = !ticket.assigned_to;
  const needsProgress = !is_internal && ticket.status === "new";
  if (needsAssign || needsProgress) {
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (needsAssign) updates.assigned_to = auth.userId;
    if (needsProgress) updates.status = "in_progress";
    await db.from("feedback").update(updates).eq("id", ticketId);
  }

  // Now send email if public note and we have a recipient
  let emailSent = false;
  if (!is_internal && recipientEmail && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Look up mailbox settings for signature + display name
      const inbox = ticket.inbox_email || "support@teamprompt.app";
      const { data: mailbox } = await db
        .from("mailbox_settings")
        .select("display_name, signature_html, use_branded_template")
        .eq("email", inbox)
        .single();

      const label = mailbox?.display_name || "TeamPrompt";
      const fromEmail = `${label} <${inbox}>`;

      await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: `Re: ${ticket.subject || "Your support request"} [Ticket#${ticket.id}]`,
        html: buildTicketResponseEmail({
          ticketSubject: ticket.subject || "Your support request",
          responseBody: content.trim(),
          isHtml: is_html,
          originalMessage: ticket.message,
          senderLabel: label,
          senderEmail: inbox,
          signatureHtml: mailbox?.signature_html || undefined,
          useBrandedTemplate: mailbox?.use_branded_template !== false,
        }),
      });
      emailSent = true;

      // Update note to reflect email was sent
      await db
        .from("ticket_notes")
        .update({ email_sent: true })
        .eq("id", note.id);
    } catch (emailError) {
      console.error("Failed to send ticket response email:", emailError);
    }
  }

  return NextResponse.json({
    note: {
      ...note,
      email_sent: emailSent,
      author_email: auth.email,
    },
    recipient_email: recipientEmail,
  });
}
