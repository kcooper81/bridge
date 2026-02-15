// ContextIQ Background Service Worker v0.6.0
// Handles tab tracking, activity capture, time tracking, project inference,
// AI tool detection, context menus, badge management, and messaging

import {
  getSettings, addActivity, updateActivity, setActiveProjectId,
  getActiveProjectId, getProjects, getProject, getActivityLog,
  isOnboardingComplete, addItemToProject, addManualItemToProject,
  moveItemToProject, assignActivityToProject, saveProject, createProject,
  deleteProject, saveAIConversation, getProjectConversations,
  getWorkspaceProfiles, saveWorkspaceProfile, deleteWorkspaceProfile,
  getActiveWorkspace, setActiveWorkspace, getPinnedProjects, togglePinProject,
  getFavorites, toggleFavorite, getDailyStats, updateDailyStats,
  getAIConversations,
} from '../lib/storage.js';
import { extractDomain, categorizeDomain, buildContextString, computeEngagementScore, extractConversationTopic, generateContinuationPrompt } from '../lib/utils.js';
import { inferProject, reclusterProjects } from '../lib/project-inference.js';
import { summarizeAllProjects } from '../lib/summarizer.js';
import { ALARM_NAMES } from '../lib/constants.js';
import { installStarterPacks, isStarterInstalled } from '../lib/prompt-storage.js';
import {
  getOrg, saveOrg,
  getTeams, getTeam, saveTeam, deleteTeam,
  getMembers, getMember, getCurrentUser, saveMember, deleteMember, setupCurrentUser,
  getCollections, getCollection, saveCollection, deleteCollection,
  addPromptToCollection, removePromptFromCollection,
  getStandards, getStandard, saveStandard, deleteStandard,
  validatePromptAgainstStandards,
  exportPromptPack, importPromptPack,
  installDefaultStandards,
} from '../lib/team-storage.js';
import * as sbRest from '../lib/supabase-rest.js';

// --- State ---
let lastActiveTabId = null;
let lastActiveUrl = '';
let lastActivityTime = Date.now();
let lastActivityId = null;
let tabStartTime = Date.now();
let currentTabUrl = '';
let pendingBridge = null;
let detectedTools = {}; // tabId -> { toolName, isHeuristic, url }

// --- AI Tool URL Patterns (for programmatic injection) ---
const AI_TOOL_URLS = [
  '*://chatgpt.com/*', '*://chat.openai.com/*',
  '*://claude.ai/*',
  '*://gemini.google.com/*',
  '*://www.perplexity.ai/*', '*://perplexity.ai/*',
  '*://copilot.microsoft.com/*',
  '*://poe.com/*',
  '*://chat.deepseek.com/*',
  '*://grok.com/*',
  '*://chat.mistral.ai/*',
  '*://huggingface.co/chat/*',
  '*://pi.ai/*',
  '*://coral.cohere.com/*',
  '*://you.com/*',
  '*://meta.ai/*',
  '*://phind.com/*',
];

// --- Initialization ---

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/onboarding.html') });
  }

  // Set up periodic alarms
  chrome.alarms.create(ALARM_NAMES.CLUSTERING, { periodInMinutes: 5 });
  chrome.alarms.create(ALARM_NAMES.CLEANUP, { periodInMinutes: 60 });
  chrome.alarms.create(ALARM_NAMES.TIME_TRACKING, { periodInMinutes: 1 });

  // Create context menus
  setupContextMenus();

  // Re-inject content scripts into existing AI tool tabs
  await injectIntoExistingTabs();

  // Templates are now a separate browsable library in the popup.
  // No auto-install of starter packs — users add templates individually.
});

// Also set up context menus when the service worker starts
chrome.runtime.onStartup.addListener(() => {
  setupContextMenus();
});

// --- Context Menu Setup ---

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'contextiq-bridge-selection',
      title: 'Bridge selected text to...',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'contextiq-bridge-page',
      title: 'Bridge this conversation',
      contexts: ['page'],
    });

    chrome.contextMenus.create({
      id: 'contextiq-bridge-image',
      title: 'Bridge this image',
      contexts: ['image'],
    });

    chrome.contextMenus.create({ id: 'sep1', type: 'separator', contexts: ['page', 'selection', 'image'] });

    // Bridge target submenu items
    const targets = [
      { id: 'bridge-to-chatgpt', title: 'ChatGPT', url: 'https://chatgpt.com/' },
      { id: 'bridge-to-claude', title: 'Claude', url: 'https://claude.ai/new' },
      { id: 'bridge-to-gemini', title: 'Gemini', url: 'https://gemini.google.com/app' },
      { id: 'bridge-to-perplexity', title: 'Perplexity', url: 'https://www.perplexity.ai/' },
      { id: 'bridge-to-copilot', title: 'Copilot', url: 'https://copilot.microsoft.com/' },
      { id: 'bridge-to-deepseek', title: 'DeepSeek', url: 'https://chat.deepseek.com/' },
      { id: 'bridge-to-grok', title: 'Grok', url: 'https://grok.com/' },
      { id: 'bridge-to-mistral', title: 'Mistral', url: 'https://chat.mistral.ai/' },
      { id: 'bridge-to-poe', title: 'Poe', url: 'https://poe.com/' },
    ];

    for (const t of targets) {
      chrome.contextMenus.create({
        id: t.id,
        title: `Bridge to ${t.title}`,
        contexts: ['page', 'selection', 'image'],
      });
    }
  });
}

