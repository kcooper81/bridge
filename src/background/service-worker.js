// ContextIQ Background Service Worker
// Handles tab tracking, activity capture, time tracking, project inference, and messaging

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

// --- State ---
let lastActiveTabId = null;
let lastActiveUrl = '';
let lastActivityTime = Date.now();
let lastActivityId = null; // Track current activity for time updates
let tabStartTime = Date.now(); // When user started viewing current tab
let currentTabUrl = ''; // URL being timed

// --- Initialization ---

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/onboarding.html') });
  }

  // Set up periodic alarms
  chrome.alarms.create(ALARM_NAMES.CLUSTERING, { periodInMinutes: 5 });
  chrome.alarms.create(ALARM_NAMES.CLEANUP, { periodInMinutes: 60 });
  chrome.alarms.create(ALARM_NAMES.TIME_TRACKING, { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.CLUSTERING) {
    await reclusterProjects();
    const projects = await getProjects();
    await summarizeAllProjects(projects);
  }
  if (alarm.name === ALARM_NAMES.TIME_TRACKING) {
    // Flush time for current tab
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
  if (elapsed < 2) return; // ignore trivial time

  // Cap at 30 minutes per flush to avoid runaway timers
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

  tabStartTime = Date.now(); // Reset for next interval
}

// --- Tab Tracking ---

/**
 * Extract email subject from Gmail tab titles.
 */
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

  // Skip internal pages
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
    return;
  }

  const domain = extractDomain(tab.url);

  // Check excluded domains
  if (settings.excludedDomains.includes(domain)) return;

  // Flush time for the previous tab before switching
  await flushTabTime();

  // Respect captureUrls and captureTitles settings
  const activityItem = {
    url: settings.captureUrls ? tab.url : `https://${domain}/`,
    title: settings.captureTitles ? tab.title : domain,
    domain,
    category: categorizeDomain(domain),
    favIconUrl: tab.favIconUrl || '',
    referrerUrl: currentTabUrl || '',
  };

  // Extract email subject from Gmail tabs
  const emailSubject = extractEmailSubject(tab.title, domain);
  if (emailSubject) {
    activityItem.emailSubject = emailSubject;
    activityItem.title = emailSubject;
  }

  // Avoid logging duplicate consecutive activity
  if (tab.url === lastActiveUrl) return;
  lastActiveUrl = tab.url;
  currentTabUrl = tab.url;
  lastActivityTime = Date.now();
  tabStartTime = Date.now(); // Start timing new tab

  // Log activity
  const log = await addActivity(activityItem);
  lastActivityId = log[0]?.id || null;

  // Infer project
  const projectId = await inferProject(activityItem);
  if (projectId) {
    await setActiveProjectId(projectId);
    // Link activity to project
    if (lastActivityId) {
      await updateActivity(lastActivityId, { projectId });
    }
  }

  // Track daily stats
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
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus — flush time
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
});

// --- Message Handling ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    sendResponse({ error: err.message });
  });
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender) {
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
      // Assign an activity log entry to a project + add it as a project item
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
      // Received from context-extractor content script
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

      // Get conversations from OTHER tools (not the one currently asking)
      const conversations = await getProjectConversations(activeId, message.currentTool);
      if (!conversations.length) return { bridgeContext: '', conversationCount: 0, toolsUsed: [] };

      const toolsUsed = [...new Set(conversations.map(c => c.toolName))];

      // Build the bridge context string
      const lines = ['--- AI Conversation Bridge ---'];
      lines.push(`Context from: ${toolsUsed.join(', ')}`);
      lines.push('');

      // Include recent conversations from other tools
      const recent = conversations.slice(0, 3);
      for (const conv of recent) {
        lines.push(`[${conv.toolName}] ${conv.title || 'Untitled'}`);
        // Include the last few turns (summarized)
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

      // Compute today's stats from activity log
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayTs = todayStart.getTime();
      const todayActivity = log.filter(a => a.timestamp >= todayTs);
      const todayDomains = new Set(todayActivity.map(a => a.domain));
      const todayTime = todayActivity.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
      const todayProjects = new Set(todayActivity.map(a => a.projectId).filter(Boolean));

      // Build hourly activity heatmap for today (24 hours)
      const hourlyActivity = new Array(24).fill(0);
      todayActivity.forEach(a => {
        const hour = new Date(a.timestamp).getHours();
        hourlyActivity[hour]++;
      });

      // Project time breakdown for today
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

      // Recent sessions (group consecutive activity by project)
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

    default:
      return { error: 'Unknown message type' };
  }
}
