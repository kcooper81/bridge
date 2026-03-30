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
  severity: "block" | "warn" | "redact";
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
 *
 * IMPORTANT: Only "block" and "warn" severity rules are synced. "redact" rules
 * are excluded because redaction is a client-side operation (the extension/chat
 * rewrites text before sending). At the network level, Cloudflare can only see
 * the final request — it cannot selectively redact parts of the payload.
 *
 * Severity mapping:
 * - "block" → included in DLP profile, paired with HTTP "block" action
 * - "warn"  → included in DLP profile, paired with HTTP "audit" action (log only)
 * - "redact"→ excluded — handled client-side by extension/AI Chat before traffic reaches Cloudflare
 */
export async function createDlpProfile(
  config: CloudflareConfig,
  profileName: string,
  rules: DlpRuleForExport[],
  severityFilter?: "block" | "warn"
): Promise<DlpProfileResult & { entryCount?: number }> {
  // Filter rules: only regex, only the requested severity (or block+warn if no filter)
  const filteredRules = rules.filter((r) => {
    if (r.pattern_type !== "regex") return false;
    if (r.severity === "redact") return false; // Never sync redact rules to Cloudflare
    if (severityFilter) return r.severity === severityFilter;
    return true; // block + warn
  });

  // Convert TeamPrompt rules to Cloudflare DLP entries
  const entries = filteredRules.map((rule) => ({
    enabled: true,
    name: `TP: ${rule.name}`,
    pattern: {
      regex: sanitizeRegexForCloudflare(rule.pattern),
    },
    description: `${rule.category} | ${rule.severity} | ${rule.description || ""}`.slice(0, 200),
  }));

  if (entries.length === 0) {
    return { success: false, error: severityFilter
      ? `No ${severityFilter}-severity regex rules to sync`
      : "No block/warn regex rules to sync (redact rules are handled client-side, non-regex rules are not supported by Cloudflare DLP)" };
  }

  const data = await cfFetch(config, "/dlp/profiles/custom", {
    method: "POST",
    body: JSON.stringify({
      name: profileName,
      description: `Managed by TeamPrompt. ${severityFilter || "block+warn"}-severity DLP detection rules for AI tool traffic scanning.`,
      entries,
      allowed_match_count: 0, // Any match triggers the policy
    }),
  });

  if (data.success) {
    const profileId = (data.result as { id?: string })?.id;
    return { success: true, profileId, entryCount: entries.length };
  }
  return { success: false, error: data.errors?.[0]?.message || "Failed to create DLP profile" };
}

/**
 * Create an HTTP policy that uses the DLP profile to scan traffic to AI tool domains.
 *
 * @param gatewayAction — "block" for block-severity rules, "audit" for warn-severity rules.
 *   "audit" logs the match without blocking (Cloudflare Gateway audit log).
 * @param policyName — unique name for this Gateway rule (allows separate block & warn policies).
 */
export async function createHttpDlpPolicy(
  config: CloudflareConfig,
  dlpProfileId: string,
  approvedToolIds: string[],
  gatewayAction: "block" | "audit" = "block",
  policyName = "TeamPrompt: DLP Content Scan"
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

  // First, delete any existing policy with this name to avoid duplicates
  const existingRules = await cfFetch(config, "/gateway/rules");
  if (existingRules.success && Array.isArray(existingRules.result)) {
    for (const rule of existingRules.result as { id: string; name: string }[]) {
      if (rule.name === policyName) {
        const del = await cfFetch(config, `/gateway/rules/${rule.id}`, { method: "DELETE" });
        if (!del.success) {
          return { success: false, error: `Failed to remove existing policy "${policyName}": ${del.errors?.[0]?.message || "unknown error"}. Delete it manually in Cloudflare before retrying.` };
        }
      }
    }
  }

  const isBlock = gatewayAction === "block";
  const description = isBlock
    ? "Managed by TeamPrompt. Blocks AI prompts containing sensitive data detected by DLP profile."
    : "Managed by TeamPrompt. Logs AI prompts containing data matching warn-level DLP rules (does not block).";

  const ruleBody: Record<string, unknown> = {
    name: policyName,
    description,
    action: gatewayAction,
    filters: ["http"],
    traffic,
    enabled: true,
    rule_settings: {
      biso_admin_controls: {
        dlp: { enabled: true, profile_id: dlpProfileId },
      },
      ...(isBlock ? {
        block_page_enabled: true,
        block_reason: "This message was blocked by your organization's AI data loss prevention policy. Sensitive data was detected in your prompt. Please remove the sensitive information and try again.",
      } : {}),
    },
  };

  const data = await cfFetch(config, "/gateway/rules", {
    method: "POST",
    body: JSON.stringify(ruleBody),
  });

  if (data.success) return { success: true };
  return { success: false, error: data.errors?.[0]?.message || `Failed to create HTTP DLP policy (${gatewayAction})` };
}

