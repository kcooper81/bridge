import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { Resend } from "resend";
import { logServiceError } from "@/lib/log-error";

const resend = new Resend(process.env.RESEND_API_KEY);

/** POST — send or schedule a broadcast via Resend */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json();
  const { schedule_at } = body; // optional ISO string for scheduling

  const db = createServiceClient();

  // Atomically transition status from 'draft' to 'sending' to prevent duplicate sends
  const { data: transitioned, error: transitionError } = await db
    .from("email_campaigns")
    .update({ status: "sending", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "draft")
    .select("*")
    .maybeSingle();

  if (transitionError) {
    console.error("Campaign transition error:", transitionError);
    return NextResponse.json({ error: "Failed to start campaign send" }, { status: 500 });
  }
  if (!transitioned) {
    // Either campaign doesn't exist or is no longer a draft (another request already sent it)
    const { data: existing } = await db
      .from("email_campaigns")
      .select("status")
      .eq("id", id)
      .single();
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Only draft campaigns can be sent. This campaign is already " + existing.status },
      { status: 409 }
    );
  }
  const campaign = transitioned;
  if (!campaign.subject?.trim()) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }
  if (!campaign.body_html?.trim()) {
    return NextResponse.json({ error: "Email body is required" }, { status: 400 });
  }

  try {
    // Step 1: Get or create an audience
    const audienceId = await getOrCreateAudience();

    // Step 2: Sync contacts from our profiles table
    const contactCount = await syncContacts(db, audienceId, campaign.segment_name);

    // Step 3: Create the broadcast
    const broadcastRes = await resend.broadcasts.create({
      audienceId,
      from: campaign.from_email || "TeamPrompt <hello@teamprompt.app>",
      subject: campaign.subject,
      html: wrapUnsubscribe(campaign.body_html),
      name: campaign.name,
    });

    if (!broadcastRes.data?.id) {
      throw new Error("Failed to create broadcast in Resend");
    }

    const broadcastId = broadcastRes.data.id;

    // Step 4: Send or schedule
    if (schedule_at) {
      await resend.broadcasts.send(broadcastId, {
        scheduledAt: schedule_at,
      });
    } else {
      await resend.broadcasts.send(broadcastId);
    }

    // Step 5: Update campaign record
    const statusUpdate: Record<string, unknown> = {
      resend_broadcast_id: broadcastId,
      status: schedule_at ? "scheduled" : "queued",
      recipient_count: contactCount,
      updated_at: new Date().toISOString(),
    };
    if (schedule_at) statusUpdate.scheduled_at = schedule_at;
    else statusUpdate.sent_at = new Date().toISOString();

    await db.from("email_campaigns").update(statusUpdate).eq("id", id);

    return NextResponse.json({
      success: true,
      broadcast_id: broadcastId,
      recipient_count: contactCount,
      status: schedule_at ? "scheduled" : "queued",
    });
  } catch (err) {
    console.error("Campaign send error:", err);
    logServiceError("resend", err, { url: "/api/admin/campaigns/[id]/send" });
    await db
      .from("email_campaigns")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send campaign" },
      { status: 500 }
    );
  }
}

/** Ensure a "TeamPrompt Marketing" audience exists in Resend */
async function getOrCreateAudience(): Promise<string> {
  const listRes = await resend.audiences.list();
  const existing = listRes.data?.data?.find(
    (a) => a.name === "TeamPrompt Marketing"
  );
  if (existing) return existing.id;

  const createRes = await resend.audiences.create({
    name: "TeamPrompt Marketing",
  });
  if (!createRes.data?.id) throw new Error("Failed to create audience");
  return createRes.data.id;
}

/**
 * Sync contacts to Resend audience.
 * Supports: "all" (DB users), plan-based segments, "external" (campaign_contacts table),
 * "all_combined" (DB users + external contacts), and "list:<id>" (specific audience list).
 */
async function syncContacts(
  db: ReturnType<typeof createServiceClient>,
  audienceId: string,
  segmentName: string | null
): Promise<number> {
  let synced = 0;

  // Handle audience list segments (list:<uuid>)
  if (segmentName?.startsWith("list:")) {
    const listId = segmentName.replace("list:", "");
    const { data: listContacts } = await db
      .from("audience_list_contacts")
      .select("contact_id")
      .eq("list_id", listId);

    if (!listContacts || listContacts.length === 0) return 0;

    const contactIds = listContacts.map((lc) => lc.contact_id);
    const { data: contacts } = await db
      .from("campaign_contacts")
      .select("email, first_name, last_name, company")
      .in("id", contactIds)
      .eq("unsubscribed", false);

    for (const contact of contacts || []) {
      if (!contact.email) continue;
      try {
        await resend.contacts.create({
          audienceId,
          email: contact.email,
          firstName: contact.first_name || "",
          lastName: contact.last_name || "",
          unsubscribed: false,
        });
        synced++;
      } catch {
        synced++;
      }
    }
    return synced;
  }

  // Sync external contacts from campaign_contacts table
  if (segmentName === "external" || segmentName === "all_combined") {
    const { data: external } = await db
      .from("campaign_contacts")
      .select("email, first_name, last_name, company")
      .eq("unsubscribed", false);

    for (const contact of external || []) {
      if (!contact.email) continue;
      try {
        await resend.contacts.create({
          audienceId,
          email: contact.email,
          firstName: contact.first_name || "",
          lastName: contact.last_name || "",
          unsubscribed: false,
        });
        synced++;
      } catch {
        synced++;
      }
    }

    if (segmentName === "external") return synced;
  }

  // Sync internal users from profiles
  let query = db
    .from("profiles")
    .select("id, email, name")
    .not("email", "is", null);

  // Filter by plan if segment specifies one
  if (segmentName && segmentName !== "all" && segmentName !== "all_combined") {
    const { data: orgIds } = await db
      .from("subscriptions")
      .select("org_id")
      .eq("plan", segmentName);

    if (orgIds && orgIds.length > 0) {
      const ids = orgIds.map((o) => o.org_id);
      const { data: memberIds } = await db
        .from("org_members")
        .select("user_id")
        .in("org_id", ids);

      if (memberIds && memberIds.length > 0) {
        query = query.in(
          "id",
          memberIds.map((m) => m.user_id)
        );
      }
    }
  }

  const { data: users } = await query;

  for (const user of users || []) {
    if (!user.email) continue;
    try {
      await resend.contacts.create({
        audienceId,
        email: user.email,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        unsubscribed: false,
      });
      synced++;
    } catch {
      synced++;
    }
  }

  return synced;
}

/** Inject unsubscribe link placeholder if not already present */
function wrapUnsubscribe(html: string): string {
  if (html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}")) return html;

  const unsubBlock = `
<div style="text-align: center; padding: 20px 0; margin-top: 32px; border-top: 1px solid #e4e4e7;">
  <p style="margin: 0; font-size: 12px; color: #71717a;">
    You're receiving this because you signed up for TeamPrompt.<br />
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #2563EB; text-decoration: underline;">Unsubscribe</a>
  </p>
</div>`;

  // Try to inject before </body>, otherwise append
  if (html.includes("</body>")) {
    return html.replace("</body>", `${unsubBlock}\n</body>`);
  }
  return html + unsubBlock;
}
