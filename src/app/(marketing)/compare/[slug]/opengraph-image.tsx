import { getComparisonBySlug } from "./_data";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "TeamPrompt comparison";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image({ params }: { params: { slug: string } }) {
  const page = getComparisonBySlug(params.slug);
  return renderOgImage({
    eyebrow: "Compare",
    title: page ? page.title : "TeamPrompt Comparison",
    subtitle: page?.metaDescription,
  });
}
