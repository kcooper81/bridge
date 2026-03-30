/**
 * Cloudflare Enterprise DLP — Sync TeamPrompt DLP rules to Cloudflare Gateway HTTP policies.
 *
 * Standard tier: DNS-only blocking (domain allow/block)
 * Enterprise tier: HTTP policy + DLP profile (content inspection at network level)
 *
 * This requires Cloudflare Gateway in Traffic+DNS mode with TLS decryption enabled
 * and a root CA certificate installed on managed devices.
 */

import { AI_TOOL_DOMAINS, type CloudflareConfig } from "./cloudflare-gateway";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

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
  if (!res.ok) {
    try { return await res.json(); } catch {
      return { success: false, errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }] };
    }
  }
  return res.json();
}

// ── Types ──

export interface DlpRuleForExport {
  name: string;
  description: string;
  pattern: string;
  pattern_type: string;
  category: string;
  severity: string;
}

export interface DlpProfileResult {
  success: boolean;
  profileId?: string;
  error?: string;
}

// ── DLP Profile Sync ──

/**
 * Create a custom DLP profile in Cloudflare with TeamPrompt's detection rules.
 * Each rule becomes a detection entry in the profile.
 */
export async function createDlpProfile(
  config: CloudflareConfig,
  profileName: string,
  rules: DlpRuleForExport[]
): Promise<DlpProfileResult> {
  // Convert TeamPrompt rules to Cloudflare DLP entries
  const entries = rules
    .filter((r) => r.pattern_type === "regex") // Cloudflare DLP only supports regex
    .map((rule) => ({
      enabled: true,
      name: `TP: ${rule.name}`,
      pattern: {
        regex: sanitizeRegexForCloudflare(rule.pattern),
      },
      description: `${rule.category} | ${rule.severity} | ${rule.description || ""}`.slice(0, 200),
    }));

  if (entries.length === 0) {
    return { success: false, error: "No regex-based rules to sync (Cloudflare DLP only supports regex patterns)" };
  }

  const data = await cfFetch(config, "/dlp/profiles/custom", {
    method: "POST",
    body: JSON.stringify({
      name: profileName,
      description: "Managed by TeamPrompt. Contains DLP detection rules for AI tool traffic scanning.",
      entries,
      allowed_match_count: 0, // Any match triggers the policy
    }),
  });

  if (data.success) {
    const profileId = (data.result as { id?: string })?.id;
    return { success: true, profileId };
  }
  return { success: false, error: data.errors?.[0]?.message || "Failed to create DLP profile" };
}

/**
 * Create an HTTP policy that uses the DLP profile to scan traffic to AI tool domains.
 * Blocks requests that match any DLP detection entry.
 */
export async function createHttpDlpPolicy(
  config: CloudflareConfig,
  dlpProfileId: string,
  approvedToolIds: string[]
): Promise<{ success: boolean; error?: string }> {
  // Build domain list from approved AI tools (only scan approved tools, not blocked ones)
  const domains = approvedToolIds.flatMap((id) => {
    const tool = AI_TOOL_DOMAINS.find((t) => t.id === id);
    return tool ? tool.domains : [];
  });

  if (domains.length === 0) {
    return { success: false, error: "No approved tool domains to scan" };
  }

  const domainFilter = domains.map((d) => `"${d}"`).join(", ");
  const traffic = `any(http.request.domains[*] in {${domainFilter}})`;

  // First, delete any existing TeamPrompt HTTP DLP policy to avoid duplicates
  const existingRules = await cfFetch(config, "/gateway/rules");
  if (existingRules.success && Array.isArray(existingRules.result)) {
    for (const rule of existingRules.result as { id: string; name: string }[]) {
      if (rule.name === "TeamPrompt: DLP Content Scan") {
        await cfFetch(config, `/gateway/rules/${rule.id}`, { method: "DELETE" });
      }
    }
  }

  const data = await cfFetch(config, "/gateway/rules", {
    method: "POST",
    body: JSON.stringify({
      name: "TeamPrompt: DLP Content Scan",
      description: "Managed by TeamPrompt. Blocks AI prompts containing sensitive data detected by DLP profile.",
      action: "block",
      filters: ["http"],
      traffic,
      enabled: true,
      rule_settings: {
        block_page_enabled: true,
        block_reason: "This message was blocked by your organization's AI data loss prevention policy. Sensitive data was detected in your prompt. Please remove the sensitive information and try again.",
        biso_admin_controls: {
          dlp: { enabled: true, profile_id: dlpProfileId },
        },
      },
    }),
  });

  if (data.success) return { success: true };
  return { success: false, error: data.errors?.[0]?.message || "Failed to create HTTP DLP policy" };
}

