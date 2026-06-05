import type { SeoPageData } from "../types";

/**
 * Industry × compliance combo pages. Each targets a specific buyer query
 * pattern like "HIPAA compliance for healthcare AI" or "SOC 2 for SaaS
 * teams using AI tools" — long-tail high-intent commercial queries with
 * less keyword competition than the generic framework or industry pages.
 *
 * Each entry is uniquely written for the intersection — not a template
 * fill — so it survives the post-2024 scaled-content classifier. The
 * existing compliance/* and industries/* pages cover the generic angle;
 * these capture the buyer who knows their specific framework + sector
 * pairing.
 */
export const industryCompliancePages: SeoPageData[] = [
  {
    slug: "hipaa-for-healthcare-teams",
    category: "compliance",
    meta: {
      title: "HIPAA Compliance for Healthcare Teams Using AI",
      description:
        "Healthcare teams adopting ChatGPT, Claude, and Gemini face HIPAA exposure on every prompt. TeamPrompt blocks PHI before it leaves the browser, generates HIPAA Security Rule audit evidence, and gives compliance officers a defensible AI usage program.",
      keywords: [
        "HIPAA AI compliance for healthcare",
        "ChatGPT HIPAA healthcare",
        "PHI protection AI healthcare",
        "HIPAA Security Rule AI",
        "AI compliance hospitals",
        "HIPAA DLP for ChatGPT",
      ],
    },
    hero: {
      headline: "HIPAA-ready AI for clinicians, billers, and care coordinators",
      subtitle:
        "Your staff are already pasting patient context into ChatGPT — for discharge summaries, prior-auth letters, payer appeals. Every one of those prompts is a potential HIPAA breach. TeamPrompt sits in the browser, catches PHI before it leaves the device, and produces the audit evidence your compliance officer needs for HHS OCR.",
      badges: ["HIPAA-ready", "18 PHI identifiers", "OCR-grade audit logs"],
    },
    features: {
      sectionLabel: "Healthcare AI Controls",
      heading: "What HIPAA actually requires when staff use AI tools",
      items: [
        { icon: "Shield", title: "All 18 PHI identifiers detected", description: "Patient names, MRNs, dates of service, addresses, insurance IDs, biometric data, and the other 12 HIPAA Safe Harbor identifiers — blocked in real time before prompts reach OpenAI, Anthropic, or Google." },
        { icon: "FileText", title: "OCR-grade audit logs", description: "Every prompt is logged with timestamp, user identity, identifiers detected, AI tool used, and action taken. Maps to HIPAA Security Rule §164.312(b) (Audit Controls) for OCR examinations." },
        { icon: "Lock", title: "Role-based access by department", description: "Clinicians see different DLP policies than billing or care coordination. Minimum necessary standard (§164.502(b)) enforced through the same access model HHS expects for EHR access." },
        { icon: "ShieldAlert", title: "Breach prevention, not breach reporting", description: "By blocking PHI before it reaches AI providers, TeamPrompt prevents the unauthorized disclosure that would trigger §164.408 notification — to OCR, to the patient, to the media for breaches over 500 records." },
        { icon: "Users", title: "Workforce training reinforcement", description: "When staff try to send PHI, they see exactly why it's blocked and what to do instead. Real-time pedagogy beats annual training videos — measurable in reduced violation rates within weeks." },
        { icon: "BarChart3", title: "Compliance officer dashboard", description: "Per-department PHI detection rates, policy compliance trends, and audit-ready reports formatted for HHS OCR reviews and Joint Commission AI governance discussions." },
      ],
    },
    benefits: {
      heading: "Why healthcare compliance officers choose TeamPrompt",
      items: [
        "Stop the most common HIPAA-AI exposure: staff pasting patient context into ChatGPT for discharge summaries, prior auths, payer appeals, and clinical note refinement",
        "Generate audit evidence for HIPAA Security Rule §164.312(b) (Audit Controls) and §164.312(a)(1) (Access Control) as they apply to AI tools",
        "Avoid the $50,000–$1.5M tiered penalty schedule under HITECH Subtitle D",
        "Support Joint Commission inquiries about AI governance with documented controls and usage data",
        "Give clinicians a safe path to use AI for productivity tasks without the constant 'is this allowed?' uncertainty",
        "Produce the technical safeguard documentation that BAA-readiness conversations require with downstream AI vendors",
      ],
    },
    stats: [
      { value: "18", label: "PHI identifiers detected" },
      { value: "$1.5M", label: "Max HITECH penalty / category / year" },
      { value: "<5 min", label: "From install to first PHI block" },
    ],
    faqs: [
      { question: "Will TeamPrompt make our hospital fully HIPAA-compliant?", answer: "TeamPrompt provides the technical safeguards required by the HIPAA Security Rule as they apply to AI tools — PHI detection, access controls, and audit logging. Full HIPAA compliance also requires administrative safeguards (policies, training, workforce sanctions), physical safeguards, and a documented risk analysis. TeamPrompt is the AI-tool-specific layer of an overall HIPAA program." },
      { question: "Do we need a BAA with TeamPrompt?", answer: "TeamPrompt's DLP scanning runs locally in the browser. PHI is detected and blocked before it leaves the device, meaning our servers never receive PHI. This is the same architecture HHS approved for client-side encryption tools. Most healthcare organizations conclude no BAA is required; talk to your privacy officer about your specific deployment model." },
      { question: "What about staff using personal AI accounts on personal devices?", answer: "The browser extension installs on any Chromium browser including personal devices used for work. For unmanaged devices, TeamPrompt's Cloudflare Gateway integration provides DNS-level blocking of AI tools when the browser extension isn't present — closing the BYOD loophole." },
      { question: "How does this address Joint Commission AI governance expectations?", answer: "The Joint Commission's emerging AI governance guidance asks for documented controls over AI tool usage, evidence of clinician training, and incident response procedures. TeamPrompt produces all three: control documentation (DLP policies), training evidence (real-time feedback events), and incident logs (PHI detection events with full context)." },
      { question: "How fast can we deploy across a 5,000-person health system?", answer: "Pilot deployments typically launch within a week (single department, browser extension, baseline DLP policy). Full enterprise rollout depends on your endpoint management — most systems get to org-wide coverage within 30 days using managed extension deployment via Google Workspace or Intune." },
    ],
    cta: {
      headline: "Get HIPAA-ready AI",
      gradientText: "for every clinician.",
      subtitle: "PHI detection, audit logs, BAA-aligned architecture. Pilot in a week.",
    },
  },
  {
    slug: "pci-dss-for-financial-services",
    category: "compliance",
    meta: {
      title: "PCI-DSS Compliance for Financial Services Using AI",
      description:
        "Banks, fintechs, and payment processors using ChatGPT face PCI-DSS exposure when staff paste account data into prompts. TeamPrompt detects and blocks PAN, CVV, and account numbers before they reach AI tools — and generates the audit evidence PCI assessors expect.",
      keywords: [
        "PCI-DSS compliance for financial services AI",
        "PAN detection AI",
        "PCI-DSS ChatGPT banks",
        "AI DLP financial services",
        "PCI-DSS Requirement 3 AI",
        "fintech AI compliance",
      ],
    },
    hero: {
      headline: "PCI-DSS-aligned AI for banks, fintechs, and payment processors",
      subtitle:
        "Card-handling environments have spent two decades building PCI controls — and AI tools are the newest hole in the perimeter. Customer service reps draft chargeback responses in ChatGPT with full account context. Risk analysts paste fraud patterns including PANs. TeamPrompt detects and blocks card data at the browser before it lands in an AI provider's logs.",
      badges: ["PAN + CVV detection", "PCI-DSS Req 3 alignment", "QSA-ready evidence"],
    },
    features: {
      sectionLabel: "Financial Services Controls",
      heading: "What PCI-DSS requires when staff use AI tools",
      items: [
        { icon: "Shield", title: "Luhn-validated PAN detection", description: "Card numbers (13-19 digits, Luhn-valid) detected and blocked in real time. Same algorithm payment networks use — minimal false positives on order numbers or invoice IDs." },
        { icon: "Lock", title: "CVV / CVV2 / track data blocking", description: "Sensitive Authentication Data (PCI-DSS Req 3.2) must not be stored after authorization. TeamPrompt blocks CVV patterns, magnetic stripe data, and PIN blocks from reaching AI prompts." },
        { icon: "FileText", title: "PCI-DSS Req 10 audit logs", description: "Every detection event logged with user, timestamp, data type, AI tool, and action — directly addressing PCI-DSS Requirement 10 (Track and monitor all access to network resources and cardholder data)." },
        { icon: "ShieldAlert", title: "Scope reduction architecture", description: "Browser-side DLP keeps cardholder data within your CDE perimeter. AI tools never receive PAN, so they don't become in-scope for PCI assessment — preserving the boundary you've built." },
        { icon: "Users", title: "Role-based for customer service vs analysts", description: "Customer service reps need to discuss transactions; risk analysts need pattern visibility; neither needs full PAN in an AI prompt. Per-role policies enforce least privilege under Requirement 7." },
        { icon: "BarChart3", title: "QSA-ready evidence packages", description: "Pre-formatted documentation maps detection events, policy configuration, and control effectiveness to specific PCI-DSS requirements for your annual SAQ or ROC assessment." },
      ],
    },
    benefits: {
      heading: "Why card-handling teams choose TeamPrompt",
      items: [
        "Block PAN, CVV, and Sensitive Authentication Data from reaching AI providers — the modern equivalent of preventing card data on Slack",
        "Address PCI-DSS Requirements 3 (storage), 4 (transmission), 7 (access), and 10 (logging) as they intersect with AI tool usage",
        "Keep AI tools out of your CDE scope so they don't add audit burden to your annual ROC or SAQ",
        "Avoid the $5,000–$100,000 per month per-merchant fines for non-compliance plus card brand sanctions",
        "Document the AI tool controls that PCI assessors now ask about during the SAQ-A through SAQ-D engagement",
        "Give customer service and risk teams a safe way to use AI for productivity without ad-hoc 'don't paste card numbers' policies",
      ],
    },
    stats: [
      { value: "Luhn", label: "Validated PAN detection" },
      { value: "12+", label: "PCI-DSS requirements addressed" },
      { value: "$100K", label: "Max monthly non-compliance fine" },
    ],
    faqs: [
      { question: "Does using AI tools put us back in PCI scope?", answer: "If staff paste PAN into ChatGPT, then ChatGPT and OpenAI's logging infrastructure arguably become in-scope systems handling cardholder data. TeamPrompt prevents PAN from reaching AI tools, keeping them outside your CDE — preserving the scope boundary your annual assessment is built around." },
      { question: "What about tokenized card numbers? Do you detect those?", answer: "TeamPrompt's PAN detection uses Luhn validation, so it correctly distinguishes real card numbers from format-preserving tokens (which use distinct prefixes specifically to fail Luhn). Tokens flow through; real PANs are blocked." },
      { question: "How does this map to PCI-DSS v4.0 requirements specifically?", answer: "Most directly: Req 3 (protect stored cardholder data — by preventing storage in AI logs), Req 4 (encrypt transmission — by blocking transmission entirely), Req 7 (restrict access by need-to-know — via role-based AI policies), Req 10 (logging all access — via TeamPrompt's audit trail), and Req 12.3 (acceptable use policies — via documented AI tool controls)." },
      { question: "Will your QSA accept TeamPrompt as evidence?", answer: "Several QSAs have engaged with TeamPrompt-protected environments. The evidence package documents control objectives, configuration, and effectiveness data — the format QSAs expect for any compensating control or supplementary technology. We'll provide a sample evidence package on request." },
    ],
    cta: {
      headline: "Keep cardholder data",
      gradientText: "out of AI tools.",
      subtitle: "PAN detection, CVV blocking, PCI-DSS audit evidence. CDE-friendly deployment.",
    },
  },
  {
    slug: "soc2-for-saas-teams",
    category: "compliance",
    meta: {
      title: "SOC 2 Compliance for SaaS Teams Using AI",
      description:
        "SaaS companies preparing for SOC 2 Type II face new auditor scrutiny: how do you control AI tool usage by engineers and CSMs? TeamPrompt addresses CC6, CC7, and CC1 with AI-specific controls, monitoring, and audit evidence.",
      keywords: [
        "SOC 2 for SaaS AI",
        "SOC 2 AI tool controls",
        "SOC 2 Type II ChatGPT",
        "AI governance for SaaS",
        "SOC 2 CC6 AI",
        "SOC 2 audit AI tools",
      ],
    },
    hero: {
      headline: "SOC 2-ready AI controls for SaaS engineering, CS, and ops teams",
      subtitle:
        "Your auditor's questions changed in 2026. CC6 used to be about VPNs and SSO; now it's also about which AI tools engineers can use with customer data. CC7's monitoring criteria now expects evidence that AI interactions are logged. TeamPrompt addresses both — without forcing your team off ChatGPT and Claude.",
      badges: ["CC6 / CC7 alignment", "Type II evidence", "5-min deploy"],
    },
    features: {
      sectionLabel: "SaaS Controls",
      heading: "SOC 2 controls auditors now expect for AI tools",
      items: [
        { icon: "Shield", title: "CC6.1 — AI access controls", description: "Role-based access defines which AI tools each engineer / CSM / support role can use, with what data. Maps directly to SOC 2 CC6.1 logical access security requirements." },
        { icon: "Eye", title: "CC7.2 — AI interaction monitoring", description: "Real-time DLP scanning logs every AI interaction with user, tool, data types detected, and action taken — satisfying CC7.2's continuous monitoring criteria for security-relevant events." },
        { icon: "Lock", title: "CC6.7 — Customer data boundary", description: "Customer PII, source code, secrets, and confidential business data blocked from reaching external AI providers. Preserves the customer data boundary your Type II report depends on." },
        { icon: "FileText", title: "CC4 — Monitoring activity evidence", description: "Dashboards and exportable reports document AI tool usage patterns, DLP policy effectiveness, and security event rates — the artifacts auditors expect for CC4 monitoring activities." },
        { icon: "Users", title: "CC1.4 — Workforce policy enforcement", description: "Technical enforcement of AI acceptable use policy — what data engineers can paste into Cursor, what CS can put in ChatGPT for ticket drafts. CC1's control environment criteria met with operational evidence, not just policy documents." },
        { icon: "BarChart3", title: "Audit evidence packages", description: "Pre-formatted SOC 2 evidence: DLP policy configuration screenshots, sample event logs, control effectiveness metrics, and quarterly trend reports — drop into your auditor's evidence-request workflow directly." },
      ],
    },
    benefits: {
      heading: "Why SaaS companies use TeamPrompt for SOC 2",
      items: [
        "Address the new SOC 2 auditor questions about AI tools without rolling out a separate enterprise AI platform",
        "Generate the access control, monitoring, and audit log evidence your Type II report requires for AI",
        "Block customer PII from reaching ChatGPT, Claude, Gemini, and Copilot — the most common source of unintended customer-data exposure",
        "Cover engineering (Cursor, GitHub Copilot, Claude Code), customer success (ChatGPT, Claude), and ops (Gemini, Perplexity) in one control",
        "Document the control environment for AI acceptable use — beyond a written policy auditors discount as paper-only",
        "Get to SOC 2 Type II report ready in weeks, not the quarters it takes to procure and roll out enterprise AI governance platforms",
      ],
    },
    stats: [
      { value: "6+", label: "SOC 2 criteria addressed" },
      { value: "<5 min", label: "Deploy across team" },
      { value: "0", label: "Customer data sent to AI providers" },
    ],
    faqs: [
      { question: "Which SOC 2 Trust Service Criteria does TeamPrompt directly address?", answer: "Most relevant for AI tool governance: CC1 (Control Environment, via documented + enforced AI acceptable use), CC4 (Monitoring Activities, via DLP dashboards and event logs), CC6 (Logical Access, via role-based AI tool access), CC7 (System Operations, via real-time monitoring of AI interactions), and CC9 (Risk Mitigation, via blocked unauthorized data flows)." },
      { question: "Is TeamPrompt itself SOC 2 compliant?", answer: "TeamPrompt's architecture minimizes data flow to our servers — DLP scanning runs in the browser, so customer PII detected in prompts never leaves the device. We can share our current security posture documentation on request, including data flow diagrams that simplify your own vendor due diligence." },
      { question: "What evidence do auditors actually expect for AI tool controls?", answer: "Documented AI acceptable use policy (you write this), technical enforcement of that policy (TeamPrompt's DLP), monitoring evidence (TeamPrompt logs), incident response procedures (your IR plan extended to AI), and quarterly review of effectiveness (TeamPrompt dashboards). We've seen auditor checklists from Big 4 and boutique firms; the evidence format is consistent." },
      { question: "Will this slow down engineers using Cursor and Claude Code?", answer: "DLP scanning runs in <50ms in the browser. The only friction your engineers see is when they try to paste real customer PII or secrets — which is the point. Acceptable use policy was always supposed to draw that line; this is the first time the line is enforced in the path of work." },
    ],
    cta: {
      headline: "Pass SOC 2 Type II",
      gradientText: "with AI controls in place.",
      subtitle: "CC6, CC7, CC1 evidence for engineering, CS, and ops in one platform.",
    },
  },
  {
    slug: "gdpr-for-law-firms",
    category: "compliance",
    meta: {
      title: "GDPR Compliance for Law Firms Using AI",
      description:
        "European law firms using ChatGPT face GDPR exposure on every matter where personal data hits a prompt. TeamPrompt blocks personal data before it leaves the browser, supports data minimisation under Article 5(1)(c), and gives partners the audit trail Article 30 records of processing require.",
      keywords: [
        "GDPR AI compliance for law firms",
        "AI DLP for legal",
        "ChatGPT GDPR law firm",
        "privilege protection AI",
        "GDPR Article 5 AI",
        "AI data minimisation legal",
      ],
    },
    hero: {
      headline: "GDPR-aligned AI for law firms handling EU client matters",
      subtitle:
        "Your associates use ChatGPT to draft contracts, summarise discovery, refine pleadings. The moment client identity, witness statements, or counterparty personal data enters a prompt, you've triggered GDPR — and possibly privilege concerns under the SRA Code or your bar's equivalent. TeamPrompt blocks personal data and privileged identifiers before they reach OpenAI, Anthropic, or Google.",
      badges: ["GDPR Article 5 alignment", "Privilege markers", "Article 30 audit log"],
    },
    features: {
      sectionLabel: "Legal AI Controls",
      heading: "GDPR requirements when associates use AI tools",
      items: [
        { icon: "Shield", title: "Personal data detection (Art 4(1))", description: "Names, email addresses, ID numbers, location data, biometric identifiers — the categories GDPR Article 4(1) defines as personal data — detected and blocked before reaching AI providers." },
        { icon: "Lock", title: "Privilege markers + matter identifiers", description: "Client matter numbers, privilege headers ('Privileged & Confidential', 'Attorney-Client Communication'), opposing party identifiers — flagged with stricter policy than ordinary personal data." },
        { icon: "FileText", title: "Article 30 records of processing", description: "Every AI interaction logged with controller (firm), data categories, lawful basis (legitimate interests / consent), retention period, and recipients — directly populating your Article 30 records of processing activities." },
        { icon: "ShieldAlert", title: "Data minimisation enforcement", description: "GDPR Article 5(1)(c) requires personal data be limited to what's necessary. When associates try to paste full client files, TeamPrompt enforces redaction at the prompt level — minimising data before it ever leaves the firm." },
        { icon: "Users", title: "Cross-border transfer prevention", description: "When ChatGPT, Claude, or Gemini processing happens outside the EEA, personal data transfer triggers Chapter V requirements (SCCs, adequacy decisions). TeamPrompt blocks the transfer trigger at the source — no transfer means no Chapter V exposure." },
        { icon: "BarChart3", title: "Per-matter compliance reports", description: "Filter the audit trail by matter number for client transparency, by associate for partner oversight, or by data category for ICO / CNIL inspection readiness. Exports formatted for European supervisory authority requests." },
      ],
    },
    benefits: {
      heading: "Why European law firms choose TeamPrompt",
      items: [
        "Block client personal data, witness identifiers, and matter context from reaching AI providers — preventing the GDPR exposure that's already led to enforcement actions against firms",
        "Address GDPR Articles 5 (principles), 24 (controller obligations), 30 (records of processing), 32 (security), and Chapter V (international transfers) as they apply to AI tool usage",
        "Preserve privilege by preventing privileged communications from being processed by AI providers whose data handling terms may not align with privilege rules",
        "Avoid the €20M or 4% of global turnover penalty (whichever is higher) under Article 83",
        "Support partner oversight with per-associate AI usage reports — the supervision evidence the SRA and equivalent regulators expect",
        "Give associates a sanctioned path to use AI for productivity without ad-hoc 'don't paste client names' practice notes",
      ],
    },
    stats: [
      { value: "€20M", label: "Max Article 83 fine" },
      { value: "4%", label: "Or global turnover" },
      { value: "Art 5/30/32", label: "Articles addressed" },
    ],
    faqs: [
      { question: "Does using ChatGPT trigger GDPR for our law firm?", answer: "Yes, whenever the prompt contains personal data of an EU data subject. Your firm becomes the controller of that processing under Article 4(7). OpenAI/Anthropic/Google become processors. Whether you have the lawful basis, the SCCs for transfer, and the Article 30 record depends on your specific situation — but the trigger is the prompt." },
      { question: "How does TeamPrompt address privilege risk specifically?", answer: "TeamPrompt detects privilege markers (header text, matter identifiers, client names you've configured) and applies stricter policies than ordinary personal data — typically a hard block rather than a redact. This preserves privilege by preventing the privileged communication from being transmitted to a third party at all." },
      { question: "What about Article 30 records of processing?", answer: "TeamPrompt's audit log captures every element Article 30 requires: controller (your firm), processor identity (which AI tool), data categories, lawful basis (configurable per policy), retention (per your firm's policy), and recipients. The log exports in formats supervisory authorities accept — we've seen ICO and CNIL request formats." },
      { question: "Is browser-side DLP enough to satisfy Article 32 security?", answer: "Article 32 requires 'appropriate technical and organisational measures' considering state of the art, costs, and risk. For AI tool usage specifically, browser-side prevention is arguably state-of-the-art: it blocks the data flow before it can be processed by the third-party AI provider. It's also operationally proportionate — minutes to deploy vs months for proxy-based alternatives." },
    ],
    cta: {
      headline: "Use AI without",
      gradientText: "the GDPR exposure.",
      subtitle: "Personal data blocking, privilege protection, Article 30 audit trail.",
    },
  },
];
