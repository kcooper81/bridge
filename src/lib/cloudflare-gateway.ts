/**
 * Cloudflare Zero Trust Gateway API client
 * Used to sync AI tool blocking policies from TeamPrompt to Cloudflare Gateway
 */

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

// ── Known AI domains ──

export const AI_TOOL_DOMAINS: {
  id: string;
  name: string;
  domains: string[];
  category: "chat" | "code" | "search" | "image" | "other";
}[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    domains: ["chat.openai.com", "chatgpt.com", "api.openai.com", "cdn.oaistatic.com"],
    category: "chat",
  },
  {
    id: "claude",
    name: "Claude",
    domains: ["claude.ai", "api.anthropic.com"],
    category: "chat",
  },
  {
    id: "gemini",
    name: "Gemini",
    domains: ["gemini.google.com", "generativelanguage.googleapis.com", "aistudio.google.com"],
    category: "chat",
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    domains: ["copilot.microsoft.com", "www.bing.com/chat", "sydney.bing.com"],
    category: "chat",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    domains: ["www.perplexity.ai", "perplexity.ai", "api.perplexity.ai"],
    category: "search",
  },
  {
    id: "grok",
    name: "Grok",
    domains: ["grok.x.ai", "x.ai"],
    category: "chat",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    domains: ["chat.deepseek.com", "api.deepseek.com"],
    category: "chat",
  },
  {
    id: "mistral",
    name: "Mistral",
    domains: ["chat.mistral.ai", "api.mistral.ai"],
    category: "chat",
  },
  {
    id: "poe",
    name: "Poe",
    domains: ["poe.com"],
    category: "chat",
  },
  {
    id: "character",
    name: "Character.AI",
    domains: ["character.ai", "beta.character.ai"],
    category: "chat",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    domains: ["huggingface.co"],
    category: "other",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    domains: ["www.midjourney.com", "midjourney.com"],
    category: "image",
  },
  {
    id: "dall-e",
    name: "DALL-E",
    domains: ["labs.openai.com"],
    category: "image",
  },
  {
    id: "cursor",
    name: "Cursor",
    domains: ["cursor.sh", "www.cursor.com"],
    category: "code",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    domains: ["copilot.github.com", "api.githubcopilot.com"],
    category: "code",
  },
  {
    id: "replit",
    name: "Replit AI",
    domains: ["replit.com"],
    category: "code",
  },
  {
    id: "you",
    name: "You.com",
    domains: ["you.com"],
    category: "search",
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    domains: ["www.meta.ai", "meta.ai"],
    category: "chat",
  },
];

// ── Types ──

export interface CloudflareConfig {
  account_id: string;
  api_token: string;
}

export interface GatewayRule {
  id: string;
  name: string;
  description: string;
  action: string;
  enabled: boolean;
  filters: string[];
  traffic: string;
  precedence: number;
  created_at: string;
  updated_at: string;
}

// ── API Functions ──

async function cfFetch(
  config: CloudflareConfig,
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; result?: unknown; errors?: { message: string }[] }> {
  const res = await fetch(`${CF_API_BASE}/accounts/${config.account_id}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.api_token}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  return res.json();
}

/** Verify the API token works by listing Gateway rules */
export async function verifyConnection(config: CloudflareConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await cfFetch(config, "/gateway/rules");
    if (data.success) return { success: true };
    return { success: false, error: data.errors?.[0]?.message || "Invalid credentials" };
  } catch {
    return { success: false, error: "Failed to connect to Cloudflare API" };
  }
}

/** List all Gateway rules */
export async function listRules(config: CloudflareConfig): Promise<GatewayRule[]> {
  const data = await cfFetch(config, "/gateway/rules");
  if (!data.success) return [];
  return (data.result as GatewayRule[]) || [];
}

/** Create a DNS block rule for specific AI tool domains */
export async function createBlockRule(
  config: CloudflareConfig,
  toolId: string,
  toolName: string,
  domains: string[]
): Promise<{ success: boolean; ruleId?: string; error?: string }> {
  const domainList = domains.map((d) => `"${d}"`).join(" ");
  const traffic = `any(dns.domains[*] in {${domainList}})`;

  const data = await cfFetch(config, "/gateway/rules", {
    method: "POST",
    body: JSON.stringify({
      name: `TeamPrompt: Block ${toolName}`,
      description: `Managed by TeamPrompt. Blocks ${toolName} AI tool.`,
      action: "block",
      filters: ["dns"],
      traffic,
      enabled: true,
      rule_settings: {
        block_page_enabled: true,
        block_reason: `${toolName} is not an approved AI tool. Contact your administrator or use an approved tool with TeamPrompt.`,
      },
    }),
  });

  if (data.success) {
    return { success: true, ruleId: (data.result as { id: string })?.id };
  }
  return { success: false, error: data.errors?.[0]?.message || "Failed to create rule" };
}

/** Delete a Gateway rule by ID */
export async function deleteRule(config: CloudflareConfig, ruleId: string): Promise<{ success: boolean }> {
  const data = await cfFetch(config, `/gateway/rules/${ruleId}`, { method: "DELETE" });
  return { success: data.success };
}

/** Toggle a Gateway rule enabled/disabled */
export async function toggleRule(
  config: CloudflareConfig,
  ruleId: string,
  enabled: boolean
): Promise<{ success: boolean }> {
  const data = await cfFetch(config, `/gateway/rules/${ruleId}`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
  return { success: data.success };
}

/**
 * Sync blocked AI tools from TeamPrompt to Cloudflare Gateway.
 * Creates rules for tools that should be blocked, removes rules for tools that are now allowed.
 */
export async function syncBlockedTools(
  config: CloudflareConfig,
  blockedToolIds: string[]
): Promise<{ created: number; deleted: number; errors: string[] }> {
  const existingRules = await listRules(config);
  const tpRules = existingRules.filter((r) => r.name.startsWith("TeamPrompt: Block "));

  const errors: string[] = [];
  let created = 0;
  let deleted = 0;

  // Find rules to delete (tool is no longer blocked)
  for (const rule of tpRules) {
    const toolName = rule.name.replace("TeamPrompt: Block ", "");
    const tool = AI_TOOL_DOMAINS.find((t) => t.name === toolName);
    if (tool && !blockedToolIds.includes(tool.id)) {
      const result = await deleteRule(config, rule.id);
      if (result.success) deleted++;
      else errors.push(`Failed to remove rule for ${toolName}`);
    }
  }

  // Find tools to block (no existing rule)
  const existingBlockedNames = new Set(tpRules.map((r) => r.name.replace("TeamPrompt: Block ", "")));
  for (const toolId of blockedToolIds) {
    const tool = AI_TOOL_DOMAINS.find((t) => t.id === toolId);
    if (tool && !existingBlockedNames.has(tool.name)) {
      const result = await createBlockRule(config, tool.id, tool.name, tool.domains);
      if (result.success) created++;
      else errors.push(result.error || `Failed to block ${tool.name}`);
    }
  }

  return { created, deleted, errors };
}
