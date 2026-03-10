import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { buildEmail } from "@/lib/email-template";

// Vercel cron jobs send this header for authentication
const CRON_SECRET = process.env.CRON_SECRET;

// 24 hours - same threshold as extension-status.ts
const ACTIVE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
// Don't re-alert for the same user within 7 days
const ALERT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  // Verify cron secret — if CRON_SECRET is not set, reject all requests
  // to prevent unauthenticated access when the env var is missing.
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();
  const now = new Date();
  const threshold = new Date(now.getTime() - ACTIVE_THRESHOLD_MS).toISOString();
  const cooldown = new Date(now.getTime() - ALERT_COOLDOWN_MS).toISOString();

  // Find members whose extension was active but has gone stale
  // AND we haven't already alerted about them recently
  const { data: staleMembers, error } = await db
    .from("profiles")
    .select("id, name, email, org_id, last_extension_active, extension_alert_sent_at")
    .not("org_id", "is", null)
    .not("last_extension_active", "is", null)
    .lt("last_extension_active", threshold)
    .or(`extension_alert_sent_at.is.null,extension_alert_sent_at.lt.${cooldown}`);

  if (error) {
    console.error("Extension check query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  if (!staleMembers || staleMembers.length === 0) {
    return NextResponse.json({ checked: 0, alerted: 0 });
  }

  // Group by org for batch processing
  const orgMap = new Map<string, typeof staleMembers>();
  for (const member of staleMembers) {
    if (!member.org_id) continue;
    const existing = orgMap.get(member.org_id) || [];
    existing.push(member);
    orgMap.set(member.org_id, existing);
  }

  let totalAlerted = 0;

  for (const [orgId, members] of Array.from(orgMap.entries())) {
    // Get admins/managers for this org
    const { data: admins } = await db
      .from("profiles")
      .select("id, email, name")
      .eq("org_id", orgId)
      .in("role", ["admin", "manager"]);

    if (!admins || admins.length === 0) continue;

    // Get org name
    const { data: org } = await db
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();

    const orgName = org?.name || "your organization";

    for (const member of members) {
      const memberName = member.name || member.email;

      // Create in-app notifications for each admin/manager
      const notificationRows = admins.map((admin) => ({
        user_id: admin.id,
        org_id: orgId,
        type: "extension_inactive",
        title: "Extension Inactive",
        message: `${memberName}'s browser extension has been inactive for over 24 hours.`,
        metadata: {
          member_id: member.id,
          member_name: memberName,
          member_email: member.email,
          last_active: member.last_extension_active,
        },
      }));

      await db.from("notifications").insert(notificationRows);

      // Send email to admins
      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromEmail = process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

          const adminEmails = admins.map((a) => a.email);

          await resend.emails.send({
            from: fromEmail,
            to: adminEmails,
            subject: `[${orgName}] Extension inactive: ${memberName}`,
            html: buildEmail({
              heading: "Extension Inactive Alert",
              body: `
                <p><strong>${memberName}</strong> (${member.email}) has an inactive browser extension.</p>
                <p>Their extension hasn't checked in for over 24 hours. This could mean the extension was disabled, uninstalled, or the browser hasn't been opened.</p>
                <p>You can check the status of all team members on your Team page.</p>
              `,
              ctaText: "View Team",
              ctaUrl: `${siteUrl}/team`,
              footerNote: "You're receiving this because you're an admin or manager of this organization.",
            }),
          });
        } catch (emailError) {
          console.error(`Failed to send extension alert email for ${member.email}:`, emailError);
        }
      }

      // Mark alert as sent
      await db
        .from("profiles")
        .update({ extension_alert_sent_at: now.toISOString() })
        .eq("id", member.id);

      totalAlerted++;
    }
  }

  return NextResponse.json({ checked: staleMembers.length, alerted: totalAlerted });
}
