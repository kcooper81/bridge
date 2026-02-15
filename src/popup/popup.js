// ContextIQ Popup — Cloud-first prompt manager + AI Bridge
// Auth required for prompts. Templates separate from user prompts.

import { truncate } from '../lib/utils.js';

// ═══════════════════════════════════════
//  SHARED STATE & DOM
// ═══════════════════════════════════════

const toast = document.getElementById('toast');
const btnSettings = document.getElementById('btn-settings');
const btnOpenVault = document.getElementById('btn-open-vault');
const bridgeBadge = document.getElementById('bridge-badge');
let activeTab = 'prompts';
let isAuthenticated = false;
let promptSubTab = 'mine'; // 'mine' | 'templates'

const DEFAULT_WEB_APP_URL = 'https://bridge-updated.vercel.app';

// ── Auth DOM ──
const authBarUser = document.getElementById('auth-bar-user');
const authBarEmail = document.getElementById('auth-bar-email');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const btnAuthShow = document.getElementById('btn-auth-show');
const btnAuthSubmit = document.getElementById('btn-auth-submit');
const btnAuthCancel = document.getElementById('btn-auth-cancel');
const btnAuthSignout = document.getElementById('btn-auth-signout');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');

// ── Auth Required DOM ──
const authRequired = document.getElementById('auth-required');
const promptSubTabs = document.getElementById('prompt-sub-tabs');

// ── My Prompts DOM ──
const promptMineView = document.getElementById('prompt-mine-view');
const promptSearchInput = document.getElementById('prompt-search');
const promptCategoryBar = document.getElementById('prompt-category-bar');
const promptEmpty = document.getElementById('prompt-empty');
const promptNoResults = document.getElementById('prompt-no-results');
const noResultsDesc = document.getElementById('no-results-desc');
const promptCardsEl = document.getElementById('prompt-cards');
const promptDetail = document.getElementById('prompt-detail');
const promptDetailTitle = document.getElementById('prompt-detail-title');
const promptDetailBody = document.getElementById('prompt-detail-body');
const btnNewPrompt = document.getElementById('btn-new-prompt');
const btnPromptBack = document.getElementById('btn-prompt-back');
const btnPromptDuplicate = document.getElementById('btn-prompt-duplicate');
const btnPromptDelete = document.getElementById('btn-prompt-delete');

// ── Template DOM ──
const templateView = document.getElementById('template-view');
const templateSearchInput = document.getElementById('template-search');
const templateCategoryBar = document.getElementById('template-category-bar');
const templateCardsEl = document.getElementById('template-cards');

// Open full dashboard — always open web app URL
btnOpenVault.addEventListener('click', async () => {
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    const webAppUrl = resp?.settings?.webAppUrl || DEFAULT_WEB_APP_URL;
    chrome.tabs.create({ url: webAppUrl });
  } catch {
    chrome.tabs.create({ url: DEFAULT_WEB_APP_URL });
  }
});

// ── Tab switching ──
const mainTabs = document.querySelectorAll('.main-tab');
const tabContents = document.querySelectorAll('.tab-content');

function switchTab(tab) {
  activeTab = tab;
  mainTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  tabContents.forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));
  if (tab === 'prompts') updatePromptsView();
  if (tab === 'bridge') loadBridgeTab();
}

// ═══════════════════════════════════════
//  PROMPTS — AUTH & VIEW STATE
// ═══════════════════════════════════════

function updatePromptsView() {
  if (!isAuthenticated) {
    // Show auth-required screen
    authRequired.classList.remove('hidden');
    promptSubTabs.classList.add('hidden');
    promptMineView.classList.add('hidden');
    templateView.classList.add('hidden');
    return;
  }

  // Authenticated — show sub-tabs and active view
  authRequired.classList.add('hidden');
  promptSubTabs.classList.remove('hidden');

  if (promptSubTab === 'mine') {
    promptMineView.classList.remove('hidden');
    templateView.classList.add('hidden');
    loadPrompts();
  } else {
    promptMineView.classList.add('hidden');
    templateView.classList.remove('hidden');
    renderTemplates();
  }
}

function switchPromptSubTab(subtab) {
  promptSubTab = subtab;
  document.querySelectorAll('.prompt-sub-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.subtab === subtab)
  );
  updatePromptsView();
}

// ═══════════════════════════════════════
//  MY PROMPTS
// ═══════════════════════════════════════

let allPrompts = [];
let allFolders = [];
let allDepartments = [];
let promptFilter = 'all';
let promptQuery = '';
let editingPromptId = null;

const FOLDER_ICONS = {
  megaphone: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  headphones: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
  code: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  users: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  'trending-up': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  folder: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
};

async function loadPrompts() {
  try {
    const [pResp, fResp, dResp] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'PROMPT_GET_ALL', query: promptQuery, filters: { sort: 'recent', folderId: promptFilter !== 'all' && promptFilter !== 'favorites' ? promptFilter : undefined, favoritesOnly: promptFilter === 'favorites' } }),
      chrome.runtime.sendMessage({ type: 'PROMPT_GET_FOLDERS' }),
      chrome.runtime.sendMessage({ type: 'PROMPT_GET_DEPARTMENTS' }),
    ]);
    allPrompts = pResp?.prompts || [];
    allFolders = fResp?.folders || [];
    allDepartments = dResp?.departments || [];
  } catch {
    allPrompts = [];
    allFolders = [];
    allDepartments = [];
  }

  renderCategoryTabs();
  renderPromptList();
}

function renderCategoryTabs() {
  let html = `<button class="prompt-cat-tab ${promptFilter === 'all' ? 'active' : ''}" data-folder="all">All</button>`;
  html += `<button class="prompt-cat-tab ${promptFilter === 'favorites' ? 'active' : ''}" data-folder="favorites"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Favs</button>`;

  for (const f of allFolders) {
    const icon = FOLDER_ICONS[f.icon] || FOLDER_ICONS.folder;
    const isActive = promptFilter === f.id;
    html += `<button class="prompt-cat-tab ${isActive ? 'active' : ''}" data-folder="${esc(f.id)}" style="${isActive ? `border-color: ${f.color}40; color: ${f.color};` : ''}">${icon} <span>${esc(f.name)}</span></button>`;
  }

  promptCategoryBar.innerHTML = html;
}

