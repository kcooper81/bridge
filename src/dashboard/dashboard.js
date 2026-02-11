// ContextIQ Dashboard — Vault-style Prompt Manager
// Full-page web app for managing prompts, teams, standards, collections

// ── Messaging helper ──
function msg(type, data = {}) {
  return chrome.runtime.sendMessage({ type, ...data });
}

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

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupModalHandlers();
  await loadAllData();
  renderCurrentView();
});

async function loadAllData() {
  try {
    const data = await msg('VAULT_GET_ALL');
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
      document.getElementById('sidebar-user-name').textContent = user.name || user.email;
      document.getElementById('sidebar-user-role').textContent = user.role;
      document.getElementById('sidebar-user-avatar').textContent = (user.name || user.email || '?')[0].toUpperCase();
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
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

  // Sidebar user click → org view
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

  // Wire up search & filters
  const searchEl = document.getElementById('vault-search');
  searchEl.oninput = debounce(() => renderVaultTable(), 200);
  document.getElementById('vault-filter-folder').onchange = () => renderVaultTable();
  document.getElementById('vault-filter-dept').onchange = () => renderVaultTable();
  document.getElementById('vault-sort').onchange = () => renderVaultTable();

  document.getElementById('btn-vault-new').onclick = () => openPromptModal();
  document.getElementById('btn-vault-install-starters').onclick = async () => {
    await msg('PROMPT_INSTALL_STARTERS');
    await loadAllData();
    renderVaultView();
    showToast('Starter packs installed!');
  };

  document.getElementById('vault-select-all').onchange = (e) => {
    document.querySelectorAll('.vault-row-check').forEach(cb => { cb.checked = e.target.checked; });
  };
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
  const weekAgo = Date.now() - 7 * 86400000;
  const usesThisWeek = allPrompts.reduce((sum, p) => sum + (p.usageCount || 0), 0);
  document.getElementById('stat-used').textContent = usesThisWeek;
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
      (p.tags || []).some(t => t.toLowerCase().includes(query))
    );
  }
  if (folderId) filtered = filtered.filter(p => p.folderId === folderId);
  if (deptId) filtered = filtered.filter(p => p.departmentId === deptId);

  switch (sortBy) {
    case 'popular': filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)); break;
    case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    case 'alpha': filtered.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
    default: filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  return filtered;
}

