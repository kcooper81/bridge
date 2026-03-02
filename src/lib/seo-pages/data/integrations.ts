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
  {
    slug: "perplexity-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + Perplexity AI Integration — Advanced Research Workflows",
      description:
        "Supercharge your Perplexity AI research with TeamPrompt's advanced integration. Build structured research workflows, share curated prompt collections, and enforce data governance across every query your team runs in Perplexity.",
      keywords: ["Perplexity AI integration", "Perplexity research prompts", "Perplexity team workflows", "Perplexity AI prompt management", "AI research governance"],
    },
    hero: {
      headline: "Advanced research workflows for Perplexity AI",
      subtitle:
        "Go beyond basic prompt insertion. TeamPrompt's deep integration with Perplexity AI lets you build structured research workflows, chain multi-step queries, and ensure every team member follows proven research methodologies — all while keeping sensitive data out of your searches.",
      badges: ["Perplexity", "Perplexity Pro", "Advanced Workflows"],
    },
    features: {
      sectionLabel: "Perplexity Deep Integration",
      heading: "Research workflows that scale with your team",
      items: [
        { icon: "BookOpen", title: "Multi-step research templates", description: "Build structured research workflows that guide your team through multi-step investigations in Perplexity, from initial queries to follow-up deep dives and synthesis." },
        { icon: "Archive", title: "Curated research collections", description: "Organize prompts into research-specific collections such as competitive analysis, market sizing, technology evaluation, and academic literature review for quick access in Perplexity." },
        { icon: "Globe", title: "Source-aware prompt design", description: "Create prompts optimized for Perplexity's source-citing capabilities, ensuring your team gets verifiable, well-sourced answers every time they run a research query." },
        { icon: "ShieldCheck", title: "Research governance policies", description: "Define what types of queries are allowed and flag sensitive topics automatically before they reach Perplexity, protecting proprietary information during competitive research." },
        { icon: "BarChart3", title: "Research analytics dashboard", description: "Track research patterns across your team to identify knowledge gaps, measure research productivity, and understand which prompt methodologies yield the highest-quality results." },
        { icon: "Users", title: "Cross-team research sharing", description: "Share proven research prompts across departments so marketing, product, and engineering teams all benefit from each other's best Perplexity query techniques." },
      ],
    },
    benefits: {
      heading: "Why research teams choose TeamPrompt with Perplexity",
      items: [
        "Build multi-step research workflows that standardize how your team investigates topics",
        "Curate domain-specific prompt collections for competitive analysis and market research",
        "Enforce data governance policies to keep proprietary information out of research queries",
        "Track research productivity and identify which query patterns produce the best results",
        "Share proven research methodologies across marketing, product, and engineering teams",
        "Optimize prompts for Perplexity's unique source-citation and real-time search capabilities",
      ],
    },
    faqs: [
      { question: "How is this different from the basic Perplexity integration?", answer: "The basic integration provides one-click prompt insertion. This advanced integration adds multi-step research workflows, curated research collections, governance policies, and research-specific analytics designed for teams that rely heavily on Perplexity for systematic research." },
      { question: "Can I create research workflows that span multiple queries?", answer: "Yes. TeamPrompt lets you build multi-step templates that guide researchers through a structured process — starting with broad exploration, narrowing to specific questions, and concluding with synthesis prompts." },
      { question: "Does research governance slow down my team?", answer: "No. Governance rules run automatically in the background. Your team researches at full speed while TeamPrompt silently flags sensitive terms, blocks restricted queries, and logs everything for compliance." },
    ],
    cta: {
      headline: "Transform your team's research with",
      gradientText: "structured AI workflows.",
      subtitle: "Install TeamPrompt and bring governed, scalable research workflows to Perplexity AI.",
    },
  },
  {
    slug: "copilot-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + Microsoft Copilot Integration — Enterprise Prompt Governance",
      description:
        "Bring enterprise-grade prompt management to Microsoft Copilot. TeamPrompt provides centralized governance, managed deployment via Intune, DLP scanning, and comprehensive audit trails for every Copilot interaction across your organization.",
      keywords: ["Microsoft Copilot integration", "Copilot enterprise prompts", "Copilot prompt governance", "Copilot MDM deployment", "enterprise AI management"],
    },
    hero: {
      headline: "Enterprise prompt governance for Microsoft Copilot",
      subtitle:
        "TeamPrompt transforms Microsoft Copilot from a standalone AI assistant into a governed enterprise tool. Centralize prompt creation, enforce data loss prevention policies, deploy via Intune, and maintain complete audit trails — giving IT and compliance teams the visibility they need while empowering employees to use Copilot effectively.",
      badges: ["Microsoft Copilot", "Intune MDM", "Enterprise Governance"],
    },
    features: {
      sectionLabel: "Copilot Enterprise Integration",
      heading: "Enterprise-grade governance for every Copilot interaction",
      items: [
        { icon: "Lock", title: "Centralized prompt governance", description: "IT administrators define approved prompt templates and guardrails centrally, ensuring every employee interacts with Microsoft Copilot using consistent, compliant messaging." },
        { icon: "Shield", title: "Advanced DLP enforcement", description: "Multi-layered data loss prevention scanning catches PII, PHI, financial data, and proprietary information before it ever reaches Microsoft's Copilot servers." },
        { icon: "Key", title: "Managed MDM deployment", description: "Deploy TeamPrompt across your entire organization through Microsoft Intune, SCCM, or Google Admin Console with pre-configured policies and zero end-user friction." },
        { icon: "Eye", title: "Comprehensive audit logging", description: "Every Copilot interaction is logged with timestamps, user identities, prompt content, and DLP scan results for complete regulatory compliance and internal auditing." },
        { icon: "Users", title: "Role-based access control", description: "Define granular permissions so different departments, roles, and seniority levels have access to appropriate prompt libraries and governance policies within Copilot." },
        { icon: "BarChart3", title: "Enterprise usage intelligence", description: "Detailed dashboards show Copilot adoption rates, prompt effectiveness, DLP interception rates, and department-level usage trends to inform your AI strategy." },
      ],
    },
    benefits: {
      heading: "Why enterprises trust TeamPrompt for Copilot governance",
      items: [
        "Deploy across thousands of users via Microsoft Intune with zero manual configuration",
        "Enforce multi-layered DLP policies that catch sensitive data before it reaches Copilot",
        "Maintain complete audit trails for SOC 2, HIPAA, and internal compliance requirements",
        "Centralize prompt governance so IT controls what employees can send to Copilot",
        "Role-based access ensures each department has the right prompts and guardrails",
        "Usage intelligence helps leadership measure ROI and optimize AI investment",
      ],
    },
    faqs: [
      { question: "How does the Intune deployment work?", answer: "TeamPrompt provides a pre-built Intune configuration package with policy templates. IT admins import the configuration, customize governance rules, and push the extension to all managed devices — no end-user action required." },
      { question: "What compliance standards does the audit trail support?", answer: "The audit trail captures every interaction with timestamps, user identity, and full prompt content. This data can be exported for SOC 2, HIPAA, GDPR, and other compliance frameworks." },
      { question: "Can different departments have different governance policies?", answer: "Yes. Role-based access control lets you create department-specific prompt libraries and DLP policies. Legal might have stricter data scanning than marketing, for example." },
      { question: "Does this work with Microsoft 365 Copilot in Office apps?", answer: "TeamPrompt currently integrates with the browser-based Microsoft Copilot at copilot.microsoft.com. Support for Microsoft 365 Copilot within Office applications is on our product roadmap." },
    ],
    cta: {
      headline: "Govern Microsoft Copilot",
      gradientText: "across your enterprise.",
      subtitle: "Deploy via Intune. Enforce DLP. Audit everything. Enterprise AI governance starts here.",
    },
  },
  {
    slug: "deepseek-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + DeepSeek Integration — Managed Prompts for DeepSeek AI",
      description:
        "Use TeamPrompt with DeepSeek for coding assistance, reasoning tasks, and technical problem-solving. Manage prompts, enforce data governance, and share best practices across your development team.",
      keywords: ["DeepSeek integration", "DeepSeek prompts", "DeepSeek coding assistant", "DeepSeek AI prompt manager", "DeepSeek team prompts"],
    },
    hero: {
      headline: "Managed prompts for DeepSeek AI",
      subtitle:
        "DeepSeek excels at coding and complex reasoning tasks. TeamPrompt makes it even more powerful by giving your development team a shared library of proven coding prompts, automated data governance to protect proprietary code, and analytics to track which prompt patterns produce the best technical outputs.",
      badges: ["DeepSeek", "DeepSeek Coder", "DeepSeek Reasoner"],
    },
    features: {
      sectionLabel: "DeepSeek Integration",
      heading: "Purpose-built for developers using DeepSeek",
      items: [
        { icon: "Braces", title: "Code-aware prompt templates", description: "Build prompt templates specifically designed for DeepSeek's coding capabilities, with placeholders for language, framework, function signatures, and code context." },
        { icon: "GitBranch", title: "Versioned prompt workflows", description: "Track prompt iterations over time so your team can see how coding prompts evolved, compare output quality, and roll back to earlier versions when needed." },
        { icon: "ShieldAlert", title: "Source code DLP scanning", description: "Automatically detect and redact proprietary source code, internal API endpoints, database credentials, and secret keys before they reach DeepSeek's servers." },
        { icon: "BookOpen", title: "Reasoning chain templates", description: "Create structured prompts that leverage DeepSeek's chain-of-thought reasoning capabilities, guiding the model through complex multi-step technical problems." },
        { icon: "Users", title: "Developer team sharing", description: "Share battle-tested coding prompts across your engineering team so everyone benefits from proven patterns for debugging, code review, and architecture decisions." },
        { icon: "BarChart3", title: "Developer productivity analytics", description: "Measure which coding prompt patterns produce the best results, track adoption across your engineering team, and identify opportunities to improve developer workflows." },
      ],
    },
    benefits: {
      heading: "Why development teams use TeamPrompt with DeepSeek",
      items: [
        "Build code-aware prompt templates with placeholders for language, framework, and context",
        "Protect proprietary source code and credentials with DLP scanning before queries reach DeepSeek",
        "Share proven coding prompts for debugging, code review, and architecture decisions across your team",
        "Leverage DeepSeek's reasoning capabilities with structured chain-of-thought prompt templates",
        "Track which coding prompt patterns produce the highest-quality outputs for your specific tech stack",
        "Version and iterate on prompts so your team continuously improves its AI-assisted development workflow",
      ],
    },
    faqs: [
      { question: "Does TeamPrompt work with DeepSeek Coder specifically?", answer: "Yes. TeamPrompt works with DeepSeek's web interface including DeepSeek Chat and DeepSeek Coder. Your coding-specific prompts are inserted directly into the input field with one click." },
      { question: "How does source code DLP scanning work?", answer: "TeamPrompt scans outbound prompts for patterns that match proprietary code, internal URLs, API keys, database connection strings, and other sensitive developer data. Flagged content is highlighted before the prompt is sent." },
      { question: "Can I create prompts that use DeepSeek's chain-of-thought reasoning?", answer: "Absolutely. TeamPrompt's template system lets you build structured reasoning prompts with step-by-step instructions that guide DeepSeek through complex technical problems methodically." },
    ],
    cta: {
      headline: "Supercharge your dev team with",
      gradientText: "managed DeepSeek prompts.",
      subtitle: "Install TeamPrompt and give every developer access to your best coding prompts.",
    },
  },
  {
    slug: "mistral-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + Mistral AI Integration — Team Prompts for Mistral Le Chat",
      description:
        "Use TeamPrompt with Mistral AI's Le Chat interface. Manage team prompts, enforce data governance, and share best practices across your organization when using Mistral's powerful European AI models.",
      keywords: ["Mistral AI integration", "Mistral Le Chat prompts", "Mistral prompt manager", "Mistral AI team prompts", "European AI governance"],
    },
    hero: {
      headline: "Team prompt management for Mistral AI",
      subtitle:
        "Mistral AI delivers powerful, efficient models built in Europe. TeamPrompt enhances your Mistral experience with centralized prompt management, data governance that aligns with European regulatory standards, and team-wide sharing so every colleague benefits from your organization's best prompt engineering practices.",
      badges: ["Mistral AI", "Le Chat", "European AI"],
    },
    features: {
      sectionLabel: "Mistral AI Integration",
      heading: "Streamlined workflows for Mistral users",
      items: [
        { icon: "Zap", title: "Instant prompt insertion", description: "Insert prompts from your team library directly into Mistral's Le Chat interface with a single click, eliminating copy-paste and ensuring consistent prompt formatting." },
        { icon: "Globe", title: "Multilingual prompt support", description: "Create and manage prompt templates in multiple languages to leverage Mistral's strong multilingual capabilities across international teams and diverse markets." },
        { icon: "Shield", title: "EU-aligned data governance", description: "Enforce data governance policies that align with GDPR and European data protection standards, ensuring sensitive information never leaves your organization's control." },
        { icon: "BookOpen", title: "Model-optimized templates", description: "Build prompt templates specifically tuned for Mistral's model family, taking advantage of its unique strengths in reasoning, coding, and multilingual understanding." },
        { icon: "Users", title: "Organization-wide sharing", description: "Share proven Mistral prompts across departments and teams so everyone in your organization benefits from collectively refined prompt engineering knowledge." },
        { icon: "BarChart3", title: "Cross-model analytics", description: "Compare prompt performance across Mistral, ChatGPT, Claude, and other AI tools to understand where each model excels and allocate your team's AI usage accordingly." },
      ],
    },
    benefits: {
      heading: "Why teams choose TeamPrompt with Mistral AI",
      items: [
        "Insert team prompts into Mistral Le Chat without copy-paste or tab switching",
        "Leverage Mistral's multilingual strengths with prompt templates in multiple languages",
        "Enforce EU-aligned data governance policies across every Mistral interaction",
        "Optimize prompts specifically for Mistral's model architecture and capabilities",
        "Compare Mistral prompt performance against ChatGPT, Claude, and other AI tools",
        "Share proven prompts organization-wide so everyone benefits from collective expertise",
      ],
    },
    faqs: [
      { question: "Does TeamPrompt work with Mistral Le Chat?", answer: "Yes. TeamPrompt integrates directly with Mistral's Le Chat web interface. Your prompt library is accessible via popup or side panel while you chat with any Mistral model." },
      { question: "Can I create multilingual prompt templates?", answer: "Absolutely. TeamPrompt supports prompt templates in any language. You can create French, German, Spanish, or any other language variants to leverage Mistral's strong multilingual capabilities." },
      { question: "How does TeamPrompt help with GDPR compliance?", answer: "TeamPrompt's DLP scanning catches personal data, sensitive business information, and regulated content before it reaches Mistral's servers. Combined with audit logging, this helps your organization demonstrate GDPR-aligned AI usage practices." },
    ],
    cta: {
      headline: "Bring governed prompts to",
      gradientText: "Mistral AI.",
      subtitle: "Install TeamPrompt and empower your team with managed prompts for Mistral Le Chat.",
    },
  },
  {
    slug: "cohere-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + Cohere Integration — Enterprise Prompt Governance for Cohere AI",
      description:
        "Bring enterprise-grade prompt governance to Cohere's AI platform. TeamPrompt provides centralized prompt management, DLP enforcement, and audit trails for teams using Cohere for enterprise AI applications.",
      keywords: ["Cohere integration", "Cohere AI prompts", "Cohere enterprise governance", "Cohere prompt management", "enterprise AI prompts"],
    },
    hero: {
      headline: "Enterprise prompt governance for Cohere",
      subtitle:
        "Cohere builds AI for the enterprise. TeamPrompt ensures your team uses it responsibly with centralized prompt libraries, automated data loss prevention, granular access controls, and comprehensive audit trails that satisfy even the most demanding compliance requirements.",
      badges: ["Cohere", "Command R+", "Enterprise AI"],
    },
    features: {
      sectionLabel: "Cohere Integration",
      heading: "Governed AI for enterprise teams using Cohere",
      items: [
        { icon: "Lock", title: "Centralized prompt control", description: "Define and manage approved prompt templates centrally so every team member interacts with Cohere using consistent, vetted prompts that align with your organization's standards." },
        { icon: "ShieldCheck", title: "Enterprise DLP enforcement", description: "Multi-layered scanning catches proprietary business data, customer information, trade secrets, and regulated content before any query reaches Cohere's API or web interface." },
        { icon: "Eye", title: "Full audit trail coverage", description: "Every interaction with Cohere through TeamPrompt is logged with user identity, timestamp, prompt content, and DLP scan results for complete regulatory accountability." },
        { icon: "Key", title: "SSO and provisioning support", description: "Integrate TeamPrompt with your existing identity provider for single sign-on, automated user provisioning, and seamless onboarding of new team members to your prompt library." },
        { icon: "Users", title: "Department-level governance", description: "Create separate prompt libraries, DLP policies, and access controls for each department so legal, finance, and engineering each have tailored AI governance." },
        { icon: "BarChart3", title: "Enterprise adoption metrics", description: "Track Cohere adoption across your organization with department-level dashboards, usage trends, compliance metrics, and ROI indicators to justify your AI investment." },
      ],
    },
    benefits: {
      heading: "Why enterprises choose TeamPrompt for Cohere governance",
      items: [
        "Centralize prompt management so every Cohere interaction follows approved templates and standards",
        "Enforce multi-layered DLP policies to prevent sensitive data from reaching Cohere's platform",
        "Maintain complete audit trails for SOC 2, HIPAA, GDPR, and internal compliance programs",
        "Integrate with existing SSO providers for seamless authentication and user provisioning",
        "Create department-specific governance policies so each team has appropriate guardrails",
        "Track enterprise-wide Cohere adoption with dashboards that help leadership measure AI ROI",
      ],
    },
    faqs: [
      { question: "Does TeamPrompt work with Cohere's web interface?", answer: "Yes. TeamPrompt integrates with Cohere's web-based chat interface, allowing your team to insert managed prompts, enforce DLP policies, and log all interactions directly from the browser." },
      { question: "Can different departments have different Cohere governance policies?", answer: "Absolutely. TeamPrompt's role-based access control lets you create department-specific prompt libraries and DLP rules. Your legal team can have stricter data scanning than your marketing team, for example." },
      { question: "How does TeamPrompt support compliance with Cohere?", answer: "TeamPrompt provides comprehensive audit logging of every Cohere interaction, DLP scanning to prevent data leakage, and centralized governance policies. These features help organizations satisfy SOC 2, HIPAA, GDPR, and other regulatory requirements." },
      { question: "Does this integrate with our existing SSO?", answer: "Yes. TeamPrompt supports SAML and OIDC-based single sign-on, allowing you to connect your existing identity provider for authentication and automated user provisioning." },
    ],
    cta: {
      headline: "Govern Cohere AI with",
      gradientText: "enterprise-grade controls.",
      subtitle: "Centralized prompts. DLP enforcement. Full audit trails. Enterprise AI done right.",
    },
  },
  {
    slug: "huggingface-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + HuggingFace Chat Integration — Managed Prompts for Open-Source AI",
      description:
        "Use TeamPrompt with HuggingFace Chat to manage prompts for open-source AI models. Share team prompt libraries, enforce data governance, and track usage across Llama, Mixtral, and other open-source models.",
      keywords: ["HuggingFace Chat integration", "HuggingFace prompts", "open-source AI prompts", "HuggingFace prompt manager", "Llama prompt management"],
    },
    hero: {
      headline: "Managed prompts for HuggingFace Chat",
      subtitle:
        "HuggingFace Chat gives you access to the best open-source AI models. TeamPrompt enhances that experience with a shared prompt library, data governance, and usage analytics so your team can experiment with Llama, Mixtral, and other models while maintaining consistency and protecting sensitive data.",
      badges: ["HuggingFace Chat", "Open-Source Models", "Llama & Mixtral"],
    },
    features: {
      sectionLabel: "HuggingFace Integration",
      heading: "One prompt library for every open-source model",
      items: [
        { icon: "Archive", title: "Universal prompt library", description: "Access your entire team prompt library from within HuggingFace Chat, with prompts that work across Llama, Mixtral, Falcon, and every other open-source model available on the platform." },
        { icon: "Braces", title: "Model comparison templates", description: "Create prompt templates designed for comparing outputs across different open-source models, helping your team evaluate which model performs best for specific use cases." },
        { icon: "ShieldAlert", title: "Open-source model DLP", description: "Apply the same data loss prevention scanning to open-source models that you use with commercial AI tools, ensuring sensitive data stays protected regardless of which model you choose." },
        { icon: "BookOpen", title: "Community prompt curation", description: "Curate the best community-shared prompts from HuggingFace's ecosystem and add them to your team library with proper categorization, variables, and governance controls." },
        { icon: "GitBranch", title: "Model-specific variations", description: "Create model-specific prompt variations within a single template, automatically adjusting formatting and system instructions based on whether the team member selects Llama, Mixtral, or another model." },
        { icon: "BarChart3", title: "Model usage analytics", description: "Track which open-source models your team uses most, compare prompt performance across different models, and identify trends to inform your organization's AI model strategy." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with HuggingFace Chat",
      items: [
        "One prompt library that works across Llama, Mixtral, Falcon, and every HuggingFace Chat model",
        "Compare prompt performance across different open-source models to find the best fit for each task",
        "Enforce data governance on open-source models with the same DLP policies used for commercial AI",
        "Curate community prompts into your team library with proper categorization and access controls",
        "Create model-specific prompt variations that automatically adapt to each open-source model's format",
        "Track model usage patterns to inform your organization's open-source AI evaluation and strategy",
      ],
    },
    faqs: [
      { question: "Which HuggingFace Chat models does TeamPrompt support?", answer: "TeamPrompt works with HuggingFace Chat's web interface and supports all models available on the platform, including Llama, Mixtral, Falcon, and any newly added open-source models." },
      { question: "Can I compare prompt performance across different models?", answer: "Yes. TeamPrompt's analytics track prompt usage and outcomes across different HuggingFace Chat models, helping your team identify which open-source models perform best for specific tasks and prompt patterns." },
      { question: "Does DLP scanning work with open-source models too?", answer: "Absolutely. TeamPrompt's DLP scanning runs before any prompt is sent, regardless of the target model. Your sensitive data is protected whether you use Llama, Mixtral, or any other open-source model on HuggingFace Chat." },
    ],
    cta: {
      headline: "Explore open-source AI with",
      gradientText: "governed team prompts.",
      subtitle: "Install TeamPrompt and bring your prompt library to every model on HuggingFace Chat.",
    },
  },
  {
    slug: "poe-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + Poe Integration — Managed Prompts for Multi-Model AI Access",
      description:
        "Use TeamPrompt with Poe by Quora for multi-model AI access. Manage team prompts, enforce data governance, and share best practices across ChatGPT, Claude, Gemini, and other models all from one platform.",
      keywords: ["Poe integration", "Poe AI prompts", "Poe Quora prompt manager", "multi-model AI prompts", "Poe team prompts"],
    },
    hero: {
      headline: "One prompt library for every model on Poe",
      subtitle:
        "Poe gives your team access to ChatGPT, Claude, Gemini, Llama, and dozens of other AI models in one place. TeamPrompt adds a centralized prompt library, data governance, and team analytics on top, so your organization gets the best of multi-model access with enterprise-grade controls.",
      badges: ["Poe", "Multi-Model", "ChatGPT & Claude & Gemini"],
    },
    features: {
      sectionLabel: "Poe Integration",
      heading: "Govern multi-model AI usage through Poe",
      items: [
        { icon: "Zap", title: "Cross-model prompt insertion", description: "Insert prompts from your team library into any Poe-supported model with one click, whether your team member is chatting with GPT-4, Claude, Gemini, or a custom bot." },
        { icon: "Archive", title: "Model-agnostic prompt library", description: "Build a prompt library that works across all of Poe's models, eliminating the need to maintain separate prompt collections for each AI assistant your team uses." },
        { icon: "ShieldAlert", title: "Unified DLP across models", description: "Apply consistent data loss prevention policies across every model available on Poe, ensuring sensitive data is protected no matter which AI assistant your team selects." },
        { icon: "BookOpen", title: "Custom bot prompt templates", description: "Create prompt templates optimized for Poe's custom bots, including system prompt suggestions and conversation starters that help your team get consistent results from custom-built assistants." },
        { icon: "Users", title: "Team prompt standardization", description: "Standardize how your team interacts with AI across all of Poe's models by providing curated, approved prompt templates that ensure consistent quality and compliance." },
        { icon: "BarChart3", title: "Multi-model usage intelligence", description: "Track which models your team uses most on Poe, compare prompt effectiveness across different AI assistants, and identify opportunities to consolidate around the best-performing models." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with Poe",
      items: [
        "One prompt library that works across every AI model available on Poe's platform",
        "Consistent data governance no matter which Poe model your team members choose",
        "Eliminate prompt duplication by maintaining a single library for all AI assistants",
        "Track multi-model usage patterns to understand which AI tools deliver the most value",
        "Standardize team AI interactions with curated, approved prompt templates for every model",
        "Create optimized templates for Poe's custom bots alongside standard model prompts",
      ],
    },
    faqs: [
      { question: "Does TeamPrompt work with all models on Poe?", answer: "Yes. TeamPrompt inserts prompts into Poe's input field regardless of which model is selected. Your prompt library works with GPT-4, Claude, Gemini, Llama, and every other model available on Poe's platform." },
      { question: "Can I track which Poe models my team uses most?", answer: "Yes. TeamPrompt's analytics dashboard tracks usage across all AI tools including Poe. You can see which models your team selects most frequently and compare prompt performance across different AI assistants." },
      { question: "Does DLP scanning work across all Poe models?", answer: "Absolutely. TeamPrompt's DLP scanning runs before any prompt reaches Poe, regardless of the target model. Your data governance policies apply uniformly across GPT-4, Claude, Gemini, and every other model on the platform." },
    ],
    cta: {
      headline: "Manage every AI model on Poe with",
      gradientText: "one prompt library.",
      subtitle: "Install TeamPrompt and bring governed prompts to every model your team uses on Poe.",
    },
  },
  {
    slug: "grok-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + Grok Integration — Managed Prompts for xAI's Grok",
      description:
        "Use TeamPrompt with xAI's Grok for real-time insights and analysis. Manage team prompts, enforce data governance, and share best practices for Grok's unique real-time capabilities across your organization.",
      keywords: ["Grok integration", "xAI Grok prompts", "Grok prompt manager", "Grok AI team prompts", "Grok real-time AI"],
    },
    hero: {
      headline: "Managed prompts for xAI's Grok",
      subtitle:
        "Grok brings real-time knowledge and unfiltered analysis to your team. TeamPrompt ensures your organization uses Grok effectively with a shared library of proven prompts, automated data governance, and usage analytics that help you understand how your team leverages Grok's unique real-time intelligence capabilities.",
      badges: ["Grok", "xAI", "Real-Time Intelligence"],
    },
    features: {
      sectionLabel: "Grok Integration",
      heading: "Harness Grok's real-time power with managed prompts",
      items: [
        { icon: "Zap", title: "Real-time query templates", description: "Build prompt templates optimized for Grok's real-time data access, helping your team craft queries that take full advantage of current events, live data, and trending information." },
        { icon: "Globe", title: "Current events research prompts", description: "Create curated prompt collections for real-time market analysis, news monitoring, social sentiment tracking, and competitive intelligence that leverage Grok's live data capabilities." },
        { icon: "ShieldAlert", title: "Real-time data DLP scanning", description: "Protect sensitive information when crafting real-time queries by scanning prompts for proprietary data, competitive secrets, and regulated content before they reach Grok." },
        { icon: "BookOpen", title: "Analysis framework templates", description: "Build structured analysis frameworks that guide your team through systematic real-time research using Grok, from initial data gathering through synthesis and recommendation." },
        { icon: "Users", title: "Intelligence team sharing", description: "Share proven Grok query patterns across your research, competitive intelligence, and strategy teams so everyone benefits from collectively refined real-time analysis techniques." },
        { icon: "BarChart3", title: "Real-time AI analytics", description: "Track how your team uses Grok's real-time capabilities, measure the effectiveness of different query patterns, and optimize your prompt library for maximum analytical value." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with Grok",
      items: [
        "Build prompt templates optimized for Grok's unique real-time data access and current events knowledge",
        "Create curated prompt collections for market analysis, news monitoring, and competitive intelligence",
        "Protect sensitive business information with DLP scanning before queries reach xAI's servers",
        "Share proven real-time analysis techniques across research, strategy, and intelligence teams",
        "Track which Grok query patterns produce the most valuable real-time insights for your organization",
        "Structured analysis frameworks help your team conduct systematic, repeatable research with Grok",
      ],
    },
    faqs: [
      { question: "Does TeamPrompt work with Grok's web interface?", answer: "Yes. TeamPrompt integrates with Grok's web-based chat interface, allowing your team to insert managed prompts, enforce DLP policies, and log interactions directly from the browser." },
      { question: "Can I create prompts that leverage Grok's real-time capabilities?", answer: "Absolutely. TeamPrompt's template system lets you build prompts with dynamic variables for dates, topics, and data sources that are specifically designed to take advantage of Grok's real-time knowledge and analysis capabilities." },
      { question: "Is my data protected when using Grok through TeamPrompt?", answer: "Yes. TeamPrompt's DLP scanning runs before any prompt is sent to Grok, catching sensitive business data, proprietary information, and regulated content. All interactions are logged for audit purposes." },
    ],
    cta: {
      headline: "Unlock real-time intelligence with",
      gradientText: "managed Grok prompts.",
      subtitle: "Install TeamPrompt and give your team governed access to Grok's real-time AI capabilities.",
    },
  },
  {
    slug: "you-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + You.com Integration — Managed Prompts for AI-Powered Search",
      description:
        "Use TeamPrompt with You.com for AI-powered search and research. Manage team prompts, enforce data governance, and share best search practices across your organization for smarter, faster information retrieval.",
      keywords: ["You.com integration", "You.com AI prompts", "You.com prompt manager", "AI search prompts", "You.com team prompts"],
    },
    hero: {
      headline: "Managed prompts for You.com AI search",
      subtitle:
        "You.com combines AI chat with web search to deliver comprehensive, sourced answers. TeamPrompt brings team prompt management to this powerful search experience, giving your organization curated query templates, data governance, and analytics that help every team member find better information faster.",
      badges: ["You.com", "AI Search", "YouChat"],
    },
    features: {
      sectionLabel: "You.com Integration",
      heading: "Smarter AI search with managed prompts",
      items: [
        { icon: "Globe", title: "Search-optimized prompt templates", description: "Create prompt templates specifically designed for You.com's AI-powered search capabilities, including structured queries that produce comprehensive, well-sourced research results." },
        { icon: "Archive", title: "Research query library", description: "Build and maintain a curated library of research queries for market analysis, competitive intelligence, technology evaluation, and academic research that your entire team can access." },
        { icon: "BookOpen", title: "Source-quality prompt design", description: "Design prompts that leverage You.com's source-citing capabilities to produce verifiable, well-referenced answers that meet your organization's research quality standards." },
        { icon: "ShieldAlert", title: "Search query DLP scanning", description: "Scan search queries for sensitive business data, competitive intelligence terms, and proprietary information before they reach You.com's servers, protecting your research activities." },
        { icon: "Users", title: "Team research standardization", description: "Standardize how your team conducts AI-powered research by providing curated query templates that ensure consistent methodology and comprehensive coverage across every search." },
        { icon: "BarChart3", title: "Search effectiveness analytics", description: "Track which query patterns produce the most useful results, measure research productivity across your team, and continuously refine your prompt library based on actual usage data." },
      ],
    },
    benefits: {
      heading: "Why teams use TeamPrompt with You.com",
      items: [
        "Build search-optimized prompt templates that produce comprehensive, well-sourced research results",
        "Maintain a curated library of proven research queries for market analysis and competitive intelligence",
        "Protect sensitive business data with DLP scanning before search queries reach You.com",
        "Standardize research methodology across your team with curated, approved query templates",
        "Track search effectiveness to continuously improve your team's AI-powered research practices",
        "Leverage You.com's source-citing capabilities with prompts designed for verifiable, referenced answers",
      ],
    },
    faqs: [
      { question: "Does TeamPrompt work with You.com's chat and search modes?", answer: "Yes. TeamPrompt integrates with You.com's web interface and works across all modes including YouChat, Smart search, and Research mode. Your prompt library is accessible regardless of which mode your team member selects." },
      { question: "Can I create search-specific prompt templates?", answer: "Absolutely. TeamPrompt's template system lets you build prompts with dynamic variables for topics, date ranges, and source preferences that are specifically designed for You.com's AI-powered search and research capabilities." },
      { question: "How does TeamPrompt help standardize team research?", answer: "By providing a curated library of approved research query templates, TeamPrompt ensures every team member follows consistent research methodology. This reduces variability in research quality and helps junior team members perform at a senior level." },
    ],
    cta: {
      headline: "Search smarter with",
      gradientText: "managed AI prompts.",
      subtitle: "Install TeamPrompt and bring your team's best research practices to You.com.",
    },
  },
  {
    slug: "meta-ai-integration",
    category: "integration",
    meta: {
      title: "TeamPrompt + Meta AI Integration — Managed Prompts for Social and Creative AI",
      description:
        "Use TeamPrompt with Meta AI for social media, creative content, and marketing tasks. Manage team prompts, enforce brand governance, and share proven creative templates across your marketing and content teams.",
      keywords: ["Meta AI integration", "Meta AI prompts", "Meta AI prompt manager", "Meta AI creative prompts", "Meta AI team management"],
    },
    hero: {
      headline: "Managed prompts for Meta AI",
      subtitle:
        "Meta AI is becoming a creative powerhouse for social media and marketing teams. TeamPrompt ensures your organization uses it consistently with brand-approved prompt templates, content governance, and team-wide sharing so every social post, ad copy, and creative asset starts from a proven foundation rather than a blank page.",
      badges: ["Meta AI", "Llama", "Social & Creative"],
    },
    features: {
      sectionLabel: "Meta AI Integration",
      heading: "Brand-consistent creative AI with managed prompts",
      items: [
        { icon: "BookOpen", title: "Brand voice templates", description: "Create prompt templates that encode your brand voice, tone guidelines, and messaging framework so every Meta AI interaction produces content consistent with your brand identity." },
        { icon: "Archive", title: "Creative content library", description: "Build a curated library of creative prompt templates for social media posts, ad copy, campaign ideas, image descriptions, and marketing content that your entire team can access and reuse." },
        { icon: "ShieldCheck", title: "Brand governance enforcement", description: "Define brand guardrails that automatically flag prompts producing off-brand messaging, inappropriate content, or communications that violate your organization's brand guidelines." },
        { icon: "Eye", title: "Content approval workflows", description: "Track which prompts generate published content, maintain an audit trail of AI-assisted creative work, and ensure all AI-generated assets go through your approval process." },
        { icon: "Users", title: "Creative team collaboration", description: "Share winning creative prompts across marketing, social media, and content teams so everyone benefits from the templates that produce the highest-performing social and advertising content." },
        { icon: "BarChart3", title: "Creative performance analytics", description: "Measure which prompt templates produce the most engaging content, track creative team adoption of AI tools, and identify opportunities to expand AI-assisted content production." },
      ],
    },
    benefits: {
      heading: "Why creative teams use TeamPrompt with Meta AI",
      items: [
        "Encode your brand voice into prompt templates so every Meta AI output matches your brand identity",
        "Build a curated library of creative templates for social posts, ad copy, and marketing content",
        "Enforce brand governance to prevent off-brand or inappropriate content from being generated",
        "Share winning creative prompts across marketing, social media, and content teams",
        "Track which prompt templates produce the highest-performing social and advertising content",
        "Maintain audit trails of AI-assisted creative work for compliance and content approval workflows",
      ],
    },
    faqs: [
      { question: "Does TeamPrompt work with Meta AI's web interface?", answer: "Yes. TeamPrompt integrates with Meta AI's web-based chat interface, allowing your team to insert managed prompts, enforce brand governance, and log creative interactions directly from the browser." },
      { question: "Can I create brand-specific prompt templates for Meta AI?", answer: "Absolutely. TeamPrompt's template system lets you encode brand voice, tone guidelines, audience targeting, and content format preferences into reusable templates that ensure every Meta AI interaction produces brand-consistent output." },
      { question: "How does brand governance work with Meta AI?", answer: "TeamPrompt lets you define brand guardrails including approved terminology, prohibited phrases, tone requirements, and content policies. These rules are checked before prompts are sent and flagged if they could produce off-brand content." },
      { question: "Can my team share creative prompts across departments?", answer: "Yes. TeamPrompt's team sharing features let marketing, social media, content, and creative teams share their best-performing prompts with proper categorization and access controls so everyone benefits from collective expertise." },
    ],
    cta: {
      headline: "Create on-brand content with",
      gradientText: "managed Meta AI prompts.",
      subtitle: "Install TeamPrompt and give your creative team governed access to Meta AI's capabilities.",
    },
  },
];
