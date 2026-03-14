import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/**
 * GET — return all audience lists with contact counts.
 */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();

  const { data: lists, error } = await db
    .from("audience_lists")
    .select("id, name, description, contact_count, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load audience lists:", error);
    return NextResponse.json({ error: "Failed to load lists" }, { status: 500 });
  }

  return NextResponse.json({ lists: lists || [] });
}

/**
 * DELETE — delete an audience list (does not delete the contacts themselves).
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = createServiceClient();

  const { error } = await db.from("audience_lists").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete list:", error);
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
