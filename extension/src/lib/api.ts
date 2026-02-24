// TeamPrompt Extension — API Proxy
// Routes all API calls through the background service worker to avoid CORS
// issues when content scripts run on AI tool pages (chatgpt.com, claude.ai, etc.)

export async function apiFetch(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  return browser.runtime.sendMessage({
    type: "API_FETCH",
    url,
    method: init.method || "GET",
    headers: init.headers || {},
    body: init.body,
  });
}
