// ContextIQ Team & Organization Storage Layer
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
    {
      id: 'std-writing',
      name: 'Writing Standards',
      description: 'Guidelines for all writing-related prompts — blogs, emails, copy, docs.',
      category: 'writing',
      scope: 'org',
      rules: {
        toneRules: ['Match brand voice', 'Be concise and clear', 'Use active voice'],
        doList: ['Specify target audience', 'Include desired word count', 'Define the CTA'],
        dontList: ['Use placeholder text without guidance', 'Skip the context/background', 'Leave tone ambiguous'],
        constraints: ['Always specify the audience', 'Include format requirements'],
        requiredFields: ['description', 'tone'],
        templateStructure: '',
        requiredTags: [],
        bannedWords: [],
        maxLength: 5000,
        minLength: 50,
      },
      enforced: false,
    },
    {
      id: 'std-coding',
      name: 'Coding Standards',
      description: 'Guidelines for all code-related prompts — generation, review, debugging.',
      category: 'coding',
      scope: 'org',
      rules: {
        toneRules: ['Technical and precise', 'Include error handling expectations', 'Specify language and framework'],
        doList: ['Include the programming language', 'Specify framework/version', 'Mention coding standards to follow', 'Include test requirements'],
        dontList: ['Ask for code without specifying language', 'Skip security considerations', 'Ignore edge cases'],
        constraints: ['Must specify language', 'Include error handling guidance'],
        requiredFields: ['description'],
        templateStructure: 'Language: [lang]\nFramework: [framework]\nTask: [description]\nConstraints: [list]\nTests: [yes/no]',
        requiredTags: [],
        bannedWords: [],
        maxLength: 8000,
        minLength: 30,
      },
      enforced: false,
    },
    {
      id: 'std-design',
      name: 'Design & Creative Standards',
      description: 'Guidelines for design, image generation, and creative prompts.',
      category: 'design',
      scope: 'org',
      rules: {
        toneRules: ['Descriptive and visual', 'Reference brand guidelines', 'Specify dimensions and format'],
        doList: ['Include style references', 'Specify color palette or brand colors', 'Define dimensions/aspect ratio', 'Mention target platform'],
        dontList: ['Use vague descriptions', 'Skip brand consistency', 'Forget accessibility requirements'],
        constraints: ['Include visual style direction', 'Specify output format'],
        requiredFields: ['description'],
        templateStructure: '',
        requiredTags: [],
        bannedWords: [],
        maxLength: 3000,
        minLength: 20,
      },
      enforced: false,
    },
    {
      id: 'std-customer',
      name: 'Customer Communication Standards',
      description: 'Guidelines for customer-facing prompts — support, emails, chat.',
      category: 'support',
      scope: 'org',
      rules: {
        toneRules: ['Empathetic and professional', 'Solution-oriented', 'Brand-consistent'],
        doList: ['Acknowledge the customer issue first', 'Provide clear next steps', 'Use plain language'],
        dontList: ['Blame the customer', 'Use jargon', 'Make promises we cannot keep', 'Be dismissive'],
        constraints: ['Keep responses under 200 words', 'Always include next steps'],
        requiredFields: ['description', 'tone'],
        templateStructure: '',
        requiredTags: [],
        bannedWords: ['fault', 'blame', 'impossible', 'cannot'],
        maxLength: 3000,
        minLength: 30,
      },
      enforced: false,
    },
  ];

  for (const std of defaults) {
    std.createdAt = Date.now();
    std.updatedAt = Date.now();
    std.createdBy = 'system';
    await saveStandard(std);
  }
}
