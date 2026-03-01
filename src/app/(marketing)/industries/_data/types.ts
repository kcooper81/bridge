export interface IndustryMockupItem {
  title: string;
  badge?: string;
  stat?: string;
  iconColor?: "blue" | "red" | "green" | "amber" | "purple" | "cyan";
  highlight?: "block" | "warn" | "shared" | "new";
  subtitle?: string;
}

export interface IndustryPageData {
  slug: string;
  industry: string;
  headline: string;
  subtitle: string;
  compliance: string[];
  painPoints: { title: string; description: string }[];
  features: { icon: string; title: string; description: string }[];
  mockupVariant: "vault" | "guardrails" | "guidelines";
  mockupItems: IndustryMockupItem[];
  mockupUser: { name: string; initials: string };
  mockupAlert?: { type: "block" | "warn"; message: string };
  mockupToasts?: { message: string; type: "block" | "warn" | "shared" | "success"; position?: "bottom-right" | "top-right" }[];
  mockupNavBadges?: Record<string, number>;
  stats: { value: string; label: string }[];
  faqs: { question: string; answer: string }[];
  cta: { headline: string; gradientText: string; subtitle: string };
}
