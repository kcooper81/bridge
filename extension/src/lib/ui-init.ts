// TeamPrompt Extension — Shared UI Init
// Used by both popup and sidepanel entrypoints

import { getSession, login, logout, openLogin, openSignup, openGoogleAuth, openGithubAuth } from "./auth";
import { extAuthDebug } from "./auth-debug"; // AUTH-DEBUG
import { fetchPrompts, fetchFolders, fillTemplate, normalizeVariables, getDisplayLabel, toggleFavorite, type Prompt, type ExtFolder } from "./prompts";
import { fetchSecurityStatus, enableDefaultRules, type SecurityStatus } from "./security-status";
import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { detectAiTool } from "./ai-tools";
import { apiFetch } from "./api";

export interface UIElements {
  loginView: HTMLElement;
  mainView: HTMLElement;
  detailView: HTMLElement;
  emailInput: HTMLInputElement;
  passwordInput: HTMLInputElement;
  loginBtn: HTMLButtonElement;
  loginError: HTMLElement;
  signupBtn: HTMLButtonElement;
  webLoginBtn: HTMLAnchorElement;
  googleAuthBtn: HTMLButtonElement;
  githubAuthBtn: HTMLButtonElement;
  logoutBtn: HTMLButtonElement;
  searchInput: HTMLInputElement;
  promptList: HTMLElement;
  statusText: HTMLElement;
  detailTitle: HTMLElement;
  detailContent: HTMLElement;
  templateFields: HTMLElement;
  backBtn: HTMLButtonElement;
  copyBtn: HTMLButtonElement;
  insertBtn: HTMLButtonElement;
}

let currentPrompts: Prompt[] = [];
let selectedPrompt: Prompt | null = null;
let currentSearchQuery = "";
let activeFilter: "recent" | "favorites" | "prompts" | "shield" = "recent";
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
let cachedShieldStatus: SecurityStatus | null = null;
let els: UIElements;

// Folder & tag filter state
let currentFolderId: string | null = null;
let currentFolderName: string | null = null;
let currentTags: string[] = [];
let availableTags: string[] = [];

// ─── Views ───

function showLoginView() {
  els.loginView.classList.remove("hidden");
  els.mainView.classList.add("hidden");
  els.detailView.classList.add("hidden");
}

function showMainView() {
  els.loginView.classList.add("hidden");
  els.mainView.classList.remove("hidden");
  els.detailView.classList.add("hidden");
}

function showDetailView(prompt: Prompt) {
  selectedPrompt = prompt;
  els.loginView.classList.add("hidden");
  els.mainView.classList.add("hidden");
  els.detailView.classList.remove("hidden");

  els.detailTitle.textContent = prompt.title;

  // Update favorite button in detail toolbar
  const detailFavBtn = document.getElementById("detail-fav-btn");
  if (detailFavBtn) {
    detailFavBtn.innerHTML = heartSvg(prompt.is_favorite);
    detailFavBtn.title = prompt.is_favorite ? "Remove from favorites" : "Add to favorites";
  }

  els.detailContent.textContent = prompt.content;

  // Template variable fields
  els.templateFields.innerHTML = "";
  els.templateFields.classList.add("hidden");

  if (prompt.is_template && prompt.template_variables?.length > 0) {
    const configs = normalizeVariables(prompt.template_variables);
    if (configs.length > 0) {
      els.templateFields.classList.remove("hidden");
      const fieldInputs: HTMLInputElement[] = [];
      for (const v of configs) {
        const label = document.createElement("label");
        label.textContent = getDisplayLabel(v);

        // Add description hint below label
        if (v.description) {
          const hint = document.createElement("span");
          hint.className = "field-hint";
          hint.textContent = v.description;
          label.appendChild(hint);
        }

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = v.description || `Enter ${getDisplayLabel(v).toLowerCase()}...`;
        input.dataset.variable = v.name;
        if (v.defaultValue) input.value = v.defaultValue;
        input.addEventListener("input", updatePreview);
        els.templateFields.appendChild(label);
        els.templateFields.appendChild(input);
        fieldInputs.push(input);
      }

      // Keyboard navigation: Enter → next field, Ctrl+Enter → insert
      fieldInputs.forEach((input, i) => {
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (i < fieldInputs.length - 1) {
              fieldInputs[i + 1].focus();
            } else {
              els.insertBtn.click();
            }
          } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            els.insertBtn.click();
          }
        });
      });

      // Hint text below fields
      const hintEl = document.createElement("div");
      hintEl.className = "template-hint";
      hintEl.textContent = "Fill in the fields above, then insert";
      els.templateFields.appendChild(hintEl);

      // Trigger initial preview with defaults
      updatePreview();

      // Auto-focus first field
      if (fieldInputs.length > 0) {
        requestAnimationFrame(() => fieldInputs[0].focus());
      }
    }
  }
}

