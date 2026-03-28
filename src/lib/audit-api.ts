import { createClient } from "@/lib/supabase/client";
import { COMPLIANCE_TEMPLATES } from "@/lib/security/compliance-templates";
import { AI_TOOL_DOMAINS } from "@/lib/cloudflare-gateway";

function supabase() {
  return createClient();
}

async function getOrgId(): Promise<string | null> {
  const db = supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  return data?.org_id || null;
}

// ── Types ──

export interface AuditData {
  // Hero stats
  totalInteractions: number;
  totalViolationsBlocked: number;
  totalViolationsWarned: number;
  complianceScore: number;
  activePolicies: number;

  // Sankey: teams → AI tools
  sankeyNodes: { id: string; name: string; type: "source" | "target"; color?: string }[];
  sankeyLinks: { source: string; target: string; value: number }[];

  // Heatmap: 7×24 matrix of violation counts
  violationHeatmap: number[][];

  // Violation trend: daily counts
  violationTrend: { date: string; blocked: number; warned: number }[];

  // Category breakdown for donut
  violationsByCategory: { name: string; value: number; color: string }[];

  // Risk score distribution
  riskDistribution: { bucket: string; count: number }[];

  // Policy coverage
  policyCoverage: { framework: string; name: string; totalRules: number; installedRules: number; enabled: boolean }[];

  // Top triggered rules
  topTriggeredRules: { name: string; count: number; severity: string; category: string }[];

  // Tool policy
  toolPolicy: {
    enabled: boolean;
    approvedCount: number;
    blockedCount: number;
    cloudflareConnected: boolean;
  };

  // Usage overview (migrated from analytics)
  dailyUsage: { date: string; count: number }[];
  topPrompts: { title: string; usageCount: number }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  pii: "#ef4444",
  credentials: "#f59e0b",
  api_keys: "#f97316",
  secrets: "#8b5cf6",
  health: "#ec4899",
  financial: "#10b981",
  internal_terms: "#3b82f6",
  internal: "#6366f1",
  custom: "#06b6d4",
  other: "#6b7280",
};

// ── Main Query ──