/**
 * List existing DLP profiles to check if TeamPrompt profile already exists.
 */
export async function listDlpProfiles(config: CloudflareConfig): Promise<{ id: string; name: string }[]> {
  const data = await cfFetch(config, "/dlp/profiles");
  if (!data.success) return [];
  const results = data.result as { id: string; name: string }[] | undefined;
  return (results || []).map((p) => ({ id: p.id, name: p.name }));
}

/**
 * Delete a DLP profile by ID.
 */
export async function deleteDlpProfile(config: CloudflareConfig, profileId: string): Promise<{ success: boolean }> {
  const data = await cfFetch(config, `/dlp/profiles/custom/${profileId}`, { method: "DELETE" });
  return { success: data.success };
}

// ── Regex sanitization ──

/**
 * Cloudflare DLP regex has specific constraints:
 * - No + or * operators (use {min,max} instead)
 * - Max 1024 bytes
 * - Rust regex syntax
 */
function sanitizeRegexForCloudflare(pattern: string): string {
  let sanitized = pattern;

  // Replace unbounded * with {0,100}
  sanitized = sanitized.replace(/(?<!\\)\*(?!\?)/g, "{0,100}");

  // Replace unbounded + with {1,100}
  sanitized = sanitized.replace(/(?<!\\)\+(?!\?)/g, "{1,100}");

  // Truncate to 1024 bytes
  if (new TextEncoder().encode(sanitized).length > 1024) {
    sanitized = sanitized.slice(0, 1000);
  }

  return sanitized;
}

// ── Policy Export (for companies with their own VPN/firewall) ──

export interface PolicyExportFormat {
  format: "json" | "csv" | "regex-list" | "suricata";
}

/**
 * Export TeamPrompt DLP rules in various formats for use with external firewalls/proxies.
 */
export function exportRulesForFirewall(rules: DlpRuleForExport[], format: PolicyExportFormat["format"]): string {
  switch (format) {
    case "json":
      return JSON.stringify({
        export_date: new Date().toISOString(),
        source: "TeamPrompt",
        description: "DLP detection rules for AI tool traffic. Import into your firewall, proxy, or CASB.",
        ai_tool_domains: AI_TOOL_DOMAINS.map((t) => ({ name: t.name, domains: t.domains })),
        rules: rules.map((r) => ({
          name: r.name,
          description: r.description,
          pattern: r.pattern,
          pattern_type: r.pattern_type,
          category: r.category,
          severity: r.severity,
        })),
      }, null, 2);

    case "csv":
      const csvHeader = "Name,Description,Pattern,Pattern Type,Category,Severity";
      const csvRows = rules.map((r) =>
        [r.name, r.description, r.pattern, r.pattern_type, r.category, r.severity]
          .map((f) => `"${(f || "").replace(/"/g, '""')}"`)
          .join(",")
      );
      return [csvHeader, ...csvRows].join("\n");

    case "regex-list":
      // Simple list of regex patterns — compatible with most firewalls
      return rules
        .filter((r) => r.pattern_type === "regex")
        .map((r) => `# ${r.name} (${r.category}, ${r.severity})\n${r.pattern}`)
        .join("\n\n");

    case "suricata":
      // Suricata IDS/IPS rule format — for network-level detection
      return rules
        .filter((r) => r.pattern_type === "regex")
        .map((r, i) => {
          const sid = 9000000 + i;
          const safeName = r.name.replace(/"/g, '\\"').replace(/;/g, "\\;");
          const safePattern = r.pattern.replace(/"/g, '\\"').replace(/;/g, "\\;");
          return `alert http any any -> any any (msg:"TeamPrompt DLP: ${safeName}"; pcre:"/${safePattern}/i"; sid:${sid}; rev:1;)`;
        })
        .join("\n");

    default:
      return "";
  }
}
