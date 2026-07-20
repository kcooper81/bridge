import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST — Resend webhook handler for campaign analytics events.
 *
 * Configure in Resend dashboard → Webhooks:
 *   URL: https://teamprompt.app/api/webhooks/resend
 *   Events: email.opened, email.clicked, email.bounced, email.complained,
 *           email.unsubscribed, email.delivered
 *
 * Resend sends broadcast events with a `broadcast_id` field which we use
 * to look up the campaign and increment the appropriate counter.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the Svix signature (Resend signs webhooks via Svix) before
    // trusting any event. Without this, anyone could POST forged events to
    // inflate campaign open/click counters, flip a campaign to "sent", or —
    // most damaging — mass-unsubscribe arbitrary addresses via
    // email.unsubscribed. Same pattern as the inbound-email webhook.
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    const rawBody = await request.text();

    if (webhookSecret) {
      const svixId = request.headers.get("svix-id");
      const svixTimestamp = request.headers.get("svix-timestamp");
      const svixSignature = request.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
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
        console.error("[Resend Webhook] signature verification failed:", verifyErr);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const body = JSON.parse(rawBody);
    const { type, data } = body;

    console.log("[Resend Webhook]", type, JSON.stringify(data || {}).slice(0, 200));

    if (!type || !data) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Map Resend event types to our counter columns
    const eventMap: Record<string, string> = {
      "email.opened": "opens",
      "email.clicked": "clicks",
      "email.bounced": "bounces",
      "email.complained": "complaints",
      "email.unsubscribed": "unsubscribes",
    };

    // Find the campaign by broadcast_id
    const broadcastId = data.broadcast_id;
    if (!broadcastId) {
      console.log("[Resend Webhook] No broadcast_id — transactional email, skipping");
      return NextResponse.json({ received: true });
    }

    const db = createServiceClient();

    // Look up campaign
    const { data: campaign, error: lookupError } = await db
      .from("email_campaigns")
      .select("id, status")
      .eq("resend_broadcast_id", broadcastId)
      .maybeSingle();

    if (lookupError) {
      console.error("[Resend Webhook] Campaign lookup error:", lookupError.message);
    }

    if (!campaign) {
      console.log("[Resend Webhook] No campaign found for broadcast_id:", broadcastId);
      return NextResponse.json({ received: true });
    }

    console.log("[Resend Webhook] Matched campaign:", campaign.id, "event:", type);

    // Update campaign status for delivery events
    if (type === "email.delivered" || type === "email.sent") {
      if (campaign.status === "queued" || campaign.status === "sending") {
        await db
          .from("email_campaigns")
          .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", campaign.id);
        console.log("[Resend Webhook] Campaign status → sent");
      }
      return NextResponse.json({ received: true });
    }

    const column = eventMap[type];
    if (!column) {
      console.log("[Resend Webhook] Unknown event type:", type);
      return NextResponse.json({ received: true });
    }

    // Atomic increment via RPC (defined in migration 094). Campaign blasts
    // deliver thousands of concurrent open/click events — a read-then-write
    // here loses updates under load. On a transient DB error we return 500 so
    // Resend retries rather than silently dropping the event.
    const { error: incErr } = await db.rpc("increment_campaign_counter", {
      campaign_id: campaign.id,
      counter_column: column,
    });
    if (incErr) {
      console.error("[Resend Webhook] increment failed:", incErr.message);
      return NextResponse.json({ error: "Increment failed" }, { status: 500 });
    }

    // Handle unsubscribe — also mark the contact as unsubscribed
    if (type === "email.unsubscribed" && data.email) {
      const { error: unsubErr } = await db
        .from("campaign_contacts")
        .update({ unsubscribed: true, updated_at: new Date().toISOString() })
        .eq("email", data.email.toLowerCase());
      if (unsubErr) {
        console.error("[Resend Webhook] unsubscribe write failed:", unsubErr.message);
        return NextResponse.json({ error: "Unsubscribe write failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Resend webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
