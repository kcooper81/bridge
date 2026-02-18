// TeamPrompt Extension — Background Service Worker

// ─── Hardcoded Config (NEXT_PUBLIC_ values) ───
const CONFIG = {
  SITE_URL: "https://teamprompt.app",
  SUPABASE_URL: "https://vafybxyxmpehrpqbztrc.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZnlieHl4bXBlaHJwcWJ6dHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzU3NjcsImV4cCI6MjA4NjQxMTc2N30.W6OiQtVpqzyueOQq6HE7_qNOTDOQgTig215zSgXYHAs",
};

// Handle extension install
chrome.runtime.onInstalled.addListener(() => {
  console.log("TeamPrompt extension installed");
  // Store config values so popup and content scripts can access them
  chrome.storage.local.set({
    siteUrl: CONFIG.SITE_URL,
    supabaseUrl: CONFIG.SUPABASE_URL,
    supabaseAnonKey: CONFIG.SUPABASE_ANON_KEY,
  });
});

// ─── Auth Bridge Message Handler ───
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SESSION_SYNC") {
    chrome.storage.local.set({
      accessToken: message.accessToken,
      refreshToken: message.refreshToken,
      user: message.user,
    });
    console.log("TeamPrompt: Session synced from web app");
    sendResponse({ success: true });
  } else if (message.type === "SESSION_CLEAR") {
    chrome.storage.local.remove(["accessToken", "refreshToken", "user"]);
    console.log("TeamPrompt: Session cleared (logged out from web app)");
    sendResponse({ success: true });
  }
});

// ─── Token Refresh ───
chrome.alarms.create("refresh-token", { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "refresh-token") {
    await refreshSession();
  }
});

async function refreshSession() {
  const data = await chrome.storage.local.get(["refreshToken"]);

  if (!data.refreshToken) return;

  try {
    const res = await fetch(
      `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: CONFIG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ refresh_token: data.refreshToken }),
      }
    );

    if (res.ok) {
      const tokens = await res.json();
      await chrome.storage.local.set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } else {
      // Token expired — clear session
      await chrome.storage.local.remove([
        "accessToken",
        "refreshToken",
        "user",
      ]);
    }
  } catch {
    // Network error — will retry on next alarm
  }
}
