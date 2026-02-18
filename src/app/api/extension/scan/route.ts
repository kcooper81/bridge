import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

export async function OPTIONS() { return handleOptions(); }

// POST /api/extension/scan — DLP scan before text is sent to AI tool
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const rl = await checkRateLimit(limiters.scan, user.id);
    if (!rl.success) return withCors(rl.response);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }));
    }

    const { content } = await request.json();
    if (!content || typeof content !== "string") {
      return withCors(NextResponse.json({ error: "Content is required" }, { status: 400 }));
    }

    // Fetch active security rules for the org
    const { data: rules } = await db
      .from("security_rules")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("is_active", true);

    const activeRules = rules || [];
    const violations: {
      ruleId: string;
      ruleName: string;
      category: string;
      severity: string;
      matchedText: string;
    }[] = [];

    for (const rule of activeRules) {
      const matched = matchPattern(content, rule.pattern, rule.pattern_type);
      if (matched) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          matchedText: redactMatch(matched),
        });

        // Log the violation
        await db.from("security_violations").insert({
          org_id: profile.org_id,
          rule_id: rule.id,
          matched_text: redactMatch(matched),
          user_id: user.id,
          action_taken: rule.severity === "block" ? "blocked" : "overridden",
        });
      }
    }

    const hasBlock = violations.some((v) => v.severity === "block");

    return withCors(NextResponse.json({
      passed: !hasBlock,
      violations,
      action: hasBlock ? "block" : violations.length > 0 ? "warn" : "allow",
    }));
  } catch (error) {
    console.error("Extension scan error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
  }
}

function matchPattern(content: string, pattern: string, patternType: string): string | null {
  switch (patternType) {
    case "exact": {
      const idx = content.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx !== -1) return content.slice(idx, idx + pattern.length);
      return null;
    }
    case "regex": {
      try {
        const regex = new RegExp(pattern, "gi");
        const match = regex.exec(content);
        if (match) return match[0];
      } catch {
        // Invalid regex — skip
      }
      return null;
    }
    case "glob": {
      const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
      try {
        const regex = new RegExp(escaped, "gi");
        const match = regex.exec(content);
        if (match) return match[0];
      } catch {
        // Skip
      }
      return null;
    }
    default:
      return null;
  }
}

function redactMatch(text: string): string {
  if (text.length <= 4) return "****";
  return text.slice(0, 2) + "*".repeat(Math.min(text.length - 4, 20)) + text.slice(-2);
}
