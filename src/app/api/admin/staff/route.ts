import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/** GET — lightweight list of admin/support staff for assignment dropdowns */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();

  const { data: staff, error } = await db
    .from("profiles")
    .select("id, email, name, super_admin_role")
    .or("is_super_admin.eq.true,super_admin_role.not.is.null")
    .order("name", { ascending: true });

  if (error) {
    console.error("Staff list fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }

  return NextResponse.json({ staff: staff || [] });
}
