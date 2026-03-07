import { Resend } from "resend";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { buildEmail, escapeHtml } from "@/lib/email-template";

/**
 * Send an email notification to all super admins when a new subscription is created.
 * Non-blocking — failures are logged but don't throw.
 */
export async function notifyAdminsOfNewSubscription({
  orgName,
  plan,
  seats,
  customerEmail,
  orgId,
}: {
  orgName: string;
  plan: string;
  seats: number;
  customerEmail: string | null;
  orgId: string;
}) {
  if (!process.env.RESEND_API_KEY || SUPER_ADMIN_EMAILS.length === 0) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  const html = buildEmail({
    heading: "New subscription",
    body: `
      <p style="margin: 0 0 8px;"><strong>Organization:</strong> ${escapeHtml(orgName)}</p>
      <p style="margin: 0 0 8px;"><strong>Plan:</strong> ${escapeHtml(plan.charAt(0).toUpperCase() + plan.slice(1))}</p>
      <p style="margin: 0 0 8px;"><strong>Seats:</strong> ${seats}</p>
      ${customerEmail ? `<p style="margin: 0 0 8px;"><strong>Customer:</strong> ${escapeHtml(customerEmail)}</p>` : ""}
    `,
    ctaText: "View Subscriptions",
    ctaUrl: `${siteUrl}/admin/subscriptions`,
    footerNote: `Org ID: ${orgId}`,
  });

  try {
    await resend.emails.send({
      from: fromEmail,
      to: SUPER_ADMIN_EMAILS,
      subject: `[TeamPrompt] New ${plan} subscription: ${orgName}`,
      html,
    });
  } catch (err) {
    console.error("Failed to notify admins of new subscription:", err);
  }
}

/**
 * Send an email notification to all super admins when a customer replies to an existing ticket.
 * Non-blocking — failures are logged but don't throw.
 */
export async function notifyAdminsOfTicketReply({
  subject,
  senderEmail,
  message,
  ticketId,
}: {
  subject: string;
  senderEmail: string;
  message: string;
  ticketId: string;
}) {
  if (!process.env.RESEND_API_KEY || SUPER_ADMIN_EMAILS.length === 0) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  const preview = message.slice(0, 300) + (message.length > 300 ? "..." : "");
  const escapedPreview = escapeHtml(preview).replace(/\n/g, "<br />");

  const html = buildEmail({
    heading: "Customer replied",
    body: `
      <p style="margin: 0 0 8px;"><strong>From:</strong> ${escapeHtml(senderEmail)}</p>
      <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
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
      subject: `[TeamPrompt] Reply: ${subject}`,
      html,
    });
  } catch (err) {
    console.error("Failed to notify admins of ticket reply:", err);
  }
}

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
  const escapedPreview = escapeHtml(preview).replace(/\n/g, "<br />");

  const html = buildEmail({
    heading: `New ${type} ticket`,
    body: `
      <p style="margin: 0 0 8px;"><strong>From:</strong> ${escapeHtml(senderEmail)}</p>
      <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
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
