// TeamPrompt Extension — Popup Script

const API_ENDPOINTS = {
  prompts: "/api/extension/prompts",
  scan: "/api/extension/scan",
  log: "/api/extension/log",
};

let currentPrompts = [];
let selectedPrompt = null;

// ─── DOM Elements ───
const loginView = document.getElementById("login-view");
const mainView = document.getElementById("main-view");
const detailView = document.getElementById("detail-view");
const serverUrlInput = document.getElementById("server-url");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const searchInput = document.getElementById("search-input");
const promptList = document.getElementById("prompt-list");
const statusText = document.getElementById("status-text");
const detailTitle = document.getElementById("detail-title");
const detailContent = document.getElementById("detail-content");
const templateFields = document.getElementById("template-fields");
const backBtn = document.getElementById("back-btn");
const copyBtn = document.getElementById("copy-btn");
const insertBtn = document.getElementById("insert-btn");

// ─── Init ───
document.addEventListener("DOMContentLoaded", async () => {
  const session = await getSession();
  if (session) {
    showMainView();
    loadPrompts();
  } else {
    showLoginView();
  }

  // Restore server URL
  const stored = await chrome.storage.local.get(["serverUrl"]);
  if (stored.serverUrl) serverUrlInput.value = stored.serverUrl;
});

// ─── Auth ───
loginBtn.addEventListener("click", handleLogin);
logoutBtn.addEventListener("click", handleLogout);