function renderPromptList() {
  const prompts = allPrompts;
  const toolbar = promptMineView.querySelector('.prompt-toolbar');
  const filterBar = promptMineView.querySelector('.prompt-filter-bar');

  if (prompts.length === 0) {
    promptCardsEl.innerHTML = '';
    if (promptQuery) {
      // Search with no results
      toolbar.classList.remove('hidden');
      filterBar.classList.remove('hidden');
      promptEmpty.classList.add('hidden');
      promptNoResults.classList.remove('hidden');
      noResultsDesc.textContent = `Nothing found for "${promptQuery}"`;
    } else {
      // Empty state — no prompts yet
      toolbar.classList.add('hidden');
      filterBar.classList.add('hidden');
      promptEmpty.classList.remove('hidden');
      promptNoResults.classList.add('hidden');
    }
    return;
  }

  // Has prompts — show normal UI
  toolbar.classList.remove('hidden');
  filterBar.classList.remove('hidden');
  promptEmpty.classList.add('hidden');
  promptNoResults.classList.add('hidden');
  promptCardsEl.innerHTML = prompts.map(p => renderPromptCard(p)).join('');
}

function renderPromptCard(prompt) {
  const folder = allFolders.find(f => f.id === prompt.folderId);
  const folderBadge = folder
    ? `<span class="prompt-card-folder" style="color:${folder.color};background:${folder.color}15">${FOLDER_ICONS[folder.icon] || ''} ${esc(folder.name)}</span>`
    : '';

  return `
    <div class="prompt-card" data-id="${esc(prompt.id)}">
      <div class="prompt-card-top">
        <div class="prompt-card-info">
          <div class="prompt-card-title">${esc(prompt.title || 'Untitled')}</div>
          <div class="prompt-card-desc">${esc(truncate(prompt.description || prompt.content, 90))}</div>
        </div>
        <button class="prompt-card-fav ${prompt.isFavorite ? 'active' : ''}" data-id="${esc(prompt.id)}" title="Favorite">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${prompt.isFavorite ? '#fbbf24' : 'none'}" stroke="${prompt.isFavorite ? '#fbbf24' : 'currentColor'}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
      </div>
      ${folderBadge ? `<div class="prompt-card-meta">${folderBadge}</div>` : ''}
      <div class="prompt-card-actions">
        <button class="prompt-card-insert" data-id="${esc(prompt.id)}" title="Paste this prompt into the active AI chat">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Insert
        </button>
      </div>
    </div>
  `;
}

// ── Prompt Detail / Editor ──

