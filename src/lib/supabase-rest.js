// TeamPrompt — Supabase REST Client (no SDK required)
// Works in service workers, popup, and any extension context.
// Uses fetch() directly against Supabase's PostgREST + GoTrue auth APIs.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants.js';
import { dbPromptToApp, appPromptToDb } from './prompt-mappers.js';

const AUTH_STORAGE_KEY = 'contextiq_supabase_auth';

// ── Auth State ──

let _authCache = null;

export async function getStoredAuth() {
  if (_authCache) return _authCache;
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY);
  _authCache = result[AUTH_STORAGE_KEY] || null;
  return _authCache;
}

async function storeAuth(authData) {
  _authCache = authData;
  await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData });
}

async function clearAuth() {
  _authCache = null;
  await chrome.storage.local.remove(AUTH_STORAGE_KEY);
}

export async function isAuthenticated() {
  const auth = await getStoredAuth();
  if (!auth?.access_token) return false;
  // Check if token is expired (with 60s buffer)
  if (auth.expires_at && Date.now() / 1000 > auth.expires_at - 60) {
    // Try to refresh
    try {
      await refreshToken();
      return true;
    } catch {
      await clearAuth();
      return false;
    }
  }
  return true;
}

// ── Auth Methods ──

export async function signIn(email, password) {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error_description || data.msg || 'Sign in failed');
  await storeAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user,
  });
  return data;
}

export async function signOut() {
  const auth = await getStoredAuth();
  if (auth?.access_token) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${auth.access_token}`,
        },
      });
    } catch { /* best-effort */ }
  }
  await clearAuth();
}

async function refreshToken() {
  const auth = await getStoredAuth();
  if (!auth?.refresh_token) throw new Error('No refresh token');
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: auth.refresh_token }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error_description || 'Token refresh failed');
  await storeAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user,
  });
  return data;
}

// ── Get valid access token (auto-refresh if needed) ──

async function getAccessToken() {
  const auth = await getStoredAuth();
  if (!auth?.access_token) return null;
  if (auth.expires_at && Date.now() / 1000 > auth.expires_at - 60) {
    const refreshed = await refreshToken();
    return refreshed.access_token;
  }
  return auth.access_token;
}

// ── REST API (PostgREST) ──

function headers(token) {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

export async function query(table, { method = 'GET', filters = '', body = null, select = '*' } = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const selectParam = method === 'GET' ? `select=${encodeURIComponent(select)}` : '';
  const separator = filters ? '&' : '';
  const url = `${SUPABASE_URL}/rest/v1/${table}?${selectParam}${separator}${filters}`;

  const opts = { method, headers: headers(token) };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);
  if (method === 'GET') delete opts.headers['Prefer'];

  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `REST error: ${resp.status}`);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

// ── Convenience methods ──

export async function select(table, filters = '', selectCols = '*') {
  return query(table, { method: 'GET', filters, select: selectCols });
}

export async function insert(table, row) {
  return query(table, { method: 'POST', body: row });
}

export async function update(table, filters, row) {
  return query(table, { method: 'PATCH', filters, body: row });
}

export async function del(table, filters) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `Delete error: ${resp.status}`);
  }
  return { success: true };
}

// ── User profile helpers ──

let _orgIdCache = null;

export async function getOrgId() {
  if (_orgIdCache) return _orgIdCache;
  const auth = await getStoredAuth();
  if (!auth?.user?.id) return null;
  const profiles = await select('profiles', `id=eq.${auth.user.id}`, 'org_id');
  _orgIdCache = profiles?.[0]?.org_id || null;
  return _orgIdCache;
}

export function resetCaches() {
  _orgIdCache = null;
  _authCache = null;
}

// ── DB row <-> App shape mappers (re-exported from shared module) ──
export { dbPromptToApp, appPromptToDb };
