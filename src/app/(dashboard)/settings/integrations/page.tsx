"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Unplug } from "lucide-react";
import { BulkImportModal } from "@/components/dashboard/bulk-import-modal";
import { toast } from "sonner";
import Link from "next/link";
import type { BulkImportRow, Invite } from "@/lib/types";

interface GoogleStatus {
  connected: boolean;
  adminEmail?: string;
  lastSyncedAt?: string;
  connectedAt?: string;
}

function GoogleIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

function ScimIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export default function IntegrationsPage() {
  const { currentUserRole, teams, members, refresh } = useOrg();
  const searchParams = useSearchParams();
  const isAdmin = currentUserRole === "admin";

  const [googleStatus, setGoogleStatus] = useState<GoogleStatus>({ connected: false });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Bulk import modal state for sync results
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [syncedRows, setSyncedRows] = useState<BulkImportRow[]>([]);
  const [invites] = useState<Invite[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/integrations/google/status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setGoogleStatus(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle ?connected=google param
  useEffect(() => {
    if (searchParams.get("connected") === "google") {
      toast.success("Google Workspace connected successfully!");
      fetchStatus();
      // Clean up URL
      window.history.replaceState({}, "", "/settings/integrations");
    }
    if (searchParams.get("error")) {
      toast.error(`Connection failed: ${searchParams.get("error")}`);
      window.history.replaceState({}, "", "/settings/integrations");
    }
  }, [searchParams, fetchStatus]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/integrations/google/connect", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start connection");
        setConnecting(false);
      }
    } catch {
      toast.error("Failed to connect");
      setConnecting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/integrations/google/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Sync failed");
        return;
      }

      if (data.users && data.users.length > 0) {
        setSyncedRows(data.users);
        setBulkImportOpen(true);
        toast.success(
          `Found ${data.users.length} new user(s) (${data.alreadyMembers} already members)`
        );
      } else {
        toast.info(
          `All ${data.totalDirectoryUsers} directory users are already members`
        );
      }

      fetchStatus();
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect Google Workspace? This won't remove any synced members.")) return;
    setDisconnecting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/integrations/google/disconnect", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setGoogleStatus({ connected: false });
      toast.success("Google Workspace disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings/organization"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Organization
        </Link>
        <h2 className="text-lg font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect third-party directory providers to sync your team
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Google Workspace */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <GoogleIcon />
              </div>
              {loadingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : googleStatus.connected ? (
                <Badge
                  variant="outline"
                  className="text-xs text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/30"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Not connected
                </Badge>
              )}
            </div>

            <h3 className="font-semibold mb-1">Google Workspace</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sync your organization&apos;s directory from Google Workspace. Import users and map Google groups to TeamPrompt teams.
            </p>

            {googleStatus.connected ? (
              <div className="space-y-3">
                {googleStatus.adminEmail && (
                  <p className="text-xs text-muted-foreground">
                    Connected as {googleStatus.adminEmail}
                  </p>
                )}
                {googleStatus.lastSyncedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {new Date(googleStatus.lastSyncedAt).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleSync}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    )}
                    Sync Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-destructive"
                  >
                    {disconnecting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unplug className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!isAdmin || connecting}
                onClick={handleConnect}
                title={!isAdmin ? "Only admins can connect integrations" : undefined}
              >
                {connecting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Connect
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Microsoft Entra ID */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <MicrosoftIcon />
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Coming Soon
              </Badge>
            </div>
            <h3 className="font-semibold mb-1">Microsoft Entra ID</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect to Microsoft Entra ID (Azure AD) to sync your organization&apos;s directory and user groups.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* SCIM 2.0 */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <ScimIcon />
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Coming Soon
              </Badge>
            </div>
            <h3 className="font-semibold mb-1">SCIM 2.0</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enable SCIM provisioning for automated user lifecycle management with Okta, OneLogin, JumpCloud, and more.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Import Modal — used for sync results */}
      <BulkImportModal
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        teams={teams}
        members={members}
        pendingInvites={invites}
        initialRows={syncedRows}
        onComplete={() => {
          refresh();
          setSyncedRows([]);
        }}
      />
    </div>
  );
}
