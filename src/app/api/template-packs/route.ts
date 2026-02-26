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
      return NextResponse.json({ error: packsError.message }, { status: 500 });
    }

    // Fetch prompt associations
    const packIds = (packs || []).map((p) => p.id);
    let packPrompts: { pack_id: string; prompt_id: string }[] = [];

    if (packIds.length > 0) {
      const { data } = await db
        .from("template_pack_prompts")
        .select("pack_id, prompt_id")
        .in("pack_id", packIds);
      packPrompts = data || [];
    }

    // Fetch actual prompt details for associated prompts
    const allPromptIds = Array.from(new Set(packPrompts.map((pp) => pp.prompt_id)));
    let promptDetails: { id: string; title: string; description: string | null; tags: string[]; content: string }[] = [];

    if (allPromptIds.length > 0) {
      const { data } = await db
        .from("prompts")
        .select("id, title, description, tags, content")
        .in("id", allPromptIds);
      promptDetails = data || [];
    }

    const promptMap = new Map(promptDetails.map((p) => [p.id, p]));

    const result = (packs || []).map((pack) => {
      const promptIds = packPrompts
        .filter((pp) => pp.pack_id === pack.id)
        .map((pp) => pp.prompt_id);

      return {
        ...pack,
        promptIds,
        prompts: promptIds
          .map((id) => promptMap.get(id))
          .filter(Boolean),
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
    const { name, description, icon, visibility, team_id, promptIds } = body;

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
      return NextResponse.json({ error: packError.message }, { status: 500 });
    }

    // Associate prompts
    if (promptIds && promptIds.length > 0) {
      await db.from("template_pack_prompts").insert(
        promptIds.map((pid: string) => ({
          pack_id: pack.id,
          prompt_id: pid,
        }))
      );
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Template packs DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
