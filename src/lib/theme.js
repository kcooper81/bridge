// TeamPrompt — Theme Manager
// Handles dark/light mode persistence and toggling across extension and web app.

const THEME_KEY = 'teamprompt_theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

async function getStoredTheme() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise(resolve => {
      chrome.storage.local.get(THEME_KEY, data => {
        resolve(data[THEME_KEY] || 'dark');
      });
    });
  }
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function saveTheme(theme) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ [THEME_KEY]: theme });
  } else {
    localStorage.setItem(THEME_KEY, theme);
  }
}

/** Initialize theme on page load. Call early (e.g. in DOMContentLoaded). */
export async function initTheme() {
  const stored = await getStoredTheme();
  const resolved = applyTheme(stored);

  // Watch for system theme changes when set to 'system'
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
    const current = await getStoredTheme();
    if (current === 'system') applyTheme('system');
  });

  return resolved;
}

/** Toggle between dark and light. Returns the new resolved theme. */
export async function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  saveTheme(next);
  applyTheme(next);
  return next;
}

/** Set theme explicitly ('dark', 'light', or 'system'). */
export async function setTheme(theme) {
  saveTheme(theme);
  return applyTheme(theme);
}

/** Get current resolved theme ('dark' or 'light'). */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}
