// TeamPrompt Extension — Shared UI Module
// Used by both popup.js and sidepanel.js

const TeamPromptUI = (function () {
  const API_ENDPOINTS = {
    prompts: "/api/extension/prompts",
    scan: "/api/extension/scan",
    log: "/api/extension/log",
  };

  let currentPrompts = [];
  let selectedPrompt = null;
  let activeFilter = "all";
  let searchTimeout;
  let elements = {};

  // ─── Auth ───

  async function getSession() {
    const data = await chrome.storage.local.get(["accessToken"]);
    if (data.accessToken) return data;
    return null;
  }

  async function handleLogin() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value;

    if (!email || !password) {
      elements.loginError.textContent = "Email and password are required";
      return;
    }

    elements.loginBtn.disabled = true;
    elements.loginBtn.textContent = "Signing in...";
    elements.loginError.textContent = "";

    try {
      const res = await fetch(
        `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: CONFIG.SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error_description || data.msg || "Login failed");
      }

      const data = await res.json();
      await chrome.storage.local.set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: { id: data.user.id, email: data.user.email },
      });

      showMainView();
      loadPrompts();
    } catch (err) {
      elements.loginError.textContent = err.message;
    } finally {
      elements.loginBtn.disabled = false;
      elements.loginBtn.textContent = "Sign In";
    }
  }

  async function handleLogout() {
    await chrome.storage.local.remove(["accessToken", "refreshToken", "user"]);
    showLoginView();
  }

  // ─── Views ───

  function showLoginView() {
    elements.loginView.classList.remove("hidden");
    elements.mainView.classList.add("hidden");
    elements.detailView.classList.add("hidden");
  }

  function showMainView() {
    elements.loginView.classList.add("hidden");
    elements.mainView.classList.remove("hidden");
    elements.detailView.classList.add("hidden");
  }

  function showDetailView(prompt) {
    selectedPrompt = prompt;
    elements.loginView.classList.add("hidden");
    elements.mainView.classList.add("hidden");
    elements.detailView.classList.remove("hidden");

    elements.detailTitle.textContent = prompt.title;
    elements.detailContent.textContent = prompt.content;

    // Template variable fields
    elements.templateFields.innerHTML = "";
    elements.templateFields.classList.add("hidden");

    if (
      prompt.is_template &&
      prompt.template_variables &&
      prompt.template_variables.length > 0
    ) {
      elements.templateFields.classList.remove("hidden");
      for (const v of prompt.template_variables) {
        const label = document.createElement("label");
        label.textContent = v;
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Enter ${v}...`;
        input.dataset.variable = v;
        input.addEventListener("input", updatePreview);
        elements.templateFields.appendChild(label);
        elements.templateFields.appendChild(input);
      }
    }
  }

  function updatePreview() {
    if (!selectedPrompt) return;
    let content = selectedPrompt.content;
    const inputs = elements.templateFields.querySelectorAll("input");
    inputs.forEach((input) => {
      const varName = input.dataset.variable;
      const value = input.value || `{{${varName}}}`;
      content = content.replaceAll(`{{${varName}}}`, value);
    });
    elements.detailContent.textContent = content;
  }

  function getFilledContent() {
    return elements.detailContent.textContent;
  }

  // ─── Prompts ───

  async function loadPrompts(query = "") {
    const session = await getSession();
    if (!session) return;

    elements.promptList.innerHTML =
      '<div class="loading">Loading prompts...</div>';
    setStatus("Fetching prompts...");

    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (activeFilter === "templates") params.set("templates", "true");

      const res = await fetch(
        `${CONFIG.SITE_URL}${API_ENDPOINTS.prompts}?${params}`,
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
        currentPrompts.sort(
          (a, b) => (b.usage_count || 0) - (a.usage_count || 0)
        );
        currentPrompts = currentPrompts.slice(0, 10);
      }

      renderPrompts();
      setStatus(
        `${currentPrompts.length} prompt${currentPrompts.length !== 1 ? "s" : ""}`
      );
    } catch (err) {
      elements.promptList.innerHTML =
        '<div class="empty-state"><p>Failed to load prompts</p></div>';
      setStatus("Error loading prompts");
    }
  }

  function renderPrompts() {
    if (currentPrompts.length === 0) {
      elements.promptList.innerHTML =
        '<div class="empty-state"><p>No prompts found</p></div>';
      return;
    }

    elements.promptList.innerHTML = currentPrompts
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
    elements.promptList.querySelectorAll(".prompt-card").forEach((card) => {
      card.addEventListener("click", () => {
        const prompt = currentPrompts.find((p) => p.id === card.dataset.id);
        if (prompt) showDetailView(prompt);
      });
    });
  }

  // ─── Logging ───

  async function logConversation(promptText, method) {
    const session = await getSession();
    if (!session || !selectedPrompt) return;

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const aiTool = detectAiTool(tab?.url || "");

      await fetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.log}`, {
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
      // Non-critical
    }
  }

  function detectAiTool(url) {
    if (url.includes("chat.openai.com") || url.includes("chatgpt.com"))
      return "chatgpt";
    if (url.includes("claude.ai")) return "claude";
    if (url.includes("gemini.google.com")) return "gemini";
    if (
      url.includes("copilot.microsoft.com") ||
      url.includes("github.com/copilot")
    )
      return "copilot";
    if (url.includes("perplexity.ai")) return "perplexity";
    return "other";
  }

  // ─── Status ───

  function setStatus(text) {
    if (elements.statusText) {
      elements.statusText.textContent = text;
    }
  }

  // ─── Init ───

  function init(els) {
    elements = els;

    // Auth handlers
    elements.loginBtn.addEventListener("click", handleLogin);
    elements.logoutBtn.addEventListener("click", handleLogout);
    elements.webLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: CONFIG.SITE_URL });
    });

    // Search
    elements.searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadPrompts(elements.searchInput.value.trim());
      }, 300);
    });

    // Tabs
    elements.mainView.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        elements.mainView
          .querySelectorAll(".tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        activeFilter = tab.dataset.filter;
        loadPrompts(elements.searchInput.value.trim());
      });
    });

    // Detail actions
    elements.backBtn.addEventListener("click", () => {
      showMainView();
      selectedPrompt = null;
    });

    elements.copyBtn.addEventListener("click", async () => {
      const content = getFilledContent();
      await navigator.clipboard.writeText(content);
      elements.copyBtn.textContent = "Copied!";
      setTimeout(() => (elements.copyBtn.textContent = "Copy to Clipboard"), 1500);
      logConversation(content, "clipboard");
    });

    elements.insertBtn.addEventListener("click", async () => {
      const content = getFilledContent();
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: "INSERT_PROMPT", content });
        elements.insertBtn.textContent = "Inserted!";
        setTimeout(
          () => (elements.insertBtn.textContent = "Insert into AI Tool"),
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

  return { init };
})();
