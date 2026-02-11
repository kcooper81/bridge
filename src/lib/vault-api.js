// ContextIQ Vault API — Storage abstraction for extension + supabase + web
// Priority: (1) Chrome extension → (2) Supabase remote → (3) localStorage fallback
//
// Mode detection:
//   IS_EXTENSION — running inside Chrome extension (service worker messaging)
//   IS_REMOTE    — Supabase configured + user authenticated (real database)
//   fallback     — localStorage (offline / demo mode)

const IS_EXTENSION = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

// Dynamic import of supabase-client — only loaded in web mode
let _sbModule = null;
async function getSbModule() {
  if (_sbModule) return _sbModule;
  if (IS_EXTENSION) return null; // skip in extension
  try {
    _sbModule = await import('./supabase-client.js');
    return _sbModule;
  } catch { return null; }
}

// IS_REMOTE is dynamic — user may sign in after page load
let _remoteClient = null;
let _remoteUser = null;
let _remoteOrgId = null;

async function checkRemote() {
  if (IS_EXTENSION) return false;
  const mod = await getSbModule();
  if (!mod || !mod.isConfigured()) return false;
  try {
    if (!_remoteClient) _remoteClient = await mod.getClient();
    if (!_remoteUser) _remoteUser = await mod.getUser();
    return !!_remoteUser;
  } catch { return false; }
}

async function sb() {
  const mod = await getSbModule();
  if (!_remoteClient && mod) _remoteClient = await mod.getClient();
  return _remoteClient;
}

async function getRemoteUser() {
  const mod = await getSbModule();
  return mod ? mod.getUser() : null;
}

// Cache the user's org_id after first lookup
async function getOrgId() {
  if (_remoteOrgId) return _remoteOrgId;
  const client = await sb();
  const user = await getRemoteUser();
  if (!user) return null;
  const { data } = await client.from('profiles').select('org_id').eq('id', user.id).single();
  _remoteOrgId = data?.org_id;
  return _remoteOrgId;
}

// Reset cached remote state (call on sign-out)
export function resetRemoteState() {
  _remoteClient = null;
  _remoteUser = null;
  _remoteOrgId = null;
}

// ── Extension mode: message the service worker ──

function extMsg(type, data = {}) {
  return chrome.runtime.sendMessage({ type, ...data });
}

// ── Supabase helpers: map DB rows to our app shape ──

function dbPromptToApp(row) {
  return {
    id: row.id, title: row.title, content: row.content, description: row.description || '',
    intendedOutcome: row.intended_outcome || '', tone: row.tone || 'professional',
    modelRecommendation: row.model_recommendation || '', exampleInput: row.example_input || '',
    exampleOutput: row.example_output || '', tags: row.tags || [], folderId: row.folder_id,
    departmentId: row.department_id, owner: row.owner_id, status: row.status || 'approved',
    version: row.version || 1, versionHistory: [], rating: { total: row.rating_total || 0, count: row.rating_count || 0 },
    usageCount: row.usage_count || 0, lastUsedAt: row.last_used_at, isFavorite: row.is_favorite || false,
    createdAt: new Date(row.created_at).getTime(), updatedAt: new Date(row.updated_at).getTime(),
  };
}

function appPromptToDb(fields, orgId, userId) {
  const row = {};
  if (orgId) row.org_id = orgId;
  if (userId) row.owner_id = userId;
  if (fields.title !== undefined) row.title = fields.title;
  if (fields.content !== undefined) row.content = fields.content;
  if (fields.description !== undefined) row.description = fields.description;
  if (fields.intendedOutcome !== undefined) row.intended_outcome = fields.intendedOutcome;
  if (fields.tone !== undefined) row.tone = fields.tone;
  if (fields.modelRecommendation !== undefined) row.model_recommendation = fields.modelRecommendation;
  if (fields.exampleInput !== undefined) row.example_input = fields.exampleInput;
  if (fields.exampleOutput !== undefined) row.example_output = fields.exampleOutput;
  if (fields.tags !== undefined) row.tags = fields.tags;
  if (fields.folderId !== undefined) row.folder_id = fields.folderId;
  if (fields.departmentId !== undefined) row.department_id = fields.departmentId;
  if (fields.status !== undefined) row.status = fields.status;
  if (fields.isFavorite !== undefined) row.is_favorite = fields.isFavorite;
  return row;
}

// ── Web mode: in-memory + localStorage adapter ──

class WebStorage {
  constructor() {
    this._cache = {};
    this._loadAll();
  }

  _loadAll() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('contextiq_'));
      for (const k of keys) {
        try { this._cache[k] = JSON.parse(localStorage.getItem(k)); } catch { /* skip */ }
      }
    } catch { /* no localStorage */ }
  }

  async get(key) {
    if (this._cache[key] !== undefined) return this._cache[key];
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  async set(key, value) {
    this._cache[key] = value;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  }
}

let webStore = null;
function getWebStore() {
  if (!webStore) webStore = new WebStorage();
  return webStore;
}

// Storage keys (duplicated here to avoid import issues in web mode)
const SK = {
  PROMPTS: 'contextiq_prompts',
  PROMPT_FOLDERS: 'contextiq_prompt_folders',
  PROMPT_DEPARTMENTS: 'contextiq_prompt_departments',
  PROMPT_ANALYTICS: 'contextiq_prompt_analytics',
  PROMPT_STARTER_INSTALLED: 'contextiq_prompt_starter_installed',
  ORG: 'contextiq_org',
  TEAMS: 'contextiq_teams',
  MEMBERS: 'contextiq_members',
  COLLECTIONS: 'contextiq_collections',
  STANDARDS: 'contextiq_standards',
};

// ── Web-mode CRUD helpers ──

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function webGetList(key) {
  return (await getWebStore().get(key)) || [];
}

async function webGetObj(key) {
  return (await getWebStore().get(key)) || null;
}

async function webSetList(key, list) {
  await getWebStore().set(key, list);
}

async function webSaveItem(key, item, defaultFields) {
  const list = await webGetList(key);
  const idx = list.findIndex(i => i.id === item.id);
  const entry = { id: uuid(), createdAt: Date.now(), ...defaultFields, ...item, updatedAt: Date.now() };
  if (idx >= 0) list[idx] = entry; else list.push(entry);
  await webSetList(key, list);
  return entry;
}

