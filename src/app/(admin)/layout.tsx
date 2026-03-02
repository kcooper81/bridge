import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AdminNav } from "@/components/admin/nav";
import { AdminHeader } from "@/components/admin/header";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { SuperAdminRole } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin, super_admin_role")
    .eq("id", user.id)
    .single();

  const emailIsAdmin = SUPER_ADMIN_EMAILS.includes(user.email || "");
  const isSuperAdmin = profile?.is_super_admin === true || emailIsAdmin;
  const isSupportStaff = profile?.super_admin_role === "support";

  // Allow access for super admins and support staff
  if (!isSuperAdmin && !isSupportStaff) {
    redirect("/vault");
  }

  // Sync the DB flag if the email is in the allow-list but the flag is missing.
  // This ensures RLS policies (which only check the DB column) work correctly.
  if (emailIsAdmin && profile?.is_super_admin !== true) {
    const db = createServiceClient();
    await db
      .from("profiles")
      .update({ is_super_admin: true })
      .eq("id", user.id);
  }

  const superAdminRole: SuperAdminRole | null = isSuperAdmin
    ? (profile?.super_admin_role as SuperAdminRole) || "super_admin"
    : isSupportStaff
      ? "support"
      : null;

  return (
    <AuthProvider initialUser={user} initialSession={session}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AdminHeader user={user} />
        <div className="flex">
          <AdminNav superAdminRole={superAdminRole} />
          <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
