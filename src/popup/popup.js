// ContextIQ Smart Dashboard Popup

import { buildContextString, timeAgo, formatDuration, truncate, extractDomain, categorizeDomain } from '../lib/utils.js';
import {
  getProjects, getProject, getActiveProjectId, setActiveProjectId,
  saveProject, createProject, deleteProject, removeItemFromProject,
  getSettings, updateSettings, addManualItemToProject, moveItemToProject,
} from '../lib/storage.js';
import { WORKSPACE_PRESETS } from '../lib/constants.js';

// --- DOM ---
const dashboardView = document.getElementById('dashboard-view');
const projectView = document.getElementById('project-view');
const toast = document.getElementById('toast');

// Header
const btnWorkspace = document.getElementById('btn-workspace');
const workspaceLabel = document.getElementById('workspace-label');
const btnActivityLog = document.getElementById('btn-activity-log');
const btnSettings = document.getElementById('btn-settings');
const btnToggleTracking = document.getElementById('btn-toggle-tracking');

// Dashboard
const statTime = document.getElementById('stat-time');
const statPages = document.getElementById('stat-pages');
const statSites = document.getElementById('stat-sites');
const statProjects = document.getElementById('stat-projects');
const heatmapEl = document.getElementById('heatmap');
const timelineEl = document.getElementById('timeline');
const timelineSection = document.getElementById('timeline-section');
const pinnedSection = document.getElementById('pinned-section');
const pinnedProjectsEl = document.getElementById('pinned-projects');
const apcName = document.getElementById('apc-name');
const apcMeta = document.getElementById('apc-meta');
const btnPinActive = document.getElementById('btn-pin-active');
const btnCopyContext = document.getElementById('btn-copy-context');
const btnViewProject = document.getElementById('btn-view-project');
const btnAddItem = document.getElementById('btn-add-item');
const btnNewProject = document.getElementById('btn-new-project');
const projectListEl = document.getElementById('project-list');
const favoritesSection = document.getElementById('favorites-section');
const favoritesListEl = document.getElementById('favorites-list');
const recentListEl = document.getElementById('recent-list');
const btnSeeAllActivity = document.getElementById('btn-see-all-activity');

// Workspace dropdown
const workspaceDropdown = document.getElementById('workspace-dropdown');
const wsListEl = document.getElementById('ws-list');
const wsBtnCreate = document.getElementById('ws-btn-create');

// Project detail view
const btnBack = document.getElementById('btn-back');
const pvName = document.getElementById('pv-name');
const pvNameInput = document.getElementById('pv-name-input');
const pvTags = document.getElementById('pv-tags');
const pvTagsList = document.getElementById('pv-tags-list');
const pvSummaryContainer = document.getElementById('pv-summary-container');
const pvSummary = document.getElementById('pv-summary');
const pvBtnCopy = document.getElementById('pv-btn-copy');
const pvBtnResume = document.getElementById('pv-btn-resume');
const pvBtnTag = document.getElementById('pv-btn-tag');
const pvBtnAdd = document.getElementById('pv-btn-add');
const pvBtnPin = document.getElementById('pv-btn-pin');
const pvBtnDelete = document.getElementById('pv-btn-delete');
const pvItems = document.getElementById('pv-items');

// --- State ---
let dashboardData = null;
let currentProject = null;
let pinnedIds = [];

// --- Init ---

async function init() {
  await loadDashboard();
  await loadTrackingState();
  bindEvents();
}

