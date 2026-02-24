import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/government";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `TeamPrompt for ${industryData.industry}`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["government AI", "public sector AI prompts", "government AI compliance"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
