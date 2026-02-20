// TeamPrompt Extension — Shared UI Init
// Used by both popup and sidepanel entrypoints

import { getSession, login, logout, openLogin, openSignup, openGoogleAuth, openGithubAuth } from "./auth";
import { fetchPrompts, fillTemplate, type Prompt } from "./prompts";
import { CONFIG, API_ENDPOINTS, apiHeaders } from "./config";
import { detectAiTool } from "./ai-tools";

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
let activeFilter: "all" | "templates" | "favorites" = "all";
let searchTimeout: ReturnType<typeof setTimeout> | undefined;
let els: UIElements;

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
    els.templateFields.classList.remove("hidden");
    for (const v of prompt.template_variables) {
      const label = document.createElement("label");
      label.textContent = v;
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `Enter ${v}...`;
      input.dataset.variable = v;
      input.addEventListener("input", updatePreview);
      els.templateFields.appendChild(label);
      els.templateFields.appendChild(input);
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

  try {
    let prompts = await fetchPrompts({
      query,
      templatesOnly: activeFilter === "templates",
    });

    if (activeFilter === "favorites") {
      prompts.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
      prompts = prompts.slice(0, 10);
    }

    currentPrompts = prompts;
    renderPrompts();
    setStatus(
      `${currentPrompts.length} prompt${currentPrompts.length !== 1 ? "s" : ""}`
    );
  } catch {
    els.promptList.innerHTML =
      '<div class="empty-state"><p>Failed to load prompts</p></div>';
    setStatus("Error loading prompts");
  }
}

function renderPrompts() {
  if (currentPrompts.length === 0) {
    els.promptList.innerHTML =
      '<div class="empty-state"><p>No prompts found</p></div>';
    return;
  }

  els.promptList.innerHTML = currentPrompts
    .map(
      (p) => `
      <div class="prompt-card" data-id="${p.id}">
        <div class="prompt-card-title">
          ${escapeHtml(p.title)}
          ${p.is_template ? '<span class="badge-template">Template</span>' : ""}
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

  els.promptList.querySelectorAll<HTMLElement>(".prompt-card").forEach((card) => {
    card.addEventListener("click", () => {
      const prompt = currentPrompts.find((p) => p.id === card.dataset.id);
      if (prompt) showDetailView(prompt);
    });
  });
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

    await fetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.log}`, {
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

  // Listen for auth-bridge session sync
  browser.storage.onChanged.addListener((changes, area) => {
    if (
      area === "local" &&
      changes.accessToken &&
      changes.accessToken.newValue
    ) {
      showMainView();
      loadPrompts();
    }
  });

  // Search
  els.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadPrompts(els.searchInput.value.trim());
    }, 300);
  });

  // Tabs
  els.mainView.querySelectorAll<HTMLElement>(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      els.mainView
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = (tab.dataset.filter || "all") as typeof activeFilter;
      loadPrompts(els.searchInput.value.trim());
    });
  });

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
      browser.tabs.sendMessage(tab.id, { type: "INSERT_PROMPT", content });
      els.insertBtn.textContent = "Inserted!";
      setTimeout(
        () => (els.insertBtn.textContent = "Insert into AI Tool"),
        1500
      );
      logConversation(content, "insert");
    }
  });

  // Check session and load
  getSession().then((session) => {
    if (session) {
      showMainView();
      loadPrompts();
    } else {
      showLoginView();
    }
  });
}
