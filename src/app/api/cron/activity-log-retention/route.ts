import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Activity-log retention purge — runs daily, walks each org, and deletes
// conversation_logs + security_violations older than the org's
// activity_log_retention_days setting (default 365). Caps deletes per
// org per run to bound the time the cron takes.

const CRON_SECRET = process.env.CRON_SECRET;
const PER_ORG_BATCH = 5000;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();
  const { data: orgs } = await db
    .from("organizations")
    .select("id, activity_log_retention_days");
  if (!orgs) return NextResponse.json({ success: true, orgs: 0 });

  const results: Array<{ orgId: string; days: number; logsDeleted: number; violationsDeleted: number }> = [];

  for (const org of orgs) {
    const days = (org as { activity_log_retention_days?: number }).activity_log_retention_days ?? 365;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { count: logsBefore } = await db
      .from("conversation_logs")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .lt("created_at", cutoff);

    if ((logsBefore ?? 0) > 0) {
      // Delete in batches to avoid long-running statements
      const { data: oldIds } = await db
        .from("conversation_logs")
        .select("id")
        .eq("org_id", org.id)
        .lt("created_at", cutoff)
        .limit(PER_ORG_BATCH);
      const ids = (oldIds || []).map((r) => r.id);
      if (ids.length > 0) {
        await db.from("conversation_logs").delete().in("id", ids);
      }
    }

    const { count: violationsBefore } = await db
      .from("security_violations")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .lt("created_at", cutoff);

    if ((violationsBefore ?? 0) > 0) {
      const { data: oldIds } = await db
        .from("security_violations")
        .select("id")
        .eq("org_id", org.id)
        .lt("created_at", cutoff)
        .limit(PER_ORG_BATCH);
      const ids = (oldIds || []).map((r) => r.id);
      if (ids.length > 0) {
        await db.from("security_violations").delete().in("id", ids);
      }
    }

    results.push({
      orgId: org.id,
      days,
      logsDeleted: Math.min(logsBefore ?? 0, PER_ORG_BATCH),
      violationsDeleted: Math.min(violationsBefore ?? 0, PER_ORG_BATCH),
    });
  }

  return NextResponse.json({ success: true, orgs: orgs.length, results });
}
