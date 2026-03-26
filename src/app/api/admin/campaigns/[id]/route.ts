import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/** GET — single campaign */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const db = createServiceClient();
  const { data, error } = await db
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign: data });
}

/** PATCH — update campaign draft */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { name, subject, from_email, body_html, segment_name } = body;

  if (name !== undefined && typeof name === "string" && !name.trim()) {
    return NextResponse.json({ error: "Campaign name cannot be empty" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (name !== undefined) updates.name = name.trim();
  if (subject !== undefined) updates.subject = subject.trim();
  if (from_email !== undefined) updates.from_email = from_email.trim();
  if (body_html !== undefined) updates.body_html = body_html;
  if (segment_name !== undefined) updates.segment_name = segment_name || null;

  const db = createServiceClient();

  // Only allow editing drafts
  const { data: existing } = await db
    .from("email_campaigns")
    .select("status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft campaigns can be edited" },
      { status: 400 }
    );
  }

  const { data, error } = await db
    .from("email_campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Campaign update error:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }

  return NextResponse.json({ campaign: data });
}

/** DELETE — remove a draft campaign, or archive a sent campaign (?archive=true) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const archive = new URL(request.url).searchParams.get("archive") === "true";
  const db = createServiceClient();

  const { data: existing } = await db
    .from("email_campaigns")
    .select("status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (archive) {
    // Archive: set status to "archived"
    const { error } = await db.from("email_campaigns").update({ status: "archived" }).eq("id", id);
    if (error) {
      console.error("Campaign archive error:", error);
      return NextResponse.json({ error: "Failed to archive campaign" }, { status: 500 });
    }
    return NextResponse.json({ success: true, archived: true });
  }

  // Delete: only drafts
  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft campaigns can be deleted. Use ?archive=true for sent campaigns." },
      { status: 400 }
    );
  }

  const { error } = await db.from("email_campaigns").delete().eq("id", id);
  if (error) {
    console.error("Campaign delete error:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
