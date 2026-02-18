import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "government",
  industry: "Government",
  headline: "Secure AI prompt management for government agencies",
  subtitle:
    "Give your teams a managed AI workflow with guardrails that protect citizen data, classified information, and internal policy.",
  compliance: ["PII Detection", "Audit Logging", "Access Control"],
  painPoints: [
    {
      title: "Staff paste citizen PII into AI tools",
      description:
        "Social Security numbers, addresses, case details, and benefits information end up in commercial AI systems with no controls, violating federal data protection mandates.",
    },
    {
      title: "Sensitive and classified information at risk",
      description:
        "Internal policy language, law enforcement data, and inter-agency communications get copied into AI prompts. One leak can become a national security incident.",
    },
    {
      title: "No standardized AI usage policy across agencies",
      description:
        "Each department uses AI differently with no shared standards, no approved templates, and no visibility into what data is being shared with external AI providers.",
    },
  ],
  features: [
    {
      icon: "ShieldCheck",
      title: "PII & Classified Data Guardrails",
      description:
        "Automatically detect Social Security numbers, case file references, law enforcement identifiers, and sensitive government terminology before any prompt reaches an AI model.",
    },
    {
      icon: "BookOpen",
      title: "Government Writing Guidelines",
      description:
        "Embed plain language standards, agency style guides, and federal communication requirements directly into prompt templates. Ensure every AI-assisted document meets government writing standards.",
    },
    {
      icon: "ClipboardList",
      title: "Immutable Audit Log",
      description:
        "Comprehensive logging of every AI interaction — user, agency, timestamp, and action taken. Generate reports and respond to oversight inquiries with complete records of AI usage.",
    },
    {
      icon: "Building2",
      title: "Agency & Department Structure",
      description:
        "Mirror your organizational hierarchy in TeamPrompt. Separate prompt libraries by agency, bureau, and division with role-based access that respects existing clearance levels and need-to-know policies.",
    },
  ],
  mockupVariant: "vault",
  mockupItems: [
    {
      title: "Policy Brief Generator",
      badge: "Approved",
      stat: "Used 267 times",
    },
    {
      title: "Constituent Response Draft",
      badge: "Approved",
      stat: "Used 341 times",
    },
    {
      title: "FOIA Request Summary",
      badge: "Approved",
      stat: "Used 189 times",
    },
    {
      title: "Internal Memo Template",
      badge: "Approved",
      stat: "Used 214 times",
    },
  ],
  mockupUser: { name: "S. Rivera", initials: "SR" },
  stats: [
    { value: "15+", label: "Built-in detection patterns" },
    { value: "100%", label: "Interaction audit coverage" },
    { value: "5", label: "AI tools monitored" },
  ],
  faqs: [
    {
      question: "Is TeamPrompt suitable for government agencies?",
      answer:
        "TeamPrompt provides guardrails that detect PII, sensitive terminology, and classification markings before they reach AI tools. All data is encrypted at rest and in transit. We are working toward FedRAMP authorization and other federal compliance certifications. Contact our team to discuss your agency's specific requirements.",
    },
    {
      question:
        "How does TeamPrompt prevent classified information from reaching AI models?",
      answer:
        "TeamPrompt's guardrails detect classification markings (CUI, FOUO, SBU, etc.), sensitive government terminology, and patterns associated with classified data. Prompts containing detected content are blocked before submission. Agencies can add custom detection patterns for internal classification schemes and sensitive program names.",
    },
    {
      question: "Can we deploy TeamPrompt within our agency's existing IT environment?",
      answer:
        "TeamPrompt's Chrome extension can be force-installed via Google Admin Console, Microsoft Intune, or GPO — ensuring every managed browser has guardrails from day one. SSO and SCIM provisioning are on our roadmap. Contact our team to discuss your deployment requirements.",
    },
    {
      question: "Can we export audit logs for records retention?",
      answer:
        "TeamPrompt's audit logs record all AI interactions with timestamps, user identity, and actions taken. Logs can be filtered by user, date, or AI tool and exported for your agency's records retention processes.",
    },
  ],
  cta: {
    headline: "Your agency staff are already using AI.",
    gradientText: "Secure it for government.",
    subtitle:
      "Deploy TeamPrompt for your agency in under 5 minutes — no ATO bottleneck.",
  },
};
