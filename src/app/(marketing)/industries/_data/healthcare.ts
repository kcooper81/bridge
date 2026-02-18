import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "healthcare",
  industry: "Healthcare",
  headline: "Secure AI adoption for healthcare teams",
  subtitle:
    "Give clinicians a managed prompt library with guardrails that detect patient data — so your team can use AI with confidence.",
  compliance: ["PHI Detection", "Audit Logging", "Access Control"],
  painPoints: [
    {
      title: "Clinicians paste patient data into ChatGPT",
      description:
        "Without guardrails, protected health information ends up in AI tools with no audit trail.",
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
      title: "PHI Detection Guardrails",
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
        "Every prompt, every user, every timestamp. Give your compliance team a complete record of AI usage to support internal audit and review processes.",
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
    { title: "Patient Intake Summary", badge: "HIPAA Safe", stat: "Used 342 times" },
    { title: "Discharge Summary Generator", badge: "HIPAA Safe", stat: "Used 289 times" },
    { title: "Referral Letter Template", badge: "HIPAA Safe", stat: "Used 178 times" },
    { title: "Lab Results Review", badge: "HIPAA Safe", stat: "Used 215 times" },
  ],
  mockupUser: { name: "Dr. Smith", initials: "DS" },
  stats: [
    { value: "15+", label: "Built-in detection patterns" },
    { value: "3x", label: "Faster prompt reuse" },
    { value: "100%", label: "Interaction audit coverage" },
  ],
  faqs: [
    {
      question: "Can TeamPrompt help with HIPAA compliance?",
      answer:
        "TeamPrompt's guardrails can detect protected health information (PHI) and block it before it reaches AI tools. All data is encrypted at rest and in transit. While we are working toward formal HIPAA compliance and BAA availability, our DLP features provide a strong technical safeguard for healthcare teams using AI.",
    },
    {
      question: "How does TeamPrompt detect protected health information?",
      answer:
        "Our PHI detection engine scans for 18 HIPAA-defined identifiers including patient names, medical record numbers, dates of birth, Social Security numbers, and diagnosis codes. When PHI is detected, the prompt is blocked and the user is guided to redact sensitive data before resubmitting.",
    },
    {
      question: "Can we customize guardrails for our specific compliance requirements?",
      answer:
        "Absolutely. Admins can configure detection sensitivity, add custom patterns (e.g., internal patient ID formats), set department-level policies, and choose between block, warn, or log-only modes depending on risk tolerance.",
    },
    {
      question: "What audit trail does TeamPrompt provide for compliance officers?",
      answer:
        "TeamPrompt logs every prompt submission, blocked attempt, user action, and admin change with timestamps. Compliance officers get a dedicated dashboard with exportable reports, filterable by user, department, date range, and policy violation type — everything you need for HIPAA audits.",
    },
  ],
  cta: {
    headline: "Your clinicians are already using AI.",
    gradientText: "Make it safe.",
    subtitle: "Deploy TeamPrompt for your healthcare org in under 5 minutes.",
  },
};