function renderVaultTable() {
  const filtered = getFilteredPrompts();
  const tbody = document.getElementById('vault-tbody');
  const empty = document.getElementById('vault-empty');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tbody.innerHTML = filtered.map(p => {
    const folder = allFolders.find(f => f.id === p.folderId);
    const folderName = folder ? folder.name : '—';
    const tags = (p.tags || []).slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const stars = renderStars(p.rating || 0);
    const date = timeAgo(p.updatedAt || p.createdAt);
    return `<tr class="vault-row" data-id="${p.id}">
      <td><input type="checkbox" class="vault-row-check" value="${p.id}"></td>
      <td>
        <div class="vault-prompt-name">${esc(p.title)}</div>
        <div class="vault-prompt-desc">${esc((p.description || p.content || '').slice(0, 80))}</div>
      </td>
      <td><span class="vault-folder-badge">${esc(folderName)}</span></td>
      <td>${tags}</td>
      <td>${stars}</td>
      <td class="vault-uses">${p.usageCount || 0}</td>
      <td class="vault-date">${date}</td>
      <td>
        <div class="vault-row-actions">
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

  // Wire row actions
  tbody.querySelectorAll('.vault-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'edit') openPromptModal(id);
      if (action === 'delete') {
        if (confirm('Delete this prompt?')) {
          await msg('PROMPT_DELETE', { promptId: id });
          await loadAllData();
          renderVaultTable();
          showToast('Prompt deleted');
        }
      }
    });
  });

  // Row click → edit
  tbody.querySelectorAll('.vault-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.vault-action-btn') || e.target.closest('input')) return;
      openPromptModal(row.dataset.id);
    });
  });
}

// ═══════════════════════════════════════
//  PROMPT MODAL (Create/Edit)
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

  showModal(isEdit ? 'Edit Prompt' : 'New Prompt', `
    <form id="prompt-form" class="modal-form">
      <div class="form-group">
        <label>Title *</label>
        <input type="text" id="pf-title" class="form-input" placeholder="Give your prompt a clear name" value="${esc(prompt?.title || '')}" required>
      </div>
      <div class="form-group">
        <label>Content *</label>
        <textarea id="pf-content" class="form-input form-textarea" placeholder="Write your prompt content..." rows="6" required>${esc(prompt?.content || '')}</textarea>
      </div>
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
            ${['professional', 'casual', 'technical', 'creative', 'formal', 'friendly', 'persuasive', 'empathetic']
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
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save Changes' : 'Create Prompt', class: 'btn btn-primary', action: 'submit' },
  ]);

  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const fields = {
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

    if (!fields.title || !fields.content) {
      showToast('Title and content are required', 'error');
      return;
    }

    if (isEdit) {
      await msg('PROMPT_UPDATE', { promptId: promptId, fields });
    } else {
      await msg('PROMPT_CREATE', { fields });
    }

    closeModal();
    await loadAllData();
    renderVaultView();
    showToast(isEdit ? 'Prompt updated' : 'Prompt created');
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
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCollectionModal(btn.dataset.id);
      });
    });
    grid.querySelectorAll('[data-action="delete-coll"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Delete this collection?')) {
          await msg('TEAM_DELETE_COLLECTION', { collId: btn.dataset.id });
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

  // Build prompt checklist
  const promptChecks = allPrompts.map(p => {
    const checked = coll?.promptIds?.includes(p.id) ? 'checked' : '';
    return `<label class="coll-prompt-check"><input type="checkbox" value="${p.id}" ${checked}><span>${esc(p.title)}</span></label>`;
  }).join('');

  showModal(isEdit ? 'Edit Collection' : 'New Collection', `
    <form id="coll-form" class="modal-form">
      <div class="form-group">
        <label>Name *</label>
        <input type="text" id="cf-name" class="form-input" placeholder="Collection name" value="${esc(coll?.name || '')}" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="cf-desc" class="form-input" placeholder="What's this collection for?" value="${esc(coll?.description || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Team</label>
          <select id="cf-team" class="form-input">
            <option value="">No team</option>
            ${teamOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Visibility</label>
          <select id="cf-visibility" class="form-input">
            ${['personal', 'team', 'org', 'public'].map(v =>
              `<option value="${v}" ${coll?.visibility === v ? 'selected' : ''}>${v[0].toUpperCase() + v.slice(1)}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Color</label>
        <input type="color" id="cf-color" class="form-input form-color" value="${coll?.color || '#8b5cf6'}">
      </div>
      <div class="form-group">
        <label>Prompts in Collection</label>
        <div class="coll-prompt-list" id="cf-prompts">${promptChecks || '<p class="text-muted">No prompts available</p>'}</div>
      </div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Create', class: 'btn btn-primary', action: 'submit' },
  ]);

  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('cf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }

    const promptIds = [...document.querySelectorAll('#cf-prompts input:checked')].map(cb => cb.value);

    const collData = {
      ...(coll || {}),
      name,
      description: document.getElementById('cf-desc').value.trim(),
      teamId: document.getElementById('cf-team').value || null,
      visibility: document.getElementById('cf-visibility').value,
      color: document.getElementById('cf-color').value,
      promptIds,
    };

    await msg('TEAM_SAVE_COLLECTION', { collection: collData });
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
    sales: '#06b6d4', general: '#6b7280',
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

  // Toggle enforce
  list.querySelectorAll('.std-enforce-toggle').forEach(toggle => {
    toggle.addEventListener('change', async () => {
      const std = allStandards.find(s => s.id === toggle.dataset.id);
      if (std) {
        std.enforced = toggle.checked;
        await msg('TEAM_SAVE_STANDARD', { standard: std });
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
        await msg('TEAM_DELETE_STANDARD', { stdId: btn.dataset.id });
        await loadAllData();
        renderStandardsView();
        showToast('Standard deleted');
      }
    });
  });
}

async function installDefaults() {
  await msg('TEAM_INSTALL_DEFAULT_STANDARDS');
  await loadAllData();
  renderStandardsView();
  showToast('Default standards installed');
}

