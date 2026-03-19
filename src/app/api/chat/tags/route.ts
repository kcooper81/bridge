import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — list user's tags */
export async function GET() {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await db
    .from("chat_tags")
    .select("id, name, color")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return NextResponse.json({ tags: data || [] });
}

/** POST — create a tag */
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
    .from("chat_tags")
    .insert({
      org_id: profile.org_id,
      user_id: user.id,
      name: name.trim(),
      color: color || "#6366f1",
    })
    .select("id, name, color")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tag: data });
}

/** DELETE — delete a tag */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.from("chat_tags").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}

/** PATCH — rename/recolor a tag */
export async function PATCH(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, color } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (color !== undefined) updates.color = color;

  await db.from("chat_tags").update(updates).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}

/** PUT — toggle tag on a conversation */
export async function PUT(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, tagId, action } = await request.json();
  if (!conversationId || !tagId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  // Verify conversation ownership
  const { data: conv } = await db
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "remove") {
    await db.from("chat_conversation_tags")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("tag_id", tagId);
  } else {
    await db.from("chat_conversation_tags")
      .upsert({ conversation_id: conversationId, tag_id: tagId }, { onConflict: "conversation_id,tag_id" });
  }

  return NextResponse.json({ success: true });
}
