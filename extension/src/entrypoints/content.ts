// TeamPrompt Extension — Content Script
// Runs on AI tool pages. Handles: DLP scanning, prompt insertion, interaction logging, shield indicator.

import { detectAiTool, insertIntoAiTool } from "../lib/ai-tools";
import { scanOutbound, type ScanResult } from "../lib/scanner";
import { fetchSecurityStatus } from "../lib/security-status";
import { logInteraction } from "../lib/logging";
import { getSession } from "../lib/auth";
import "../styles/content.css";

// Flag to allow re-dispatched Enter key to pass through without re-scanning
let _tpAllowNext = false;

// Track shield indicator state
let _shieldEl: HTMLElement | null = null;
let _shieldStatusEl: HTMLElement | null = null;
let _shieldDotEl: HTMLElement | null = null;
let _shieldLabelEl: HTMLElement | null = null;
let _shieldCollapsed = false;
let _ruleCount = 0;
let _isProtected = false;
let _isAuthenticated = false;

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
    // ─── Initialize Shield Indicator ───
    initShieldIndicator();

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

    // ─── DLP Monitoring (Fixed: synchronous block, async scan, re-dispatch) ───
    document.addEventListener(
      "keydown",
      (e) => {
        // If this is our re-dispatched event, let it through
        if (_tpAllowNext) {
          _tpAllowNext = false;
          return;
        }

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

            // ALWAYS block synchronously, then scan async
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            updateShieldScanning(true);

            scanOutbound(text).then((result) => {
              updateShieldScanning(false);

              if (result?.action === "block") {
                showBlockOverlay(result.violations);
                logInteraction(text, "blocked", result.violations);
                pulseShield("block");
                return;
              }

              if (result?.action === "warn") {
                showWarningBanner(result.violations);
                logInteraction(text, "warned", result.violations);
                pulseShield("warn");
              } else {
                logInteraction(text, "sent", []);
              }

              // Re-dispatch the Enter key to actually send the message
              reDispatchEnter(target);
            }).catch(() => {
              // Scan failed (network error) — allow the message through
              updateShieldScanning(false);
              reDispatchEnter(target);
            });
          }
        }
      },
      true // capture phase — fires before AI client handlers
    );
  },
});

// ─── Re-dispatch Enter key after scan ───