async function loadDashboard() {
  try {
    dashboardData = await chrome.runtime.sendMessage({ type: 'GET_DASHBOARD_DATA' });
  } catch {
    dashboardData = null;
  }

  if (!dashboardData) return;

  const d = dashboardData;
  pinnedIds = d.pinnedProjects || [];

  // Stats bar
  statTime.textContent = formatDuration(d.today.totalTime) || '0m';
  statPages.textContent = d.today.pageViews;
  statSites.textContent = d.today.uniqueSites;
  statProjects.textContent = d.today.activeProjects;

  // Heatmap
  renderHeatmap(d.today.hourlyActivity);

  // Timeline
  renderTimeline(d.today.sessions);

  // Pinned projects
  renderPinnedProjects(d.projects, d.pinnedProjects);

  // Active project card
  renderActiveProjectCard(d.activeProject);

  // All projects
  renderProjectList(d.projects);

  // Favorites
  renderFavorites(d.favorites);

  // Recent activity
  renderRecentActivity(d.recentActivity);

  // Workspace chip
  renderWorkspaceChip(d.workspaceProfiles, d.activeWorkspace);
}

async function loadTrackingState() {
  const settings = await getSettings();
  updateTrackingButton(settings.trackingEnabled);
}

function updateTrackingButton(enabled) {
  btnToggleTracking.classList.toggle('tracking-on', enabled);
  btnToggleTracking.classList.toggle('tracking-off', !enabled);
  btnToggleTracking.title = enabled ? 'Tracking enabled' : 'Tracking paused';
}

// --- Render ---

function renderHeatmap(hourly) {
  heatmapEl.innerHTML = '';
  const max = Math.max(...hourly, 1);
  for (let i = 0; i < 24; i++) {
    const bar = document.createElement('div');
    bar.className = 'heatmap-bar';
    const intensity = hourly[i] / max;
    bar.style.opacity = Math.max(0.15, intensity);
    if (hourly[i] > 0) {
      bar.classList.add('active');
      bar.title = `${formatHour(i)}: ${hourly[i]} page${hourly[i] !== 1 ? 's' : ''}`;
    }
    heatmapEl.appendChild(bar);
  }
}

function renderTimeline(sessions) {
  if (!sessions || sessions.length === 0) {
    timelineSection.classList.add('hidden');
    return;
  }
  timelineSection.classList.remove('hidden');
  timelineEl.innerHTML = sessions.map(s => {
    const time = new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const catClass = s.category || 'other';
    return `
      <div class="timeline-item" data-project-id="${s.projectId || ''}">
        <div class="timeline-dot ${catClass}"></div>
        <div class="timeline-info">
          <span class="timeline-name">${esc(truncate(s.projectName, 30))}</span>
          <span class="timeline-time">${time}</span>
        </div>
        <span class="timeline-count">${s.items} pg</span>
      </div>
    `;
  }).join('');
}

function renderPinnedProjects(projects, pinnedIds) {
  if (!pinnedIds || pinnedIds.length === 0) {
    pinnedSection.classList.add('hidden');
    return;
  }
  pinnedSection.classList.remove('hidden');
  const pinned = pinnedIds.map(id => projects.find(p => p.id === id)).filter(Boolean);
  pinnedProjectsEl.innerHTML = pinned.map(p => `
    <div class="pinned-card" data-project-id="${p.id}">
      <div class="pinned-name">${esc(truncate(p.name, 20))}</div>
      <div class="pinned-meta">${p.items.length} items</div>
    </div>
  `).join('');
}

function renderActiveProjectCard(project) {
  if (!project) {
    apcName.textContent = 'No active project';
    apcMeta.textContent = 'Start browsing to auto-detect';
    btnPinActive.style.display = 'none';
    btnCopyContext.disabled = true;
    btnViewProject.disabled = true;
    return;
  }

  apcName.textContent = project.name;
  const itemCount = project.items?.length || 0;
  const tags = project.tags?.length ? ` | ${project.tags.join(', ')}` : '';
  apcMeta.textContent = `${itemCount} resources${tags}`;
  btnPinActive.style.display = '';
  btnCopyContext.disabled = false;
  btnViewProject.disabled = false;
  btnPinActive.classList.toggle('pinned', pinnedIds.includes(project.id));
}

