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
      { value: "60%", label: "Faster first response" },
      { value: "100%", label: "DLP coverage" },
      { value: "3x", label: "Agent onboarding speed" },
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
      { value: "3x", label: "Content output" },
      { value: "50%", label: "Faster drafting" },
      { value: "100%", label: "Brand consistency" },
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
      { value: "40%", label: "Faster proposal turnaround" },
      { value: "2x", label: "Outreach personalization" },
      { value: "5x", label: "Faster rep onboarding" },
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
      { value: "70%", label: "Faster JD creation" },
      { value: "100%", label: "PII protection" },
      { value: "50%", label: "Faster onboarding" },
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
      { value: "5x", label: "Faster PRD creation" },
      { value: "80%", label: "Less blank-page time" },
      { value: "100%", label: "IP protection" },
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
      { value: "4x", label: "Faster copy production" },
      { value: "100%", label: "Brand consistency" },
      { value: "60%", label: "Less revision cycles" },
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
      { value: "3x", label: "Faster contract review" },
      { value: "100%", label: "Privilege protection" },
      { value: "Full", label: "Audit trail" },
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
      { value: "60%", label: "Faster report drafting" },
      { value: "100%", label: "MNPI protection" },
      { value: "SOX", label: "Compliant audit trails" },
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
      { value: "3x", label: "Faster literature reviews" },
      { value: "50%", label: "Less report drafting time" },
      { value: "100%", label: "Data protection" },
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
      { value: "5x", label: "Faster test case creation" },
      { value: "80%", label: "More edge cases covered" },
      { value: "100%", label: "Data protection" },
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
];