function updatePreview() {
  if (!selectedPrompt) return;
  const values: Record<string, string> = {};
  const inputs =
    els.templateFields.querySelectorAll<HTMLInputElement>("input");
  inputs.forEach((input) => {
    const varName = input.dataset.variable!;
    values[varName] = input.value || `{{${varName}}}`;
  });
  els.detailContent.textContent = fillTemplate(
    selectedPrompt.content,
    values
  );
}

function getFilledContent(): string {
  return els.detailContent.textContent || "";
}

/** Returns true if any template fields have unfilled {{var}} placeholders still showing. */
function hasUnfilledVariables(): boolean {
  const content = getFilledContent();
  return /\{\{.+?\}\}/.test(content);
}

/** Flash unfilled template fields to draw attention. Returns true if any were unfilled. */
function flashUnfilledFields(): boolean {
  const inputs = els.templateFields.querySelectorAll<HTMLInputElement>("input");
  let hasEmpty = false;
  inputs.forEach((input) => {
    const varName = input.dataset.variable;
    if (varName && !input.value.trim()) {
      hasEmpty = true;
      input.classList.add("highlight-unfilled");
      setTimeout(() => input.classList.remove("highlight-unfilled"), 600);
    }
  });
  return hasEmpty;
}

// ─── Prompts ───

async function loadPrompts(query = "") {
  const session = await getSession();
  if (!session) return;

  els.promptList.innerHTML = '<div class="loading">Loading prompts...</div>';
  setStatus("Fetching prompts...");

  // Remove filter bar when not on folders tab
  if (activeFilter !== "prompts") {
    document.getElementById("filter-bar")?.remove();
  }

  try {
    // If search is active, search all prompts regardless of tab
    if (query) {
      currentSearchQuery = query;
      const prompts = await fetchPrompts({ query });
      currentPrompts = prompts;
      renderPrompts();
      setStatus(
        `${currentPrompts.length} result${currentPrompts.length !== 1 ? "s" : ""}`
      );
      return;
    }

    // Tab-specific loading
    currentSearchQuery = "";
    if (activeFilter === "recent") {
      const [favs, recents] = await Promise.all([
        fetchPrompts({ favorites: true, limit: 5 }),
        fetchPrompts({ sort: "recent", limit: 15 }),
      ]);
      // Dedupe: remove favorites from recent list
      const favIds = new Set(favs.map((f) => f.id));
      const dedupedRecents = recents.filter((r) => !favIds.has(r.id));
      currentPrompts = [...favs, ...dedupedRecents];
      renderCombinedView(favs, dedupedRecents);
    } else if (activeFilter === "favorites") {
      const prompts = await fetchPrompts({ favorites: true });
      currentPrompts = prompts;
      renderPrompts("favorites");
    } else if (activeFilter === "prompts") {
      await loadFoldersTab();
      return;
    }

    setStatus(
      `${currentPrompts.length} prompt${currentPrompts.length !== 1 ? "s" : ""}`
    );
  } catch (err) {
    if (err instanceof Error && err.message === "SESSION_EXPIRED") {
      await logout();
      showLoginView();
      setStatus("Session expired — please sign in again");
    } else {
      els.promptList.innerHTML =
        '<div class="empty-state"><p>Could not reach server</p><button class="retry-btn">Retry</button></div>';
      setStatus("Connection error");
      els.promptList.querySelector(".retry-btn")?.addEventListener("click", () => {
        loadPrompts(els.searchInput.value.trim());
      });
    }
  }
}

