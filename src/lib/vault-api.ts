import { createClient } from "@/lib/supabase/client";
import { DEFAULT_GUIDELINES, PLAN_LIMITS } from "@/lib/constants";
import { getLibraryPack } from "@/lib/library/packs";
import { DEFAULT_SECURITY_RULES } from "@/lib/security/default-rules";
import { extractTemplateVariables, normalizeVariables } from "@/lib/variables";
import type {
  Prompt,
  PromptStatus,
  Folder,
  Team,
  Collection,
  Guideline,
  Organization,
  PromptTone,
  UserRole,
  ValidationResult,
  Analytics,
  ExportPack,
  ConversationLog,
} from "@/lib/types";

function supabase() {
  return createClient();
}

async function getOrgId(): Promise<string | null> {
  const db = supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  return data?.org_id || null;
}

async function getUserId(): Promise<string | null> {
  const db = supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user?.id || null;
}

// ─── Status Helpers ───

export function getDefaultStatus(
  role: UserRole,
  requestedStatus?: PromptStatus
): PromptStatus {
  const canApprove = role === "admin" || role === "manager";

  if (!requestedStatus) {
    return canApprove ? "approved" : "draft";
  }

  // Members cannot directly set "approved" or "archived"
  if (!canApprove && (requestedStatus === "approved" || requestedStatus === "archived")) {
    return "pending";
  }

  return requestedStatus;
}

// ─── Prompts ───

export async function getPrompts(
  query?: string,
  filters?: {
    folderId?: string;
    teamId?: string;
    favoritesOnly?: boolean;
    sort?: "recent" | "popular" | "alpha" | "rating";
  }
): Promise<Prompt[]> {
  const orgId = await getOrgId();
  if (!orgId) return [];

  let q = supabase().from("prompts").select("*").eq("org_id", orgId);

  if (filters?.folderId) q = q.eq("folder_id", filters.folderId);
  if (filters?.teamId) q = q.eq("department_id", filters.teamId);
  if (filters?.favoritesOnly) q = q.eq("is_favorite", true);

  switch (filters?.sort) {
    case "popular":
      q = q.order("usage_count", { ascending: false });
      break;
    case "alpha":
      q = q.order("title", { ascending: true });
      break;
    case "rating":
      q = q.order("rating_total", { ascending: false });
      break;
    default:
      q = q.order("updated_at", { ascending: false });
  }

  const { data } = await q;
  let prompts = data || [];

  if (query) {
    const lower = query.toLowerCase();
    prompts = prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.content.toLowerCase().includes(lower) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(lower))
    );
  }

  return prompts;
}

export async function createPrompt(
  fields: Partial<Prompt>
): Promise<Prompt | null> {
  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId || !userId) return null;

  const contentStr = fields.content || "";
  const autoIsTemplate = fields.is_template ?? extractTemplateVariables(contentStr).length > 0;

  const { data, error } = await supabase()
    .from("prompts")
    .insert({
      org_id: orgId,
      owner_id: userId,
      title: fields.title || "",
      content: contentStr,
      description: fields.description || null,
      intended_outcome: fields.intended_outcome || null,
      tone: (fields.tone as PromptTone) || "professional",
      model_recommendation: fields.model_recommendation || null,
      example_input: fields.example_input || null,
      example_output: fields.example_output || null,
      tags: fields.tags || [],
      folder_id: fields.folder_id || null,
      department_id: fields.department_id || null,
      status: fields.status || "draft",
      version: 1,
      is_template: autoIsTemplate,
      template_variables: fields.template_variables || [],
    })
    .select()
    .single();

  if (error) console.error("Create prompt error:", error);
  return data;
}

