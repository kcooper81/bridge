import type { SecurityCategory } from "@/lib/types";

// ─── Types ───

export interface SeedPrompt {
  title: string;
  content: string;
  description: string;
  tags: string[];
  tone: string;
  is_template: boolean;
  template_variables: string[];
}

export interface SeedGuideline {
  id: string; // references DEFAULT_GUIDELINES id
  name: string;
  description: string;
  category: string;
}

export interface LibraryPack {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  prompts: SeedPrompt[];
  guidelines: SeedGuideline[];
  guardrailCategories?: SecurityCategory[];
}

// ─── 8 Content Packs ───

export const LIBRARY_PACKS: LibraryPack[] = [
  // 1. Engineering & Development
  {
    id: "engineering",
    name: "Engineering & Development",
    description:
      "Prompts for code reviews, PR descriptions, bug reports, architecture docs, and debugging workflows.",
    icon: "Code2",
    prompts: [
      {
        title: "Code Review Checklist",
        content:
          "Perform a thorough code review on the following pull request.\n\n" +
          "**PR title:** {{pr_title}}\n" +
          "**Changed files:**\n{{diff}}\n\n" +
          "Evaluate:\n" +
          "- Correctness and edge cases\n" +
          "- Security vulnerabilities\n" +
          "- Performance implications\n" +
          "- Test coverage gaps\n" +
          "- Code style and naming conventions\n\n" +
          "Provide specific, actionable feedback with line references.",
        description: "Comprehensive code review checklist for pull requests.",
        tags: ["engineering", "code-review", "template"],
        tone: "technical",
        is_template: true,
        template_variables: ["pr_title", "diff"],
      },
      {
        title: "PR Description Generator",
        content:
          "Write a clear pull request description.\n\n" +
          "**What changed:** {{changes}}\n" +
          "**Why:** {{motivation}}\n" +
          "**How to test:** {{test_steps}}\n\n" +
          "Format with: Summary, Changes, Testing, and any Notes sections.",
        description: "Generate well-structured PR descriptions from your notes.",
        tags: ["engineering", "git", "template"],
        tone: "technical",
        is_template: true,
        template_variables: ["changes", "motivation", "test_steps"],
      },
      {
        title: "Bug Report Template",
        content:
          "Write a detailed bug report.\n\n" +
          "**Summary:** {{summary}}\n" +
          "**Steps to reproduce:**\n{{steps}}\n" +
          "**Expected behavior:** {{expected}}\n" +
          "**Actual behavior:** {{actual}}\n\n" +
          "Include severity assessment and potential root cause if known.",
        description: "Structured bug reports with reproduction steps.",
        tags: ["engineering", "bugs", "template"],
        tone: "technical",
        is_template: true,
        template_variables: ["summary", "steps", "expected", "actual"],
      },
      {
        title: "Architecture Decision Record",
        content:
          "Write an Architecture Decision Record (ADR).\n\n" +
          "**Title:** {{decision_title}}\n" +
          "**Context:** {{context}}\n" +
          "**Options considered:** {{options}}\n\n" +
          "Format as:\n" +
          "- Status (proposed/accepted/deprecated)\n" +
          "- Context & problem statement\n" +
          "- Decision drivers\n" +
          "- Options with pros/cons\n" +
          "- Decision outcome and consequences",
        description: "Document architectural decisions in ADR format.",
        tags: ["engineering", "architecture", "template"],
        tone: "technical",
        is_template: true,
        template_variables: ["decision_title", "context", "options"],
      },
      {
        title: "Debugging Assistant",
        content:
          "Help me debug this issue.\n\n" +
          "**Error message:** {{error}}\n" +
          "**Context:** {{context}}\n" +
          "**What I've tried:** {{attempts}}\n\n" +
          "Provide:\n" +
          "1. Likely root causes (most to least probable)\n" +
          "2. Diagnostic steps to narrow down the issue\n" +
          "3. Potential fixes for each cause",
        description: "Systematic debugging assistance with root cause analysis.",
        tags: ["engineering", "debugging", "template"],
        tone: "technical",
        is_template: true,
        template_variables: ["error", "context", "attempts"],
      },
    ],
    guidelines: [
      {
        id: "std-coding",
        name: "Coding",
        description: "Standards for code-related prompts",
        category: "development",
      },
    ],
    guardrailCategories: ["api_keys", "credentials"],
  },

  // 2. Marketing & Content
  {
    id: "marketing",
    name: "Marketing & Content",
    description:
      "Prompts for blog posts, social media, email campaigns, and SEO content briefs.",
    icon: "Megaphone",
    prompts: [
      {
        title: "Blog Post Draft",
        content:
          "Write a blog post on the following topic.\n\n" +
          "**Topic:** {{topic}}\n" +
          "**Target audience:** {{audience}}\n" +
          "**Key message:** {{key_message}}\n" +
          "**Target word count:** {{word_count}}\n\n" +
          "Include an engaging introduction, clear subheadings, and a strong call-to-action.",
        description: "Generate first drafts of blog posts with structure and flow.",
        tags: ["marketing", "blog", "template"],
        tone: "creative",
        is_template: true,
        template_variables: ["topic", "audience", "key_message", "word_count"],
      },
      {
        title: "Social Media Post Pack",
        content:
          "Create social media posts for the following announcement.\n\n" +
          "**Announcement:** {{announcement}}\n" +
          "**Platforms:** {{platforms}}\n" +
          "**Tone:** {{brand_tone}}\n\n" +
          "For each platform, write a post that:\n" +
          "- Fits the platform's character limits and style\n" +
          "- Includes relevant hashtags\n" +
          "- Has a clear call-to-action",
        description: "Multi-platform social media content from a single announcement.",
        tags: ["marketing", "social-media", "template"],
        tone: "creative",
        is_template: true,
        template_variables: ["announcement", "platforms", "brand_tone"],
      },
      {
        title: "Email Campaign Draft",
        content:
          "Draft a marketing email.\n\n" +
          "**Campaign goal:** {{goal}}\n" +
          "**Audience segment:** {{segment}}\n" +
          "**Key offer/message:** {{offer}}\n\n" +
          "Include:\n" +
          "- Subject line (3 options, A/B test ready)\n" +
          "- Preview text\n" +
          "- Email body with clear CTA\n" +
          "- PS line for urgency or secondary CTA",
        description: "Email campaign drafts with subject line variations.",
        tags: ["marketing", "email", "template"],
        tone: "persuasive",
        is_template: true,
        template_variables: ["goal", "segment", "offer"],
      },
      {
        title: "SEO Content Brief",
        content:
          "Create an SEO-optimized content brief.\n\n" +
          "**Primary keyword:** {{keyword}}\n" +
          "**Search intent:** {{intent}}\n" +
          "**Competitor URLs:** {{competitors}}\n\n" +
          "Include:\n" +
          "- Suggested title (with keyword)\n" +
          "- Meta description\n" +
          "- H2/H3 outline\n" +
          "- Related keywords and LSI terms\n" +
          "- Recommended word count\n" +
          "- Internal linking opportunities",
        description: "SEO-focused content briefs with keyword strategy.",
        tags: ["marketing", "seo", "template"],
        tone: "analytical",
        is_template: true,
        template_variables: ["keyword", "intent", "competitors"],
      },
    ],
    guidelines: [
      {
        id: "std-marketing",
        name: "Marketing & Content",
        description: "Marketing content standards",
        category: "marketing",
      },
    ],
  },

  // 3. Customer Support
  {
    id: "support",
    name: "Customer Support",
    description:
      "Prompts for ticket responses, escalations, FAQ drafts, and customer feedback summaries.",
    icon: "Headphones",
    prompts: [
      {
        title: "Ticket Response",
        content:
          "Draft a support ticket response.\n\n" +
          "**Customer:** {{customer_name}}\n" +
          "**Issue:** {{issue}}\n" +
          "**Ticket priority:** {{priority}}\n\n" +
          "Guidelines:\n" +
          "- Acknowledge their issue promptly\n" +
          "- Provide a clear solution or next steps\n" +
          "- Set expectations for timeline\n" +
          "- Close with an offer to help further",
        description: "Professional support ticket responses with empathy.",
        tags: ["support", "tickets", "template"],
        tone: "empathetic",
        is_template: true,
        template_variables: ["customer_name", "issue", "priority"],
      },
      {
        title: "Escalation Summary",
        content:
          "Write an escalation summary for a support case.\n\n" +
          "**Customer:** {{customer_name}}\n" +
          "**Issue timeline:** {{timeline}}\n" +
          "**Steps taken:** {{steps_taken}}\n" +
          "**Why escalating:** {{reason}}\n\n" +
          "Format concisely for the receiving team with clear context and recommended action.",
        description: "Concise escalation summaries for internal handoffs.",
        tags: ["support", "escalation", "template"],
        tone: "professional",
        is_template: true,
        template_variables: ["customer_name", "timeline", "steps_taken", "reason"],
      },
      {
        title: "FAQ Article Draft",
        content:
          "Write a customer-facing FAQ article.\n\n" +
          "**Question:** {{question}}\n" +
          "**Detailed answer:** {{answer_notes}}\n" +
          "**Product area:** {{product_area}}\n\n" +
          "Write in a clear, scannable format. Include step-by-step instructions if applicable.",
        description: "Transform support knowledge into customer-facing FAQ articles.",
        tags: ["support", "faq", "template"],
        tone: "instructional",
        is_template: true,
        template_variables: ["question", "answer_notes", "product_area"],
      },
      {
        title: "Feedback Summary Report",
        content:
          "Summarize customer feedback from the following data.\n\n" +
          "**Time period:** {{period}}\n" +
          "**Feedback entries:**\n{{feedback}}\n\n" +
          "Organize by:\n" +
          "- Top themes (with frequency)\n" +
          "- Sentiment breakdown (positive/neutral/negative)\n" +
          "- Actionable insights and recommendations\n" +
          "- Quotes that illustrate key themes",
        description: "Turn raw customer feedback into actionable insight reports.",
        tags: ["support", "feedback", "template"],
        tone: "analytical",
        is_template: true,
        template_variables: ["period", "feedback"],
      },
    ],
    guidelines: [
      {
        id: "std-support",
        name: "Customer Support",
        description: "Customer-facing communication standards",
        category: "support",
      },
    ],
    guardrailCategories: ["pii"],
  },

  // 4. Sales
  {
    id: "sales",
    name: "Sales",
    description:
      "Prompts for cold outreach, follow-ups, proposals, and objection handling.",
    icon: "TrendingUp",
    prompts: [
      {
        title: "Cold Outreach Email",
        content:
          "Write a cold outreach email.\n\n" +
          "**Prospect:** {{prospect_name}} at {{company}}\n" +
          "**Their pain point:** {{pain_point}}\n" +
          "**Our solution:** {{value_prop}}\n\n" +
          "Keep it under 150 words. Be personal, not pushy. End with a low-friction CTA.",
        description: "Personalized cold outreach that gets replies.",
        tags: ["sales", "outreach", "template"],
        tone: "professional",
        is_template: true,
        template_variables: ["prospect_name", "company", "pain_point", "value_prop"],
      },
      {
        title: "Follow-Up Sequence",
        content:
          "Write a 3-email follow-up sequence.\n\n" +
          "**Context:** {{previous_interaction}}\n" +
          "**Goal:** {{desired_outcome}}\n" +
          "**Time gaps:** {{cadence}}\n\n" +
          "Each email should:\n" +
          "- Add new value (don't just \"check in\")\n" +
          "- Reference the previous touchpoint\n" +
          "- Have a distinct angle or hook\n" +
          "- Include a clear next step",
        description: "Multi-touch follow-up sequences that add value.",
        tags: ["sales", "follow-up", "template"],
        tone: "persuasive",
        is_template: true,
        template_variables: ["previous_interaction", "desired_outcome", "cadence"],
      },
      {
        title: "Proposal Executive Summary",
        content:
          "Write a proposal executive summary.\n\n" +
          "**Client:** {{client_name}}\n" +
          "**Challenge:** {{challenge}}\n" +
          "**Proposed solution:** {{solution}}\n" +
          "**Investment:** {{pricing}}\n\n" +
          "Structure: Problem → Solution → Benefits → ROI → Next Steps. Keep it to one page.",
        description: "Compelling proposal summaries that close deals.",
        tags: ["sales", "proposal", "template"],
        tone: "authoritative",
        is_template: true,
        template_variables: ["client_name", "challenge", "solution", "pricing"],
      },
      {
        title: "Objection Handling Playbook",
        content:
          "Help me respond to this sales objection.\n\n" +
          "**Objection:** {{objection}}\n" +
          "**Deal context:** {{context}}\n" +
          "**Our strengths:** {{differentiators}}\n\n" +
          "Provide:\n" +
          "- Acknowledge the concern\n" +
          "- Reframe the objection\n" +
          "- Evidence or social proof\n" +
          "- Transition to next step",
        description: "Turn objections into opportunities with structured responses.",
        tags: ["sales", "objection-handling", "template"],
        tone: "persuasive",
        is_template: true,
        template_variables: ["objection", "context", "differentiators"],
      },
    ],
    guidelines: [
      {
        id: "std-sales",
        name: "Sales Communication",
        description: "Sales outreach and communication standards",
        category: "sales",
      },
    ],
  },

  // 5. HR & People
  {
    id: "hr",
    name: "HR & People",
    description:
      "Prompts for job descriptions, interview questions, performance reviews, and onboarding materials.",
    icon: "Users",
    prompts: [
      {
        title: "Job Description Writer",
        content:
          "Write a compelling job description.\n\n" +
          "**Role:** {{job_title}}\n" +
          "**Team:** {{team}}\n" +
          "**Key responsibilities:** {{responsibilities}}\n" +
          "**Required skills:** {{requirements}}\n\n" +
          "Use inclusive language. Include: About Us (brief), Role Overview, Responsibilities, Requirements, Nice-to-haves, Benefits.",
        description: "Inclusive, well-structured job descriptions.",
        tags: ["hr", "hiring", "template"],
        tone: "professional",
        is_template: true,
        template_variables: ["job_title", "team", "responsibilities", "requirements"],
      },
      {
        title: "Interview Question Set",
        content:
          "Generate interview questions for this role.\n\n" +
          "**Role:** {{role}}\n" +
          "**Key competencies:** {{competencies}}\n" +
          "**Interview stage:** {{stage}}\n\n" +
          "Include:\n" +
          "- 3 behavioral questions (STAR format)\n" +
          "- 2 situational questions\n" +
          "- 2 role-specific technical questions\n" +
          "- What good/great answers look like",
        description: "Competency-based interview question sets with answer guides.",
        tags: ["hr", "interviews", "template"],
        tone: "professional",
        is_template: true,
        template_variables: ["role", "competencies", "stage"],
      },
      {
        title: "Performance Review Draft",
        content:
          "Draft a performance review.\n\n" +
          "**Employee name:** {{employee_name}}\n" +
          "**Review period:** {{period}}\n" +
          "**Key accomplishments:** {{accomplishments}}\n" +
          "**Areas for growth:** {{growth_areas}}\n\n" +
          "Be specific, balanced, and forward-looking. Include concrete examples and development suggestions.",
        description: "Balanced performance reviews with specific feedback.",
        tags: ["hr", "performance", "template"],
        tone: "professional",
        is_template: true,
        template_variables: ["employee_name", "period", "accomplishments", "growth_areas"],
      },
      {
        title: "Onboarding Welcome Guide",
        content:
          "Create an onboarding welcome message and first-week guide.\n\n" +
          "**New hire name:** {{new_hire}}\n" +
          "**Role:** {{role}}\n" +
          "**Team:** {{team}}\n" +
          "**Start date:** {{start_date}}\n\n" +
          "Include: Welcome message, Day 1 checklist, Week 1 goals, Key contacts, and helpful resources.",
        description: "Warm onboarding welcome messages with first-week structure.",
        tags: ["hr", "onboarding", "template"],
        tone: "friendly",
        is_template: true,
        template_variables: ["new_hire", "role", "team", "start_date"],
      },
    ],
    guidelines: [
      {
        id: "std-hr",
        name: "HR & People",
        description: "Human resources communication standards",
        category: "hr",
      },
    ],
    guardrailCategories: ["pii"],
  },

  // 6. Legal & Compliance
  {
    id: "legal",
    name: "Legal & Compliance",
    description:
      "Prompts for contract summaries, policy drafts, and compliance checklists.",
    icon: "Scale",
    prompts: [
      {
        title: "Contract Summary",
        content:
          "Summarize the key terms of this contract.\n\n" +
          "**Contract type:** {{contract_type}}\n" +
          "**Parties:** {{parties}}\n" +
          "**Key clauses:**\n{{clauses}}\n\n" +
          "Highlight:\n" +
          "- Key obligations for each party\n" +
          "- Important dates and deadlines\n" +
          "- Financial terms\n" +
          "- Termination conditions\n" +
          "- Risk areas or unusual clauses",
        description: "Plain-language contract summaries highlighting key terms.",
        tags: ["legal", "contracts", "template"],
        tone: "formal",
        is_template: true,
        template_variables: ["contract_type", "parties", "clauses"],
      },
      {
        title: "Policy Draft",
        content:
          "Draft an internal policy document.\n\n" +
          "**Policy topic:** {{topic}}\n" +
          "**Scope:** {{scope}}\n" +
          "**Key requirements:** {{requirements}}\n\n" +
          "Structure with: Purpose, Scope, Definitions, Policy Statement, Procedures, Responsibilities, and Enforcement.",
        description: "Well-structured internal policy documents.",
        tags: ["legal", "policy", "template"],
        tone: "formal",
        is_template: true,
        template_variables: ["topic", "scope", "requirements"],
      },
      {
        title: "Compliance Checklist",
        content:
          "Generate a compliance checklist.\n\n" +
          "**Regulation/Standard:** {{regulation}}\n" +
          "**Scope of assessment:** {{scope}}\n" +
          "**Current status notes:** {{status_notes}}\n\n" +
          "Create an actionable checklist with:\n" +
          "- Requirement description\n" +
          "- Compliance status (compliant/partial/non-compliant)\n" +
          "- Required actions\n" +
          "- Priority and timeline",
        description: "Actionable compliance checklists against specific regulations.",
        tags: ["legal", "compliance", "template"],
        tone: "formal",
        is_template: true,
        template_variables: ["regulation", "scope", "status_notes"],
      },
    ],
    guidelines: [
      {
        id: "std-legal",
        name: "Legal & Compliance",
        description: "Legal document and compliance standards",
        category: "legal",
      },
    ],
    guardrailCategories: ["pii", "credentials"],
  },

  // 7. Product Management
  {
    id: "product",
    name: "Product Management",
    description:
      "Prompts for PRDs, user stories, release notes, and competitor analysis.",
    icon: "LayoutDashboard",
    prompts: [
      {
        title: "Product Requirements Document",
        content:
          "Write a PRD for the following feature.\n\n" +
          "**Feature name:** {{feature_name}}\n" +
          "**Problem statement:** {{problem}}\n" +
          "**Target users:** {{users}}\n" +
          "**Success metrics:** {{metrics}}\n\n" +
          "Include: Overview, Goals & Non-goals, User Stories, Requirements (P0/P1/P2), Design Considerations, Open Questions.",
        description: "Comprehensive PRDs with prioritized requirements.",
        tags: ["product", "prd", "template"],
        tone: "professional",
        is_template: true,
        template_variables: ["feature_name", "problem", "users", "metrics"],
      },
      {
        title: "User Story Generator",
        content:
          "Write user stories for this feature.\n\n" +
          "**Feature:** {{feature}}\n" +
          "**User personas:** {{personas}}\n" +
          "**Key workflows:** {{workflows}}\n\n" +
          "Use the format: As a [persona], I want to [action] so that [benefit].\n" +
          "Include acceptance criteria for each story.",
        description: "User stories with acceptance criteria from feature descriptions.",
        tags: ["product", "user-stories", "template"],
        tone: "professional",
        is_template: true,
        template_variables: ["feature", "personas", "workflows"],
      },
      {
        title: "Release Notes",
        content:
          "Write customer-facing release notes.\n\n" +
          "**Version:** {{version}}\n" +
          "**Changes:**\n{{changes}}\n" +
          "**Target audience:** {{audience}}\n\n" +
          "Organize by: New Features, Improvements, Bug Fixes. Use customer-friendly language, not technical jargon.",
        description: "Customer-friendly release notes from technical changelogs.",
        tags: ["product", "release-notes", "template"],
        tone: "friendly",
        is_template: true,
        template_variables: ["version", "changes", "audience"],
      },
      {
        title: "Competitor Analysis",
        content:
          "Analyze a competitor's product positioning.\n\n" +
          "**Competitor:** {{competitor}}\n" +
          "**Our product:** {{our_product}}\n" +
          "**Key areas to compare:** {{comparison_areas}}\n\n" +
          "Provide:\n" +
          "- Feature comparison matrix\n" +
          "- Pricing comparison\n" +
          "- Strengths and weaknesses (theirs vs ours)\n" +
          "- Market positioning differences\n" +
          "- Opportunities and threats",
        description: "Structured competitor analysis with actionable insights.",
        tags: ["product", "competitive-analysis", "template"],
        tone: "analytical",
        is_template: true,
        template_variables: ["competitor", "our_product", "comparison_areas"],
      },
    ],
    guidelines: [
      {
        id: "std-product",
        name: "Product Management",
        description: "Product management communication standards",
        category: "product",
      },
    ],
    guardrailCategories: ["internal_terms"],
  },

  // 8. Executive & Leadership
  {
    id: "executive",
    name: "Executive & Leadership",
    description:
      "Prompts for board updates, all-hands talking points, and strategic memos.",
    icon: "Crown",
    prompts: [
      {
        title: "Board Update",
        content:
          "Draft a board update presentation.\n\n" +
          "**Reporting period:** {{period}}\n" +
          "**Key metrics:** {{metrics}}\n" +
          "**Strategic highlights:** {{highlights}}\n" +
          "**Challenges:** {{challenges}}\n\n" +
          "Structure: Executive Summary, Key Metrics, Strategic Progress, Challenges & Mitigations, Outlook & Asks.",
        description: "Concise board updates with metrics and strategic context.",
        tags: ["executive", "board", "template"],
        tone: "authoritative",
        is_template: true,
        template_variables: ["period", "metrics", "highlights", "challenges"],
      },
      {
        title: "All-Hands Talking Points",
        content:
          "Write talking points for an all-hands meeting.\n\n" +
          "**Theme:** {{theme}}\n" +
          "**Key updates:** {{updates}}\n" +
          "**Q&A topics to prepare for:** {{anticipated_questions}}\n\n" +
          "Include: Opening hook, 3-5 key messages, transition statements, closing call-to-action, and anticipated Q&A responses.",
        description: "Engaging all-hands talking points with Q&A prep.",
        tags: ["executive", "all-hands", "template"],
        tone: "authoritative",
        is_template: true,
        template_variables: ["theme", "updates", "anticipated_questions"],
      },
      {
        title: "Strategic Memo",
        content:
          "Write a strategic memo on the following initiative.\n\n" +
          "**Initiative:** {{initiative}}\n" +
          "**Context:** {{context}}\n" +
          "**Recommendation:** {{recommendation}}\n\n" +
          "Follow the Minto Pyramid: Lead with the recommendation, then supporting arguments, then data. Keep under 2 pages.",
        description: "Pyramid-structured strategic memos for leadership decisions.",
        tags: ["executive", "strategy", "template"],
        tone: "authoritative",
        is_template: true,
        template_variables: ["initiative", "context", "recommendation"],
      },
    ],
    guidelines: [
      {
        id: "std-executive",
        name: "Executive Communication",
        description: "C-suite and leadership communication standards",
        category: "executive",
      },
    ],
  },
];

// Lookup helper
export function getLibraryPack(id: string): LibraryPack | undefined {
  return LIBRARY_PACKS.find((p) => p.id === id);
}
