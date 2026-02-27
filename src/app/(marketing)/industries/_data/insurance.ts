import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "insurance",
  industry: "Insurance",
  headline: "Secure AI adoption for insurance teams",
  subtitle:
    "Give underwriters and claims teams a managed prompt library with guardrails that protect PII and PHI — so your organization can use AI with confidence.",
  compliance: ["PII/PHI Protection", "Claims Data Safety", "Audit Logging"],
  painPoints: [
    {
      title: "Claims adjusters paste policyholder data into AI tools",
      description:
        "Without guardrails, policyholder PII, PHI, and claims details end up in AI tools with no oversight.",
    },
    {
      title: "Inconsistent underwriting prompts across teams",
      description:
        "Every underwriter builds prompts from scratch. Risk assessment quality varies wildly between offices.",
    },
    {
      title: "No compliance visibility for regulators",
      description:
        "Your compliance team has zero visibility into how AI is being used across claims, underwriting, and customer service.",
    },
  ],
  features: [
    {
      icon: "ShieldCheck",
      title: "PII & PHI Detection",
      description:
        "Scan every prompt for policyholder data — names, policy numbers, Social Security numbers, medical records, and claims details — before it reaches an AI model.",
    },
    {
      icon: "FileText",
      title: "Insurance Prompt Templates",
      description:
        "Pre-built prompt templates for claims summaries, underwriting assessments, policy reviews, and customer correspondence. Standardize quality across every department.",
    },
    {
      icon: "ClipboardList",
      title: "Full Audit Log",
      description:
        "Every prompt, every user, every timestamp. Give compliance a complete record of AI usage to support regulatory reviews and internal audits.",
    },
    {
      icon: "Users",
      title: "Department Management",
      description:
        "Organize prompts by department — claims, underwriting, actuarial, customer service — with role-based access so each team sees only what they need.",
    },
  ],
  mockupVariant: "guardrails",
  mockupItems: [
    { title: "SSN detected in claims prompt", badge: "Blocked", stat: "2m ago" },
    { title: "Policy number in underwriting query", badge: "Blocked", stat: "15m ago" },
    { title: "Medical record in AI summary", badge: "Blocked", stat: "1h ago" },
    { title: "Customer address shared safely", badge: "Warning", stat: "3h ago" },
  ],
  mockupUser: { name: "Claims Mgr", initials: "CM" },
  mockupAlert: { type: "block", message: "3 violations blocked in the last 24 hours" },
  stats: [
    { value: "15+", label: "Built-in detection patterns" },
    { value: "3x", label: "Faster prompt reuse" },
    { value: "100%", label: "Interaction audit coverage" },
  ],
  faqs: [
    {
      question: "Can TeamPrompt help with insurance compliance?",
      answer:
        "TeamPrompt's guardrails detect PII, PHI, and financial data and block it before reaching AI tools. Compliance packs for HIPAA (health claims), PCI-DSS (payment data), and CCPA (consumer privacy) can be installed with one click. All interactions are logged for audit.",
    },
    {
      question: "What insurance-specific data does TeamPrompt detect?",
      answer:
        "Our detection engine scans for policyholder names, policy numbers, Social Security numbers, medical records, claims amounts, bank account numbers, and other sensitive insurance data. Custom patterns let you add company-specific formats.",
    },
    {
      question: "Can different departments have different guardrails?",
      answer:
        "Yes. Admins configure detection rules at the organization level and customize them per department. Claims might have stricter PHI rules while the marketing team has lighter restrictions.",
    },
    {
      question: "How does the audit trail support regulatory compliance?",
      answer:
        "TeamPrompt logs every AI interaction with timestamps, user info, tool used, and any DLP violations. Export reports in CSV or JSON for state insurance department reviews, NAIC compliance, and internal audits.",
    },
  ],
  cta: {
    headline: "Your insurance team is already using AI.",
    gradientText: "Make it compliant.",
    subtitle: "Deploy TeamPrompt for your organization in under 5 minutes.",
  },
};
