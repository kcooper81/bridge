import type { PlanLimits, PlanTier, GuidelineRules } from "./types";

export const SITE_NAME = "TeamPrompt";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export const VAULT_PAGE_SIZE = 25;

export const TONE_OPTIONS = [
  "professional",
  "casual",
  "formal",
  "friendly",
  "technical",
  "creative",
  "persuasive",
  "empathetic",
  "authoritative",
  "conversational",
  "instructional",
  "analytical",
] as const;

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    plan: "free",
    max_prompts: 25,
    max_members: 3,
    max_ai_tools: 3,
    max_guidelines: 5,
    analytics: false,
    import_export: false,
    basic_security: true,
    custom_security: false,
    audit_log: false,
  },
  pro: {
    plan: "pro",
    max_prompts: -1,
    max_members: 1,
    max_ai_tools: -1,
    max_guidelines: 14,
    analytics: true,
    import_export: true,
    basic_security: true,
    custom_security: true,
    audit_log: false,
  },
  team: {
    plan: "team",
    max_prompts: -1,
    max_members: 50,
    max_ai_tools: -1,
    max_guidelines: 14,
    analytics: true,
    import_export: true,
    basic_security: true,
    custom_security: true,
    audit_log: true,
  },
  business: {
    plan: "business",
    max_prompts: -1,
    max_members: 500,
    max_ai_tools: -1,
    max_guidelines: -1,
    analytics: true,
    import_export: true,
    basic_security: true,
    custom_security: true,
    audit_log: true,
  },
};

export const PLAN_DISPLAY: Record<
  PlanTier,
  {
    name: string;
    price: string;
    annualPrice: string;
    annualMonthly: string;
    description: string;
  }
> = {
  free: {
    name: "Free",
    price: "$0",
    annualPrice: "$0",
    annualMonthly: "$0",
    description: "For individuals getting started",
  },
  pro: {
    name: "Pro",
    price: "$9/mo",
    annualPrice: "$86/yr",
    annualMonthly: "$7/mo",
    description: "For power users and solopreneurs",
  },
  team: {
    name: "Team",
    price: "$7/user/mo",
    annualPrice: "$67/user/yr",
    annualMonthly: "$5.60/user/mo",
    description: "For growing teams",
  },
  business: {
    name: "Business",
    price: "$12/user/mo",
    annualPrice: "$115/user/yr",
    annualMonthly: "$9.60/user/mo",
    description: "For large organizations",
  },
};

export interface DefaultGuideline {
  id: string;
  name: string;
  description: string;
  category: string;
  rules: GuidelineRules;
}

export const DEFAULT_GUIDELINES: DefaultGuideline[] = [
  {
    id: "std-writing",
    name: "Writing",
    description: "General writing quality standards",
    category: "writing",
    rules: {
      toneRules: ["Use active voice", "Be concise"],
      doList: ["Include clear objectives", "Define target audience"],
      dontList: ["Avoid jargon without explanation", "No run-on sentences"],
      constraints: ["Keep prompts focused on a single task"],
      minLength: 20,
      maxLength: 5000,
    },
  },
  {
    id: "std-coding",
    name: "Coding",
    description: "Standards for code-related prompts",
    category: "development",
    rules: {
      toneRules: ["Be precise and technical"],
      doList: [
        "Specify programming language",
        "Include expected input/output",
      ],
      dontList: ["Avoid ambiguous requirements"],
      requiredFields: ["title", "content"],
      minLength: 30,
    },
  },
  {
    id: "std-design",
    name: "Design & Creative",
    description: "Creative and design prompt standards",
    category: "design",
    rules: {
      toneRules: ["Be descriptive and visual"],
      doList: ["Specify style references", "Include dimensions or format"],
      dontList: ["Avoid vague descriptions"],
    },
  },
  {
    id: "std-support",
    name: "Customer Support",
    description: "Customer-facing communication standards",
    category: "support",
    rules: {
      toneRules: ["Be empathetic", "Use friendly tone"],
      doList: ["Address the customer's concern", "Offer solutions"],
      dontList: ["Never blame the customer", "Avoid technical jargon"],
      requiredTags: ["support"],
    },
  },
  {
    id: "std-marketing",
    name: "Marketing & Content",
    description: "Marketing content standards",
    category: "marketing",
    rules: {
      toneRules: ["Be persuasive but authentic"],
      doList: ["Include call-to-action", "Define target audience"],
      dontList: ["Avoid misleading claims"],
    },
  },
  {
    id: "std-sales",
    name: "Sales Communication",
    description: "Sales outreach and communication standards",
    category: "sales",
    rules: {
      toneRules: ["Be professional and personable"],
      doList: ["Highlight value propositions", "Include follow-up steps"],
      dontList: ["Avoid high-pressure tactics"],
    },
  },
  {
    id: "std-hr",
    name: "HR & People",
    description: "Human resources communication standards",
    category: "hr",
    rules: {
      toneRules: ["Be inclusive and respectful"],
      doList: ["Follow company policy", "Use neutral language"],
      dontList: ["Avoid discriminatory language"],
    },
  },
  {
    id: "std-legal",
    name: "Legal & Compliance",
    description: "Legal document and compliance standards",
    category: "legal",
    rules: {
      toneRules: ["Be precise and formal"],
      doList: ["Reference applicable regulations", "Use standard legal terms"],
      dontList: ["Avoid informal language", "No ambiguous terms"],
      requiredFields: ["title", "content", "description"],
    },
  },
  {
    id: "std-executive",
    name: "Executive Communication",
    description: "C-suite and leadership communication standards",
    category: "executive",
    rules: {
      toneRules: ["Be authoritative and concise"],
      doList: ["Lead with key insights", "Include actionable recommendations"],
      dontList: ["Avoid unnecessary details"],
      maxLength: 3000,
    },
  },
  {
    id: "std-data",
    name: "Data & Analytics",
    description: "Data analysis prompt standards",
    category: "analytics",
    rules: {
      toneRules: ["Be analytical and objective"],
      doList: ["Specify data sources", "Define metrics"],
      dontList: ["Avoid assumptions without data"],
    },
  },
  {
    id: "std-product",
    name: "Product Management",
    description: "Product management communication standards",
    category: "product",
    rules: {
      toneRules: ["Be clear and user-focused"],
      doList: ["Include user stories", "Define acceptance criteria"],
      dontList: ["Avoid scope creep"],
    },
  },
  {
    id: "std-research",
    name: "Research & Strategy",
    description: "Research and strategic planning standards",
    category: "research",
    rules: {
      toneRules: ["Be thorough and evidence-based"],
      doList: ["Cite sources", "Include methodology"],
      dontList: ["Avoid unsupported conclusions"],
    },
  },
  {
    id: "std-training",
    name: "Training & Education",
    description: "Educational content and training standards",
    category: "education",
    rules: {
      toneRules: ["Be instructional and encouraging"],
      doList: ["Include learning objectives", "Use examples"],
      dontList: ["Avoid condescending tone"],
    },
  },
  {
    id: "std-internal",
    name: "Internal Communications",
    description: "Internal company communication standards",
    category: "internal",
    rules: {
      toneRules: ["Be transparent and direct"],
      doList: ["State purpose clearly", "Include next steps"],
      dontList: ["Avoid corporate buzzwords"],
    },
  },
];
