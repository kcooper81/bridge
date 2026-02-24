// TeamPrompt Extension — API Proxy
// Routes all API calls through the background service worker to avoid CORS
// issues when content scripts run on AI tool pages (chatgpt.com, claude.ai, etc.)

const FAIL_RESPONSE = { ok: false, status: 0, data: null } as const;

let _contextInvalidated = false;

/** Returns true if the extension context has been invalidated (e.g. after update/reload) */
export function isContextInvalidated(): boolean {
  return _contextInvalidated;
}

function detectContextInvalidation(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  return (
    msg.includes("Extension context invalidated") ||
    msg.includes("Receiving end does not exist")
  );
}

export async function apiFetch(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  if (_contextInvalidated) return FAIL_RESPONSE;

  const msg = {
    type: "API_FETCH",
    url,
    method: init.method || "GET",
    headers: init.headers || {},
    body: init.body,
  };

  try {
    const result = await browser.runtime.sendMessage(msg);
    // Service worker may return undefined if it was waking up
    if (result && typeof result.ok === "boolean") return result;
  } catch (err) {
    if (detectContextInvalidation(err)) {
      _contextInvalidated = true;
      return FAIL_RESPONSE;
    }
    // Service worker might not be ready yet
  }

  // Retry once after a short delay (service worker wake-up)
  await new Promise((r) => setTimeout(r, 150));
  try {
    const result = await browser.runtime.sendMessage(msg);
    if (result && typeof result.ok === "boolean") return result;
  } catch (err) {
    if (detectContextInvalidation(err)) {
      _contextInvalidated = true;
      return FAIL_RESPONSE;
    }
    // Still not available
  }

  return FAIL_RESPONSE;
}
