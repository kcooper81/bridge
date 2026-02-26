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

    // Fetch pack's prompts
    const { data: packPrompts } = await db
      .from("template_pack_prompts")
      .select("prompt_id")
      .eq("pack_id", packId);

    const promptIds = (packPrompts || []).map((pp) => pp.prompt_id);

    if (promptIds.length === 0) {
      return NextResponse.json({ error: "Pack has no prompts" }, { status: 400 });
    }

    // Fetch the actual prompts
    const { data: sourcePrompts } = await db
      .from("prompts")
      .select("*")
      .in("id", promptIds);

    if (!sourcePrompts || sourcePrompts.length === 0) {
      return NextResponse.json({ error: "No prompts found" }, { status: 400 });
    }

    // Duplicate each prompt into the user's org
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

    const { data: inserted, error: insertError } = await db
      .from("prompts")
      .insert(inserts)
      .select("id");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      promptsCreated: inserted?.length || 0,
    });
  } catch (error) {
    console.error("Install custom pack error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