async function loadFoldersTab() {
  els.promptList.innerHTML = '<div class="loading">Loading prompts...</div>';

  try {
    const fetchOpts: Parameters<typeof fetchPrompts>[0] = {};
    if (currentFolderId) fetchOpts.folderId = currentFolderId;
    if (currentTags.length > 0) fetchOpts.tags = currentTags;

    // Fetch folders and prompts in parallel
    const [foldersData, prompts] = await Promise.all([
      fetchFolders(),
      fetchPrompts(fetchOpts),
    ]);

    availableTags = foldersData.tags;

    // Render filter bar (folder + tags dropdowns)
    renderFilterBar(foldersData.folders);

    currentPrompts = prompts;
    renderPrompts("folder");
    setStatus(
      `${currentPrompts.length} prompt${currentPrompts.length !== 1 ? "s" : ""}`
    );
  } catch (err) {
    if (err instanceof Error && err.message === "SESSION_EXPIRED") {
      await logout();
      showLoginView();
      setStatus("Session expired — please sign in again");
    } else {
      els.promptList.innerHTML =
        '<div class="empty-state"><p>Could not load prompts</p><button class="retry-btn">Retry</button></div>';
      setStatus("Connection error");
      els.promptList.querySelector(".retry-btn")?.addEventListener("click", () => {
        loadFoldersTab();
      });
    }
  }
}

function renderFilterBar(folders: ExtFolder[]) {
  // Remove existing filter bar
  document.getElementById("filter-bar")?.remove();

  const bar = document.createElement("div");
  bar.id = "filter-bar";
  bar.className = "filter-bar";

  // ── Folder dropdown (single-select) ──
  const folderWrap = document.createElement("div");
  folderWrap.className = "filter-dropdown";

  const folderBtn = document.createElement("button");
  folderBtn.className = "filter-dropdown-toggle";
  folderBtn.innerHTML = `<span>${currentFolderName ? escapeHtml(currentFolderName) : "All categories"}</span>${chevronSvg()}`;
  folderWrap.appendChild(folderBtn);

  const folderMenu = document.createElement("div");
  folderMenu.className = "filter-dropdown-menu hidden";

  // "All categories" option
  const allOpt = document.createElement("button");
  allOpt.className = `filter-option${!currentFolderId ? " selected" : ""}`;
  allOpt.textContent = "All categories";
  allOpt.addEventListener("click", () => {
    currentFolderId = null;
    currentFolderName = null;
    closeAllDropdowns();
    loadFoldersTab();
  });
  folderMenu.appendChild(allOpt);

  for (const f of folders) {
    const opt = document.createElement("button");
    opt.className = `filter-option${currentFolderId === f.id ? " selected" : ""}`;
    opt.textContent = f.name;
    opt.addEventListener("click", () => {
      currentFolderId = f.id;
      currentFolderName = f.name;
      closeAllDropdowns();
      loadFoldersTab();
    });
    folderMenu.appendChild(opt);
  }

  folderWrap.appendChild(folderMenu);

  folderBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !folderMenu.classList.contains("hidden");
    closeAllDropdowns();
    if (!isOpen) folderMenu.classList.remove("hidden");
  });

  bar.appendChild(folderWrap);

  // ── Tags dropdown (multi-select) ──
  if (availableTags.length > 0) {
    const tagWrap = document.createElement("div");
    tagWrap.className = "filter-dropdown";

    const tagBtn = document.createElement("button");
    tagBtn.className = "filter-dropdown-toggle";
    const tagLabel = currentTags.length > 0
      ? `Tags <span class="filter-count">${currentTags.length}</span>`
      : "All tags";
    tagBtn.innerHTML = `<span>${tagLabel}</span>${chevronSvg()}`;
    tagWrap.appendChild(tagBtn);

    const tagMenu = document.createElement("div");
    tagMenu.className = "filter-dropdown-menu hidden";

    // "Clear all" option at top when tags are selected
    if (currentTags.length > 0) {
      const clearOpt = document.createElement("button");
      clearOpt.className = "filter-option filter-option-clear";
      clearOpt.textContent = "Clear all";
      clearOpt.addEventListener("click", (e) => {
        e.stopPropagation();
        currentTags = [];
        closeAllDropdowns();
        loadFoldersTab();
      });
      tagMenu.appendChild(clearOpt);
    }

    for (const tag of availableTags) {
      const opt = document.createElement("label");
      opt.className = "filter-option filter-option-check";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = currentTags.includes(tag);
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        if (cb.checked) {
          if (!currentTags.includes(tag)) currentTags.push(tag);
        } else {
          currentTags = currentTags.filter((t) => t !== tag);
        }
        // Don't close — let user pick multiple, then click away
        loadFoldersTab();
      });

      const span = document.createElement("span");
      span.textContent = tag;

      opt.appendChild(cb);
      opt.appendChild(span);
      tagMenu.appendChild(opt);
    }

    tagWrap.appendChild(tagMenu);

    tagBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !tagMenu.classList.contains("hidden");
      closeAllDropdowns();
      if (!isOpen) tagMenu.classList.remove("hidden");
    });

    bar.appendChild(tagWrap);
  }

  // Insert before the prompt list
  els.promptList.parentElement?.insertBefore(bar, els.promptList);
}

