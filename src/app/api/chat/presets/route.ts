import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — list presets (own + shared) */
export async function GET() {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ presets: [] });

  const { data } = await db
    .from("chat_presets")
    .select("id, name, description, system_prompt, first_message, model, provider, icon, color, is_shared, created_by, sort_order")
    .or(`created_by.eq.${user.id},and(is_shared.eq.true,org_id.eq.${profile.org_id})`)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ presets: data || [] });
}

/** POST — create a preset */
export async function POST(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No org" }, { status: 400 });

  const body = await request.json();
  // Only admins can create shared presets
  const isShared = body.is_shared && ["admin", "manager"].includes(profile.role);

  const { data, error } = await db
    .from("chat_presets")
    .insert({
      org_id: profile.org_id,
      created_by: user.id,
      name: body.name?.trim() || "Untitled Preset",
      description: body.description?.trim() || null,
      system_prompt: body.system_prompt?.trim() || null,
      first_message: body.first_message?.trim() || null,
      model: body.model || null,
      provider: body.provider || null,
      icon: body.icon || "bot",
      color: body.color || "#6366f1",
      is_shared: isShared,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preset: data });
}

/** PATCH — update a preset */
export async function PATCH(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.system_prompt !== undefined) updates.system_prompt = body.system_prompt?.trim() || null;
  if (body.first_message !== undefined) updates.first_message = body.first_message?.trim() || null;
  if (body.model !== undefined) updates.model = body.model;
  if (body.provider !== undefined) updates.provider = body.provider;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.color !== undefined) updates.color = body.color;
  if (body.is_shared !== undefined) {
    // Only admins/managers can make presets shared
    const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
    if (body.is_shared && !["admin", "manager"].includes(profile?.role || "")) {
      return NextResponse.json({ error: "Only admins can share presets" }, { status: 403 });
    }
    updates.is_shared = body.is_shared;
  }

  await db.from("chat_presets").update(updates).eq("id", body.id).eq("created_by", user.id);
  return NextResponse.json({ success: true });
}

/** DELETE — delete a preset */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.from("chat_presets").delete().eq("id", id).eq("created_by", user.id);
  return NextResponse.json({ success: true });
}
