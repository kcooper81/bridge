// ContextIQ Dashboard — Vault-style Prompt Manager
// Works both as Chrome extension page AND standalone web app via VaultAPI

import { VaultAPI } from '../lib/vault-api.js';

// ── State ──
let allPrompts = [];
let allFolders = [];
let allDepartments = [];
let allTeams = [];
let allMembers = [];
let allCollections = [];
let allStandards = [];
let currentOrg = null;
let currentAnalytics = null;
let isLoading = false;
let vaultPage = 0;
const VAULT_PAGE_SIZE = 25;

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupModalHandlers();
  showLoadingOverlay('Loading vault...');
  await loadAllData();
  hideLoadingOverlay();
  renderCurrentView();
});

async function loadAllData() {
  try {
    const data = await VaultAPI.getAllData();
    allPrompts = data.prompts || [];
    allFolders = data.folders || [];
    allDepartments = data.departments || [];
    allTeams = data.teams || [];
    allMembers = data.members || [];
    allCollections = data.collections || [];
    allStandards = data.standards || [];
    currentOrg = data.org || null;
    currentAnalytics = data.analytics || null;

    // Update sidebar user
    const user = allMembers.find(m => m.isCurrentUser);
    if (user) {
      const nameEl = document.getElementById('sidebar-user-name');
      const roleEl = document.getElementById('sidebar-user-role');
      const avatarEl = document.getElementById('sidebar-user-avatar');
      if (nameEl) nameEl.textContent = user.name || user.email;
      if (roleEl) roleEl.textContent = user.role;
      if (avatarEl) avatarEl.textContent = (user.name || user.email || '?')[0].toUpperCase();
    }
  } catch (e) {
    console.error('Failed to load data:', e);
    showToast('Failed to load data. Please refresh.', 'error');
  }
}

// ── Loading overlay ──

function showLoadingOverlay(text) {
  isLoading = true;
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `<div class="loading-spinner"></div><div class="loading-text">${esc(text || 'Loading...')}</div>`;
    document.getElementById('app').appendChild(overlay);
  } else {
    overlay.querySelector('.loading-text').textContent = text || 'Loading...';
    overlay.classList.remove('hidden');
  }
}

function hideLoadingOverlay() {
  isLoading = false;
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ═══════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════

function setupNavigation() {
  document.querySelectorAll('.sidebar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const el = document.getElementById(`view-${view}`);
      if (el) el.classList.add('active');
      renderCurrentView();
    });
  });

  document.getElementById('sidebar-user').addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="org"]').classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-org').classList.add('active');
    renderOrgView();
  });
}

function getActiveView() {
  const active = document.querySelector('.sidebar-item.active');
  return active?.dataset.view || 'vault';
}

function renderCurrentView() {
  const view = getActiveView();
  switch (view) {
    case 'vault': renderVaultView(); break;
    case 'collections': renderCollectionsView(); break;
    case 'standards': renderStandardsView(); break;
    case 'team': renderTeamView(); break;
    case 'org': renderOrgView(); break;
    case 'analytics': renderAnalyticsView(); break;
    case 'import-export': renderImportExportView(); break;
  }
}

// ═══════════════════════════════════════
//  VAULT VIEW
// ═══════════════════════════════════════

function renderVaultView() {
  renderVaultFilters();
  renderVaultStats();
  renderVaultTable();

  const searchEl = document.getElementById('vault-search');
  searchEl.oninput = debounce(() => { vaultPage = 0; renderVaultTable(); }, 200);
  document.getElementById('vault-filter-folder').onchange = () => { vaultPage = 0; renderVaultTable(); };
  document.getElementById('vault-filter-dept').onchange = () => { vaultPage = 0; renderVaultTable(); };
  document.getElementById('vault-sort').onchange = () => { vaultPage = 0; renderVaultTable(); };

  document.getElementById('btn-vault-new').onclick = () => openPromptModal();
  document.getElementById('btn-vault-install-starters').onclick = async () => {
    await VaultAPI.installStarters();
    await loadAllData();
    renderVaultView();
    showToast('Starter prompts installed!');
  };

  document.getElementById('vault-select-all').onchange = (e) => {
    document.querySelectorAll('.vault-row-check').forEach(cb => { cb.checked = e.target.checked; });
  };

  // Folder & Department management
  const manageFoldersBtn = document.getElementById('btn-manage-folders');
  if (manageFoldersBtn) manageFoldersBtn.onclick = () => openManageFoldersModal();
  const manageDeptsBtn = document.getElementById('btn-manage-depts');
  if (manageDeptsBtn) manageDeptsBtn.onclick = () => openManageDepartmentsModal();
}

function renderVaultFilters() {
  const folderSelect = document.getElementById('vault-filter-folder');
  const deptSelect = document.getElementById('vault-filter-dept');
  folderSelect.innerHTML = '<option value="">All Folders</option>' +
    allFolders.map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join('');
  deptSelect.innerHTML = '<option value="">All Departments</option>' +
    allDepartments.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
}

function renderVaultStats() {
  document.getElementById('stat-total').textContent = allPrompts.length;
  const usesTotal = allPrompts.reduce((sum, p) => sum + (p.usageCount || 0), 0);
  document.getElementById('stat-used').textContent = usesTotal;
  const sharedCount = allCollections.reduce((sum, c) => sum + (c.promptIds?.length || 0), 0);
  document.getElementById('stat-shared').textContent = sharedCount;
  const activeStandards = allStandards.filter(s => s.enforced).length;
  document.getElementById('stat-standards').textContent = activeStandards;
}