async function handleLogin() {
  const serverUrl = serverUrlInput.value.trim().replace(/\/$/, "");
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!serverUrl || !email || !password) {
    loginError.textContent = "All fields are required";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";
  loginError.textContent = "";

  try {
    // Use Supabase REST auth endpoint
    const supabaseUrl = await fetchSupabaseConfig(serverUrl);
    if (!supabaseUrl) {
      throw new Error("Could not connect to server");
    }

    const res = await fetch(`${supabaseUrl.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseUrl.anonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error_description || data.msg || "Login failed");
    }

    const data = await res.json();
    await chrome.storage.local.set({
      serverUrl,
      supabaseUrl: supabaseUrl.url,
      supabaseAnonKey: supabaseUrl.anonKey,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    });

    showMainView();
    loadPrompts();
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";
  }
}

async function fetchSupabaseConfig(serverUrl) {
  // Try to get Supabase URL from the app's environment
  // The app exposes NEXT_PUBLIC vars in the HTML
  try {
    const res = await fetch(serverUrl);
    const html = await res.text();

    // Look for env vars in the page source
    const urlMatch = html.match(/NEXT_PUBLIC_SUPABASE_URL['":\s]*['"]([^'"]+)['"]/);
    const keyMatch = html.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY['":\s]*['"]([^'"]+)['"]/);

    if (urlMatch && keyMatch) {
      return { url: urlMatch[1], anonKey: keyMatch[1] };
    }

    // Fallback: try well-known Supabase URL patterns from the page
    const supabaseMatch = html.match(/https:\/\/[a-z]+\.supabase\.co/);
    if (supabaseMatch) {
      // We still need the anon key — prompt user
      return null;
    }
  } catch {
    // Fallback: ask user for direct Supabase credentials
  }
  return null;
}

async function handleLogout() {
  await chrome.storage.local.remove([
    "accessToken",
    "refreshToken",
    "user",
    "supabaseUrl",
    "supabaseAnonKey",
  ]);
  showLoginView();
}

async function getSession() {
  const data = await chrome.storage.local.get(["accessToken", "serverUrl"]);
  if (data.accessToken && data.serverUrl) return data;
  return null;
}

// ─── Views ───
function showLoginView() {
  loginView.classList.remove("hidden");
  mainView.classList.add("hidden");
  detailView.classList.add("hidden");
}

function showMainView() {
  loginView.classList.add("hidden");
  mainView.classList.remove("hidden");
  detailView.classList.add("hidden");
}

function showDetailView(prompt) {
  selectedPrompt = prompt;
  loginView.classList.add("hidden");
  mainView.classList.add("hidden");
  detailView.classList.remove("hidden");

  detailTitle.textContent = prompt.title;
  detailContent.textContent = prompt.content;

  // Template variable fields
  templateFields.innerHTML = "";
  templateFields.classList.add("hidden");

  if (prompt.is_template && prompt.template_variables && prompt.template_variables.length > 0) {
    templateFields.classList.remove("hidden");
    for (const v of prompt.template_variables) {
      const label = document.createElement("label");
      label.textContent = v;
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `Enter ${v}...`;
      input.dataset.variable = v;
      input.addEventListener("input", updatePreview);
      templateFields.appendChild(label);
      templateFields.appendChild(input);
    }
  }
}

function updatePreview() {
  if (!selectedPrompt) return;
  let content = selectedPrompt.content;
  const inputs = templateFields.querySelectorAll("input");
  inputs.forEach((input) => {
    const varName = input.dataset.variable;
    const value = input.value || `{{${varName}}}`;
    content = content.replaceAll(`{{${varName}}}`, value);
  });
  detailContent.textContent = content;
}

function getFilledContent() {
  return detailContent.textContent;
}

// ─── Prompts ───
let activeFilter = "all";

async function loadPrompts(query = "") {
  const session = await getSession();
  if (!session) return;

  promptList.innerHTML = '<div class="loading">Loading prompts...</div>';
  setStatus("Fetching prompts...");

  try {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeFilter === "templates") params.set("templates", "true");

    const res = await fetch(
      `${session.serverUrl}${API_ENDPOINTS.prompts}?${params}`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );

    if (res.status === 401) {
      handleLogout();
      return;
    }

    const data = await res.json();
    currentPrompts = data.prompts || [];

    if (activeFilter === "favorites") {
      currentPrompts.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
      currentPrompts = currentPrompts.slice(0, 10);
    }

    renderPrompts();
    setStatus(`${currentPrompts.length} prompt${currentPrompts.length !== 1 ? "s" : ""}`);
  } catch (err) {
    promptList.innerHTML = '<div class="empty-state"><p>Failed to load prompts</p></div>';
    setStatus("Error loading prompts");
  }
}

function renderPrompts() {
  if (currentPrompts.length === 0) {
    promptList.innerHTML = '<div class="empty-state"><p>No prompts found</p></div>';
    return;
  }

  promptList.innerHTML = currentPrompts
    .map(
      (p) => `
    <div class="prompt-card" data-id="${p.id}">
      <div class="prompt-card-title">
        ${p.title}
        ${p.is_template ? '<span class="badge-template">Template</span>' : ""}
      </div>
      <div class="prompt-card-desc">${p.description || p.content.slice(0, 80)}</div>
      ${
        p.tags && p.tags.length > 0
          ? `<div>${p.tags.slice(0, 3).map((t) => `<span class="tag">${t}</span>`).join("")}</div>`
          : ""
      }
    </div>
  `
    )
    .join("");

  // Attach click handlers
  promptList.querySelectorAll(".prompt-card").forEach((card) => {
    card.addEventListener("click", () => {
      const prompt = currentPrompts.find((p) => p.id === card.dataset.id);
      if (prompt) showDetailView(prompt);
    });
  });
}

// ─── Search ───
let searchTimeout;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadPrompts(searchInput.value.trim());
  }, 300);
});

// ─── Tabs ───
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeFilter = tab.dataset.filter;
    loadPrompts(searchInput.value.trim());
  });
});

// ─── Detail Actions ───
backBtn.addEventListener("click", () => {
  showMainView();
  selectedPrompt = null;
});

copyBtn.addEventListener("click", async () => {
  const content = getFilledContent();
  await navigator.clipboard.writeText(content);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy to Clipboard"), 1500);

  // Log usage
  logConversation(content, "clipboard");
});

insertBtn.addEventListener("click", async () => {
  const content = getFilledContent();

  // Send to active tab's content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "INSERT_PROMPT", content });
    insertBtn.textContent = "Inserted!";
    setTimeout(() => (insertBtn.textContent = "Insert into AI Tool"), 1500);

    // Log usage
    logConversation(content, "insert");
  }
});

// ─── Logging ───
async function logConversation(promptText, method) {
  const session = await getSession();
  if (!session || !selectedPrompt) return;

  try {
    // Detect current AI tool from active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const aiTool = detectAiTool(tab?.url || "");

    await fetch(`${session.serverUrl}${API_ENDPOINTS.log}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        ai_tool: aiTool,
        prompt_text: promptText,
        prompt_id: selectedPrompt.id,
        action: "sent",
        metadata: { method, source: "extension" },
      }),
    });
  } catch {
    // Non-critical — don't block the user
  }
}

function detectAiTool(url) {
  if (url.includes("chat.openai.com") || url.includes("chatgpt.com")) return "chatgpt";
  if (url.includes("claude.ai")) return "claude";
  if (url.includes("gemini.google.com")) return "gemini";
  if (url.includes("copilot.microsoft.com") || url.includes("github.com/copilot")) return "copilot";
  if (url.includes("perplexity.ai")) return "perplexity";
  return "other";
}

// ─── Status ───
function setStatus(text) {
  statusText.textContent = text;
}