async function openPromptDetail(promptId) {
  editingPromptId = promptId;
  let prompt;

  if (promptId === 'new') {
    promptDetailTitle.textContent = 'New Prompt';
    prompt = {
      id: 'new', title: '', content: '', description: '', intendedOutcome: '',
      tone: 'professional', modelRecommendation: '', exampleInput: '', exampleOutput: '',
      tags: [], folderId: promptFilter !== 'all' && promptFilter !== 'favorites' ? promptFilter : null,
      departmentId: null, status: 'approved',
    };
    btnPromptDuplicate.classList.add('hidden');
    btnPromptDelete.classList.add('hidden');
  } else {
    promptDetailTitle.textContent = 'Edit Prompt';
    try {
      const resp = await chrome.runtime.sendMessage({ type: 'PROMPT_GET', promptId });
      prompt = resp?.prompt;
    } catch { prompt = null; }
    if (!prompt) { showToast('Prompt not found'); return; }
    btnPromptDuplicate.classList.remove('hidden');
    btnPromptDelete.classList.remove('hidden');
  }

  const folderOptions = allFolders.map(f => `<option value="${esc(f.id)}" ${prompt.folderId === f.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('');
  const deptOptions = allDepartments.map(d => `<option value="${esc(d.id)}" ${prompt.departmentId === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('');

  const tones = ['professional', 'casual', 'technical', 'persuasive', 'empathetic', 'engaging', 'creative', 'conversational', 'confident', 'clear'];
  const toneOptions = tones.map(t => `<option value="${t}" ${prompt.tone === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('');

  const hasAdvanced = prompt.intendedOutcome || prompt.modelRecommendation || prompt.exampleInput || prompt.exampleOutput || prompt.departmentId;

  promptDetailBody.innerHTML = `
    <form class="prompt-form" id="prompt-form">
      <div class="pf-group">
        <label class="pf-label">Title</label>
        <input class="pf-input" name="title" value="${esc(prompt.title)}" placeholder="e.g. Email Campaign Writer" required>
      </div>
      <div class="pf-group">
        <label class="pf-label">Prompt Content</label>
        <textarea class="pf-textarea" name="content" rows="6" placeholder="Write your prompt template here. Use [brackets] for variables...">${esc(prompt.content)}</textarea>
      </div>
      <div class="pf-group">
        <label class="pf-label">Description <span class="pf-hint">(helps you find it later)</span></label>
        <input class="pf-input" name="description" value="${esc(prompt.description)}" placeholder="Short summary of what this prompt does">
      </div>
      <div class="pf-row">
        <div class="pf-group pf-half">
          <label class="pf-label">Folder</label>
          <select class="pf-select" name="folderId">
            <option value="">None</option>
            ${folderOptions}
          </select>
        </div>
        <div class="pf-group pf-half">
          <label class="pf-label">Tone</label>
          <select class="pf-select" name="tone">${toneOptions}</select>
        </div>
      </div>
      <div class="pf-group">
        <label class="pf-label">Tags <span class="pf-hint">(comma separated)</span></label>
        <input class="pf-input" name="tags" value="${esc((prompt.tags || []).join(', '))}" placeholder="e.g. email, marketing, campaign">
      </div>

      <!-- Advanced Fields (collapsed by default) -->
      <button type="button" class="pf-advanced-toggle ${hasAdvanced ? 'open' : ''}" id="pf-advanced-toggle">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        More options
      </button>
      <div class="pf-advanced-fields ${hasAdvanced ? 'open' : ''}" id="pf-advanced-fields">
        <div class="pf-group">
          <label class="pf-label">Department</label>
          <select class="pf-select" name="departmentId">
            <option value="">None</option>
            ${deptOptions}
          </select>
        </div>
        <div class="pf-group">
          <label class="pf-label">Best Model</label>
          <input class="pf-input" name="modelRecommendation" value="${esc(prompt.modelRecommendation)}" placeholder="e.g. Claude, ChatGPT">
        </div>
        <div class="pf-group">
          <label class="pf-label">Intended Outcome</label>
          <input class="pf-input" name="intendedOutcome" value="${esc(prompt.intendedOutcome)}" placeholder="What should the AI produce?">
        </div>
        <div class="pf-group">
          <label class="pf-label">Example Input</label>
          <textarea class="pf-textarea pf-textarea-sm" name="exampleInput" rows="2" placeholder="Example of how to fill in the template...">${esc(prompt.exampleInput || '')}</textarea>
        </div>
        <div class="pf-group">
          <label class="pf-label">Example Output</label>
          <textarea class="pf-textarea pf-textarea-sm" name="exampleOutput" rows="2" placeholder="What the AI should produce...">${esc(prompt.exampleOutput || '')}</textarea>
        </div>
      </div>

      <div class="pf-actions">
        <button type="submit" class="pf-save-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ${promptId === 'new' ? 'Create Prompt' : 'Save Changes'}
        </button>
      </div>
    </form>
  `;

  promptDetail.classList.remove('hidden');

  // Advanced toggle
  document.getElementById('pf-advanced-toggle').addEventListener('click', () => {
    const toggle = document.getElementById('pf-advanced-toggle');
    const fields = document.getElementById('pf-advanced-fields');
    toggle.classList.toggle('open');
    fields.classList.toggle('open');
  });

  // Form submit handler
  document.getElementById('prompt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fields = {
      title: form.title.value.trim(),
      content: form.content.value.trim(),
      description: form.description.value.trim(),
      intendedOutcome: form.intendedOutcome.value.trim(),
      tone: form.tone.value,
      modelRecommendation: form.modelRecommendation.value.trim(),
      exampleInput: form.exampleInput.value.trim(),
      exampleOutput: form.exampleOutput.value.trim(),
      tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
      folderId: form.folderId.value || null,
      departmentId: form.departmentId.value || null,
    };

    if (!fields.title) { showToast('Title is required'); return; }
    if (!fields.content) { showToast('Prompt content is required'); return; }

    try {
      if (editingPromptId === 'new') {
        await chrome.runtime.sendMessage({ type: 'PROMPT_CREATE', fields });
        showToast('Prompt created');
      } else {
        await chrome.runtime.sendMessage({ type: 'PROMPT_UPDATE', promptId: editingPromptId, fields });
        showToast('Prompt saved');
      }
      closePromptDetail();
      await loadPrompts();
    } catch (err) {
      showToast('Error saving prompt');
    }
  });
}

function closePromptDetail() {
  promptDetail.classList.add('hidden');
  editingPromptId = null;
}

// ═══════════════════════════════════════
//  TEMPLATE LIBRARY
// ═══════════════════════════════════════

const TEMPLATE_FOLDERS = [
  { id: 'folder-marketing', name: 'Marketing', icon: 'megaphone', color: '#fb923c' },
  { id: 'folder-support', name: 'Support', icon: 'headphones', color: '#34d399' },
  { id: 'folder-dev', name: 'Development', icon: 'code', color: '#60a5fa' },
  { id: 'folder-hr', name: 'HR & People', icon: 'users', color: '#c084fc' },
  { id: 'folder-sales', name: 'Sales', icon: 'trending-up', color: '#fb7185' },
];

const TEMPLATES = [
  // Marketing
  { id: 'tpl-mkt-email', title: 'Email Campaign Writer', description: 'Generate complete email campaigns with subject lines, body copy, and CTAs.', folderId: 'folder-marketing', tone: 'persuasive', tags: ['email', 'campaign', 'marketing'], content: 'Write a compelling email campaign for [product/service] targeting [audience]. Include:\n\n1. Subject line (under 50 chars, high open-rate optimized)\n2. Preview text\n3. Email body with:\n   - Hook opening line\n   - Problem statement\n   - Solution (our product)\n   - Social proof / stats\n   - Clear CTA button text\n4. P.S. line\n\nTone: [professional/casual/urgent]\nGoal: [awareness/conversion/retention]' },
  { id: 'tpl-mkt-social', title: 'Social Media Content Creator', description: 'Create scroll-stopping social media posts for any platform.', folderId: 'folder-marketing', tone: 'engaging', tags: ['social', 'content', 'marketing'], content: 'Create a social media post for [platform] about [topic].\n\nBrand voice: [describe tone]\nTarget audience: [who]\nGoal: [engagement/traffic/awareness]\n\nInclude:\n- Hook (first line must stop the scroll)\n- Body (value-driven, 2-3 short paragraphs)\n- Call to action\n- 3-5 relevant hashtags\n- Emoji suggestions\n\nKeep it under [character limit] characters.' },
  { id: 'tpl-mkt-seo', title: 'SEO Blog Outline Generator', description: 'Generate SEO-optimized blog outlines that rank.', folderId: 'folder-marketing', tone: 'professional', tags: ['seo', 'blog', 'content'], content: 'Create an SEO-optimized blog post outline for the keyword: "[target keyword]"\n\nInclude:\n1. SEO title (under 60 chars, keyword-first)\n2. Meta description (under 155 chars)\n3. H1 heading\n4. 5-8 H2 sections with:\n   - H2 heading (include keyword variations)\n   - 2-3 bullet points of what to cover\n5. FAQ section (3-5 questions for featured snippets)\n6. Suggested word count\n7. Related keywords to include naturally' },
  { id: 'tpl-mkt-ad', title: 'Ad Copy Variations Generator', description: 'Create multiple ad copy angles for A/B testing.', folderId: 'folder-marketing', tone: 'persuasive', tags: ['ads', 'ppc', 'copywriting'], content: 'Generate 5 ad copy variations for [product/service].\n\nPlatform: [Google Ads/Facebook/LinkedIn/Twitter]\nTarget: [audience description]\nUSP: [unique selling proposition]\nCTA: [desired action]\n\nFor each variation provide:\n- Headline (under 30 chars for Google, under 40 for social)\n- Description (under 90 chars for Google, under 125 for social)\n\nMake each variation use a different angle:\n1. Pain point focused\n2. Benefit focused\n3. Social proof focused\n4. Urgency/scarcity\n5. Question-based' },
  // Support
  { id: 'tpl-sup-response', title: 'Customer Response Template', description: 'Generate empathetic, solution-focused customer responses.', folderId: 'folder-support', tone: 'empathetic', tags: ['support', 'customer', 'response'], content: 'Write a customer support response for this situation:\n\nIssue: [describe the problem]\nCustomer sentiment: [frustrated/confused/neutral/urgent]\n\nResponse should:\n1. Acknowledge the issue empathetically\n2. Explain what happened (if applicable)\n3. Provide a clear solution with steps\n4. Offer alternatives if the main solution doesn\'t work\n5. End with reassurance and next steps\n\nTone: Warm, professional, solution-focused\nMax length: 200 words' },
  { id: 'tpl-sup-escalation', title: 'Escalation Summary Writer', description: 'Create clear escalation summaries for handoffs.', folderId: 'folder-support', tone: 'professional', tags: ['escalation', 'support', 'internal'], content: 'Write an internal escalation summary for a support ticket.\n\nCustomer: [name/account]\nIssue: [describe]\nSeverity: [low/medium/high/critical]\nSteps already taken: [what was tried]\n\nFormat:\n- One-line summary\n- Background (2-3 sentences)\n- Timeline of events\n- Steps taken and results\n- Recommended next action\n- Urgency justification' },
  { id: 'tpl-sup-faq', title: 'FAQ Article Generator', description: 'Generate complete FAQ articles for your knowledge base.', folderId: 'folder-support', tone: 'clear', tags: ['faq', 'knowledge-base', 'documentation'], content: 'Create a comprehensive FAQ article for: [topic/feature]\n\nProduct: [product name]\nAudience: [technical level of users]\n\nGenerate 8-10 Q&A pairs covering:\n- What it is / does\n- How to get started\n- Common issues and fixes\n- Limitations / known issues\n- Related features\n\nFormat each answer:\n- Keep under 100 words\n- Use numbered steps for how-to answers\n- Bold key terms' },
  // Development
  { id: 'tpl-dev-review', title: 'Code Review Assistant', description: 'Thorough code review covering bugs, security, and best practices.', folderId: 'folder-dev', tone: 'technical', tags: ['code-review', 'development', 'security'], content: 'Review the following code and provide feedback:\n\n```[language]\n[paste code here]\n```\n\nPlease analyze for:\n1. **Bugs & Logic errors** — anything that would fail at runtime\n2. **Security** — injection, XSS, auth issues, OWASP top 10\n3. **Performance** — unnecessary loops, memory leaks, N+1 queries\n4. **Readability** — naming, structure, complexity\n5. **Best practices** — patterns, anti-patterns, framework conventions\n\nFor each issue found:\n- Severity: Critical / Warning / Suggestion\n- Line reference\n- Problem description\n- Suggested fix with code' },
  { id: 'tpl-dev-debug', title: 'Debugging Assistant', description: 'Systematic debugging with root cause analysis.', folderId: 'folder-dev', tone: 'technical', tags: ['debugging', 'development', 'troubleshooting'], content: 'Help me debug this issue:\n\n**Error message:**\n```\n[paste error]\n```\n\n**What I expected:** [expected behavior]\n**What happened:** [actual behavior]\n**Environment:** [OS, language version, framework]\n\nPlease:\n1. Explain what the error means in plain English\n2. Identify the most likely root cause\n3. Provide a step-by-step fix\n4. Explain why the fix works\n5. Suggest how to prevent this in the future' },
  { id: 'tpl-dev-tests', title: 'Test Case Generator', description: 'Generate thorough test suites including edge cases.', folderId: 'folder-dev', tone: 'technical', tags: ['testing', 'development', 'quality'], content: 'Generate comprehensive test cases for this function/feature:\n\n```[language]\n[paste code or describe feature]\n```\n\nGenerate tests covering:\n1. **Happy path** — normal expected usage (3-5 cases)\n2. **Edge cases** — boundary values, empty inputs, nulls\n3. **Error cases** — invalid inputs, network failures, auth errors\n4. **Integration** — how it works with other components\n\nFormat: Use [testing framework, e.g., Jest, pytest, Go testing]' },
  { id: 'tpl-dev-api', title: 'API Documentation Writer', description: 'Generate complete API endpoint documentation.', folderId: 'folder-dev', tone: 'technical', tags: ['api', 'documentation', 'development'], content: 'Generate API documentation for this endpoint:\n\nMethod: [GET/POST/PUT/DELETE]\nPath: [/api/v1/...]\nPurpose: [what it does]\n\nGenerate:\n1. **Description** — 1-2 sentence overview\n2. **Authentication** — required auth method\n3. **Request** — Headers, parameters, body schema\n4. **Response** — Success + error examples\n5. **Code examples** — cURL, JavaScript (fetch), Python (requests)' },
  // HR
  { id: 'tpl-hr-job', title: 'Job Posting Creator', description: 'Create inclusive, compelling job postings.', folderId: 'folder-hr', tone: 'professional', tags: ['hiring', 'job-posting', 'hr'], content: 'Write a job posting for: [role title]\n\nCompany: [company name]\nLocation: [remote/hybrid/office + city]\nLevel: [junior/mid/senior/lead]\n\nInclude:\n1. Compelling headline\n2. About us (2-3 sentences)\n3. The role (day-to-day)\n4. Requirements (must-haves, 5-7 items)\n5. Nice-to-haves (3-4 items)\n6. What we offer\n7. How to apply\n\nUse inclusive language. Keep under 500 words.' },
  { id: 'tpl-hr-interview', title: 'Interview Questions Generator', description: 'Structured interview questions by category.', folderId: 'folder-hr', tone: 'professional', tags: ['interview', 'hiring', 'assessment'], content: 'Generate interview questions for a [role title] candidate.\n\nLevel: [junior/mid/senior]\n\nGenerate 15 questions:\n- Technical (5) — foundational to advanced\n- Behavioral (5) — STAR format\n- Cultural fit (3) — company values: [list]\n- Role-specific scenario (2)\n\nFor each: include what a good answer looks like.' },
  { id: 'tpl-hr-review', title: 'Performance Review Drafter', description: 'Draft thoughtful performance reviews with specific feedback.', folderId: 'folder-hr', tone: 'professional', tags: ['performance', 'review', 'feedback'], content: 'Help me draft a performance review for [employee name/role].\n\nReview period: [period]\nOverall rating: [exceeds/meets/below expectations]\n\nKey accomplishments:\n- [list 3-5 achievements]\n\nAreas for growth:\n- [list 2-3 areas]\n\nPlease draft:\n1. Summary (2-3 sentences)\n2. Strengths with examples\n3. Development areas (constructive)\n4. Goals for next period (SMART format)\n5. Overall assessment' },
  // Sales
  { id: 'tpl-sales-cold', title: 'Cold Outreach Email', description: 'Short, personalized cold emails that get responses.', folderId: 'folder-sales', tone: 'conversational', tags: ['cold-email', 'outreach', 'sales'], content: 'Write a cold outreach email to [prospect title] at [company type].\n\nOur product: [what we sell]\nTheir likely pain: [problem they face]\n\nRules:\n- Under 100 words\n- Personalized first line\n- Lead with their problem, not our product\n- One clear CTA\n- Subject line under 40 characters\n\nGenerate 3 variations:\n1. Problem-focused\n2. Curiosity-driven\n3. Social proof led' },
  { id: 'tpl-sales-objection', title: 'Objection Handling Playbook', description: 'Handle sales objections with a proven framework.', folderId: 'folder-sales', tone: 'confident', tags: ['objection', 'sales', 'negotiation'], content: 'Create objection handling responses for selling [product/service].\n\nCommon objection: "[the objection]"\n\nProvide a response using this framework:\n1. Acknowledge — validate concern\n2. Reframe — shift perspective\n3. Evidence — data or customer story\n4. Bridge — connect to their goals\n5. Advance — next step\n\nAlso generate:\n- 3 probing questions\n- 1 email follow-up\n- When to walk away' },
  { id: 'tpl-sales-discovery', title: 'Discovery Call Script', description: 'Structured discovery call framework that qualifies prospects.', folderId: 'folder-sales', tone: 'professional', tags: ['discovery', 'sales', 'qualification'], content: 'Create a discovery call script for selling [product/service] to [target buyer].\n\nCall duration: [15/30 min]\nGoal: [qualify/demo booking/needs assessment]\n\nStructure:\n1. Opening (30 sec) — rapport + agenda\n2. Situation questions (3)\n3. Problem questions (3)\n4. Impact questions (2)\n5. Vision questions (2)\n6. Solution bridge (60 sec pitch)\n7. Next steps — clear CTA' },
];

let templateFilter = 'all';
let templateQuery = '';

function getFilteredTemplates() {
  let templates = TEMPLATES;
  if (templateFilter !== 'all') {
    templates = templates.filter(t => t.folderId === templateFilter);
  }
  if (templateQuery) {
    const q = templateQuery.toLowerCase();
    templates = templates.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }
  return templates;
}

function renderTemplateCategoryTabs() {
  let html = `<button class="prompt-cat-tab ${templateFilter === 'all' ? 'active' : ''}" data-tfolder="all">All</button>`;
  for (const f of TEMPLATE_FOLDERS) {
    const icon = FOLDER_ICONS[f.icon] || FOLDER_ICONS.folder;
    const isActive = templateFilter === f.id;
    html += `<button class="prompt-cat-tab ${isActive ? 'active' : ''}" data-tfolder="${esc(f.id)}" style="${isActive ? `border-color: ${f.color}40; color: ${f.color};` : ''}">${icon} <span>${esc(f.name)}</span></button>`;
  }
  templateCategoryBar.innerHTML = html;
}

function renderTemplates() {
  renderTemplateCategoryTabs();
  const templates = getFilteredTemplates();
  if (templates.length === 0) {
    templateCardsEl.innerHTML = `
      <div class="prompt-no-results">
        <div class="no-results-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div class="no-results-title">No matching templates</div>
        <div class="no-results-desc">Try a different search or category</div>
      </div>
    `;
    return;
  }

  templateCardsEl.innerHTML = templates.map(t => renderTemplateCard(t)).join('');
}

function renderTemplateCard(template) {
  const folder = TEMPLATE_FOLDERS.find(f => f.id === template.folderId);
  const folderBadge = folder
    ? `<span class="template-card-folder" style="color:${folder.color};background:${folder.color}15">${FOLDER_ICONS[folder.icon] || ''} ${esc(folder.name)}</span>`
    : '';

  return `
    <div class="template-card" data-tpl-id="${esc(template.id)}">
      <div class="template-card-top">
        <div class="template-card-info">
          <div class="template-card-title">${esc(template.title)}</div>
          <div class="template-card-desc">${esc(template.description)}</div>
        </div>
      </div>
      ${folderBadge ? `<div class="template-card-meta">${folderBadge}</div>` : ''}
      <div class="template-card-actions">
        <button class="template-add-btn" data-tpl-id="${esc(template.id)}" title="Add this template to your prompt library">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Add to My Prompts
        </button>
        <button class="template-preview-btn" data-tpl-id="${esc(template.id)}" title="Preview template">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
      </div>
    </div>
  `;
}

async function addTemplateToPrompts(templateId) {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) return;

  const fields = {
    title: template.title,
    content: template.content,
    description: template.description,
    tone: template.tone || 'professional',
    tags: template.tags || [],
  };

  try {
    const resp = await chrome.runtime.sendMessage({ type: 'PROMPT_ADD_TEMPLATE', fields });
    if (resp?.success) {
      showToast(`"${template.title}" added to your prompts`);
      // Disable the button to show it's been added
      const btn = document.querySelector(`.template-add-btn[data-tpl-id="${templateId}"]`);
      if (btn) {
        btn.textContent = 'Added';
        btn.disabled = true;
      }
    } else {
      showToast(resp?.error || 'Error adding template');
    }
  } catch {
    showToast('Error adding template');
  }
}

function previewTemplate(templateId) {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) return;

  // Reuse the prompt detail panel for preview (read-only)
  editingPromptId = null;
  promptDetailTitle.textContent = 'Template Preview';
  btnPromptDuplicate.classList.add('hidden');
  btnPromptDelete.classList.add('hidden');

  promptDetailBody.innerHTML = `
    <div class="template-preview-content">
      <div class="pf-group">
        <label class="pf-label">Title</label>
        <div class="pf-readonly">${esc(template.title)}</div>
      </div>
      <div class="pf-group">
        <label class="pf-label">Description</label>
        <div class="pf-readonly">${esc(template.description)}</div>
      </div>
      <div class="pf-group">
        <label class="pf-label">Prompt Content</label>
        <div class="pf-readonly pf-readonly-code">${esc(template.content)}</div>
      </div>
      ${template.tags?.length ? `<div class="pf-group"><label class="pf-label">Tags</label><div class="pf-readonly">${template.tags.map(t => esc(t)).join(', ')}</div></div>` : ''}
      <div class="pf-actions">
        <button type="button" class="pf-save-btn" id="tpl-preview-add" data-tpl-id="${esc(template.id)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Add to My Prompts
        </button>
      </div>
    </div>
  `;

  promptDetail.classList.remove('hidden');

  document.getElementById('tpl-preview-add').addEventListener('click', async (e) => {
    const tplId = e.target.closest('[data-tpl-id]').dataset.tplId;
    await addTemplateToPrompts(tplId);
    closePromptDetail();
  });
}

// ═══════════════════════════════════════
//  BRIDGE TAB (AI Bridge)
// ═══════════════════════════════════════

const toolTabsEl = document.getElementById('tool-tabs');
const galleryEmpty = document.getElementById('gallery-empty');
const artifactListEl = document.getElementById('artifact-list');
const bridgeSheet = document.getElementById('bridge-sheet');
const bridgeSheetTitle = document.getElementById('bridge-sheet-title');
const bridgeSheetTargets = document.getElementById('bridge-sheet-targets');
const bridgeSheetClose = document.getElementById('bridge-sheet-close');
const searchInput = document.getElementById('search-input');
const activeTabBar = document.getElementById('active-tab-bar');
const activeTabIndicator = document.getElementById('active-tab-indicator');
const activeTabText = document.getElementById('active-tab-text');
const selectionToolbar = document.getElementById('selection-toolbar');
const selectionCount = document.getElementById('selection-count');
const btnBridgeSelected = document.getElementById('btn-bridge-selected');
const btnDeleteSelected = document.getElementById('btn-delete-selected');
const btnCancelSelection = document.getElementById('btn-cancel-selection');

let allArtifacts = [];
let bridgeFilter = 'all';
let bridgeSearchQuery = '';
let bridgingArtifact = null;
let selectedIndices = new Set();

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
};

async function loadBridgeTab() {
  await Promise.all([loadArtifacts(), loadActiveTabStatus()]);
}

async function loadActiveTabStatus() {
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_TOOL' });
    if (resp?.tool) {
      activeTabText.textContent = `Connected to ${resp.tool.toolName}`;
      activeTabIndicator.classList.add('active');
      activeTabBar.classList.add('detected');
      bridgeBadge.classList.remove('hidden');
    } else {
      activeTabText.textContent = 'Open an AI tool to start capturing';
      activeTabIndicator.classList.remove('active');
      activeTabBar.classList.remove('detected');
      bridgeBadge.classList.add('hidden');
    }
  } catch {
    activeTabText.textContent = 'Open an AI tool to start capturing';
    bridgeBadge.classList.add('hidden');
  }
}

async function loadArtifacts() {
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'GET_ARTIFACT_GALLERY' });
    allArtifacts = resp?.artifacts || [];
  } catch { allArtifacts = []; }
  renderToolTabs();
  renderArtifacts();
}

function getFilteredArtifacts() {
  let filtered = bridgeFilter === 'all'
    ? allArtifacts
    : allArtifacts.filter(a => a.toolName === bridgeFilter);

  if (bridgeSearchQuery) {
    const q = bridgeSearchQuery.toLowerCase();
    filtered = filtered.filter(a => {
      return (a.topic || '').toLowerCase().includes(q) ||
        (a.title || '').toLowerCase().includes(q) ||
        (a.toolName || '').toLowerCase().includes(q) ||
        (a.codeBlocks || []).some(b => (b.code || '').toLowerCase().includes(q)) ||
        (a.turns || []).some(t => (t.text || '').toLowerCase().includes(q));
    });
  }
  return filtered;
}

function renderToolTabs() {
  const toolCounts = {};
  for (const a of allArtifacts) toolCounts[a.toolName] = (toolCounts[a.toolName] || 0) + 1;

  let html = `<button class="tool-tab ${bridgeFilter === 'all' ? 'active' : ''}" data-tool="all">All <span class="tool-tab-count">${allArtifacts.length}</span></button>`;
  for (const [tool, count] of Object.entries(toolCounts)) {
    const icon = TOOL_ICONS[tool] || TOOL_ICONS.ChatGPT;
    html += `<button class="tool-tab ${bridgeFilter === tool ? 'active' : ''}" data-tool="${esc(tool)}">${icon} ${esc(tool)} <span class="tool-tab-count">${count}</span></button>`;
  }
  toolTabsEl.innerHTML = html;
}

function renderArtifacts() {
  const filtered = getFilteredArtifacts();
  if (filtered.length === 0) {
    galleryEmpty.classList.remove('hidden');
    artifactListEl.innerHTML = '';
    if (bridgeSearchQuery) {
      galleryEmpty.querySelector('.gallery-empty-title').textContent = 'No matches';
      galleryEmpty.querySelector('.gallery-empty-desc').textContent = `Nothing found for "${bridgeSearchQuery}"`;
      const steps = galleryEmpty.querySelector('.gallery-empty-steps');
      if (steps) steps.classList.add('hidden');
    } else {
      galleryEmpty.querySelector('.gallery-empty-title').textContent = 'Continue conversations across AI tools';
      galleryEmpty.querySelector('.gallery-empty-desc').textContent = 'ContextIQ auto-captures your chats so you can pick up where you left off in a different AI.';
      const steps = galleryEmpty.querySelector('.gallery-empty-steps');
      if (steps) steps.classList.remove('hidden');
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

  if (artifact.codeBlocks?.length > 0) {
    badges.push(`<span class="artifact-type code">${artifact.codeBlocks.length} code</span>`);
    const first = artifact.codeBlocks[0];
    const langLabel = first.language ? `<span class="artifact-code-lang">${esc(first.language)}</span>` : '';
    previewHtml += `<div class="artifact-code-preview">${langLabel}<div class="artifact-code-text">${esc(first.code.slice(0, 300))}</div></div>`;
  }

  if (artifact.images?.length > 0) {
    badges.push(`<span class="artifact-type image">${artifact.images.length} image${artifact.images.length !== 1 ? 's' : ''}</span>`);
    const thumbs = artifact.images.slice(0, 4).map(img => {
      if (img.url && !img.url.startsWith('data:')) {
        return `<img class="artifact-image-thumb" src="${esc(img.url)}" alt="${esc(img.alt || '')}" onerror="this.style.display='none'">`;
      }
      return `<div class="artifact-image-thumb-placeholder"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
    }).join('');
    previewHtml += `<div class="artifact-image-preview">${thumbs}</div>`;
  }

  if (artifact.turns?.length > 0) {
    badges.push(`<span class="artifact-type conversation">${artifact.turns.length} turns</span>`);
    if (!artifact.codeBlocks?.length && !artifact.images?.length) {
      const turnHtml = artifact.turns.slice(0, 3).map(t =>
        `<div class="artifact-turn"><span class="artifact-turn-role">${t.role === 'user' ? 'You' : artifact.toolName}:</span> ${esc(truncate(t.text, 80))}</div>`
      ).join('');
      previewHtml += `<div class="artifact-conversation-preview">${turnHtml}</div>`;
    }
  }

  const badgesHtml = badges.length > 0 ? `<div class="artifact-meta-row">${badges.join('')}</div>` : '';

  return `
    <div class="artifact-card ${isSelected ? 'selected' : ''}" data-idx="${idx}">
      <div class="artifact-card-header">
        <label class="artifact-select" data-idx="${idx}"><input type="checkbox" class="artifact-checkbox" ${isSelected ? 'checked' : ''}></label>
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
        <button class="artifact-bridge-btn" data-idx="${idx}" title="Continue this conversation in another AI tool">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          Send to AI
        </button>
        <button class="artifact-copy-btn" data-idx="${idx}" title="Copy to clipboard">
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

// ── Bridge Sheet ──

function showBridgeSheet(artifacts) {
  bridgingArtifact = artifacts;
  const isMulti = Array.isArray(artifacts);
  bridgeSheetTitle.textContent = isMulti ? `Continue ${artifacts.length} conversations in...` : 'Continue in...';
  const sourceTool = isMulti ? null : artifacts.toolName;
  const targets = sourceTool ? AI_TOOLS.filter(t => t.name !== sourceTool) : AI_TOOLS;

  bridgeSheetTargets.innerHTML = targets.map(tool => `
    <div class="bridge-target" data-tool-key="${tool.key}" data-tool-name="${tool.name}" data-tool-url="${tool.url}">
      <div class="bridge-target-icon ${tool.key}">${TOOL_ICONS[tool.name] || TOOL_ICONS.ChatGPT}</div>
      <div class="bridge-target-info">
        <div class="bridge-target-name">${tool.name}</div>
        <div class="bridge-target-desc">Opens ${tool.name} with your context</div>
      </div>
      <div class="bridge-target-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></div>
    </div>
  `).join('');
  bridgeSheet.classList.remove('hidden');
}

function hideBridgeSheet() { bridgeSheet.classList.add('hidden'); bridgingArtifact = null; }

async function bridgeToTool(toolName, toolUrl) {
  if (!bridgingArtifact) return;
  const isMulti = Array.isArray(bridgingArtifact);
  const text = isMulti
    ? bridgingArtifact.map(a => buildBridgeText(a)).join('\n\n---\n\n')
    : buildBridgeText(bridgingArtifact);

  try { await chrome.runtime.sendMessage({ type: 'SET_PENDING_BRIDGE', artifact: { text, toolName, sourceToolName: isMulti ? 'Multiple' : bridgingArtifact.toolName, topic: isMulti ? `${bridgingArtifact.length} artifacts` : bridgingArtifact.topic } }); } catch {}
  try { await navigator.clipboard.writeText(text); } catch {}
  chrome.tabs.create({ url: toolUrl });
  showToast(`Opening ${toolName} — context copied to clipboard`);
  hideBridgeSheet();
  exitSelectMode();
}

function buildBridgeText(artifact) {
  const lines = [`[Bridged from ${artifact.toolName} via ContextIQ]`];
  if (artifact.topic) lines.push(`Topic: ${artifact.topic}`);
  lines.push('');
  if (artifact.codeBlocks?.length > 0) {
    lines.push('Code from previous conversation:', '');
    for (const block of artifact.codeBlocks.slice(0, 5)) {
      lines.push('```' + (block.language || ''), block.code.slice(0, 2000), '```', '');
    }
  }
  if (artifact.images?.length > 0) {
    lines.push('Images:');
    for (const img of artifact.images.slice(0, 5)) lines.push(`  - Image${img.alt ? `: "${img.alt}"` : ''}${img.url && !img.url.startsWith('data:') ? `\n    ${img.url}` : ''}`);
    lines.push('');
  }
  if (artifact.turns?.length > 0) {
    lines.push('Conversation:');
    for (const turn of artifact.turns.slice(-6)) {
      const role = turn.role === 'user' ? 'You' : artifact.toolName;
      lines.push(`  ${role}: ${turn.text.length > 300 ? turn.text.slice(0, 300) + '...' : turn.text}`);
    }
    lines.push('');
  }
  lines.push('Please continue from where I left off.');
  return lines.join('\n');
}

// ── Selection Mode ──

function updateSelectionToolbar() {
  if (selectedIndices.size > 0) {
    selectionToolbar.classList.remove('hidden');
    selectionCount.textContent = `${selectedIndices.size} selected`;
  } else {
    selectionToolbar.classList.add('hidden');
  }
}

function exitSelectMode() {
  selectedIndices.clear();
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
      const resp = await chrome.runtime.sendMessage({ type: 'DELETE_ARTIFACT', savedAt: artifact.savedAt, toolName: artifact.toolName });
      if (resp?.success) deletedCount++;
    } catch {}
  }
  if (deletedCount > 0) {
    showToast(`Deleted ${deletedCount} item${deletedCount !== 1 ? 's' : ''}`);
    await loadArtifacts();
    exitSelectMode();
  }
}

// ═══════════════════════════════════════
//  EVENT BINDING
// ═══════════════════════════════════════

function bindEvents() {
  btnSettings.addEventListener('click', () => chrome.runtime.openOptionsPage());

  // ── Auth Events ──
  btnAuthShow.addEventListener('click', () => {
    authForm.classList.remove('hidden');
    authEmailInput.focus();
  });

  btnAuthCancel.addEventListener('click', () => {
    authForm.classList.add('hidden');
    authError.classList.add('hidden');
  });

  btnAuthSubmit.addEventListener('click', handleSignIn);
  authPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSignIn();
  });

  // OAuth hint — open web app for Google/GitHub sign-in
  const oauthLink = document.getElementById('auth-oauth-link');
  if (oauthLink) {
    oauthLink.addEventListener('click', async (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: DEFAULT_WEB_APP_URL });
    });
  }

  btnAuthSignout.addEventListener('click', async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'AUTH_SIGN_OUT' });
      isAuthenticated = false;
      updateAuthUI();
      updatePromptsView();
      showToast('Signed out');
    } catch { showToast('Error signing out'); }
  });

  // Auth required screen sign-in button
  document.getElementById('btn-auth-required-signin').addEventListener('click', () => {
    btnAuthShow.click();
  });

  // Auth required signup link
  const signupLink = document.getElementById('auth-req-signup-link');
  if (signupLink) {
    signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: DEFAULT_WEB_APP_URL });
    });
  }

  // Main tab switching
  document.querySelector('.main-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.main-tab');
    if (tab) switchTab(tab.dataset.tab);
  });

  // ── Prompt Sub-tab switching ──
  document.getElementById('prompt-sub-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.prompt-sub-tab');
    if (tab) switchPromptSubTab(tab.dataset.subtab);
  });

  // ── My Prompts Tab Events ──

  let promptSearchTimer;
  promptSearchInput.addEventListener('input', () => {
    clearTimeout(promptSearchTimer);
    promptSearchTimer = setTimeout(() => {
      promptQuery = promptSearchInput.value.trim();
      loadPrompts();
    }, 200);
  });

  promptCategoryBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.prompt-cat-tab');
    if (!tab) return;
    promptFilter = tab.dataset.folder;
    loadPrompts();
  });

  btnNewPrompt.addEventListener('click', () => openPromptDetail('new'));

  // Empty state buttons
  const btnEmptyTemplates = document.getElementById('btn-empty-templates');
  if (btnEmptyTemplates) {
    btnEmptyTemplates.addEventListener('click', () => switchPromptSubTab('templates'));
  }
  const btnEmptyCreate = document.getElementById('btn-empty-create');
  if (btnEmptyCreate) {
    btnEmptyCreate.addEventListener('click', () => openPromptDetail('new'));
  }

  btnPromptBack.addEventListener('click', closePromptDetail);

  btnPromptDuplicate.addEventListener('click', async () => {
    if (!editingPromptId || editingPromptId === 'new') return;
    try {
      await chrome.runtime.sendMessage({ type: 'PROMPT_DUPLICATE', promptId: editingPromptId });
      showToast('Prompt duplicated');
      closePromptDetail();
      await loadPrompts();
    } catch { showToast('Error duplicating'); }
  });

  btnPromptDelete.addEventListener('click', async () => {
    if (!editingPromptId || editingPromptId === 'new') return;
    try {
      await chrome.runtime.sendMessage({ type: 'PROMPT_DELETE', promptId: editingPromptId });
      showToast('Prompt deleted');
      closePromptDetail();
      await loadPrompts();
    } catch { showToast('Error deleting'); }
  });

  // Prompt card actions (delegated)
  document.getElementById('prompt-cards').addEventListener('click', async (e) => {
    const insertBtn = e.target.closest('.prompt-card-insert');
    if (insertBtn) {
      e.stopPropagation();
      const id = insertBtn.dataset.id;
      try {
        const resp = await chrome.runtime.sendMessage({ type: 'PROMPT_INSERT', promptId: id });
        if (resp?.success) {
          try { await navigator.clipboard.writeText(resp.text); } catch {}
          showToast('Prompt inserted & copied');
          await loadPrompts();
        } else {
          // Fallback: copy to clipboard
          const pResp = await chrome.runtime.sendMessage({ type: 'PROMPT_GET', promptId: id });
          if (pResp?.prompt) {
            await navigator.clipboard.writeText(pResp.prompt.content);
            await chrome.runtime.sendMessage({ type: 'PROMPT_USE', promptId: id });
            showToast('Prompt copied to clipboard');
            await loadPrompts();
          }
        }
      } catch { showToast('Error inserting prompt'); }
      return;
    }

    const favBtn = e.target.closest('.prompt-card-fav');
    if (favBtn) {
      e.stopPropagation();
      try {
        await chrome.runtime.sendMessage({ type: 'PROMPT_TOGGLE_FAVORITE', promptId: favBtn.dataset.id });
        await loadPrompts();
      } catch {}
      return;
    }

    // Card click → open detail
    const card = e.target.closest('.prompt-card');
    if (card) openPromptDetail(card.dataset.id);
  });

  // ── Template Tab Events ──

  let templateSearchTimer;
  templateSearchInput.addEventListener('input', () => {
    clearTimeout(templateSearchTimer);
    templateSearchTimer = setTimeout(() => {
      templateQuery = templateSearchInput.value.trim();
      renderTemplates();
    }, 200);
  });

  templateCategoryBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.prompt-cat-tab');
    if (!tab) return;
    templateFilter = tab.dataset.tfolder;
    renderTemplates();
  });

  templateCardsEl.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('.template-add-btn');
    if (addBtn) {
      e.stopPropagation();
      await addTemplateToPrompts(addBtn.dataset.tplId);
      return;
    }

    const previewBtn = e.target.closest('.template-preview-btn');
    if (previewBtn) {
      e.stopPropagation();
      previewTemplate(previewBtn.dataset.tplId);
      return;
    }
  });

  // ── Bridge Tab Events ──

  let bridgeSearchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(bridgeSearchTimer);
    bridgeSearchTimer = setTimeout(() => {
      bridgeSearchQuery = searchInput.value.trim();
      renderArtifacts();
    }, 200);
  });

  toolTabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.tool-tab');
    if (!tab) return;
    bridgeFilter = tab.dataset.tool;
    renderToolTabs();
    renderArtifacts();
  });

  artifactListEl.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.artifact-checkbox');
    if (checkbox) {
      const card = checkbox.closest('.artifact-card');
      const idx = parseInt(card.dataset.idx, 10);
      if (checkbox.checked) { selectedIndices.add(idx); card.classList.add('selected'); }
      else { selectedIndices.delete(idx); card.classList.remove('selected'); }
      updateSelectionToolbar();
      return;
    }
    const bridgeBtn = e.target.closest('.artifact-bridge-btn');
    if (bridgeBtn) {
      e.stopPropagation();
      const filtered = getFilteredArtifacts();
      const idx = parseInt(bridgeBtn.dataset.idx, 10);
      if (filtered[idx]) showBridgeSheet(filtered[idx]);
      return;
    }
    const copyBtn = e.target.closest('.artifact-copy-btn');
    if (copyBtn) {
      e.stopPropagation();
      const filtered = getFilteredArtifacts();
      const idx = parseInt(copyBtn.dataset.idx, 10);
      if (filtered[idx]) navigator.clipboard.writeText(buildBridgeText(filtered[idx])).then(() => showToast('Copied'));
      return;
    }
    const deleteBtn = e.target.closest('.artifact-delete-btn');
    if (deleteBtn) {
      e.stopPropagation();
      deleteArtifacts([parseInt(deleteBtn.dataset.idx, 10)]);
      return;
    }
  });

  btnBridgeSelected.addEventListener('click', () => {
    const filtered = getFilteredArtifacts();
    const selected = [...selectedIndices].map(idx => filtered[idx]).filter(Boolean);
    if (selected.length > 0) showBridgeSheet(selected);
  });
  btnDeleteSelected.addEventListener('click', () => deleteArtifacts([...selectedIndices]));
  btnCancelSelection.addEventListener('click', exitSelectMode);

  bridgeSheetClose.addEventListener('click', hideBridgeSheet);
  bridgeSheetTargets.addEventListener('click', (e) => {
    const target = e.target.closest('.bridge-target');
    if (target) bridgeToTool(target.dataset.toolName, target.dataset.toolUrl);
  });
}

// ═══════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════

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
  const map = { ChatGPT: 'chatgpt', Claude: 'claude', Gemini: 'gemini', Perplexity: 'perplexity', Copilot: 'copilot', DeepSeek: 'deepseek', Grok: 'grok', Mistral: 'mistral', Poe: 'poe', HuggingChat: 'huggingchat', Pi: 'pi', Cohere: 'cohere', 'You.com': 'youcom', 'Meta AI': 'metaai', Phind: 'phind', 'Notion AI': 'notion' };
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

// ═══════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════

function updateAuthUI() {
  if (isAuthenticated) {
    btnAuthShow.classList.add('hidden');
    authForm.classList.add('hidden');
    authBarUser.classList.remove('hidden');
  } else {
    authBarUser.classList.add('hidden');
    authForm.classList.add('hidden');
    btnAuthShow.classList.remove('hidden');
  }
}

async function checkAuthStatus() {
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'AUTH_STATUS' });
    isAuthenticated = resp?.authenticated || false;
    if (resp?.user?.email) authBarEmail.textContent = resp.user.email;
    updateAuthUI();
  } catch {
    isAuthenticated = false;
    updateAuthUI();
  }
}

async function handleSignIn() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;
  if (!email || !password) { showAuthError('Enter email and password'); return; }

  btnAuthSubmit.disabled = true;
  btnAuthSubmit.textContent = 'Signing in...';
  authError.classList.add('hidden');

  try {
    const resp = await chrome.runtime.sendMessage({ type: 'AUTH_SIGN_IN', email, password });
    if (resp?.success) {
      isAuthenticated = true;
      authBarEmail.textContent = email;
      authPasswordInput.value = '';
      updateAuthUI();
      updatePromptsView();
      showToast('Signed in — prompts synced from cloud');
    } else {
      showAuthError(resp?.error || 'Sign in failed');
    }
  } catch (err) {
    showAuthError(err.message || 'Connection error');
  }

  btnAuthSubmit.disabled = false;
  btnAuthSubmit.textContent = 'Sign in';
}

function showAuthError(msg) {
  authError.textContent = msg;
  authError.classList.remove('hidden');
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════

async function init() {
  bindEvents();
  await checkAuthStatus();
  updatePromptsView();
  loadActiveTabStatus();
}

init();
