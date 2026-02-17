import type { SecurityRule, SecuritySeverity } from "@/lib/types";

export interface ScanResult {
  passed: boolean;
  violations: ScanViolation[];
}

export interface ScanViolation {
  rule: SecurityRule;
  matchedText: string;
  severity: SecuritySeverity;
}