async function webDeleteItem(key, id) {
  const list = await webGetList(key);
  await webSetList(key, list.filter(i => i.id !== id));
}

// ═══════════════════════════════════════
//  UNIFIED VAULT API
// ═══════════════════════════════════════

export const VaultAPI = {

  // ── Mode check ──
  async isRemote() { return checkRemote(); },

  // ── Prompts ──

  async getAllData() {
    if (IS_EXTENSION) return extMsg('VAULT_GET_ALL');
    if (await checkRemote()) {
      const orgId = await getOrgId();
      const client = await sb();
      const [prompts, folders, departments, org, teams, members, collections, standards] = await Promise.all([
        client.from('prompts').select('*').eq('org_id', orgId).order('updated_at', { ascending: false }),
        client.from('folders').select('*').eq('org_id', orgId),
        client.from('departments').select('*').eq('org_id', orgId),
        client.from('organizations').select('*').eq('id', orgId).single(),
        client.from('teams').select('*').eq('org_id', orgId),
        client.from('profiles').select('*').eq('org_id', orgId),
        client.from('collections').select('*').eq('org_id', orgId),
        client.from('standards').select('*').eq('org_id', orgId),
      ]);
      return {
        prompts: (prompts.data || []).map(dbPromptToApp),
        folders: folders.data || [],
        departments: departments.data || [],
        org: org.data || null,
        teams: teams.data || [],
        members: (members.data || []).map(m => ({ ...m, teamIds: [] })),
        collections: collections.data || [],
        standards: (standards.data || []).map(s => ({ ...s, rules: s.rules || {} })),
        analytics: await this.getAnalytics(),
      };
    }
    return {
      prompts: await webGetList(SK.PROMPTS),
      folders: await webGetList(SK.PROMPT_FOLDERS),
      departments: await webGetList(SK.PROMPT_DEPARTMENTS),
      org: await webGetObj(SK.ORG),
      teams: await webGetList(SK.TEAMS),
      members: await webGetList(SK.MEMBERS),
      collections: await webGetList(SK.COLLECTIONS),
      standards: await webGetList(SK.STANDARDS),
      analytics: await this.getAnalytics(),
    };
  },

  async getPrompts(query, filters) {
    if (IS_EXTENSION) return (await extMsg('PROMPT_GET_ALL', { query, filters })).prompts;
    if (await checkRemote()) {
      const orgId = await getOrgId();
      const client = await sb();
      let q = client.from('prompts').select('*').eq('org_id', orgId).order('updated_at', { ascending: false });
      const { data } = await q;
      return (data || []).map(dbPromptToApp);
    }
    return webGetList(SK.PROMPTS);
  },

  async createPrompt(fields) {
    if (IS_EXTENSION) return extMsg('PROMPT_CREATE', { fields });
    if (await checkRemote()) {
      const orgId = await getOrgId();
      const user = await getRemoteUser();
      const row = { ...appPromptToDb(fields, orgId, user.id), version: 1 };
      const client = await sb();
      const { data, error } = await client.from('prompts').insert(row).select().single();
      if (error) return { error: error.message };
      return { success: true, prompt: dbPromptToApp(data) };
    }
    const prompt = {
      id: uuid(), title: '', content: '', description: '', intendedOutcome: '',
      tone: 'professional', modelRecommendation: '', exampleInput: '', exampleOutput: '',
      tags: [], folderId: null, departmentId: null, owner: 'You', status: 'approved',
      version: 1, versionHistory: [], rating: { total: 0, count: 0 }, usageCount: 0,
      lastUsedAt: null, isFavorite: false, createdAt: Date.now(), updatedAt: Date.now(),
      ...fields,
    };
    const list = await webGetList(SK.PROMPTS);
    list.unshift(prompt);
    await webSetList(SK.PROMPTS, list);
    return { success: true, prompt };
  },

  async updatePrompt(promptId, fields) {
    if (IS_EXTENSION) return extMsg('PROMPT_UPDATE', { promptId, fields });
    if (await checkRemote()) {
      const client = await sb();
      // Get current version for history
      const { data: current } = await client.from('prompts').select('*').eq('id', promptId).single();
      if (!current) return { error: 'Not found' };
      const row = appPromptToDb(fields);
      const contentChanged = (fields.content !== undefined && fields.content !== current.content) || (fields.title !== undefined && fields.title !== current.title);
      if (contentChanged) {
        row.version = (current.version || 1) + 1;
        await client.from('prompt_versions').insert({ prompt_id: promptId, version: current.version, title: current.title, content: current.content });
      }
      const { data, error } = await client.from('prompts').update(row).eq('id', promptId).select().single();
      if (error) return { error: error.message };
      return { success: true, prompt: dbPromptToApp(data) };
    }
    const list = await webGetList(SK.PROMPTS);
    const idx = list.findIndex(p => p.id === promptId);
    if (idx < 0) return { error: 'Not found' };
    const prev = list[idx];
    const updated = { ...prev, ...fields, updatedAt: Date.now() };
    if (prev.content !== updated.content || prev.title !== updated.title) {
      if (!updated.versionHistory) updated.versionHistory = [];
      updated.versionHistory.unshift({ version: prev.version, title: prev.title, content: prev.content, updatedAt: prev.updatedAt });
      updated.versionHistory = updated.versionHistory.slice(0, 20);
      updated.version = (prev.version || 1) + 1;
    }
    list[idx] = updated;
    await webSetList(SK.PROMPTS, list);
    return { success: true, prompt: updated };
  },

  async deletePrompt(promptId) {
    if (IS_EXTENSION) return extMsg('PROMPT_DELETE', { promptId });
    if (await checkRemote()) {
      const client = await sb();
      const { error } = await client.from('prompts').delete().eq('id', promptId);
      if (error) return { error: error.message };
      return { success: true };
    }
    await webDeleteItem(SK.PROMPTS, promptId);
    return { success: true };
  },

  async duplicatePrompt(promptId) {
    if (IS_EXTENSION) return extMsg('PROMPT_DUPLICATE', { promptId });
    if (await checkRemote()) {
      const client = await sb();
      const { data: orig } = await client.from('prompts').select('*').eq('id', promptId).single();
      if (!orig) return { error: 'Not found' };
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = orig;
      const { data, error } = await client.from('prompts').insert({ ...rest, title: `${orig.title} (copy)`, version: 1, rating_total: 0, rating_count: 0, usage_count: 0 }).select().single();
      if (error) return { error: error.message };
      return { success: true, prompt: dbPromptToApp(data) };
    }
    const list = await webGetList(SK.PROMPTS);
    const orig = list.find(p => p.id === promptId);
    if (!orig) return { error: 'Not found' };
    const copy = { ...orig, id: uuid(), title: `${orig.title} (copy)`, version: 1, versionHistory: [], rating: { total: 0, count: 0 }, usageCount: 0, createdAt: Date.now(), updatedAt: Date.now() };
    list.unshift(copy);
    await webSetList(SK.PROMPTS, list);
    return { success: true, prompt: copy };
  },

  async recordUsage(promptId) {
    if (IS_EXTENSION) return extMsg('PROMPT_USE', { promptId });
    if (await checkRemote()) {
      const client = await sb();
      const user = await getRemoteUser();
      const orgId = await getOrgId();
      await client.rpc('', {}).catch(() => {}); // no-op if no rpc
      const { data } = await client.from('prompts').select('usage_count').eq('id', promptId).single();
      if (!data) return { error: 'Not found' };
      await client.from('prompts').update({ usage_count: (data.usage_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', promptId);
      await client.from('usage_events').insert({ org_id: orgId, user_id: user?.id, prompt_id: promptId, action: 'use' });
      return { success: true };
    }
    const list = await webGetList(SK.PROMPTS);
    const idx = list.findIndex(p => p.id === promptId);
    if (idx < 0) return { error: 'Not found' };
    list[idx].usageCount = (list[idx].usageCount || 0) + 1;
    list[idx].lastUsedAt = Date.now();
    await webSetList(SK.PROMPTS, list);
    return { success: true, prompt: list[idx] };
  },

  async ratePrompt(promptId, stars) {
    if (IS_EXTENSION) return extMsg('PROMPT_RATE', { promptId, stars });
    if (await checkRemote()) {
      const client = await sb();
      const { data } = await client.from('prompts').select('rating_total, rating_count').eq('id', promptId).single();
      if (!data) return { error: 'Not found' };
      const s = Math.max(1, Math.min(5, Math.round(stars)));
      await client.from('prompts').update({ rating_total: (data.rating_total || 0) + s, rating_count: (data.rating_count || 0) + 1 }).eq('id', promptId);
      return { success: true };
    }
    const list = await webGetList(SK.PROMPTS);
    const idx = list.findIndex(p => p.id === promptId);
    if (idx < 0) return { error: 'Not found' };
    const r = list[idx].rating || { total: 0, count: 0 };
    r.total += Math.max(1, Math.min(5, Math.round(stars)));
    r.count += 1;
    list[idx].rating = r;
    await webSetList(SK.PROMPTS, list);
    return { success: true, prompt: list[idx] };
  },

  async toggleFavorite(promptId) {
    if (IS_EXTENSION) return extMsg('PROMPT_TOGGLE_FAVORITE', { promptId });
    if (await checkRemote()) {
      const client = await sb();
      const { data } = await client.from('prompts').select('is_favorite').eq('id', promptId).single();
      if (!data) return { error: 'Not found' };
      await client.from('prompts').update({ is_favorite: !data.is_favorite }).eq('id', promptId);
      return { success: true };
    }
    const list = await webGetList(SK.PROMPTS);
    const idx = list.findIndex(p => p.id === promptId);
    if (idx < 0) return { error: 'Not found' };
    list[idx].isFavorite = !list[idx].isFavorite;
    await webSetList(SK.PROMPTS, list);
    return { success: true, prompt: list[idx] };
  },

  // ── Folders & Departments ──

  async getFolders() {
    if (IS_EXTENSION) return (await extMsg('PROMPT_GET_FOLDERS')).folders;
    if (await checkRemote()) { const client = await sb(); const orgId = await getOrgId(); const { data } = await client.from('folders').select('*').eq('org_id', orgId); return data || []; }
    return webGetList(SK.PROMPT_FOLDERS);
  },

  async saveFolder(folder) {
    if (IS_EXTENSION) return extMsg('PROMPT_SAVE_FOLDER', { folder });
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId(); const user = await getRemoteUser();
      const row = { org_id: orgId, name: folder.name || '', icon: folder.icon || 'folder', color: folder.color || '#8b5cf6', created_by: user?.id };
      let res;
      if (folder.id) { res = await client.from('folders').update(row).eq('id', folder.id).select().single(); }
      else { res = await client.from('folders').insert(row).select().single(); }
      return { success: !res.error, folder: res.data };
    }
    return { success: true, folder: await webSaveItem(SK.PROMPT_FOLDERS, folder, { name: 'New Folder', icon: 'folder', color: '#8b5cf6' }) };
  },

  async deleteFolder(folderId) {
    if (IS_EXTENSION) return extMsg('PROMPT_DELETE_FOLDER', { folderId });
    if (await checkRemote()) { const client = await sb(); await client.from('folders').delete().eq('id', folderId); return { success: true }; }
    await webDeleteItem(SK.PROMPT_FOLDERS, folderId);
    return { success: true };
  },

  async getDepartments() {
    if (IS_EXTENSION) return (await extMsg('PROMPT_GET_DEPARTMENTS')).departments;
    if (await checkRemote()) { const client = await sb(); const orgId = await getOrgId(); const { data } = await client.from('departments').select('*').eq('org_id', orgId); return data || []; }
    return webGetList(SK.PROMPT_DEPARTMENTS);
  },

  async saveDepartment(department) {
    if (IS_EXTENSION) return extMsg('PROMPT_SAVE_DEPARTMENT', { department });
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId();
      const row = { org_id: orgId, name: department.name || '' };
      let res;
      if (department.id) { res = await client.from('departments').update(row).eq('id', department.id).select().single(); }
      else { res = await client.from('departments').insert(row).select().single(); }
      return { success: !res.error, department: res.data };
    }
    return { success: true, department: await webSaveItem(SK.PROMPT_DEPARTMENTS, department, { name: 'New Dept' }) };
  },

  async deleteDepartment(departmentId) {
    if (IS_EXTENSION) return extMsg('PROMPT_DELETE_DEPARTMENT', { departmentId });
    if (await checkRemote()) { const client = await sb(); await client.from('departments').delete().eq('id', departmentId); return { success: true }; }
    await webDeleteItem(SK.PROMPT_DEPARTMENTS, departmentId);
    return { success: true };
  },

  // ── Organization ──

  async getOrg() {
    if (IS_EXTENSION) return (await extMsg('TEAM_GET_ORG')).org;
    if (await checkRemote()) { const client = await sb(); const orgId = await getOrgId(); if (!orgId) return null; const { data } = await client.from('organizations').select('*').eq('id', orgId).single(); return data; }
    return webGetObj(SK.ORG);
  },

  async saveOrg(org) {
    if (IS_EXTENSION) return extMsg('TEAM_SAVE_ORG', { org });
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId(); const user = await getRemoteUser();
      const row = { name: org.name || '', domain: org.domain || '', plan: org.plan || 'free', settings: org.settings || {} };
      let res;
      if (orgId) {
        res = await client.from('organizations').update(row).eq('id', orgId).select().single();
      } else {
        res = await client.from('organizations').insert(row).select().single();
        if (res.data) {
          _remoteOrgId = res.data.id;
          await client.from('profiles').update({ org_id: res.data.id }).eq('id', user.id);
        }
      }
      return { success: !res.error, org: res.data };
    }
    const merged = { id: uuid(), name: '', domain: '', plan: 'free', settings: { enforceStandards: false, requireApproval: false, allowPersonalPrompts: true, defaultVisibility: 'team' }, createdAt: Date.now(), ...(await webGetObj(SK.ORG) || {}), ...org, updatedAt: Date.now() };
    await getWebStore().set(SK.ORG, merged);
    return { success: true, org: merged };
  },

  // ── Teams ──

  async getTeams() {
    if (IS_EXTENSION) return (await extMsg('TEAM_GET_TEAMS')).teams;
    if (await checkRemote()) { const client = await sb(); const orgId = await getOrgId(); const { data } = await client.from('teams').select('*').eq('org_id', orgId); return data || []; }
    return webGetList(SK.TEAMS);
  },

  async saveTeam(team) {
    if (IS_EXTENSION) return extMsg('TEAM_SAVE_TEAM', { team });
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId();
      const row = { org_id: orgId, name: team.name || '', description: team.description || '', icon: team.icon || 'users', color: team.color || '#8b5cf6' };
      let res;
      if (team.id) { res = await client.from('teams').update(row).eq('id', team.id).select().single(); }
      else { res = await client.from('teams').insert(row).select().single(); }
      return { success: !res.error, team: res.data };
    }
    return { success: true, team: await webSaveItem(SK.TEAMS, team, { name: '', color: '#8b5cf6' }) };
  },

  async deleteTeam(teamId) {
    if (IS_EXTENSION) return extMsg('TEAM_DELETE_TEAM', { teamId });
    if (await checkRemote()) { const client = await sb(); await client.from('teams').delete().eq('id', teamId); return { success: true }; }
    await webDeleteItem(SK.TEAMS, teamId);
    return { success: true };
  },

  // ── Members ──

  async getMembers() {
    if (IS_EXTENSION) return (await extMsg('TEAM_GET_MEMBERS')).members;
    if (await checkRemote()) { const client = await sb(); const orgId = await getOrgId(); const { data } = await client.from('profiles').select('*').eq('org_id', orgId); return (data || []).map(m => ({ ...m, teamIds: [] })); }
    return webGetList(SK.MEMBERS);
  },

  async saveMember(member) {
    if (IS_EXTENSION) return extMsg('TEAM_SAVE_MEMBER', { member });
    if (await checkRemote()) {
      const client = await sb();
      const row = { name: member.name || '', role: member.role || 'member' };
      const { data, error } = await client.from('profiles').update(row).eq('id', member.id).select().single();
      return { success: !error, member: data };
    }
    return { success: true, member: await webSaveItem(SK.MEMBERS, member, { name: '', role: 'member', teamIds: [] }) };
  },

  async deleteMember(memberId) {
    if (IS_EXTENSION) return extMsg('TEAM_DELETE_MEMBER', { memberId });
    if (await checkRemote()) { const client = await sb(); await client.from('profiles').update({ org_id: null }).eq('id', memberId); return { success: true }; }
    await webDeleteItem(SK.MEMBERS, memberId);
    return { success: true };
  },

  async getCurrentUser() {
    if (IS_EXTENSION) return (await extMsg('TEAM_GET_CURRENT_USER')).user;
    if (await checkRemote()) {
      const user = await getRemoteUser();
      if (!user) return null;
      const client = await sb();
      const { data } = await client.from('profiles').select('*').eq('id', user.id).single();
      return data ? { ...data, isCurrentUser: true, teamIds: [] } : null;
    }
    const members = await webGetList(SK.MEMBERS);
    return members.find(m => m.isCurrentUser) || null;
  },

  async setupUser(name, email, role) {
    if (IS_EXTENSION) return extMsg('TEAM_SETUP_USER', { name, email, role });
    if (await checkRemote()) {
      const user = await getRemoteUser();
      if (!user) return { error: 'Not authenticated' };
      const client = await sb();
      const { data } = await client.from('profiles').update({ name, email, role: role || 'admin' }).eq('id', user.id).select().single();
      return { success: true, user: data };
    }
    const existing = await this.getCurrentUser();
    if (existing) return { success: true, user: existing };
    const user = { id: uuid(), name, email, role: role || 'admin', isCurrentUser: true, teamIds: [], createdAt: Date.now(), updatedAt: Date.now() };
    const list = await webGetList(SK.MEMBERS);
    list.push(user);
    await webSetList(SK.MEMBERS, list);
    return { success: true, user };
  },

  // ── Collections ──

  async getCollections() {
    if (IS_EXTENSION) return (await extMsg('TEAM_GET_COLLECTIONS')).collections;
    if (await checkRemote()) { const client = await sb(); const orgId = await getOrgId(); const { data } = await client.from('collections').select('*').eq('org_id', orgId); return data || []; }
    return webGetList(SK.COLLECTIONS);
  },

  async saveCollection(collection) {
    if (IS_EXTENSION) return extMsg('TEAM_SAVE_COLLECTION', { collection });
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId(); const user = await getRemoteUser();
      const row = { org_id: orgId, name: collection.name || '', description: collection.description || '', icon: collection.icon || 'folder', color: collection.color || '#8b5cf6', visibility: collection.visibility || 'team', created_by: user?.id, team_id: collection.teamId || null };
      let res;
      if (collection.id) { res = await client.from('collections').update(row).eq('id', collection.id).select().single(); }
      else { res = await client.from('collections').insert(row).select().single(); }
      return { success: !res.error, collection: res.data };
    }
    return { success: true, collection: await webSaveItem(SK.COLLECTIONS, collection, { name: '', promptIds: [], visibility: 'team' }) };
  },

  async deleteCollection(collId) {
    if (IS_EXTENSION) return extMsg('TEAM_DELETE_COLLECTION', { collId });
    if (await checkRemote()) { const client = await sb(); await client.from('collections').delete().eq('id', collId); return { success: true }; }
    await webDeleteItem(SK.COLLECTIONS, collId);
    return { success: true };
  },

  // ── Standards ──

  async getStandards() {
    if (IS_EXTENSION) return (await extMsg('TEAM_GET_STANDARDS')).standards;
    if (await checkRemote()) { const client = await sb(); const orgId = await getOrgId(); const { data } = await client.from('standards').select('*').eq('org_id', orgId); return (data || []).map(s => ({ ...s, rules: s.rules || {} })); }
    return webGetList(SK.STANDARDS);
  },

  async saveStandard(standard) {
    if (IS_EXTENSION) return extMsg('TEAM_SAVE_STANDARD', { standard });
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId(); const user = await getRemoteUser();
      const row = { org_id: orgId, name: standard.name || '', description: standard.description || '', category: standard.category || 'general', scope: standard.scope || 'org', rules: standard.rules || {}, enforced: standard.enforced || false, created_by: user?.id };
      let res;
      if (standard.id && !standard.id.startsWith('std-')) { res = await client.from('standards').update(row).eq('id', standard.id).select().single(); }
      else { res = await client.from('standards').insert(row).select().single(); }
      return { success: !res.error, standard: res.data };
    }
    return { success: true, standard: await webSaveItem(SK.STANDARDS, standard, { name: '', category: 'general', scope: 'org', enforced: false, rules: {} }) };
  },

  async deleteStandard(stdId) {
    if (IS_EXTENSION) return extMsg('TEAM_DELETE_STANDARD', { stdId });
    if (await checkRemote()) { const client = await sb(); await client.from('standards').delete().eq('id', stdId); return { success: true }; }
    await webDeleteItem(SK.STANDARDS, stdId);
    return { success: true };
  },

  async installDefaultStandards() {
    if (IS_EXTENSION) return extMsg('TEAM_INSTALL_DEFAULT_STANDARDS');
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId(); const user = await getRemoteUser();
      const { data: existing } = await client.from('standards').select('id').eq('org_id', orgId).limit(1);
      if (existing?.length > 0) return { success: true };
      const rows = DEFAULT_STANDARDS.map(s => ({ org_id: orgId, name: s.name, description: s.description, category: s.category, scope: s.scope, rules: s.rules, enforced: false, created_by: user?.id }));
      await client.from('standards').insert(rows);
      return { success: true };
    }
    const existing = await webGetList(SK.STANDARDS);
    if (existing.length > 0) return { success: true };
    for (const std of DEFAULT_STANDARDS) {
      await webSaveItem(SK.STANDARDS, { ...std, id: std.id }, {});
    }
    return { success: true };
  },

  async validatePrompt(prompt) {
    if (IS_EXTENSION) return extMsg('TEAM_VALIDATE_PROMPT', { prompt });
    // Web mode validation
    const standards = await webGetList(SK.STANDARDS);
    const violations = [];
    for (const std of standards) {
      if (!std.enforced) continue;
      const r = std.rules || {};
      if (r.minLength && (prompt.content || '').length < r.minLength) {
        violations.push(`[${std.name}] Prompt must be at least ${r.minLength} characters`);
      }
      if (r.maxLength && (prompt.content || '').length > r.maxLength) {
        violations.push(`[${std.name}] Prompt must be under ${r.maxLength} characters`);
      }
      if (r.requiredTags?.length) {
        const missing = r.requiredTags.filter(t => !(prompt.tags || []).includes(t));
        if (missing.length) violations.push(`[${std.name}] Missing required tags: ${missing.join(', ')}`);
      }
      if (r.bannedWords?.length) {
        const found = r.bannedWords.filter(w => (prompt.content || '').toLowerCase().includes(w.toLowerCase()));
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
  },

  // ── Import / Export ──

  async exportPack(promptIds, packName) {
    if (IS_EXTENSION) return extMsg('TEAM_EXPORT_PACK', { promptIds, packName });
    const prompts = await webGetList(SK.PROMPTS);
    const selected = prompts.filter(p => promptIds.includes(p.id));
    const pack = {
      format: 'contextiq-prompt-pack', version: '1.0', name: packName,
      exportedAt: Date.now(), promptCount: selected.length,
      prompts: selected.map(p => ({ title: p.title, content: p.content, description: p.description, intendedOutcome: p.intendedOutcome, tone: p.tone, modelRecommendation: p.modelRecommendation, exampleInput: p.exampleInput, exampleOutput: p.exampleOutput, tags: p.tags })),
    };
    return { success: true, pack };
  },

  async importPack(packData) {
    if (IS_EXTENSION) return extMsg('TEAM_IMPORT_PACK', { packData });
    if (packData.format !== 'contextiq-prompt-pack') return { success: false, error: 'Invalid format' };
    const list = await webGetList(SK.PROMPTS);
    let imported = 0;
    for (const p of (packData.prompts || [])) {
      list.unshift({
        id: uuid(), title: p.title || 'Imported', content: p.content || '', description: p.description || '',
        intendedOutcome: p.intendedOutcome || '', tone: p.tone || 'professional', tags: [...(p.tags || []), 'imported'],
        folderId: null, departmentId: null, owner: 'You', status: 'approved', version: 1, versionHistory: [],
        rating: { total: 0, count: 0 }, usageCount: 0, isFavorite: false, createdAt: Date.now(), updatedAt: Date.now(),
      });
      imported++;
    }
    await webSetList(SK.PROMPTS, list);
    return { success: true, imported };
  },

  // ── Analytics ──

  async getAnalytics() {
    if (IS_EXTENSION) return (await extMsg('PROMPT_GET_ANALYTICS')).summary;
    if (await checkRemote()) {
      const client = await sb(); const orgId = await getOrgId();
      const { data: prompts } = await client.from('prompts').select('id, title, usage_count, rating_total, rating_count, department_id').eq('org_id', orgId);
      const all = prompts || [];
      const totalUses = all.reduce((s, p) => s + (p.usage_count || 0), 0);
      const rated = all.filter(p => p.rating_count > 0);
      const avgRating = rated.length ? rated.reduce((s, p) => s + p.rating_total / p.rating_count, 0) / rated.length : 0;
      const topPrompts = [...all].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 8).map(p => ({ id: p.id, title: p.title, usageCount: p.usage_count }));
      // Usage events this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await client.from('usage_events').select('id', { count: 'exact', head: true }).eq('org_id', orgId).gte('created_at', weekAgo);
      return { totalPrompts: all.length, totalUses, avgRating: Math.round(avgRating * 10) / 10, usesThisWeek: count || 0, topPrompts, departmentUsage: {} };
    }
    const prompts = await webGetList(SK.PROMPTS);
    const totalUses = prompts.reduce((s, p) => s + (p.usageCount || 0), 0);
    const rated = prompts.filter(p => p.rating?.count);
    const avgRating = rated.length ? rated.reduce((s, p) => s + p.rating.total / p.rating.count, 0) / rated.length : 0;
    const topPrompts = [...prompts].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 8);
    return { totalPrompts: prompts.length, totalUses, avgRating: Math.round(avgRating * 10) / 10, usesThisWeek: 0, topPrompts, departmentUsage: {} };
  },

  async installStarters() {
    if (IS_EXTENSION) return extMsg('PROMPT_INSTALL_STARTERS');
    // Web mode: no-op for now (starters are complex)
    return { success: true };
  },

  // ── Insert prompt into AI tool (extension only) ──

  async insertPrompt(promptId) {
    if (IS_EXTENSION) return extMsg('PROMPT_INSERT', { promptId });
    return { success: false, error: 'Insert only works in extension mode' };
  },
};

