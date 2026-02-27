import type { SeoPageData } from "../types";

export const comparisonPages: SeoPageData[] = [
  {
    slug: "vs-notion",
    category: "comparison",
    meta: {
      title: "TeamPrompt vs Notion for Prompt Management",
      description:
        "Compare TeamPrompt and Notion for managing AI prompts. See why teams choose a dedicated prompt manager over general-purpose docs.",
      keywords: ["TeamPrompt vs Notion", "prompt management comparison", "Notion AI prompts"],
    },
    hero: {
      headline: "TeamPrompt vs. Notion for prompts",
      subtitle:
        "Notion is great for docs. But managing AI prompts needs one-click insertion, DLP scanning, and usage analytics that Notion can't provide.",
      badges: ["Purpose-built", "One-click insert", "DLP included"],
    },
    features: {
      sectionLabel: "Comparison",
      heading: "What Notion can't do for prompts",
      items: [
        { icon: "Zap", title: "One-click insert", description: "Insert prompts directly into ChatGPT, Claude, and Gemini. No copy-paste from a Notion page." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Automatically scan prompts for sensitive data before they reach AI tools. Notion has no DLP." },
        { icon: "BookOpen", title: "Template variables", description: "Dynamic {{variables}} that prompt users to fill in fields. Not just static text in a doc." },
        { icon: "BarChart3", title: "Usage analytics", description: "See which prompts get used, by whom, and in which AI tool. Notion can't track prompt usage." },
        { icon: "Globe", title: "Browser extension", description: "Your prompt library lives inside your AI tools. No switching tabs to find a Notion page." },
        { icon: "Shield", title: "Guardrails", description: "Quality guidelines and DLP policies that Notion's general-purpose editor can't enforce." },
      ],
    },
    benefits: {
      heading: "Why teams switch from Notion to TeamPrompt",
      items: [
        "Insert prompts in one click instead of copy-paste from Notion",
        "DLP scanning that Notion doesn't offer",
        "Usage analytics to see which prompts actually get used",
        "Template variables instead of static text blocks",
        "Browser extension puts prompts inside your AI tools",
        "Purpose-built for prompt management, not general docs",
      ],
    },
    stats: [
      { value: "1 click", label: "vs copy-paste" },
      { value: "Built-in", label: "DLP scanning" },
      { value: "Real-time", label: "Usage analytics" },
    ],
    faqs: [
      { question: "Can I still use Notion for other things?", answer: "Absolutely. TeamPrompt replaces Notion only for prompt management. Keep using Notion for docs, wikis, and project management." },
      { question: "Can I import prompts from Notion?", answer: "Yes. Export your prompts from Notion as text and import them into TeamPrompt via CSV or paste." },
      { question: "Is TeamPrompt more expensive than Notion?", answer: "TeamPrompt has a free plan for up to 25 prompts. Paid plans start at $9/month. For teams already paying for Notion, TeamPrompt adds dedicated prompt management at a low incremental cost." },
    ],
    cta: {
      headline: "Your prompts deserve",
      gradientText: "a purpose-built home.",
      subtitle: "Move from Notion to TeamPrompt in minutes. Free plan available.",
    },
  },
  {
    slug: "vs-shared-docs",
    category: "comparison",
    meta: {
      title: "TeamPrompt vs Google Docs & Shared Documents for Prompts",
      description:
        "Compare TeamPrompt and shared docs (Google Docs, Confluence, SharePoint) for managing AI prompts. See why dedicated beats general-purpose.",
      keywords: ["prompt management vs Google Docs", "AI prompts shared docs", "prompt management tool"],
    },
    hero: {
      headline: "TeamPrompt vs. shared docs for prompts",
      subtitle:
        "Google Docs, Confluence, and SharePoint weren't built for prompt management. Your prompts need insertion, scanning, and analytics.",
      badges: ["vs Google Docs", "vs Confluence", "vs SharePoint"],
    },
    features: {
      sectionLabel: "Comparison",
      heading: "Beyond shared documents",
      items: [
        { icon: "Zap", title: "Direct insertion", description: "Insert prompts directly into AI tools from the browser extension. No tab switching to find a doc." },
        { icon: "ShieldAlert", title: "Automatic DLP", description: "Every prompt is scanned for sensitive data before insertion. Shared docs have zero protection." },
        { icon: "BookOpen", title: "Smart templates", description: "Dynamic variables, fill-in forms, and default values. Not just text on a page." },
        { icon: "BarChart3", title: "Usage tracking", description: "Know which prompts get used and by whom. A shared doc has no analytics." },
        { icon: "Archive", title: "Organized categories", description: "Prompts organized by team, topic, and use case — not buried in a long document." },
        { icon: "Users", title: "Role-based access", description: "Granular permissions per category. More control than document-level sharing." },
      ],
    },
    benefits: {
      heading: "Why teams move from shared docs to TeamPrompt",
      items: [
        "Prompts are searchable and insertable, not buried in pages",
        "DLP scanning prevents data leaks that docs can't catch",
        "Template variables make prompts reusable, not just readable",
        "Usage analytics show what's working and what's not",
        "Organized categories instead of one long document",
        "Browser extension puts prompts where teams actually use AI",
      ],
    },
    faqs: [
      { question: "Can I import from Google Docs?", answer: "Yes. Copy prompts from any document and paste or import via CSV into TeamPrompt." },
      { question: "Does TeamPrompt replace our wiki?", answer: "No. TeamPrompt is specifically for AI prompts. Keep your wiki for documentation and use TeamPrompt for prompt management." },
      { question: "What about version control?", answer: "TeamPrompt tracks prompt changes with version history. Shared docs track document changes but not individual prompt usage." },
    ],
    cta: {
      headline: "Stop scrolling through docs",
      gradientText: "to find prompts.",
      subtitle: "A searchable, insertable prompt library for your team.",
    },
  },
  {
    slug: "vs-spreadsheets",
    category: "comparison",
    meta: {
      title: "TeamPrompt vs Spreadsheets for Prompt Management",
      description:
        "Compare TeamPrompt and spreadsheets (Excel, Google Sheets) for managing AI prompts. See why a dedicated tool outperforms rows and columns.",
      keywords: ["prompt management vs spreadsheets", "AI prompts Excel", "prompt management tool comparison"],
    },
    hero: {
      headline: "TeamPrompt vs. spreadsheets for prompts",
      subtitle:
        "Spreadsheets are for data, not prompt management. Your prompts need search, insertion, templates, and security.",
      badges: ["vs Excel", "vs Google Sheets"],
    },
    features: {
      sectionLabel: "Comparison",
      heading: "Prompts aren't spreadsheet data",
      items: [
        { icon: "Zap", title: "One-click insert", description: "Insert prompts into AI tools directly. No copying from cell B7 and pasting into ChatGPT." },
        { icon: "BookOpen", title: "Template variables", description: "Dynamic fields with fill-in forms. Not static text crammed into a spreadsheet cell." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Automatic sensitive data detection on every prompt. Spreadsheets have zero security awareness." },
        { icon: "Archive", title: "Rich formatting", description: "Multi-line prompts with proper formatting. Not truncated text in narrow columns." },
        { icon: "Globe", title: "Browser extension", description: "Your library is accessible inside every AI tool. No switching to a spreadsheet tab." },
        { icon: "BarChart3", title: "Usage analytics", description: "Track which prompts get used and perform best. A spreadsheet can't tell you that." },
      ],
    },
    benefits: {
      heading: "Why teams graduate from spreadsheets",
      items: [
        "Full-text search instead of Ctrl+F through rows",
        "One-click insertion instead of copy-paste from cells",
        "Template variables instead of static cell text",
        "DLP scanning that spreadsheets can't provide",
        "Rich formatting for multi-paragraph prompts",
        "Usage analytics to see what's actually being used",
      ],
    },
    faqs: [
      { question: "Can I import from a spreadsheet?", answer: "Yes. Export your spreadsheet to CSV and import directly into TeamPrompt. Column mapping makes migration easy." },
      { question: "Is the learning curve steep?", answer: "No. If you can use a spreadsheet, you can use TeamPrompt. Most teams are set up in under 5 minutes." },
      { question: "What if I only have a few prompts?", answer: "The free plan supports up to 25 prompts — plenty for small teams. Upgrade when you need more." },
    ],
    cta: {
      headline: "Your prompts outgrew",
      gradientText: "the spreadsheet.",
      subtitle: "Import your prompts in minutes. Free plan available.",
    },
  },
  {
    slug: "vs-custom-gpts",
    category: "comparison",
    meta: {
      title: "TeamPrompt vs Custom GPTs — Cross-Platform Prompt Management",
      description:
        "Compare TeamPrompt and OpenAI Custom GPTs for managing AI prompts across your team. See why cross-platform beats single-vendor lock-in.",
      keywords: ["TeamPrompt vs Custom GPTs", "Custom GPTs alternative", "cross-platform AI prompts"],
    },
    hero: {
      headline: "TeamPrompt vs. Custom GPTs",
      subtitle:
        "Custom GPTs lock you into ChatGPT. TeamPrompt works across ChatGPT, Claude, Gemini, Copilot, and Perplexity — with DLP, team controls, and analytics.",
      badges: ["Cross-platform", "DLP included", "Team controls"],
    },
    features: {
      sectionLabel: "Comparison",
      heading: "What Custom GPTs can't do",
      items: [
        { icon: "Globe", title: "Cross-platform", description: "TeamPrompt works in ChatGPT, Claude, Gemini, Copilot, and Perplexity. Custom GPTs only work inside ChatGPT." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Real-time sensitive data detection and auto-sanitization. Custom GPTs have no DLP or data protection." },
        { icon: "Users", title: "Team management", description: "Role-based access, teams, and approval workflows. Custom GPTs lack team management features." },
        { icon: "BarChart3", title: "Usage analytics", description: "Track which prompts get used, by whom, and in which AI tool. Custom GPTs offer limited analytics." },
        { icon: "Shield", title: "Compliance packs", description: "One-click HIPAA, GDPR, PCI-DSS policy packs. Custom GPTs have no compliance framework support." },
        { icon: "Eye", title: "Full audit trail", description: "Every interaction logged for compliance. Custom GPTs don't provide audit trails." },
      ],
    },
    benefits: {
      heading: "Why teams choose TeamPrompt over Custom GPTs",
      items: [
        "Use prompts across all major AI tools, not just ChatGPT",
        "DLP scanning and auto-sanitization protect sensitive data",
        "Team management with roles, approvals, and access control",
        "Usage analytics and audit trails for compliance",
        "Compliance policy packs for regulated industries",
        "No vendor lock-in — your prompts work everywhere",
      ],
    },
    stats: [
      { value: "5", label: "AI tools supported" },
      { value: "Built-in", label: "DLP & compliance" },
      { value: "Full", label: "Team controls" },
    ],
    faqs: [
      { question: "Can I still use Custom GPTs?", answer: "Yes. TeamPrompt complements Custom GPTs by adding cross-platform access, DLP, and team management. Use both together or switch fully to TeamPrompt." },
      { question: "Does TeamPrompt support GPT-based prompts?", answer: "Yes. Any prompt that works in ChatGPT can be stored in TeamPrompt and used across all supported AI tools." },
      { question: "Is TeamPrompt more expensive?", answer: "TeamPrompt has a free plan. Paid plans start at $9/month — comparable to or less than ChatGPT Plus, with multi-tool support included." },
    ],
    cta: {
      headline: "Stop being locked into",
      gradientText: "a single AI tool.",
      subtitle: "Manage prompts across every AI tool your team uses. Free plan available.",
    },
  },
  {
    slug: "vs-prompt-managers",
    category: "comparison",
    meta: {
      title: "TeamPrompt vs AIPRM & Prompt Managers — Governance-First Prompt Management",
      description:
        "Compare TeamPrompt with AIPRM, PromptPerfect, and other prompt managers. See why governance-first matters: compliance packs, approval workflows, audit trails.",
      keywords: ["TeamPrompt vs AIPRM", "prompt manager comparison", "AI governance platform"],
    },
    hero: {
      headline: "TeamPrompt vs. other prompt managers",
      subtitle:
        "Most prompt managers help you organize prompts. TeamPrompt adds governance: compliance packs, DLP scanning, approval workflows, and full audit trails.",
      badges: ["Governance-first", "Compliance packs", "Audit trails"],
    },
    features: {
      sectionLabel: "Comparison",
      heading: "Beyond basic prompt management",
      items: [
        { icon: "Shield", title: "Compliance packs", description: "One-click HIPAA, GDPR, PCI-DSS, CCPA, SOC 2, and PII policy packs. Other prompt managers have no compliance features." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Real-time scanning with auto-sanitization. AIPRM and others don't scan for sensitive data." },
        { icon: "CheckSquare", title: "Approval workflows", description: "Submit prompts for review before they go live. Other tools lack governance workflows." },
        { icon: "Eye", title: "Full audit trail", description: "Every interaction logged with timestamps. Export for compliance reviews. Other tools don't offer audit capabilities." },
        { icon: "Users", title: "Team management", description: "Roles, teams, and access control. Most prompt managers are built for individual use, not organizations." },
        { icon: "BarChart3", title: "Effectiveness analytics", description: "Track prompt effectiveness with ratings and distribution metrics. Go beyond basic usage counts." },
      ],
    },
    benefits: {
      heading: "Why governance-first matters",
      items: [
        "Compliance packs cover HIPAA, GDPR, PCI-DSS, CCPA, and SOC 2",
        "DLP scanning prevents sensitive data leaks that other tools ignore",
        "Approval workflows ensure quality and compliance before prompts go live",
        "Full audit trail proves AI oversight to regulators",
        "Team management with roles and access control for organizations",
        "Effectiveness analytics show which prompts actually deliver results",
      ],
    },
    stats: [
      { value: "6", label: "Compliance packs" },
      { value: "Built-in", label: "DLP + audit" },
      { value: "Full", label: "Approval workflow" },
    ],
    faqs: [
      { question: "How is TeamPrompt different from AIPRM?", answer: "AIPRM focuses on prompt discovery and templates for individual ChatGPT users. TeamPrompt is built for teams with governance: DLP scanning, compliance packs, approval workflows, audit trails, and team management." },
      { question: "Can I migrate from another prompt manager?", answer: "Yes. Export prompts from any tool as CSV or JSON and import into TeamPrompt. The column mapper handles different formats." },
      { question: "Is TeamPrompt for individuals or teams?", answer: "Both. The Pro plan works for solo power users. Team and Business plans add multi-user governance features." },
    ],
    cta: {
      headline: "Your prompts need governance,",
      gradientText: "not just organization.",
      subtitle: "Start with the free plan. Add governance as your team grows.",
    },
  },
];
