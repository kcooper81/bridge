import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  return [
    { url: baseUrl, lastModified: "2026-02-19", changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: "2026-02-19", changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/features`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/security`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/enterprise`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/help`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/media`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/industries/healthcare`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/industries/legal`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/industries/technology`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/industries/finance`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/industries/government`, lastModified: "2026-02-19", changeFrequency: "monthly", priority: 0.7 },
  ];
}
