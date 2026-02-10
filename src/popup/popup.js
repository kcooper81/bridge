// ContextIQ Popup Script

import { buildContextString, timeAgo, truncate, extractDomain, categorizeDomain } from '../lib/utils.js';
import {
  getProjects, getProject, getActiveProjectId, setActiveProjectId,
  saveProject, createProject, deleteProject, removeItemFromProject,
  getSettings, updateSettings,
} from '../lib/storage.js';

// --- DOM Elements ---
const projectSelect = document.getElementById('project-select');
const btnNewProject = document.getElementById('btn-new-project');
const btnSettings = document.getElementById('btn-settings');
const btnToggleTracking = document.getElementById('btn-toggle-tracking');
const projectPanel = document.getElementById('project-panel');
const emptyState = document.getElementById('empty-state');
const projectNameEl = document.getElementById('project-name');
const btnCopyContext = document.getElementById('btn-copy-context');
const btnResume = document.getElementById('btn-resume');
const tagsContainer = document.getElementById('tags-container');
const tagsList = document.getElementById('tags-list');
const summaryContainer = document.getElementById('summary-container');
const projectSummary = document.getElementById('project-summary');
const itemsList = document.getElementById('items-list');
const toast = document.getElementById('toast');

let currentProject = null;

// --- Initialize ---

async function init() {
  await loadProjects();
  await loadTrackingState();
  bindEvents();
}

async function loadProjects() {
  const projects = await getProjects();
  const activeId = await getActiveProjectId();

  // Populate selector
  projectSelect.innerHTML = '<option value="">No active project</option>';
  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = truncate(p.name, 40);
    if (p.id === activeId) opt.selected = true;
    projectSelect.appendChild(opt);
  });

  // Load active project
  if (activeId) {
    const project = await getProject(activeId);
    if (project) {
      showProject(project);
      return;
    }
  }

  showEmptyState();
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

// --- Display ---

function showProject(project) {
  currentProject = project;
  emptyState.classList.add('hidden');
  projectPanel.classList.remove('hidden');

  projectNameEl.textContent = project.name;

  // Tags
  if (project.tags && project.tags.length > 0) {
    tagsContainer.classList.remove('hidden');
    tagsList.innerHTML = project.tags.map(tag =>
      `<span class="tag">${tag}<span class="tag-remove" data-tag="${tag}">&times;</span></span>`
    ).join('');
  } else {
    tagsContainer.classList.add('hidden');
  }

  // Summary
  if (project.summary) {
    summaryContainer.classList.remove('hidden');
    projectSummary.textContent = project.summary;
  } else {
    summaryContainer.classList.add('hidden');
  }

  // Items
  if (project.items && project.items.length > 0) {
    itemsList.innerHTML = project.items.map(item => {
      const category = item.category || categorizeDomain(extractDomain(item.url));
      const favicon = item.favIconUrl
        ? `<img class="item-favicon" src="${escapeHtml(item.favIconUrl)}" alt="" onerror="this.style.display='none'">`
        : `<div class="item-favicon-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
           </div>`;

      return `
        <div class="item" data-url="${escapeHtml(item.url)}" data-item-id="${item.id}">
          ${favicon}
          <div class="item-info">
            <div class="item-title">${escapeHtml(truncate(item.title, 50))}</div>
            <div class="item-domain">${escapeHtml(item.domain || extractDomain(item.url))}</div>
          </div>
          <span class="category-badge ${category}">${category}</span>
          <span class="item-time">${timeAgo(item.lastSeen || item.addedAt)}</span>
          <button class="item-remove" data-item-id="${item.id}" title="Remove">&times;</button>
        </div>
      `;
    }).join('');
  } else {
    itemsList.innerHTML = '<div class="empty-state">No items tracked yet</div>';
  }
}

function showEmptyState() {
  currentProject = null;
  projectPanel.classList.add('hidden');
  emptyState.classList.remove('hidden');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

// --- Events ---

function bindEvents() {
  projectSelect.addEventListener('change', async () => {
    const id = projectSelect.value;
    if (id) {
      await setActiveProjectId(id);
      const project = await getProject(id);
      if (project) showProject(project);
    } else {
      await setActiveProjectId(null);
      showEmptyState();
    }
  });

  btnNewProject.addEventListener('click', showNewProjectModal);

  btnSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  btnToggleTracking.addEventListener('click', async () => {
    const settings = await getSettings();
    const updated = await updateSettings({ trackingEnabled: !settings.trackingEnabled });
    updateTrackingButton(updated.trackingEnabled);
    showToast(updated.trackingEnabled ? 'Tracking enabled' : 'Tracking paused');
  });

  btnCopyContext.addEventListener('click', async () => {
    if (!currentProject) return;
    const context = buildContextString(currentProject);
    await navigator.clipboard.writeText(context);
    showToast('Context copied to clipboard');
  });

  btnResume.addEventListener('click', async () => {
    if (!currentProject) return;
    const response = await chrome.runtime.sendMessage({
      type: 'RESUME_PROJECT',
      projectId: currentProject.id,
    });
    if (response.success) {
      showToast(`Opened ${response.opened} tabs`);
    }
  });

  // Item click to open tab
  itemsList.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.item-remove');
    if (removeBtn) {
      e.stopPropagation();
      const itemId = removeBtn.dataset.itemId;
      if (currentProject) {
        await removeItemFromProject(currentProject.id, itemId);
        const updated = await getProject(currentProject.id);
        if (updated) showProject(updated);
      }
      return;
    }

    const item = e.target.closest('.item');
    if (item && item.dataset.url) {
      chrome.tabs.create({ url: item.dataset.url });
    }
  });

  // Tag removal
  tagsList.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.tag-remove');
    if (removeBtn && currentProject) {
      const tag = removeBtn.dataset.tag;
      currentProject.tags = currentProject.tags.filter(t => t !== tag);
      await saveProject(currentProject);
      showProject(currentProject);
    }
  });
}

function showNewProjectModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>New Project</h3>
      <input type="text" id="new-project-name" placeholder="Project name..." autofocus>
      <div class="modal-actions">
        <button class="btn-cancel" id="modal-cancel">Cancel</button>
        <button class="btn-confirm" id="modal-confirm">Create</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#new-project-name');
  const btnCancel = overlay.querySelector('#modal-cancel');
  const btnConfirm = overlay.querySelector('#modal-confirm');

  const close = () => overlay.remove();

  btnCancel.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  async function confirm() {
    const name = input.value.trim();
    if (!name) return;
    const project = createProject(name);
    project.isManual = true;
    await saveProject(project);
    await setActiveProjectId(project.id);
    close();
    await loadProjects();
    showToast('Project created');
  }

  btnConfirm.addEventListener('click', confirm);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') close();
  });

  input.focus();
}

// --- Helpers ---

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// --- Start ---
init();
