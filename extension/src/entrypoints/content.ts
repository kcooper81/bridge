// TeamPrompt Extension — Content Script
// Runs on AI tool pages. Handles: DLP scanning, prompt insertion, interaction logging, shield indicator.

import { detectAiTool, insertIntoAiTool } from "../lib/ai-tools";
import { scanOutbound, type ScanResult } from "../lib/scanner";
import { fetchSecurityStatus } from "../lib/security-status";
import { logInteraction } from "../lib/logging";
import { getSession } from "../lib/auth";

import "../styles/content.css";

// Selectors that specifically target AI chat input fields (not generic inputs like rename/search)
const CHAT_INPUT_SELECTORS = [
  "#prompt-textarea",                           // ChatGPT
  'textarea[data-id="root"]',                  // ChatGPT (older)
  'div[contenteditable="true"].ProseMirror',   // Claude
  'div[contenteditable="true"].ql-editor',     // Gemini
  "rich-textarea textarea",                     // Gemini (alternate)
  'textarea[name="searchbox"]',                // Copilot
  'textarea[placeholder*="Ask"]',              // Perplexity
];

function isChatInput(target: HTMLElement): boolean {
  for (const selector of CHAT_INPUT_SELECTORS) {
    try {
      if (target.matches(selector) || target.closest(selector)) return true;
    } catch { /* invalid selector in matches() */ }
  }
  return false;
}

// Send button selectors for click-to-send DLP interception
const SEND_BUTTON_SELECTORS = [
  'button[data-testid="send-button"]',       // ChatGPT
  'button[aria-label="Send prompt"]',         // ChatGPT
  'button[aria-label="Send Message"]',        // Claude
  'button[aria-label="Send message"]',        // Claude / Gemini
  'button.send-button',                       // Gemini
  'button[aria-label="Submit"]',              // Copilot / Perplexity
  'button[data-testid*="send"]',              // Generic
];

function isSendButton(target: HTMLElement): HTMLElement | null {
  for (const selector of SEND_BUTTON_SELECTORS) {
    try {
      if (target.matches(selector)) return target;
      const match = target.closest<HTMLElement>(selector);
      if (match) return match;
    } catch { /* invalid selector */ }
  }
  return null;
}

function getChatInputText(): string {
  for (const selector of CHAT_INPUT_SELECTORS) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      const text = (el as HTMLInputElement).value || el.textContent || el.innerText || "";
      if (text.trim()) return text;
    }
  }
  return "";
}

function setChatInputText(text: string): void {
  for (const selector of CHAT_INPUT_SELECTORS) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) continue;
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      // Native setter to trigger React-style onChange
      const nativeSetter = Object.getOwnPropertyDescriptor(
        el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        "value"
      )?.set;
      if (nativeSetter) nativeSetter.call(el, text);
      else el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    // contentEditable element
    el.textContent = text;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
}

// Flag to allow re-dispatched Enter key to pass through without re-scanning
let _tpAllowNext = false;

// Flag to allow re-dispatched click to pass through without re-scanning
let _tpAllowNextClick = false;

// Track last blocked text to prevent double-Enter bypass
let _lastBlockedText: string | null = null;

// Track shield indicator state
let _shieldEl: HTMLElement | null = null;
let _shieldStatusEl: HTMLElement | null = null;
let _shieldLabelEl: HTMLElement | null = null;
let _shieldDetailTextEl: HTMLElement | null = null;
let _shieldCollapsed = true; // Start minimized — just the logo
let _ruleCount = 0;
let _isProtected = false;
let _isDisabled = false;
let _isAuthenticated = false;
let _isOnline = navigator.onLine;

// Track current URL for SPA navigation detection
let _currentUrl = location.href;

// Debounce timer for shield refresh
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Context Invalidation Guard ───
// When the extension is reloaded/updated, all browser.* APIs throw.
// This flag stops ALL activity immediately to prevent console spam.
let _contextDead = false;
let _refreshIntervalId: ReturnType<typeof setInterval> | null = null;
let _pingIntervalId: ReturnType<typeof setInterval> | null = null;

function killContentScript() {
  if (_contextDead) return;
  _contextDead = true;
  if (_refreshIntervalId) clearInterval(_refreshIntervalId);
  if (_pingIntervalId) clearInterval(_pingIntervalId);
  _refreshIntervalId = null;
  _pingIntervalId = null;
  // Remove ALL injected UI — no overlays, banners, or shield when extension is dead
  removeAllInjectedUI();
}

