import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "finance",
  industry: "Finance",
  headline: "Compliant AI usage for financial teams",
  subtitle:
    "Protect customer financial data and trading strategies with security rules that detect sensitive financial information before it reaches AI tools.",
  compliance: ["Financial Data Detection", "Audit Logging", "Access Control"],
  painPoints: [
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
      title: "Financial Data & PII Protection",
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
        "Tag prompts and templates by data classification level — public, internal, confidential, restricted. Security rules automatically escalate based on the sensitivity of detected content.",
    },
    {
      icon: "Eye",
      title: "PCI-DSS Compliance Pack",
      description:
        "One-click install of 5 PCI-DSS-specific rules: Visa, Mastercard, Amex card patterns, CVV detection, and expiration date matching. Activate card number protection in seconds.",
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
  scenario: {
    title: "What this looks like in practice",
    persona: "Raj, financial analyst",
    setup:
      "Raj is building a quarterly model and pastes a spreadsheet extract into ChatGPT for formatting help. The extract includes customer account numbers and two full credit card numbers.",
    trigger:
      "TeamPrompt's PCI-DSS compliance pack catches the Visa and Mastercard patterns. The prompt is blocked, and the attempt is logged for Raj's compliance officer to review.",
    resolution:
      "Raj removes the real account data, substitutes placeholder values, and resubmits. The compliance team can see the blocked event in the audit log — proof the controls work.",
  },
  stats: [
    { value: "5", label: "PCI-DSS detection rules" },
    { value: "6", label: "One-click compliance packs" },
    { value: "2-click", label: "From sidebar to AI tool" },
  ],
  faqs: [
    {
      question: "How does TeamPrompt help financial teams manage AI risk?",
      answer:
        "TeamPrompt provides security rules that detect financial data, credentials, and proprietary information before it reaches AI tools. Every AI interaction is logged with user identity, timestamp, and action taken. These controls help support your compliance posture for SOX, PCI DSS, and internal audit requirements.",
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
        "TeamPrompt supports granular role-based access control. Create separate workspaces for trading, risk management, compliance, and client advisory. Each team gets its own prompt library with team-specific security policies. Compliance officers get a read-only dashboard across all teams for oversight without interfering with daily workflows.",
    },
    {
      question: "What happens if a trader pastes a proprietary model into an AI prompt?",
      answer:
        "TeamPrompt's security rules detect patterns associated with proprietary financial models — structured data, formula syntax, and content flagged by your custom keyword lists. Depending on your policy configuration, the prompt is either blocked outright or the trader receives a warning with instructions to redact sensitive content. All events are logged for review.",
    },
  ],
  cta: {
    headline: "5 PCI-DSS rules. 6 compliance packs.",
    gradientText: "Audit trail from day one.",
    subtitle:
      "Install, activate a compliance pack, and start protecting financial data — all in under 2 minutes.",
  },
};
