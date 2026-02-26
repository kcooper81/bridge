// TeamPrompt Extension — Prompts Module

import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { getSession } from "./auth";
import { apiFetch } from "./api";

// Duplicated for bundle independence (matches web app's VariableConfig)
export interface VariableConfig {
  name: string;
  label?: string | null;
  description?: string | null;
  defaultValue?: string | null;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  tone: string;
  is_template: boolean;
  template_variables: (string | VariableConfig)[];
  usage_count: number;
  folder_id: string | null;
  /** References a team. DB column retained. */
  department_id: string | null;
  is_favorite: boolean;
  last_used_at: string | null;
}

export interface ExtFolder {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  prompt_count: number;
}

/**
 * Normalize template_variables from DB (handles both old string[] and new VariableConfig[]).
 */
export function normalizeVariables(raw: unknown): VariableConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { name: item };
    if (typeof item === "object" && item !== null && "name" in item)
      return item as VariableConfig;
    return { name: String(item) };
  });
}

/**
 * Convert snake_case to Title Case.
 */
export function snakeToTitleCase(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Return display label for a variable config.
 */
export function getDisplayLabel(v: VariableConfig): string {
  return v.label?.trim() || snakeToTitleCase(v.name);
}

export async function fetchPrompts(opts?: {
  query?: string;
  templatesOnly?: boolean;
  sort?: "recent";
  favorites?: boolean;
  folderId?: string;
  tags?: string[];
  limit?: number;
}): Promise<Prompt[]> {
  const session = await getSession();
  if (!session) return [];

  const params = new URLSearchParams();
  if (opts?.query) params.set("q", opts.query);
  if (opts?.templatesOnly) params.set("templates", "true");
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.favorites) params.set("favorites", "true");
  if (opts?.folderId) params.set("folderId", opts.folderId);
  if (opts?.tags?.length) params.set("tags", opts.tags.join(","));
  if (opts?.limit) params.set("limit", String(opts.limit));

  const res = await apiFetch(
    `${CONFIG.SITE_URL}${API_ENDPOINTS.prompts}?${params}`,
    { headers: apiHeaders(session.accessToken) }
  );

  if (res.status === 401) {
    // 401 — token expired or invalid
    throw new Error("SESSION_EXPIRED");
  }

  if (!res.ok) {
    // Non-ok response from API
    throw new Error("FETCH_FAILED");
  }

  const data = res.data as { prompts?: Prompt[] };
  return data?.prompts || [];
}

export async function fetchFolders(): Promise<{ folders: ExtFolder[]; unfiled_count: number; tags: string[] }> {
  const session = await getSession();
  if (!session) return { folders: [], unfiled_count: 0, tags: [] };

  const res = await apiFetch(
    `${CONFIG.SITE_URL}${API_ENDPOINTS.folders}`,
    { headers: apiHeaders(session.accessToken) }
  );

  if (res.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  if (!res.ok) {
    throw new Error("FETCH_FAILED");
  }

  const data = res.data as { folders?: ExtFolder[]; unfiled_count?: number; tags?: string[] };
  return { folders: data?.folders || [], unfiled_count: data?.unfiled_count || 0, tags: data?.tags || [] };
}

export async function toggleFavorite(promptId: string): Promise<boolean | null> {
  const session = await getSession();
  if (!session) return null;

  const res = await apiFetch(
    `${CONFIG.SITE_URL}${API_ENDPOINTS.prompts}/${promptId}/favorite`,
    {
      method: "PATCH",
      headers: apiHeaders(session.accessToken),
    }
  );

  if (res.status === 401) throw new Error("SESSION_EXPIRED");
  if (!res.ok) return null;

  const data = res.data as { is_favorite?: boolean };
  return data?.is_favorite ?? null;
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
