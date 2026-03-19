import { MetadataRoute } from "next";
import { allSeoPages } from "@/lib/seo-pages/data";

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
];

const HELP_ARTICLES: Record<string, string[]> = {
  "getting-started": [
    "create-a-workspace",
    "invite-my-team",
    "install-the-browser-extension",
    "create-my-first-prompt",
    "user-roles",
    "approval-workflow",
    "approval-queue",
  ],
  "prompt-library": [
    "create-and-edit-prompts",
    "prompt-templates",
    "tags-and-filtering",
    "prompt-approval-workflow",
    "share-prompts-with-my-team",
    "import-existing-prompts",
    "compare-prompt-versions",
  ],
  guidelines: [
    "quality-guidelines",
    "create-guidelines",
    "pre-built-guidelines",
    "difference-between-guidelines-and-security-rules",
  ],
  "security-rules": [
    "dlp-scanning",
    "default-patterns",
    "create-custom-security-rules",
    "block-and-warn",
    "enforce-security-rules",
    "violation-history",
    "enable-security-rules",
    "admin-security-settings",
    "compliance-policy-packs",
    "auto-sanitization",
    "suggest-a-security-rule",
  ],
  extension: [
    "supported-ai-tools",
    "install-and-sign-in",
    "insert-prompts-into-ai-tools",
    "shield-indicator",
    "offline-usage",
    "side-panel",
  ],
  "team-management": [
    "invite-and-manage-members",
    "teams",
    "change-someone-role",
    "remove-a-member",
    "extension-status",
    "change-roles-for-multiple-members",
    "customize-the-invite-welcome-email",
    "domain-based-auto-join",
    "connect-google-workspace-to-sync-my-directory",
  ],
  analytics: ["analytics-page", "activity-log", "export-activity-data"],
  "import-export": [
    "import-prompts",
    "export-my-data",
    "migrate-from-another-tool",
    "template-packs",
  ],
  billing: [
    "available-plans",
    "upgrade-or-downgrade",
    "free-trial",
    "cancel-subscription",
    "payment-methods",
  ],
  "account-security": [
    "reset-my-password",
    "delete-my-account",
    "data-stored-and-protected",
    "does-teamprompt-store-the-text-i-send-to-ai-tools",
  ],
};

const INDUSTRY_SLUGS = [
  "healthcare",
  "legal",
  "technology",
  "finance",
  "government",
  "education",
  "insurance",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
  const today = new Date().toISOString().split("T")[0];

  const landingPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/lp/ai-dlp`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lp/shadow-ai`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lp/ai-compliance`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/lp/prompt-library`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
  ];

  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/features`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/security`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/enterprise`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/integrations`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/extensions`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/solutions`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/help`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: today, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: today, changeFrequency: "monthly", priority: 0.4 },
  ];

  const industryPages: MetadataRoute.Sitemap = INDUSTRY_SLUGS.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const seoPages: MetadataRoute.Sitemap = allSeoPages.map((page) => ({
    url: `${baseUrl}/solutions/${page.slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const helpCategoryPages: MetadataRoute.Sitemap = HELP_CATEGORIES.map(
    (cat) => ({
      url: `${baseUrl}/help/${cat}`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.5,
    })
  );

  const helpArticlePages: MetadataRoute.Sitemap = HELP_CATEGORIES.flatMap(
    (cat) =>
      (HELP_ARTICLES[cat] || []).map((slug) => ({
        url: `${baseUrl}/help/${cat}/${slug}`,
        lastModified: today,
        changeFrequency: "monthly",
        priority: 0.5,
      }))
  );

  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Deduplicate by URL (strip trailing slashes)
  const all = [
    ...corePages,
    ...landingPages,
    ...industryPages,
    ...seoPages,
    ...blogPages,
    ...helpCategoryPages,
    ...helpArticlePages,
  ];
  const seen = new Set<string>();
  return all.filter((entry) => {
    const normalized = entry.url.replace(/\/+$/, "");
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
