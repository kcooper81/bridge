import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/healthcare";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `${industryData.industry} AI DLP — HIPAA-Ready ChatGPT, Claude & Gemini Controls`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["healthcare AI", "HIPAA AI prompts", "clinical prompt templates"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
