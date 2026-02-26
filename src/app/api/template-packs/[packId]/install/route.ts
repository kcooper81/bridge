import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { extractTemplateVariables, normalizeVariables } from "@/lib/variables";

export async function POST(
  request: NextRequest,
  { params }: { params: { packId: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }

    const { packId } = params;
    const body = await request.json().catch(() => ({}));
    const folderId = body.folderId || null;

    // Fetch the pack and verify it exists
    const { data: pack } = await db
      .from("template_packs")
      .select("*")
      .eq("id", packId)
      .single();

    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    // Fetch pack's prompts, guidelines, and rules in parallel
    const [packPromptsRes, packGuidelinesRes, packRulesRes] = await Promise.all([
      db.from("template_pack_prompts").select("prompt_id").eq("pack_id", packId),
      db.from("template_pack_guidelines").select("guideline_id").eq("pack_id", packId),
      db.from("template_pack_rules").select("rule_id").eq("pack_id", packId),
    ]);

    const promptIds = (packPromptsRes.data || []).map((pp) => pp.prompt_id);
    const guidelineIds = (packGuidelinesRes.data || []).map((pg) => pg.guideline_id);
    const ruleIds = (packRulesRes.data || []).map((pr) => pr.rule_id);

    if (promptIds.length === 0 && guidelineIds.length === 0 && ruleIds.length === 0) {
      return NextResponse.json({ error: "Pack is empty" }, { status: 400 });
    }

    let promptsCreated = 0;
    let guidelinesCreated = 0;
    let rulesCreated = 0;

    // 1. Duplicate prompts
    if (promptIds.length > 0) {
      const { data: sourcePrompts } = await db
        .from("prompts")
        .select("*")
        .in("id", promptIds);

      if (sourcePrompts && sourcePrompts.length > 0) {
        const inserts = sourcePrompts.map((p) => {
          const content = p.content || "";
          const isTemplate = p.is_template ?? extractTemplateVariables(content).length > 0;
          return {
            org_id: profile.org_id,
            owner_id: user.id,
            title: p.title,
            content,
            description: p.description,
            intended_outcome: p.intended_outcome,
            tone: p.tone || "professional",
            model_recommendation: p.model_recommendation,
            example_input: p.example_input,
            example_output: p.example_output,
            tags: p.tags || [],
            folder_id: folderId,
            status: "approved",
            version: 1,
            is_template: isTemplate,
            template_variables: normalizeVariables(p.template_variables),
          };
        });

        const { data: inserted } = await db.from("prompts").insert(inserts).select("id");
        promptsCreated = inserted?.length || 0;
      }
    }

    // 2. Duplicate guidelines
    if (guidelineIds.length > 0) {
      const { data: sourceGuidelines } = await db
        .from("standards")
        .select("*")
        .in("id", guidelineIds);

      if (sourceGuidelines && sourceGuidelines.length > 0) {
        const inserts = sourceGuidelines.map((g) => ({
          org_id: profile.org_id,
          name: g.name,
          description: g.description,
          category: g.category || "general",
          scope: "org",
          rules: g.rules || {},
          enforced: false,
          created_by: user.id,
        }));

        const { data: inserted } = await db.from("standards").insert(inserts).select("id");
        guidelinesCreated = inserted?.length || 0;
      }
    }

    // 3. Duplicate security rules
    if (ruleIds.length > 0) {
      const { data: sourceRules } = await db
        .from("security_rules")
        .select("*")
        .in("id", ruleIds);

      if (sourceRules && sourceRules.length > 0) {
        const inserts = sourceRules.map((r) => ({
          org_id: profile.org_id,
          name: r.name,
          description: r.description,
          pattern: r.pattern,
          pattern_type: r.pattern_type,
          category: r.category,
          severity: r.severity,
          is_active: true,
          is_built_in: false,
          created_by: user.id,
        }));

        const { data: inserted } = await db.from("security_rules").insert(inserts).select("id");
        rulesCreated = inserted?.length || 0;
      }
    }

    return NextResponse.json({
      success: true,
      promptsCreated,
      guidelinesCreated,
      rulesCreated,
    });
  } catch (error) {
    console.error("Install custom pack error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
