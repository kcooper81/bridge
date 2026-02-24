import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const BASE_KEYWORDS = [
  "prompt management",
  "AI prompts",
  "team prompts",
  "TeamPrompt",
  "AI governance",
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
      images: [
        {
          url: `${SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "TeamPrompt — AI Prompt Management for Teams",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-default.png`],
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
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