function getFilteredPrompts() {
  const query = (document.getElementById('vault-search')?.value || '').toLowerCase();
  const folderId = document.getElementById('vault-filter-folder')?.value || '';
  const deptId = document.getElementById('vault-filter-dept')?.value || '';
  const sortBy = document.getElementById('vault-sort')?.value || 'recent';

  let filtered = [...allPrompts];
  if (query) {
    filtered = filtered.filter(p =>
      (p.title || '').toLowerCase().includes(query) ||
      (p.content || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.tags || []).some(t => t.toLowerCase().includes(query))
    );
  }
  if (folderId) filtered = filtered.filter(p => p.folderId === folderId);
  if (deptId) filtered = filtered.filter(p => p.departmentId === deptId);

  switch (sortBy) {
    case 'popular': filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)); break;
    case 'rating': {
      const avg = p => p.rating?.count ? p.rating.total / p.rating.count : 0;
      filtered.sort((a, b) => avg(b) - avg(a));
      break;
    }
    case 'alpha': filtered.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
    default: filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }
  return filtered;
}

function renderVaultTable() {
  const filtered = getFilteredPrompts();
  const tbody = document.getElementById('vault-tbody');
  const empty = document.getElementById('vault-empty');
  const paginationEl = document.getElementById('vault-pagination');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    if (paginationEl) paginationEl.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');

  // Pagination
  const totalPages = Math.ceil(filtered.length / VAULT_PAGE_SIZE);
  if (vaultPage >= totalPages) vaultPage = totalPages - 1;
  if (vaultPage < 0) vaultPage = 0;
  const start = vaultPage * VAULT_PAGE_SIZE;
  const pageItems = filtered.slice(start, start + VAULT_PAGE_SIZE);

  // Show/hide pagination controls
  if (paginationEl) {
    if (totalPages > 1) {
      paginationEl.classList.remove('hidden');
      const prevBtn = document.getElementById('vault-page-prev');
      const nextBtn = document.getElementById('vault-page-next');
      const pageInfo = document.getElementById('vault-page-info');
      if (prevBtn) { prevBtn.disabled = vaultPage === 0; prevBtn.onclick = () => { vaultPage--; renderVaultTable(); }; }
      if (nextBtn) { nextBtn.disabled = vaultPage >= totalPages - 1; nextBtn.onclick = () => { vaultPage++; renderVaultTable(); }; }
      if (pageInfo) pageInfo.textContent = `Page ${vaultPage + 1} of ${totalPages} (${filtered.length} prompts)`;
    } else {
      paginationEl.classList.add('hidden');
    }
  }

  tbody.innerHTML = pageItems.map(p => {
    const folder = allFolders.find(f => f.id === p.folderId);
    const folderName = folder ? folder.name : '—';
    const tags = (p.tags || []).slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const avgRating = p.rating?.count ? p.rating.total / p.rating.count : 0;
    const stars = renderStars(avgRating);
    const date = timeAgo(p.updatedAt || p.createdAt);
    const favClass = p.isFavorite ? 'vault-fav active' : 'vault-fav';
    return `<tr class="vault-row" data-id="${p.id}">
      <td><input type="checkbox" class="vault-row-check" value="${p.id}"></td>
      <td>
        <div class="vault-prompt-name">${esc(p.title)}${p.version > 1 ? ` <span class="vault-version">v${p.version}</span>` : ''}</div>
        <div class="vault-prompt-desc">${esc((p.description || p.content || '').slice(0, 80))}</div>
      </td>
      <td><span class="vault-folder-badge">${esc(folderName)}</span></td>
      <td>${tags}</td>
      <td>${stars}</td>
      <td class="vault-uses">${p.usageCount || 0}</td>
      <td class="vault-date">${date}</td>
      <td>
        <div class="vault-row-actions">
          <button class="vault-action-btn" data-action="copy" data-id="${p.id}" title="Copy to clipboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="vault-action-btn" data-action="insert" data-id="${p.id}" title="Insert into AI tool">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </button>
          <button class="${favClass}" data-action="fav" data-id="${p.id}" title="Favorite">&#9733;</button>
          <button class="vault-action-btn" data-action="edit" data-id="${p.id}" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="vault-action-btn vault-action-danger" data-action="delete" data-id="${p.id}" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Wire actions
  tbody.querySelectorAll('.vault-action-btn, .vault-fav').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'edit') openPromptModal(id);
      else if (action === 'delete') {
        if (confirm('Delete this prompt?')) {
          await VaultAPI.deletePrompt(id);
          await loadAllData();
          renderVaultTable();
          showToast('Prompt deleted');
        }
      } else if (action === 'copy') {
        const p = allPrompts.find(pr => pr.id === id);
        if (p) {
          await navigator.clipboard.writeText(p.content);
          await VaultAPI.recordUsage(id);
          showToast('Copied to clipboard');
        }
      } else if (action === 'insert') {
        const result = await VaultAPI.insertPrompt(id);
        if (result.success) showToast('Inserted into AI tool');
        else showToast('Open an AI tool tab first', 'error');
      } else if (action === 'fav') {
        await VaultAPI.toggleFavorite(id);
        await loadAllData();
        renderVaultTable();
      }
    });
  });

  tbody.querySelectorAll('.vault-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.vault-action-btn') || e.target.closest('.vault-fav') || e.target.closest('input')) return;
      openPromptModal(row.dataset.id);
    });
  });
}

// ═══════════════════════════════════════
//  PROMPT MODAL (Create/Edit + Validation + Version History)
// ═══════════════════════════════════════

function openPromptModal(promptId) {
  const isEdit = !!promptId;
  const prompt = isEdit ? allPrompts.find(p => p.id === promptId) : null;

  const folderOptions = allFolders.map(f =>
    `<option value="${f.id}" ${prompt?.folderId === f.id ? 'selected' : ''}>${esc(f.name)}</option>`
  ).join('');
  const deptOptions = allDepartments.map(d =>
    `<option value="${d.id}" ${prompt?.departmentId === d.id ? 'selected' : ''}>${esc(d.name)}</option>`
  ).join('');

  // Version history section
  let versionHtml = '';
  if (isEdit && prompt?.versionHistory?.length > 0) {
    versionHtml = `
      <div class="form-section-title">Version History</div>
      <div class="version-history">
        ${prompt.versionHistory.slice(0, 10).map(v => `
          <div class="version-entry" data-version="${v.version}">
            <div class="version-header">
              <span class="version-num">v${v.version}</span>
              <span class="version-date">${timeAgo(v.updatedAt)}</span>
              <button type="button" class="btn btn-sm btn-secondary version-restore" data-version="${v.version}">Restore</button>
            </div>
            <div class="version-preview">${esc((v.content || '').slice(0, 120))}...</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  showModal(isEdit ? 'Edit Prompt' : 'New Prompt', `
    <form id="prompt-form" class="modal-form">
      <div class="form-group">
        <label>Title *</label>
        <input type="text" id="pf-title" class="form-input" placeholder="Give your prompt a clear name" value="${esc(prompt?.title || '')}" required>
      </div>
      <div class="form-group">
        <label>Content * <span class="char-count" id="pf-char-count">${(prompt?.content || '').length} chars</span></label>
        <textarea id="pf-content" class="form-input form-textarea" placeholder="Write your prompt content..." rows="8" required>${esc(prompt?.content || '')}</textarea>
      </div>
      <div class="validation-box hidden" id="pf-validation"></div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="pf-description" class="form-input" placeholder="Brief description of what this prompt does" value="${esc(prompt?.description || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Folder</label>
          <select id="pf-folder" class="form-input">
            <option value="">None</option>
            ${folderOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Department</label>
          <select id="pf-dept" class="form-input">
            <option value="">None</option>
            ${deptOptions}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tone</label>
          <select id="pf-tone" class="form-input">
            ${['professional', 'casual', 'technical', 'creative', 'formal', 'friendly', 'persuasive', 'empathetic', 'engaging', 'conversational', 'confident', 'clear']
              .map(t => `<option value="${t}" ${prompt?.tone === t ? 'selected' : ''}>${t[0].toUpperCase() + t.slice(1)}</option>`)
              .join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Model Recommendation</label>
          <input type="text" id="pf-model" class="form-input" placeholder="e.g. GPT-4, Claude 3" value="${esc(prompt?.modelRecommendation || '')}">
        </div>
      </div>
      <div class="form-group">
        <label>Tags (comma-separated)</label>
        <input type="text" id="pf-tags" class="form-input" placeholder="e.g. marketing, email, outreach" value="${(prompt?.tags || []).join(', ')}">
      </div>
      <div class="form-group">
        <label>Intended Outcome</label>
        <textarea id="pf-outcome" class="form-input" rows="2" placeholder="What should this prompt produce?">${esc(prompt?.intendedOutcome || '')}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Example Input</label>
          <textarea id="pf-example-in" class="form-input" rows="2" placeholder="Sample input...">${esc(prompt?.exampleInput || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Example Output</label>
          <textarea id="pf-example-out" class="form-input" rows="2" placeholder="Expected output...">${esc(prompt?.exampleOutput || '')}</textarea>
        </div>
      </div>
      ${versionHtml}
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: 'Validate', class: 'btn btn-secondary', action: 'validate' },
    { label: isEdit ? 'Save Changes' : 'Create Prompt', class: 'btn btn-primary', action: 'submit' },
  ]);

  // Char count
  const contentEl = document.getElementById('pf-content');
  const charCount = document.getElementById('pf-char-count');
  contentEl.addEventListener('input', () => {
    charCount.textContent = `${contentEl.value.length} chars`;
  });

  // Validate button
  document.getElementById('modal').querySelector('[data-action="validate"]').addEventListener('click', async () => {
    const fields = gatherPromptFields();
    const result = await VaultAPI.validatePrompt(fields);
    const box = document.getElementById('pf-validation');
    if (result.valid) {
      box.className = 'validation-box validation-pass';
      box.innerHTML = '<strong>Passed</strong> — This prompt meets all active standards.';
    } else {
      box.className = 'validation-box validation-fail';
      box.innerHTML = `<strong>${result.violations.length} violation${result.violations.length > 1 ? 's' : ''}</strong>` +
        result.violations.map(v => `<div class="validation-item">${esc(v)}</div>`).join('');
    }
  });

  // Version restore
  document.querySelectorAll('.version-restore').forEach(btn => {
    btn.addEventListener('click', () => {
      const ver = parseInt(btn.dataset.version);
      const entry = prompt?.versionHistory?.find(v => v.version === ver);
      if (entry) {
        document.getElementById('pf-title').value = entry.title || prompt.title;
        document.getElementById('pf-content').value = entry.content || '';
        charCount.textContent = `${(entry.content || '').length} chars`;
        showToast(`Restored v${ver} content`);
      }
    });
  });

  // Submit
  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const fields = gatherPromptFields();
    if (!fields.title || !fields.content) {
      showToast('Title and content are required', 'error');
      return;
    }

    // Auto-validate against enforced standards
    const enforcedStandards = allStandards.filter(s => s.enforced);
    if (enforcedStandards.length > 0) {
      const result = await VaultAPI.validatePrompt(fields);
      if (!result.valid) {
        const box = document.getElementById('pf-validation');
        box.className = 'validation-box validation-fail';
        box.innerHTML = `<strong>Cannot save — ${result.violations.length} standard violation${result.violations.length > 1 ? 's' : ''}</strong>` +
          result.violations.map(v => `<div class="validation-item">${esc(v)}</div>`).join('');
        return;
      }
    }

    if (isEdit) {
      await VaultAPI.updatePrompt(promptId, fields);
    } else {
      await VaultAPI.createPrompt(fields);
    }

    closeModal();
    await loadAllData();
    renderVaultView();
    showToast(isEdit ? 'Prompt updated' : 'Prompt created');
  });
}

function gatherPromptFields() {
  return {
    title: document.getElementById('pf-title').value.trim(),
    content: document.getElementById('pf-content').value.trim(),
    description: document.getElementById('pf-description').value.trim(),
    folderId: document.getElementById('pf-folder').value || null,
    departmentId: document.getElementById('pf-dept').value || null,
    tone: document.getElementById('pf-tone').value,
    modelRecommendation: document.getElementById('pf-model').value.trim(),
    tags: document.getElementById('pf-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    intendedOutcome: document.getElementById('pf-outcome').value.trim(),
    exampleInput: document.getElementById('pf-example-in').value.trim(),
    exampleOutput: document.getElementById('pf-example-out').value.trim(),
  };
}

// ═══════════════════════════════════════
//  FOLDER & DEPARTMENT MANAGEMENT
// ═══════════════════════════════════════

function openManageFoldersModal() {
  const folderColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];
  const folderIcons = ['folder', 'megaphone', 'headphones', 'code', 'users', 'trending-up'];

  const folderRows = allFolders.map(f => `
    <div class="manage-row" data-id="${f.id}">
      <span class="manage-row-color" style="background:${f.color || '#8b5cf6'}"></span>
      <span class="manage-row-name">${esc(f.name)}</span>
      <span class="manage-row-count">${allPrompts.filter(p => p.folderId === f.id).length} prompts</span>
      <button class="vault-action-btn vault-action-danger manage-row-delete" data-id="${f.id}" title="Delete">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('') || '<p class="text-muted">No folders yet</p>';

  showModal('Manage Folders', `
    <div class="manage-list" id="manage-folder-list">${folderRows}</div>
    <div class="manage-add-form">
      <input type="text" id="new-folder-name" class="form-input" placeholder="New folder name...">
      <select id="new-folder-color" class="form-input form-input-sm">${folderColors.map(c => `<option value="${c}" style="background:${c}">${c}</option>`).join('')}</select>
      <button class="btn btn-primary btn-sm" id="btn-add-folder">Add</button>
    </div>
  `, [{ label: 'Done', class: 'btn btn-secondary', action: 'close' }]);

  document.getElementById('btn-add-folder').addEventListener('click', async () => {
    const name = document.getElementById('new-folder-name').value.trim();
    if (!name) { showToast('Enter a folder name', 'error'); return; }
    const color = document.getElementById('new-folder-color').value;
    await VaultAPI.saveFolder({ name, color, icon: 'folder' });
    await loadAllData();
    closeModal();
    openManageFoldersModal();
    renderVaultFilters();
    showToast('Folder created');
  });

  document.querySelectorAll('.manage-row-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const count = allPrompts.filter(p => p.folderId === id).length;
      if (count > 0 && !confirm(`This folder has ${count} prompts. Delete anyway? Prompts will be unassigned.`)) return;
      await VaultAPI.deleteFolder(id);
      await loadAllData();
      closeModal();
      openManageFoldersModal();
      renderVaultFilters();
      showToast('Folder deleted');
    });
  });
}

function openManageDepartmentsModal() {
  const deptRows = allDepartments.map(d => `
    <div class="manage-row" data-id="${d.id}">
      <span class="manage-row-name">${esc(d.name)}</span>
      <span class="manage-row-count">${allPrompts.filter(p => p.departmentId === d.id).length} prompts</span>
      <button class="vault-action-btn vault-action-danger manage-row-delete" data-id="${d.id}" title="Delete">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('') || '<p class="text-muted">No departments yet</p>';

  showModal('Manage Departments', `
    <div class="manage-list" id="manage-dept-list">${deptRows}</div>
    <div class="manage-add-form">
      <input type="text" id="new-dept-name" class="form-input" placeholder="New department name...">
      <button class="btn btn-primary btn-sm" id="btn-add-dept">Add</button>
    </div>
  `, [{ label: 'Done', class: 'btn btn-secondary', action: 'close' }]);

  document.getElementById('btn-add-dept').addEventListener('click', async () => {
    const name = document.getElementById('new-dept-name').value.trim();
    if (!name) { showToast('Enter a department name', 'error'); return; }
    await VaultAPI.saveDepartment({ name });
    await loadAllData();
    closeModal();
    openManageDepartmentsModal();
    renderVaultFilters();
    showToast('Department created');
  });

  document.querySelectorAll('.manage-row-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const count = allPrompts.filter(p => p.departmentId === id).length;
      if (count > 0 && !confirm(`This department has ${count} prompts. Delete anyway? Prompts will be unassigned.`)) return;
      await VaultAPI.deleteDepartment(id);
      await loadAllData();
      closeModal();
      openManageDepartmentsModal();
      renderVaultFilters();
      showToast('Department deleted');
    });
  });
}

// ═══════════════════════════════════════
//  COLLECTIONS VIEW
// ═══════════════════════════════════════

function renderCollectionsView() {
  const grid = document.getElementById('collections-grid');
  const empty = document.getElementById('collections-empty');

  if (allCollections.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    grid.innerHTML = allCollections.map(c => {
      const team = allTeams.find(t => t.id === c.teamId);
      const promptCount = (c.promptIds || []).length;
      return `<div class="collection-card" data-id="${c.id}">
        <div class="collection-card-header" style="border-left: 4px solid ${c.color || '#8b5cf6'}">
          <h3 class="collection-card-name">${esc(c.name)}</h3>
          <span class="collection-card-vis">${c.visibility || 'team'}</span>
        </div>
        <p class="collection-card-desc">${esc(c.description || 'No description')}</p>
        <div class="collection-card-footer">
          <span>${promptCount} prompt${promptCount !== 1 ? 's' : ''}</span>
          ${team ? `<span class="collection-team-badge">${esc(team.name)}</span>` : ''}
        </div>
        <div class="collection-card-actions">
          <button class="vault-action-btn" data-action="edit-coll" data-id="${c.id}" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="vault-action-btn vault-action-danger" data-action="delete-coll" data-id="${c.id}" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('[data-action="edit-coll"]').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); openCollectionModal(btn.dataset.id); });
    });
    grid.querySelectorAll('[data-action="delete-coll"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Delete this collection?')) {
          await VaultAPI.deleteCollection(btn.dataset.id);
          await loadAllData();
          renderCollectionsView();
          showToast('Collection deleted');
        }
      });
    });
    grid.querySelectorAll('.collection-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.vault-action-btn')) return;
        openCollectionModal(card.dataset.id);
      });
    });
  }

  document.getElementById('btn-new-collection').onclick = () => openCollectionModal();
}

function openCollectionModal(collId) {
  const isEdit = !!collId;
  const coll = isEdit ? allCollections.find(c => c.id === collId) : null;
  const teamOptions = allTeams.map(t =>
    `<option value="${t.id}" ${coll?.teamId === t.id ? 'selected' : ''}>${esc(t.name)}</option>`
  ).join('');
  const promptChecks = allPrompts.map(p => {
    const checked = coll?.promptIds?.includes(p.id) ? 'checked' : '';
    return `<label class="coll-prompt-check"><input type="checkbox" value="${p.id}" ${checked}><span>${esc(p.title)}</span></label>`;
  }).join('');

  showModal(isEdit ? 'Edit Collection' : 'New Collection', `
    <form id="coll-form" class="modal-form">
      <div class="form-group"><label>Name *</label><input type="text" id="cf-name" class="form-input" value="${esc(coll?.name || '')}" required></div>
      <div class="form-group"><label>Description</label><input type="text" id="cf-desc" class="form-input" value="${esc(coll?.description || '')}"></div>
      <div class="form-row">
        <div class="form-group"><label>Team</label><select id="cf-team" class="form-input"><option value="">No team</option>${teamOptions}</select></div>
        <div class="form-group"><label>Visibility</label><select id="cf-visibility" class="form-input">${['personal', 'team', 'org', 'public'].map(v => `<option value="${v}" ${coll?.visibility === v ? 'selected' : ''}>${v[0].toUpperCase() + v.slice(1)}</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><label>Color</label><input type="color" id="cf-color" class="form-input form-color" value="${coll?.color || '#8b5cf6'}"></div>
      <div class="form-group"><label>Prompts in Collection</label><div class="coll-prompt-list" id="cf-prompts">${promptChecks || '<p class="text-muted">No prompts available</p>'}</div></div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Create', class: 'btn btn-primary', action: 'submit' },
  ]);

  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('cf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    const promptIds = [...document.querySelectorAll('#cf-prompts input:checked')].map(cb => cb.value);
    await VaultAPI.saveCollection({
      ...(coll || {}), name, description: document.getElementById('cf-desc').value.trim(),
      teamId: document.getElementById('cf-team').value || null, visibility: document.getElementById('cf-visibility').value,
      color: document.getElementById('cf-color').value, promptIds,
    });
    closeModal();
    await loadAllData();
    renderCollectionsView();
    showToast(isEdit ? 'Collection updated' : 'Collection created');
  });
}

// ═══════════════════════════════════════
//  STANDARDS VIEW
// ═══════════════════════════════════════

function renderStandardsView() {
  const list = document.getElementById('standards-list');
  const empty = document.getElementById('standards-empty');

  document.getElementById('btn-install-defaults').onclick = installDefaults;
  document.getElementById('btn-install-defaults-2').onclick = installDefaults;
  document.getElementById('btn-new-standard').onclick = () => openStandardModal();

  if (allStandards.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const categoryColors = {
    writing: '#3b82f6', coding: '#10b981', design: '#a855f7',
    marketing: '#f59e0b', support: '#ef4444', hr: '#ec4899',
    sales: '#06b6d4', general: '#6b7280', legal: '#8b5cf6',
    executive: '#f97316', data: '#14b8a6', product: '#e11d48',
  };

  list.innerHTML = allStandards.map(s => {
    const color = categoryColors[s.category] || '#6b7280';
    const ruleCount = (s.rules?.toneRules?.length || 0) + (s.rules?.doList?.length || 0) +
      (s.rules?.dontList?.length || 0) + (s.rules?.constraints?.length || 0);
    return `<div class="standard-card" data-id="${s.id}">
      <div class="standard-card-left">
        <div class="standard-indicator" style="background:${color}"></div>
        <div class="standard-info">
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.description || '')}</p>
          <div class="standard-meta">
            <span class="standard-cat">${s.category}</span>
            <span class="standard-scope">${s.scope}</span>
            <span>${ruleCount} rules</span>
          </div>
        </div>
      </div>
      <div class="standard-card-right">
        <label class="toggle-switch">
          <input type="checkbox" class="std-enforce-toggle" data-id="${s.id}" ${s.enforced ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label-text">${s.enforced ? 'Enforced' : 'Not enforced'}</span>
        <button class="vault-action-btn" data-action="edit-std" data-id="${s.id}" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="vault-action-btn vault-action-danger" data-action="delete-std" data-id="${s.id}" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.std-enforce-toggle').forEach(toggle => {
    toggle.addEventListener('change', async () => {
      const std = allStandards.find(s => s.id === toggle.dataset.id);
      if (std) {
        std.enforced = toggle.checked;
        await VaultAPI.saveStandard(std);
        await loadAllData();
        renderStandardsView();
        showToast(toggle.checked ? 'Standard enforced' : 'Standard unenforced');
      }
    });
  });

  list.querySelectorAll('[data-action="edit-std"]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openStandardModal(btn.dataset.id); });
  });
  list.querySelectorAll('[data-action="delete-std"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Delete this standard?')) {
        await VaultAPI.deleteStandard(btn.dataset.id);
        await loadAllData();
        renderStandardsView();
        showToast('Standard deleted');
      }
    });
  });
}

