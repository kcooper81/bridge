import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("canned_responses")
    .select("id, title, content, category, created_at")
    .order("category")
    .order("title");

  if (error) {
    console.error("Canned responses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ responses: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, category = "general" } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Title and content required" },
      { status: 400 }
    );
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("canned_responses")
    .insert({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      created_by: auth.userId,
    })
    .select("id, title, content, category, created_at")
    .single();

  if (error) {
    console.error("Canned response create error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }

  return NextResponse.json({ response: data });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const db = createServiceClient();
  const { error } = await db.from("canned_responses").delete().eq("id", id);

  if (error) {
    console.error("Canned response delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
