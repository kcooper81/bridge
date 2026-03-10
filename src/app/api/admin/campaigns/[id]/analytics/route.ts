import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/** GET — fetch and sync campaign analytics */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const db = createServiceClient();

  const { data: campaign } = await db
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // If the campaign has a Resend broadcast ID, sync status from Resend
  if (campaign.resend_broadcast_id && process.env.RESEND_API_KEY) {
    try {
      const broadcastRes = await resend.broadcasts.get(campaign.resend_broadcast_id);
      if (broadcastRes.data) {
        const broadcast = broadcastRes.data;

        // Map Resend status → our status
        const statusMap: Record<string, string> = {
          draft: "draft",
          queued: "queued",
          sent: "sent",
        };
        const newStatus = statusMap[broadcast.status] || campaign.status;

        // Update campaign if status changed
        if (newStatus !== campaign.status || !campaign.analytics_synced_at) {
          const updates: Record<string, unknown> = {
            status: newStatus,
            analytics_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (broadcast.sent_at && !campaign.sent_at) {
            updates.sent_at = broadcast.sent_at;
          }

          await db.from("email_campaigns").update(updates).eq("id", id);
          campaign.status = newStatus;
          campaign.analytics_synced_at = updates.analytics_synced_at;
        }
      }
    } catch (err) {
      console.error("Failed to sync broadcast status:", err);
    }
  }

  return NextResponse.json({
    campaign: {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      recipient_count: campaign.recipient_count || 0,
      sent_at: campaign.sent_at,
      scheduled_at: campaign.scheduled_at,
      opens: campaign.opens || 0,
      clicks: campaign.clicks || 0,
      bounces: campaign.bounces || 0,
      complaints: campaign.complaints || 0,
      unsubscribes: campaign.unsubscribes || 0,
      analytics_synced_at: campaign.analytics_synced_at,
    },
  });
}

/** POST — manually bump analytics counters (for webhook integration) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { event } = body;

  const validEvents = ["open", "click", "bounce", "complaint", "unsubscribe"];
  if (!validEvents.includes(event)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const db = createServiceClient();
  const columnMap: Record<string, string> = {
    open: "opens",
    click: "clicks",
    bounce: "bounces",
    complaint: "complaints",
    unsubscribe: "unsubscribes",
  };

  const column = columnMap[event];
  const { error } = await db.rpc("increment_campaign_counter", {
    campaign_id: id,
    counter_column: column,
  });

  if (error) {
    // Fallback: read, increment, write
    const { data } = await db
      .from("email_campaigns")
      .select(column)
      .eq("id", id)
      .single();

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentVal = ((data as any)[column] as number) || 0;
      await db
        .from("email_campaigns")
        .update({ [column]: currentVal + 1, updated_at: new Date().toISOString() })
        .eq("id", id);
    }
  }

  return NextResponse.json({ success: true });
}
