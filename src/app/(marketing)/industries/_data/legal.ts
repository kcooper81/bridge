import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "legal",
  industry: "Legal",
  headline: "AI prompt management for law firms",
  subtitle:
    "Protect attorney-client privilege while giving your lawyers the best AI prompts for legal research, drafting, and review.",
  compliance: ["Privilege Detection", "Audit Logging", "Access Control"],
  painPoints: [
    {
      title: "Associates paste case details into AI tools",
      description:
        "Without safeguards, confidential case facts, client names, and privileged strategy end up in third-party AI systems — creating malpractice exposure.",
    },
    {
      title: "No quality control over AI-assisted drafting",
      description:
        "Each attorney crafts prompts differently. Some produce hallucinated citations, others miss key issues. There is no firm-wide standard for AI-assisted work product.",
    },
    {
      title: "Zero audit trail for AI usage",
      description:
        "If opposing counsel asks how AI was used on a matter, your firm has no record. That is a discovery nightmare waiting to happen.",
    },
  ],
  features: [
    {
      icon: "ShieldAlert",
      title: "Privilege & Confidentiality Guardrails",
      description:
        "Detect client names, case numbers, opposing party details, and privileged strategy language before prompts reach any AI model. Protect work product and attorney-client privilege automatically.",
    },
    {
      icon: "FileText",
      title: "Legal Prompt Templates",
      description:
        "Firm-approved prompt templates for contract review, case brief generation, legal research, deposition prep, and motion drafting. Reduce hallucination risk with structured, tested prompts.",
    },
    {
      icon: "BookOpen",
      title: "Legal Writing Guidelines",
      description:
        "Embed your firm's writing standards, citation formats, and jurisdiction-specific rules directly into prompt guidance. Every associate follows the same playbook.",
    },
    {
      icon: "ClipboardList",
      title: "Matter-Level Audit Log",
      description:
        "Track every AI interaction by user, matter number, and timestamp. Generate reports for ethics reviews, client audits, or internal compliance checks with one click.",
    },
  ],
  mockupVariant: "vault",
  mockupItems: [
    { title: "Case Brief Generator", badge: "Privilege Safe", stat: "Used 256 times" },
    { title: "Contract Clause Review", badge: "Privilege Safe", stat: "Used 198 times" },
    { title: "Legal Research Prompt", badge: "Privilege Safe", stat: "Used 312 times" },
    { title: "Deposition Prep", badge: "Privilege Safe", stat: "Used 145 times" },
  ],
  mockupUser: { name: "J. Parker", initials: "JP" },
  stats: [
    { value: "15+", label: "Built-in detection patterns" },
    { value: "4x", label: "Faster legal research" },
    { value: "100%", label: "Interaction audit coverage" },
  ],
  faqs: [
    {
      question: "How does TeamPrompt protect attorney-client privilege?",
      answer:
        "TeamPrompt scans every prompt for client names, case numbers, matter identifiers, opposing party details, and privileged strategy language before it is sent to any AI model. When privileged content is detected, the prompt is blocked and the attorney is prompted to redact sensitive information. This creates a defensible process for AI usage that satisfies ABA ethics guidelines.",
    },
    {
      question: "Can we organize prompts by practice area and matter?",
      answer:
        "Yes. TeamPrompt supports hierarchical organization by practice group (litigation, corporate, IP, etc.), individual matter, and attorney. Partners can approve templates at the practice-group level, and associates see only the prompt libraries relevant to their assigned matters.",
    },
    {
      question: "What happens if an associate tries to paste a client name into an AI prompt?",
      answer:
        "TeamPrompt's guardrails will detect the client name and block the prompt from being submitted. The associate sees a clear explanation of what was flagged and instructions for redacting the information. The blocked attempt is logged for compliance review, but the sensitive content is never sent to the AI provider.",
    },
    {
      question: "Does TeamPrompt help with ABA Model Rule 1.6 compliance?",
      answer:
        "Yes. ABA Model Rule 1.6 requires lawyers to make reasonable efforts to prevent unauthorized disclosure of client information. TeamPrompt provides the technical safeguards (pre-submission scanning), process controls (approved templates), and documentation (audit logs) that demonstrate reasonable efforts under the rule.",
    },
  ],
  cta: {
    headline: "Your attorneys are already using AI.",
    gradientText: "Protect the privilege.",
    subtitle:
      "Deploy TeamPrompt for your firm in under 5 minutes — no IT department required.",
  },
};
