// ContextIQ Storage Layer
// Abstraction over Chrome local storage with structured data access

import { STORAGE_KEYS, DEFAULT_SETTINGS, MAX_PROJECT_ITEMS, MAX_PROJECTS } from './constants.js';

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

export async function addActivity(activity) {
  const log = await getActivityLog();
  log.unshift({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...activity,
  });

  const settings = await getSettings();
  const trimmed = log.slice(0, settings.maxActivityItems);
  await set(STORAGE_KEYS.ACTIVITY_LOG, trimmed);
  return trimmed;
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

// --- Onboarding ---

export async function isOnboardingComplete() {
  return (await get(STORAGE_KEYS.ONBOARDING_COMPLETE)) === true;
}

export async function markOnboardingComplete() {
  await set(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
}
