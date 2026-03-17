import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyWeeklyDigest } from "@/lib/slack/notify";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/slack-digest
 * Weekly digest — sends activity summary to Slack for all connected orgs.
 * Schedule via Vercel Cron: every Monday at 9am UTC.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();

  // Find all orgs with Slack connected and weekly digest enabled
  const { data: configs } = await db
    .from("slack_config")
    .select("org_id")
    .eq("notify_weekly_digest", true);

  if (!configs || configs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let sent = 0;

  for (const config of configs) {
    try {
      // Verify Slack is still connected
      const { data: integration } = await db
        .from("workspace_integrations")
        .select("id")
        .eq("org_id", config.org_id)
        .eq("provider", "slack")
        .maybeSingle();

      if (!integration) continue;

      // Aggregate stats for the past week
      const [conversationsResult, violationsResult, promptsResult, usersResult, topPromptResult] = await Promise.all([
        // Total conversations
        db.from("conversation_logs")
          .select("*", { count: "exact", head: true })
          .eq("org_id", config.org_id)
          .gte("created_at", weekAgo),
        // DLP violations
        db.from("security_violations")
          .select("*", { count: "exact", head: true })
          .eq("org_id", config.org_id)
          .gte("created_at", weekAgo),
        // New prompts
        db.from("prompts")
          .select("*", { count: "exact", head: true })
          .eq("org_id", config.org_id)
          .gte("created_at", weekAgo),
        // Active users — count distinct via profiles who have logs this week
        db.from("conversation_logs")
          .select("user_id", { count: "exact", head: true })
          .eq("org_id", config.org_id)
          .gte("created_at", weekAgo),
        // Top used prompt this week
        db.from("prompts")
          .select("title, usage_count")
          .eq("org_id", config.org_id)
          .eq("status", "approved")
          .order("usage_count", { ascending: false })
          .limit(1),
      ]);

      await notifyWeeklyDigest(config.org_id, {
        totalConversations: conversationsResult.count || 0,
        dlpViolations: violationsResult.count || 0,
        newPrompts: promptsResult.count || 0,
        activeUsers: usersResult.count || 0,
        topPrompt: topPromptResult.data?.[0]?.title || undefined,
      });

      sent++;
    } catch (err) {
      console.error(`Slack digest failed for org ${config.org_id}:`, err);
    }
  }

  return NextResponse.json({ sent });
}
