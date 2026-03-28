import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { allSeoPages, getSeoPageBySlug } from "@/lib/seo-pages/data";
import { SeoLandingPage } from "../_components/seo-landing-page";

export function generateStaticParams() {
  return allSeoPages.map((page) => ({ slug: page.slug }));
}

// Only these solution pages are submitted in the sitemap for indexing.
// All others are noIndex to prevent Google "duplicate content" penalties.
const INDEXED_SOLUTIONS = new Set([
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
  // Role pages (getting impressions)
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
  // Glossary (already ranking)
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
  // Workflows (getting impressions)
  "content-creation-workflow",
  "investor-reporting-ai-workflow",
]);

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const page = getSeoPageBySlug(params.slug);
  if (!page) return {};

  return generatePageMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: `/solutions/${page.slug}`,
    keywords: page.meta.keywords,
    noIndex: !INDEXED_SOLUTIONS.has(page.slug),
  });
}

export default function Page({ params }: { params: { slug: string } }) {
  const page = getSeoPageBySlug(params.slug);
  if (!page) notFound();

  return <SeoLandingPage data={page} />;
}
