// TeamPrompt Extension — Background Service Worker

import { CONFIG } from "../lib/config";
import { refreshSession } from "../lib/auth";
import { getExtensionVersion } from "../lib/config";
import { extAuthDebug } from "../lib/auth-debug"; // AUTH-DEBUG

export default defineBackground(() => {
  // ─── Token Refresh Lock ───
  // Prevents multiple concurrent 401-retries from racing to refresh the token.
  let refreshPromise: Promise<void> | null = null;
  function safeRefresh(): Promise<void> {
    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => { refreshPromise = null; });
    }
    return refreshPromise;
  }

  // ─── Install Handler ───
  browser.runtime.onInstalled.addListener((details) => {
    console.log("TeamPrompt extension installed");
    browser.storage.local.set({
      siteUrl: CONFIG.SITE_URL,
      supabaseUrl: CONFIG.SUPABASE_URL,
      supabaseAnonKey: CONFIG.SUPABASE_ANON_KEY,
    });
    // Clear stale loggedOut flag on install/update so it doesn't
    // interfere with the next web login.
    browser.storage.local.remove(["loggedOut"]);

    // Open welcome page on first install (not on updates)
    if (details.reason === "install") {
      browser.tabs.create({ url: CONFIG.SITE_URL + "/extension/welcome" });
    }
  });

  // ─── Internal Message Handler ───
  browser.runtime.onMessage.addListener(
    (message: { type: string; accessToken?: string; refreshToken?: string; user?: unknown }, _sender, sendResponse) => {
      if (message.type === "SESSION_SYNC") {
        extAuthDebug.log("bridge", "bg: SESSION_SYNC received", { hasToken: !!message.accessToken }); // AUTH-DEBUG
        // Clear loggedOut flag AND set tokens in a single atomic operation
        // to prevent race conditions where the flag persists momentarily.
        browser.storage.local.set({
          accessToken: message.accessToken,
          refreshToken: message.refreshToken,
          user: message.user,
          loggedOut: false,
        });
        console.log("TeamPrompt: Session synced from web app");
        sendResponse({ success: true });
      } else if (message.type === "SESSION_CLEAR") {
        extAuthDebug.log("bridge", "bg: SESSION_CLEAR received"); // AUTH-DEBUG
        browser.storage.local.remove(["accessToken", "refreshToken", "user"]);
        console.log("TeamPrompt: Session cleared");
        sendResponse({ success: true });
      } else if (message.type === "OPEN_SIDE_PANEL") {
        const chrome = globalThis as unknown as {
          chrome?: { sidePanel?: { open: (opts: { tabId: number }) => void } };
        };
        if (chrome.chrome?.sidePanel) {
          browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs) => {
              if (tabs[0]?.id) {
                chrome.chrome!.sidePanel!.open({ tabId: tabs[0].id });
              }
            });
        }
        sendResponse({ success: true });
      } else if (message.type === "OPEN_LOGIN") {
        // Fix 3: Content scripts can't use browser.tabs.create, so handle here
        browser.tabs.create({ url: CONFIG.SITE_URL + "/extension/welcome?mode=signin" });
        sendResponse({ success: true });
      } else if (message.type === "PING") {
        // Content script liveness check — if this fails, context is invalidated
        sendResponse({ ok: true });
      } else if (message.type === "API_FETCH") {
        // Proxy API calls from content scripts through the background service
        // worker so they use the extension origin instead of the page origin.
        const msg = message as unknown as {
          url: string;
          method?: string;
          headers?: Record<string, string>;
          body?: string;
        };
        const doFetch = (headers: Record<string, string>) =>
          fetch(msg.url, {
            method: msg.method || "GET",
            headers,
            body: msg.body || undefined,
          });

        doFetch(msg.headers || {})
          .then(async (res) => {
            if (res.status === 401) {
              // Token may be expired — refresh and retry once
              await safeRefresh();
              const { accessToken } = await browser.storage.local.get(["accessToken"]);
              if (accessToken) {
                const retryHeaders = { ...msg.headers, Authorization: `Bearer ${accessToken}` };
                const retry = await doFetch(retryHeaders);
                const data = await retry.json().catch(() => null);
                sendResponse({ ok: retry.ok, status: retry.status, data });
                return;
              }
            }
            const data = await res.json().catch(() => null);
            sendResponse({ ok: res.ok, status: res.status, data });
          })
          .catch(() => {
            sendResponse({ ok: false, status: 0, data: null });
          });
        return true; // keep message channel open for async response
      }
    }
  );

  // ─── External Message Handler (PING/PONG for web app detection) ───
  if (browser.runtime.onMessageExternal) {
    browser.runtime.onMessageExternal.addListener(
      (message: { type: string }, _sender, sendResponse) => {
        if (message.type === "PING") {
          sendResponse({ type: "PONG", version: getExtensionVersion() });
        }
      }
    );
  }

  // ─── Token Refresh Alarm ───
  browser.alarms.create("refresh-token", { periodInMinutes: 10 });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "refresh-token") {
      extAuthDebug.log("refresh", "bg: refresh alarm fired"); // AUTH-DEBUG
      await refreshSession();
    }
  });
});
