// TeamPrompt Extension — Content Script
// Runs on AI tool pages. Handles: DLP scanning, prompt insertion, interaction logging.

import { insertIntoAiTool } from "../lib/ai-tools";
import { scanOutbound, type ScanResult } from "../lib/scanner";
import { logInteraction } from "../lib/logging";
import "../styles/content.css";

export default defineContentScript({
  matches: [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
    "https://copilot.microsoft.com/*",
    "https://www.perplexity.ai/*",
  ],
  runAt: "document_idle",

  main() {
    // ─── Message Handler ───
    browser.runtime.onMessage.addListener(
      (message: { type: string; content?: string }, _sender, sendResponse) => {
        if (message.type === "INSERT_PROMPT" && message.content) {
          const success = insertIntoAiTool(message.content);
          showToast(success ? "Prompt inserted" : "Could not find input field", !success);
          sendResponse({ success });
        }
      }
    );

    // ─── DLP Monitoring ───
    document.addEventListener(
      "keydown",
      async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          const target = e.target as HTMLElement;
          if (
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLInputElement ||
            target.contentEditable === "true"
          ) {
            const text =
              (target as HTMLInputElement).value ||
              target.textContent ||
              target.innerText ||
              "";
            if (text.trim().length < 10) return;

            const result = await scanOutbound(text);
            if (result?.action === "block") {
              e.preventDefault();
              e.stopPropagation();
              showBlockOverlay(result.violations);
              logInteraction(text, "blocked", result.violations);
              return;
            }

            if (result?.action === "warn") {
              showWarningBanner(result.violations);
              logInteraction(text, "warned", result.violations);
            } else if (result?.action === "allow") {
              logInteraction(text, "sent", []);
            }
          }
        }
      },
      true
    );
  },
});

// ─── UI Helpers ───

function showToast(message: string, isError = false) {
  document.getElementById("tp-toast")?.remove();

  const toast = document.createElement("div");
  toast.id = "tp-toast";
  toast.textContent = message;
  toast.className = `tp-toast ${isError ? "tp-toast-error" : ""}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function showBlockOverlay(violations: ScanResult["violations"]) {
  document.getElementById("tp-block-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "tp-block-overlay";
  overlay.className = "tp-block-overlay";
  overlay.innerHTML = `
    <div class="tp-block-card">
      <div class="tp-block-icon">&#x1f6d1;</div>
      <h3>Message Blocked by TeamPrompt</h3>
      <p>Sensitive data was detected in your message:</p>
      <ul>
        ${violations.map((v) => `<li><strong>${escapeHtml(v.ruleName)}</strong>: ${escapeHtml(v.matchedText)}</li>`).join("")}
      </ul>
      <p class="tp-block-hint">Remove the flagged content and try again.</p>
      <button id="tp-block-dismiss" class="tp-block-btn">Got it</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document
    .getElementById("tp-block-dismiss")!
    .addEventListener("click", () => overlay.remove());
}

function showWarningBanner(violations: ScanResult["violations"]) {
  document.getElementById("tp-warning-banner")?.remove();

  const banner = document.createElement("div");
  banner.id = "tp-warning-banner";
  banner.className = "tp-warning-banner";
  banner.innerHTML = `
    <span>&#x26a0;&#xfe0f; TeamPrompt: ${violations.length} warning(s) — ${violations.map((v) => escapeHtml(v.ruleName)).join(", ")}</span>
    <button id="tp-warning-dismiss">Dismiss</button>
  `;
  document.body.appendChild(banner);
  document
    .getElementById("tp-warning-dismiss")!
    .addEventListener("click", () => banner.remove());
  setTimeout(() => banner.remove(), 8000);
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
