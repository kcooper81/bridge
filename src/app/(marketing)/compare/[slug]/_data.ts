export interface ComparisonFeature {
  feature: string;
  teamPrompt: string | boolean;
  competitor: string | boolean;
}

export interface ComparisonPage {
  slug: string;
  competitor: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  intro: string;
  features: ComparisonFeature[];
  teamPromptStrengths: string[];
  competitorStrengths: string[];
  verdict: string;
}

export const COMPARISON_PAGES: ComparisonPage[] = [
  {
    slug: "nightfall",
    competitor: "Nightfall AI",
    title: "TeamPrompt vs Nightfall AI",
    metaTitle: "TeamPrompt vs Nightfall AI — AI DLP Comparison 2026",
    metaDescription:
      "Compare TeamPrompt and Nightfall AI for AI data loss prevention. Browser extension DLP + prompt management vs API-based enterprise DLP. Feature comparison, pricing, and which is right for your team.",
    keywords: ["TeamPrompt vs Nightfall", "Nightfall alternative", "AI DLP comparison", "best AI DLP"],
    intro:
      "Nightfall AI is an enterprise DLP platform that scans data across SaaS applications via API. TeamPrompt takes a different approach — a browser extension that scans prompts in real time before they reach AI tools, combined with a shared prompt library and compliance framework. Both protect sensitive data, but they work very differently.",
    features: [
      { feature: "AI tool DLP scanning", teamPrompt: "Real-time in browser", competitor: "API-based post-hoc" },
      { feature: "Prompt management", teamPrompt: true, competitor: false },
      { feature: "Shared prompt library", teamPrompt: true, competitor: false },
      { feature: "Network-level blocking (Cloudflare)", teamPrompt: true, competitor: false },
      { feature: "Slack/Jira DLP", teamPrompt: false, competitor: true },
      { feature: "Email DLP", teamPrompt: false, competitor: true },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: "Custom policies" },
      { feature: "Self-serve setup", teamPrompt: "Under 5 minutes", competitor: "Enterprise onboarding" },
      { feature: "Free tier", teamPrompt: "Up to 3 users", competitor: false },
      { feature: "Browser extension", teamPrompt: "Chrome, Firefox, Edge", competitor: false },
      { feature: "Auto-redaction", teamPrompt: true, competitor: true },
      { feature: "Audit trail", teamPrompt: true, competitor: true },
      { feature: "Risk scoring", teamPrompt: "0-100 per prompt", competitor: "Severity levels" },
      { feature: "LLM-based classification", teamPrompt: true, competitor: true },
    ],
    teamPromptStrengths: [
      "Real-time prevention — blocks data BEFORE it reaches the AI tool, not after",
      "Shared prompt library — no competitor in the DLP space offers this",
      "Self-serve — install the extension and start scanning in minutes",
      "Two-layer protection — browser DLP + Cloudflare DNS blocking",
      "Free tier makes it accessible to small teams",
    ],
    competitorStrengths: [
      "Broader SaaS coverage — Slack, Jira, GitHub, Google Drive, not just AI tools",
      "API-based scanning works without a browser extension",
      "Longer track record in enterprise DLP",
      "More integrations with SIEM/SOAR tools",
    ],
    verdict:
      "Choose TeamPrompt if your primary concern is AI tool security and you want prompt management in the same platform. Choose Nightfall if you need DLP across all SaaS applications (not just AI) and have an enterprise budget.",
  },
  {
    slug: "purview",
    competitor: "Microsoft Purview",
    title: "TeamPrompt vs Microsoft Purview",
    metaTitle: "TeamPrompt vs Microsoft Purview — AI DLP for All Tools, Not Just Copilot",
    metaDescription:
      "Compare TeamPrompt and Microsoft Purview for AI data protection. Cross-platform AI DLP vs Microsoft-ecosystem DLP. See which protects ChatGPT, Claude, and Gemini usage.",
    keywords: ["TeamPrompt vs Purview", "Microsoft Purview alternative", "AI DLP not just Copilot", "cross-platform AI DLP"],
    intro:
      "Microsoft Purview provides comprehensive data loss prevention across the Microsoft 365 ecosystem. But if your team uses ChatGPT, Claude, or Gemini alongside Copilot, Purview has blind spots. TeamPrompt covers all major AI tools with browser-level DLP scanning and adds a shared prompt library that Purview doesn't offer.",
    features: [
      { feature: "ChatGPT DLP", teamPrompt: true, competitor: false },
      { feature: "Claude DLP", teamPrompt: true, competitor: false },
      { feature: "Gemini DLP", teamPrompt: true, competitor: false },
      { feature: "Copilot DLP", teamPrompt: true, competitor: true },
      { feature: "Microsoft 365 DLP", teamPrompt: false, competitor: true },
      { feature: "Endpoint DLP", teamPrompt: false, competitor: true },
      { feature: "Prompt management", teamPrompt: true, competitor: false },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: "200+ templates" },
      { feature: "Setup time", teamPrompt: "5 minutes", competitor: "Days to weeks" },
      { feature: "License required", teamPrompt: "Free tier available", competitor: "Microsoft 365 E5" },
      { feature: "Network-level AI blocking", teamPrompt: "Cloudflare Gateway", competitor: false },
      { feature: "Sensitivity labels", teamPrompt: false, competitor: true },
    ],
    teamPromptStrengths: [
      "Covers ChatGPT, Claude, Gemini — not just Microsoft Copilot",
      "No Microsoft 365 E5 license required ($57/user/month savings)",
      "Prompt library and governance in one tool",
      "Setup in 5 minutes vs days of Purview configuration",
      "Cloudflare Gateway integration for network-level blocking",
    ],
    competitorStrengths: [
      "Deep Microsoft 365 integration (Exchange, SharePoint, Teams, OneDrive)",
      "Endpoint DLP beyond just browsers",
      "Information protection labels and sensitivity types",
      "Part of a broader compliance suite (eDiscovery, Audit, etc.)",
    ],
    verdict:
      "If your team only uses Copilot and is fully in the Microsoft ecosystem, Purview makes sense. If your team uses ChatGPT, Claude, or Gemini — even alongside Copilot — TeamPrompt fills the gap Purview can't.",
  },
  {
    slug: "chatgpt-teams",
    competitor: "ChatGPT Team Plan",
    title: "TeamPrompt vs ChatGPT Teams",
    metaTitle: "TeamPrompt vs ChatGPT Teams — What OpenAI's Team Plan Is Missing",
    metaDescription:
      "ChatGPT Teams gives you shared workspaces but no DLP, no compliance packs, and no audit trails. See what TeamPrompt adds for $8/user/month on top of any AI tool.",
    keywords: ["ChatGPT Teams alternative", "ChatGPT Team plan DLP", "ChatGPT enterprise security", "AI team management"],
    intro:
      "ChatGPT's Team plan ($25-30/user/month) gives you a shared workspace and admin controls. But it doesn't include DLP scanning, compliance frameworks, or a shared prompt library with approval workflows. TeamPrompt adds all three for $8/user/month — and works across ChatGPT, Claude, Gemini, Copilot, and Perplexity.",
    features: [
      { feature: "DLP scanning", teamPrompt: true, competitor: false },
      { feature: "Shared prompt library", teamPrompt: "With approvals + templates", competitor: "Basic workspace sharing" },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: false },
      { feature: "Audit trail", teamPrompt: "Full activity log + export", competitor: "Basic admin log" },
      { feature: "Works with Claude", teamPrompt: true, competitor: false },
      { feature: "Works with Gemini", teamPrompt: true, competitor: false },
      { feature: "Auto-redaction", teamPrompt: true, competitor: false },
      { feature: "Risk scoring", teamPrompt: true, competitor: false },
      { feature: "Network-level tool blocking", teamPrompt: "Cloudflare Gateway", competitor: false },
      { feature: "GPT-4 access included", teamPrompt: false, competitor: true },
      { feature: "Custom GPTs", teamPrompt: false, competitor: true },
      { feature: "Price", teamPrompt: "$8/user/month", competitor: "$25-30/user/month" },
    ],
    teamPromptStrengths: [
      "DLP scanning that ChatGPT simply doesn't have",
      "Works across ALL AI tools — not locked to one vendor",
      "19 compliance frameworks vs zero",
      "Fraction of the cost ($8 vs $25-30/user/month)",
      "Add on top of any existing AI tool subscription",
    ],
    competitorStrengths: [
      "GPT-4 access is included in the price",
      "Native ChatGPT features (Custom GPTs, DALL-E, etc.)",
      "No additional tool to install",
    ],
    verdict:
      "ChatGPT Teams is an AI tool. TeamPrompt is a security and governance layer that sits on top of it. They're complementary — use ChatGPT Teams for the AI, and TeamPrompt for the DLP, compliance, and prompt governance.",
  },
  {
    slug: "notion",
    competitor: "Notion",
    title: "TeamPrompt vs Notion for Prompt Management",
    metaTitle: "TeamPrompt vs Notion for AI Prompts — Purpose-Built vs General Docs",
    metaDescription:
      "Stop storing AI prompts in Notion docs. TeamPrompt gives you one-click insert into ChatGPT/Claude, DLP scanning, approval workflows, and usage analytics — built specifically for prompt management.",
    keywords: ["Notion for AI prompts", "prompt management Notion alternative", "best prompt library tool", "Notion vs prompt manager"],
    intro:
      "Many teams store prompts in Notion docs or databases. It works — until you need DLP scanning, approval workflows, one-click insertion into AI tools, or compliance audit trails. TeamPrompt is purpose-built for prompt management with security features that Notion can't provide.",
    features: [
      { feature: "One-click insert into AI tools", teamPrompt: "Via browser extension", competitor: "Copy/paste manually" },
      { feature: "DLP scanning", teamPrompt: true, competitor: false },
      { feature: "Approval workflows", teamPrompt: true, competitor: false },
      { feature: "Usage analytics", teamPrompt: "Per-prompt tracking", competitor: false },
      { feature: "Template variables", teamPrompt: "Fill-in-the-blank", competitor: "Manual" },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: false },
      { feature: "General-purpose docs", teamPrompt: false, competitor: true },
      { feature: "Databases + wikis", teamPrompt: false, competitor: true },
      { feature: "Version history", teamPrompt: true, competitor: true },
      { feature: "Star ratings", teamPrompt: true, competitor: false },
      { feature: "Import/export packs", teamPrompt: "JSON packs", competitor: "Markdown/CSV" },
    ],
    teamPromptStrengths: [
      "One-click prompt insertion directly into ChatGPT, Claude, Gemini",
      "DLP scanning on every prompt — Notion has zero security scanning",
      "Approval workflows ensure prompt quality before team-wide use",
      "Usage analytics show which prompts actually get used",
      "Purpose-built — not a general doc tool repurposed for prompts",
    ],
    competitorStrengths: [
      "Notion is a full workspace (not just prompts)",
      "Databases, wikis, project management in one tool",
      "More flexible for non-prompt content",
      "Your team may already use it",
    ],
    verdict:
      "If prompts are a small part of your workflow and you just need a place to store them, Notion is fine. If prompt quality, security, and compliance matter — or if your team uses prompts daily across multiple AI tools — TeamPrompt is the right tool.",
  },
  {
    slug: "best-ai-dlp-tools",
    competitor: "",
    title: "Best AI DLP Tools for Teams in 2026",
    metaTitle: "Best AI DLP Tools 2026 — Data Loss Prevention for ChatGPT, Claude & Gemini",
    metaDescription:
      "Compare the top AI data loss prevention tools for 2026. TeamPrompt, Nightfall AI, Microsoft Purview, Cyberhaven, and more — features, pricing, and which is right for your team.",
    keywords: ["best AI DLP tools", "AI data loss prevention tools", "DLP for ChatGPT", "AI security tools 2026"],
    intro:
      "As AI adoption accelerates, teams need data loss prevention specifically designed for AI interactions. Traditional DLP tools weren't built for the unique challenges of ChatGPT, Claude, and Gemini usage. Here's our analysis of the best AI DLP tools available in 2026.",
    features: [
      { feature: "Browser-level AI DLP", teamPrompt: true, competitor: false },
      { feature: "Network-level blocking", teamPrompt: "Cloudflare Gateway", competitor: "Varies" },
      { feature: "Prompt management", teamPrompt: true, competitor: false },
      { feature: "Self-serve setup", teamPrompt: true, competitor: "Varies" },
      { feature: "Free tier", teamPrompt: true, competitor: "Rare" },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: "Varies" },
      { feature: "LLM classification", teamPrompt: true, competitor: "Some" },
    ],
    teamPromptStrengths: [
      "Only tool combining DLP + prompt management in one platform",
      "Two-layer protection: browser extension + Cloudflare DNS blocking",
      "Self-serve — no enterprise sales cycle required",
      "Free tier lets teams start immediately",
      "19 pre-built compliance frameworks",
    ],
    competitorStrengths: [],
    verdict:
      "For teams that need AI-specific DLP with prompt governance, TeamPrompt offers the most complete solution at the most accessible price point. Enterprise teams needing broader SaaS DLP should evaluate Nightfall or Cyberhaven alongside TeamPrompt.",
  },
  {
    slug: "polymer",
    competitor: "Polymer",
    title: "TeamPrompt vs Polymer",
    metaTitle: "TeamPrompt vs Polymer — Browser DLP + Prompt Library vs SaaS DLP",
    metaDescription:
      "Compare TeamPrompt and Polymer for AI data loss prevention. Browser-extension DLP for ChatGPT/Claude/Gemini with a shared prompt library vs Polymer's SaaS DLP. Features, pricing, free tier.",
    keywords: ["TeamPrompt vs Polymer", "Polymer alternative", "AI DLP comparison", "browser DLP vs SaaS DLP"],
    intro:
      "Polymer is a SaaS DLP platform that scans data across collaboration tools like Slack, Google Drive, and Microsoft 365 via API integrations. TeamPrompt takes a different approach — a browser extension that scans prompts in real time before they reach AI tools, combined with a shared prompt library and 19 compliance frameworks. Both protect sensitive data, but their threat models are different.",
    features: [
      { feature: "ChatGPT DLP", teamPrompt: "Real-time in browser", competitor: "API-based (limited)" },
      { feature: "Claude DLP", teamPrompt: true, competitor: "Limited" },
      { feature: "Gemini DLP", teamPrompt: true, competitor: "Limited" },
      { feature: "Copilot DLP", teamPrompt: true, competitor: "M365 integration" },
      { feature: "Slack DLP", teamPrompt: "Notifications only", competitor: true },
      { feature: "Google Drive DLP", teamPrompt: false, competitor: true },
      { feature: "Microsoft 365 DLP", teamPrompt: false, competitor: true },
      { feature: "Prompt management", teamPrompt: true, competitor: false },
      { feature: "Shared prompt library", teamPrompt: true, competitor: false },
      { feature: "Network-level AI blocking", teamPrompt: "Cloudflare Gateway", competitor: false },
      { feature: "Browser extension", teamPrompt: "Chrome, Firefox, Edge", competitor: false },
      { feature: "Setup time", teamPrompt: "Under 5 minutes", competitor: "1-2 weeks" },
      { feature: "Free tier", teamPrompt: "Up to 3 users", competitor: false },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: "Custom rules" },
      { feature: "Real-time prevention", teamPrompt: "Blocks before send", competitor: "Detects after" },
    ],
    teamPromptStrengths: [
      "Real-time prevention — blocks data BEFORE it leaves the browser, not after",
      "Built-in prompt management — no competitor in the DLP space offers this",
      "Network-level defense via Cloudflare Gateway in addition to the browser",
      "Free tier removes the procurement barrier — teams can pilot immediately",
      "Self-serve setup vs Polymer's enterprise onboarding",
    ],
    competitorStrengths: [
      "Broader SaaS coverage — Slack, Drive, M365, GitHub as primary targets",
      "API-first integration model fits teams without browser-extension policies",
      "Mature data classification engine for non-AI workflows",
      "Established enterprise DLP partnerships",
    ],
    verdict:
      "Choose TeamPrompt if your primary concern is AI tool security (ChatGPT, Claude, Gemini) and you want prompt governance in the same platform. Choose Polymer if your DLP need is mostly Slack, Google Drive, and Microsoft 365 — and AI tools are a smaller piece of the surface area.",
  },
  {
    slug: "prompt-security",
    competitor: "Prompt Security",
    title: "TeamPrompt vs Prompt Security",
    metaTitle: "TeamPrompt vs Prompt Security — Self-Serve Browser DLP vs Enterprise Proxy",
    metaDescription:
      "Compare TeamPrompt and Prompt Security. Browser-extension DLP with a free tier vs enterprise reverse-proxy DLP. Architecture, prompt management, setup time, and pricing for AI security teams.",
    keywords: ["TeamPrompt vs Prompt Security", "Prompt Security alternative", "AI DLP comparison", "prompt firewall comparison"],
    intro:
      "Prompt Security offers an enterprise-grade reverse-proxy approach to AI data protection — all AI traffic routes through their gateway, where it's inspected, redacted, and logged. TeamPrompt takes a lighter-weight path: a browser extension that scans content in the page before it's sent, plus a shared prompt library. Both prevent data leaks, but the architecture, setup, and ongoing operations are very different.",
    features: [
      { feature: "Architecture", teamPrompt: "Browser extension + Cloudflare DNS", competitor: "Reverse proxy gateway" },
      { feature: "ChatGPT DLP", teamPrompt: true, competitor: true },
      { feature: "Claude DLP", teamPrompt: true, competitor: true },
      { feature: "Gemini DLP", teamPrompt: true, competitor: true },
      { feature: "Copilot DLP", teamPrompt: true, competitor: true },
      { feature: "Prompt injection defense", teamPrompt: "Detection + scoring", competitor: "Inline blocking" },
      { feature: "Prompt management library", teamPrompt: true, competitor: false },
      { feature: "Setup time", teamPrompt: "Under 5 minutes", competitor: "Weeks (DNS / proxy config)" },
      { feature: "Browser extension required", teamPrompt: true, competitor: false },
      { feature: "Network-only enforcement", teamPrompt: "Cloudflare Gateway", competitor: true },
      { feature: "Free tier", teamPrompt: "Up to 3 users", competitor: false },
      { feature: "Self-serve onboarding", teamPrompt: true, competitor: "Enterprise sales" },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: "Custom + frameworks" },
      { feature: "SOC 2 / HIPAA support", teamPrompt: true, competitor: true },
    ],
    teamPromptStrengths: [
      "Minutes to deploy vs weeks for proxy-based vendors",
      "Free tier for teams under 3 users — no procurement cycle",
      "Combined prompt management + DLP in one platform",
      "Browser-first approach works on BYOD / contractor laptops without DNS access",
      "Cloudflare Gateway available when network-level blocking is needed",
    ],
    competitorStrengths: [
      "Reverse-proxy architecture enforces DLP without requiring a browser extension",
      "Stronger inline prompt-injection blocking (catches more variants)",
      "Better fit for organizations with strict endpoint policies",
      "More mature enterprise compliance certifications",
    ],
    verdict:
      "Choose TeamPrompt if you want fast, self-serve deployment, a free tier to pilot, and a built-in prompt library. Choose Prompt Security if you need a proxy-level enforcement model and can absorb the multi-week deployment that comes with it.",
  },
  {
    slug: "lakera",
    competitor: "Lakera",
    title: "TeamPrompt vs Lakera",
    metaTitle: "TeamPrompt vs Lakera Guard — DLP for Teams vs API Security for Builders",
    metaDescription:
      "Compare TeamPrompt and Lakera Guard. Browser DLP + prompt library for teams using ChatGPT, Claude, Gemini vs Lakera's API-level prompt injection defense for AI app developers.",
    keywords: ["TeamPrompt vs Lakera", "Lakera Guard alternative", "AI DLP for teams", "prompt injection defense"],
    intro:
      "Lakera Guard is an API-level security layer for AI applications — developers wrap their LLM calls in Lakera's API to filter prompt injections, PII, and toxicity before content reaches the model. TeamPrompt solves a different problem: protecting employees who use commercial AI tools (ChatGPT, Claude, Gemini) from leaking sensitive data into them. These are complementary, not competitive, but teams often evaluate both.",
    features: [
      { feature: "Protects employees using ChatGPT/Claude/Gemini", teamPrompt: true, competitor: false },
      { feature: "Protects your own LLM-powered app", teamPrompt: false, competitor: true },
      { feature: "Browser extension DLP", teamPrompt: true, competitor: false },
      { feature: "API for app-level filtering", teamPrompt: false, competitor: true },
      { feature: "Prompt injection detection", teamPrompt: "In employee prompts", competitor: "In your app's inputs" },
      { feature: "PII detection", teamPrompt: true, competitor: true },
      { feature: "Prompt management library", teamPrompt: true, competitor: false },
      { feature: "Compliance packs", teamPrompt: "19 frameworks", competitor: "Custom" },
      { feature: "Setup", teamPrompt: "Install extension", competitor: "Wrap LLM API calls" },
      { feature: "Free tier", teamPrompt: "Up to 3 users", competitor: "API trial credits" },
      { feature: "Multi-tool coverage", teamPrompt: "ChatGPT, Claude, Gemini, Copilot, Perplexity", competitor: "Any LLM API" },
      { feature: "Audit logs", teamPrompt: true, competitor: true },
    ],
    teamPromptStrengths: [
      "Right tool if employees use commercial AI tools — Lakera doesn't protect this layer",
      "Includes prompt management, which Lakera doesn't address",
      "Browser-side enforcement means it works on any device or AI tool",
      "19 pre-built compliance frameworks vs custom Lakera rules",
      "Free tier removes the trial-credit ceiling",
    ],
    competitorStrengths: [
      "Right tool if you're building an AI-powered product — TeamPrompt doesn't protect that layer",
      "Industry-leading prompt-injection research and threat intelligence",
      "API-first model integrates cleanly into AI app pipelines",
      "Strong adoption among AI app builders and ML teams",
    ],
    verdict:
      "These tools solve different problems. Use TeamPrompt to protect your team's everyday AI usage (employees pasting into ChatGPT). Use Lakera to protect the LLM-powered features in your own product. Many organizations run both.",
  },
];

export function getComparisonBySlug(slug: string): ComparisonPage | undefined {
  return COMPARISON_PAGES.find((p) => p.slug === slug);
}
