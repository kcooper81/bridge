// TeamPrompt Extension — Auth Bridge
// Content script that runs on teamprompt.app to sync Supabase session

(function() {
  "use strict";

  function getSupabaseSession() {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        try {
          return JSON.parse(localStorage.getItem(key));
        } catch { return null; }
      }
    }
    return null;
  }

  // Send session to extension on page load
  const session = getSupabaseSession();
  if (session?.access_token) {
    chrome.runtime.sendMessage({
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
      chrome.runtime.sendMessage({
        type: newSession ? "SESSION_SYNC" : "SESSION_CLEAR",
        accessToken: newSession?.access_token,
        refreshToken: newSession?.refresh_token,
        user: newSession?.user,
      });
    }
  });
})();
