// ContextIQ Prompt Manager — Storage Layer
// Full CRUD for prompts, folders, departments, versions, ratings, usage

import { STORAGE_KEYS } from './constants.js';

// ── Low-level helpers ──

async function _get(key) {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? null;
}

async function _set(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

// ═══════════════════════════════════════════
//  PROMPTS
// ═══════════════════════════════════════════

export async function getPrompts() {
  return (await _get(STORAGE_KEYS.PROMPTS)) || [];
}

export async function getPrompt(promptId) {
  const prompts = await getPrompts();
  return prompts.find(p => p.id === promptId) || null;
}

export function createPrompt(fields = {}) {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: '',
    content: '',
    description: '',
    intendedOutcome: '',
    tone: 'professional',
    modelRecommendation: '',
    exampleInput: '',
    exampleOutput: '',
    tags: [],
    folderId: null,
    departmentId: null,
    owner: 'You',
    status: 'approved', // MVP: skip approval flow
    version: 1,
    versionHistory: [],
    rating: { total: 0, count: 0 },
    usageCount: 0,
    lastUsedAt: null,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...fields,
  };
}

export async function savePrompt(prompt) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.id === prompt.id);

  if (idx >= 0) {
    // Save current version to history before overwriting
    const prev = prompts[idx];
    if (prev.content !== prompt.content || prev.title !== prompt.title) {
      if (!prompt.versionHistory) prompt.versionHistory = [];
      prompt.versionHistory.unshift({
        version: prev.version,
        title: prev.title,
        content: prev.content,
        updatedAt: prev.updatedAt,
      });
      prompt.versionHistory = prompt.versionHistory.slice(0, 20);
      prompt.version = (prev.version || 1) + 1;
    }
    prompt.updatedAt = Date.now();
    prompts[idx] = prompt;
  } else {
    prompts.unshift(prompt);
  }

  await _set(STORAGE_KEYS.PROMPTS, prompts);
  return prompt;
}

export async function deletePrompt(promptId) {
  const prompts = await getPrompts();
  await _set(STORAGE_KEYS.PROMPTS, prompts.filter(p => p.id !== promptId));
}

