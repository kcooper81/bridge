// TeamPrompt — Auth Debug Logger (Extension)
// Production no-op stub. All methods are inert — zero overhead, zero console output.
// To re-enable debug logging during development, restore the original file from git history.

type Category = "bridge" | "login" | "refresh" | "state" | "session";

export const extAuthDebug = {
  log(_cat: Category, _msg: string, _data?: unknown) {},
  warn(_cat: Category, _msg: string, _data?: unknown) {},
  error(_cat: Category, _msg: string, _data?: unknown) {},
  async dump() { return []; },
  async dumpJSON() { return "[]"; },
  async clear() {},
};
