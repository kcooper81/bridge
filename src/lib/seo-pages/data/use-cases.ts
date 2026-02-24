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
        { icon: "Archive", title: "Organized vault", description: "Store prompts in collections with tags, descriptions, and usage notes. Find any prompt in seconds." },
        { icon: "Globe", title: "Works everywhere", description: "Access your library from ChatGPT, Claude, Gemini, Copilot, and Perplexity via our browser extension." },
        { icon: "Users", title: "Team sharing", description: "Share prompts across your organization. Control who can view, edit, or manage each collection." },
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
        { icon: "Users", title: "Team management", description: "Organize users into teams with role-based access control. Assign collections and guidelines per team." },
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
        "Share proven AI prompts across your team with collections, permissions, and usage tracking. Stop reinventing prompts in silos.",
      keywords: ["prompt sharing", "team collaboration AI", "share AI prompts", "collaborative prompts"],
    },
    hero: {
      headline: "Share prompts, not Slack messages",
      subtitle:
        "When someone writes a great prompt, the whole team should benefit. Share prompts through a searchable library — not chat threads.",
      badges: ["Team sharing", "Collections", "Permissions"],
    },
    features: {
      sectionLabel: "Sharing",
      heading: "Designed for team collaboration",
      items: [
        { icon: "Users", title: "Team collections", description: "Organize prompts into shared collections by team, project, or use case. Everyone sees the latest version." },
        { icon: "Lock", title: "Granular permissions", description: "Control who can view, edit, or manage each collection. Role-based access keeps things organized." },
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
        "Control access with team-based collections and permissions",
      ],
    },
    faqs: [
      { question: "How do shared prompts work?", answer: "Create a prompt and add it to a team collection. Anyone with access to that collection can search, browse, and insert the prompt from the browser extension." },
      { question: "Can I share prompts with specific teams only?", answer: "Yes. Collections have granular permissions. You can share with specific teams, roles, or individual users." },
      { question: "What happens when someone edits a shared prompt?", answer: "The update is reflected immediately for everyone with access. Version history tracks all changes." },
    ],
    cta: {
      headline: "Your best prompts shouldn't live",
      gradientText: "in someone's clipboard.",
      subtitle: "Start sharing with your team today. Free plan available.",
    },
  },
];
