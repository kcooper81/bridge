// ContextIQ Artifact Gallery v0.6.0
// Search, multi-select, delete, active tab status, bridge

import { truncate } from '../lib/utils.js';

// --- DOM ---
const toolTabsEl = document.getElementById('tool-tabs');
const galleryEmpty = document.getElementById('gallery-empty');
const artifactListEl = document.getElementById('artifact-list');
const bridgeSheet = document.getElementById('bridge-sheet');
const bridgeSheetTitle = document.getElementById('bridge-sheet-title');
const bridgeSheetTargets = document.getElementById('bridge-sheet-targets');
const bridgeSheetClose = document.getElementById('bridge-sheet-close');
const btnSettings = document.getElementById('btn-settings');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('search-input');
const activeTabBar = document.getElementById('active-tab-bar');
const activeTabIndicator = document.getElementById('active-tab-indicator');
const activeTabText = document.getElementById('active-tab-text');
const selectionToolbar = document.getElementById('selection-toolbar');
const selectionCount = document.getElementById('selection-count');
const btnBridgeSelected = document.getElementById('btn-bridge-selected');
const btnDeleteSelected = document.getElementById('btn-delete-selected');
const btnCancelSelection = document.getElementById('btn-cancel-selection');

// --- State ---
let allArtifacts = [];
let activeFilter = 'all';
let searchQuery = '';
let bridgingArtifact = null;
let selectedIndices = new Set();
let isSelectMode = false;

// --- AI Tool Config ---
const AI_TOOLS = [
  { name: 'ChatGPT', key: 'chatgpt', url: 'https://chatgpt.com/', color: '#10a37f' },
  { name: 'Claude', key: 'claude', url: 'https://claude.ai/new', color: '#d97757' },
  { name: 'Gemini', key: 'gemini', url: 'https://gemini.google.com/app', color: '#4285f4' },
  { name: 'Perplexity', key: 'perplexity', url: 'https://www.perplexity.ai/', color: '#20b8cd' },
  { name: 'Copilot', key: 'copilot', url: 'https://copilot.microsoft.com/', color: '#7c3aed' },
  { name: 'DeepSeek', key: 'deepseek', url: 'https://chat.deepseek.com/', color: '#4f8ff7' },
  { name: 'Grok', key: 'grok', url: 'https://grok.com/', color: '#ef4444' },
  { name: 'Mistral', key: 'mistral', url: 'https://chat.mistral.ai/', color: '#ff7000' },
  { name: 'Poe', key: 'poe', url: 'https://poe.com/', color: '#6c5ce7' },
];

const TOOL_ICONS = {
  ChatGPT: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  Claude: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  Gemini: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  Perplexity: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  Copilot: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  DeepSeek: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  Grok: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l16 16M20 4L4 20"/></svg>',
  Mistral: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  Poe: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 14h4"/></svg>',
  'Notion AI': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>',
};

// --- Init ---

async function init() {
  await Promise.all([loadArtifacts(), loadActiveTabStatus()]);
  bindEvents();
}

async function loadActiveTabStatus() {
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_TOOL' });
    if (resp?.tool) {
      activeTabText.textContent = `Monitoring ${resp.tool.toolName}`;
      activeTabIndicator.classList.add('active');
      activeTabBar.classList.add('detected');
    } else {
      activeTabText.textContent = 'No AI tool on active tab';
      activeTabIndicator.classList.remove('active');
      activeTabBar.classList.remove('detected');
    }
  } catch {
    activeTabText.textContent = 'No AI tool detected';
  }
}

async function loadArtifacts() {
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'GET_ARTIFACT_GALLERY' });
    allArtifacts = resp?.artifacts || [];
  } catch {
    allArtifacts = [];
  }

  renderToolTabs();
  renderArtifacts();
}

// --- Filtering ---

function getFilteredArtifacts() {
  let filtered = activeFilter === 'all'
    ? allArtifacts
    : allArtifacts.filter(a => a.toolName === activeFilter);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a => {
      const topicMatch = (a.topic || '').toLowerCase().includes(q);
      const titleMatch = (a.title || '').toLowerCase().includes(q);
      const toolMatch = (a.toolName || '').toLowerCase().includes(q);
      const codeMatch = (a.codeBlocks || []).some(b =>
        (b.code || '').toLowerCase().includes(q) || (b.language || '').toLowerCase().includes(q)
      );
      const turnMatch = (a.turns || []).some(t => (t.text || '').toLowerCase().includes(q));
      return topicMatch || titleMatch || toolMatch || codeMatch || turnMatch;
    });
  }

  return filtered;
}

// --- Render Tool Tabs ---

