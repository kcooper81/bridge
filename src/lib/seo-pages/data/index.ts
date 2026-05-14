import { useCasePages } from "./use-cases";
import { integrationPages } from "./integrations";
import { comparisonPages } from "./comparisons";
import { alternativePages } from "./alternatives";
import { guidePages } from "./guides";
import { workflowPages } from "./workflows";
import { rolePages } from "./roles";
import { templatePages } from "./templates";
import { dataProtectionPages } from "./data-protection";
import { compliancePages } from "./compliance";
import { policyPages } from "./policies";
import { featureDeepPages } from "./features-deep";
import { glossaryPages } from "./glossary";
import type { SeoPageData } from "../types";

export const allSeoPages: SeoPageData[] = [
  ...useCasePages,
  ...integrationPages,
  ...comparisonPages,
  ...alternativePages,
  ...guidePages,
  ...workflowPages,
  ...rolePages,
  ...templatePages,
  ...dataProtectionPages,
  ...compliancePages,
  ...policyPages,
  ...featureDeepPages,
  ...glossaryPages,
];

export function getSeoPageBySlug(slug: string): SeoPageData | undefined {
  return allSeoPages.find((page) => page.slug === slug);
}

/**
 * Single source of truth for which /solutions/* slugs are indexable in Google.
 * Both the sitemap and the per-page noindex tag read from this list. Keeping
 * them in sync prevents drift where a page is index:true but missing from
 * the sitemap (or vice versa) — which previously left ~17 indexable pages
 * undiscoverable to Google.
 *
 * Add a slug here only if the page has unique, valuable content. Anything not
 * in this list is marked `noindex, follow` and excluded from the sitemap, but
 * Google can still crawl it for link-equity flow.
 */
export const INDEXED_SOLUTION_SLUGS: ReadonlySet<string> = new Set([
  // Core product pages
  "prompt-management",
  "ai-dlp",
  "ai-governance",
  "prompt-templates",
  "ai-prompt-library-software",
  "prompt-management-101",
  // Integration pages (high commercial intent)
  "chatgpt-team-prompts",
  "claude",
  "chatgpt-dlp-scanning",
  "chatgpt-data-protection",
  "claude-data-protection",
  "gemini-enterprise-security",
  // Compliance pages
  "ai-compliance-reporting",
  "ai-compliance-frameworks",
  "hipaa-ai-compliance",
  "soc2-ai-compliance",
  "gdpr-ai-compliance",
  // Role pages
  "for-marketers",
  "for-educators",
  "for-cisos",
  "for-security-teams",
  "for-it-admins",
  "for-compliance-officers",
  // Guide pages
  "ai-prompt-templates-guide",
  "dlp-for-ai-tools",
  "ai-security-best-practices",
  "ai-governance-guide",
  "how-to-prevent-data-leaks-chatgpt",
  "how-to-set-up-dlp-for-ai",
  // Glossary
  "what-is-prompt-analytics",
  "what-is-agentic-ai",
  "what-is-data-loss-prevention",
  "what-is-ai-governance",
  "what-is-prompt-management",
  "what-is-shadow-ai",
  // Comparison/alternative (high intent)
  "vs-notion",
  "vs-shared-docs",
  "nightfall-alternative",
  "vs-nightfall",
  // Workflows
  "content-creation-workflow",
  "investor-reporting-ai-workflow",
]);

export function isIndexableSolution(slug: string): boolean {
  return INDEXED_SOLUTION_SLUGS.has(slug);
}

export function getRelatedPages(slug: string, limit = 6): SeoPageData[] {
  const current = allSeoPages.find((p) => p.slug === slug);
  if (!current) return allSeoPages.slice(0, limit);

  // Only recommend indexable pages — recommending noindex pages spends link
  // equity on dead-end URLs and gives users a worse internal-link experience.
  const candidates = allSeoPages.filter(
    (p) => p.slug !== slug && INDEXED_SOLUTION_SLUGS.has(p.slug)
  );

  const sameCategory = candidates.filter((p) => p.category === current.category);
  const otherCategories = candidates.filter((p) => p.category !== current.category);

  return [...sameCategory, ...otherCategories].slice(0, limit);
}
