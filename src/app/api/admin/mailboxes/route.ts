import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/** GET — list all mailbox settings (for compose inbox selector) */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const { data, error } = await db
    .from("mailbox_settings")
    .select("email, display_name, use_branded_template")
    .order("email");

  if (error) {
    return NextResponse.json({ error: "Failed to load mailboxes" }, { status: 500 });
  }

  return NextResponse.json({ mailboxes: data || [] });
}
