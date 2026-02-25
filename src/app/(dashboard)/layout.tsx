import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/providers/auth-provider";
import { OrgProvider } from "@/components/providers/org-provider";
import { SubscriptionProvider } from "@/components/providers/subscription-provider";
import { ImpersonationProvider } from "@/hooks/use-impersonation";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExtensionInstallBanner } from "@/components/dashboard/extension-install-banner";
import { PaymentBanner } from "@/components/dashboard/payment-banner";
import { NotificationsProvider } from "@/hooks/use-notifications";

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
          <ImpersonationProvider>
            <NotificationsProvider>
              <ImpersonationBanner />
              <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <DashboardHeader />
                  <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
                    <PaymentBanner />
                    <ExtensionInstallBanner />
                    {children}
                  </main>
                </div>
              </div>
            </NotificationsProvider>
          </ImpersonationProvider>
        </SubscriptionProvider>
      </OrgProvider>
    </AuthProvider>
  );
}
