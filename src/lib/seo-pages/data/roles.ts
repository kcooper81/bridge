import type { SeoPageData } from "../types";

export const rolePages: SeoPageData[] = [
  {
    slug: "for-engineering-teams",
    category: "role",
    meta: {
      title: "TeamPrompt for Engineering Teams | AI Prompt Management",
      description:
        "Supercharge your engineering team's AI workflow with shared code review prompts, debugging templates, architecture discussion starters, and CI/CD integration patterns. TeamPrompt keeps your best technical prompts organized, version-controlled, and one click away.",
      keywords: [
        "engineering team AI prompts",
        "code review prompts",
        "debugging templates AI",
        "developer prompt management",
        "AI prompts for engineers",
        "software engineering AI tools",
      ],
    },
    hero: {
      headline: "AI prompts built for how engineers actually work",
      subtitle:
        "Your engineering team writes dozens of AI prompts every day — code reviews, debugging sessions, architecture discussions, documentation drafts. TeamPrompt gives those prompts a home: organized, version-controlled, and accessible directly inside ChatGPT, Claude, Copilot, and every AI tool your developers already use. Stop losing brilliant prompt patterns in Slack threads and personal bookmarks.",
      badges: ["Code review prompts", "Debug templates", "Architecture docs"],
    },
    features: {
      sectionLabel: "Engineering",
      heading: "Purpose-built for engineering workflows",
      items: [
        {
          icon: "Braces",
          title: "Code review prompt templates",
          description:
            "Standardize code reviews with templates that include {{language}}, {{context}}, and {{focus_area}} variables. Every reviewer uses the same thorough approach.",
        },
        {
          icon: "Zap",
          title: "One-click debugging prompts",
          description:
            "Insert structured debugging prompts directly into your AI tool. Include error context, stack traces, and environment details through template variables.",
        },
        {
          icon: "GitBranch",
          title: "Version-controlled prompt library",
          description:
            "Track changes to every prompt with full version history and diff view. See who changed what, when, and why — just like your code.",
        },
        {
          icon: "Users",
          title: "Team-wide sharing",
          description:
            "Share proven prompt patterns across your entire engineering org. Frontend, backend, DevOps, and QA each get curated categories with the right prompts.",
        },
        {
          icon: "ShieldCheck",
          title: "DLP guardrails for code",
          description:
            "Automatically scan outbound prompts for API keys, tokens, connection strings, and proprietary code patterns before they reach any AI model.",
        },
        {
          icon: "Globe",
          title: "Works in every AI tool",
          description:
            "Access your engineering prompt library from ChatGPT, Claude, Gemini, Copilot, and Perplexity through the browser extension. No tab switching.",
        },
      ],
    },
    benefits: {
      heading: "Why engineering teams choose TeamPrompt",
      items: [
        "Standardize code review quality with shared, battle-tested prompt templates",
        "Onboard new engineers faster with a library of proven debugging and architecture prompts",
        "Prevent API keys and secrets from leaking into AI tools with real-time DLP scanning",
        "Track which prompts your team uses most and identify gaps in your library",
        "Reduce time spent crafting prompts from scratch — reuse what already works",
        "Maintain consistency across distributed engineering teams and time zones",
      ],
    },
    stats: [
      { value: "10x", label: "Faster prompt reuse" },
      { value: "0", label: "Leaked secrets" },
      { value: "100%", label: "Team consistency" },
    ],
    faqs: [
      {
        question: "Can I create prompts specifically for code review?",
        answer:
          "Yes. Create templates with variables like {{language}}, {{file_path}}, {{review_focus}}, and {{context}}. Reviewers fill in the specifics and insert a structured review prompt in one click.",
      },
      {
        question: "Does it catch API keys and secrets in prompts?",
        answer:
          "Yes. The DLP scanner detects API keys, tokens, connection strings, AWS credentials, and other secret patterns in real-time — before the prompt reaches any AI tool.",
      },
      {
        question: "Can different engineering sub-teams have their own prompt categories?",
        answer:
          "Absolutely. Create separate categories for frontend, backend, DevOps, QA, or any grouping. Each has its own permissions and prompts, while still sharing a central library.",
      },
      {
        question: "Does it work with GitHub Copilot?",
        answer:
          "TeamPrompt works alongside Copilot through the browser extension. Use it in ChatGPT, Claude, Gemini, and Perplexity where your team runs longer AI conversations for code review, architecture, and debugging.",
      },
    ],
    cta: {
      headline: "Your engineering team deserves",
      gradientText: "better AI workflows.",
      subtitle:
        "Start organizing your engineering prompts today. Free plan available.",
    },
  },
  {
    slug: "for-product-managers",
    category: "role",
    meta: {
      title: "TeamPrompt for Product Managers | AI Prompt Management",
      description:
        "Accelerate product management with shared AI prompts for PRD writing, user story generation, competitive analysis, and feature prioritization. TeamPrompt helps PMs leverage AI consistently and efficiently.",
      keywords: [
        "product manager AI prompts",
        "PRD writing AI",
        "user story prompts",
        "PM AI tools",
        "product management prompts",
        "competitive analysis AI",
      ],
    },
    hero: {
      headline: "AI prompts designed for product managers",
      subtitle:
        "Product managers juggle PRDs, user stories, competitive analysis, and stakeholder communication every day. TeamPrompt gives you a curated library of PM-specific prompts — templates for writing crisp PRDs, generating user stories from research notes, running competitive analyses, and prioritizing features. Share your best prompts across the product team so every PM works from the same playbook.",
      badges: ["PRD templates", "User story generation", "Competitive analysis"],
    },
    features: {
      sectionLabel: "Product",
      heading: "Built for the PM workflow",
      items: [
        {
          icon: "BookOpen",
          title: "PRD writing templates",
          description:
            "Structured templates with {{product_name}}, {{target_audience}}, and {{problem_statement}} variables that produce consistent, thorough PRDs every time.",
        },
        {
          icon: "Users",
          title: "User story generation",
          description:
            "Convert research notes, customer feedback, and feature ideas into well-formatted user stories. Variables capture persona, goal, and acceptance criteria.",
        },
        {
          icon: "Eye",
          title: "Competitive analysis prompts",
          description:
            "Standardized templates for analyzing competitors, market positioning, and feature comparisons. Ensure consistent depth across every analysis.",
        },
        {
          icon: "BarChart3",
          title: "Prioritization frameworks",
          description:
            "Prompts built around RICE, ICE, MoSCoW, and other frameworks. Feed in your feature list and get structured prioritization output.",
        },
        {
          icon: "Zap",
          title: "One-click insert anywhere",
          description:
            "Access your PM prompt library from ChatGPT, Claude, or Gemini without leaving the tool. Fill in variables and insert in seconds.",
        },
        {
          icon: "Shield",
          title: "Protect sensitive roadmap data",
          description:
            "DLP guardrails scan for confidential product data, customer names, and revenue figures before they reach AI models.",
        },
      ],
    },
    benefits: {
      heading: "Why product managers love TeamPrompt",
      items: [
        "Write PRDs in half the time with proven, variable-driven templates",
        "Generate user stories consistently from customer research and feedback",
        "Run deeper competitive analyses with standardized prompt frameworks",
        "Share winning prompts across your entire product team",
        "Keep confidential roadmap and customer data out of AI tools",
        "Track which prompts drive the best results across your PM org",
      ],
    },
    stats: [
      { value: "50%", label: "Faster PRD writing" },
      { value: "100%", label: "PM team alignment" },
      { value: "0", label: "Roadmap data leaks" },
    ],
    faqs: [
      {
        question: "What PM-specific templates can I create?",
        answer:
          "Anything your PM workflow needs — PRDs, user stories, competitive analyses, feature prioritization, stakeholder updates, release notes, customer interview guides, and more. Each template supports dynamic variables.",
      },
      {
        question: "Can I share prompts with just the product team?",
        answer:
          "Yes. Create a product team category with permissions limited to your PMs. Other teams won't see prompts unless you choose to share them more broadly.",
      },
      {
        question: "Does it protect confidential product information?",
        answer:
          "Yes. DLP guardrails scan every prompt for sensitive patterns including customer names, revenue figures, and unreleased feature details. Configure custom rules for your specific confidentiality requirements.",
      },
      {
        question: "Which AI tools does it work with?",
        answer:
          "TeamPrompt works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity through the browser extension. Insert prompts directly without tab switching.",
      },
    ],
    cta: {
      headline: "Ship better products",
      gradientText: "with better AI prompts.",
      subtitle:
        "Start building your PM prompt library today. Free plan available.",
    },
  },
  {
    slug: "for-marketers",
    category: "role",
    meta: {
      title: "TeamPrompt for Marketing Teams | AI Prompt Management",
      description:
        "Elevate your marketing with shared AI prompts for content creation, campaign briefs, SEO optimization, and social media. TeamPrompt keeps your marketing team's best prompts organized, consistent, and always accessible.",
      keywords: [
        "marketing AI prompts",
        "content creation prompts",
        "SEO prompts AI",
        "social media AI templates",
        "marketing team AI tools",
        "campaign brief AI",
      ],
    },
    hero: {
      headline: "AI prompts that make marketing teams unstoppable",
      subtitle:
        "Your marketing team uses AI for everything — blog posts, campaign briefs, social copy, SEO research, email sequences, and ad creative. But without shared prompts, everyone reinvents the wheel. TeamPrompt centralizes your best marketing prompts into a searchable library with brand-consistent templates, dynamic variables, and one-click insertion into every AI tool your team uses.",
      badges: ["Content creation", "Campaign briefs", "SEO & social"],
    },
    features: {
      sectionLabel: "Marketing",
      heading: "Everything marketers need from AI prompts",
      items: [
        {
          icon: "BookOpen",
          title: "Content creation templates",
          description:
            "Blog posts, email sequences, landing pages, and ad copy — all with variables for {{tone}}, {{audience}}, {{product}}, and {{goal}} to stay on brand.",
        },
        {
          icon: "BarChart3",
          title: "SEO optimization prompts",
          description:
            "Templates for keyword research, meta descriptions, content briefs, and SEO audits. Standardize your SEO workflow across the team.",
        },
        {
          icon: "Globe",
          title: "Social media prompt library",
          description:
            "Platform-specific templates for LinkedIn, Twitter/X, Instagram, and TikTok. Variables capture {{platform}}, {{format}}, and {{campaign}} for tailored output.",
        },
        {
          icon: "Zap",
          title: "Campaign brief generators",
          description:
            "Turn campaign goals into structured briefs with prompts that capture objectives, audience, channels, timeline, and success metrics.",
        },
        {
          icon: "Users",
          title: "Brand-consistent sharing",
          description:
            "Share approved prompts across your marketing team. Every content creator, social manager, and SEO specialist uses the same voice and guidelines.",
        },
        {
          icon: "Shield",
          title: "Protect campaign data",
          description:
            "DLP guardrails prevent unreleased campaign details, client budgets, and proprietary strategy data from leaking into AI tools.",
        },
      ],
    },
    benefits: {
      heading: "Why marketing teams choose TeamPrompt",
      items: [
        "Maintain brand consistency across all AI-generated content",
        "Reduce content creation time with proven, reusable templates",
        "Standardize SEO workflows from keyword research to content briefs",
        "Keep campaign strategies and client data out of AI models",
        "Onboard new marketers instantly with your team's prompt playbook",
        "Track which prompts produce the best marketing results",
      ],
    },
    stats: [
      { value: "3x", label: "Faster content production" },
      { value: "100%", label: "Brand consistency" },
      { value: "0", label: "Campaign data leaks" },
    ],
    faqs: [
      {
        question: "Can I create prompts for specific marketing channels?",
        answer:
          "Yes. Organize prompts by channel — email, social, SEO, paid ads, content marketing — with separate categories and permissions for each sub-team.",
      },
      {
        question: "How do I maintain brand voice across AI prompts?",
        answer:
          "Build brand guidelines into your templates. Include tone, style, and voice instructions as part of the prompt structure so every piece of AI-generated content matches your brand.",
      },
      {
        question: "Does it work with all the AI tools my team uses?",
        answer:
          "Yes. TeamPrompt works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. Your prompts are available in every tool through the browser extension.",
      },
      {
        question: "Can I protect client and campaign data?",
        answer:
          "Yes. DLP guardrails scan for client names, budgets, strategy details, and other sensitive marketing data before prompts reach AI models.",
      },
    ],
    cta: {
      headline: "Create better content,",
      gradientText: "faster than ever.",
      subtitle:
        "Start building your marketing prompt library. Free plan available.",
    },
  },
  {
    slug: "for-customer-success",
    category: "role",
    meta: {
      title: "TeamPrompt for Customer Success Teams | AI Prompt Management",
      description:
        "Empower your customer success team with AI prompts for customer communication, onboarding playbooks, renewal strategies, and health score analysis. TeamPrompt keeps your CS team aligned and efficient.",
      keywords: [
        "customer success AI prompts",
        "CS team AI tools",
        "customer communication templates",
        "onboarding playbook AI",
        "renewal prompts",
        "customer health scoring AI",
      ],
    },
    hero: {
      headline: "AI prompts that help your CS team scale",
      subtitle:
        "Customer success teams handle onboarding, renewals, escalations, and health monitoring across dozens or hundreds of accounts. TeamPrompt gives your CS org a shared library of AI prompts for every stage of the customer lifecycle — from welcome emails to renewal playbooks to churn risk analysis. Every CSM uses the same proven approaches, even as your book of business grows.",
      badges: ["Onboarding guides", "Renewal playbooks", "Health scoring"],
    },
    features: {
      sectionLabel: "Customer Success",
      heading: "Prompt templates for every CS workflow",
      items: [
        {
          icon: "BookOpen",
          title: "Customer communication templates",
          description:
            "Templates for check-in emails, QBR agendas, escalation responses, and milestone celebrations. Variables capture {{customer_name}}, {{product}}, and {{context}}.",
        },
        {
          icon: "Users",
          title: "Onboarding playbook prompts",
          description:
            "Structured prompts that generate onboarding plans, kickoff agendas, training guides, and milestone tracking documents for new customers.",
        },
        {
          icon: "Key",
          title: "Renewal strategy prompts",
          description:
            "Templates for renewal prep, value summaries, expansion proposals, and negotiation talking points. Fill in account details and get ready-to-use outputs.",
        },
        {
          icon: "BarChart3",
          title: "Health score analysis",
          description:
            "Prompts that analyze usage data, support ticket patterns, and engagement signals to generate health assessments and action plans.",
        },
        {
          icon: "Zap",
          title: "One-click in every AI tool",
          description:
            "Access your CS prompt library from ChatGPT, Claude, or Gemini. Insert templates and fill in account-specific details without leaving your AI tool.",
        },
        {
          icon: "Shield",
          title: "Protect customer data",
          description:
            "DLP guardrails scan for customer PII, contract details, and revenue figures before prompts reach AI models. Keep customer trust intact.",
        },
      ],
    },
    benefits: {
      heading: "Why customer success teams love TeamPrompt",
      items: [
        "Deliver consistent customer experiences across your entire CS team",
        "Onboard new CSMs faster with proven playbook templates",
        "Prepare for renewals in minutes instead of hours with structured prompts",
        "Analyze account health systematically using standardized AI prompts",
        "Prevent customer PII and contract data from leaking into AI tools",
        "Scale your CS operations without sacrificing the personal touch",
      ],
    },
    stats: [
      { value: "60%", label: "Faster QBR prep" },
      { value: "100%", label: "CSM alignment" },
      { value: "0", label: "Customer data leaks" },
    ],
    faqs: [
      {
        question: "What CS workflows does TeamPrompt support?",
        answer:
          "Any workflow you can prompt AI for — onboarding plans, check-in emails, QBR prep, renewal strategies, escalation responses, health score analysis, expansion proposals, and customer communication at every lifecycle stage.",
      },
      {
        question: "Can I include customer-specific details in templates?",
        answer:
          "Yes. Template variables like {{customer_name}}, {{account_tier}}, {{renewal_date}}, and {{health_score}} let you personalize every prompt while maintaining a consistent structure.",
      },
      {
        question: "How does it protect customer information?",
        answer:
          "DLP guardrails scan every outbound prompt for customer PII, contract values, revenue data, and other sensitive information. Violations are blocked or flagged before reaching AI models.",
      },
      {
        question: "Can different CS pods have their own prompts?",
        answer:
          "Yes. Create separate categories for enterprise CS, mid-market, SMB, or any pod structure. Each group gets its own curated prompts with appropriate permissions.",
      },
    ],
    cta: {
      headline: "Scale customer success",
      gradientText: "without losing the personal touch.",
      subtitle:
        "Start building your CS prompt library. Free plan available.",
    },
  },
  {
    slug: "for-sales-teams",
    category: "role",
    meta: {
      title: "TeamPrompt for Sales Teams | AI Prompt Management",
      description:
        "Close more deals with shared AI prompts for prospecting, email outreach, proposal writing, and objection handling. TeamPrompt gives your sales team a competitive edge with organized, proven prompt templates.",
      keywords: [
        "sales AI prompts",
        "prospecting prompts AI",
        "sales email templates AI",
        "proposal writing AI",
        "objection handling prompts",
        "sales team AI tools",
      ],
    },
    hero: {
      headline: "AI prompts that help your sales team close",
      subtitle:
        "Top-performing sales reps already use AI for prospecting, outreach, proposals, and objection handling. The problem? Their best prompts live in personal notes, never shared with the team. TeamPrompt centralizes your sales team's AI playbook into a shared library where every rep — from new hires to veterans — can access battle-tested prompts in one click, directly inside their AI tool of choice.",
      badges: ["Prospecting", "Email outreach", "Objection handling"],
    },
    features: {
      sectionLabel: "Sales",
      heading: "Prompt templates for every stage of the deal",
      items: [
        {
          icon: "Eye",
          title: "Prospecting research prompts",
          description:
            "Templates that analyze prospects, companies, and industries. Variables capture {{company}}, {{industry}}, and {{pain_points}} for targeted research.",
        },
        {
          icon: "Zap",
          title: "Email outreach sequences",
          description:
            "Cold outreach, follow-up, and re-engagement templates. Fill in {{prospect_name}}, {{value_prop}}, and {{trigger_event}} for personalized, high-converting emails.",
        },
        {
          icon: "BookOpen",
          title: "Proposal writing templates",
          description:
            "Structure winning proposals with templates for executive summaries, solution overviews, ROI calculations, and implementation timelines.",
        },
        {
          icon: "Shield",
          title: "Objection handling playbook",
          description:
            "Prompts for pricing objections, competitor comparisons, timing concerns, and stakeholder buy-in. Every rep gets your best responses instantly.",
        },
        {
          icon: "Users",
          title: "Team-wide sales playbook",
          description:
            "Share winning prompts across the entire sales org. New reps ramp faster by using the same prompts your top performers rely on.",
        },
        {
          icon: "Lock",
          title: "Protect deal data",
          description:
            "DLP guardrails prevent deal values, customer budgets, internal pricing, and competitive intelligence from leaking into AI tools.",
        },
      ],
    },
    benefits: {
      heading: "Why sales teams choose TeamPrompt",
      items: [
        "Ramp new reps faster with a library of proven sales prompts",
        "Write personalized outreach emails in seconds instead of minutes",
        "Handle objections consistently with your team's best responses",
        "Create polished proposals quickly with structured AI templates",
        "Prevent deal values and competitive intel from leaking into AI models",
        "Track which prompts correlate with the highest conversion rates",
      ],
    },
    stats: [
      { value: "5x", label: "Faster email writing" },
      { value: "50%", label: "Faster rep ramp-up" },
      { value: "0", label: "Deal data leaks" },
    ],
    faqs: [
      {
        question: "How can sales reps use this day-to-day?",
        answer:
          "Reps browse the shared prompt library from the browser extension, pick a template (e.g., cold outreach email), fill in variables like prospect name and value prop, and insert the polished prompt into ChatGPT or Claude in one click.",
      },
      {
        question: "Can I build an objection handling library?",
        answer:
          "Yes. Create a category for objection handling with templates for pricing, competitor, timing, and authority objections. Each template produces a tailored response when filled with deal-specific context.",
      },
      {
        question: "Does it protect sensitive sales data?",
        answer:
          "Yes. DLP guardrails scan for deal values, customer budgets, internal pricing tiers, and competitive intelligence before any prompt reaches an AI model.",
      },
      {
        question: "Can managers share prompts with the whole team?",
        answer:
          "Yes. Sales managers can create and share prompt categories with the entire team, specific regions, or individual reps. Permissions are fully configurable.",
      },
    ],
    cta: {
      headline: "Give your sales team",
      gradientText: "an unfair advantage.",
      subtitle:
        "Start building your sales prompt playbook. Free plan available.",
    },
  },
  {
    slug: "for-hr-teams",
    category: "role",
    meta: {
      title: "TeamPrompt for HR Teams | AI Prompt Management",
      description:
        "Streamline HR workflows with shared AI prompts for job descriptions, interview guides, policy writing, and employee communications. TeamPrompt helps HR teams work faster while protecting sensitive employee data.",
      keywords: [
        "HR AI prompts",
        "job description AI",
        "interview guide prompts",
        "HR policy writing AI",
        "employee communication templates",
        "HR team AI tools",
      ],
    },
    hero: {
      headline: "AI prompts that make HR teams more efficient",
      subtitle:
        "HR teams are responsible for some of the most sensitive and high-stakes writing in any organization — job descriptions, interview guides, policies, and employee communications. TeamPrompt gives your HR team a shared library of AI prompts tailored to these workflows, with built-in guardrails that protect employee data, ensure inclusive language, and maintain compliance across every interaction with AI tools.",
      badges: ["Job descriptions", "Interview guides", "Policy writing"],
    },
    features: {
      sectionLabel: "HR",
      heading: "AI prompt templates for every HR workflow",
      items: [
        {
          icon: "BookOpen",
          title: "Job description templates",
          description:
            "Create inclusive, compelling JDs with templates for {{role_title}}, {{department}}, {{level}}, and {{requirements}}. Ensure consistency across every posting.",
        },
        {
          icon: "Users",
          title: "Interview guide generators",
          description:
            "Structured prompts that produce behavioral, technical, and cultural-fit interview questions tailored to the role, level, and competencies you're evaluating.",
        },
        {
          icon: "Lock",
          title: "Policy writing prompts",
          description:
            "Templates for drafting, updating, and reviewing HR policies — from remote work guidelines to code of conduct to benefits documentation.",
        },
        {
          icon: "Zap",
          title: "Employee communication templates",
          description:
            "Prompts for all-hands updates, policy announcements, performance review frameworks, and sensitive communications like restructuring or layoff notices.",
        },
        {
          icon: "ShieldAlert",
          title: "Employee data protection",
          description:
            "DLP guardrails detect and block employee PII, salary data, performance ratings, and health information before it reaches any AI model.",
        },
        {
          icon: "BarChart3",
          title: "HR team analytics",
          description:
            "Track which prompts your HR team uses most, identify workflow gaps, and measure adoption across recruiting, people ops, and L&D.",
        },
      ],
    },
    benefits: {
      heading: "Why HR teams choose TeamPrompt",
      items: [
        "Write job descriptions that are consistent, inclusive, and on-brand",
        "Generate structured interview guides in minutes instead of hours",
        "Draft and update HR policies faster with proven templates",
        "Protect employee PII, salary data, and performance information from AI models",
        "Ensure every HR team member uses the same approved prompt patterns",
        "Onboard new HR staff with a ready-to-use library of HR-specific prompts",
      ],
    },
    stats: [
      { value: "70%", label: "Faster JD writing" },
      { value: "100%", label: "Data protection" },
      { value: "0", label: "Employee data leaks" },
    ],
    faqs: [
      {
        question: "Can I create templates for job descriptions?",
        answer:
          "Yes. Build JD templates with variables for role title, department, level, location, requirements, and benefits. Every recruiter produces consistent, inclusive job postings.",
      },
      {
        question: "How does TeamPrompt protect employee data?",
        answer:
          "DLP guardrails scan every outbound prompt for employee names, SSNs, salary figures, performance ratings, health information, and other HR-sensitive data. Violations are blocked before reaching AI tools.",
      },
      {
        question: "Can different HR sub-teams have separate prompt libraries?",
        answer:
          "Yes. Create categories for recruiting, people operations, L&D, compensation, and compliance. Each sub-team gets its own curated prompts with appropriate permissions.",
      },
      {
        question: "Does it help with inclusive language?",
        answer:
          "Yes. Build inclusive language guidelines into your prompt templates so every job description and communication follows your DEI standards by default.",
      },
    ],
    cta: {
      headline: "Modernize your HR workflows",
      gradientText: "with smarter AI prompts.",
      subtitle:
        "Start building your HR prompt library. Free plan available.",
    },
  },
  {
    slug: "for-designers",
    category: "role",
    meta: {
      title: "TeamPrompt for Designers | AI Prompt Management",
      description:
        "Enhance your design workflow with shared AI prompts for design briefs, UX research, accessibility reviews, and design system documentation. TeamPrompt helps design teams leverage AI consistently and creatively.",
      keywords: [
        "designer AI prompts",
        "UX research prompts AI",
        "design brief templates",
        "accessibility review AI",
        "design system documentation AI",
        "design team AI tools",
      ],
    },
    hero: {
      headline: "AI prompts crafted for the design process",
      subtitle:
        "Designers use AI for everything from brainstorming concepts to writing UX copy to documenting design systems. But great design prompts are hard to write and easy to lose. TeamPrompt gives your design team a shared library where your best prompts live — organized by workflow, always up to date, and available in one click inside ChatGPT, Claude, and every AI tool your designers use. Turn scattered prompt experiments into a repeatable design advantage.",
      badges: ["Design briefs", "UX research", "Accessibility reviews"],
    },
    features: {
      sectionLabel: "Design",
      heading: "Prompt templates for design workflows",
      items: [
        {
          icon: "BookOpen",
          title: "Design brief templates",
          description:
            "Structured prompts for project briefs, creative direction, and design explorations. Variables for {{project}}, {{audience}}, {{constraints}}, and {{deliverables}}.",
        },
        {
          icon: "Users",
          title: "UX research prompts",
          description:
            "Templates for user interview scripts, survey design, persona generation, journey mapping, and usability test planning. Consistent research methodology every time.",
        },
        {
          icon: "ShieldCheck",
          title: "Accessibility review prompts",
          description:
            "WCAG-focused templates that review designs for color contrast, screen reader compatibility, keyboard navigation, and inclusive interaction patterns.",
        },
        {
          icon: "Archive",
          title: "Design system documentation",
          description:
            "Prompts that generate component documentation, usage guidelines, design tokens, and pattern library entries from your design specifications.",
        },
        {
          icon: "Zap",
          title: "UX copy generation",
          description:
            "Templates for microcopy, error messages, onboarding flows, and empty states. Variables capture {{context}}, {{tone}}, and {{user_action}} for targeted copy.",
        },
        {
          icon: "Globe",
          title: "Works in every AI tool",
          description:
            "Access your design prompt library from ChatGPT, Claude, Gemini, or any supported AI tool through the browser extension.",
        },
      ],
    },
    benefits: {
      heading: "Why design teams choose TeamPrompt",
      items: [
        "Standardize UX research methodology with shared, proven prompt templates",
        "Generate consistent design system documentation across the team",
        "Run accessibility reviews systematically with WCAG-focused prompts",
        "Produce on-brand UX copy quickly with tone and context-aware templates",
        "Onboard junior designers with a library of expert-crafted design prompts",
        "Track which design prompts your team uses and iterate on what works",
      ],
    },
    stats: [
      { value: "3x", label: "Faster documentation" },
      { value: "100%", label: "Research consistency" },
      { value: "WCAG", label: "A11y compliance" },
    ],
    faqs: [
      {
        question: "Can I use this for UX research?",
        answer:
          "Yes. Create templates for user interview scripts, survey questions, persona generation, journey maps, and usability test plans. Variables let you customize for each project while maintaining methodological consistency.",
      },
      {
        question: "Does it help with accessibility reviews?",
        answer:
          "Yes. Build WCAG-focused review prompts that check for color contrast, screen reader compatibility, keyboard navigation, focus management, and other accessibility criteria.",
      },
      {
        question: "Can I create prompts for design system documentation?",
        answer:
          "Absolutely. Templates for component docs, usage guidelines, design token documentation, and pattern libraries. Feed in your design specs and get structured documentation.",
      },
      {
        question: "Does it work with design-focused AI tools?",
        answer:
          "TeamPrompt works with ChatGPT, Claude, Gemini, Copilot, and Perplexity through the browser extension. Use it wherever your design team runs AI conversations.",
      },
    ],
    cta: {
      headline: "Design smarter",
      gradientText: "with shared AI prompts.",
      subtitle:
        "Start building your design prompt library. Free plan available.",
    },
  },
  {
    slug: "for-executives",
    category: "role",
    meta: {
      title: "TeamPrompt for Executives & Leadership | AI Prompt Management",
      description:
        "Lead AI adoption with confidence. TeamPrompt gives executives strategic planning prompts, board presentation templates, team communication frameworks, and full AI governance oversight across the organization.",
      keywords: [
        "executive AI prompts",
        "leadership AI tools",
        "strategic planning AI",
        "board presentation prompts",
        "AI governance executives",
        "C-suite AI management",
      ],
    },
    hero: {
      headline: "Lead your organization's AI strategy with confidence",
      subtitle:
        "Executives face a dual challenge: leveraging AI for strategic advantage while governing its use across the organization. TeamPrompt provides leadership-specific prompt templates for strategic planning, board presentations, and team communications — plus complete oversight into how every team uses AI. Set the standard for responsible AI adoption and ensure your organization captures AI's value without the risk.",
      badges: ["Strategic planning", "Board presentations", "AI governance"],
    },
    features: {
      sectionLabel: "Leadership",
      heading: "AI tools built for executive workflows",
      items: [
        {
          icon: "BarChart3",
          title: "Strategic planning prompts",
          description:
            "Templates for market analysis, growth strategy, OKR development, and scenario planning. Variables for {{timeframe}}, {{market}}, and {{strategic_goals}}.",
        },
        {
          icon: "BookOpen",
          title: "Board presentation templates",
          description:
            "Prompts that structure board updates, investor narratives, financial summaries, and strategic initiative overviews into compelling presentations.",
        },
        {
          icon: "Users",
          title: "Team communication frameworks",
          description:
            "Templates for all-hands talking points, organizational announcements, vision statements, and change management communications.",
        },
        {
          icon: "Eye",
          title: "AI governance dashboard",
          description:
            "Full visibility into AI usage across your organization. See which teams use AI, how often, and whether guardrails are in place.",
        },
        {
          icon: "ShieldAlert",
          title: "Organization-wide guardrails",
          description:
            "Set DLP policies, compliance rules, and quality guidelines that apply across every team. Protect sensitive data at the organizational level.",
        },
        {
          icon: "Lock",
          title: "Audit trail and compliance",
          description:
            "Every AI interaction is logged. Generate compliance reports for regulators, board members, and internal stakeholders.",
        },
      ],
    },
    benefits: {
      heading: "Why executives choose TeamPrompt",
      items: [
        "Make faster, AI-informed strategic decisions with structured prompt frameworks",
        "Prepare board presentations in a fraction of the time with proven templates",
        "Get full visibility into how every team in your organization uses AI",
        "Set organization-wide AI governance policies from a single platform",
        "Demonstrate responsible AI oversight to board members and regulators",
        "Ensure sensitive corporate data never leaks into AI models",
      ],
    },
    stats: [
      { value: "100%", label: "AI visibility" },
      { value: "Full", label: "Governance controls" },
      { value: "Board-ready", label: "Compliance reports" },
    ],
    faqs: [
      {
        question: "How does TeamPrompt help with AI governance?",
        answer:
          "TeamPrompt provides a centralized platform where executives can set organization-wide AI policies, monitor usage across teams, enforce DLP guardrails, and generate compliance reports — all without slowing teams down.",
      },
      {
        question: "Can I see how different departments use AI?",
        answer:
          "Yes. The analytics dashboard shows AI tool usage, prompt insertion frequency, DLP violations, and adoption trends across every team and department in your organization.",
      },
      {
        question: "Does it help with board presentations?",
        answer:
          "Yes. Use structured templates to generate board update narratives, strategic initiative summaries, market analyses, and financial overviews. Variables let you customize for each board meeting.",
      },
      {
        question: "How does it protect confidential corporate data?",
        answer:
          "DLP guardrails scan every outbound prompt for financial data, M&A details, strategic plans, and other confidential information. Policies are configurable at the organization level.",
      },
    ],
    cta: {
      headline: "Lead AI adoption",
      gradientText: "with governance built in.",
      subtitle:
        "See how TeamPrompt gives executives full AI oversight. Free plan available.",
    },
  },
  {
    slug: "for-consultants",
    category: "role",
    meta: {
      title: "TeamPrompt for Consultants | AI Prompt Management",
      description:
        "Deliver higher-quality client work faster with shared AI prompts for analysis frameworks, client deliverables, proposal templates, and knowledge management. TeamPrompt helps consultants and consulting firms scale expertise.",
      keywords: [
        "consultant AI prompts",
        "consulting AI tools",
        "client deliverable prompts",
        "analysis framework AI",
        "consulting proposal templates",
        "knowledge management AI",
      ],
    },
    hero: {
      headline: "AI prompts that scale your consulting expertise",
      subtitle:
        "Consultants thrive on repeatable frameworks, structured analysis, and polished deliverables. TeamPrompt turns your firm's best thinking into a shared library of AI prompts — analysis templates, deliverable generators, proposal frameworks, and knowledge management tools. Every consultant in your practice gets access to the same proven approaches, whether they are a first-year analyst or a senior partner. Scale expertise without scaling headcount.",
      badges: ["Client deliverables", "Analysis frameworks", "Proposal templates"],
    },
    features: {
      sectionLabel: "Consulting",
      heading: "Prompt templates for every consulting workflow",
      items: [
        {
          icon: "BookOpen",
          title: "Client deliverable templates",
          description:
            "Structured prompts for executive summaries, findings reports, recommendation decks, and implementation roadmaps. Variables for {{client}}, {{industry}}, and {{scope}}.",
        },
        {
          icon: "BarChart3",
          title: "Analysis framework prompts",
          description:
            "Templates built around SWOT, Porter's Five Forces, value chain analysis, and custom frameworks. Consistent analytical rigor across every engagement.",
        },
        {
          icon: "Zap",
          title: "Proposal generators",
          description:
            "Turn engagement details into polished proposals with prompts for scope definition, methodology, timeline, team structure, and pricing narrative.",
        },
        {
          icon: "Archive",
          title: "Knowledge management",
          description:
            "Capture and share institutional knowledge through prompts for case study documentation, lessons learned, and best practice codification.",
        },
        {
          icon: "Users",
          title: "Practice-wide sharing",
          description:
            "Share prompts across your practice, region, or the entire firm. Junior consultants access the same frameworks as seasoned partners.",
        },
        {
          icon: "Lock",
          title: "Protect client confidentiality",
          description:
            "DLP guardrails prevent client names, financials, strategy details, and proprietary data from reaching AI models. Essential for consulting trust.",
        },
      ],
    },
    benefits: {
      heading: "Why consulting firms choose TeamPrompt",
      items: [
        "Scale expertise by sharing your firm's best prompt frameworks across every consultant",
        "Produce polished client deliverables faster with structured AI templates",
        "Maintain analytical consistency with standardized framework prompts",
        "Protect client confidentiality with DLP guardrails on every AI interaction",
        "Onboard new consultants with a library of proven analysis and deliverable prompts",
        "Capture institutional knowledge in reusable prompt templates instead of tribal knowledge",
      ],
    },
    stats: [
      { value: "40%", label: "Faster deliverables" },
      { value: "100%", label: "Client confidentiality" },
      { value: "10x", label: "Knowledge reuse" },
    ],
    faqs: [
      {
        question: "Can I organize prompts by practice area?",
        answer:
          "Yes. Create separate categories for strategy, operations, technology, finance, or any practice area. Each category has its own prompts and permissions.",
      },
      {
        question: "How does it protect client data?",
        answer:
          "DLP guardrails scan every outbound prompt for client names, financial figures, strategy details, and proprietary information. Violations are blocked before reaching AI models, which is critical for maintaining client trust.",
      },
      {
        question: "Can junior consultants access the same prompts as partners?",
        answer:
          "Yes — or selectively. You control permissions at the category level. Share broadly to democratize expertise, or restrict sensitive frameworks to senior team members.",
      },
      {
        question: "Does it help with knowledge management?",
        answer:
          "Yes. Create templates for documenting case studies, capturing lessons learned, and codifying best practices. Turn ad-hoc knowledge into a searchable, reusable prompt library.",
      },
    ],
    cta: {
      headline: "Scale your consulting expertise",
      gradientText: "with shared AI prompts.",
      subtitle:
        "Start building your firm's prompt library. Free plan available.",
    },
  },
  {
    slug: "for-educators",
    category: "role",
    meta: {
      title: "TeamPrompt for Educators | AI Prompt Management",
      description:
        "Transform teaching with shared AI prompts for curriculum design, assignment creation, grading rubrics, and student feedback. TeamPrompt helps educators and institutions leverage AI responsibly and effectively.",
      keywords: [
        "educator AI prompts",
        "curriculum design AI",
        "assignment creation prompts",
        "grading rubric AI",
        "student feedback prompts",
        "teaching AI tools",
      ],
    },
    hero: {
      headline: "AI prompts that help educators teach better",
      subtitle:
        "Educators spend countless hours on curriculum design, assignment creation, grading rubrics, and student feedback. TeamPrompt gives teachers and institutions a shared library of education-specific AI prompts — templates for lesson planning, differentiated instruction, rubric generation, and personalized feedback. Share proven approaches across your department, school, or district so every educator benefits from collective expertise while maintaining academic integrity.",
      badges: ["Curriculum design", "Grading rubrics", "Student feedback"],
    },
    features: {
      sectionLabel: "Education",
      heading: "Prompt templates for every teaching workflow",
      items: [
        {
          icon: "BookOpen",
          title: "Curriculum design templates",
          description:
            "Prompts for lesson plans, unit outlines, learning objectives, and curriculum mapping. Variables for {{subject}}, {{grade_level}}, {{standards}}, and {{duration}}.",
        },
        {
          icon: "Braces",
          title: "Assignment creation prompts",
          description:
            "Generate diverse assignments, projects, and assessments. Templates support {{bloom_level}}, {{skill_focus}}, and {{accommodation_needs}} for differentiated instruction.",
        },
        {
          icon: "BarChart3",
          title: "Grading rubric generators",
          description:
            "Create detailed, criteria-based rubrics with consistent scoring dimensions. Templates align with learning objectives and academic standards.",
        },
        {
          icon: "Users",
          title: "Student feedback templates",
          description:
            "Structured prompts for constructive, personalized student feedback on essays, projects, and presentations. Variables for {{student_work}}, {{strengths}}, and {{areas_for_growth}}.",
        },
        {
          icon: "Globe",
          title: "Department-wide sharing",
          description:
            "Share prompts across a department, school, or district. New teachers get instant access to veteran educators' most effective AI approaches.",
        },
        {
          icon: "Shield",
          title: "Protect student information",
          description:
            "DLP guardrails prevent student names, grades, IEP details, and FERPA-protected information from reaching AI models.",
        },
      ],
    },
    benefits: {
      heading: "Why educators choose TeamPrompt",
      items: [
        "Design curriculum and lesson plans faster with structured AI templates",
        "Create differentiated assignments that address diverse learning needs",
        "Generate fair, consistent grading rubrics aligned to learning objectives",
        "Provide richer, more personalized student feedback at scale",
        "Share proven teaching prompts across departments and institutions",
        "Protect student data with FERPA-aware DLP guardrails",
      ],
    },
    stats: [
      { value: "60%", label: "Faster lesson planning" },
      { value: "100%", label: "FERPA compliance" },
      { value: "3x", label: "More personalized feedback" },
    ],
    faqs: [
      {
        question: "Can I create prompts for specific subjects and grade levels?",
        answer:
          "Yes. Template variables like {{subject}}, {{grade_level}}, and {{standards}} let you build prompts that adapt to any subject area and academic level from elementary through higher education.",
      },
      {
        question: "How does it protect student information?",
        answer:
          "DLP guardrails scan every outbound prompt for student names, grades, IEP details, behavioral records, and other FERPA-protected information. Sensitive data is blocked before reaching AI models.",
      },
      {
        question: "Can I share prompts with my department or school?",
        answer:
          "Yes. Create shared categories for your department, grade level team, school, or entire district. Control who can view and edit with granular permissions.",
      },
      {
        question: "Does it support differentiated instruction?",
        answer:
          "Yes. Build assignment templates with variables for accommodation needs, learning styles, and skill levels. Generate differentiated versions of the same assignment for diverse learners.",
      },
    ],
    cta: {
      headline: "Teach more effectively",
      gradientText: "with AI prompts that work.",
      subtitle:
        "Start building your educator prompt library. Free plan available.",
    },
  },
  {
    slug: "for-marketing-teams",
    category: "role",
    meta: { title: "TeamPrompt for Marketing Teams | AI Prompt Management", description: "Accelerate marketing with shared AI prompts for content creation, campaign strategy, SEO, social media, and brand messaging. TeamPrompt keeps your marketing team aligned.", keywords: ["marketing team AI prompts", "marketing AI tools", "content creation prompts", "marketing prompt templates", "AI for marketing teams"] },
    hero: { headline: "AI prompts built for marketing teams", subtitle: "Your marketing team uses AI for content, campaigns, social media, and analysis every day. TeamPrompt organizes those prompts into a shared library with brand voice templates, DLP scanning, and one-click access inside every AI tool.", badges: ["Content creation", "Campaign strategy", "Brand voice"] },
    features: { sectionLabel: "Marketing", heading: "Built for marketing workflows", items: [
      { icon: "FileText", title: "Content creation templates", description: "Blog posts, social media, email campaigns, ad copy — standardized templates that maintain brand voice across all content." },
      { icon: "BookOpen", title: "Brand voice prompts", description: "System prompt templates that encode your brand guidelines so every AI output sounds authentically on-brand." },
      { icon: "BarChart3", title: "Campaign analysis prompts", description: "Templates for analyzing campaign performance, competitor research, and market trends with consistent methodology." },
      { icon: "Users", title: "Cross-team sharing", description: "Share approved prompts across content, social, email, and growth teams with category-based permissions." },
      { icon: "Shield", title: "DLP for marketing data", description: "Scan prompts for customer data, unreleased product details, and confidential strategy information before it reaches AI tools." },
      { icon: "Zap", title: "Works in every AI tool", description: "Access marketing prompts directly inside ChatGPT, Claude, Gemini, and Copilot through the browser extension." },
    ] },
    benefits: { heading: "Why marketing teams choose TeamPrompt", items: ["Maintain brand voice consistency across all AI-generated content", "Reduce content creation time with proven, reusable templates", "Protect unreleased product information and campaign strategies from AI exposure", "Onboard new marketers faster with ready-to-use prompt libraries", "Track which prompts produce the best marketing results", "Scale AI adoption across the entire marketing organization"] },
    faqs: [
      { question: "Can I enforce brand voice through prompts?", answer: "Yes. Create system prompt templates that include your brand guidelines, tone, vocabulary, and style rules. Every team member uses the same foundation for consistent brand voice." },
      { question: "Does it work for social media content?", answer: "Yes. Create templates for each platform with appropriate length, tone, and format constraints. Variables let you customize for each post while maintaining consistency." },
      { question: "How do I protect campaign strategies?", answer: "TeamPrompt's DLP scanning catches confidential information before it reaches AI tools. Combined with access controls, your strategic data stays protected." },
    ],
    cta: { headline: "Power your marketing", gradientText: "with shared AI prompts.", subtitle: "Brand-consistent templates for your whole team. Start free." },
  },
  {
    slug: "for-software-engineers",
    category: "role",
    meta: { title: "TeamPrompt for Software Engineers | AI Prompt Management", description: "Boost your development workflow with shared AI prompts for code generation, debugging, documentation, and architecture. TeamPrompt for individual developers and engineering teams.", keywords: ["software engineer AI prompts", "developer AI tools", "coding prompts", "programming AI templates", "AI for developers"] },
    hero: { headline: "AI prompts designed for software engineers", subtitle: "From code generation to debugging to documentation, software engineers rely on AI daily. TeamPrompt gives you a personal and team library of proven prompts accessible inside every AI tool you use.", badges: ["Code generation", "Debugging", "Documentation"] },
    features: { sectionLabel: "Engineering", heading: "Built for developer workflows", items: [
      { icon: "FileText", title: "Code generation templates", description: "Standardized prompts for generating code with proper context, language specifications, and coding standards." },
      { icon: "Eye", title: "Debugging prompts", description: "Templates that structure error context, stack traces, and environment details for faster, more accurate debugging with AI." },
      { icon: "BookOpen", title: "Documentation generators", description: "Prompts for API docs, README files, inline comments, and technical documentation that follow your team's standards." },
      { icon: "GitBranch", title: "Version-controlled prompts", description: "Track every change to your engineering prompts with full history, diffs, and the ability to roll back." },
      { icon: "Shield", title: "Code and secret protection", description: "DLP scanning catches API keys, tokens, connection strings, and proprietary code before they reach AI models." },
      { icon: "Globe", title: "Works everywhere", description: "Access your prompt library from ChatGPT, Claude, Gemini, and Copilot without switching tabs." },
    ] },
    benefits: { heading: "Why software engineers choose TeamPrompt", items: ["Stop rewriting the same debugging and code review prompts from scratch", "Protect API keys and secrets from leaking into AI tools with DLP scanning", "Share proven prompt patterns across the engineering team", "Version control prompts just like you version code", "Access prompts directly inside your AI tools through the browser extension", "Reduce context-switching between AI tools and your prompt collection"] },
    faqs: [
      { question: "Does it work alongside GitHub Copilot?", answer: "TeamPrompt complements Copilot by managing the prompts you use in ChatGPT, Claude, and other conversational AI tools for longer-form tasks like architecture, debugging, and documentation." },
      { question: "Can I share prompts with my team?", answer: "Yes. Create shared categories for your engineering team with prompts for code review, debugging, documentation, and architecture discussions." },
      { question: "How does it protect source code?", answer: "DLP scanning detects code patterns, API keys, tokens, and credentials before prompts reach AI models. Configure custom rules for your codebase's specific patterns." },
    ],
    cta: { headline: "Level up your", gradientText: "AI-powered development.", subtitle: "Prompt templates for every engineering task. Start free." },
  },
  {
    slug: "for-legal-teams",
    category: "role",
    meta: { title: "TeamPrompt for Legal Teams | AI Prompt Management", description: "Streamline legal work with shared AI prompts for contract review, research, compliance analysis, and document drafting. Secure and governed.", keywords: ["legal team AI prompts", "legal AI tools", "contract review AI", "legal prompt templates", "AI for lawyers"] },
    hero: { headline: "AI prompts built for legal professionals", subtitle: "Legal teams need AI tools with the highest security and governance standards. TeamPrompt provides DLP-scanned, version-controlled prompts for contract review, research, and document drafting with the controls legal departments require.", badges: ["Contract review", "Legal research", "Compliance"] },
    features: { sectionLabel: "Legal", heading: "Built for legal workflows", items: [
      { icon: "FileText", title: "Contract analysis templates", description: "Structured prompts for reviewing contracts, identifying risk clauses, and comparing terms across agreements." },
      { icon: "BookOpen", title: "Legal research prompts", description: "Templates for case research, regulatory analysis, and precedent review with consistent methodology." },
      { icon: "Shield", title: "Confidentiality protection", description: "DLP scanning prevents client names, case details, and privileged information from reaching AI models." },
      { icon: "Lock", title: "Access controls", description: "Restrict prompt access by practice area and sensitivity level. Matter-specific prompts stay with authorized personnel." },
      { icon: "Eye", title: "Audit trails", description: "Complete logging of prompt usage for professional responsibility and compliance requirements." },
      { icon: "Scale", title: "Compliance templates", description: "Prompts for regulatory compliance analysis, policy review, and governance documentation." },
    ] },
    benefits: { heading: "Why legal teams choose TeamPrompt", items: ["Protect attorney-client privilege with DLP scanning on every prompt", "Standardize contract review quality across the legal department", "Maintain complete audit trails for professional responsibility", "Reduce research time with proven legal research prompt templates", "Share best practices across practice areas with controlled access", "Enable legal AI adoption with the governance controls your department requires"] },
    faqs: [
      { question: "How does it protect confidential client information?", answer: "DLP scanning detects and blocks client names, case numbers, and other sensitive legal information before prompts reach AI models. Access controls ensure only authorized attorneys see matter-specific prompts." },
      { question: "Can I create practice-area-specific categories?", answer: "Yes. Create categories for corporate, litigation, IP, employment, and any practice area. Each has its own permissions and prompt collections." },
      { question: "Is there an audit trail for compliance?", answer: "Yes. TeamPrompt logs all prompt activity with timestamps and user attribution, supporting legal department compliance and professional responsibility requirements." },
    ],
    cta: { headline: "Secure AI for", gradientText: "legal teams.", subtitle: "DLP protection and governance for legal AI usage. Start free." },
  },
  {
    slug: "for-data-analysts",
    category: "role",
    meta: { title: "TeamPrompt for Data Analysts | AI Prompt Management", description: "Supercharge data analysis with shared AI prompts for SQL generation, data interpretation, visualization recommendations, and report writing.", keywords: ["data analyst AI prompts", "data analysis AI tools", "SQL AI prompts", "analytics prompt templates", "AI for data analysts"] },
    hero: { headline: "AI prompts built for data analysts", subtitle: "Data analysts use AI for SQL generation, data interpretation, visualization, and reporting. TeamPrompt organizes your analytical prompts into a shared library that produces consistent, accurate results across your analytics team.", badges: ["SQL generation", "Data interpretation", "Reporting"] },
    features: { sectionLabel: "Analytics", heading: "Built for data workflows", items: [
      { icon: "BarChart3", title: "SQL generation templates", description: "Prompts that generate accurate SQL queries with proper table context, join logic, and performance considerations." },
      { icon: "Eye", title: "Data interpretation prompts", description: "Templates for analyzing data patterns, identifying trends, and generating insights from analytical results." },
      { icon: "FileText", title: "Report writing templates", description: "Structured prompts for turning data findings into clear, actionable reports for stakeholders." },
      { icon: "BookOpen", title: "Visualization guidance", description: "Prompts that recommend chart types, layout, and design for effective data visualization." },
      { icon: "Shield", title: "Data protection", description: "DLP scanning prevents raw data, customer records, and database credentials from reaching AI tools." },
      { icon: "Users", title: "Team sharing", description: "Share proven analytical prompts across the data team so everyone uses the same rigorous methodology." },
    ] },
    benefits: { heading: "Why data analysts choose TeamPrompt", items: ["Generate accurate SQL faster with context-rich prompt templates", "Standardize analytical methodology across the data team", "Protect sensitive data from reaching AI tools with DLP scanning", "Share proven analytical approaches with junior analysts", "Reduce time from data to insights with reusable prompt workflows", "Track which analytical prompts produce the best results"] },
    faqs: [
      { question: "Can I include database schema context in prompts?", answer: "Yes. Create templates with variables for table names, column descriptions, and relationships. Include schema context to help AI generate accurate SQL without exposing actual data." },
      { question: "How do I protect sensitive data?", answer: "DLP scanning catches raw data, customer records, and credentials before they reach AI models. Use templates with variables for context instead of pasting actual data." },
      { question: "Does it work with Python and R analysis?", answer: "Yes. Create templates for any analytical language. The same library works across SQL, Python, R, and natural language analysis prompts." },
    ],
    cta: { headline: "Analyze data faster", gradientText: "with shared prompts.", subtitle: "Analytical prompt templates for your team. Start free." },
  },
  {
    slug: "for-ctos",
    category: "role",
    meta: { title: "TeamPrompt for CTOs | AI Strategy & Governance", description: "Manage AI adoption across your engineering organization. Governance, security, and productivity tools for CTOs overseeing AI-powered teams.", keywords: ["CTO AI tools", "CTO AI governance", "AI strategy CTO", "engineering AI management", "CTO prompt management"] },
    hero: { headline: "AI governance and productivity for CTOs", subtitle: "As CTO, you need to enable AI productivity while managing security risks. TeamPrompt gives you the governance, DLP scanning, and analytics to scale AI adoption safely across your engineering organization.", badges: ["AI governance", "Engineering scale", "Security"] },
    features: { sectionLabel: "CTO Tools", heading: "What CTOs need for AI governance", items: [
      { icon: "Shield", title: "DLP across all AI tools", description: "One security layer that scans prompts across ChatGPT, Claude, Gemini, and every AI tool your team uses." },
      { icon: "BarChart3", title: "Adoption analytics", description: "Dashboard showing AI usage across teams, departments, and tools. Measure ROI and identify adoption gaps." },
      { icon: "Lock", title: "Access management", description: "Role-based controls that scale from small teams to large engineering organizations." },
      { icon: "Eye", title: "Audit and compliance", description: "Complete audit trails for SOC 2, GDPR, and other compliance frameworks your organization operates under." },
      { icon: "Users", title: "Organization-wide templates", description: "Standardize AI usage across engineering with shared prompt libraries and quality standards." },
      { icon: "Scale", title: "Policy enforcement", description: "Technical enforcement of AI usage policies rather than relying on engineer self-governance." },
    ] },
    benefits: { heading: "Why CTOs choose TeamPrompt", items: ["Scale AI adoption safely with built-in governance and DLP scanning", "Maintain SOC 2 and compliance posture as AI tool usage grows", "Demonstrate AI ROI to the board with concrete usage analytics", "Prevent secret and code leakage across all AI tools with one security layer", "Standardize AI practices across distributed engineering teams", "Enable innovation while managing the risks that keep you up at night"] },
    faqs: [
      { question: "How does this fit into our security stack?", answer: "TeamPrompt adds a DLP layer at the browser level, complementing your existing security tools. It catches data before it reaches third-party AI services — a gap most security stacks do not cover." },
      { question: "Can I deploy it across the whole engineering org?", answer: "Yes. TeamPrompt supports enterprise deployment through Chrome policies and standard extension management. Scale from a pilot team to thousands of engineers." },
      { question: "What compliance frameworks does it support?", answer: "TeamPrompt's DLP, access controls, and audit logging support SOC 2, GDPR, HIPAA, and other frameworks. Features map directly to common compliance requirements." },
    ],
    cta: { headline: "Govern AI usage", gradientText: "across your org.", subtitle: "Enterprise AI governance for technology leaders. Start free." },
  },
  {
    slug: "for-cisos",
    category: "role",
    meta: { title: "TeamPrompt for CISOs | AI Security & DLP", description: "Protect your organization from AI data leakage with DLP scanning, access controls, and audit trails. Security-first AI governance for CISOs.", keywords: ["CISO AI security", "AI DLP CISO", "AI security tools", "CISO AI governance", "AI data protection security"] },
    hero: { headline: "AI security controls CISOs can trust", subtitle: "AI tools are the newest data exfiltration vector. TeamPrompt gives CISOs the DLP scanning, access controls, and audit trails needed to secure AI usage across the organization without blocking productivity.", badges: ["DLP", "Audit trails", "Access controls"] },
    features: { sectionLabel: "Security", heading: "Security controls for AI usage", items: [
      { icon: "Shield", title: "Real-time DLP scanning", description: "Every prompt scanned for PII, credentials, API keys, and custom patterns before reaching any AI model." },
      { icon: "Eye", title: "Complete audit trails", description: "Comprehensive logging of all AI interactions, DLP events, and user activity for incident investigation." },
      { icon: "Lock", title: "Access management", description: "Role-based access controls that enforce least-privilege principles for AI tool usage." },
      { icon: "ShieldAlert", title: "Incident detection", description: "Automated detection of sensitive data exposure attempts with alerting and blocking capabilities." },
      { icon: "BarChart3", title: "Security dashboards", description: "Real-time visibility into DLP events, usage patterns, and security metrics across the organization." },
      { icon: "Scale", title: "Compliance reporting", description: "Reports that demonstrate AI security controls for SOC 2, GDPR, HIPAA, and other audit requirements." },
    ] },
    benefits: { heading: "Why CISOs choose TeamPrompt", items: ["Close the AI data leakage gap that traditional security tools miss", "Demonstrate AI governance maturity to auditors and the board", "Prevent the most common AI security incident — accidental data exposure", "Maintain compliance posture as AI adoption grows across the organization", "Get visibility into shadow AI and unauthorized tool usage", "Enable AI adoption safely rather than trying to block it entirely"] },
    faqs: [
      { question: "What data patterns does DLP catch?", answer: "SSNs, credit cards, API keys, AWS credentials, email addresses, phone numbers, and custom patterns. Configure detection rules for your organization's specific sensitive data types." },
      { question: "How does it integrate with our SIEM?", answer: "TeamPrompt provides audit logs and security event data. Enterprise plans can discuss integration options for feeding AI security events into your existing SIEM." },
      { question: "Can I enforce DLP across the entire organization?", answer: "Yes. Deploy the browser extension through Chrome enterprise policies and configure DLP rules centrally. All users get consistent scanning regardless of which AI tool they use." },
    ],
    cta: { headline: "Secure AI usage", gradientText: "organization-wide.", subtitle: "DLP, audit trails, and access controls for AI. Start free." },
  },
  {
    slug: "for-compliance-officers",
    category: "role",
    meta: { title: "TeamPrompt for Compliance Officers | AI Compliance", description: "Ensure AI tool usage meets regulatory requirements. DLP scanning, audit trails, and governance controls for compliance officers managing AI risk.", keywords: ["compliance officer AI", "AI compliance tools", "regulatory AI compliance", "AI audit compliance", "compliance AI governance"] },
    hero: { headline: "AI compliance tools for compliance officers", subtitle: "Compliance officers need to ensure AI usage meets regulatory requirements without slowing business innovation. TeamPrompt provides the controls, audit trails, and reporting you need for AI compliance.", badges: ["Audit trails", "Regulatory", "Governance"] },
    features: { sectionLabel: "Compliance", heading: "Compliance controls for AI usage", items: [
      { icon: "Scale", title: "Regulatory alignment", description: "Controls that map to GDPR, HIPAA, SOC 2, CCPA, and other frameworks your organization operates under." },
      { icon: "Eye", title: "Comprehensive audit trails", description: "Every AI interaction logged with timestamps, users, and actions for regulatory audits and investigations." },
      { icon: "Shield", title: "Data protection enforcement", description: "DLP scanning that automatically enforces data handling policies across all AI tools." },
      { icon: "FileText", title: "Compliance reporting", description: "Generate reports on AI usage, DLP events, and policy adherence for regulatory submissions and internal audits." },
      { icon: "Lock", title: "Access controls", description: "Role-based access that supports data minimization and least-privilege requirements." },
      { icon: "Users", title: "Policy documentation", description: "Document and enforce AI usage policies with technical controls that back up written procedures." },
    ] },
    benefits: { heading: "Why compliance officers choose TeamPrompt", items: ["Demonstrate AI governance to regulators with comprehensive audit trails", "Enforce data protection policies automatically through DLP scanning", "Meet documentation requirements with detailed AI usage records", "Reduce compliance risk from uncontrolled AI tool adoption", "Support multiple regulatory frameworks with one set of controls", "Enable business AI adoption with compliant guardrails"] },
    faqs: [
      { question: "Which regulatory frameworks does TeamPrompt support?", answer: "TeamPrompt's controls support GDPR, HIPAA, SOC 2, CCPA, PCI DSS, and other frameworks. DLP scanning, audit trails, and access controls map to common compliance requirements across frameworks." },
      { question: "Can I generate reports for auditors?", answer: "TeamPrompt provides usage analytics, DLP event tracking, and activity logs. These support compliance reporting and audit evidence requirements." },
      { question: "How does it handle data residency requirements?", answer: "TeamPrompt's DLP scanning prevents sensitive data from reaching AI providers, reducing data residency concerns. For specific residency requirements, contact the team for enterprise options." },
    ],
    cta: { headline: "AI compliance", gradientText: "made manageable.", subtitle: "Audit trails and governance for AI-using organizations. Start free." },
  },
  {
    slug: "for-security-teams",
    category: "role",
    meta: { title: "TeamPrompt for Security Teams | AI Security Operations", description: "Security operations tools for managing AI risk. DLP scanning, threat detection, incident response, and security monitoring for AI tool usage.", keywords: ["security team AI tools", "AI security operations", "AI DLP security team", "security AI monitoring", "AI threat management"] },
    hero: { headline: "AI security operations for security teams", subtitle: "Security teams need to protect the organization from AI-related risks without becoming a blocker. TeamPrompt provides DLP scanning, monitoring, and incident response tools that integrate into your security operations.", badges: ["DLP operations", "Monitoring", "Incident response"] },
    features: { sectionLabel: "Security Ops", heading: "Security operations for AI", items: [
      { icon: "Shield", title: "DLP scanning engine", description: "Real-time scanning of all AI prompts with configurable detection rules, custom patterns, and enforcement modes." },
      { icon: "ShieldAlert", title: "Threat detection", description: "Identify suspicious patterns like bulk data extraction attempts, unusual usage spikes, and policy violations." },
      { icon: "Eye", title: "Security monitoring", description: "Dashboards showing DLP events, user activity, and security metrics in real time." },
      { icon: "Lock", title: "Access management", description: "Manage AI tool access with role-based controls and least-privilege enforcement." },
      { icon: "BarChart3", title: "Incident investigation", description: "Detailed logs and event history for investigating AI-related security incidents." },
      { icon: "FileText", title: "Security reporting", description: "Generate security reports for leadership, compliance, and audit teams." },
    ] },
    benefits: { heading: "Why security teams choose TeamPrompt", items: ["Close the AI data leakage gap in your security perimeter", "Detect and respond to AI-related security events in real time", "Investigate incidents with comprehensive audit trails", "Enforce security policies consistently across all AI tools", "Reduce false positives with tunable detection rules", "Enable safe AI adoption rather than blocking it entirely"] },
    faqs: [
      { question: "Can I customize DLP detection rules?", answer: "Yes. Configure built-in detectors, add custom patterns, set enforcement modes (block, warn, log), and tune sensitivity for each rule." },
      { question: "How does it handle incident investigation?", answer: "TeamPrompt maintains detailed logs of all DLP events and user activity. Security teams can review event timelines, user actions, and detection details for thorough incident investigation." },
      { question: "Does it replace our existing DLP?", answer: "TeamPrompt complements your existing DLP by covering the AI tool gap. Traditional DLP does not inspect browser-based AI interactions. TeamPrompt fills this specific gap." },
    ],
    cta: { headline: "Secure AI tools", gradientText: "with real-time DLP.", subtitle: "Security operations for AI-using organizations. Start free." },
  },
  {
    slug: "for-it-admins",
    category: "role",
    meta: { title: "TeamPrompt for IT Admins | AI Tool Management", description: "Manage AI tool deployment, user provisioning, and security policies across your organization. Enterprise administration for AI prompt management.", keywords: ["IT admin AI tools", "AI administration", "manage AI deployment", "IT AI governance", "AI tool management"] },
    hero: { headline: "AI tool management for IT administrators", subtitle: "IT admins need to deploy, manage, and secure AI tools across the organization. TeamPrompt provides centralized administration, user management, and security controls that fit into your existing IT workflows.", badges: ["Deployment", "User management", "Administration"] },
    features: { sectionLabel: "IT Admin", heading: "Administration tools for AI management", items: [
      { icon: "Users", title: "User provisioning", description: "Add, remove, and manage users with role-based access controls. Support for team-level and organization-level management." },
      { icon: "Globe", title: "Extension deployment", description: "Deploy the browser extension through Chrome enterprise policies, MDM, or group policy for consistent rollout." },
      { icon: "Shield", title: "Security configuration", description: "Configure DLP rules, enforcement modes, and custom patterns centrally for the entire organization." },
      { icon: "Lock", title: "Access policies", description: "Set organization-wide policies for AI tool access, data handling, and user permissions." },
      { icon: "BarChart3", title: "Usage dashboards", description: "Monitor adoption, usage patterns, and security events across all teams and departments." },
      { icon: "Eye", title: "Audit logging", description: "Comprehensive logs for security monitoring, compliance, and troubleshooting." },
    ] },
    benefits: { heading: "Why IT admins choose TeamPrompt", items: ["Deploy and manage AI governance with familiar enterprise tools", "Provision users and manage access without complex configuration", "Configure security policies centrally for consistent enforcement", "Monitor AI adoption and usage across the organization", "Support compliance requirements with built-in audit logging", "Scale from pilot to enterprise with the same administration tools"] },
    faqs: [
      { question: "How do I deploy the extension to all users?", answer: "Use Chrome enterprise policies, Intune, or your MDM solution to deploy and configure the TeamPrompt extension across your organization." },
      { question: "Can I manage users in bulk?", answer: "TeamPrompt supports team-level user management. Add users individually or manage team membership for efficient provisioning." },
      { question: "What admin controls are available?", answer: "Admins can manage users, configure DLP rules, set permissions, view analytics, and manage billing. All settings are accessible from the web dashboard." },
    ],
    cta: { headline: "Manage AI tools", gradientText: "across your org.", subtitle: "Enterprise administration for AI governance. Start free." },
  },
  {
    slug: "for-researchers",
    category: "role",
    meta: { title: "TeamPrompt for Researchers | AI Prompt Management", description: "Accelerate research with shared AI prompts for literature review, data analysis, hypothesis generation, and academic writing. Secure and collaborative.", keywords: ["researcher AI prompts", "academic AI tools", "research prompt templates", "AI for researchers", "literature review AI"] },
    hero: { headline: "AI prompts built for researchers", subtitle: "Researchers use AI for literature review, data analysis, hypothesis generation, and writing. TeamPrompt organizes your research prompts into a shared library with version control and DLP protection for sensitive research data.", badges: ["Literature review", "Data analysis", "Writing"] },
    features: { sectionLabel: "Research", heading: "Built for research workflows", items: [
      { icon: "BookOpen", title: "Literature review prompts", description: "Templates for systematic reviews, paper summarization, citation analysis, and research gap identification." },
      { icon: "BarChart3", title: "Data analysis templates", description: "Prompts for statistical analysis, data interpretation, and methodology design across research domains." },
      { icon: "FileText", title: "Academic writing prompts", description: "Templates for abstracts, introductions, methodology sections, and discussion writing with academic standards." },
      { icon: "Shield", title: "Research data protection", description: "DLP scanning prevents sensitive research data, participant information, and proprietary findings from reaching AI tools." },
      { icon: "GitBranch", title: "Methodology versioning", description: "Track changes to research prompt methodology with full version history for reproducibility." },
      { icon: "Users", title: "Lab collaboration", description: "Share prompt templates across research teams and labs with category-based organization." },
    ] },
    benefits: { heading: "Why researchers choose TeamPrompt", items: ["Accelerate literature review with systematic prompt templates", "Protect sensitive research data and participant information", "Share proven research methodologies across labs and teams", "Maintain reproducibility with version-controlled prompt methods", "Reduce time on routine writing with academic prompt templates", "Collaborate on research prompts across distributed teams"] },
    faqs: [
      { question: "Can I create prompts for specific research methodologies?", answer: "Yes. Create templates for qualitative analysis, quantitative methods, mixed methods, and any methodology your team uses. Variables customize for each study." },
      { question: "How does it protect research participant data?", answer: "DLP scanning catches participant names, identifiers, and other sensitive research data before it reaches AI models. Essential for IRB compliance and research ethics." },
      { question: "Can research teams share prompts across institutions?", answer: "TeamPrompt supports team-level sharing. Create shared categories for collaborative research projects with appropriate access controls." },
    ],
    cta: { headline: "Accelerate research", gradientText: "with shared AI prompts.", subtitle: "Secure, version-controlled research prompts. Start free." },
  },
  {
    slug: "for-procurement",
    category: "role",
    meta: { title: "TeamPrompt for Procurement Teams | AI Prompt Management", description: "Streamline procurement with shared AI prompts for RFP analysis, vendor evaluation, contract review, and cost optimization.", keywords: ["procurement AI prompts", "procurement AI tools", "RFP analysis AI", "vendor evaluation prompts", "AI for procurement"] },
    hero: { headline: "AI prompts built for procurement teams", subtitle: "Procurement teams use AI for RFP analysis, vendor evaluation, contract review, and market research. TeamPrompt provides secure, shared templates that standardize procurement processes across your team.", badges: ["RFP analysis", "Vendor evaluation", "Cost optimization"] },
    features: { sectionLabel: "Procurement", heading: "Built for procurement workflows", items: [
      { icon: "FileText", title: "RFP analysis templates", description: "Structured prompts for analyzing RFP responses, comparing vendor proposals, and scoring submissions consistently." },
      { icon: "Eye", title: "Vendor evaluation prompts", description: "Templates for evaluating vendor capabilities, financial stability, compliance, and risk across standardized criteria." },
      { icon: "Scale", title: "Contract analysis", description: "Prompts for reviewing procurement contracts, identifying unfavorable terms, and comparing across vendors." },
      { icon: "BarChart3", title: "Market research", description: "Templates for analyzing market pricing, identifying alternatives, and benchmarking supplier costs." },
      { icon: "Shield", title: "Pricing protection", description: "DLP scanning prevents confidential pricing, contract terms, and vendor information from reaching AI tools." },
      { icon: "Users", title: "Team standardization", description: "Shared templates ensure every procurement analyst follows the same evaluation methodology." },
    ] },
    benefits: { heading: "Why procurement teams choose TeamPrompt", items: ["Standardize vendor evaluation with consistent prompt templates", "Protect confidential pricing and contract information with DLP scanning", "Reduce RFP analysis time with proven analytical prompts", "Share procurement best practices across the team", "Maintain audit trails for procurement decision documentation", "Onboard new procurement staff faster with ready-to-use templates"] },
    faqs: [
      { question: "Can I create templates for specific procurement categories?", answer: "Yes. Create categories for IT procurement, facilities, professional services, and any procurement area. Each has its own templates and permissions." },
      { question: "How does it protect vendor pricing information?", answer: "DLP scanning catches pricing data, contract terms, and vendor confidential information before it reaches AI models. Essential for maintaining competitive procurement processes." },
      { question: "Can procurement teams share templates across business units?", answer: "Yes. Create shared procurement categories that all business units can access, with unit-specific categories for specialized needs." },
    ],
    cta: { headline: "Streamline procurement", gradientText: "with AI prompts.", subtitle: "Standardized templates for procurement excellence. Start free." },
  },
  {
    slug: "for-operations",
    category: "role",
    meta: { title: "TeamPrompt for Operations Teams | AI Prompt Management", description: "Optimize operations with shared AI prompts for process documentation, workflow analysis, reporting, and continuous improvement.", keywords: ["operations AI prompts", "operations AI tools", "process AI templates", "AI for operations", "workflow optimization AI"] },
    hero: { headline: "AI prompts built for operations teams", subtitle: "Operations teams use AI for process documentation, workflow optimization, reporting, and analysis. TeamPrompt gives your ops team a shared library of templates that standardize these workflows across the organization.", badges: ["Process docs", "Workflow analysis", "Reporting"] },
    features: { sectionLabel: "Operations", heading: "Built for operations workflows", items: [
      { icon: "ClipboardList", title: "Process documentation", description: "Templates for creating SOPs, runbooks, and process documentation from operational knowledge." },
      { icon: "BarChart3", title: "Operational analysis", description: "Prompts for analyzing KPIs, identifying bottlenecks, and recommending process improvements." },
      { icon: "FileText", title: "Report generation", description: "Templates for daily, weekly, and monthly operational reports with consistent formatting and metrics." },
      { icon: "Eye", title: "Incident analysis", description: "Structured prompts for root cause analysis, post-mortems, and corrective action planning." },
      { icon: "Shield", title: "Data protection", description: "DLP scanning prevents operational data, internal metrics, and sensitive process details from reaching AI tools." },
      { icon: "Users", title: "Cross-functional sharing", description: "Share operational templates across departments while maintaining appropriate access controls." },
    ] },
    benefits: { heading: "Why operations teams choose TeamPrompt", items: ["Standardize process documentation across the organization", "Reduce reporting time with proven templates and consistent formats", "Protect sensitive operational data with DLP scanning", "Share operational best practices across teams and locations", "Accelerate continuous improvement with analytical prompt templates", "Onboard new ops team members with ready-to-use templates"] },
    faqs: [
      { question: "Can I create templates for specific operational processes?", answer: "Yes. Create templates for each process type — supply chain, facility management, IT operations, and more. Variables customize for each specific process instance." },
      { question: "How do reporting templates work?", answer: "Create templates with variables for date ranges, metrics, and departments. Fill in the specifics each reporting period for consistent, efficient report generation." },
      { question: "Can operations share templates across locations?", answer: "Yes. Shared categories make standardized operational templates available across all locations while allowing local customization through variables." },
    ],
    cta: { headline: "Optimize operations", gradientText: "with AI prompts.", subtitle: "Standardized templates for operational excellence. Start free." },
  },
  {
    slug: "for-project-managers",
    category: "role",
    meta: { title: "TeamPrompt for Project Managers | AI Prompt Management", description: "Boost project management with shared AI prompts for status reports, risk analysis, stakeholder communication, and project planning.", keywords: ["project manager AI prompts", "PM AI tools", "project management AI", "status report prompts", "AI for project managers"] },
    hero: { headline: "AI prompts built for project managers", subtitle: "Project managers use AI for status reports, risk assessments, stakeholder communications, and planning. TeamPrompt organizes your PM prompts into templates that save hours every week.", badges: ["Status reports", "Risk analysis", "Planning"] },
    features: { sectionLabel: "Project Management", heading: "Built for PM workflows", items: [
      { icon: "FileText", title: "Status report templates", description: "Generate consistent status reports with templates that capture progress, risks, blockers, and next steps." },
      { icon: "ShieldAlert", title: "Risk analysis prompts", description: "Structured templates for identifying, assessing, and planning mitigation for project risks." },
      { icon: "Users", title: "Stakeholder communication", description: "Templates for executive updates, team briefings, and client communications with appropriate detail levels." },
      { icon: "ClipboardList", title: "Planning prompts", description: "Prompts for creating project plans, work breakdown structures, and resource allocation analysis." },
      { icon: "BookOpen", title: "Meeting templates", description: "Templates for agenda creation, meeting summaries, and action item tracking." },
      { icon: "BarChart3", title: "Project analytics", description: "Prompts for analyzing project metrics, velocity trends, and resource utilization." },
    ] },
    benefits: { heading: "Why project managers choose TeamPrompt", items: ["Cut status report writing time from hours to minutes", "Standardize project communication across all PMs in your organization", "Share proven risk analysis and planning templates", "Ensure consistent stakeholder updates regardless of which PM sends them", "Track which project templates save the most time", "Onboard new PMs with ready-to-use template libraries"] },
    faqs: [
      { question: "Can I customize templates for different project types?", answer: "Yes. Create templates for agile, waterfall, and hybrid methodologies. Variables let you adapt each template for the specific project context." },
      { question: "How do status report templates work?", answer: "Fill in variables like project name, time period, and key metrics. The template generates a consistent, professional status report that follows your organization's format." },
      { question: "Can all PMs share the same templates?", answer: "Yes. Create a PM category with shared templates. Individual PMs can also maintain personal prompts for specialized needs." },
    ],
    cta: { headline: "Save hours on", gradientText: "project management.", subtitle: "PM-optimized prompt templates. Start free." },
  },
  {
    slug: "for-content-teams",
    category: "role",
    meta: { title: "TeamPrompt for Content Teams | AI Prompt Management", description: "Scale content production with shared AI prompts for writing, editing, SEO optimization, and content strategy. Brand-consistent templates.", keywords: ["content team AI prompts", "content creation AI", "writing AI templates", "SEO content prompts", "AI for content teams"] },
    hero: { headline: "AI prompts built for content teams", subtitle: "Content teams need to produce high-quality content at scale while maintaining brand voice. TeamPrompt provides shared templates for writing, editing, SEO, and content strategy that keep your entire content operation aligned.", badges: ["Content creation", "SEO", "Brand voice"] },
    features: { sectionLabel: "Content", heading: "Built for content workflows", items: [
      { icon: "FileText", title: "Writing templates", description: "Blog posts, landing pages, email sequences, white papers — standardized templates that maintain voice and quality." },
      { icon: "BookOpen", title: "Brand voice system prompts", description: "System prompts that encode your brand guidelines so every AI-generated piece sounds authentically on-brand." },
      { icon: "Eye", title: "SEO optimization prompts", description: "Templates for keyword research, meta descriptions, content optimization, and search intent analysis." },
      { icon: "ClipboardList", title: "Editing and review", description: "Prompts for proofreading, style checking, readability improvement, and content quality assessment." },
      { icon: "Shield", title: "Content protection", description: "DLP scanning prevents unreleased information, internal data, and confidential details from appearing in AI content." },
      { icon: "BarChart3", title: "Content analytics", description: "Track which content templates are used most and produce the best results." },
    ] },
    benefits: { heading: "Why content teams choose TeamPrompt", items: ["Scale content production without sacrificing brand voice consistency", "Reduce content creation time with proven, reusable templates", "Maintain quality standards across writers of all experience levels", "Protect confidential information from appearing in AI-generated content", "Share SEO best practices through standardized optimization templates", "Track which templates produce the best-performing content"] },
    faqs: [
      { question: "How do I maintain brand voice with AI?", answer: "Create system prompt templates that include your brand voice guidelines, tone attributes, and vocabulary rules. Every content piece starts from the same brand foundation." },
      { question: "Can I create templates for different content types?", answer: "Yes. Create categories for blog posts, social media, email, landing pages, and any content type. Each has its own templates optimized for that format." },
      { question: "How do SEO templates work?", answer: "SEO templates include variables for target keywords, search intent, and content parameters. They guide AI to create SEO-optimized content while maintaining natural readability." },
    ],
    cta: { headline: "Scale content creation", gradientText: "with brand-safe AI.", subtitle: "Content templates for your whole team. Start free." },
  },
  {
    slug: "for-growth-teams",
    category: "role",
    meta: { title: "TeamPrompt for Growth Teams | AI Prompt Management", description: "Accelerate growth experiments with shared AI prompts for A/B testing, conversion analysis, user research, and growth strategy.", keywords: ["growth team AI prompts", "growth hacking AI", "conversion optimization AI", "growth strategy prompts", "AI for growth teams"] },
    hero: { headline: "AI prompts built for growth teams", subtitle: "Growth teams move fast across experiments, analysis, and optimization. TeamPrompt provides shared templates for A/B testing, conversion analysis, user research, and growth strategy that keep your growth engine running efficiently.", badges: ["Experiments", "Conversion", "Analysis"] },
    features: { sectionLabel: "Growth", heading: "Built for growth workflows", items: [
      { icon: "BarChart3", title: "Experiment design prompts", description: "Templates for designing A/B tests, defining hypotheses, and planning experiment parameters systematically." },
      { icon: "Eye", title: "Conversion analysis", description: "Prompts for analyzing funnel data, identifying drop-off points, and generating optimization hypotheses." },
      { icon: "Users", title: "User research templates", description: "Templates for analyzing user feedback, creating personas, and synthesizing research findings." },
      { icon: "FileText", title: "Copy testing prompts", description: "Generate and evaluate ad copy, landing page variants, and email subject lines for testing." },
      { icon: "Zap", title: "Rapid iteration", description: "Quick-use templates for common growth tasks that keep experiments moving at speed." },
      { icon: "Shield", title: "Data protection", description: "DLP scanning prevents customer data and proprietary metrics from reaching AI tools." },
    ] },
    benefits: { heading: "Why growth teams choose TeamPrompt", items: ["Accelerate experiment cycles with ready-to-use analytical templates", "Standardize experiment design and analysis methodology", "Protect proprietary growth metrics and customer data", "Share winning prompt patterns across the growth team", "Generate copy variants faster with proven templates", "Track which templates drive the most growth impact"] },
    faqs: [
      { question: "Can I create templates for specific experiment types?", answer: "Yes. Create templates for pricing experiments, messaging tests, onboarding optimization, and any growth experiment type your team runs." },
      { question: "How do copy testing templates work?", answer: "Provide your product context and target audience as variables. The template generates multiple copy variants for testing, following your brand guidelines." },
      { question: "Can growth teams share templates across squads?", answer: "Yes. Create shared growth categories for templates everyone uses, with squad-specific categories for specialized experiments." },
    ],
    cta: { headline: "Grow faster", gradientText: "with AI-powered experiments.", subtitle: "Growth templates for your team. Start free." },
  },
  {
    slug: "for-business-analysts",
    category: "role",
    meta: { title: "TeamPrompt for Business Analysts | AI Prompt Management", description: "Enhance business analysis with shared AI prompts for requirements gathering, process modeling, stakeholder communication, and data analysis.", keywords: ["business analyst AI prompts", "BA AI tools", "requirements AI templates", "business analysis AI", "AI for business analysts"] },
    hero: { headline: "AI prompts built for business analysts", subtitle: "Business analysts bridge the gap between business needs and technical solutions. TeamPrompt provides shared templates for requirements documentation, process analysis, and stakeholder communication that standardize BA workflows.", badges: ["Requirements", "Process analysis", "Stakeholder comms"] },
    features: { sectionLabel: "Business Analysis", heading: "Built for BA workflows", items: [
      { icon: "ClipboardList", title: "Requirements templates", description: "Structured prompts for gathering, documenting, and refining business requirements with consistent format and detail." },
      { icon: "Eye", title: "Process analysis prompts", description: "Templates for analyzing current-state processes, identifying improvements, and documenting future-state designs." },
      { icon: "Users", title: "Stakeholder communication", description: "Templates for translating technical concepts for business audiences and business needs for technical teams." },
      { icon: "FileText", title: "Documentation prompts", description: "Prompts for creating BRDs, user stories, acceptance criteria, and process flow documentation." },
      { icon: "BarChart3", title: "Data analysis templates", description: "Templates for analyzing business metrics, creating dashboards, and identifying trends." },
      { icon: "Shield", title: "Data protection", description: "DLP scanning prevents business-sensitive data and stakeholder information from reaching AI tools." },
    ] },
    benefits: { heading: "Why business analysts choose TeamPrompt", items: ["Standardize requirements documentation across the BA team", "Reduce documentation time with proven template structures", "Share analytical methodologies across business analysis teams", "Protect sensitive business data with DLP scanning", "Onboard new BAs faster with ready-to-use template libraries", "Track which templates produce the best analysis outcomes"] },
    faqs: [
      { question: "Can I create templates for different project types?", answer: "Yes. Create templates for agile user stories, traditional BRDs, process documentation, and any format your organization uses." },
      { question: "How do requirements templates work?", answer: "Fill in project context, stakeholder needs, and constraints as variables. The template generates structured requirements documentation following your organization's standards." },
      { question: "Can BAs share templates with PMs and developers?", answer: "Yes. Create shared categories for cross-functional templates while maintaining BA-specific categories for specialized analysis templates." },
    ],
    cta: { headline: "Streamline business analysis", gradientText: "with shared prompts.", subtitle: "BA-optimized prompt templates. Start free." },
  },
  {
    slug: "for-solutions-architects",
    category: "role",
    meta: { title: "TeamPrompt for Solutions Architects | AI Prompt Management", description: "Design better solutions with shared AI prompts for architecture design, technical proposals, integration planning, and documentation.", keywords: ["solutions architect AI prompts", "architecture AI tools", "technical design AI", "SA prompt templates", "AI for solutions architects"] },
    hero: { headline: "AI prompts built for solutions architects", subtitle: "Solutions architects design complex systems, write technical proposals, and bridge business requirements with technical implementation. TeamPrompt provides templates that standardize your architectural workflows.", badges: ["Architecture design", "Technical proposals", "Integration"] },
    features: { sectionLabel: "Architecture", heading: "Built for SA workflows", items: [
      { icon: "Building2", title: "Architecture design prompts", description: "Templates for designing system architectures, evaluating trade-offs, and documenting design decisions." },
      { icon: "FileText", title: "Technical proposal templates", description: "Structured prompts for creating technical proposals, solution briefs, and architecture review documents." },
      { icon: "GitBranch", title: "Integration planning", description: "Templates for analyzing integration requirements, mapping APIs, and planning migration strategies." },
      { icon: "Eye", title: "Design review prompts", description: "Prompts for conducting architecture reviews, identifying risks, and evaluating scalability." },
      { icon: "Shield", title: "IP protection", description: "DLP scanning prevents proprietary architecture details and client specifications from reaching AI tools." },
      { icon: "Users", title: "Team standards", description: "Shared templates ensure all solutions architects follow the same documentation and review standards." },
    ] },
    benefits: { heading: "Why solutions architects choose TeamPrompt", items: ["Standardize architecture documentation across the SA team", "Speed up technical proposal creation with proven templates", "Protect proprietary designs and client specifications with DLP", "Share architectural patterns and best practices", "Maintain design decision history with version-controlled prompts", "Reduce time on documentation to focus on design"] },
    faqs: [
      { question: "Can I create templates for specific technology stacks?", answer: "Yes. Create templates for cloud architectures, microservices, data platforms, and any technology domain. Variables customize for each project's specific stack." },
      { question: "How do architecture review templates work?", answer: "Provide system context, requirements, and constraints as variables. The template generates a structured review covering scalability, security, performance, and maintainability." },
      { question: "Can SAs share templates with engineering teams?", answer: "Yes. Create shared categories for cross-team templates while maintaining SA-specific categories for detailed architectural analysis." },
    ],
    cta: { headline: "Design better solutions", gradientText: "with AI prompts.", subtitle: "Architecture templates for your team. Start free." },
  },
  {
    slug: "for-customer-support",
    category: "role",
    meta: { title: "TeamPrompt for Customer Support Teams | AI Prompt Management", description: "Improve customer support with shared AI prompts for response drafting, ticket analysis, knowledge base creation, and escalation handling.", keywords: ["customer support AI prompts", "support team AI", "ticket response AI", "help desk AI templates", "AI for customer support"] },
    hero: { headline: "AI prompts built for customer support teams", subtitle: "Support teams handle hundreds of conversations daily. TeamPrompt provides shared response templates, ticket analysis prompts, and knowledge base tools that help your team respond faster and more consistently.", badges: ["Response drafts", "Ticket analysis", "Knowledge base"] },
    features: { sectionLabel: "Support", heading: "Built for support workflows", items: [
      { icon: "Zap", title: "Response templates", description: "Pre-built prompts for common support scenarios that generate professional, empathetic responses in seconds." },
      { icon: "Eye", title: "Ticket analysis prompts", description: "Templates for categorizing issues, identifying root causes, and prioritizing support tickets." },
      { icon: "BookOpen", title: "Knowledge base creation", description: "Prompts for turning support interactions into knowledge base articles and FAQ entries." },
      { icon: "Users", title: "Escalation templates", description: "Structured prompts for preparing escalation summaries with complete context for senior support or engineering." },
      { icon: "Shield", title: "Customer data protection", description: "DLP scanning prevents customer PII, account details, and sensitive information from reaching AI tools." },
      { icon: "BarChart3", title: "Support analytics", description: "Track which templates reduce response time and improve customer satisfaction." },
    ] },
    benefits: { heading: "Why customer support teams choose TeamPrompt", items: ["Reduce average response time with ready-to-use response templates", "Maintain consistent tone and quality across all support agents", "Protect customer PII and account data with automatic DLP scanning", "Onboard new support agents faster with proven response templates", "Turn support interactions into knowledge base content efficiently", "Track which templates produce the best customer outcomes"] },
    faqs: [
      { question: "How do response templates work?", answer: "Select a template for the support scenario, fill in the customer context and issue details, and get a professional response draft. Customize as needed before sending." },
      { question: "Can I protect customer account information?", answer: "Yes. DLP scanning catches customer names, account numbers, email addresses, and other PII before prompts reach AI models. Essential for support teams handling sensitive data." },
      { question: "Can different support tiers have different templates?", answer: "Yes. Create categories for Tier 1, Tier 2, and specialized support. Each has its own templates appropriate for that support level." },
    ],
    cta: { headline: "Support customers faster", gradientText: "with shared AI prompts.", subtitle: "Response templates for your support team. Start free." },
  },
  {
    slug: "for-revenue-operations",
    category: "role",
    meta: { title: "TeamPrompt for Revenue Operations | AI Prompt Management", description: "Optimize revenue operations with shared AI prompts for pipeline analysis, forecasting, process optimization, and cross-functional alignment.", keywords: ["RevOps AI prompts", "revenue operations AI", "pipeline analysis AI", "forecasting AI prompts", "AI for RevOps"] },
    hero: { headline: "AI prompts built for revenue operations", subtitle: "RevOps teams drive alignment across sales, marketing, and customer success. TeamPrompt provides shared templates for pipeline analysis, forecasting, process optimization, and cross-functional reporting.", badges: ["Pipeline analysis", "Forecasting", "Alignment"] },
    features: { sectionLabel: "RevOps", heading: "Built for revenue operations", items: [
      { icon: "BarChart3", title: "Pipeline analysis prompts", description: "Templates for analyzing pipeline health, conversion rates, velocity metrics, and deal progression patterns." },
      { icon: "Eye", title: "Forecasting templates", description: "Structured prompts for revenue forecasting, scenario modeling, and forecast accuracy analysis." },
      { icon: "ClipboardList", title: "Process optimization", description: "Prompts for analyzing sales processes, identifying bottlenecks, and recommending workflow improvements." },
      { icon: "Users", title: "Cross-functional reporting", description: "Templates for creating aligned reports across sales, marketing, and customer success teams." },
      { icon: "FileText", title: "Data analysis prompts", description: "Templates for CRM data analysis, attribution modeling, and customer lifecycle insights." },
      { icon: "Shield", title: "Revenue data protection", description: "DLP scanning prevents revenue figures, customer data, and financial projections from reaching AI tools." },
    ] },
    benefits: { heading: "Why RevOps teams choose TeamPrompt", items: ["Standardize pipeline analysis across the revenue organization", "Reduce reporting time with proven analytical templates", "Protect sensitive revenue data and financial projections", "Share operational best practices across sales, marketing, and CS", "Improve forecast accuracy with consistent analytical methodology", "Track which templates drive the most operational impact"] },
    faqs: [
      { question: "Can I create templates for CRM data analysis?", answer: "Yes. Create templates that analyze pipeline stages, conversion metrics, and customer lifecycle data. Use variables for date ranges, segments, and metric types." },
      { question: "How do forecasting templates work?", answer: "Provide historical data context and parameters as variables. The template generates structured forecasts with scenarios, assumptions, and confidence levels." },
      { question: "Can RevOps share templates with sales and marketing?", answer: "Yes. Create cross-functional categories for shared reporting templates while maintaining RevOps-specific categories for operational analysis." },
    ],
    cta: { headline: "Optimize revenue operations", gradientText: "with AI prompts.", subtitle: "RevOps templates for data-driven decisions. Start free." },
  },
];
