import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyAdminsOfNewTicket } from "@/lib/notify-admins";

/**
 * Resend Inbound Email Webhook
 *
 * Receives inbound emails sent to *@teamprompt.app (domain-level MX).
 * - sales@teamprompt.app → ticket type "sales"
 * - support@teamprompt.app (and everything else) → ticket type "email"
 * - Replies to existing tickets (matched by subject line) → added as notes
 * - New emails → created as feedback records
 *
 * Setup:
 * 1. Add MX record for your domain pointing to Resend's inbound servers
 * 2. Configure inbound webhook in Resend dashboard → POST to /api/webhooks/inbound-email
 * 3. Set RESEND_WEBHOOK_SECRET in .env.local for signature verification
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
  // Build a search string: original To header first, then envelope to addresses
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
  // Unknown alias — still capture it
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
 * Try to match a reply to an existing ticket by:
 * 1. Ticket ID in subject line: [Ticket#UUID]
 * 2. Subject prefix match: "Re: Original Subject"
 */
async function findExistingTicket(
  db: ReturnType<typeof createServiceClient>,
  subject: string
) {
  // Check for ticket ID in subject: [Ticket#<uuid>]
  const idMatch = subject.match(/\[Ticket#([a-f0-9-]{36})\]/i);
  if (idMatch) {
    const { data } = await db
      .from("feedback")
      .select("id, subject, user_id")
      .eq("id", idMatch[1])
      .single();
    if (data) return data;
  }

  // Fallback: strip Re:/Fwd: prefixes and look for exact subject match
  const cleanSubject = subject
    .replace(/^(Re|Fwd|Fw):\s*/gi, "")
    .replace(/\[Ticket#[a-f0-9-]+\]/gi, "")
    .trim();

  if (cleanSubject.length > 3) {
    const { data } = await db
      .from("feedback")
      .select("id, subject, user_id")
      .ilike("subject", `%${cleanSubject}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) return data;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get("svix-signature");
      if (!signature) {
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 401 }
        );
      }
      // For production: use @svix/webhook to verify signature
      // For now, check that the secret header is present
      // (Full Svix verification can be added when Resend provides the signing secret)
    }

    const raw = await request.json();

    // Log the raw payload structure for debugging
    console.log("Inbound email webhook payload:", JSON.stringify(raw, null, 2));

    // Resend may wrap in { type, data } or send data at top level
    const payload = raw.data ? raw : { type: "email.received", data: raw };

    // Only handle email.received events
    if (raw.type && raw.type !== "email.received") {
      return NextResponse.json({ ok: true });
    }

    const data = payload.data || {};
    const from = data.from || "";
    const to = data.to || [];
    const subject = data.subject || "";

    // Ignore emails sent FROM our own domain to prevent loops
    const senderAddress = extractEmail(from).toLowerCase();
    if (senderAddress.endsWith("@teamprompt.app")) {
      console.log("Inbound email: ignoring email from own domain:", senderAddress);
      return NextResponse.json({ ok: true, action: "ignored_own_domain" });
    }
    const text = data.text || "";
    const html = data.html || "";
    const headers = data.headers || [];

    const senderEmail = extractEmail(from);
    const senderName = extractName(from);
    const { inboxEmail, ticketType } = detectInbox(Array.isArray(to) ? to : [to], headers);
    const body = text || html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";

    if (!senderEmail) {
      console.error("Inbound email: no sender found. from:", from, "payload keys:", Object.keys(raw));
      return NextResponse.json(
        { error: "Missing sender" },
        { status: 400 }
      );
    }

    // Allow empty body — still create the ticket
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
      // Add as a note on the existing ticket (external reply, not internal)
      const { error: noteError } = await db.from("ticket_notes").insert({
        ticket_id: existingTicket.id,
        author_id: senderProfile?.id || existingTicket.user_id,
        content: `[Email reply from ${senderName} <${senderEmail}>]\n\n${finalBody}`,
        is_internal: false,
        email_sent: false, // This IS the email, no need to send one
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

      return NextResponse.json({ ok: true, action: "reply_added", ticket_id: existingTicket.id });
    }

    // New ticket from inbound email
    const fullMessage = `From: ${senderName} <${senderEmail}>\n\n${finalBody}`;

    const { data: inserted, error: insertError } = await db
      .from("feedback")
      .insert({
        user_id: senderProfile?.id || null,
        org_id: senderProfile?.org_id || null,
        type: ticketType,
        subject: subject || "(No subject)",
        message: fullMessage,
        status: "new",
        priority: ticketType === "sales" ? "high" : "normal",
        inbox_email: inboxEmail,
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

    // Notify admins
    if (inserted) {
      notifyAdminsOfNewTicket({
        subject: subject || "(No subject)",
        senderEmail,
        type: ticketType,
        message: finalBody,
        ticketId: inserted.id,
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
