import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/insurance";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `${industryData.industry} AI DLP — Block PHI, Claims & Underwriting Data in AI Prompts`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["insurance AI", "claims processing AI", "underwriting prompts", "insurance compliance"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
