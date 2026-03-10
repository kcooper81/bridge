import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  const privateRoutes = [
    "/api/",
    "/home",
    "/vault",
    "/templates",
    "/guidelines",
    "/team",
    "/guardrails",
    "/analytics",
    "/activity",
    "/import-export",
    "/settings",
    "/admin",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/invite",
    "/auth/",
    "/media",
    "/pitch",
  ];

  return {
    rules: [
      // Default rule for all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
      // AI search/retrieval bots — allow public, block private
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "Claude-User",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "Perplexity-User",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      // AI training bots — allow for maximum brand visibility
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      {
        userAgent: "Meta-ExternalAgent",
        allow: "/",
        disallow: privateRoutes,
        crawlDelay: 1,
      },
      // Block known bad actors
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
