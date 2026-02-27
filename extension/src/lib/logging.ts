// TeamPrompt Extension — Conversation Logging

import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { getSession } from "./auth";
import { detectAiTool } from "./ai-tools";
import { apiFetch } from "./api";

export async function logInteraction(
  text: string,
  action: "sent" | "blocked" | "warned" | "auto_redacted",
  violations: unknown[],
  opts?: { promptId?: string; method?: string }
): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const url = window.location.href;
  const aiTool = detectAiTool(url);

  try {
    await apiFetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.log}`, {
      method: "POST",
      headers: apiHeaders(session.accessToken),
      body: JSON.stringify({
        ai_tool: aiTool,
        prompt_text: text.slice(0, 2000),
        prompt_id: opts?.promptId || null,
        action,
        guardrail_flags: violations,
        metadata: { url, source: "content_script", method: opts?.method },
      }),
    });
  } catch {
    // Non-critical
  }
}
