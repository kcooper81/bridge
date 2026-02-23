"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useOrg } from "@/components/providers/org-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Building, CreditCard, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";
import { ProfileTab } from "./_components/profile-tab";
import { OrganizationTab } from "./_components/organization-tab";
import { PlanUsageTab } from "./_components/plan-usage-tab";
import { TeamTab } from "./_components/team-tab";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { currentUserRole } = useOrg();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const showTeamTab = currentUserRole === "admin" || currentUserRole === "manager";
  const initialTab = searchParams.get("tab") || "profile";
  const activeTab = ["profile", "organization", "plan-usage", "team"].includes(initialTab)
    ? (initialTab === "team" && !showTeamTab ? "profile" : initialTab)
    : "profile";

  const setTab = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const qs = params.toString();
    router.replace(`/settings${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchParams, router]);

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        toast.success("Account deleted");
        await signOut();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete account");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your account and organization" />

      <div className="max-w-4xl space-y-6">
        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="organization" className="gap-1.5">
              <Building className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="plan-usage" className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              Plan & Usage
            </TabsTrigger>
            {showTeamTab && (
              <TabsTrigger value="team" className="gap-1.5">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="organization">
            <OrganizationTab />
          </TabsContent>

          <TabsContent value="plan-usage">
            <PlanUsageTab />
          </TabsContent>

          {showTeamTab && (
            <TabsContent value="team">
              <TeamTab />
            </TabsContent>
          )}
        </Tabs>

        {/* Danger Zone — always visible below tabs */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div>
              <h4 className="text-sm font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="mt-3"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
