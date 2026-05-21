import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { industryData } from "../_data/education";
import { IndustryPage } from "../_components/industry-page";

export const metadata: Metadata = generatePageMetadata({
  title: `${industryData.industry} AI DLP — FERPA-Aligned Student Data Controls for ChatGPT`,
  description: industryData.subtitle,
  path: `/industries/${industryData.slug}`,
  keywords: ["education AI", "FERPA AI prompts", "curriculum prompt templates", "student data protection"],
});

export default function Page() {
  return <IndustryPage data={industryData} />;
}
