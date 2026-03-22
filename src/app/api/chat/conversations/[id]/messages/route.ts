import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** DELETE — remove messages at and after a given message */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify conversation belongs to user
  const { data: conv } = await db
    .from("chat_conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const afterId = request.nextUrl.searchParams.get("after");
  if (!afterId) return NextResponse.json({ error: "Missing ?after= parameter" }, { status: 400 });

  // Get the message's created_at timestamp
  const { data: targetMsg } = await db
    .from("chat_messages")
    .select("created_at")
    .eq("id", afterId)
    .eq("conversation_id", id)
    .maybeSingle();

  if (!targetMsg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  // Delete all messages with created_at >= that timestamp in this conversation
  const { count, error } = await db
    .from("chat_messages")
    .delete({ count: "exact" })
    .eq("conversation_id", id)
    .gte("created_at", targetMsg.created_at);

  if (error) {
    console.error("Failed to delete messages:", error);
    return NextResponse.json({ error: "Failed to delete messages" }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: count || 0 });
}
