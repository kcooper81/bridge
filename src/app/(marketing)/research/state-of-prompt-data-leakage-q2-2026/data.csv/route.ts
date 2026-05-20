import { NextResponse } from "next/server";
import {
  REPORT_STATS,
  LEAK_CATEGORIES,
  ROLE_BREAKDOWN,
  TOOL_BREAKDOWN,
  REPORT_META,
} from "@/lib/research/state-of-prompt-data-leakage-q2-2026";

// Single CSV combining all four sub-datasets, each labeled by section.
// Designed to be one-click-importable into Excel/Sheets; journalists who
// want a citable single file get it without parsing JSON.

function escape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function GET() {
  const lines: string[] = [];
  lines.push(`# ${REPORT_META.title}`);
  lines.push(`# Published: ${REPORT_META.publishedAt}`);
  lines.push(`# License: CC-BY 4.0`);
  lines.push(`# Source: https://teamprompt.app/research/state-of-prompt-data-leakage-q2-2026`);
  lines.push("");

  lines.push("section,id,value,unit,label,context,source_name,source_url,source_year");
  for (const s of REPORT_STATS) {
    lines.push([
      "stats",
      s.id,
      s.value,
      s.unit ?? "",
      s.label,
      s.context,
      s.source.name,
      s.source.url,
      s.source.year,
    ].map(escape).join(","));
  }
  lines.push("");

  lines.push("section,id,label,percentage,note");
  for (const c of LEAK_CATEGORIES) {
    lines.push(["categories", c.id, c.label, c.percentage, c.note].map(escape).join(","));
  }
  lines.push("");

  lines.push("section,role,leak_rate_percent,primary_category");
  for (const r of ROLE_BREAKDOWN) {
    lines.push(["by_role", r.role, r.leakRate, r.primaryCategory].map(escape).join(","));
  }
  lines.push("");

  lines.push("section,tool,leak_rate_percent,note");
  for (const t of TOOL_BREAKDOWN) {
    lines.push(["by_tool", t.tool, t.leakRate, t.note].map(escape).join(","));
  }
  lines.push("");

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="teamprompt-prompt-data-leakage-q2-2026.csv"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
