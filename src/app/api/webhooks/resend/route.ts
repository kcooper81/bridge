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
    const body = await request.json();
    const { type, data } = body;

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
      // Not a broadcast event — could be a transactional email
      return NextResponse.json({ received: true });
    }

    const db = createServiceClient();

    // Look up campaign
    const { data: campaign } = await db
      .from("email_campaigns")
      .select("id, status")
      .eq("resend_broadcast_id", broadcastId)
      .maybeSingle();

    // Update campaign status for delivery events
    if (campaign && (type === "email.delivered" || type === "email.sent")) {
      if (campaign.status === "queued" || campaign.status === "sending") {
        await db
          .from("email_campaigns")
          .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", campaign.id);
      }
      return NextResponse.json({ received: true });
    }

    const column = eventMap[type];
    if (!column) {
      return NextResponse.json({ received: true });
    }

    if (!campaign) {
      // Unknown broadcast — ignore
      return NextResponse.json({ received: true });
    }

    // Increment counter — try RPC first, fallback to manual
    const { error: rpcError } = await db.rpc("increment_campaign_counter", {
      campaign_id: campaign.id,
      counter_column: column,
    });

    if (rpcError) {
      // Fallback: read + increment + write
      const { data: row } = await db
        .from("email_campaigns")
        .select(column)
        .eq("id", campaign.id)
        .single();

      if (row) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentVal = ((row as any)[column] as number) || 0;
        await db
          .from("email_campaigns")
          .update({
            [column]: currentVal + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", campaign.id);
      }
    }

    // Handle unsubscribe — also mark the contact as unsubscribed
    if (type === "email.unsubscribed" && data.email) {
      await db
        .from("campaign_contacts")
        .update({ unsubscribed: true, updated_at: new Date().toISOString() })
        .eq("email", data.email.toLowerCase());
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Resend webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
