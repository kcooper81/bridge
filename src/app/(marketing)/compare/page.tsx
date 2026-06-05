import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { COMPARISON_PAGES } from "./[slug]/_data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export const metadata: Metadata = generatePageMetadata({
  title: "Compare TeamPrompt — AI DLP & Prompt Management Alternatives",
  description:
    "See how TeamPrompt compares to Nightfall AI, Microsoft Purview, ChatGPT Teams, Notion, and other AI security and prompt management tools.",
  path: "/compare",
  keywords: [
    "TeamPrompt vs Nightfall",
    "AI DLP comparison",
    "best AI DLP tools",
    "prompt management tools comparison",
    "ChatGPT DLP alternatives",
  ],
});

const comparisons = [
  {
    slug: "nightfall",
    name: "Nightfall AI",
    tagline: "Enterprise DLP vs browser-first DLP",
    teamPromptWins: ["Browser extension (no proxy needed)", "Shared prompt library", "Free tier", "Self-serve setup"],
    otherWins: ["API-based scanning", "Slack/Jira DLP", "Broader SaaS coverage"],
  },
  {
    slug: "purview",
    name: "Microsoft Purview",
    tagline: "Microsoft ecosystem DLP vs cross-platform AI DLP",
    teamPromptWins: ["Works with ChatGPT, Claude, Gemini (not just Copilot)", "Prompt library + governance", "No Microsoft 365 E5 license required", "Setup in minutes"],
    otherWins: ["Deep Microsoft 365 integration", "Endpoint DLP", "Information protection labels"],
  },
  {
    slug: "chatgpt-teams",
    name: "ChatGPT Team Plan",
    tagline: "Single-vendor AI vs cross-platform governance",
    teamPromptWins: ["Works across ALL AI tools (not just ChatGPT)", "DLP scanning + data blocking", "19 compliance frameworks", "Shared prompt library with approvals"],
    otherWins: ["Native ChatGPT features", "GPT-4 access included", "Custom GPTs"],
  },
  {
    slug: "notion",
    name: "Notion",
    tagline: "General docs vs purpose-built prompt management",
    teamPromptWins: ["DLP scanning on prompts", "One-click insert into AI tools", "Approval workflows", "Usage analytics + compliance audit"],
    otherWins: ["General-purpose workspace", "Databases + wikis", "Broader team collaboration"],
  },
  {
    slug: "best-ai-dlp-tools",
    name: "Best AI DLP Tools 2026",
    tagline: "The complete guide to AI data loss prevention",
    teamPromptWins: ["Two-layer protection (network + browser)", "Prompt governance built-in", "Free tier + self-serve", "19 compliance packs"],
    otherWins: [],
  },
  {
    slug: "polymer",
    name: "Polymer",
    tagline: "Real-time AI prevention vs Slack/Drive/M365 DLP",
    teamPromptWins: ["Blocks data before send in ChatGPT/Claude/Gemini", "Built-in prompt library", "Network + browser two-layer defense", "Self-serve, free tier"],
    otherWins: ["Broader SaaS surface (Slack, Drive, M365)", "Strong classification engine for non-AI data", "Mature enterprise partnerships"],
  },
  {
    slug: "prompt-security",
    name: "Prompt Security",
    tagline: "Self-serve browser DLP vs enterprise reverse proxy",
    teamPromptWins: ["Deploys in 5 minutes (vs weeks for proxy setup)", "Free tier for teams under 3 users", "Combined prompt management + DLP", "Works on BYOD without network access"],
    otherWins: ["Proxy-level enforcement without browser extension", "Stronger inline prompt-injection blocking", "Better fit for strict endpoint policies"],
  },
  {
    slug: "lakera",
    name: "Lakera Guard",
    tagline: "DLP for teams vs API security for AI app builders",
    teamPromptWins: ["Protects employees using commercial AI tools", "Prompt management included", "Multi-tool coverage (ChatGPT/Claude/Gemini/Copilot)", "19 compliance frameworks"],
    otherWins: ["Right tool if you're BUILDING an LLM-powered product", "Industry-leading prompt-injection research", "API-first integration"],
  },
  {
    slug: "bigid",
    name: "BigID",
    tagline: "AI-specific DLP vs enterprise data discovery + DSPM",
    teamPromptWins: ["Purpose-built for ChatGPT/Claude/Gemini prompt DLP", "5-minute deploy vs multi-month BigID rollout", "Free tier removes procurement", "Prompt management bundled"],
    otherWins: ["Discovers and classifies data across the entire data estate", "DSPM and data minimization workflows", "Mature enterprise relationships"],
  },
  {
    slug: "cyberhaven",
    name: "Cyberhaven",
    tagline: "Browser-first AI DLP vs endpoint DLP + data lineage",
    teamPromptWins: ["No endpoint agent — just install the extension", "Free tier + transparent per-user pricing", "Prompt library included", "Purpose-built for AI prompts"],
    otherWins: ["Data lineage tracking across endpoints + SaaS", "Insider risk + UEBA", "Endpoint file-movement DLP"],
  },
  {
    slug: "witness-ai",
    name: "Witness AI",
    tagline: "Browser DLP vs network-level AI observability",
    teamPromptWins: ["Works on BYOD without network routing", "Free tier + 5-min deploy", "Prompt management included", "No SSL inspection complexity"],
    otherWins: ["Centralized network view across all AI tools", "Inline policy enforcement in the network path", "Fits environments with established SWG infrastructure"],
  },
];

export default function ComparePage() {
  // Pull the canonical list from COMPARISON_PAGES so hub + detail never drift.
  // Hardcoded `comparisons` above is used only for the curated win/lose bullets;
  // listed comparisons in schema come from the source of truth.
  const allComparisons = COMPARISON_PAGES.map((p) => p.slug);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Compare", url: `${SITE_URL}/compare` },
  ]);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Compare TeamPrompt — AI DLP & Prompt Management Alternatives",
    description:
      "Side-by-side comparisons of TeamPrompt vs Nightfall, Microsoft Purview, Polymer, Prompt Security, Lakera, ChatGPT Teams, Notion, and other AI DLP and prompt management tools.",
    url: `${SITE_URL}/compare`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: COMPARISON_PAGES.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/compare/${p.slug}`,
        name: p.title,
      })),
    },
  };
  void allComparisons;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <section
        className="border-b border-border pt-32 pb-20 sm:pt-40 sm:pb-28"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F6F2FF 50%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
            How TeamPrompt Compares
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            See how TeamPrompt stacks up against other AI security, DLP, and prompt management tools.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="block group rounded-[20px] border border-border bg-card p-8 hover:border-foreground/10 hover:shadow-lg hover:shadow-black/[0.03] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      TeamPrompt vs {c.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{c.tagline}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
                {c.teamPromptWins.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {c.teamPromptWins.slice(0, 3).map((win) => (
                      <span key={win} className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="h-3 w-3" />
                        {win}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GetStartedSteps />
      <LeadCaptureForm />
    </>
  );
}
