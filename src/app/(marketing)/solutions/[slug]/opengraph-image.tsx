import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "TeamPrompt — AI DLP and prompt management";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// IMPORTANT: do NOT import getSeoPageBySlug / allSeoPages here. The 519-page
// data graph bloats this edge function past the 1 MB plan limit and the
// deploy fails. Render with a slug→title transform so the function stays
// lean. Distinctive-enough OG images per slug; no DB access needed at
// build/edge time.
function humanize(slug: string): string {
  return slug
    .replace(/^what-is-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Image({ params }: { params: { slug: string } }) {
  const human = humanize(params.slug);
  const isWhatIs = params.slug.startsWith("what-is-");
  return renderOgImage({
    eyebrow: isWhatIs ? "Glossary" : "Solutions",
    title: isWhatIs ? `What is ${human}?` : human,
    subtitle: "TeamPrompt — AI data loss prevention and prompt management for teams",
  });
}
