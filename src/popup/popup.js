// ContextIQ Popup Script

import { buildContextString, timeAgo, formatDuration, truncate, extractDomain, categorizeDomain } from '../lib/utils.js';
import {
  getProjects, getProject, getActiveProjectId, setActiveProjectId,
  saveProject, createProject, deleteProject, removeItemFromProject,
  getSettings, updateSettings, addManualItemToProject, moveItemToProject,
} from '../lib/storage.js';

// --- DOM Elements ---
const projectSelect = document.getElementById('project-select');
const btnNewProject = document.getElementById('btn-new-project');
const btnActivityLog = document.getElementById('btn-activity-log');
const btnSettings = document.getElementById('btn-settings');
const btnToggleTracking = document.getElementById('btn-toggle-tracking');
const projectPanel = document.getElementById('project-panel');
const emptyState = document.getElementById('empty-state');
const projectNameEl = document.getElementById('project-name');
const projectNameInput = document.getElementById('project-name-input');
const btnCopyContext = document.getElementById('btn-copy-context');
const btnResume = document.getElementById('btn-resume');
const btnAddTag = document.getElementById('btn-add-tag');
const btnAddItem = document.getElementById('btn-add-item');
const btnDeleteProject = document.getElementById('btn-delete-project');
const tagsContainer = document.getElementById('tags-container');
const tagsList = document.getElementById('tags-list');
const summaryContainer = document.getElementById('summary-container');
const projectSummary = document.getElementById('project-summary');
const itemsList = document.getElementById('items-list');
const toast = document.getElementById('toast');

let currentProject = null;
let allProjects = [];

// --- Initialize ---

async function init() {
  await loadProjects();
  await loadTrackingState();
  bindEvents();
}

