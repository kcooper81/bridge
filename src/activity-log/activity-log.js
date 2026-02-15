// TeamPrompt Activity Log — Full Page
// Shows complete work timeline with filters, search, and project assignment

import { timeAgo, formatDuration, formatDateTime, truncate, extractDomain, categorizeDomain } from '../lib/utils.js';
import { initTheme } from '../lib/theme.js';

initTheme();
import {
  getProjects, getProject, getActiveProjectId, saveProject, createProject,
  addItemToProject, getActivityLog, addManualItemToProject,
} from '../lib/storage.js';

// --- DOM Elements ---
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterProject = document.getElementById('filter-project');
const filterTime = document.getElementById('filter-time');
const btnAddManual = document.getElementById('btn-add-manual');
const activityList = document.getElementById('activity-list');
const emptyState = document.getElementById('empty-state');
const statTotal = document.getElementById('stat-total');
const statToday = document.getElementById('stat-today');
const toast = document.getElementById('toast');

let allActivities = [];
let allProjects = [];

// --- Initialize ---

async function init() {
  await loadData();
  bindEvents();
  render();
}

async function loadData() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVITY_LOG' });
  allActivities = response.log || [];

  const projResponse = await chrome.runtime.sendMessage({ type: 'GET_ALL_PROJECTS' });
  allProjects = projResponse.projects || [];

  // Populate project filter
  filterProject.innerHTML = '<option value="">All Projects</option>';
  filterProject.innerHTML += '<option value="__unassigned">Unassigned</option>';
  allProjects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = truncate(p.name, 30);
    filterProject.appendChild(opt);
  });

  // Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = allActivities.filter(a => a.timestamp >= today.getTime()).length;
  statTotal.textContent = `${allActivities.length} activities`;
  statToday.textContent = `${todayCount} today`;
}

// --- Filtering ---

function getFilteredActivities() {
  let filtered = [...allActivities];

  // Search
  const query = searchInput.value.toLowerCase().trim();
  if (query) {
    filtered = filtered.filter(a =>
      (a.title || '').toLowerCase().includes(query) ||
      (a.domain || '').toLowerCase().includes(query) ||
      (a.url || '').toLowerCase().includes(query) ||
      (a.pageContent?.description || '').toLowerCase().includes(query) ||
      (a.pageContent?.headings || []).some(h => h.text.toLowerCase().includes(query))
    );
  }

  // Category
  const cat = filterCategory.value;
  if (cat) {
    filtered = filtered.filter(a => a.category === cat);
  }

  // Project
  const proj = filterProject.value;
  if (proj === '__unassigned') {
    filtered = filtered.filter(a => !a.projectId);
  } else if (proj) {
    filtered = filtered.filter(a => a.projectId === proj);
  }

  // Time
  const time = filterTime.value;
  if (time) {
    const now = new Date();
    let cutoff;
    if (time === 'today') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    } else if (time === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      cutoff = new Date(y.getFullYear(), y.getMonth(), y.getDate()).getTime();
    } else if (time === 'week') {
      cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (time === 'month') {
      cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    }
    if (cutoff) {
      filtered = filtered.filter(a => a.timestamp >= cutoff);
    }
  }

  return filtered;
}

// --- Render ---

