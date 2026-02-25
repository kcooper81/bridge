// TeamPrompt Extension — Prompts Module

import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { getSession } from "./auth";
import { apiFetch } from "./api";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  tone: string;
  is_template: boolean;
  template_variables: string[];
  usage_count: number;
  folder_id: string | null;
  /** References a team. DB column retained. */
  department_id: string | null;
}

export async function fetchPrompts(opts?: {
  query?: string;
  templatesOnly?: boolean;
}): Promise<Prompt[]> {
  const session = await getSession();
  if (!session) return [];

  const params = new URLSearchParams();
  if (opts?.query) params.set("q", opts.query);
  if (opts?.templatesOnly) params.set("templates", "true");

  const res = await apiFetch(
    `${CONFIG.SITE_URL}${API_ENDPOINTS.prompts}?${params}`,
    { headers: apiHeaders(session.accessToken) }
  );

  if (res.status === 401) {
    // Don't auto-logout on 401 — it may be a transient error, CORS issue,
    // or token/origin mismatch.  Just return empty; the user can manually
    // sign out if needed.
    console.warn("[TP] fetchPrompts: 401 from API, returning empty");
    return [];
  }

  const data = res.data as { prompts?: Prompt[] };
  return data?.prompts || [];
}

export function fillTemplate(
  content: string,
  values: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
