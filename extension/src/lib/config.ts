// TeamPrompt Extension — Configuration
// Uses WXT environment variables (import.meta.env.WXT_*)

export const CONFIG = {
  SITE_URL: import.meta.env.WXT_SITE_URL as string,
  SUPABASE_URL: import.meta.env.WXT_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.WXT_SUPABASE_ANON_KEY as string,
};

export const API_ENDPOINTS = {
  prompts: "/api/extension/prompts",
  folders: "/api/extension/folders",
  scan: "/api/extension/scan",
  log: "/api/extension/log",
  securityStatus: "/api/extension/security-status",
  enableShield: "/api/extension/enable-shield",
} as const;

export function getExtensionVersion(): string {
  return browser.runtime.getManifest().version;
}

/** Standard headers for all extension API requests */
export function apiHeaders(accessToken: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "X-Extension-Version": getExtensionVersion(),
  };
}
