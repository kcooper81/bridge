import { NextResponse } from "next/server";
import {
  REPORT_STATS,
  LEAK_CATEGORIES,
  ROLE_BREAKDOWN,
  TOOL_BREAKDOWN,
  REPORT_META,
} from "@/lib/research/state-of-prompt-data-leakage-q2-2026";

// Machine-readable companion to the CSV. Convenient for journalists/analysts
// who want to embed or visualize the data programmatically.

export function GET() {
  const body = {
    title: REPORT_META.title,
    subtitle: REPORT_META.subtitle,
    publishedAt: REPORT_META.publishedAt,
    edition: REPORT_META.edition,
    license: "CC-BY 4.0",
    sourceUrl: "https://teamprompt.app/research/state-of-prompt-data-leakage-q2-2026",
    stats: REPORT_STATS,
    categories: LEAK_CATEGORIES,
    byRole: ROLE_BREAKDOWN,
    byTool: TOOL_BREAKDOWN,
  };

  return NextResponse.json(body, {
    headers: {
      "Content-Disposition": `attachment; filename="teamprompt-prompt-data-leakage-q2-2026.json"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
