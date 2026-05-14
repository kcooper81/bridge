import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { allSeoPages, getSeoPageBySlug, isIndexableSolution } from "@/lib/seo-pages/data";
import { SeoLandingPage } from "../_components/seo-landing-page";

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

export default function Page({ params }: { params: { slug: string } }) {
  const page = getSeoPageBySlug(params.slug);
  if (!page) notFound();

  return <SeoLandingPage data={page} />;
}
