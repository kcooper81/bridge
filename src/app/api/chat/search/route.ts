import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — full-text search across conversation messages */
export async function GET(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  // Search messages in user's conversations using full-text search
  const { data: messages } = await db
    .from("chat_messages")
    .select(`
      id,
      content,
      role,
      created_at,
      conversation_id,
      chat_conversations!inner (
        id,
        title,
        user_id
      )
    `)
    .eq("chat_conversations.user_id", user.id)
    .textSearch("content", q, { type: "websearch" })
    .order("created_at", { ascending: false })
    .limit(30);

  // If FTS fails (index might not exist), fall back to ILIKE
  if (!messages || messages.length === 0) {
    const { data: fallback } = await db
      .from("chat_messages")
      .select(`
        id,
        content,
        role,
        created_at,
        conversation_id,
        chat_conversations!inner (
          id,
          title,
          user_id
        )
      `)
      .eq("chat_conversations.user_id", user.id)
      .ilike("content", `%${q}%`)
      .order("created_at", { ascending: false })
      .limit(30);

    return NextResponse.json({
      results: (fallback || []).map(formatResult),
    });
  }

  return NextResponse.json({
    results: messages.map(formatResult),
  });
}

function formatResult(msg: Record<string, unknown>) {
  const content = (msg.content as string) || "";
  // Extract a snippet around the match
  const snippet = content.length > 200 ? content.slice(0, 200) + "..." : content;
  const conv = msg.chat_conversations as Record<string, unknown> | undefined;
  return {
    messageId: msg.id,
    conversationId: msg.conversation_id,
    conversationTitle: conv?.title || "Untitled",
    role: msg.role,
    snippet,
    created_at: msg.created_at,
  };
}
