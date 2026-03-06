import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

async function verifySuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  const isAdmin =
    profile?.is_super_admin === true ||
    SUPER_ADMIN_EMAILS.includes(user.email || "");

  return isAdmin ? user : null;
}

export async function GET() {
  const user = await verifySuperAdmin();
  if (!user) {
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
  const user = await verifySuperAdmin();
  if (!user) {
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
      created_by: user.id,
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
  const user = await verifySuperAdmin();
  if (!user) {
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
