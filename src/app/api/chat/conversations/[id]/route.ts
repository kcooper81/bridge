import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** GET — fetch a conversation with all messages */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServiceClient();
  const { data: { user } } = await db.auth.getUser();
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
  const db = createServiceClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await request.json();

  const { error } = await db
    .from("chat_conversations")
    .update({ title: title?.trim() || "Untitled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Failed to rename" }, { status: 500 });
  return NextResponse.json({ success: true });
}