async function installDefaults() {
  await VaultAPI.installDefaultStandards();
  await loadAllData();
  renderStandardsView();
  showToast('Default standards installed');
}

function openStandardModal(stdId) {
  const isEdit = !!stdId;
  const std = isEdit ? allStandards.find(s => s.id === stdId) : null;
  const r = std?.rules || {};
  const splitLines = (v) => v.split('\n').map(l => l.trim()).filter(Boolean);
  const splitComma = (v) => v.split(',').map(l => l.trim()).filter(Boolean);

  showModal(isEdit ? 'Edit Standard' : 'New Standard', `
    <form id="std-form" class="modal-form">
      <div class="form-group"><label>Name *</label><input type="text" id="sf-name" class="form-input" value="${esc(std?.name || '')}" required></div>
      <div class="form-group"><label>Description</label><input type="text" id="sf-desc" class="form-input" value="${esc(std?.description || '')}"></div>
      <div class="form-row">
        <div class="form-group"><label>Category</label><select id="sf-category" class="form-input">${['general', 'writing', 'coding', 'design', 'marketing', 'support', 'hr', 'sales', 'legal', 'executive', 'data', 'product'].map(c => `<option value="${c}" ${std?.category === c ? 'selected' : ''}>${c[0].toUpperCase() + c.slice(1)}</option>`).join('')}</select></div>
        <div class="form-group"><label>Scope</label><select id="sf-scope" class="form-input">${['personal', 'team', 'org'].map(s => `<option value="${s}" ${std?.scope === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></div>
      </div>
      <div class="form-section-title">Rules</div>
      <div class="form-group"><label>Tone Rules (one per line)</label><textarea id="sf-tone" class="form-input" rows="3">${(r.toneRules || []).join('\n')}</textarea></div>
      <div class="form-group"><label>Do List (one per line)</label><textarea id="sf-do" class="form-input" rows="3">${(r.doList || []).join('\n')}</textarea></div>
      <div class="form-group"><label>Don't List (one per line)</label><textarea id="sf-dont" class="form-input" rows="3">${(r.dontList || []).join('\n')}</textarea></div>
      <div class="form-group"><label>Constraints (one per line)</label><textarea id="sf-constraints" class="form-input" rows="2">${(r.constraints || []).join('\n')}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Min Length</label><input type="number" id="sf-min" class="form-input" value="${r.minLength || 0}" min="0"></div>
        <div class="form-group"><label>Max Length</label><input type="number" id="sf-max" class="form-input" value="${r.maxLength || 0}" min="0"></div>
      </div>
      <div class="form-group"><label>Required Tags (comma-separated)</label><input type="text" id="sf-req-tags" class="form-input" value="${(r.requiredTags || []).join(', ')}"></div>
      <div class="form-group"><label>Banned Words (comma-separated)</label><input type="text" id="sf-banned" class="form-input" value="${(r.bannedWords || []).join(', ')}"></div>
      <div class="form-group"><label>Required Fields (comma-separated)</label><input type="text" id="sf-req-fields" class="form-input" value="${(r.requiredFields || []).join(', ')}"></div>
      <div class="form-group"><label>Template Structure</label><textarea id="sf-template" class="form-input" rows="3">${esc(r.templateStructure || '')}</textarea></div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Create', class: 'btn btn-primary', action: 'submit' },
  ]);

  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('sf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    await VaultAPI.saveStandard({
      ...(std || {}), name, description: document.getElementById('sf-desc').value.trim(),
      category: document.getElementById('sf-category').value, scope: document.getElementById('sf-scope').value,
      rules: {
        toneRules: splitLines(document.getElementById('sf-tone').value),
        doList: splitLines(document.getElementById('sf-do').value),
        dontList: splitLines(document.getElementById('sf-dont').value),
        constraints: splitLines(document.getElementById('sf-constraints').value),
        minLength: parseInt(document.getElementById('sf-min').value) || 0,
        maxLength: parseInt(document.getElementById('sf-max').value) || 0,
        requiredTags: splitComma(document.getElementById('sf-req-tags').value),
        bannedWords: splitComma(document.getElementById('sf-banned').value),
        requiredFields: splitComma(document.getElementById('sf-req-fields').value),
        templateStructure: document.getElementById('sf-template').value.trim(),
      },
    });
    closeModal();
    await loadAllData();
    renderStandardsView();
    showToast(isEdit ? 'Standard updated' : 'Standard created');
  });
}