// --- Context Menu Handler ---

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const bridgeTargets = {
    'bridge-to-chatgpt': { name: 'ChatGPT', url: 'https://chatgpt.com/' },
    'bridge-to-claude': { name: 'Claude', url: 'https://claude.ai/new' },
    'bridge-to-gemini': { name: 'Gemini', url: 'https://gemini.google.com/app' },
    'bridge-to-perplexity': { name: 'Perplexity', url: 'https://www.perplexity.ai/' },
    'bridge-to-copilot': { name: 'Copilot', url: 'https://copilot.microsoft.com/' },
    'bridge-to-deepseek': { name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
    'bridge-to-grok': { name: 'Grok', url: 'https://grok.com/' },
    'bridge-to-mistral': { name: 'Mistral', url: 'https://chat.mistral.ai/' },
    'bridge-to-poe': { name: 'Poe', url: 'https://poe.com/' },
  };

  const target = bridgeTargets[info.menuItemId];
  if (!target) return;

  let bridgeText = '';
  const sourceTool = detectedTools[tab.id]?.toolName || 'Web page';

  if (info.selectionText) {
    bridgeText = `[Bridged from ${sourceTool} via ContextIQ]\n\nSelected text:\n${info.selectionText}\n\nPlease continue working with this context.`;
  } else if (info.srcUrl) {
    bridgeText = `[Bridged from ${sourceTool} via ContextIQ]\n\nImage: ${info.srcUrl}\n\nPlease analyze or continue working with this image.`;
  } else {
    // Bridge full conversation
    try {
      const resp = await chrome.tabs.sendMessage(tab.id, { type: 'QUICK_BRIDGE' });
      if (resp && !resp.error) {
        const lines = [`[Bridged from ${resp.toolName} via ContextIQ]`];
        if (resp.codeBlocks?.length > 0) {
          lines.push('\nCode:');
          for (const block of resp.codeBlocks.slice(0, 3)) {
            lines.push('```' + (block.language || ''));
            lines.push(block.code.slice(0, 2000));
            lines.push('```');
          }
        }
        if (resp.turns?.length > 0) {
          lines.push('\nConversation:');
          for (const turn of resp.turns.slice(-4)) {
            const role = turn.role === 'user' ? 'You' : resp.toolName;
            lines.push(`  ${role}: ${turn.text.slice(0, 300)}`);
          }
        }
        lines.push('\nPlease continue from where I left off.');
        bridgeText = lines.join('\n');
      }
    } catch {
      bridgeText = `[Bridged from ${sourceTool} via ContextIQ]\n\nPage: ${tab.title}\nURL: ${tab.url}\n\nPlease continue working with this context.`;
    }
  }

  if (!bridgeText) return;

  // Set pending bridge and open target
  pendingBridge = {
    text: bridgeText,
    toolName: target.name,
    sourceToolName: sourceTool,
    topic: info.selectionText ? info.selectionText.slice(0, 50) : (tab.title || '').slice(0, 50),
    timestamp: Date.now(),
  };

  chrome.tabs.create({ url: target.url });
});

// --- Inject into existing tabs on install/update ---

async function injectIntoExistingTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) continue;

      // Check if this is a known AI tool URL
      const isAITool = AI_TOOL_URLS.some(pattern => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/'));
        return regex.test(tab.url);
      });

      if (isAITool) {
        try {
          // Try to ping the existing content script
          await chrome.tabs.sendMessage(tab.id, { type: 'PING_CONTENT_SCRIPT' });
        } catch {
          // Content script not there — inject it
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['src/content/ai-injector.js'],
            });
            await chrome.scripting.insertCSS({
              target: { tabId: tab.id },
              files: ['src/content/ai-injector.css'],
            });
          } catch {
            // Tab may not be injectable (e.g., about:blank)
          }
        }
      }
    }
  } catch {
    // May not have tabs permission yet
  }
}

// --- Badge & Tab Management ---

function updateBadge(tabId, toolName) {
  if (!toolName) {
    chrome.action.setBadgeText({ text: '', tabId }).catch(() => {});
    return;
  }

  const shortNames = {
    ChatGPT: 'GPT', Claude: 'CL', Gemini: 'GEM', Perplexity: 'PPX',
    Copilot: 'COP', DeepSeek: 'DS', Grok: 'GRK', Mistral: 'MST',
    Poe: 'POE', HuggingChat: 'HF', Pi: 'PI', Cohere: 'COH',
    'You.com': 'YOU', 'Meta AI': 'MTA', Phind: 'PHD', 'Notion AI': 'NOT',
  };

  const toolColors = {
    ChatGPT: '#10a37f', Claude: '#d97757', Gemini: '#4285f4', Perplexity: '#20b8cd',
    Copilot: '#7c3aed', DeepSeek: '#4f8ff7', Grok: '#ef4444', Mistral: '#ff7000',
    Poe: '#6c5ce7', HuggingChat: '#ffbf00', Pi: '#8b5cf6', Cohere: '#39594d',
    'You.com': '#4a90d9', 'Meta AI': '#0084ff', Phind: '#6e56cf', 'Notion AI': '#ffffff',
  };

  const text = shortNames[toolName] || toolName.slice(0, 3).toUpperCase();
  const color = toolColors[toolName] || '#8b5cf6';

  chrome.action.setBadgeText({ text, tabId }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ color, tabId }).catch(() => {});
}

// --- Alarms ---

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.CLUSTERING) {
    await reclusterProjects();
    const projects = await getProjects();
    await summarizeAllProjects(projects);
  }
  if (alarm.name === ALARM_NAMES.TIME_TRACKING) {
    await flushTabTime();
  }
  if (alarm.name === ALARM_NAMES.CLEANUP) {
    // Future: clean up old activity items
  }
});

// --- Time Tracking ---

