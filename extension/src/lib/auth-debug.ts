// TeamPrompt — Auth Debug Logger (Extension)
// Toggle: chrome.storage.local.set({ authDebugEnabled: true })
// View:  chrome.storage.local.get(["authDebugLogs"]) in service worker console
// NOTE: This entire file is for debug logging and should be removed when no longer needed.

type Category =
  | "bridge"
  | "login"
  | "refresh"
  | "state"
  | "session";

type Level = "log" | "warn" | "error";

interface LogEntry {
  ts: string;
  ctx: string;
  cat: Category;
  level: Level;
  msg: string;
  data?: unknown;
}

const STORAGE_KEY = "authDebugLogs";
const ENABLED_KEY = "authDebugEnabled";
const MAX_LOGS = 500;

// --- Context detection ---

function detectContext(): string {
  if (typeof ServiceWorkerGlobalScope !== "undefined" && self instanceof ServiceWorkerGlobalScope) {
    return "ext-bg";
  }
  if (typeof window !== "undefined" && window.location?.protocol?.startsWith("http")) {
    return "ext-bridge";
  }
  return "ext-cs";
}

const CTX = detectContext();

// --- Enabled state (cached, async bootstrap) ---

let _enabled = false;
let _ready = false;

function bootstrap() {
  if (_ready) return;
  _ready = true;
  try {
    browser.storage.local.get([ENABLED_KEY]).then((data) => {
      _enabled = data[ENABLED_KEY] === true;
      // If there are buffered entries and we just found out we're enabled, flush
      if (_enabled && _buffer.length > 0) flushBuffer();
    });

    // Stay in sync if toggled at runtime
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && ENABLED_KEY in changes) {
        _enabled = changes[ENABLED_KEY].newValue === true;
      }
    });
  } catch {
    _enabled = false;
  }
}

// --- Write-behind buffer ---

let _buffer: LogEntry[] = [];
let _flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushBuffer() {
  if (_buffer.length === 0) return;
  const toFlush = _buffer.splice(0);
  _flushTimer = null;

  browser.storage.local.get([STORAGE_KEY]).then((data) => {
    const logs: LogEntry[] = data[STORAGE_KEY] || [];
    logs.push(...toFlush);
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    browser.storage.local.set({ [STORAGE_KEY]: logs });
  });
}

function scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(flushBuffer, 1000);
}

function addEntry(entry: LogEntry) {
  _buffer.push(entry);
  scheduleFlush();
}

// --- Console output ---

function emit(cat: Category, level: Level, msg: string, data?: unknown) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    ctx: CTX,
    cat,
    level,
    msg,
    data,
  };

  const prefix = `[TP-AUTH:${cat}] (${CTX})`;
  if (level === "error") {
    console.error(prefix, msg, data !== undefined ? data : "");
  } else if (level === "warn") {
    console.warn(prefix, msg, data !== undefined ? data : "");
  } else {
    console.log(prefix, msg, data !== undefined ? data : "");
  }

  addEntry(entry);
}

// --- Public API ---

export const extAuthDebug = {
  log(cat: Category, msg: string, data?: unknown) {
    bootstrap();
    if (!_enabled) return;
    emit(cat, "log", msg, data);
  },

  warn(cat: Category, msg: string, data?: unknown) {
    bootstrap();
    if (!_enabled) return;
    emit(cat, "warn", msg, data);
  },

  error(cat: Category, msg: string, data?: unknown) {
    bootstrap();
    if (!_enabled) return;
    emit(cat, "error", msg, data);
  },

  /** Dump all stored logs to console (async) */
  async dump() {
    const data = await browser.storage.local.get([STORAGE_KEY]);
    const logs: LogEntry[] = data[STORAGE_KEY] || [];
    console.table(logs);
    return logs;
  },

  /** Return logs as JSON string (async) */
  async dumpJSON(): Promise<string> {
    const data = await browser.storage.local.get([STORAGE_KEY]);
    return JSON.stringify(data[STORAGE_KEY] || []);
  },

  /** Clear all stored logs */
  async clear() {
    _buffer = [];
    await browser.storage.local.remove([STORAGE_KEY]);
  },
};
