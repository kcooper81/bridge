import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/chat/admin-data — fetch real DB data for admin slash commands.
 * Returns formatted context string that gets injected as a system message.
 */
export async function POST(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id || !["admin", "manager"].includes(profile.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { command } = await request.json();
  const orgId = profile.org_id;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let context = "";

  switch (command) {
    case "/activity": {
      // Get conversation logs from the past week
      const [logsResult, convResult, membersResult] = await Promise.all([
        db.from("conversation_logs")
          .select("user_id, ai_tool, action, metadata, created_at")
          .eq("org_id", orgId)
          .gte("created_at", weekAgo)
          .order("created_at", { ascending: false })
          .limit(500),
        db.from("chat_conversations")
          .select("id, user_id, model, provider, created_at")
          .eq("org_id", orgId)
          .gte("created_at", weekAgo),
        db.from("profiles")
          .select("id, name, email")
          .eq("org_id", orgId),
      ]);

      const logs = logsResult.data || [];
      const convs = convResult.data || [];
      const memberMap = new Map((membersResult.data || []).map(m => [m.id, m.name || m.email]));

      // Aggregate stats
      const totalLogs = logs.length;
      const totalConvs = convs.length;
      const toolCounts: Record<string, number> = {};
      const userCounts: Record<string, number> = {};
      const actionCounts: Record<string, number> = {};
      let totalTokens = 0;

      for (const log of logs) {
        toolCounts[log.ai_tool] = (toolCounts[log.ai_tool] || 0) + 1;
        const userName = memberMap.get(log.user_id) || log.user_id;
        userCounts[userName] = (userCounts[userName] || 0) + 1;
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        if (log.metadata?.tokens) totalTokens += log.metadata.tokens;
      }

      const modelCounts: Record<string, number> = {};
      for (const conv of convs) {
        const key = `${conv.provider}/${conv.model}`;
        modelCounts[key] = (modelCounts[key] || 0) + 1;
      }

      const topUsers = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => `  - ${name}: ${count} interactions`)
        .join("\n");

      const toolBreakdown = Object.entries(toolCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tool, count]) => `  - ${tool}: ${count}`)
        .join("\n");

      const modelBreakdown = Object.entries(modelCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([model, count]) => `  - ${model}: ${count} conversations`)
        .join("\n");

      context = `## Team AI Activity — Past 7 Days (Real Data)

### Summary
- Total AI interactions logged: ${totalLogs}
- New chat conversations: ${totalConvs}
- Total tokens used: ${totalTokens.toLocaleString()}
- Actions: ${Object.entries(actionCounts).map(([a, c]) => `${a}: ${c}`).join(", ")}

### Most Active Users
${topUsers || "  No activity"}

### AI Tools Used
${toolBreakdown || "  No data"}

### Models Used (Chat)
${modelBreakdown || "  No data"}

### Daily Breakdown
${(() => {
  const daily: Record<string, number> = {};
  for (const log of logs) {
    const day = log.created_at.slice(0, 10);
    daily[day] = (daily[day] || 0) + 1;
  }
  return Object.entries(daily)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, count]) => `  - ${day}: ${count} interactions`)
    .join("\n") || "  No data";
})()}`;
      break;
    }

    case "/violations": {
      const [violationsResult, rulesResult, membersResult] = await Promise.all([
        db.from("security_violations")
          .select("id, rule_id, matched_text, user_id, action_taken, detection_type, created_at")
          .eq("org_id", orgId)
          .gte("created_at", weekAgo)
          .order("created_at", { ascending: false })
          .limit(200),
        db.from("security_rules")
          .select("id, name, category, severity")
          .eq("org_id", orgId),
        db.from("profiles")
          .select("id, name, email")
          .eq("org_id", orgId),
      ]);

      const violations = violationsResult.data || [];
      const ruleMap = new Map((rulesResult.data || []).map(r => [r.id, r]));
      const memberMap = new Map((membersResult.data || []).map(m => [m.id, m.name || m.email]));

      const categoryCounts: Record<string, number> = {};
      const severityCounts: Record<string, number> = {};
      const userViolations: Record<string, number> = {};
      const ruleCounts: Record<string, number> = {};

      for (const v of violations) {
        const rule = ruleMap.get(v.rule_id);
        const category = rule?.category || "unknown";
        const severity = rule?.severity || "unknown";
        const ruleName = rule?.name || v.rule_id;
        const userName = memberMap.get(v.user_id) || v.user_id;

        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
        userViolations[userName] = (userViolations[userName] || 0) + 1;
        ruleCounts[ruleName] = (ruleCounts[ruleName] || 0) + 1;
      }

      const topRules = Object.entries(ruleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => `  - ${name}: ${count} triggers`)
        .join("\n");

      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, count]) => `  - ${cat}: ${count}`)
        .join("\n");

      const repeatOffenders = Object.entries(userViolations)
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => `  - ${name}: ${count} violations`)
        .join("\n");

      context = `## DLP Violations Report — Past 7 Days (Real Data)

### Summary
- Total violations: ${violations.length}
- Severity breakdown: ${Object.entries(severityCounts).map(([s, c]) => `${s}: ${c}`).join(", ") || "none"}
- Action types: ${violations.reduce((acc, v) => { acc[v.action_taken] = (acc[v.action_taken] || 0) + 1; return acc; }, {} as Record<string, number>).blocked || 0} blocked, ${violations.reduce((acc, v) => { acc[v.action_taken] = (acc[v.action_taken] || 0) + 1; return acc; }, {} as Record<string, number>).overridden || 0} overridden

### Categories Detected
${topCategories || "  No violations"}

### Most Triggered Rules
${topRules || "  No data"}

### Repeat Offenders (2+ violations)
${repeatOffenders || "  None"}

### Recent Violations (Last 10)
${violations.slice(0, 10).map(v => {
  const rule = ruleMap.get(v.rule_id);
  const user = memberMap.get(v.user_id) || "unknown";
  return `  - ${v.created_at.slice(0, 16)} | ${user} | ${rule?.name || "unknown rule"} (${rule?.category || "?"}) | ${v.action_taken}`;
}).join("\n") || "  No recent violations"}`;
      break;
    }

    case "/usage": {
      const [promptsResult, logsResult, membersResult] = await Promise.all([
        db.from("prompts")
          .select("id, title, usage_count, status, created_by, created_at")
          .eq("org_id", orgId)
          .order("usage_count", { ascending: false })
          .limit(100),
        db.from("conversation_logs")
          .select("user_id, prompt_id, ai_tool, created_at")
          .eq("org_id", orgId)
          .gte("created_at", monthAgo)
          .limit(1000),
        db.from("profiles")
          .select("id, name, email")
          .eq("org_id", orgId),
      ]);

      const prompts = promptsResult.data || [];
      const logs = logsResult.data || [];
      const memberMap = new Map((membersResult.data || []).map(m => [m.id, m.name || m.email]));

      const topPrompts = prompts
        .filter(p => p.status === "approved")
        .slice(0, 15)
        .map(p => `  - "${p.title}" — ${p.usage_count} uses`)
        .join("\n");

      const unusedPrompts = prompts
        .filter(p => p.status === "approved" && p.usage_count === 0)
        .map(p => `  - "${p.title}" (created by ${memberMap.get(p.created_by) || "unknown"})`)
        .join("\n");

      // User adoption stats
      const uniqueUsers = new Set(logs.map(l => l.user_id));
      const totalMembers = (membersResult.data || []).length;

      // Weekly trend
      const weeklyActivity: Record<string, Set<string>> = {};
      for (const log of logs) {
        const week = getWeekLabel(log.created_at);
        if (!weeklyActivity[week]) weeklyActivity[week] = new Set();
        weeklyActivity[week].add(log.user_id);
      }

      const weeklyTrend = Object.entries(weeklyActivity)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 4)
        .map(([week, users]) => `  - ${week}: ${users.size} active users`)
        .join("\n");

      context = `## Prompt & AI Usage Analytics — Past 30 Days (Real Data)

### Adoption
- Active AI users (30d): ${uniqueUsers.size} / ${totalMembers} team members (${totalMembers > 0 ? Math.round(uniqueUsers.size / totalMembers * 100) : 0}%)
- Total prompt library entries: ${prompts.length} (${prompts.filter(p => p.status === "approved").length} approved)

### Most Popular Prompts
${topPrompts || "  No prompts used yet"}

### Unused Approved Prompts
${unusedPrompts || "  All prompts have been used"}

### Weekly Active Users Trend
${weeklyTrend || "  No data"}

### AI Tool Distribution (30d)
${(() => {
  const toolCounts: Record<string, number> = {};
  for (const log of logs) {
    toolCounts[log.ai_tool] = (toolCounts[log.ai_tool] || 0) + 1;
  }
  return Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => `  - ${tool}: ${count} interactions`)
    .join("\n") || "  No data";
})()}`;
      break;
    }

    case "/audit": {
      // Get recent audit trail
      const [logsResult, membersResult] = await Promise.all([
        db.from("conversation_logs")
          .select("user_id, ai_tool, action, prompt_text, metadata, created_at")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false })
          .limit(100),
        db.from("profiles")
          .select("id, name, email")
          .eq("org_id", orgId),
      ]);

      const logs = logsResult.data || [];
      const memberMap = new Map((membersResult.data || []).map(m => [m.id, m.name || m.email]));

      const recentLogs = logs.slice(0, 50).map(log => {
        const user = memberMap.get(log.user_id) || "unknown";
        const model = log.metadata?.model || "?";
        const tokens = log.metadata?.tokens || 0;
        return `  - ${log.created_at.slice(0, 16)} | ${user} | ${log.ai_tool} | ${log.action} | model: ${model} | tokens: ${tokens}`;
      }).join("\n");

      context = `## Audit Trail — Recent Events (Real Data)

### Summary
- Total logged events: ${logs.length} (showing last 50)
- Unique users: ${new Set(logs.map(l => l.user_id)).size}
- Time range: ${logs.length > 0 ? `${logs[logs.length - 1].created_at.slice(0, 10)} to ${logs[0].created_at.slice(0, 10)}` : "no data"}

### Recent Events
${recentLogs || "  No audit events found"}

You now have the full audit trail. The user can ask follow-up questions to filter by user, time period, action type, or search for specific events.`;
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown command" }, { status: 400 });
  }

  return NextResponse.json({ context });
}

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}
