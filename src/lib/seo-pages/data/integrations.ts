import type { SeoPageData } from "../types";

export const integrationPages: SeoPageData[] = [
  {
    slug: "chatgpt",
    category: "integration",
    meta: {
      title: "ChatGPT Prompt Manager — Browser Extension for ChatGPT",
      description:
        "Manage and insert team prompts directly into ChatGPT. Browse your shared library, use templates, and scan for sensitive data — all without leaving ChatGPT.",
      keywords: ["ChatGPT extension", "ChatGPT prompt manager", "ChatGPT browser extension", "ChatGPT prompts"],
    },
    hero: {
      headline: "Your prompt library, inside ChatGPT",
      subtitle:
        "Browse, search, and insert team prompts directly into ChatGPT. No tab switching, no copy-paste. Just click and go.",
      badges: ["ChatGPT", "GPT-4", "GPT-4o"],
    },
    features: {
      sectionLabel: "ChatGPT Integration",
      heading: "Built for ChatGPT power users",
      items: [
        { icon: "Zap", title: "One-click insert", description: "Click any prompt in your library and it's instantly pasted into the ChatGPT input. Works with GPT-4, GPT-4o, and all models." },
        { icon: "Archive", title: "Prompt library overlay", description: "Access your full prompt library from a popup or side panel without leaving the ChatGPT tab." },
        { icon: "BookOpen", title: "Template variables", description: "Fill in dynamic fields before inserting. Same template, different context every time." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Every prompt is scanned for sensitive data before it reaches OpenAI's servers. Catch SSNs, API keys, and more." },
        { icon: "BarChart3", title: "Usage tracking", description: "See which prompts your team uses in ChatGPT. Track frequency, users, and trends." },
        { icon: "Users", title: "Team sharing", description: "Share your best ChatGPT prompts across the team. Everyone gets the latest version instantly." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with ChatGPT",
      items: [
        "Insert team prompts into ChatGPT without copy-paste",
        "Protect sensitive data from reaching OpenAI with DLP scanning",
        "Share proven ChatGPT prompts across your organization",
        "Use template variables for consistent, customizable prompts",
        "Track which ChatGPT prompts deliver the best results",
        "Works with ChatGPT Plus, Team, and Enterprise plans",
      ],
    },
    faqs: [
      { question: "Does this work with ChatGPT Plus and Enterprise?", answer: "Yes. The extension works with all ChatGPT plans — Free, Plus, Team, and Enterprise. It works with every model including GPT-4o." },
      { question: "Does it read my ChatGPT conversations?", answer: "No. The extension only interacts with the input field to insert prompts and scan outbound text. It does not read or store your conversation history." },
      { question: "Is it approved by OpenAI?", answer: "TeamPrompt is an independent browser extension. It works alongside ChatGPT in your browser without modifying the ChatGPT service itself." },
    ],
    cta: {
      headline: "Make ChatGPT work",
      gradientText: "for your whole team.",
      subtitle: "Install the extension and start inserting prompts in seconds.",
    },
  },
  {
    slug: "claude",
    category: "integration",
    meta: {
      title: "Claude Prompt Manager — Browser Extension for Anthropic's Claude",
      description:
        "Manage and insert team prompts directly into Claude.ai. Browse your shared library, use templates, and scan for sensitive data inside Claude.",
      keywords: ["Claude extension", "Claude prompt manager", "Anthropic Claude extension", "Claude AI prompts"],
    },
    hero: {
      headline: "Your prompt library, inside Claude",
      subtitle:
        "Browse, search, and insert team prompts directly into Claude.ai. Templates, DLP scanning, and team sharing — all built in.",
      badges: ["Claude", "Claude 3.5", "Anthropic"],
    },
    features: {
      sectionLabel: "Claude Integration",
      heading: "Designed for Claude users",
      items: [
        { icon: "Zap", title: "One-click insert", description: "Click any prompt and it's pasted into Claude's input field. Works with all Claude models." },
        { icon: "Archive", title: "Side panel access", description: "Open TeamPrompt in the browser side panel for persistent access while chatting with Claude." },
        { icon: "BookOpen", title: "Template variables", description: "Fill in dynamic fields before inserting into Claude. Consistent prompts, customized every time." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Scan prompts for sensitive data before they reach Anthropic's servers. Protect PHI, PII, and credentials." },
        { icon: "BarChart3", title: "Usage analytics", description: "Track which prompts your team uses with Claude. Identify top performers." },
        { icon: "Users", title: "Team collaboration", description: "Share Claude-optimized prompts across your organization with team categories." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with Claude",
      items: [
        "Insert prompts into Claude without copy-paste or tab switching",
        "Protect sensitive data from reaching Anthropic's models",
        "Share Claude-specific prompts across your team",
        "Use the side panel for uninterrupted workflow",
        "Template variables for consistent, customizable prompts",
        "Track usage and identify your team's best Claude prompts",
      ],
    },
    faqs: [
      { question: "Does this work with Claude Pro and Team?", answer: "Yes. The extension works with all Claude plans — Free, Pro, and Team. It works with every model including Claude 3.5 Sonnet." },
      { question: "Can I use the side panel with Claude?", answer: "Yes. Open TeamPrompt in the browser side panel for persistent, side-by-side access while chatting with Claude." },
    ],
    cta: {
      headline: "Bring your prompt library",
      gradientText: "to Claude.",
      subtitle: "Install the extension and start inserting prompts today.",
    },
  },
  {
    slug: "gemini",
    category: "integration",
    meta: {
      title: "Gemini Prompt Manager — Browser Extension for Google Gemini",
      description:
        "Manage and insert team prompts directly into Google Gemini. Browse your shared library, use templates, and scan for sensitive data.",
      keywords: ["Gemini extension", "Google Gemini prompts", "Gemini prompt manager", "Gemini AI extension"],
    },
    hero: {
      headline: "Your prompt library, inside Gemini",
      subtitle:
        "Browse, search, and insert team prompts directly into Google Gemini. Same library, same templates, same guardrails.",
      badges: ["Gemini", "Gemini Advanced", "Google"],
    },
    features: {
      sectionLabel: "Gemini Integration",
      heading: "Works seamlessly with Gemini",
      items: [
        { icon: "Zap", title: "One-click insert", description: "Click any prompt to paste it into Gemini's input. Works with Gemini and Gemini Advanced." },
        { icon: "Archive", title: "Full library access", description: "Your entire prompt library is available via popup or side panel while using Gemini." },
        { icon: "BookOpen", title: "Template variables", description: "Dynamic templates work the same in Gemini as everywhere else. Fill in fields and insert." },
        { icon: "ShieldAlert", title: "DLP protection", description: "Scan outbound prompts for sensitive data before they reach Google's AI. Same guardrails, every tool." },
        { icon: "Users", title: "Cross-tool sharing", description: "Prompts shared with your team work in Gemini, ChatGPT, Claude, and all supported tools." },
        { icon: "BarChart3", title: "Unified analytics", description: "Track Gemini usage alongside all other AI tools in one dashboard." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with Gemini",
      items: [
        "One prompt library that works in Gemini and every other AI tool",
        "Protect sensitive data from reaching Google's models",
        "Same templates and guardrails across all AI tools your team uses",
        "Track Gemini usage alongside ChatGPT and Claude",
        "No need to maintain separate prompts for different tools",
        "Works with Gemini and Gemini Advanced",
      ],
    },
    faqs: [
      { question: "Does this work with Gemini Advanced?", answer: "Yes. The extension works with both Gemini and Gemini Advanced, including all available models." },
      { question: "Can I use the same prompts in Gemini and ChatGPT?", answer: "Yes. Your prompt library is unified — the same prompts work across all supported AI tools." },
    ],
    cta: {
      headline: "One prompt library,",
      gradientText: "every AI tool.",
      subtitle: "Install once and your library works in Gemini, ChatGPT, Claude, and more.",
    },
  },
  {
    slug: "copilot",
    category: "integration",
    meta: {
      title: "Copilot Prompt Manager — Browser Extension for Microsoft Copilot",
      description:
        "Manage and insert team prompts directly into Microsoft Copilot. Browse your shared library, use templates, and scan for sensitive data.",
      keywords: ["Copilot extension", "Microsoft Copilot prompts", "Copilot prompt manager", "Copilot AI extension"],
    },
    hero: {
      headline: "Your prompt library, inside Copilot",
      subtitle:
        "Browse, search, and insert team prompts directly into Microsoft Copilot. Enterprise-ready with DLP scanning and audit trails.",
      badges: ["Microsoft Copilot", "Enterprise-ready"],
    },
    features: {
      sectionLabel: "Copilot Integration",
      heading: "Enterprise-grade Copilot management",
      items: [
        { icon: "Zap", title: "One-click insert", description: "Insert team prompts into Microsoft Copilot with a single click. No copy-paste needed." },
        { icon: "Archive", title: "Library access", description: "Access your full prompt library from the popup or side panel while using Copilot." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Scan prompts for sensitive data before they reach Microsoft's AI. Enterprise-grade protection." },
        { icon: "Lock", title: "MDM deployment", description: "Deploy via Microsoft Intune, Google Admin Console, or any MDM. Force-install across your organization." },
        { icon: "Eye", title: "Audit trails", description: "Every Copilot interaction is logged. Export audit data for compliance reporting." },
        { icon: "Users", title: "Team management", description: "Role-based access control for prompts, guardrails, and analytics." },
      ],
    },
    benefits: {
      heading: "Why enterprises use TeamPrompt with Copilot",
      items: [
        "Managed deployment via Intune or any MDM platform",
        "DLP scanning before prompts reach Microsoft's AI",
        "Complete audit trails for compliance requirements",
        "Unified prompt library across Copilot and other AI tools",
        "Role-based access control for enterprise teams",
        "Force-install the extension across your organization",
      ],
    },
    faqs: [
      { question: "Can I deploy this via Microsoft Intune?", answer: "Yes. TeamPrompt supports managed deployment through Microsoft Intune, Google Admin Console, and any MDM that supports Chrome/Edge extension policies." },
      { question: "Does it work with Microsoft 365 Copilot?", answer: "TeamPrompt currently works with the browser-based Microsoft Copilot at copilot.microsoft.com. Microsoft 365 Copilot integration within Office apps is on our roadmap." },
    ],
    cta: {
      headline: "Manage AI prompts",
      gradientText: "across your enterprise.",
      subtitle: "Deploy with your MDM. Full audit trails from day one.",
    },
  },
  {
    slug: "perplexity",
    category: "integration",
    meta: {
      title: "Perplexity Prompt Manager — Browser Extension for Perplexity AI",
      description:
        "Manage and insert team prompts directly into Perplexity AI. Browse your shared library, use templates, and scan for sensitive data.",
      keywords: ["Perplexity extension", "Perplexity AI prompts", "Perplexity prompt manager"],
    },
    hero: {
      headline: "Your prompt library, inside Perplexity",
      subtitle:
        "Browse, search, and insert team prompts directly into Perplexity AI. Research-ready prompts for your whole team.",
      badges: ["Perplexity", "Perplexity Pro"],
    },
    features: {
      sectionLabel: "Perplexity Integration",
      heading: "Supercharge Perplexity research",
      items: [
        { icon: "Zap", title: "One-click insert", description: "Insert research prompts into Perplexity instantly. No copy-paste needed." },
        { icon: "Archive", title: "Research prompts", description: "Build a library of research-focused prompts for competitive analysis, market research, and more." },
        { icon: "BookOpen", title: "Template variables", description: "Research templates with dynamic fields — fill in the topic, company, or industry and go." },
        { icon: "ShieldAlert", title: "DLP scanning", description: "Ensure sensitive data doesn't leak into research queries. Same guardrails as every other tool." },
        { icon: "Users", title: "Team sharing", description: "Share research prompts across your team. Everyone benefits from the best queries." },
        { icon: "BarChart3", title: "Unified analytics", description: "Track Perplexity usage alongside all your other AI tools in one place." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with Perplexity",
      items: [
        "Standardize research queries across your team",
        "Insert research prompts without leaving Perplexity",
        "Protect sensitive data in research queries",
        "One library that works in Perplexity and every other AI tool",
        "Track which research prompts get the best results",
        "Works with Perplexity Free and Pro plans",
      ],
    },
    faqs: [
      { question: "Does this work with Perplexity Pro?", answer: "Yes. The extension works with both Perplexity Free and Pro plans, including all available models and search modes." },
      { question: "Can I share research prompts with my team?", answer: "Yes. Create a category of research-focused prompts and share it with your team. Everyone gets the same proven queries." },
    ],
    cta: {
      headline: "Better research starts with",
      gradientText: "better prompts.",
      subtitle: "Install the extension and access your library in Perplexity today.",
    },
  },
];
