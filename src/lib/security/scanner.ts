import type { SecurityRule } from "@/lib/types";
import type { ScanResult, ScanViolation, EntropyViolation } from "./types";
import { detectHighEntropyStrings } from "./entropy";

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(escaped, "gi");
}

function matchPattern(
  content: string,
  pattern: string,
  patternType: string
): string | null {
  switch (patternType) {
    case "exact": {
      const idx = content.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx !== -1) {
        const matched = content.slice(idx, idx + pattern.length);
        return redactMatch(matched);
      }
      return null;
    }
    case "regex": {
      try {
        const regex = new RegExp(pattern, "gi");
        const match = regex.exec(content);
        if (match) {
          return redactMatch(match[0]);
        }
      } catch {
        // Invalid regex — skip
      }
      return null;
    }
    case "glob": {
      const regex = globToRegex(pattern);
      const match = regex.exec(content);
      if (match) {
        return redactMatch(match[0]);
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

export interface ScanOptions {
  enableEntropyDetection?: boolean;
  entropyThreshold?: number;
  entropyMinLength?: number;
}

export function scanContent(
  content: string,
  rules: SecurityRule[],
  options?: ScanOptions
): ScanResult {
  const violations: ScanViolation[] = [];
  const entropyViolations: EntropyViolation[] = [];

  const activeRules = rules.filter((r) => r.is_active);

  // Pattern-based detection
  for (const rule of activeRules) {
    const matched = matchPattern(content, rule.pattern, rule.pattern_type);
    if (matched) {
      violations.push({
        rule,
        matchedText: matched,
        severity: rule.severity,
      });
    }
  }

  // Entropy-based detection (optional)
  if (options?.enableEntropyDetection) {
    const highEntropyStrings = detectHighEntropyStrings(content, {
      entropyThreshold: options.entropyThreshold ?? 4.0,
      minLength: options.entropyMinLength ?? 16,
    });

    for (const detected of highEntropyStrings) {
      entropyViolations.push({
        text: detected.text,
        redacted: detected.redacted,
        entropy: detected.entropy,
        severity: detected.entropy >= 4.5 ? "block" : "warn",
      });
    }
  }

  // Sort: blocks first, then warns
  violations.sort((a, b) => {
    if (a.severity === "block" && b.severity !== "block") return -1;
    if (a.severity !== "block" && b.severity === "block") return 1;
    return 0;
  });

  const hasBlock = violations.some((v) => v.severity === "block") ||
    entropyViolations.some((v) => v.severity === "block");

  return {
    passed: !hasBlock,
    violations,
    entropyViolations: entropyViolations.length > 0 ? entropyViolations : undefined,
  };
}

export function testPattern(
  testContent: string,
  pattern: string,
  patternType: string
): { matched: boolean; matchedText: string | null } {
  const result = matchPattern(testContent, pattern, patternType);
  return { matched: result !== null, matchedText: result };
}
