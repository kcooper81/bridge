import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/**
 * POST — import external contacts from CSV data.
 * Optionally assigns them to a named audience list.
 *
 * Body: {
 *   contacts: Array<{ email: string; first_name?: string; last_name?: string; company?: string }>,
 *   list_name?: string  — if provided, creates/reuses an audience list and links contacts to it
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { contacts, list_name, list_description } = body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: "contacts array required" }, { status: 400 });
  }

  const MAX_CONTACTS = 10000;
  if (contacts.length > MAX_CONTACTS) {
    return NextResponse.json(
      { error: `Too many contacts. Maximum is ${MAX_CONTACTS}, received ${contacts.length}` },
      { status: 400 }
    );
  }

  // Validate and dedupe emails
  const seen = new Set<string>();
  const valid: Array<{ email: string; first_name: string; last_name: string; company: string }> = [];

  for (const c of contacts) {
    const email = c.email?.trim()?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    valid.push({
      email,
      first_name: c.first_name?.trim() || "",
      last_name: c.last_name?.trim() || "",
      company: c.company?.trim() || "",
    });
  }

  if (valid.length === 0) {
    return NextResponse.json({ error: "No valid email addresses found" }, { status: 400 });
  }

  const db = createServiceClient();

  // Upsert into campaign_contacts (deduped by email)
  const { error } = await db
    .from("campaign_contacts")
    .upsert(
      valid.map((c) => ({
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        company: c.company,
        source: "csv_import",
        imported_by: auth.userId,
      })),
      { onConflict: "email" }
    );

  if (error) {
    console.error("Contact import error:", error);
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 });
  }

  let listId: string | null = null;

  // If a list name was provided, create/get the list and link contacts
  if (list_name?.trim()) {
    const trimmedName = list_name.trim();

    // Check if list already exists
    const { data: existingList } = await db
      .from("audience_lists")
      .select("id")
      .eq("name", trimmedName)
      .maybeSingle();

    if (existingList) {
      listId = existingList.id;
    } else {
      const { data: newList, error: listError } = await db
        .from("audience_lists")
        .insert({
          name: trimmedName,
          description: list_description?.trim() || "",
          created_by: auth.userId,
        })
        .select("id")
        .single();

      if (listError) {
        console.error("List creation error:", listError);
        // Non-fatal — contacts are already imported
      } else {
        listId = newList.id;
      }
    }

    if (listId) {
      // Get contact IDs for all imported emails
      const { data: contactRows } = await db
        .from("campaign_contacts")
        .select("id, email")
        .in("email", valid.map((c) => c.email));

      if (contactRows && contactRows.length > 0) {
        // Link contacts to the list
        await db
          .from("audience_list_contacts")
          .upsert(
            contactRows.map((c) => ({
              list_id: listId!,
              contact_id: c.id,
            })),
            { onConflict: "list_id,contact_id" }
          );

        // Update contact count
        await db
          .from("audience_lists")
          .update({
            contact_count: contactRows.length,
            updated_at: new Date().toISOString(),
          })
          .eq("id", listId);
      }
    }
  }

  return NextResponse.json({
    imported: valid.length,
    skipped: contacts.length - valid.length,
    list_id: listId,
  });
}

/**
 * GET — list imported external contacts with counts.
 */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();

  const { count: totalContacts } = await db
    .from("campaign_contacts")
    .select("*", { count: "exact", head: true })
    .eq("unsubscribed", false);

  const { count: totalUnsubscribed } = await db
    .from("campaign_contacts")
    .select("*", { count: "exact", head: true })
    .eq("unsubscribed", true);

  return NextResponse.json({
    total: totalContacts || 0,
    unsubscribed: totalUnsubscribed || 0,
    active: (totalContacts || 0) - (totalUnsubscribed || 0),
  });
}
