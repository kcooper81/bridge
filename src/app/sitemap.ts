import { MetadataRoute } from "next";

/**
 * SITEMAP STRATEGY (2026-03-22):
 *
 * Google marked 600 pages as "Duplicate without user-selected canonical"
 * after 1 month. Only 39 of 630 pages were indexed. The 527 programmatic
 * /solutions/* pages are seen as thin/duplicate content and are dragging
 * down crawl budget.
 *
 * Strategy: Submit only high-quality, unique pages (~80) in the sitemap.
 * The /solutions/* pages remain accessible via URL but are excluded from
 * the sitemap until domain authority grows. This tells Google to focus
 * on our real content.
 *
 * The /solutions/* pages still exist and are linked from the /solutions
 * index page — Google can discover them organically through internal links
 * if it chooses to crawl them.
 */

const BLOG_SLUGS = [
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

// Only the highest-value /solutions/* pages — hand-picked for indexing
const TOP_SOLUTION_SLUGS = [
  "prompt-management",
  "ai-dlp",
  "ai-governance",
  "prompt-templates",
  "ai-compliance-reporting",
  "for-marketers",
  "for-educators",
  "chatgpt-team-prompts",
  "claude",
  "ai-prompt-library-software",
  "ai-prompt-templates-guide",
  "prompt-management-101",
];

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

  // Tier 5: Top solution pages only (12 hand-picked, not all 527)
  const topSolutionPages: MetadataRoute.Sitemap = TOP_SOLUTION_SLUGS.map((slug) => ({
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

  // Total: ~80 pages instead of 630
  const all = [
    ...corePages,
    ...landingPages,
    ...industryPages,
    ...blogPages,
    ...topSolutionPages,
    ...helpCategoryPages,
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
