"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useOrg } from "@/components/providers/org-provider";
import { ProfileTab } from "./_components/profile-tab";
import { TwoFactorCard } from "./_components/two-factor-card";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { org, members, currentUserRole, refresh } = useOrg();
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function handleLeaveOrg() {
    const memberCount = members.length;
    const message = memberCount <= 1
      ? "You are the only member. Leaving will delete this organization and all its data. Continue?"
      : "Are you sure you want to leave this organization? You will lose access to all shared prompts and data.";

    if (!confirm(message)) return;

    setLeaving(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        setLeaving(false);
        return;
      }

      const res = await fetch("/api/account/leave-org", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        toast.success("You have left the organization.");
        await refresh();
        window.location.href = "/home";
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to leave organization");
      }
    } catch {
      toast.error("Failed to leave organization");
    } finally {
      setLeaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        setDeleting(false);
        return;
      }

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
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl px-4 sm:px-0 space-y-6">
      <ProfileTab />

      {(currentUserRole === "admin" || currentUserRole === "manager") && (
        <TwoFactorCard />
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          {/* Leave Organization */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LogOut className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Leave Organization</h4>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Leave <strong>{org?.name || "your organization"}</strong> and create a new personal workspace.
              {members.length > 1
                ? " You will lose access to all shared prompts, guidelines, and team data. An admin will need to re-invite you if you want to rejoin."
                : " Since you are the only member, the organization and all its data will be deleted."}
            </p>
            <Button
              variant="outline"
              className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={handleLeaveOrg}
              disabled={leaving}
            >
              {leaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Leave Organization
            </Button>
          </div>

          <Separator />

          {/* Delete Account */}
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
  );
}
