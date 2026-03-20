import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — list user's saved items */
export async function GET(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const board = request.nextUrl.searchParams.get("board");
  const q = request.nextUrl.searchParams.get("q");

  let query = db
    .from("saved_items")
    .select("id, title, content, content_type, board, tags, conversation_id, source_message_id, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (board && board !== "All") {
    query = query.eq("board", board);
  }

  if (q && q.trim().length >= 2) {
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    // Table might not exist yet
    if (error.message?.includes("saved_items")) {
      return NextResponse.json({ items: [], boards: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get unique boards
  const { data: boardData } = await db
    .from("saved_items")
    .select("board")
    .eq("user_id", user.id);

  const boards = Array.from(new Set((boardData || []).map((b: { board: string }) => b.board).filter(Boolean)));

  return NextResponse.json({ items: data || [], boards });
}

/** POST — save a new item */
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

  const body = await request.json();
  if (!body.content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  // Auto-detect content type
  let contentType = body.content_type || "text";
  const content = body.content.trim();
  if (!body.content_type) {
    if (content.match(/^```[\s\S]*```$/m) || content.match(/^(function |const |let |var |import |class |def |public )/m)) {
      contentType = "code";
    } else if (content.match(/https?:\/\/[^\s]+/)) {
      contentType = "link";
    }
  }

  // Auto-generate title if not provided
  const title = body.title?.trim() || content.split("\n")[0].slice(0, 80) || "Untitled";

  const { data, error } = await db
    .from("saved_items")
    .insert({
      org_id: profile.org_id,
      user_id: user.id,
      conversation_id: body.conversation_id || null,
      title,
      content,
      content_type: contentType,
      board: body.board || "General",
      tags: body.tags || [],
      source_message_id: body.source_message_id || null,
      metadata: body.metadata || {},
    })
    .select("id, title, content, content_type, board, tags, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

/** PATCH — update a saved item */
export async function PATCH(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.board !== undefined) updates.board = body.board;
  if (body.tags !== undefined) updates.tags = body.tags;

  await db.from("saved_items").update(updates).eq("id", body.id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}

/** DELETE — delete a saved item */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.from("saved_items").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}
