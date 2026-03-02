export type SeoCategory =
  | "comparison"
  | "use-case"
  | "integration"
  | "alternative"
  | "guide"
  | "workflow"
  | "role"
  | "template"
  | "platform";

export interface SeoContentSection {
  type:
    | "checklist"
    | "comparison-table"
    | "how-it-works"
    | "prose"
    | "use-cases-grid";
  heading: string;
  content: Record<string, unknown>;
}

export interface SeoPageData {
  slug: string;
  category: SeoCategory;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  hero: {
    headline: string;
    subtitle: string;
    badges?: string[];
  };
  features?: {
    sectionLabel: string;
    heading: string;
    items: { icon: string; title: string; description: string }[];
  };
  benefits?: {
    heading: string;
    items: string[];
  };
  sections?: SeoContentSection[];
  stats?: { value: string; label: string }[];
  faqs?: { question: string; answer: string }[];
  cta: {
    headline: string;
    gradientText: string;
    subtitle: string;
  };
}
