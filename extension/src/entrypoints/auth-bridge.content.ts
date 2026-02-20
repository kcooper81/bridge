// TeamPrompt Extension — Auth Bridge
// Content script that runs on teamprompt.app to sync Supabase session

export default defineContentScript({
  matches: ["https://teamprompt.app/*", "http://localhost:3000/*"],
  runAt: "document_idle",

  main() {
    let lastSyncedToken = "";

    function getSupabaseSession(): {
      access_token: string;
      refresh_token: string;
      user: unknown;
    } | null {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          try {
            return JSON.parse(localStorage.getItem(key)!);
          } catch {
            return null;
          }
        }
      }
      return null;
    }

    function syncSession() {
      const session = getSupabaseSession();
      const token = session?.access_token || "";

      if (token && token !== lastSyncedToken) {
        lastSyncedToken = token;
        browser.runtime.sendMessage({
          type: "SESSION_SYNC",
          accessToken: session!.access_token,
          refreshToken: session!.refresh_token,
          user: session!.user,
        });
      } else if (!token && lastSyncedToken) {
        lastSyncedToken = "";
        browser.runtime.sendMessage({ type: "SESSION_CLEAR" });
      }
    }

    // Sync on page load
    syncSession();

    // Listen for storage changes from OTHER tabs
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("sb-") && e.key?.endsWith("-auth-token")) {
        syncSession();
      }
    });

    // Poll for same-tab changes (storage event doesn't fire for same-tab writes)
    // This catches signup/login that happens in this tab
    setInterval(syncSession, 2000);
  },
});
