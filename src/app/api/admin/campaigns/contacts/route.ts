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
      // Get contact IDs for all imported emails (batch to avoid URL length limits)
      const allContactRows: { id: string; email: string }[] = [];
      const emailBatches: string[][] = [];
      for (let i = 0; i < valid.length; i += 50) {
        emailBatches.push(valid.slice(i, i + 50).map((c) => c.email));
      }
      for (const batch of emailBatches) {
        const { data } = await db
          .from("campaign_contacts")
          .select("id, email")
          .in("email", batch);
        if (data) allContactRows.push(...data);
      }
      const contactRows = allContactRows;

      if (contactRows.length > 0) {
        // Link contacts to the list (batch upserts too)
        for (let i = 0; i < contactRows.length; i += 50) {
          const batch = contactRows.slice(i, i + 50);
          await db
            .from("audience_list_contacts")
            .upsert(
              batch.map((c) => ({
                list_id: listId!,
                contact_id: c.id,
              })),
              { onConflict: "list_id,contact_id" }
            );
        }

        // Update contact count (count actual linked contacts, not just this batch)
        const { count: totalLinked } = await db
          .from("audience_list_contacts")
          .select("*", { count: "exact", head: true })
          .eq("list_id", listId);

        await db
          .from("audience_lists")
          .update({
            contact_count: totalLinked || 0,
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
 * GET — list imported external contacts with counts and optional full listing.
 * Query params:
 *   ?detail=true  — return full contact list (paginated)
 *   &limit=50     — page size (default 50, max 200)
 *   &offset=0     — pagination offset
 *   &search=...   — filter by email, first_name, last_name, or company
 *   &list_id=...  — filter to contacts in a specific audience list
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const url = new URL(request.url);
  const detail = url.searchParams.get("detail") === "true";

  if (!detail) {
    // Summary mode (backwards compatible)
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

  // Detail mode — return actual contacts
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const search = url.searchParams.get("search")?.trim().toLowerCase();
  const listId = url.searchParams.get("list_id");

  // If filtering by list, use a join instead of .in() to avoid URL length limits
  if (listId) {
    // Count contacts in this list
    const { count: listTotal } = await db
      .from("audience_list_contacts")
      .select("contact_id", { count: "exact", head: true })
      .eq("list_id", listId);

    if (!listTotal || listTotal === 0) {
      return NextResponse.json({ contacts: [], total: 0, limit, offset });
    }

    // Get contact IDs for current page
    const linkedQuery = db
      .from("audience_list_contacts")
      .select("contact_id")
      .eq("list_id", listId);

    const { data: linked } = await linkedQuery;
    const listContactIds = (linked || []).map((l) => l.contact_id);

    if (listContactIds.length === 0) {
      return NextResponse.json({ contacts: [], total: 0, limit, offset });
    }

    // Batch the .in() query to avoid URL length limits
    const allContacts: Array<Record<string, unknown>> = [];
    for (let i = 0; i < listContactIds.length; i += 50) {
      const batch = listContactIds.slice(i, i + 50);
      let q = db
        .from("campaign_contacts")
        .select("id, email, first_name, last_name, company, unsubscribed, source, created_at")
        .in("id", batch);

      if (search) {
        const safe = search.replace(/[,().\\]/g, "");
        if (safe) q = q.or(`email.ilike.%${safe}%,first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,company.ilike.%${safe}%`);
      }

      const { data } = await q;
      if (data) allContacts.push(...data);
    }

    // Sort by created_at desc and paginate
    allContacts.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());
    const total = allContacts.length;
    const paginated = allContacts.slice(offset, offset + limit);

    return NextResponse.json({ contacts: paginated, total, limit, offset });
  }

  // Build query
  let countQuery = db
    .from("campaign_contacts")
    .select("*", { count: "exact", head: true });

  let dataQuery = db
    .from("campaign_contacts")
    .select("id, email, first_name, last_name, company, unsubscribed, source, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    // Escape special PostgREST filter characters
    const safe = search.replace(/[,().\\]/g, "");
    if (safe) {
      const filter = `email.ilike.%${safe}%,first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,company.ilike.%${safe}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }
  }

  const [{ count }, { data: contacts }] = await Promise.all([countQuery, dataQuery]);

  return NextResponse.json({
    contacts: contacts || [],
    total: count || 0,
    limit,
    offset,
  });
}
