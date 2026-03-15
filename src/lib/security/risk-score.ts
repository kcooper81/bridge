/**
 * Prompt Risk Scoring Engine
 *
 * Calculates a 0-100 risk score based on DLP scan violations.
 * Higher scores = more sensitive data detected.
 *
 * Scoring factors:
 * - Number and severity of violations
 * - Detection type (pattern vs entropy vs smart)
 * - Category of data detected (secrets > PII > internal)
 *
 * Score ranges:
 *   0-15   Low       — harmless, no sensitive data
 *  16-39   Moderate  — minor flags, worth monitoring
 *  40-69   High      — contains internal/sensitive data
 *  70-89   Critical  — PII, credentials, or financial data
 *  90-100  Severe    — API keys, private keys, or multiple critical matches
 */

interface Violation {
  severity: "block" | "warn";
  category: string;
  detectionType: string;
}

/** Category weights — higher = more risk */
const CATEGORY_WEIGHTS: Record<string, number> = {
  secrets: 30,
  credentials: 28,
  pii: 25,
  financial: 22,
  medical: 22,
  legal: 20,
  compliance: 18,
  internal: 15,
  general: 10,
};

/** Detection type multipliers */
const DETECTION_MULTIPLIERS: Record<string, number> = {
  pattern: 1.0,
  term: 0.8,
  smart_pattern: 0.9,
  entropy: 1.1,
};

export function calculateRiskScore(violations: Violation[]): number {
  if (violations.length === 0) return 0;

  let score = 0;

  for (const v of violations) {
    // Base score from category — match the longest key for specificity
    const cat = v.category.toLowerCase();
    let categoryScore = CATEGORY_WEIGHTS.general;
    let bestLen = 0;
    for (const [k, w] of Object.entries(CATEGORY_WEIGHTS)) {
      if (cat.includes(k) && k.length > bestLen) {
        categoryScore = w;
        bestLen = k.length;
      }
    }

    // Severity multiplier
    const severityMult = v.severity === "block" ? 1.5 : 1.0;

    // Detection type multiplier
    const detectionMult = DETECTION_MULTIPLIERS[v.detectionType] || 1.0;

    score += categoryScore * severityMult * detectionMult;
  }

  // Diminishing returns for many violations (log scale after first 3)
  if (violations.length > 3) {
    const base = score * (3 / violations.length);
    const extra = (score - base) * 0.5;
    score = base + extra;
  }

  // Clamp to 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
}

export type RiskLevel = "low" | "moderate" | "high" | "critical" | "severe";

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 15) return "low";
  if (score <= 39) return "moderate";
  if (score <= 69) return "high";
  if (score <= 89) return "critical";
  return "severe";
}

export function getRiskColor(score: number): string {
  if (score <= 15) return "text-green-600";
  if (score <= 39) return "text-yellow-600";
  if (score <= 69) return "text-orange-600";
  if (score <= 89) return "text-red-600";
  return "text-red-800";
}

export function getRiskBgColor(score: number): string {
  if (score <= 15) return "bg-green-50 text-green-700";
  if (score <= 39) return "bg-yellow-50 text-yellow-700";
  if (score <= 69) return "bg-orange-50 text-orange-700";
  if (score <= 89) return "bg-red-50 text-red-700";
  return "bg-red-100 text-red-800";
}
