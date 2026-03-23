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