// ═══════════════════════════════════════
//  TEAM VIEW
// ═══════════════════════════════════════

function renderTeamView() {
  const cards = document.getElementById('team-cards');
  const empty = document.getElementById('team-empty');
  const membersPanel = document.getElementById('team-members-panel');

  document.getElementById('btn-new-team').onclick = () => openTeamModal();
  document.getElementById('btn-add-member').onclick = () => openMemberModal();

  if (allTeams.length === 0 && allMembers.length === 0) {
    cards.innerHTML = '';
    membersPanel.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  membersPanel.classList.remove('hidden');

  cards.innerHTML = allTeams.map(t => {
    const memberCount = allMembers.filter(m => (m.teamIds || []).includes(t.id)).length;
    return `<div class="team-card" data-id="${t.id}" style="border-left: 4px solid ${t.color || '#8b5cf6'}">
      <div class="team-card-header">
        <h3>${esc(t.name)}</h3>
        <div class="team-card-actions">
          <button class="vault-action-btn" data-action="edit-team" data-id="${t.id}" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="vault-action-btn vault-action-danger" data-action="delete-team" data-id="${t.id}" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </div>
      <p class="team-card-desc">${esc(t.description || 'No description')}</p>
      <div class="team-card-footer"><span>${memberCount} member${memberCount !== 1 ? 's' : ''}</span></div>
    </div>`;
  }).join('');

  cards.querySelectorAll('[data-action="edit-team"]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openTeamModal(btn.dataset.id); });
  });
  cards.querySelectorAll('[data-action="delete-team"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Delete this team?')) { await VaultAPI.deleteTeam(btn.dataset.id); await loadAllData(); renderTeamView(); showToast('Team deleted'); }
    });
  });
  renderMembersList();
}

