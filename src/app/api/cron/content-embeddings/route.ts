import { NextRequest, NextResponse } from "next/server";
import { recomputeEmbeddings } from "@/lib/content-embeddings";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/content-embeddings
 *
 * Recompute content embeddings for any blog post / solutions page /
 * security hub / tool page whose source text hash has changed since the
 * last run. Used to power AI-driven internal linking on blog/[slug] and
 * /solutions/[slug] via the "Related from the blog" section.
 *
 * Vercel cron: `0 10 * * 1` (Mondays 10:00 UTC, before llm-citations
 * + seo-digest so the latest content is reflected in the same cycle).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await recomputeEmbeddings();
  return NextResponse.json({ success: true, ...stats });
}
