import type { SecurityRule, SecuritySeverity } from "@/lib/types";

export interface ScanResult {
  passed: boolean;
  violations: ScanViolation[];
  entropyViolations?: EntropyViolation[];
}

export interface ScanViolation {
  rule: SecurityRule;
  matchedText: string;
  severity: SecuritySeverity;
}

export interface EntropyViolation {
  text: string;
  redacted: string;
  entropy: number;
  severity: SecuritySeverity;
}