function renderToolTabs() {
  const toolCounts = {};
  for (const a of allArtifacts) {
    toolCounts[a.toolName] = (toolCounts[a.toolName] || 0) + 1;
  }

  let html = `<button class="tool-tab ${activeFilter === 'all' ? 'active' : ''}" data-tool="all">All <span class="tool-tab-count">${allArtifacts.length}</span></button>`;

  for (const [tool, count] of Object.entries(toolCounts)) {
    const icon = TOOL_ICONS[tool] || TOOL_ICONS.ChatGPT;
    html += `<button class="tool-tab ${activeFilter === tool ? 'active' : ''}" data-tool="${esc(tool)}">${icon} ${esc(tool)} <span class="tool-tab-count">${count}</span></button>`;
  }

  toolTabsEl.innerHTML = html;
}

// --- Render Artifacts ---

function renderArtifacts() {
  const filtered = getFilteredArtifacts();

  if (filtered.length === 0) {
    galleryEmpty.classList.remove('hidden');
    artifactListEl.innerHTML = '';
    if (searchQuery) {
      galleryEmpty.querySelector('.gallery-empty-title').textContent = 'No matches';
      galleryEmpty.querySelector('.gallery-empty-desc').textContent = `Nothing found for "${searchQuery}"`;
    } else {
      galleryEmpty.querySelector('.gallery-empty-title').textContent = 'No artifacts yet';
      galleryEmpty.querySelector('.gallery-empty-desc').textContent = 'Visit any AI tool — ContextIQ captures code, images, and conversation highlights so you can bridge them anywhere.';
    }
    return;
  }

  galleryEmpty.classList.add('hidden');
  artifactListEl.innerHTML = filtered.map((artifact, idx) => renderArtifactCard(artifact, idx)).join('');
}

