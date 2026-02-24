export interface SeoPageData {
  slug: string;
  category: "use-case" | "integration" | "comparison";
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
  stats?: { value: string; label: string }[];
  faqs?: { question: string; answer: string }[];
  cta: {
    headline: string;
    gradientText: string;
    subtitle: string;
  };
}
