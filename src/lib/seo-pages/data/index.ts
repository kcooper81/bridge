import { useCasePages } from "./use-cases";
import { integrationPages } from "./integrations";
import { comparisonPages } from "./comparisons";
import { alternativePages } from "./alternatives";
import { guidePages } from "./guides";
import { workflowPages } from "./workflows";
import { rolePages } from "./roles";
import { templatePages } from "./templates";
import { dataProtectionPages } from "./data-protection";
import { compliancePages } from "./compliance";
import { policyPages } from "./policies";
import { featureDeepPages } from "./features-deep";
import { glossaryPages } from "./glossary";
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
  ...dataProtectionPages,
  ...compliancePages,
  ...policyPages,
  ...featureDeepPages,
  ...glossaryPages,
];

export function getSeoPageBySlug(slug: string): SeoPageData | undefined {
  return allSeoPages.find((page) => page.slug === slug);
}

export function getRelatedPages(slug: string, limit = 6): SeoPageData[] {
  const current = allSeoPages.find((p) => p.slug === slug);
  if (!current) return allSeoPages.slice(0, limit);

  const sameCategory = allSeoPages.filter(
    (p) => p.slug !== slug && p.category === current.category
  );
  const otherCategories = allSeoPages.filter(
    (p) => p.slug !== slug && p.category !== current.category
  );

  return [...sameCategory, ...otherCategories].slice(0, limit);
}
