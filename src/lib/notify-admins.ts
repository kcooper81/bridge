import { Resend } from "resend";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { buildEmail } from "@/lib/email-template";

/**
 * Send an email notification to all super admins when a new ticket arrives.
 * Non-blocking — failures are logged but don't throw.
 */
export async function notifyAdminsOfNewTicket({
  subject,
  senderEmail,
  type,
  message,
  ticketId,
}: {
  subject: string;
  senderEmail: string;
  type: string;
  message: string;
  ticketId: string;
}) {
  if (!process.env.RESEND_API_KEY || SUPER_ADMIN_EMAILS.length === 0) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  const preview = message.slice(0, 300) + (message.length > 300 ? "..." : "");
  const escapedPreview = preview.replace(/\n/g, "<br />");

  const html = buildEmail({
    heading: `New ${type} ticket`,
    body: `
      <p style="margin: 0 0 8px;"><strong>From:</strong> ${senderEmail}</p>
      <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${subject}</p>
      <div style="margin-top: 16px; padding: 16px; background-color: #f4f4f5; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #3f3f46;">
        ${escapedPreview}
      </div>
    `,
    ctaText: "View Ticket",
    ctaUrl: `${siteUrl}/admin/tickets`,
    footerNote: `Ticket ID: ${ticketId}`,
  });

  try {
    await resend.emails.send({
      from: fromEmail,
      to: SUPER_ADMIN_EMAILS,
      subject: `[TeamPrompt] New ${type}: ${subject}`,
      html,
    });
  } catch (err) {
    console.error("Failed to notify admins of new ticket:", err);
  }
}