export async function updatePrompt(
  id: string,
  fields: Partial<Prompt>
): Promise<Prompt | null> {
  const db = supabase();

  // Get current version for version history
  const { data: current } = await db
    .from("prompts")
    .select("version, title, content")
    .eq("id", id)
    .single();

  const newVersion = (current?.version || 0) + 1;

  // Save version history if title or content changed
  if (
    current &&
    (fields.title !== undefined || fields.content !== undefined)
  ) {
    await db.from("prompt_versions").insert({
      prompt_id: id,
      version: current.version,
      title: current.title,
      content: current.content,
    });
  }

  const updateData: Record<string, unknown> = { version: newVersion };
  if (fields.title !== undefined) updateData.title = fields.title;
  if (fields.content !== undefined) updateData.content = fields.content;
  if (fields.description !== undefined) updateData.description = fields.description;
  if (fields.intended_outcome !== undefined) updateData.intended_outcome = fields.intended_outcome;
  if (fields.tone !== undefined) updateData.tone = fields.tone;
  if (fields.model_recommendation !== undefined) updateData.model_recommendation = fields.model_recommendation;
  if (fields.example_input !== undefined) updateData.example_input = fields.example_input;
  if (fields.example_output !== undefined) updateData.example_output = fields.example_output;
  if (fields.tags !== undefined) updateData.tags = fields.tags;
  if (fields.folder_id !== undefined) updateData.folder_id = fields.folder_id;
  if (fields.department_id !== undefined) updateData.department_id = fields.department_id;
  if (fields.status !== undefined) updateData.status = fields.status;
  if (fields.is_favorite !== undefined) updateData.is_favorite = fields.is_favorite;
  if (fields.is_template !== undefined) updateData.is_template = fields.is_template;
  if (fields.template_variables !== undefined) updateData.template_variables = fields.template_variables;

  const { data, error } = await db
    .from("prompts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) console.error("Update prompt error:", error);
  return data;
}

export async function deletePrompt(id: string): Promise<boolean> {
  const { error } = await supabase().from("prompts").delete().eq("id", id);
  return !error;
}

export async function duplicatePrompt(id: string): Promise<Prompt | null> {
  const { data: original } = await supabase()
    .from("prompts")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) return null;

  return createPrompt({
    ...original,
    title: `${original.title} (copy)`,
    status: "draft",
    usage_count: 0,
    rating_total: 0,
    rating_count: 0,
    is_favorite: false,
  });
}

export async function recordUsage(id: string): Promise<void> {
  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId || !userId) return;

  const db = supabase();
  const { error: rpcError } = await db.rpc("increment_usage_count", { prompt_id: id });
  if (rpcError) {
    // Fallback: fetch current count and increment
    const { data: current } = await db.from("prompts").select("usage_count").eq("id", id).single();
    await db.from("prompts")
      .update({ usage_count: (current?.usage_count || 0) + 1, last_used_at: new Date().toISOString() })
      .eq("id", id);
  }

  await db.from("usage_events").insert({
    org_id: orgId,
    user_id: userId,
    prompt_id: id,
    action: "use",
  });
}

export async function toggleFavorite(id: string, current: boolean): Promise<boolean> {
  const { error } = await supabase()
    .from("prompts")
    .update({ is_favorite: !current })
    .eq("id", id);
  return !error;
}

export async function getPromptVersions(promptId: string) {
  const { data } = await supabase()
    .from("prompt_versions")
    .select("*")
    .eq("prompt_id", promptId)
    .order("version", { ascending: false })
    .limit(10);
  return data || [];
}

// ─── Folders ───

