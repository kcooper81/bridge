import { useCasePages } from "./use-cases";
import { integrationPages } from "./integrations";
import { comparisonPages } from "./comparisons";
import type { SeoPageData } from "../types";

export const allSeoPages: SeoPageData[] = [
  ...useCasePages,
  ...integrationPages,
  ...comparisonPages,
];

export function getSeoPageBySlug(slug: string): SeoPageData | undefined {
  return allSeoPages.find((page) => page.slug === slug);
}
