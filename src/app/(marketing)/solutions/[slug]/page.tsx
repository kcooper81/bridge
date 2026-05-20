import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { allSeoPages, getSeoPageBySlug, isIndexableSolution } from "@/lib/seo-pages/data";
import { SeoLandingPage } from "../_components/seo-landing-page";
import { getRelatedBySimilarity, type RelatedItem } from "@/lib/content-embeddings";

export function generateStaticParams() {
  return allSeoPages.map((page) => ({ slug: page.slug }));
}

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
    noIndex: !isIndexableSolution(page.slug),
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = getSeoPageBySlug(params.slug);
  if (!page) notFound();

  // AI-driven related content — embeddings-based similarity to other indexable
  // pieces. Empty array on first deploy before embeddings are computed.
  let aiRelated: RelatedItem[] = [];
  if (isIndexableSolution(page.slug)) {
    try {
      aiRelated = await getRelatedBySimilarity(page.slug, 4);
    } catch {
      aiRelated = [];
    }
  }

  return <SeoLandingPage data={page} aiRelated={aiRelated} />;
}
