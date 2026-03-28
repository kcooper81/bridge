import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";

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
];

export default function ComparePage() {
  return (
    <>
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