/** Remove every DOM element injected by the content script. */
function removeAllInjectedUI() {
  const ids = [
    "tp-shield-indicator",
    "tp-block-overlay",
    "tp-scan-block-overlay",
    "tp-warning-banner",
    "tp-session-banner",
    "tp-reload-banner",
    "tp-toast",
  ];
  for (const id of ids) {
    document.getElementById(id)?.remove();
  }
  _shieldEl = null;
  _shieldStatusEl = null;
  _shieldLabelEl = null;
  _shieldDetailTextEl = null;
}

/** Returns true if the extension context is dead (all browser.* calls will throw). */
function isContextDead(): boolean {
  if (_contextDead) return true;
  // Cheap check: browser.runtime.id is undefined when context is invalidated
  try {
    if (!browser.runtime?.id) {
      killContentScript();
      return true;
    }
  } catch {
    killContentScript();
    return true;
  }
  return false;
}

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
    // Guard: if context is already invalidated at startup, bail out silently
    if (!browser.runtime?.id) return;

    // ─── Global Safety Net for Context Invalidation ───
    // Catch unhandled promise rejections from browser.* APIs after extension
    // update/reload so they don't spam the console.
    window.addEventListener("unhandledrejection", (e) => {
      if (
        e.reason instanceof Error &&
        (e.reason.message.includes("Extension context invalidated") ||
         e.reason.message.includes("Receiving end does not exist"))
      ) {
        e.preventDefault(); // suppress console error
        if (!_contextDead) killContentScript();
      }
    });

    // ─── Initialize Shield Indicator ───
    initShieldIndicator();

    // ─── Auth Change Listener (Fix 2) ───
    browser.storage.onChanged.addListener((changes, area) => {
      if (isContextDead()) return;
      if (area !== "local" || !changes.accessToken) return;
      if (changes.accessToken.newValue) {
        _isAuthenticated = true;
        hideSessionLossBanner();
        refreshShieldStatus();
      } else if (!changes.accessToken.newValue && changes.accessToken.oldValue) {
        _isAuthenticated = false;
        _isProtected = false;
        _ruleCount = 0;
        showSessionLossBanner();
        updateShieldState();
      }
    });

    // ─── Offline Detection (Fix 5) ───
    window.addEventListener("online", () => {
      if (_contextDead) return;
      _isOnline = true;
      if (_isAuthenticated) {
        refreshShieldStatus();
      } else {
        updateShieldState();
      }
    });

    window.addEventListener("offline", () => {
      if (_contextDead) return;
      _isOnline = false;
      updateShieldState();
    });

    // ─── SPA Navigation Detection (Fix 7) ───
    const origPushState = history.pushState.bind(history);
    const origReplaceState = history.replaceState.bind(history);

    history.pushState = function (...args: Parameters<typeof history.pushState>) {
      origPushState(...args);
      onUrlChange();
    };

    history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
      origReplaceState(...args);
      onUrlChange();
    };

    window.addEventListener("popstate", () => onUrlChange());

    // Periodic refresh every 60 seconds (fast enough to catch rule changes)
    _refreshIntervalId = setInterval(() => {
      if (isContextDead()) return;
      if (_isAuthenticated && _isOnline) {
        refreshShieldStatus();
      }
    }, 60 * 1000);

    // ─── Proactive Context Invalidation Check ───
    // Check every 5 seconds so errors stop quickly after extension reload
    _pingIntervalId = setInterval(() => {
      if (_contextDead) { // Don't call isContextDead() to avoid recursion
        if (_pingIntervalId) clearInterval(_pingIntervalId);
        return;
      }
      try {
        if (!browser.runtime?.id) {
          killContentScript();
          return;
        }
      } catch {
        killContentScript();
        return;
      }
      try {
        browser.runtime.sendMessage({ type: "PING" }).catch(() => {
          killContentScript();
        });
      } catch {
        killContentScript();
      }
    }, 5_000);

    // ─── Message Handler ───
    browser.runtime.onMessage.addListener(
      (message: { type: string; content?: string }, _sender, sendResponse) => {
        if (isContextDead()) return;
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
        // If context is dead, let everything through — don't block user
        if (_contextDead) return;

        // If this is our re-dispatched event, let it through
        if (_tpAllowNext) {
          _tpAllowNext = false;
          return;
        }

        if (e.key === "Enter" && !e.shiftKey) {
          const target = e.target as HTMLElement;
          // Only intercept Enter on known AI chat input fields, not rename/search inputs
          if (isChatInput(target)) {
            const text =
              (target as HTMLInputElement).value ||
              target.textContent ||
              target.innerText ||
              "";
            if (text.trim().length < 1) {
              return;
            }

            // ALWAYS block synchronously, then scan async
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            performScan(text, () => reDispatchEnter(target));
          }
        }
      },
      true // capture phase — fires before AI client handlers
    );

    // ─── DLP: Click-to-Send Interception (prevents bypassing Enter-key scan) ───
    document.addEventListener(
      "click",
      (e) => {
        if (_contextDead) return;
        if (_tpAllowNextClick) {
          _tpAllowNextClick = false;
          return;
        }

        const target = e.target as HTMLElement;
        const sendBtn = isSendButton(target);
        if (!sendBtn) return;

        const text = getChatInputText();
        if (!text || text.trim().length < 1) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        performScan(text, () => {
          _tpAllowNextClick = true;
          setTimeout(() => { _tpAllowNextClick = false; }, 100);
          sendBtn.click();
        });
      },
      true // capture phase
    );

    // Clear blocked text tracking when user edits input
    document.addEventListener("input", () => { _lastBlockedText = null; }, true);
  },
});

