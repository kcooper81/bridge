import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const CRON_SECRET = process.env.CRON_SECRET;

// DELETE expired conversation logs based on each org's retention policy
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();

  // Find all orgs that have a retention policy set
  const { data: orgs, error: orgError } = await db
    .from("organizations")
    .select("id, settings")
    .not("settings", "is", null);

  if (orgError) {
    console.error("Log retention: failed to fetch orgs:", orgError);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }

  let totalDeleted = 0;
  const results: { org_id: string; deleted: number }[] = [];

  for (const org of orgs || []) {
    const settings = (org.settings || {}) as Record<string, unknown>;
    const retentionDays = settings.activity_log_retention_days;

    if (typeof retentionDays !== "number" || retentionDays < 1) continue;

    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

    const { count, error: deleteError } = await db
      .from("conversation_logs")
      .delete({ count: "exact" })
      .eq("org_id", org.id)
      .lt("created_at", cutoff);

    if (deleteError) {
      console.error(`Log retention: failed to delete for org ${org.id}:`, deleteError);
      continue;
    }

    const deleted = count || 0;
    if (deleted > 0) {
      totalDeleted += deleted;
      results.push({ org_id: org.id, deleted });
    }
  }

  return NextResponse.json({
    success: true,
    totalDeleted,
    orgsProcessed: results.length,
    details: results,
  });
}
