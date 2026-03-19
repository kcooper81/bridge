import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — list user's conversations */
export async function GET() {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ conversations: [] });

  // eslint-disable-next-line prefer-const
  let { data, error } = await db
    .from("chat_conversations")
    .select("id, title, model, provider, pinned, folder_id, created_at, updated_at")
    .eq("org_id", profile.org_id)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  // Fallback if new columns don't exist yet
  if (error && (error.message?.includes("pinned") || error.message?.includes("folder_id"))) {
    const fallback = await db
      .from("chat_conversations")
      .select("id, title, model, provider, created_at, updated_at")
      .eq("org_id", profile.org_id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = fallback.data as any;
  }

  // Load conversation tags
  const convIds = (data || []).map((c: { id: string }) => c.id);
  const tagMap: Record<string, string[]> = {};
  if (convIds.length > 0) {
    const { data: convTags } = await db
      .from("chat_conversation_tags")
      .select("conversation_id, tag_id")
      .in("conversation_id", convIds);
    if (convTags) {
      for (const ct of convTags) {
        if (!tagMap[ct.conversation_id]) tagMap[ct.conversation_id] = [];
        tagMap[ct.conversation_id].push(ct.tag_id);
      }
    }
  }

  const conversations = (data || []).map((c: Record<string, unknown>) => ({
    ...c,
    tag_ids: tagMap[c.id as string] || [],
  }));

  return NextResponse.json({ conversations });
}

/** DELETE — delete a conversation */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify ownership
  const { data: conv } = await db
    .from("chat_conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.from("chat_conversations").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
