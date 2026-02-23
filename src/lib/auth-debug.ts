// TeamPrompt — Auth Debug Logger (Web App)
// Toggle: ?debug=auth URL param or localStorage.setItem("tp:auth-debug", "1")
// View:  Console (colored) or JSON.parse(localStorage.getItem("tp:auth-debug-logs"))
// NOTE: This entire file is for debug logging and should be removed when no longer needed.

type Category =
  | "middleware"
  | "session"
  | "callback"
  | "login"
  | "signup"
  | "provider"
  | "bridge"
  | "refresh"
  | "state";

type Level = "log" | "warn" | "error";

interface LogEntry {
  ts: string;
  cat: Category;
  level: Level;
  msg: string;
  data?: unknown;
  server?: boolean;
}

const COLORS: Record<Category, string> = {
  middleware: "#9333ea", // purple
  session: "#3b82f6", // blue
  callback: "#22c55e", // green
  login: "#f59e0b", // amber
  signup: "#f59e0b", // amber
  provider: "#ec4899", // pink
  bridge: "#ef4444", // red
  refresh: "#6366f1", // indigo
  state: "#06b6d4", // cyan
};

const STORAGE_KEY = "tp:auth-debug-logs";
const ENABLED_KEY = "tp:auth-debug";
const COOKIE_NAME = "tp-auth-debug";
const SERVER_LOG_COOKIE = "tp-auth-debug-log";
const MAX_LOGS = 500;

// ---------- Client-side logger ----------

let _enabled: boolean | null = null;

function isEnabled(): boolean {
  if (_enabled !== null) return _enabled;
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("debug") === "auth") {
      localStorage.setItem(ENABLED_KEY, "1");
      // Set cookie so middleware can read it
      document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      _enabled = true;
      return true;
    }
    _enabled = localStorage.getItem(ENABLED_KEY) === "1";
    if (_enabled) {
      // Ensure cookie stays in sync
      document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
    return _enabled;
  } catch {
    _enabled = false;
    return false;
  }
}

function persist(entry: LogEntry) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const logs: LogEntry[] = raw ? JSON.parse(raw) : [];
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Storage full or unavailable
  }
}

function emit(cat: Category, level: Level, msg: string, data?: unknown, server?: boolean) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    cat,
    level,
    msg,
    data,
    server,
  };

  const prefix = server ? `[AUTH:${cat}] (server)` : `[AUTH:${cat}]`;
  const color = COLORS[cat];
  const style = `color: ${color}; font-weight: bold;`;

  if (level === "error") {
    console.error(`%c${prefix}`, style, msg, data !== undefined ? data : "");
  } else if (level === "warn") {
    console.warn(`%c${prefix}`, style, msg, data !== undefined ? data : "");
  } else {
    console.log(`%c${prefix}`, style, msg, data !== undefined ? data : "");
  }

  persist(entry);
}

/** Read and display any server-forwarded logs from cookie */
function flushServerLogs() {
  if (typeof document === "undefined") return;
  try {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(SERVER_LOG_COOKIE + "="));
    if (!match) return;
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const entries: LogEntry[] = JSON.parse(raw);
    for (const entry of entries) {
      emit(entry.cat, entry.level, entry.msg, entry.data, true);
    }
    // Clear the cookie
    document.cookie = `${SERVER_LOG_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Ignore parse errors
  }
}

// Auto-flush server logs on client init
if (typeof window !== "undefined") {
  // Defer so the page has a chance to load
  setTimeout(() => {
    if (isEnabled()) flushServerLogs();
  }, 0);
}

// ---------- Server-side helpers (middleware/API routes) ----------

let _serverEnabled = false;
let _serverLogs: LogEntry[] = [];

function serverEmit(cat: Category, level: Level, msg: string, data?: unknown) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    cat,
    level,
    msg,
    data,
    server: true,
  };
  _serverLogs.push(entry);
  // Also log to server console for immediate visibility
  const prefix = `[AUTH:${cat}]`;
  if (level === "error") {
    console.error(prefix, msg, data !== undefined ? data : "");
  } else if (level === "warn") {
    console.warn(prefix, msg, data !== undefined ? data : "");
  } else {
    console.log(prefix, msg, data !== undefined ? data : "");
  }
}

// ---------- Public API ----------

export const authDebug = {
  /** Check if debug logging is currently enabled (client-side) */
  get enabled() {
    return isEnabled();
  },

  log(cat: Category, msg: string, data?: unknown) {
    if (typeof window !== "undefined") {
      if (!isEnabled()) return;
      emit(cat, "log", msg, data);
    } else {
      if (!_serverEnabled) return;
      serverEmit(cat, "log", msg, data);
    }
  },

  warn(cat: Category, msg: string, data?: unknown) {
    if (typeof window !== "undefined") {
      if (!isEnabled()) return;
      emit(cat, "warn", msg, data);
    } else {
      if (!_serverEnabled) return;
      serverEmit(cat, "warn", msg, data);
    }
  },

  error(cat: Category, msg: string, data?: unknown) {
    if (typeof window !== "undefined") {
      if (!isEnabled()) return;
      emit(cat, "error", msg, data);
    } else {
      if (!_serverEnabled) return;
      serverEmit(cat, "error", msg, data);
    }
  },

  /** Dump all stored logs to console (client-side) */
  dump() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const logs: LogEntry[] = raw ? JSON.parse(raw) : [];
      console.table(logs);
    } catch {
      console.log("No auth debug logs found");
    }
  },

  /** Return logs as JSON string (client-side) */
  dumpJSON(): string {
    if (typeof window === "undefined") return "[]";
    return localStorage.getItem(STORAGE_KEY) || "[]";
  },

  /** Clear all stored logs */
  clear() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    _serverLogs = [];
  },

  /** Initialize server-side logging by reading the debug cookie from the request */
  initServer(request: { cookies: { get: (name: string) => { value: string } | undefined } }) {
    _serverLogs = [];
    const cookie = request.cookies.get(COOKIE_NAME);
    _serverEnabled = cookie?.value === "1";
  },

  /** Attach buffered server logs to the response as a cookie (call before returning response) */
  attachToResponse(response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } }) {
    if (!_serverEnabled || _serverLogs.length === 0) return;
    try {
      const payload = JSON.stringify(_serverLogs);
      response.cookies.set(SERVER_LOG_COOKIE, payload, {
        path: "/",
        maxAge: 30,
        sameSite: "lax",
        httpOnly: false,
      });
    } catch {
      // Cookie too large — skip
    }
    _serverLogs = [];
  },
};