async function flushTabTime() {
  if (!lastActivityId || !tabStartTime) return;
  const elapsed = Math.floor((Date.now() - tabStartTime) / 1000);
  if (elapsed < 2) return;

  const capped = Math.min(elapsed, 1800);

  try {
    const activity = await updateActivity(lastActivityId, {});
    if (activity) {
      const newTime = (activity.timeSpent || 0) + capped;
      const score = computeEngagementScore(newTime, activity.pageContent);
      await updateActivity(lastActivityId, { timeSpent: newTime, engagementScore: score });
    }
  } catch {
    // Activity may have been trimmed
  }

  tabStartTime = Date.now();
}

// --- Tab Tracking ---

function extractEmailSubject(title, domain) {
  if (domain !== 'mail.google.com') return null;
  const match = title.match(/^(.+?)\s+-\s+.+@.+\s+-\s+Gmail$/);
  if (match) {
    const subject = match[1].trim();
    if (/^Inbox(\s*\(\d+\))?$/.test(subject)) return null;
    return subject;
  }
  return null;
}

async function captureTabActivity(tab) {
  if (!tab || !tab.url || !tab.title) return;

  const settings = await getSettings();
  if (!settings.trackingEnabled) return;

  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
    return;
  }

  const domain = extractDomain(tab.url);
  if (settings.excludedDomains.includes(domain)) return;

  await flushTabTime();

  const activityItem = {
    url: settings.captureUrls ? tab.url : `https://${domain}/`,
    title: settings.captureTitles ? tab.title : domain,
    domain,
    category: categorizeDomain(domain),
    favIconUrl: tab.favIconUrl || '',
    referrerUrl: currentTabUrl || '',
  };

  const emailSubject = extractEmailSubject(tab.title, domain);
  if (emailSubject) {
    activityItem.emailSubject = emailSubject;
    activityItem.title = emailSubject;
  }

  if (tab.url === lastActiveUrl) return;
  lastActiveUrl = tab.url;
  currentTabUrl = tab.url;
  lastActivityTime = Date.now();
  tabStartTime = Date.now();

  const log = await addActivity(activityItem);
  lastActivityId = log[0]?.id || null;

  const projectId = await inferProject(activityItem);
  if (projectId) {
    await setActiveProjectId(projectId);
    if (lastActivityId) {
      await updateActivity(lastActivityId, { projectId });
    }
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const allStats = await getDailyStats();
    const todayStats = allStats[today] || { pageViews: 0, domains: [], categories: {} };
    todayStats.pageViews = (todayStats.pageViews || 0) + 1;
    if (!todayStats.domains) todayStats.domains = [];
    if (!todayStats.domains.includes(domain)) todayStats.domains.push(domain);
    if (!todayStats.categories) todayStats.categories = {};
    const cat = activityItem.category;
    todayStats.categories[cat] = (todayStats.categories[cat] || 0) + 1;
    await updateDailyStats(todayStats);
  } catch {
    // Stats tracking is best-effort
  }
}

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  lastActiveTabId = activeInfo.tabId;
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await captureTabActivity(tab);

    // Update badge for this tab
    const toolInfo = detectedTools[activeInfo.tabId];
    updateBadge(activeInfo.tabId, toolInfo?.toolName || null);
  } catch {
    // Tab may have been closed
  }
});

// Track tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === lastActiveTabId) {
    await captureTabActivity(tab);

    // Check if this tab has a detected tool, or try to ping
    if (!detectedTools[tabId]) {
      try {
        const resp = await chrome.tabs.sendMessage(tabId, { type: 'PING_CONTENT_SCRIPT' });
        if (resp?.toolDetected) {
          detectedTools[tabId] = { toolName: resp.toolDetected, url: tab.url };
          updateBadge(tabId, resp.toolDetected);
        }
      } catch {
        // Content script may not be loaded yet
      }
    }
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await flushTabTime();
    return;
  }
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

// Clean up detectedTools when tabs close
chrome.tabs.onRemoved.addListener((tabId) => {
  delete detectedTools[tabId];
});

// --- Keyboard Shortcuts ---

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'copy-context') {
    const activeId = await getActiveProjectId();
    if (!activeId) return;
    const project = await getProject(activeId);
    if (!project) return;
    const context = buildContextString(project);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.tabs.sendMessage(tab.id, { type: 'COPY_TO_CLIPBOARD', text: context });
      }
    } catch {
      // Tab may not have content script
    }
  }

  if (command === 'toggle-tracking') {
    const settings = await getSettings();
    const { updateSettings: doUpdate } = await import('../lib/storage.js');
    await doUpdate({ trackingEnabled: !settings.trackingEnabled });
  }

  if (command === 'quick-bridge') {
    // Alt+B — Quick bridge current conversation
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;

      const resp = await chrome.tabs.sendMessage(tab.id, { type: 'QUICK_BRIDGE' });
      if (resp && !resp.error && resp.toolName) {
        // Save the conversation first
        const activeId = await getActiveProjectId();
        if (activeId) {
          await saveAIConversation(activeId, {
            toolName: resp.toolName,
            url: resp.url,
            title: resp.title,
            turns: resp.turns || [],
            codeBlocks: resp.codeBlocks || [],
            images: resp.images || [],
          });
        }

        // Build bridge text and store as pending
        const lines = [`[Bridged from ${resp.toolName} via ContextIQ]`];
        if (resp.codeBlocks?.length > 0) {
          lines.push('\nCode:');
          for (const block of resp.codeBlocks.slice(0, 5)) {
            lines.push('```' + (block.language || ''));
            lines.push(block.code.slice(0, 2000));
            lines.push('```');
          }
        }
        if (resp.turns?.length > 0) {
          lines.push('\nConversation:');
          for (const turn of resp.turns.slice(-6)) {
            const role = turn.role === 'user' ? 'You' : resp.toolName;
            lines.push(`  ${role}: ${turn.text.slice(0, 300)}`);
          }
        }
        lines.push('\nPlease continue from where I left off.');

        pendingBridge = {
          text: lines.join('\n'),
          toolName: '',
          sourceToolName: resp.toolName,
          topic: extractConversationTopic(resp.turns || []),
          timestamp: Date.now(),
        };

        // Open the popup to let user pick target
        // The popup will see the pending bridge and show the bridge sheet
      }
    } catch {
      // Tab may not have content script
    }
  }
});