function chevronSvg(): string {
  return '<svg class="filter-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
}

function closeAllDropdowns() {
  document.querySelectorAll(".filter-dropdown-menu").forEach((m) => m.classList.add("hidden"));
}

function buildCardHtml(p: Prompt): string {
  const titleHtml = currentSearchQuery
    ? highlightMatch(escapeHtml(p.title), currentSearchQuery)
    : escapeHtml(p.title);
  const descHtml = currentSearchQuery
    ? highlightMatch(escapeHtml(p.description || p.content.slice(0, 80)), currentSearchQuery)
    : escapeHtml(p.description || p.content.slice(0, 80));

  return `
    <div class="prompt-card" data-id="${p.id}">
      <div class="prompt-card-header">
        <div class="prompt-card-title">
          ${titleHtml}
          ${p.is_template ? '<span class="badge-template">Template</span>' : ""}
        </div>
        <div class="prompt-card-actions">
          <button class="btn-fav" data-fav-id="${p.id}" title="${p.is_favorite ? "Remove from favorites" : "Add to favorites"}">${heartSvg(p.is_favorite)}</button>
          <svg class="prompt-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
      <div class="prompt-card-desc">${descHtml}</div>
      ${
        p.tags?.length
          ? `<div>${p.tags
              .slice(0, 3)
              .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
              .join("")}</div>`
          : ""
      }
    </div>
  `;
}

function renderPrompts(context?: "recent" | "favorites" | "folder") {
  if (currentPrompts.length === 0) {
    let emptyMsg = "No prompts found";
    if (context === "recent") {
      emptyMsg = "No recently used prompts yet";
    } else if (context === "favorites") {
      emptyMsg = "No favorite prompts yet — tap the heart on any prompt";
    } else if (context === "folder") {
      emptyMsg = "This category is empty";
    }
    els.promptList.innerHTML =
      `<div class="empty-state"><p>${emptyMsg}</p></div>`;
    return;
  }

  // Build prompt cards
  const cardsHtml = currentPrompts.map((p) => buildCardHtml(p)).join("");

  // Show onboarding tip when user has only the sample prompt
  const onboardingHtml =
    currentPrompts.length <= 1 && activeFilter === "recent"
      ? `<div class="onboarding-tip">
          <strong>Get started:</strong> This is a sample template. Click it to see how it works, then create your own prompts at
          <a href="${CONFIG.SITE_URL}/vault" target="_blank" rel="noopener">teamprompt.app/vault</a>.
        </div>`
      : "";

  els.promptList.innerHTML = cardsHtml + onboardingHtml;

  // Wire favorite buttons (stop propagation so card click doesn't fire)
  els.promptList.querySelectorAll<HTMLElement>(".btn-fav").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.favId;
      if (id) handleFavoriteToggle(id, btn);
    });
  });

  els.promptList.querySelectorAll<HTMLElement>(".prompt-card").forEach((card) => {
    card.addEventListener("click", () => {
      const prompt = currentPrompts.find((p) => p.id === card.dataset.id);
      if (prompt) showDetailView(prompt);
    });
  });
}

function renderCombinedView(favs: Prompt[], recents: Prompt[]) {
  if (favs.length === 0 && recents.length === 0) {
    els.promptList.innerHTML =
      '<div class="empty-state"><p>No recently used prompts yet</p></div>';
    return;
  }

  let html = "";

  if (favs.length > 0) {
    html += '<div class="section-header">Favorites</div>';
    html += favs.map((p) => buildCardHtml(p)).join("");
  }

  if (recents.length > 0) {
    html += '<div class="section-header">Recent</div>';
    html += recents.map((p) => buildCardHtml(p)).join("");
  }

  // Show onboarding tip when user has only the sample prompt
  const totalCount = favs.length + recents.length;
  if (totalCount <= 1) {
    html += `<div class="onboarding-tip">
      <strong>Get started:</strong> This is a sample template. Click it to see how it works, then create your own prompts at
      <a href="${CONFIG.SITE_URL}/vault" target="_blank" rel="noopener">teamprompt.app/vault</a>.
    </div>`;
  }

  els.promptList.innerHTML = html;

  // Wire favorite buttons
  els.promptList.querySelectorAll<HTMLElement>(".btn-fav").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.favId;
      if (id) handleFavoriteToggle(id, btn);
    });
  });

  els.promptList.querySelectorAll<HTMLElement>(".prompt-card").forEach((card) => {
    card.addEventListener("click", () => {
      const prompt = currentPrompts.find((p) => p.id === card.dataset.id);
      if (prompt) showDetailView(prompt);
    });
  });
}

