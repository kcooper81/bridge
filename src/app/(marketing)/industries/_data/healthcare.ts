import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "healthcare",
  industry: "Healthcare",
  headline: "Secure AI adoption for healthcare teams",
  subtitle:
    "Detect and block protected health information before it reaches AI tools. Give clinicians a shared prompt library so they can use AI safely and efficiently.",
  compliance: ["PHI Detection", "Audit Logging", "Access Control"],
  painPoints: [
    {
      title: "Clinicians paste patient data into ChatGPT",
      description:
        "Without data protection, protected health information ends up in AI tools with no audit trail.",
    },
    {
      title: "Inconsistent clinical prompts across departments",
      description:
        "Every doctor writes their own prompts from scratch. Quality varies wildly between teams.",
    },
    {
      title: "No compliance visibility",
      description:
        "Your compliance team has zero visibility into how AI is being used across the organization.",
    },
  ],
  features: [
    {
      icon: "ShieldCheck",
      title: "PHI Detection & Blocking",
      description:
        "Scan every prompt for protected health information patterns — patient names, medical record numbers, diagnoses, and other PHI indicators — before it reaches an AI model.",
    },
    {
      icon: "FileText",
      title: "Clinical Prompt Templates",
      description:
        "Pre-built prompt templates for intake summaries, discharge notes, referral letters, and more. Standardize quality across every department.",
    },
    {
      icon: "ClipboardList",
      title: "Full Audit Log",
      description:
        "Every prompt submission, every blocked attempt, every timestamp — logged and exportable as CSV or JSON. Give your compliance team a complete, filterable record of AI usage.",
    },
    {
      icon: "Users",
      title: "Team & Role Management",
      description:
        "Organize prompts by department — radiology, oncology, primary care — with role-based access so each team sees only what they need.",
    },
  ],
  mockupVariant: "vault",
  mockupItems: [
    { title: "Patient Intake Summary", badge: "HIPAA Safe", stat: "342 uses", iconColor: "green", subtitle: "Emergency Dept · 4.9★" },
    { title: "Discharge Summary Generator", badge: "HIPAA Safe", stat: "289 uses", iconColor: "green", subtitle: "Inpatient · 4.7★", highlight: "shared" },
    { title: "Referral Letter Template", badge: "HIPAA Safe", stat: "178 uses", iconColor: "blue", subtitle: "Primary Care" },
    { title: "Lab Results Review", badge: "HIPAA Safe", stat: "215 uses", iconColor: "blue", subtitle: "Diagnostics · 4.8★" },
  ],
  mockupToasts: [{ message: "PHI auto-redacted from lab report", type: "success", position: "bottom-right" }],
  mockupUser: { name: "Dr. Smith", initials: "DS" },
  scenario: {
    title: "What this looks like in practice",
    persona: "Dr. Patel, ER attending",
    setup:
      "Dr. Patel is writing a discharge summary and pastes the patient's full record — including their medical record number (MRN) — into ChatGPT to draft the document faster.",
    trigger:
      "TeamPrompt's HIPAA compliance pack catches the MRN pattern before the prompt leaves the browser. The submission is blocked, and Dr. Patel sees exactly what was flagged.",
    resolution:
      "Dr. Patel removes the MRN, replaces it with a placeholder, and resubmits. She gets her discharge summary draft in seconds — with zero patient data exposed to the AI provider.",
  },
  stats: [
    { value: "15", label: "Built-in DLP rules" },
    { value: "4", label: "HIPAA-specific detection rules" },
    { value: "6", label: "One-click compliance packs" },
  ],
  faqs: [
    {
      question: "Can TeamPrompt help with HIPAA compliance?",
      answer:
        "TeamPrompt's security rules can detect protected health information (PHI) and block it before it reaches AI tools. All data is encrypted at rest and in transit. While we are working toward formal HIPAA compliance and BAA availability, our DLP features provide a strong technical safeguard for healthcare teams using AI.",
    },
    {
      question: "How does TeamPrompt detect protected health information?",
      answer:
        "Our PHI detection engine scans for 18 HIPAA-defined identifiers including patient names, medical record numbers, dates of birth, Social Security numbers, and diagnosis codes. When PHI is detected, the prompt is blocked and the user is guided to redact sensitive data before resubmitting.",
    },
    {
      question: "Can we customize security rules for our specific compliance requirements?",
      answer:
        "Absolutely. Admins can configure detection sensitivity, add custom patterns (e.g., internal patient ID formats), set department-level policies, and choose between block, warn, or log-only modes depending on risk tolerance.",
    },
    {
      question: "What audit trail does TeamPrompt provide for compliance officers?",
      answer:
        "TeamPrompt logs every prompt submission and blocked attempt with timestamps. The Activity Log is filterable by user, AI tool, date range, and action type — and exportable as CSV or JSON for audit review. Combined with the guardrails analytics dashboard, this gives compliance teams the visibility they need.",
    },
  ],
  cta: {
    headline: "PHI doesn't belong in AI prompts.",
    gradientText: "TeamPrompt catches it.",
    subtitle: "Set up in under 2 minutes. 4 HIPAA-specific rules active from day one.",
  },
};
