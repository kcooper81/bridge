import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "government",
  industry: "Government",
  headline: "Secure AI prompt management for government agencies",
  subtitle:
    "Give your teams a managed AI workflow with guardrails that protect citizen data, classified information, and internal policy.",
  compliance: ["FedRAMP", "FISMA", "CJIS"],
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
        "Tamper-proof logging of every AI interaction — user, agency, timestamp, and action taken. Generate FISMA-compliant reports and respond to oversight inquiries with complete records.",
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
    { value: "98%", label: "PII detection accuracy" },
    { value: "100%", label: "FISMA audit compliance" },
    { value: "5x", label: "Faster constituent responses" },
  ],
  faqs: [
    {
      question: "Does TeamPrompt meet FedRAMP requirements?",
      answer:
        "TeamPrompt is built on FedRAMP-authorized infrastructure and follows NIST SP 800-53 controls. Our architecture supports the security requirements for FedRAMP Moderate, including encryption at rest (AES-256) and in transit (TLS 1.3), continuous monitoring, and incident response procedures aligned with federal standards.",
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
        "Yes. TeamPrompt supports deployment models that align with government IT requirements, including SSO via agency identity providers (SAML 2.0, PIV/CAC card authentication), SCIM-based user provisioning, and audit log export to agency SIEM systems. Our team works directly with your ISSO to complete the Authority to Operate (ATO) process.",
    },
    {
      question: "How does TeamPrompt handle FOIA and records retention requirements?",
      answer:
        "TeamPrompt's audit logs are designed with federal records retention in mind. All AI interaction records are stored with immutable timestamps, can be exported in standard formats, and support configurable retention periods that align with NARA records schedules. For FOIA requests, admins can search and export relevant records by user, date, or keyword.",
    },
  ],
  cta: {
    headline: "Your agency staff are already using AI.",
    gradientText: "Secure it for government.",
    subtitle:
      "Deploy TeamPrompt for your agency in under 5 minutes — no ATO bottleneck.",
  },
};
