import type { SeoPageData } from "../types";

export const useCasePages: SeoPageData[] = [
  {
    slug: "prompt-library",
    category: "use-case",
    meta: {
      title: "AI Prompt Library for Teams — Organize & Share Prompts",
      description:
        "Build a centralized AI prompt library your whole team can search, reuse, and improve. Stop losing great prompts in chat threads and docs.",
      keywords: ["prompt library", "AI prompt organization", "shared prompts", "prompt repository"],
    },
    hero: {
      headline: "Your team's prompts deserve a home",
      subtitle:
        "A centralized library where your best AI prompts are saved, searchable, and one click away — inside every AI tool your team uses.",
      badges: ["Centralized", "Searchable", "One-click insert"],
    },
    features: {
      sectionLabel: "Features",
      heading: "Everything a prompt library needs",
      items: [
        { icon: "Archive", title: "Organized vault", description: "Store prompts in categories with tags, descriptions, and usage notes. Find any prompt in seconds." },
        { icon: "Globe", title: "Works everywhere", description: "Access your library from ChatGPT, Claude, Gemini, Copilot, and Perplexity via our browser extension." },
        { icon: "Users", title: "Team sharing", description: "Share prompts across your organization. Control who can view, edit, or manage each category." },
        { icon: "Zap", title: "One-click insert", description: "Browse and insert prompts directly into any AI tool without copy-pasting or switching tabs." },
        { icon: "BookOpen", title: "Template variables", description: "Create reusable templates with {{variables}} that get filled in before each use." },
        { icon: "BarChart3", title: "Usage analytics", description: "See which prompts are most popular, who uses them, and how they perform over time." },
      ],
    },
    benefits: {
      heading: "Why teams choose a dedicated prompt library",
      items: [
        "Stop losing great prompts in Slack threads and Google Docs",
        "Ensure consistent quality across your team's AI interactions",
        "Onboard new team members faster with proven prompt templates",
        "Track which prompts deliver the best results",
        "Reduce time spent writing prompts from scratch",
        "Maintain a single source of truth for AI best practices",
      ],
    },
    stats: [
      { value: "10x", label: "Faster prompt access" },
      { value: "100%", label: "Team visibility" },
      { value: "0", label: "Lost prompts" },
    ],
    faqs: [
      { question: "How is this different from saving prompts in a doc?", answer: "A document becomes stale fast. TeamPrompt keeps prompts searchable, version-controlled, and insertable directly into AI tools — no copy-paste needed." },
      { question: "Can I import existing prompts?", answer: "Yes. You can import prompts from CSV, JSON, or paste them directly. Bulk import makes migration painless." },
      { question: "Does it work with all AI tools?", answer: "TeamPrompt works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity through our browser extension." },
      { question: "Is there a free plan?", answer: "Yes. The free plan includes up to 25 prompts and works with all supported AI tools. No credit card required." },
    ],
    cta: {
      headline: "Stop losing your best prompts.",
      gradientText: "Build your library today.",
      subtitle: "Free plan available. Set up in under 2 minutes.",
    },
  },
  {
    slug: "prompt-templates",
    category: "use-case",
    meta: {
      title: "AI Prompt Templates — Reusable Templates with Variables",
      description:
        "Create reusable AI prompt templates with dynamic variables. Fill in fields like {{client_name}} and insert into ChatGPT, Claude, and more.",
      keywords: ["prompt templates", "AI templates", "reusable prompts", "prompt variables"],
    },
    hero: {
      headline: "Templates that make every prompt consistent",
      subtitle:
        "Create reusable prompt templates with dynamic variables like {{client_name}}. Fill in the fields and insert — same structure, every time.",
      badges: ["Dynamic variables", "Consistent output", "One-click fill"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Powerful prompt templates",
      items: [
        { icon: "Braces", title: "Dynamic variables", description: "Define {{variables}} in your prompts that get filled in before each use. Supports any field name." },
        { icon: "BookOpen", title: "Template library", description: "Build a library of reusable templates for common tasks — onboarding, reports, reviews, and more." },
        { icon: "Users", title: "Team templates", description: "Share templates across your organization so everyone uses the same proven structures." },
        { icon: "Zap", title: "Quick fill & insert", description: "A clean form appears for each variable. Fill in the fields and insert the completed prompt in one click." },
        { icon: "GitBranch", title: "Version history", description: "Track changes to templates over time. See who edited what and when." },
        { icon: "Shield", title: "Guardrails included", description: "DLP scanning runs on the final prompt after variables are filled in — catching sensitive data before it's sent." },
      ],
    },
    benefits: {
      heading: "Why teams love prompt templates",
      items: [
        "Ensure every team member uses the same proven prompt structure",
        "Reduce prompt writing time from minutes to seconds",
        "Eliminate errors from manual copy-paste-and-edit workflows",
        "Maintain compliance with dynamic DLP scanning on every insertion",
        "Onboard new hires with ready-to-use templates for their role",
        "Improve AI output quality through standardized instructions",
      ],
    },
    faqs: [
      { question: "What variables can I use in templates?", answer: "Any text wrapped in double curly braces becomes a variable — {{client_name}}, {{industry}}, {{tone}}, or anything else. There's no limit on the number of variables." },
      { question: "Can I set default values for variables?", answer: "Yes. Each variable can have a default value that pre-fills the form, so common values are already set." },
      { question: "Are templates scanned by DLP guardrails?", answer: "Yes. The final prompt (after all variables are filled in) is scanned for sensitive data before insertion into any AI tool." },
    ],
    cta: {
      headline: "Build better prompts,",
      gradientText: "faster than ever.",
      subtitle: "Create your first template in under a minute.",
    },
  },
  {
    slug: "ai-governance",
    category: "use-case",
    meta: {
      title: "AI Governance Platform — Manage How Your Team Uses AI",
      description:
        "Govern your organization's AI usage with prompt libraries, quality guidelines, DLP guardrails, and usage analytics. Built for compliance-first teams.",
      keywords: ["AI governance", "AI policy", "AI usage management", "AI oversight"],
    },
    hero: {
      headline: "AI governance that doesn't slow teams down",
      subtitle:
        "Set guidelines, enforce guardrails, and track usage — without blocking your team from the AI tools they need.",
      badges: ["Guidelines", "Guardrails", "Analytics"],
    },
    features: {
      sectionLabel: "Governance",
      heading: "Complete AI governance toolkit",
      items: [
        { icon: "BookOpen", title: "Quality guidelines", description: "Set organization-wide standards for prompt quality, tone, and structure. Guide your team toward better AI usage." },
        { icon: "ShieldAlert", title: "DLP guardrails", description: "Automatically scan outbound prompts for sensitive data — SSNs, API keys, patient records, financial data, and more." },
        { icon: "BarChart3", title: "Usage analytics", description: "See who uses AI, which tools they use, what prompts they send, and how often. Complete visibility." },
        { icon: "Users", title: "Team management", description: "Organize users into teams with role-based access control. Assign guidelines per team." },
        { icon: "Eye", title: "Audit trails", description: "Every prompt insertion and DLP violation is logged. Export audit data for compliance reporting." },
        { icon: "Lock", title: "Policy enforcement", description: "Block or warn on prompts that violate your data protection policies. Configurable severity levels." },
      ],
    },
    benefits: {
      heading: "Why organizations need AI governance",
      items: [
        "Prevent accidental data leaks through AI prompts",
        "Ensure consistent, high-quality AI interactions across teams",
        "Maintain compliance with industry regulations (HIPAA, SOX, GDPR)",
        "Get full visibility into your organization's AI usage patterns",
        "Set guardrails without blocking productivity",
        "Demonstrate AI oversight to auditors and stakeholders",
      ],
    },
    stats: [
      { value: "100%", label: "Prompt visibility" },
      { value: "Real-time", label: "DLP scanning" },
      { value: "Full", label: "Audit trail" },
    ],
    faqs: [
      { question: "Does this block my team from using AI?", answer: "No. TeamPrompt adds guardrails without blocking access. Teams can still use ChatGPT, Claude, Gemini, and other tools — with protection in place." },
      { question: "What data does the DLP scanner detect?", answer: "Social Security numbers, credit card numbers, API keys, patient identifiers (MRN, PHI), financial account numbers, and custom patterns you define." },
      { question: "Can I export audit data?", answer: "Yes. All usage logs and DLP violation reports can be exported for compliance reporting and internal reviews." },
      { question: "How does this compare to blocking AI tools entirely?", answer: "Blocking AI tools reduces productivity and pushes usage underground. TeamPrompt lets teams use AI safely with guardrails, guidelines, and full visibility." },
    ],
    cta: {
      headline: "Govern AI usage",
      gradientText: "without slowing your team down.",
      subtitle: "Start with the free plan. Upgrade as your governance needs grow.",
    },
  },
  {
    slug: "ai-compliance",
    category: "use-case",
    meta: {
      title: "AI Compliance — DLP Scanning & Audit Trails for AI Tools",
      description:
        "Stay compliant when your team uses AI. Automatic DLP scanning, audit trails, and policy enforcement for ChatGPT, Claude, Gemini, and more.",
      keywords: ["AI compliance", "DLP scanning", "AI audit trail", "data loss prevention AI"],
    },
    hero: {
      headline: "AI compliance, automated",
      subtitle:
        "Automatic DLP scanning catches sensitive data before it reaches AI tools. Full audit trails prove compliance to regulators.",
      badges: ["DLP scanning", "Audit trails", "Policy enforcement"],
    },
    features: {
      sectionLabel: "Compliance",
      heading: "Built for regulated industries",
      items: [
        { icon: "ShieldAlert", title: "Real-time DLP scanning", description: "Every outbound prompt is scanned for sensitive data patterns — SSNs, PHI, credit cards, API keys, and custom rules." },
        { icon: "Eye", title: "Complete audit trail", description: "Every prompt insertion, DLP match, and user action is logged with timestamps. Export anytime." },
        { icon: "Lock", title: "Block or warn", description: "Configure whether DLP violations block the prompt entirely or show a warning. Different severity for different patterns." },
        { icon: "Shield", title: "Custom patterns", description: "Define your own sensitive data patterns beyond the built-in detectors. Regex-based rules for organization-specific data." },
        { icon: "Users", title: "Role-based access", description: "Control who can manage guardrails, view audit logs, and configure DLP policies." },
        { icon: "BarChart3", title: "Compliance dashboards", description: "See violation trends, most-triggered rules, and team compliance scores at a glance." },
      ],
    },
    benefits: {
      heading: "Stay compliant across every AI tool",
      items: [
        "Prevent PHI, PII, and financial data from reaching AI models",
        "Generate audit reports for HIPAA, SOX, and GDPR reviews",
        "Prove AI oversight to regulators with timestamped logs",
        "Reduce compliance risk without restricting AI tool access",
        "Custom DLP rules for your organization's specific data types",
        "Real-time alerts when sensitive data is detected",
      ],
    },
    faqs: [
      { question: "What regulations does this help with?", answer: "TeamPrompt helps with HIPAA (healthcare), SOX (finance), GDPR (data protection), and any regulation requiring data loss prevention and audit trails for AI usage." },
      { question: "Does scanning slow down the user experience?", answer: "No. DLP scanning happens in milliseconds before the prompt is inserted. Users don't notice any delay." },
      { question: "Can I define custom sensitive data patterns?", answer: "Yes. Beyond the built-in detectors (SSN, credit cards, PHI), you can define custom regex patterns for organization-specific data." },
    ],
    cta: {
      headline: "Prove AI compliance",
      gradientText: "to any auditor.",
      subtitle: "Start scanning today. Free plan includes basic DLP rules.",
    },
  },
  {
    slug: "prompt-sharing",
    category: "use-case",
    meta: {
      title: "Share AI Prompts Across Your Team — Collaborative Prompt Management",
      description:
        "Share proven AI prompts across your team with categories, permissions, and usage tracking. Stop reinventing prompts in silos.",
      keywords: ["prompt sharing", "team collaboration AI", "share AI prompts", "collaborative prompts"],
    },
    hero: {
      headline: "Share prompts, not Slack messages",
      subtitle:
        "When someone writes a great prompt, the whole team should benefit. Share prompts through a searchable library — not chat threads.",
      badges: ["Team sharing", "Categories", "Permissions"],
    },
    features: {
      sectionLabel: "Sharing",
      heading: "Designed for team collaboration",
      items: [
        { icon: "Users", title: "Team categories", description: "Organize prompts into shared categories by team, project, or use case. Everyone sees the latest version." },
        { icon: "Lock", title: "Granular permissions", description: "Control who can view, edit, or manage each category. Role-based access keeps things organized." },
        { icon: "Globe", title: "Works in every AI tool", description: "Shared prompts are accessible from ChatGPT, Claude, Gemini, Copilot, and Perplexity via the browser extension." },
        { icon: "BarChart3", title: "Usage tracking", description: "See which shared prompts get used most. Understand what's working and what's gathering dust." },
        { icon: "Zap", title: "Instant updates", description: "Edit a shared prompt once, and every team member gets the update immediately. No version confusion." },
        { icon: "BookOpen", title: "Onboarding made easy", description: "New hires get immediate access to your team's best prompts. No tribal knowledge required." },
      ],
    },
    benefits: {
      heading: "Why teams share prompts with TeamPrompt",
      items: [
        "Great prompts get reused instead of forgotten in chat history",
        "New team members start productive on day one",
        "Consistent AI interactions across your entire organization",
        "Reduce duplicate effort — stop reinventing the same prompts",
        "Track which prompts actually get used by the team",
        "Control access with team-based categories and permissions",
      ],
    },
    faqs: [
      { question: "How do shared prompts work?", answer: "Create a prompt and assign it to a team category. Anyone with access can search, browse, and insert the prompt from the browser extension." },
      { question: "Can I share prompts with specific teams only?", answer: "Yes. Categories have granular permissions. You can share with specific teams, roles, or individual users." },
      { question: "What happens when someone edits a shared prompt?", answer: "The update is reflected immediately for everyone with access. Version history tracks all changes." },
    ],
    cta: {
      headline: "Your best prompts shouldn't live",
      gradientText: "in someone's clipboard.",
      subtitle: "Start sharing with your team today. Free plan available.",
    },
  },
  {
    slug: "ai-dlp",
    category: "use-case",
    meta: {
      title: "AI Data Loss Prevention — Stop Sensitive Data Leaking into AI Tools",
      description:
        "Real-time DLP scanning, auto-sanitization, and compliance policy packs protect your organization's sensitive data from leaking into ChatGPT, Claude, Gemini, and more.",
      keywords: ["AI DLP", "data loss prevention AI", "AI data protection", "sensitive data AI tools"],
    },
    hero: {
      headline: "AI data loss prevention that works in real-time",
      subtitle:
        "Scan every outbound prompt for sensitive data. Auto-sanitize with safe placeholders. Deploy compliance packs for HIPAA, GDPR, PCI-DSS, CCPA, SOC 2, and PII.",
      badges: ["Real-time scanning", "Auto-sanitization", "6 compliance packs"],
    },
    features: {
      sectionLabel: "DLP",
      heading: "Complete AI data loss prevention",
      items: [
        { icon: "ShieldAlert", title: "Real-time scanning", description: "Every prompt is scanned against your security rules before it reaches any AI tool. Block or warn on violations." },
        { icon: "Shield", title: "Auto-sanitization", description: "Automatically replace sensitive data with safe {{PLACEHOLDER}} tokens. Preserve prompt context, remove the risk." },
        { icon: "FileCheck", title: "Compliance packs", description: "One-click policy bundles for HIPAA, GDPR, PCI-DSS, CCPA, SOC 2, and General PII. Deploy a full compliance framework in seconds." },
        { icon: "Eye", title: "Full audit trail", description: "Every scan, violation, and sanitization is logged with timestamps. Export for compliance reviews and auditor requests." },
        { icon: "Lock", title: "Custom patterns", description: "Define organization-specific sensitive data patterns with regex, keyword, and exact match rules." },
        { icon: "Globe", title: "Works everywhere", description: "DLP scanning runs on ChatGPT, Claude, Gemini, Copilot, and Perplexity via the browser extension." },
      ],
    },
    benefits: {
      heading: "Why teams choose TeamPrompt for AI DLP",
      items: [
        "Stop PHI, PII, and financial data from reaching AI models",
        "Auto-sanitize instead of just blocking — keep workflows moving",
        "6 pre-built compliance packs cover major regulatory frameworks",
        "Full audit trail for compliance reviews and auditor requests",
        "Custom rules for organization-specific sensitive data",
        "Works across all major AI tools via browser extension",
      ],
    },
    stats: [
      { value: "6", label: "Compliance packs" },
      { value: "Real-time", label: "DLP scanning" },
      { value: "Full", label: "Audit trail" },
    ],
    faqs: [
      { question: "What types of sensitive data are detected?", answer: "Built-in rules detect SSNs, credit card numbers, API keys, patient identifiers (PHI), financial data, credentials, and common PII. Compliance packs add framework-specific patterns. You can also define custom patterns." },
      { question: "How does auto-sanitization work?", answer: "When sensitive data is detected, it's automatically replaced with descriptive {{PLACEHOLDER}} tokens like {{SSN}} or {{PATIENT_NAME}}. The prompt structure is preserved while removing actual sensitive data." },
      { question: "Does DLP scanning slow down the user?", answer: "No. Scanning happens in milliseconds before the prompt is sent. Users experience no noticeable delay." },
      { question: "Can I use compliance packs with custom rules?", answer: "Yes. Compliance packs and custom rules work together. Install a pack and add organization-specific rules on top." },
    ],
    cta: {
      headline: "Your team sends sensitive data to AI",
      gradientText: "every day. Fix that now.",
      subtitle: "Free plan includes basic DLP patterns. Upgrade for compliance packs and auto-sanitization.",
    },
  },
  {
    slug: "prompt-management",
    category: "use-case",
    meta: {
      title: "AI Prompt Management Platform — Centralize, Version, and Govern Prompts",
      description:
        "Centralized prompt vault with version history, diff view, approval workflows, template variables, and guardrails. The complete prompt management platform for teams.",
      keywords: ["prompt management", "prompt management platform", "manage AI prompts", "prompt version control"],
    },
    hero: {
      headline: "The complete prompt management platform",
      subtitle:
        "A centralized vault, version history with diff, approval workflows, reusable templates, and security guardrails — everything your team needs to manage AI prompts at scale.",
      badges: ["Centralized vault", "Version diff", "Approval workflows"],
    },
    features: {
      sectionLabel: "Platform",
      heading: "Everything for prompt management",
      items: [
        { icon: "Archive", title: "Centralized vault", description: "One searchable home for every prompt. Tags, categories, and full-text search make finding the right prompt instant." },
        { icon: "GitBranch", title: "Version history & diff", description: "Track every change. Compare any two versions side by side with color-coded additions and deletions." },
        { icon: "CheckSquare", title: "Approval workflows", description: "Submit prompts for review. Admins and managers approve or reject from a dedicated queue. Nothing goes live without review." },
        { icon: "Braces", title: "Template variables", description: "Create reusable templates with {{variables}}. Fill-in forms ensure consistency across every use." },
        { icon: "Shield", title: "Security guardrails", description: "DLP scanning, compliance packs, and auto-sanitization protect sensitive data on every prompt." },
        { icon: "Globe", title: "Browser extension", description: "Insert prompts directly into ChatGPT, Claude, Gemini, Copilot, and Perplexity. No tab switching." },
      ],
    },
    benefits: {
      heading: "Why teams need dedicated prompt management",
      items: [
        "Centralized library replaces scattered docs, Slack messages, and bookmarks",
        "Version history and diff prevent accidental overwrites and track changes",
        "Approval workflows ensure quality before prompts go live",
        "Template variables standardize outputs across the team",
        "Guardrails protect sensitive data on every interaction",
        "Analytics show which prompts work and where gaps exist",
      ],
    },
    stats: [
      { value: "10x", label: "Faster prompt access" },
      { value: "0", label: "Lost versions" },
      { value: "100%", label: "Review coverage" },
    ],
    faqs: [
      { question: "How is this different from a shared doc?", answer: "TeamPrompt offers one-click insertion into AI tools, version history with diff, approval workflows, DLP scanning, and usage analytics — none of which a shared document provides." },
      { question: "Can I version prompts?", answer: "Yes. Every edit creates a new version. You can view the full history, compare any two versions with a side-by-side diff, and restore previous versions instantly." },
      { question: "Does it work with my AI tools?", answer: "TeamPrompt works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity through the browser extension." },
      { question: "Is there an approval process?", answer: "Yes. Prompts can be submitted for review. Admins and managers approve or reject from a dedicated approval queue, with optional feedback." },
    ],
    cta: {
      headline: "Your prompts need",
      gradientText: "a management system.",
      subtitle: "Start managing prompts properly. Free plan available.",
    },
  },
  {
    slug: "ai-audit-trail",
    category: "use-case",
    meta: {
      title: "AI Audit Trail — Activity Logging & Compliance Reporting for AI Tools",
      description:
        "Complete audit trail for your organization's AI usage. Log every interaction, track violations, export compliance reports. Built for regulated industries.",
      keywords: ["AI audit trail", "AI activity logging", "AI compliance reporting", "AI usage tracking"],
    },
    hero: {
      headline: "Complete audit trail for your AI usage",
      subtitle:
        "Log every AI interaction, track every DLP violation, and export compliance reports. Built for teams that need to prove oversight to regulators.",
      badges: ["Activity logging", "Violation tracking", "Exportable reports"],
    },
    features: {
      sectionLabel: "Audit",
      heading: "Full visibility into AI usage",
      items: [
        { icon: "Eye", title: "Activity logging", description: "Every prompt insertion, AI tool interaction, and user action is logged with timestamps, user info, and tool details." },
        { icon: "ShieldAlert", title: "Violation tracking", description: "DLP violations are logged with the rule triggered, matched text (redacted), and action taken — block, warn, or sanitize." },
        { icon: "BarChart3", title: "Compliance dashboards", description: "See violation trends, most-triggered rules, team compliance scores, and risk posture at a glance." },
        { icon: "FileText", title: "Exportable reports", description: "Export audit data in CSV or JSON for compliance reviews, SIEM integration, and internal reporting." },
        { icon: "Users", title: "Per-user tracking", description: "See which users interact with which AI tools, how often, and whether any violations occurred." },
        { icon: "Lock", title: "Configurable retention", description: "Control how long interaction data is retained. Set retention policies per your organization's compliance requirements." },
      ],
    },
    benefits: {
      heading: "Why organizations need AI audit trails",
      items: [
        "Prove AI oversight to regulators with timestamped, exportable logs",
        "Track every DLP violation with rule details and actions taken",
        "Identify shadow AI usage gaps where employees bypass controls",
        "Generate compliance reports for HIPAA, SOX, GDPR, and internal reviews",
        "Monitor adoption trends and AI tool usage across departments",
        "Maintain configurable retention policies for data governance",
      ],
    },
    stats: [
      { value: "100%", label: "Interaction visibility" },
      { value: "Full", label: "Violation history" },
      { value: "CSV/JSON", label: "Export formats" },
    ],
    faqs: [
      { question: "What is logged in the audit trail?", answer: "Every prompt insertion, DLP scan result, violation event, and user action. Each log entry includes timestamp, user, AI tool, action type, and relevant details." },
      { question: "Can I export audit data?", answer: "Yes. Export in CSV or JSON format for compliance reviews, SIEM integration, or internal analysis." },
      { question: "How long is data retained?", answer: "Retention is configurable by your admin. Set policies per your organization's compliance requirements." },
      { question: "Does logging slow down the user?", answer: "No. Logging happens asynchronously and has no impact on the user experience." },
    ],
    cta: {
      headline: "Prove your AI oversight",
      gradientText: "to any auditor.",
      subtitle: "Start logging AI activity today. Free plan includes basic logging.",
    },
  },
  {
    slug: "ai-code-review-prompts",
    category: "use-case",
    meta: {
      title: "AI Code Review Prompts — Standardize Code Reviews | TeamPrompt",
      description:
        "Standardize your team's code reviews with shared AI prompt templates for security analysis, performance audits, readability checks, and best-practice enforcement. Deliver consistent, thorough code reviews every time.",
      keywords: ["AI code review", "code review prompts", "automated code review", "code review templates", "code quality AI"],
    },
    hero: {
      headline: "Standardize every code review with AI prompts",
      subtitle:
        "Equip your engineering team with a shared library of code review prompts covering security, performance, readability, and best practices. Every reviewer follows the same checklist — powered by AI.",
      badges: ["Security checks", "Performance audits", "Best practices"],
    },
    features: {
      sectionLabel: "Code Review",
      heading: "Comprehensive code review prompt library",
      items: [
        { icon: "ShieldCheck", title: "Security review prompts", description: "Pre-built prompts that instruct AI to scan for injection vulnerabilities, authentication flaws, insecure dependencies, and OWASP Top 10 issues in every pull request." },
        { icon: "Zap", title: "Performance analysis prompts", description: "Templates that guide AI to identify N+1 queries, memory leaks, unnecessary re-renders, and algorithmic inefficiencies before they reach production." },
        { icon: "Eye", title: "Readability & style prompts", description: "Prompts that enforce your team's coding standards, naming conventions, and documentation requirements so every merge request meets the same bar." },
        { icon: "Braces", title: "Language-specific templates", description: "Variable-driven templates for TypeScript, Python, Go, Rust, and more. Fill in the language and framework, and the prompt adapts automatically." },
        { icon: "GitBranch", title: "Versioned review standards", description: "Track changes to your review prompts over time with full version history and diff view so your standards evolve without losing context." },
        { icon: "Users", title: "Team-wide consistency", description: "Share review prompts across your entire engineering organization so junior and senior developers apply the same thoroughness to every review." },
      ],
    },
    benefits: {
      heading: "Why engineering teams standardize code reviews with AI",
      items: [
        "Catch security vulnerabilities before they reach production by reviewing against OWASP checklists",
        "Ensure every reviewer checks the same performance, readability, and style criteria",
        "Reduce review cycle time by giving reviewers structured, ready-to-use prompts",
        "Onboard new engineers faster with documented review standards they can follow immediately",
        "Maintain a living knowledge base of review best practices that improves over time",
        "Eliminate inconsistency between reviewers by standardizing the questions AI answers",
      ],
    },
    stats: [
      { value: "60%", label: "Faster review cycles" },
      { value: "5x", label: "More issues caught" },
      { value: "100%", label: "Reviewer consistency" },
    ],
    faqs: [
      { question: "What languages and frameworks are supported?", answer: "TeamPrompt code review templates use dynamic variables, so you can customize them for any language or framework. Pre-built examples cover TypeScript, Python, Go, and Rust, but you can create your own for any stack." },
      { question: "Can I enforce different standards for different repositories?", answer: "Yes. Create separate categories for each repository or team, each with its own set of review prompts and access permissions. Teams only see the prompts relevant to their codebase." },
      { question: "How do these prompts integrate with my existing review workflow?", answer: "Reviewers open the TeamPrompt extension alongside their code diff, select the appropriate review prompt, and paste it into ChatGPT or Claude. The AI returns a structured review based on your team's standards." },
      { question: "Can I track which review prompts are used most?", answer: "Yes. Usage analytics show which prompts are most popular, helping you identify gaps in coverage and understand which review categories matter most to your team." },
    ],
    cta: {
      headline: "Stop inconsistent code reviews.",
      gradientText: "Standardize with AI prompts.",
      subtitle: "Free plan available. Set up your first review template in minutes.",
    },
  },
  {
    slug: "ai-onboarding-playbooks",
    category: "use-case",
    meta: {
      title: "AI Onboarding Playbooks — Onboard New Hires with AI | TeamPrompt",
      description:
        "Accelerate new hire onboarding with AI-powered playbooks. Shared prompt templates guide new team members through tools, processes, and codebase exploration — reducing ramp-up time dramatically.",
      keywords: ["AI onboarding", "onboarding playbooks", "new hire AI", "employee onboarding prompts", "AI ramp-up"],
    },
    hero: {
      headline: "Onboard new hires in days, not months",
      subtitle:
        "Give every new team member a curated set of AI prompt playbooks that walk them through your tools, processes, architecture, and culture — so they become productive faster than ever.",
      badges: ["Faster ramp-up", "Structured playbooks", "Self-service learning"],
    },
    features: {
      sectionLabel: "Onboarding",
      heading: "AI-powered onboarding playbooks",
      items: [
        { icon: "BookOpen", title: "Role-based playbooks", description: "Pre-built prompt sequences for engineering, product, design, marketing, and support roles that guide new hires through their first weeks with structured AI assistance." },
        { icon: "Braces", title: "Codebase exploration prompts", description: "Templates that help new engineers ask AI the right questions about your architecture, folder structure, coding patterns, and deployment processes." },
        { icon: "Users", title: "Team-specific context", description: "Each team maintains its own onboarding category with prompts tailored to their tools, workflows, and domain knowledge — not generic boilerplate." },
        { icon: "Zap", title: "Self-service learning", description: "New hires use prompts independently to answer their own questions, reducing the number of interruptions for senior team members during the onboarding period." },
        { icon: "Key", title: "Access-controlled stages", description: "Release onboarding prompts in stages — week one basics, week two deep dives, week three advanced topics — using category permissions to control the flow." },
        { icon: "BarChart3", title: "Progress tracking", description: "Usage analytics reveal which onboarding prompts each new hire has used, helping managers identify gaps and offer targeted support where needed." },
      ],
    },
    benefits: {
      heading: "Why teams use AI onboarding playbooks",
      items: [
        "Reduce new hire ramp-up time from months to weeks with structured AI guidance",
        "Free senior engineers from repetitive onboarding questions that AI can answer",
        "Ensure every new hire receives the same thorough onboarding regardless of their manager",
        "Capture tribal knowledge in reusable prompt templates instead of one-off Slack conversations",
        "Track onboarding progress with analytics showing which prompts each hire has used",
        "Update onboarding content once and every future hire gets the latest version automatically",
      ],
    },
    stats: [
      { value: "70%", label: "Faster ramp-up" },
      { value: "3x", label: "Fewer interruptions" },
      { value: "100%", label: "Onboarding consistency" },
    ],
    faqs: [
      { question: "What roles do the onboarding playbooks cover?", answer: "You can create playbooks for any role. Common starting points include engineering, product management, design, marketing, and customer support. Each playbook is a category of prompts you customize for your organization." },
      { question: "How do new hires access the playbooks?", answer: "New hires install the TeamPrompt browser extension and are added to their team. They immediately see all onboarding prompts shared with their role and can insert them into any AI tool to start learning." },
      { question: "Can I track whether new hires are using the playbooks?", answer: "Yes. Usage analytics show which prompts each user has accessed, how often, and when. Managers can see at a glance whether a new hire is progressing through the onboarding sequence." },
    ],
    cta: {
      headline: "Onboard new hires faster",
      gradientText: "with AI-powered playbooks.",
      subtitle: "Free plan available. Build your first onboarding playbook today.",
    },
  },
  {
    slug: "ai-meeting-summaries",
    category: "use-case",
    meta: {
      title: "AI Meeting Summary Prompts — Meeting Summary Workflows | TeamPrompt",
      description:
        "Transform raw meeting notes into structured summaries, action items, and follow-up emails with shared AI prompt templates. Ensure every meeting has clear outcomes and accountability.",
      keywords: ["AI meeting summary", "meeting notes AI", "meeting action items", "meeting summary prompts", "meeting follow-up AI"],
    },
    hero: {
      headline: "Every meeting deserves a clear summary",
      subtitle:
        "Shared prompt templates that transform raw meeting notes into structured summaries, prioritized action items, and follow-up emails — so nothing falls through the cracks.",
      badges: ["Structured summaries", "Action items", "Follow-up drafts"],
    },
    features: {
      sectionLabel: "Meetings",
      heading: "Meeting summary prompt workflows",
      items: [
        { icon: "BookOpen", title: "Summary templates", description: "Prompts that extract key decisions, discussion points, and outcomes from raw meeting notes and format them into a clean, skimmable summary document." },
        { icon: "Zap", title: "Action item extraction", description: "Templates that pull every action item, owner, and deadline from your notes so nothing gets lost between the meeting and the next standup." },
        { icon: "Users", title: "Stakeholder-specific recaps", description: "Variable-driven prompts that generate tailored recaps for executives, project managers, and individual contributors with the detail level each audience needs." },
        { icon: "Globe", title: "Follow-up email drafts", description: "Prompts that convert meeting outcomes into professional follow-up emails ready to send, complete with action items, deadlines, and next steps." },
        { icon: "Archive", title: "Meeting type presets", description: "Pre-built prompt categories for standups, sprint reviews, all-hands, 1-on-1s, client calls, and board meetings — each optimized for its format." },
        { icon: "BarChart3", title: "Outcome tracking", description: "Analytics show which meeting templates your team uses most, helping you identify the formats that drive the most productive follow-through." },
      ],
    },
    benefits: {
      heading: "Why teams use AI meeting summary prompts",
      items: [
        "Never lose action items or decisions in messy meeting notes again",
        "Generate summaries in seconds instead of spending 15 minutes writing them manually",
        "Ensure consistent summary format so stakeholders always know where to find key information",
        "Tailor recaps to different audiences without writing multiple versions by hand",
        "Draft follow-up emails immediately after the meeting while context is fresh",
        "Build a searchable archive of meeting outcomes your team can reference later",
      ],
    },
    stats: [
      { value: "90%", label: "Less summary writing time" },
      { value: "0", label: "Missed action items" },
      { value: "100%", label: "Meetings documented" },
    ],
    faqs: [
      { question: "What meeting formats are supported?", answer: "TeamPrompt includes prompt presets for standups, sprint reviews, retrospectives, all-hands, 1-on-1s, client calls, and board meetings. You can also create custom templates for any meeting type your team runs." },
      { question: "Can I generate different summaries for different audiences?", answer: "Yes. Use template variables like {{audience}} and {{detail_level}} to generate executive summaries, detailed technical recaps, or quick status updates from the same meeting notes." },
      { question: "How do I feed meeting notes into the prompts?", answer: "Paste your raw notes or transcript into the AI tool, then insert the meeting summary prompt from the TeamPrompt extension. The AI combines your notes with the template instructions to produce a structured output." },
      { question: "Does this integrate with meeting recording tools?", answer: "TeamPrompt works with the output from any transcription tool. Export your transcript, paste it into your AI tool, and apply the summary prompt. It works with Otter, Fireflies, Grain, and any other transcription service." },
    ],
    cta: {
      headline: "Stop losing meeting outcomes.",
      gradientText: "Summarize with AI prompts.",
      subtitle: "Free plan available. Create your first meeting template in minutes.",
    },
  },
  {
    slug: "ai-data-analysis",
    category: "use-case",
    meta: {
      title: "AI Data Analysis Prompts — Data Analysis Prompt Libraries | TeamPrompt",
      description:
        "Shared prompt libraries for data analysis, visualization, statistical interpretation, and reporting. Standardize how your team uses AI to explore, analyze, and present data.",
      keywords: ["AI data analysis", "data analysis prompts", "AI data visualization", "data interpretation AI", "analytics prompts"],
    },
    hero: {
      headline: "Standardize your team's AI data analysis",
      subtitle:
        "A shared prompt library for data exploration, statistical analysis, visualization generation, and insight reporting — so every analyst follows the same rigorous methodology.",
      badges: ["Data exploration", "Statistical analysis", "Visualization"],
    },
    features: {
      sectionLabel: "Data Analysis",
      heading: "Data analysis prompt library",
      items: [
        { icon: "BarChart3", title: "Exploratory analysis prompts", description: "Templates that guide AI through systematic data exploration — distributions, outliers, correlations, and missing values — before jumping to conclusions." },
        { icon: "Eye", title: "Visualization prompts", description: "Prompts that instruct AI to generate charts, dashboards, and visual summaries using Python, R, or SQL with clear axis labels, legends, and annotations." },
        { icon: "BookOpen", title: "Statistical interpretation", description: "Templates that help your team interpret p-values, confidence intervals, regression outputs, and A/B test results with proper statistical rigor and context." },
        { icon: "Braces", title: "Query generation templates", description: "Variable-driven prompts for generating SQL queries, pandas operations, and data transformations tailored to your specific database schemas and naming conventions." },
        { icon: "Users", title: "Cross-team standards", description: "Share analysis prompts across data science, product, finance, and marketing teams so everyone applies the same methodology to their datasets." },
        { icon: "Shield", title: "Data privacy guardrails", description: "DLP scanning ensures that raw customer data, personally identifiable information, and sensitive metrics are never pasted into AI tools during analysis." },
      ],
    },
    benefits: {
      heading: "Why data teams use shared analysis prompts",
      items: [
        "Ensure every analyst follows the same rigorous methodology when exploring new datasets",
        "Reduce time from raw data to insight by starting with proven analysis prompt templates",
        "Generate consistent, publication-ready visualizations with standardized chart prompts",
        "Interpret statistical results correctly with guided prompts that prevent common misinterpretations",
        "Protect sensitive data with DLP guardrails that scan for PII before it reaches AI models",
        "Onboard junior analysts faster with documented analysis workflows they can follow step by step",
      ],
    },
    stats: [
      { value: "50%", label: "Faster analysis cycles" },
      { value: "100%", label: "Methodology consistency" },
      { value: "0", label: "Data leaks" },
    ],
    faqs: [
      { question: "What types of analysis prompts are included?", answer: "The library covers exploratory data analysis, statistical testing, regression modeling, A/B test interpretation, SQL query generation, Python/pandas operations, visualization creation, and executive reporting templates." },
      { question: "Can I customize prompts for my database schema?", answer: "Yes. Template variables let you define your table names, column names, and data types so generated queries match your actual database without manual editing." },
      { question: "How does the DLP protection work for data analysis?", answer: "Before any prompt reaches an AI tool, DLP scanning checks for patterns like customer IDs, email addresses, financial figures, and other sensitive data. Violations are blocked or sanitized automatically." },
      { question: "Can non-technical team members use these prompts?", answer: "Absolutely. Many prompts are designed for product managers and marketers who need to ask data questions without writing code. The templates guide AI to produce accessible explanations and visualizations." },
    ],
    cta: {
      headline: "Standardize your data analysis.",
      gradientText: "Let AI do the heavy lifting.",
      subtitle: "Free plan available. Build your analysis prompt library today.",
    },
  },
  {
    slug: "ai-content-localization",
    category: "use-case",
    meta: {
      title: "AI Content Localization — Translation & Localization Prompts | TeamPrompt",
      description:
        "Shared prompt templates for AI-powered translation, localization, and cultural adaptation. Ensure consistent brand voice across every language and market your team operates in.",
      keywords: ["AI localization", "AI translation prompts", "content localization", "cultural adaptation AI", "multilingual prompts"],
    },
    hero: {
      headline: "Localize content at the speed of AI",
      subtitle:
        "Shared prompt templates for translation, cultural adaptation, and localization quality checks — so your brand voice stays consistent in every language and market.",
      badges: ["Translation", "Cultural adaptation", "Brand consistency"],
    },
    features: {
      sectionLabel: "Localization",
      heading: "AI-powered localization prompt library",
      items: [
        { icon: "Globe", title: "Translation prompts", description: "Structured templates that instruct AI to translate content while preserving tone, intent, formatting, and technical terminology specific to your product and industry." },
        { icon: "Users", title: "Cultural adaptation guides", description: "Prompts that go beyond literal translation by guiding AI to adapt idioms, date formats, currency references, and cultural nuances for each target market." },
        { icon: "BookOpen", title: "Style guide enforcement", description: "Templates pre-loaded with your brand's glossary, tone-of-voice rules, and terminology preferences so every translation aligns with your established brand voice." },
        { icon: "Eye", title: "Quality review prompts", description: "Back-translation and consistency check prompts that help reviewers verify accuracy, catch mistranslations, and ensure nothing was lost in the localization process." },
        { icon: "Braces", title: "Format-aware templates", description: "Variable-driven prompts for localizing UI strings, marketing copy, legal disclaimers, help documentation, and email templates — each with format-specific instructions." },
        { icon: "BarChart3", title: "Localization tracking", description: "Usage analytics show which language pairs and content types your team localizes most, helping you prioritize resources and identify workflow bottlenecks." },
      ],
    },
    benefits: {
      heading: "Why localization teams use AI prompt libraries",
      items: [
        "Translate content faster by starting with structured prompts instead of blank AI conversations",
        "Maintain consistent brand voice across every language with embedded style guide rules",
        "Adapt content culturally, not just linguistically, with dedicated cultural adaptation prompts",
        "Catch translation errors with systematic quality review and back-translation prompts",
        "Scale to new markets quickly by reusing proven localization templates across language pairs",
        "Reduce dependency on expensive translation agencies for first-draft localization work",
      ],
    },
    stats: [
      { value: "80%", label: "Faster first drafts" },
      { value: "40+", label: "Languages supported" },
      { value: "100%", label: "Brand consistency" },
    ],
    faqs: [
      { question: "Can AI really handle professional translation?", answer: "AI produces excellent first drafts that significantly speed up the localization process. Most teams use AI prompts to generate initial translations, then have native speakers review and refine. This hybrid approach is faster and more cost-effective than starting from scratch." },
      { question: "How do I ensure brand voice consistency across languages?", answer: "TeamPrompt templates let you embed your brand glossary, tone guidelines, and terminology preferences directly in the prompt. Every translator — human or AI — works from the same instructions, ensuring consistency across all languages." },
      { question: "What content formats can I localize with these prompts?", answer: "The library includes templates for UI strings, marketing copy, blog posts, email campaigns, legal disclaimers, help documentation, and social media content. Each format has specific instructions for handling length constraints, formatting, and context." },
    ],
    cta: {
      headline: "Go global faster.",
      gradientText: "Localize with AI prompts.",
      subtitle: "Free plan available. Start localizing content in minutes.",
    },
  },
  {
    slug: "ai-compliance-reporting",
    category: "use-case",
    meta: {
      title: "AI Compliance Reporting — Compliance & Audit Report Prompts | TeamPrompt",
      description:
        "Shared prompt templates for generating compliance reports, audit documentation, regulatory filings, and internal control assessments. Standardize compliance workflows across your organization with AI.",
      keywords: ["AI compliance reporting", "compliance prompts", "audit report AI", "regulatory reporting", "compliance documentation AI"],
    },
    hero: {
      headline: "Generate compliance reports with AI precision",
      subtitle:
        "Shared prompt templates for audit documentation, regulatory filings, risk assessments, and internal control reviews — so your compliance team works faster without sacrificing accuracy.",
      badges: ["Audit documentation", "Regulatory filings", "Risk assessments"],
    },
    features: {
      sectionLabel: "Compliance",
      heading: "Compliance reporting prompt library",
      items: [
        { icon: "ShieldCheck", title: "Audit report templates", description: "Structured prompts that guide AI to generate SOC 2, ISO 27001, and internal audit reports with consistent formatting, evidence references, and finding classifications." },
        { icon: "BookOpen", title: "Regulatory filing prompts", description: "Templates for GDPR data processing records, HIPAA risk assessments, SOX control documentation, and other regulatory submissions your organization files regularly." },
        { icon: "Eye", title: "Gap analysis prompts", description: "Prompts that instruct AI to compare your current controls against regulatory requirements, identify gaps, and recommend remediation steps with priority levels." },
        { icon: "Lock", title: "Evidence collection guides", description: "Templates that help compliance teams document evidence systematically — screenshots, configuration exports, policy references — organized by control objective." },
        { icon: "BarChart3", title: "Risk assessment prompts", description: "Standardized risk assessment templates that guide AI through likelihood and impact scoring, control effectiveness evaluation, and residual risk calculation." },
        { icon: "Archive", title: "Report library & versioning", description: "Store all compliance prompt templates in a versioned library with approval workflows so updates go through proper review before being used in official filings." },
      ],
    },
    benefits: {
      heading: "Why compliance teams use AI reporting prompts",
      items: [
        "Generate first drafts of audit reports in minutes instead of days of manual writing",
        "Ensure consistent report formatting and terminology across all compliance documentation",
        "Reduce human error in risk assessments by following standardized AI-guided evaluation criteria",
        "Scale compliance operations without proportionally growing the compliance team headcount",
        "Maintain a versioned library of approved report templates that evolves with regulatory changes",
        "Free compliance analysts from repetitive documentation so they can focus on actual risk evaluation",
      ],
    },
    stats: [
      { value: "75%", label: "Less report writing time" },
      { value: "100%", label: "Format consistency" },
      { value: "0", label: "Missed deadlines" },
    ],
    faqs: [
      { question: "Can AI generate accurate compliance reports?", answer: "AI excels at structuring information, ensuring consistent formatting, and drafting narrative sections. Compliance teams use these prompts to generate thorough first drafts, then review and validate the content against actual evidence and controls." },
      { question: "What compliance frameworks are covered?", answer: "The library includes templates for SOC 2, ISO 27001, GDPR, HIPAA, SOX, PCI-DSS, and general internal audit frameworks. You can also create custom templates for industry-specific regulations your organization follows." },
      { question: "How do approval workflows work for compliance templates?", answer: "Compliance prompt templates can require admin approval before they go live. This ensures that any changes to report structures or assessment criteria are reviewed by authorized personnel before being used in official documentation." },
      { question: "Is sensitive compliance data protected?", answer: "Yes. DLP guardrails scan every prompt before it reaches an AI tool, blocking sensitive data like customer identifiers, financial figures, and internal control details from being exposed to external AI models." },
    ],
    cta: {
      headline: "Compliance reports in minutes,",
      gradientText: "not days.",
      subtitle: "Free plan available. Start generating compliance documentation today.",
    },
  },
  {
    slug: "ai-incident-response",
    category: "use-case",
    meta: {
      title: "AI Incident Response — Incident Response Prompts | TeamPrompt",
      description:
        "Shared prompt templates for incident triage, root cause analysis, post-mortem writing, and stakeholder communication. Respond to incidents faster and document them more thoroughly with AI.",
      keywords: ["AI incident response", "incident response prompts", "post-mortem AI", "root cause analysis prompts", "incident triage AI"],
    },
    hero: {
      headline: "Respond to incidents faster with AI prompts",
      subtitle:
        "Shared prompt templates for triage, root cause analysis, post-mortem documentation, and stakeholder communication — so your team handles every incident with the same thoroughness.",
      badges: ["Triage prompts", "Root cause analysis", "Post-mortem writing"],
    },
    features: {
      sectionLabel: "Incident Response",
      heading: "Incident response prompt library",
      items: [
        { icon: "ShieldAlert", title: "Triage prompts", description: "Structured templates that guide on-call engineers through severity assessment, blast radius estimation, and initial mitigation steps within the first minutes of an incident." },
        { icon: "GitBranch", title: "Root cause analysis", description: "Prompts that walk your team through systematic five-whys analysis, contributing factor identification, and causal chain documentation with AI-assisted thoroughness." },
        { icon: "BookOpen", title: "Post-mortem templates", description: "Comprehensive post-mortem prompts that ensure every incident review covers timeline, impact, root cause, contributing factors, action items, and lessons learned." },
        { icon: "Users", title: "Stakeholder communication", description: "Templates for drafting status page updates, executive briefings, customer notifications, and internal all-hands summaries at every stage of the incident lifecycle." },
        { icon: "Zap", title: "Runbook generation", description: "Prompts that help engineers convert ad-hoc incident fixes into documented runbooks so the same incident type can be resolved faster next time." },
        { icon: "BarChart3", title: "Incident metrics prompts", description: "Templates for calculating and reporting MTTR, MTTD, incident frequency, and severity distribution from your incident data to track reliability improvements over time." },
      ],
    },
    benefits: {
      heading: "Why SRE teams use AI incident response prompts",
      items: [
        "Reduce mean time to resolution by giving on-call engineers structured triage prompts from the first minute",
        "Produce thorough post-mortems consistently, even under pressure, with guided AI-assisted templates",
        "Communicate clearly to stakeholders at every stage with pre-built notification and briefing prompts",
        "Convert incident learnings into permanent runbooks so your team never solves the same problem from scratch",
        "Standardize root cause analysis methodology across all teams and incident severity levels",
        "Track reliability metrics over time with consistent incident reporting prompts and data extraction templates",
      ],
    },
    stats: [
      { value: "40%", label: "Faster MTTR" },
      { value: "100%", label: "Post-mortem coverage" },
      { value: "3x", label: "More actionable items" },
    ],
    faqs: [
      { question: "When should we use these prompts during an incident?", answer: "Start with triage prompts the moment an incident is declared. Use communication templates throughout the incident for status updates. After resolution, use root cause analysis and post-mortem templates to document learnings. The prompts cover the full incident lifecycle." },
      { question: "Can I customize the post-mortem template for my organization?", answer: "Yes. The post-mortem prompts use template variables for your organization's specific sections, terminology, and severity definitions. Customize once, and every post-mortem follows your standard format automatically." },
      { question: "How do runbook generation prompts work?", answer: "After resolving an incident, paste your investigation notes and resolution steps into the runbook generation prompt. AI structures them into a step-by-step runbook with prerequisites, commands, verification steps, and rollback procedures." },
      { question: "Are these prompts useful for non-engineering incidents?", answer: "Yes. While the library focuses on technical incidents, the triage, communication, and post-mortem frameworks apply equally to security incidents, data breaches, service outages, and operational disruptions across any department." },
    ],
    cta: {
      headline: "Handle every incident",
      gradientText: "with the same thoroughness.",
      subtitle: "Free plan available. Build your incident response playbook today.",
    },
  },
];
