// TeamPrompt Extension — Auth Module

import { CONFIG } from "./config";
import { extAuthDebug } from "./auth-debug"; // AUTH-DEBUG

export interface SessionData {
  accessToken: string;
  refreshToken?: string;
  user?: { id: string; email: string };
}

export async function getSession(): Promise<SessionData | null> {
  const data = await browser.storage.local.get([
    "accessToken",
    "refreshToken",
    "user",
  ]);
  extAuthDebug.log("session", "getSession()", { hasToken: !!data.accessToken }); // AUTH-DEBUG
  if (data.accessToken) return data as SessionData;
  return null;
}

export async function login(
  email: string,
  password: string
): Promise<SessionData> {
  extAuthDebug.log("login", "ext login attempt", { email }); // AUTH-DEBUG
  const res = await fetch(
    `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CONFIG.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    extAuthDebug.error("login", "ext login failed", { status: res.status, error: data.error_description || data.msg }); // AUTH-DEBUG
    throw new Error(data.error_description || data.msg || "Login failed");
  }

  const data = await res.json();
  const session: SessionData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  };

  extAuthDebug.log("login", "ext login success", { userId: data.user.id }); // AUTH-DEBUG
  await browser.storage.local.set(session);
  return session;
}

export async function logout(): Promise<void> {
  extAuthDebug.log("login", "ext logout initiated"); // AUTH-DEBUG
  // Set loggedOut flag BEFORE removing tokens so the auth-bridge knows
  // not to re-sync web cookies back to the extension on the next page load.
  await browser.storage.local.set({ loggedOut: true });
  await browser.storage.local.remove(["accessToken", "refreshToken", "user"]);
}

export function openLogin(): void {
  browser.tabs.create({
    url: CONFIG.SITE_URL + "/extension/welcome?mode=signin",
  });
}

export function openSignup(): void {
  browser.tabs.create({ url: CONFIG.SITE_URL + "/extension/welcome" });
}

// Route OAuth through the welcome page which uses the Supabase JS client
// with proper PKCE flow, instead of constructing manual URLs.
export function openGoogleAuth(): void {
  browser.tabs.create({
    url: CONFIG.SITE_URL + "/extension/welcome?provider=google",
  });
}

export function openGithubAuth(): void {
  browser.tabs.create({
    url: CONFIG.SITE_URL + "/extension/welcome?provider=github",
  });
}

export async function refreshSession(): Promise<void> {
  const data = await browser.storage.local.get(["refreshToken"]);
  if (!data.refreshToken) {
    extAuthDebug.log("refresh", "refreshSession: no refresh token"); // AUTH-DEBUG
    return;
  }

  extAuthDebug.log("refresh", "refreshSession: attempting refresh"); // AUTH-DEBUG
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
      extAuthDebug.log("refresh", "refreshSession: success"); // AUTH-DEBUG
      await browser.storage.local.set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } else {
      // Don't clear tokens on transient failures — an expired access token
      // is better than no token (user stays "signed in" and the next refresh
      // or auth-bridge sync can recover). Only a deliberate logout should
      // clear tokens.
      extAuthDebug.error("refresh", "refreshSession: failed (keeping tokens)", { status: res.status }); // AUTH-DEBUG
    }
  } catch {
    extAuthDebug.error("refresh", "refreshSession: network error"); // AUTH-DEBUG
    // Network error — will retry on next alarm
  }
}