async function loadProjects() {
  allProjects = await getProjects();
  const activeId = await getActiveProjectId();

  // Populate selector
  projectSelect.innerHTML = '<option value="">No active project</option>';
  allProjects.forEach(p => {
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

  // Tags (always show container so user can add tags)
  if (project.tags && project.tags.length > 0) {
    tagsContainer.classList.remove('hidden');
    tagsList.innerHTML = project.tags.map(tag =>
      `<span class="tag">${escapeHtml(tag)}<span class="tag-remove" data-tag="${escapeHtml(tag)}">&times;</span></span>`
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

      const timeSpent = item.timeSpent > 5
        ? `<span class="item-time-spent">${formatDuration(item.timeSpent)}</span>`
        : '';

      const contentBadge = item.pageContent && (item.pageContent.codeBlocks?.length > 0 || item.pageContent.selectedText)
        ? `<span class="item-content-badge">rich</span>`
        : '';

      return `
        <div class="item" data-url="${escapeHtml(item.url)}" data-item-id="${item.id}">
          ${favicon}
          <div class="item-info">
            <div class="item-title">${escapeHtml(truncate(item.title, 50))}</div>
            <div class="item-meta">
              <span class="item-domain">${escapeHtml(item.domain || extractDomain(item.url))}</span>
              ${timeSpent}
              ${contentBadge}
            </div>
          </div>
          <span class="category-badge ${category}">${category}</span>
          <span class="item-time">${timeAgo(item.lastSeen || item.addedAt)}</span>
          <button class="item-move" data-item-id="${item.id}" title="Move to project">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
            </svg>
          </button>
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

  btnActivityLog.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/activity-log/activity-log.html') });
  });

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

  btnAddTag.addEventListener('click', async () => {
    if (!currentProject) return;
    const tag = prompt('Enter a tag:');
    if (!tag || !tag.trim()) return;
    const trimmed = tag.trim();
    if (!currentProject.tags.includes(trimmed)) {
      currentProject.tags.push(trimmed);
      await saveProject(currentProject);
      showProject(currentProject);
      showToast('Tag added');
    }
  });

  btnAddItem.addEventListener('click', () => {
    if (!currentProject) return;
    showAddItemModal();
  });

  btnDeleteProject.addEventListener('click', async () => {
    if (!currentProject) return;
    if (!confirm(`Delete project "${currentProject.name}"?`)) return;
    await deleteProject(currentProject.id);
    currentProject = null;
    await loadProjects();
    showToast('Project deleted');
  });

  // Item click to open tab, move, or remove
  itemsList.addEventListener('click', async (e) => {
    // Remove button
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

    // Move button
    const moveBtn = e.target.closest('.item-move');
    if (moveBtn) {
      e.stopPropagation();
      const itemId = moveBtn.dataset.itemId;
      if (currentProject) {
        await showMoveItemModal(itemId);
      }
      return;
    }

    // Item click -> open URL
    const item = e.target.closest('.item');
    if (item && item.dataset.url) {
      chrome.tabs.create({ url: item.dataset.url });
    }
  });

  // Project name inline editing
  projectNameEl.addEventListener('click', () => {
    if (!currentProject) return;
    projectNameEl.classList.add('hidden');
    projectNameInput.classList.remove('hidden');
    projectNameInput.value = currentProject.name;
    projectNameInput.focus();
    projectNameInput.select();
  });

  async function commitNameEdit() {
    const newName = projectNameInput.value.trim();
    projectNameInput.classList.add('hidden');
    projectNameEl.classList.remove('hidden');
    if (!currentProject || !newName || newName === currentProject.name) return;
    currentProject.name = newName;
    await saveProject(currentProject);
    projectNameEl.textContent = newName;
    const opt = projectSelect.querySelector(`option[value="${currentProject.id}"]`);
    if (opt) opt.textContent = truncate(newName, 40);
    showToast('Project renamed');
  }

  projectNameInput.addEventListener('blur', commitNameEdit);
  projectNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); projectNameInput.blur(); }
    if (e.key === 'Escape') {
      projectNameInput.value = currentProject?.name || '';
      projectNameInput.blur();
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

// --- Add Item Modal ---

function showAddItemModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Add Item to Project</h3>
      <input type="url" id="add-item-url" placeholder="https://..." autofocus>
      <input type="text" id="add-item-title" placeholder="Title (optional)">
      <div class="modal-actions">
        <button class="btn-cancel" id="modal-cancel">Cancel</button>
        <button class="btn-confirm" id="modal-confirm">Add</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const urlInput = overlay.querySelector('#add-item-url');
  const titleInput = overlay.querySelector('#add-item-title');
  const btnCancel = overlay.querySelector('#modal-cancel');
  const btnConfirm = overlay.querySelector('#modal-confirm');

  const close = () => overlay.remove();

  btnCancel.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  async function confirm() {
    const url = urlInput.value.trim();
    if (!url) return;
    const title = titleInput.value.trim() || url;
    await addManualItemToProject(currentProject.id, url, title);
    const updated = await getProject(currentProject.id);
    if (updated) showProject(updated);
    close();
    showToast('Item added');
  }

  btnConfirm.addEventListener('click', confirm);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') close();
  });

  urlInput.focus();
}

// --- Move Item Modal ---

async function showMoveItemModal(itemId) {
  const otherProjects = allProjects.filter(p => p.id !== currentProject.id);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Move Item to Project</h3>
      <select id="move-project-select">
        ${otherProjects.map(p =>
          `<option value="${p.id}">${escapeHtml(truncate(p.name, 40))}</option>`
        ).join('')}
        <option value="__new">+ Create New Project</option>
      </select>
      <div id="move-new-row" class="hidden">
        <input type="text" id="move-new-name" placeholder="New project name...">
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" id="modal-cancel">Cancel</button>
        <button class="btn-confirm" id="modal-confirm">Move</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const select = overlay.querySelector('#move-project-select');
  const newRow = overlay.querySelector('#move-new-row');
  const newNameInput = overlay.querySelector('#move-new-name');
  const btnCancel = overlay.querySelector('#modal-cancel');
  const btnConfirm = overlay.querySelector('#modal-confirm');

  const close = () => overlay.remove();

  select.addEventListener('change', () => {
    newRow.classList.toggle('hidden', select.value !== '__new');
    if (select.value === '__new') newNameInput.focus();
  });

  btnCancel.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  btnConfirm.addEventListener('click', async () => {
    let targetId = select.value;

    if (targetId === '__new') {
      const name = newNameInput.value.trim();
      if (!name) return;
      const newProj = createProject(name);
      newProj.isManual = true;
      await saveProject(newProj);
      targetId = newProj.id;
      allProjects.push(newProj);
    }

    await moveItemToProject(currentProject.id, targetId, itemId);
    const updated = await getProject(currentProject.id);
    if (updated) showProject(updated);
    await loadProjects(); // Refresh selector
    close();
    showToast('Item moved');
  });
}

// --- New Project Modal ---

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
