import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/finance";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `${industryData.industry} AI DLP — Block MNPI, Account Numbers & PCI Data in AI Prompts`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["finance AI", "financial data protection", "banking AI prompts"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
