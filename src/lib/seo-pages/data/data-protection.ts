import type { SeoPageData } from "../types";

export const dataProtectionPages: SeoPageData[] = [
  // ── By tool ──────────────────────────────────────────────────────────
  {
    slug: "prevent-data-leaks-chatgpt",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks in ChatGPT | TeamPrompt DLP",
      description:
        "Stop sensitive data from reaching ChatGPT. TeamPrompt scans every prompt for PII, API keys, source code, and credentials before submission — keeping your organization safe without slowing anyone down.",
      keywords: ["ChatGPT data leak prevention", "ChatGPT DLP", "prevent data leaks ChatGPT", "ChatGPT security", "ChatGPT sensitive data"],
    },
    hero: {
      headline: "Prevent data leaks every time your team uses ChatGPT",
      subtitle:
        "ChatGPT is the most widely used AI tool in the workplace — and the most common source of accidental data exposure. TeamPrompt scans every prompt before it reaches OpenAI, blocking PII, credentials, source code, and regulated data in real time.",
      badges: ["Real-time scanning", "ChatGPT-specific", "Zero friction"],
    },
    features: {
      sectionLabel: "Protection",
      heading: "How TeamPrompt secures ChatGPT usage",
      items: [
        { icon: "Shield", title: "Pre-submission prompt scanning", description: "Every prompt is analyzed for sensitive patterns before it leaves the browser. If PII, API keys, or regulated data are detected, the prompt is blocked and the user is notified immediately." },
        { icon: "Eye", title: "Real-time content inspection", description: "TeamPrompt inspects prompt content in real time as users type or paste into ChatGPT, catching sensitive data before the send button is ever clicked." },
        { icon: "Key", title: "API key and credential detection", description: "Detects AWS keys, database connection strings, OAuth tokens, and other credentials that developers frequently paste into ChatGPT for debugging help." },
        { icon: "UserX", title: "PII and PHI identification", description: "Automatically identifies Social Security numbers, email addresses, phone numbers, patient health records, and other personally identifiable information." },
        { icon: "FileText", title: "Source code protection", description: "Prevents proprietary source code, internal algorithms, and trade secrets from being submitted to ChatGPT where they become part of OpenAI's data pipeline." },
        { icon: "BarChart3", title: "Usage and incident reporting", description: "Every blocked prompt generates an audit log entry. Dashboards show how many leaks were prevented, what types of data were caught, and which teams need additional training." },
      ],
    },
    benefits: {
      heading: "Why teams protect ChatGPT with TeamPrompt",
      items: [
        "Block sensitive data before it reaches OpenAI servers automatically",
        "Catch API keys, credentials, and secrets developers paste for debugging",
        "Prevent accidental PII exposure without restricting ChatGPT access",
        "Generate audit logs that satisfy compliance and security team requirements",
        "Protect proprietary source code from becoming AI training data",
        "Deploy in minutes via browser extension with no IT infrastructure changes",
      ],
    },
    stats: [
      { value: "15", label: "Built-in DLP rules" },
      { value: "5", label: "AI tools supported" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "Does this block all ChatGPT usage?", answer: "No. TeamPrompt only blocks prompts that contain sensitive data. Your team continues using ChatGPT freely for all safe interactions. The goal is protection without productivity loss." },
      { question: "Does TeamPrompt work with ChatGPT Plus and Teams?", answer: "Yes. TeamPrompt operates at the browser level via a Chrome extension, so it works with every ChatGPT plan — Free, Plus, Team, and Enterprise — without any API integration required." },
      { question: "What happens when a prompt is blocked?", answer: "The user sees a clear notification explaining what sensitive data was detected and why the prompt was blocked. They can redact the flagged content and resubmit, maintaining their workflow with minimal disruption." },
    ],
    cta: {
      headline: "Let your team use ChatGPT",
      gradientText: "without the risk.",
      subtitle: "Deploy DLP protection for ChatGPT in minutes. Free plan available.",
    },
  },
  {
    slug: "prevent-data-leaks-claude",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks in Claude | TeamPrompt DLP",
      description:
        "Protect sensitive data when your team uses Anthropic Claude. TeamPrompt scans every prompt for PII, secrets, and regulated data before it reaches Claude — real-time DLP without blocking productivity.",
      keywords: ["Claude data leak prevention", "Claude DLP", "Anthropic Claude security", "prevent data leaks Claude", "Claude sensitive data"],
    },
    hero: {
      headline: "Prevent data leaks when your team uses Claude",
      subtitle:
        "Anthropic Claude is trusted for thoughtful, accurate AI — but even the best model cannot protect your data from accidental exposure. TeamPrompt scans every prompt before it reaches Claude, catching PII, credentials, and regulated data in real time.",
      badges: ["Claude-compatible", "Real-time DLP", "Browser-level"],
    },
    features: {
      sectionLabel: "Protection",
      heading: "How TeamPrompt secures Claude usage",
      items: [
        { icon: "Shield", title: "Browser-level prompt interception", description: "TeamPrompt intercepts prompts at the browser level before they reach Anthropic's servers, providing a last line of defense against accidental data exposure." },
        { icon: "Lock", title: "Regulated data detection", description: "Identifies HIPAA-protected health information, GDPR-covered personal data, and financial records before they are submitted to Claude for analysis." },
        { icon: "Key", title: "Secret and credential scanning", description: "Catches API keys, SSH keys, database credentials, and authentication tokens that developers frequently share with Claude for troubleshooting assistance." },
        { icon: "Eye", title: "Paste content analysis", description: "Analyzes content pasted into Claude's input field, catching sensitive data embedded in code snippets, log files, and document excerpts." },
        { icon: "Users", title: "Team-wide policy enforcement", description: "Apply consistent DLP policies across every team member's Claude usage, ensuring the same protection standards regardless of individual behavior." },
        { icon: "BarChart3", title: "Incident analytics dashboard", description: "Track blocked prompts, data types detected, and user patterns to identify training gaps and refine your data protection policies over time." },
      ],
    },
    benefits: {
      heading: "Why teams protect Claude with TeamPrompt",
      items: [
        "Scan every prompt for sensitive data before it reaches Anthropic servers",
        "Detect credentials and secrets in code snippets shared with Claude",
        "Enforce consistent DLP policies across all Claude users in your organization",
        "Maintain compliance with HIPAA, GDPR, and SOC 2 when teams use Claude",
        "Generate audit trails for every interaction with Claude across your team",
        "Deploy protection without restricting access to Claude's capabilities",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "< 2 min", label: "Setup time" },
      { value: "31", label: "Total available detection rules" },
    ],
    faqs: [
      { question: "Does this work with Claude Pro and Claude for Work?", answer: "Yes. TeamPrompt operates via a Chrome extension at the browser level, so it works with every Claude subscription tier including Free, Pro, and Claude for Work plans." },
      { question: "Can I customize what types of data are blocked?", answer: "Yes. Administrators can configure DLP rules to match their organization's specific requirements — choosing which data types to block, warn about, or allow based on team and role." },
      { question: "Does this slow down Claude interactions?", answer: "No. Prompt scanning happens in milliseconds before submission. Users experience no perceptible delay in their interactions with Claude." },
    ],
    cta: {
      headline: "Use Claude confidently",
      gradientText: "with data protection built in.",
      subtitle: "Protect every Claude interaction. Deploy in minutes.",
    },
  },
  {
    slug: "prevent-data-leaks-gemini",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks in Google Gemini | TeamPrompt DLP",
      description:
        "Stop sensitive data from reaching Google Gemini. TeamPrompt provides real-time DLP scanning for every Gemini prompt, protecting PII, credentials, and proprietary information.",
      keywords: ["Gemini data leak prevention", "Google Gemini DLP", "Gemini security", "prevent data leaks Gemini", "Gemini sensitive data protection"],
    },
    hero: {
      headline: "Prevent data leaks when your team uses Google Gemini",
      subtitle:
        "Google Gemini integrates deeply with Workspace — which means sensitive data from Docs, Sheets, and Gmail is just a prompt away from exposure. TeamPrompt scans every Gemini prompt before submission, catching data leaks at the point of entry.",
      badges: ["Gemini-compatible", "Workspace-aware", "Real-time DLP"],
    },
    features: {
      sectionLabel: "Protection",
      heading: "How TeamPrompt secures Gemini usage",
      items: [
        { icon: "Shield", title: "Pre-submission DLP scanning", description: "Every prompt to Gemini is scanned for sensitive data patterns before it reaches Google's servers, preventing accidental exposure of confidential information." },
        { icon: "Globe", title: "Cross-platform coverage", description: "Protects Gemini usage across the web interface, ensuring consistent DLP coverage wherever your team accesses Gemini." },
        { icon: "Lock", title: "Proprietary data protection", description: "Prevents business-critical data like financial projections, strategic plans, and customer lists from being submitted to Gemini for analysis." },
        { icon: "UserX", title: "Personal data filtering", description: "Detects and blocks personally identifiable information including names, addresses, phone numbers, and government IDs before they reach Gemini." },
        { icon: "Key", title: "Infrastructure secret detection", description: "Identifies cloud credentials, API keys, and infrastructure secrets that engineers may paste into Gemini for configuration help." },
        { icon: "BarChart3", title: "Compliance reporting", description: "Generates detailed reports on DLP events, blocked prompts, and data categories for compliance audits and security reviews." },
      ],
    },
    benefits: {
      heading: "Why teams protect Gemini with TeamPrompt",
      items: [
        "Prevent sensitive Workspace data from leaking through Gemini prompts",
        "Block PII, credentials, and trade secrets before they reach Google servers",
        "Maintain consistent DLP policies across Gemini and other AI tools",
        "Generate compliance reports for security audits and regulatory requirements",
        "Protect proprietary business data without restricting Gemini access",
        "Deploy browser-level protection with no changes to your Google Workspace setup",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "6", label: "One-click compliance packs" },
      { value: "5", label: "AI tools supported" },
    ],
    faqs: [
      { question: "Does TeamPrompt work with Gemini Advanced?", answer: "Yes. TeamPrompt works with all Gemini tiers — Free, Advanced, and Business — because it operates at the browser level rather than through Google's API." },
      { question: "Can I use TeamPrompt alongside Google Workspace DLP?", answer: "Absolutely. TeamPrompt complements Google Workspace DLP by adding protection specifically for AI prompt submissions, which Workspace DLP does not cover natively." },
      { question: "What if Gemini is embedded in other Google products?", answer: "TeamPrompt currently protects Gemini in its primary web interface. As Google embeds Gemini into more products, TeamPrompt will expand coverage to match." },
    ],
    cta: {
      headline: "Use Gemini freely",
      gradientText: "without exposing sensitive data.",
      subtitle: "Add DLP protection for Gemini today. Free plan available.",
    },
  },
  {
    slug: "prevent-data-leaks-copilot",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks in Microsoft Copilot | TeamPrompt DLP",
      description:
        "Protect sensitive data when your team uses Microsoft Copilot. TeamPrompt scans every prompt for PII, source code, and credentials before submission — real-time DLP for Copilot.",
      keywords: ["Copilot data leak prevention", "Microsoft Copilot DLP", "Copilot security", "prevent data leaks Copilot", "Copilot data protection"],
    },
    hero: {
      headline: "Prevent data leaks when your team uses Microsoft Copilot",
      subtitle:
        "Microsoft Copilot sits inside the tools your team already uses — which means it has access to everything. TeamPrompt adds a DLP layer that scans every prompt before submission, catching sensitive data that Copilot's built-in controls miss.",
      badges: ["Copilot-compatible", "Enterprise DLP", "Real-time scanning"],
    },
    features: {
      sectionLabel: "Protection",
      heading: "How TeamPrompt secures Copilot usage",
      items: [
        { icon: "Shield", title: "Prompt-level DLP enforcement", description: "Every prompt submitted to Copilot is scanned for sensitive patterns including PII, PHI, credentials, and proprietary data before it reaches Microsoft's AI services." },
        { icon: "Building2", title: "Enterprise-grade detection", description: "Detects enterprise-specific sensitive data patterns including internal project names, customer account numbers, and proprietary terminology." },
        { icon: "Key", title: "Credential interception", description: "Catches passwords, API keys, connection strings, and authentication tokens that users paste into Copilot for troubleshooting or code review." },
        { icon: "FileText", title: "Document content scanning", description: "When users reference or paste document contents into Copilot, TeamPrompt scans the submitted text for sensitive information embedded in the content." },
        { icon: "Lock", title: "Policy-based blocking", description: "Administrators define DLP policies that match their organization's data classification. Prompts containing restricted data categories are blocked automatically." },
        { icon: "BarChart3", title: "Security event monitoring", description: "Every DLP event is logged with full context — user, timestamp, data type detected, and action taken — providing complete visibility for security teams." },
      ],
    },
    benefits: {
      heading: "Why teams protect Copilot with TeamPrompt",
      items: [
        "Add DLP scanning to every Copilot interaction across your organization",
        "Catch credentials and secrets in code shared with Copilot for review",
        "Block PII and PHI exposure before data reaches Microsoft AI services",
        "Enforce organization-specific data classification policies automatically",
        "Generate audit logs that satisfy SOC 2 and compliance requirements",
        "Deploy alongside Microsoft Purview for defense-in-depth data protection",
      ],
    },
    stats: [
      { value: "6", label: "One-click compliance packs" },
      { value: "15", label: "Built-in DLP rules" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "Does this work with Microsoft 365 Copilot?", answer: "TeamPrompt protects Copilot interactions through the browser. It works with the Copilot web interface and catches prompts before they are submitted to Microsoft's AI services." },
      { question: "How does this compare to Microsoft Purview?", answer: "Microsoft Purview focuses on data classification within Microsoft 365. TeamPrompt adds prompt-specific DLP that scans the actual content being submitted to AI tools — a layer Purview does not cover for outbound AI prompts." },
      { question: "Can I allow some data types while blocking others?", answer: "Yes. Administrators can configure granular policies that block specific data types like SSNs and API keys while allowing other content. Policies can vary by team, role, or department." },
    ],
    cta: {
      headline: "Let your team use Copilot",
      gradientText: "with enterprise data protection.",
      subtitle: "Add DLP for Copilot in minutes. No infrastructure changes required.",
    },
  },
  {
    slug: "prevent-data-leaks-perplexity",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks in Perplexity AI | TeamPrompt DLP",
      description:
        "Stop sensitive data from reaching Perplexity AI. TeamPrompt scans every query for PII, credentials, and proprietary information before submission — protecting your data without blocking research.",
      keywords: ["Perplexity data leak prevention", "Perplexity DLP", "Perplexity AI security", "prevent data leaks Perplexity", "Perplexity data protection"],
    },
    hero: {
      headline: "Prevent data leaks when your team uses Perplexity AI",
      subtitle:
        "Perplexity is a powerful research tool — but research queries often contain sensitive context about projects, customers, and strategies. TeamPrompt scans every Perplexity query before submission, ensuring proprietary information never leaves your organization.",
      badges: ["Perplexity-compatible", "Research-safe", "Real-time DLP"],
    },
    features: {
      sectionLabel: "Protection",
      heading: "How TeamPrompt secures Perplexity usage",
      items: [
        { icon: "Shield", title: "Query-level scanning", description: "Every Perplexity search query is scanned for sensitive data before submission. Research questions that contain customer names, project details, or confidential terms are flagged immediately." },
        { icon: "Eye", title: "Context-aware detection", description: "TeamPrompt understands that research queries often embed sensitive context. It detects company-specific data, customer information, and strategic details within natural language queries." },
        { icon: "Lock", title: "Proprietary research protection", description: "Prevents competitive intelligence, M&A research, and product roadmap details from being exposed through Perplexity queries that could surface in public results." },
        { icon: "Key", title: "Technical secret scanning", description: "Catches infrastructure details, internal URLs, IP addresses, and technical architecture information that engineers include in Perplexity research queries." },
        { icon: "Users", title: "Team policy enforcement", description: "Apply consistent research data policies across your entire team, ensuring everyone follows the same data protection standards when using Perplexity." },
        { icon: "BarChart3", title: "Research activity monitoring", description: "Track Perplexity usage patterns, blocked queries, and data types detected to understand how your team uses AI research tools and where risks exist." },
      ],
    },
    benefits: {
      heading: "Why teams protect Perplexity with TeamPrompt",
      items: [
        "Prevent proprietary research context from leaking through search queries",
        "Block customer names, project details, and strategic information automatically",
        "Protect competitive intelligence and M&A research from exposure",
        "Enforce consistent data protection policies across all Perplexity users",
        "Maintain audit trails for every Perplexity interaction across your team",
        "Enable safe AI-powered research without restricting Perplexity access",
      ],
    },
    stats: [
      { value: "5", label: "AI tools supported" },
      { value: "16", label: "Smart detection patterns" },
      { value: "$9/mo", label: "Starting price" },
    ],
    faqs: [
      { question: "Does this work with Perplexity Pro?", answer: "Yes. TeamPrompt works with all Perplexity tiers because it operates at the browser level. Whether your team uses Perplexity Free or Pro, every query is scanned before submission." },
      { question: "Will this slow down my Perplexity searches?", answer: "No. Scanning happens in milliseconds before the query is submitted. The delay is imperceptible, so your research workflow remains fast and uninterrupted." },
      { question: "Can I set different policies for research teams?", answer: "Yes. Administrators can create team-specific DLP policies. Research teams might have different data sensitivity thresholds than engineering or finance teams." },
    ],
    cta: {
      headline: "Research freely",
      gradientText: "without risking data leaks.",
      subtitle: "Protect every Perplexity query. Deploy DLP in minutes.",
    },
  },

  // ── By data type ─────────────────────────────────────────────────────
  {
    slug: "prevent-leaks-api-keys",
    category: "data-protection",
    meta: {
      title: "Prevent API Key Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Stop API keys and secrets from being pasted into ChatGPT, Claude, and other AI tools. TeamPrompt detects and blocks credentials in real time before they leave your browser.",
      keywords: ["API key leak prevention", "prevent API key exposure AI", "API key DLP", "secret scanning AI tools", "credential leak prevention"],
    },
    hero: {
      headline: "Stop API keys from leaking into AI tools",
      subtitle:
        "Developers paste API keys into AI tools dozens of times a day for debugging, configuration help, and code review. TeamPrompt detects every key pattern — AWS, GCP, Stripe, database, and more — and blocks submission before secrets reach external servers.",
      badges: ["Secret detection", "Pattern matching", "Zero-latency"],
    },
    features: {
      sectionLabel: "Detection",
      heading: "How TeamPrompt catches API key leaks",
      items: [
        { icon: "Key", title: "Multi-provider key detection", description: "Detects API key patterns for AWS, GCP, Azure, Stripe, Twilio, SendGrid, and dozens of other providers using pattern matching and entropy analysis." },
        { icon: "Shield", title: "Database credential scanning", description: "Catches connection strings, database passwords, and Redis URLs that developers frequently paste into AI tools for configuration troubleshooting." },
        { icon: "Lock", title: "OAuth token identification", description: "Identifies OAuth access tokens, refresh tokens, and JWT payloads that can provide unauthorized access to your organization's services." },
        { icon: "Eye", title: "Environment variable detection", description: "Recognizes .env file contents, Docker environment variables, and Kubernetes secrets pasted into prompts for deployment help." },
        { icon: "ShieldAlert", title: "SSH key protection", description: "Blocks private SSH keys, PEM files, and certificate content from being submitted to any AI tool." },
        { icon: "BarChart3", title: "Developer risk analytics", description: "Track which teams and projects generate the most credential leak attempts, enabling targeted security training and process improvements." },
      ],
    },
    benefits: {
      heading: "Why API key protection matters for AI usage",
      items: [
        "Prevent credential exposure that could lead to unauthorized access and data breaches",
        "Catch keys from dozens of providers using advanced pattern matching",
        "Protect database credentials that developers paste for troubleshooting",
        "Block OAuth tokens and JWT payloads before they reach AI servers",
        "Identify high-risk teams that need additional security training",
        "Eliminate the most common vector for secret exposure in AI workflows",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "31", label: "Total available detection rules" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "Which API key formats does TeamPrompt detect?", answer: "TeamPrompt detects key patterns for AWS, GCP, Azure, Stripe, Twilio, SendGrid, GitHub, GitLab, Slack, and dozens more. It also uses entropy analysis to catch non-standard key formats." },
      { question: "What about keys embedded in code snippets?", answer: "TeamPrompt scans the entire prompt content, including code blocks. If an API key appears anywhere in a code snippet, configuration file, or log excerpt, it will be detected." },
      { question: "Can I whitelist certain key patterns?", answer: "Yes. Administrators can configure exceptions for test keys, public keys, or placeholder values that match key patterns but are not actual secrets." },
    ],
    cta: {
      headline: "Keep your secrets",
      gradientText: "out of AI tools.",
      subtitle: "Detect and block API key leaks in real time. Free plan available.",
    },
  },
  {
    slug: "prevent-leaks-source-code",
    category: "data-protection",
    meta: {
      title: "Prevent Source Code Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Protect proprietary source code from being pasted into ChatGPT, Claude, and Copilot. TeamPrompt detects and blocks code submissions that could expose your intellectual property.",
      keywords: ["source code leak prevention", "prevent code leaks AI", "source code DLP", "code protection AI tools", "intellectual property AI"],
    },
    hero: {
      headline: "Prevent proprietary source code from leaking to AI tools",
      subtitle:
        "Developers paste code into AI tools constantly — for debugging, refactoring, and code review. TeamPrompt ensures proprietary algorithms, internal libraries, and trade-secret code never reach external AI servers where they could become training data.",
      badges: ["Code detection", "IP protection", "Developer-friendly"],
    },
    features: {
      sectionLabel: "Protection",
      heading: "How TeamPrompt protects your source code",
      items: [
        { icon: "FileText", title: "Proprietary code detection", description: "Identifies internal package names, proprietary function signatures, and company-specific code patterns that indicate proprietary source code in a prompt." },
        { icon: "Shield", title: "Algorithm protection", description: "Prevents core algorithms, business logic, and computational methods from being submitted to AI tools where they could be retained or reproduced." },
        { icon: "Lock", title: "Internal library scanning", description: "Detects references to internal frameworks, private npm packages, and proprietary SDKs that should never leave your organization's boundaries." },
        { icon: "Eye", title: "Configuration file detection", description: "Catches infrastructure configuration, deployment scripts, and CI/CD pipeline definitions that reveal your internal architecture." },
        { icon: "GitBranch", title: "Repository context awareness", description: "Recognizes code that references internal repositories, branch names, and project structures specific to your organization." },
        { icon: "BarChart3", title: "Code exposure analytics", description: "Track which repositories and codebases generate the most leak attempts, helping engineering leaders address the root causes of code exposure." },
      ],
    },
    benefits: {
      heading: "Why source code protection matters",
      items: [
        "Prevent proprietary algorithms from becoming AI training data",
        "Block internal library and framework code from reaching external servers",
        "Protect infrastructure configurations that reveal your architecture",
        "Maintain intellectual property boundaries without banning AI tools",
        "Identify which codebases are most at risk of accidental exposure",
        "Satisfy legal and compliance requirements for code confidentiality",
      ],
    },
    stats: [
      { value: "15", label: "Built-in DLP rules" },
      { value: "5", label: "AI tools supported" },
      { value: "6", label: "One-click compliance packs" },
    ],
    faqs: [
      { question: "Can developers still use AI for generic coding help?", answer: "Absolutely. TeamPrompt only blocks prompts that contain proprietary code. Developers can freely ask AI tools about public libraries, general programming concepts, and open-source code." },
      { question: "How does TeamPrompt distinguish proprietary code from public code?", answer: "TeamPrompt uses configurable rules based on internal package names, proprietary identifiers, and code patterns specific to your organization. Admins define what constitutes proprietary code." },
      { question: "What about code snippets in Stack Overflow format?", answer: "TeamPrompt scans all code content regardless of formatting. Whether code is pasted raw, in markdown blocks, or formatted as a Stack Overflow question, proprietary patterns will be detected." },
    ],
    cta: {
      headline: "Protect your code",
      gradientText: "from AI data exposure.",
      subtitle: "Keep proprietary source code safe. Deploy in minutes.",
    },
  },
  {
    slug: "prevent-leaks-pii",
    category: "data-protection",
    meta: {
      title: "Prevent PII Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Stop personally identifiable information from reaching AI tools. TeamPrompt detects names, emails, SSNs, addresses, and phone numbers in every prompt before submission.",
      keywords: ["PII leak prevention", "prevent PII exposure AI", "PII DLP AI tools", "personal data protection AI", "PII scanning"],
    },
    hero: {
      headline: "Stop PII from leaking into AI tools",
      subtitle:
        "Every day, employees paste customer names, email addresses, phone numbers, and Social Security numbers into AI tools without thinking twice. TeamPrompt catches every PII pattern before the prompt leaves the browser.",
      badges: ["PII detection", "Multi-pattern", "GDPR-ready"],
    },
    features: {
      sectionLabel: "Detection",
      heading: "How TeamPrompt catches PII in prompts",
      items: [
        { icon: "UserX", title: "Name and identity detection", description: "Identifies full names, email addresses, usernames, and other identity markers that could link AI-processed data to real individuals." },
        { icon: "Shield", title: "Government ID scanning", description: "Detects Social Security numbers, driver's license numbers, passport numbers, and national ID formats from multiple countries." },
        { icon: "Lock", title: "Contact information blocking", description: "Catches phone numbers, physical addresses, IP addresses, and other contact information that constitutes PII under most privacy regulations." },
        { icon: "Eye", title: "Financial PII detection", description: "Identifies credit card numbers, bank account details, and financial account identifiers embedded in prompts." },
        { icon: "Globe", title: "International PII formats", description: "Supports PII detection patterns for multiple countries and regions, including EU national IDs, UK NHS numbers, and Canadian SINs." },
        { icon: "BarChart3", title: "PII exposure reporting", description: "Comprehensive dashboards show PII detection events by type, team, and frequency — enabling targeted privacy training and process improvements." },
      ],
    },
    benefits: {
      heading: "Why PII protection is critical for AI usage",
      items: [
        "Prevent customer PII from reaching AI providers and becoming training data",
        "Satisfy GDPR, CCPA, and other privacy regulation requirements automatically",
        "Catch PII embedded in support tickets, CRM exports, and database dumps",
        "Detect international PII formats across multiple countries and regions",
        "Generate privacy audit trails for regulatory compliance documentation",
        "Protect your organization from PII-related breach notification requirements",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "16", label: "Smart detection patterns" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "What types of PII does TeamPrompt detect?", answer: "TeamPrompt detects names, email addresses, phone numbers, SSNs, credit card numbers, physical addresses, IP addresses, government IDs, passport numbers, and more — covering PII categories defined by GDPR, CCPA, and other major regulations." },
      { question: "Can I add custom PII patterns?", answer: "Yes. Administrators can define custom regex patterns for organization-specific identifiers like employee IDs, customer account numbers, or internal reference codes." },
      { question: "Does this help with GDPR compliance?", answer: "Yes. Preventing PII from reaching AI tools directly supports GDPR's data minimization principle and helps demonstrate that your organization has appropriate technical measures to protect personal data." },
    ],
    cta: {
      headline: "Keep personal data",
      gradientText: "out of AI tools.",
      subtitle: "Deploy PII protection in minutes. No configuration required.",
    },
  },
  {
    slug: "prevent-leaks-phi",
    category: "data-protection",
    meta: {
      title: "Prevent PHI Leaks to AI Tools | HIPAA-Ready DLP | TeamPrompt",
      description:
        "Protect patient health information from reaching AI tools. TeamPrompt detects PHI in every prompt — medical records, diagnoses, prescriptions, and patient identifiers — before submission.",
      keywords: ["PHI leak prevention", "prevent PHI exposure AI", "HIPAA DLP", "protected health information AI", "healthcare data protection AI"],
    },
    hero: {
      headline: "Prevent PHI from leaking into AI tools",
      subtitle:
        "Healthcare organizations face HIPAA penalties of up to $1.5 million per violation category. TeamPrompt scans every prompt for protected health information — patient names, diagnoses, prescriptions, and medical record numbers — blocking exposure before data leaves the browser.",
      badges: ["HIPAA-ready", "PHI detection", "Healthcare DLP"],
    },
    features: {
      sectionLabel: "Healthcare DLP",
      heading: "How TeamPrompt protects patient data",
      items: [
        { icon: "Shield", title: "18 HIPAA identifier detection", description: "Detects all 18 categories of HIPAA-defined identifiers including patient names, dates of service, geographic data, phone numbers, and medical record numbers." },
        { icon: "UserX", title: "Clinical data scanning", description: "Identifies diagnoses, treatment plans, medication lists, lab results, and clinical notes that constitute protected health information." },
        { icon: "Lock", title: "Medical record number blocking", description: "Catches MRNs, health plan beneficiary numbers, and account numbers specific to healthcare organizations before they reach AI tools." },
        { icon: "Eye", title: "De-identification verification", description: "Verifies that data claimed to be de-identified does not contain residual PHI that could re-identify patients when processed by AI tools." },
        { icon: "Building2", title: "Business associate compliance", description: "Helps covered entities and business associates maintain HIPAA compliance by preventing unauthorized PHI disclosure through AI tool usage." },
        { icon: "BarChart3", title: "HIPAA audit trail", description: "Generates comprehensive audit logs required for HIPAA compliance, documenting every PHI detection event with timestamp, user, and data category." },
      ],
    },
    benefits: {
      heading: "Why healthcare organizations need AI DLP",
      items: [
        "Prevent HIPAA violations that carry penalties up to $1.5 million per category",
        "Detect all 18 HIPAA-defined PHI identifier categories automatically",
        "Block clinical data, diagnoses, and prescriptions from reaching AI tools",
        "Generate audit trails required for HIPAA compliance documentation",
        "Enable healthcare staff to use AI tools safely for non-clinical tasks",
        "Protect patient trust by demonstrating proactive data safeguards",
      ],
    },
    stats: [
      { value: "6", label: "One-click compliance packs" },
      { value: "15", label: "Built-in DLP rules" },
      { value: "5", label: "AI tools supported" },
    ],
    faqs: [
      { question: "Does this make our AI usage HIPAA-compliant?", answer: "TeamPrompt is a critical technical safeguard that prevents PHI exposure through AI tools. Full HIPAA compliance also requires administrative and physical safeguards, policies, and training — but DLP scanning is an essential component." },
      { question: "Can clinical staff still use AI tools?", answer: "Yes. TeamPrompt blocks only prompts containing PHI. Clinical staff can use AI tools for administrative tasks, research queries, and other non-PHI activities without restriction." },
      { question: "What about de-identified data?", answer: "TeamPrompt can verify that data claimed to be de-identified does not contain residual identifiers. Properly de-identified data under HIPAA Safe Harbor rules is allowed through." },
    ],
    cta: {
      headline: "Protect patient data",
      gradientText: "from AI exposure.",
      subtitle: "HIPAA-ready DLP for AI tools. Deploy in minutes.",
    },
  },
  {
    slug: "prevent-leaks-financial-data",
    category: "data-protection",
    meta: {
      title: "Prevent Financial Data Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Stop financial data from reaching AI tools. TeamPrompt detects revenue figures, account numbers, financial projections, and transaction details before they are submitted to any AI model.",
      keywords: ["financial data leak prevention", "prevent financial data exposure AI", "financial DLP", "financial data protection AI tools", "SOX compliance AI"],
    },
    hero: {
      headline: "Prevent financial data from leaking to AI tools",
      subtitle:
        "Financial data in AI prompts creates regulatory risk, competitive exposure, and compliance violations. TeamPrompt scans every prompt for revenue numbers, account details, financial projections, and transaction data — blocking leaks before they happen.",
      badges: ["Financial DLP", "SOX-ready", "Real-time scanning"],
    },
    features: {
      sectionLabel: "Financial Protection",
      heading: "How TeamPrompt protects financial data",
      items: [
        { icon: "Shield", title: "Revenue and earnings detection", description: "Identifies revenue figures, profit margins, earnings data, and financial performance metrics that could constitute material non-public information." },
        { icon: "Lock", title: "Account number scanning", description: "Catches bank account numbers, routing numbers, credit card numbers, and financial account identifiers before they reach AI tools." },
        { icon: "Eye", title: "Financial projection blocking", description: "Detects forward-looking financial statements, budget projections, and forecasts that could violate securities regulations if disclosed." },
        { icon: "Building2", title: "Transaction data protection", description: "Prevents detailed transaction records, payment histories, and financial audit data from being submitted for AI analysis." },
        { icon: "Scale", title: "Regulatory compliance support", description: "Supports SOX, SEC, FINRA, and PCI DSS compliance by preventing unauthorized disclosure of regulated financial information." },
        { icon: "BarChart3", title: "Financial risk dashboard", description: "Tracks financial data exposure attempts by type, department, and frequency — enabling CFOs and compliance teams to assess and mitigate risk." },
      ],
    },
    benefits: {
      heading: "Why financial data protection is essential",
      items: [
        "Prevent material non-public information from reaching AI providers",
        "Block account numbers, credit cards, and banking details automatically",
        "Stop financial projections and earnings data from leaking before disclosure",
        "Support SOX, SEC, and PCI DSS compliance requirements",
        "Enable finance teams to use AI tools safely for non-sensitive tasks",
        "Protect against insider trading risk from AI-disclosed financial data",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "6", label: "One-click compliance packs" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "What types of financial data does TeamPrompt detect?", answer: "TeamPrompt detects revenue figures, account numbers, credit card numbers, routing numbers, financial projections, earnings data, transaction records, and other financial identifiers." },
      { question: "Does this help with SOX compliance?", answer: "Yes. Preventing unauthorized disclosure of financial data through AI tools supports SOX requirements for internal controls over financial information. TeamPrompt provides audit trails for compliance documentation." },
      { question: "Can finance teams still use AI tools?", answer: "Absolutely. TeamPrompt only blocks prompts containing sensitive financial data. Finance teams can use AI for general analysis, formatting, writing, and other tasks that do not involve restricted financial information." },
    ],
    cta: {
      headline: "Protect financial data",
      gradientText: "from AI exposure.",
      subtitle: "Deploy financial DLP in minutes. Enterprise-ready.",
    },
  },
  {
    slug: "prevent-leaks-customer-data",
    category: "data-protection",
    meta: {
      title: "Prevent Customer Data Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Stop customer data from being pasted into AI tools. TeamPrompt detects customer names, account details, support tickets, and CRM data before prompts are submitted.",
      keywords: ["customer data leak prevention", "prevent customer data exposure AI", "customer data DLP", "CRM data protection AI", "customer privacy AI"],
    },
    hero: {
      headline: "Prevent customer data from leaking into AI tools",
      subtitle:
        "Support agents paste tickets, sales reps share CRM data, and analysts upload customer lists — all into AI tools. TeamPrompt catches customer names, account numbers, purchase history, and support conversations before they leave your browser.",
      badges: ["Customer data DLP", "CRM protection", "Real-time"],
    },
    features: {
      sectionLabel: "Customer Protection",
      heading: "How TeamPrompt protects customer data",
      items: [
        { icon: "Users", title: "Customer identity detection", description: "Identifies customer names, email addresses, account numbers, and other identifying information pasted into AI tool prompts." },
        { icon: "Shield", title: "Support ticket scanning", description: "Detects customer support conversations, complaint details, and ticket content that agents paste into AI tools for response drafting." },
        { icon: "Lock", title: "CRM data blocking", description: "Catches CRM exports, customer lists, deal values, and pipeline data that sales teams frequently paste into AI tools for analysis." },
        { icon: "Eye", title: "Purchase history protection", description: "Prevents customer purchase records, subscription details, and billing information from being submitted to AI tools." },
        { icon: "FileText", title: "Contract detail scanning", description: "Detects customer contract terms, pricing agreements, and SLA details that could expose confidential business relationships." },
        { icon: "BarChart3", title: "Customer data risk reporting", description: "Track which teams and workflows generate the most customer data exposure attempts, enabling targeted process improvements." },
      ],
    },
    benefits: {
      heading: "Why customer data protection matters",
      items: [
        "Prevent customer PII from reaching third-party AI providers",
        "Block support ticket content from becoming AI training data",
        "Stop CRM exports and customer lists from leaking through AI prompts",
        "Protect confidential contract terms and pricing agreements",
        "Maintain customer trust by demonstrating data stewardship",
        "Satisfy data processing agreements and privacy commitments",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "5", label: "AI tools supported" },
      { value: "25", label: "Free prompts/month" },
    ],
    faqs: [
      { question: "Can support teams still use AI for response drafting?", answer: "Yes. TeamPrompt blocks customer-identifying information while allowing teams to use AI for generic response templates, knowledge base articles, and other tasks that do not include specific customer data." },
      { question: "Does this protect data from CRM exports?", answer: "Yes. When users paste CRM data including customer names, account numbers, deal values, or contact details into AI tools, TeamPrompt detects and blocks the submission." },
      { question: "How does this support data processing agreements?", answer: "Many DPAs restrict sharing personal data with third-party processors. TeamPrompt prevents customer data from reaching AI providers who may not be covered under your data processing agreements." },
    ],
    cta: {
      headline: "Protect customer data",
      gradientText: "from AI exposure.",
      subtitle: "Keep customer information safe. Deploy in minutes.",
    },
  },
  {
    slug: "prevent-leaks-trade-secrets",
    category: "data-protection",
    meta: {
      title: "Prevent Trade Secret Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Protect trade secrets and proprietary information from reaching AI tools. TeamPrompt detects confidential business data, formulas, processes, and strategies before they are submitted.",
      keywords: ["trade secret protection AI", "prevent trade secret leaks", "proprietary information DLP", "trade secret AI tools", "confidential business data AI"],
    },
    hero: {
      headline: "Prevent trade secrets from leaking through AI tools",
      subtitle:
        "Once a trade secret reaches an AI provider, you may lose legal protection permanently. TeamPrompt scans every prompt for proprietary formulas, processes, strategies, and confidential business data — blocking exposure before it happens.",
      badges: ["Trade secret DLP", "IP protection", "Legal safeguard"],
    },
    features: {
      sectionLabel: "IP Protection",
      heading: "How TeamPrompt guards trade secrets",
      items: [
        { icon: "Lock", title: "Confidential marker detection", description: "Detects documents and content marked as confidential, proprietary, trade secret, or internal-only before they are submitted to AI tools." },
        { icon: "Shield", title: "Proprietary process scanning", description: "Identifies descriptions of proprietary manufacturing processes, algorithms, formulas, and methodologies that constitute trade secrets." },
        { icon: "Building2", title: "Strategic information blocking", description: "Catches business strategies, market analysis, competitive intelligence, and M&A plans that could cause competitive harm if disclosed." },
        { icon: "Eye", title: "Patent-pending content detection", description: "Identifies patent applications, invention disclosures, and patent-pending content that requires confidentiality protection." },
        { icon: "FileText", title: "NDA-protected content scanning", description: "Detects content received under non-disclosure agreements, preventing inadvertent breach of contractual confidentiality obligations." },
        { icon: "BarChart3", title: "IP risk dashboard", description: "Provides visibility into trade secret exposure attempts across your organization, helping legal and IP teams assess risk and prioritize protection efforts." },
      ],
    },
    benefits: {
      heading: "Why trade secret protection is critical for AI usage",
      items: [
        "Preserve legal trade secret status by preventing public disclosure through AI",
        "Block proprietary formulas, processes, and algorithms from reaching AI providers",
        "Protect strategic business plans and competitive intelligence",
        "Prevent NDA breaches from accidental AI tool submissions",
        "Safeguard patent-pending inventions from premature disclosure",
        "Demonstrate reasonable measures to protect trade secrets as required by law",
      ],
    },
    stats: [
      { value: "15", label: "Built-in DLP rules" },
      { value: "31", label: "Total available detection rules" },
      { value: "6", label: "One-click compliance packs" },
    ],
    faqs: [
      { question: "Can AI disclosure destroy trade secret protection?", answer: "Yes. Under the Defend Trade Secrets Act and similar laws, a trade secret loses legal protection if the owner fails to take reasonable measures to maintain secrecy. Submitting trade secrets to AI tools could be considered a failure to protect." },
      { question: "How does TeamPrompt identify trade secrets?", answer: "TeamPrompt uses configurable rules based on confidentiality markers, proprietary terminology, and content patterns specific to your organization. Admins define what constitutes a trade secret for their business." },
      { question: "Does this replace legal trade secret protections?", answer: "No. TeamPrompt is a technical safeguard that complements legal protections like NDAs, employment agreements, and trade secret policies. It adds an automated enforcement layer that prevents accidental disclosure." },
    ],
    cta: {
      headline: "Keep trade secrets",
      gradientText: "confidential.",
      subtitle: "Protect proprietary information from AI exposure. Free plan available.",
    },
  },
  {
    slug: "prevent-leaks-credentials",
    category: "data-protection",
    meta: {
      title: "Prevent Credential Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Stop passwords, tokens, and credentials from being pasted into AI tools. TeamPrompt detects authentication secrets in real time and blocks submission before credentials are exposed.",
      keywords: ["credential leak prevention AI", "prevent password leaks AI", "credential DLP", "authentication token protection", "password exposure AI tools"],
    },
    hero: {
      headline: "Stop credentials from leaking into AI tools",
      subtitle:
        "Passwords, tokens, and authentication credentials are the keys to your infrastructure. TeamPrompt detects every credential pattern — passwords, bearer tokens, session cookies, and service account keys — before they reach any AI tool.",
      badges: ["Credential detection", "Multi-format", "Instant blocking"],
    },
    features: {
      sectionLabel: "Credential DLP",
      heading: "How TeamPrompt catches credential leaks",
      items: [
        { icon: "Key", title: "Password detection", description: "Identifies passwords in configuration files, environment variables, and code snippets pasted into AI tools for debugging or configuration help." },
        { icon: "Shield", title: "Bearer token scanning", description: "Catches Bearer tokens, API tokens, and access tokens in HTTP headers and request examples that developers share with AI tools." },
        { icon: "Lock", title: "Session credential blocking", description: "Detects session cookies, CSRF tokens, and session IDs that could allow unauthorized access to authenticated user sessions." },
        { icon: "ShieldAlert", title: "Service account key detection", description: "Identifies Google Cloud service account JSON keys, AWS IAM credentials, and Azure service principal secrets." },
        { icon: "Eye", title: "Certificate content scanning", description: "Catches TLS certificates, private keys, and certificate signing requests pasted into AI tools for debugging SSL issues." },
        { icon: "BarChart3", title: "Credential exposure analytics", description: "Track credential leak attempts by type, team, and frequency to identify workflows and teams that need security process improvements." },
      ],
    },
    benefits: {
      heading: "Why credential protection is non-negotiable",
      items: [
        "Prevent unauthorized access from credential exposure in AI tools",
        "Block passwords embedded in code snippets and configuration files",
        "Catch bearer tokens and API credentials in HTTP request examples",
        "Protect service account keys that grant infrastructure-level access",
        "Stop session cookies and tokens from enabling session hijacking",
        "Identify teams and workflows with the highest credential exposure risk",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "< 2 min", label: "Setup time" },
      { value: "5", label: "AI tools supported" },
    ],
    faqs: [
      { question: "What credential types does TeamPrompt detect?", answer: "TeamPrompt detects passwords, API keys, bearer tokens, session cookies, service account keys, SSH keys, TLS certificates, OAuth tokens, JWT payloads, and database credentials across all major cloud providers and services." },
      { question: "Can I test with fake credentials?", answer: "Yes. Administrators can whitelist known test credentials, placeholder values, and example tokens so developers can work with sample data without triggering false positives." },
      { question: "Does TeamPrompt store detected credentials?", answer: "No. TeamPrompt detects and blocks credentials in the browser before they are sent anywhere. The credential content is never stored, logged, or transmitted — only the fact that a credential was detected is recorded in audit logs." },
    ],
    cta: {
      headline: "Keep your credentials",
      gradientText: "safe from AI exposure.",
      subtitle: "Deploy credential protection in minutes. No infrastructure changes.",
    },
  },
  {
    slug: "prevent-leaks-ssn-credit-cards",
    category: "data-protection",
    meta: {
      title: "Prevent SSN & Credit Card Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Stop Social Security numbers and credit card data from reaching AI tools. TeamPrompt detects SSNs, credit card numbers, CVVs, and banking details in real time.",
      keywords: ["SSN leak prevention AI", "credit card data protection AI", "prevent SSN exposure", "credit card DLP", "PCI DSS AI compliance"],
    },
    hero: {
      headline: "Stop SSNs and credit card numbers from reaching AI tools",
      subtitle:
        "A single Social Security number or credit card in an AI prompt can trigger breach notification requirements and PCI DSS violations. TeamPrompt detects SSNs, credit card numbers, CVVs, and expiration dates before any prompt is submitted.",
      badges: ["SSN detection", "PCI-ready", "Financial data DLP"],
    },
    features: {
      sectionLabel: "Detection",
      heading: "How TeamPrompt catches SSN and credit card data",
      items: [
        { icon: "Shield", title: "SSN pattern detection", description: "Identifies Social Security numbers in standard formats (XXX-XX-XXXX), unformatted (XXXXXXXXX), and partial formats with Luhn validation to minimize false positives." },
        { icon: "Lock", title: "Credit card number scanning", description: "Detects Visa, Mastercard, Amex, Discover, and other card network formats using pattern matching and Luhn checksum validation." },
        { icon: "Eye", title: "CVV and expiration detection", description: "Catches CVV/CVC codes, expiration dates, and cardholder names that accompany credit card numbers in AI prompts." },
        { icon: "Key", title: "Bank account scanning", description: "Identifies bank routing numbers, account numbers, and IBAN formats that could enable unauthorized financial transactions." },
        { icon: "ShieldAlert", title: "Batch data detection", description: "Recognizes patterns of multiple SSNs or credit cards that indicate bulk data exports from spreadsheets or databases being pasted into AI tools." },
        { icon: "BarChart3", title: "Financial PII reporting", description: "Comprehensive reporting on SSN and credit card exposure attempts for PCI DSS audits, SOC 2 reviews, and internal compliance documentation." },
      ],
    },
    benefits: {
      heading: "Why SSN and credit card protection is critical",
      items: [
        "Prevent breach notification obligations triggered by SSN or credit card exposure",
        "Maintain PCI DSS compliance by blocking cardholder data from reaching AI tools",
        "Detect both formatted and unformatted SSNs with Luhn validation",
        "Catch bulk exports containing multiple SSNs or credit cards in a single prompt",
        "Generate audit reports for PCI DSS QSAs and compliance auditors",
        "Protect your organization from the financial and reputational cost of data breaches",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "6", label: "One-click compliance packs" },
      { value: "$9/mo", label: "Starting price" },
    ],
    faqs: [
      { question: "How accurate is SSN detection?", answer: "TeamPrompt uses format matching combined with Luhn checksum validation to detect real SSNs while minimizing false positives from random nine-digit numbers. The false positive rate is extremely low." },
      { question: "Does this satisfy PCI DSS Requirement 3?", answer: "TeamPrompt helps satisfy PCI DSS requirements by preventing cardholder data from being transmitted to unauthorized third parties (AI providers). It complements but does not replace your full PCI DSS compliance program." },
      { question: "What about partial credit card numbers?", answer: "TeamPrompt detects both full and partial credit card numbers. Even the first six and last four digits (BIN and last four) are caught because they can be combined to reconstruct account information." },
    ],
    cta: {
      headline: "Protect SSNs and credit cards",
      gradientText: "from AI exposure.",
      subtitle: "PCI-ready DLP scanning. Deploy in minutes.",
    },
  },
  {
    slug: "prevent-leaks-intellectual-property",
    category: "data-protection",
    meta: {
      title: "Prevent Intellectual Property Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Protect intellectual property from AI tool exposure. TeamPrompt detects patents, proprietary designs, research data, and trade secrets before they reach any AI model.",
      keywords: ["intellectual property protection AI", "IP leak prevention", "prevent IP leaks AI tools", "patent protection AI", "proprietary data DLP"],
    },
    hero: {
      headline: "Protect intellectual property from leaking to AI tools",
      subtitle:
        "Your intellectual property represents years of investment. TeamPrompt ensures patents, proprietary designs, research findings, and competitive advantages never reach external AI servers where they could be retained, reproduced, or exposed.",
      badges: ["IP protection", "Patent-safe", "Research DLP"],
    },
    features: {
      sectionLabel: "IP Protection",
      heading: "How TeamPrompt safeguards intellectual property",
      items: [
        { icon: "Lock", title: "Patent content detection", description: "Identifies patent claims, invention descriptions, and patent-pending content that requires strict confidentiality to maintain patent rights." },
        { icon: "Shield", title: "Research data protection", description: "Detects experimental results, research findings, and unpublished data that could compromise patent applications or competitive positioning." },
        { icon: "FileText", title: "Design document scanning", description: "Catches proprietary design specifications, architecture documents, and engineering drawings submitted to AI tools for analysis." },
        { icon: "Building2", title: "Brand asset protection", description: "Prevents confidential brand strategies, unreleased product names, and marketing plans from being disclosed through AI tool usage." },
        { icon: "Eye", title: "Competitive advantage guarding", description: "Identifies business methodologies, pricing models, and operational processes that constitute competitive advantages for your organization." },
        { icon: "BarChart3", title: "IP exposure risk analytics", description: "Dashboard showing IP exposure attempts by type, department, and severity — helping legal and IP teams prioritize protection efforts." },
      ],
    },
    benefits: {
      heading: "Why IP protection matters for AI tool usage",
      items: [
        "Preserve patent rights by preventing pre-filing disclosure through AI tools",
        "Protect unpublished research from reaching AI training datasets",
        "Block proprietary designs and architecture from external exposure",
        "Safeguard competitive advantages and business methodologies",
        "Demonstrate reasonable IP protection measures for legal proceedings",
        "Enable innovation teams to use AI tools safely without IP risk",
      ],
    },
    stats: [
      { value: "15", label: "Built-in DLP rules" },
      { value: "16", label: "Smart detection patterns" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "Can AI tool usage affect patent rights?", answer: "Yes. Disclosing an invention to a third party before filing a patent application can create prior art issues. AI tool submissions may constitute public disclosure depending on the provider's terms of service." },
      { question: "How does TeamPrompt identify intellectual property?", answer: "TeamPrompt uses configurable rules based on confidentiality markers, patent terminology, research data patterns, and organization-specific identifiers. Administrators define what constitutes protected IP." },
      { question: "Does this cover copyrighted material?", answer: "TeamPrompt can be configured to detect copyrighted works, creative assets, and original content that should not be submitted to AI tools. Custom rules can match your organization's specific copyright-protected materials." },
    ],
    cta: {
      headline: "Protect your IP",
      gradientText: "from AI exposure.",
      subtitle: "Safeguard intellectual property automatically. Free plan available.",
    },
  },

  // ── By context ───────────────────────────────────────────────────────
  {
    slug: "prevent-leaks-remote-teams",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks for Remote Teams Using AI | TeamPrompt",
      description:
        "Protect distributed and remote teams from AI data leaks. TeamPrompt provides browser-level DLP that works anywhere your team works — no VPN or network controls required.",
      keywords: ["remote team data protection", "remote work DLP", "distributed team AI security", "remote team AI leaks", "WFH data protection"],
    },
    hero: {
      headline: "Prevent data leaks when remote teams use AI tools",
      subtitle:
        "Remote teams work from home networks, coffee shops, and co-working spaces — beyond the reach of corporate network controls. TeamPrompt provides browser-level DLP that protects every AI interaction, regardless of where your team is working.",
      badges: ["Remote-ready", "No VPN needed", "Browser-level DLP"],
    },
    features: {
      sectionLabel: "Remote DLP",
      heading: "How TeamPrompt protects distributed teams",
      items: [
        { icon: "Globe", title: "Location-independent protection", description: "DLP scanning runs in the browser, not on your network. Whether team members work from home, a hotel, or another country, every AI prompt is protected." },
        { icon: "Shield", title: "No VPN or proxy required", description: "Traditional DLP requires VPN tunnels or web proxies. TeamPrompt works directly in the browser, eliminating infrastructure complexity for remote teams." },
        { icon: "Users", title: "Consistent policy enforcement", description: "Every remote team member gets the same DLP protection regardless of their location, device, or network — ensuring policy consistency across your distributed workforce." },
        { icon: "Eye", title: "BYOD compatibility", description: "TeamPrompt works on personal devices through the browser extension, providing data protection even on unmanaged devices common in remote work setups." },
        { icon: "Lock", title: "Offline policy caching", description: "DLP policies are cached locally so protection continues even during intermittent connectivity — common in remote work environments." },
        { icon: "BarChart3", title: "Remote team visibility", description: "Dashboards show AI usage and DLP events across your distributed team, giving security leaders visibility that network-based tools cannot provide for remote workers." },
      ],
    },
    benefits: {
      heading: "Why remote teams need browser-level DLP",
      items: [
        "Protect data without requiring VPNs, proxies, or network-level controls",
        "Enforce consistent policies across home offices, co-working spaces, and travel",
        "Support BYOD environments where corporate MDM is not deployed",
        "Maintain DLP coverage during intermittent connectivity",
        "Gain visibility into remote team AI usage that network tools miss entirely",
        "Deploy in minutes via browser extension with no IT travel required",
      ],
    },
    stats: [
      { value: "5", label: "AI tools supported" },
      { value: "< 2 min", label: "Setup time" },
      { value: "31", label: "Total available detection rules" },
    ],
    faqs: [
      { question: "Do remote workers need a VPN for TeamPrompt?", answer: "No. TeamPrompt operates entirely in the browser via a Chrome extension. No VPN, proxy, or network infrastructure is required. It works on any network, anywhere." },
      { question: "Does this work on personal devices?", answer: "Yes. TeamPrompt is installed as a browser extension, so it works on both corporate-managed and personal devices. This is ideal for remote and hybrid teams that use BYOD policies." },
      { question: "How do I deploy TeamPrompt to remote teams?", answer: "Share the Chrome Web Store link with your team or deploy via Google Workspace admin console for managed browsers. Setup takes under two minutes per person with no IT assistance needed." },
    ],
    cta: {
      headline: "Protect your remote team",
      gradientText: "from AI data leaks.",
      subtitle: "Browser-level DLP for distributed teams. No VPN required.",
    },
  },
  {
    slug: "prevent-leaks-enterprise",
    category: "data-protection",
    meta: {
      title: "Enterprise AI Data Leak Prevention | TeamPrompt DLP",
      description:
        "Enterprise-grade DLP for AI tools. TeamPrompt protects thousands of users with centralized policies, granular controls, audit logging, and compliance reporting.",
      keywords: ["enterprise DLP AI", "enterprise data leak prevention", "enterprise AI security", "corporate AI data protection", "enterprise AI governance"],
    },
    hero: {
      headline: "Enterprise-grade data leak prevention for AI tools",
      subtitle:
        "Enterprises face unique challenges: thousands of users, dozens of AI tools, complex compliance requirements, and decentralized teams. TeamPrompt provides centralized DLP policies, granular role-based controls, comprehensive audit logging, and compliance-ready reporting at enterprise scale.",
      badges: ["Enterprise-grade", "Centralized policy", "Compliance-ready"],
    },
    features: {
      sectionLabel: "Enterprise DLP",
      heading: "Built for enterprise data protection requirements",
      items: [
        { icon: "Building2", title: "Centralized policy management", description: "Define and manage DLP policies from a single admin console. Push policy updates to thousands of users simultaneously without requiring individual device configuration." },
        { icon: "Users", title: "Granular role-based controls", description: "Different teams handle different data sensitivities. Assign DLP policies by department, role, or project so engineering, finance, and HR each get appropriate protection levels." },
        { icon: "Shield", title: "Multi-layer detection engine", description: "Combines pattern matching, entropy analysis, and contextual detection to identify sensitive data with enterprise-grade accuracy and minimal false positives." },
        { icon: "BarChart3", title: "Compliance reporting suite", description: "Pre-built reports for SOC 2, HIPAA, GDPR, and PCI DSS audits. Export data in formats that auditors expect, reducing compliance preparation time." },
        { icon: "Lock", title: "Data residency controls", description: "Ensure that DLP scanning and audit data remain within your required geographic regions, supporting data sovereignty requirements." },
        { icon: "Scale", title: "Integration-ready architecture", description: "Integrate with existing SIEM, SOAR, and GRC platforms through APIs and webhooks, fitting into your established enterprise security workflow." },
      ],
    },
    benefits: {
      heading: "Why enterprises choose TeamPrompt for AI DLP",
      items: [
        "Centralized policy management for thousands of users across departments",
        "Granular controls that match data sensitivity to team-specific requirements",
        "Pre-built compliance reports reduce audit preparation from weeks to hours",
        "Multi-layer detection provides enterprise-grade accuracy with low false positives",
        "Data residency controls satisfy geographic data sovereignty requirements",
        "API integrations fit into existing enterprise security and compliance workflows",
      ],
    },
    stats: [
      { value: "6", label: "One-click compliance packs" },
      { value: "15", label: "Built-in DLP rules" },
      { value: "16", label: "Smart detection patterns" },
    ],
    faqs: [
      { question: "How does TeamPrompt scale for enterprise deployments?", answer: "TeamPrompt is designed for enterprise scale. The browser extension runs locally, so there is no server bottleneck. Policies are managed centrally and cached locally, ensuring consistent performance regardless of user count." },
      { question: "Can we integrate with our existing SIEM?", answer: "Yes. TeamPrompt provides API access and webhook integrations for sending DLP events to your SIEM, SOAR, or security analytics platform of choice." },
      { question: "Is there a dedicated enterprise support plan?", answer: "Yes. Enterprise plans include dedicated account management, priority support, custom onboarding, and SLA guarantees tailored to your organization's requirements." },
    ],
    cta: {
      headline: "Enterprise AI security",
      gradientText: "starts with DLP.",
      subtitle: "Protect your enterprise. Request a demo today.",
    },
  },
  {
    slug: "prevent-leaks-startups",
    category: "data-protection",
    meta: {
      title: "AI Data Leak Prevention for Startups | TeamPrompt",
      description:
        "Protect your startup's IP, code, and customer data from AI tool leaks. TeamPrompt gives fast-moving teams DLP protection without slowing innovation.",
      keywords: ["startup data protection AI", "startup DLP", "startup AI security", "protect startup IP AI", "startup data leak prevention"],
    },
    hero: {
      headline: "Data leak prevention built for startup speed",
      subtitle:
        "Startups move fast and rely heavily on AI tools — but one leaked algorithm, customer list, or funding detail can be catastrophic. TeamPrompt gives your team DLP protection that deploys in minutes and scales as you grow, without adding friction to your workflow.",
      badges: ["Startup-friendly", "Fast deploy", "Scales with you"],
    },
    features: {
      sectionLabel: "Startup DLP",
      heading: "Why startups need data protection from day one",
      items: [
        { icon: "Zap", title: "Five-minute deployment", description: "Install the browser extension, invite your team, and DLP protection is live. No infrastructure, no IT team, no complex configuration — just immediate protection." },
        { icon: "Lock", title: "IP and code protection", description: "Your codebase is your most valuable asset. TeamPrompt prevents proprietary algorithms, unreleased features, and core business logic from reaching AI tools." },
        { icon: "Shield", title: "Investor data protection", description: "Pitch decks, cap tables, revenue numbers, and funding details are protected from accidental AI exposure that could harm fundraising efforts." },
        { icon: "Users", title: "Team growth ready", description: "Start with a small team and scale to hundreds without changing your DLP setup. Policies grow with your organization automatically." },
        { icon: "Eye", title: "Customer data safety", description: "Early customers trust you with their data. TeamPrompt ensures that trust is protected even as your team experiments heavily with AI tools." },
        { icon: "BarChart3", title: "Lightweight analytics", description: "Simple dashboards show what types of data are being caught without enterprise complexity — perfect for lean security teams." },
      ],
    },
    benefits: {
      heading: "Why startups choose TeamPrompt",
      items: [
        "Deploy in minutes without an IT team or security infrastructure",
        "Protect proprietary code and algorithms from becoming AI training data",
        "Keep investor materials and financial data confidential",
        "Scale from five users to five hundred without configuration changes",
        "Demonstrate data protection to customers and investors from day one",
        "Free plan covers early-stage teams with essential DLP features",
      ],
    },
    stats: [
      { value: "< 2 min", label: "Setup time" },
      { value: "25", label: "Free prompts/month" },
      { value: "$9/mo", label: "Starting price" },
    ],
    faqs: [
      { question: "Is TeamPrompt free for small startups?", answer: "Yes. TeamPrompt has a free plan that includes essential DLP features for small teams. As your team grows, you can upgrade to access advanced policies, analytics, and enterprise features." },
      { question: "Do I need a security team to use TeamPrompt?", answer: "No. TeamPrompt is designed to be set up and managed by anyone — founders, CTOs, or engineering leads. No dedicated security expertise is required." },
      { question: "Will this slow down our engineering team?", answer: "Not at all. DLP scanning happens in milliseconds and only blocks prompts containing genuinely sensitive data. Your team continues using AI tools at full speed for all safe interactions." },
    ],
    cta: {
      headline: "Protect your startup",
      gradientText: "from day one.",
      subtitle: "Deploy DLP in five minutes. Free plan available.",
    },
  },
  {
    slug: "prevent-leaks-regulated-industries",
    category: "data-protection",
    meta: {
      title: "AI Data Leak Prevention for Regulated Industries | TeamPrompt",
      description:
        "DLP for healthcare, finance, legal, and government teams using AI. TeamPrompt provides compliance-ready data protection that satisfies HIPAA, SOC 2, PCI DSS, and more.",
      keywords: ["regulated industry DLP", "healthcare AI DLP", "financial services AI security", "legal AI data protection", "government AI compliance"],
    },
    hero: {
      headline: "AI data protection for regulated industries",
      subtitle:
        "Healthcare, financial services, legal, and government organizations face strict data handling requirements. TeamPrompt provides industry-specific DLP policies that protect regulated data while enabling safe AI tool adoption across your organization.",
      badges: ["HIPAA-ready", "PCI-compliant", "SOC 2 auditable"],
    },
    features: {
      sectionLabel: "Regulated DLP",
      heading: "Industry-specific data protection",
      items: [
        { icon: "Shield", title: "Healthcare PHI protection", description: "Detects all 18 HIPAA-defined identifiers, clinical data, and patient information before they reach AI tools — essential for covered entities and business associates." },
        { icon: "Lock", title: "Financial data safeguards", description: "Blocks credit card numbers, account data, and material non-public information required by PCI DSS, SOX, and SEC regulations." },
        { icon: "Scale", title: "Legal privilege protection", description: "Prevents attorney-client privileged communications, case details, and legal strategy from being submitted to AI tools." },
        { icon: "Building2", title: "Government classification awareness", description: "Detects CUI, FOUO, and other government classification markers to prevent controlled information from reaching commercial AI services." },
        { icon: "FileText", title: "Pre-built compliance policies", description: "Deploy industry-specific DLP policy packs for HIPAA, PCI DSS, SOC 2, GDPR, and other frameworks without building rules from scratch." },
        { icon: "BarChart3", title: "Audit-ready reporting", description: "Generate compliance reports in formats expected by QSAs, auditors, and regulators — reducing audit preparation time significantly." },
      ],
    },
    benefits: {
      heading: "Why regulated industries trust TeamPrompt",
      items: [
        "Pre-built DLP policies for HIPAA, PCI DSS, SOC 2, and GDPR compliance",
        "Detect industry-specific regulated data types automatically",
        "Generate audit reports that satisfy regulatory examiners",
        "Enable safe AI adoption without violating compliance requirements",
        "Protect attorney-client privilege and legal work product",
        "Prevent controlled unclassified information from reaching commercial AI",
      ],
    },
    stats: [
      { value: "6", label: "One-click compliance packs" },
      { value: "31", label: "Total available detection rules" },
      { value: "5", label: "AI tools supported" },
    ],
    faqs: [
      { question: "Which compliance frameworks are supported?", answer: "TeamPrompt includes pre-built DLP policy packs for HIPAA, PCI DSS, SOC 2, GDPR, CCPA, SOX, FERPA, GLBA, and other major regulatory frameworks. Custom policies can be created for industry-specific requirements." },
      { question: "Can we use this for FedRAMP environments?", answer: "TeamPrompt supports data protection for government teams using commercial AI tools. Contact our team for specific FedRAMP deployment guidance and architecture documentation." },
      { question: "How does this help with regulatory examinations?", answer: "TeamPrompt generates detailed audit trails and compliance reports that document your data protection controls for AI tool usage. These reports are formatted for regulatory examiners and can be exported on demand." },
    ],
    cta: {
      headline: "Meet compliance requirements",
      gradientText: "while using AI.",
      subtitle: "Industry-specific DLP for regulated organizations.",
    },
  },
  {
    slug: "prevent-leaks-contractors",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks from Contractors Using AI | TeamPrompt",
      description:
        "Protect sensitive data when contractors and freelancers use AI tools. TeamPrompt applies DLP policies to external team members without requiring device management.",
      keywords: ["contractor data protection AI", "freelancer DLP", "contractor AI security", "external team data leaks", "third party AI risk"],
    },
    hero: {
      headline: "Prevent data leaks when contractors use AI tools",
      subtitle:
        "Contractors and freelancers access your sensitive data but work on unmanaged devices, personal networks, and their own AI accounts. TeamPrompt extends DLP protection to every external team member through a simple browser extension — no device management required.",
      badges: ["Contractor-safe", "No MDM needed", "Instant deploy"],
    },
    features: {
      sectionLabel: "Contractor DLP",
      heading: "How TeamPrompt secures contractor AI usage",
      items: [
        { icon: "Users", title: "Contractor-specific policies", description: "Apply stricter DLP policies to contractors than internal employees. External team members can have different data sensitivity thresholds and access restrictions." },
        { icon: "Shield", title: "Unmanaged device protection", description: "TeamPrompt works through the browser extension, providing data protection on contractors' personal devices without requiring MDM enrollment or device management." },
        { icon: "Eye", title: "Activity visibility", description: "See what AI tools contractors are using and what types of data they are submitting — visibility that is impossible with traditional network-based security tools." },
        { icon: "Lock", title: "Project-scoped access", description: "Limit contractor DLP policies to the specific project or data domain they are working on, reducing the risk of cross-project data exposure." },
        { icon: "UserX", title: "Automatic offboarding", description: "When a contractor's engagement ends, revoke their TeamPrompt access instantly. DLP policies are removed and audit data is preserved for compliance records." },
        { icon: "BarChart3", title: "Third-party risk reporting", description: "Generate reports on contractor AI usage and data exposure attempts for vendor risk management and third-party audit requirements." },
      ],
    },
    benefits: {
      heading: "Why contractor data protection matters",
      items: [
        "Extend DLP to unmanaged devices without requiring MDM or device enrollment",
        "Apply stricter policies to contractors than internal team members",
        "Gain visibility into contractor AI usage across all tools",
        "Scope data access to specific projects to limit exposure risk",
        "Instant offboarding removes DLP access when contracts end",
        "Generate third-party risk reports for vendor management programs",
      ],
    },
    stats: [
      { value: "15", label: "Built-in DLP rules" },
      { value: "< 2 min", label: "Setup time" },
      { value: "16", label: "Smart detection patterns" },
    ],
    faqs: [
      { question: "Do contractors need to install anything?", answer: "Contractors only need to install the TeamPrompt Chrome extension. No device management, VPN, or additional software is required. Installation takes under two minutes." },
      { question: "Can I set different policies for contractors vs employees?", answer: "Yes. TeamPrompt supports role-based DLP policies. Contractors can have stricter rules, additional blocked data types, or enhanced monitoring compared to full-time employees." },
      { question: "What happens when a contractor's project ends?", answer: "Revoke their TeamPrompt access from the admin console. DLP policies are removed immediately, and all audit data from their engagement is preserved for compliance and legal purposes." },
    ],
    cta: {
      headline: "Protect your data",
      gradientText: "when contractors use AI.",
      subtitle: "Extend DLP to external teams. No device management needed.",
    },
  },
  {
    slug: "prevent-leaks-onboarding",
    category: "data-protection",
    meta: {
      title: "AI Data Protection During Employee Onboarding | TeamPrompt",
      description:
        "Set up DLP for AI tools as part of employee onboarding. TeamPrompt ensures new hires are protected from day one with automatic policy enforcement and guided setup.",
      keywords: ["employee onboarding DLP", "new hire AI security", "onboarding data protection", "AI policy onboarding", "new employee AI tools"],
    },
    hero: {
      headline: "Protect data from day one of employee onboarding",
      subtitle:
        "New employees are the most likely to accidentally paste sensitive data into AI tools — they are learning systems, accessing new data, and relying heavily on AI assistance. TeamPrompt ensures every new hire has DLP protection from their first day.",
      badges: ["Day-one protection", "Auto-enrollment", "Guided setup"],
    },
    features: {
      sectionLabel: "Onboarding DLP",
      heading: "How TeamPrompt protects new hires",
      items: [
        { icon: "Users", title: "Automatic policy enrollment", description: "New employees are automatically enrolled in DLP policies based on their department and role. Protection is active from their first login — no manual setup required." },
        { icon: "Shield", title: "Onboarding-specific policies", description: "Apply heightened DLP scanning during the onboarding period when new hires are most likely to make mistakes with sensitive data in AI tools." },
        { icon: "BookOpen", title: "Guided DLP education", description: "New hires receive clear guidance on what types of data should not be shared with AI tools, reinforced by real-time feedback when DLP rules are triggered." },
        { icon: "Eye", title: "Manager visibility", description: "Managers can see DLP events for their new team members during the onboarding period, enabling timely coaching and training interventions." },
        { icon: "Lock", title: "Graduated access controls", description: "Start new hires with restrictive DLP policies and gradually expand access as they complete training and demonstrate compliance awareness." },
        { icon: "BarChart3", title: "Onboarding compliance tracking", description: "Track DLP policy compliance across all new hires to identify common mistakes and improve onboarding training materials." },
      ],
    },
    benefits: {
      heading: "Why onboarding DLP prevents costly mistakes",
      items: [
        "Protect data from day one when new hires are most likely to make mistakes",
        "Automatic enrollment means no gap between start date and DLP protection",
        "Onboarding-specific policies provide extra protection during the learning period",
        "Real-time DLP feedback teaches data protection practices through experience",
        "Manager visibility enables timely coaching before mistakes become incidents",
        "Graduated access reduces risk while building employee competence over time",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "6", label: "One-click compliance packs" },
      { value: "2-click", label: "From sidebar to AI tool" },
    ],
    faqs: [
      { question: "How do new hires get enrolled in DLP policies?", answer: "When a new employee is added to TeamPrompt, they are automatically assigned DLP policies based on their department and role. No manual configuration is needed — protection is active from their first login." },
      { question: "Can I use stricter policies during onboarding?", answer: "Yes. Administrators can create onboarding-specific policy tiers with heightened scanning and additional blocked data types. These policies can be relaxed after the onboarding period or training completion." },
      { question: "Does TeamPrompt integrate with HR systems for onboarding?", answer: "TeamPrompt supports user provisioning through SCIM, so new hires added to your identity provider are automatically enrolled in TeamPrompt with the correct DLP policies." },
    ],
    cta: {
      headline: "Protect data",
      gradientText: "from day one.",
      subtitle: "DLP protection that starts when your employees do.",
    },
  },
  {
    slug: "prevent-leaks-browser-extension",
    category: "data-protection",
    meta: {
      title: "Browser Extension DLP for AI Tools | TeamPrompt",
      description:
        "Deploy data leak prevention through a lightweight browser extension. TeamPrompt scans every AI prompt at the browser level — no proxy, VPN, or network changes required.",
      keywords: ["browser extension DLP", "browser-level data protection", "Chrome extension DLP", "AI tool browser security", "lightweight DLP"],
    },
    hero: {
      headline: "Browser-level DLP that protects every AI interaction",
      subtitle:
        "Forget complex proxy servers, VPN tunnels, and network appliances. TeamPrompt delivers enterprise-grade DLP through a lightweight Chrome extension that scans every AI prompt at the point of entry — where the data actually lives.",
      badges: ["Chrome extension", "No proxy needed", "Instant deploy"],
    },
    features: {
      sectionLabel: "Browser DLP",
      heading: "Why browser-level DLP is the right approach",
      items: [
        { icon: "Chrome", title: "Chrome extension deployment", description: "Install from the Chrome Web Store or deploy via Google Workspace admin. No servers, proxies, or network infrastructure — just a lightweight extension that provides immediate protection." },
        { icon: "Shield", title: "Point-of-entry scanning", description: "DLP scanning happens where data enters AI tools — in the browser. This catches data before it leaves the device, unlike network-based tools that scan data in transit." },
        { icon: "Zap", title: "Sub-second performance", description: "Scanning runs locally in the browser with sub-second latency. Users experience no perceptible delay in their AI interactions." },
        { icon: "Globe", title: "Works on any network", description: "Corporate office, home Wi-Fi, airport lounge, mobile hotspot — the extension provides consistent DLP protection regardless of network." },
        { icon: "Lock", title: "Local processing", description: "Prompt scanning happens locally in the browser. Sensitive content is never sent to TeamPrompt's servers for analysis — only detection events are logged." },
        { icon: "BarChart3", title: "Centralized management", description: "Manage policies, view analytics, and configure rules from the web dashboard while the extension handles enforcement at the browser level." },
      ],
    },
    benefits: {
      heading: "Advantages of browser-level DLP",
      items: [
        "Deploy in minutes with no infrastructure changes or IT projects",
        "Catch data at the point of entry before it leaves the browser",
        "Work on any network without VPN, proxy, or firewall dependencies",
        "Sub-second scanning adds no perceptible delay to AI interactions",
        "Local processing ensures sensitive content never leaves the device",
        "Centralized policy management with distributed enforcement at scale",
      ],
    },
    stats: [
      { value: "< 2 min", label: "Setup time" },
      { value: "5", label: "AI tools supported" },
      { value: "15", label: "Built-in DLP rules" },
    ],
    faqs: [
      { question: "Why is browser-level DLP better than network-based DLP?", answer: "Network-based DLP cannot inspect encrypted HTTPS traffic without SSL interception, which breaks many applications. Browser-level DLP scans content before encryption, at the point of entry, catching data that network tools miss entirely." },
      { question: "Does the extension slow down my browser?", answer: "No. The extension is lightweight and only activates on AI tool websites. It has no measurable impact on browser performance, page load times, or general browsing experience." },
      { question: "Can I deploy the extension via MDM?", answer: "Yes. The TeamPrompt extension can be force-installed via Google Workspace admin console, Microsoft Intune, or any MDM platform that supports Chrome extension management." },
    ],
    cta: {
      headline: "Deploy DLP",
      gradientText: "in two minutes.",
      subtitle: "Browser-level data protection. No infrastructure required.",
    },
  },
  {
    slug: "prevent-leaks-slack",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks from Slack to AI Tools | TeamPrompt",
      description:
        "Stop sensitive Slack messages from being pasted into AI tools. TeamPrompt detects confidential conversations, customer data, and credentials copied from Slack channels.",
      keywords: ["Slack data leak prevention", "Slack AI security", "prevent Slack data exposure", "Slack DLP AI tools", "Slack copy paste AI"],
    },
    hero: {
      headline: "Stop Slack data from leaking into AI tools",
      subtitle:
        "Teams copy Slack messages, threads, and channel history into AI tools daily — for summarization, response drafting, and analysis. TeamPrompt detects when pasted content contains customer names, credentials, financial data, or confidential discussions from Slack.",
      badges: ["Slack-aware", "Paste detection", "Context scanning"],
    },
    features: {
      sectionLabel: "Slack Protection",
      heading: "How TeamPrompt protects Slack data",
      items: [
        { icon: "Shield", title: "Pasted content scanning", description: "When users paste Slack messages into AI tools, TeamPrompt scans the content for sensitive data including customer names, internal discussions, and confidential information." },
        { icon: "Users", title: "Conversation context detection", description: "Identifies multi-message Slack threads that contain sensitive discussions about customers, deals, or internal decisions that should not reach AI tools." },
        { icon: "Key", title: "Shared credential catching", description: "Catches passwords, API keys, and tokens that were shared in Slack channels and are being copied into AI tools for troubleshooting." },
        { icon: "Lock", title: "Channel sensitivity awareness", description: "Content from private channels and DMs often contains more sensitive information. TeamPrompt applies appropriate scrutiny to pasted channel content." },
        { icon: "Eye", title: "Customer mention detection", description: "Identifies customer names, company names, and account details mentioned in Slack conversations that are copied into AI prompts." },
        { icon: "BarChart3", title: "Slack-to-AI flow analytics", description: "Track how often Slack content is being submitted to AI tools and what types of sensitive data are most commonly detected in these flows." },
      ],
    },
    benefits: {
      heading: "Why Slack-to-AI data flows need protection",
      items: [
        "Prevent confidential Slack discussions from reaching AI training data",
        "Catch customer information embedded in copied Slack messages",
        "Block credentials and secrets shared in Slack from reaching AI tools",
        "Identify the most common sensitive data types flowing from Slack to AI",
        "Protect private channel and DM content from unauthorized AI processing",
        "Maintain Slack's confidentiality expectations across AI tool workflows",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "31", label: "Total available detection rules" },
      { value: "$9/mo", label: "Starting price" },
    ],
    faqs: [
      { question: "Does TeamPrompt integrate directly with Slack?", answer: "TeamPrompt operates at the browser level, scanning content when it is pasted into AI tools. It does not require direct Slack integration or access to your Slack workspace." },
      { question: "Can I allow some Slack content to go to AI tools?", answer: "Yes. TeamPrompt only blocks content containing sensitive data. Non-sensitive Slack messages, public information, and general discussions can be freely submitted to AI tools." },
      { question: "What about Slack Connect channels with external partners?", answer: "Content from Slack Connect channels may contain partner-confidential information. TeamPrompt scans all pasted content regardless of its Slack source, protecting both your data and your partners' data." },
    ],
    cta: {
      headline: "Keep Slack conversations",
      gradientText: "out of AI tools.",
      subtitle: "Protect sensitive Slack data from AI exposure.",
    },
  },
  {
    slug: "prevent-leaks-email",
    category: "data-protection",
    meta: {
      title: "Prevent Email Data Leaks to AI Tools | TeamPrompt DLP",
      description:
        "Stop sensitive email content from being pasted into AI tools. TeamPrompt detects confidential email threads, attachments, and customer communications before they reach any AI model.",
      keywords: ["email data leak prevention AI", "email DLP AI tools", "prevent email data exposure", "email content AI security", "email paste AI protection"],
    },
    hero: {
      headline: "Stop email data from leaking into AI tools",
      subtitle:
        "Employees paste email threads into AI tools to draft replies, summarize conversations, and analyze communication. TeamPrompt detects when pasted email content contains customer data, confidential negotiations, legal communications, or personal information.",
      badges: ["Email-aware", "Thread scanning", "Attachment protection"],
    },
    features: {
      sectionLabel: "Email Protection",
      heading: "How TeamPrompt protects email data",
      items: [
        { icon: "Shield", title: "Email thread scanning", description: "Detects when multi-message email threads are pasted into AI tools, scanning for sensitive information across the entire conversation history." },
        { icon: "Lock", title: "Confidential email detection", description: "Identifies emails marked as confidential, attorney-client privileged, or internal-only before they are submitted to AI tools." },
        { icon: "Users", title: "Contact information protection", description: "Catches email addresses, phone numbers, and personal details from email signatures and headers pasted into AI prompts." },
        { icon: "FileText", title: "Attachment content scanning", description: "When users paste attachment content like spreadsheets, PDFs, or documents into AI tools, TeamPrompt scans for sensitive data in the pasted text." },
        { icon: "Eye", title: "Customer communication protection", description: "Detects customer names, account details, and business-specific information in pasted customer email communications." },
        { icon: "BarChart3", title: "Email exposure analytics", description: "Track how often email content is submitted to AI tools and what sensitive data types are detected most frequently." },
      ],
    },
    benefits: {
      heading: "Why email-to-AI data flows need protection",
      items: [
        "Prevent confidential email negotiations from reaching AI providers",
        "Block attorney-client privileged communications from AI exposure",
        "Catch customer PII embedded in pasted email threads and signatures",
        "Protect attachment content from unauthorized AI processing",
        "Detect confidentiality markers and internal-only designations",
        "Maintain email confidentiality standards across AI tool workflows",
      ],
    },
    stats: [
      { value: "6", label: "One-click compliance packs" },
      { value: "15", label: "Built-in DLP rules" },
      { value: "25", label: "Free prompts/month" },
    ],
    faqs: [
      { question: "Does TeamPrompt read my emails directly?", answer: "No. TeamPrompt does not access your email account or inbox. It only scans content when you paste email text into an AI tool, protecting data at the point of entry." },
      { question: "What about email drafting with AI?", answer: "Using AI to help draft email responses is fine. TeamPrompt only blocks prompts that contain sensitive data from existing emails. If you are drafting a new email with general instructions, there is no interference." },
      { question: "Can I use AI for email summarization safely?", answer: "Yes, as long as the emails do not contain sensitive data. TeamPrompt will allow email summarization requests that do not include PII, credentials, or confidential business information." },
    ],
    cta: {
      headline: "Keep email content",
      gradientText: "safe from AI exposure.",
      subtitle: "Protect confidential communications. Deploy in minutes.",
    },
  },
  {
    slug: "prevent-leaks-code-editors",
    category: "data-protection",
    meta: {
      title: "Prevent Data Leaks from Code Editors to AI | TeamPrompt DLP",
      description:
        "Stop sensitive code and data from leaking through AI-powered code editors. TeamPrompt protects against data exposure in AI coding assistants and browser-based IDEs.",
      keywords: ["code editor DLP", "AI coding assistant security", "prevent code leaks AI", "IDE data protection", "code editor data leak prevention"],
    },
    hero: {
      headline: "Prevent data leaks from code editors to AI tools",
      subtitle:
        "AI coding assistants access your codebase, configuration files, and environment variables. TeamPrompt adds a DLP layer that catches sensitive data in code context — API keys in config files, credentials in environment variables, and customer data in test fixtures.",
      badges: ["Developer DLP", "Code-aware", "Config protection"],
    },
    features: {
      sectionLabel: "Developer Protection",
      heading: "How TeamPrompt protects code editor AI usage",
      items: [
        { icon: "Key", title: "Environment variable scanning", description: "Detects .env file contents, Docker secrets, and Kubernetes config maps containing credentials that are shared with AI coding assistants for debugging." },
        { icon: "Shield", title: "Configuration file protection", description: "Catches database connection strings, API endpoints, and service credentials in configuration files submitted to AI tools for troubleshooting." },
        { icon: "FileText", title: "Test fixture scanning", description: "Identifies real customer data, production database dumps, and PII in test fixtures that developers paste into AI tools for test generation." },
        { icon: "Lock", title: "Proprietary algorithm detection", description: "Prevents core business logic, proprietary algorithms, and trade-secret code from being shared with AI coding assistants." },
        { icon: "Eye", title: "Log file analysis protection", description: "Scans log excerpts pasted into AI tools for debugging, catching IP addresses, user IDs, session tokens, and other sensitive runtime data." },
        { icon: "BarChart3", title: "Developer risk analytics", description: "Track which repositories, file types, and development workflows generate the most DLP events to focus security improvement efforts." },
      ],
    },
    benefits: {
      heading: "Why developer AI workflows need DLP",
      items: [
        "Catch credentials in environment variables and configuration files",
        "Prevent production data in test fixtures from reaching AI tools",
        "Block proprietary algorithms and business logic from exposure",
        "Scan log files for sensitive runtime data before AI analysis",
        "Identify high-risk development workflows for security improvement",
        "Enable safe AI coding assistance without compromising data security",
      ],
    },
    stats: [
      { value: "5", label: "AI tools supported" },
      { value: "16", label: "Smart detection patterns" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "Does this work with VS Code and other IDEs?", answer: "TeamPrompt currently protects AI interactions through the browser — covering browser-based AI tools and web IDEs. IDE-native AI assistant protection is available through the browser extension for web-based coding tools." },
      { question: "Can developers still use AI for code review?", answer: "Absolutely. TeamPrompt only blocks prompts containing sensitive data like credentials, customer data, and proprietary algorithms. Generic code review, refactoring help, and documentation generation work without interference." },
      { question: "What about AI autocomplete in code editors?", answer: "TeamPrompt focuses on protecting data submitted to AI tools through the browser. For AI autocomplete in native IDE extensions, TeamPrompt protects the data that flows through browser-based AI interfaces." },
    ],
    cta: {
      headline: "Code with AI",
      gradientText: "without data risk.",
      subtitle: "DLP for developer AI workflows. Deploy in minutes.",
    },
  },
];