function renderProjectList(projects) {
  if (!projects || projects.length === 0) {
    projectListEl.innerHTML = '<div class="empty-hint">No projects yet</div>';
    return;
  }

  const sorted = [...projects].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
    const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return (b.lastActivity || 0) - (a.lastActivity || 0);
  });

  projectListEl.innerHTML = sorted.slice(0, 10).map(p => {
    const isPinned = pinnedIds.includes(p.id);
    const isActive = dashboardData?.activeProject?.id === p.id;
    const timeStr = p.lastActivity ? timeAgo(p.lastActivity) : '';
    return `
      <div class="pl-item ${isActive ? 'active' : ''}" data-project-id="${p.id}">
        ${isPinned ? '<span class="pl-pin-indicator">*</span>' : ''}
        <div class="pl-info">
          <span class="pl-name">${esc(truncate(p.name, 30))}</span>
          <span class="pl-meta">${p.items.length} items${timeStr ? ' | ' + timeStr : ''}</span>
        </div>
        <button class="pl-set-active" data-project-id="${p.id}" title="Set as active">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');
}

function renderFavorites(favorites) {
  if (!favorites || favorites.length === 0) {
    favoritesSection.classList.add('hidden');
    return;
  }
  favoritesSection.classList.remove('hidden');
  favoritesListEl.innerHTML = favorites.slice(0, 5).map(f => `
    <div class="fav-item" data-url="${esc(f.url)}">
      ${f.favIconUrl
        ? `<img class="fav-icon" src="${esc(f.favIconUrl)}" alt="" onerror="this.style.display='none'">`
        : '<div class="fav-icon-placeholder"></div>'}
      <span class="fav-title">${esc(truncate(f.title, 35))}</span>
      <button class="fav-remove" data-url="${esc(f.url)}" title="Remove">x</button>
    </div>
  `).join('');
}

function renderRecentActivity(activities) {
  if (!activities || activities.length === 0) {
    recentListEl.innerHTML = '<div class="empty-hint">No activity today</div>';
    return;
  }

  recentListEl.innerHTML = activities.slice(0, 8).map(a => {
    const time = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="recent-item" data-url="${esc(a.url)}">
        <span class="recent-time">${time}</span>
        <div class="recent-info">
          <span class="recent-title">${esc(truncate(a.title, 40))}</span>
          <span class="recent-domain">${esc(a.domain)}</span>
        </div>
        <button class="recent-fav" data-url="${esc(a.url)}" data-title="${esc(a.title)}" data-domain="${esc(a.domain)}" data-favicon="${esc(a.favIconUrl || '')}" title="Favorite">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');
}

function renderWorkspaceChip(profiles, activeId) {
  if (activeId && profiles?.length > 0) {
    const active = profiles.find(p => p.id === activeId);
    if (active) {
      workspaceLabel.textContent = active.name;
      btnWorkspace.style.borderColor = active.color || '';
      return;
    }
  }
  workspaceLabel.textContent = 'General';
  btnWorkspace.style.borderColor = '';
}

// --- Project Detail View ---

function showProjectView(project) {
  currentProject = project;
  dashboardView.classList.add('hidden');
  projectView.classList.remove('hidden');
  pvName.textContent = project.name;

  // Tags
  if (project.tags && project.tags.length > 0) {
    pvTags.classList.remove('hidden');
    pvTagsList.innerHTML = project.tags.map(tag =>
      `<span class="tag">${esc(tag)}<span class="tag-remove" data-tag="${esc(tag)}">x</span></span>`
    ).join('');
  } else {
    pvTags.classList.add('hidden');
  }

  // Summary
  if (project.summary) {
    pvSummaryContainer.classList.remove('hidden');
    pvSummary.textContent = project.summary;
  } else {
    pvSummaryContainer.classList.add('hidden');
  }

  // Pin state
  pvBtnPin.classList.toggle('pinned', pinnedIds.includes(project.id));

  // Items
  if (project.items && project.items.length > 0) {
    pvItems.innerHTML = project.items.map(item => {
      const category = item.category || categorizeDomain(extractDomain(item.url));
      const favicon = item.favIconUrl
        ? `<img class="item-favicon" src="${esc(item.favIconUrl)}" alt="" onerror="this.style.display='none'">`
        : `<div class="item-favicon-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>`;
      const timeSpent = item.timeSpent > 5 ? `<span class="item-time-spent">${formatDuration(item.timeSpent)}</span>` : '';

      return `
        <div class="item" data-url="${esc(item.url)}" data-item-id="${item.id}">
          ${favicon}
          <div class="item-info">
            <div class="item-title">${esc(truncate(item.title, 50))}</div>
            <div class="item-meta">
              <span class="item-domain">${esc(item.domain || extractDomain(item.url))}</span>
              ${timeSpent}
            </div>
          </div>
          <span class="category-badge ${category}">${category}</span>
          <span class="item-time">${timeAgo(item.lastSeen || item.addedAt)}</span>
          <button class="item-fav" data-url="${esc(item.url)}" data-title="${esc(item.title)}" data-domain="${esc(item.domain || '')}" data-favicon="${esc(item.favIconUrl || '')}" title="Favorite">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
            </svg>
          </button>
          <button class="item-remove" data-item-id="${item.id}" title="Remove">x</button>
        </div>
      `;
    }).join('');
  } else {
    pvItems.innerHTML = '<div class="empty-state">No items tracked yet</div>';
  }
}

