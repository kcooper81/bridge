import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { BusinessPlan } from "./_components/business-plan";

export const metadata: Metadata = generatePageMetadata({
  title: "Business Plan — TeamPrompt",
  description: "TeamPrompt 18-month proforma, unit economics, and growth strategy.",
  path: "/pitch/plan",
  noIndex: true,
});

export default function BusinessPlanPage() {
  return <BusinessPlan />;
}
