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
      { q: "Is ChatGPT HIPAA compliant in 2026?", a: "ChatGPT itself is not HIPAA compliant out of the box. OpenAI's Business Associate Agreement (BAA) is available for ChatGPT Enterprise customers as of late 2024 — but a BAA only makes the vendor relationship compliant. It does not stop your employees from typing PHI into ChatGPT in ways that violate the HIPAA Minimum Necessary Standard or your internal access controls. You still need a layer that blocks or redacts PHI before it leaves the user's browser." },
      { q: "Does Claude have a HIPAA BAA?", a: "Anthropic offers BAAs to Claude Enterprise customers (added in 2025). Same caveat as ChatGPT: a BAA covers Anthropic's data handling, not your workforce's behavior. PHI redaction at the prompt level remains your responsibility." },
      { q: "What counts as PHI in an AI prompt?", a: "The 18 HIPAA identifiers all count, including the obvious ones (name, SSN, MRN, DOB) and less obvious ones: photographs, biometric IDs, full-face photos, account numbers, device IDs, vehicle identifiers, and any unique identifying characteristic that could be used to re-identify a patient. Even partial identifiers (date of admission + 3-digit zip) can be HIPAA-relevant under the Safe Harbor method." },
      { q: "Is TeamPrompt itself HIPAA compliant?", a: "TeamPrompt scans prompts in your browser before they reach any AI tool. In metadata-only mode, we never store the prompt text — only action, tool, and timestamp. For full HIPAA compliance, enable metadata-only logging in Settings → Security. We sign BAAs on the Business plan." },
      { q: "Can we use ChatGPT with HIPAA?", a: "Yes, with the right controls. ChatGPT's Team and Enterprise plans offer data controls and BAAs, but they don't prevent employees from pasting PHI in the first place. TeamPrompt adds a pre-send scanning layer that catches PHI regardless of which AI tool is used — so your HIPAA program covers shadow AI use and the approved AI use." },
      { q: "How fast is the PHI scanning?", a: "Scanning typically adds under 200ms to message submission. The extension intercepts the send event, scans against your HIPAA rules (drug names, MRN patterns, ICD-10 codes, dates of birth, etc.), and either allows or blocks — all before the text reaches the AI provider." },
      { q: "What if we need to discuss patient cases with AI?", a: "Use TeamPrompt's auto-redaction feature. It replaces PHI with safe placeholders like [PATIENT], [DIAGNOSIS], [DOB] — letting the AI understand the clinical context without exposing real patient data. Outputs and clinician follow-ups stay on-message even though the underlying identifiers are masked." },
      { q: "How does this map to HIPAA Security Rule requirements?", a: "Specifically: §164.308(a)(1)(ii)(A) risk analysis (the audit log surfaces AI-tool risk), §164.308(a)(1)(ii)(D) information system activity review (audit dashboard), §164.308(a)(3)(ii)(A) authorization & supervision (role-based access), §164.312(b) audit controls (per-prompt logging), and §164.312(e)(1) transmission security (DLP scanning of outbound prompts)." },
    ],
  },
  {
    slug: "soc2",
    name: "SOC 2",
    fullName: "Service Organization Controls 2",
    metaTitle: "Audit Trails for ChatGPT & Claude — SOC 2 Ready in Days",
    metaDescription:
      "Need audit trails of everything your team tried in ChatGPT, Claude, and Gemini? TeamPrompt logs every AI interaction with DLP scanning and access controls — maps directly to SOC 2 trust service criteria.",
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
      { q: "Which AI tools offer audit trails of every LLM playground interaction?", a: "Native AI platforms — ChatGPT Enterprise, Claude Team, Gemini for Workspace, Copilot for Microsoft 365 — log user activity and policy events but NOT the prompt content itself. To capture every prompt sent to an LLM playground (with detailed history, role-based access, and SOC 2 evidence), you need a layer between the user and the AI provider. TeamPrompt's browser extension intercepts at submit time and logs prompt, user, tool, model, and detection events to an admin-controlled audit store, with admin / manager / member / read-only-auditor roles." },
      { q: "Does TeamPrompt help with SOC 2 Type II audits?", a: "Yes. The audit trail provides continuous evidence of AI security controls over time. Export logs for any date range to demonstrate consistent policy enforcement. The audit log includes the prompt content, user, AI tool, model, timestamp, and detection events — exactly what SOC 2 auditors need to verify CC6.1, CC6.6, CC7.2, and CC8.1." },
      { q: "How does this map to SOC 2 trust criteria?", a: "TeamPrompt addresses CC6.1 (access controls — role-based scoping), CC6.6 (external transmission controls — DLP scanning of every outbound prompt), CC7.2 (system monitoring — real-time detection events), and CC8.1 (change management via the approval workflow for new prompts and rules)." },
      { q: "Is TeamPrompt itself SOC 2 certified?", a: "TeamPrompt operates under SOC 2 Type II controls. The audit dashboard, role-based access, and encryption-at-rest controls are designed to map to your organization's SOC 2 requirements as a customer." },
      { q: "Can auditors access the logs directly?", a: "Yes. Admins can grant a read-only auditor role for the duration of an external audit, or export audit data as CSV or PDF for the auditor's evidence package. The Audit dashboard provides a visual summary of compliance posture, violation trends, and policy coverage." },
      { q: "What role-based access controls are supported?", a: "Four levels: admin (full configuration + audit access), manager (team-scoped policies and audit view), member (use AI tools within policy), and read-only auditor (audit data only, no configuration). Team-scoped policies let you isolate engineering, finance, and HR audit views from each other." },
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
      { q: "Is ChatGPT GDPR compliant?", a: "ChatGPT can be used in a GDPR-compliant way only if you control what data goes into it. OpenAI's EU data residency (added 2024) and DPAs cover the vendor side, but Article 5(c) (data minimization) and Article 32 (security of processing) apply to YOUR organization regardless of OpenAI's posture. If an employee pastes a customer's full name + email + medical history into ChatGPT, that's a controller-side failure even if OpenAI's terms are clean." },
      { q: "Does sending data to ChatGPT count as a cross-border transfer?", a: "Yes. Even with OpenAI's EU data residency option, the default is US processing under Standard Contractual Clauses (SCCs). For EU customers, an EU-residency configuration plus a TIA (Transfer Impact Assessment) is the typical baseline. TeamPrompt's metadata-only mode keeps prompt content out of any provider entirely — which removes the transfer question for that subset of prompts." },
      { q: "What about the right to erasure (Article 17)?", a: "Once data is sent to a third-party AI provider, your ability to honor an erasure request depends on that vendor's data retention. OpenAI keeps API data for 30 days by default (and longer for ChatGPT consumer); model weights cannot be selectively unlearned in practice. The cleanest answer is prevention: don't send PII to the AI provider in the first place. TeamPrompt's auto-redaction enforces this at the browser level." },
      { q: "Does TeamPrompt process personal data?", a: "In metadata-only mode, TeamPrompt logs only the action taken, AI tool used, and timestamp — no prompt text is stored. The DLP scan happens in real-time and the content is not persisted. This is the recommended configuration for GDPR-regulated workflows." },
      { q: "Is TeamPrompt itself GDPR compliant?", a: "Yes. TeamPrompt offers a Data Processing Agreement (DPA), supports EU data residency on the Business plan, processes only the minimum data necessary, and aligns with Articles 5, 25 (data protection by design), 30 (records of processing), and 32 (security of processing)." },
      { q: "How does this help with DPIAs?", a: "Article 35 requires a Data Protection Impact Assessment for high-risk processing, which includes 'systematic monitoring' and 'innovative technology' — both of which apply to AI tool usage in the workplace. TeamPrompt's audit trail, approved-tool list, and DLP detection events provide the technical and organizational measures evidence required in Sections 2 and 3 of a DPIA." },
      { q: "What's the GDPR risk of using ChatGPT for customer support?", a: "Without controls, very high. A customer's email + question typed into ChatGPT for a draft reply is unconsented processing of personal data, often via cross-border transfer. The penalty exposure is up to 4% of annual global turnover. The mitigation is auto-redaction at the prompt layer (replace names with [CUSTOMER], emails with [EMAIL]) so the AI generates the draft against tokens, and your team re-personalizes the response before sending." },
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
      { q: "Is using ChatGPT for customer support a PCI-DSS violation?", a: "Only if cardholder data is sent in the prompt. PCI-DSS 4.0 makes no specific carve-out for AI tools — it treats any system that 'stores, processes, or transmits' cardholder data as in-scope. If a support agent pastes a full PAN into ChatGPT to draft a refund response, that prompt body, the AI provider's logs, and your local browser session are all suddenly in-scope. The mitigation is browser-level scanning that catches PAN/CVV/expiration before the prompt is sent, paired with a clean audit log that proves no in-scope data crossed the boundary." },
      { q: "Does PCI-DSS 4.0 specifically mention AI?", a: "Not by name, but the requirements that matter most for AI tools are explicit: 4.2.1.1 (encrypted transmission of cardholder data — your prompt IS the transmission), 10.2 (audit trails for security events), 12.3.4 (acceptable use policies — AI tools should be enumerated). PCI-DSS 4.0 is technology-agnostic; if you can't prove the AI usage doesn't transmit cardholder data, you can't claim compliance." },
      { q: "Does this cover all card types?", a: "The PCI-DSS pack detects Visa, Mastercard, American Express, Discover, and Diners Club patterns. Luhn algorithm validation reduces false positives. UnionPay and JCB are detected by pattern but Luhn-validated separately. Combined cardholder-name + partial-PAN context also triggers blocks even when the number alone might pass." },
      { q: "What about tokenized card data?", a: "Tokenized data (Stripe tokens like tok_xxx, Braintree tokens, etc.) is detected by separate API key detection rules, not the PCI-DSS pack. Tokens aren't cardholder data per PCI-DSS, but they ARE secrets — treating them as block-on-detect is the right default since a leaked token plus your Stripe secret key reconstitutes the original card." },
      { q: "Can we use AI to draft customer responses if a payment dispute comes in?", a: "Yes, using auto-redaction. TeamPrompt replaces PAN with [CARD_NUMBER], CVV with [CVV], and so on — the prompt that reaches ChatGPT or Claude contains only the structure of the dispute (transaction date, amount, customer email-redacted, description). The AI drafts a response against the redacted template; your agent re-personalizes before sending to the customer. No cardholder data ever leaves your network." },
      { q: "What does a QSA want to see in our AI controls?", a: "Three things, typically: (1) a documented AI Acceptable Use Policy that names which tools are approved and what data is forbidden; (2) a technical control that enforces the policy — not just a policy doc — which usually means a browser extension or DLP that intercepts PAN at submit time; (3) an audit log showing detection events, with date ranges that cover the assessment window. The audit log is what differentiates a real control from a 'we told employees not to' policy." },
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
      { q: "Is our company subject to the EU AI Act if we use ChatGPT?", a: "If you have an EU establishment, EU customers, or EU users of an AI-assisted product, yes — even if your headquarters is in the US. The Act's extraterritorial reach is similar to GDPR. The good news: most internal-use cases (writing emails, summarizing meetings) are minimal-risk and only require transparency and AI literacy obligations, not full conformity assessments. The bad news: any AI-assisted decision that affects EU individuals in employment, credit, healthcare, education, or law enforcement IS high-risk and triggers serious obligations." },
      { q: "When does the EU AI Act apply?", a: "The Act entered into force August 1, 2024 with phased implementation. Prohibited practices: applicable from February 2025. General-purpose AI model obligations (transparency, training-data summaries): August 2025. High-risk AI system requirements: full applicability August 2026. Most ChatGPT/Claude/Gemini use falls under either minimal-risk (transparency only) or high-risk depending on use case." },
      { q: "What are the high-risk AI categories?", a: "Annex III enumerates them: biometric ID, critical infrastructure, education/vocational training, employment/HR, access to essential services (credit, insurance, public benefits), law enforcement, migration/border, and judicial administration. If your AI usage touches any of those, you're high-risk regardless of which provider's model you're using — Claude doesn't make you compliant or non-compliant; YOUR USE does." },
      { q: "Do small companies need to comply?", a: "Yes, but with lighter touch. SMEs (under 250 employees, under €50m turnover) get reduced documentation requirements and access to AI regulatory sandboxes free of charge. The prohibited practices apply to everyone. Transparency obligations for general-purpose AI use (informing users they're interacting with AI, AI-generated content disclosure) apply to all sizes." },
      { q: "How do general-purpose AI rules apply?", a: "Article 53 puts the obligations primarily on the providers of general-purpose AI models (OpenAI, Anthropic, Google, Meta, Mistral) — they must publish training-data summaries, document copyright handling, and assess systemic risks for models above 10^25 FLOPS. As a customer/deployer of those models, your obligations are downstream: be transparent with end-users, maintain logs of AI-assisted decisions, and ensure human oversight on high-risk uses." },
      { q: "Does TeamPrompt classify AI risk levels?", a: "TeamPrompt provides per-prompt risk scoring (0-100) and allows admins to define sensitive topics that map to your high-risk categories. While it doesn't formally classify systems under the Act's Article 6 risk tiers (that's a legal judgment), it provides the technical monitoring data needed for risk assessments and the audit logs needed for Article 12 record-keeping. The Audit page's CSV/PDF export is structured to be supplied to a Notified Body during conformity assessment." },
      { q: "What about the AI literacy requirements?", a: "Article 4 requires providers and deployers to ensure 'a sufficient level of AI literacy' among staff. In practice, this means a documented training program covering: what AI does, limitations, when to use it, when not to. TeamPrompt's policy violation notifications double as training moments — when an employee tries to send sensitive data and is blocked, the in-context explanation IS literacy delivery. Logging those events gives you evidence of training-in-practice." },
    ],
  },
];

export function getFrameworkBySlug(slug: string): ComplianceFramework | undefined {
  return COMPLIANCE_FRAMEWORKS.find((f) => f.slug === slug);
}