function showDashboardView() {
  currentProject = null;
  projectView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  loadDashboard();
}

// --- Events ---

function bindEvents() {
  btnActivityLog.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/activity-log/activity-log.html') });
  });
  btnSettings.addEventListener('click', () => chrome.runtime.openOptionsPage());
  btnToggleTracking.addEventListener('click', async () => {
    const settings = await getSettings();
    const updated = await updateSettings({ trackingEnabled: !settings.trackingEnabled });
    updateTrackingButton(updated.trackingEnabled);
    showToast(updated.trackingEnabled ? 'Tracking enabled' : 'Tracking paused');
  });

  // Workspace
  btnWorkspace.addEventListener('click', (e) => {
    e.stopPropagation();
    workspaceDropdown.classList.toggle('hidden');
    if (!workspaceDropdown.classList.contains('hidden')) renderWorkspaceDropdown();
  });
  document.addEventListener('click', (e) => {
    if (!workspaceDropdown.contains(e.target) && e.target !== btnWorkspace) {
      workspaceDropdown.classList.add('hidden');
    }
  });
  wsBtnCreate.addEventListener('click', () => showCreateWorkspaceModal());

  // Active project card
  btnPinActive.addEventListener('click', async () => {
    if (!dashboardData?.activeProject) return;
    await chrome.runtime.sendMessage({ type: 'TOGGLE_PIN_PROJECT', projectId: dashboardData.activeProject.id });
    await loadDashboard();
    showToast('Pin toggled');
  });
  btnCopyContext.addEventListener('click', async () => {
    if (!dashboardData?.activeProject) return;
    const context = buildContextString(dashboardData.activeProject);
    await navigator.clipboard.writeText(context);
    showToast('Context copied');
  });
  btnViewProject.addEventListener('click', async () => {
    if (!dashboardData?.activeProject) return;
    const project = await getProject(dashboardData.activeProject.id);
    if (project) showProjectView(project);
  });
  btnAddItem.addEventListener('click', () => {
    if (!dashboardData?.activeProject) return;
    showAddItemModal(dashboardData.activeProject.id);
  });
  btnNewProject.addEventListener('click', showNewProjectModal);
  btnSeeAllActivity.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/activity-log/activity-log.html') });
  });

  // Project list
  projectListEl.addEventListener('click', async (e) => {
    const setBtn = e.target.closest('.pl-set-active');
    if (setBtn) {
      e.stopPropagation();
      await setActiveProjectId(setBtn.dataset.projectId);
      await loadDashboard();
      showToast('Active project set');
      return;
    }
    const item = e.target.closest('.pl-item');
    if (item) {
      const project = await getProject(item.dataset.projectId);
      if (project) showProjectView(project);
    }
  });

  // Pinned project clicks
  pinnedProjectsEl.addEventListener('click', async (e) => {
    const card = e.target.closest('.pinned-card');
    if (card) {
      const project = await getProject(card.dataset.projectId);
      if (project) showProjectView(project);
    }
  });

  // Timeline clicks
  timelineEl.addEventListener('click', async (e) => {
    const item = e.target.closest('.timeline-item');
    if (item && item.dataset.projectId) {
      const project = await getProject(item.dataset.projectId);
      if (project) showProjectView(project);
    }
  });

  // Recent activity
  recentListEl.addEventListener('click', async (e) => {
    const favBtn = e.target.closest('.recent-fav');
    if (favBtn) {
      e.stopPropagation();
      await chrome.runtime.sendMessage({
        type: 'TOGGLE_FAVORITE',
        item: { url: favBtn.dataset.url, title: favBtn.dataset.title, domain: favBtn.dataset.domain, favIconUrl: favBtn.dataset.favicon },
      });
      await loadDashboard();
      showToast('Favorite toggled');
      return;
    }
    const item = e.target.closest('.recent-item');
    if (item && item.dataset.url) chrome.tabs.create({ url: item.dataset.url });
  });

  // Favorites
  favoritesListEl.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.fav-remove');
    if (removeBtn) {
      e.stopPropagation();
      await chrome.runtime.sendMessage({ type: 'TOGGLE_FAVORITE', item: { url: removeBtn.dataset.url } });
      await loadDashboard();
      return;
    }
    const item = e.target.closest('.fav-item');
    if (item && item.dataset.url) chrome.tabs.create({ url: item.dataset.url });
  });

  // Workspace dropdown
  wsListEl.addEventListener('click', async (e) => {
    const wsItem = e.target.closest('.ws-item:not(.ws-preset)');
    if (wsItem) {
      await chrome.runtime.sendMessage({ type: 'SET_ACTIVE_WORKSPACE', profileId: wsItem.dataset.profileId || null });
      workspaceDropdown.classList.add('hidden');
      await loadDashboard();
    }
  });

  // --- Project Detail View ---
  btnBack.addEventListener('click', showDashboardView);

  pvName.addEventListener('click', () => {
    if (!currentProject) return;
    pvName.classList.add('hidden');
    pvNameInput.classList.remove('hidden');
    pvNameInput.value = currentProject.name;
    pvNameInput.focus();
    pvNameInput.select();
  });

  async function commitNameEdit() {
    const newName = pvNameInput.value.trim();
    pvNameInput.classList.add('hidden');
    pvName.classList.remove('hidden');
    if (!currentProject || !newName || newName === currentProject.name) return;
    currentProject.name = newName;
    await saveProject(currentProject);
    pvName.textContent = newName;
    showToast('Renamed');
  }
  pvNameInput.addEventListener('blur', commitNameEdit);
  pvNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); pvNameInput.blur(); }
    if (e.key === 'Escape') { pvNameInput.value = currentProject?.name || ''; pvNameInput.blur(); }
  });

  pvBtnCopy.addEventListener('click', async () => {
    if (!currentProject) return;
    const context = buildContextString(currentProject);
    await navigator.clipboard.writeText(context);
    showToast('Context copied');
  });
  pvBtnResume.addEventListener('click', async () => {
    if (!currentProject) return;
    const response = await chrome.runtime.sendMessage({ type: 'RESUME_PROJECT', projectId: currentProject.id });
    if (response.success) showToast(`Opened ${response.opened} tabs`);
  });
  pvBtnTag.addEventListener('click', async () => {
    if (!currentProject) return;
    const tag = prompt('Enter a tag:');
    if (!tag || !tag.trim()) return;
    if (!currentProject.tags.includes(tag.trim())) {
      currentProject.tags.push(tag.trim());
      await saveProject(currentProject);
      showProjectView(currentProject);
      showToast('Tag added');
    }
  });
  pvBtnAdd.addEventListener('click', () => {
    if (!currentProject) return;
    showAddItemModal(currentProject.id);
  });
  pvBtnPin.addEventListener('click', async () => {
    if (!currentProject) return;
    const result = await chrome.runtime.sendMessage({ type: 'TOGGLE_PIN_PROJECT', projectId: currentProject.id });
    pinnedIds = result.pinned;
    pvBtnPin.classList.toggle('pinned', pinnedIds.includes(currentProject.id));
    showToast('Pin toggled');
  });
  pvBtnDelete.addEventListener('click', async () => {
    if (!currentProject) return;
    if (!confirm(`Delete "${currentProject.name}"?`)) return;
    await deleteProject(currentProject.id);
    showDashboardView();
    showToast('Deleted');
  });

  pvTagsList.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.tag-remove');
    if (removeBtn && currentProject) {
      currentProject.tags = currentProject.tags.filter(t => t !== removeBtn.dataset.tag);
      await saveProject(currentProject);
      showProjectView(currentProject);
    }
  });

  pvItems.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.item-remove');
    if (removeBtn) {
      e.stopPropagation();
      if (currentProject) {
        await removeItemFromProject(currentProject.id, removeBtn.dataset.itemId);
        const updated = await getProject(currentProject.id);
        if (updated) showProjectView(updated);
      }
      return;
    }
    const favBtn = e.target.closest('.item-fav');
    if (favBtn) {
      e.stopPropagation();
      await chrome.runtime.sendMessage({
        type: 'TOGGLE_FAVORITE',
        item: { url: favBtn.dataset.url, title: favBtn.dataset.title, domain: favBtn.dataset.domain, favIconUrl: favBtn.dataset.favicon },
      });
      showToast('Favorite toggled');
      return;
    }
    const item = e.target.closest('.item');
    if (item && item.dataset.url) chrome.tabs.create({ url: item.dataset.url });
  });
}

