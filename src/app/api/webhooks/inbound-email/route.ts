import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyAdminsOfNewTicket, notifyAdminsOfTicketReply } from "@/lib/notify-admins";
import { sendAutoAck } from "@/lib/auto-ack";
import { logServiceError } from "@/lib/log-error";

/**
 * Resend Inbound Email Webhook
 *
 * Receives inbound emails sent to *@teamprompt.app (domain-level MX).
 *
 * IMPORTANT: Resend webhooks do NOT include the email body.
 * We must call GET /emails/receiving/{email_id} to fetch text/html content.
 */

/** Known inboxes — the first matching address wins */
const KNOWN_INBOXES: { prefix: string; type: string }[] = [
  { prefix: "sales@", type: "sales" },
  { prefix: "support@", type: "email" },
  { prefix: "help@", type: "email" },
  { prefix: "contact@", type: "email" },
  { prefix: "info@", type: "email" },
  { prefix: "team@", type: "email" },
  { prefix: "kade@", type: "email" },
];

/**
 * Find the first recognised inbox address.
 * Checks the original "To" header first (preserved through forwarding),
 * then falls back to the envelope `to` list.
 */
function detectInbox(
  toAddresses: string[],
  headers: { name: string; value: string }[]
): { inboxEmail: string; ticketType: string } {
  const originalTo = headers
    .find((h) => h.name.toLowerCase() === "to")?.value || "";
  const searchPool = [originalTo, ...toAddresses].join(",").toLowerCase();

  for (const inbox of KNOWN_INBOXES) {
    if (searchPool.includes(inbox.prefix)) {
      const match = searchPool.match(new RegExp(`(${inbox.prefix}[^\\s,<>]+)`));
      return {
        inboxEmail: match ? match[1] : `${inbox.prefix}teamprompt.app`,
        ticketType: inbox.type,
      };
    }
  }
  const fallbackEmail = toAddresses[0]
    ? extractEmail(toAddresses[0])
    : "support@teamprompt.app";
  return { inboxEmail: fallbackEmail, ticketType: "email" };
}

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from.trim();
}

function extractName(from: string): string {
  const match = from.match(/^(.+?)\s*</);
  return match ? match[1].replace(/"/g, "").trim() : extractEmail(from);
}

/**
 * Fetch the full email content (text + html) from Resend's Receiving API.
 * The webhook only sends metadata — body must be fetched separately.
 */
async function fetchEmailContent(emailId: string): Promise<{ text: string; html: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set — cannot fetch email content");
    return { text: "", html: "" };
  }

  try {
    const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      console.error("Failed to fetch email content:", res.status, await res.text());
      return { text: "", html: "" };
    }

    const email = await res.json();
    return {
      text: email.text || "",
      html: email.html || "",
    };
  } catch (err) {
    console.error("Error fetching email content from Resend:", err);
    logServiceError("resend", err, { url: "/api/webhooks/inbound-email" });
    return { text: "", html: "" };
  }
}

/**
 * Try to match a reply to an existing ticket by:
 * 1. Ticket ID in subject line: [Ticket#UUID]
 * 2. Subject prefix match: "Re: Original Subject"
 */
