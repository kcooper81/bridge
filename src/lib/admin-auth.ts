import { createClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { SuperAdminRole } from "@/lib/constants";

export interface AdminAuth {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  role: SuperAdminRole | null;
}

/**
 * Verify admin access for API routes.
 * Returns null if the user is not authenticated or not an admin/support.
 */
export async function verifyAdminAccess(): Promise<AdminAuth | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin, super_admin_role")
    .eq("id", user.id)
    .single();

  const emailIsAdmin = SUPER_ADMIN_EMAILS.includes(user.email || "");
  const isSuperAdmin = profile?.is_super_admin === true || emailIsAdmin;
  const isSupportStaff = profile?.super_admin_role === "support";

  if (!isSuperAdmin && !isSupportStaff) return null;

  const role: SuperAdminRole | null = isSuperAdmin
    ? (profile?.super_admin_role as SuperAdminRole) || "super_admin"
    : "support";

  return { userId: user.id, email: user.email || "", isSuperAdmin, role };
}
