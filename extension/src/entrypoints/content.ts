// TeamPrompt Extension — Content Script
// Runs on AI tool pages. Handles: DLP scanning, prompt insertion, interaction logging, shield indicator.

import { detectAiTool, insertIntoAiTool } from "../lib/ai-tools";
import { scanOutbound, type ScanResult } from "../lib/scanner";
import { fetchSecurityStatus } from "../lib/security-status";
import { logInteraction } from "../lib/logging";
import { getSession } from "../lib/auth";
import { isContextInvalidated } from "../lib/api";
import "../styles/content.css";

// Flag to allow re-dispatched Enter key to pass through without re-scanning
let _tpAllowNext = false;

// Track last blocked text to prevent double-Enter bypass
let _lastBlockedText: string | null = null;

// Track shield indicator state
let _shieldEl: HTMLElement | null = null;
let _shieldStatusEl: HTMLElement | null = null;
let _shieldDotEl: HTMLElement | null = null;
let _shieldLabelEl: HTMLElement | null = null;
let _shieldCollapsed = false;
let _ruleCount = 0;
let _isProtected = false;
let _isAuthenticated = false;
let _isOnline = navigator.onLine;

// Track current URL for SPA navigation detection
let _currentUrl = location.href;

// Debounce timer for shield refresh
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

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

    // ─── Initialize Shield Indicator ───
    initShieldIndicator();

    // ─── Auth Change Listener (Fix 2) ───
    browser.storage.onChanged.addListener((changes, area) => {
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
      _isOnline = true;
      if (_isAuthenticated) {
        refreshShieldStatus();
      } else {
        updateShieldState();
      }
    });

    window.addEventListener("offline", () => {
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
    setInterval(() => {
      if (_isAuthenticated && _isOnline) {
        refreshShieldStatus();
      }
    }, 60 * 1000);

    // ─── Proactive Context Invalidation Check ───
    setInterval(() => {
      browser.runtime.sendMessage({ type: "PING" }).catch(() => {
        // "Extension context invalidated" — show reload banner immediately
        showReloadBanner();
      });
    }, 30 * 1000);

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
          console.log("[TP-DLP] Enter on:", target.tagName, target.id, "contentEditable:", target.contentEditable, "isTextarea:", target instanceof HTMLTextAreaElement);
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
            console.log("[TP-DLP] Text captured:", text.length, "chars, first 80:", text.slice(0, 80));
            if (text.trim().length < 1) {
              console.log("[TP-DLP] Text empty, skipping scan");
              return;
            }

            // Block repeat submissions of previously blocked text
            if (_lastBlockedText !== null && text.trim() === _lastBlockedText.trim()) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              console.log("[TP-DLP] Repeat blocked text detected, blocking again");
              showBlockOverlay([{ ruleId: "repeat-block", ruleName: "Previously blocked", category: "dlp", severity: "block", matchedText: "Same content was blocked moments ago" }]);
              return;
            }

            // ALWAYS block synchronously, then scan async
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log("[TP-DLP] Intercepted Enter, scanning...");

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
              console.log("[TP-DLP] Scan result:", JSON.stringify(result));

              if (result?.action === "block") {
                _lastBlockedText = text;
                showBlockOverlay(result.violations);
                logInteraction(text, "blocked", result.violations);
                pulseShield("block");
                return;
              }

              if (result?.action === "warn") {
                showWarningBanner(result.violations);
                logInteraction(text, "warned", result.violations);
                pulseShield("warn");
              } else if (result === null) {
                // Fail-closed: scan returned null — determine reason and block
                const reason = _isAuthenticated ? "api-error" : "no-auth";
                showScanBlockOverlay(reason);
                logInteraction(text, "blocked", [{ ruleName: "Scan failure", category: "system", matchedText: "", action: "block" as const }]);
                return;
              } else {
                logInteraction(text, "sent", []);
              }

              // Re-dispatch the Enter key to actually send the message
              reDispatchEnter(target);
            }).catch(() => {
              // Fail-closed: scan failed (network error) — block, don't auto-send
              updateShieldScanning(false);
              showScanBlockOverlay("api-error");
              logInteraction(text, "blocked", [{ ruleName: "Scan failure", category: "system", matchedText: "", action: "block" as const }]);
            });
          }
        }
      },
      true // capture phase — fires before AI client handlers
    );

    // Clear blocked text tracking when user edits input
    document.addEventListener("input", () => { _lastBlockedText = null; }, true);
  },
});

// ─── SPA Navigation Handler (Fix 7) ───

function onUrlChange() {
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
  const status = await fetchSecurityStatus();
  if (status) {
    _isProtected = status.protected;
    _ruleCount = status.activeRuleCount;
  }
  updateShieldState();
}

