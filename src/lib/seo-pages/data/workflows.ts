import type { SeoPageData } from "../types";

export const workflowPages: SeoPageData[] = [
  {
    slug: "customer-support-ai-workflow",
    category: "workflow",
    meta: {
      title: "AI-Powered Customer Support Workflow | TeamPrompt",
      description:
        "Standardize your customer support with AI prompt workflows for ticket triage, response drafting, escalation handling, and quality assurance. Faster resolution times, consistent quality.",
      keywords: [
        "customer support AI workflow",
        "AI ticket triage",
        "support prompt templates",
        "AI customer service",
        "automated support responses",
        "support escalation AI",
      ],
    },
    hero: {
      headline: "Customer support workflows powered by AI prompts",
      subtitle:
        "Standardize how your support team uses AI — from ticket triage and response drafting to escalation and quality reviews. Every agent follows the same proven prompts, every customer gets consistent quality.",
      badges: ["Ticket triage", "Response drafting", "Escalation handling"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "End-to-end support workflow",
      items: [
        {
          icon: "Archive",
          title: "Ticket triage prompts",
          description:
            "Categorize incoming tickets by urgency, topic, and sentiment. AI-assisted triage routes tickets to the right team in seconds instead of minutes.",
        },
        {
          icon: "BookOpen",
          title: "Response templates",
          description:
            "Prompt templates with {{customer_name}}, {{issue_type}}, and {{product}} variables generate consistent, personalized responses for common support scenarios.",
        },
        {
          icon: "Zap",
          title: "One-click drafting",
          description:
            "Agents select a response template, fill in the variables, and insert a polished draft directly into their support tool. No context switching required.",
        },
        {
          icon: "GitBranch",
          title: "Escalation workflows",
          description:
            "Dedicated prompts for escalation summaries that capture context, prior interactions, and customer sentiment — so the next agent starts informed.",
        },
        {
          icon: "ShieldCheck",
          title: "DLP-protected responses",
          description:
            "Every outbound prompt is scanned for sensitive customer data — account numbers, personal information, and internal references are caught before they reach AI tools.",
        },
        {
          icon: "BarChart3",
          title: "Performance analytics",
          description:
            "Track which support prompts get used most, measure resolution speed improvements, and identify gaps where new templates are needed.",
        },
      ],
    },
    benefits: {
      heading: "Why support teams standardize with TeamPrompt",
      items: [
        "Reduce average response time by giving agents ready-to-use AI prompts",
        "Ensure consistent tone and quality across every support interaction",
        "Onboard new support agents faster with a library of proven prompts",
        "Prevent sensitive customer data from leaking into AI tools with DLP scanning",
        "Track which prompts drive the fastest resolution times",
        "Scale support quality without scaling headcount proportionally",
      ],
    },
    stats: [
      { value: "15", label: "Built-in DLP rules" },
      { value: "5", label: "AI tools supported" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      {
        question: "How do support agents access the prompts?",
        answer:
          "Agents use the TeamPrompt browser extension to browse and insert prompts directly into ChatGPT, Claude, or any AI tool they use alongside their support platform. No tab switching needed.",
      },
      {
        question: "Can I create different prompt sets for different support tiers?",
        answer:
          "Yes. Use team-based categories to organize prompts by tier — Tier 1 gets common issue templates, Tier 2 gets technical troubleshooting prompts, and escalation teams get summary and handoff templates.",
      },
      {
        question: "Does DLP scanning work with customer data in prompts?",
        answer:
          "Absolutely. DLP rules scan every prompt before it reaches any AI tool. Customer account numbers, email addresses, and other PII are detected and blocked or sanitized automatically.",
      },
      {
        question: "Can managers review which prompts agents are using?",
        answer:
          "Yes. Usage analytics show which prompts are used, by whom, and how often. Managers can identify top-performing prompts and spot agents who might need additional training.",
      },
    ],
    cta: {
      headline: "Standardize your support team's AI usage.",
      gradientText: "Faster replies, consistent quality.",
      subtitle:
        "Free plan available. Get your support team on the same prompts in minutes.",
    },
  },
  {
    slug: "content-creation-workflow",
    category: "workflow",
    meta: {
      title: "Content Creation with AI Prompt Workflows | TeamPrompt",
      description:
        "Build a complete content pipeline with AI prompt templates for ideation, drafting, editing, SEO optimization, and publishing. Keep your content team aligned and producing at scale.",
      keywords: [
        "content creation AI workflow",
        "AI content pipeline",
        "content prompt templates",
        "AI writing workflow",
        "content production AI",
        "editorial AI prompts",
      ],
    },
    hero: {
      headline: "A content pipeline built on proven AI prompts",
      subtitle:
        "From ideation to publishing, your content team follows the same workflow with standardized prompts for brainstorming, outlining, drafting, editing, and SEO optimization. Consistent output at every stage.",
      badges: ["Ideation", "Drafting", "Editing & publishing"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Every stage of content creation",
      items: [
        {
          icon: "Zap",
          title: "Ideation prompts",
          description:
            "Generate topic ideas, angles, and content briefs using prompts with {{audience}}, {{topic}}, and {{content_type}} variables. Never start from a blank page.",
        },
        {
          icon: "BookOpen",
          title: "Outline templates",
          description:
            "Structured prompts produce detailed outlines with headings, subheadings, and key points. Writers start with a clear roadmap every time.",
        },
        {
          icon: "Braces",
          title: "Drafting with variables",
          description:
            "Fill in {{tone}}, {{word_count}}, {{target_keyword}}, and {{brand_voice}} to generate drafts that match your editorial standards from the first pass.",
        },
        {
          icon: "Eye",
          title: "Editing & review prompts",
          description:
            "Dedicated prompts for grammar review, fact-checking, readability scoring, and brand voice consistency. Catch issues before publication.",
        },
        {
          icon: "Globe",
          title: "SEO optimization",
          description:
            "Prompts for meta descriptions, title tags, header optimization, and keyword integration. Ensure every piece is search-ready before it goes live.",
        },
        {
          icon: "BarChart3",
          title: "Content analytics",
          description:
            "Track which prompts your team uses most, identify bottlenecks in the workflow, and measure how AI assistance impacts production volume.",
        },
      ],
    },
    benefits: {
      heading: "Why content teams build workflows with TeamPrompt",
      items: [
        "Maintain brand voice consistency across every writer and content piece",
        "Reduce time from idea to published content by standardizing each stage",
        "Onboard freelancers and new writers with ready-to-use prompt workflows",
        "Ensure SEO best practices are baked into every content production step",
        "Prevent proprietary content strategies from leaking through DLP guardrails",
        "Scale content output without sacrificing quality or editorial standards",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "2-click", label: "From sidebar to AI tool" },
      { value: "$9/mo", label: "Starting price" },
    ],
    faqs: [
      {
        question: "Can I enforce brand voice through prompt templates?",
        answer:
          "Yes. Create templates that include your brand voice guidelines, tone requirements, and style rules as part of the prompt itself. Every writer produces content that sounds like your brand.",
      },
      {
        question: "How does this work with my existing editorial workflow?",
        answer:
          "TeamPrompt complements your existing tools. Writers use the browser extension to insert prompts into ChatGPT, Claude, or any AI tool they already use. The prompt library acts as the standard operating procedure for each content stage.",
      },
      {
        question: "Can different content types have different workflows?",
        answer:
          "Absolutely. Organize prompts into categories by content type — blog posts, social media, whitepapers, email newsletters — each with their own ideation, drafting, and editing prompts.",
      },
      {
        question: "Does DLP protect our unpublished content strategies?",
        answer:
          "Yes. DLP scanning catches proprietary information, unreleased product names, internal data, and other sensitive content before it reaches any AI model.",
      },
    ],
    cta: {
      headline: "Build a content machine",
      gradientText: "your whole team can run.",
      subtitle:
        "Free plan available. Set up your content workflow in under 10 minutes.",
    },
  },
  {
    slug: "sales-enablement-workflow",
    category: "workflow",
    meta: {
      title: "AI Sales Enablement Workflow | TeamPrompt",
      description:
        "Equip your sales team with AI prompt workflows for prospecting, outreach personalization, proposal drafting, and follow-up sequences. Close more deals with standardized AI assistance.",
      keywords: [
        "sales enablement AI",
        "AI sales workflow",
        "sales prompt templates",
        "AI prospecting",
        "sales outreach AI",
        "proposal generation AI",
      ],
    },
    hero: {
      headline: "Sales enablement powered by AI prompt workflows",
      subtitle:
        "Give every rep the same advantage — standardized prompts for prospecting research, personalized outreach, proposal generation, and follow-up sequences. Your best rep's AI playbook, available to the whole team.",
      badges: ["Prospecting", "Outreach", "Proposals & follow-ups"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "The complete sales AI workflow",
      items: [
        {
          icon: "Eye",
          title: "Prospect research prompts",
          description:
            "Prompts with {{company_name}}, {{industry}}, and {{role}} variables generate research briefs that help reps understand prospects before the first call.",
        },
        {
          icon: "Zap",
          title: "Outreach personalization",
          description:
            "Generate personalized cold emails, LinkedIn messages, and call scripts using templates that incorporate prospect-specific details and pain points.",
        },
        {
          icon: "BookOpen",
          title: "Proposal drafting",
          description:
            "Template-driven prompts produce tailored proposals with {{pricing_tier}}, {{use_case}}, and {{company_size}} variables. Professional proposals in minutes, not hours.",
        },
        {
          icon: "GitBranch",
          title: "Follow-up sequences",
          description:
            "Prompt templates for multi-touch follow-up sequences — day 3, day 7, day 14 — with escalating urgency and different value angles.",
        },
        {
          icon: "Shield",
          title: "Protected pricing data",
          description:
            "DLP guardrails prevent internal pricing models, discount structures, and competitive intelligence from leaking into AI tools.",
        },
        {
          icon: "BarChart3",
          title: "Sales prompt analytics",
          description:
            "Track which outreach prompts correlate with higher response rates. Identify top-performing templates and share them across the team.",
        },
      ],
    },
    benefits: {
      heading: "Why sales teams standardize with TeamPrompt",
      items: [
        "Ramp new reps faster with proven prompt playbooks for every sales stage",
        "Increase outreach personalization without increasing prep time",
        "Generate professional proposals in minutes using template variables",
        "Protect sensitive pricing and competitive data with DLP scanning",
        "Identify which prompts drive the best conversion rates",
        "Ensure consistent messaging across the entire sales organization",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "25", label: "Free prompts/month" },
      { value: "5", label: "AI tools supported" },
    ],
    faqs: [
      {
        question: "Can sales reps customize shared prompts for their deals?",
        answer:
          "Yes. Template variables let reps fill in deal-specific details — prospect name, company, industry, pain points — while keeping the underlying prompt structure standardized.",
      },
      {
        question: "How do I prevent reps from sharing pricing data with AI?",
        answer:
          "DLP guardrails automatically scan every prompt for sensitive data patterns including pricing, discount structures, and internal competitive intelligence. Violations are blocked or flagged before data reaches the AI.",
      },
      {
        question: "Can I create different prompt sets for SDRs vs AEs?",
        answer:
          "Absolutely. Use team-based categories to organize prompts by role. SDRs get prospecting and outreach templates while AEs get proposal, negotiation, and closing templates.",
      },
    ],
    cta: {
      headline: "Give every rep your best rep's",
      gradientText: "AI playbook.",
      subtitle:
        "Free plan available. Equip your sales team in minutes.",
    },
  },
  {
    slug: "hr-recruiting-workflow",
    category: "workflow",
    meta: {
      title: "HR and Recruiting AI Workflow | TeamPrompt",
      description:
        "Streamline HR and recruiting with AI prompt workflows for job descriptions, candidate screening, interview preparation, and employee onboarding. Consistent processes, faster hiring.",
      keywords: [
        "HR AI workflow",
        "recruiting AI prompts",
        "AI job descriptions",
        "candidate screening AI",
        "onboarding AI workflow",
        "HR prompt templates",
      ],
    },
    hero: {
      headline: "HR and recruiting workflows built on AI prompts",
      subtitle:
        "From writing job descriptions to onboarding new hires, your HR team follows standardized AI prompts that ensure fairness, consistency, and speed at every stage of the employee lifecycle.",
      badges: ["Job descriptions", "Screening", "Onboarding"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Every HR stage, standardized",
      items: [
        {
          icon: "BookOpen",
          title: "Job description prompts",
          description:
            "Generate inclusive, compelling job descriptions using templates with {{role_title}}, {{department}}, {{level}}, and {{requirements}} variables. Consistent structure across every posting.",
        },
        {
          icon: "Eye",
          title: "Candidate screening",
          description:
            "Structured prompts help recruiters evaluate resumes against job requirements. Standardized criteria reduce bias and ensure every candidate is assessed fairly.",
        },
        {
          icon: "Users",
          title: "Interview preparation",
          description:
            "Generate role-specific interview questions, scoring rubrics, and evaluation frameworks. Every interviewer follows the same structured approach.",
        },
        {
          icon: "Zap",
          title: "Offer & communication templates",
          description:
            "Prompt templates for offer letters, rejection emails, and candidate communications. Professional, empathetic messaging with {{candidate_name}} and {{position}} variables.",
        },
        {
          icon: "GitBranch",
          title: "Onboarding workflows",
          description:
            "Generate onboarding checklists, welcome messages, and training plans tailored to {{department}}, {{role}}, and {{start_date}}. New hires start productive faster.",
        },
        {
          icon: "ShieldAlert",
          title: "PII protection",
          description:
            "DLP guardrails prevent candidate personal data — Social Security numbers, addresses, salary history — from being sent to AI tools during the screening process.",
        },
      ],
    },
    benefits: {
      heading: "Why HR teams standardize with TeamPrompt",
      items: [
        "Write inclusive, consistent job descriptions in minutes instead of hours",
        "Reduce screening bias with standardized evaluation prompts",
        "Ensure every interviewer asks structured, role-relevant questions",
        "Protect candidate PII with DLP scanning on every AI interaction",
        "Onboard new hires faster with templated checklists and training plans",
        "Maintain compliance with employment regulations through consistent processes",
      ],
    },
    stats: [
      { value: "6", label: "One-click compliance packs" },
      { value: "15", label: "Built-in DLP rules" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      {
        question: "How do prompts help reduce hiring bias?",
        answer:
          "Standardized screening and interview prompts ensure every candidate is evaluated against the same criteria. The prompts focus on skills and qualifications rather than subjective impressions, promoting fairer hiring decisions.",
      },
      {
        question: "Can I customize prompts for different departments?",
        answer:
          "Yes. Organize prompts into categories by department — engineering, marketing, sales, operations — each with tailored job description templates, screening criteria, and interview questions.",
      },
      {
        question: "How is candidate data protected?",
        answer:
          "DLP rules automatically detect and block personal identifiable information including SSNs, addresses, dates of birth, and salary figures before they reach any AI tool. All DLP events are logged in the audit trail.",
      },
      {
        question: "Can hiring managers contribute prompts?",
        answer:
          "Yes. Hiring managers can submit prompts for review through the approval workflow. HR admins approve or reject submissions before they go live in the shared library.",
      },
    ],
    cta: {
      headline: "Standardize your hiring process",
      gradientText: "with AI prompts that scale.",
      subtitle:
        "Free plan available. Build your HR prompt library today.",
    },
  },
  {
    slug: "product-development-workflow",
    category: "workflow",
    meta: {
      title: "Product Development AI Workflow | TeamPrompt",
      description:
        "Accelerate product development with AI prompt workflows for PRDs, user stories, sprint planning, technical specs, and retrospectives. Consistent documentation, faster delivery.",
      keywords: [
        "product development AI",
        "AI PRD generator",
        "user stories AI",
        "sprint planning AI",
        "product management prompts",
        "agile AI workflow",
      ],
    },
    hero: {
      headline: "Product development accelerated by AI prompts",
      subtitle:
        "From PRDs and user stories to sprint planning and retrospectives, your product team uses standardized prompts that ensure thorough documentation, clear requirements, and faster delivery cycles.",
      badges: ["PRDs & specs", "User stories", "Sprint planning"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Prompts for every product stage",
      items: [
        {
          icon: "BookOpen",
          title: "PRD generation",
          description:
            "Prompt templates with {{feature_name}}, {{target_user}}, and {{success_metrics}} variables produce comprehensive product requirements documents with consistent structure and depth.",
        },
        {
          icon: "Braces",
          title: "User story creation",
          description:
            "Generate user stories in standard format — As a {{persona}}, I want to {{action}}, so that {{outcome}} — with acceptance criteria and edge cases included.",
        },
        {
          icon: "GitBranch",
          title: "Sprint planning prompts",
          description:
            "Break epics into sprint-sized stories, estimate complexity, identify dependencies, and draft sprint goals. Structured prompts make planning sessions more productive.",
        },
        {
          icon: "Zap",
          title: "Technical spec templates",
          description:
            "Generate technical specifications with architecture decisions, API contracts, data models, and implementation notes. Engineers start building with clarity.",
        },
        {
          icon: "Eye",
          title: "Retrospective frameworks",
          description:
            "Facilitation prompts for sprint retros that surface what went well, what needs improvement, and concrete action items. Consistent reflection across every team.",
        },
        {
          icon: "Shield",
          title: "IP-safe documentation",
          description:
            "DLP guardrails protect proprietary product roadmaps, unreleased feature details, and internal technical architecture from leaking into AI tools.",
        },
      ],
    },
    benefits: {
      heading: "Why product teams build workflows with TeamPrompt",
      items: [
        "Generate comprehensive PRDs in minutes with template-driven prompts",
        "Write user stories with consistent format, acceptance criteria, and edge cases",
        "Make sprint planning more productive with structured estimation prompts",
        "Protect unreleased product details with DLP scanning on every interaction",
        "Onboard new PMs with a library of proven documentation templates",
        "Maintain consistent documentation standards across multiple product teams",
      ],
    },
    stats: [
      { value: "2-click", label: "From sidebar to AI tool" },
      { value: "31", label: "Total available detection rules" },
      { value: "$9/mo", label: "Starting price" },
    ],
    faqs: [
      {
        question: "Can prompts integrate with our existing agile tools?",
        answer:
          "TeamPrompt works alongside your existing tools. Use the browser extension to generate user stories, sprint goals, and specs via AI, then paste the output into Jira, Linear, Notion, or whatever your team uses.",
      },
      {
        question: "How do prompts handle different product methodologies?",
        answer:
          "Create separate prompt categories for Scrum, Kanban, Shape Up, or your own methodology. Each category contains templates aligned with that framework's artifacts and ceremonies.",
      },
      {
        question: "Can engineering and product share the same prompt library?",
        answer:
          "Yes. Use team-based categories so product managers see PRD and user story templates while engineers see technical spec and architecture decision record templates. Shared categories work for cross-functional prompts.",
      },
      {
        question: "How are product roadmaps protected?",
        answer:
          "DLP rules can be configured to detect unreleased feature names, internal codenames, and roadmap dates. These are blocked or sanitized before reaching any AI tool.",
      },
    ],
    cta: {
      headline: "Ship better products",
      gradientText: "with standardized AI workflows.",
      subtitle:
        "Free plan available. Build your product team's prompt library today.",
    },
  },
  {
    slug: "marketing-campaign-workflow",
    category: "workflow",
    meta: {
      title: "Marketing Campaign AI Workflow | TeamPrompt",
      description:
        "Run marketing campaigns with AI prompt workflows for campaign strategy, ad copy, social media content, email sequences, and performance analysis. Consistent brand voice at scale.",
      keywords: [
        "marketing AI workflow",
        "AI campaign management",
        "marketing prompt templates",
        "ad copy AI",
        "social media AI prompts",
        "email marketing AI",
      ],
    },
    hero: {
      headline: "Marketing campaigns powered by AI prompt workflows",
      subtitle:
        "Plan campaigns, write copy, create social posts, build email sequences, and analyze performance — all using standardized prompts that keep your brand voice consistent across every channel and team member.",
      badges: ["Campaign strategy", "Ad copy", "Social & email"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Prompts for the full campaign lifecycle",
      items: [
        {
          icon: "BookOpen",
          title: "Campaign strategy prompts",
          description:
            "Generate campaign briefs with {{objective}}, {{target_audience}}, {{channels}}, and {{budget}} variables. Start every campaign with a clear, structured plan.",
        },
        {
          icon: "Braces",
          title: "Ad copy generation",
          description:
            "Templates for Google Ads, Facebook Ads, and LinkedIn Ads with character count constraints, CTA variations, and A/B test alternatives built into the prompt structure.",
        },
        {
          icon: "Globe",
          title: "Social media content",
          description:
            "Platform-specific prompts for Twitter, LinkedIn, Instagram, and TikTok. Each template accounts for platform character limits, hashtag strategies, and audience expectations.",
        },
        {
          icon: "Zap",
          title: "Email sequence builder",
          description:
            "Multi-touch email sequences with prompts for subject lines, preview text, body copy, and CTAs. Variables for {{segment}}, {{offer}}, and {{urgency_level}} ensure personalization.",
        },
        {
          icon: "BarChart3",
          title: "Performance analysis",
          description:
            "Prompts that help analyze campaign metrics, generate performance reports, identify optimization opportunities, and draft executive summaries.",
        },
        {
          icon: "ShieldCheck",
          title: "Brand-safe AI usage",
          description:
            "DLP guardrails protect unreleased campaign details, internal metrics, customer lists, and proprietary marketing strategies from reaching AI models.",
        },
      ],
    },
    benefits: {
      heading: "Why marketing teams standardize with TeamPrompt",
      items: [
        "Maintain consistent brand voice across every channel and team member",
        "Generate campaign copy variations in minutes instead of hours",
        "Ensure platform-specific best practices with tailored prompt templates",
        "Protect unreleased campaigns and internal metrics with DLP scanning",
        "Onboard agency partners and freelancers with ready-to-use prompt workflows",
        "Track which prompts produce the highest-performing content",
      ],
    },
    stats: [
      { value: "25", label: "Free prompts/month" },
      { value: "16", label: "Smart detection patterns" },
      { value: "6", label: "One-click compliance packs" },
    ],
    faqs: [
      {
        question: "Can I enforce brand guidelines through prompts?",
        answer:
          "Yes. Embed your brand voice guidelines, tone rules, and messaging frameworks directly into prompt templates. Every team member and freelancer produces on-brand content because the guidelines are part of the prompt itself.",
      },
      {
        question: "How do prompts handle different marketing channels?",
        answer:
          "Create separate prompt categories for each channel — paid ads, social media, email, content marketing, PR. Each category contains templates optimized for that channel's format, length, and audience expectations.",
      },
      {
        question: "Can agencies and freelancers access our prompt library?",
        answer:
          "Yes. Invite external collaborators with scoped permissions. They see only the categories and templates you share with them, keeping internal strategies private.",
      },
      {
        question: "How are campaign metrics protected from AI tools?",
        answer:
          "DLP rules detect internal metrics, revenue figures, customer counts, and unreleased campaign details. These are flagged or blocked before reaching any AI model.",
      },
    ],
    cta: {
      headline: "Launch campaigns faster",
      gradientText: "with AI prompts your whole team trusts.",
      subtitle:
        "Free plan available. Build your marketing prompt library in minutes.",
    },
  },
  {
    slug: "legal-review-workflow",
    category: "workflow",
    meta: {
      title: "Legal Document Review AI Workflow | TeamPrompt",
      description:
        "Streamline legal workflows with AI prompts for contract review, compliance checks, document summarization, clause extraction, and risk analysis. Consistent review processes with DLP protection.",
      keywords: [
        "legal AI workflow",
        "contract review AI",
        "legal document AI",
        "compliance check AI",
        "legal prompt templates",
        "AI legal review",
      ],
    },
    hero: {
      headline: "Legal document review accelerated by AI prompts",
      subtitle:
        "Standardize how your legal team uses AI for contract review, compliance checks, clause extraction, and risk analysis. Consistent review quality across every attorney and paralegal, with DLP guardrails protecting privileged information.",
      badges: ["Contract review", "Compliance checks", "Risk analysis"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Structured legal AI workflows",
      items: [
        {
          icon: "Eye",
          title: "Contract review prompts",
          description:
            "Structured prompts guide AI through contract analysis — identifying key terms, unusual clauses, missing provisions, and potential risks in a consistent format every time.",
        },
        {
          icon: "ShieldAlert",
          title: "Compliance checking",
          description:
            "Templates for reviewing documents against regulatory requirements — GDPR, HIPAA, SOX, and industry-specific regulations. Systematic compliance checks that don't miss critical elements.",
        },
        {
          icon: "BookOpen",
          title: "Document summarization",
          description:
            "Generate executive summaries of lengthy contracts, regulations, and legal opinions. Variables for {{summary_length}}, {{audience}}, and {{focus_areas}} tailor output to the reader.",
        },
        {
          icon: "Braces",
          title: "Clause extraction",
          description:
            "Prompts that extract and categorize specific clause types — indemnification, liability limits, termination, IP assignment — from complex agreements for comparison and analysis.",
        },
        {
          icon: "Lock",
          title: "Privileged data protection",
          description:
            "DLP guardrails prevent attorney-client privileged information, party names, deal values, and confidential terms from reaching AI models. Configurable rules for legal-specific data patterns.",
        },
        {
          icon: "BarChart3",
          title: "Review analytics",
          description:
            "Track review volume, identify frequently flagged clause types, and measure time savings. Data-driven insights into your legal team's AI-assisted workflow efficiency.",
        },
      ],
    },
    benefits: {
      heading: "Why legal teams standardize with TeamPrompt",
      items: [
        "Review contracts faster with structured, repeatable AI prompts",
        "Ensure compliance checks are systematic and never miss critical requirements",
        "Protect attorney-client privilege with legal-specific DLP guardrails",
        "Summarize complex documents consistently for different stakeholder audiences",
        "Onboard junior attorneys and paralegals with proven review templates",
        "Maintain full audit trails for every AI-assisted review session",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "5", label: "AI tools supported" },
      { value: "6", label: "One-click compliance packs" },
    ],
    faqs: [
      {
        question: "Is it safe to use AI for legal document review?",
        answer:
          "With TeamPrompt's DLP guardrails, privileged information and confidential deal terms are detected and blocked before reaching AI tools. Combined with full audit trails, your team gets AI assistance while maintaining client confidentiality.",
      },
      {
        question: "Can I create prompts for specific practice areas?",
        answer:
          "Yes. Organize prompts by practice area — M&A, employment, IP, real estate, regulatory — with each category containing review templates, clause libraries, and compliance checklists specific to that area.",
      },
      {
        question: "How does the audit trail work for legal reviews?",
        answer:
          "Every prompt insertion and DLP event is logged with timestamps, user identity, and tool details. Export audit data for compliance reviews, malpractice risk management, or internal governance reporting.",
      },
      {
        question: "Can paralegals and attorneys have different prompt access?",
        answer:
          "Yes. Role-based permissions control who can view, use, edit, and manage prompts in each category. Paralegals might access document preparation templates while partners access strategic analysis prompts.",
      },
    ],
    cta: {
      headline: "Review documents faster",
      gradientText: "without compromising privilege.",
      subtitle:
        "Free plan available. Set up your legal prompt library today.",
    },
  },
  {
    slug: "financial-analysis-workflow",
    category: "workflow",
    meta: {
      title: "Financial Analysis AI Workflow | TeamPrompt",
      description:
        "Power financial workflows with AI prompts for analysis, reporting, forecasting, audit preparation, and executive summaries. Consistent analysis frameworks with DLP protection for financial data.",
      keywords: [
        "financial analysis AI",
        "AI finance workflow",
        "financial reporting AI",
        "forecasting AI prompts",
        "audit preparation AI",
        "finance prompt templates",
      ],
    },
    hero: {
      headline: "Financial analysis workflows powered by AI prompts",
      subtitle:
        "Standardize how your finance team uses AI for analysis, reporting, forecasting, and audit preparation. Every analyst follows the same rigorous frameworks, and DLP guardrails keep financial data out of AI tools.",
      badges: ["Analysis", "Reporting", "Forecasting & audit"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Structured financial AI workflows",
      items: [
        {
          icon: "BarChart3",
          title: "Analysis frameworks",
          description:
            "Prompt templates for variance analysis, ratio analysis, trend identification, and competitive benchmarking. Variables for {{period}}, {{entity}}, and {{metric}} ensure consistent analytical rigor.",
        },
        {
          icon: "BookOpen",
          title: "Report generation",
          description:
            "Generate monthly close summaries, board-ready reports, and management commentary using templates with {{reporting_period}}, {{highlights}}, and {{concerns}} variables.",
        },
        {
          icon: "GitBranch",
          title: "Forecasting prompts",
          description:
            "Structured prompts for revenue forecasting, expense projections, and scenario analysis. Define {{assumptions}}, {{time_horizon}}, and {{scenarios}} for consistent modeling narratives.",
        },
        {
          icon: "Eye",
          title: "Audit preparation",
          description:
            "Generate audit support documentation, reconciliation narratives, and control testing summaries. Templates ensure thorough, auditor-ready documentation every time.",
        },
        {
          icon: "ShieldAlert",
          title: "Financial data protection",
          description:
            "DLP rules detect and block financial data — account numbers, revenue figures, earnings before release, internal projections — before they reach any AI tool.",
        },
        {
          icon: "Key",
          title: "Access controls",
          description:
            "Role-based permissions ensure only authorized team members access sensitive financial prompt categories. Separate libraries for FP&A, accounting, treasury, and investor relations.",
        },
      ],
    },
    benefits: {
      heading: "Why finance teams standardize with TeamPrompt",
      items: [
        "Apply consistent analytical frameworks across every financial review",
        "Generate board-ready reports and commentary in a fraction of the time",
        "Protect material non-public information with financial-specific DLP rules",
        "Prepare auditor-ready documentation with structured, repeatable prompts",
        "Onboard junior analysts with proven analysis and reporting templates",
        "Maintain SOX compliance with full audit trails on every AI interaction",
      ],
    },
    stats: [
      { value: "15", label: "Built-in DLP rules" },
      { value: "$9/mo", label: "Starting price" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      {
        question: "How is material non-public information protected?",
        answer:
          "DLP guardrails detect revenue figures, earnings data, internal projections, and deal terms before they reach AI tools. Custom patterns can be configured for organization-specific financial data. All violations are logged in the audit trail.",
      },
      {
        question: "Can I create prompts for different finance functions?",
        answer:
          "Yes. Organize prompts by function — FP&A, accounting, treasury, tax, investor relations — with each category containing analysis templates, reporting formats, and review checklists specific to that function.",
      },
      {
        question: "Does this help with SOX compliance?",
        answer:
          "TeamPrompt provides audit trails for every AI interaction, DLP scanning for financial data protection, and role-based access controls. These controls support SOX compliance requirements for data governance and oversight.",
      },
      {
        question: "Can external auditors see the audit trail?",
        answer:
          "Audit data can be exported in CSV or JSON format for external auditor review. You control what data is shared and can filter exports by date range, user, or activity type.",
      },
    ],
    cta: {
      headline: "Standardize your financial workflows",
      gradientText: "with AI prompts that protect your data.",
      subtitle:
        "Free plan available. Set up your finance prompt library today.",
    },
  },
  {
    slug: "research-synthesis-workflow",
    category: "workflow",
    meta: {
      title: "Research Synthesis AI Workflow | TeamPrompt",
      description:
        "Accelerate research with AI prompt workflows for literature review, data synthesis, methodology design, findings summarization, and report generation. Rigorous, reproducible research processes.",
      keywords: [
        "research AI workflow",
        "AI literature review",
        "research synthesis AI",
        "data analysis prompts",
        "research report AI",
        "academic AI workflow",
      ],
    },
    hero: {
      headline: "Research synthesis workflows powered by AI prompts",
      subtitle:
        "From literature review to final report, your research team uses standardized prompts for source analysis, data synthesis, methodology documentation, and findings summarization. Rigorous processes that scale across any research team.",
      badges: ["Literature review", "Data synthesis", "Report generation"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Structured research AI workflows",
      items: [
        {
          icon: "BookOpen",
          title: "Literature review prompts",
          description:
            "Structured prompts for analyzing sources, extracting key findings, identifying themes, and mapping research gaps. Variables for {{research_question}}, {{field}}, and {{date_range}} focus the review.",
        },
        {
          icon: "Archive",
          title: "Data synthesis templates",
          description:
            "Prompts for synthesizing findings across multiple sources — identifying consensus, contradictions, and emerging patterns. Consistent analytical frameworks for qualitative and quantitative data.",
        },
        {
          icon: "Braces",
          title: "Methodology documentation",
          description:
            "Templates for describing research methodology, sampling approaches, analytical frameworks, and limitations. Variables ensure comprehensive, reproducible methodology sections.",
        },
        {
          icon: "BarChart3",
          title: "Findings summarization",
          description:
            "Generate executive summaries, findings briefs, and key takeaways from complex research data. Templates for {{audience}}, {{depth}}, and {{format}} tailor output to the reader.",
        },
        {
          icon: "Globe",
          title: "Report generation",
          description:
            "End-to-end report templates covering introduction, methodology, findings, discussion, and recommendations. Consistent report structure across every research project.",
        },
        {
          icon: "Shield",
          title: "Research data protection",
          description:
            "DLP guardrails protect proprietary research data, unpublished findings, participant information, and confidential methodologies from reaching AI models.",
        },
      ],
    },
    benefits: {
      heading: "Why research teams standardize with TeamPrompt",
      items: [
        "Conduct literature reviews systematically with structured analysis prompts",
        "Synthesize findings across dozens of sources using consistent frameworks",
        "Generate comprehensive research reports in a fraction of the usual time",
        "Protect unpublished research and participant data with DLP guardrails",
        "Onboard new researchers with proven methodology and analysis templates",
        "Maintain reproducibility with standardized documentation prompts",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "2-click", label: "From sidebar to AI tool" },
      { value: "25", label: "Free prompts/month" },
    ],
    faqs: [
      {
        question: "How do prompts help with literature reviews?",
        answer:
          "Structured prompts guide AI through source analysis — extracting key findings, methodology details, sample sizes, and conclusions in a consistent format. This makes synthesizing across many sources faster and more systematic.",
      },
      {
        question: "Can I use different templates for different research methodologies?",
        answer:
          "Yes. Create separate prompt categories for qualitative, quantitative, mixed-methods, and systematic review approaches. Each contains templates aligned with that methodology's standards and documentation requirements.",
      },
      {
        question: "How is research data protected?",
        answer:
          "DLP rules detect and block participant names, unpublished findings, proprietary datasets, and confidential research details before they reach AI tools. Researchers can work with AI assistance while maintaining data confidentiality.",
      },
      {
        question: "Can research teams across departments share prompts?",
        answer:
          "Yes. Shared categories enable cross-departmental collaboration. Control access with permissions so each team sees relevant templates while protecting department-specific research data.",
      },
    ],
    cta: {
      headline: "Accelerate your research",
      gradientText: "with prompts your whole team can trust.",
      subtitle:
        "Free plan available. Build your research prompt library today.",
    },
  },
  {
    slug: "qa-testing-workflow",
    category: "workflow",
    meta: {
      title: "QA Testing with AI Workflow | TeamPrompt",
      description:
        "Enhance QA workflows with AI prompts for test case generation, bug reporting, regression test planning, test data creation, and quality metrics analysis. Consistent testing standards across your entire team.",
      keywords: [
        "QA testing AI workflow",
        "AI test case generation",
        "bug reporting AI",
        "regression testing AI",
        "QA prompt templates",
        "software testing AI",
      ],
    },
    hero: {
      headline: "QA testing workflows supercharged by AI prompts",
      subtitle:
        "Generate test cases, write detailed bug reports, plan regression suites, and create test data — all using standardized prompts that ensure thorough coverage and consistent quality standards across your entire QA team.",
      badges: ["Test case generation", "Bug reporting", "Regression planning"],
    },
    features: {
      sectionLabel: "Workflow",
      heading: "Prompts for the full testing lifecycle",
      items: [
        {
          icon: "BookOpen",
          title: "Test case generation",
          description:
            "Generate comprehensive test cases from user stories and requirements. Variables for {{feature}}, {{user_type}}, and {{platform}} produce structured test cases covering happy paths, edge cases, and error scenarios.",
        },
        {
          icon: "ShieldAlert",
          title: "Bug report templates",
          description:
            "Standardized prompts produce detailed, reproducible bug reports with steps to reproduce, expected vs. actual behavior, environment details, and severity classification.",
        },
        {
          icon: "GitBranch",
          title: "Regression planning",
          description:
            "Prompts for identifying regression risk areas, prioritizing test suites, and generating regression checklists based on {{release_scope}}, {{changed_modules}}, and {{risk_areas}}.",
        },
        {
          icon: "Braces",
          title: "Test data creation",
          description:
            "Generate realistic test data sets with prompts specifying {{data_type}}, {{volume}}, {{constraints}}, and {{edge_cases}}. Produce boundary values, invalid inputs, and localized data efficiently.",
        },
        {
          icon: "BarChart3",
          title: "Quality metrics analysis",
          description:
            "Prompts for analyzing defect trends, test coverage gaps, escape rate patterns, and sprint quality scores. Data-driven insights into your testing effectiveness.",
        },
        {
          icon: "Lock",
          title: "Secure testing environment",
          description:
            "DLP guardrails prevent production data, customer information, API credentials, and internal system details from being shared with AI tools during test planning.",
        },
      ],
    },
    benefits: {
      heading: "Why QA teams standardize with TeamPrompt",
      items: [
        "Generate comprehensive test cases from requirements in minutes instead of hours",
        "Ensure bug reports are detailed, consistent, and immediately actionable",
        "Plan regression suites systematically with structured priority frameworks",
        "Protect production data and system credentials with DLP scanning",
        "Onboard new QA engineers with a library of proven testing templates",
        "Track testing prompt usage to identify coverage patterns and gaps",
      ],
    },
    stats: [
      { value: "5", label: "AI tools supported" },
      { value: "6", label: "One-click compliance packs" },
      { value: "$9/mo", label: "Starting price" },
    ],
    faqs: [
      {
        question: "How do prompts improve test case quality?",
        answer:
          "Structured prompts ensure every test case includes preconditions, steps, expected results, and edge cases. Variables for feature, user type, and platform generate variations that manual creation often misses, resulting in more thorough coverage.",
      },
      {
        question: "Can I generate test cases from user stories directly?",
        answer:
          "Yes. Paste the user story into the template variables and the prompt generates test cases covering the acceptance criteria, edge cases, negative scenarios, and boundary conditions specific to that story.",
      },
      {
        question: "How is production data protected during testing?",
        answer:
          "DLP rules detect and block production URLs, database credentials, customer data, and API keys before they reach AI tools. QA engineers can describe testing scenarios without exposing actual system details.",
      },
      {
        question: "Can different QA teams have different prompt libraries?",
        answer:
          "Yes. Organize prompts by team — mobile QA, API testing, performance testing, security testing — with each category containing templates specific to that testing discipline and its tools.",
      },
    ],
    cta: {
      headline: "Test smarter, not harder.",
      gradientText: "AI-powered QA workflows await.",
      subtitle:
        "Free plan available. Build your QA prompt library in minutes.",
    },
  },
  {
    slug: "incident-response-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Incident Response Workflow | TeamPrompt", description: "Standardize incident response with AI prompt workflows for triage, investigation, communication, and post-mortems. Faster resolution, better documentation.", keywords: ["incident response AI workflow", "AI incident management", "incident triage prompts"] },
    hero: { headline: "Incident response workflows powered by AI", subtitle: "Standardize how your team handles incidents — from initial triage and investigation to stakeholder communication and post-mortems. Every responder follows proven prompts.", badges: ["Triage automation", "Investigation prompts", "Post-mortem templates"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end incident response workflow", items: [
      { icon: "ShieldAlert", title: "Incident triage prompts", description: "Classify severity, identify affected systems, and route to the right team with structured triage prompts." },
      { icon: "Eye", title: "Investigation templates", description: "Guided investigation prompts that walk responders through log analysis, root cause identification, and hypothesis testing." },
      { icon: "Globe", title: "Communication templates", description: "Pre-built templates for status page updates, stakeholder emails, and customer notifications during incidents." },
      { icon: "BookOpen", title: "Post-mortem prompts", description: "Structured post-mortem templates that capture timeline, root cause, impact, and action items consistently." },
      { icon: "BarChart3", title: "Metrics tracking", description: "Track MTTR, incident frequency, and resolution quality across your team's incident response efforts." },
      { icon: "Users", title: "Team runbooks", description: "Share incident response prompt libraries so every on-call engineer follows the same proven playbook." },
    ] },
    benefits: { heading: "Why teams use AI incident response workflows", items: ["Triage incidents faster with structured severity assessment", "Investigate root causes systematically instead of thrashing", "Communicate with stakeholders using consistent, professional templates", "Produce thorough post-mortems with standardized templates", "Reduce mean time to resolution with guided investigation prompts", "Onboard new on-call engineers with proven response playbooks"] },
    faqs: [
      { question: "How does AI help with incident triage?", answer: "Triage prompts guide responders through severity assessment, impact analysis, and team routing so incidents reach the right people faster." },
      { question: "Can I use these during a live incident?", answer: "Yes. Templates are designed for real-time use. Insert them directly into AI tools via the browser extension during active incidents." },
      { question: "Do workflows include post-mortems?", answer: "Yes. Post-mortem templates capture timeline, root cause, contributing factors, impact, and action items in a consistent format." },
    ],
    cta: { headline: "Resolve incidents faster.", gradientText: "AI-powered response workflows.", subtitle: "Free plan available. Build your incident response library today." },
  },
  {
    slug: "employee-onboarding-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Employee Onboarding Workflow | TeamPrompt", description: "Standardize employee onboarding with AI prompt workflows for welcome materials, training plans, and check-in schedules. Better first days, faster productivity.", keywords: ["employee onboarding AI workflow", "AI HR onboarding", "new hire workflow prompts"] },
    hero: { headline: "Employee onboarding workflows powered by AI", subtitle: "Standardize how your organization onboards new hires — from welcome materials and 30-60-90 plans to buddy programs and check-in cadences.", badges: ["Welcome materials", "Training plans", "Check-in schedules"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end onboarding workflow", items: [
      { icon: "BookOpen", title: "Welcome material prompts", description: "Generate personalized welcome emails, orientation guides, and team introductions for each new hire." },
      { icon: "Zap", title: "30-60-90 plan generation", description: "Create role-specific ramp-up plans with learning milestones, deliverables, and success criteria." },
      { icon: "Users", title: "Buddy program templates", description: "Structured templates for onboarding buddy assignments, responsibilities, and check-in schedules." },
      { icon: "BarChart3", title: "Progress tracking prompts", description: "Templates for weekly check-ins that track new hire progress against onboarding milestones." },
      { icon: "Eye", title: "Feedback collection", description: "Structured prompts for gathering new hire feedback on the onboarding experience at key intervals." },
      { icon: "Globe", title: "Remote onboarding support", description: "Templates specifically designed for virtual onboarding across distributed teams." },
    ] },
    benefits: { heading: "Why HR teams use AI onboarding workflows", items: ["Create personalized welcome materials for every new hire", "Build role-specific ramp-up plans with clear milestones", "Standardize buddy programs with structured guidelines", "Track onboarding progress with weekly check-in templates", "Gather feedback to continuously improve the process", "Support remote hires with virtual-first onboarding templates"] },
    faqs: [
      { question: "Can I customize onboarding by role?", answer: "Yes. Templates adapt to any role with department, level, and function variables for engineering, sales, marketing, and other departments." },
      { question: "How do 30-60-90 plans work?", answer: "Templates produce phased plans with specific learning objectives, deliverables, and success criteria for each period, adapted to the new hire's role." },
      { question: "Do workflows support remote onboarding?", answer: "Yes. Remote-specific templates cover virtual tool setup, video introductions, and online social activities for distributed teams." },
    ],
    cta: { headline: "Better first days, faster productivity.", gradientText: "AI-powered onboarding workflows.", subtitle: "Free plan available. Onboard new hires effectively." },
  },
  {
    slug: "quarterly-reporting-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Quarterly Reporting Workflow | TeamPrompt", description: "Standardize quarterly reporting with AI prompt workflows for data collection, analysis, executive summaries, and board presentations. Better reports, less time.", keywords: ["quarterly reporting AI workflow", "AI business reporting", "QBR workflow prompts"] },
    hero: { headline: "Quarterly reporting workflows powered by AI", subtitle: "Standardize how your team produces quarterly reports — from data collection and analysis to executive summaries and board presentations.", badges: ["Data collection", "Executive summaries", "Board presentations"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end quarterly reporting workflow", items: [
      { icon: "BarChart3", title: "Data collection prompts", description: "Structured prompts for gathering metrics, KPIs, and qualitative data from across departments." },
      { icon: "Eye", title: "Analysis templates", description: "Templates for trend analysis, variance explanations, and forecasting from collected quarterly data." },
      { icon: "BookOpen", title: "Executive summary prompts", description: "Templates that distill complex quarterly data into concise, actionable executive summaries." },
      { icon: "Users", title: "Board presentation templates", description: "Templates for board-ready presentations with strategic highlights, financial summaries, and outlook." },
      { icon: "Shield", title: "Financial data protection", description: "DLP guardrails prevent sensitive financial data from leaking through AI reporting prompts." },
      { icon: "Zap", title: "Automated formatting", description: "Templates that produce consistently formatted reports regardless of who compiles them." },
    ] },
    benefits: { heading: "Why teams use AI quarterly reporting workflows", items: ["Collect data systematically from every department", "Analyze trends and variances with structured templates", "Produce executive summaries that leadership values", "Create board presentations with consistent quality", "Protect sensitive financial data with DLP scanning", "Reduce reporting cycle time by 60%"] },
    faqs: [
      { question: "Can I standardize reporting across departments?", answer: "Yes. Data collection templates ensure every department provides metrics in the same format for easy aggregation and comparison." },
      { question: "Are financial figures protected?", answer: "Yes. DLP guardrails scan for sensitive revenue, margin, and forecast data before prompts reach AI tools." },
      { question: "Do workflows produce board-ready presentations?", answer: "Yes. Board templates produce strategic summaries with financial highlights, operational updates, and forward-looking outlook in professional formats." },
    ],
    cta: { headline: "Quarterly reports, done right.", gradientText: "AI-powered reporting workflows.", subtitle: "Free plan available. Streamline your quarterly process." },
  },
  {
    slug: "contract-review-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Contract Review Workflow | TeamPrompt", description: "Standardize contract review with AI prompt workflows for clause analysis, risk identification, and redline suggestions. Faster reviews, fewer surprises.", keywords: ["contract review AI workflow", "AI legal review", "contract analysis workflow"] },
    hero: { headline: "Contract review workflows powered by AI", subtitle: "Standardize how your legal team reviews contracts — from initial clause analysis and risk identification to redline suggestions and approval workflows.", badges: ["Clause analysis", "Risk identification", "Redline suggestions"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end contract review workflow", items: [
      { icon: "FileText", title: "Clause extraction prompts", description: "Structured prompts that identify and categorize key clauses, obligations, and rights in any contract." },
      { icon: "ShieldAlert", title: "Risk identification templates", description: "Templates that flag unfavorable terms, liability exposure, and compliance risks systematically." },
      { icon: "Scale", title: "Standard comparison prompts", description: "Prompts that compare contract terms against your organization's standard positions and acceptable ranges." },
      { icon: "BookOpen", title: "Redline suggestion templates", description: "Templates that produce specific markup suggestions with rationale for each proposed change." },
      { icon: "Users", title: "Approval workflow prompts", description: "Templates for routing contracts through review tiers based on value, risk level, and term deviations." },
      { icon: "Shield", title: "Confidential data protection", description: "DLP guardrails prevent sensitive contract terms from leaking through AI review prompts." },
    ] },
    benefits: { heading: "Why legal teams use AI contract review workflows", items: ["Extract and categorize contract clauses in minutes", "Identify risks and unfavorable terms systematically", "Compare terms against organizational standards", "Generate redline suggestions with clear rationale", "Route contracts through appropriate approval tiers", "Protect confidential contract data with DLP scanning"] },
    faqs: [
      { question: "What contract types can I review?", answer: "Workflows support NDAs, MSAs, SaaS agreements, employment contracts, vendor agreements, and any other contract type." },
      { question: "How does risk identification work?", answer: "Risk templates check for unlimited liability, broad indemnification, unfavorable IP terms, auto-renewal, and other common risk areas with severity ratings." },
      { question: "Is contract content protected?", answer: "Yes. DLP guardrails prevent contract terms, party names, and financial details from leaking through AI tools." },
    ],
    cta: { headline: "Review contracts faster.", gradientText: "AI-powered legal workflows.", subtitle: "Free plan available. Streamline your contract review process." },
  },
  {
    slug: "seo-content-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered SEO Content Workflow | TeamPrompt", description: "Standardize SEO content creation with AI prompt workflows for keyword research, content briefs, writing, and optimization. Better rankings, consistent quality.", keywords: ["SEO content AI workflow", "AI content marketing", "SEO writing workflow"] },
    hero: { headline: "SEO content workflows powered by AI", subtitle: "Standardize how your team produces SEO content — from keyword research and content briefs to writing, optimization, and performance tracking.", badges: ["Keyword research", "Content briefs", "SEO optimization"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end SEO content workflow", items: [
      { icon: "Globe", title: "Keyword research prompts", description: "Structured prompts for identifying target keywords, search intent, and competitive gaps." },
      { icon: "BookOpen", title: "Content brief templates", description: "Templates that produce comprehensive briefs with target keywords, outline, word count, and competitive analysis." },
      { icon: "Zap", title: "Writing templates", description: "Templates for drafting SEO-optimized content with natural keyword placement and structured formatting." },
      { icon: "Eye", title: "Optimization prompts", description: "Templates for on-page optimization — meta titles, descriptions, internal linking, and schema markup." },
      { icon: "BarChart3", title: "Performance tracking", description: "Templates for monitoring rankings, traffic, and engagement metrics after publication." },
      { icon: "Users", title: "Team content standards", description: "Share SEO workflows across your content team for consistent, search-optimized output." },
    ] },
    benefits: { heading: "Why content teams use AI SEO workflows", items: ["Research keywords systematically with structured prompts", "Create comprehensive content briefs for every article", "Draft SEO-optimized content with natural keyword placement", "Optimize on-page elements with structured templates", "Track content performance against ranking goals", "Standardize SEO practices across your content team"] },
    faqs: [
      { question: "Does the workflow cover keyword research?", answer: "Yes. Research prompts guide AI through keyword identification, search intent analysis, and competitive gap assessment." },
      { question: "Can I create content briefs?", answer: "Yes. Brief templates produce comprehensive outlines with target keywords, competitive analysis, and content structure for consistent writing." },
      { question: "Do workflows include post-publish optimization?", answer: "Yes. Performance tracking templates monitor rankings and traffic so you can optimize underperforming content." },
    ],
    cta: { headline: "Rank higher, consistently.", gradientText: "AI-powered SEO workflows.", subtitle: "Free plan available. Optimize your content process today." },
  },
  {
    slug: "data-analysis-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Data Analysis Workflow | TeamPrompt", description: "Standardize data analysis with AI prompt workflows for data cleaning, exploration, visualization, and insight reporting. Better insights, faster decisions.", keywords: ["data analysis AI workflow", "AI analytics workflow", "data science prompts"] },
    hero: { headline: "Data analysis workflows powered by AI", subtitle: "Standardize how your team analyzes data — from cleaning and exploration to visualization and insight reporting. Consistent methodology, actionable insights.", badges: ["Data cleaning", "Exploration", "Insight reporting"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end data analysis workflow", items: [
      { icon: "BookOpen", title: "Data cleaning prompts", description: "Structured prompts for identifying missing values, outliers, duplicates, and data quality issues." },
      { icon: "Eye", title: "Exploratory analysis templates", description: "Templates for initial data exploration — distributions, correlations, and pattern identification." },
      { icon: "BarChart3", title: "Visualization prompts", description: "Templates that recommend chart types, axes, and formatting for effective data communication." },
      { icon: "Zap", title: "Statistical analysis templates", description: "Templates for hypothesis testing, regression, and significance analysis with methodology guidance." },
      { icon: "Users", title: "Insight reporting prompts", description: "Templates for translating analysis into business insights with recommendations and confidence levels." },
      { icon: "Shield", title: "Data protection", description: "DLP guardrails prevent sensitive datasets from leaking through AI analysis prompts." },
    ] },
    benefits: { heading: "Why data teams use AI analysis workflows", items: ["Clean data systematically with structured quality checks", "Explore datasets with consistent methodology", "Visualize findings with appropriate chart types", "Apply statistical methods with guided templates", "Report insights in business-friendly language", "Protect sensitive data with DLP scanning"] },
    faqs: [
      { question: "What analysis types are covered?", answer: "Workflows cover data cleaning, exploratory analysis, statistical testing, visualization, and insight reporting — the full analysis lifecycle." },
      { question: "Can I standardize methodology?", answer: "Yes. Templates ensure every analyst follows the same methodology for cleaning, exploration, and statistical analysis." },
      { question: "Is my data protected?", answer: "Yes. DLP guardrails scan for sensitive data patterns before analysis prompts reach AI tools." },
    ],
    cta: { headline: "Better insights, faster.", gradientText: "AI-powered analysis workflows.", subtitle: "Free plan available. Analyze data systematically." },
  },
  {
    slug: "hiring-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Hiring Workflow | TeamPrompt", description: "Standardize hiring with AI prompt workflows for job descriptions, screening, interviews, and decision-making. Better hires, less bias.", keywords: ["hiring AI workflow", "AI recruitment", "hiring process prompts"] },
    hero: { headline: "Hiring workflows powered by AI", subtitle: "Standardize your entire hiring process — from job descriptions and candidate screening to structured interviews and data-driven hiring decisions.", badges: ["Job descriptions", "Structured interviews", "Fair decisions"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end hiring workflow", items: [
      { icon: "BookOpen", title: "Job description prompts", description: "Generate inclusive, compelling job descriptions with clear requirements and growth opportunities." },
      { icon: "Eye", title: "Screening criteria templates", description: "Templates for consistent resume screening with must-have and nice-to-have qualification criteria." },
      { icon: "Users", title: "Interview templates", description: "Structured interview questions with scoring rubrics for consistent, fair candidate assessment." },
      { icon: "BarChart3", title: "Scorecard templates", description: "Templates for candidate evaluation with competency scores, notes, and overall recommendations." },
      { icon: "ShieldCheck", title: "Bias reduction prompts", description: "Templates designed to reduce unconscious bias with structured evaluation criteria and blind review." },
      { icon: "Zap", title: "Decision-making templates", description: "Templates for hiring committee deliberation with structured comparison and consensus building." },
    ] },
    benefits: { heading: "Why HR teams use AI hiring workflows", items: ["Write inclusive job descriptions that attract diverse talent", "Screen candidates consistently with structured criteria", "Conduct fair interviews with standardized questions", "Evaluate candidates with objective scoring rubrics", "Reduce bias with structured assessment frameworks", "Make better hiring decisions with data-driven templates"] },
    faqs: [
      { question: "Does the workflow reduce hiring bias?", answer: "Yes. Structured interviews, standardized rubrics, and blind evaluation templates are proven to reduce unconscious bias compared to unstructured processes." },
      { question: "Can I use this for any role?", answer: "Yes. Templates adapt to engineering, sales, marketing, operations, and any other function with role-specific questions and evaluation criteria." },
      { question: "Does the workflow cover the full hiring process?", answer: "Yes. From job description to offer decision, every stage has structured prompts for consistent, fair hiring." },
    ],
    cta: { headline: "Hire better people.", gradientText: "AI-powered hiring workflows.", subtitle: "Free plan available. Build your hiring playbook today." },
  },
  {
    slug: "product-research-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Product Research Workflow | TeamPrompt", description: "Standardize product research with AI prompt workflows for user interviews, competitive analysis, and feature prioritization. Build what users need.", keywords: ["product research AI workflow", "AI product management", "user research prompts"] },
    hero: { headline: "Product research workflows powered by AI", subtitle: "Standardize how your product team conducts research — from user interviews and competitive analysis to feature prioritization and roadmap planning.", badges: ["User interviews", "Competitive analysis", "Feature prioritization"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end product research workflow", items: [
      { icon: "Users", title: "User interview prompts", description: "Structured interview guides with probing questions, follow-ups, and note-taking templates." },
      { icon: "Eye", title: "Competitive analysis templates", description: "Templates for systematic competitor evaluation — features, pricing, positioning, and user sentiment." },
      { icon: "BarChart3", title: "Feature prioritization prompts", description: "Templates for scoring features on impact, effort, and strategic alignment using proven frameworks." },
      { icon: "BookOpen", title: "Research synthesis templates", description: "Templates for compiling research findings into actionable themes and recommendations." },
      { icon: "Zap", title: "PRD generation prompts", description: "Templates for creating product requirements documents from validated research insights." },
      { icon: "Globe", title: "Market analysis prompts", description: "Templates for market sizing, trend identification, and opportunity assessment." },
    ] },
    benefits: { heading: "Why product teams use AI research workflows", items: ["Conduct user interviews with structured, unbiased questions", "Analyze competitors systematically with consistent frameworks", "Prioritize features with data-driven scoring templates", "Synthesize research into actionable product recommendations", "Generate PRDs grounded in validated user research", "Assess market opportunities with structured analysis"] },
    faqs: [
      { question: "How do user interview templates work?", answer: "Interview prompts provide structured question flows with probing follow-ups designed to uncover user needs without leading the conversation." },
      { question: "Can I prioritize features?", answer: "Yes. Prioritization templates score features using RICE, ICE, or custom frameworks for objective, consistent ranking." },
      { question: "Do workflows produce PRDs?", answer: "Yes. PRD templates translate research findings into structured product requirements with user stories, acceptance criteria, and success metrics." },
    ],
    cta: { headline: "Build what users need.", gradientText: "AI-powered research workflows.", subtitle: "Free plan available. Research products systematically." },
  },
  {
    slug: "compliance-audit-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Compliance Audit Workflow | TeamPrompt", description: "Standardize compliance audits with AI prompt workflows for control testing, evidence collection, and finding remediation. Audit efficiently, stay compliant.", keywords: ["compliance audit AI workflow", "AI audit management", "compliance testing prompts"] },
    hero: { headline: "Compliance audit workflows powered by AI", subtitle: "Standardize how your team conducts compliance audits — from control testing and evidence collection to finding documentation and remediation tracking.", badges: ["Control testing", "Evidence collection", "Remediation tracking"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end compliance audit workflow", items: [
      { icon: "Scale", title: "Control testing prompts", description: "Structured prompts for testing controls against SOC 2, ISO 27001, HIPAA, and other framework requirements." },
      { icon: "BookOpen", title: "Evidence collection templates", description: "Templates for organizing, documenting, and presenting audit evidence in standard formats." },
      { icon: "ShieldCheck", title: "Finding documentation prompts", description: "Templates for documenting findings with severity, root cause, and remediation recommendations." },
      { icon: "Zap", title: "Remediation tracking templates", description: "Templates for managing corrective actions with owners, deadlines, and verification criteria." },
      { icon: "Eye", title: "Audit report templates", description: "Templates for producing professional audit reports with findings, recommendations, and management responses." },
      { icon: "Users", title: "Team audit standards", description: "Share audit workflows across your compliance team for consistent, thorough assessments." },
    ] },
    benefits: { heading: "Why compliance teams use AI audit workflows", items: ["Test controls consistently against framework requirements", "Collect and organize evidence in standard formats", "Document findings with clear severity and root cause analysis", "Track remediation with ownership and deadline management", "Produce professional audit reports efficiently", "Standardize audit quality across your compliance team"] },
    faqs: [
      { question: "What compliance frameworks are supported?", answer: "Workflows support SOC 2, ISO 27001, HIPAA, PCI DSS, GDPR, NIST, and custom compliance frameworks." },
      { question: "Can I track remediation?", answer: "Yes. Remediation templates assign corrective actions with owners, deadlines, and verification criteria for complete resolution tracking." },
      { question: "Do workflows produce audit reports?", answer: "Yes. Report templates compile findings, recommendations, management responses, and remediation timelines into professional audit deliverables." },
    ],
    cta: { headline: "Audit efficiently, stay compliant.", gradientText: "AI-powered audit workflows.", subtitle: "Free plan available. Streamline your audit process." },
  },
  {
    slug: "bug-triage-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Bug Triage Workflow | TeamPrompt", description: "Standardize bug triage with AI prompt workflows for severity assessment, reproduction steps, and fix prioritization. Resolve bugs faster, ship better software.", keywords: ["bug triage AI workflow", "AI bug management", "defect triage prompts"] },
    hero: { headline: "Bug triage workflows powered by AI", subtitle: "Standardize how your team triages bugs — from severity assessment and reproduction to root cause analysis and fix prioritization.", badges: ["Severity assessment", "Reproduction steps", "Fix prioritization"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end bug triage workflow", items: [
      { icon: "ShieldAlert", title: "Severity assessment prompts", description: "Structured prompts for consistent bug severity and priority classification based on impact and scope." },
      { icon: "Eye", title: "Reproduction templates", description: "Templates for documenting clear reproduction steps with environment, preconditions, and expected vs actual behavior." },
      { icon: "BookOpen", title: "Root cause analysis prompts", description: "Templates guiding engineers through systematic root cause identification with log analysis and hypothesis testing." },
      { icon: "BarChart3", title: "Prioritization frameworks", description: "Templates for ranking bugs by customer impact, frequency, and workaround availability." },
      { icon: "Zap", title: "Fix verification templates", description: "Templates for verifying fixes with test cases, regression checks, and deployment verification." },
      { icon: "Users", title: "Team triage standards", description: "Share triage workflows so every engineer classifies and handles bugs consistently." },
    ] },
    benefits: { heading: "Why engineering teams use AI bug triage workflows", items: ["Classify bug severity consistently across the team", "Document reproduction steps clearly for faster debugging", "Identify root causes systematically instead of guessing", "Prioritize fixes based on data-driven criteria", "Verify fixes thoroughly with structured test templates", "Standardize triage quality across all engineers"] },
    faqs: [
      { question: "How does AI help with severity assessment?", answer: "Triage prompts guide engineers through impact assessment, scope analysis, and workaround evaluation for consistent severity classification." },
      { question: "Can I standardize reproduction steps?", answer: "Yes. Reproduction templates ensure every bug report includes environment, preconditions, steps, expected behavior, and actual behavior." },
      { question: "Do workflows include fix verification?", answer: "Yes. Verification templates include test cases, regression checks, and deployment verification steps for thorough fix validation." },
    ],
    cta: { headline: "Triage bugs faster.", gradientText: "AI-powered triage workflows.", subtitle: "Free plan available. Ship better software today." },
  },
  {
    slug: "design-review-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Design Review Workflow | TeamPrompt", description: "Standardize design reviews with AI prompt workflows for usability assessment, accessibility checks, and design system compliance. Better designs, consistent feedback.", keywords: ["design review AI workflow", "AI design feedback", "UX review prompts"] },
    hero: { headline: "Design review workflows powered by AI", subtitle: "Standardize how your team reviews designs — from usability assessment and accessibility checks to design system compliance and feedback delivery.", badges: ["Usability assessment", "Accessibility checks", "Design system compliance"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end design review workflow", items: [
      { icon: "Eye", title: "Usability assessment prompts", description: "Structured prompts for evaluating user flows, information architecture, and interaction patterns." },
      { icon: "Users", title: "Accessibility review templates", description: "Templates for WCAG compliance checks covering contrast, navigation, screen reader support, and keyboard accessibility." },
      { icon: "BookOpen", title: "Design system compliance prompts", description: "Templates for verifying adherence to your design system — components, spacing, typography, and color usage." },
      { icon: "Zap", title: "Feedback delivery templates", description: "Templates for constructive design feedback with specific issues, impact, and suggested alternatives." },
      { icon: "BarChart3", title: "Design metrics tracking", description: "Templates for tracking usability scores, accessibility compliance, and design system adoption." },
      { icon: "Globe", title: "Cross-platform review prompts", description: "Templates for reviewing designs across web, mobile, and responsive breakpoints." },
    ] },
    benefits: { heading: "Why design teams use AI review workflows", items: ["Assess usability consistently with structured evaluation prompts", "Check accessibility compliance against WCAG standards", "Verify design system adherence with systematic templates", "Deliver constructive feedback with clear, actionable suggestions", "Track design quality metrics over time", "Review designs across platforms with consistent criteria"] },
    faqs: [
      { question: "Does the workflow cover accessibility?", answer: "Yes. Accessibility templates check WCAG 2.1 AA compliance for contrast ratios, keyboard navigation, screen reader support, and focus management." },
      { question: "Can I enforce design system compliance?", answer: "Yes. Design system templates verify component usage, spacing, typography, and color adherence to your established design system." },
      { question: "How does AI help with design feedback?", answer: "Feedback templates structure critique with specific issue identification, user impact, and suggested alternatives for constructive, actionable reviews." },
    ],
    cta: { headline: "Better designs, better feedback.", gradientText: "AI-powered design workflows.", subtitle: "Free plan available. Review designs systematically." },
  },
  {
    slug: "investor-reporting-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Investor Reporting Workflow | TeamPrompt", description: "Standardize investor reporting with AI prompt workflows for metrics compilation, narrative drafting, and board deck creation. Professional updates, less effort.", keywords: ["investor reporting AI workflow", "AI board reporting", "investor update prompts"] },
    hero: { headline: "Investor reporting workflows powered by AI", subtitle: "Standardize how your team produces investor updates — from metrics compilation and narrative drafting to board deck creation and LP communications.", badges: ["Metrics compilation", "Narrative drafting", "Board decks"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end investor reporting workflow", items: [
      { icon: "BarChart3", title: "Metrics compilation prompts", description: "Templates for collecting and formatting MRR, burn rate, runway, and other key investor metrics." },
      { icon: "BookOpen", title: "Narrative drafting templates", description: "Templates for writing compelling business updates with highlights, challenges, and strategic context." },
      { icon: "Eye", title: "Board deck templates", description: "Templates for board presentations with financial summaries, operational updates, and strategic discussions." },
      { icon: "Users", title: "LP communication templates", description: "Templates for limited partner updates with fund performance, portfolio highlights, and market commentary." },
      { icon: "Shield", title: "Financial data protection", description: "DLP guardrails prevent sensitive financial metrics from leaking through AI reporting prompts." },
      { icon: "Zap", title: "Consistent formatting", description: "Templates ensure every investor update follows the same professional format and level of detail." },
    ] },
    benefits: { heading: "Why companies use AI investor reporting workflows", items: ["Compile investor metrics consistently every period", "Draft compelling narratives that tell your story", "Create board decks with consistent professional quality", "Communicate with LPs using structured update formats", "Protect sensitive financial data with DLP scanning", "Reduce investor reporting time by 70%"] },
    faqs: [
      { question: "What metrics are covered?", answer: "Templates cover MRR/ARR, burn rate, runway, customer metrics, revenue growth, churn, and any custom KPIs your investors track." },
      { question: "Is financial data protected?", answer: "Yes. DLP guardrails scan for sensitive revenue, valuation, runway, and cap table data before prompts reach AI tools." },
      { question: "Can I create board decks?", answer: "Yes. Board deck templates produce structured presentations with financial summaries, operational updates, strategic discussions, and decision items." },
    ],
    cta: { headline: "Impress your investors.", gradientText: "AI-powered reporting workflows.", subtitle: "Free plan available. Streamline investor communications." },
  },
  {
    slug: "vendor-evaluation-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Vendor Evaluation Workflow | TeamPrompt", description: "Standardize vendor evaluation with AI prompt workflows for requirements gathering, scorecard creation, and decision documentation. Choose better vendors, faster.", keywords: ["vendor evaluation AI workflow", "AI procurement", "vendor selection prompts"] },
    hero: { headline: "Vendor evaluation workflows powered by AI", subtitle: "Standardize how your team evaluates vendors — from requirements gathering and RFP creation to scorecard evaluation and decision documentation.", badges: ["Requirements gathering", "Scorecard evaluation", "Decision documentation"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end vendor evaluation workflow", items: [
      { icon: "BookOpen", title: "Requirements gathering prompts", description: "Structured prompts for defining functional, technical, and business requirements from stakeholders." },
      { icon: "FileText", title: "RFP creation templates", description: "Templates for producing RFPs with clear requirements, evaluation criteria, and response formats." },
      { icon: "BarChart3", title: "Scorecard templates", description: "Templates for scoring vendors on features, pricing, support, security, and integration capabilities." },
      { icon: "Eye", title: "Reference check prompts", description: "Templates for structured vendor reference calls with probing questions about reliability and support quality." },
      { icon: "Scale", title: "Decision documentation templates", description: "Templates for documenting vendor selection rationale with comparison matrices and trade-off analysis." },
      { icon: "Users", title: "Stakeholder alignment prompts", description: "Templates for building consensus across stakeholders with structured evaluation presentations." },
    ] },
    benefits: { heading: "Why teams use AI vendor evaluation workflows", items: ["Gather requirements systematically from all stakeholders", "Create comprehensive RFPs with clear evaluation criteria", "Score vendors objectively with consistent scorecards", "Conduct reference checks with structured questions", "Document selection decisions for audit and alignment", "Build stakeholder consensus with structured presentations"] },
    faqs: [
      { question: "Can I evaluate any type of vendor?", answer: "Yes. Templates adapt to software, services, hardware, and professional services with category-specific evaluation criteria." },
      { question: "How do scorecards work?", answer: "Scorecard templates define evaluation dimensions, weighting, and scoring criteria so every evaluator grades vendors consistently." },
      { question: "Do workflows document the decision?", answer: "Yes. Decision templates capture evaluation results, trade-off analysis, and selection rationale for audit trails and stakeholder communication." },
    ],
    cta: { headline: "Choose better vendors.", gradientText: "AI-powered evaluation workflows.", subtitle: "Free plan available. Evaluate vendors systematically." },
  },
  {
    slug: "customer-feedback-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Customer Feedback Workflow | TeamPrompt", description: "Standardize customer feedback with AI prompt workflows for collection, analysis, and action planning. Turn feedback into product improvements.", keywords: ["customer feedback AI workflow", "AI voice of customer", "feedback analysis prompts"] },
    hero: { headline: "Customer feedback workflows powered by AI", subtitle: "Standardize how your team collects, analyzes, and acts on customer feedback — from survey design and sentiment analysis to prioritized action plans.", badges: ["Feedback collection", "Sentiment analysis", "Action planning"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end customer feedback workflow", items: [
      { icon: "Users", title: "Survey design prompts", description: "Templates for NPS, CSAT, and product feedback surveys with targeted, unbiased question design." },
      { icon: "Eye", title: "Sentiment analysis templates", description: "Templates for analyzing feedback themes, sentiment trends, and emotional patterns across responses." },
      { icon: "BarChart3", title: "Feedback categorization prompts", description: "Templates for organizing feedback into product areas, feature requests, bugs, and experience issues." },
      { icon: "BookOpen", title: "Insight reporting templates", description: "Templates for presenting feedback insights to product, engineering, and leadership teams." },
      { icon: "Zap", title: "Action planning prompts", description: "Templates for converting feedback insights into prioritized product improvements and process changes." },
      { icon: "Shield", title: "Customer data protection", description: "DLP guardrails prevent customer PII from leaking through AI feedback analysis prompts." },
    ] },
    benefits: { heading: "Why teams use AI customer feedback workflows", items: ["Design effective surveys with structured question templates", "Analyze sentiment and themes across large feedback volumes", "Categorize feedback by product area and request type", "Present insights in actionable formats for product teams", "Convert insights into prioritized improvement plans", "Protect customer data in all feedback analysis"] },
    faqs: [
      { question: "What feedback types are supported?", answer: "Workflows handle NPS surveys, CSAT scores, product reviews, support ticket feedback, user interviews, and social media mentions." },
      { question: "Can I analyze large volumes of feedback?", answer: "Yes. Sentiment and categorization templates process feedback at scale, identifying themes and trends across thousands of responses." },
      { question: "Is customer data protected?", answer: "Yes. DLP guardrails prevent customer names, emails, and other PII from leaking through AI feedback analysis prompts." },
    ],
    cta: { headline: "Listen, analyze, improve.", gradientText: "AI-powered feedback workflows.", subtitle: "Free plan available. Turn feedback into action." },
  },
  {
    slug: "documentation-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Documentation Workflow | TeamPrompt", description: "Standardize documentation with AI prompt workflows for planning, writing, reviewing, and maintaining docs. Better docs, less effort.", keywords: ["documentation AI workflow", "AI technical writing", "docs workflow prompts"] },
    hero: { headline: "Documentation workflows powered by AI", subtitle: "Standardize how your team produces documentation — from planning and outlining to writing, reviewing, and keeping docs up to date.", badges: ["Planning", "Writing", "Maintenance"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end documentation workflow", items: [
      { icon: "BookOpen", title: "Documentation planning prompts", description: "Templates for identifying what needs documentation, prioritizing, and creating content calendars." },
      { icon: "Zap", title: "Outline generation templates", description: "Templates for producing structured doc outlines with sections, depth, and audience considerations." },
      { icon: "Eye", title: "Writing templates", description: "Templates for drafting technical docs, user guides, and API references with consistent style and structure." },
      { icon: "Users", title: "Peer review prompts", description: "Templates for structured doc reviews covering accuracy, clarity, completeness, and audience appropriateness." },
      { icon: "GitBranch", title: "Maintenance prompts", description: "Templates for identifying outdated docs, planning updates, and tracking documentation currency." },
      { icon: "Shield", title: "Sensitive data protection", description: "DLP guardrails prevent credentials, internal URLs, and proprietary details from appearing in docs." },
    ] },
    benefits: { heading: "Why teams use AI documentation workflows", items: ["Plan documentation systematically with content calendars", "Generate outlines that match audience and purpose", "Draft docs with consistent style and structure", "Review docs thoroughly with structured review checklists", "Keep docs current with maintenance tracking templates", "Protect sensitive data in all documentation workflows"] },
    faqs: [
      { question: "What types of documentation are covered?", answer: "Workflows support technical docs, API references, user guides, READMEs, runbooks, changelogs, and any other documentation type." },
      { question: "How do maintenance templates work?", answer: "Maintenance prompts identify docs that reference outdated features, deprecated APIs, or changed processes and prioritize updates." },
      { question: "Are credentials protected?", answer: "Yes. DLP guardrails scan for API keys, connection strings, and internal URLs before documentation prompts reach AI tools." },
    ],
    cta: { headline: "Docs that stay current.", gradientText: "AI-powered documentation workflows.", subtitle: "Free plan available. Fix your documentation process." },
  },
  {
    slug: "market-analysis-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Market Analysis Workflow | TeamPrompt", description: "Standardize market analysis with AI prompt workflows for industry research, competitive intelligence, and trend identification. Better strategy, faster decisions.", keywords: ["market analysis AI workflow", "AI market research", "competitive intelligence prompts"] },
    hero: { headline: "Market analysis workflows powered by AI", subtitle: "Standardize how your team conducts market analysis — from industry research and competitive intelligence to trend identification and strategic recommendations.", badges: ["Industry research", "Competitive intelligence", "Trend identification"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end market analysis workflow", items: [
      { icon: "Globe", title: "Industry research prompts", description: "Structured prompts for analyzing market size, growth rates, key players, and industry dynamics." },
      { icon: "Eye", title: "Competitive intelligence templates", description: "Templates for systematic competitor evaluation — products, pricing, positioning, and market share." },
      { icon: "BarChart3", title: "Trend identification prompts", description: "Templates for spotting emerging trends from signals in technology, regulation, and consumer behavior." },
      { icon: "BookOpen", title: "Strategic recommendation templates", description: "Templates for translating market insights into actionable strategic recommendations for leadership." },
      { icon: "Users", title: "Stakeholder briefing prompts", description: "Templates for presenting market analysis to different audiences — board, executives, and operational teams." },
      { icon: "Shield", title: "Intelligence protection", description: "DLP guardrails prevent proprietary market intelligence from leaking through AI analysis prompts." },
    ] },
    benefits: { heading: "Why strategy teams use AI market analysis workflows", items: ["Research industries systematically with structured prompts", "Track competitors with consistent evaluation frameworks", "Identify emerging trends before they become obvious", "Translate insights into strategic recommendations", "Brief stakeholders with audience-appropriate presentations", "Protect proprietary market intelligence with DLP scanning"] },
    faqs: [
      { question: "What markets can I analyze?", answer: "Workflows are industry-agnostic. Templates adapt to SaaS, healthcare, finance, manufacturing, and any other market with customizable analysis frameworks." },
      { question: "How do trend identification prompts work?", answer: "Templates guide analysis of technology developments, regulatory changes, consumer behavior shifts, and competitive moves to identify emerging market trends." },
      { question: "Is competitive intelligence protected?", answer: "Yes. DLP guardrails prevent proprietary market data, internal projections, and competitive strategy from leaking through AI prompts." },
    ],
    cta: { headline: "Strategy backed by data.", gradientText: "AI-powered market analysis.", subtitle: "Free plan available. Analyze markets systematically." },
  },
  {
    slug: "security-review-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Security Review Workflow | TeamPrompt", description: "Standardize security reviews with AI prompt workflows for threat modeling, vulnerability assessment, and remediation planning. Secure systems, consistent reviews.", keywords: ["security review AI workflow", "AI threat modeling", "security assessment prompts"] },
    hero: { headline: "Security review workflows powered by AI", subtitle: "Standardize how your team conducts security reviews — from threat modeling and vulnerability assessment to penetration test scoping and remediation planning.", badges: ["Threat modeling", "Vulnerability assessment", "Remediation planning"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end security review workflow", items: [
      { icon: "ShieldCheck", title: "Threat modeling prompts", description: "Structured prompts for STRIDE threat modeling with asset identification, threat enumeration, and mitigation planning." },
      { icon: "ShieldAlert", title: "Vulnerability assessment templates", description: "Templates for systematic vulnerability identification across applications, infrastructure, and configurations." },
      { icon: "Key", title: "Access review prompts", description: "Templates for reviewing access controls, permissions, and privilege escalation paths." },
      { icon: "BookOpen", title: "Remediation planning templates", description: "Templates for prioritized fix plans with severity scores, effort estimates, and verification criteria." },
      { icon: "Eye", title: "Security posture reporting", description: "Templates for presenting security review findings to technical teams and executive leadership." },
      { icon: "Users", title: "Team security standards", description: "Share security review workflows so every engineer applies the same security evaluation criteria." },
    ] },
    benefits: { heading: "Why security teams use AI review workflows", items: ["Model threats systematically with STRIDE frameworks", "Assess vulnerabilities consistently across all systems", "Review access controls with structured evaluation templates", "Plan remediation with prioritized, actionable fix plans", "Report security posture to technical and executive audiences", "Standardize security reviews across your engineering team"] },
    faqs: [
      { question: "What threat modeling frameworks are supported?", answer: "Workflows support STRIDE, DREAD, PASTA, and custom threat modeling frameworks with structured prompts for each methodology." },
      { question: "Can I use this for any system?", answer: "Yes. Templates adapt to web applications, APIs, infrastructure, cloud services, and mobile applications." },
      { question: "Do workflows include remediation planning?", answer: "Yes. Remediation templates prioritize findings by severity, estimate effort, and define verification criteria for each fix." },
    ],
    cta: { headline: "Secure your systems.", gradientText: "AI-powered security workflows.", subtitle: "Free plan available. Review security systematically." },
  },
  {
    slug: "sprint-planning-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Sprint Planning Workflow | TeamPrompt", description: "Standardize sprint planning with AI prompt workflows for backlog grooming, story writing, estimation, and capacity planning. Better sprints, consistent delivery.", keywords: ["sprint planning AI workflow", "AI agile workflow", "scrum planning prompts"] },
    hero: { headline: "Sprint planning workflows powered by AI", subtitle: "Standardize how your team plans sprints — from backlog grooming and story writing to estimation, capacity planning, and retrospectives.", badges: ["Backlog grooming", "Story writing", "Capacity planning"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end sprint planning workflow", items: [
      { icon: "BookOpen", title: "Backlog grooming prompts", description: "Templates for refining backlog items with acceptance criteria, technical requirements, and priority assessment." },
      { icon: "Zap", title: "User story templates", description: "Templates for writing user stories with persona, goal, benefit, and acceptance criteria in consistent format." },
      { icon: "BarChart3", title: "Estimation prompts", description: "Templates for story point estimation using planning poker, T-shirt sizing, or reference-based estimation." },
      { icon: "Users", title: "Capacity planning templates", description: "Templates for calculating team capacity with availability, velocity history, and sprint commitment." },
      { icon: "Eye", title: "Sprint goal templates", description: "Templates for defining clear, measurable sprint goals that align with product objectives." },
      { icon: "GitBranch", title: "Retrospective prompts", description: "Templates for structured sprint retros with what went well, what to improve, and action items." },
    ] },
    benefits: { heading: "Why agile teams use AI sprint planning workflows", items: ["Groom backlogs consistently with structured refinement prompts", "Write user stories with clear acceptance criteria", "Estimate stories accurately with proven estimation frameworks", "Plan sprint capacity with data-driven templates", "Set measurable sprint goals aligned to product strategy", "Run productive retrospectives with structured reflection prompts"] },
    faqs: [
      { question: "What agile frameworks are supported?", answer: "Workflows support Scrum, Kanban, and hybrid agile frameworks with methodology-specific ceremonies and artifacts." },
      { question: "How do estimation prompts work?", answer: "Templates guide teams through reference-based estimation, planning poker, and T-shirt sizing with calibration exercises for consistent sizing." },
      { question: "Do workflows include retrospectives?", answer: "Yes. Retrospective templates provide structured formats — Start/Stop/Continue, 4Ls, and custom — for productive sprint reflection." },
    ],
    cta: { headline: "Better sprints, consistent delivery.", gradientText: "AI-powered planning workflows.", subtitle: "Free plan available. Plan sprints systematically." },
  },
  {
    slug: "knowledge-base-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Knowledge Base Workflow | TeamPrompt", description: "Standardize knowledge base creation with AI prompt workflows for article writing, categorization, and maintenance. Better self-service, fewer tickets.", keywords: ["knowledge base AI workflow", "AI help center", "KB article prompts"] },
    hero: { headline: "Knowledge base workflows powered by AI", subtitle: "Standardize how your team builds and maintains knowledge bases — from article planning and writing to categorization, review, and freshness tracking.", badges: ["Article writing", "Categorization", "Maintenance"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end knowledge base workflow", items: [
      { icon: "BookOpen", title: "Article planning prompts", description: "Templates for identifying knowledge gaps from support tickets, search queries, and user feedback." },
      { icon: "Zap", title: "Article writing templates", description: "Templates for clear, scannable KB articles with problem statement, solution steps, and related resources." },
      { icon: "Archive", title: "Categorization prompts", description: "Templates for organizing articles into logical categories with tagging, cross-referencing, and search optimization." },
      { icon: "Eye", title: "Review and approval templates", description: "Templates for structured article reviews covering accuracy, clarity, completeness, and audience appropriateness." },
      { icon: "BarChart3", title: "Freshness tracking prompts", description: "Templates for identifying outdated articles, scheduling updates, and tracking content currency." },
      { icon: "Users", title: "Team KB standards", description: "Share KB workflows so every contributor produces consistent, high-quality help content." },
    ] },
    benefits: { heading: "Why support teams use AI knowledge base workflows", items: ["Identify knowledge gaps from real support ticket patterns", "Write clear, scannable articles with structured templates", "Organize content for easy discovery and navigation", "Review articles for accuracy and completeness", "Keep content fresh with maintenance tracking", "Reduce support tickets with better self-service content"] },
    faqs: [
      { question: "How do I identify what articles to write?", answer: "Planning templates analyze support ticket trends, search queries, and user feedback to identify the highest-impact knowledge gaps." },
      { question: "Do templates ensure article quality?", answer: "Yes. Writing templates produce structured articles with clear problem statements, step-by-step solutions, and related resources." },
      { question: "How do I keep articles up to date?", answer: "Freshness tracking templates flag articles that reference outdated features, deprecated processes, or old screenshots for scheduled review." },
    ],
    cta: { headline: "Self-service that works.", gradientText: "AI-powered KB workflows.", subtitle: "Free plan available. Build your knowledge base today." },
  },
  {
    slug: "quality-assurance-ai-workflow",
    category: "workflow",
    meta: { title: "AI-Powered Quality Assurance Workflow | TeamPrompt", description: "Standardize quality assurance with AI prompt workflows for test planning, execution, bug reporting, and release readiness. Ship quality software consistently.", keywords: ["quality assurance AI workflow", "AI QA testing", "test management prompts"] },
    hero: { headline: "Quality assurance workflows powered by AI", subtitle: "Standardize how your QA team works — from test planning and case writing to execution, bug reporting, and release readiness assessment.", badges: ["Test planning", "Bug reporting", "Release readiness"] },
    features: { sectionLabel: "Workflow", heading: "End-to-end quality assurance workflow", items: [
      { icon: "BookOpen", title: "Test planning prompts", description: "Templates for test strategy, scope definition, and risk-based test prioritization for each release." },
      { icon: "ShieldCheck", title: "Test case writing templates", description: "Templates for comprehensive test cases with preconditions, steps, expected results, and edge cases." },
      { icon: "Eye", title: "Exploratory testing prompts", description: "Guided exploratory testing charters with focus areas, personas, and heuristic-based test ideas." },
      { icon: "ShieldAlert", title: "Bug reporting templates", description: "Templates for clear bug reports with severity, reproduction steps, environment, and expected vs actual behavior." },
      { icon: "BarChart3", title: "Release readiness assessment", description: "Templates for go/no-go decisions based on test coverage, defect density, and risk assessment." },
      { icon: "Users", title: "Team QA standards", description: "Share QA workflows so every tester follows the same quality standards and reporting formats." },
    ] },
    benefits: { heading: "Why QA teams use AI quality assurance workflows", items: ["Plan testing strategically with risk-based prioritization", "Write comprehensive test cases with edge case coverage", "Guide exploratory testing with structured charters", "Report bugs clearly with consistent, detailed templates", "Assess release readiness with data-driven go/no-go criteria", "Standardize QA practices across your testing team"] },
    faqs: [
      { question: "Does the workflow cover all testing types?", answer: "Yes. Templates support functional, regression, integration, exploratory, performance, and security testing with type-specific prompts." },
      { question: "How do release readiness templates work?", answer: "Templates evaluate test coverage, defect density, open critical bugs, and risk areas to produce a structured go/no-go recommendation." },
      { question: "Can I standardize bug reports?", answer: "Yes. Bug reporting templates ensure every report includes severity, steps, environment, expected behavior, actual behavior, and screenshots for efficient debugging." },
    ],
    cta: { headline: "Ship with confidence.", gradientText: "AI-powered QA workflows.", subtitle: "Free plan available. Build your QA process today." },
  },
];
