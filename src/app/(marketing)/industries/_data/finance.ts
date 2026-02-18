import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "finance",
  industry: "Finance",
  headline: "Compliant AI usage for financial teams",
  subtitle:
    "Protect customer financial data and trading strategies with guardrails built for SOX, PCI DSS, and SEC compliance.",
  compliance: ["SOX", "PCI DSS", "SEC"],
  painPoints: [
    {
      title: "Analysts paste proprietary strategies into AI tools",
      description:
        "Trading algorithms, investment theses, and market models end up in third-party AI systems — creating regulatory risk and competitive exposure.",
    },
    {
      title: "Customer financial data leaks into prompts",
      description:
        "Account numbers, SSNs, portfolio details, and transaction histories get pasted into AI without any detection or blocking in place.",
    },
    {
      title: "No defensible record of AI usage for regulators",
      description:
        "When the SEC or an auditor asks how your team uses AI, you need a complete audit trail. Right now you have nothing.",
    },
  ],
  features: [
    {
      icon: "ShieldCheck",
      title: "Financial Data & PII Guardrails",
      description:
        "Detect account numbers, credit card numbers, SSNs, routing numbers, and proprietary financial data before prompts reach any AI model. Enforce PCI DSS and SOX controls automatically.",
    },
    {
      icon: "ClipboardList",
      title: "Regulatory Audit Log",
      description:
        "Every prompt, user, and action logged with immutable timestamps. Generate SEC-ready and SOX-compliant audit reports filtered by team, date range, or policy violation type.",
    },
    {
      icon: "Users",
      title: "Role-Based Team Access",
      description:
        "Separate prompt libraries for trading, risk, compliance, and client advisory teams. Control who can create, approve, and use templates with granular role-based permissions.",
    },
    {
      icon: "Lock",
      title: "Data Classification Enforcement",
      description:
        "Tag prompts and templates by data classification level — public, internal, confidential, restricted. Guardrails automatically escalate based on the sensitivity of detected content.",
    },
  ],
  mockupVariant: "vault",
  mockupItems: [
    {
      title: "Quarterly Analysis Prompt",
      badge: "Compliant",
      stat: "Used 187 times",
    },
    {
      title: "Risk Assessment Template",
      badge: "Compliant",
      stat: "Used 243 times",
    },
    {
      title: "Client Portfolio Review",
      badge: "Compliant",
      stat: "Used 156 times",
    },
    {
      title: "Regulatory Filing Draft",
      badge: "Compliant",
      stat: "Used 98 times",
    },
  ],
  mockupUser: { name: "M. Chen", initials: "MC" },
  stats: [
    { value: "95%", label: "Financial PII detection rate" },
    { value: "100%", label: "Regulatory audit coverage" },
    { value: "2.4x", label: "Faster report generation" },
  ],
  faqs: [
    {
      question: "How does TeamPrompt help with SOX compliance?",
      answer:
        "TeamPrompt provides the internal controls SOX requires for AI-assisted financial processes. Every AI interaction is logged with user identity, timestamp, and content classification. Admins set approval workflows for sensitive prompt templates, and the audit log generates SOX-ready reports showing who used AI, when, and what safeguards were in place.",
    },
    {
      question: "Can TeamPrompt detect credit card numbers and account data?",
      answer:
        "Yes. TeamPrompt detects PCI DSS-regulated data including credit card numbers (all major networks), CVVs, bank account and routing numbers, and Social Security numbers. Detection works in real time before the prompt is submitted, and blocked attempts are logged for compliance review without storing the sensitive data itself.",
    },
    {
      question:
        "How do we separate prompt access between front-office and compliance teams?",
      answer:
        "TeamPrompt supports granular role-based access control. Create separate workspaces for trading, risk management, compliance, and client advisory. Each team gets its own prompt library with team-specific guardrail policies. Compliance officers get a read-only dashboard across all teams for oversight without interfering with daily workflows.",
    },
    {
      question: "What happens if a trader pastes a proprietary model into an AI prompt?",
      answer:
        "TeamPrompt's guardrails detect patterns associated with proprietary financial models — structured data, formula syntax, and content flagged by your custom keyword lists. Depending on your policy configuration, the prompt is either blocked outright or the trader receives a warning with instructions to redact sensitive content. All events are logged for review.",
    },
  ],
  cta: {
    headline: "Your analysts are already using AI.",
    gradientText: "Make it compliant.",
    subtitle:
      "Deploy TeamPrompt for your financial team in under 5 minutes — full audit trail from day one.",
  },
};
