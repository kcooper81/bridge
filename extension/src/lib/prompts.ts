// TeamPrompt Extension — Prompts Module

import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { getSession, logout } from "./auth";

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

  const res = await fetch(
    `${CONFIG.SITE_URL}${API_ENDPOINTS.prompts}?${params}`,
    { headers: apiHeaders(session.accessToken) }
  );

  if (res.status === 401) {
    await logout();
    return [];
  }

  const data = await res.json();
  return data.prompts || [];
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
