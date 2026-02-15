// TeamPrompt Team & Organization Storage Layer
// Orgs, teams, members, shared collections, prompt standards, import/export

import { STORAGE_KEYS } from './constants.js';

// ── Low-level helpers ──

async function _get(key) {
  const r = await chrome.storage.local.get(key);
  return r[key] ?? null;
}
async function _set(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

// ═══════════════════════════════════════
//  ORGANIZATION
// ═══════════════════════════════════════

export async function getOrg() {
  return (await _get(STORAGE_KEYS.ORG)) || null;
}

export async function saveOrg(org) {
  const existing = await getOrg();
  const merged = {
    id: crypto.randomUUID(),
    name: '',
    domain: '',
    logo: '',
    plan: 'free', // free | pro | enterprise
    settings: {
      enforceStandards: false,
      requireApproval: false,
      allowPersonalPrompts: true,
      defaultVisibility: 'team',
    },
    createdAt: Date.now(),
    ...existing,
    ...org,
    updatedAt: Date.now(),
  };
  await _set(STORAGE_KEYS.ORG, merged);
  return merged;
}

// ═══════════════════════════════════════
//  TEAMS
// ═══════════════════════════════════════

export async function getTeams() {
  return (await _get(STORAGE_KEYS.TEAMS)) || [];
}

export async function getTeam(teamId) {
  const teams = await getTeams();
  return teams.find(t => t.id === teamId) || null;
}

export async function saveTeam(team) {
  const teams = await getTeams();
  const idx = teams.findIndex(t => t.id === team.id);
  const entry = {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    icon: 'users',
    color: '#8b5cf6',
    memberCount: 0,
    createdAt: Date.now(),
    ...team,
    updatedAt: Date.now(),
  };
  if (idx >= 0) teams[idx] = entry;
  else teams.push(entry);
  await _set(STORAGE_KEYS.TEAMS, teams);
  return entry;
}

export async function deleteTeam(teamId) {
  const teams = await getTeams();
  await _set(STORAGE_KEYS.TEAMS, teams.filter(t => t.id !== teamId));
  // Remove members from this team
  const members = await getMembers();
  for (const m of members) {
    m.teamIds = (m.teamIds || []).filter(id => id !== teamId);
  }
  await _set(STORAGE_KEYS.MEMBERS, members);
  // Remove collections scoped to this team
  const colls = await getCollections();
  await _set(STORAGE_KEYS.COLLECTIONS, colls.filter(c => c.teamId !== teamId));
}

// ═══════════════════════════════════════
//  MEMBERS
// ═══════════════════════════════════════

export async function getMembers() {
  return (await _get(STORAGE_KEYS.MEMBERS)) || [];
}

export async function getMember(memberId) {
  const members = await getMembers();
  return members.find(m => m.id === memberId) || null;
}

export async function getCurrentUser() {
  const members = await getMembers();
  return members.find(m => m.isCurrentUser) || null;
}

export async function saveMember(member) {
  const members = await getMembers();
  const idx = members.findIndex(m => m.id === member.id);
  const entry = {
    id: crypto.randomUUID(),
    name: '',
    email: '',
    role: 'member', // admin | manager | member
    teamIds: [],
    avatar: '',
    isCurrentUser: false,
    createdAt: Date.now(),
    ...member,
    updatedAt: Date.now(),
  };
  if (idx >= 0) members[idx] = entry;
  else members.push(entry);
  await _set(STORAGE_KEYS.MEMBERS, members);
  return entry;
}

export async function deleteMember(memberId) {
  const members = await getMembers();
  await _set(STORAGE_KEYS.MEMBERS, members.filter(m => m.id !== memberId));
}

export async function setupCurrentUser(name, email, role = 'admin') {
  const existing = await getCurrentUser();
  if (existing) return existing;
  return saveMember({
    name,
    email,
    role,
    isCurrentUser: true,
    teamIds: [],
  });
}

// ═══════════════════════════════════════
//  SHARED COLLECTIONS
// ═══════════════════════════════════════

export async function getCollections() {
  return (await _get(STORAGE_KEYS.COLLECTIONS)) || [];
}

export async function getCollection(collId) {
  const colls = await getCollections();
  return colls.find(c => c.id === collId) || null;
}

export async function saveCollection(coll) {
  const colls = await getCollections();
  const idx = colls.findIndex(c => c.id === coll.id);
  const entry = {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    icon: 'folder',
    color: '#8b5cf6',
    teamId: null,
    visibility: 'team', // personal | team | org | public
    promptIds: [],
    standardId: null,
    createdBy: '',
    createdAt: Date.now(),
    ...coll,
    updatedAt: Date.now(),
  };
  if (idx >= 0) colls[idx] = entry;
  else colls.push(entry);
  await _set(STORAGE_KEYS.COLLECTIONS, colls);
  return entry;
}

export async function deleteCollection(collId) {
  const colls = await getCollections();
  await _set(STORAGE_KEYS.COLLECTIONS, colls.filter(c => c.id !== collId));
}

export async function addPromptToCollection(collId, promptId) {
  const coll = await getCollection(collId);
  if (!coll) return null;
  if (!coll.promptIds.includes(promptId)) {
    coll.promptIds.push(promptId);
    await saveCollection(coll);
  }
  return coll;
}

export async function removePromptFromCollection(collId, promptId) {
  const coll = await getCollection(collId);
  if (!coll) return null;
  coll.promptIds = coll.promptIds.filter(id => id !== promptId);
  await saveCollection(coll);
  return coll;
}

// ═══════════════════════════════════════
//  PROMPT STANDARDS
// ═══════════════════════════════════════

export async function getStandards() {
  return (await _get(STORAGE_KEYS.STANDARDS)) || [];
}

export async function getStandard(stdId) {
  const stds = await getStandards();
  return stds.find(s => s.id === stdId) || null;
}

export async function saveStandard(std) {
  const stds = await getStandards();
  const idx = stds.findIndex(s => s.id === std.id);
  const entry = {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    scope: 'team', // personal | team | org
    scopeId: null,
    category: 'general', // writing | coding | design | marketing | support | hr | sales | general
    rules: {
      toneRules: [],
      doList: [],
      dontList: [],
      constraints: [],
      requiredFields: [], // fields every prompt in this standard must have
      templateStructure: '', // template that prompts should follow
      maxLength: 0,
      minLength: 0,
      requiredTags: [],
      bannedWords: [],
    },
    enforced: false,
    createdBy: '',
    createdAt: Date.now(),
    ...std,
    updatedAt: Date.now(),
  };
  if (idx >= 0) stds[idx] = entry;
  else stds.push(entry);
  await _set(STORAGE_KEYS.STANDARDS, stds);
  return entry;
}

export async function deleteStandard(stdId) {
  const stds = await getStandards();
  await _set(STORAGE_KEYS.STANDARDS, stds.filter(s => s.id !== stdId));
}

/**
 * Validate a prompt against applicable standards.
 * Returns { valid: boolean, violations: string[] }
 */
export async function validatePromptAgainstStandards(prompt) {
  const stds = await getStandards();
  const violations = [];

  for (const std of stds) {
    if (!std.enforced) continue;

    // Check scope applies
    const applies = std.scope === 'org' ||
      (std.scope === 'team' && prompt.folderId === std.scopeId) ||
      (std.scope === 'personal');

    if (!applies) continue;

    const r = std.rules;

    if (r.minLength && prompt.content.length < r.minLength) {
      violations.push(`[${std.name}] Prompt must be at least ${r.minLength} characters`);
    }
    if (r.maxLength && prompt.content.length > r.maxLength) {
      violations.push(`[${std.name}] Prompt must be under ${r.maxLength} characters`);
    }
    if (r.requiredTags?.length) {
      const missing = r.requiredTags.filter(t => !(prompt.tags || []).includes(t));
      if (missing.length) violations.push(`[${std.name}] Missing required tags: ${missing.join(', ')}`);
    }
    if (r.bannedWords?.length) {
      const found = r.bannedWords.filter(w => prompt.content.toLowerCase().includes(w.toLowerCase()));
      if (found.length) violations.push(`[${std.name}] Contains banned words: ${found.join(', ')}`);
    }
    if (r.requiredFields?.length) {
      for (const field of r.requiredFields) {
        if (!prompt[field] || (typeof prompt[field] === 'string' && !prompt[field].trim())) {
          violations.push(`[${std.name}] Required field missing: ${field}`);
        }
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

// ═══════════════════════════════════════
//  IMPORT / EXPORT
// ═══════════════════════════════════════

export async function exportPromptPack(promptIds, packName) {
  const { getPrompts } = await import('./prompt-storage.js');
  const allPrompts = await getPrompts();
  const selected = allPrompts.filter(p => promptIds.includes(p.id));

  return {
    format: 'contextiq-prompt-pack',
    version: '1.0',
    name: packName,
    exportedAt: Date.now(),
    promptCount: selected.length,
    prompts: selected.map(p => ({
      title: p.title,
      content: p.content,
      description: p.description,
      intendedOutcome: p.intendedOutcome,
      tone: p.tone,
      modelRecommendation: p.modelRecommendation,
      exampleInput: p.exampleInput,
      exampleOutput: p.exampleOutput,
      tags: p.tags,
      category: p.folderId,
    })),
  };
}

export async function importPromptPack(packData) {
  const { createPrompt, savePrompt } = await import('./prompt-storage.js');

  if (packData.format !== 'contextiq-prompt-pack') {
    return { success: false, error: 'Invalid format' };
  }

  let imported = 0;
  for (const p of (packData.prompts || [])) {
    const prompt = createPrompt({
      title: p.title || 'Imported prompt',
      content: p.content || '',
      description: p.description || '',
      intendedOutcome: p.intendedOutcome || '',
      tone: p.tone || 'professional',
      modelRecommendation: p.modelRecommendation || '',
      exampleInput: p.exampleInput || '',
      exampleOutput: p.exampleOutput || '',
      tags: [...(p.tags || []), 'imported'],
    });
    await savePrompt(prompt);
    imported++;
  }

  return { success: true, imported };
}

// ═══════════════════════════════════════
//  DEFAULT STANDARDS
// ═══════════════════════════════════════

export async function installDefaultStandards() {
  const existing = await getStandards();
  if (existing.length > 0) return;

  const defaults = [
    // ─── WRITING ───
    {
      id: 'std-writing', name: 'Writing Standards',
      description: 'Guidelines for all writing-related prompts — blogs, emails, copy, documentation, and long-form content.',
      category: 'writing', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Match brand voice', 'Be concise and clear', 'Use active voice', 'Maintain consistent tense'],
        doList: ['Specify target audience', 'Include desired word count or length range', 'Define the call-to-action', 'State the format (blog, email, whitepaper, etc.)', 'Provide brand voice examples if available'],
        dontList: ['Use placeholder text without guidance', 'Skip the context or background', 'Leave tone ambiguous', 'Mix formal and informal registers'],
        constraints: ['Always specify the audience', 'Include format requirements', 'Define success criteria for the output'],
        requiredFields: ['description', 'tone'],
        templateStructure: 'Audience: [who]\nFormat: [blog/email/doc/etc.]\nTone: [tone]\nLength: [word count]\nKey message: [main point]\nCTA: [desired action]',
        requiredTags: [], bannedWords: [], maxLength: 5000, minLength: 50,
      },
    },
    // ─── CODING ───
    {
      id: 'std-coding', name: 'Coding Standards',
      description: 'Guidelines for code generation, review, debugging, and refactoring prompts.',
      category: 'coding', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Technical and precise', 'Include error handling expectations', 'Specify language and framework'],
        doList: ['Include the programming language', 'Specify framework and version', 'Mention coding standards to follow (e.g. ESLint, PEP8)', 'Include test requirements', 'Define input/output expectations', 'Mention performance constraints'],
        dontList: ['Ask for code without specifying language', 'Skip security considerations', 'Ignore edge cases', 'Request "quick and dirty" solutions for production code'],
        constraints: ['Must specify language', 'Include error handling guidance', 'Reference existing codebase conventions when applicable'],
        requiredFields: ['description'],
        templateStructure: 'Language: [lang]\nFramework: [framework] v[version]\nTask: [description]\nConstraints: [list]\nEdge cases: [list]\nTests: [yes/no — framework]\nSecurity: [considerations]',
        requiredTags: [], bannedWords: [], maxLength: 8000, minLength: 30,
      },
    },
    // ─── DESIGN & CREATIVE ───
    {
      id: 'std-design', name: 'Design & Creative Standards',
      description: 'Guidelines for design, image generation, UX copy, and creative asset prompts.',
      category: 'design', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Descriptive and visual', 'Reference brand guidelines', 'Specify dimensions and format', 'Describe mood and aesthetic clearly'],
        doList: ['Include style references or mood board links', 'Specify color palette or brand colors', 'Define dimensions and aspect ratio', 'Mention target platform (web, mobile, print)', 'Include accessibility requirements (contrast ratios, alt text)'],
        dontList: ['Use vague descriptions like "make it look nice"', 'Skip brand consistency', 'Forget accessibility requirements', 'Leave output format unspecified'],
        constraints: ['Include visual style direction', 'Specify output format (PNG, SVG, Figma, etc.)', 'Reference brand guidelines'],
        requiredFields: ['description'],
        templateStructure: 'Asset type: [icon/banner/UI/illustration]\nDimensions: [WxH]\nStyle: [minimal/bold/corporate/playful]\nColors: [palette]\nPlatform: [web/mobile/print]\nAccessibility: [requirements]',
        requiredTags: [], bannedWords: [], maxLength: 3000, minLength: 20,
      },
    },
    // ─── CUSTOMER SUPPORT ───
    {
      id: 'std-customer', name: 'Customer Support Standards',
      description: 'Guidelines for customer-facing communication — support tickets, chat responses, and email replies.',
      category: 'support', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Empathetic and professional', 'Solution-oriented', 'Brand-consistent', 'Patient and understanding'],
        doList: ['Acknowledge the customer issue first', 'Provide clear next steps', 'Use plain language, no jargon', 'Include estimated resolution timeline if applicable', 'End with a positive close'],
        dontList: ['Blame the customer', 'Use technical jargon', 'Make promises we cannot keep', 'Be dismissive of concerns', 'Use passive-aggressive language'],
        constraints: ['Keep responses under 200 words for chat', 'Always include actionable next steps', 'Personalize with customer name when available'],
        requiredFields: ['description', 'tone'],
        templateStructure: 'Channel: [email/chat/phone script]\nIssue type: [billing/technical/account/general]\nSeverity: [low/medium/high]\nCustomer sentiment: [frustrated/neutral/happy]\nResolution: [known fix/escalation/investigation]',
        requiredTags: [], bannedWords: ['fault', 'blame', 'impossible', 'cannot', 'you should have', 'obviously'], maxLength: 3000, minLength: 30,
      },
    },
    // ─── MARKETING ───
    {
      id: 'std-marketing', name: 'Marketing & Content Standards',
      description: 'Guidelines for marketing copy, campaigns, social media posts, ad copy, and content marketing.',
      category: 'marketing', scope: 'org', enforced: false,
      rules: {
        toneRules: ['On-brand and compelling', 'Audience-appropriate', 'Action-oriented', 'Benefit-focused over feature-focused'],
        doList: ['Define target persona/audience segment', 'Include campaign goals and KPIs', 'Specify platform (email, social, landing page, ad)', 'Reference brand voice guidelines', 'Include CTA and desired conversion action', 'Mention character/word limits for platform'],
        dontList: ['Use clickbait or misleading claims', 'Ignore platform-specific best practices', 'Skip A/B test variant instructions', 'Use competitor names without legal review'],
        constraints: ['Follow FTC disclosure guidelines for sponsored content', 'Include platform character limits', 'Align with current campaign messaging'],
        requiredFields: ['description', 'tone'],
        templateStructure: 'Campaign: [name]\nPlatform: [email/social/landing/ad]\nAudience: [persona]\nGoal: [awareness/conversion/retention]\nCTA: [action]\nConstraints: [character limit, compliance]',
        requiredTags: [], bannedWords: ['guaranteed', 'risk-free', '#1'], maxLength: 4000, minLength: 40,
      },
    },
    // ─── SALES ───
    {
      id: 'std-sales', name: 'Sales Communication Standards',
      description: 'Guidelines for sales outreach, proposals, follow-ups, and deal-related communication.',
      category: 'sales', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Consultative and professional', 'Value-driven', 'Respectful of prospect time', 'Confident without being pushy'],
        doList: ['Include prospect context and pain points', 'Reference specific value propositions', 'Include clear next step or CTA', 'Personalize to industry/role', 'Mention relevant case studies or social proof'],
        dontList: ['Use high-pressure tactics', 'Make unsubstantiated claims about ROI', 'Send generic templates without personalization', 'Badmouth competitors directly'],
        constraints: ['Follow CAN-SPAM compliance for email', 'Include unsubscribe option for bulk outreach', 'Keep cold outreach under 150 words'],
        requiredFields: ['description'],
        templateStructure: 'Type: [cold outreach/follow-up/proposal/negotiation]\nProspect: [role, industry]\nPain point: [specific challenge]\nValue prop: [how we solve it]\nSocial proof: [case study/metric]\nCTA: [meeting/demo/trial]',
        requiredTags: [], bannedWords: [], maxLength: 4000, minLength: 30,
      },
    },
    // ─── HR & PEOPLE ───
    {
      id: 'std-hr', name: 'HR & People Standards',
      description: 'Guidelines for HR communications, job descriptions, onboarding materials, and internal policies.',
      category: 'hr', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Inclusive and welcoming', 'Clear and jargon-free', 'Legally careful', 'Warm but professional'],
        doList: ['Use gender-neutral language', 'Include required legal disclaimers', 'Follow EEOC/ADA compliance guidelines', 'Specify required vs. preferred qualifications clearly', 'Include company values alignment'],
        dontList: ['Use gendered pronouns for unknown individuals', 'Include age-discriminatory language', 'List unrealistic job requirements', 'Use exclusionary terminology'],
        constraints: ['Must pass bias-check review', 'Follow local employment law requirements', 'Include diversity statement in job postings'],
        requiredFields: ['description'],
        templateStructure: 'Type: [job posting/policy/onboarding/review]\nAudience: [candidates/employees/managers]\nDepartment: [team]\nCompliance: [EEOC/ADA/local law requirements]\nTone: [tone]',
        requiredTags: [], bannedWords: ['rockstar', 'ninja', 'young', 'energetic', 'digital native'], maxLength: 6000, minLength: 40,
      },
    },
    // ─── LEGAL ───
    {
      id: 'std-legal', name: 'Legal & Compliance Standards',
      description: 'Guidelines for legal documents, compliance communications, contracts, and policy drafts.',
      category: 'legal', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Precise and unambiguous', 'Formal', 'Jurisdiction-aware', 'Conservative in scope'],
        doList: ['Specify jurisdiction and applicable law', 'Include definitions for key terms', 'Reference relevant regulations or statutes', 'Include standard legal disclaimers', 'Flag areas requiring attorney review'],
        dontList: ['Provide actual legal advice (always disclaim)', 'Use ambiguous language', 'Skip jurisdiction specification', 'Omit effective dates or version numbers'],
        constraints: ['All outputs must include "This is not legal advice" disclaimer', 'Must specify governing law', 'Flag sections requiring human legal review'],
        requiredFields: ['description'],
        templateStructure: 'Document type: [contract/policy/notice/terms]\nJurisdiction: [state/country]\nParties: [who is involved]\nKey terms: [definitions needed]\nRegulations: [GDPR/CCPA/SOX/etc.]\nReview flag: [sections needing attorney review]',
        requiredTags: [], bannedWords: [], maxLength: 10000, minLength: 50,
      },
    },
    // ─── EXECUTIVE ───
    {
      id: 'std-executive', name: 'Executive Communication Standards',
      description: 'Guidelines for C-suite communications, board presentations, investor updates, and strategic documents.',
      category: 'executive', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Strategic and forward-looking', 'Data-driven', 'Concise — executives are time-poor', 'Confident and decisive'],
        doList: ['Lead with the key insight or decision needed', 'Include supporting data and metrics', 'Provide clear recommendations', 'Specify the ask or decision required', 'Include timeline and resource implications'],
        dontList: ['Bury the lead with excessive background', 'Present problems without solutions', 'Use operational jargon in board communications', 'Include unverified metrics'],
        constraints: ['Executive summaries under 250 words', 'Include data visualization recommendations', 'Always state the desired outcome up front'],
        requiredFields: ['description'],
        templateStructure: 'Type: [board update/investor memo/strategy brief/all-hands]\nAudience: [board/investors/leadership/all-company]\nKey message: [one sentence]\nData points: [metrics to include]\nDecision needed: [yes/no — what]\nTimeline: [urgency]',
        requiredTags: [], bannedWords: [], maxLength: 5000, minLength: 40,
      },
    },
    // ─── DATA & ANALYTICS ───
    {
      id: 'std-data', name: 'Data & Analytics Standards',
      description: 'Guidelines for data analysis prompts, SQL queries, reporting, and data visualization requests.',
      category: 'data', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Analytical and precise', 'Specify expected output format', 'Include data context'],
        doList: ['Specify the database/tool being used', 'Include table and column names', 'Define expected output format (table, chart, narrative)', 'Include date ranges and filters', 'Specify aggregation level (daily, weekly, by-segment)'],
        dontList: ['Skip data source specification', 'Request analysis without defining the metric', 'Forget to mention data quality considerations', 'Omit date range constraints'],
        constraints: ['Always specify the data source', 'Include sample size or scope expectations', 'Define how to handle null/missing values'],
        requiredFields: ['description'],
        templateStructure: 'Tool: [SQL/Python/Excel/BI tool]\nData source: [table/API/file]\nMetric: [what to measure]\nDimensions: [how to slice]\nDate range: [period]\nOutput: [table/chart/narrative]\nFilters: [conditions]',
        requiredTags: [], bannedWords: [], maxLength: 6000, minLength: 30,
      },
    },
    // ─── PRODUCT ───
    {
      id: 'std-product', name: 'Product Management Standards',
      description: 'Guidelines for PRDs, feature specs, user stories, and product communication prompts.',
      category: 'product', scope: 'org', enforced: false,
      rules: {
        toneRules: ['User-centric', 'Outcome-oriented', 'Clear acceptance criteria', 'Measurable success metrics'],
        doList: ['Define the user problem being solved', 'Include user personas', 'Specify acceptance criteria', 'Reference competitive landscape', 'Include success metrics and KPIs', 'Define scope (in/out)'],
        dontList: ['Skip user research context', 'Define solutions without stating the problem', 'Forget edge cases and error states', 'Omit prioritization rationale'],
        constraints: ['Must include "Problem" and "Success Metrics" sections', 'Reference user research or data when available', 'Include scope boundaries'],
        requiredFields: ['description'],
        templateStructure: 'Feature: [name]\nProblem: [user pain point]\nPersona: [target user]\nScope: [in-scope / out-of-scope]\nAcceptance criteria: [list]\nSuccess metrics: [KPIs]\nDependencies: [teams/systems]\nTimeline: [target quarter]',
        requiredTags: [], bannedWords: [], maxLength: 8000, minLength: 40,
      },
    },
    // ─── RESEARCH & STRATEGY ───
    {
      id: 'std-research', name: 'Research & Strategy Standards',
      description: 'Guidelines for market research, competitive analysis, strategic planning, and user research prompts.',
      category: 'general', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Objective and evidence-based', 'Structured and methodical', 'Distinguish between facts and assumptions'],
        doList: ['Define the research question clearly', 'Specify methodology expectations', 'Include scope and limitations', 'Request source citations where applicable', 'Define the decision this research will inform'],
        dontList: ['Accept unverified claims as facts', 'Skip competitive context', 'Provide conclusions without supporting evidence', 'Rely on single data sources'],
        constraints: ['Must state the core research question', 'Include methodology or approach', 'Separate findings from recommendations'],
        requiredFields: ['description'],
        templateStructure: 'Research question: [what are we trying to learn?]\nMethodology: [desk research/interviews/survey/analysis]\nScope: [market/competitor/user/technology]\nDecision: [what will this inform?]\nTimeline: [when needed]\nFormat: [report/presentation/brief]',
        requiredTags: [], bannedWords: [], maxLength: 6000, minLength: 40,
      },
    },
    // ─── TRAINING & EDUCATION ───
    {
      id: 'std-training', name: 'Training & Education Standards',
      description: 'Guidelines for training materials, onboarding guides, tutorials, and educational content prompts.',
      category: 'general', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Clear and approachable', 'Progressive in complexity', 'Encouraging', 'Practical with real examples'],
        doList: ['Define the learning objective', 'Specify the audience skill level (beginner/intermediate/advanced)', 'Include practical exercises or examples', 'Structure content in logical progression', 'Include assessment or quiz questions where relevant'],
        dontList: ['Assume prior knowledge without stating prerequisites', 'Overload with theory before practice', 'Skip recap or summary sections', 'Use unexplained acronyms'],
        constraints: ['Must state learning objectives up front', 'Include at least one practical example', 'End with a summary or key takeaways section'],
        requiredFields: ['description'],
        templateStructure: 'Topic: [subject]\nAudience: [role, skill level]\nLearning objectives: [what they will be able to do]\nFormat: [guide/video script/workshop/quiz]\nPrerequisites: [assumed knowledge]\nDuration: [time to complete]',
        requiredTags: [], bannedWords: [], maxLength: 8000, minLength: 40,
      },
    },
    // ─── INTERNAL COMMUNICATIONS ───
    {
      id: 'std-internal-comms', name: 'Internal Communications Standards',
      description: 'Guidelines for company-wide announcements, team updates, Slack messages, and internal memos.',
      category: 'general', scope: 'org', enforced: false,
      rules: {
        toneRules: ['Transparent and honest', 'Inclusive', 'Timely', 'Aligned with company values'],
        doList: ['Lead with the most important information', 'Include context for why changes matter', 'Specify action items clearly', 'Consider how different audiences will receive the message', 'Include FAQ or anticipated questions'],
        dontList: ['Use corporate doublespeak', 'Bury bad news in jargon', 'Forget to mention impact on specific teams', 'Send without leadership alignment on sensitive topics'],
        constraints: ['Include "What this means for you" section for policy changes', 'Specify action items with owners and deadlines', 'Consider multi-timezone audience for timing'],
        requiredFields: ['description'],
        templateStructure: 'Type: [announcement/update/policy change/celebration]\nAudience: [all-company/department/leadership]\nKey message: [one sentence]\nContext: [why now]\nAction items: [what people need to do]\nFAQ: [anticipated questions]',
        requiredTags: [], bannedWords: [], maxLength: 4000, minLength: 30,
      },
    },
  ];

  for (const std of defaults) {
    std.createdAt = Date.now();
    std.updatedAt = Date.now();
    std.createdBy = 'system';
    await saveStandard(std);
  }
}
