export interface ComplianceFramework {
  slug: string;
  name: string;
  fullName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  intro: string;
  risks: { title: string; desc: string }[];
  howTeamPromptHelps: string[];
  rules: { name: string; desc: string; severity: "block" | "warn" }[];
  faq: { q: string; a: string }[];
}

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    slug: "hipaa",
    name: "HIPAA",
    fullName: "Health Insurance Portability and Accountability Act",
    metaTitle: "HIPAA Compliance for AI Tools — Protect PHI in ChatGPT & Claude",
    metaDescription:
      "Ensure HIPAA compliance when your healthcare team uses AI. TeamPrompt blocks patient data, medical records, and PHI before it reaches ChatGPT, Claude, or Gemini.",
    keywords: ["HIPAA AI compliance", "HIPAA ChatGPT", "protect PHI in AI", "healthcare AI DLP", "HIPAA compliant AI"],
    intro:
      "Healthcare teams use AI daily — summarizing notes, drafting communications, researching treatments. But every prompt is a potential HIPAA violation if it contains Protected Health Information (PHI). TeamPrompt scans prompts in real time and blocks PHI before it reaches any AI tool.",
    risks: [
      { title: "Patient names in prompts", desc: "Staff copy-paste patient records into AI for summarization, exposing names, DOBs, and medical record numbers." },
      { title: "Diagnosis codes shared", desc: "ICD-10 codes and treatment plans sent to AI tools for research or documentation assistance." },
      { title: "No audit trail", desc: "Without logging, there's no way to demonstrate compliance to auditors or respond to breach investigations." },
      { title: "Shadow AI usage", desc: "Clinicians use unapproved AI tools without IT knowledge, creating unmonitored data exposure paths." },
    ],
    howTeamPromptHelps: [
      "One-click HIPAA compliance pack installs detection rules for patient names, MRN, DOB, diagnosis codes, insurance IDs, and facility names",
      "Real-time blocking — PHI is caught BEFORE it reaches ChatGPT, Claude, or Gemini",
      "Auto-redaction replaces patient data with [PATIENT], [MRN], [DIAGNOSIS] placeholders",
      "Full audit trail with exportable reports for compliance reviews",
      "AI Tool Policy blocks unapproved tools at DNS level via Cloudflare Gateway",
      "User education — when a block occurs, explains WHY PHI matters and how to de-identify",
    ],
    rules: [
      { name: "Patient Name Detection", desc: "Detects patterns indicating patient names in clinical context", severity: "block" },
      { name: "Medical Record Number", desc: "MRN patterns like MRN: A12345678", severity: "block" },
      { name: "Health Insurance ID", desc: "Insurance member and policy ID patterns", severity: "block" },
      { name: "ICD-10 Diagnosis Code", desc: "Diagnosis codes like J45.20", severity: "warn" },
      { name: "Drug/Prescription Name", desc: "Medication names with dosage information", severity: "warn" },
      { name: "Facility Name", desc: "Hospital and clinic names in patient context", severity: "warn" },
    ],
    faq: [
      { q: "Is TeamPrompt itself HIPAA compliant?", a: "TeamPrompt scans prompts in your browser before they reach any AI tool. In metadata-only mode, we never store the prompt text — only action, tool, and timestamp. For full HIPAA compliance, enable metadata-only logging in Settings → Security." },
      { q: "Can we use ChatGPT with HIPAA?", a: "ChatGPT's Team and Enterprise plans offer data controls, but they don't prevent employees from pasting PHI. TeamPrompt adds a pre-send scanning layer that catches PHI regardless of which AI tool is used." },
      { q: "How fast is the scanning?", a: "Scanning typically adds under 200ms to message submission. The extension intercepts the send event, scans against your HIPAA rules, and either allows or blocks — all before the text reaches the AI provider." },
      { q: "What if we need to discuss patient cases with AI?", a: "Use TeamPrompt's auto-redaction feature. It replaces PHI with safe placeholders like [PATIENT] and [DIAGNOSIS], letting the AI understand the clinical context without exposing real patient data." },
    ],
  },
  {
    slug: "soc2",
    name: "SOC 2",
    fullName: "Service Organization Controls 2",
    metaTitle: "SOC 2 Compliance for AI Usage — Audit Trails & DLP for ChatGPT",
    metaDescription:
      "Meet SOC 2 requirements for AI tool usage. TeamPrompt provides DLP scanning, full audit trails, access controls, and compliance reporting for AI interactions.",
    keywords: ["SOC 2 AI compliance", "SOC 2 ChatGPT", "AI audit trail SOC 2", "SOC 2 DLP"],
    intro:
      "SOC 2 audits increasingly cover AI tool usage. Auditors want to see: What AI tools are employees using? What data is being shared? Are there controls in place? TeamPrompt gives you DLP scanning, full audit trails, and access controls that map directly to SOC 2 trust service criteria.",
    risks: [
      { title: "No visibility into AI usage", desc: "Auditors ask which AI tools employees use and what data flows to them. Without monitoring, you can't answer." },
      { title: "Credentials in AI prompts", desc: "Developers paste API keys, connection strings, and passwords into AI for debugging help." },
      { title: "No access controls", desc: "Any employee can use any AI tool with no approval, role-based restrictions, or policy enforcement." },
      { title: "Missing audit trail", desc: "SOC 2 requires logging of security-relevant events. AI interactions are security events that most companies don't log." },
    ],
    howTeamPromptHelps: [
      "Full activity log of every AI interaction — who, what tool, when, what action was taken",
      "SOC 2 compliance pack detects credentials, API keys, internal system data, and access tokens",
      "Role-based access: admin, manager, member roles with team-scoped policies",
      "AI Tool Policy restricts usage to approved tools only",
      "CSV/PDF export for audit evidence packages",
      "Audit dashboard with Sankey diagrams, violation trends, and compliance scoring",
    ],
    rules: [
      { name: "API Key Detection", desc: "AWS, GitHub, Stripe, OpenAI, and generic API key patterns", severity: "block" },
      { name: "Connection String", desc: "Database connection strings with credentials", severity: "block" },
      { name: "Private Key / PEM", desc: "SSH keys and certificate private keys", severity: "block" },
      { name: "Bearer Token", desc: "OAuth and authorization bearer tokens", severity: "block" },
      { name: "Internal URL", desc: "Internal hostnames and staging environment URLs", severity: "warn" },
    ],
    faq: [
      { q: "Does TeamPrompt help with SOC 2 Type II audits?", a: "Yes. The audit trail provides continuous evidence of AI security controls over time. Export logs for any date range to demonstrate consistent policy enforcement." },
      { q: "How does this map to SOC 2 trust criteria?", a: "TeamPrompt addresses CC6.1 (access controls), CC7.2 (monitoring), CC8.1 (change management via approval workflows), and CC6.6 (external transmissions via DLP scanning)." },
      { q: "Can auditors access the logs directly?", a: "Admins can export audit data as CSV or PDF. The Audit dashboard provides a visual summary of compliance posture, violation trends, and policy coverage." },
    ],
  },
  {
    slug: "gdpr",
    name: "GDPR",
    fullName: "General Data Protection Regulation",
    metaTitle: "GDPR Compliance for AI Tools — Protect Personal Data in ChatGPT & Claude",
    metaDescription:
      "Prevent GDPR violations when employees use AI. TeamPrompt blocks personal data, enforces data minimization, and provides audit trails for EU privacy compliance.",
    keywords: ["GDPR AI compliance", "GDPR ChatGPT", "personal data AI tools", "EU AI data protection", "GDPR DLP"],
    intro:
      "Under GDPR, transferring personal data to AI providers without proper controls can result in fines up to 4% of annual revenue. TeamPrompt helps by scanning prompts for personal data, blocking or redacting before it reaches AI tools, and providing audit evidence of data protection measures.",
    risks: [
      { title: "Personal data in prompts", desc: "Employees paste customer emails, phone numbers, addresses, and names into AI tools for content generation or analysis." },
      { title: "Cross-border data transfer", desc: "Sending EU personal data to US-hosted AI services (OpenAI, Anthropic) without adequate safeguards." },
      { title: "No data minimization", desc: "GDPR requires processing only necessary data. AI prompts often include more personal data than needed." },
      { title: "Right to erasure gaps", desc: "Once data is sent to an AI tool, you can't guarantee deletion — making DSAR compliance harder." },
    ],
    howTeamPromptHelps: [
      "GDPR compliance pack detects EU-specific personal data: national IDs, IBAN numbers, EU phone formats, VAT numbers",
      "Auto-redaction enforces data minimization by replacing personal data with placeholders before sending",
      "AI Tool Policy blocks unapproved tools, preventing data transfer to unvetted providers",
      "Metadata-only logging mode — TeamPrompt itself can operate without storing prompt content",
      "Audit trail demonstrates Article 32 security measures to supervisory authorities",
      "User education explains data protection requirements when violations are caught",
    ],
    rules: [
      { name: "Email Address", desc: "Personal and work email addresses", severity: "warn" },
      { name: "EU Phone Number", desc: "European phone number formats", severity: "warn" },
      { name: "EU National ID", desc: "National identification numbers (varies by country)", severity: "block" },
      { name: "IBAN Number", desc: "International bank account numbers", severity: "block" },
      { name: "EU VAT Number", desc: "VAT identification numbers", severity: "warn" },
      { name: "Physical Address", desc: "Street addresses and postal codes", severity: "warn" },
    ],
    faq: [
      { q: "Does TeamPrompt process personal data?", a: "In metadata-only mode, TeamPrompt logs only the action taken, AI tool used, and timestamp — no prompt text is stored. The DLP scan happens in real-time and the content is not persisted." },
      { q: "Is TeamPrompt GDPR compliant?", a: "Yes. TeamPrompt offers a Data Processing Agreement (DPA), supports metadata-only logging, and processes data in accordance with GDPR requirements." },
      { q: "How does this help with DPIAs?", a: "The AI Tool Policy and audit trail provide evidence for Data Protection Impact Assessments — showing which tools are approved, what controls exist, and how violations are handled." },
    ],
  },
  {
    slug: "pci-dss",
    name: "PCI-DSS",
    fullName: "Payment Card Industry Data Security Standard",
    metaTitle: "PCI-DSS Compliance for AI Tools — Block Payment Card Data in AI Prompts",
    metaDescription:
      "Prevent PCI-DSS violations when teams use AI. TeamPrompt detects and blocks credit card numbers, CVVs, and cardholder data before it reaches ChatGPT or Claude.",
    keywords: ["PCI-DSS AI compliance", "credit card DLP", "payment data AI tools", "PCI compliant AI"],
    intro:
      "Payment card data in AI prompts is an immediate PCI-DSS violation. TeamPrompt's PCI-DSS compliance pack detects credit card numbers, CVVs, expiration dates, and cardholder data — blocking them before they reach any AI tool.",
    risks: [
      { title: "Credit card numbers in prompts", desc: "Customer service reps paste transaction details including full card numbers into AI for help with disputes." },
      { title: "CVV exposure", desc: "Support staff include security codes when describing customer issues to AI assistants." },
      { title: "Cardholder data in bulk", desc: "Analysts copy payment spreadsheets into AI tools for data analysis." },
    ],
    howTeamPromptHelps: [
      "PCI-DSS compliance pack detects Visa, Mastercard, Amex card patterns with Luhn validation",
      "CVV/CVC detection catches security codes in natural language context",
      "Card expiration date detection",
      "Auto-redaction replaces card numbers with masked versions (****1234)",
      "Audit trail provides evidence of cardholder data protection for QSA reviews",
    ],
    rules: [
      { name: "Credit Card Number", desc: "Visa, Mastercard, Amex with Luhn validation", severity: "block" },
      { name: "CVV/CVC Code", desc: "3-4 digit security codes", severity: "block" },
      { name: "Card Expiration", desc: "Expiration date patterns (MM/YY, MM/YYYY)", severity: "warn" },
      { name: "Cardholder Name", desc: "Name-on-card patterns in payment context", severity: "warn" },
    ],
    faq: [
      { q: "Does this cover all card types?", a: "The PCI-DSS pack detects Visa, Mastercard, American Express, Discover, and Diners Club patterns. Luhn algorithm validation reduces false positives." },
      { q: "What about tokenized card data?", a: "Tokenized data (like Stripe tokens) is detected by separate API key detection rules, not the PCI-DSS pack." },
    ],
  },
  {
    slug: "eu-ai-act",
    name: "EU AI Act",
    fullName: "European Union Artificial Intelligence Act",
    metaTitle: "EU AI Act Compliance — Governance & Audit Trails for AI Usage",
    metaDescription:
      "Prepare for EU AI Act requirements with TeamPrompt. AI usage logging, risk assessment, governance controls, and transparency reporting for organizations using AI tools.",
    keywords: ["EU AI Act compliance", "AI Act governance", "AI transparency requirements", "EU AI regulation"],
    intro:
      "The EU AI Act requires organizations to document AI usage, implement governance controls, and maintain transparency about AI-assisted decisions. TeamPrompt provides the governance layer — logging every AI interaction, enforcing policies, and generating audit evidence.",
    risks: [
      { title: "No AI usage documentation", desc: "The AI Act requires documenting how AI systems are used. Most organizations have zero visibility." },
      { title: "Missing risk assessment", desc: "Organizations must assess risks of AI usage. Without data on what's being sent to AI, assessment is impossible." },
      { title: "No governance framework", desc: "The Act requires human oversight and governance of AI usage. Most teams have no policies." },
      { title: "Transparency gaps", desc: "Organizations must be transparent about AI-assisted decisions. Without logging, there's no record." },
    ],
    howTeamPromptHelps: [
      "Full audit trail documents every AI interaction — meeting Article 12 transparency requirements",
      "AI Tool Policy provides the governance framework — approved tools, team-based restrictions",
      "Risk scoring (0-100) on every prompt enables continuous risk assessment",
      "Compliance dashboard with Sankey diagrams and violation analytics",
      "LLM-based topic classification can flag high-risk content categories",
      "CSV/PDF export for regulatory reporting",
    ],
    rules: [],
    faq: [
      { q: "When does the EU AI Act apply?", a: "The AI Act entered into force in August 2024 with phased implementation. General-purpose AI requirements apply from August 2025. Full enforcement begins August 2026." },
      { q: "Does TeamPrompt classify AI risk levels?", a: "TeamPrompt provides per-prompt risk scoring (0-100) and allows admins to define sensitive topics. While it doesn't formally classify systems under the AI Act's risk tiers, it provides the monitoring data needed for risk assessments." },
      { q: "Can TeamPrompt generate compliance reports?", a: "Yes. The Audit page provides visual dashboards and CSV/PDF export of all AI interaction data, violation trends, and policy coverage — suitable for regulatory submissions." },
    ],
  },
];

export function getFrameworkBySlug(slug: string): ComplianceFramework | undefined {
  return COMPLIANCE_FRAMEWORKS.find((f) => f.slug === slug);
}
