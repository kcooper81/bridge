/**
 * IndexNow integration — instantly notify search engines when pages change.
 * https://www.indexnow.org/documentation
 *
 * Submitting to api.indexnow.org shares with all participating engines
 * (Bing, Yandex, Naver, Seznam).
 */

import { allSeoPages } from "@/lib/seo-pages/data";

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || "";
const SITE_HOST = "teamprompt.app";
const BASE_URL = `https://${SITE_HOST}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

interface IndexNowResponse {
  success: boolean;
  statusCode: number;
  message: string;
  urlCount: number;
}

export async function submitToIndexNow(urls: string[]): Promise<IndexNowResponse> {
  if (!INDEXNOW_KEY) {
    return { success: false, statusCode: 0, message: "INDEXNOW_API_KEY not configured — set this env var in Vercel", urlCount: 0 };
  }
  if (urls.length === 0) {
    return { success: true, statusCode: 200, message: "No URLs to submit", urlCount: 0 };
  }

  // Ensure all URLs are fully qualified and belong to SITE_HOST
  const fullUrls = urls
    .map((url) => {
      if (url.startsWith(`https://${SITE_HOST}`)) return url;
      if (url.startsWith("http")) return null; // Different domain — skip
      return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    })
    .filter((url): url is string => url !== null);

  if (fullUrls.length === 0) {
    return { success: false, statusCode: 0, message: "No valid URLs for host " + SITE_HOST, urlCount: 0 };
  }

  // Batch in groups of 10,000 (API limit)
  const batches: string[][] = [];
  for (let i = 0; i < fullUrls.length; i += 10000) {
    batches.push(fullUrls.slice(i, i + 10000));
  }

  let totalSubmitted = 0;
  let lastStatusCode = 200;
  let lastMessage = "OK";

  for (const batch of batches) {
    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: SITE_HOST,
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: batch,
        }),
      });

      lastStatusCode = response.status;
      if (response.status === 200 || response.status === 202) {
        totalSubmitted += batch.length;
        lastMessage = response.status === 202 ? "Accepted (validation pending)" : "OK";
      } else {
        const text = await response.text().catch(() => "");
        lastMessage = `HTTP ${response.status}: ${text || response.statusText}`;
        break;
      }
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : "Network error";
      lastStatusCode = 0;
      break;
    }
  }

  return { success: lastStatusCode === 200 || lastStatusCode === 202, statusCode: lastStatusCode, message: lastMessage, urlCount: totalSubmitted };
}

/** Generate all sitemap URLs locally (no network fetch). */
export function getAllSitemapUrls(): string[] {
  const HELP_CATEGORIES = [
    "getting-started", "prompt-library", "guidelines", "security-rules",
    "extension", "team-management", "analytics", "import-export",
    "billing", "account-security",
  ];
  const HELP_ARTICLES: Record<string, string[]> = {
    "getting-started": ["create-a-workspace", "invite-my-team", "install-the-browser-extension", "create-my-first-prompt", "user-roles", "approval-workflow", "approval-queue"],
    "prompt-library": ["create-and-edit-prompts", "prompt-templates", "tags-and-filtering", "prompt-approval-workflow", "share-prompts-with-my-team", "import-existing-prompts", "compare-prompt-versions"],
    guidelines: ["quality-guidelines", "create-guidelines", "pre-built-guidelines", "difference-between-guidelines-and-security-rules"],
    "security-rules": ["dlp-scanning", "default-patterns", "create-custom-security-rules", "block-and-warn", "enforce-security-rules", "violation-history", "enable-security-rules", "admin-security-settings", "compliance-policy-packs", "auto-sanitization", "suggest-a-security-rule"],
    extension: ["supported-ai-tools", "install-and-sign-in", "insert-prompts-into-ai-tools", "shield-indicator", "offline-usage", "side-panel"],
    "team-management": ["invite-and-manage-members", "teams", "change-someone-role", "remove-a-member", "extension-status", "change-roles-for-multiple-members", "customize-the-invite-welcome-email", "domain-based-auto-join", "connect-google-workspace-to-sync-my-directory"],
    analytics: ["analytics-page", "activity-log", "export-activity-data"],
    "import-export": ["import-prompts", "export-my-data", "migrate-from-another-tool", "template-packs"],
    billing: ["available-plans", "upgrade-or-downgrade", "free-trial", "cancel-subscription", "payment-methods"],
    "account-security": ["reset-my-password", "delete-my-account", "data-stored-and-protected", "does-teamprompt-store-the-text-i-send-to-ai-tools"],
  };
  const INDUSTRY_SLUGS = ["healthcare", "legal", "technology", "finance", "government", "education", "insurance"];

  const urls: string[] = [
    BASE_URL,
    `${BASE_URL}/pricing`,
    `${BASE_URL}/features`,
    `${BASE_URL}/security`,
    `${BASE_URL}/enterprise`,
    `${BASE_URL}/integrations`,
    `${BASE_URL}/extensions`,
    `${BASE_URL}/solutions`,
    `${BASE_URL}/help`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/changelog`,
    `${BASE_URL}/media`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/terms`,
  ];

  // Industry pages
  for (const slug of INDUSTRY_SLUGS) {
    urls.push(`${BASE_URL}/industries/${slug}`);
  }

  // SEO pages
  for (const page of allSeoPages) {
    urls.push(`${BASE_URL}/solutions/${page.slug}`);
  }

  // Help pages
  for (const cat of HELP_CATEGORIES) {
    urls.push(`${BASE_URL}/help/${cat}`);
    for (const article of HELP_ARTICLES[cat] || []) {
      urls.push(`${BASE_URL}/help/${cat}/${article}`);
    }
  }

  return urls;
}
