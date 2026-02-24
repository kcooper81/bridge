// TeamPrompt Extension — Security Status

import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { getSession } from "./auth";
import { apiFetch } from "./api";

export interface SecurityViolation {
  id: string;
  matchedText: string;
  actionTaken: "blocked" | "overridden";
  createdAt: string;
  ruleName: string;
  category: string;
  severity: string;
}

export interface SecurityStatus {
  protected: boolean;
  activeRuleCount: number;
  weeklyStats: {
    blocked: number;
    warned: number;
    total: number;
  };
  recentViolations: SecurityViolation[];
}

export async function fetchSecurityStatus(): Promise<SecurityStatus | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const res = await apiFetch(
      `${CONFIG.SITE_URL}${API_ENDPOINTS.securityStatus}`,
      {
        method: "GET",
        headers: apiHeaders(session.accessToken),
      }
    );

    if (!res.ok) return null;
    return res.data as SecurityStatus;
  } catch {
    return null;
  }
}

export async function enableDefaultRules(): Promise<{ installed: boolean; ruleCount: number } | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const res = await apiFetch(
      `${CONFIG.SITE_URL}${API_ENDPOINTS.enableShield}`,
      {
        method: "POST",
        headers: apiHeaders(session.accessToken),
      }
    );

    if (!res.ok) return null;
    return res.data as { installed: boolean; ruleCount: number };
  } catch {
    return null;
  }
}