export async function saveFolderApi(folder: Partial<Folder>): Promise<Folder | null> {
  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId) return null;

  if (folder.id) {
    const { data } = await supabase()
      .from("folders")
      .update({ name: folder.name, icon: folder.icon, color: folder.color })
      .eq("id", folder.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase()
    .from("folders")
    .insert({ org_id: orgId, name: folder.name || "", icon: folder.icon, color: folder.color, created_by: userId! })
    .select()
    .single();
  return data;
}

export async function deleteFolderApi(id: string): Promise<boolean> {
  const { error } = await supabase().from("folders").delete().eq("id", id);
  return !error;
}

// ─── Teams ───

export async function saveTeamApi(team: Partial<Team>): Promise<Team | null> {
  const orgId = await getOrgId();
  if (!orgId) return null;

  if (team.id) {
    const { data } = await supabase()
      .from("teams")
      .update({ name: team.name, description: team.description })
      .eq("id", team.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase()
    .from("teams")
    .insert({ org_id: orgId, name: team.name || "", description: team.description })
    .select()
    .single();
  return data;
}

export async function deleteTeamApi(id: string): Promise<boolean> {
  const { error } = await supabase().from("teams").delete().eq("id", id);
  return !error;
}

// ─── Collections ───

export async function saveCollectionApi(
  coll: Partial<Collection> & { promptIds?: string[] }
): Promise<Collection | null> {
  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId) return null;
  const db = supabase();

  let collId = coll.id;

  if (collId) {
    await db
      .from("collections")
      .update({
        name: coll.name,
        description: coll.description,
        visibility: coll.visibility,
        team_id: coll.team_id,
      })
      .eq("id", collId);
  } else {
    const { data } = await db
      .from("collections")
      .insert({
        org_id: orgId,
        name: coll.name || "",
        description: coll.description,
        visibility: coll.visibility || "org",
        team_id: coll.team_id || null,
        created_by: userId!,
      })
      .select()
      .single();
    if (!data) return null;
    collId = data.id;
  }

  // Sync prompt associations
  if (coll.promptIds !== undefined) {
    await db.from("collection_prompts").delete().eq("collection_id", collId);
    if (coll.promptIds.length > 0) {
      await db.from("collection_prompts").insert(
        coll.promptIds.map((pid) => ({
          collection_id: collId!,
          prompt_id: pid,
        }))
      );
    }
  }

  const { data: result } = await db
    .from("collections")
    .select("*")
    .eq("id", collId)
    .single();

  return result ? { ...result, promptIds: coll.promptIds || [] } : null;
}

export async function deleteCollectionApi(id: string): Promise<boolean> {
  const { error } = await supabase().from("collections").delete().eq("id", id);
  return !error;
}

// ─── Guidelines (formerly Standards) ───

export async function saveGuidelineApi(std: Partial<Guideline>): Promise<Guideline | null> {
  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId) return null;

  if (std.id) {
    const { data } = await supabase()
      .from("standards")
      .update({
        name: std.name,
        description: std.description,
        category: std.category,
        rules: std.rules,
        enforced: std.enforced,
      })
      .eq("id", std.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase()
    .from("standards")
    .insert({
      org_id: orgId,
      name: std.name || "",
      description: std.description,
      category: std.category,
      scope: "org",
      rules: std.rules || {},
      enforced: std.enforced ?? false,
      created_by: userId!,
    })
    .select()
    .single();
  return data;
}

export async function deleteGuidelineApi(id: string): Promise<boolean> {
  const { error } = await supabase().from("standards").delete().eq("id", id);
  return !error;
}

export async function installDefaultGuidelines(): Promise<Guideline[]> {
  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId || !userId) return [];

  const inserts = DEFAULT_GUIDELINES.map((s) => ({
    org_id: orgId,
    name: s.name,
    description: s.description,
    category: s.category,
    scope: "org" as const,
    rules: s.rules,
    enforced: false,
    created_by: userId,
  }));

  const { data } = await supabase()
    .from("standards")
    .insert(inserts)
    .select();
  return data || [];
}

// Keep backward-compatible aliases
export const saveStandardApi = saveGuidelineApi;
export const deleteStandardApi = deleteGuidelineApi;
export const installDefaultStandards = installDefaultGuidelines;

// ─── Validation ───

export function validatePrompt(
  prompt: Partial<Prompt>,
  guidelines: Guideline[]
): ValidationResult {
  const violations: ValidationResult["violations"] = [];
  const enforced = guidelines.filter((s) => s.enforced);

  for (const g of enforced) {
    const rules = g.rules || {};

    if (rules.minLength && (prompt.content?.length || 0) < rules.minLength) {
      violations.push({
        guideline: g.name,
        rule: "minLength",
        message: `Content must be at least ${rules.minLength} characters`,
      });
    }

    if (rules.maxLength && (prompt.content?.length || 0) > rules.maxLength) {
      violations.push({
        guideline: g.name,
        rule: "maxLength",
        message: `Content must not exceed ${rules.maxLength} characters`,
      });
    }

    if (rules.requiredFields) {
      for (const field of rules.requiredFields) {
        if (!prompt[field as keyof Prompt]) {
          violations.push({
            guideline: g.name,
            rule: "requiredFields",
            message: `Field "${field}" is required`,
          });
        }
      }
    }

    if (rules.requiredTags && rules.requiredTags.length > 0) {
      const tags = prompt.tags || [];
      for (const tag of rules.requiredTags) {
        if (!tags.includes(tag)) {
          violations.push({
            guideline: g.name,
            rule: "requiredTags",
            message: `Tag "${tag}" is required`,
          });
        }
      }
    }

    if (rules.bannedWords && prompt.content) {
      const lower = prompt.content.toLowerCase();
      for (const word of rules.bannedWords) {
        if (lower.includes(word.toLowerCase())) {
          violations.push({
            guideline: g.name,
            rule: "bannedWords",
            message: `Content contains banned word: "${word}"`,
          });
        }
      }
    }
  }

  return { passed: violations.length === 0, violations };
}

// ─── Organization ───

export async function saveOrg(
  org: Partial<Organization>
): Promise<Organization | null> {
  const orgId = await getOrgId();
  if (!orgId) return null;

  const { data } = await supabase()
    .from("organizations")
    .update({
      name: org.name,
      domain: org.domain,
      settings: org.settings,
    })
    .eq("id", orgId)
    .select()
    .single();
  return data;
}

// ─── Profile ───

export async function updateProfile(fields: { name?: string }): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const db = supabase();
  const { error } = await db
    .from("profiles")
    .update({ name: fields.name, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return false;
  // Keep Supabase Auth metadata in sync with profiles table
  if (fields.name !== undefined) {
    await db.auth.updateUser({ data: { name: fields.name } });
  }
  return true;
}

// ─── Members ───

export async function updateMemberRole(
  memberId: string,
  role: string
): Promise<boolean> {
  const { error } = await supabase()
    .from("profiles")
    .update({ role })
    .eq("id", memberId);
  return !error;
}

export async function removeMember(memberId: string): Promise<boolean> {
  const db = supabase();

  // Remove from all teams first (I-05 fix)
  await db.from("team_members").delete().eq("user_id", memberId);

  const { error } = await db
    .from("profiles")
    .update({ org_id: null })
    .eq("id", memberId);
  return !error;
}

// ─── Invites ───

export async function getInvites() {
  const orgId = await getOrgId();
  if (!orgId) return [];

  const { data } = await supabase()
    .from("invites")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function revokeInvite(id: string): Promise<boolean> {
  const { error } = await supabase()
    .from("invites")
    .update({ status: "revoked" })
    .eq("id", id);
  return !error;
}

export async function sendInvite(email: string, role: string, teamId?: string): Promise<{ success: boolean; error?: string }> {
  const db = supabase();
  const {
    data: { session },
  } = await db.auth.getSession();

  if (!session) return { success: false, error: "Not authenticated" };

  const res = await fetch("/api/invite/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ email, role, team_id: teamId || null }),
  });

  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return { success: true };
}

// ─── Team Members ───

export async function addTeamMember(teamId: string, userId: string, role: string = "member"): Promise<boolean> {
  const { error } = await supabase()
    .from("team_members")
    .insert({ team_id: teamId, user_id: userId, role });
  return !error;
}

export async function removeTeamMember(teamId: string, userId: string): Promise<boolean> {
  const { error } = await supabase()
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);
  return !error;
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: string): Promise<boolean> {
  const { error } = await supabase()
    .from("team_members")
    .update({ role })
    .eq("team_id", teamId)
    .eq("user_id", userId);
  return !error;
}

// ─── Analytics ───

export async function getAnalytics(): Promise<Analytics | null> {
  const orgId = await getOrgId();
  if (!orgId) return null;

  const db = supabase();

  let violationsRes: { data: { id: string }[] | null; error: unknown } = { data: [], error: null };

  const [promptsRes, eventsRes] = await Promise.all([
    db.from("prompts").select("*").eq("org_id", orgId),
    db
      .from("usage_events")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  // Fetch violations separately to handle missing table gracefully
  try {
    violationsRes = await db
      .from("security_violations")
      .select("id")
      .eq("org_id", orgId);
  } catch {
    // Table may not exist yet
  }

  const prompts = promptsRes.data || [];
  const events = eventsRes.data || [];

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const weekEvents = events.filter(
    (e) => new Date(e.created_at) > oneWeekAgo
  );
  const lastWeekEvents = events.filter(
    (e) => {
      const d = new Date(e.created_at);
      return d > twoWeeksAgo && d <= oneWeekAgo;
    }
  );

  const totalRating = prompts.reduce((sum, p) => sum + (p.rating_total || 0), 0);
  const ratingCount = prompts.reduce((sum, p) => sum + (p.rating_count || 0), 0);

  const teamUsage: Record<string, number> = {};
  for (const p of prompts) {
    if (p.department_id) {
      teamUsage[p.department_id] =
        (teamUsage[p.department_id] || 0) + (p.usage_count || 0);
    }
  }

  const topPrompts = [...prompts]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 10);

  // Daily usage for last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentEvents = events.filter((e) => new Date(e.created_at) > thirtyDaysAgo);
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().split("T")[0]] = 0;
  }
  for (const e of recentEvents) {
    const day = new Date(e.created_at).toISOString().split("T")[0];
    if (dailyMap[day] !== undefined) dailyMap[day]++;
  }
  const dailyUsage = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Per-user usage
  const userMap: Record<string, number> = {};
  for (const e of events) {
    userMap[e.user_id] = (userMap[e.user_id] || 0) + 1;
  }

  // Resolve user names
  const userIds = Object.keys(userMap);
  let userUsage: { userId: string; name: string; count: number }[] = [];
  if (userIds.length > 0) {
    const { data: profiles } = await db
      .from("profiles")
      .select("id, name, email")
      .in("id", userIds);
    const nameMap = new Map((profiles || []).map((p) => [p.id, p.name || p.email]));
    userUsage = Object.entries(userMap)
      .map(([userId, count]) => ({
        userId,
        name: nameMap.get(userId) || "Unknown",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  const templateCount = prompts.filter((p) => p.is_template).length;
  const guardrailBlocks = (violationsRes.data || []).length;

  return {
    totalPrompts: prompts.length,
    totalUses: prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0),
    avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
    usesThisWeek: weekEvents.length,
    usesLastWeek: lastWeekEvents.length,
    topPrompts,
    teamUsage,
    dailyUsage,
    userUsage,
    templateCount,
    guardrailBlocks,
  };
}

// ─── Conversation Logs ───

export async function getConversationLogs(
  options?: { limit?: number; offset?: number; aiTool?: string }
): Promise<{ logs: ConversationLog[]; total: number }> {
  const orgId = await getOrgId();
  if (!orgId) return { logs: [], total: 0 };

  const db = supabase();
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  let q = db
    .from("conversation_logs")
    .select("*", { count: "exact" })
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.aiTool) {
    q = q.eq("ai_tool", options.aiTool);
  }

  const { data, count, error } = await q;
  if (error) console.error("Conversation logs error:", error);

  return { logs: data || [], total: count || 0 };
}

export async function getAiToolBreakdown(): Promise<{ tool: string; count: number }[]> {
  const orgId = await getOrgId();
  if (!orgId) return [];

  const db = supabase();
  const { data } = await db
    .from("conversation_logs")
    .select("ai_tool")
    .eq("org_id", orgId);

  const toolMap: Record<string, number> = {};
  for (const row of data || []) {
    toolMap[row.ai_tool] = (toolMap[row.ai_tool] || 0) + 1;
  }

  return Object.entries(toolMap)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Ratings ───

export async function ratePrompt(
  promptId: string,
  rating: number
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;

  const db = supabase();

  // Upsert user's rating
  const { error: upsertError } = await db
    .from("prompt_ratings")
    .upsert(
      { prompt_id: promptId, user_id: userId, rating },
      { onConflict: "prompt_id,user_id" }
    );

  if (upsertError) {
    console.error("Rate prompt error:", upsertError);
    return false;
  }

  // Recalculate aggregate on prompts row
  const { data: agg } = await db
    .from("prompt_ratings")
    .select("rating")
    .eq("prompt_id", promptId);

  if (agg) {
    const total = agg.reduce((sum, r) => sum + r.rating, 0);
    const count = agg.length;
    await db
      .from("prompts")
      .update({ rating_total: total, rating_count: count })
      .eq("id", promptId);
  }

  return true;
}

export async function getUserRatingsForOrg(): Promise<Record<string, number>> {
  const userId = await getUserId();
  const orgId = await getOrgId();
  if (!userId || !orgId) return {};

  const db = supabase();
  const { data } = await db
    .from("prompt_ratings")
    .select("prompt_id, rating")
    .eq("user_id", userId);

  const map: Record<string, number> = {};
  for (const row of data || []) {
    map[row.prompt_id] = row.rating;
  }
  return map;
}

// ─── Import / Export ───

export async function exportPack(
  promptIds: string[],
  packName: string
): Promise<ExportPack> {
  const db = supabase();
  const orgId = await getOrgId();

  const { data: prompts } = await db
    .from("prompts")
    .select("*")
    .in("id", promptIds);

  if (!orgId) return { format: "teamprompt-pack", version: "1.0", name: packName, exported_at: new Date().toISOString(), prompts: [], folders: [] };

  const { data: folders } = await db
    .from("folders")
    .select("*")
    .eq("org_id", orgId);

  return {
    format: "teamprompt-pack",
    version: "1.0",
    name: packName,
    exported_at: new Date().toISOString(),
    prompts: prompts || [],
    folders: folders || [],
  };
}

export async function importPack(
  pack: ExportPack
): Promise<{ imported: number; errors: string[] }> {
  if (pack.format !== "teamprompt-pack" || pack.version !== "1.0") {
    return { imported: 0, errors: ["Invalid pack format"] };
  }

  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId || !userId) return { imported: 0, errors: ["Not authenticated"] };

  const db = supabase();
  let imported = 0;
  const errors: string[] = [];

  for (const prompt of pack.prompts) {
    const importContent = prompt.content || "";
    const importIsTemplate = prompt.is_template ?? extractTemplateVariables(importContent).length > 0;
    const { error } = await db.from("prompts").insert({
      org_id: orgId,
      owner_id: userId,
      title: prompt.title,
      content: importContent,
      description: prompt.description,
      intended_outcome: prompt.intended_outcome,
      tone: prompt.tone || "professional",
      model_recommendation: prompt.model_recommendation,
      example_input: prompt.example_input,
      example_output: prompt.example_output,
      tags: prompt.tags || [],
      status: "draft",
      version: 1,
      is_template: importIsTemplate,
      template_variables: normalizeVariables(prompt.template_variables),
    });

    if (error) {
      errors.push(`Failed to import "${prompt.title}": ${error.message}`);
    } else {
      imported++;
    }
  }

  return { imported, errors };
}

// ─── Library Pack Install ───

export interface InstallPackResult {
  promptsCreated: number;
  guidelinesCreated: number;
  rulesCreated: number;
  error?: string;
}

export async function installLibraryPack(
  packId: string
): Promise<InstallPackResult> {
  const pack = getLibraryPack(packId);
  if (!pack) return { promptsCreated: 0, guidelinesCreated: 0, rulesCreated: 0, error: "Pack not found" };

  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId || !userId) return { promptsCreated: 0, guidelinesCreated: 0, rulesCreated: 0, error: "Not authenticated" };

  const db = supabase();

  // Check current counts for plan limits
  const [{ count: promptCount }, { count: guidelineCount }] = await Promise.all([
    db.from("prompts").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    db.from("standards").select("*", { count: "exact", head: true }).eq("org_id", orgId),
  ]);

  // Get org plan limits
  const { data: orgData } = await db
    .from("organizations")
    .select("plan")
    .eq("id", orgId)
    .single();

  const plan = orgData?.plan || "free";
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

  // Check prompt limits
  const currentPrompts = promptCount || 0;
  if (limits.max_prompts !== -1 && currentPrompts + pack.prompts.length > limits.max_prompts) {
    return {
      promptsCreated: 0,
      guidelinesCreated: 0,
      rulesCreated: 0,
      error: `Adding ${pack.prompts.length} prompts would exceed your plan limit of ${limits.max_prompts}. You currently have ${currentPrompts}.`,
    };
  }

  // Check guideline limits
  const currentGuidelines = guidelineCount || 0;
  if (limits.max_guidelines !== -1 && currentGuidelines + pack.guidelines.length > limits.max_guidelines) {
    return {
      promptsCreated: 0,
      guidelinesCreated: 0,
      rulesCreated: 0,
      error: `Adding ${pack.guidelines.length} guidelines would exceed your plan limit of ${limits.max_guidelines}. You currently have ${currentGuidelines}.`,
    };
  }

  let promptsCreated = 0;
  let guidelinesCreated = 0;
  let rulesCreated = 0;

  // 1. Insert prompts
  const promptInserts = pack.prompts.map((p) => {
    const packContent = p.content || "";
    const packIsTemplate = p.is_template ?? extractTemplateVariables(packContent).length > 0;
    return {
      org_id: orgId,
      owner_id: userId,
      title: p.title,
      content: packContent,
      description: p.description,
      tags: p.tags,
      tone: p.tone,
      status: "approved" as const,
      version: 1,
      is_template: packIsTemplate,
      template_variables: normalizeVariables(p.template_variables),
    };
  });

  const { data: insertedPrompts } = await db
    .from("prompts")
    .insert(promptInserts)
    .select("id");

  promptsCreated = insertedPrompts?.length || 0;

  // 2. Create a collection named after the pack
  if (insertedPrompts && insertedPrompts.length > 0) {
    const { data: collection } = await db
      .from("collections")
      .insert({
        org_id: orgId,
        name: pack.name,
        description: pack.description,
        visibility: "org",
        created_by: userId,
      })
      .select("id")
      .single();

    if (collection) {
      await db.from("collection_prompts").insert(
        insertedPrompts.map((p) => ({
          collection_id: collection.id,
          prompt_id: p.id,
        }))
      );
    }
  }

  // 3. Insert guidelines
  for (const g of pack.guidelines) {
    const defaultGuideline = DEFAULT_GUIDELINES.find((dg) => dg.id === g.id);
    if (!defaultGuideline) continue;

    const { error } = await db.from("standards").insert({
      org_id: orgId,
      name: defaultGuideline.name,
      description: defaultGuideline.description,
      category: defaultGuideline.category,
      scope: "org",
      rules: defaultGuideline.rules,
      enforced: false,
      created_by: userId,
    });

    if (!error) guidelinesCreated++;
  }

  // 4. Insert guardrail rules (if pack has categories and org has custom_security access)
  if (pack.guardrailCategories && pack.guardrailCategories.length > 0) {
    const hasAccess = limits.basic_security || limits.custom_security;
    if (hasAccess) {
      const rulesToInstall = DEFAULT_SECURITY_RULES.filter(
        (r) => pack.guardrailCategories!.includes(r.category) && r.is_active
      );

      // Check which rules already exist to avoid duplicates
      const { data: existingRules } = await db
        .from("security_rules")
        .select("name")
        .eq("org_id", orgId);

      const existingNames = new Set((existingRules || []).map((r) => r.name));
      const newRules = rulesToInstall.filter((r) => !existingNames.has(r.name));

      if (newRules.length > 0) {
        const { data: insertedRules } = await db
          .from("security_rules")
          .insert(
            newRules.map((r) => ({
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
          )
          .select("id");

        rulesCreated = insertedRules?.length || 0;
      }
    }
  }

  return { promptsCreated, guidelinesCreated, rulesCreated };
}
