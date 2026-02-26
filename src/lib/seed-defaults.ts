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
  userId: string
): Promise<void> {
  // 1. Insert seed prompts
  const promptInserts = SEED_PROMPTS.map((p) => ({
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
