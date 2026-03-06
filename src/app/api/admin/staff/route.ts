import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

async function verifySuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  return (
    profile?.is_super_admin === true ||
    SUPER_ADMIN_EMAILS.includes(user.email || "")
  );
}

/** GET — lightweight list of admin/support staff for assignment dropdowns */
export async function GET() {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
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
