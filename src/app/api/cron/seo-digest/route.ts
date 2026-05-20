import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { getLatestResults } from "@/lib/llm-citation-tracker";

const CRON_SECRET = process.env.CRON_SECRET;

// Weekly SEO digest — pulls GSC data and emails super admins a summary.
// Scheduled in vercel.json as `0 13 * * 1` (Mondays at 8am Central).
//
// The endpoint uses the GSC OAuth refresh token stored in
// `platform_integrations` (provider='google_search_console') — the same
// connection the /admin/content page uses. If the token is missing or
// the refresh fails, the digest is skipped quietly rather than crashing
// the cron.

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function getValidToken(db: ReturnType<typeof createServiceClient>) {
  const { data } = await db
    .from("platform_integrations")
    .select("*")
    .eq("provider", "google_search_console")
    .single();
  if (!data) return null;
  if (data.token_expires_at && Date.now() > data.token_expires_at - 300_000) {
    if (!data.refresh_token) return null;
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: data.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) return null;
    const tokens = await res.json();
    await db
      .from("platform_integrations")
      .update({
        access_token: tokens.access_token,
        token_expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
      })
      .eq("provider", "google_search_console");
    return { token: tokens.access_token, siteUrl: data.site_url as string };
  }
  return { token: data.access_token as string, siteUrl: data.site_url as string };
}

