import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

/** GET — list user's conversations */
export async function GET(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(limiters.chatConversations, user.id);
  if (!rl.success) return rl.response;

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ conversations: [] });

  // Check if caller wants archived conversations
  const showArchived = request.nextUrl.searchParams.get("archived") === "true";

  // Try with all columns (including archived_at), then progressively fall back
  // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
  let { data, error } = await (async () => {
    let q = db
      .from("chat_conversations")
      .select("id, title, model, provider, pinned, folder_id, archived_at, created_at, updated_at")
      .eq("org_id", profile.org_id)
      .eq("user_id", user.id);
    if (showArchived) {
      q = q.not("archived_at", "is", null);
    } else {
      q = q.is("archived_at", null);
    }
    return q.order("updated_at", { ascending: false }).limit(100);
  })();

  // Fallback: archived_at doesn't exist yet (migration 076)
  if (error && error.message?.includes("archived_at")) {
    // eslint-disable-next-line prefer-const
    let fb = await db
      .from("chat_conversations")
      .select("id, title, model, provider, pinned, folder_id, created_at, updated_at")
      .eq("org_id", profile.org_id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = fb.data as any;
    error = fb.error;
    // If requesting archived but column doesn't exist, return empty
    if (showArchived) return NextResponse.json({ conversations: [] });
  }

  // Fallback: folder_id doesn't exist yet (migration 071)
  if (error && error.message?.includes("folder_id")) {
    const fb = await db
      .from("chat_conversations")
      .select("id, title, model, provider, pinned, created_at, updated_at")
      .eq("org_id", profile.org_id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = fb.data as any;
    error = fb.error;
  }

  // Fallback: pinned doesn't exist yet (migration 070)
  if (error && error.message?.includes("pinned")) {
    const fb = await db
      .from("chat_conversations")
      .select("id, title, model, provider, created_at, updated_at")
      .eq("org_id", profile.org_id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = fb.data as any;
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

/** PATCH — archive/unarchive conversations */
export async function PATCH(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, ids, archived } = body as { id?: string; ids?: string[]; archived?: boolean };

  if (typeof archived !== "boolean") {
    return NextResponse.json({ error: "archived (boolean) required" }, { status: 400 });
  }

  // Support both single id and bulk ids
  const targetIds = ids || (id ? [id] : []);
  if (targetIds.length === 0) {
    return NextResponse.json({ error: "id or ids required" }, { status: 400 });
  }

  // Verify ownership of all conversations
  const { data: owned } = await db
    .from("chat_conversations")
    .select("id")
    .in("id", targetIds)
    .eq("user_id", user.id);

  const ownedIds = (owned || []).map((c: { id: string }) => c.id);
  if (ownedIds.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const archivedAt = archived ? new Date().toISOString() : null;
  const { error } = await db
    .from("chat_conversations")
    .update({ archived_at: archivedAt })
    .in("id", ownedIds)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: ownedIds.length });
}

/** DELETE — delete conversation(s) */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, ids } = body as { id?: string; ids?: string[] };

  // Support both single id and bulk ids
  const targetIds = ids || (id ? [id] : []);
  if (targetIds.length === 0) {
    return NextResponse.json({ error: "id or ids required" }, { status: 400 });
  }

  // Verify ownership
  const { data: owned } = await db
    .from("chat_conversations")
    .select("id")
    .in("id", targetIds)
    .eq("user_id", user.id);

  const ownedIds = (owned || []).map((c: { id: string }) => c.id);
  if (ownedIds.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.from("chat_conversations").delete().in("id", ownedIds).eq("user_id", user.id);
  return NextResponse.json({ success: true, deleted: ownedIds.length });
}