// --- Message Handling ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    sendResponse({ error: err.message });
  });
  return true;
});

async function handleMessage(message, sender) {
  switch (message.type) {
    case 'AI_TOOL_DETECTED': {
      // Content script notifies us of detected AI tool
      const tabId = sender.tab?.id;
      if (tabId) {
        detectedTools[tabId] = {
          toolName: message.toolName,
          isHeuristic: message.isHeuristic,
          url: message.url,
        };
        updateBadge(tabId, message.toolName);
      }
      return { success: true };
    }

    case 'GET_ACTIVE_TAB_TOOL': {
      // Popup asks what tool is on the active tab
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && detectedTools[tab.id]) {
          return { tool: detectedTools[tab.id] };
        }
        // Try pinging
        if (tab) {
          try {
            const resp = await chrome.tabs.sendMessage(tab.id, { type: 'PING_CONTENT_SCRIPT' });
            if (resp?.toolDetected) {
              detectedTools[tab.id] = { toolName: resp.toolDetected, url: tab.url };
              updateBadge(tab.id, resp.toolDetected);
              return { tool: detectedTools[tab.id] };
            }
          } catch {
            // No content script
          }
        }
      } catch {
        // No active tab
      }
      return { tool: null };
    }

    case 'DELETE_ARTIFACT': {
      // Delete a specific conversation/artifact by matching savedAt + toolName
      const allConvos = await getAIConversations();
      let deleted = false;

      for (const [projectId, convos] of Object.entries(allConvos)) {
        const idx = convos.findIndex(c =>
          c.savedAt === message.savedAt && c.toolName === message.toolName
        );
        if (idx !== -1) {
          convos.splice(idx, 1);
          // Save back using chrome.storage directly
          await chrome.storage.local.set({ contextiq_ai_conversations: allConvos });
          deleted = true;
          break;
        }
      }

      return { success: deleted };
    }

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

    // --- Enhanced Message Handlers ---

    case 'GET_ACTIVITY_LOG': {
      const log = await getActivityLog();
      return { log };
    }

    case 'ADD_MANUAL_ITEM': {
      const result = await addManualItemToProject(message.projectId, message.url, message.title);
      return { success: !!result, project: result };
    }

    case 'MOVE_ITEM': {
      const result = await moveItemToProject(message.fromProjectId, message.toProjectId, message.itemId);
      return { success: !!result, project: result };
    }

    case 'ASSIGN_ACTIVITY_TO_PROJECT': {
      const activity = await assignActivityToProject(message.activityId, message.projectId);
      if (activity) {
        await addItemToProject(message.projectId, {
          url: activity.url,
          title: activity.title,
          domain: activity.domain,
          category: activity.category,
          favIconUrl: activity.favIconUrl || '',
          pageContent: activity.pageContent,
          timeSpent: activity.timeSpent,
        });
      }
      return { success: !!activity };
    }

    case 'CREATE_PROJECT': {
      const newProject = createProject(message.name);
      newProject.isManual = true;
      await saveProject(newProject);
      await setActiveProjectId(newProject.id);
      return { success: true, project: newProject };
    }

    case 'DELETE_PROJECT': {
      await deleteProject(message.projectId);
      return { success: true };
    }

    case 'PAGE_CONTENT_EXTRACTED': {
      if (lastActivityId && message.url === lastActiveUrl) {
        const score = computeEngagementScore(0, message.content);
        await updateActivity(lastActivityId, {
          pageContent: message.content,
          engagementScore: score,
        });
      }
      return { success: true };
    }

    // --- AI Conversation Bridge ---

    case 'SAVE_AI_CONVERSATION': {
      const activeId = await getActiveProjectId();
      if (!activeId) return { success: false, error: 'No active project' };

      await saveAIConversation(activeId, {
        toolName: message.toolName,
        url: message.url,
        title: message.title,
        turns: message.turns,
        codeBlocks: message.codeBlocks || [],
        images: message.images || [],
      });
      return { success: true };
    }

    case 'GET_AI_BRIDGE_CONTEXT': {
      const activeId = await getActiveProjectId();
      if (!activeId) return { bridgeContext: '', conversationCount: 0, toolsUsed: [] };

      const conversations = await getProjectConversations(activeId, message.currentTool);
      if (!conversations.length) return { bridgeContext: '', conversationCount: 0, toolsUsed: [] };

      const toolsUsed = [...new Set(conversations.map(c => c.toolName))];

      const lines = ['--- AI Conversation Bridge ---'];
      lines.push(`Context from: ${toolsUsed.join(', ')}`);
      lines.push('');

      const recent = conversations.slice(0, 3);
      for (const conv of recent) {
        lines.push(`[${conv.toolName}] ${conv.title || 'Untitled'}`);
        const turns = conv.turns.slice(-4);
        for (const turn of turns) {
          const prefix = turn.role === 'user' ? 'You' : conv.toolName;
          const text = turn.text.length > 200 ? turn.text.slice(0, 200) + '...' : turn.text;
          lines.push(`  ${prefix}: ${text}`);
        }
        lines.push('');
      }

      lines.push('Use this context from previous AI conversations to maintain continuity.');

      return {
        bridgeContext: lines.join('\n'),
        conversationCount: conversations.length,
        toolsUsed,
      };
    }

    // --- AI Bridge Enhanced ---

    case 'GET_AI_BRIDGE_SUMMARY': {
      const allConvos = await getAIConversations();
      const activeId = await getActiveProjectId();
      const toolSummary = {};
      const threads = [];

      if (activeId && allConvos[activeId]) {
        for (const conv of allConvos[activeId]) {
          if (!toolSummary[conv.toolName]) {
            toolSummary[conv.toolName] = { count: 0, lastSaved: 0, codeBlocks: 0, images: 0 };
          }
          toolSummary[conv.toolName].count++;
          toolSummary[conv.toolName].lastSaved = Math.max(
            toolSummary[conv.toolName].lastSaved, conv.savedAt
          );
          toolSummary[conv.toolName].codeBlocks += (conv.codeBlocks || []).length;
          toolSummary[conv.toolName].images += (conv.images || []).length;
          threads.push({
            toolName: conv.toolName,
            title: conv.title,
            topic: extractConversationTopic(conv.turns),
            turnCount: conv.turns.length,
            codeBlockCount: (conv.codeBlocks || []).length,
            imageCount: (conv.images || []).length,
            savedAt: conv.savedAt,
            url: conv.url,
          });
        }
      }

      return {
        toolSummary,
        threads: threads.sort((a, b) => b.savedAt - a.savedAt).slice(0, 8),
        totalConversations: threads.length,
      };
    }

    case 'GET_BRIDGE_NOTIFICATION': {
      const activeId = await getActiveProjectId();
      if (!activeId) return { hasContext: false };

      const project = await getProject(activeId);
      const conversations = await getProjectConversations(activeId, message.currentTool);

      if (!conversations.length) return { hasContext: false };

      const latestConv = conversations[0];
      const topic = extractConversationTopic(latestConv.turns);
      const toolsUsed = [...new Set(conversations.map(c => c.toolName))];
      let totalCodeBlocks = 0;
      let totalImages = 0;
      for (const c of conversations) {
        totalCodeBlocks += (c.codeBlocks || []).length;
        totalImages += (c.images || []).length;
      }

      return {
        hasContext: true,
        projectName: project?.name || 'Unknown',
        latestTopic: topic,
        latestTool: latestConv.toolName,
        latestTurnCount: latestConv.turns.length,
        latestSavedAt: latestConv.savedAt,
        totalConversations: conversations.length,
        totalCodeBlocks,
        totalImages,
        toolsUsed,
      };
    }

    case 'GENERATE_BRIDGE_PROMPT': {
      const activeId = await getActiveProjectId();
      if (!activeId) return { prompt: '' };

      const project = await getProject(activeId);
      if (!project) return { prompt: '' };

      const conversations = await getProjectConversations(activeId, message.currentTool);
      if (!conversations.length) return { prompt: '' };

      const prompt = generateContinuationPrompt(project, conversations, message.currentTool);
      return { prompt };
    }

    // --- Workspace Profiles ---

    case 'GET_WORKSPACE_PROFILES': {
      const profiles = await getWorkspaceProfiles();
      const activeWs = await getActiveWorkspace();
      return { profiles, activeWorkspace: activeWs };
    }

    case 'SAVE_WORKSPACE_PROFILE': {
      const profile = await saveWorkspaceProfile(message.profile);
      return { success: true, profile };
    }

    case 'DELETE_WORKSPACE_PROFILE': {
      await deleteWorkspaceProfile(message.profileId);
      return { success: true };
    }

    case 'SET_ACTIVE_WORKSPACE': {
      await setActiveWorkspace(message.profileId);
      return { success: true };
    }

    // --- Pinning & Favorites ---

    case 'GET_PINNED_PROJECTS': {
      const pinned = await getPinnedProjects();
      return { pinned };
    }

    case 'TOGGLE_PIN_PROJECT': {
      const pinned = await togglePinProject(message.projectId);
      return { success: true, pinned };
    }

    case 'GET_FAVORITES': {
      const favorites = await getFavorites();
      return { favorites };
    }

    case 'TOGGLE_FAVORITE': {
      const favorites = await toggleFavorite(message.item);
      return { success: true, favorites };
    }

    // --- Artifact Gallery ---

    case 'GET_ARTIFACT_GALLERY': {
      const allConvos = await getAIConversations();
      const artifacts = [];

      for (const [projectId, convos] of Object.entries(allConvos)) {
        for (const conv of convos) {
          artifacts.push({
            projectId,
            toolName: conv.toolName,
            url: conv.url,
            title: conv.title,
            topic: extractConversationTopic(conv.turns),
            turns: conv.turns || [],
            codeBlocks: conv.codeBlocks || [],
            images: conv.images || [],
            savedAt: conv.savedAt,
          });
        }
      }

      artifacts.sort((a, b) => b.savedAt - a.savedAt);

      return { artifacts: artifacts.slice(0, 50) };
    }

    case 'SET_PENDING_BRIDGE': {
      pendingBridge = {
        ...message.artifact,
        timestamp: Date.now(),
      };
      return { success: true };
    }

    case 'GET_PENDING_BRIDGE': {
      if (pendingBridge && Date.now() - pendingBridge.timestamp < 60000) {
        const bridge = pendingBridge;
        pendingBridge = null;
        return { bridge };
      }
      pendingBridge = null;
      return { bridge: null };
    }

    // --- Dashboard Data ---

    case 'GET_DASHBOARD_DATA': {
      const [projects, activeId, log, pinned, favorites, dailyStats, wsProfiles, activeWs] = await Promise.all([
        getProjects(),
        getActiveProjectId(),
        getActivityLog(),
        getPinnedProjects(),
        getFavorites(),
        getDailyStats(),
        getWorkspaceProfiles(),
        getActiveWorkspace(),
      ]);

      const activeProject = activeId ? projects.find(p => p.id === activeId) : null;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayTs = todayStart.getTime();
      const todayActivity = log.filter(a => a.timestamp >= todayTs);
      const todayDomains = new Set(todayActivity.map(a => a.domain));
      const todayTime = todayActivity.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
      const todayProjects = new Set(todayActivity.map(a => a.projectId).filter(Boolean));

      const hourlyActivity = new Array(24).fill(0);
      todayActivity.forEach(a => {
        const hour = new Date(a.timestamp).getHours();
        hourlyActivity[hour]++;
      });

      const projectTimeMap = {};
      todayActivity.forEach(a => {
        if (a.projectId) {
          projectTimeMap[a.projectId] = (projectTimeMap[a.projectId] || 0) + (a.timeSpent || 0);
        }
      });

      const projectBreakdown = Object.entries(projectTimeMap)
        .map(([id, time]) => {
          const proj = projects.find(p => p.id === id);
          return { id, name: proj?.name || 'Unknown', time };
        })
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);

      const sessions = [];
      let currentSession = null;
      for (const activity of todayActivity.slice(0, 50)) {
        if (currentSession && currentSession.projectId === activity.projectId
            && activity.timestamp > currentSession.end - 10 * 60 * 1000) {
          currentSession.end = activity.timestamp;
          currentSession.items++;
        } else {
          if (currentSession) sessions.push(currentSession);
          const proj = activity.projectId ? projects.find(p => p.id === activity.projectId) : null;
          currentSession = {
            projectId: activity.projectId,
            projectName: proj?.name || activity.domain,
            start: activity.timestamp,
            end: activity.timestamp,
            items: 1,
            category: activity.category,
          };
        }
      }
      if (currentSession) sessions.push(currentSession);

      return {
        projects,
        activeProject,
        pinnedProjects: pinned,
        favorites,
        workspaceProfiles: wsProfiles,
        activeWorkspace: activeWs,
        today: {
          totalTime: todayTime,
          pageViews: todayActivity.length,
          uniqueSites: todayDomains.size,
          activeProjects: todayProjects.size,
          hourlyActivity,
          projectBreakdown,
          sessions: sessions.slice(0, 8),
        },
        dailyStats,
        recentActivity: todayActivity.slice(0, 10),
      };
    }

    case 'UPDATE_DAILY_STATS': {
      const stats = await updateDailyStats(message.stats);
      return { success: true, stats };
    }

    // ═══════════════════════════════════════
    //  AUTH (Supabase SaaS connection)
    // ═══════════════════════════════════════

    case 'AUTH_SIGN_IN': {
      try {
        const data = await sbRest.signIn(message.email, message.password);
        return { success: true, user: data.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'AUTH_SIGN_OUT': {
      await sbRest.signOut();
      sbRest.resetCaches();
      return { success: true };
    }

    case 'AUTH_STATUS': {
      const authed = await sbRest.isAuthenticated();
      const auth = await sbRest.getStoredAuth();
      return { authenticated: authed, user: auth?.user || null };
    }

    // ═══════════════════════════════════════
    //  PROMPT MANAGER
    // ═══════════════════════════════════════

    case 'PROMPT_GET_ALL': {
      if (!(await sbRest.isAuthenticated())) return { prompts: [], error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const auth = await sbRest.getStoredAuth();
        const userId = auth?.user?.id;
        // Only fetch prompts user created or that belong to their org (shared)
        const rows = await sbRest.select('prompts', `org_id=eq.${orgId}&order=updated_at.desc`);
        let prompts = (rows || []).map(sbRest.dbPromptToApp);
        // Filter out template/starter prompts — only show user-created or shared
        prompts = prompts.filter(p => !p.isTemplate);
        // Apply client-side filtering
        const q = (message.query || '').toLowerCase();
        const filters = message.filters || {};
        if (q) {
          prompts = prompts.filter(p =>
            p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q))
          );
        }
        if (filters.folderId) prompts = prompts.filter(p => p.folderId === filters.folderId);
        if (filters.favoritesOnly) prompts = prompts.filter(p => p.isFavorite);
        return { prompts };
      } catch (err) {
        return { prompts: [], error: err.message };
      }
    }

    case 'PROMPT_GET': {
      if (!(await sbRest.isAuthenticated())) return { prompt: null, error: 'auth_required' };
      try {
        const rows = await sbRest.select('prompts', `id=eq.${message.promptId}`);
        return { prompt: rows?.[0] ? sbRest.dbPromptToApp(rows[0]) : null };
      } catch (err) {
        return { prompt: null, error: err.message };
      }
    }

    case 'PROMPT_CREATE': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const auth = await sbRest.getStoredAuth();
        const row = { ...sbRest.appPromptToDb(message.fields || {}, orgId, auth.user.id), version: 1 };
        const data = await sbRest.insert('prompts', row);
        return { success: true, prompt: sbRest.dbPromptToApp(Array.isArray(data) ? data[0] : data) };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_UPDATE': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const row = sbRest.appPromptToDb(message.fields || {});
        const data = await sbRest.update('prompts', `id=eq.${message.promptId}`, row);
        return { success: true, prompt: sbRest.dbPromptToApp(Array.isArray(data) ? data[0] : data) };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_DELETE': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        await sbRest.del('prompts', `id=eq.${message.promptId}`);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_DUPLICATE': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const rows = await sbRest.select('prompts', `id=eq.${message.promptId}`);
        const orig = rows?.[0];
        if (!orig) return { error: 'Not found' };
        const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = orig;
        const data = await sbRest.insert('prompts', { ...rest, title: `${orig.title} (copy)`, version: 1, rating_total: 0, rating_count: 0, usage_count: 0 });
        return { success: true, prompt: sbRest.dbPromptToApp(Array.isArray(data) ? data[0] : data) };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_USE': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const rows = await sbRest.select('prompts', `id=eq.${message.promptId}`, 'usage_count');
        if (rows?.[0]) {
          await sbRest.update('prompts', `id=eq.${message.promptId}`, {
            usage_count: (rows[0].usage_count || 0) + 1,
            last_used_at: new Date().toISOString(),
          });
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_RATE': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const rows = await sbRest.select('prompts', `id=eq.${message.promptId}`, 'rating_total,rating_count');
        if (rows?.[0]) {
          const stars = Math.max(1, Math.min(5, Math.round(message.stars)));
          await sbRest.update('prompts', `id=eq.${message.promptId}`, {
            rating_total: (rows[0].rating_total || 0) + stars,
            rating_count: (rows[0].rating_count || 0) + 1,
          });
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_TOGGLE_FAVORITE': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const rows = await sbRest.select('prompts', `id=eq.${message.promptId}`, 'is_favorite');
        if (rows?.[0]) {
          await sbRest.update('prompts', `id=eq.${message.promptId}`, { is_favorite: !rows[0].is_favorite });
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_GET_FOLDERS': {
      if (!(await sbRest.isAuthenticated())) return { folders: [], error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const folders = await sbRest.select('folders', `org_id=eq.${orgId}`);
        return { folders: folders || [] };
      } catch (err) {
        return { folders: [], error: err.message };
      }
    }

    case 'PROMPT_SAVE_FOLDER': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const folderData = { ...message.folder, org_id: orgId };
        if (folderData.id) {
          const data = await sbRest.update('folders', `id=eq.${folderData.id}`, folderData);
          return { success: true, folder: Array.isArray(data) ? data[0] : data };
        } else {
          const data = await sbRest.insert('folders', folderData);
          return { success: true, folder: Array.isArray(data) ? data[0] : data };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_DELETE_FOLDER': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        await sbRest.del('folders', `id=eq.${message.folderId}`);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_GET_DEPARTMENTS': {
      if (!(await sbRest.isAuthenticated())) return { departments: [], error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const departments = await sbRest.select('departments', `org_id=eq.${orgId}`);
        return { departments: departments || [] };
      } catch (err) {
        return { departments: [], error: err.message };
      }
    }

    case 'PROMPT_SAVE_DEPARTMENT': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const deptData = { ...message.department, org_id: orgId };
        if (deptData.id) {
          const data = await sbRest.update('departments', `id=eq.${deptData.id}`, deptData);
          return { success: true, department: Array.isArray(data) ? data[0] : data };
        } else {
          const data = await sbRest.insert('departments', deptData);
          return { success: true, department: Array.isArray(data) ? data[0] : data };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_DELETE_DEPARTMENT': {
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        await sbRest.del('departments', `id=eq.${message.departmentId}`);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_GET_ANALYTICS': {
      if (!(await sbRest.isAuthenticated())) return { summary: null, error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const prompts = await sbRest.select('prompts', `org_id=eq.${orgId}`, 'id,title,usage_count,rating_total,rating_count,department_id');
        const totalPrompts = prompts?.length || 0;
        const totalUses = (prompts || []).reduce((s, p) => s + (p.usage_count || 0), 0);
        const rated = (prompts || []).filter(p => p.rating_count > 0);
        const avgRating = rated.length ? Math.round(rated.reduce((s, p) => s + p.rating_total / p.rating_count, 0) / rated.length * 10) / 10 : 0;
        return { summary: { totalPrompts, totalUses, avgRating } };
      } catch (err) {
        return { summary: null, error: err.message };
      }
    }

    case 'PROMPT_INSTALL_STARTERS': {
      await installStarterPacks();
      return { success: true };
    }

    case 'PROMPT_IS_STARTER_INSTALLED': {
      const installed = await isStarterInstalled();
      return { installed };
    }

    case 'PROMPT_ADD_TEMPLATE': {
      // Copy a template prompt into the user's Supabase collection
      if (!(await sbRest.isAuthenticated())) return { success: false, error: 'auth_required' };
      try {
        const orgId = await sbRest.getOrgId();
        const auth = await sbRest.getStoredAuth();
        const fields = message.fields || {};
        const row = { ...sbRest.appPromptToDb(fields, orgId, auth.user.id), version: 1 };
        const data = await sbRest.insert('prompts', row);
        return { success: true, prompt: sbRest.dbPromptToApp(Array.isArray(data) ? data[0] : data) };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PROMPT_INSERT': {
      // Insert prompt into active AI tool tab
      if (!(await sbRest.isAuthenticated())) return { error: 'auth_required' };
      let prompt = null;
      try {
        const rows = await sbRest.select('prompts', `id=eq.${message.promptId}`);
        prompt = rows?.[0] ? sbRest.dbPromptToApp(rows[0]) : null;
      } catch { /* ignore */ }
      if (!prompt) return { error: 'Prompt not found' };

      // Record usage
      await recordPromptUsage(message.promptId);

      // Get department constraints if applicable
      let fullText = prompt.content;
      if (prompt.departmentId) {
        const depts = await getDepartments();
        const dept = depts.find(d => d.id === prompt.departmentId);
        if (dept) {
          const rules = [];
          if (dept.toneRules.length) rules.push(`Tone: ${dept.toneRules.join(', ')}`);
          if (dept.doList.length) rules.push(`Do: ${dept.doList.join('; ')}`);
          if (dept.dontList.length) rules.push(`Don't: ${dept.dontList.join('; ')}`);
          if (rules.length) {
            fullText += `\n\n[${dept.name} Guidelines: ${rules.join(' | ')}]`;
          }
        }
      }

      // Try to insert into active tab
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'INSERT_PROMPT',
            text: fullText,
            promptTitle: prompt.title,
          });
        }
      } catch {
        // Content script may not be loaded
      }

      return { success: true, text: fullText };
    }

    // ═══════════════════════════════════════
    //  TEAM & ORGANIZATION
    // ═══════════════════════════════════════

    case 'TEAM_GET_ORG': {
      const org = await getOrg();
      return { org };
    }
    case 'TEAM_SAVE_ORG': {
      const org = await saveOrg(message.org);
      return { success: true, org };
    }
    case 'TEAM_GET_TEAMS': {
      const teams = await getTeams();
      return { teams };
    }
    case 'TEAM_GET_TEAM': {
      const team = await getTeam(message.teamId);
      return { team };
    }
    case 'TEAM_SAVE_TEAM': {
      const team = await saveTeam(message.team);
      return { success: true, team };
    }
    case 'TEAM_DELETE_TEAM': {
      await deleteTeam(message.teamId);
      return { success: true };
    }
    case 'TEAM_GET_MEMBERS': {
      const members = await getMembers();
      return { members };
    }
    case 'TEAM_GET_MEMBER': {
      const member = await getMember(message.memberId);
      return { member };
    }
    case 'TEAM_GET_CURRENT_USER': {
      const user = await getCurrentUser();
      return { user };
    }
    case 'TEAM_SAVE_MEMBER': {
      const member = await saveMember(message.member);
      return { success: true, member };
    }
    case 'TEAM_DELETE_MEMBER': {
      await deleteMember(message.memberId);
      return { success: true };
    }
    case 'TEAM_SETUP_USER': {
      const user = await setupCurrentUser(message.name, message.email, message.role);
      return { success: true, user };
    }
    case 'TEAM_GET_COLLECTIONS': {
      const collections = await getCollections();
      return { collections };
    }
    case 'TEAM_GET_COLLECTION': {
      const collection = await getCollection(message.collId);
      return { collection };
    }
    case 'TEAM_SAVE_COLLECTION': {
      const collection = await saveCollection(message.collection);
      return { success: true, collection };
    }
    case 'TEAM_DELETE_COLLECTION': {
      await deleteCollection(message.collId);
      return { success: true };
    }
    case 'TEAM_ADD_PROMPT_TO_COLLECTION': {
      const coll = await addPromptToCollection(message.collId, message.promptId);
      return { success: !!coll, collection: coll };
    }
    case 'TEAM_REMOVE_PROMPT_FROM_COLLECTION': {
      const coll = await removePromptFromCollection(message.collId, message.promptId);
      return { success: !!coll, collection: coll };
    }
    case 'TEAM_GET_STANDARDS': {
      const standards = await getStandards();
      return { standards };
    }
    case 'TEAM_GET_STANDARD': {
      const standard = await getStandard(message.stdId);
      return { standard };
    }
    case 'TEAM_SAVE_STANDARD': {
      const standard = await saveStandard(message.standard);
      return { success: true, standard };
    }
    case 'TEAM_DELETE_STANDARD': {
      await deleteStandard(message.stdId);
      return { success: true };
    }
    case 'TEAM_VALIDATE_PROMPT': {
      const result = await validatePromptAgainstStandards(message.prompt);
      return result;
    }
    case 'TEAM_EXPORT_PACK': {
      const pack = await exportPromptPack(message.promptIds, message.packName);
      return { success: true, pack };
    }
    case 'TEAM_IMPORT_PACK': {
      const result = await importPromptPack(message.packData);
      return result;
    }
    case 'TEAM_INSTALL_DEFAULT_STANDARDS': {
      await installDefaultStandards();
      return { success: true };
    }

    // ═══════════════════════════════════════
    //  DASHBOARD DATA (combined endpoint)
    // ═══════════════════════════════════════

    case 'VAULT_GET_ALL': {
      if (!(await sbRest.isAuthenticated())) return { error: 'auth_required', prompts: [], folders: [], departments: [] };
      try {
        const orgId = await sbRest.getOrgId();
        const [prompts, folders, departments] = await Promise.all([
          sbRest.select('prompts', `org_id=eq.${orgId}&order=updated_at.desc`),
          sbRest.select('folders', `org_id=eq.${orgId}`),
          sbRest.select('departments', `org_id=eq.${orgId}`),
        ]);
        const mappedPrompts = (prompts || []).map(sbRest.dbPromptToApp);
        return {
          prompts: mappedPrompts,
          folders: folders || [],
          departments: departments || [],
          org: null, teams: [], members: [], collections: [], standards: [],
          analytics: { totalPrompts: mappedPrompts.length, totalUses: 0, avgRating: 0, usesThisWeek: 0, topPrompts: [], departmentUsage: {} },
        };
      } catch (err) {
        return { error: err.message, prompts: [], folders: [], departments: [] };
      }
    }

    default:
      return { error: 'Unknown message type' };
  }
}
