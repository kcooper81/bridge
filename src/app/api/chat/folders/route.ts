import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — list user's folders */
export async function GET() {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await db
    .from("chat_folders")
    .select("id, name, color, sort_order, created_at")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ folders: data || [] });
}

/** POST — create a folder */
export async function POST(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No org" }, { status: 400 });

  const { name, color } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await db
    .from("chat_folders")
    .insert({
      org_id: profile.org_id,
      user_id: user.id,
      name: name.trim(),
      color: color || "#6366f1",
    })
    .select("id, name, color, sort_order")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ folder: data });
}

/** PATCH — update folder name/color/order */
export async function PATCH(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, color, sort_order } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (color !== undefined) updates.color = color;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  await db.from("chat_folders").update(updates).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}

/** DELETE — delete a folder (conversations move to unfiled) */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.from("chat_folders").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}
