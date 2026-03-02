import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
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
        ],
      },
      { userAgent: "GPTBot", allow: "/", crawlDelay: 1 },
      { userAgent: "ChatGPT-User", allow: "/", crawlDelay: 1 },
      { userAgent: "Google-Extended", allow: "/", crawlDelay: 1 },
      { userAgent: "anthropic-ai", allow: "/", crawlDelay: 1 },
      { userAgent: "Claude-Web", allow: "/", crawlDelay: 1 },
      { userAgent: "PerplexityBot", allow: "/", crawlDelay: 1 },
      { userAgent: "Meta-ExternalAgent", allow: "/", crawlDelay: 1 },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
