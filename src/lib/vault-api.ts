import { createClient } from "@/lib/supabase/client";
import { DEFAULT_GUIDELINES } from "@/lib/constants";
import type {
  Prompt,
  Folder,
  Department,
  Team,
  Collection,
  Guideline,
  Organization,
  PromptTone,
  ValidationResult,
  Analytics,
  ExportPack,
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

// ─── Prompts ───

export async function getPrompts(
  query?: string,
  filters?: {
    folderId?: string;
    departmentId?: string;
    favoritesOnly?: boolean;
    sort?: "recent" | "popular" | "alpha" | "rating";
  }
): Promise<Prompt[]> {
  const orgId = await getOrgId();
  if (!orgId) return [];

  let q = supabase().from("prompts").select("*").eq("org_id", orgId);

  if (filters?.folderId) q = q.eq("folder_id", filters.folderId);
  if (filters?.departmentId) q = q.eq("department_id", filters.departmentId);
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

  const { data, error } = await supabase()
    .from("prompts")
    .insert({
      org_id: orgId,
      owner_id: userId,
      title: fields.title || "",
      content: fields.content || "",
      description: fields.description || null,
      intended_outcome: fields.intended_outcome || null,
      tone: (fields.tone as PromptTone) || "professional",
      model_recommendation: fields.model_recommendation || null,
      example_input: fields.example_input || null,
      example_output: fields.example_output || null,
      tags: fields.tags || [],
      folder_id: fields.folder_id || null,
      department_id: fields.department_id || null,
      status: fields.status || "approved",
      version: 1,
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

// ─── Departments ───

export async function saveDepartmentApi(dept: Partial<Department>): Promise<Department | null> {
  const orgId = await getOrgId();
  if (!orgId) return null;

  if (dept.id) {
    const { data } = await supabase()
      .from("departments")
      .update({ name: dept.name })
      .eq("id", dept.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase()
    .from("departments")
    .insert({ org_id: orgId, name: dept.name || "" })
    .select()
    .single();
  return data;
}

export async function deleteDepartmentApi(id: string): Promise<boolean> {
  const { error } = await supabase().from("departments").delete().eq("id", id);
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
  const { error } = await supabase()
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

  const [promptsRes, eventsRes] = await Promise.all([
    db.from("prompts").select("*").eq("org_id", orgId),
    db
      .from("usage_events")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const prompts = promptsRes.data || [];
  const events = eventsRes.data || [];

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekEvents = events.filter(
    (e) => new Date(e.created_at) > oneWeekAgo
  );

  const totalRating = prompts.reduce((sum, p) => sum + (p.rating_total || 0), 0);
  const ratingCount = prompts.reduce((sum, p) => sum + (p.rating_count || 0), 0);

  const departmentUsage: Record<string, number> = {};
  for (const p of prompts) {
    if (p.department_id) {
      departmentUsage[p.department_id] =
        (departmentUsage[p.department_id] || 0) + (p.usage_count || 0);
    }
  }

  const topPrompts = [...prompts]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 10);

  return {
    totalPrompts: prompts.length,
    totalUses: prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0),
    avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
    usesThisWeek: weekEvents.length,
    topPrompts,
    departmentUsage,
  };
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

  const { data: folders } = await db
    .from("folders")
    .select("*")
    .eq("org_id", orgId!);

  const { data: departments } = await db
    .from("departments")
    .select("*")
    .eq("org_id", orgId!);

  return {
    format: "contextiq-prompt-pack",
    version: "1.0",
    name: packName,
    exported_at: new Date().toISOString(),
    prompts: prompts || [],
    folders: folders || [],
    departments: departments || [],
  };
}

export async function importPack(
  pack: ExportPack
): Promise<{ imported: number; errors: string[] }> {
  if (pack.format !== "contextiq-prompt-pack" || pack.version !== "1.0") {
    return { imported: 0, errors: ["Invalid pack format"] };
  }

  const orgId = await getOrgId();
  const userId = await getUserId();
  if (!orgId || !userId) return { imported: 0, errors: ["Not authenticated"] };

  const db = supabase();
  let imported = 0;
  const errors: string[] = [];

  for (const prompt of pack.prompts) {
    const { error } = await db.from("prompts").insert({
      org_id: orgId,
      owner_id: userId,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      intended_outcome: prompt.intended_outcome,
      tone: prompt.tone || "professional",
      model_recommendation: prompt.model_recommendation,
      example_input: prompt.example_input,
      example_output: prompt.example_output,
      tags: prompt.tags || [],
      status: "approved",
      version: 1,
    });

    if (error) {
      errors.push(`Failed to import "${prompt.title}": ${error.message}`);
    } else {
      imported++;
    }
  }

  return { imported, errors };
}
