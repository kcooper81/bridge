import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/**
 * POST — import external contacts from CSV data.
 * Stores them in campaign_contacts table for use in campaigns.
 *
 * Body: { contacts: Array<{ email: string; first_name?: string; last_name?: string }> }
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { contacts } = body;

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
  const valid: Array<{ email: string; first_name: string; last_name: string }> = [];

  for (const c of contacts) {
    const email = c.email?.trim()?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    valid.push({
      email,
      first_name: c.first_name?.trim() || "",
      last_name: c.last_name?.trim() || "",
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
        source: "csv_import",
        imported_by: auth.userId,
      })),
      { onConflict: "email" }
    );

  if (error) {
    console.error("Contact import error:", error);
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 });
  }

  return NextResponse.json({
    imported: valid.length,
    skipped: contacts.length - valid.length,
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
