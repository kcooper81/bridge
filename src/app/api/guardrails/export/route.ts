import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { exportRulesForFirewall, type DlpRuleForExport } from "@/lib/cloudflare-enterprise";

/**
 * GET /api/guardrails/export?format=json|csv|regex-list|suricata
 *
 * Export DLP rules for use with external firewalls, proxies, or CASB tools.
 * Available to admins and managers.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });
  if (profile.role !== "admin" && profile.role !== "manager") {
    return NextResponse.json({ error: "Admin or manager access required" }, { status: 403 });
  }

  // Fetch all active rules
  const { data: rules } = await db
    .from("security_rules")
    .select("name, description, pattern, pattern_type, category, severity")
    .eq("org_id", profile.org_id)
    .eq("is_active", true);

  if (!rules || rules.length === 0) {
    return NextResponse.json({ error: "No active rules to export" }, { status: 404 });
  }

  const format = (req.nextUrl.searchParams.get("format") || "json") as "json" | "csv" | "regex-list" | "suricata";
  const exported = exportRulesForFirewall(rules as DlpRuleForExport[], format);

  const contentTypes: Record<string, string> = {
    json: "application/json",
    csv: "text/csv",
    "regex-list": "text/plain",
    suricata: "text/plain",
  };

  const extensions: Record<string, string> = {
    json: "json",
    csv: "csv",
    "regex-list": "txt",
    suricata: "rules",
  };

  return new NextResponse(exported, {
    headers: {
      "Content-Type": contentTypes[format] || "text/plain",
      "Content-Disposition": `attachment; filename="teamprompt-dlp-rules.${extensions[format] || "txt"}"`,
    },
  });
}