async function findExistingTicket(
  db: ReturnType<typeof createServiceClient>,
  subject: string
) {
  const idMatch = subject.match(/\[Ticket#([a-f0-9-]{36})\]/i);
  if (idMatch) {
    const { data } = await db
      .from("feedback")
      .select("id, subject, user_id")
      .eq("id", idMatch[1])
      .single();
    if (data) return data;
  }

  const cleanSubject = subject
    .replace(/^(Re|Fwd|Fw):\s*/gi, "")
    .replace(/\[Ticket#[a-f0-9-]+\]/gi, "")
    .trim();

  // Only match by subject if it's specific enough (>10 chars) to avoid false positives
  // Short subjects like "test", "hello", "hi" would match too many tickets
  if (cleanSubject.length > 10) {
    // Escape PostgREST/SQL wildcards to prevent injection via subject line
    const safeSubject = cleanSubject.replace(/%/g, "\\%").replace(/_/g, "\\_");
    const { data } = await db
      .from("feedback")
      .select("id, subject, user_id")
      .ilike("subject", `%${safeSubject}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) return data;
  }

  return null;
}

/**
 * Convert HTML to readable plain text (preserving line breaks).
 */
function htmlToText(html: string): string {
  return html
    // Block-level elements get line breaks
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/blockquote>/gi, "\n")
    // Gmail uses <wbr> and zero-width spaces
    .replace(/<wbr\s*\/?>/gi, "")
    // Strip remaining tags
    .replace(/<[^>]*>/g, "")
    // HTML entities
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&#\d+;/gi, "")
    .replace(/&\w+;/gi, "")
    // Clean up whitespace but preserve line breaks
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity via Svix signature (Resend uses Svix under the hood)
    const webhookSecret = process.env.INBOUND_WEBHOOK_SECRET;
    const rawBody = await request.text();

    if (webhookSecret) {
      const svixId = request.headers.get("svix-id");
      const svixTimestamp = request.headers.get("svix-timestamp");
      const svixSignature = request.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error("Inbound webhook missing Svix headers");
        return NextResponse.json({ error: "Missing webhook signature headers" }, { status: 401 });
      }

      try {
        const { Webhook } = await import("svix");
        const wh = new Webhook(webhookSecret);
        wh.verify(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (verifyErr) {
        console.error("Inbound webhook signature verification failed:", verifyErr);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const raw = JSON.parse(rawBody);

    console.log("Inbound email webhook received:", {
      type: raw.type,
      dataKeys: raw.data ? Object.keys(raw.data) : Object.keys(raw),
    });

    // Resend wraps in { type, data }
    const payload = raw.data ? raw : { type: "email.received", data: raw };

    // Only handle email.received events
    if (raw.type && raw.type !== "email.received") {
      return NextResponse.json({ ok: true });
    }

    const data = payload.data || {};
    const from = data.from || "";
    const to = data.to || [];
    const subject = data.subject || "";
    const emailId = data.email_id || data.id || "";

    // Only process emails addressed to @teamprompt.app
    const toAddresses = Array.isArray(to) ? to : [to];
    const headers = data.headers || [];
    const originalTo = headers.find?.((h: { name: string }) => h.name?.toLowerCase() === "to")?.value || "";
    const allRecipients = [originalTo, ...toAddresses].join(",").toLowerCase();
    if (!allRecipients.includes("@teamprompt.app")) {
      console.log("Inbound email: ignoring non-teamprompt.app recipient:", allRecipients);
      return NextResponse.json({ ok: true, action: "ignored_wrong_domain" });
    }

    // Ignore emails sent FROM our own domain to prevent loops
    const senderAddress = extractEmail(from).toLowerCase();
    if (senderAddress.endsWith("@teamprompt.app")) {
      console.log("Inbound email: ignoring email from own domain:", senderAddress);
      return NextResponse.json({ ok: true, action: "ignored_own_domain" });
    }

    // Fetch the actual email body from Resend API
    // (webhooks only include metadata, NOT the body)
    let text = "";
    let html = "";

    if (emailId) {
      const content = await fetchEmailContent(emailId);
      text = content.text;
      html = content.html;
      console.log("Fetched email content:", { emailId, textLen: text.length, htmlLen: html.length });
    } else {
      console.warn("No email_id in webhook payload — cannot fetch body");
    }

    const senderEmail = extractEmail(from);
    const senderName = extractName(from);
    const { inboxEmail, ticketType } = detectInbox(toAddresses, headers);
    const body = text || (html ? htmlToText(html) : "");

    // Extract CC addresses from headers
    const ccHeader = headers.find?.((h: { name: string }) => h.name?.toLowerCase() === "cc")?.value || "";
    const ccEmails = ccHeader
      ? ccHeader.split(",").map((addr: string) => extractEmail(addr.trim())).filter((e: string) => e && e.includes("@") && !e.endsWith("@teamprompt.app"))
      : [];

    // Extract attachment metadata
    const rawAttachments = data.attachments || [];
    const attachments = Array.isArray(rawAttachments)
      ? rawAttachments.map((a: { filename?: string; mimeType?: string; content_type?: string; size?: number }) => ({
          filename: a.filename || "attachment",
          content_type: a.mimeType || a.content_type || "application/octet-stream",
          size: a.size || 0,
        }))
      : [];

    if (!senderEmail) {
      console.error("Inbound email: no sender found. from:", from);
      return NextResponse.json(
        { error: "Missing sender" },
        { status: 400 }
      );
    }

    // ── Auto-reply / bounce detection ──
    // Check headers and subject for auto-reply indicators
    const autoReplyHeaders = ["auto-submitted", "x-auto-response-suppress", "x-autorespond", "x-autoreply", "precedence"];
    const isAutoReply = headers.some?.((h: { name: string; value: string }) => {
      const name = h.name?.toLowerCase() || "";
      const value = (h.value || "").toLowerCase();
      if (autoReplyHeaders.includes(name)) return true;
      if (name === "auto-submitted" && value !== "no") return true;
      if (name === "precedence" && (value === "bulk" || value === "junk" || value === "auto_reply")) return true;
      if (name === "x-auto-response-suppress" && value.includes("all")) return true;
      return false;
    });

    const autoReplySubjectPatterns = [
      /^(auto[- ]?reply|automatic reply|out of (the )?office|ooo)/i,
      /^(undeliverable|delivery (status )?notification|failure notice)/i,
      /^(returned mail|mail delivery (failed|subsystem))/i,
      /^(vacation|away|on leave|on holiday)/i,
      /^(auto[- ]?response|autoreply)/i,
      /\b(mailer[- ]?daemon|postmaster)\b/i,
    ];
    const isAutoReplySubject = autoReplySubjectPatterns.some((re) => re.test(subject));
    const isFromNoreply = /^(no-?reply|noreply|mailer-daemon|postmaster)@/i.test(senderEmail);

    if (isAutoReply || isAutoReplySubject || isFromNoreply) {
      console.log("Inbound email: auto-reply detected, auto-closing:", { from: senderEmail, subject });
      // Still create the record for tracking, but auto-close it
      const db = createServiceClient();
      const { inboxEmail: autoInbox } = detectInbox(toAddresses, headers);
      await db.from("feedback").insert({
        type: "email",
        subject: subject || "(Auto-reply)",
        message: body || "(Auto-reply)",
        html_body: html || null,
        sender_email: senderEmail,
        sender_name: senderName !== senderEmail ? senderName : null,
        status: "closed",
        priority: "low",
        inbox_email: autoInbox,
        direction: "inbound",
        folder: "trash",
      });
      return NextResponse.json({ ok: true, action: "auto_reply_trashed" });
    }

    const finalBody = body || "(No message body)";
    const db = createServiceClient();

    // Try to find the sender as an existing user
    const { data: senderProfile } = await db
      .from("profiles")
      .select("id, org_id")
      .eq("email", senderEmail)
      .single();

    // Check if this is a reply to an existing ticket
    const existingTicket = await findExistingTicket(db, subject || "");

    if (existingTicket) {
      const { error: noteError } = await db.from("ticket_notes").insert({
        ticket_id: existingTicket.id,
        author_id: senderProfile?.id || existingTicket.user_id,
        content: `[Email reply from ${senderName} <${senderEmail}>]\n\n${finalBody}`,
        is_internal: false,
        email_sent: false,
      });

      if (noteError) {
        console.error("Inbound email note insert error:", noteError);
        return NextResponse.json(
          { error: "Failed to add reply" },
          { status: 500 }
        );
      }

      // Reopen ticket if it was resolved/closed
      const { data: ticket } = await db
        .from("feedback")
        .select("status")
        .eq("id", existingTicket.id)
        .single();

      if (ticket && (ticket.status === "resolved" || ticket.status === "closed")) {
        await db
          .from("feedback")
          .update({ status: "new", updated_at: new Date().toISOString() })
          .eq("id", existingTicket.id);
      } else {
        await db
          .from("feedback")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", existingTicket.id);
      }

      // Notify admins of the customer reply
      notifyAdminsOfTicketReply({
        subject: existingTicket.subject || subject || "(No subject)",
        senderEmail,
        message: finalBody,
        ticketId: existingTicket.id,
      });

      return NextResponse.json({ ok: true, action: "reply_added", ticket_id: existingTicket.id });
    }

    // New ticket from inbound email
    const { data: inserted, error: insertError } = await db
      .from("feedback")
      .insert({
        user_id: senderProfile?.id || null,
        org_id: senderProfile?.org_id || null,
        type: ticketType,
        subject: subject || "(No subject)",
        message: finalBody,
        html_body: html || null,
        sender_email: senderEmail,
        sender_name: senderName !== senderEmail ? senderName : null,
        status: "new",
        priority: ticketType === "sales" ? "high" : "normal",
        inbox_email: inboxEmail,
        attachments: attachments,
        cc_emails: ccEmails,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Inbound email ticket insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create ticket" },
        { status: 500 }
      );
    }

    // Notify admins + send auto-ack to sender
    if (inserted) {
      notifyAdminsOfNewTicket({
        subject: subject || "(No subject)",
        senderEmail,
        type: ticketType,
        message: finalBody,
        ticketId: inserted.id,
      });
      sendAutoAck({
        recipientEmail: senderEmail,
        recipientName: senderName,
        ticketId: inserted.id,
        subject: subject || "(No subject)",
        inboxEmail,
      });
    }

    return NextResponse.json({ ok: true, action: "ticket_created", ticket_id: inserted?.id });
  } catch (error) {
    console.error("Inbound email webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
