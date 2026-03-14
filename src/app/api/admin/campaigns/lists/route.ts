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
