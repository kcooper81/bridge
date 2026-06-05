import { getFrameworkBySlug } from "./_data";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "TeamPrompt compliance framework";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image({ params }: { params: { framework: string } }) {
  const fw = getFrameworkBySlug(params.framework);
  return renderOgImage({
    eyebrow: "Compliance",
    title: fw ? `${fw.name} for AI Tools` : "AI Compliance",
    subtitle: fw?.metaDescription,
    accent: "#a855f7",
  });
}