// ─── Shield ───

async function loadShieldView() {
  const shieldView = document.getElementById("shield-view");
  if (!shieldView) return;

  shieldView.innerHTML = '<div class="loading">Loading security status...</div>';

  const status = await fetchSecurityStatus();
  cachedShieldStatus = status;
  updateShieldIndicator(status);

  if (!status) {
    shieldView.innerHTML = '<div class="shield-empty">Unable to load security status</div>';
    return;
  }

  renderShieldView(shieldView, status);
}

function filterShieldViolations(container: HTMLElement, query: string) {
  const violations = container.querySelectorAll<HTMLElement>(".shield-violation");
  const q = query.toLowerCase();
  violations.forEach((v) => {
    const ruleName = v.querySelector(".shield-violation-rule")?.textContent?.toLowerCase() || "";
    const matchedText = v.querySelector(".shield-violation-match")?.textContent?.toLowerCase() || "";
    const visible = !q || ruleName.includes(q) || matchedText.includes(q);
    v.style.display = visible ? "" : "none";
  });
}

function renderShieldView(container: HTMLElement, status: SecurityStatus) {
  // Shield disabled by admin — show disabled message instead of normal view
  if (status.disabled) {
    container.innerHTML = `
      <div class="shield-status-card shield-disabled-card">
        <div class="shield-icon-wrap disabled">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="4" y1="4" x2="20" y2="20" stroke-width="2.5"/>
          </svg>
        </div>
        <div class="shield-status-info">
          <div class="shield-status-label">Shield Disabled</div>
          <div class="shield-status-detail">Shield has been disabled for your account by an admin. Contact your admin to re-enable protection.</div>
        </div>
      </div>
    `;
    return;
  }

  const statusIcon = status.protected
    ? `<div class="shield-icon-wrap protected">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10" stroke-width="2.5"/>
        </svg>
      </div>`
    : `<div class="shield-icon-wrap unprotected">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>`;

  const statusLabel = status.protected ? "Protected" : "Not Configured";
  const statusDetail = status.protected
    ? `${status.activeRuleCount} active rule${status.activeRuleCount !== 1 ? "s" : ""} monitoring your prompts`
    : "Shield scans prompts before they reach AI tools.";

  const statsHtml = status.protected
    ? `<div class="shield-stats">
        <div class="shield-stat">
          <div class="shield-stat-value blocked">${status.weeklyStats.blocked}</div>
          <div class="shield-stat-label">Blocked</div>
        </div>
        <div class="shield-stat">
          <div class="shield-stat-value warned">${status.weeklyStats.warned}</div>
          <div class="shield-stat-label">Warned</div>
        </div>
        <div class="shield-stat">
          <div class="shield-stat-value total">${status.weeklyStats.total}</div>
          <div class="shield-stat-label">This Week</div>
        </div>
      </div>`
    : "";

  const onboardingHtml = !status.protected
    ? `<div class="shield-onboarding">
        <div class="shield-onboarding-intro">
          Catches API keys, passwords, connection strings, tokens, and other secrets before they leave your clipboard. Default policies cover AWS, GitHub, Stripe, OpenAI, Slack, and more.
        </div>
        <div class="shield-onboarding-features">
          <div class="shield-feature">
            <span class="shield-feature-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <span>Blocks secrets &amp; credentials</span>
          </div>
          <div class="shield-feature">
            <span class="shield-feature-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </span>
            <span>Warns on suspicious patterns</span>
          </div>
          <div class="shield-feature">
            <span class="shield-feature-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </span>
            <span>Logs every scan for audit</span>
          </div>
        </div>
        <button id="enable-shield-btn" class="btn-primary shield-enable-btn">Enable Default Rules</button>
        <div class="shield-onboarding-hint">Installs 11 rules covering API keys, credentials, and tokens. You can customize or add more on the dashboard.</div>
      </div>`
    : "";

  let violationsHtml = "";
  if (status.recentViolations.length > 0) {
    const items = status.recentViolations.map((v) => {
      const badgeClass = v.actionTaken === "blocked" ? "blocked" : "warned";
      const badgeText = v.actionTaken === "blocked" ? "Blocked" : "Warned";
      const timeAgo = formatTimeAgo(v.createdAt);
      return `<div class="shield-violation">
        <div class="shield-violation-header">
          <span class="shield-violation-rule">${escapeHtml(v.ruleName)}</span>
          <span class="shield-violation-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="shield-violation-meta">
          <span class="shield-violation-match">${escapeHtml(v.matchedText)}</span>
          <span>${timeAgo}</span>
        </div>
      </div>`;
    }).join("");

    violationsHtml = `
      <div class="shield-section-title">Recent Activity</div>
      <div class="shield-violations">${items}</div>`;
  } else if (status.protected) {
    violationsHtml = '<div class="shield-empty">No violations detected this week</div>';
  }

  const manageUrl = `${CONFIG.SITE_URL}/guardrails`;
  const footerHtml = status.canManage
    ? `<a href="${manageUrl}" target="_blank" rel="noopener" class="shield-manage-link">
        ${status.protected ? "Manage guardrails on teamprompt.app" : "Customize rules on teamprompt.app"}
      </a>`
    : status.protected
      ? `<div class="shield-manage-link shield-managed-note">Protected by your organization&apos;s guardrails</div>`
      : "";

  container.innerHTML = `
    <div class="shield-status-card">
      ${statusIcon}
      <div class="shield-status-info">
        <div class="shield-status-label">${statusLabel}</div>
        <div class="shield-status-detail">${statusDetail}</div>
      </div>
    </div>
    ${onboardingHtml}
    ${statsHtml}
    ${violationsHtml}
    ${footerHtml}
  `;

  // Bind enable button if present
  const enableBtn = container.querySelector<HTMLButtonElement>("#enable-shield-btn");
  if (enableBtn) {
    enableBtn.addEventListener("click", async () => {
      enableBtn.disabled = true;
      enableBtn.textContent = "Installing rules...";
      const result = await enableDefaultRules();
      if (result?.installed) {
        loadShieldView();
      } else if (result && !result.installed) {
        loadShieldView();
      } else {
        enableBtn.disabled = false;
        enableBtn.textContent = "Enable Default Rules";
        const hint = container.querySelector(".shield-onboarding-hint");
        if (hint) hint.textContent = "Something went wrong. Try again or set up on the dashboard.";
      }
    });
  }

}

