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
  if (url.includes("copilot.microsoft.com")) return "copilot";
  if (url.includes("perplexity.ai")) return "perplexity";
  return "other";
}

/** Tool-specific selectors ordered by specificity, then generic fallbacks */
const TOOL_SELECTORS: Record<AiToolName, string[]> = {
  chatgpt: [
    "#prompt-textarea",
    'textarea[data-id="root"]',
  ],
  claude: [
    'div[contenteditable="true"].ProseMirror',
  ],
  gemini: [
    'div[contenteditable="true"].ql-editor',
    "rich-textarea textarea",
  ],
  copilot: [
    'textarea[name="searchbox"]',
  ],
  perplexity: [
    "textarea[placeholder]",
  ],
  other: [],
};

const GENERIC_FALLBACKS = [
  "textarea[data-testid]",
  "textarea",
  'div[contenteditable="true"]',
];

/** Combined flat list for isChatInput detection (backwards compat) */
export const INPUT_SELECTORS = [
  ...TOOL_SELECTORS.chatgpt,
  ...TOOL_SELECTORS.claude,
  ...TOOL_SELECTORS.gemini,
  ...TOOL_SELECTORS.copilot,
  ...TOOL_SELECTORS.perplexity,
  ...GENERIC_FALLBACKS,
] as const;

export function insertIntoAiTool(content: string): boolean {
  const tool = detectAiTool(window.location.href);

  // Try tool-specific selectors first, then all other tools, then generic fallbacks
  const selectorOrder = [
    ...(TOOL_SELECTORS[tool] || []),
    // If detected tool fails, try all other tool selectors (domain may have changed)
    ...Object.entries(TOOL_SELECTORS)
      .filter(([key]) => key !== tool && key !== "other")
      .flatMap(([, selectors]) => selectors),
    ...GENERIC_FALLBACKS,
  ];

  for (const selector of selectorOrder) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        el.focus();
        el.value = content;
        el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      } else {
        // contenteditable div (Claude, Gemini)
        el.focus();
        el.textContent = content;
        el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      }
      return true;
    }
  }
  return false;
}
