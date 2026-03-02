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
];
