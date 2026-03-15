import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "government",
  industry: "Government",
  headline: "Secure AI prompt management for government agencies",
  subtitle:
    "Detect and block classified markings, CUI, and citizen PII before staff send it to AI. Shared prompt library for policy, constituent services, and inter-agency teams.",
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
      title: "PII & Classified Data Protection",
      description:
        "Automatically detect Social Security numbers, case file references, law enforcement identifiers, and sensitive government terminology before any prompt reaches an AI model.",
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
    { title: "Policy Brief Generator", badge: "Approved", stat: "267 uses", iconColor: "green", subtitle: "Executive · 4.8★" },
    { title: "Constituent Response Draft", badge: "Approved", stat: "341 uses", iconColor: "blue", subtitle: "Public Affairs · 4.6★", highlight: "shared" },
    { title: "FOIA Request Summary", badge: "Approved", stat: "189 uses", iconColor: "amber", subtitle: "Legal" },
    { title: "Internal Memo Template", badge: "Approved", stat: "214 uses", iconColor: "purple", subtitle: "Admin · 4.5★" },
  ],
  mockupUser: { name: "S. Rivera", initials: "SR" },
  scenario: {
    title: "What this looks like in practice",
    persona: "Maria, constituent services staffer",
    setup:
      "Maria is drafting a public response to a constituent inquiry and pastes an internal memo into an AI tool for help with the wording. The memo contains two citizen Social Security numbers.",
    trigger:
      "TeamPrompt catches the SSN patterns (XXX-XX-XXXX) before the prompt is submitted. The prompt is blocked and Maria sees which lines triggered the detection.",
    resolution:
      "Maria removes the SSNs, rewrites the prompt with anonymized details, and gets her response draft. The blocked event is logged for the agency's compliance review.",
  },
  stats: [
    { value: "15", label: "Built-in DLP rules" },
    { value: "5", label: "AI tools protected" },
    { value: "6", label: "One-click compliance packs" },
  ],
  faqs: [
    {
      question: "Is TeamPrompt suitable for government agencies?",
      answer:
        "TeamPrompt provides security rules that detect PII, sensitive terminology, and classification markings before they reach AI tools. All data is encrypted at rest and in transit. We are working toward FedRAMP authorization and other federal compliance certifications. Contact our team to discuss your agency's specific requirements.",
    },
    {
      question:
        "How does TeamPrompt prevent classified information from reaching AI models?",
      answer:
        "TeamPrompt's security rules detect classification markings (CUI, FOUO, SBU, etc.), sensitive government terminology, and patterns associated with classified data. Prompts containing detected content are blocked before submission. Agencies can add custom detection patterns for internal classification schemes and sensitive program names.",
    },
    {
      question: "Can we deploy TeamPrompt within our agency's existing IT environment?",
      answer:
        "TeamPrompt's Chrome extension can be force-installed via Google Admin Console, Microsoft Intune, or GPO — ensuring every managed browser has data protection from day one. SSO and SCIM provisioning are on our roadmap. Contact our team to discuss your deployment requirements.",
    },
    {
      question: "Can we export audit logs for records retention?",
      answer:
        "TeamPrompt's audit logs record all AI interactions with timestamps, user identity, and actions taken. Logs can be filtered by user, date, or AI tool and exported for your agency's records retention processes.",
    },
  ],
  cta: {
    headline: "Citizen data stays out of AI tools.",
    gradientText: "Full audit trail, day one.",
    subtitle:
      "15 DLP rules active from install. Chrome extension deploys via GPO or Intune in minutes.",
  },
};
