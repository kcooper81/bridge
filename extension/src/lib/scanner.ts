// TeamPrompt Extension — DLP Scanner

import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { getSession } from "./auth";

export interface ScanResult {
  passed: boolean;
  violations: {
    ruleId: string;
    ruleName: string;
    category: string;
    severity: string;
    matchedText: string;
  }[];
  action: "allow" | "warn" | "block";
}

export async function scanOutbound(text: string): Promise<ScanResult | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const res = await fetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.scan}`, {
      method: "POST",
      headers: apiHeaders(session.accessToken),
      body: JSON.stringify({ content: text }),
    });

    if (!res.ok) return null;
    return (await res.json()) as ScanResult;
  } catch {
    return null;
  }
}
