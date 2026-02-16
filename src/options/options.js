// TeamPrompt Options Page Script

import { getSettings, updateSettings } from '../lib/storage.js';
import { STORAGE_KEYS } from '../lib/constants.js';
import { initTheme } from '../lib/theme.js';

initTheme();

// DOM elements
const trackingEnabled = document.getElementById('tracking-enabled');
const captureUrls = document.getElementById('capture-urls');
const captureTitles = document.getElementById('capture-titles');
const autoInfer = document.getElementById('auto-infer');
const injectionMode = document.getElementById('injection-mode');
const excludedDomains = document.getElementById('excluded-domains');
const webAppUrl = document.getElementById('web-app-url');
const btnExport = document.getElementById('btn-export');
const btnClear = document.getElementById('btn-clear');
const status = document.getElementById('status');

// Load settings
async function loadSettings() {
  const settings = await getSettings();

  trackingEnabled.checked = settings.trackingEnabled;
  captureUrls.checked = settings.captureUrls;
  captureTitles.checked = settings.captureTitles;
  autoInfer.checked = settings.autoInferProjects;
  injectionMode.value = settings.aiInjectionMode;
  excludedDomains.value = (settings.excludedDomains || []).join('\n');
  webAppUrl.value = settings.webAppUrl || '';
}

// Save on change
function bindSaveHandlers() {
  trackingEnabled.addEventListener('change', () =>
    save({ trackingEnabled: trackingEnabled.checked }));

  captureUrls.addEventListener('change', () =>
    save({ captureUrls: captureUrls.checked }));

  captureTitles.addEventListener('change', () =>
    save({ captureTitles: captureTitles.checked }));

  autoInfer.addEventListener('change', () =>
    save({ autoInferProjects: autoInfer.checked }));

  injectionMode.addEventListener('change', () =>
    save({ aiInjectionMode: injectionMode.value }));

  excludedDomains.addEventListener('change', () => {
    const domains = excludedDomains.value
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);
    save({ excludedDomains: domains });
  });

  webAppUrl.addEventListener('change', () =>
    save({ webAppUrl: webAppUrl.value.trim() }));
}

async function save(partial) {
  await updateSettings(partial);
  showStatus('Settings saved');
}

function showStatus(message) {
  status.textContent = message;
  status.setAttribute('role', 'status');
  status.classList.remove('hidden');
  clearTimeout(showStatus._timer);
  showStatus._timer = setTimeout(() => status.classList.add('hidden'), 2000);
}

// Export data
btnExport.addEventListener('click', async () => {
  const data = {};
  const keys = Object.values(STORAGE_KEYS);
  const result = await chrome.storage.local.get(keys);

  for (const key of keys) {
    if (result[key] !== undefined) {
      data[key] = result[key];
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `teamprompt-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showStatus('Data exported');
});

// Clear data
btnClear.addEventListener('click', async () => {
  if (!confirm('This will clear local activity data and settings from this device. Your cloud prompts are not affected. Continue?')) return;
  await chrome.storage.local.clear();
  showStatus('All data cleared');
  setTimeout(() => loadSettings(), 500);
});

// Init
loadSettings();
bindSaveHandlers();