function openStandardModal(stdId) {
  const isEdit = !!stdId;
  const std = isEdit ? allStandards.find(s => s.id === stdId) : null;
  const r = std?.rules || {};

  showModal(isEdit ? 'Edit Standard' : 'New Standard', `
    <form id="std-form" class="modal-form">
      <div class="form-group">
        <label>Name *</label>
        <input type="text" id="sf-name" class="form-input" value="${esc(std?.name || '')}" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="sf-desc" class="form-input" value="${esc(std?.description || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <select id="sf-category" class="form-input">
            ${['general', 'writing', 'coding', 'design', 'marketing', 'support', 'hr', 'sales'].map(c =>
              `<option value="${c}" ${std?.category === c ? 'selected' : ''}>${c[0].toUpperCase() + c.slice(1)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Scope</label>
          <select id="sf-scope" class="form-input">
            ${['personal', 'team', 'org'].map(s =>
              `<option value="${s}" ${std?.scope === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-section-title">Rules</div>
      <div class="form-group">
        <label>Tone Rules (one per line)</label>
        <textarea id="sf-tone" class="form-input" rows="3">${(r.toneRules || []).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label>Do List (one per line)</label>
        <textarea id="sf-do" class="form-input" rows="3">${(r.doList || []).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label>Don't List (one per line)</label>
        <textarea id="sf-dont" class="form-input" rows="3">${(r.dontList || []).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label>Constraints (one per line)</label>
        <textarea id="sf-constraints" class="form-input" rows="2">${(r.constraints || []).join('\n')}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Min Length</label>
          <input type="number" id="sf-min" class="form-input" value="${r.minLength || 0}" min="0">
        </div>
        <div class="form-group">
          <label>Max Length</label>
          <input type="number" id="sf-max" class="form-input" value="${r.maxLength || 0}" min="0">
        </div>
      </div>
      <div class="form-group">
        <label>Required Tags (comma-separated)</label>
        <input type="text" id="sf-req-tags" class="form-input" value="${(r.requiredTags || []).join(', ')}">
      </div>
      <div class="form-group">
        <label>Banned Words (comma-separated)</label>
        <input type="text" id="sf-banned" class="form-input" value="${(r.bannedWords || []).join(', ')}">
      </div>
      <div class="form-group">
        <label>Required Fields (comma-separated)</label>
        <input type="text" id="sf-req-fields" class="form-input" value="${(r.requiredFields || []).join(', ')}">
      </div>
      <div class="form-group">
        <label>Template Structure</label>
        <textarea id="sf-template" class="form-input" rows="3" placeholder="Optional template prompts should follow">${esc(r.templateStructure || '')}</textarea>
      </div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Create', class: 'btn btn-primary', action: 'submit' },
  ]);

  const splitLines = (v) => v.split('\n').map(l => l.trim()).filter(Boolean);
  const splitComma = (v) => v.split(',').map(l => l.trim()).filter(Boolean);

  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('sf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }

    const stdData = {
      ...(std || {}),
      name,
      description: document.getElementById('sf-desc').value.trim(),
      category: document.getElementById('sf-category').value,
      scope: document.getElementById('sf-scope').value,
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
    };

    await msg('TEAM_SAVE_STANDARD', { standard: stdData });
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

  // Team cards
  cards.innerHTML = allTeams.map(t => {
    const memberCount = allMembers.filter(m => (m.teamIds || []).includes(t.id)).length;
    return `<div class="team-card" data-id="${t.id}" style="border-left: 4px solid ${t.color || '#8b5cf6'}">
      <div class="team-card-header">
        <h3>${esc(t.name)}</h3>
        <div class="team-card-actions">
          <button class="vault-action-btn" data-action="edit-team" data-id="${t.id}" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="vault-action-btn vault-action-danger" data-action="delete-team" data-id="${t.id}" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <p class="team-card-desc">${esc(t.description || 'No description')}</p>
      <div class="team-card-footer">
        <span>${memberCount} member${memberCount !== 1 ? 's' : ''}</span>
      </div>
    </div>`;
  }).join('');

  cards.querySelectorAll('[data-action="edit-team"]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openTeamModal(btn.dataset.id); });
  });
  cards.querySelectorAll('[data-action="delete-team"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Delete this team? Members will be unlinked.')) {
        await msg('TEAM_DELETE_TEAM', { teamId: btn.dataset.id });
        await loadAllData();
        renderTeamView();
        showToast('Team deleted');
      }
    });
  });

  // Members list
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
        <div class="member-meta">
          <span class="member-role" style="color:${roleColors[m.role] || '#6b7280'}">${m.role}</span>
          ${teams.length ? `<span class="member-teams">${teams.map(n => esc(n)).join(', ')}</span>` : ''}
        </div>
      </div>
      <div class="member-actions">
        <button class="vault-action-btn" data-action="edit-member" data-id="${m.id}" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        ${!m.isCurrentUser ? `<button class="vault-action-btn vault-action-danger" data-action="delete-member" data-id="${m.id}" title="Remove">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-action="edit-member"]').forEach(btn => {
    btn.addEventListener('click', () => openMemberModal(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete-member"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Remove this member?')) {
        await msg('TEAM_DELETE_MEMBER', { memberId: btn.dataset.id });
        await loadAllData();
        renderTeamView();
        showToast('Member removed');
      }
    });
  });
}