function render() {
  const filtered = getFilteredActivities();

  if (filtered.length === 0) {
    activityList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Group by day
  const groups = {};
  filtered.forEach(activity => {
    const d = new Date(activity.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!groups[key]) {
      groups[key] = { date: d, items: [] };
    }
    groups[key].items.push(activity);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    return groups[b].date.getTime() - groups[a].date.getTime();
  });

  let html = '';
  for (const key of sortedKeys) {
    const group = groups[key];
    const dayLabel = getDayLabel(group.date);

    html += `<div class="day-group">`;
    html += `<div class="day-header">`;
    html += `<span class="day-label">${dayLabel}</span>`;
    html += `<span class="day-line"></span>`;
    html += `<span class="day-count">${group.items.length} items</span>`;
    html += `</div>`;

    for (const activity of group.items) {
      html += renderActivityItem(activity);
    }

    html += `</div>`;
  }

  activityList.innerHTML = html;
}

function getDayLabel(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function renderActivityItem(activity) {
  const time = new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const favicon = activity.favIconUrl
    ? `<img class="activity-favicon" src="${escapeHtml(activity.favIconUrl)}" alt="" onerror="this.style.display='none'">`
    : `<div class="activity-favicon-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
       </div>`;

  const category = activity.category || categorizeDomain(extractDomain(activity.url));

  // Time spent badge
  const timeSpent = activity.timeSpent > 5
    ? `<span class="activity-time-spent">${formatDuration(activity.timeSpent)}</span>`
    : '';

  // Content richness badge
  const hasContent = activity.pageContent && (
    activity.pageContent.codeBlocks?.length > 0 ||
    activity.pageContent.headings?.length > 0 ||
    activity.pageContent.selectedText
  );
  const contentBadge = hasContent ? `<span class="activity-content-badge">rich</span>` : '';

  // Engagement dots (0-10 scale, show 5 dots)
  let engagementHtml = '';
  if (activity.engagementScore > 0) {
    const dots = 5;
    const filled = Math.round((activity.engagementScore / 10) * dots);
    engagementHtml = `<div class="activity-engagement" title="Engagement: ${activity.engagementScore}/10">`;
    for (let i = 0; i < dots; i++) {
      engagementHtml += `<span class="engagement-dot ${i < filled ? 'active' : ''}"></span>`;
    }
    engagementHtml += `</div>`;
  }

  // Project badge
  const project = allProjects.find(p => p.id === activity.projectId);
  const projectBadge = project
    ? `<span class="project-badge" title="${escapeHtml(project.name)}">${escapeHtml(truncate(project.name, 18))}</span>`
    : '';

  return `
    <div class="activity-item" data-id="${activity.id}" data-url="${escapeHtml(activity.url)}">
      <div class="activity-time-col">
        <span class="activity-time">${time}</span>
      </div>
      ${favicon}
      <div class="activity-info">
        <div class="activity-title" data-url="${escapeHtml(activity.url)}">${escapeHtml(truncate(activity.title, 70))}</div>
        <div class="activity-meta">
          <span class="activity-domain">${escapeHtml(activity.domain || extractDomain(activity.url))}</span>
          ${timeSpent}
          ${contentBadge}
          ${engagementHtml}
        </div>
      </div>
      <span class="category-badge ${category}">${category}</span>
      ${projectBadge}
      <div class="activity-actions">
        <button class="action-btn btn-assign" data-id="${activity.id}" title="Assign to project">
          ${activity.projectId ? 'Move' : 'Assign'}
        </button>
      </div>
    </div>
  `;
}

// --- Events ---

function bindEvents() {
  // Search
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(render, 200);
  });

  // Filters
  filterCategory.addEventListener('change', render);
  filterProject.addEventListener('change', render);
  filterTime.addEventListener('change', render);

  // Activity list clicks
  activityList.addEventListener('click', async (e) => {
    // Title click -> open URL
    const titleEl = e.target.closest('.activity-title');
    if (titleEl) {
      const url = titleEl.dataset.url;
      if (url) chrome.tabs.create({ url });
      return;
    }

    // Assign button
    const assignBtn = e.target.closest('.btn-assign');
    if (assignBtn) {
      const activityId = assignBtn.dataset.id;
      await showAssignModal(activityId);
      return;
    }
  });

  // Manual add button
  btnAddManual.addEventListener('click', showManualAddModal);
}

// --- Modals ---

