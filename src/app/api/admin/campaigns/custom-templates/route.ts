import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/** GET — list all custom email templates */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const { data, error } = await db
    .from("custom_email_templates")
    .select("id, name, subject, body_html, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load custom templates:", error);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
  }

  return NextResponse.json({ templates: data || [] });
}

/** POST — save a new custom template */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, subject, body_html } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Template name is required" }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("custom_email_templates")
    .insert({
      name: name.trim(),
      subject: subject?.trim() || "",
      body_html: body_html || "",
      created_by: auth.userId,
    })
    .select("id, name, subject, body_html, created_at")
    .single();

  if (error) {
    console.error("Failed to save custom template:", error);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}

/** DELETE — remove a custom template */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db.from("custom_email_templates").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete custom template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