// --- Workspace Dropdown ---

function renderWorkspaceDropdown() {
  const profiles = dashboardData?.workspaceProfiles || [];
  const activeWs = dashboardData?.activeWorkspace;

  let html = `<div class="ws-item ${!activeWs ? 'active' : ''}" data-profile-id=""><span class="ws-dot" style="background: var(--text-muted)"></span><span>General</span></div>`;

  for (const p of profiles) {
    html += `<div class="ws-item ${p.id === activeWs ? 'active' : ''}" data-profile-id="${p.id}"><span class="ws-dot" style="background: ${p.color || 'var(--accent)'}"></span><span>${esc(p.name)}</span></div>`;
  }

  const createdKeys = new Set(profiles.map(p => p.presetKey));
  for (const [key, preset] of Object.entries(WORKSPACE_PRESETS)) {
    if (!createdKeys.has(key)) {
      html += `<div class="ws-item ws-preset" data-preset-key="${key}"><span class="ws-dot" style="background: ${preset.color}"></span><span>${preset.name}</span><span class="ws-add-hint">+ Add</span></div>`;
    }
  }

  wsListEl.innerHTML = html;

  wsListEl.querySelectorAll('.ws-preset').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const key = el.dataset.presetKey;
      const preset = WORKSPACE_PRESETS[key];
      if (!preset) return;
      const profile = {
        id: crypto.randomUUID(), presetKey: key, name: preset.name,
        icon: preset.icon, color: preset.color, focusDomains: preset.focusDomains,
        contextTemplate: preset.contextTemplate, createdAt: Date.now(),
      };
      await chrome.runtime.sendMessage({ type: 'SAVE_WORKSPACE_PROFILE', profile });
      await chrome.runtime.sendMessage({ type: 'SET_ACTIVE_WORKSPACE', profileId: profile.id });
      workspaceDropdown.classList.add('hidden');
      await loadDashboard();
      showToast(`Workspace: ${preset.name}`);
    });
  });
}

