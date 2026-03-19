import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** POST — rate a message (thumbs up/down) */
export async function POST(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, rating } = await request.json();
  if (!messageId || ![-1, 0, 1].includes(rating)) {
    return NextResponse.json({ error: "messageId and rating (-1, 0, 1) required" }, { status: 400 });
  }

  // Verify message belongs to user's conversation
  const { data: msg } = await db
    .from("chat_messages")
    .select(`
      id,
      chat_conversations!inner (user_id)
    `)
    .eq("id", messageId)
    .eq("chat_conversations.user_id", user.id)
    .maybeSingle();

  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await db
    .from("chat_messages")
    .update({ rating })
    .eq("id", messageId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
