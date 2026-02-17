"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, CreditCard, AlertTriangle } from "lucide-react";
import { saveOrg } from "@/lib/vault-api";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const { org, currentUserRole, refresh } = useOrg();
  const { signOut } = useAuth();
  const [name, setName] = useState(org?.name || "");
  const [domain, setDomain] = useState(org?.domain || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (org) {
      setName(org.name || "");
      setDomain(org.domain || "");
    }
  }, [org]);

  async function handleSaveOrg() {
    setSaving(true);
    try {
      await saveOrg({ name: name.trim(), domain: domain.trim() || null });
      toast.success("Organization updated");
      refresh();
    } catch {
      toast.error("Failed to update organization");
    } finally {
      setSaving(false);
    }
  }

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
        signOut();
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
      <PageHeader title="Settings" description="Manage your organization" />

      <div className="max-w-2xl space-y-6">
        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="company.com" />
            </div>
            <div className="flex items-center gap-2">
              <Label>Plan</Label>
              <Badge className="capitalize">{org?.plan || "free"}</Badge>
            </div>
            <Button onClick={handleSaveOrg} disabled={saving || currentUserRole !== "admin"}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your subscription, update payment methods, and view invoices.
            </p>
            <Link href="/settings/billing">
              <Button variant="outline">Manage Billing</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Danger Zone */}
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