function updateShieldIndicator(status: SecurityStatus | null) {
  const indicator = document.getElementById("shield-indicator");
  if (!indicator) return;
  if (status?.disabled) {
    indicator.classList.remove("active");
    indicator.classList.add("disabled");
    indicator.title = "Shield disabled by admin";
  } else if (status?.protected) {
    indicator.classList.add("active");
    indicator.classList.remove("disabled");
    indicator.title = `Protected — ${status.activeRuleCount} active rules`;
  } else {
    indicator.classList.remove("active", "disabled");
    indicator.title = "Security not configured";
  }
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Logging ───

async function logConversation(promptText: string, method: string) {
  const session = await getSession();
  if (!session || !selectedPrompt) return;

  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const aiTool = detectAiTool(tab?.url || "");

    await apiFetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.log}`, {
      method: "POST",
      headers: apiHeaders(session.accessToken),
      body: JSON.stringify({
        ai_tool: aiTool,
        prompt_text: promptText,
        prompt_id: selectedPrompt.id,
        action: "sent",
        metadata: { method, source: "extension" },
      }),
    });
  } catch {
    // Non-critical
  }
}

// ─── Helpers ───

function setInsertError(message: string) {
  els.insertBtn.textContent = message;
  els.insertBtn.classList.add("btn-error");
  setTimeout(() => {
    els.insertBtn.textContent = "Insert into AI Tool";
    els.insertBtn.classList.remove("btn-error");
  }, 3000);
}

function setStatus(text: string) {
  if (els.statusText) {
    els.statusText.textContent = text;
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function highlightMatch(html: string, query: string): string {
  if (!query) return html;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(escaped, "gi"), "<mark>$&</mark>");
}

function heartSvg(filled: boolean): string {
  return `<svg class="fav-heart${filled ? " filled" : ""}" width="14" height="14" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

async function handleFavoriteToggle(promptId: string, btn: HTMLElement) {
  btn.classList.add("fav-loading");
  try {
    const newVal = await toggleFavorite(promptId);
    if (newVal !== null) {
      // Update local state
      const p = currentPrompts.find((x) => x.id === promptId);
      if (p) p.is_favorite = newVal;
      if (selectedPrompt?.id === promptId) selectedPrompt.is_favorite = newVal;
      // Update button
      btn.innerHTML = heartSvg(newVal);
      btn.title = newVal ? "Remove from favorites" : "Add to favorites";
    }
  } catch {
    // silently fail
  } finally {
    btn.classList.remove("fav-loading");
  }
}

// ─── Theme ───

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  const themeToggle = document.getElementById("theme-toggle") as HTMLInputElement | null;
  if (themeToggle) {
    themeToggle.checked = theme === "dark";
  }
}

