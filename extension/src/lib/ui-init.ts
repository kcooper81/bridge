// TeamPrompt Extension — Shared UI Init
// Used by both popup and sidepanel entrypoints

import { getSession, login, logout, openLogin, openSignup, openGoogleAuth, openGithubAuth } from "./auth";
import { extAuthDebug } from "./auth-debug"; // AUTH-DEBUG
import { fetchPrompts, fetchFolders, fillTemplate, normalizeVariables, getDisplayLabel, type Prompt, type ExtFolder } from "./prompts";
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
let activeFilter: "recent" | "favorites" | "folders" | "shield" = "recent";
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
let cachedShieldStatus: SecurityStatus | null = null;
let els: UIElements;

// Folder drill-down state
let currentFolderId: string | null = null;
let currentFolderName: string | null = null;

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
  els.detailContent.textContent = prompt.content;

  // Template variable fields
  els.templateFields.innerHTML = "";
  els.templateFields.classList.add("hidden");

  if (prompt.is_template && prompt.template_variables?.length > 0) {
    const configs = normalizeVariables(prompt.template_variables);
    if (configs.length > 0) {
      els.templateFields.classList.remove("hidden");
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
      }
      // Trigger initial preview with defaults
      updatePreview();
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

// ─── Prompts ───

async function loadPrompts(query = "") {
  const session = await getSession();
  if (!session) return;

  els.promptList.innerHTML = '<div class="loading">Loading prompts...</div>';
  setStatus("Fetching prompts...");

  // Hide folder back bar when not in folder contents
  const folderBackBar = document.getElementById("folder-back-bar");
  if (folderBackBar && !(activeFilter === "folders" && currentFolderId)) {
    folderBackBar.remove();
  }

  try {
    // If search is active, search all prompts regardless of tab
    if (query) {
      const prompts = await fetchPrompts({ query });
      currentPrompts = prompts;
      renderPrompts();
      setStatus(
        `${currentPrompts.length} result${currentPrompts.length !== 1 ? "s" : ""}`
      );
      return;
    }

    // Tab-specific loading
    if (activeFilter === "recent") {
      const prompts = await fetchPrompts({ sort: "recent", limit: 15 });
      currentPrompts = prompts;
      renderPrompts("recent");
    } else if (activeFilter === "favorites") {
      const prompts = await fetchPrompts({ favorites: true });
      currentPrompts = prompts;
      renderPrompts("favorites");
    } else if (activeFilter === "folders") {
      if (currentFolderId) {
        // Show prompts inside a folder
        const prompts = await fetchPrompts({ folderId: currentFolderId });
        currentPrompts = prompts;
        renderFolderBackBar();
        renderPrompts("folder");
      } else {
        // Show folder list
        await loadFolderList();
        return;
      }
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

async function loadFolderList() {
  els.promptList.innerHTML = '<div class="loading">Loading folders...</div>';

  try {
    const { folders, unfiled_count } = await fetchFolders();

    if (folders.length === 0 && unfiled_count === 0) {
      els.promptList.innerHTML =
        '<div class="empty-state"><p>No folders yet</p><p style="font-size:12px;margin-top:4px">Create folders at <a href="' + CONFIG.SITE_URL + '/vault" target="_blank" rel="noopener" style="color:var(--primary)">teamprompt.app/vault</a></p></div>';
      setStatus("0 folders");
      return;
    }

    const folderCards = folders.map((f) => {
      const icon = f.icon || "\uD83D\uDCC1";
      const bgColor = f.color ? `background:${f.color}20;color:${f.color}` : "";
      return `<div class="folder-card" data-folder-id="${f.id}" data-folder-name="${escapeHtml(f.name)}">
        <div class="folder-card-icon" ${bgColor ? `style="${bgColor}"` : ""}>${icon}</div>
        <div class="folder-card-info">
          <div class="folder-card-name">${escapeHtml(f.name)}</div>
          <div class="folder-card-count">${f.prompt_count} prompt${f.prompt_count !== 1 ? "s" : ""}</div>
        </div>
        <svg class="folder-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>`;
    }).join("");

    const unfiledCard = unfiled_count > 0
      ? `<div class="folder-card unfiled" data-folder-id="unfiled" data-folder-name="Unfiled">
          <div class="folder-card-icon">\uD83D\uDCC4</div>
          <div class="folder-card-info">
            <div class="folder-card-name">Unfiled</div>
            <div class="folder-card-count">${unfiled_count} prompt${unfiled_count !== 1 ? "s" : ""}</div>
          </div>
          <svg class="folder-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>`
      : "";

    els.promptList.innerHTML = `<div class="folder-list">${folderCards}${unfiledCard}</div>`;
    setStatus(`${folders.length} folder${folders.length !== 1 ? "s" : ""}`);

    // Bind click handlers for folder drill-down
    els.promptList.querySelectorAll<HTMLElement>(".folder-card").forEach((card) => {
      card.addEventListener("click", () => {
        currentFolderId = card.dataset.folderId || null;
        currentFolderName = card.dataset.folderName || null;
        loadPrompts();
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SESSION_EXPIRED") {
      await logout();
      showLoginView();
      setStatus("Session expired — please sign in again");
    } else {
      els.promptList.innerHTML =
        '<div class="empty-state"><p>Could not load folders</p><button class="retry-btn">Retry</button></div>';
      setStatus("Connection error");
      els.promptList.querySelector(".retry-btn")?.addEventListener("click", () => {
        loadFolderList();
      });
    }
  }
}

function renderFolderBackBar() {
  // Remove existing back bar if any
  document.getElementById("folder-back-bar")?.remove();

  const backBar = document.createElement("div");
  backBar.id = "folder-back-bar";
  backBar.className = "folder-back-bar";
  backBar.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    <span class="folder-back-name">${escapeHtml(currentFolderName || "Folders")}</span>
  `;
  backBar.addEventListener("click", () => {
    currentFolderId = null;
    currentFolderName = null;
    backBar.remove();
    loadPrompts();
  });

  // Insert before the prompt list
  els.promptList.parentElement?.insertBefore(backBar, els.promptList);
}

function renderPrompts(context?: "recent" | "favorites" | "folder") {
  if (currentPrompts.length === 0) {
    let emptyMsg = "No prompts found";
    if (context === "recent") {
      emptyMsg = "No recently used prompts yet";
    } else if (context === "favorites") {
      emptyMsg = "No favorite prompts yet — star prompts on teamprompt.app";
    } else if (context === "folder") {
      emptyMsg = "This folder is empty";
    }
    els.promptList.innerHTML =
      `<div class="empty-state"><p>${emptyMsg}</p></div>`;
    return;
  }

  // Build prompt cards
  const cardsHtml = currentPrompts
    .map(
      (p) => `
      <div class="prompt-card" data-id="${p.id}">
        <div class="prompt-card-header">
          <div class="prompt-card-title">
            ${escapeHtml(p.title)}
            ${p.is_template ? '<span class="badge-template">Template</span>' : ""}
          </div>
          <svg class="prompt-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        <div class="prompt-card-desc">${escapeHtml(p.description || p.content.slice(0, 80))}</div>
        ${
          p.tags?.length
            ? `<div>${p.tags
                .slice(0, 3)
                .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
                .join("")}</div>`
            : ""
        }
      </div>
    `
    )
    .join("");

  // Show onboarding tip when user has only the sample prompt
  const onboardingHtml =
    currentPrompts.length <= 1 && activeFilter === "recent"
      ? `<div class="onboarding-tip">
          <strong>Get started:</strong> This is a sample template. Click it to see how it works, then create your own prompts at
          <a href="${CONFIG.SITE_URL}/vault" target="_blank" rel="noopener">teamprompt.app/vault</a>.
        </div>`
      : "";

  els.promptList.innerHTML = cardsHtml + onboardingHtml;

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

  const shieldSearchHtml = status.protected && status.recentViolations.length > 0
    ? `<div class="shield-search-wrap">
        <input type="text" id="shield-search-input" placeholder="Search violations..." />
      </div>`
    : "";

  const manageUrl = `${CONFIG.SITE_URL}/guardrails`;
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
    ${shieldSearchHtml}
    ${violationsHtml}
    <a href="${manageUrl}" target="_blank" rel="noopener" class="shield-manage-link">
      ${status.protected ? "Manage guardrails on teamprompt.app" : "Customize rules on teamprompt.app"}
    </a>
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

  // Bind shield search
  const shieldSearchInput = container.querySelector<HTMLInputElement>("#shield-search-input");
  if (shieldSearchInput) {
    shieldSearchInput.addEventListener("input", () => {
      filterShieldViolations(container, shieldSearchInput.value.trim());
    });
  }
}

function updateShieldIndicator(status: SecurityStatus | null) {
  const indicator = document.getElementById("shield-indicator");
  if (!indicator) return;
  if (status?.protected) {
    indicator.classList.add("active");
    indicator.title = `Protected — ${status.activeRuleCount} active rules`;
  } else {
    indicator.classList.remove("active");
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

// ─── Theme ───

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");
  if (sunIcon && moonIcon) {
    // Show sun in dark mode (click to switch to light), moon in light mode
    sunIcon.classList.toggle("hidden", theme !== "dark");
    moonIcon.classList.toggle("hidden", theme !== "light");
  }
}

async function initTheme() {
  const { theme } = await browser.storage.local.get(["theme"]);
  applyTheme(theme || "dark");
}

async function toggleTheme() {
  const { theme } = await browser.storage.local.get(["theme"]);
  const next = (theme || "dark") === "dark" ? "light" : "dark";
  await browser.storage.local.set({ theme: next });
  applyTheme(next);
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
      if (query) {
        // Search overrides tabs — search all prompts
        const shieldView = document.getElementById("shield-view");
        shieldView?.classList.add("hidden");
        els.promptList.classList.remove("hidden");
        document.getElementById("folder-back-bar")?.classList.add("hidden");
        loadPrompts(query);
      } else {
        // Clear search → return to current tab view
        document.getElementById("folder-back-bar")?.classList.remove("hidden");
        if (activeFilter === "shield") {
          els.promptList.classList.add("hidden");
          const shieldView = document.getElementById("shield-view");
          shieldView?.classList.remove("hidden");
          loadShieldView();
        } else {
          loadPrompts();
        }
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

      // Reset folder drill-down when switching tabs
      currentFolderId = null;
      currentFolderName = null;
      document.getElementById("folder-back-bar")?.remove();

      // Clear search when switching tabs
      els.searchInput.value = "";

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

  // Detail actions
  els.backBtn.addEventListener("click", () => {
    showMainView();
    selectedPrompt = null;
  });

  els.copyBtn.addEventListener("click", async () => {
    const content = getFilledContent();
    await navigator.clipboard.writeText(content);
    els.copyBtn.textContent = "Copied!";
    setTimeout(() => (els.copyBtn.textContent = "Copy to Clipboard"), 1500);
    logConversation(content, "clipboard");
  });

  els.insertBtn.addEventListener("click", async () => {
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

  // Theme toggle
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
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
