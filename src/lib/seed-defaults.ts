import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_GUIDELINES } from "@/lib/constants";
import { DEFAULT_SECURITY_RULES } from "@/lib/security/default-rules";

// ─── Seed Prompt Definitions ───

interface SeedPrompt {
  title: string;
  content: string;
  description: string;
  tags: string[];
  tone: string;
  is_template: boolean;
  template_variables: string[];
}

export const SEED_PROMPTS: SeedPrompt[] = [
  {
    title: "Weekly Status Update",
    content:
      "Summarize my progress this week in a clear, professional format.\n\n" +
      "**What I accomplished:**\n{{accomplishments}}\n\n" +
      "**Blockers or challenges:**\n{{blockers}}\n\n" +
      "**Plan for next week:**\n{{next_week_plan}}\n\n" +
      "Keep the tone concise and action-oriented. Use bullet points where appropriate.",
    description:
      "A template for writing weekly status updates. Fill in the variables and paste into any AI tool.",
    tags: ["productivity", "template", "weekly-update"],
    tone: "professional",
    is_template: true,
    template_variables: ["accomplishments", "blockers", "next_week_plan"],
  },
];

// ─── Industry-specific Seed Prompts ───

export const INDUSTRY_SEED_PROMPTS: Record<string, SeedPrompt[]> = {
  healthcare: [
    { title: "Patient Summary", content: "Summarize the following patient information into a concise clinical note...", description: "Generate concise patient summaries from clinical data", tags: ["healthcare", "clinical"], tone: "professional", is_template: true, template_variables: ["patient_info"] },
    { title: "Discharge Instructions", content: "Write clear discharge instructions for a patient with {{condition}}...", description: "Patient-friendly discharge instructions", tags: ["healthcare", "patient-care"], tone: "empathetic", is_template: true, template_variables: ["condition", "medications"] },
    { title: "Insurance Pre-Auth Draft", content: "Draft a pre-authorization request for {{procedure}} for a patient with {{diagnosis}}...", description: "Insurance pre-authorization letter template", tags: ["healthcare", "admin"], tone: "formal", is_template: true, template_variables: ["procedure", "diagnosis"] },
    { title: "Clinical Note Template", content: "Create a SOAP note for a patient visit:\n\nSubjective: {{subjective}}\nObjective: {{objective}}\nAssessment: {{assessment}}\nPlan: {{plan}}", description: "Standard SOAP note format", tags: ["healthcare", "clinical", "template"], tone: "clinical", is_template: true, template_variables: ["subjective", "objective", "assessment", "plan"] },
    { title: "Medical Research Summary", content: "Summarize the key findings from this medical research:\n\n{{research_text}}\n\nFocus on: methodology, key results, clinical implications, and limitations.", description: "Summarize medical research papers", tags: ["healthcare", "research"], tone: "academic", is_template: true, template_variables: ["research_text"] },
  ],
  finance: [
    { title: "Financial Report Summary", content: "Summarize this financial report in executive format:\n\n{{report_data}}\n\nInclude: key metrics, YoY changes, notable trends, and risk factors.", description: "Executive summary of financial reports", tags: ["finance", "reporting"], tone: "professional", is_template: true, template_variables: ["report_data"] },
    { title: "Investment Analysis", content: "Analyze this investment opportunity:\n\n{{investment_details}}\n\nCover: risk assessment, expected returns, market conditions, and recommendation.", description: "Investment opportunity analysis template", tags: ["finance", "analysis"], tone: "analytical", is_template: true, template_variables: ["investment_details"] },
    { title: "Client Portfolio Review", content: "Draft a quarterly portfolio review for {{client_name}}:\n\nPortfolio data: {{portfolio_data}}\n\nInclude performance vs benchmarks, allocation changes, and outlook.", description: "Quarterly client portfolio review", tags: ["finance", "client"], tone: "professional", is_template: true, template_variables: ["client_name", "portfolio_data"] },
    { title: "Compliance Report Draft", content: "Draft a compliance summary covering:\n\n{{compliance_area}}\n\nInclude: current status, findings, remediation steps, and timeline.", description: "Regulatory compliance report", tags: ["finance", "compliance"], tone: "formal", is_template: true, template_variables: ["compliance_area"] },
    { title: "Risk Assessment Template", content: "Assess the risk profile for {{subject}}:\n\nConsider: market risk, credit risk, operational risk, regulatory risk. Rate each Low/Medium/High with justification.", description: "Structured risk assessment", tags: ["finance", "risk"], tone: "analytical", is_template: true, template_variables: ["subject"] },
  ],
  technology: [
    { title: "Code Review Prompt", content: "Review this code for bugs, security issues, and best practices:\n\n```{{language}}\n{{code}}\n```\n\nFocus on: security vulnerabilities, performance, readability, and error handling.", description: "Thorough code review template", tags: ["engineering", "code-review"], tone: "technical", is_template: true, template_variables: ["language", "code"] },
    { title: "Architecture Design Doc", content: "Draft a design document for {{feature}}:\n\nRequirements: {{requirements}}\n\nInclude: system design, data flow, API contracts, trade-offs, and migration plan.", description: "Technical design document template", tags: ["engineering", "architecture"], tone: "technical", is_template: true, template_variables: ["feature", "requirements"] },
    { title: "Bug Report Analysis", content: "Analyze this bug report and suggest debugging steps:\n\nError: {{error_message}}\nContext: {{context}}\nSteps to reproduce: {{steps}}\n\nProvide: root cause hypothesis, debugging approach, and potential fix.", description: "Bug analysis and debugging helper", tags: ["engineering", "debugging"], tone: "technical", is_template: true, template_variables: ["error_message", "context", "steps"] },
    { title: "API Documentation", content: "Write API documentation for this endpoint:\n\nMethod: {{method}}\nPath: {{path}}\nDescription: {{description}}\n\nInclude: parameters, request/response examples, error codes, and rate limits.", description: "REST API documentation template", tags: ["engineering", "documentation"], tone: "technical", is_template: true, template_variables: ["method", "path", "description"] },
    { title: "Sprint Planning Summary", content: "Summarize this sprint's plan:\n\nGoals: {{goals}}\nTickets: {{tickets}}\n\nOrganize by priority, estimate effort, identify dependencies and risks.", description: "Sprint planning summary generator", tags: ["engineering", "agile"], tone: "professional", is_template: true, template_variables: ["goals", "tickets"] },
  ],
  legal: [
    { title: "Contract Review Summary", content: "Review this contract and summarize key terms:\n\n{{contract_text}}\n\nHighlight: obligations, liabilities, termination clauses, IP rights, and red flags.", description: "Contract review and key terms extraction", tags: ["legal", "contracts"], tone: "formal", is_template: true, template_variables: ["contract_text"] },
    { title: "Legal Research Memo", content: "Research the legal question:\n\n{{legal_question}}\n\nJurisdiction: {{jurisdiction}}\n\nProvide: relevant statutes, case law, analysis, and recommendation.", description: "Legal research memo template", tags: ["legal", "research"], tone: "formal", is_template: true, template_variables: ["legal_question", "jurisdiction"] },
    { title: "Client Communication Draft", content: "Draft a client update letter regarding {{matter}}:\n\nStatus: {{status}}\nNext steps: {{next_steps}}\n\nKeep language clear and avoid unnecessary legal jargon.", description: "Client-friendly legal communication", tags: ["legal", "client"], tone: "professional", is_template: true, template_variables: ["matter", "status", "next_steps"] },
    { title: "Compliance Checklist", content: "Create a compliance checklist for {{regulation}}:\n\nOrganization type: {{org_type}}\n\nList each requirement with: description, current status, action needed, and deadline.", description: "Regulatory compliance checklist generator", tags: ["legal", "compliance"], tone: "formal", is_template: true, template_variables: ["regulation", "org_type"] },
    { title: "Policy Draft Template", content: "Draft a company policy for {{policy_topic}}:\n\nScope: {{scope}}\n\nInclude: purpose, applicability, definitions, policy statement, procedures, and enforcement.", description: "Company policy document template", tags: ["legal", "policy"], tone: "formal", is_template: true, template_variables: ["policy_topic", "scope"] },
  ],
  education: [
    { title: "Lesson Plan Generator", content: "Create a lesson plan for {{subject}} at {{level}} level:\n\nTopic: {{topic}}\nDuration: {{duration}}\n\nInclude: objectives, materials, activities, assessment, and differentiation strategies.", description: "Structured lesson plan template", tags: ["education", "teaching"], tone: "professional", is_template: true, template_variables: ["subject", "level", "topic", "duration"] },
    { title: "Student Feedback Template", content: "Write constructive feedback for a student's {{assignment_type}}:\n\nStudent work: {{student_work}}\n\nInclude: strengths, areas for improvement, specific suggestions, and encouragement.", description: "Constructive student feedback generator", tags: ["education", "feedback"], tone: "encouraging", is_template: true, template_variables: ["assignment_type", "student_work"] },
    { title: "Quiz Generator", content: "Create a quiz on {{topic}} for {{level}} students:\n\nNumber of questions: {{count}}\nQuestion types: multiple choice, short answer, true/false\n\nInclude answer key with explanations.", description: "Auto-generate quizzes with answer keys", tags: ["education", "assessment"], tone: "educational", is_template: true, template_variables: ["topic", "level", "count"] },
    { title: "Curriculum Summary", content: "Summarize this curriculum document:\n\n{{curriculum}}\n\nExtract: learning objectives, key topics, prerequisites, and suggested timeline.", description: "Curriculum overview generator", tags: ["education", "curriculum"], tone: "professional", is_template: true, template_variables: ["curriculum"] },
    { title: "Parent Communication", content: "Draft a parent communication about {{topic}}:\n\nContext: {{context}}\n\nKeep it warm, clear, and actionable. Include any dates or action items.", description: "Parent/guardian communication template", tags: ["education", "communication"], tone: "warm", is_template: true, template_variables: ["topic", "context"] },
  ],
  marketing: [
    { title: "Blog Post Outline", content: "Create a blog post outline for:\n\nTopic: {{topic}}\nTarget audience: {{audience}}\nTarget keyword: {{keyword}}\n\nInclude: title options, H2 headings, key points per section, CTA, and meta description.", description: "SEO-optimized blog post outline", tags: ["marketing", "content"], tone: "engaging", is_template: true, template_variables: ["topic", "audience", "keyword"] },
    { title: "Social Media Post", content: "Write a {{platform}} post about:\n\n{{topic}}\n\nTone: {{tone}}\nInclude hashtags and a call to action. Keep within platform character limits.", description: "Platform-specific social media content", tags: ["marketing", "social"], tone: "casual", is_template: true, template_variables: ["platform", "topic", "tone"] },
    { title: "Email Campaign Draft", content: "Write a marketing email:\n\nCampaign goal: {{goal}}\nAudience segment: {{segment}}\nKey message: {{message}}\n\nInclude: subject line options, preview text, body copy, and CTA button text.", description: "Marketing email campaign template", tags: ["marketing", "email"], tone: "persuasive", is_template: true, template_variables: ["goal", "segment", "message"] },
    { title: "Product Description", content: "Write a compelling product description for:\n\nProduct: {{product}}\nKey features: {{features}}\nTarget buyer: {{buyer}}\n\nInclude: headline, benefit-focused copy, and urgency element.", description: "Conversion-focused product copy", tags: ["marketing", "copywriting"], tone: "persuasive", is_template: true, template_variables: ["product", "features", "buyer"] },
    { title: "Competitor Analysis", content: "Analyze this competitor:\n\nCompetitor: {{competitor}}\nOur product: {{our_product}}\n\nCompare: features, pricing, positioning, strengths, weaknesses. Recommend differentiation strategy.", description: "Competitive analysis framework", tags: ["marketing", "strategy"], tone: "analytical", is_template: true, template_variables: ["competitor", "our_product"] },
  ],
};