function reDispatchEnter(target: HTMLElement) {
  _tpAllowNext = true;
  const syntheticDown = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(syntheticDown);

  // Some AI clients also need keyup
  const syntheticUp = new KeyboardEvent("keyup", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(syntheticUp);

  // Fallback: if synthetic events don't trigger submit, try clicking send button
  setTimeout(() => {
    // If the text is still in the input after 200ms, try the send button
    const text =
      (target as HTMLInputElement).value ||
      target.textContent ||
      target.innerText ||
      "";
    if (text.trim().length > 0) {
      clickSendButton();
    }
  }, 200);
}

function clickSendButton() {
  const tool = detectAiTool(window.location.href);

  const selectors: string[] = [];
  switch (tool) {
    case "chatgpt":
      selectors.push(
        'button[data-testid="send-button"]',
        'button[aria-label="Send prompt"]',
        'form button[type="submit"]'
      );
      break;
    case "claude":
      selectors.push(
        'button[aria-label="Send Message"]',
        'button[aria-label="Send message"]',
        'fieldset button:last-of-type'
      );
      break;
    case "gemini":
      selectors.push(
        'button[aria-label="Send message"]',
        'button.send-button',
        'mat-icon-button[aria-label="Send message"]'
      );
      break;
    case "copilot":
      selectors.push(
        'button[aria-label="Submit"]',
        'button.submit-button'
      );
      break;
    case "perplexity":
      selectors.push(
        'button[aria-label="Submit"]',
        'button[type="submit"]'
      );
      break;
  }

  // Generic fallbacks
  selectors.push(
    'button[type="submit"]',
    'button[data-testid*="send"]',
    'button[aria-label*="send" i]',
    'button[aria-label*="submit" i]'
  );

  for (const sel of selectors) {
    const btn = document.querySelector<HTMLButtonElement>(sel);
    if (btn && !btn.disabled) {
      btn.click();
      return;
    }
  }
}

// ─── Shield Indicator ───

async function initShieldIndicator() {
  // Check auth status
  const session = await getSession();
  _isAuthenticated = !!session;

  if (_isAuthenticated) {
    const status = await fetchSecurityStatus();
    if (status) {
      _isProtected = status.protected;
      _ruleCount = status.activeRuleCount;
    }
  }

  createShieldElement();
}

function createShieldElement() {
  document.getElementById("tp-shield-indicator")?.remove();

  const tool = detectAiTool(window.location.href);
  const toolLabel = tool === "other" ? "AI Tool" : tool.charAt(0).toUpperCase() + tool.slice(1);

  const shield = document.createElement("div");
  shield.id = "tp-shield-indicator";
  shield.className = "tp-shield";

  if (!_isAuthenticated) {
    shield.classList.add("tp-shield-inactive");
  } else if (_isProtected) {
    shield.classList.add("tp-shield-protected");
  } else {
    shield.classList.add("tp-shield-unprotected");
  }

  // Shield icon (SVG)
  const shieldSvg = `<svg class="tp-shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

  // Status dot
  const dotClass = !_isAuthenticated
    ? "tp-dot-gray"
    : _isProtected
      ? "tp-dot-green"
      : "tp-dot-amber";

  // Status text
  let statusText = "";
  if (!_isAuthenticated) {
    statusText = "Not signed in";
  } else if (_isProtected) {
    statusText = `${_ruleCount} rule${_ruleCount !== 1 ? "s" : ""} active`;
  } else {
    statusText = "No rules configured";
  }

  shield.innerHTML = `
    ${shieldSvg}
    <span class="tp-shield-dot ${dotClass}" id="tp-shield-dot"></span>
    <span class="tp-shield-status" id="tp-shield-status">
      <span class="tp-shield-label" id="tp-shield-label">${statusText}</span>
      <span class="tp-shield-tool">on ${toolLabel}</span>
    </span>
    <button class="tp-shield-toggle" id="tp-shield-toggle" title="Minimize">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
  `;

  document.body.appendChild(shield);
  _shieldEl = shield;
  _shieldStatusEl = document.getElementById("tp-shield-status");
  _shieldDotEl = document.getElementById("tp-shield-dot");
  _shieldLabelEl = document.getElementById("tp-shield-label");

  // Toggle collapse
  document.getElementById("tp-shield-toggle")!.addEventListener("click", (e) => {
    e.stopPropagation();
    _shieldCollapsed = !_shieldCollapsed;
    shield.classList.toggle("tp-shield-collapsed", _shieldCollapsed);
  });

  // Click to expand if collapsed
  shield.addEventListener("click", () => {
    if (_shieldCollapsed) {
      _shieldCollapsed = false;
      shield.classList.remove("tp-shield-collapsed");
    }
  });
}

function updateShieldScanning(scanning: boolean) {
  if (!_shieldEl || !_shieldLabelEl || !_shieldDotEl) return;

  if (scanning) {
    _shieldEl.classList.add("tp-shield-scanning");
    _shieldDotEl.className = "tp-shield-dot tp-dot-blue tp-dot-pulse";
    _shieldLabelEl.textContent = "Scanning...";
  } else {
    _shieldEl.classList.remove("tp-shield-scanning");
    const dotClass = _isProtected ? "tp-dot-green" : "tp-dot-amber";
    _shieldDotEl.className = `tp-shield-dot ${dotClass}`;
    _shieldLabelEl.textContent = _isProtected
      ? `${_ruleCount} rule${_ruleCount !== 1 ? "s" : ""} active`
      : "No rules configured";
  }
}

function pulseShield(type: "block" | "warn") {
  if (!_shieldEl) return;
  const cls = type === "block" ? "tp-shield-pulse-red" : "tp-shield-pulse-amber";
  _shieldEl.classList.add(cls);
  setTimeout(() => _shieldEl?.classList.remove(cls), 1500);
}

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
