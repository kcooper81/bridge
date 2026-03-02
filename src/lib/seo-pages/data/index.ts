import { useCasePages } from "./use-cases";
import { integrationPages } from "./integrations";
import { comparisonPages } from "./comparisons";
import { alternativePages } from "./alternatives";
import { guidePages } from "./guides";
import { workflowPages } from "./workflows";
import { rolePages } from "./roles";
import { templatePages } from "./templates";
import type { SeoPageData } from "../types";

export const allSeoPages: SeoPageData[] = [
  ...useCasePages,
  ...integrationPages,
  ...comparisonPages,
  ...alternativePages,
  ...guidePages,
  ...workflowPages,
  ...rolePages,
  ...templatePages,
];

export function getSeoPageBySlug(slug: string): SeoPageData | undefined {
  return allSeoPages.find((page) => page.slug === slug);
}
