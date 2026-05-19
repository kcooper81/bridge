import { MetadataRoute } from "next";
import { INDEXED_SOLUTION_SLUGS } from "@/lib/seo-pages/data";

/**
 * SITEMAP STRATEGY (2026-03-22, updated 2026-05-13):
 *
 * Google marked 600 pages as "Duplicate without user-selected canonical"
 * after 1 month. The 527 programmatic /solutions/* pages were dragging
 * down crawl budget.
 *
 * Strategy: submit only the indexable subset; non-indexable /solutions/*
 * pages stay accessible via URL but are excluded from the sitemap and
 * marked `noindex, follow` so Google can still crawl through them and
 * pass link equity to indexed siblings.
 *
 * The list of indexable /solutions/* slugs lives in
 * `INDEXED_SOLUTION_SLUGS` (imported above) — single source of truth used
 * by both this sitemap and the per-page `noindex` tag in
 * `/solutions/[slug]/page.tsx`. Previously these two lists were
 * hand-maintained in separate files and had drifted (24 vs 41 slugs),
 * leaving 17 pages indexable but missing from the sitemap.
 */

const BLOG_SLUGS = [
  "ai-prompt-dlp-complete-guide",
  "ai-audit-trails-which-tools-actually-have-them",
  "how-to-build-a-team-prompt-library",
  "what-is-ai-data-loss-prevention-dlp",
  "5-signs-your-team-needs-prompt-management",
  "teamprompt-vs-shared-google-docs-for-prompts",
  "getting-started-with-teamprompt-in-under-2-minutes",
  "ai-governance-for-regulated-industries",
  "connect-ai-coding-tools-to-your-prompt-library-with-mcp",
  "slack-integration-dlp-alerts-and-prompt-notifications",
  "what-is-shadow-ai-and-how-to-control-it",
  "ai-dlp-preventing-data-leaks-to-chatgpt-and-claude",
  "ai-governance-framework-practical-guide-for-teams",
  "how-to-create-an-ai-acceptable-use-policy",
  "hipaa-compliance-and-ai-what-healthcare-teams-must-know",
  "complete-guide-to-ai-security-for-enterprise",
  "5-ai-data-risks-every-ciso-should-know",
  "prompt-injection-attacks-how-they-work-and-how-to-defend",
  "soc-2-and-ai-meeting-compliance-requirements",
  "why-your-dlp-strategy-needs-to-cover-ai-tools",
  "how-to-prevent-data-leaks-to-chatgpt",
  "ai-acceptable-use-policy-template-2026",
  "chatgpt-vs-claude-security-comparison",
  "what-is-shadow-ai-how-to-detect-and-control",
  "hipaa-and-ai-complete-guide-for-healthcare-teams",
];

const HELP_CATEGORIES = [
  "getting-started",
  "prompt-library",
  "guidelines",
  "security-rules",
  "extension",
  "team-management",
  "analytics",
  "import-export",
  "billing",
  "account-security",
  "integrations",
];

const INDUSTRY_SLUGS = [
  "healthcare",
  "legal",
  "technology",
  "finance",
  "government",
  "education",
  "insurance",
];

const COMPARE_SLUGS = ["nightfall", "purview", "chatgpt-teams", "notion", "best-ai-dlp-tools"];
const COMPLIANCE_SLUGS = ["hipaa", "soc2", "gdpr", "pci-dss", "eu-ai-act"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
  const today = new Date().toISOString().split("T")[0];

  // Tier 1: Core pages (highest priority — must be indexed)
  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/features`, lastModified: today, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/features/ai-chat`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/security`, lastModified: today, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/enterprise`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/integrations`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/extensions`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/solutions`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/help`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/changelog`, lastModified: today, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/media`, lastModified: today, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: today, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: today, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Tier 2: Landing pages for Google Ads (must be indexed)
  const landingPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/lp/ai-dlp`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lp/shadow-ai`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lp/ai-compliance`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lp/prompt-library`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Tier 3: Industry pages (unique content per industry)
  const industryPages: MetadataRoute.Sitemap = INDUSTRY_SLUGS.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Tier 4: Blog posts (unique long-form content — Google loves these)
  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Tier 5: Indexable solution pages (subset of the 524 — see
  // INDEXED_SOLUTION_SLUGS for the full list and rationale)
  const topSolutionPages: MetadataRoute.Sitemap = Array.from(INDEXED_SOLUTION_SLUGS).map((slug) => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Tier 6: Help category index pages (not individual articles — too thin)
  const helpCategoryPages: MetadataRoute.Sitemap = HELP_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/help/${cat}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Tier 7: Comparison pages (high-intent bottom-of-funnel)
  const comparePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/compare`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    ...COMPARE_SLUGS.map((slug) => ({
      url: `${baseUrl}/compare/${slug}`,
      lastModified: today,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  // Tier 8: Compliance landing pages (buyer-intent)
  const compliancePages: MetadataRoute.Sitemap = COMPLIANCE_SLUGS.map((slug) => ({
    url: `${baseUrl}/compliance/${slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Tier 9: Glossary hub
  const glossaryPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/glossary`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
  ];

  const all = [
    ...corePages,
    ...landingPages,
    ...industryPages,
    ...blogPages,
    ...topSolutionPages,
    ...helpCategoryPages,
    ...comparePages,
    ...compliancePages,
    ...glossaryPages,
  ];

  // Deduplicate by URL
  const seen = new Set<string>();
  return all.filter((entry) => {
    const normalized = entry.url.replace(/\/+$/, "");
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