export async function duplicatePrompt(promptId) {
  const original = await getPrompt(promptId);
  if (!original) return null;

  const copy = createPrompt({
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title} (copy)`,
    version: 1,
    versionHistory: [],
    rating: { total: 0, count: 0 },
    usageCount: 0,
    lastUsedAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return savePrompt(copy);
}

// ── Prompt Usage & Ratings ──

export async function recordPromptUsage(promptId) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.id === promptId);
  if (idx < 0) return null;

  prompts[idx].usageCount = (prompts[idx].usageCount || 0) + 1;
  prompts[idx].lastUsedAt = Date.now();
  await _set(STORAGE_KEYS.PROMPTS, prompts);

  // Also update analytics
  await _recordAnalyticsEvent(promptId, 'use');

  return prompts[idx];
}

export async function ratePrompt(promptId, stars) {
  const clamped = Math.max(1, Math.min(5, Math.round(stars)));
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.id === promptId);
  if (idx < 0) return null;

  const r = prompts[idx].rating || { total: 0, count: 0 };
  r.total += clamped;
  r.count += 1;
  prompts[idx].rating = r;
  await _set(STORAGE_KEYS.PROMPTS, prompts);
  return prompts[idx];
}

export async function togglePromptFavorite(promptId) {
  const prompts = await getPrompts();
  const idx = prompts.findIndex(p => p.id === promptId);
  if (idx < 0) return null;

  prompts[idx].isFavorite = !prompts[idx].isFavorite;
  await _set(STORAGE_KEYS.PROMPTS, prompts);
  return prompts[idx];
}

// ── Search & Filter ──

export async function searchPrompts(query, filters = {}) {
  let prompts = await getPrompts();
  const q = (query || '').toLowerCase().trim();

  if (filters.folderId) {
    prompts = prompts.filter(p => p.folderId === filters.folderId);
  }
  if (filters.departmentId) {
    prompts = prompts.filter(p => p.departmentId === filters.departmentId);
  }
  if (filters.status) {
    prompts = prompts.filter(p => p.status === filters.status);
  }
  if (filters.tag) {
    prompts = prompts.filter(p => p.tags.includes(filters.tag));
  }
  if (filters.favoritesOnly) {
    prompts = prompts.filter(p => p.isFavorite);
  }

  if (q) {
    prompts = prompts.filter(p => {
      return (
        (p.title || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (p.tone || '').toLowerCase().includes(q)
      );
    });
  }

  // Sort
  const sort = filters.sort || 'recent';
  if (sort === 'recent') {
    prompts.sort((a, b) => b.updatedAt - a.updatedAt);
  } else if (sort === 'popular') {
    prompts.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  } else if (sort === 'rating') {
    const avg = p => p.rating?.count ? p.rating.total / p.rating.count : 0;
    prompts.sort((a, b) => avg(b) - avg(a));
  } else if (sort === 'alpha') {
    prompts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  return prompts;
}

// ═══════════════════════════════════════════
//  FOLDERS
// ═══════════════════════════════════════════

export async function getFolders() {
  return (await _get(STORAGE_KEYS.PROMPT_FOLDERS)) || [];
}

export async function saveFolder(folder) {
  const folders = await getFolders();
  const idx = folders.findIndex(f => f.id === folder.id);
  if (idx >= 0) {
    folders[idx] = { ...folders[idx], ...folder };
  } else {
    folders.push({
      id: crypto.randomUUID(),
      name: 'New Folder',
      icon: 'folder',
      color: '#8b5cf6',
      parentId: null,
      order: folders.length,
      createdAt: Date.now(),
      ...folder,
    });
  }
  await _set(STORAGE_KEYS.PROMPT_FOLDERS, folders);
  return folder;
}

export async function deleteFolder(folderId) {
  const folders = await getFolders();
  await _set(STORAGE_KEYS.PROMPT_FOLDERS, folders.filter(f => f.id !== folderId));
  // Unassign prompts from this folder
  const prompts = await getPrompts();
  let changed = false;
  for (const p of prompts) {
    if (p.folderId === folderId) {
      p.folderId = null;
      changed = true;
    }
  }
  if (changed) await _set(STORAGE_KEYS.PROMPTS, prompts);
}

// ═══════════════════════════════════════════
//  DEPARTMENTS
// ═══════════════════════════════════════════

export async function getDepartments() {
  return (await _get(STORAGE_KEYS.PROMPT_DEPARTMENTS)) || [];
}

export async function saveDepartment(dept) {
  const departments = await getDepartments();
  const idx = departments.findIndex(d => d.id === dept.id);
  if (idx >= 0) {
    departments[idx] = { ...departments[idx], ...dept };
  } else {
    departments.push({
      id: crypto.randomUUID(),
      name: 'New Department',
      icon: 'building',
      color: '#60a5fa',
      toneRules: [],
      doList: [],
      dontList: [],
      constraints: [],
      createdAt: Date.now(),
      ...dept,
    });
  }
  await _set(STORAGE_KEYS.PROMPT_DEPARTMENTS, departments);
  return dept;
}

export async function deleteDepartment(deptId) {
  const departments = await getDepartments();
  await _set(STORAGE_KEYS.PROMPT_DEPARTMENTS, departments.filter(d => d.id !== deptId));
  const prompts = await getPrompts();
  let changed = false;
  for (const p of prompts) {
    if (p.departmentId === deptId) {
      p.departmentId = null;
      changed = true;
    }
  }
  if (changed) await _set(STORAGE_KEYS.PROMPTS, prompts);
}

// ═══════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════

async function _recordAnalyticsEvent(promptId, action) {
  const analytics = (await _get(STORAGE_KEYS.PROMPT_ANALYTICS)) || [];
  analytics.unshift({
    promptId,
    action,
    timestamp: Date.now(),
  });
  // Keep last 500 events
  await _set(STORAGE_KEYS.PROMPT_ANALYTICS, analytics.slice(0, 500));
}

export async function getPromptAnalytics() {
  return (await _get(STORAGE_KEYS.PROMPT_ANALYTICS)) || [];
}

export async function getAnalyticsSummary() {
  const prompts = await getPrompts();
  const analytics = await getPromptAnalytics();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const weekEvents = analytics.filter(e => e.timestamp >= weekAgo);
  const totalUses = prompts.reduce((s, p) => s + (p.usageCount || 0), 0);
  const avgRating = prompts.reduce((s, p) => {
    if (p.rating?.count) return s + p.rating.total / p.rating.count;
    return s;
  }, 0) / (prompts.filter(p => p.rating?.count).length || 1);

  // Most used prompts this week
  const weekUsage = {};
  for (const e of weekEvents) {
    if (e.action === 'use') {
      weekUsage[e.promptId] = (weekUsage[e.promptId] || 0) + 1;
    }
  }
  const topPrompts = Object.entries(weekUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const p = prompts.find(pr => pr.id === id);
      return { id, title: p?.title || 'Deleted', count };
    });

  // Department usage
  const deptUsage = {};
  for (const p of prompts) {
    if (p.departmentId) {
      deptUsage[p.departmentId] = (deptUsage[p.departmentId] || 0) + (p.usageCount || 0);
    }
  }

  return {
    totalPrompts: prompts.length,
    totalUses,
    avgRating: Math.round(avgRating * 10) / 10,
    weeklyUses: weekEvents.filter(e => e.action === 'use').length,
    topPrompts,
    deptUsage,
  };
}

// ═══════════════════════════════════════════
//  STARTER PACKS
// ═══════════════════════════════════════════

export async function isStarterInstalled() {
  return (await _get(STORAGE_KEYS.PROMPT_STARTER_INSTALLED)) === true;
}

export async function installStarterPacks() {
  if (await isStarterInstalled()) return;

  const folders = [
    { id: 'folder-marketing', name: 'Marketing', icon: 'megaphone', color: '#fb923c', order: 0 },
    { id: 'folder-support', name: 'Customer Support', icon: 'headphones', color: '#34d399', order: 1 },
    { id: 'folder-dev', name: 'Development', icon: 'code', color: '#60a5fa', order: 2 },
    { id: 'folder-hr', name: 'HR & People', icon: 'users', color: '#c084fc', order: 3 },
    { id: 'folder-sales', name: 'Sales', icon: 'trending-up', color: '#fb7185', order: 4 },
  ];

  const departments = [
    {
      id: 'dept-marketing', name: 'Marketing', icon: 'megaphone', color: '#fb923c',
      toneRules: ['Brand-consistent', 'Engaging and persuasive', 'Action-oriented'],
      doList: ['Include clear CTAs', 'Use data to support claims', 'Keep messaging concise'],
      dontList: ['Overpromise', 'Use jargon without explanation', 'Ignore target audience'],
      constraints: ['Max 150 words for social', 'Always include brand voice'],
    },
    {
      id: 'dept-support', name: 'Customer Support', icon: 'headphones', color: '#34d399',
      toneRules: ['Empathetic', 'Solution-focused', 'Clear and patient'],
      doList: ['Acknowledge the issue first', 'Provide step-by-step solutions', 'Offer alternatives'],
      dontList: ['Blame the customer', 'Use overly technical language', 'Leave issues unresolved'],
      constraints: ['Response within 200 words', 'Always end with next steps'],
    },
    {
      id: 'dept-dev', name: 'Development', icon: 'code', color: '#60a5fa',
      toneRules: ['Technical and precise', 'Concise', 'Well-structured'],
      doList: ['Include code examples', 'Reference documentation', 'Consider edge cases'],
      dontList: ['Skip error handling', 'Ignore security', 'Assume context'],
      constraints: ['Include language/framework version', 'Follow team coding standards'],
    },
    {
      id: 'dept-hr', name: 'HR & People', icon: 'users', color: '#c084fc',
      toneRules: ['Professional and warm', 'Inclusive', 'Legally compliant'],
      doList: ['Use inclusive language', 'Be specific about requirements', 'Highlight culture'],
      dontList: ['Discriminatory language', 'Vague requirements', 'Over-formality'],
      constraints: ['Follow EEO guidelines', 'Include company values'],
    },
    {
      id: 'dept-sales', name: 'Sales', icon: 'trending-up', color: '#fb7185',
      toneRules: ['Confident but not pushy', 'Value-focused', 'Personalized'],
      doList: ['Research the prospect', 'Lead with value', 'Include social proof'],
      dontList: ['Hard sell', 'Generic messaging', 'Ignore objections'],
      constraints: ['Keep emails under 150 words', 'Always include a CTA'],
    },
  ];

  const prompts = [
    // ── Marketing ──
    createPrompt({
      id: 'sp-mkt-email', title: 'Email Campaign Writer',
      content: 'Write a compelling email campaign for [product/service] targeting [audience]. Include:\n\n1. Subject line (under 50 chars, high open-rate optimized)\n2. Preview text\n3. Email body with:\n   - Hook opening line\n   - Problem statement\n   - Solution (our product)\n   - Social proof / stats\n   - Clear CTA button text\n4. P.S. line\n\nTone: [professional/casual/urgent]\nGoal: [awareness/conversion/retention]',
      description: 'Generate complete email campaigns with subject lines, body copy, and CTAs.',
      intendedOutcome: 'Ready-to-send email campaign with all components',
      tone: 'persuasive', tags: ['email', 'campaign', 'marketing', 'copywriting'],
      folderId: 'folder-marketing', departmentId: 'dept-marketing',
      modelRecommendation: 'Claude or ChatGPT',
      exampleInput: 'Product: Project management SaaS, Audience: startup founders, Goal: free trial signups',
      exampleOutput: 'Subject: Ship faster with half the meetings\nPreview: See why 2,000+ startups switched...',
    }),
    createPrompt({
      id: 'sp-mkt-social', title: 'Social Media Content Creator',
      content: 'Create a social media post for [platform] about [topic].\n\nBrand voice: [describe tone]\nTarget audience: [who]\nGoal: [engagement/traffic/awareness]\n\nInclude:\n- Hook (first line must stop the scroll)\n- Body (value-driven, 2-3 short paragraphs)\n- Call to action\n- 3-5 relevant hashtags\n- Emoji suggestions\n\nKeep it under [character limit] characters.',
      description: 'Create scroll-stopping social media posts for any platform.',
      intendedOutcome: 'Platform-ready social media post',
      tone: 'engaging', tags: ['social', 'content', 'marketing'],
      folderId: 'folder-marketing', departmentId: 'dept-marketing',
      modelRecommendation: 'ChatGPT or Claude',
    }),
    createPrompt({
      id: 'sp-mkt-seo', title: 'SEO Blog Outline Generator',
      content: 'Create an SEO-optimized blog post outline for the keyword: "[target keyword]"\n\nInclude:\n1. SEO title (under 60 chars, keyword-first)\n2. Meta description (under 155 chars)\n3. H1 heading\n4. 5-8 H2 sections with:\n   - H2 heading (include keyword variations)\n   - 2-3 bullet points of what to cover\n   - Suggested internal/external links\n5. FAQ section (3-5 questions for featured snippets)\n6. Suggested word count\n7. Related keywords to include naturally',
      description: 'Generate SEO-optimized blog outlines that rank.',
      intendedOutcome: 'Complete blog outline ready for writing',
      tone: 'professional', tags: ['seo', 'blog', 'content', 'marketing'],
      folderId: 'folder-marketing', departmentId: 'dept-marketing',
    }),
    createPrompt({
      id: 'sp-mkt-ad', title: 'Ad Copy Variations Generator',
      content: 'Generate 5 ad copy variations for [product/service].\n\nPlatform: [Google Ads/Facebook/LinkedIn/Twitter]\nTarget: [audience description]\nUSP: [unique selling proposition]\nCTA: [desired action]\n\nFor each variation provide:\n- Headline (under 30 chars for Google, under 40 for social)\n- Description (under 90 chars for Google, under 125 for social)\n- Display URL path (for Google Ads)\n\nMake each variation use a different angle:\n1. Pain point focused\n2. Benefit focused\n3. Social proof focused\n4. Urgency/scarcity\n5. Question-based',
      description: 'Create multiple ad copy angles for testing.',
      intendedOutcome: '5 distinct ad variations ready for A/B testing',
      tone: 'persuasive', tags: ['ads', 'ppc', 'copywriting', 'marketing'],
      folderId: 'folder-marketing', departmentId: 'dept-marketing',
    }),

    // ── Customer Support ──
    createPrompt({
      id: 'sp-sup-response', title: 'Customer Response Template',
      content: 'Write a customer support response for this situation:\n\nIssue: [describe the problem]\nCustomer sentiment: [frustrated/confused/neutral/urgent]\nPrevious interactions: [any context]\n\nResponse should:\n1. Acknowledge the issue empathetically\n2. Explain what happened (if applicable)\n3. Provide a clear solution with steps\n4. Offer alternatives if the main solution doesn\'t work\n5. End with reassurance and next steps\n\nTone: Warm, professional, solution-focused\nMax length: 200 words',
      description: 'Generate empathetic, solution-focused customer responses.',
      intendedOutcome: 'Ready-to-send customer support response',
      tone: 'empathetic', tags: ['support', 'customer', 'response', 'template'],
      folderId: 'folder-support', departmentId: 'dept-support',
    }),
    createPrompt({
      id: 'sp-sup-escalation', title: 'Escalation Summary Writer',
      content: 'Write an internal escalation summary for a support ticket.\n\nCustomer: [name/account]\nIssue: [describe]\nSeverity: [low/medium/high/critical]\nSteps already taken: [what was tried]\nCustomer impact: [how it affects them]\n\nFormat:\n- One-line summary\n- Background (2-3 sentences)\n- Timeline of events\n- Steps taken and results\n- Recommended next action\n- Urgency justification',
      description: 'Create clear escalation summaries for handoffs.',
      intendedOutcome: 'Structured escalation document for internal teams',
      tone: 'professional', tags: ['escalation', 'support', 'internal'],
      folderId: 'folder-support', departmentId: 'dept-support',
    }),
    createPrompt({
      id: 'sp-sup-faq', title: 'FAQ Article Generator',
      content: 'Create a comprehensive FAQ article for: [topic/feature]\n\nProduct: [product name]\nAudience: [technical level of users]\n\nGenerate 8-10 Q&A pairs covering:\n- What it is / does\n- How to get started\n- Common issues and fixes\n- Limitations / known issues\n- Pricing / availability (if applicable)\n- Related features\n\nFormat each answer:\n- Keep under 100 words\n- Use numbered steps for how-to answers\n- Include links placeholders [Link: page name]\n- Bold key terms',
      description: 'Generate complete FAQ articles for your knowledge base.',
      intendedOutcome: 'Publishable FAQ article with 8-10 Q&A pairs',
      tone: 'clear', tags: ['faq', 'knowledge-base', 'support', 'documentation'],
      folderId: 'folder-support', departmentId: 'dept-support',
    }),

    // ── Development ──
    createPrompt({
      id: 'sp-dev-review', title: 'Code Review Assistant',
      content: 'Review the following code and provide feedback:\n\n```[language]\n[paste code here]\n```\n\nPlease analyze for:\n1. **Bugs & Logic errors** — anything that would fail at runtime\n2. **Security** — injection, XSS, auth issues, OWASP top 10\n3. **Performance** — unnecessary loops, memory leaks, N+1 queries\n4. **Readability** — naming, structure, complexity\n5. **Best practices** — patterns, anti-patterns, framework conventions\n\nFor each issue found:\n- Severity: Critical / Warning / Suggestion\n- Line reference\n- Problem description\n- Suggested fix with code',
      description: 'Thorough code review covering bugs, security, and best practices.',
      intendedOutcome: 'Detailed code review with actionable fix suggestions',
      tone: 'technical', tags: ['code-review', 'development', 'security', 'quality'],
      folderId: 'folder-dev', departmentId: 'dept-dev',
      modelRecommendation: 'Claude (best for code analysis)',
    }),
    createPrompt({
      id: 'sp-dev-api', title: 'API Documentation Writer',
      content: 'Generate API documentation for this endpoint:\n\nMethod: [GET/POST/PUT/DELETE]\nPath: [/api/v1/...]\nPurpose: [what it does]\n\nGenerate:\n1. **Description** — 1-2 sentence overview\n2. **Authentication** — required auth method\n3. **Request**\n   - Headers (table)\n   - Path parameters (table)\n   - Query parameters (table)\n   - Body schema (JSON with types and descriptions)\n4. **Response**\n   - Success (200/201) with example JSON\n   - Error responses (400, 401, 404, 500) with examples\n5. **Code examples** — cURL, JavaScript (fetch), Python (requests)\n6. **Rate limits & notes**',
      description: 'Generate complete API endpoint documentation.',
      intendedOutcome: 'Publish-ready API reference documentation',
      tone: 'technical', tags: ['api', 'documentation', 'development'],
      folderId: 'folder-dev', departmentId: 'dept-dev',
    }),
    createPrompt({
      id: 'sp-dev-debug', title: 'Debugging Assistant',
      content: 'Help me debug this issue:\n\n**Error message:**\n```\n[paste error]\n```\n\n**What I expected:** [expected behavior]\n**What happened:** [actual behavior]\n**Environment:** [OS, language version, framework]\n**Code context:**\n```[language]\n[relevant code]\n```\n\nPlease:\n1. Explain what the error means in plain English\n2. Identify the most likely root cause\n3. Provide a step-by-step fix\n4. Explain why the fix works\n5. Suggest how to prevent this in the future',
      description: 'Systematic debugging with root cause analysis.',
      intendedOutcome: 'Clear diagnosis and fix for the bug',
      tone: 'technical', tags: ['debugging', 'development', 'troubleshooting'],
      folderId: 'folder-dev', departmentId: 'dept-dev',
      modelRecommendation: 'Claude or ChatGPT',
    }),
    createPrompt({
      id: 'sp-dev-tests', title: 'Test Case Generator',
      content: 'Generate comprehensive test cases for this function/feature:\n\n```[language]\n[paste code or describe feature]\n```\n\nGenerate tests covering:\n1. **Happy path** — normal expected usage (3-5 cases)\n2. **Edge cases** — boundary values, empty inputs, nulls\n3. **Error cases** — invalid inputs, network failures, auth errors\n4. **Integration** — how it works with other components\n\nFormat: Use [testing framework, e.g., Jest, pytest, Go testing]\nInclude: Test name, setup, assertion, and brief comment explaining what\'s being tested.',
      description: 'Generate thorough test suites including edge cases.',
      intendedOutcome: 'Complete test file ready to run',
      tone: 'technical', tags: ['testing', 'development', 'quality', 'tdd'],
      folderId: 'folder-dev', departmentId: 'dept-dev',
    }),

    // ── HR & People ──
    createPrompt({
      id: 'sp-hr-job', title: 'Job Posting Creator',
      content: 'Write a job posting for: [role title]\n\nCompany: [company name & brief description]\nTeam: [which team]\nLocation: [remote/hybrid/office + city]\nLevel: [junior/mid/senior/lead]\n\nInclude:\n1. **Compelling headline** (not just the title)\n2. **About us** (2-3 sentences, show culture)\n3. **The role** (what they\'ll actually do day-to-day)\n4. **You\'ll love this if...** (personality/workstyle fit)\n5. **Requirements** (must-haves only, 5-7 items)\n6. **Nice-to-haves** (3-4 items)\n7. **What we offer** (benefits, growth, culture)\n8. **How to apply**\n\nUse inclusive language. Avoid gendered terms. Keep it under 500 words.',
      description: 'Create inclusive, compelling job postings that attract great candidates.',
      intendedOutcome: 'Job posting ready to publish on job boards',
      tone: 'professional', tags: ['hiring', 'job-posting', 'hr', 'recruiting'],
      folderId: 'folder-hr', departmentId: 'dept-hr',
    }),
    createPrompt({
      id: 'sp-hr-interview', title: 'Interview Questions Generator',
      content: 'Generate interview questions for a [role title] candidate.\n\nLevel: [junior/mid/senior]\nFocus areas: [technical skills, cultural fit, leadership, problem-solving]\n\nGenerate 15 questions in these categories:\n\n**Technical (5 questions)**\n- Range from foundational to advanced\n- Include at least one practical scenario\n\n**Behavioral (5 questions)**\n- Use STAR format prompts\n- Cover collaboration, conflict, failure, initiative\n\n**Cultural fit (3 questions)**\n- Company values: [list values]\n\n**Role-specific scenario (2 questions)**\n- Real situations they\'d face in this role\n\nFor each: include what a good answer looks like.',
      description: 'Generate structured interview questions by category.',
      intendedOutcome: '15 categorized interview questions with evaluation criteria',
      tone: 'professional', tags: ['interview', 'hiring', 'hr', 'assessment'],
      folderId: 'folder-hr', departmentId: 'dept-hr',
    }),
    createPrompt({
      id: 'sp-hr-review', title: 'Performance Review Drafter',
      content: 'Help me draft a performance review for [employee name/role].\n\nReview period: [Q1 2024 / Annual 2024]\nOverall rating: [exceeds/meets/below expectations]\n\nKey accomplishments:\n- [list 3-5 achievements]\n\nAreas for growth:\n- [list 2-3 areas]\n\nPlease draft:\n1. **Summary** (2-3 sentences, balanced and specific)\n2. **Strengths** (3-4 paragraphs with specific examples)\n3. **Areas for development** (constructive, actionable)\n4. **Goals for next period** (SMART format, 3-4 goals)\n5. **Overall assessment** (closing paragraph)\n\nTone: Supportive, specific, growth-oriented. Avoid vague phrases.',
      description: 'Draft thoughtful performance reviews with specific feedback.',
      intendedOutcome: 'Complete performance review document',
      tone: 'professional', tags: ['performance', 'review', 'hr', 'feedback'],
      folderId: 'folder-hr', departmentId: 'dept-hr',
    }),

    // ── Sales ──
    createPrompt({
      id: 'sp-sales-cold', title: 'Cold Outreach Email',
      content: 'Write a cold outreach email to [prospect title] at [company type].\n\nOur product: [what we sell]\nTheir likely pain: [problem they face]\nSocial proof: [relevant customer/stat]\n\nRules:\n- Under 100 words (they\'re busy)\n- Personalized first line (reference their company/role)\n- Lead with their problem, not our product\n- One clear CTA (not "let me know")\n- No attachments or links in first touch\n- Subject line under 40 characters\n\nGenerate 3 variations:\n1. Problem-focused\n2. Curiosity-driven\n3. Social proof led',
      description: 'Short, personalized cold emails that get responses.',
      intendedOutcome: '3 cold email variations under 100 words each',
      tone: 'conversational', tags: ['cold-email', 'outreach', 'sales', 'prospecting'],
      folderId: 'folder-sales', departmentId: 'dept-sales',
    }),
    createPrompt({
      id: 'sp-sales-objection', title: 'Objection Handling Playbook',
      content: 'Create objection handling responses for selling [product/service].\n\nCommon objection: "[the objection]"\n\nProvide a response using this framework:\n1. **Acknowledge** — validate their concern (1 sentence)\n2. **Reframe** — shift perspective (1-2 sentences)\n3. **Evidence** — data point or customer story\n4. **Bridge** — connect back to their goals\n5. **Advance** — next step or question\n\nAlso generate:\n- 3 probing questions to understand the real objection\n- 1 email follow-up if the objection comes up on a call\n- When to walk away (if this objection means bad fit)',
      description: 'Handle sales objections with a proven framework.',
      intendedOutcome: 'Complete objection handling script with follow-up',
      tone: 'confident', tags: ['objection', 'sales', 'negotiation'],
      folderId: 'folder-sales', departmentId: 'dept-sales',
    }),
    createPrompt({
      id: 'sp-sales-discovery', title: 'Discovery Call Script',
      content: 'Create a discovery call script for selling [product/service] to [target buyer].\n\nCall duration: [15/30 min]\nGoal: [qualify/demo booking/needs assessment]\n\nStructure:\n1. **Opening** (30 sec) — rapport + agenda setting\n2. **Situation questions** (3 questions) — understand their current state\n3. **Problem questions** (3 questions) — uncover pain points\n4. **Impact questions** (2 questions) — quantify the cost of the problem\n5. **Vision questions** (2 questions) — what success looks like\n6. **Solution bridge** — how we help (60 sec pitch)\n7. **Next steps** — clear CTA\n\nInclude transition phrases between sections.',
      description: 'Structured discovery call framework that qualifies prospects.',
      intendedOutcome: 'Complete discovery call script with questions and transitions',
      tone: 'professional', tags: ['discovery', 'sales', 'qualification', 'script'],
      folderId: 'folder-sales', departmentId: 'dept-sales',
    }),
  ];

  // Save all
  for (const f of folders) {
    f.createdAt = Date.now();
    await saveFolder(f);
  }
  for (const d of departments) {
    d.createdAt = Date.now();
    await saveDepartment(d);
  }
  await _set(STORAGE_KEYS.PROMPTS, prompts);
  await _set(STORAGE_KEYS.PROMPT_STARTER_INSTALLED, true);
}
