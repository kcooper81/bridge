import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { trackExtensionActivity } from "../track-activity";

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// GET /api/extension/security-status — Security overview for the Shield tab
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const extVersion = request.headers.get("x-extension-version");
    trackExtensionActivity(db, user.id, extVersion);

    const rl = await checkRateLimit(limiters.securityStatus, user.id);
    if (!rl.success) return withCors(rl.response, request);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role, shield_disabled")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    // Per-member shield disable — return early with disabled status
    if (profile.shield_disabled === true) {
      return withCors(NextResponse.json({
        protected: false,
        disabled: true,
        activeRuleCount: 0,
        weeklyStats: { blocked: 0, warned: 0, total: 0 },
        recentViolations: [],
      }), request);
    }

    const orgId = profile.org_id;

    // Fetch user's team memberships for team-scoped rule filtering
    const { data: teamRows } = await db
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);
    const userTeamIds = (teamRows || []).map((r) => r.team_id);

    const teamFilter = userTeamIds.length > 0
      ? `team_id.is.null,team_id.in.(${userTeamIds.join(",")})`
      : "team_id.is.null";

    // Fetch in parallel: active rules count, weekly violations, recent violations
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [rulesResult, termsResult, weeklyResult, recentResult] = await Promise.all([
      // Active security rules count (filtered by team scope)
      db
        .from("security_rules")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("is_active", true)
        .or(teamFilter),

      // Active sensitive terms count (filtered by team scope)
      db
        .from("sensitive_terms")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("is_active", true)
        .or(teamFilter),

      // Violations this week
      db
        .from("security_violations")
        .select("action_taken")
        .eq("org_id", orgId)
        .gte("created_at", weekAgo),

      // Last 5 violations
      db
        .from("security_violations")
        .select("id, matched_text, action_taken, created_at, rule_id, security_rules(name, category, severity)")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const activeRuleCount = (rulesResult.count ?? 0) + (termsResult.count ?? 0);

    const weeklyViolations = weeklyResult.data || [];
    const blockedCount = weeklyViolations.filter((v) => v.action_taken === "blocked").length;
    const warnedCount = weeklyViolations.filter((v) => v.action_taken !== "blocked").length;

    const recentViolations = (recentResult.data || []).map((v) => {
      // Supabase returns the joined row as an object (single FK), but TS may infer array
      const rule = v.security_rules as unknown as { name: string; category: string; severity: string } | null;
      return {
        id: v.id,
        matchedText: v.matched_text,
        actionTaken: v.action_taken,
        createdAt: v.created_at,
        ruleName: rule?.name || "Unknown rule",
        category: rule?.category || "unknown",
        severity: rule?.severity || "warn",
      };
    });

    return withCors(NextResponse.json({
      protected: activeRuleCount > 0,
      disabled: false,
      canManage: profile.role === "admin",
      activeRuleCount,
      weeklyStats: {
        blocked: blockedCount,
        warned: warnedCount,
        total: weeklyViolations.length,
      },
      recentViolations,
    }), request);
  } catch (error) {
    console.error("Extension security-status error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}
