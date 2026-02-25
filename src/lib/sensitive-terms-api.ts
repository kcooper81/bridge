import { createClient } from "@/lib/supabase/client";
import type { SensitiveTerm, SuggestedRule, DataImport, SecuritySettings } from "@/lib/types";

// ─── Sensitive Terms ───

export async function getSensitiveTerms(options?: {
  category?: string;
  activeOnly?: boolean;
  teamId?: string | null; // undefined = all, null = global only, string = specific team
}): Promise<SensitiveTerm[]> {
  const supabase = createClient();
  let query = supabase.from("sensitive_terms").select("*").order("created_at", { ascending: false });

  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }
  if (options?.teamId !== undefined) {
    if (options.teamId === null) {
      query = query.is("team_id", null);
    } else {
      query = query.eq("team_id", options.teamId);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SensitiveTerm[];
}

export async function createSensitiveTerm(
  term: Omit<SensitiveTerm, "id" | "org_id" | "team_id" | "created_by" | "created_at" | "updated_at"> & { team_id?: string | null }
): Promise<SensitiveTerm> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user?.id)
    .single();

  const { data, error } = await supabase
    .from("sensitive_terms")
    .insert({
      ...term,
      team_id: term.team_id ?? null,
      org_id: profile?.org_id,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SensitiveTerm;
}

export async function updateSensitiveTerm(
  id: string,
  updates: Partial<SensitiveTerm>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sensitive_terms")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSensitiveTerm(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("sensitive_terms").delete().eq("id", id);
  if (error) throw error;
}

export async function importSensitiveTerms(
  terms: Array<{
    term: string;
    term_type: "exact" | "pattern" | "keyword";
    category: string;
    description?: string;
    severity?: "block" | "warn";
  }>
): Promise<{ imported: number; failed: number }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user?.id)
    .single();

  if (!profile?.org_id) throw new Error("No organization");

  const inserts = terms.map((t) => ({
    org_id: profile.org_id,
    term: t.term,
    term_type: t.term_type,
    category: t.category,
    description: t.description || null,
    severity: t.severity || "warn",
    source: "import" as const,
    created_by: user?.id,
  }));

  const { data, error } = await supabase
    .from("sensitive_terms")
    .insert(inserts)
    .select();

  if (error) throw error;
  return { imported: data?.length || 0, failed: terms.length - (data?.length || 0) };
}

// ─── Suggested Rules ───

export async function getSuggestedRules(status?: string): Promise<SuggestedRule[]> {
  const supabase = createClient();
  let query = supabase.from("suggested_rules").select("*").order("detection_count", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SuggestedRule[];
}

export async function reviewSuggestedRule(
  id: string,
  action: "approve" | "dismiss"
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (action === "dismiss") {
    const { error } = await supabase
      .from("suggested_rules")
      .update({
        status: "dismissed",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    return;
  }

  // Approve: convert to security rule
  const { data: suggestion, error: fetchError } = await supabase
    .from("suggested_rules")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !suggestion) throw fetchError || new Error("Not found");

  // Create the security rule
  const { data: newRule, error: insertError } = await supabase
    .from("security_rules")
    .insert({
      org_id: suggestion.org_id,
      name: suggestion.name,
      description: suggestion.description,
      pattern: suggestion.pattern,
      pattern_type: suggestion.pattern_type,
      category: suggestion.category,
      severity: suggestion.severity,
      is_active: true,
      is_built_in: false,
      created_by: user?.id,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Update the suggestion status
  const { error: updateError } = await supabase
    .from("suggested_rules")
    .update({
      status: "converted",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      converted_rule_id: newRule.id,
    })
    .eq("id", id);

  if (updateError) throw updateError;
}

// ─── Security Settings ───

export async function getSecuritySettings(orgId: string): Promise<SecuritySettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("security_settings")
    .eq("id", orgId)
    .single();

  if (error) throw error;

  const defaults: SecuritySettings = {
    entropy_detection_enabled: false,
    entropy_threshold: 4.0,
    ai_detection_enabled: false,
    ai_detection_provider: null,
    smart_patterns_enabled: false,
  };

  return { ...defaults, ...(data?.security_settings || {}) };
}

export async function updateSecuritySettings(
  orgId: string,
  settings: Partial<SecuritySettings>
): Promise<void> {
  const supabase = createClient();
  const current = await getSecuritySettings(orgId);
  const updated = { ...current, ...settings };

  const { error } = await supabase
    .from("organizations")
    .update({ security_settings: updated })
    .eq("id", orgId);

  if (error) throw error;
}

// ─── Data Imports ───

export async function getDataImports(): Promise<DataImport[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("data_imports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as DataImport[];
}

export async function createDataImport(
  importData: Pick<DataImport, "import_type" | "source_name" | "total_records" | "metadata">
): Promise<DataImport> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user?.id)
    .single();

  const { data, error } = await supabase
    .from("data_imports")
    .insert({
      ...importData,
      org_id: profile?.org_id,
      created_by: user?.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as DataImport;
}
