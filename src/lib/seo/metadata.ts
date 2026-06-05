import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const BASE_KEYWORDS = [
  "AI DLP",
  "AI data loss prevention",
  "AI governance",
  "TeamPrompt",
  "sensitive data protection",
  "prompt management",
];

export function generatePageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const mergedKeywords = Array.from(new Set([...keywords, ...BASE_KEYWORDS]));

  return {
    title,
    description,
    keywords: mergedKeywords,
    authors: [{ name: "TeamPrompt" }],
    creator: "TeamPrompt",
    publisher: "TeamPrompt",
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "TeamPrompt",
      locale: "en_US",
      // No explicit `images` here — Next.js auto-discovers opengraph-image.tsx
      // from the route segment (and falls back to the root opengraph-image.tsx).
      // This was previously hardcoded to og-default.png, which silently
      // overrode every per-route OG image we added (compare/[slug],
      // compliance/[framework], solutions/[slug]).
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@teampromptapp",
      creator: "@teampromptapp",
      // Same — Next.js uses twitter-image.tsx if present, otherwise the
      // route's opengraph-image.tsx, otherwise the root fallback.
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      // `follow: true` even when noindex — Google should still crawl through
      // these pages and pass link equity to indexed siblings. `nofollow` here
      // would dead-end the ~480 thin /solutions/* pages and cut PageRank flow
      // to the core indexed pages.
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}
