// TeamPrompt Extension — DLP Scanner

import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { getSession } from "./auth";
import { apiFetch } from "./api";

export type DetectionType = "pattern" | "term" | "smart_pattern" | "entropy" | "ai";

export interface ScanResult {
  passed: boolean;
  violations: {
    ruleId: string | null;
    ruleName: string;
    category: string;
    severity: string;
    matchedText: string;
    detectionType: DetectionType;
  }[];
  action: "allow" | "warn" | "block" | "auto_redact";
  risk_score: number;
  allow_override?: boolean;
  sanitized_content?: string;
  replacements?: {
    placeholder: string;
    category: string;
    original_length: number;
  }[];
}

export type ScanErrorReason = "no-session" | "permission-denied" | "api-error" | "network-error";

export interface ScanFailure {
  error: true;
  reason: ScanErrorReason;
}

export async function scanOutbound(text: string): Promise<ScanResult | ScanFailure> {
  const session = await getSession();
  if (!session) return { error: true, reason: "no-session" };

  try {
    const res = await apiFetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.scan}`, {
      method: "POST",
      headers: apiHeaders(session.accessToken),
      body: JSON.stringify({ content: text }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: true, reason: "permission-denied" };
      }
      return { error: true, reason: "api-error" };
    }
    return res.data as ScanResult;
  } catch {
    return { error: true, reason: "network-error" };
  }
}

/** Type guard to check if a scan result is an error */
export function isScanError(result: ScanResult | ScanFailure): result is ScanFailure {
  return "error" in result && result.error === true;
}