// --- Modals ---

function showAddItemModal(projectId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal"><h3>Add Item</h3><input type="url" id="add-item-url" placeholder="https://..." autofocus><input type="text" id="add-item-title" placeholder="Title (optional)"><div class="modal-actions"><button class="btn-cancel" id="modal-cancel">Cancel</button><button class="btn-confirm" id="modal-confirm">Add</button></div></div>`;
  document.body.appendChild(overlay);

  const urlInput = overlay.querySelector('#add-item-url');
  const titleInput = overlay.querySelector('#add-item-title');
  const close = () => overlay.remove();

  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  async function confirm() {
    const url = urlInput.value.trim();
    if (!url) return;
    await addManualItemToProject(projectId, url, titleInput.value.trim() || url);
    close();
    if (currentProject?.id === projectId) {
      const updated = await getProject(projectId);
      if (updated) showProjectView(updated);
    } else {
      await loadDashboard();
    }
    showToast('Item added');
  }

  overlay.querySelector('#modal-confirm').addEventListener('click', confirm);
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') close(); });
  urlInput.focus();
}

function showNewProjectModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal"><h3>New Project</h3><input type="text" id="new-project-name" placeholder="Project name..." autofocus><div class="modal-actions"><button class="btn-cancel" id="modal-cancel">Cancel</button><button class="btn-confirm" id="modal-confirm">Create</button></div></div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#new-project-name');
  const close = () => overlay.remove();

  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  async function confirm() {
    const name = input.value.trim();
    if (!name) return;
    const project = createProject(name);
    project.isManual = true;
    await saveProject(project);
    await setActiveProjectId(project.id);
    close();
    await loadDashboard();
    showToast('Project created');
  }

  overlay.querySelector('#modal-confirm').addEventListener('click', confirm);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') close(); });
  input.focus();
}

