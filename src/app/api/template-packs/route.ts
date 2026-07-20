import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role, is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return null;

  return {
    userId: user.id,
    orgId: profile.org_id,
    role: profile.is_super_admin ? "admin" : profile.role,
  };
}

// GET — fetch custom packs for user's org with prompt details
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServiceClient();

    const { data: packs, error: packsError } = await db
      .from("template_packs")
      .select("*")
      .eq("org_id", auth.orgId)
      .order("created_at", { ascending: false });

    if (packsError) {
      console.error("Template packs fetch error:", packsError);
      return NextResponse.json({ error: "Failed to fetch template packs" }, { status: 500 });
    }

    // Fetch associations
    const packIds = (packs || []).map((p) => p.id);
    let packPrompts: { pack_id: string; prompt_id: string }[] = [];
    let packGuidelines: { pack_id: string; guideline_id: string }[] = [];
    let packRules: { pack_id: string; rule_id: string }[] = [];

    if (packIds.length > 0) {
      const [promptsRes, guidelinesRes, rulesRes] = await Promise.all([
        db.from("template_pack_prompts").select("pack_id, prompt_id").in("pack_id", packIds),
        db.from("template_pack_guidelines").select("pack_id, guideline_id").in("pack_id", packIds),
        db.from("template_pack_rules").select("pack_id, rule_id").in("pack_id", packIds),
      ]);
      packPrompts = promptsRes.data || [];
      packGuidelines = guidelinesRes.data || [];
      packRules = rulesRes.data || [];
    }

    // Fetch details in parallel
    const allPromptIds = Array.from(new Set(packPrompts.map((pp) => pp.prompt_id)));
    const allGuidelineIds = Array.from(new Set(packGuidelines.map((pg) => pg.guideline_id)));
    const allRuleIds = Array.from(new Set(packRules.map((pr) => pr.rule_id)));

    const [promptDetails, guidelineDetails, ruleDetails] = await Promise.all([
      allPromptIds.length > 0
        ? db.from("prompts").select("id, title, description, tags, content").in("id", allPromptIds).then((r) => r.data || [])
        : Promise.resolve([]),
      allGuidelineIds.length > 0
        ? db.from("standards").select("id, name, description, category").in("id", allGuidelineIds).then((r) => r.data || [])
        : Promise.resolve([]),
      allRuleIds.length > 0
        ? db.from("security_rules").select("id, name, description, category, severity, pattern_type").in("id", allRuleIds).then((r) => r.data || [])
        : Promise.resolve([]),
    ]);

    const promptMap = new Map(promptDetails.map((p: { id: string }) => [p.id, p]));
    const guidelineMap = new Map(guidelineDetails.map((g: { id: string }) => [g.id, g]));
    const ruleMap = new Map(ruleDetails.map((r: { id: string }) => [r.id, r]));

    const result = (packs || []).map((pack) => {
      const promptIds = packPrompts.filter((pp) => pp.pack_id === pack.id).map((pp) => pp.prompt_id);
      const guidelineIds = packGuidelines.filter((pg) => pg.pack_id === pack.id).map((pg) => pg.guideline_id);
      const ruleIds = packRules.filter((pr) => pr.pack_id === pack.id).map((pr) => pr.rule_id);

      return {
        ...pack,
        promptIds,
        guidelineIds,
        ruleIds,
        prompts: promptIds.map((id) => promptMap.get(id)).filter(Boolean),
        guidelines: guidelineIds.map((id) => guidelineMap.get(id)).filter(Boolean),
        rules: ruleIds.map((id) => ruleMap.get(id)).filter(Boolean),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Template packs GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create pack (admin/manager)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, visibility, team_id, promptIds, guidelineIds, ruleIds } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = createServiceClient();

    const { data: pack, error: packError } = await db
      .from("template_packs")
      .insert({
        org_id: auth.orgId,
        name: name.trim(),
        description: description || null,
        icon: icon || "FolderOpen",
        visibility: visibility || "org",
        team_id: team_id || null,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (packError) {
      console.error("Template pack create error:", packError);
      return NextResponse.json({ error: "Failed to create template pack" }, { status: 500 });
    }

    // SECURITY: promptIds/guidelineIds/ruleIds come from the request body.
    // Before associating them, confirm each id belongs to the caller's org —
    // otherwise an admin could reference another org's prompt/guideline/rule
    // UUIDs here, and the install route (which copies source rows by id) would
    // duplicate that org's content into this one. We filter the supplied ids
    // down to the ones actually owned by auth.orgId and associate only those.
    const packOrgId = auth.orgId;
    const ownedIds = async (table: string, ids: unknown): Promise<string[]> => {
      if (!Array.isArray(ids) || ids.length === 0) return [];
      const candidateIds = ids.filter((v): v is string => typeof v === "string");
      if (candidateIds.length === 0) return [];
      const { data } = await db
        .from(table)
        .select("id")
        .eq("org_id", packOrgId)
        .in("id", candidateIds);
      return (data || []).map((r: { id: string }) => r.id);
    };

    const [ownedPromptIds, ownedGuidelineIds, ownedRuleIds] = await Promise.all([
      ownedIds("prompts", promptIds),
      ownedIds("standards", guidelineIds),
      ownedIds("security_rules", ruleIds),
    ]);

    const associations = [];
    if (ownedPromptIds.length > 0) {
      associations.push(
        db.from("template_pack_prompts").insert(
          ownedPromptIds.map((pid) => ({ pack_id: pack.id, prompt_id: pid }))
        )
      );
    }
    if (ownedGuidelineIds.length > 0) {
      associations.push(
        db.from("template_pack_guidelines").insert(
          ownedGuidelineIds.map((gid) => ({ pack_id: pack.id, guideline_id: gid }))
        )
      );
    }
    if (ownedRuleIds.length > 0) {
      associations.push(
        db.from("template_pack_rules").insert(
          ownedRuleIds.map((rid) => ({ pack_id: pack.id, rule_id: rid }))
        )
      );
    }
    await Promise.all(associations);

    return NextResponse.json(pack, { status: 201 });
  } catch (error) {
    console.error("Template packs POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — delete pack by id (admin/manager)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const packId = searchParams.get("id");

    if (!packId) {
      return NextResponse.json({ error: "Pack ID is required" }, { status: 400 });
    }

    const db = createServiceClient();

    // Verify pack belongs to user's org
    const { data: pack } = await db
      .from("template_packs")
      .select("id, org_id")
      .eq("id", packId)
      .single();

    if (!pack || pack.org_id !== auth.orgId) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const { error } = await db
      .from("template_packs")
      .delete()
      .eq("id", packId);

    if (error) {
      console.error("Template pack delete error:", error);
      return NextResponse.json({ error: "Failed to delete template pack" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Template packs DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
