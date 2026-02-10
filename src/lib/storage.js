// ContextIQ Storage Layer
// Abstraction over Chrome local storage with structured data access

import { STORAGE_KEYS, DEFAULT_SETTINGS, MAX_PROJECT_ITEMS, MAX_PROJECTS, MAX_ACTIVITY_LOG } from './constants.js';

/**
 * Get a value from Chrome local storage.
 */
export async function get(key) {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? null;
}

/**
 * Set a value in Chrome local storage.
 */
export async function set(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * Remove a key from Chrome local storage.
 */
export async function remove(key) {
  await chrome.storage.local.remove(key);
}

// --- Settings ---

export async function getSettings() {
  const stored = await get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function updateSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await set(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// --- Activity Log ---

export async function getActivityLog() {
  return (await get(STORAGE_KEYS.ACTIVITY_LOG)) || [];
}

/**
 * Add an activity item with enhanced data:
 * - pageContent: { description, headings, codeBlocks, selectedText }
 * - timeSpent: seconds spent on page (updated later)
 * - referrerUrl: where user came from
 * - engagementScore: computed from time + interactions
 */
export async function addActivity(activity) {
  const log = await getActivityLog();
  log.unshift({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    timeSpent: 0,
    referrerUrl: '',
    engagementScore: 0,
    pageContent: null,
    projectId: null,
    manuallyAssigned: false,
    ...activity,
  });

  const settings = await getSettings();
  const max = settings.maxActivityItems || MAX_ACTIVITY_LOG;
  const trimmed = log.slice(0, max);
  await set(STORAGE_KEYS.ACTIVITY_LOG, trimmed);
  return trimmed;
}

/**
 * Update an existing activity item by ID (e.g. to add time spent or page content).
 */
export async function updateActivity(activityId, updates) {
  const log = await getActivityLog();
  const idx = log.findIndex(a => a.id === activityId);
  if (idx < 0) return null;
  log[idx] = { ...log[idx], ...updates };
  await set(STORAGE_KEYS.ACTIVITY_LOG, log);
  return log[idx];
}

/**
 * Get a single activity item by ID.
 */
export async function getActivityItem(activityId) {
  const log = await getActivityLog();
  return log.find(a => a.id === activityId) || null;
}

/**
 * Assign an activity item to a project.
 */
export async function assignActivityToProject(activityId, projectId) {
  return updateActivity(activityId, { projectId, manuallyAssigned: true });
}

export async function clearActivityLog() {
  await set(STORAGE_KEYS.ACTIVITY_LOG, []);
}

// --- Projects ---

export async function getProjects() {
  return (await get(STORAGE_KEYS.PROJECTS)) || [];
}

export async function getProject(projectId) {
  const projects = await getProjects();
  return projects.find(p => p.id === projectId) || null;
}

export async function saveProject(project) {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    if (projects.length >= MAX_PROJECTS) {
      // Remove the oldest inactive project
      const sorted = [...projects].sort((a, b) => a.lastActivity - b.lastActivity);
      const removeId = sorted[0].id;
      const removeIdx = projects.findIndex(p => p.id === removeId);
      projects.splice(removeIdx, 1);
    }
    projects.push(project);
  }
  await set(STORAGE_KEYS.PROJECTS, projects);
  return project;
}

export async function deleteProject(projectId) {
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  await set(STORAGE_KEYS.PROJECTS, filtered);

  const active = await getActiveProjectId();
  if (active === projectId) {
    await setActiveProjectId(null);
  }
}

export async function addItemToProject(projectId, item) {
  const project = await getProject(projectId);
  if (!project) return null;

  // Deduplicate by URL
  const existing = project.items.findIndex(i => i.url === item.url);
  if (existing >= 0) {
    project.items[existing] = { ...project.items[existing], ...item, lastSeen: Date.now() };
  } else {
    project.items.unshift({
      id: crypto.randomUUID(),
      addedAt: Date.now(),
      lastSeen: Date.now(),
      ...item,
    });
  }

  project.items = project.items.slice(0, MAX_PROJECT_ITEMS);
  project.lastActivity = Date.now();
  await saveProject(project);
  return project;
}

export async function removeItemFromProject(projectId, itemId) {
  const project = await getProject(projectId);
  if (!project) return null;
  project.items = project.items.filter(i => i.id !== itemId);
  await saveProject(project);
  return project;
}

/**
 * Move an item from one project to another.
 */
export async function moveItemToProject(fromProjectId, toProjectId, itemId) {
  const fromProject = await getProject(fromProjectId);
  if (!fromProject) return null;

  const item = fromProject.items.find(i => i.id === itemId);
  if (!item) return null;

  // Remove from source
  fromProject.items = fromProject.items.filter(i => i.id !== itemId);
  await saveProject(fromProject);

  // Add to destination
  const result = await addItemToProject(toProjectId, { ...item, id: undefined });
  return result;
}

/**
 * Add a manual item (URL + title) to a project.
 */
export async function addManualItemToProject(projectId, url, title) {
  const { extractDomain, categorizeDomain } = await import('./utils.js');
  const domain = extractDomain(url);
  const category = categorizeDomain(domain);

  return addItemToProject(projectId, {
    url,
    title: title || url,
    domain,
    category,
    favIconUrl: '',
    manuallyAdded: true,
  });
}

export function createProject(name, items = []) {
  return {
    id: crypto.randomUUID(),
    name,
    items,
    tags: [],
    createdAt: Date.now(),
    lastActivity: Date.now(),
    isManual: false,
    summary: '',
  };
}

// --- Active Project ---

export async function getActiveProjectId() {
  return await get(STORAGE_KEYS.ACTIVE_PROJECT);
}

export async function setActiveProjectId(projectId) {
  await set(STORAGE_KEYS.ACTIVE_PROJECT, projectId);
}

// --- Tab Time Tracking ---

export async function getTabTimeData() {
  return (await get(STORAGE_KEYS.TAB_TIME_TRACKING)) || {};
}

export async function updateTabTime(tabKey, seconds) {
  const data = await getTabTimeData();
  data[tabKey] = (data[tabKey] || 0) + seconds;
  await set(STORAGE_KEYS.TAB_TIME_TRACKING, data);
  return data[tabKey];
}

// --- AI Conversations ---

/**
 * Get all saved AI conversations for a project.
 * Structure: { [projectId]: [ { toolName, url, title, turns, savedAt } ] }
 */
export async function getAIConversations() {
  return (await get(STORAGE_KEYS.AI_CONVERSATIONS)) || {};
}

/**
 * Save or update an AI conversation snapshot.
 */
export async function saveAIConversation(projectId, conversation) {
  const all = await getAIConversations();
  if (!all[projectId]) all[projectId] = [];

  // Deduplicate by URL — update existing or add new
  const existing = all[projectId].findIndex(c => c.url === conversation.url);
  const entry = {
    ...conversation,
    savedAt: Date.now(),
  };

  if (existing >= 0) {
    all[projectId][existing] = entry;
  } else {
    all[projectId].unshift(entry);
  }

  // Keep max 20 conversations per project
  all[projectId] = all[projectId].slice(0, 20);
  await set(STORAGE_KEYS.AI_CONVERSATIONS, all);
  return entry;
}

/**
 * Get conversations for the active project, optionally excluding a specific tool.
 */
export async function getProjectConversations(projectId, excludeTool = null) {
  const all = await getAIConversations();
  const convos = all[projectId] || [];
  if (excludeTool) {
    return convos.filter(c => c.toolName !== excludeTool);
  }
  return convos;
}

// --- Onboarding ---

export async function isOnboardingComplete() {
  return (await get(STORAGE_KEYS.ONBOARDING_COMPLETE)) === true;
}

export async function markOnboardingComplete() {
  await set(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
}
