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
      // Try localStorage first (classic Supabase JS)
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          try {
            return JSON.parse(localStorage.getItem(key)!);
          } catch {
            /* skip */
          }
        }
      }

      // Try cookies (@supabase/ssr stores session in cookies)
      const cookies = document.cookie.split(";").map((c) => c.trim());
      // Supabase SSR may chunk the cookie: sb-<ref>-auth-token.0, .1, etc.
      const prefix = cookies
        .map((c) => c.split("=")[0])
        .find((name) => name.startsWith("sb-") && name.includes("-auth-token"));

      if (prefix) {
        // Find the base name (remove chunk suffix like .0, .1)
        const baseName = prefix.replace(/\.\d+$/, "");

        // Collect all chunks in order
        const chunks: string[] = [];
        let i = 0;
        while (true) {
          const chunkName = i === 0 ? baseName : `${baseName}.${i}`;
          const match = cookies.find((c) => c.startsWith(chunkName + "="));
          if (!match) {
            // If i=0, try the unchunked version; if i>0, we're done
            if (i === 0) {
              i++;
              continue;
            }
            break;
          }
          chunks.push(decodeURIComponent(match.split("=").slice(1).join("=")));
          i++;
        }

        // Also check the non-chunked cookie directly
        if (chunks.length === 0) {
          const direct = cookies.find((c) => c.startsWith(baseName + "="));
          if (direct) {
            chunks.push(decodeURIComponent(direct.split("=").slice(1).join("=")));
          }
        }

        if (chunks.length > 0) {
          try {
            const raw = chunks.join("");
            // Cookie might be base64-encoded or raw JSON
            let parsed;
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = JSON.parse(atob(raw));
            }
            // Handle different session shapes
            if (parsed?.access_token) return parsed;
            if (parsed?.[0]?.access_token) return parsed[0];
          } catch {
            /* skip */
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
