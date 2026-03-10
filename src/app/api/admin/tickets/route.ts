import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();
  const folder = request.nextUrl.searchParams.get("folder") || "inbox";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 200);
  const offset = Number(request.nextUrl.searchParams.get("offset")) || 0;

  // Get total count for pagination
  const { count: totalCount } = await db
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("folder", folder);

  const { data: tickets, error } = await db
    .from("feedback")
    .select("id, type, subject, message, html_body, sender_email, sender_name, status, priority, direction, user_id, org_id, inbox_email, attachments, assigned_to, starred_by, snoozed_until, folder, cc_emails, created_at, updated_at")
    .eq("folder", folder)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Admin tickets fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }

  // Collect ticket IDs for batch notes fetch
  const ticketIds = (tickets || []).map((t) => t.id);

  // Resolve user emails, org names, notes, assignees, and read status in parallel
  const userIds = Array.from(
    new Set((tickets || []).map((t) => t.user_id).filter(Boolean) as string[])
  );
  const orgIds = Array.from(
    new Set((tickets || []).map((t) => t.org_id).filter(Boolean) as string[])
  );
  const assigneeIds = Array.from(
    new Set((tickets || []).map((t) => t.assigned_to).filter(Boolean) as string[])
  );

  const [usersRes, orgsRes, notesRes, assigneesRes, readsRes] = await Promise.all([
    userIds.length > 0
      ? db.from("profiles").select("id, email").in("id", userIds)
      : { data: [] },
    orgIds.length > 0
      ? db.from("organizations").select("id, name, plan").in("id", orgIds)
      : { data: [] },
    ticketIds.length > 0
      ? db
          .from("ticket_notes")
          .select("id, ticket_id, author_id, content, is_internal, email_sent, cc_emails, created_at")
          .in("ticket_id", ticketIds)
          .order("created_at", { ascending: true })
      : { data: [] },
    assigneeIds.length > 0
      ? db.from("profiles").select("id, email, name").in("id", assigneeIds)
      : { data: [] },
    ticketIds.length > 0
      ? db.from("ticket_reads").select("ticket_id, admin_id, read_at").eq("admin_id", auth.userId).in("ticket_id", ticketIds)
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
    (orgsRes.data || []).map((o: { id: string; name: string; plan?: string }) => [o.id, { name: o.name, plan: o.plan }])
  );
  const assigneeMap = new Map(
    (assigneesRes.data || []).map((a: { id: string; email: string; name: string }) => [a.id, { email: a.email, name: a.name }])
  );

  // Build read status set for current admin
  const readSet = new Set(
    (readsRes.data || []).map((r: { ticket_id: string }) => r.ticket_id)
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
    cc_emails: string[];
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
    cc_emails: string[] | null;
    created_at: string;
  }>) {
    const arr = notesMap.get(note.ticket_id) || [];
    arr.push({
      id: note.id,
      content: note.content,
      is_internal: note.is_internal,
      email_sent: note.email_sent,
      cc_emails: note.cc_emails || [],
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
    const orgInfo = t.org_id ? orgMap.get(t.org_id) : null;

    return {
      id: t.id,
      type: t.type,
      subject: t.subject,
      message: displayMessage,
      html_body: t.html_body || null,
      sender_name: t.sender_name || null,
      status: t.status,
      priority: t.priority || "normal",
      direction: t.direction || "inbound",
      user_id: t.user_id || null,
      user_email: senderEmail,
      org_name: orgInfo?.name || null,
      org_plan: orgInfo?.plan || null,
      inbox_email: t.inbox_email || null,
      assigned_to: t.assigned_to || null,
      assigned_email: t.assigned_to ? assigneeMap.get(t.assigned_to)?.email || null : null,
      assigned_name: t.assigned_to ? assigneeMap.get(t.assigned_to)?.name || null : null,
      attachments: t.attachments || [],
      starred_by: t.starred_by || [],
      snoozed_until: t.snoozed_until || null,
      folder: t.folder || "inbox",
      cc_emails: t.cc_emails || [],
      is_read: readSet.has(t.id),
      notes: notesMap.get(t.id) || [],
      notes_count: (notesMap.get(t.id) || []).length,
      created_at: t.created_at,
      updated_at: t.updated_at || t.created_at,
    };
  });

  return NextResponse.json({
    tickets: enriched,
    pagination: {
      total: totalCount || 0,
      limit,
      offset,
      hasMore: offset + limit < (totalCount || 0),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ids, status, priority, assigned_to, starred, snoozed_until, folder } = body;

  // Support single id or bulk ids
  const ticketIds: string[] = ids || (id ? [id] : []);
  const hasAssignment = assigned_to !== undefined;
  const hasStar = starred !== undefined;
  const hasSnooze = snoozed_until !== undefined;
  const hasFolder = folder !== undefined;

  if (ticketIds.length === 0 || (!status && !priority && !hasAssignment && !hasStar && !hasSnooze && !hasFolder)) {
    return NextResponse.json(
      { error: "id(s) and at least one update field required" },
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

  const validFolders = ["inbox", "spam", "trash"];
  if (hasFolder && !validFolders.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const db = createServiceClient();

  // Star toggle: fetch current array, add/remove user, update
  if (hasStar && ticketIds.length === 1) {
    const ticketId = ticketIds[0];
    const { data: current } = await db.from("feedback").select("starred_by").eq("id", ticketId).single();
    const arr = ((current?.starred_by || []) as string[]);
    const updated = starred
      ? arr.includes(auth.userId) ? arr : [...arr, auth.userId]
      : arr.filter((uid: string) => uid !== auth.userId);
    await db.from("feedback").update({ starred_by: updated, updated_at: new Date().toISOString() }).eq("id", ticketId);
    return NextResponse.json({ success: true, count: 1 });
  }

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
  if (hasAssignment) {
    updates.assigned_to = assigned_to;
  }
  if (hasSnooze) {
    updates.snoozed_until = snoozed_until; // null to unsnooze
  }
  if (hasFolder) {
    updates.folder = folder;
  }

  const { error } = await db.from("feedback").update(updates).in("id", ticketIds);

  if (error) {
    console.error("Admin ticket update error:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: ticketIds.length });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { ids, permanent } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  const db = createServiceClient();

  if (permanent) {
    // Permanently delete (only for items already in trash)
    await db.from("ticket_notes").delete().in("ticket_id", ids);
    await db.from("ticket_reads").delete().in("ticket_id", ids);
    const { error } = await db.from("feedback").delete().in("id", ids);
    if (error) {
      console.error("Admin ticket permanent delete error:", error);
      return NextResponse.json({ error: "Failed to delete tickets" }, { status: 500 });
    }
  } else {
    // Soft delete: move to trash
    const { error } = await db.from("feedback").update({ folder: "trash", updated_at: new Date().toISOString() }).in("id", ids);
    if (error) {
      console.error("Admin ticket trash error:", error);
      return NextResponse.json({ error: "Failed to trash tickets" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, count: ids.length });
}
