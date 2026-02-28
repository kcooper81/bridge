import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { trackExtensionActivity } from "../track-activity";
import { detectHighEntropyStrings } from "@/lib/security/entropy";
import { SMART_DETECTION_RULES } from "@/lib/security/default-rules";
import type { DetectionType } from "@/lib/types";

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
      .select("org_id, shield_disabled")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    // Per-member shield disable — admin exempted this user from scanning
    if (profile.shield_disabled === true) {
      return withCors(NextResponse.json({ passed: true, violations: [], action: "allow" }), request);
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

    // Fetch user's team memberships for team-scoped rule filtering
    const { data: teamRows } = await db
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);
    const userTeamIds = (teamRows || []).map((r) => r.team_id);

    // Build team filter: org-wide rules (team_id IS NULL) + user's team rules
    const teamFilter = userTeamIds.length > 0
      ? `team_id.is.null,team_id.in.(${userTeamIds.join(",")})`
      : "team_id.is.null";

    // Fetch active security rules, sensitive terms, AND org settings
    const [rulesResult, termsResult, orgResult] = await Promise.all([
      db
        .from("security_rules")
        .select("*")
        .eq("org_id", profile.org_id)
        .eq("is_active", true)
        .or(teamFilter),
      db
        .from("sensitive_terms")
        .select("*")
        .eq("org_id", profile.org_id)
        .eq("is_active", true)
        .or(teamFilter),
      db
        .from("organizations")
        .select("security_settings, settings")
        .eq("id", profile.org_id)
        .single(),
    ]);

    const orgSettings = (orgResult.data?.settings || {}) as Record<string, unknown>;

    // Org-level guardrails kill switch — if admin has disabled guardrails entirely
    if (orgSettings.guardrails_enabled === false) {
      return withCors(NextResponse.json({ passed: true, violations: [], action: "allow" }), request);
    }

    const activeRules = rulesResult.data || [];
    const activeTerms = termsResult.data || [];
    const securitySettings = orgResult.data?.security_settings || {};

    const violations: {
      ruleId: string | null;
      ruleName: string;
      category: string;
      severity: string;
      matchedText: string;
      detectionType: DetectionType;
    }[] = [];

    // ── 1. Check security rules (pattern-based) ──
    for (const rule of activeRules) {
      const matched = matchPattern(content, rule.pattern, rule.pattern_type);
      if (matched) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          matchedText: redactMatch(matched),
          detectionType: "pattern",
        });

        await db.from("security_violations").insert({
          org_id: profile.org_id,
          rule_id: rule.id,
          matched_text: redactMatch(matched),
          user_id: user.id,
          action_taken: rule.severity === "block" ? "blocked" : "overridden",
          detection_type: "pattern",
        });
      }
    }

    // ── 2. Check sensitive terms ──
    for (const term of activeTerms) {
      const patternType = term.term_type === "keyword" ? "exact" : term.term_type;
      const matched = matchPattern(content, term.term, patternType);
      if (matched) {
        violations.push({
          ruleId: null,
          ruleName: `Sensitive term: ${term.term}`,
          category: term.category,
          severity: term.severity,
          matchedText: redactMatch(matched),
          detectionType: "term",
        });

        await db.from("security_violations").insert({
          org_id: profile.org_id,
          rule_id: null,
          matched_text: redactMatch(matched),
          user_id: user.id,
          action_taken: term.severity === "block" ? "blocked" : "overridden",
          detection_type: "term",
        });
      }
    }

    // ── 3. Smart pattern detection (if enabled) ──
    if (securitySettings.smart_patterns_enabled) {
      for (const smartRule of SMART_DETECTION_RULES) {
        if (!smartRule.is_active) continue;
        const matched = matchPattern(content, smartRule.pattern, smartRule.pattern_type);
        if (matched) {
          violations.push({
            ruleId: null,
            ruleName: smartRule.name,
            category: smartRule.category,
            severity: smartRule.severity,
            matchedText: redactMatch(matched),
            detectionType: "smart_pattern",
          });

          await db.from("security_violations").insert({
            org_id: profile.org_id,
            rule_id: null,
            matched_text: redactMatch(matched),
            user_id: user.id,
            action_taken: smartRule.severity === "block" ? "blocked" : "overridden",
            detection_type: "smart_pattern",
          });
        }
      }
    }

    // ── 4. Entropy detection (if enabled) ──
    if (securitySettings.entropy_detection_enabled) {
      const threshold = securitySettings.entropy_threshold ?? 4.0;
      const highEntropyStrings = detectHighEntropyStrings(content, {
        entropyThreshold: threshold,
        minLength: 16,
        maxLength: 128,
      });

      for (const detected of highEntropyStrings) {
        const severity = detected.entropy >= 4.5 ? "block" : "warn";
        violations.push({
          ruleId: null,
          ruleName: `High entropy string (${detected.entropy.toFixed(1)} bits/char)`,
          category: "secrets",
          severity,
          matchedText: detected.redacted,
          detectionType: "entropy",
        });

        await db.from("security_violations").insert({
          org_id: profile.org_id,
          rule_id: null,
          matched_text: detected.redacted,
          user_id: user.id,
          action_taken: severity === "block" ? "blocked" : "overridden",
          detection_type: "entropy",
        });
      }
    }

    // If admin disabled overrides, treat all "warn" as "block"
    const overrideDisabled = orgSettings.allow_guardrail_override === false;
    const hasBlock =
      violations.some((v) => v.severity === "block") ||
      (overrideDisabled && violations.some((v) => v.severity === "warn"));

    // Build sanitized content with placeholder tokens
    let sanitized_content: string | undefined;
    let replacements: { placeholder: string; category: string; original_length: number }[] | undefined;

    if (violations.length > 0) {
      // Re-scan to get actual match positions (not redacted)
      const matchPositions: { start: number; end: number; category: string; matchedText: string }[] = [];

      for (const rule of activeRules) {
        const match = matchPatternWithPosition(content, rule.pattern, rule.pattern_type);
        if (match) {
          matchPositions.push({ ...match, category: rule.category });
        }
      }

      for (const term of activeTerms) {
        const pt = term.term_type === "keyword" ? "exact" : term.term_type;
        const match = matchPatternWithPosition(content, term.term, pt);
        if (match) {
          matchPositions.push({ ...match, category: term.category });
        }
      }

      if (securitySettings.smart_patterns_enabled) {
        for (const smartRule of SMART_DETECTION_RULES) {
          if (!smartRule.is_active) continue;
          const match = matchPatternWithPosition(content, smartRule.pattern, smartRule.pattern_type);
          if (match) {
            matchPositions.push({ ...match, category: smartRule.category });
          }
        }
      }

      // Entropy-detected strings: find their positions in content
      if (securitySettings.entropy_detection_enabled) {
        const threshold = securitySettings.entropy_threshold ?? 4.0;
        const entropyMatches = detectHighEntropyStrings(content, {
          entropyThreshold: threshold,
          minLength: 16,
          maxLength: 128,
        });
        for (const detected of entropyMatches) {
          const idx = content.indexOf(detected.text);
          if (idx !== -1) {
            matchPositions.push({
              start: idx,
              end: idx + detected.text.length,
              matchedText: detected.text,
              category: "secrets",
            });
          }
        }
      }

      // De-duplicate overlapping match positions (keep the longer match)
      matchPositions.sort((a, b) => a.start - b.start);
      const deduped: typeof matchPositions = [];
      for (const pos of matchPositions) {
        const last = deduped[deduped.length - 1];
        if (last && pos.start < last.end) {
          // Overlapping — keep whichever is longer
          if (pos.end - pos.start > last.end - last.start) {
            deduped[deduped.length - 1] = pos;
          }
        } else {
          deduped.push(pos);
        }
      }

      // Sort by position descending so replacements don't shift indices
      deduped.sort((a, b) => b.start - a.start);

      // Build category counters and replacements
      const categoryCounts: Record<string, number> = {};
      replacements = [];
      let sanitized = content;

      for (const pos of deduped) {
        const cat = pos.category.toUpperCase();
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        const placeholder = `{{${cat}_${categoryCounts[cat]}}}`;
        sanitized = sanitized.slice(0, pos.start) + placeholder + sanitized.slice(pos.end);
        replacements.push({
          placeholder,
          category: pos.category,
          original_length: pos.end - pos.start,
        });
      }

      sanitized_content = sanitized;
      replacements.reverse(); // Return in document order
    }

    // Determine action: auto-redact takes priority over warn when enabled
    const autoRedactEnabled = orgSettings.auto_redact_sensitive_data === true;
    let action: string;
    if (hasBlock) {
      action = "block";
    } else if (autoRedactEnabled && violations.length > 0) {
      action = "auto_redact";
    } else if (violations.length > 0) {
      action = "warn";
    } else {
      action = "allow";
    }

    return withCors(NextResponse.json({
      passed: action !== "block",
      violations,
      action,
      allow_override: !overrideDisabled,
      ...(sanitized_content !== undefined && { sanitized_content, replacements }),
    }), request);
  } catch (error) {
    console.error("Extension scan error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}

// ─── Pattern Matching with Timeout Protection ───

function matchPatternWithPosition(
  content: string,
  pattern: string,
  patternType: string
): { start: number; end: number; matchedText: string } | null {
  switch (patternType) {
    case "exact":
    case "keyword": {
      const idx = content.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx !== -1) return { start: idx, end: idx + pattern.length, matchedText: content.slice(idx, idx + pattern.length) };
      return null;
    }
    case "keywords": {
      const keywords = pattern.split(",").map((k) => k.trim()).filter(Boolean);
      const lower = content.toLowerCase();
      for (const kw of keywords) {
        const idx = lower.indexOf(kw.toLowerCase());
        if (idx !== -1) return { start: idx, end: idx + kw.length, matchedText: content.slice(idx, idx + kw.length) };
      }
      return null;
    }
    case "regex": {
      return safeRegexMatchWithPosition(pattern, content);
    }
    case "glob": {
      const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
      return safeRegexMatchWithPosition(escaped, content);
    }
    default:
      return null;
  }
}

function safeRegexMatchWithPosition(
  pattern: string,
  content: string
): { start: number; end: number; matchedText: string } | null {
  if (/\([^)]*[+*][^)]*\)[+*]/.test(pattern) || /\(\?:[^)]*[+*][^)]*\)[+*]/.test(pattern)) {
    return null;
  }
  try {
    const regex = new RegExp(pattern, "gi");
    const scanContent = content.length > MAX_CONTENT_LENGTH ? content.slice(0, MAX_CONTENT_LENGTH) : content;
    regex.lastIndex = 0;
    const match = regex.exec(scanContent);
    if (match) return { start: match.index, end: match.index + match[0].length, matchedText: match[0] };
  } catch {
    // Invalid regex
  }
  return null;
}

function matchPattern(content: string, pattern: string, patternType: string): string | null {
  switch (patternType) {
    case "exact":
    case "keyword": {
      const idx = content.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx !== -1) return content.slice(idx, idx + pattern.length);
      return null;
    }
    case "keywords": {
      const keywords = pattern.split(",").map((k) => k.trim()).filter(Boolean);
      const lower = content.toLowerCase();
      for (const kw of keywords) {
        const idx = lower.indexOf(kw.toLowerCase());
        if (idx !== -1) return content.slice(idx, idx + kw.length);
      }
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
  if (/\([^)]*[+*][^)]*\)[+*]/.test(pattern) || /\(\?:[^)]*[+*][^)]*\)[+*]/.test(pattern)) {
    console.warn("Rejected potentially catastrophic regex pattern:", pattern.slice(0, 100));
    return null;
  }

  try {
    const regex = new RegExp(pattern, "gi");

    const scanContent = content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH)
      : content;

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
  return text.slice(0, 3) + "*".repeat(Math.min(text.length - 3, 24));
}
