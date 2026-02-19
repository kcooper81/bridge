// TeamPrompt Extension — AI Tool Detection & Insertion

export type AiToolName =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "copilot"
  | "perplexity"
  | "other";

export function detectAiTool(url: string): AiToolName {
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

export const INPUT_SELECTORS = [
  // ChatGPT
  "#prompt-textarea",
  'textarea[data-id="root"]',
  // Claude
  'div[contenteditable="true"].ProseMirror',
  // Gemini
  'div[contenteditable="true"].ql-editor',
  "rich-textarea textarea",
  // Copilot
  'textarea[name="searchbox"]',
  // Perplexity
  "textarea[placeholder]",
  // Generic fallbacks
  "textarea[data-testid]",
  "textarea",
  'div[contenteditable="true"]',
] as const;

export function insertIntoAiTool(content: string): boolean {
  for (const selector of INPUT_SELECTORS) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
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
      return true;
    }
  }
  return false;
}