async function gscQuery(token: string, siteUrl: string, body: object): Promise<GscRow[]> {
  const r = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!r.ok) return [];
  const j = await r.json();
  return j.rows || [];
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pctChange(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+∞" : "0%";
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
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
  const gsc = await getValidToken(db);
  if (!gsc) {
    return NextResponse.json({ skipped: "GSC not connected or token refresh failed" }, { status: 200 });
  }

  // GSC has ~3 day delay; compare last 7d to prior 7d, ending 3 days back.
  const today = new Date();
  const d0 = new Date(today);
  d0.setDate(d0.getDate() - 3);
  const d7 = new Date(d0);
  d7.setDate(d7.getDate() - 7);
  const d14 = new Date(d7);
  d14.setDate(d14.getDate() - 7);

  const [recent, prior, topQueries, topPages] = await Promise.all([
    gscQuery(gsc.token, gsc.siteUrl, { startDate: fmt(d7), endDate: fmt(d0), dimensions: [] }),
    gscQuery(gsc.token, gsc.siteUrl, { startDate: fmt(d14), endDate: fmt(d7), dimensions: [] }),
    gscQuery(gsc.token, gsc.siteUrl, { startDate: fmt(d7), endDate: fmt(d0), dimensions: ["query"], rowLimit: 15 }),
    gscQuery(gsc.token, gsc.siteUrl, { startDate: fmt(d7), endDate: fmt(d0), dimensions: ["page"], rowLimit: 15 }),
  ]);

  const r = recent[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0, keys: [] };
  const p = prior[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0, keys: [] };

  // Find new "zero-click but top-10" pages — actionable for meta improvements
  const zeroClickTop10 = topPages.filter((row) => row.clicks === 0 && row.position <= 10 && row.impressions >= 3);

  // Pull this week's LLM citation snapshot (Perplexity + OpenAI w/ web search).
  // The llm-citations cron runs an hour earlier so this read is fresh.
  const citationResults = await getLatestResults();
  const citedCount = citationResults.filter((c) => c.cited).length;
  const mentionedNotCitedCount = citationResults.filter((c) => !c.cited && c.mentionedInAnswer).length;
  const citationsByProvider: Record<string, { total: number; cited: number }> = {};
  for (const c of citationResults) {
    const slot = (citationsByProvider[c.provider] ??= { total: 0, cited: 0 });
    slot.total++;
    if (c.cited) slot.cited++;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #0f172a;">
      <h1 style="font-size: 24px; margin: 0 0 8px;">Weekly SEO Digest</h1>
      <p style="color: #64748b; margin: 0 0 24px;">${fmt(d7)} → ${fmt(d0)} (vs ${fmt(d14)} → ${fmt(d7)})</p>

      <h2 style="font-size: 18px; margin: 24px 0 12px;">Site totals</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f5f9;"><th style="padding: 8px; text-align: left;">Metric</th><th style="padding: 8px; text-align: right;">Prior</th><th style="padding: 8px; text-align: right;">Recent</th><th style="padding: 8px; text-align: right;">Change</th></tr>
        </thead>
        <tbody>
          <tr><td style="padding: 8px;">Impressions</td><td style="padding: 8px; text-align: right;">${p.impressions}</td><td style="padding: 8px; text-align: right; font-weight: 600;">${r.impressions}</td><td style="padding: 8px; text-align: right; color: ${r.impressions >= p.impressions ? "#15803d" : "#dc2626"};">${pctChange(r.impressions, p.impressions)}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 8px;">Clicks</td><td style="padding: 8px; text-align: right;">${p.clicks}</td><td style="padding: 8px; text-align: right; font-weight: 600;">${r.clicks}</td><td style="padding: 8px; text-align: right; color: ${r.clicks >= p.clicks ? "#15803d" : "#dc2626"};">${pctChange(r.clicks, p.clicks)}</td></tr>
          <tr><td style="padding: 8px;">CTR</td><td style="padding: 8px; text-align: right;">${(p.ctr * 100).toFixed(2)}%</td><td style="padding: 8px; text-align: right; font-weight: 600;">${(r.ctr * 100).toFixed(2)}%</td><td style="padding: 8px; text-align: right;">—</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 8px;">Avg position</td><td style="padding: 8px; text-align: right;">${p.position.toFixed(1)}</td><td style="padding: 8px; text-align: right; font-weight: 600;">${r.position.toFixed(1)}</td><td style="padding: 8px; text-align: right; color: ${r.position <= p.position ? "#15803d" : "#dc2626"};">${r.position <= p.position ? "↑" : "↓"} ${Math.abs(r.position - p.position).toFixed(1)}</td></tr>
        </tbody>
      </table>

      <h2 style="font-size: 18px; margin: 32px 0 12px;">Top queries (last 7d)</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead><tr style="background: #f1f5f9;"><th style="padding: 6px; text-align: left;">Query</th><th style="padding: 6px; text-align: right;">Imp</th><th style="padding: 6px; text-align: right;">Clk</th><th style="padding: 6px; text-align: right;">Pos</th></tr></thead>
        <tbody>
          ${topQueries.slice(0, 10).map((q) => `<tr><td style="padding: 6px;">${q.keys[0].slice(0, 60)}</td><td style="padding: 6px; text-align: right;">${q.impressions}</td><td style="padding: 6px; text-align: right; font-weight: ${q.clicks > 0 ? 600 : 400};">${q.clicks}</td><td style="padding: 6px; text-align: right;">${q.position.toFixed(1)}</td></tr>`).join("")}
        </tbody>
      </table>

      ${citationResults.length > 0 ? `
      <h2 style="font-size: 18px; margin: 32px 0 12px;">LLM citation tracking (this week)</h2>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Did teamprompt.app appear in the answer for our target queries?</p>
      <div style="display:flex; gap:8px; margin-bottom:12px;">
        <div style="flex:1; background:#ecfdf5; padding:10px; border-radius:8px;">
          <div style="font-size:10px; color:#065f46; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Cited</div>
          <div style="font-size:22px; font-weight:700; color:#047857;">${citedCount}<span style="font-size:13px; color:#94a3b8; font-weight:500;"> / ${citationResults.length}</span></div>
        </div>
        <div style="flex:1; background:#fffbeb; padding:10px; border-radius:8px;">
          <div style="font-size:10px; color:#92400e; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Mentioned only</div>
          <div style="font-size:22px; font-weight:700; color:#b45309;">${mentionedNotCitedCount}</div>
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead><tr style="background:#f1f5f9;"><th style="padding:6px; text-align:left;">Query</th><th style="padding:6px; text-align:center;">Perplexity</th><th style="padding:6px; text-align:center;">OpenAI</th></tr></thead>
        <tbody>
          ${Array.from(new Set(citationResults.map((c) => c.query))).slice(0, 12).map((q) => {
            const p = citationResults.find((c) => c.query === q && c.provider === "perplexity");
            const o = citationResults.find((c) => c.query === q && c.provider === "openai");
            const cell = (c?: { cited: boolean; mentionedInAnswer: boolean; citationRank: number | null; error?: string }) => {
              if (!c) return `<td style="padding:6px; text-align:center; color:#94a3b8;">—</td>`;
              if (c.error) return `<td style="padding:6px; text-align:center; color:#94a3b8;" title="${c.error.replace(/"/g, "&quot;")}">err</td>`;
              if (c.cited) return `<td style="padding:6px; text-align:center; color:#15803d; font-weight:600;">✓ #${c.citationRank ?? "?"}</td>`;
              if (c.mentionedInAnswer) return `<td style="padding:6px; text-align:center; color:#b45309;">~mention</td>`;
              return `<td style="padding:6px; text-align:center; color:#94a3b8;">·</td>`;
            };
            return `<tr><td style="padding:6px;">${q}</td>${cell(p)}${cell(o)}</tr>`;
          }).join("")}
        </tbody>
      </table>
      ` : ""}

      ${zeroClickTop10.length > 0 ? `
      <h2 style="font-size: 18px; margin: 32px 0 12px; color: #b45309;">⚠ Top-10 pages with zero clicks (last 7d)</h2>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Pages ranking top-10 but not converting clicks. Likely meta-title or description issue.</p>
      <ul style="font-size: 13px; padding-left: 20px;">
        ${zeroClickTop10.map((p) => `<li><a href="${p.keys[0]}" style="color: #2563eb;">${p.keys[0].replace("https://teamprompt.app", "") || "/"}</a> — pos ${p.position.toFixed(1)}, ${p.impressions} imp</li>`).join("")}
      </ul>` : ""}

      <h2 style="font-size: 18px; margin: 32px 0 12px;">Top pages (last 7d)</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead><tr style="background: #f1f5f9;"><th style="padding: 6px; text-align: left;">URL</th><th style="padding: 6px; text-align: right;">Imp</th><th style="padding: 6px; text-align: right;">Clk</th><th style="padding: 6px; text-align: right;">Pos</th></tr></thead>
        <tbody>
          ${topPages.slice(0, 10).map((p) => `<tr><td style="padding: 6px;"><a href="${p.keys[0]}" style="color: #2563eb;">${p.keys[0].replace("https://teamprompt.app", "") || "/"}</a></td><td style="padding: 6px; text-align: right;">${p.impressions}</td><td style="padding: 6px; text-align: right; font-weight: ${p.clicks > 0 ? 600 : 400};">${p.clicks}</td><td style="padding: 6px; text-align: right;">${p.position.toFixed(1)}</td></tr>`).join("")}
        </tbody>
      </table>

      <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
        Sent by the weekly SEO cron. Full data at <a href="https://teamprompt.app/admin/content" style="color: #2563eb;">/admin/content</a> or Google Search Console.
      </p>
    </div>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "TeamPrompt <noreply@teamprompt.app>";

  const citationSubject = citationResults.length > 0
    ? ` · LLM cited ${citedCount}/${citationResults.length}`
    : "";

  // Note unused but useful for future per-provider subject summaries
  void citationsByProvider;

  const sendResult = await resend.emails.send({
    from: fromEmail,
    to: SUPER_ADMIN_EMAILS,
    subject: `Weekly SEO Digest — ${r.impressions} imp, ${r.clicks} clk (${pctChange(r.impressions, p.impressions)} imp WoW)${citationSubject}`,
    html,
  });

  return NextResponse.json({
    success: true,
    range: { start: fmt(d7), end: fmt(d0) },
    impressions: r.impressions,
    clicks: r.clicks,
    citedQueries: citedCount,
    totalCitationChecks: citationResults.length,
    sent: SUPER_ADMIN_EMAILS,
    resendId: sendResult.data?.id,
  });
}