// ─── SPA Navigation Handler (Fix 7) ───

function onUrlChange() {
  if (_contextDead) return;
  const newUrl = location.href;
  if (newUrl === _currentUrl) return;
  _currentUrl = newUrl;

  if (_isAuthenticated && _isOnline) {
    debouncedRefreshShieldStatus();
  }
}

function debouncedRefreshShieldStatus() {
  if (_refreshTimer) clearTimeout(_refreshTimer);
  _refreshTimer = setTimeout(() => {
    refreshShieldStatus();
  }, 500);
}

// ─── Shield State Management (Fix 2) ───

async function refreshShieldStatus() {
  if (_contextDead) return;
  try {
    const status = await fetchSecurityStatus();
    if (_contextDead) return;
    if (status) {
      _isProtected = status.protected;
      _ruleCount = status.activeRuleCount;
      _isDisabled = status.disabled ?? false;
    }
    updateShieldState();
  } catch {
    // Context likely invalidated — stop silently
    if (!_contextDead) killContentScript();
  }
}

function updateShieldState() {
  if (!_shieldEl || !_shieldLabelEl) return;

  // Remove all state classes
  _shieldEl.classList.remove(
    "tp-shield-inactive",
    "tp-shield-protected",
    "tp-shield-unprotected",
    "tp-shield-offline",
    "tp-shield-invalidated",
    "tp-shield-disabled"
  );

  if (_contextDead) {
    _shieldEl.classList.add("tp-shield-invalidated");
    _shieldLabelEl.textContent = "Reload Required";
    if (_shieldDetailTextEl) _shieldDetailTextEl.textContent = "Extension updated";
    return;
  }

  if (!_isOnline) {
    _shieldEl.classList.add("tp-shield-offline");
    _shieldLabelEl.textContent = "Offline";
    if (_shieldDetailTextEl) _shieldDetailTextEl.textContent = "Scans paused";
    return;
  }

  if (_isDisabled) {
    _shieldEl.classList.add("tp-shield-disabled");
    _shieldLabelEl.textContent = "Guardrails Disabled";
    if (_shieldDetailTextEl) _shieldDetailTextEl.textContent = "Disabled by admin";
    return;
  }

  if (!_isAuthenticated) {
    _shieldEl.classList.add("tp-shield-inactive");
    _shieldLabelEl.textContent = "Not Connected";
    if (_shieldDetailTextEl) _shieldDetailTextEl.textContent = "Click to sign in";
    return;
  }

  if (_isProtected) {
    _shieldEl.classList.add("tp-shield-protected");
    _shieldLabelEl.textContent = "Guardrails Active";
    if (_shieldDetailTextEl) _shieldDetailTextEl.textContent = "Protected by";
  } else {
    _shieldEl.classList.add("tp-shield-unprotected");
    _shieldLabelEl.textContent = "No Guardrails";
    if (_shieldDetailTextEl) _shieldDetailTextEl.textContent = "Powered by";
  }
}