function openTeamModal(teamId) {
  const isEdit = !!teamId;
  const team = isEdit ? allTeams.find(t => t.id === teamId) : null;

  showModal(isEdit ? 'Edit Team' : 'New Team', `
    <form class="modal-form">
      <div class="form-group">
        <label>Team Name *</label>
        <input type="text" id="tf-name" class="form-input" value="${esc(team?.name || '')}" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="tf-desc" class="form-input" value="${esc(team?.description || '')}">
      </div>
      <div class="form-group">
        <label>Color</label>
        <input type="color" id="tf-color" class="form-input form-color" value="${team?.color || '#8b5cf6'}">
      </div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Create', class: 'btn btn-primary', action: 'submit' },
  ]);

  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('tf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    await msg('TEAM_SAVE_TEAM', { team: { ...(team || {}), name, description: document.getElementById('tf-desc').value.trim(), color: document.getElementById('tf-color').value } });
    closeModal();
    await loadAllData();
    renderTeamView();
    showToast(isEdit ? 'Team updated' : 'Team created');
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
      <div class="form-group">
        <label>Name *</label>
        <input type="text" id="mf-name" class="form-input" value="${esc(member?.name || '')}" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="mf-email" class="form-input" value="${esc(member?.email || '')}">
      </div>
      <div class="form-group">
        <label>Role</label>
        <select id="mf-role" class="form-input">
          ${['admin', 'manager', 'member'].map(r =>
            `<option value="${r}" ${member?.role === r ? 'selected' : ''}>${r[0].toUpperCase() + r.slice(1)}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Teams</label>
        <div class="coll-prompt-list" id="mf-teams">${teamChecks || '<p class="text-muted">No teams available</p>'}</div>
      </div>
    </form>
  `, [
    { label: 'Cancel', class: 'btn btn-secondary', action: 'close' },
    { label: isEdit ? 'Save' : 'Add', class: 'btn btn-primary', action: 'submit' },
  ]);

  document.getElementById('modal').querySelector('[data-action="submit"]').addEventListener('click', async () => {
    const name = document.getElementById('mf-name').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    const teamIds = [...document.querySelectorAll('#mf-teams input:checked')].map(cb => cb.value);
    await msg('TEAM_SAVE_MEMBER', { member: { ...(member || {}), name, email: document.getElementById('mf-email').value.trim(), role: document.getElementById('mf-role').value, teamIds } });
    closeModal();
    await loadAllData();
    renderTeamView();
    showToast(isEdit ? 'Member updated' : 'Member added');
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
    const org = {
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
    };
    await msg('TEAM_SAVE_ORG', { org });
    await loadAllData();
    showToast('Organization saved');
  };
}

// ═══════════════════════════════════════
//  ANALYTICS VIEW
// ═══════════════════════════════════════

function renderAnalyticsView() {
  const a = currentAnalytics || {};

  // Overview metrics
  const metrics = document.getElementById('analytics-metrics');
  metrics.innerHTML = `
    <div class="metric"><span class="metric-value">${a.totalPrompts || 0}</span><span class="metric-label">Total Prompts</span></div>
    <div class="metric"><span class="metric-value">${a.totalUses || 0}</span><span class="metric-label">Total Uses</span></div>
    <div class="metric"><span class="metric-value">${a.avgRating ? a.avgRating.toFixed(1) : '—'}</span><span class="metric-label">Avg Rating</span></div>
    <div class="metric"><span class="metric-value">${a.usesThisWeek || 0}</span><span class="metric-label">Uses This Week</span></div>
  `;

  // Top prompts
  const topList = document.getElementById('analytics-top-list');
  const topPrompts = (a.topPrompts || []).slice(0, 8);
  if (topPrompts.length) {
    topList.innerHTML = topPrompts.map((p, i) =>
      `<div class="analytics-item"><span class="analytics-rank">#${i + 1}</span><span class="analytics-item-name">${esc(p.title)}</span><span class="analytics-item-val">${p.usageCount} uses</span></div>`
    ).join('');
  } else {
    topList.innerHTML = '<p class="text-muted">No usage data yet</p>';
  }

  // Department bars
  const deptBars = document.getElementById('analytics-dept-bars');
  const deptUsage = a.departmentUsage || {};
  const deptEntries = Object.entries(deptUsage).sort((a, b) => b[1] - a[1]);
  const maxUse = deptEntries[0]?.[1] || 1;
  if (deptEntries.length) {
    deptBars.innerHTML = deptEntries.map(([name, count]) => {
      const pct = Math.round((count / maxUse) * 100);
      return `<div class="dept-bar-row"><span class="dept-bar-label">${esc(name)}</span><div class="dept-bar-track"><div class="dept-bar-fill" style="width:${pct}%"></div></div><span class="dept-bar-val">${count}</span></div>`;
    }).join('');
  } else {
    deptBars.innerHTML = '<p class="text-muted">No department data yet</p>';
  }

  // Recent timeline
  const timeline = document.getElementById('analytics-timeline');
  const recentPrompts = [...allPrompts].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 8);
  if (recentPrompts.length) {
    timeline.innerHTML = recentPrompts.map(p =>
      `<div class="timeline-item"><span class="timeline-dot"></span><span class="timeline-text">${esc(p.title)}</span><span class="timeline-time">${timeAgo(p.updatedAt || p.createdAt)}</span></div>`
    ).join('');
  } else {
    timeline.innerHTML = '<p class="text-muted">No recent activity</p>';
  }
}

