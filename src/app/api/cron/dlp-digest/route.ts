import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";

// Weekly DLP digest — emails admins a summary of violations and audit
// activity from the past 7 days. Mirrors the seo-digest cron pattern.
// Honors notification_preferences.weekly_digest (default true).

const CRON_SECRET = process.env.CRON_SECRET;

interface OrgRow {
  id: string;
  name: string;
}

interface ProfileRow {
  id: string;
  email: string;
  notification_preferences: { weekly_digest?: boolean } | null;
}

function pct(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+∞" : "0%";
  const p = ((curr - prev) / prev) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(0)}%`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "no RESEND_API_KEY" }, { status: 200 });
  }

  const db = createServiceClient();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";

  // Find every org that has at least one violation in the last 14 days —
  // skip orgs with no DLP traffic so we don't email empty digests.
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: activeOrgs } = await db
    .from("security_violations")
    .select("org_id")
    .gte("created_at", since14);
  const orgIds = Array.from(new Set((activeOrgs || []).map((r) => r.org_id)));

  const results: Array<{ orgId: string; sentTo: number; skipped?: string }> = [];
  for (const orgId of orgIds) {
    const { data: org } = await db
      .from("organizations")
      .select("id, name")
      .eq("id", orgId)
      .maybeSingle() as { data: OrgRow | null };
    if (!org) continue;

    // Recipients: admins + managers who haven't opted out of weekly_digest.
    const { data: admins } = await db
      .from("profiles")
      .select("id, email, notification_preferences")
      .eq("org_id", orgId)
      .in("role", ["admin", "manager"])
      .returns<ProfileRow[]>();
    const recipients = (admins || [])
      .filter((a) => a.notification_preferences?.weekly_digest !== false)
      .map((a) => a.email)
      .filter(Boolean);
    if (recipients.length === 0) {
      results.push({ orgId, sentTo: 0, skipped: "no_opted_in_recipients" });
      continue;
    }

    const d0 = new Date();
    const d7 = new Date(d0.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d14 = new Date(d0.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [recent, prior, topRules] = await Promise.all([
      db.from("security_violations").select("severity, rule_name").eq("org_id", orgId).gte("created_at", d7.toISOString()),
      db.from("security_violations").select("severity").eq("org_id", orgId).gte("created_at", d14.toISOString()).lt("created_at", d7.toISOString()),
      db.from("security_violations").select("rule_name").eq("org_id", orgId).gte("created_at", d7.toISOString()),
    ]);

    const recentRows = recent.data || [];
    const priorRows = prior.data || [];
    const blocked = recentRows.filter((r) => r.severity === "block").length;
    const warned = recentRows.filter((r) => r.severity === "warn").length;
    const redacted = recentRows.filter((r) => r.severity === "redact").length;
    const priorTotal = priorRows.length;

    const ruleCounts: Record<string, number> = {};
    for (const r of (topRules.data || [])) {
      ruleCounts[r.rule_name || "Unknown"] = (ruleCounts[r.rule_name || "Unknown"] || 0) + 1;
    }
    const top5 = Object.entries(ruleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = recentRows.length;
    if (total === 0 && priorTotal === 0) {
      results.push({ orgId, sentTo: 0, skipped: "no_activity" });
      continue;
    }

    const html = `
      <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;">
        <h1 style="font-size:24px;margin:0 0 4px;">Weekly DLP Digest — ${org.name}</h1>
        <p style="color:#64748b;margin:0 0 24px;">${d7.toISOString().slice(0,10)} → ${d0.toISOString().slice(0,10)}</p>

        <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
          <div style="flex:1;min-width:140px;background:#fef2f2;padding:14px;border-radius:8px;">
            <div style="font-size:11px;color:#991b1b;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Blocked</div>
            <div style="font-size:28px;font-weight:700;color:#b91c1c;margin-top:4px;">${blocked}</div>
          </div>
          <div style="flex:1;min-width:140px;background:#fffbeb;padding:14px;border-radius:8px;">
            <div style="font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Warned</div>
            <div style="font-size:28px;font-weight:700;color:#b45309;margin-top:4px;">${warned}</div>
          </div>
          <div style="flex:1;min-width:140px;background:#eff6ff;padding:14px;border-radius:8px;">
            <div style="font-size:11px;color:#1e40af;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Redacted</div>
            <div style="font-size:28px;font-weight:700;color:#1d4ed8;margin-top:4px;">${redacted}</div>
          </div>
        </div>

        <p style="font-size:13px;color:#475569;margin:0 0 16px;">
          Total violations this week: <strong>${total}</strong> (${pct(total, priorTotal)} vs prior 7 days)
        </p>

        ${top5.length > 0 ? `
        <h2 style="font-size:16px;margin:24px 0 8px;">Top triggered rules</h2>
        <ol style="font-size:13px;padding-left:20px;margin:0;">
          ${top5.map(([rule, count]) => `<li style="margin:4px 0;"><strong>${rule}</strong> — ${count}</li>`).join("")}
        </ol>` : ""}

        <p style="margin-top:32px;font-size:12px;color:#94a3b8;">
          Full data at <a href="https://teamprompt.app/activity" style="color:#2563eb;">/activity</a>.
          Manage your digest preferences at <a href="https://teamprompt.app/notifications" style="color:#2563eb;">/notifications</a>.
        </p>
      </div>`;

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `Weekly DLP Digest — ${blocked} blocked, ${warned} warned (${pct(total, priorTotal)} WoW)`,
      html,
    });

    results.push({
      orgId,
      sentTo: recipients.length,
      ...(sendResult.error ? { skipped: `resend_error: ${sendResult.error.message}` } : {}),
    });
  }

  return NextResponse.json({ success: true, orgs: results.length, results });
}