function renderArtifactCard(artifact, idx) {
  const toolKey = getToolKey(artifact.toolName);
  const icon = TOOL_ICONS[artifact.toolName] || TOOL_ICONS.ChatGPT;
  const ago = timeAgoShort(artifact.savedAt);
  const isSelected = selectedIndices.has(idx);

  let previewHtml = '';
  let badges = [];

  // Code blocks
  if (artifact.codeBlocks && artifact.codeBlocks.length > 0) {
    badges.push(`<span class="artifact-type code">${artifact.codeBlocks.length} code</span>`);
    const first = artifact.codeBlocks[0];
    const langLabel = first.language ? `<span class="artifact-code-lang">${esc(first.language)}</span>` : '';
    previewHtml += `
      <div class="artifact-code-preview">
        ${langLabel}
        <div class="artifact-code-text">${esc(first.code.slice(0, 300))}</div>
      </div>
    `;
  }

  // Images
  if (artifact.images && artifact.images.length > 0) {
    badges.push(`<span class="artifact-type image">${artifact.images.length} image${artifact.images.length !== 1 ? 's' : ''}</span>`);
    const thumbs = artifact.images.slice(0, 4).map(img => {
      if (img.url && !img.url.startsWith('data:')) {
        return `<img class="artifact-image-thumb" src="${esc(img.url)}" alt="${esc(img.alt || '')}" onerror="this.style.display='none'">`;
      }
      return `<div class="artifact-image-thumb-placeholder"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
    }).join('');
    previewHtml += `<div class="artifact-image-preview">${thumbs}</div>`;
  }

  // Conversation turns
  if (artifact.turns && artifact.turns.length > 0) {
    badges.push(`<span class="artifact-type conversation">${artifact.turns.length} turns</span>`);
    if (!artifact.codeBlocks?.length && !artifact.images?.length) {
      const turnHtml = artifact.turns.slice(0, 3).map(t => {
        return `<div class="artifact-turn"><span class="artifact-turn-role">${t.role === 'user' ? 'You' : artifact.toolName}:</span> ${esc(truncate(t.text, 80))}</div>`;
      }).join('');
      previewHtml += `<div class="artifact-conversation-preview">${turnHtml}</div>`;
    }
  }

  const badgesHtml = badges.length > 0
    ? `<div class="artifact-meta-row">${badges.join('')}</div>`
    : '';

  return `
    <div class="artifact-card ${isSelected ? 'selected' : ''}" data-idx="${idx}">
      <div class="artifact-card-header">
        <label class="artifact-select" data-idx="${idx}">
          <input type="checkbox" class="artifact-checkbox" ${isSelected ? 'checked' : ''}>
        </label>
        <div class="artifact-tool-icon ${toolKey}">${icon}</div>
        <div class="artifact-source">
          <span class="artifact-tool-name">${esc(artifact.toolName)}</span>
          <span class="artifact-topic">${esc(artifact.topic || artifact.title || 'Untitled')}</span>
        </div>
        <span class="artifact-time">${ago}</span>
      </div>
      ${badgesHtml}
      ${previewHtml}
      <div class="artifact-actions">
        <button class="artifact-bridge-btn" data-idx="${idx}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          Bridge to...
        </button>
        <button class="artifact-copy-btn" data-idx="${idx}">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
        <button class="artifact-delete-btn" data-idx="${idx}" title="Delete">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `;
}

// --- Bridge Action Sheet ---

function showBridgeSheet(artifacts) {
  const isMulti = Array.isArray(artifacts);
  bridgingArtifact = artifacts;

  if (isMulti) {
    bridgeSheetTitle.textContent = `Bridge ${artifacts.length} artifacts to...`;
  } else {
    bridgeSheetTitle.textContent = 'Bridge to...';
  }

  const sourceTool = isMulti ? null : artifacts.toolName;
  const targets = sourceTool
    ? AI_TOOLS.filter(t => t.name !== sourceTool)
    : AI_TOOLS;

  bridgeSheetTargets.innerHTML = targets.map(tool => `
    <div class="bridge-target" data-tool-key="${tool.key}" data-tool-name="${tool.name}" data-tool-url="${tool.url}">
      <div class="bridge-target-icon ${tool.key}">
        ${TOOL_ICONS[tool.name] || TOOL_ICONS.ChatGPT}
      </div>
      <div class="bridge-target-info">
        <div class="bridge-target-name">${tool.name}</div>
        <div class="bridge-target-desc">Open ${tool.name} with this artifact</div>
      </div>
      <div class="bridge-target-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
      </div>
    </div>
  `).join('');

  bridgeSheet.classList.remove('hidden');
}

function hideBridgeSheet() {
  bridgeSheet.classList.add('hidden');
  bridgingArtifact = null;
}

async function bridgeToTool(toolName, toolUrl) {
  if (!bridgingArtifact) return;

  const isMulti = Array.isArray(bridgingArtifact);
  const text = isMulti
    ? bridgingArtifact.map(a => buildBridgeText(a)).join('\n\n---\n\n')
    : buildBridgeText(bridgingArtifact);

  const sourceToolName = isMulti ? 'Multiple tools' : bridgingArtifact.toolName;
  const topic = isMulti
    ? `${bridgingArtifact.length} artifacts`
    : (bridgingArtifact.topic || bridgingArtifact.title);

  try {
    await chrome.runtime.sendMessage({
      type: 'SET_PENDING_BRIDGE',
      artifact: { text, toolName, sourceToolName, topic },
    });
  } catch {
    // Fall through to clipboard
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard may not be available
  }

  chrome.tabs.create({ url: toolUrl });

  showToast(`Bridging to ${toolName} — context copied`);
  hideBridgeSheet();
  exitSelectMode();
}

function buildBridgeText(artifact) {
  const lines = [];
  lines.push(`[Bridged from ${artifact.toolName} via ContextIQ]`);
  if (artifact.topic) {
    lines.push(`Topic: ${artifact.topic}`);
  }
  lines.push('');

  if (artifact.codeBlocks && artifact.codeBlocks.length > 0) {
    lines.push('Code from previous conversation:');
    lines.push('');
    for (const block of artifact.codeBlocks.slice(0, 5)) {
      const langLabel = block.language ? ` (${block.language})` : '';
      const sourceLabel = block.source ? ` [${block.source}]` : '';
      lines.push(`--- Code${langLabel}${sourceLabel} ---`);
      lines.push('```' + (block.language || ''));
      lines.push(block.code.slice(0, 2000));
      lines.push('```');
      lines.push('');
    }
  }

  if (artifact.images && artifact.images.length > 0) {
    lines.push('Images from previous conversation:');
    for (const img of artifact.images.slice(0, 5)) {
      const desc = img.alt ? `: "${img.alt}"` : '';
      lines.push(`  - Image${desc}`);
      if (img.url && !img.url.startsWith('data:')) {
        lines.push(`    ${img.url}`);
      }
    }
    lines.push('');
  }

  if (artifact.turns && artifact.turns.length > 0) {
    lines.push('Conversation highlights:');
    const recent = artifact.turns.slice(-6);
    for (const turn of recent) {
      const role = turn.role === 'user' ? 'You' : artifact.toolName;
      const text = turn.text.length > 300 ? turn.text.slice(0, 300) + '...' : turn.text;
      lines.push(`  ${role}: ${text}`);
    }
    lines.push('');
  }

  lines.push('Please continue from where I left off, using the context above.');
  return lines.join('\n');
}

// --- Selection Mode ---

function updateSelectionToolbar() {
  if (selectedIndices.size > 0) {
    selectionToolbar.classList.remove('hidden');
    selectionCount.textContent = `${selectedIndices.size} selected`;
    isSelectMode = true;
  } else {
    selectionToolbar.classList.add('hidden');
    isSelectMode = false;
  }
}

function exitSelectMode() {
  selectedIndices.clear();
  isSelectMode = false;
  selectionToolbar.classList.add('hidden');
  renderArtifacts();
}

async function deleteArtifacts(indices) {
  const filtered = getFilteredArtifacts();
  let deletedCount = 0;

  for (const idx of indices) {
    const artifact = filtered[idx];
    if (!artifact) continue;
    try {
      const resp = await chrome.runtime.sendMessage({
        type: 'DELETE_ARTIFACT',
        savedAt: artifact.savedAt,
        toolName: artifact.toolName,
      });
      if (resp?.success) deletedCount++;
    } catch {
      // Ignore individual failures
    }
  }

  if (deletedCount > 0) {
    showToast(`Deleted ${deletedCount} artifact${deletedCount !== 1 ? 's' : ''}`);
    await loadArtifacts();
    exitSelectMode();
  }
}

// --- Events ---

function bindEvents() {
  btnSettings.addEventListener('click', () => chrome.runtime.openOptionsPage());

  // Search
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      renderArtifacts();
    }, 200);
  });

  // Tool tab filtering
  toolTabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.tool-tab');
    if (!tab) return;
    activeFilter = tab.dataset.tool;
    renderToolTabs();
    renderArtifacts();
  });

  // Artifact actions (delegated)
  artifactListEl.addEventListener('click', (e) => {
    // Checkbox
    const checkbox = e.target.closest('.artifact-checkbox');
    if (checkbox) {
      const card = checkbox.closest('.artifact-card');
      const idx = parseInt(card.dataset.idx, 10);
      if (checkbox.checked) {
        selectedIndices.add(idx);
        card.classList.add('selected');
      } else {
        selectedIndices.delete(idx);
        card.classList.remove('selected');
      }
      updateSelectionToolbar();
      return;
    }

    // Bridge button
    const bridgeBtn = e.target.closest('.artifact-bridge-btn');
    if (bridgeBtn) {
      e.stopPropagation();
      const idx = parseInt(bridgeBtn.dataset.idx, 10);
      const filtered = getFilteredArtifacts();
      if (filtered[idx]) {
        showBridgeSheet(filtered[idx]);
      }
      return;
    }

    // Copy button
    const copyBtn = e.target.closest('.artifact-copy-btn');
    if (copyBtn) {
      e.stopPropagation();
      const idx = parseInt(copyBtn.dataset.idx, 10);
      const filtered = getFilteredArtifacts();
      if (filtered[idx]) {
        const text = buildBridgeText(filtered[idx]);
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied to clipboard');
        });
      }
      return;
    }

    // Delete button
    const deleteBtn = e.target.closest('.artifact-delete-btn');
    if (deleteBtn) {
      e.stopPropagation();
      const idx = parseInt(deleteBtn.dataset.idx, 10);
      deleteArtifacts([idx]);
      return;
    }
  });

  // Selection toolbar actions
  btnBridgeSelected.addEventListener('click', () => {
    const filtered = getFilteredArtifacts();
    const selected = [...selectedIndices].map(idx => filtered[idx]).filter(Boolean);
    if (selected.length > 0) {
      showBridgeSheet(selected);
    }
  });

  btnDeleteSelected.addEventListener('click', () => {
    deleteArtifacts([...selectedIndices]);
  });

  btnCancelSelection.addEventListener('click', exitSelectMode);

  // Bridge sheet
  bridgeSheetClose.addEventListener('click', hideBridgeSheet);

  bridgeSheetTargets.addEventListener('click', (e) => {
    const target = e.target.closest('.bridge-target');
    if (!target) return;
    bridgeToTool(target.dataset.toolName, target.dataset.toolUrl);
  });
}

// --- Helpers ---

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function getToolKey(toolName) {
  const map = {
    ChatGPT: 'chatgpt', Claude: 'claude', Gemini: 'gemini',
    Perplexity: 'perplexity', Copilot: 'copilot', DeepSeek: 'deepseek',
    Grok: 'grok', Mistral: 'mistral', Poe: 'poe',
    HuggingChat: 'huggingchat', Pi: 'pi', Cohere: 'cohere',
    'You.com': 'youcom', 'Meta AI': 'metaai', Phind: 'phind',
    'Notion AI': 'notion', Notion: 'notion',
  };
  return map[toolName] || toolName.toLowerCase().replace(/[^a-z]/g, '');
}

function timeAgoShort(ts) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// --- Start ---
init();
