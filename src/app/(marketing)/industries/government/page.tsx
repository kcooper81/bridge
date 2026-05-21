import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/government";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `${industryData.industry} AI DLP — Block CUI, Classified Markings & Citizen PII`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["government AI", "public sector AI prompts", "government AI compliance"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
