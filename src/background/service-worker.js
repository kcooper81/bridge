// ContextIQ Background Service Worker
// Handles tab tracking, activity capture, project inference, and messaging

import { getSettings, addActivity, setActiveProjectId, getActiveProjectId, getProjects, getProject, isOnboardingComplete } from '../lib/storage.js';
import { extractDomain, categorizeDomain } from '../lib/utils.js';
import { inferProject, reclusterProjects } from '../lib/project-inference.js';
import { ALARM_NAMES } from '../lib/constants.js';

// --- State ---
let lastActiveTabId = null;
let lastActiveUrl = '';
let lastActivityTime = Date.now();

// --- Initialization ---

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/onboarding.html') });
  }

  // Set up periodic alarms
  chrome.alarms.create(ALARM_NAMES.CLUSTERING, { periodInMinutes: 5 });
  chrome.alarms.create(ALARM_NAMES.CLEANUP, { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.CLUSTERING) {
    await reclusterProjects();
  }
  if (alarm.name === ALARM_NAMES.CLEANUP) {
    // Future: clean up old activity items
  }
});

// --- Tab Tracking ---

async function captureTabActivity(tab) {
  if (!tab || !tab.url || !tab.title) return;

  const settings = await getSettings();
  if (!settings.trackingEnabled) return;

  // Skip internal pages
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
    return;
  }

  const domain = extractDomain(tab.url);

  // Check excluded domains
  if (settings.excludedDomains.includes(domain)) return;

  const activityItem = {
    url: tab.url,
    title: tab.title,
    domain,
    category: categorizeDomain(domain),
    favIconUrl: tab.favIconUrl || '',
  };

  // Avoid logging duplicate consecutive activity
  if (tab.url === lastActiveUrl) return;
  lastActiveUrl = tab.url;
  lastActivityTime = Date.now();

  // Log activity
  await addActivity(activityItem);

  // Infer project
  const projectId = await inferProject(activityItem);
  if (projectId) {
    await setActiveProjectId(projectId);
  }
}

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  lastActiveTabId = activeInfo.tabId;
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await captureTabActivity(tab);
  } catch {
    // Tab may have been closed
  }
});

// Track tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === lastActiveTabId) {
    await captureTabActivity(tab);
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      lastActiveTabId = tab.id;
      await captureTabActivity(tab);
    }
  } catch {
    // Window may have been closed
  }
});

// --- Message Handling ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => {
    sendResponse({ error: err.message });
  });
  return true; // Keep channel open for async response
});

async function handleMessage(message) {
  switch (message.type) {
    case 'GET_ACTIVE_PROJECT': {
      const projectId = await getActiveProjectId();
      if (!projectId) return { project: null };
      const project = await getProject(projectId);
      return { project };
    }

    case 'GET_ALL_PROJECTS': {
      const projects = await getProjects();
      return { projects };
    }

    case 'SET_ACTIVE_PROJECT': {
      await setActiveProjectId(message.projectId);
      return { success: true };
    }

    case 'GET_SETTINGS': {
      const settings = await getSettings();
      return { settings };
    }

    case 'GET_CONTEXT_FOR_AI': {
      const { buildContextString } = await import('../lib/utils.js');
      const activeId = await getActiveProjectId();
      if (!activeId) return { context: '' };
      const project = await getProject(activeId);
      return { context: buildContextString(project) };
    }

    case 'RESUME_PROJECT': {
      const project = await getProject(message.projectId);
      if (!project) return { error: 'Project not found' };
      const urls = project.items.slice(0, 10).map(i => i.url);
      for (const url of urls) {
        await chrome.tabs.create({ url, active: false });
      }
      await setActiveProjectId(message.projectId);
      return { success: true, opened: urls.length };
    }

    case 'IS_ONBOARDING_COMPLETE': {
      const complete = await isOnboardingComplete();
      return { complete };
    }

    default:
      return { error: 'Unknown message type' };
  }
}