function renderMembersList() {
  const list = document.getElementById('members-list');
  const roleColors = { admin: '#ef4444', manager: '#f59e0b', member: '#6b7280' };
  list.innerHTML = allMembers.map(m => {
    const teams = (m.teamIds || []).map(id => allTeams.find(t => t.id === id)?.name).filter(Boolean);
    const initial = (m.name || m.email || '?')[0].toUpperCase();
    return `<div class="member-row" data-id="${m.id}">
      <div class="member-avatar" style="background:${m.isCurrentUser ? '#8b5cf6' : '#374151'}">${initial}</div>
      <div class="member-info">
        <div class="member-name">${esc(m.name || m.email)}${m.isCurrentUser ? ' <span class="member-you">(You)</span>' : ''}</div>
        <div class="member-meta"><span class="member-role" style="color:${roleColors[m.role] || '#6b7280'}">${m.role}</span>${teams.length ? `<span class="member-teams">${teams.map(n => esc(n)).join(', ')}</span>` : ''}</div>
      </div>
      <div class="member-actions">
        <button class="vault-action-btn" data-action="edit-member" data-id="${m.id}" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        ${!m.isCurrentUser ? `<button class="vault-action-btn vault-action-danger" data-action="delete-member" data-id="${m.id}" title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>` : ''}
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-action="edit-member"]').forEach(btn => { btn.addEventListener('click', () => openMemberModal(btn.dataset.id)); });
  list.querySelectorAll('[data-action="delete-member"]').forEach(btn => {
    btn.addEventListener('click', async () => { if (confirm('Remove this member?')) { await VaultAPI.deleteMember(btn.dataset.id); await loadAllData(); renderTeamView(); showToast('Member removed'); } });
  });
}

function openTeamModal(teamId) {
  const isEdit = !!teamId;
  const team = isEdit ? allTeams.find(t => t.id === teamId) : null;
  showModal(isEdit ? 'Edit Team' : 'New Team', `
    <form class="modal-form">
      <div class="form-group"><label>Team Name *</label><input type="text" id="tf-name" class="form-input" value="${esc(team?.name || '')}" required></div>
      <div class="form-group"><label>Description</label><input type="text" id="tf-desc" class="form-input" value="${esc(team?.description || '')}"></div>
      <div class="form-group"><label>Color</label><input type="color" id="tf-color" class="form-input form-color" value="${team?.color || '#8b5cf6'}"></div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Create', class: 'btn btn-primary', action: 'submit' },
  ]);
  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('tf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    await VaultAPI.saveTeam({ ...(team || {}), name, description: document.getElementById('tf-desc').value.trim(), color: document.getElementById('tf-color').value });
    closeModal(); await loadAllData(); renderTeamView(); showToast(isEdit ? 'Team updated' : 'Team created');
  });
}