// ─── Default Guideline IDs to auto-install (5 — free tier limit) ───

const AUTO_INSTALL_GUIDELINE_IDS = [
  "std-writing",
  "std-coding",
  "std-support",
  "std-marketing",
  "std-executive",
];

// ─── Seed function ───

export async function seedOrgDefaults(
  db: SupabaseClient,
  orgId: string,
  userId: string,
  industry?: string
): Promise<void> {
  // 1. Insert seed prompts (industry-specific if provided, otherwise defaults)
  const prompts = industry && INDUSTRY_SEED_PROMPTS[industry]
    ? INDUSTRY_SEED_PROMPTS[industry]
    : SEED_PROMPTS;

  const promptInserts = prompts.map((p) => ({
    org_id: orgId,
    owner_id: userId,
    title: p.title,
    content: p.content,
    description: p.description,
    tags: p.tags,
    tone: p.tone,
    status: "approved",
    version: 1,
    is_template: p.is_template,
    template_variables: p.template_variables,
  }));

  await db
    .from("prompts")
    .insert(promptInserts)
    .select("id");

  // 2. Auto-install 5 default guidelines
  const guidelinesToInstall = DEFAULT_GUIDELINES.filter((g) =>
    AUTO_INSTALL_GUIDELINE_IDS.includes(g.id)
  );

  if (guidelinesToInstall.length > 0) {
    await db.from("standards").insert(
      guidelinesToInstall.map((g) => ({
        org_id: orgId,
        name: g.name,
        description: g.description,
        category: g.category,
        scope: "org",
        rules: g.rules,
        enforced: false,
        created_by: userId,
      }))
    );
  }

  // 4. Auto-install basic security rules (active-by-default ones only)
  const activeRules = DEFAULT_SECURITY_RULES.filter((r) => r.is_active);

  if (activeRules.length > 0) {
    await db.from("security_rules").insert(
      activeRules.map((r) => ({
        org_id: orgId,
        name: r.name,
        description: r.description,
        pattern: r.pattern,
        pattern_type: r.pattern_type,
        category: r.category,
        severity: r.severity,
        is_active: true,
        is_built_in: true,
        created_by: userId,
      }))
    );
  }
}