function showCreateWorkspaceModal() {
  workspaceDropdown.classList.add('hidden');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal"><h3>Create Workspace</h3><input type="text" id="ws-name" placeholder="Workspace name..." autofocus><div class="modal-color-row"><span class="modal-label">Color</span><div class="color-options"><button class="color-opt selected" data-color="#8b5cf6" style="background:#8b5cf6"></button><button class="color-opt" data-color="#60a5fa" style="background:#60a5fa"></button><button class="color-opt" data-color="#34d399" style="background:#34d399"></button><button class="color-opt" data-color="#fbbf24" style="background:#fbbf24"></button><button class="color-opt" data-color="#fb923c" style="background:#fb923c"></button><button class="color-opt" data-color="#fb7185" style="background:#fb7185"></button></div></div><div class="modal-actions"><button class="btn-cancel" id="modal-cancel">Cancel</button><button class="btn-confirm" id="modal-confirm">Create</button></div></div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#ws-name');
  let selectedColor = '#8b5cf6';
  const close = () => overlay.remove();

  overlay.querySelectorAll('.color-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.color-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });

  overlay.querySelector('#modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  async function confirm() {
    const name = input.value.trim();
    if (!name) return;
    const profile = { id: crypto.randomUUID(), name, color: selectedColor, focusDomains: [], contextTemplate: 'general', createdAt: Date.now() };
    await chrome.runtime.sendMessage({ type: 'SAVE_WORKSPACE_PROFILE', profile });
    await chrome.runtime.sendMessage({ type: 'SET_ACTIVE_WORKSPACE', profileId: profile.id });
    close();
    await loadDashboard();
    showToast(`Workspace: ${name}`);
  }

  overlay.querySelector('#modal-confirm').addEventListener('click', confirm);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') close(); });
  input.focus();
}

// --- Helpers ---

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function formatHour(h) {
  if (h === 0) return '12 AM';
  if (h < 12) return h + ' AM';
  if (h === 12) return '12 PM';
  return (h - 12) + ' PM';
}

// --- Start ---
init();