// ─── Re-dispatch Enter key after scan ───

function reDispatchEnter(target: HTMLElement) {
  _tpAllowNext = true;
  // Safety net: reset flag if synthetic event doesn't trigger our capture handler
  setTimeout(() => { _tpAllowNext = false; }, 100);
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

// ─── Shared DLP Scan Logic (used by Enter key and click-to-send handlers) ───

function performScan(text: string, onAllow: () => void) {
  if (_contextDead) { onAllow(); return; }
  // Shield disabled by admin — let messages through without scanning
  if (_isDisabled) { onAllow(); return; }
  // Block repeat submissions of previously blocked text
  if (_lastBlockedText !== null && text.trim() === _lastBlockedText.trim()) {
    showBlockOverlay([{ ruleId: "repeat-block", ruleName: "Previously blocked", category: "dlp", severity: "block", matchedText: "Same content was blocked moments ago", detectionType: "pattern" }]);
    return;
  }

  // Fail-closed: if not authenticated, block immediately
  if (!_isAuthenticated) {
    showSessionLossBanner();
    showScanBlockOverlay("no-auth");
    return;
  }

  // Fail-closed: if offline, block immediately
  if (!_isOnline) {
    showScanBlockOverlay("offline");
    return;
  }

  updateShieldScanning(true);

  scanOutbound(text).then((result) => {
    updateShieldScanning(false);

    if (result?.action === "block") {
      _lastBlockedText = text;
      showBlockOverlay(result.violations, result.sanitized_content, (sanitized) => {
        setChatInputText(sanitized);
        _lastBlockedText = null;
        logInteraction(text, "auto_redacted", result.violations);
      });
      logInteraction(text, "blocked", result.violations);
      pulseShield("block");
      safeSendMessage({ type: "SET_BADGE", text: "!", color: "#ef4444" });
      setTimeout(() => safeSendMessage({ type: "SET_BADGE", text: "" }), 10000);
      return;
    }

    if (result?.action === "warn") {
      showWarningBanner(result.violations);
      logInteraction(text, "warned", result.violations);
      pulseShield("warn");
      safeSendMessage({ type: "SET_BADGE", text: "!", color: "#f59e0b" });
      setTimeout(() => safeSendMessage({ type: "SET_BADGE", text: "" }), 10000);
    } else if (result === null) {
      // Fail-closed: scan returned null — determine reason and block
      const reason = _isAuthenticated ? "api-error" : "no-auth";
      showScanBlockOverlay(reason);
      logInteraction(text, "blocked", [{ ruleName: "Scan failure", category: "system", matchedText: "", action: "block" as const }]);
      return;
    } else {
      logInteraction(text, "sent", []);
    }

    onAllow();
  }).catch(() => {
    // Fail-closed: scan failed (network error) — block, don't auto-send
    updateShieldScanning(false);
    showScanBlockOverlay("api-error");
    logInteraction(text, "blocked", [{ ruleName: "Scan failure", category: "system", matchedText: "", action: "block" as const }]);
  });
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
  try {
    // Check auth status
    const session = await getSession();
    _isAuthenticated = !!session;

    if (_isAuthenticated && !_contextDead) {
      const status = await fetchSecurityStatus();
      if (status) {
        _isProtected = status.protected;
        _ruleCount = status.activeRuleCount;
        _isDisabled = status.disabled ?? false;
      }
    }
  } catch {
    // Context likely invalidated during init
    if (!_contextDead) killContentScript();
  }

  createShieldElement();

  // Start observing for user messages to add save buttons
  if (_isAuthenticated) {
    startSaveButtonObserver();
  }
}

function createShieldElement() {
  document.getElementById("tp-shield-indicator")?.remove();

  const tool = detectAiTool(window.location.href);
  const toolLabel = tool === "other" ? "AI Tool" : tool.charAt(0).toUpperCase() + tool.slice(1);

  const shield = document.createElement("div");
  shield.id = "tp-shield-indicator";
  shield.className = "tp-shield";

  // Start collapsed by default
  shield.classList.add("tp-shield-collapsed");

  if (_isDisabled) {
    shield.classList.add("tp-shield-disabled");
  } else if (!_isAuthenticated) {
    shield.classList.add("tp-shield-inactive");
  } else if (_isProtected) {
    shield.classList.add("tp-shield-protected");
  } else {
    shield.classList.add("tp-shield-unprotected");
  }

  const logoUrl = browser.runtime.getURL("/icons/icon-overlay.png");

  // Shield SVG icon — with contextual inner icon
  let shieldInner = "";
  if (_isProtected && _isAuthenticated && !_isDisabled) {
    // Checkmark inside shield
    shieldInner = `<polyline points="9 12 11 14 15 10" stroke-width="2"/>`;
  } else if (!_isAuthenticated || _isDisabled) {
    // Minus/dash inside shield
    shieldInner = `<line x1="9" y1="12" x2="15" y2="12" stroke-width="2"/>`;
  }
  const shieldSvg = `<svg class="tp-shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>${shieldInner}</svg>`;

  // Status text
  let statusText = "";
  let detailText = "";
  if (_contextDead) {
    statusText = "Reload Required";
    detailText = "Extension updated";
  } else if (!_isOnline) {
    statusText = "Offline";
    detailText = "Scans paused";
  } else if (_isDisabled) {
    statusText = "Guardrails Disabled";
    detailText = "Disabled by admin";
  } else if (!_isAuthenticated) {
    statusText = "Not Connected";
    detailText = "Click to sign in";
  } else if (_isProtected) {
    statusText = "Guardrails Active";
    detailText = "Protected by";
  } else {
    statusText = "No Guardrails";
    detailText = "Powered by";
  }

  shield.innerHTML = `
    ${shieldSvg}
    <span class="tp-shield-status" id="tp-shield-status">
      <span class="tp-shield-label" id="tp-shield-label">${statusText}</span>
      <span class="tp-shield-detail">
        <span class="tp-shield-detail-text">${detailText}</span>
        <img class="tp-shield-logo" src="${logoUrl}" alt="TeamPrompt" />
      </span>
    </span>
  `;

  document.body.appendChild(shield);
  _shieldEl = shield;
  _shieldStatusEl = document.getElementById("tp-shield-status");
  _shieldLabelEl = document.getElementById("tp-shield-label");
  _shieldDetailTextEl = shield.querySelector(".tp-shield-detail-text");

  // Click to toggle expand/collapse, or sign in if not authenticated
  shield.addEventListener("click", () => {
    if (!_isAuthenticated && !_shieldCollapsed) {
      // Already expanded and not signed in — open login
      browser.runtime.sendMessage({ type: "OPEN_LOGIN" }).catch(() => {});
      return;
    }
    _shieldCollapsed = !_shieldCollapsed;
    shield.classList.toggle("tp-shield-collapsed", _shieldCollapsed);
  });
}

function updateShieldScanning(scanning: boolean) {
  if (!_shieldEl || !_shieldLabelEl) return;

  if (scanning) {
    _shieldEl.classList.add("tp-shield-scanning");
    _shieldLabelEl.textContent = "Scanning...";
  } else {
    _shieldEl.classList.remove("tp-shield-scanning");
    updateShieldState();
  }
}

function pulseShield(type: "block" | "warn") {
  if (!_shieldEl) return;
  const cls = type === "block" ? "tp-shield-pulse-red" : "tp-shield-pulse-amber";
  _shieldEl.classList.add(cls);
  setTimeout(() => _shieldEl?.classList.remove(cls), 1500);
}

// ─── Save Prompt Button (hover on user messages) ───

const USER_MESSAGE_SELECTORS: Record<string, string> = {
  chatgpt: '[data-message-author-role="user"]',
  claude: '[data-testid="user-message"]',
  gemini: '.query-content',
  copilot: '.user-message',
  perplexity: '[data-testid="user-query"]',
};

// Fallback: try common patterns
const USER_MESSAGE_FALLBACKS = [
  '[data-message-author-role="user"]',
  '[data-testid="user-message"]',
];

let _saveObserver: MutationObserver | null = null;

function getUserMessageSelector(): string {
  const tool = detectAiTool(window.location.href);
  return USER_MESSAGE_SELECTORS[tool] || USER_MESSAGE_FALLBACKS[0];
}

function getMessageText(el: HTMLElement): string {
  // Get the text content, stripping any nested UI elements
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("button, .tp-save-btn-wrap").forEach((b) => b.remove());
  return (clone.textContent || clone.innerText || "").trim();
}

function injectSaveButtons() {
  if (!_isAuthenticated || _contextDead) return;

  const selector = getUserMessageSelector();
  const messages = document.querySelectorAll<HTMLElement>(selector);

  messages.forEach((msg) => {
    // Skip if already processed
    if (msg.dataset.tpSave) return;
    msg.dataset.tpSave = "1";

    // Make the message container position:relative for the button
    const wrapper = msg.closest("div[class]") || msg;
    if (getComputedStyle(wrapper).position === "static") {
      (wrapper as HTMLElement).classList.add("tp-save-parent");
    }

    const btnWrap = document.createElement("div");
    btnWrap.className = "tp-save-btn-wrap";
    btnWrap.innerHTML = `<button class="tp-save-btn" title="Save to TeamPrompt"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>`;

    const btn = btnWrap.querySelector("button")!;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const text = getMessageText(msg);
      if (!text || text.length < 3) return;
      // Store content and open popup window via background
      safeSendMessage({ type: "QUICK_SAVE", content: text });
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      btn.classList.add("tp-save-btn-done");
      setTimeout(() => {
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`;
        btn.classList.remove("tp-save-btn-done");
      }, 2000);
    });

    (wrapper as HTMLElement).appendChild(btnWrap);
  });
}

function startSaveButtonObserver() {
  if (_saveObserver || _contextDead) return;

  // Initial scan
  injectSaveButtons();

  // Watch for new messages
  _saveObserver = new MutationObserver(() => {
    injectSaveButtons();
  });

  _saveObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
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

function showBlockOverlay(violations: ScanResult["violations"], sanitizedContent?: string, onSendSanitized?: (text: string) => void) {
  document.getElementById("tp-block-overlay")?.remove();

  const hasSanitized = sanitizedContent && onSendSanitized;

  const overlay = document.createElement("div");
  overlay.id = "tp-block-overlay";
  overlay.className = "tp-block-overlay";
  overlay.innerHTML = `
    <div class="tp-block-card">
      <div class="tp-block-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg></div>
      <h3>Message Blocked by TeamPrompt</h3>
      <p>Sensitive data was detected in your message:</p>
      <ul>
        ${violations.map((v) => `<li><strong>${escapeHtml(v.ruleName)}</strong>: ${escapeHtml(v.matchedText)}</li>`).join("")}
      </ul>
      <p class="tp-block-hint">Remove the flagged content and try again.</p>
      <div class="tp-block-actions">
        <button id="tp-block-dismiss" class="tp-block-btn">Got it</button>
        ${hasSanitized ? `<button id="tp-block-sanitize" class="tp-block-btn tp-block-btn-sanitize">Send Sanitized Version</button>` : ""}
      </div>
      ${hasSanitized ? `
      <div id="tp-sanitized-preview" class="tp-sanitized-preview tp-hidden">
        <p class="tp-sanitized-label">Preview — sensitive data replaced with placeholders:</p>
        <pre class="tp-sanitized-content">${escapeHtml(sanitizedContent!)}</pre>
        <button id="tp-sanitized-confirm" class="tp-block-btn tp-block-btn-confirm">Confirm &amp; Insert</button>
      </div>
      ` : ""}
    </div>
  `;
  document.body.appendChild(overlay);
  document
    .getElementById("tp-block-dismiss")!
    .addEventListener("click", () => overlay.remove());

  if (hasSanitized) {
    document.getElementById("tp-block-sanitize")!.addEventListener("click", () => {
      const preview = document.getElementById("tp-sanitized-preview")!;
      preview.classList.toggle("tp-hidden");
    });
    document.getElementById("tp-sanitized-confirm")!.addEventListener("click", () => {
      overlay.remove();
      onSendSanitized!(sanitizedContent!);
    });
  }
}

function showWarningBanner(violations: ScanResult["violations"]) {
  document.getElementById("tp-warning-banner")?.remove();

  const banner = document.createElement("div");
  banner.id = "tp-warning-banner";
  banner.className = "tp-warning-banner";
  banner.innerHTML = `
    <span><svg class="tp-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> TeamPrompt: ${violations.length} warning(s) — ${violations.map((v) => escapeHtml(v.ruleName)).join(", ")}</span>
    <button id="tp-warning-dismiss">Dismiss</button>
  `;
  document.body.appendChild(banner);
  document
    .getElementById("tp-warning-dismiss")!
    .addEventListener("click", () => banner.remove());
  setTimeout(() => banner.remove(), 8000);
}

// Fail-closed: scan block overlay — no bypass path
type ScanBlockReason = "no-auth" | "api-error" | "offline" | "context-invalidated";

function showScanBlockOverlay(reason: ScanBlockReason) {
  // Context invalidated delegates to the existing reload banner
  if (reason === "context-invalidated" || _contextDead) {
    showReloadBanner();
    return;
  }

  document.getElementById("tp-scan-block-overlay")?.remove();

  const config: Record<Exclude<ScanBlockReason, "context-invalidated">, { icon: string; heading: string; detail: string; btnLabel: string; btnAction: "sign-in" | "dismiss" }> = {
    "no-auth": {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      heading: "Sign in required to send messages",
      detail: "TeamPrompt must verify your message before sending. Sign in to restore protection.",
      btnLabel: "Sign In",
      btnAction: "sign-in",
    },
    "api-error": {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>',
      heading: "Message blocked \u2014 scan failed",
      detail: "TeamPrompt could not verify this message is safe to send. Press Enter to retry.",
      btnLabel: "Retry Scan",
      btnAction: "dismiss",
    },
    "offline": {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
      heading: "Message blocked \u2014 you are offline",
      detail: "TeamPrompt requires a network connection to scan messages. Reconnect and try again.",
      btnLabel: "Got it",
      btnAction: "dismiss",
    },
  };

  const c = config[reason];

  const overlay = document.createElement("div");
  overlay.id = "tp-scan-block-overlay";
  overlay.className = "tp-block-overlay";
  overlay.innerHTML = `
    <div class="tp-block-card tp-scan-block-card">
      <div class="tp-block-icon">${c.icon}</div>
      <h3>${c.heading}</h3>
      <p>${c.detail}</p>
      <div class="tp-scan-block-actions">
        <button id="tp-scan-block-primary" class="tp-block-btn">${c.btnLabel}</button>
        <button id="tp-scan-block-close" class="tp-block-btn tp-block-btn-secondary">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("tp-scan-block-primary")!.addEventListener("click", () => {
    overlay.remove();
    if (c.btnAction === "sign-in") {
      browser.runtime.sendMessage({ type: "OPEN_LOGIN" }).catch(() => {});
    }
    // "dismiss" just closes — user presses Enter again for a fresh scan
  });

  document.getElementById("tp-scan-block-close")!.addEventListener("click", () => {
    overlay.remove();
  });
}

// ─── Session Loss Banner ───

function showSessionLossBanner() {
  if (document.getElementById("tp-session-banner")) return;

  const banner = document.createElement("div");
  banner.id = "tp-session-banner";
  banner.className = "tp-session-banner";
  banner.innerHTML = `
    <span class="tp-session-banner-text">TeamPrompt protection paused \u2014 Sign in to restore guardrails</span>
    <div class="tp-session-banner-actions">
      <button id="tp-session-banner-signin" class="tp-session-banner-btn">Sign In</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById("tp-session-banner-signin")!.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_LOGIN" }).catch(() => {});
  });
}

function hideSessionLossBanner() {
  document.getElementById("tp-session-banner")?.remove();
}

// Fix 4: Reload banner for context-invalidated state
function showReloadBanner() {
  document.getElementById("tp-reload-banner")?.remove();

  const banner = document.createElement("div");
  banner.id = "tp-reload-banner";
  banner.className = "tp-reload-banner";
  banner.innerHTML = `
    <span>TeamPrompt was updated. Reload this page to restore protection.</span>
    <button id="tp-reload-btn" class="tp-reload-btn-action">Reload Page</button>
  `;
  document.body.appendChild(banner);

  document.getElementById("tp-reload-btn")!.addEventListener("click", () => {
    location.reload();
  });
}

/** Fire-and-forget sendMessage that never throws or produces uncaught rejections. */
function safeSendMessage(msg: Record<string, unknown>): void {
  if (_contextDead) return;
  try {
    browser.runtime.sendMessage(msg).catch(() => {
      if (!_contextDead) killContentScript();
    });
  } catch {
    if (!_contextDead) killContentScript();
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