async function showAssignModal(activityId) {
  const activity = allActivities.find(a => a.id === activityId);
  if (!activity) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Assign to Project</h3>
      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">
        ${escapeHtml(truncate(activity.title, 60))}
      </p>
      <label>Select Project</label>
      <select id="assign-project-select">
        ${allProjects.map(p =>
          `<option value="${p.id}" ${p.id === activity.projectId ? 'selected' : ''}>${escapeHtml(truncate(p.name, 40))}</option>`
        ).join('')}
        <option value="__new">+ Create New Project</option>
      </select>
      <div id="new-project-row" class="hidden">
        <label>New Project Name</label>
        <input type="text" id="assign-new-name" placeholder="Project name...">
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" id="assign-cancel">Cancel</button>
        <button class="btn-confirm" id="assign-confirm">Assign</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const select = overlay.querySelector('#assign-project-select');
  const newRow = overlay.querySelector('#new-project-row');
  const newNameInput = overlay.querySelector('#assign-new-name');
  const btnCancel = overlay.querySelector('#assign-cancel');
  const btnConfirm = overlay.querySelector('#assign-confirm');

  const close = () => overlay.remove();

  select.addEventListener('change', () => {
    newRow.classList.toggle('hidden', select.value !== '__new');
    if (select.value === '__new') newNameInput.focus();
  });

  btnCancel.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  btnConfirm.addEventListener('click', async () => {
    let projectId = select.value;

    if (projectId === '__new') {
      const name = newNameInput.value.trim();
      if (!name) return;
      const resp = await chrome.runtime.sendMessage({ type: 'CREATE_PROJECT', name });
      if (!resp.success) return;
      projectId = resp.project.id;
      allProjects.push(resp.project);
    }

    await chrome.runtime.sendMessage({
      type: 'ASSIGN_ACTIVITY_TO_PROJECT',
      activityId,
      projectId,
    });

    // Update local data
    const idx = allActivities.findIndex(a => a.id === activityId);
    if (idx >= 0) {
      allActivities[idx].projectId = projectId;
      allActivities[idx].manuallyAssigned = true;
    }

    close();
    render();
    showToast('Assigned to project');
  });
}

async function showManualAddModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Add Item Manually</h3>
      <label>URL</label>
      <input type="url" id="manual-url" placeholder="https://example.com/..." autofocus>
      <label>Title (optional)</label>
      <input type="text" id="manual-title" placeholder="Page title...">
      <label>Add to Project</label>
      <select id="manual-project-select">
        ${allProjects.map(p =>
          `<option value="${p.id}">${escapeHtml(truncate(p.name, 40))}</option>`
        ).join('')}
        <option value="__new">+ Create New Project</option>
      </select>
      <div id="manual-new-row" class="hidden">
        <label>New Project Name</label>
        <input type="text" id="manual-new-name" placeholder="Project name...">
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" id="manual-cancel">Cancel</button>
        <button class="btn-confirm" id="manual-confirm">Add</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const urlInput = overlay.querySelector('#manual-url');
  const titleInput = overlay.querySelector('#manual-title');
  const select = overlay.querySelector('#manual-project-select');
  const newRow = overlay.querySelector('#manual-new-row');
  const newNameInput = overlay.querySelector('#manual-new-name');
  const btnCancel = overlay.querySelector('#manual-cancel');
  const btnConfirm = overlay.querySelector('#manual-confirm');

  const close = () => overlay.remove();

  select.addEventListener('change', () => {
    newRow.classList.toggle('hidden', select.value !== '__new');
    if (select.value === '__new') newNameInput.focus();
  });

  btnCancel.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  btnConfirm.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    let projectId = select.value;

    if (projectId === '__new') {
      const name = newNameInput.value.trim();
      if (!name) return;
      const resp = await chrome.runtime.sendMessage({ type: 'CREATE_PROJECT', name });
      if (!resp.success) return;
      projectId = resp.project.id;
      allProjects.push(resp.project);
    }

    const title = titleInput.value.trim() || url;
    await chrome.runtime.sendMessage({
      type: 'ADD_MANUAL_ITEM',
      projectId,
      url,
      title,
    });

    close();
    await loadData();
    render();
    showToast('Item added to project');
  });

  urlInput.focus();
}

// --- Helpers ---

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// --- Start ---
init();
