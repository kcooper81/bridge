import { NextRequest, NextResponse } from "next/server";
import { runCitationChecks, DEFAULT_TRACKED_QUERIES } from "@/lib/llm-citation-tracker";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/llm-citations
 *
 * Weekly LLM citation check — queries Perplexity + OpenAI (with web
 * search) for the configured tracked queries, persists per-query
 * per-provider results in llm_citation_checks, and returns a JSON
 * summary. Runs Monday morning before the seo-digest cron so the
 * digest email can surface this week's results.
 *
 * Vercel cron schedule: `0 11 * * 1` (Mondays 11:00 UTC = 6am Central),
 * an hour ahead of the seo-digest so the data is fresh when the digest
 * email composes.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runCitationChecks(DEFAULT_TRACKED_QUERIES);

  const cited = results.filter((r) => r.cited).length;
  const mentioned = results.filter((r) => !r.cited && r.mentionedInAnswer).length;
  const errored = results.filter((r) => r.error).length;

  return NextResponse.json({
    success: true,
    total: results.length,
    cited,
    mentioned_not_cited: mentioned,
    errored,
    queries: DEFAULT_TRACKED_QUERIES.length,
  });
}
