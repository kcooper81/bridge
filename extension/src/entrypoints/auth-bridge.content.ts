// TeamPrompt Extension — Auth Bridge
// Content script that runs on teamprompt.app to sync Supabase session
// Bidirectional: web app <-> extension

export default defineContentScript({
  matches: [
    "https://teamprompt.app/*",
    "https://www.teamprompt.app/*",
    "http://localhost:3000/*",
  ],
  runAt: "document_idle",

  main() {
    let lastSyncedToken = "";
    let supabaseCookieName = "";

    // --- Cookie Name ---

    async function getCookieName(): Promise<string> {
      if (supabaseCookieName) return supabaseCookieName;
      const { supabaseUrl } = await browser.storage.local.get(["supabaseUrl"]);
      if (supabaseUrl) {
        const ref = new URL(supabaseUrl).hostname.split(".")[0];
        supabaseCookieName = `sb-${ref}-auth-token`;
      }
      return supabaseCookieName;
    }

    // --- Base64url decode (Supabase SSR v0.5+ uses base64url for cookies) ---

    function base64urlDecode(str: string): string {
      let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4 !== 0) b64 += "=";
      return atob(b64);
    }

    // --- Read Web Session (cookies) ---

    function getSupabaseSession(): {
      access_token: string;
      refresh_token: string;
      user: unknown;
    } | null {
      const cookies = document.cookie.split(";").map((c) => c.trim());

      // Find a cookie name that matches the Supabase auth token pattern
      const matchingName = cookies
        .map((c) => c.split("=")[0])
        .find((name) => name.startsWith("sb-") && name.includes("-auth-token"));

      if (!matchingName) return null;

      // Get the base name (strip any chunk suffix like .0, .1)
      const baseName = matchingName.replace(/\.\d+$/, "");

      // Helper to find a specific cookie value
      function getCookieValue(name: string): string | null {
        // Use exact match to avoid "sb-xxx-auth-token" matching "sb-xxx-auth-token.0"
        const cookie = cookies.find((c) => {
          const eqIdx = c.indexOf("=");
          return eqIdx > 0 && c.substring(0, eqIdx) === name;
        });
        if (!cookie) return null;
        return decodeURIComponent(cookie.split("=").slice(1).join("="));
      }

      // Try unchunked cookie first (small sessions fit in one cookie)
      const directValue = getCookieValue(baseName);
      if (directValue) {
        const parsed = tryParseSession(directValue);
        if (parsed) return parsed;
      }

      // Try chunked cookies: .0, .1, .2, ...
      const chunks: string[] = [];
      for (let i = 0; i < 20; i++) {
        const val = getCookieValue(`${baseName}.${i}`);
        if (!val) break;
        chunks.push(val);
      }

      if (chunks.length > 0) {
        const raw = chunks.join("");
        const parsed = tryParseSession(raw);
        if (parsed) return parsed;
      }

      return null;
    }

    function tryParseSession(raw: string): {
      access_token: string;
      refresh_token: string;
      user: unknown;
    } | null {
      // Try direct JSON parse
      try {
        const obj = JSON.parse(raw);
        if (obj?.access_token) return obj;
        if (Array.isArray(obj) && obj[0]?.access_token) return obj[0];
      } catch {
        // Not raw JSON
      }

      // Try base64url decode (Supabase SSR v0.5+ format)
      try {
        const decoded = base64urlDecode(raw);
        const obj = JSON.parse(decoded);
        if (obj?.access_token) return obj;
        if (Array.isArray(obj) && obj[0]?.access_token) return obj[0];
      } catch {
        // Not base64url JSON
      }

      return null;
    }

    // --- Web -> Extension Sync ---

    // Track when web just cleared its session so we don't re-push extension tokens
    let webSessionCleared = false;
    // Debounce SESSION_CLEAR: require consecutive empty reads before clearing
    let emptyReadCount = 0;
    const CLEAR_THRESHOLD = 3;

    function syncWebToExtension() {
      const session = getSupabaseSession();
      const token = session?.access_token || "";

      if (token && token !== lastSyncedToken) {
        lastSyncedToken = token;
        emptyReadCount = 0;
        webSessionCleared = false;
        browser.runtime.sendMessage({
          type: "SESSION_SYNC",
          accessToken: session!.access_token,
          refreshToken: session!.refresh_token,
          user: session!.user,
        });
      } else if (token) {
        // Session still present, reset counter
        emptyReadCount = 0;
      } else if (!token && lastSyncedToken) {
        // Cookie read returned empty — could be transient (format change, etc.)
        emptyReadCount++;
        if (emptyReadCount >= CLEAR_THRESHOLD) {
          lastSyncedToken = "";
          emptyReadCount = 0;
          webSessionCleared = true;
          browser.runtime.sendMessage({ type: "SESSION_CLEAR" });
        }
      }
    }

    // --- Extension -> Web Sync ---

    // Auth pages where the user may have intentionally signed out
    const AUTH_PATHS =
      /^\/(login|signup|forgot-password|reset-password|logout)(\/|$)/;

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
      for (let i = 0; i < 10; i++) {
        document.cookie = `${name}.${i}=; ${expiry}`;
      }
    }

    // --- Listen for direct session push from the web app (e.g. welcome page) ---

    window.addEventListener("message", (e) => {
      if (e.origin !== location.origin) return;
      if (e.data?.type === "TP_SESSION_READY" && e.data.accessToken) {
        // The web app is explicitly sending the session — sync immediately.
        // Do NOT set lastSyncedToken here — let the cookie poll manage its own
        // state independently. This prevents a false SESSION_CLEAR if the poll
        // can't read cookies (e.g., different encoding after middleware refresh).
        webSessionCleared = false;
        emptyReadCount = 0;
        browser.runtime.sendMessage({
          type: "SESSION_SYNC",
          accessToken: e.data.accessToken,
          refreshToken: e.data.refreshToken,
          user: e.data.user,
        });
      }
    });

    // --- Init: Web -> Extension ---

    syncWebToExtension();

    // Listen for localStorage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("sb-") && e.key?.endsWith("-auth-token")) {
        syncWebToExtension();
      }
    });

    // Poll for same-tab cookie/localStorage changes
    setInterval(syncWebToExtension, 2000);

    // --- Init: Extension -> Web ---

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