// ── Default Standards (used by web mode) — 14 comprehensive standards across 12 categories ──

const DEFAULT_STANDARDS = [
  // ─── WRITING ───
  {
    id: 'std-writing', name: 'Writing Standards', description: 'Guidelines for all writing-related prompts — blogs, emails, copy, documentation, and long-form content.', category: 'writing', scope: 'org', enforced: false,
    rules: { toneRules: ['Match brand voice', 'Be concise and clear', 'Use active voice', 'Maintain consistent tense'], doList: ['Specify target audience', 'Include desired word count or length range', 'Define the call-to-action', 'State the format (blog, email, whitepaper, etc.)', 'Provide brand voice examples if available'], dontList: ['Use placeholder text without guidance', 'Skip the context or background', 'Leave tone ambiguous', 'Mix formal and informal registers'], constraints: ['Always specify the audience', 'Include format requirements', 'Define success criteria for the output'], requiredFields: ['description', 'tone'], templateStructure: 'Audience: [who]\nFormat: [blog/email/doc/etc.]\nTone: [tone]\nLength: [word count]\nKey message: [main point]\nCTA: [desired action]', requiredTags: [], bannedWords: [], maxLength: 5000, minLength: 50 },
  },
  // ─── CODING ───
  {
    id: 'std-coding', name: 'Coding Standards', description: 'Guidelines for code generation, review, debugging, and refactoring prompts.', category: 'coding', scope: 'org', enforced: false,
    rules: { toneRules: ['Technical and precise', 'Include error handling expectations', 'Specify language and framework'], doList: ['Include the programming language', 'Specify framework and version', 'Mention coding standards to follow (e.g. ESLint, PEP8)', 'Include test requirements', 'Define input/output expectations', 'Mention performance constraints'], dontList: ['Ask for code without specifying language', 'Skip security considerations', 'Ignore edge cases', 'Request "quick and dirty" solutions for production code'], constraints: ['Must specify language', 'Include error handling guidance', 'Reference existing codebase conventions when applicable'], requiredFields: ['description'], templateStructure: 'Language: [lang]\nFramework: [framework] v[version]\nTask: [description]\nConstraints: [list]\nEdge cases: [list]\nTests: [yes/no — framework]\nSecurity: [considerations]', requiredTags: [], bannedWords: [], maxLength: 8000, minLength: 30 },
  },
  // ─── DESIGN & CREATIVE ───
  {
    id: 'std-design', name: 'Design & Creative Standards', description: 'Guidelines for design, image generation, UX copy, and creative asset prompts.', category: 'design', scope: 'org', enforced: false,
    rules: { toneRules: ['Descriptive and visual', 'Reference brand guidelines', 'Specify dimensions and format', 'Describe mood and aesthetic clearly'], doList: ['Include style references or mood board links', 'Specify color palette or brand colors', 'Define dimensions and aspect ratio', 'Mention target platform (web, mobile, print)', 'Include accessibility requirements (contrast ratios, alt text)'], dontList: ['Use vague descriptions like "make it look nice"', 'Skip brand consistency', 'Forget accessibility requirements', 'Leave output format unspecified'], constraints: ['Include visual style direction', 'Specify output format (PNG, SVG, Figma, etc.)', 'Reference brand guidelines'], requiredFields: ['description'], templateStructure: 'Asset type: [icon/banner/UI/illustration]\nDimensions: [WxH]\nStyle: [minimal/bold/corporate/playful]\nColors: [palette]\nPlatform: [web/mobile/print]\nAccessibility: [requirements]', requiredTags: [], bannedWords: [], maxLength: 3000, minLength: 20 },
  },
  // ─── CUSTOMER SUPPORT ───
  {
    id: 'std-customer', name: 'Customer Support Standards', description: 'Guidelines for customer-facing communication — support tickets, chat responses, and email replies.', category: 'support', scope: 'org', enforced: false,
    rules: { toneRules: ['Empathetic and professional', 'Solution-oriented', 'Brand-consistent', 'Patient and understanding'], doList: ['Acknowledge the customer issue first', 'Provide clear next steps', 'Use plain language, no jargon', 'Include estimated resolution timeline if applicable', 'End with a positive close'], dontList: ['Blame the customer', 'Use technical jargon', 'Make promises we cannot keep', 'Be dismissive of concerns', 'Use passive-aggressive language'], constraints: ['Keep responses under 200 words for chat', 'Always include actionable next steps', 'Personalize with customer name when available'], requiredFields: ['description', 'tone'], templateStructure: 'Channel: [email/chat/phone script]\nIssue type: [billing/technical/account/general]\nSeverity: [low/medium/high]\nCustomer sentiment: [frustrated/neutral/happy]\nResolution: [known fix/escalation/investigation]', requiredTags: [], bannedWords: ['fault', 'blame', 'impossible', 'cannot', 'you should have', 'obviously'], maxLength: 3000, minLength: 30 },
  },
  // ─── MARKETING ───
  {
    id: 'std-marketing', name: 'Marketing & Content Standards', description: 'Guidelines for marketing copy, campaigns, social media posts, ad copy, and content marketing.', category: 'marketing', scope: 'org', enforced: false,
    rules: { toneRules: ['On-brand and compelling', 'Audience-appropriate', 'Action-oriented', 'Benefit-focused over feature-focused'], doList: ['Define target persona/audience segment', 'Include campaign goals and KPIs', 'Specify platform (email, social, landing page, ad)', 'Reference brand voice guidelines', 'Include CTA and desired conversion action', 'Mention character/word limits for platform'], dontList: ['Use clickbait or misleading claims', 'Ignore platform-specific best practices', 'Skip A/B test variant instructions', 'Use competitor names without legal review'], constraints: ['Follow FTC disclosure guidelines for sponsored content', 'Include platform character limits', 'Align with current campaign messaging'], requiredFields: ['description', 'tone'], templateStructure: 'Campaign: [name]\nPlatform: [email/social/landing/ad]\nAudience: [persona]\nGoal: [awareness/conversion/retention]\nCTA: [action]\nConstraints: [character limit, compliance]', requiredTags: [], bannedWords: ['guaranteed', 'risk-free', '#1'], maxLength: 4000, minLength: 40 },
  },
  // ─── SALES ───
  {
    id: 'std-sales', name: 'Sales Communication Standards', description: 'Guidelines for sales outreach, proposals, follow-ups, and deal-related communication.', category: 'sales', scope: 'org', enforced: false,
    rules: { toneRules: ['Consultative and professional', 'Value-driven', 'Respectful of prospect time', 'Confident without being pushy'], doList: ['Include prospect context and pain points', 'Reference specific value propositions', 'Include clear next step or CTA', 'Personalize to industry/role', 'Mention relevant case studies or social proof'], dontList: ['Use high-pressure tactics', 'Make unsubstantiated claims about ROI', 'Send generic templates without personalization', 'Badmouth competitors directly'], constraints: ['Follow CAN-SPAM compliance for email', 'Include unsubscribe option for bulk outreach', 'Keep cold outreach under 150 words'], requiredFields: ['description'], templateStructure: 'Type: [cold outreach/follow-up/proposal/negotiation]\nProspect: [role, industry]\nPain point: [specific challenge]\nValue prop: [how we solve it]\nSocial proof: [case study/metric]\nCTA: [meeting/demo/trial]', requiredTags: [], bannedWords: [], maxLength: 4000, minLength: 30 },
  },
  // ─── HR & PEOPLE ───
  {
    id: 'std-hr', name: 'HR & People Standards', description: 'Guidelines for HR communications, job descriptions, onboarding materials, and internal policies.', category: 'hr', scope: 'org', enforced: false,
    rules: { toneRules: ['Inclusive and welcoming', 'Clear and jargon-free', 'Legally careful', 'Warm but professional'], doList: ['Use gender-neutral language', 'Include required legal disclaimers', 'Follow EEOC/ADA compliance guidelines', 'Specify required vs. preferred qualifications clearly', 'Include company values alignment'], dontList: ['Use gendered pronouns for unknown individuals', 'Include age-discriminatory language', 'List unrealistic job requirements', 'Use exclusionary terminology'], constraints: ['Must pass bias-check review', 'Follow local employment law requirements', 'Include diversity statement in job postings'], requiredFields: ['description'], templateStructure: 'Type: [job posting/policy/onboarding/review]\nAudience: [candidates/employees/managers]\nDepartment: [team]\nCompliance: [EEOC/ADA/local law requirements]\nTone: [tone]', requiredTags: [], bannedWords: ['rockstar', 'ninja', 'young', 'energetic', 'digital native'], maxLength: 6000, minLength: 40 },
  },
  // ─── LEGAL ───
  {
    id: 'std-legal', name: 'Legal & Compliance Standards', description: 'Guidelines for legal documents, compliance communications, contracts, and policy drafts.', category: 'legal', scope: 'org', enforced: false,
    rules: { toneRules: ['Precise and unambiguous', 'Formal', 'Jurisdiction-aware', 'Conservative in scope'], doList: ['Specify jurisdiction and applicable law', 'Include definitions for key terms', 'Reference relevant regulations or statutes', 'Include standard legal disclaimers', 'Flag areas requiring attorney review'], dontList: ['Provide actual legal advice (always disclaim)', 'Use ambiguous language', 'Skip jurisdiction specification', 'Omit effective dates or version numbers'], constraints: ['All outputs must include "This is not legal advice" disclaimer', 'Must specify governing law', 'Flag sections requiring human legal review'], requiredFields: ['description'], templateStructure: 'Document type: [contract/policy/notice/terms]\nJurisdiction: [state/country]\nParties: [who is involved]\nKey terms: [definitions needed]\nRegulations: [GDPR/CCPA/SOX/etc.]\nReview flag: [sections needing attorney review]', requiredTags: [], bannedWords: [], maxLength: 10000, minLength: 50 },
  },
  // ─── EXECUTIVE ───
  {
    id: 'std-executive', name: 'Executive Communication Standards', description: 'Guidelines for C-suite communications, board presentations, investor updates, and strategic documents.', category: 'executive', scope: 'org', enforced: false,
    rules: { toneRules: ['Strategic and forward-looking', 'Data-driven', 'Concise — executives are time-poor', 'Confident and decisive'], doList: ['Lead with the key insight or decision needed', 'Include supporting data and metrics', 'Provide clear recommendations', 'Specify the ask or decision required', 'Include timeline and resource implications'], dontList: ['Bury the lead with excessive background', 'Present problems without solutions', 'Use operational jargon in board communications', 'Include unverified metrics'], constraints: ['Executive summaries under 250 words', 'Include data visualization recommendations', 'Always state the desired outcome up front'], requiredFields: ['description'], templateStructure: 'Type: [board update/investor memo/strategy brief/all-hands]\nAudience: [board/investors/leadership/all-company]\nKey message: [one sentence]\nData points: [metrics to include]\nDecision needed: [yes/no — what]\nTimeline: [urgency]', requiredTags: [], bannedWords: [], maxLength: 5000, minLength: 40 },
  },
  // ─── DATA & ANALYTICS ───
  {
    id: 'std-data', name: 'Data & Analytics Standards', description: 'Guidelines for data analysis prompts, SQL queries, reporting, and data visualization requests.', category: 'data', scope: 'org', enforced: false,
    rules: { toneRules: ['Analytical and precise', 'Specify expected output format', 'Include data context'], doList: ['Specify the database/tool being used', 'Include table and column names', 'Define expected output format (table, chart, narrative)', 'Include date ranges and filters', 'Specify aggregation level (daily, weekly, by-segment)'], dontList: ['Skip data source specification', 'Request analysis without defining the metric', 'Forget to mention data quality considerations', 'Omit date range constraints'], constraints: ['Always specify the data source', 'Include sample size or scope expectations', 'Define how to handle null/missing values'], requiredFields: ['description'], templateStructure: 'Tool: [SQL/Python/Excel/BI tool]\nData source: [table/API/file]\nMetric: [what to measure]\nDimensions: [how to slice]\nDate range: [period]\nOutput: [table/chart/narrative]\nFilters: [conditions]', requiredTags: [], bannedWords: [], maxLength: 6000, minLength: 30 },
  },
  // ─── PRODUCT ───
  {
    id: 'std-product', name: 'Product Management Standards', description: 'Guidelines for PRDs, feature specs, user stories, and product communication prompts.', category: 'product', scope: 'org', enforced: false,
    rules: { toneRules: ['User-centric', 'Outcome-oriented', 'Clear acceptance criteria', 'Measurable success metrics'], doList: ['Define the user problem being solved', 'Include user personas', 'Specify acceptance criteria', 'Reference competitive landscape', 'Include success metrics and KPIs', 'Define scope (in/out)'], dontList: ['Skip user research context', 'Define solutions without stating the problem', 'Forget edge cases and error states', 'Omit prioritization rationale'], constraints: ['Must include "Problem" and "Success Metrics" sections', 'Reference user research or data when available', 'Include scope boundaries'], requiredFields: ['description'], templateStructure: 'Feature: [name]\nProblem: [user pain point]\nPersona: [target user]\nScope: [in-scope / out-of-scope]\nAcceptance criteria: [list]\nSuccess metrics: [KPIs]\nDependencies: [teams/systems]\nTimeline: [target quarter]', requiredTags: [], bannedWords: [], maxLength: 8000, minLength: 40 },
  },
  // ─── RESEARCH & STRATEGY ───
  {
    id: 'std-research', name: 'Research & Strategy Standards', description: 'Guidelines for market research, competitive analysis, strategic planning, and user research prompts.', category: 'general', scope: 'org', enforced: false,
    rules: { toneRules: ['Objective and evidence-based', 'Structured and methodical', 'Distinguish between facts and assumptions'], doList: ['Define the research question clearly', 'Specify methodology expectations', 'Include scope and limitations', 'Request source citations where applicable', 'Define the decision this research will inform'], dontList: ['Accept unverified claims as facts', 'Skip competitive context', 'Provide conclusions without supporting evidence', 'Rely on single data sources'], constraints: ['Must state the core research question', 'Include methodology or approach', 'Separate findings from recommendations'], requiredFields: ['description'], templateStructure: 'Research question: [what are we trying to learn?]\nMethodology: [desk research/interviews/survey/analysis]\nScope: [market/competitor/user/technology]\nDecision: [what will this inform?]\nTimeline: [when needed]\nFormat: [report/presentation/brief]', requiredTags: [], bannedWords: [], maxLength: 6000, minLength: 40 },
  },
  // ─── TRAINING & EDUCATION ───
  {
    id: 'std-training', name: 'Training & Education Standards', description: 'Guidelines for training materials, onboarding guides, tutorials, and educational content prompts.', category: 'general', scope: 'org', enforced: false,
    rules: { toneRules: ['Clear and approachable', 'Progressive in complexity', 'Encouraging', 'Practical with real examples'], doList: ['Define the learning objective', 'Specify the audience skill level (beginner/intermediate/advanced)', 'Include practical exercises or examples', 'Structure content in logical progression', 'Include assessment or quiz questions where relevant'], dontList: ['Assume prior knowledge without stating prerequisites', 'Overload with theory before practice', 'Skip recap or summary sections', 'Use unexplained acronyms'], constraints: ['Must state learning objectives up front', 'Include at least one practical example', 'End with a summary or key takeaways section'], requiredFields: ['description'], templateStructure: 'Topic: [subject]\nAudience: [role, skill level]\nLearning objectives: [what they will be able to do]\nFormat: [guide/video script/workshop/quiz]\nPrerequisites: [assumed knowledge]\nDuration: [time to complete]', requiredTags: [], bannedWords: [], maxLength: 8000, minLength: 40 },
  },
  // ─── INTERNAL COMMUNICATIONS ───
  {
    id: 'std-internal-comms', name: 'Internal Communications Standards', description: 'Guidelines for company-wide announcements, team updates, Slack messages, and internal memos.', category: 'general', scope: 'org', enforced: false,
    rules: { toneRules: ['Transparent and honest', 'Inclusive', 'Timely', 'Aligned with company values'], doList: ['Lead with the most important information', 'Include context for why changes matter', 'Specify action items clearly', 'Consider how different audiences will receive the message', 'Include FAQ or anticipated questions'], dontList: ['Use corporate doublespeak', 'Bury bad news in jargon', 'Forget to mention impact on specific teams', 'Send without leadership alignment on sensitive topics'], constraints: ['Include "What this means for you" section for policy changes', 'Specify action items with owners and deadlines', 'Consider multi-timezone audience for timing'], requiredFields: ['description'], templateStructure: 'Type: [announcement/update/policy change/celebration]\nAudience: [all-company/department/leadership]\nKey message: [one sentence]\nContext: [why now]\nAction items: [what people need to do]\nFAQ: [anticipated questions]', requiredTags: [], bannedWords: [], maxLength: 4000, minLength: 30 },
  },
];