function updateShieldState() {
  if (!_shieldEl || !_shieldDotEl || !_shieldLabelEl) return;

  // Remove all state classes
  _shieldEl.classList.remove(
    "tp-shield-inactive",
    "tp-shield-protected",
    "tp-shield-unprotected",
    "tp-shield-offline",
    "tp-shield-invalidated"
  );

  // Fix 4: Context invalidated — show reload banner
  if (isContextInvalidated()) {
    _shieldEl.classList.add("tp-shield-invalidated");
    _shieldDotEl.className = "tp-shield-dot tp-dot-gray";
    _shieldLabelEl.textContent = "Reload page required";
    return;
  }

  // Fix 5: Offline
  if (!_isOnline) {
    _shieldEl.classList.add("tp-shield-offline");
    _shieldDotEl.className = "tp-shield-dot tp-dot-gray";
    _shieldLabelEl.textContent = "Offline \u2014 scans paused";
    return;
  }

  // Not authenticated
  if (!_isAuthenticated) {
    _shieldEl.classList.add("tp-shield-inactive");
    _shieldDotEl.className = "tp-shield-dot tp-dot-gray";
    _shieldLabelEl.textContent = "Not signed in \u2014 Click to sign in";
    return;
  }

  // Protected
  if (_isProtected) {
    _shieldEl.classList.add("tp-shield-protected");
    _shieldDotEl.className = "tp-shield-dot tp-dot-green";
    _shieldLabelEl.textContent = `${_ruleCount} rule${_ruleCount !== 1 ? "s" : ""} active`;
  } else {
    _shieldEl.classList.add("tp-shield-unprotected");
    _shieldDotEl.className = "tp-shield-dot tp-dot-amber";
    _shieldLabelEl.textContent = "No rules configured";
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
  const dotClass = !_isOnline || isContextInvalidated()
    ? "tp-dot-gray"
    : !_isAuthenticated
      ? "tp-dot-gray"
      : _isProtected
        ? "tp-dot-green"
        : "tp-dot-amber";

  // Status text
  let statusText = "";
  if (isContextInvalidated()) {
    statusText = "Reload page required";
  } else if (!_isOnline) {
    statusText = "Offline \u2014 scans paused";
  } else if (!_isAuthenticated) {
    statusText = "Not signed in \u2014 Click to sign in";
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

  // Fix 3: Click to sign in if not authenticated, or expand if collapsed
  shield.addEventListener("click", () => {
    if (_shieldCollapsed) {
      _shieldCollapsed = false;
      shield.classList.remove("tp-shield-collapsed");
      return;
    }
    if (!_isAuthenticated) {
      // Content scripts can't use browser.tabs.create, so ask background
      browser.runtime.sendMessage({ type: "OPEN_LOGIN" }).catch(() => {
        // Context may be invalidated
      });
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
    updateShieldState();
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

// Fail-closed: scan block overlay — no bypass path
type ScanBlockReason = "no-auth" | "api-error" | "offline" | "context-invalidated";

function showScanBlockOverlay(reason: ScanBlockReason) {
  // Context invalidated delegates to the existing reload banner
  if (reason === "context-invalidated" || isContextInvalidated()) {
    showReloadBanner();
    return;
  }

  document.getElementById("tp-scan-block-overlay")?.remove();

  const config: Record<Exclude<ScanBlockReason, "context-invalidated">, { icon: string; heading: string; detail: string; btnLabel: string; btnAction: "sign-in" | "dismiss" }> = {
    "no-auth": {
      icon: "&#x1f512;",
      heading: "Sign in required to send messages",
      detail: "TeamPrompt must verify your message before sending. Sign in to restore protection.",
      btnLabel: "Sign In",
      btnAction: "sign-in",
    },
    "api-error": {
      icon: "&#x1f6d1;",
      heading: "Message blocked \u2014 scan failed",
      detail: "TeamPrompt could not verify this message is safe to send. Press Enter to retry.",
      btnLabel: "Retry Scan",
      btnAction: "dismiss",
    },
    "offline": {
      icon: "&#x1f4e1;",
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
      <button id="tp-session-banner-dismiss" class="tp-session-banner-btn tp-session-banner-btn-dismiss">Dismiss</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById("tp-session-banner-signin")!.addEventListener("click", () => {
    banner.remove();
    browser.runtime.sendMessage({ type: "OPEN_LOGIN" }).catch(() => {});
  });

  document.getElementById("tp-session-banner-dismiss")!.addEventListener("click", () => {
    banner.remove();
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

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
