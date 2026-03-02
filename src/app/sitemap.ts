import { MetadataRoute } from "next";
import { allSeoPages } from "@/lib/seo-pages/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
  const today = new Date().toISOString().split("T")[0];

  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/features`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/security`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/enterprise`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/integrations`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/solutions`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/help`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/media`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: today, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: today, changeFrequency: "monthly", priority: 0.4 },
  ];

  const industrySlugs = ["healthcare", "legal", "technology", "finance", "government"];
  const industryPages: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const seoPages: MetadataRoute.Sitemap = allSeoPages.map((page) => ({
    url: `${baseUrl}/solutions/${page.slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Deduplicate by URL (strip trailing slashes)
  const all = [...corePages, ...industryPages, ...seoPages];
  const seen = new Set<string>();
  return all.filter((entry) => {
    const normalized = entry.url.replace(/\/+$/, "");
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
