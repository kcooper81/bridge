import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

async function verifySuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  return (
    profile?.is_super_admin === true ||
    SUPER_ADMIN_EMAILS.includes(user.email || "")
  );
}

export async function GET() {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();

  const { data: tickets, error } = await db
    .from("feedback")
    .select("id, type, subject, message, html_body, sender_email, sender_name, status, priority, user_id, org_id, inbox_email, attachments, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin tickets fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }

  // Collect ticket IDs for batch notes fetch
  const ticketIds = (tickets || []).map((t) => t.id);

  // Resolve user emails, org names, and notes in parallel
  const userIds = Array.from(
    new Set((tickets || []).map((t) => t.user_id).filter(Boolean) as string[])
  );
  const orgIds = Array.from(
    new Set((tickets || []).map((t) => t.org_id).filter(Boolean) as string[])
  );

  const [usersRes, orgsRes, notesRes] = await Promise.all([
    userIds.length > 0
      ? db.from("profiles").select("id, email").in("id", userIds)
      : { data: [] },
    orgIds.length > 0
      ? db.from("organizations").select("id, name").in("id", orgIds)
      : { data: [] },
    ticketIds.length > 0
      ? db
          .from("ticket_notes")
          .select("id, ticket_id, author_id, content, is_internal, email_sent, created_at")
          .in("ticket_id", ticketIds)
          .order("created_at", { ascending: true })
      : { data: [] },
  ]);

  // Collect note author IDs and merge with user IDs for email lookup
  const noteAuthorIds = Array.from(
    new Set(
      (notesRes.data || [])
        .map((n: { author_id: string }) => n.author_id)
        .filter((id: string) => !userIds.includes(id))
    )
  );

  let noteAuthorMap = new Map<string, string>();
  if (noteAuthorIds.length > 0) {
    const { data: noteAuthors } = await db
      .from("profiles")
      .select("id, email")
      .in("id", noteAuthorIds);
    noteAuthorMap = new Map(
      (noteAuthors || []).map((u: { id: string; email: string }) => [u.id, u.email])
    );
  }

  const userMap = new Map(
    (usersRes.data || []).map((u: { id: string; email: string }) => [u.id, u.email])
  );
  const orgMap = new Map(
    (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
  );

  // Combine both maps for author email lookup
  const allUserMap = new Map<string, string>([
    ...Array.from(userMap.entries()),
    ...Array.from(noteAuthorMap.entries()),
  ]);

  // Group notes by ticket_id
  const notesMap = new Map<string, Array<{
    id: string;
    content: string;
    is_internal: boolean;
    email_sent: boolean;
    author_email: string | null;
    created_at: string;
  }>>();

  for (const note of (notesRes.data || []) as Array<{
    id: string;
    ticket_id: string;
    author_id: string;
    content: string;
    is_internal: boolean;
    email_sent: boolean;
    created_at: string;
  }>) {
    const arr = notesMap.get(note.ticket_id) || [];
    arr.push({
      id: note.id,
      content: note.content,
      is_internal: note.is_internal,
      email_sent: note.email_sent,
      author_email: allUserMap.get(note.author_id) ?? null,
      created_at: note.created_at,
    });
    notesMap.set(note.ticket_id, arr);
  }

  const enriched = (tickets || []).map((t) => {
    // Resolve sender email: new column → profile → extracted from message (legacy)
    let senderEmail = t.sender_email || null;
    if (!senderEmail && t.user_id) {
      senderEmail = userMap.get(t.user_id) || null;
    }
    if (!senderEmail) {
      const match = t.message.match(/From:.*?<([^>]+@[^>]+)>/i)
        || t.message.match(/From:.*?([^\s<]+@[^\s>]+)/i);
      if (match) senderEmail = match[1];
    }

    // Clean message for display: strip legacy "From: ..." prefix
    const displayMessage = t.message.replace(/^From:.*?\n\n/, "");

    return {
      id: t.id,
      type: t.type,
      subject: t.subject,
      message: displayMessage,
      html_body: t.html_body || null,
      sender_name: t.sender_name || null,
      status: t.status,
      priority: t.priority || "normal",
      user_id: t.user_id || null,
      user_email: senderEmail,
      org_name: t.org_id ? orgMap.get(t.org_id) || null : null,
      inbox_email: t.inbox_email || null,
      attachments: t.attachments || [],
      notes: notesMap.get(t.id) || [],
      notes_count: (notesMap.get(t.id) || []).length,
      created_at: t.created_at,
    };
  });

  return NextResponse.json({ tickets: enriched });
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ids, status, priority } = body;

  // Support single id or bulk ids
  const ticketIds: string[] = ids || (id ? [id] : []);
  if (ticketIds.length === 0 || (!status && !priority)) {
    return NextResponse.json(
      { error: "id(s) and at least one of status/priority required" },
      { status: 400 }
    );
  }

  const validStatuses = ["new", "in_progress", "resolved", "closed"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const validPriorities = ["low", "normal", "high", "urgent"];
  if (priority && !validPriorities.includes(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  const db = createServiceClient();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (status) {
    updates.status = status;
    if (status === "resolved") updates.resolved_at = new Date().toISOString();
  }
  if (priority) {
    updates.priority = priority;
  }

  const { error } = await db.from("feedback").update(updates).in("id", ticketIds);

  if (error) {
    console.error("Admin ticket update error:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: ticketIds.length });
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { ids } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  const db = createServiceClient();

  // Delete notes first (cascade should handle this, but be explicit)
  await db.from("ticket_notes").delete().in("ticket_id", ids);
  const { error } = await db.from("feedback").delete().in("id", ids);

  if (error) {
    console.error("Admin ticket delete error:", error);
    return NextResponse.json({ error: "Failed to delete tickets" }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: ids.length });
}
