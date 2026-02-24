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
          "/collections",
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
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
