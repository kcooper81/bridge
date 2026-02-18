export interface IndustryPageData {
  slug: string;
  industry: string;
  headline: string;
  subtitle: string;
  compliance: string[];
  painPoints: { title: string; description: string }[];
  features: { icon: string; title: string; description: string }[];
  mockupVariant: "vault" | "guardrails" | "guidelines";
  mockupItems: { title: string; badge?: string; stat?: string }[];
  mockupUser: { name: string; initials: string };
  mockupAlert?: { type: "block" | "warn"; message: string };
  stats: { value: string; label: string }[];
  faqs: { question: string; answer: string }[];
  cta: { headline: string; gradientText: string; subtitle: string };
}
