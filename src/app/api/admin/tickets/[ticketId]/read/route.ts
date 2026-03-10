import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ticketId } = await params;
  const db = createServiceClient();

  // Upsert read status for this admin
  const { error } = await db
    .from("ticket_reads")
    .upsert(
      { ticket_id: ticketId, admin_id: auth.userId, read_at: new Date().toISOString() },
      { onConflict: "ticket_id,admin_id" }
    );

  if (error) {
    console.error("Mark ticket read error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
