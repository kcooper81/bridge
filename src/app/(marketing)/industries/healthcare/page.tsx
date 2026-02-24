import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/healthcare";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `TeamPrompt for ${industryData.industry}`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["healthcare AI", "HIPAA AI prompts", "clinical prompt templates"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
