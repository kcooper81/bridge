// TeamPrompt Extension — Background Service Worker

// Handle extension install
chrome.runtime.onInstalled.addListener(() => {
  console.log("TeamPrompt extension installed");
});

// Refresh token periodically
chrome.alarms.create("refresh-token", { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "refresh-token") {
    await refreshSession();
  }
});

async function refreshSession() {
  const data = await chrome.storage.local.get([
    "refreshToken",
    "supabaseUrl",
    "supabaseAnonKey",
  ]);

  if (!data.refreshToken || !data.supabaseUrl || !data.supabaseAnonKey) return;

  try {
    const res = await fetch(
      `${data.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: data.supabaseAnonKey,
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