function openMemberModal(memberId) {
  const isEdit = !!memberId;
  const member = isEdit ? allMembers.find(m => m.id === memberId) : null;
  const teamChecks = allTeams.map(t => {
    const checked = (member?.teamIds || []).includes(t.id) ? 'checked' : '';
    return `<label class="coll-prompt-check"><input type="checkbox" value="${t.id}" ${checked}><span>${esc(t.name)}</span></label>`;
  }).join('');
  showModal(isEdit ? 'Edit Member' : 'Add Member', `
    <form class="modal-form">
      <div class="form-group"><label>Name *</label><input type="text" id="mf-name" class="form-input" value="${esc(member?.name || '')}" required></div>
      <div class="form-group"><label>Email</label><input type="email" id="mf-email" class="form-input" value="${esc(member?.email || '')}"></div>
      <div class="form-group"><label>Role</label><select id="mf-role" class="form-input">${['admin', 'manager', 'member'].map(r => `<option value="${r}" ${member?.role === r ? 'selected' : ''}>${r[0].toUpperCase() + r.slice(1)}</option>`).join('')}</select></div>
      <div class="form-group"><label>Teams</label><div class="coll-prompt-list" id="mf-teams">${teamChecks || '<p class="text-muted">No teams available</p>'}</div></div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Add', class: 'btn btn-primary', action: 'submit' },
  ]);
  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('mf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    const teamIds = [...document.querySelectorAll('#mf-teams input:checked')].map(cb => cb.value);
    await VaultAPI.saveMember({ ...(member || {}), name, email: document.getElementById('mf-email').value.trim(), role: document.getElementById('mf-role').value, teamIds });
    closeModal(); await loadAllData(); renderTeamView(); showToast(isEdit ? 'Member updated' : 'Member added');
  });
}

// ═══════════════════════════════════════
//  ORG VIEW
// ═══════════════════════════════════════

function renderOrgView() {
  if (currentOrg) {
    document.getElementById('org-name').value = currentOrg.name || '';
    document.getElementById('org-domain').value = currentOrg.domain || '';
    document.getElementById('org-plan').value = currentOrg.plan || 'free';
    document.getElementById('org-enforce-standards').checked = currentOrg.settings?.enforceStandards || false;
    document.getElementById('org-require-approval').checked = currentOrg.settings?.requireApproval || false;
    document.getElementById('org-allow-personal').checked = currentOrg.settings?.allowPersonalPrompts !== false;
    document.getElementById('org-default-visibility').value = currentOrg.settings?.defaultVisibility || 'team';
  }
  document.getElementById('org-form').onsubmit = async (e) => {
    e.preventDefault();
    await VaultAPI.saveOrg({
      ...(currentOrg || {}),
      name: document.getElementById('org-name').value.trim(),
      domain: document.getElementById('org-domain').value.trim(),
      plan: document.getElementById('org-plan').value,
      settings: {
        enforceStandards: document.getElementById('org-enforce-standards').checked,
        requireApproval: document.getElementById('org-require-approval').checked,
        allowPersonalPrompts: document.getElementById('org-allow-personal').checked,
        defaultVisibility: document.getElementById('org-default-visibility').value,
      },
    });
    await loadAllData();
    showToast('Organization saved');
  };
}

// ═══════════════════════════════════════
//  ANALYTICS VIEW
// ═══════════════════════════════════════

function renderAnalyticsView() {
  const a = currentAnalytics || {};
  document.getElementById('analytics-metrics').innerHTML = `
    <div class="metric"><span class="metric-value">${a.totalPrompts || 0}</span><span class="metric-label">Total Prompts</span></div>
    <div class="metric"><span class="metric-value">${a.totalUses || 0}</span><span class="metric-label">Total Uses</span></div>
    <div class="metric"><span class="metric-value">${a.avgRating ? a.avgRating.toFixed(1) : '—'}</span><span class="metric-label">Avg Rating</span></div>
    <div class="metric"><span class="metric-value">${a.usesThisWeek || 0}</span><span class="metric-label">Uses This Week</span></div>
  `;

  const topList = document.getElementById('analytics-top-list');
  const topPrompts = (a.topPrompts || []).slice(0, 8);
  topList.innerHTML = topPrompts.length
    ? topPrompts.map((p, i) => `<div class="analytics-item"><span class="analytics-rank">#${i + 1}</span><span class="analytics-item-name">${esc(p.title)}</span><span class="analytics-item-val">${p.usageCount || 0} uses</span></div>`).join('')
    : '<p class="text-muted">No usage data yet</p>';

  const deptBars = document.getElementById('analytics-dept-bars');
  const deptUsage = a.departmentUsage || a.deptUsage || {};
  const deptEntries = Object.entries(deptUsage).sort((a, b) => b[1] - a[1]);
  const maxUse = deptEntries[0]?.[1] || 1;
  deptBars.innerHTML = deptEntries.length
    ? deptEntries.map(([name, count]) => {
        const dept = allDepartments.find(d => d.id === name);
        const label = dept ? dept.name : name;
        const pct = Math.round((count / maxUse) * 100);
        return `<div class="dept-bar-row"><span class="dept-bar-label">${esc(label)}</span><div class="dept-bar-track"><div class="dept-bar-fill" style="width:${pct}%"></div></div><span class="dept-bar-val">${count}</span></div>`;
      }).join('')
    : '<p class="text-muted">No department data yet</p>';

  const timeline = document.getElementById('analytics-timeline');
  const recentPrompts = [...allPrompts].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 8);
  timeline.innerHTML = recentPrompts.length
    ? recentPrompts.map(p => `<div class="timeline-item"><span class="timeline-dot"></span><span class="timeline-text">${esc(p.title)}</span><span class="timeline-time">${timeAgo(p.updatedAt || p.createdAt)}</span></div>`).join('')
    : '<p class="text-muted">No recent activity</p>';
}

