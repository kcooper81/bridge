import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/providers/auth-provider";
import { OrgProvider } from "@/components/providers/org-provider";
import { SubscriptionProvider } from "@/components/providers/subscription-provider";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
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

  return (
    <AuthProvider initialUser={user} initialSession={session}>
      <OrgProvider>
        <SubscriptionProvider>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto scrollbar-thin p-4 pt-16 md:p-6 md:pt-6">
              {children}
            </main>
          </div>
        </SubscriptionProvider>
      </OrgProvider>
    </AuthProvider>
  );
}
