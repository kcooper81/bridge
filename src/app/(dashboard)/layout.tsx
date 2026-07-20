import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSeatStatus } from "@/lib/billing/seats";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { AuthProvider } from "@/components/providers/auth-provider";
import { OrgProvider } from "@/components/providers/org-provider";
import { SubscriptionProvider } from "@/components/providers/subscription-provider";
import { ImpersonationProvider } from "@/hooks/use-impersonation";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { Sidebar, SidebarProvider } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExtensionInstallBanner } from "@/components/dashboard/extension-install-banner";
import { MfaRequiredBanner } from "@/app/(dashboard)/settings/_components/mfa-required-banner";
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

  // Seat entitlement gate. After a downgrade an org can hold more members than
  // its plan allows; rather than deleting anyone, members outside the seat
  // ordering lose access until the org upgrades or frees a seat. Admins are
  // always seated (they rank first) so an org can always be fixed from inside.
  // Fails open — see getSeatStatus.
  const { data: seatProfile } = await createServiceClient()
    .from("profiles")
    .select("org_id, is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (seatProfile?.org_id && !seatProfile.is_super_admin) {
    const seat = await getSeatStatus(user.id, seatProfile.org_id);
    if (!seat.hasSeat) {
      redirect("/seat-unavailable");
    }
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
              <SidebarProvider>
                <ImpersonationBanner />
                <div className="flex min-h-dvh bg-background">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
                      <PaymentBanner />
                      <ExtensionInstallBanner />
                      <MfaRequiredBanner />
                      {children}
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </NotificationsProvider>
          </ImpersonationProvider>
        </SubscriptionProvider>
      </OrgProvider>
    </AuthProvider>
  );
}