// ═══════════════════════════════════════
//  IMPORT / EXPORT VIEW
// ═══════════════════════════════════════

function renderImportExportView() {
  document.getElementById('btn-export-pack').onclick = async () => {
    const selected = [...document.querySelectorAll('.vault-row-check:checked')].map(cb => cb.value);
    const ids = selected.length > 0 ? selected : allPrompts.map(p => p.id);
    if (ids.length === 0) { showToast('No prompts to export', 'error'); return; }
    const packName = window.prompt('Pack name:', 'My Prompt Pack') || 'My Prompt Pack';
    const resp = await VaultAPI.exportPack(ids, packName);
    if (resp.pack) {
      const blob = new Blob([JSON.stringify(resp.pack, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${packName.replace(/\s+/g, '-').toLowerCase()}.json`; a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${resp.pack.promptCount} prompts`);
    }
  };

  document.getElementById('btn-import-pack').onclick = () => document.getElementById('import-file').click();

  document.getElementById('import-file').onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const packData = JSON.parse(text);
      const result = await VaultAPI.importPack(packData);
      if (result.success) { await loadAllData(); renderCurrentView(); showToast(`Imported ${result.imported} prompts`); }
      else showToast(result.error || 'Import failed', 'error');
    } catch { showToast('Invalid JSON file', 'error'); }
    e.target.value = '';
  };
}

// ═══════════════════════════════════════
//  MODAL SYSTEM
// ═══════════════════════════════════════

function setupModalHandlers() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function showModal(title, bodyHtml, buttons = []) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  const footer = document.getElementById('modal-footer');
  footer.innerHTML = buttons.map(b => `<button class="${b.class}" data-action="${b.action}">${b.label}</button>`).join('');
  footer.querySelectorAll('[data-action="close"]').forEach(btn => btn.addEventListener('click', closeModal));
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

// ═══════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  setTimeout(() => { toast.className = 'toast hidden'; }, 3000);
}

function renderStars(rating) {
  const r = typeof rating === 'number' ? rating : 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '<span class="star star-full">&#9733;</span>';
    else if (i === full && half) html += '<span class="star star-half">&#9733;</span>';
    else html += '<span class="star star-empty">&#9734;</span>';
  }
  return html;
}

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
