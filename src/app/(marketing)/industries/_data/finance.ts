import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "finance",
  industry: "Finance",
  headline: "Compliant AI usage for financial teams",
  subtitle:
    "Protect customer financial data and trading strategies with guardrails that detect sensitive financial information before it reaches AI tools.",
  compliance: ["Financial Data Detection", "Audit Logging", "Access Control"],
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
        "Detect account numbers, credit card numbers, SSNs, routing numbers, and proprietary financial data before prompts reach any AI model. Helps support your compliance posture for PCI DSS and SOX.",
    },
    {
      icon: "ClipboardList",
      title: "Regulatory Audit Log",
      description:
        "Every prompt, user, and action logged with timestamps. Generate audit reports filtered by team, date range, or policy violation type to support your compliance reviews.",
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
    { title: "Quarterly Analysis Prompt", badge: "Compliant", stat: "187 uses", iconColor: "green", subtitle: "Equities · 4.8★" },
    { title: "Risk Assessment Template", badge: "Compliant", stat: "243 uses", iconColor: "amber", subtitle: "Risk Mgmt · 4.6★", highlight: "shared" },
    { title: "Client Portfolio Review", badge: "Compliant", stat: "156 uses", iconColor: "blue", subtitle: "Wealth Mgmt" },
    { title: "Regulatory Filing Draft", badge: "Compliant", stat: "98 uses", iconColor: "purple", subtitle: "Compliance · new", highlight: "new" },
  ],
  mockupToasts: [{ message: "Account number auto-redacted", type: "success", position: "bottom-right" }],
  mockupUser: { name: "M. Chen", initials: "MC" },
  stats: [
    { value: "15+", label: "Built-in detection patterns" },
    { value: "100%", label: "Interaction audit coverage" },
    { value: "2.4x", label: "Faster report generation" },
  ],
  faqs: [
    {
      question: "How does TeamPrompt help financial teams manage AI risk?",
      answer:
        "TeamPrompt provides guardrails that detect financial data, credentials, and proprietary information before it reaches AI tools. Every AI interaction is logged with user identity, timestamp, and action taken. These controls help support your compliance posture for SOX, PCI DSS, and internal audit requirements.",
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
