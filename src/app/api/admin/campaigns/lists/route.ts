import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/**
 * GET — return all audience lists with contact counts.
 */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();

  const { data: lists, error } = await db
    .from("audience_lists")
    .select("id, name, description, contact_count, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load audience lists:", error);
    return NextResponse.json({ error: "Failed to load lists" }, { status: 500 });
  }

  return NextResponse.json({ lists: lists || [] });
}

/**
 * PUT — add contacts to an existing list.
 * Body: { list_id: string, emails: string[] }
 *   OR  { list_id: string, add_all: true }
 */
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { list_id, emails, add_all } = await request.json();
  if (!list_id) return NextResponse.json({ error: "list_id required" }, { status: 400 });

  const db = createServiceClient();

  // Get contacts to add
  let contactQuery = db.from("campaign_contacts").select("id").eq("unsubscribed", false);
  if (!add_all && Array.isArray(emails) && emails.length > 0) {
    contactQuery = contactQuery.in("email", emails.map((e: string) => e.trim().toLowerCase()));
  }
  const { data: contacts } = await contactQuery;

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ error: "No matching contacts found" }, { status: 400 });
  }

  // Upsert into junction
  await db
    .from("audience_list_contacts")
    .upsert(
      contacts.map((c) => ({ list_id, contact_id: c.id })),
      { onConflict: "list_id,contact_id" }
    );

  // Update count
  const { count } = await db
    .from("audience_list_contacts")
    .select("*", { count: "exact", head: true })
    .eq("list_id", list_id);

  await db
    .from("audience_lists")
    .update({ contact_count: count || 0, updated_at: new Date().toISOString() })
    .eq("id", list_id);

  return NextResponse.json({ added: contacts.length, total: count || 0 });
}

/**
 * POST — create a new audience list and optionally add all existing contacts to it.
 * Body: { name: string, description?: string, add_all_contacts?: boolean }
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description, add_all_contacts } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const db = createServiceClient();

  const { data: list, error } = await db
    .from("audience_lists")
    .insert({
      name: name.trim(),
      description: description?.trim() || "",
      created_by: auth.userId,
    })
    .select("id, name, description, contact_count, created_at")
    .single();

  if (error) {
    console.error("Failed to create list:", error);
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }

  // Optionally add all existing contacts
  if (add_all_contacts && list) {
    const { data: allContacts } = await db
      .from("campaign_contacts")
      .select("id")
      .eq("unsubscribed", false);

    if (allContacts && allContacts.length > 0) {
      await db
        .from("audience_list_contacts")
        .upsert(
          allContacts.map((c) => ({ list_id: list.id, contact_id: c.id })),
          { onConflict: "list_id,contact_id" }
        );

      await db
        .from("audience_lists")
        .update({ contact_count: allContacts.length, updated_at: new Date().toISOString() })
        .eq("id", list.id);

      list.contact_count = allContacts.length;
    }
  }

  return NextResponse.json({ list });
}

/**
 * PATCH — update an audience list's name or description.
 */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, name, description } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = createServiceClient();

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();

  const { data, error } = await db
    .from("audience_lists")
    .update(updates)
    .eq("id", id)
    .select("id, name, description, contact_count, created_at")
    .single();

  if (error) {
    console.error("Failed to update list:", error);
    return NextResponse.json({ error: "Failed to update list" }, { status: 500 });
  }

  return NextResponse.json({ list: data });
}

/**
 * DELETE — delete an audience list (does not delete the contacts themselves).
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = createServiceClient();

  const { error } = await db.from("audience_lists").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete list:", error);
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
