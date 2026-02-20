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

    // --- Extension marker (lets the web app detect the extension is installed) ---

    const extVersion = browser.runtime.getManifest().version;
    document.documentElement.dataset.tpExtension = extVersion;
    window.dispatchEvent(
      new CustomEvent("tp-extension-detected", { detail: { version: extVersion } })
    );

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

      // Use the known cookie name if already resolved, otherwise find it
      let baseName = supabaseCookieName;

      if (!baseName) {
        // Find a cookie name matching the auth token pattern,
        // but exclude PKCE code-verifier cookies (sb-xxx-auth-token-code-verifier)
        const matchingName = cookies
          .map((c) => c.split("=")[0])
          .find((name) => {
            if (!name.startsWith("sb-") || !name.includes("-auth-token"))
              return false;
            const stripped = name.replace(/\.\d+$/, "");
            return !stripped.endsWith("-code-verifier");
          });

        if (!matchingName) return null;
        baseName = matchingName.replace(/\.\d+$/, "");
      }

      // Helper to find a specific cookie value by exact name match
      function getCookieValue(cookieName: string): string | null {
        const cookie = cookies.find((c) => {
          const eqIdx = c.indexOf("=");
          return eqIdx > 0 && c.substring(0, eqIdx) === cookieName;
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

    let webSessionCleared = false;
    let emptyReadCount = 0;
    const CLEAR_THRESHOLD = 5;
    // Cooldown: don't fire SESSION_CLEAR within 120s of a postMessage sync
    let lastDirectSyncAt = 0;

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
        emptyReadCount = 0;
      } else if (!token && lastSyncedToken) {
        // Don't clear within 120s of a direct session push (postMessage)
        if (Date.now() - lastDirectSyncAt < 120000) return;
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

    const AUTH_PATHS =
      /^\/(login|signup|forgot-password|reset-password|logout)(\/|$)/;

    async function syncExtensionToWeb() {
      if (sessionStorage.getItem("tp-ext-sync")) {
        sessionStorage.removeItem("tp-ext-sync");
        return;
      }

      if (AUTH_PATHS.test(location.pathname)) return;
      if (webSessionCleared) return;

      const webSession = getSupabaseSession();
      if (webSession) return;

      const data = await browser.storage.local.get([
        "accessToken",
        "refreshToken",
        "user",
      ]);
      if (!data.accessToken) return;

      const name = await getCookieName();
      if (!name) return;

      const sessionData = JSON.stringify({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        token_type: "bearer",
        user: data.user,
      });

      const isSecure = location.protocol === "https:";
      const secureFlag = isSecure ? "; Secure" : "";
      document.cookie = `${name}=${encodeURIComponent(sessionData)}; path=/; max-age=${60 * 60 * 24 * 365}${secureFlag}; SameSite=Lax`;

      sessionStorage.setItem("tp-ext-sync", "1");
      window.location.reload();
    }

    async function clearWebSession() {
      const name = await getCookieName();
      if (!name) return;

      const isSecure = location.protocol === "https:";
      const secureFlag = isSecure ? "; Secure" : "";
      const expiry = `path=/; max-age=0; SameSite=Lax${secureFlag}`;
      document.cookie = `${name}=; ${expiry}`;
      for (let i = 0; i < 10; i++) {
        document.cookie = `${name}.${i}=; ${expiry}`;
      }
    }

    // --- Direct session push from web app (e.g. welcome page) ---

    window.addEventListener("message", (e) => {
      if (e.origin !== location.origin) return;
      if (e.data?.type === "TP_SESSION_READY" && e.data.accessToken) {
        lastSyncedToken = e.data.accessToken;
        lastDirectSyncAt = Date.now();
        emptyReadCount = 0;
        webSessionCleared = false;
        browser.runtime.sendMessage({
          type: "SESSION_SYNC",
          accessToken: e.data.accessToken,
          refreshToken: e.data.refreshToken,
          user: e.data.user,
        });
      }
    });

    // --- Init ---

    // Check if extension was explicitly logged out — if so, clear web cookies
    // instead of re-syncing them back to the extension.
    async function initSync() {
      // Pre-resolve the cookie name so getSupabaseSession() can use it
      await getCookieName();

      const { loggedOut } = await browser.storage.local.get(["loggedOut"]);
      if (loggedOut) {
        await clearWebSession();
        await browser.storage.local.remove(["loggedOut"]);
        webSessionCleared = true;
        // Reload so the web app recognizes the sign-out
        if (getSupabaseSession()) {
          sessionStorage.setItem("tp-ext-sync", "1");
          window.location.reload();
        }
        return;
      }

      syncWebToExtension();
      syncExtensionToWeb();
    }

    initSync();

    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("sb-") && e.key?.endsWith("-auth-token")) {
        syncWebToExtension();
      }
    });

    setInterval(syncWebToExtension, 2000);

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local" || !changes.accessToken) return;

      if (changes.accessToken.newValue && !changes.accessToken.oldValue) {
        syncExtensionToWeb();
      } else if (!changes.accessToken.newValue && changes.accessToken.oldValue) {
        // Only clear web cookies on EXPLICIT logout (loggedOut flag).
        // Don't clear on SESSION_CLEAR from cookie polling — it may be a
        // false positive if cookies are temporarily unreadable.
        browser.storage.local.get(["loggedOut"]).then(({ loggedOut }) => {
          if (!loggedOut) return;
          clearWebSession().then(() => {
            sessionStorage.setItem("tp-ext-sync", "1");
            window.location.reload();
          });
        });
      }
    });
  },
});
