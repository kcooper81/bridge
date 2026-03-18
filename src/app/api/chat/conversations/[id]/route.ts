import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — fetch a conversation with all messages */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: conv } = await db
    .from("chat_conversations")
    .select("id, title, model, provider, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: messages } = await db
    .from("chat_messages")
    .select("id, role, content, model, tokens_used, dlp_action, dlp_violations, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    conversation: conv,
    messages: messages || [],
  });
}

/** PATCH — rename a conversation */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title?.trim() || "Untitled";
  if (body.pinned !== undefined) updates.pinned = body.pinned;

  const { error } = await db
    .from("chat_conversations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Failed to rename" }, { status: 500 });
  return NextResponse.json({ success: true });
}
