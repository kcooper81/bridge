import type { PlanLimits, PlanTier, GuidelineRules } from "./types";

export const SUPER_ADMIN_EMAILS = [
  "admin@teamprompt.app",
  "harisharmaofficialldn@gmail.com",
];

export type SuperAdminRole = "super_admin" | "support";

/** All admin pages that can be granted to support staff */
export const ADMIN_PAGES = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/tickets", label: "Tickets & Email" },
  { href: "/admin/errors", label: "Error Logs" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/activity", label: "Activity Logs" },
  { href: "/admin/testing-guide", label: "Testing Guide" },
  { href: "/admin/settings/inbox", label: "Inbox Settings" },
  { href: "/admin/settings", label: "Settings" },
] as const;

/** Default pages support staff can access when no custom config is set */
export const DEFAULT_SUPPORT_PAGES = ["/admin/tickets", "/admin/testing-guide"];

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
    max_members: 1,
    max_ai_tools: 3,
    max_guidelines: 5,
    analytics: false,
    import_export: false,
    basic_security: true,
    custom_security: false,
    audit_log: false,
    bulk_import: false,
    bulk_role_assignment: false,
    custom_welcome_email: false,
    domain_auto_join: false,
    google_workspace_sync: false,
    priority_support: false,
    sla: false,
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
    custom_security: false,
    audit_log: false,
    bulk_import: false,
    bulk_role_assignment: false,
    custom_welcome_email: false,
    domain_auto_join: false,
    google_workspace_sync: false,
    priority_support: false,
    sla: false,
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
    bulk_import: true,
    bulk_role_assignment: true,
    custom_welcome_email: true,
    domain_auto_join: true,
    google_workspace_sync: false,
    priority_support: false,
    sla: false,
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
    bulk_import: true,
    bulk_role_assignment: true,
    custom_welcome_email: true,
    domain_auto_join: true,
    google_workspace_sync: true,
    priority_support: true,
    sla: true,
  },
};

export interface PlanDisplayInfo {
  name: string;
  /** e.g. "$0", "$9/mo", "$7/user/mo" — used for display & price parsing */
  price: string;
  annualPrice: string;
  annualMonthly: string;
  /** Short marketing-friendly tagline */
  description: string;
  popular?: boolean;
  /** Numeric price for monthly billing (e.g. "$9") */
  monthlyPrice: string;
  /** Numeric price for annual billing shown monthly (e.g. "$7") */
  annualMonthlyPrice: string;
  /** Price period label for monthly (e.g. "/month", "/user/month", "forever") */
  period: string;
  /** Price period label for annual */
  annualPeriod: string;
  /** CTA button text */
  cta: string;
  /** Signup link */
  href: string;
  /** Feature comparison — string values show as "Feature: value", booleans show check/x */
  features: Record<string, string | boolean>;
}

export const PLAN_DISPLAY: Record<PlanTier, PlanDisplayInfo> = {
  free: {
    name: "Free",
    price: "$0",
    annualPrice: "$0",
    annualMonthly: "$0",
    monthlyPrice: "$0",
    annualMonthlyPrice: "$0",
    period: "forever",
    annualPeriod: "forever",
    description: "For trying it out",
    cta: "Start Free",
    href: "/signup",
    features: {
      Prompts: "25",
      Members: "1",
      Guidelines: "5",
      "Basic Data Protection": true,
      "Custom Security Rules": false,
      "Admin Security Settings": false,
      "Security Activity Log": false,
      Analytics: false,
      "Import/Export": false,
      "Bulk CSV Import": false,
      "Domain Auto-Join": false,
      "Compliance Rule Packs": false,
      "Auto-Replace Sensitive Data": false,
      "Approval Queue": false,
      "Version History & Diff": true,
      "Priority Support": false,
      "SLA Guarantee": false,
      "Browser Extension": true,
    },
  },
  pro: {
    name: "Pro",
    price: "$9/mo",
    annualPrice: "$86/yr",
    annualMonthly: "$7/mo",
    monthlyPrice: "$9",
    annualMonthlyPrice: "$7",
    period: "/month",
    annualPeriod: "/month",
    description: "For solo power users",
    cta: "Start 14-Day Trial",
    href: "/signup?plan=pro",
    features: {
      Prompts: "Unlimited",
      Members: "1",
      Guidelines: "All 14",
      "Basic Data Protection": true,
      "Custom Security Rules": false,
      "Admin Security Settings": false,
      "Security Activity Log": false,
      Analytics: true,
      "Import/Export": true,
      "Bulk CSV Import": false,
      "Domain Auto-Join": false,
      "Compliance Rule Packs": false,
      "Auto-Replace Sensitive Data": false,
      "Approval Queue": false,
      "Version History & Diff": true,
      "Priority Support": false,
      "SLA Guarantee": false,
      "Browser Extension": true,
    },
  },
  team: {
    name: "Team",
    price: "$7/user/mo",
    annualPrice: "$67/user/yr",
    annualMonthly: "$5.60/user/mo",
    monthlyPrice: "$7",
    annualMonthlyPrice: "$5.60",
    period: "/user/month",
    annualPeriod: "/user/month",
    description: "For growing teams",
    popular: true,
    cta: "Start 14-Day Trial",
    href: "/signup?plan=team",
    features: {
      Prompts: "Unlimited",
      Members: "Up to 50",
      Guidelines: "All 14",
      "Basic Data Protection": true,
      "Custom Security Rules": true,
      "Admin Security Settings": true,
      "Security Activity Log": true,
      Analytics: true,
      "Import/Export": true,
      "Bulk CSV Import": true,
      "Domain Auto-Join": true,
      "Compliance Rule Packs": true,
      "Auto-Replace Sensitive Data": true,
      "Approval Queue": true,
      "Version History & Diff": true,
      "Priority Support": false,
      "SLA Guarantee": false,
      "Browser Extension": true,
    },
  },
  business: {
    name: "Business",
    price: "$12/user/mo",
    annualPrice: "$115/user/yr",
    annualMonthly: "$9.60/user/mo",
    monthlyPrice: "$12",
    annualMonthlyPrice: "$9.60",
    period: "/user/month",
    annualPeriod: "/user/month",
    description: "For large organizations",
    cta: "Get Started",
    href: "/signup?plan=business",
    features: {
      Prompts: "Unlimited",
      Members: "Up to 500",
      Guidelines: "Unlimited",
      "Basic Data Protection": true,
      "Custom Security Rules": true,
      "Admin Security Settings": true,
      "Security Activity Log": true,
      Analytics: true,
      "Import/Export": true,
      "Bulk CSV Import": true,
      "Domain Auto-Join": true,
      "Google Workspace Sync": true,
      "Compliance Rule Packs": true,
      "Auto-Replace Sensitive Data": true,
      "Approval Queue": true,
      "Version History & Diff": true,
      "Priority Support": true,
      "SLA Guarantee": true,
      "Browser Extension": true,
    },
  },
};

