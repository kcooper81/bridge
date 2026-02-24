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
        { icon: "Archive", title: "Organized collections", description: "Prompts organized by team, topic, and use case — not buried in a long document." },
        { icon: "Users", title: "Role-based access", description: "Granular permissions per collection. More control than document-level sharing." },
      ],
    },
    benefits: {
      heading: "Why teams move from shared docs to TeamPrompt",
      items: [
        "Prompts are searchable and insertable, not buried in pages",
        "DLP scanning prevents data leaks that docs can't catch",
        "Template variables make prompts reusable, not just readable",
        "Usage analytics show what's working and what's not",
        "Organized collections instead of one long document",
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
];
