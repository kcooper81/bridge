import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/technology";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `TeamPrompt for ${industryData.industry}`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["tech team AI", "developer prompt library", "engineering AI governance"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
