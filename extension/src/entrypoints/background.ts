// TeamPrompt Extension — Background Service Worker

import { CONFIG } from "../lib/config";
import { refreshSession } from "../lib/auth";
import { getExtensionVersion } from "../lib/config";

export default defineBackground(() => {
  // ─── Install Handler ───
  browser.runtime.onInstalled.addListener((details) => {
    console.log("TeamPrompt extension installed");
    browser.storage.local.set({
      siteUrl: CONFIG.SITE_URL,
      supabaseUrl: CONFIG.SUPABASE_URL,
      supabaseAnonKey: CONFIG.SUPABASE_ANON_KEY,
    });

    // Open welcome page on first install (not on updates)
    if (details.reason === "install") {
      browser.tabs.create({ url: CONFIG.SITE_URL + "/extension/welcome" });
    }
  });

  // ─── Internal Message Handler ───
  browser.runtime.onMessage.addListener(
    (message: { type: string; accessToken?: string; refreshToken?: string; user?: unknown }, _sender, sendResponse) => {
      if (message.type === "SESSION_SYNC") {
        // Clear any loggedOut flag — user is actively logging in
        browser.storage.local.remove(["loggedOut"]);
        browser.storage.local.set({
          accessToken: message.accessToken,
          refreshToken: message.refreshToken,
          user: message.user,
        });
        console.log("TeamPrompt: Session synced from web app");
        sendResponse({ success: true });
      } else if (message.type === "SESSION_CLEAR") {
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
  browser.alarms.create("refresh-token", { periodInMinutes: 30 });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "refresh-token") {
      await refreshSession();
    }
  });
});
