// TeamPrompt Extension — Auth Module

import { CONFIG } from "./config";

export interface SessionData {
  accessToken: string;
  refreshToken?: string;
  user?: { id: string; email: string };
}

export async function getSession(): Promise<SessionData | null> {
  const data = await browser.storage.local.get(["accessToken"]);
  if (data.accessToken) return data as SessionData;
  return null;
}

export async function login(
  email: string,
  password: string
): Promise<SessionData> {
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
    throw new Error(data.error_description || data.msg || "Login failed");
  }

  const data = await res.json();
  const session: SessionData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  };

  await browser.storage.local.set(session);
  return session;
}

export async function logout(): Promise<void> {
  await browser.storage.local.remove(["accessToken", "refreshToken", "user"]);
}

export function openLogin(): void {
  browser.tabs.create({ url: CONFIG.SITE_URL + "/login" });
}

export function openSignup(): void {
  browser.tabs.create({ url: CONFIG.SITE_URL + "/signup" });
}

export async function refreshSession(): Promise<void> {
  const data = await browser.storage.local.get(["refreshToken"]);
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
      await browser.storage.local.set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } else {
      await browser.storage.local.remove([
        "accessToken",
        "refreshToken",
        "user",
      ]);
    }
  } catch {
    // Network error — will retry on next alarm
  }
}