async function initTheme() {
  const data = await browser.storage.local.get(["theme"]);
  applyTheme((data.theme as "light" | "dark") || "dark");
}

// ─── Init ───

export function initSharedUI(elements: UIElements) {
  els = elements;

  // Auth handlers
  els.loginBtn.addEventListener("click", async () => {
    const email = els.emailInput.value.trim();
    const password = els.passwordInput.value;

    if (!email || !password) {
      els.loginError.textContent = "Email and password are required";
      return;
    }

    els.loginBtn.disabled = true;
    els.loginBtn.textContent = "Signing in...";
    els.loginError.textContent = "";

    try {
      await login(email, password);
      showMainView();
      loadPrompts();
    } catch (err: unknown) {
      els.loginError.textContent =
        err instanceof Error ? err.message : "Login failed";
    } finally {
      els.loginBtn.disabled = false;
      els.loginBtn.textContent = "Sign In";
    }
  });

  els.logoutBtn.addEventListener("click", async () => {
    await logout();
    showLoginView();
  });

  els.signupBtn.addEventListener("click", openSignup);
  els.googleAuthBtn.addEventListener("click", openGoogleAuth);
  els.githubAuthBtn.addEventListener("click", openGithubAuth);
  els.webLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openLogin();
  });

  // Listen for auth-bridge session sync (login AND logout)
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.accessToken) {
      if (changes.accessToken.newValue) {
        extAuthDebug.log("state", "ui-init: accessToken storage change → login detected"); // AUTH-DEBUG
        // Logged in — show main view
        showMainView();
        loadPrompts();
      } else if (!changes.accessToken.newValue && changes.accessToken.oldValue) {
        extAuthDebug.log("state", "ui-init: accessToken storage change → logout detected"); // AUTH-DEBUG
        // Logged out — show login view
        showLoginView();
      }
    }
  });

  // Search
  els.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = els.searchInput.value.trim();

      if (activeFilter === "shield") {
        // Shield tab — filter violations client-side using the main search bar
        const shieldView = document.getElementById("shield-view");
        if (shieldView) filterShieldViolations(shieldView, query);
        return;
      }

      if (query) {
        // Search overrides tabs — search all prompts
        const shieldView = document.getElementById("shield-view");
        shieldView?.classList.add("hidden");
        els.promptList.classList.remove("hidden");
        document.getElementById("filter-bar")?.classList.add("hidden");
        loadPrompts(query);
      } else {
        // Clear search → return to current tab view
        document.getElementById("filter-bar")?.classList.remove("hidden");
        loadPrompts();
      }
    }, 300);
  });

  // Tabs
  const shieldView = document.getElementById("shield-view");

  els.mainView.querySelectorAll<HTMLElement>(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      els.mainView
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = (tab.dataset.filter || "recent") as typeof activeFilter;

      // Reset folder/tag filters when switching tabs
      currentFolderId = null;
      currentFolderName = null;
      currentTags = [];
      document.getElementById("filter-bar")?.remove();

      // Clear search and update placeholder when switching tabs
      els.searchInput.value = "";
      els.searchInput.placeholder = activeFilter === "shield" ? "Search violations..." : "Search prompts...";

      if (activeFilter === "shield") {
        els.promptList.classList.add("hidden");
        els.searchInput.closest(".search-wrap")?.classList.remove("hidden");
        shieldView?.classList.remove("hidden");
        loadShieldView();
      } else {
        shieldView?.classList.add("hidden");
        els.promptList.classList.remove("hidden");
        els.searchInput.closest(".search-wrap")?.classList.remove("hidden");
        loadPrompts();
      }
    });
  });

  // Close filter dropdowns on outside click
  document.addEventListener("click", () => {
    closeAllDropdowns();
  });

  // Settings gear
  const settingsBtn = document.getElementById("settings-btn");
  const settingsDropdown = document.getElementById("settings-dropdown");
  const sidebarToggle = document.getElementById("sidebar-toggle") as HTMLInputElement | null;
  const sidebarToggleLabel = document.getElementById("sidebar-toggle-label");

  // Hide sidebar toggle on Firefox (no sidePanel API)
  const chromeForSidebar = globalThis as unknown as {
    chrome?: { sidePanel?: { setPanelBehavior?: unknown } };
  };
  if (!chromeForSidebar.chrome?.sidePanel && sidebarToggleLabel) {
    sidebarToggleLabel.classList.add("hidden");
  }

  if (settingsBtn && settingsDropdown) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsDropdown.classList.toggle("hidden");
    });
    // Close dropdown on outside click
    document.addEventListener("click", () => {
      settingsDropdown.classList.add("hidden");
    });
    settingsDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Sidebar toggle
  if (sidebarToggle) {
    // Load saved preference
    browser.storage.local.get(["alwaysOpenSidebar"]).then((data) => {
      sidebarToggle.checked = !!data.alwaysOpenSidebar;
    });

    sidebarToggle.addEventListener("change", async () => {
      const enabled = sidebarToggle.checked;
      browser.storage.local.set({ alwaysOpenSidebar: enabled });
      browser.runtime.sendMessage({
        type: "SET_SIDEBAR_BEHAVIOR",
        enabled,
      });
      // If toggled on, open side panel immediately and close the popup
      if (enabled) {
        const chrome = globalThis as unknown as {
          chrome?: { sidePanel?: { open: (opts: { tabId: number }) => Promise<void> } };
        };
        if (chrome.chrome?.sidePanel) {
          const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
          if (tab?.id) {
            await chrome.chrome.sidePanel.open({ tabId: tab.id });
          }
          window.close();
        }
      }
    });
  }

  // Detail favorite button
  const detailFavBtn = document.getElementById("detail-fav-btn");
  if (detailFavBtn) {
    detailFavBtn.addEventListener("click", () => {
      if (selectedPrompt) handleFavoriteToggle(selectedPrompt.id, detailFavBtn);
    });
  }

  // Detail actions
  els.backBtn.addEventListener("click", () => {
    showMainView();
    selectedPrompt = null;
  });

  els.copyBtn.addEventListener("click", async () => {
    if (hasUnfilledVariables()) flashUnfilledFields();
    const content = getFilledContent();
    await navigator.clipboard.writeText(content);
    els.copyBtn.textContent = "Copied!";
    setTimeout(() => (els.copyBtn.textContent = "Copy to Clipboard"), 1500);
    logConversation(content, "clipboard");
  });

  els.insertBtn.addEventListener("click", async () => {
    if (hasUnfilledVariables()) flashUnfilledFields();
    const content = getFilledContent();
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      try {
        const response = await browser.tabs.sendMessage(tab.id, { type: "INSERT_PROMPT", content });
        if (response?.success) {
          els.insertBtn.textContent = "Inserted!";
          setTimeout(
            () => (els.insertBtn.textContent = "Insert into AI Tool"),
            1500
          );
          logConversation(content, "insert");
        } else {
          setInsertError("Could not find input field");
        }
      } catch {
        setInsertError("Open an AI tool page first");
      }
    } else {
      setInsertError("Open an AI tool page first");
    }
  });

  // Open dashboard button
  const dashboardBtn = document.getElementById("open-dashboard-btn");
  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      browser.tabs.create({ url: CONFIG.SITE_URL + "/home" });
    });
  }

  // Theme toggle (in settings dropdown)
  const themeToggleCheckbox = document.getElementById("theme-toggle") as HTMLInputElement | null;
  if (themeToggleCheckbox) {
    themeToggleCheckbox.addEventListener("change", () => {
      const next = themeToggleCheckbox.checked ? "dark" : "light";
      browser.storage.local.set({ theme: next });
      applyTheme(next);
    });
  }

  // Init theme and check session
  initTheme();

  getSession().then((session) => {
    extAuthDebug.log("state", "ui-init: session check on init", { hasSession: !!session }); // AUTH-DEBUG
    if (session) {
      showMainView();
      loadPrompts();
      // Load shield indicator in status bar (non-blocking)
      fetchSecurityStatus().then((status) => {
        cachedShieldStatus = status;
        updateShieldIndicator(status);
      });
    } else {
      showLoginView();
    }
  });
}