/** Plan order for pricing displays */
export const PLAN_ORDER: PlanTier[] = ["free", "pro", "team", "business"];

export const GUIDELINE_CATEGORIES = [
  { value: "writing",     label: "Writing" },
  { value: "development", label: "Development" },
  { value: "design",      label: "Design & Creative" },
  { value: "support",     label: "Customer Support" },
  { value: "marketing",   label: "Marketing" },
  { value: "sales",       label: "Sales" },
  { value: "hr",          label: "HR & People" },
  { value: "legal",       label: "Legal & Compliance" },
  { value: "executive",   label: "Executive" },
  { value: "analytics",   label: "Data & Analytics" },
  { value: "product",     label: "Product Management" },
  { value: "research",    label: "Research & Strategy" },
  { value: "education",   label: "Education & Training" },
  { value: "internal",    label: "Internal Comms" },
] as const;

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
      bestPractices: ["Include clear objectives", "Define target audience"],
      restrictions: ["Avoid jargon without explanation", "No run-on sentences"],
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
      bestPractices: [
        "Specify programming language",
        "Include expected input/output",
      ],
      restrictions: ["Avoid ambiguous requirements"],
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
      bestPractices: ["Specify style references", "Include dimensions or format"],
      restrictions: ["Avoid vague descriptions"],
    },
  },
  {
    id: "std-support",
    name: "Customer Support",
    description: "Customer-facing communication standards",
    category: "support",
    rules: {
      toneRules: ["Be empathetic", "Use friendly tone"],
      bestPractices: ["Address the customer's concern", "Offer solutions"],
      restrictions: ["Never blame the customer", "Avoid technical jargon"],
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
      bestPractices: ["Include call-to-action", "Define target audience"],
      restrictions: ["Avoid misleading claims"],
    },
  },
  {
    id: "std-sales",
    name: "Sales Communication",
    description: "Sales outreach and communication standards",
    category: "sales",
    rules: {
      toneRules: ["Be professional and personable"],
      bestPractices: ["Highlight value propositions", "Include follow-up steps"],
      restrictions: ["Avoid high-pressure tactics"],
    },
  },
  {
    id: "std-hr",
    name: "HR & People",
    description: "Human resources communication standards",
    category: "hr",
    rules: {
      toneRules: ["Be inclusive and respectful"],
      bestPractices: ["Follow company policy", "Use neutral language"],
      restrictions: ["Avoid discriminatory language"],
    },
  },
  {
    id: "std-legal",
    name: "Legal & Compliance",
    description: "Legal document and compliance standards",
    category: "legal",
    rules: {
      toneRules: ["Be precise and formal"],
      bestPractices: ["Reference applicable regulations", "Use standard legal terms"],
      restrictions: ["Avoid informal language", "No ambiguous terms"],
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
      bestPractices: ["Lead with key insights", "Include actionable recommendations"],
      restrictions: ["Avoid unnecessary details"],
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
      bestPractices: ["Specify data sources", "Define metrics"],
      restrictions: ["Avoid assumptions without data"],
    },
  },
  {
    id: "std-product",
    name: "Product Management",
    description: "Product management communication standards",
    category: "product",
    rules: {
      toneRules: ["Be clear and user-focused"],
      bestPractices: ["Include user stories", "Define acceptance criteria"],
      restrictions: ["Avoid scope creep"],
    },
  },
  {
    id: "std-research",
    name: "Research & Strategy",
    description: "Research and strategic planning standards",
    category: "research",
    rules: {
      toneRules: ["Be thorough and evidence-based"],
      bestPractices: ["Cite sources", "Include methodology"],
      restrictions: ["Avoid unsupported conclusions"],
    },
  },
  {
    id: "std-training",
    name: "Training & Education",
    description: "Educational content and training standards",
    category: "education",
    rules: {
      toneRules: ["Be instructional and encouraging"],
      bestPractices: ["Include learning objectives", "Use examples"],
      restrictions: ["Avoid condescending tone"],
    },
  },
  {
    id: "std-internal",
    name: "Internal Communications",
    description: "Internal company communication standards",
    category: "internal",
    rules: {
      toneRules: ["Be transparent and direct"],
      bestPractices: ["State purpose clearly", "Include next steps"],
      restrictions: ["Avoid corporate buzzwords"],
    },
  },
];
