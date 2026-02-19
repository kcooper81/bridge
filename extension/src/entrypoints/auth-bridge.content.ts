// TeamPrompt Extension — Auth Bridge
// Content script that runs on teamprompt.app to sync Supabase session

export default defineContentScript({
  matches: ["https://teamprompt.app/*", "http://localhost:3000/*"],
  runAt: "document_idle",

  main() {
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

    // Send session to extension on page load
    const session = getSupabaseSession();
    if (session?.access_token) {
      browser.runtime.sendMessage({
        type: "SESSION_SYNC",
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: session.user,
      });
    }

    // Listen for storage changes (login/logout in web app)
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("sb-") && e.key?.endsWith("-auth-token")) {
        const newSession = e.newValue ? JSON.parse(e.newValue) : null;
        browser.runtime.sendMessage({
          type: newSession ? "SESSION_SYNC" : "SESSION_CLEAR",
          accessToken: newSession?.access_token,
          refreshToken: newSession?.refresh_token,
          user: newSession?.user,
        });
      }
    });
  },
});