export async function getAuditData(): Promise<AuditData | null> {
  const orgId = await getOrgId();
  if (!orgId) return null;

  const db = supabase();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  // Parallel queries — each wrapped in try/catch for tables that may not exist
  type QResult = { data: unknown[] | null; error: unknown };
  const safe = (p: Promise<{ data: unknown; error: unknown }>): Promise<QResult> =>
    p.then((r) => r as QResult).catch(() => ({ data: null, error: true }));

  const [
    violationsRes,
    logsRes,
    rulesRes,
    teamsRes,
    teamMembersRes,
    promptsRes,
    eventsRes,
  ] = await Promise.all([
    safe(
      db
        .from("security_violations")
        .select("id, action_taken, created_at, user_id, rule_id, detection_type")
        .eq("org_id", orgId)
        .gte("created_at", ninetyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(5000)
    ),
    safe(
      db
        .from("conversation_logs")
        .select("id, ai_tool, user_id, action, risk_score, created_at")
        .eq("org_id", orgId)
        .gte("created_at", ninetyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(5000)
    ),
    safe(
      db
        .from("security_rules")
        .select("id, name, severity, category, is_active, source_pack")
        .eq("org_id", orgId)
    ),
    safe(
      db
        .from("teams")
        .select("id, name")
        .eq("org_id", orgId)
    ),
    safe(
      db
        .from("team_members")
        .select("user_id, team_id")
    ),
    safe(
      db
        .from("prompts")
        .select("title, usage_count")
        .eq("org_id", orgId)
        .order("usage_count", { ascending: false })
        .limit(10)
    ),
    safe(
      db
        .from("usage_events")
        .select("created_at")
        .eq("org_id", orgId)
        .gte("created_at", ninetyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(5000)
    ),
  ]);

  const violations = (violationsRes.data as { id: string; action_taken: string; created_at: string; user_id: string; rule_id: string | null; detection_type?: string }[]) || [];
  const logs = (logsRes.data as { id: string; ai_tool: string; user_id: string; action: string; risk_score: number; created_at: string }[]) || [];
  const rules = (rulesRes.data as { id: string; name: string; severity: string; category: string; is_active: boolean; source_pack: string | null }[]) || [];
  const teams = (teamsRes.data as { id: string; name: string }[]) || [];
  const allTeamMembers = (teamMembersRes.data as { user_id: string; team_id: string }[]) || [];
  // Filter to only this org's teams to prevent cross-org data leakage
  const orgTeamIds = new Set(teams.map((t) => t.id));
  const teamMembers = allTeamMembers.filter((m) => orgTeamIds.has(m.team_id));
  const prompts = (promptsRes.data as { title: string; usage_count: number }[]) || [];
  const events = (eventsRes.data as { created_at: string }[]) || [];

  // ── Hero stats ──
  const totalInteractions = logs.length;
  const totalViolationsBlocked = violations.filter((v) => v.action_taken === "blocked").length;
  const totalViolationsWarned = violations.filter((v) => v.action_taken !== "blocked").length;
  const complianceScore = totalInteractions > 0
    ? Math.round((1 - totalViolationsBlocked / totalInteractions) * 100)
    : 100;
  const activePolicies = rules.filter((r) => r.is_active).length;

  // ── Build user→team mapping ──
  const userTeamMap = new Map<string, string>();
  for (const m of teamMembers) {
    userTeamMap.set(m.user_id, m.team_id);
  }
  const teamNameMap = new Map<string, string>(teams.map((t) => [t.id, t.name]));

  // ── Sankey: teams → AI tools ──
  const sankeyFlows: Record<string, Record<string, number>> = {};
  const toolSet = new Set<string>();
  const teamSet = new Set<string>();

  for (const log of logs) {
    const teamId = userTeamMap.get(log.user_id) || "__unassigned";
    const tool = log.ai_tool || "Other";
    toolSet.add(tool);
    teamSet.add(teamId);
    if (!sankeyFlows[teamId]) sankeyFlows[teamId] = {};
    sankeyFlows[teamId][tool] = (sankeyFlows[teamId][tool] || 0) + 1;
  }

  const sankeyNodes = [
    ...Array.from(teamSet).map((id) => ({
      id: `team-${id}`,
      name: id === "__unassigned" ? "Unassigned" : teamNameMap.get(id) || "Unknown",
      type: "source" as const,
    })),
    ...Array.from(toolSet).map((tool) => ({
      id: `tool-${tool}`,
      name: tool,
      type: "target" as const,
    })),
  ];

  const sankeyLinks = Object.entries(sankeyFlows).flatMap(([teamId, tools]) =>
    Object.entries(tools).map(([tool, value]) => ({
      source: `team-${teamId}`,
      target: `tool-${tool}`,
      value,
    }))
  );

  // ── Heatmap: 7×24 matrix ──
  const violationHeatmap: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  );
  for (const v of violations) {
    const d = new Date(v.created_at);
    violationHeatmap[d.getDay()][d.getHours()]++;
  }

  // ── Violation trend: daily for 90 days ──
  const trendMap: Record<string, { blocked: number; warned: number }> = {};
  for (let i = 0; i < 90; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    trendMap[d.toISOString().split("T")[0]] = { blocked: 0, warned: 0 };
  }
  for (const v of violations) {
    const day = new Date(v.created_at).toISOString().split("T")[0];
    if (trendMap[day]) {
      if (v.action_taken === "blocked") trendMap[day].blocked++;
      else trendMap[day].warned++;
    }
  }
  const violationTrend = Object.entries(trendMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Violations by category (donut) ──
  const ruleMap = new Map(rules.map((r) => [r.id, r]));
  const catCounts: Record<string, number> = {};
  for (const v of violations) {
    const rule = v.rule_id ? ruleMap.get(v.rule_id) : null;
    const cat = rule?.category || "other";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }
  const violationsByCategory = Object.entries(catCounts)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.other,
    }))
    .sort((a, b) => b.value - a.value);

  // ── Risk distribution (histogram) ──
  const riskBuckets: Record<string, number> = {
    "0-20": 0,
    "20-40": 0,
    "40-60": 0,
    "60-80": 0,
    "80-100": 0,
  };
  for (const log of logs) {
    const score = log.risk_score || 0;
    if (score < 20) riskBuckets["0-20"]++;
    else if (score < 40) riskBuckets["20-40"]++;
    else if (score < 60) riskBuckets["40-60"]++;
    else if (score < 80) riskBuckets["60-80"]++;
    else riskBuckets["80-100"]++;
  }
  const riskDistribution = Object.entries(riskBuckets).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  // ── Policy coverage ──
  const installedPacks = new Set(rules.filter((r) => r.source_pack).map((r) => r.source_pack!));
  const policyCoverage = COMPLIANCE_TEMPLATES.map((tmpl) => {
    const installed = installedPacks.has(tmpl.id);
    const installedRules = rules.filter((r) => r.source_pack === tmpl.id).length;
    return {
      framework: tmpl.framework,
      name: tmpl.name,
      totalRules: tmpl.rules.length,
      installedRules,
      enabled: installed,
    };
  });

  // ── Top triggered rules ──
  const ruleIdCounts: Record<string, number> = {};
  for (const v of violations) {
    if (v.rule_id) ruleIdCounts[v.rule_id] = (ruleIdCounts[v.rule_id] || 0) + 1;
  }
  const topTriggeredRules = Object.entries(ruleIdCounts)
    .map(([ruleId, count]) => {
      const rule = ruleMap.get(ruleId);
      return {
        name: rule?.name || "Unknown Rule",
        count,
        severity: rule?.severity || "warn",
        category: rule?.category || "other",
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Daily usage (migrated from analytics) ──
  const usageMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    usageMap[d.toISOString().split("T")[0]] = 0;
  }
  for (const e of events) {
    const day = new Date(e.created_at).toISOString().split("T")[0];
    if (usageMap[day] !== undefined) usageMap[day]++;
  }
  const dailyUsage = Object.entries(usageMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const topPrompts = prompts.map((p) => ({
    title: p.title,
    usageCount: p.usage_count || 0,
  }));

  // Tool policy data (from same org settings)
  const { data: orgForPolicy } = await db
    .from("organizations")
    .select("settings")
    .eq("id", orgId)
    .single();
  const orgSettings = (orgForPolicy?.settings || {}) as Record<string, unknown>;
  const approvedAiTools = (orgSettings.approved_ai_tools as string[]) || ["chatgpt", "claude", "gemini", "copilot", "perplexity"];
  const toolPolicyEnabled = orgSettings.allow_external_ai_tools === false;
  const cfConnected = !!(orgSettings.cloudflare_account_id && orgSettings.cloudflare_api_token);

  return {
    totalInteractions,
    totalViolationsBlocked,
    totalViolationsWarned,
    complianceScore,
    activePolicies,
    sankeyNodes,
    sankeyLinks,
    violationHeatmap,
    violationTrend,
    violationsByCategory,
    riskDistribution,
    policyCoverage,
    topTriggeredRules,
    dailyUsage,
    topPrompts,
    toolPolicy: {
      enabled: toolPolicyEnabled,
      approvedCount: approvedAiTools.length,
      blockedCount: AI_TOOL_DOMAINS.length - approvedAiTools.length,
      cloudflareConnected: cfConnected,
    },
  };
}
