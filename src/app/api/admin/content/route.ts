import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/** GET — list all content pipeline items */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const { data, error } = await db
    .from("content_pipeline")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Content pipeline fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

/** POST — create a new content idea */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("content_pipeline")
    .insert({
      title: body.title.trim(),
      type: body.type || "blog",
      status: body.status || "idea",
      content: body.content || null,
      target_keywords: body.target_keywords || [],
      source_query: body.source_query || null,
      notes: body.notes || null,
      created_by: auth.userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Content pipeline insert error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

/** PATCH — update a content item */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.type !== undefined) updates.type = body.type;
  if (body.status !== undefined) updates.status = body.status;
  if (body.content !== undefined) updates.content = body.content;
  if (body.target_keywords !== undefined) updates.target_keywords = body.target_keywords;
  if (body.source_query !== undefined) updates.source_query = body.source_query;
  if (body.notes !== undefined) updates.notes = body.notes;

  const db = createServiceClient();
  const { data, error } = await db
    .from("content_pipeline")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    console.error("Content pipeline update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

/** DELETE — remove a content item */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const db = createServiceClient();
  const { error } = await db
    .from("content_pipeline")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Content pipeline delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