/**
 * List existing DLP profiles to check if TeamPrompt profile already exists.
 */
export async function listDlpProfiles(config: CloudflareConfig): Promise<{ success: boolean; profiles: { id: string; name: string }[]; error?: string }> {
  try {
    const data = await cfFetch(config, "/dlp/profiles");
    if (!data.success) {
      return { success: false, profiles: [], error: data.errors?.[0]?.message || "Failed to list DLP profiles" };
    }
    const results = data.result as { id: string; name: string }[] | undefined;
    return { success: true, profiles: (results || []).map((p) => ({ id: p.id, name: p.name })) };
  } catch (err) {
    return { success: false, profiles: [], error: err instanceof Error ? err.message : "Failed to connect to Cloudflare API" };
  }
}

/**
 * Delete a DLP profile by ID.
 */
export async function deleteDlpProfile(config: CloudflareConfig, profileId: string): Promise<{ success: boolean; error?: string }> {
  const data = await cfFetch(config, `/dlp/profiles/custom/${profileId}`, { method: "DELETE" });
  return { success: data.success, error: data.errors?.[0]?.message };
}

/**
 * Delete all TeamPrompt HTTP DLP policies from Gateway rules (both block and warn/audit).
 * Should be called alongside deleteDlpProfile to avoid orphaned rules.
 */
export async function deleteHttpDlpPolicy(config: CloudflareConfig): Promise<{ success: boolean; deleted: number; error?: string }> {
  const existingRules = await cfFetch(config, "/gateway/rules");
  if (!existingRules.success || !Array.isArray(existingRules.result)) {
    return { success: false, deleted: 0, error: existingRules.errors?.[0]?.message || "Failed to list Gateway rules" };
  }
  let deleted = 0;
  const tpPolicyNames = ["TeamPrompt: DLP Content Scan", "TeamPrompt: DLP Warn Audit"];
  for (const rule of existingRules.result as { id: string; name: string }[]) {
    if (tpPolicyNames.includes(rule.name)) {
      const del = await cfFetch(config, `/gateway/rules/${rule.id}`, { method: "DELETE" });
      if (del.success) deleted++;
    }
  }
  return { success: true, deleted };
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

  // Truncate to 1024 bytes, respecting character and regex construct boundaries
  const encoder = new TextEncoder();
  if (encoder.encode(sanitized).length > 1024) {
    // Walk backwards from a safe cut point to find a clean boundary
    // Avoid cutting inside escape sequences (\d, \w), character classes ([...]), or quantifiers ({n,m})
    let cutPoint = 900; // Start well under limit to leave room
    while (cutPoint < sanitized.length && encoder.encode(sanitized.slice(0, cutPoint)).length <= 1024) {
      cutPoint++;
    }
    cutPoint--; // Last position that fits

    // Walk back to avoid cutting inside regex constructs
    while (cutPoint > 0) {
      const ch = sanitized[cutPoint - 1];
      // Don't cut right after a backslash (would orphan an escape sequence)
      if (ch === "\\") { cutPoint--; continue; }
      // Don't cut inside an unclosed { } quantifier
      const tail = sanitized.slice(0, cutPoint);
      const lastOpen = tail.lastIndexOf("{");
      const lastClose = tail.lastIndexOf("}");
      if (lastOpen > lastClose) { cutPoint = lastOpen; continue; }
      // Don't cut inside an unclosed [ ] character class
      const lastBracketOpen = tail.lastIndexOf("[");
      const lastBracketClose = tail.lastIndexOf("]");
      if (lastBracketOpen > lastBracketClose) { cutPoint = lastBracketOpen; continue; }
      break;
    }
    sanitized = sanitized.slice(0, cutPoint);
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
