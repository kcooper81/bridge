// TeamPrompt Extension — Content Script
// Runs on AI tool pages (ChatGPT, Claude, Gemini, etc.)
// Handles: DLP scanning outbound messages, inserting prompts

(function () {
  "use strict";

  const API_ENDPOINTS = {
    scan: "/api/extension/scan",
    log: "/api/extension/log",
  };

  // ─── Message Handler ───
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "INSERT_PROMPT") {
      insertIntoAiTool(message.content);
      sendResponse({ success: true });
    }
  });

  // ─── Insert into AI Tool's Input ───
  function insertIntoAiTool(content) {
    const selectors = [
      // ChatGPT
      "#prompt-textarea",
      'textarea[data-id="root"]',
      // Claude
      'div[contenteditable="true"].ProseMirror',
      // Gemini
      'div[contenteditable="true"].ql-editor',
      'rich-textarea textarea',
      // Copilot
      'textarea[name="searchbox"]',
      // Perplexity
      'textarea[placeholder]',
      // Generic fallbacks
      'textarea[data-testid]',
      "textarea",
      'div[contenteditable="true"]',
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
          el.focus();
          el.value = content;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          // contenteditable div
          el.focus();
          el.textContent = content;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
        showToast("Prompt inserted");
        return;
      }
    }

    showToast("Could not find input field", true);
  }

  // ─── DLP Scanner — Intercept Outbound Messages ───
  async function scanOutbound(text) {
    const session = await getSession();
    if (!session) return null;

    try {
      const res = await fetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.scan}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Monitor form submissions and Enter key presses
  function setupDlpMonitoring() {
    document.addEventListener(
      "keydown",
      async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          const target = e.target;
          if (
            target.tagName === "TEXTAREA" ||
            target.tagName === "INPUT" ||
            target.contentEditable === "true"
          ) {
            const text =
              target.value || target.textContent || target.innerText || "";
            if (text.trim().length < 10) return; // Skip trivial messages

            const result = await scanOutbound(text);
            if (result && result.action === "block") {
              e.preventDefault();
              e.stopPropagation();
              showBlockOverlay(result.violations);

              // Log as blocked
              logInteraction(text, "blocked", result.violations);
              return;
            }

            if (result && result.action === "warn") {
              showWarningBanner(result.violations);
              logInteraction(text, "warned", result.violations);
            } else if (result && result.action === "allow") {
              logInteraction(text, "sent", []);
            }
          }
        }
      },
      true
    );
  }

  // ─── Log Interaction ───
  async function logInteraction(text, action, violations) {
    const session = await getSession();
    if (!session) return;

    const url = window.location.href;
    const aiTool = detectAiTool(url);

    try {
      await fetch(`${CONFIG.SITE_URL}${API_ENDPOINTS.log}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          ai_tool: aiTool,
          prompt_text: text.slice(0, 2000),
          action,
          guardrail_flags: violations,
          metadata: { url, source: "content_script" },
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
    if (url.includes("copilot.microsoft.com") || url.includes("github.com/copilot"))
      return "copilot";
    if (url.includes("perplexity.ai")) return "perplexity";
    return "other";
  }

  // ─── UI Elements ───
  function showToast(message, isError = false) {
    const existing = document.getElementById("tp-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "tp-toast";
    toast.textContent = message;
    toast.className = `tp-toast ${isError ? "tp-toast-error" : ""}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  function showBlockOverlay(violations) {
    const existing = document.getElementById("tp-block-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "tp-block-overlay";
    overlay.className = "tp-block-overlay";
    overlay.innerHTML = `
      <div class="tp-block-card">
        <div class="tp-block-icon">&#x1f6d1;</div>
        <h3>Message Blocked by TeamPrompt</h3>
        <p>Sensitive data was detected in your message:</p>
        <ul>
          ${violations.map((v) => `<li><strong>${v.ruleName}</strong>: ${v.matchedText}</li>`).join("")}
        </ul>
        <p class="tp-block-hint">Remove the flagged content and try again.</p>
        <button id="tp-block-dismiss" class="tp-block-btn">Got it</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("tp-block-dismiss").addEventListener("click", () => overlay.remove());
  }

  function showWarningBanner(violations) {
    const existing = document.getElementById("tp-warning-banner");
    if (existing) existing.remove();

    const banner = document.createElement("div");
    banner.id = "tp-warning-banner";
    banner.className = "tp-warning-banner";
    banner.innerHTML = `
      <span>&#x26a0;&#xfe0f; TeamPrompt: ${violations.length} warning(s) — ${violations.map((v) => v.ruleName).join(", ")}</span>
      <button id="tp-warning-dismiss">Dismiss</button>
    `;
    document.body.appendChild(banner);
    document.getElementById("tp-warning-dismiss").addEventListener("click", () => banner.remove());
    setTimeout(() => banner.remove(), 8000);
  }

  // ─── Session ───
  async function getSession() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["accessToken"], (data) => {
        if (data.accessToken) resolve(data);
        else resolve(null);
      });
    });
  }

  // ─── Init ───
  setupDlpMonitoring();
})();
