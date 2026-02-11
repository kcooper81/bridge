// ContextIQ — Supabase Client
// Lightweight wrapper around Supabase JS SDK.
// Loads the SDK from CDN in web mode or uses the bundled version.
//
// SETUP:
// 1. Create a Supabase project at https://supabase.com
// 2. Copy your Project URL and anon (public) key
// 3. Set them below or via environment variables

// ═══════════════════════════════════════
//  CONFIG — Replace with your Supabase project credentials
// ═══════════════════════════════════════

const SUPABASE_URL = globalThis.__CONTEXTIQ_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = globalThis.__CONTEXTIQ_SUPABASE_ANON_KEY || '';

// ═══════════════════════════════════════
//  CLIENT
// ═══════════════════════════════════════

let _client = null;
let _initPromise = null;

export function isConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabaseConfig() {
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

async function loadSDK() {
  // If supabase is already on window (CDN script tag), use it
  if (globalThis.supabase?.createClient) return globalThis.supabase;

  // Dynamic import for environments that support it
  try {
    const mod = await import('https://esm.sh/@supabase/supabase-js@2');
    return mod;
  } catch {
    throw new Error('Supabase SDK not available. Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> to your HTML.');
  }
}

export async function getClient() {
  if (_client) return _client;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (!isConfigured()) {
      throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    const sdk = await loadSDK();
    _client = sdk.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return _client;
  })();

  return _initPromise;
}

// ═══════════════════════════════════════
//  AUTH HELPERS
// ═══════════════════════════════════════

export async function signUp(email, password, name) {
  const client = await getClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const client = await getClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithOAuth(provider) {
  const client = await getClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider, // 'google', 'github', 'azure', etc.
    options: { redirectTo: `${window.location.origin}/src/web/app.html` },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = await getClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const client = await getClient();
  const { data: { session } } = await client.auth.getSession();
  return session;
}

export async function getUser() {
  const client = await getClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export async function onAuthStateChange(callback) {
  const client = await getClient();
  return client.auth.onAuthStateChange(callback);
}

// ═══════════════════════════════════════
//  DB HELPERS (typed wrappers around supabase queries)
// ═══════════════════════════════════════

export async function db() {
  return getClient();
}

// Quick query helper: db table accessor
export async function from(table) {
  const client = await getClient();
  return client.from(table);
}