// ═══════════════════════════════════════
//  IMPORT / EXPORT VIEW
// ═══════════════════════════════════════

function renderImportExportView() {
  document.getElementById('btn-export-pack').onclick = async () => {
    const selected = [...document.querySelectorAll('.vault-row-check:checked')].map(cb => cb.value);
    const ids = selected.length > 0 ? selected : allPrompts.map(p => p.id);
    if (ids.length === 0) { showToast('No prompts to export', 'error'); return; }

    const packName = prompt('Pack name:', 'My Prompt Pack') || 'My Prompt Pack';
    const resp = await msg('TEAM_EXPORT_PACK', { promptIds: ids, packName });
    if (resp.pack) {
      const blob = new Blob([JSON.stringify(resp.pack, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packName.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${resp.pack.promptCount} prompts`);
    }
  };

  document.getElementById('btn-import-pack').onclick = () => {
    document.getElementById('import-file').click();
  };

  document.getElementById('import-file').onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const packData = JSON.parse(text);
      const result = await msg('TEAM_IMPORT_PACK', { packData });
      if (result.success) {
        await loadAllData();
        renderCurrentView();
        showToast(`Imported ${result.imported} prompts`);
      } else {
        showToast(result.error || 'Import failed', 'error');
      }
    } catch {
      showToast('Invalid JSON file', 'error');
    }
    e.target.value = '';
  };
}

// ═══════════════════════════════════════
//  MODAL SYSTEM
// ═══════════════════════════════════════

function setupModalHandlers() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
}

function showModal(title, bodyHtml, buttons = []) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  const footer = document.getElementById('modal-footer');
  footer.innerHTML = buttons.map(b =>
    `<button class="${b.class}" data-action="${b.action}">${b.label}</button>`
  ).join('');
  footer.querySelectorAll('[data-action="close"]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

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
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
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
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
