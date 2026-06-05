import { getSeoPageBySlug } from "@/lib/seo-pages/data";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "TeamPrompt — AI DLP and prompt management";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image({ params }: { params: { slug: string } }) {
  const page = getSeoPageBySlug(params.slug);
  return renderOgImage({
    eyebrow: "Solutions",
    title: page?.hero.headline || page?.meta.title || "TeamPrompt",
    subtitle: page?.hero.subtitle,
  });
}
