import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("mailbox_settings")
    .select("*")
    .order("email");

  if (error) {
    console.error("Mailbox settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ mailboxes: data || [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, display_name, signature_html, auto_reply_enabled, auto_reply_subject, auto_reply_body, use_branded_template } = body;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const db = createServiceClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (display_name !== undefined) updates.display_name = display_name;
  if (signature_html !== undefined) updates.signature_html = signature_html;
  if (auto_reply_enabled !== undefined) updates.auto_reply_enabled = auto_reply_enabled;
  if (auto_reply_subject !== undefined) updates.auto_reply_subject = auto_reply_subject;
  if (auto_reply_body !== undefined) updates.auto_reply_body = auto_reply_body;
  if (use_branded_template !== undefined) updates.use_branded_template = use_branded_template;

  const { data, error } = await db
    .from("mailbox_settings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Mailbox settings update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ mailbox: data });
}
