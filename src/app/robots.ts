import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/vault", "/collections", "/standards", "/team", "/security-shield", "/analytics", "/import-export", "/settings"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
