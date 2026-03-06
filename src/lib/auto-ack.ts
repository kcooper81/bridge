import { Resend } from "resend";
import { buildEmail } from "./email-template";

interface AutoAckOptions {
  recipientEmail: string;
  recipientName: string;
  ticketId: string;
  subject: string;
  inboxEmail: string;
}

const INBOX_LABELS: Record<string, string> = {
  "support@teamprompt.app": "TeamPrompt Support",
  "sales@teamprompt.app": "TeamPrompt Sales",
  "help@teamprompt.app": "TeamPrompt Help",
  "contact@teamprompt.app": "TeamPrompt",
  "info@teamprompt.app": "TeamPrompt Info",
  "team@teamprompt.app": "TeamPrompt Team",
  "kade@teamprompt.app": "Kade at TeamPrompt",
};

/**
 * Send an auto-acknowledgment email when a new ticket is created.
 * Non-blocking — failures are logged but don't throw.
 */
export async function sendAutoAck(options: AutoAckOptions) {
  if (!process.env.RESEND_API_KEY) return;

  const { recipientEmail, recipientName, ticketId, subject, inboxEmail } = options;

  // Don't auto-ack our own domain (loop prevention)
  if (recipientEmail.toLowerCase().endsWith("@teamprompt.app")) return;

  const label = INBOX_LABELS[inboxEmail] || "TeamPrompt";
  const shortId = ticketId.slice(0, 8).toUpperCase();

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `${label} <${inboxEmail}>`,
      to: recipientEmail,
      subject: `Re: ${subject} [Ticket#${ticketId}]`,
      html: buildEmail({
        heading: "We received your message",
        body: `
          <p>Hi${recipientName && recipientName !== recipientEmail ? ` ${recipientName}` : ""},</p>
          <p>Thanks for reaching out! We've received your message and will get back to you as soon as possible.</p>
          <div style="margin: 16px 0; padding: 12px 16px; background: #f4f4f5; border-radius: 8px; font-size: 14px;">
            Reference: <strong>#${shortId}</strong><br/>
            Subject: ${subject}
          </div>
          <p style="font-size: 13px; color: #71717a;">You can reply to this email to add more details to your request.</p>
        `,
        ctaText: "Visit TeamPrompt",
        ctaUrl: "https://teamprompt.app",
      }),
    });
  } catch (error) {
    console.error("Auto-ack email failed:", error);
  }
}
