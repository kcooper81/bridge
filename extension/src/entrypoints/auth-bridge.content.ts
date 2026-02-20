// TeamPrompt Extension — Auth Bridge
// Content script that runs on teamprompt.app to sync Supabase session
// Bidirectional: web app ↔ extension

export default defineContentScript({
  matches: ["https://teamprompt.app/*", "http://localhost:3000/*"],
  runAt: "document_idle",

  main() {
    let lastSyncedToken = "";
    let supabaseCookieName = "";

    // ─── Cookie Name ───

    async function getCookieName(): Promise<string> {
      if (supabaseCookieName) return supabaseCookieName;
      const { supabaseUrl } = await browser.storage.local.get(["supabaseUrl"]);
      if (supabaseUrl) {
        const ref = new URL(supabaseUrl).hostname.split(".")[0];
        supabaseCookieName = `sb-${ref}-auth-token`;
      }
      return supabaseCookieName;
    }

    // ─── Read Web Session (cookies + localStorage) ───

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
      const prefix = cookies
        .map((c) => c.split("=")[0])
        .find((name) => name.startsWith("sb-") && name.includes("-auth-token"));

      if (prefix) {
        const baseName = prefix.replace(/\.\d+$/, "");
        const chunks: string[] = [];
        let i = 0;
        while (true) {
          const chunkName = i === 0 ? baseName : `${baseName}.${i}`;
          const match = cookies.find((c) => c.startsWith(chunkName + "="));
          if (!match) {
            if (i === 0) {
              i++;
              continue;
            }
            break;
          }
          chunks.push(decodeURIComponent(match.split("=").slice(1).join("=")));
          i++;
        }

        if (chunks.length === 0) {
          const direct = cookies.find((c) => c.startsWith(baseName + "="));
          if (direct) {
            chunks.push(decodeURIComponent(direct.split("=").slice(1).join("=")));
          }
        }

        if (chunks.length > 0) {
          try {
            const raw = chunks.join("");
            let parsed;
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = JSON.parse(atob(raw));
            }
            if (parsed?.access_token) return parsed;
            if (parsed?.[0]?.access_token) return parsed[0];
          } catch {
            /* skip */
          }
        }
      }

      return null;
    }

    // ─── Web → Extension Sync ───

    // Track when web just cleared its session so we don't re-push extension tokens
    let webSessionCleared = false;

    function syncWebToExtension() {
      const session = getSupabaseSession();
      const token = session?.access_token || "";

      if (token && token !== lastSyncedToken) {
        lastSyncedToken = token;
        webSessionCleared = false;
        browser.runtime.sendMessage({
          type: "SESSION_SYNC",
          accessToken: session!.access_token,
          refreshToken: session!.refresh_token,
          user: session!.user,
        });
      } else if (!token && lastSyncedToken) {
        lastSyncedToken = "";
        webSessionCleared = true;
        browser.runtime.sendMessage({ type: "SESSION_CLEAR" });
      }
    }

    // ─── Extension → Web Sync ───

    // Auth pages where the user may have intentionally signed out
    const AUTH_PATHS = /^\/(login|signup|forgot-password|reset-password|logout)(\/|$)/;

    async function syncExtensionToWeb() {
      // Guard against reload loops: if we just reloaded for sync, skip once
      if (sessionStorage.getItem("tp-ext-sync")) {
        sessionStorage.removeItem("tp-ext-sync");
        return;
      }

      // Don't push extension session on auth pages — user may have just signed out
      if (AUTH_PATHS.test(location.pathname)) return;

      // Don't re-push if the web just cleared its session (sign-out detected)
      if (webSessionCleared) return;

      // If web already has a session, nothing to do
      const webSession = getSupabaseSession();
      if (webSession) return;

      // Check if extension has a session
      const data = await browser.storage.local.get([
        "accessToken",
        "refreshToken",
        "user",
      ]);
      if (!data.accessToken) return;

      const name = await getCookieName();
      if (!name) return;

      // Build session data matching @supabase/ssr cookie format
      const sessionData = JSON.stringify({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        token_type: "bearer",
        user: data.user,
      });

      // Write cookie on this domain (teamprompt.app or localhost)
      const isSecure = location.protocol === "https:";
      document.cookie = `${name}=${encodeURIComponent(sessionData)}; path=/; max-age=${60 * 60 * 24 * 365}${isSecure ? "; Secure" : ""}; SameSite=Lax`;

      // Reload so the web app's server-side picks up the cookie
      sessionStorage.setItem("tp-ext-sync", "1");
      window.location.reload();
    }

    async function clearWebSession() {
      const name = await getCookieName();
      if (!name) return;

      // Clear main cookie and any chunks (.0, .1, etc.)
      const expiry = "path=/; max-age=0";
      document.cookie = `${name}=; ${expiry}`;
      for (let i = 0; i < 5; i++) {
        document.cookie = `${name}.${i}=; ${expiry}`;
      }
    }

    // ─── Init: Web → Extension ───

    syncWebToExtension();

    // Listen for localStorage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("sb-") && e.key?.endsWith("-auth-token")) {
        syncWebToExtension();
      }
    });

    // Poll for same-tab cookie/localStorage changes
    setInterval(syncWebToExtension, 2000);

    // ─── Init: Extension → Web ───

    syncExtensionToWeb();

    // React to extension login/logout (e.g. user signs in via popup)
    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local" || !changes.accessToken) return;

      if (changes.accessToken.newValue && !changes.accessToken.oldValue) {
        // Extension just logged in — push session to web
        syncExtensionToWeb();
      } else if (!changes.accessToken.newValue && changes.accessToken.oldValue) {
        // Extension just logged out — clear web cookie only if web still has one
        const webSession = getSupabaseSession();
        if (webSession) {
          clearWebSession().then(() => {
            sessionStorage.setItem("tp-ext-sync", "1");
            window.location.reload();
          });
        }
      }
    });
  },
});
