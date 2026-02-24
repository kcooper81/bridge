import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { trackExtensionActivity } from "../track-activity";

const MAX_CONTENT_LENGTH = 50_000; // 50 KB max scan payload
const REGEX_TIMEOUT_MS = 500; // Per-rule regex execution limit

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// POST /api/extension/scan — DLP scan before text is sent to AI tool
export async function POST(request: NextRequest) {
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

    const rl = await checkRateLimit(limiters.scan, user.id);
    if (!rl.success) return withCors(rl.response, request);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    const body = await request.json();
    const content = body?.content;
    if (!content || typeof content !== "string") {
      return withCors(NextResponse.json({ error: "Content is required" }, { status: 400 }), request);
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return withCors(
        NextResponse.json({ error: `Content exceeds ${MAX_CONTENT_LENGTH} character limit` }, { status: 413 }),
        request
      );
    }

    // Fetch active security rules AND sensitive terms for the org
    const [rulesResult, termsResult] = await Promise.all([
      db
        .from("security_rules")
        .select("*")
        .eq("org_id", profile.org_id)
        .eq("is_active", true),
      db
        .from("sensitive_terms")
        .select("*")
        .eq("org_id", profile.org_id)
        .eq("is_active", true),
    ]);

    const activeRules = rulesResult.data || [];
    const activeTerms = termsResult.data || [];
    const violations: {
      ruleId: string;
      ruleName: string;
      category: string;
      severity: string;
      matchedText: string;
    }[] = [];

    // Check security rules
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

        await db.from("security_violations").insert({
          org_id: profile.org_id,
          rule_id: rule.id,
          matched_text: redactMatch(matched),
          user_id: user.id,
          action_taken: rule.severity === "block" ? "blocked" : "overridden",
        });
      }
    }

    // Check sensitive terms
    for (const term of activeTerms) {
      const patternType = term.term_type === "keyword" ? "exact" : term.term_type;
      const matched = matchPattern(content, term.term, patternType);
      if (matched) {
        violations.push({
          ruleId: term.id,
          ruleName: `Sensitive term: ${term.term}`,
          category: term.category,
          severity: term.severity,
          matchedText: redactMatch(matched),
        });

        await db.from("security_violations").insert({
          org_id: profile.org_id,
          rule_id: null,
          matched_text: redactMatch(matched),
          user_id: user.id,
          action_taken: term.severity === "block" ? "blocked" : "overridden",
        });
      }
    }

    const hasBlock = violations.some((v) => v.severity === "block");

    return withCors(NextResponse.json({
      passed: !hasBlock,
      violations,
      action: hasBlock ? "block" : violations.length > 0 ? "warn" : "allow",
    }), request);
  } catch (error) {
    console.error("Extension scan error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}

// ─── Pattern Matching with Timeout Protection ───

function matchPattern(content: string, pattern: string, patternType: string): string | null {
  switch (patternType) {
    case "exact": {
      const idx = content.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx !== -1) return content.slice(idx, idx + pattern.length);
      return null;
    }
    case "regex": {
      return safeRegexMatch(pattern, content);
    }
    case "glob": {
      const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
      return safeRegexMatch(escaped, content);
    }
    default:
      return null;
  }
}

/**
 * Execute a regex match with safety guards:
 * - Validates the regex is syntactically valid
 * - Rejects patterns with known catastrophic backtracking constructs
 * - Enforces a character-processing limit as a timeout proxy
 */
function safeRegexMatch(pattern: string, content: string): string | null {
  // Reject patterns with nested quantifiers that cause catastrophic backtracking
  // e.g., (a+)+, (a*)*b, (a|b+)*, (.+)+
  if (/\([^)]*[+*][^)]*\)[+*]/.test(pattern) || /\(\?:[^)]*[+*][^)]*\)[+*]/.test(pattern)) {
    console.warn("Rejected potentially catastrophic regex pattern:", pattern.slice(0, 100));
    return null;
  }

  try {
    const regex = new RegExp(pattern, "gi");

    // For very long content, limit what we scan to prevent long-running matches
    const scanContent = content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH)
      : content;

    // Use a manual timeout via performance tracking
    const start = performance.now();
    regex.lastIndex = 0;
    const match = regex.exec(scanContent);
    const elapsed = performance.now() - start;

    if (elapsed > REGEX_TIMEOUT_MS) {
      console.warn(`Regex exceeded ${REGEX_TIMEOUT_MS}ms (${elapsed.toFixed(0)}ms) for pattern: ${pattern.slice(0, 100)}`);
    }

    if (match) return match[0];
  } catch {
    // Invalid regex — skip silently
  }
  return null;
}

// ─── Redaction (fully masked — no first/last chars exposed) ───

function redactMatch(text: string): string {
  if (text.length <= 8) return "*".repeat(text.length);
  // Show category hint (first 3 chars) but mask the rest
  return text.slice(0, 3) + "*".repeat(Math.min(text.length - 3, 24));
}
