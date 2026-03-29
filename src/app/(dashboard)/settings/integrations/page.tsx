"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Lock, Loader2, RefreshCw, Unplug } from "lucide-react";
import { BulkImportModal } from "@/components/dashboard/bulk-import-modal";
import { useSubscription } from "@/components/providers/subscription-provider";
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
  const { canAccess } = useSubscription();
  const searchParams = useSearchParams();
  const isAdmin = currentUserRole === "admin";
  const canGoogle = canAccess("google_workspace_sync");

  const [googleStatus, setGoogleStatus] = useState<GoogleStatus>({ connected: false });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Slack state
  const [slackStatus, setSlackStatus] = useState<{
    connected: boolean; teamName?: string; channelId?: string; channelName?: string;
    notifyDlp?: boolean; notifyPromptSubmissions?: boolean; notifyWeeklyDigest?: boolean;
  }>({ connected: false });
  const [slackConnecting, setSlackConnecting] = useState(false);
  const [slackDisconnecting, setSlackDisconnecting] = useState(false);
  const [slackChannels, setSlackChannels] = useState<Array<{ id: string; name: string; isPrivate: boolean }>>([]);
  const [slackChannelsLoading, setSlackChannelsLoading] = useState(false);
  const [slackSaving, setSlackSaving] = useState(false);

  // Bulk import modal state for sync results
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [syncedRows, setSyncedRows] = useState<BulkImportRow[]>([]);
  const [invites] = useState<Invite[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoadingStatus(false);
        return;
      }

      const [googleRes, slackRes] = await Promise.all([
        fetch("/api/integrations/google/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("/api/integrations/slack/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);
      if (googleRes.ok) setGoogleStatus(await googleRes.json());
      if (slackRes.ok) setSlackStatus(await slackRes.json());
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle ?connected= param
  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected === "google") {
      toast.success("Google Workspace connected successfully!");
      fetchStatus();
      window.history.replaceState({}, "", "/settings/integrations");
    } else if (connected === "slack") {
      toast.success("Slack connected successfully!");
      fetchStatus();
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
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        setConnecting(false);
        return;
      }

      const res = await fetch("/api/integrations/google/connect", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to start connection");
        setConnecting(false);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start connection");
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
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        setSyncing(false);
        return;
      }

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
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        setDisconnecting(false);
        return;
      }

      const res = await fetch("/api/integrations/google/disconnect", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Request failed (${res.status})`);
        return;
      }
      setGoogleStatus({ connected: false });
      toast.success("Google Workspace disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  // Slack handlers
  async function handleSlackConnect() {
    setSlackConnecting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch("/api/integrations/slack/connect", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect Slack");
      setSlackConnecting(false);
    }
  }

  async function handleSlackDisconnect() {
    if (!confirm("Disconnect Slack? Notifications will stop.")) return;
    setSlackDisconnecting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch("/api/integrations/slack/disconnect", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Slack disconnected");
      setSlackStatus({ connected: false });
      setSlackChannels([]);
    } catch {
      toast.error("Failed to disconnect Slack");
    } finally {
      setSlackDisconnecting(false);
    }
  }

  async function loadSlackChannels() {
    setSlackChannelsLoading(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/integrations/slack/channels", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Request failed (${res.status})`);
        return;
      }
      const data = await res.json();
      setSlackChannels(data.channels || []);
    } catch {
      toast.error("Failed to load channels");
    } finally {
      setSlackChannelsLoading(false);
    }
  }

  async function saveSlackConfig(updates: Record<string, unknown>) {
    setSlackSaving(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/integrations/slack/config", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Slack settings saved");
      // Update local state
      setSlackStatus((prev) => ({ ...prev, ...updates }));
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSlackSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect third-party services, directory providers, and security tools to your workspace.
        </p>
      </div>

      {/* ── Security & Governance ── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Security & Governance</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Cloudflare Gateway — featured */}
          <CloudflareCard />
        </div>
      </div>

      {/* ── Directory & Team Management ── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Directory & Team Management</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Google Workspace */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <GoogleIcon />
              </div>
              {!canGoogle ? (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="mr-1 h-2.5 w-2.5" />
                  Business
                </Badge>
              ) : loadingStatus ? (
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

            {!canGoogle ? (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/settings/billing">
                  <Lock className="mr-2 h-3.5 w-3.5" />
                  Upgrade to Business
                </Link>
              </Button>
            ) : googleStatus.connected ? (
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

        {/* Slack */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
                  <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
                  <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
                  <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
                </svg>
              </div>
              {slackStatus.connected && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                  Connected
                </Badge>
              )}
            </div>
            <h3 className="font-semibold mb-1">Slack</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {slackStatus.connected
                ? `Connected to ${slackStatus.teamName || "Slack"}${slackStatus.channelName ? ` · #${slackStatus.channelName}` : ""}`
                : "Get DLP alerts, prompt approval requests, and weekly digests in Slack."}
            </p>
            {slackStatus.connected ? (
              <div className="space-y-3">
                {/* Channel picker */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Notification Channel</label>
                  <div className="flex gap-1.5">
                    <select
                      className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
                      value={slackStatus.channelId || ""}
                      onChange={(e) => {
                        const ch = slackChannels.find((c) => c.id === e.target.value);
                        if (ch) saveSlackConfig({ channelId: ch.id, channelName: ch.name });
                      }}
                      onFocus={() => { if (slackChannels.length === 0) loadSlackChannels(); }}
                    >
                      <option value="">{slackChannelsLoading ? "Loading..." : "Select a channel"}</option>
                      {slackChannels.map((ch) => (
                        <option key={ch.id} value={ch.id}>{ch.isPrivate ? "🔒 " : "#"}{ch.name}</option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={loadSlackChannels} disabled={slackChannelsLoading}>
                      <RefreshCw className={`h-3 w-3 ${slackChannelsLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
                {/* Notification toggles */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Notifications</label>
                  {[
                    { key: "notifyDlp", label: "DLP violations", checked: slackStatus.notifyDlp !== false },
                    { key: "notifyPromptSubmissions", label: "Prompt submissions", checked: slackStatus.notifyPromptSubmissions !== false },
                    { key: "notifyWeeklyDigest", label: "Weekly digest", checked: slackStatus.notifyWeeklyDigest !== false },
                  ].map((toggle) => (
                    <label key={toggle.key} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={toggle.checked}
                        onChange={(e) => saveSlackConfig({ [toggle.key]: e.target.checked })}
                        disabled={slackSaving}
                      />
                      {toggle.label}
                    </label>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={handleSlackDisconnect} disabled={slackDisconnecting}>
                  {slackDisconnecting ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Unplug className="h-3 w-3 mr-1.5" />}
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={handleSlackConnect} disabled={slackConnecting}>
                {slackConnecting ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : null}
                Connect Slack
              </Button>
            )}
          </CardContent>
        </Card>

        </div>
      </div>

      {/* ── Developer Tools ── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Developer Tools</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* MCP Server */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <svg className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 5a7 7 0 110 14 7 7 0 010-14z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold mb-1">MCP Server</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect Claude Desktop, Cursor, Windsurf, and other AI tools to your prompt library, DLP, and audit logging.
            </p>
            <Link href="/settings/integrations/mcp">
              <Button variant="outline" size="sm" className="w-full">
                Configure
              </Button>
            </Link>
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

// ── Cloudflare Gateway Integration Card ──

function CloudflareIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 12.5l-2.3-6.8c-.1-.4-.5-.7-1-.7-.4 0-.8.2-1 .5L8.5 12.5H5c-.3 0-.5.2-.5.5s.2.5.5.5h14c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-2.5z" fill="#F6821F"/>
      <path d="M19.4 12.5l-1.1-3.4c-.1-.2-.3-.4-.5-.4-.3 0-.5.2-.6.4l-.7 3.4h2.9z" fill="#FBAD41"/>
    </svg>
  );
}

function CloudflareCard() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tools, setTools] = useState<{ id: string; name: string; domains: string[]; category: string; blocked: boolean }[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const fetchStatus = useCallback(async () => {
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/integrations/cloudflare", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConnected(data.connected);
        setTools(data.tools || []);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function handleConnect() {
    if (!accountId.trim() || !apiToken.trim()) {
      toast.error("Account ID and API token are required");
      return;
    }
    setConnecting(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/integrations/cloudflare", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect", account_id: accountId.trim(), api_token: apiToken.trim() }),
      });

      if (res.ok) {
        toast.success("Cloudflare Gateway connected");
        setWizardStep(3);
        fetchStatus();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to connect");
      }
    } catch {
      toast.error("Connection failed");
    } finally {
      setConnecting(false);
    }
  }

  async function handleSync(blockedToolIds: string[]) {
    setSyncing(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/integrations/cloudflare", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", blockedToolIds }),
      });

      if (res.ok) {
        const data = await res.json();
        const parts = [];
        if (data.created > 0) parts.push(`${data.created} blocked`);
        if (data.deleted > 0) parts.push(`${data.deleted} unblocked`);
        toast.success(parts.length > 0 ? `Synced: ${parts.join(", ")}` : "Already in sync");
        fetchStatus();
      } else {
        const data = await res.json();
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect Cloudflare Gateway? Existing block rules will remain in Cloudflare until manually removed.")) return;
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/integrations/cloudflare", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      toast.success("Disconnected");
      setConnected(false);
      setTools((prev) => prev.map((t) => ({ ...t, blocked: false })));
    } catch {
      toast.error("Failed to disconnect");
    }
  }

  function toggleTool(toolId: string) {
    const updated = tools.map((t) =>
      t.id === toolId ? { ...t, blocked: !t.blocked } : t
    );
    setTools(updated);
    handleSync(updated.filter((t) => t.blocked).map((t) => t.id));
  }

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-muted/50">
            <CloudflareIcon />
          </div>
          {connected ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Not Connected</Badge>
          )}
        </div>

        <h3 className="font-semibold mb-1">Cloudflare Gateway</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Block unapproved AI tools at the DNS level. Covers browser, native apps, and mobile — network-wide enforcement.
        </p>

        {connected ? (
          <div className="space-y-3">
            {/* Next steps guidance */}
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-emerald-600">Connected! Next steps:</p>
              <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Check the boxes below to block unapproved AI tools at the DNS level</li>
                <li>Go to <a href="/guardrails" className="text-primary hover:underline">Guardrails → AI Tools</a> tab for unified policy management</li>
                <li>Deploy <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cloudflare WARP</a> on team devices for network-wide enforcement</li>
              </ol>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Tools</p>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {tools.map((tool) => (
                <label
                  key={tool.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tool.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{tool.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.blocked && (
                      <span className="text-[10px] font-bold text-red-500 uppercase">Blocked</span>
                    )}
                    <input
                      type="checkbox"
                      checked={tool.blocked}
                      onChange={() => toggleTool(tool.id)}
                      disabled={syncing}
                      className="rounded"
                    />
                  </div>
                </label>
              ))}
            </div>
            {syncing && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing with Cloudflare...
              </p>
            )}
            <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={handleDisconnect}>
              <Unplug className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        ) : showSetup ? (
          <div className="space-y-4">
            {/* Wizard progress */}
            <div className="flex items-center gap-1 mb-2">
              {[
                { n: 1, label: "Get Token" },
                { n: 2, label: "Paste Credentials" },
                { n: 3, label: "Done" },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-1.5 flex-1">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                    wizardStep > n ? "bg-emerald-500 text-white" : wizardStep === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {wizardStep > n ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                  </div>
                  <span className={cn("text-[10px] font-medium hidden sm:inline", wizardStep >= n ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                  {n < 3 && <div className={cn("flex-1 h-px", wizardStep > n ? "bg-emerald-500" : "bg-border")} />}
                </div>
              ))}
            </div>

            {/* Step 1: Get Token */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Don&apos;t have a Cloudflare account?</p>
                  <p className="text-[11px] text-muted-foreground">Sign up free at <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dash.cloudflare.com/sign-up</a>. You can use Google, GitHub, or Apple to sign in. The free plan covers up to 50 users.</p>
                </div>

                <p className="text-sm font-semibold">Step 1: Create an API token</p>

                <div className="rounded-lg border border-border divide-y divide-border">
                  {[
                    { text: <>Open <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Cloudflare API Tokens page</a> (opens in new tab)</>, detail: "Log in with your Cloudflare account. Google/GitHub/Apple SSO works." },
                    { text: <>Click the blue <strong className="text-foreground">&ldquo;Create Token&rdquo;</strong> button</>, detail: null },
                    { text: <>Scroll to the bottom and click <strong className="text-foreground">&ldquo;Get started&rdquo;</strong> next to &ldquo;Create Custom Token&rdquo;</>, detail: "Don't use the pre-built templates — they don't have the right permissions." },
                    { text: <>Set <strong className="text-foreground">Token name</strong> to <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">TeamPrompt</code></>, detail: null },
                    { text: <>Under <strong className="text-foreground">Permissions</strong>, set the 3 dropdowns to: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">Account</code> → <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">Zero Trust</code> → <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">Edit</code></>, detail: "Click the first dropdown → Account. Second → Zero Trust. Third → Edit." },
                    { text: <>Under <strong className="text-foreground">Account Resources</strong>, select <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">Include</code> → <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">All accounts</code></>, detail: null },
                    { text: <>Click <strong className="text-foreground">&ldquo;Continue to summary&rdquo;</strong> then <strong className="text-foreground">&ldquo;Create Token&rdquo;</strong></>, detail: null },
                    { text: <>Click the <strong className="text-foreground">copy button</strong> next to the token value</>, detail: "Important: you won't see this token again after leaving the page. Paste it somewhere safe." },
                  ].map((step, i) => (
                    <div key={i} className="px-3 py-2.5">
                      <div className="flex gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <p className="text-[11px]">{step.text}</p>
                          {step.detail && <p className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                  <p className="text-xs font-semibold text-amber-600 mb-1">Where is my Account ID?</p>
                  <p className="text-[11px] text-muted-foreground">Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dash.cloudflare.com</a>. Your Account ID is on the right side of the main page — a long string like <code className="bg-muted px-1 py-0.5 rounded text-[10px]">a1b2c3d4e5f6g7h8...</code>. Click it to copy.</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => setWizardStep(2)}>
                    I have my Account ID and Token
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowSetup(false); setWizardStep(1); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Paste Credentials */}
            {wizardStep === 2 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold">Step 2: Paste your credentials</p>
                <div>
                  <label className="text-xs font-medium">Account ID</label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="Paste your Account ID here"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                    autoFocus
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">A 32-character hex string from your Cloudflare dashboard.</p>
                </div>
                <div>
                  <label className="text-xs font-medium">API Token</label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Paste your API token here"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">The token you copied in Step 1. Starts with a long string of letters and numbers.</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-[10px] text-muted-foreground"><strong>Common issues:</strong></p>
                  <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                    <li><strong>&ldquo;Invalid credentials&rdquo;</strong> — make sure you selected &ldquo;Zero Trust → Edit&rdquo; permission, not just &ldquo;Read&rdquo;</li>
                    <li><strong>Token not working</strong> — tokens can only be copied once. If you lost it, create a new one</li>
                    <li><strong>Account ID wrong</strong> — it&apos;s 32 characters, found on the Cloudflare dashboard home page</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setWizardStep(1)}>
                    ← Back
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleConnect} disabled={connecting || !accountId.trim() || !apiToken.trim()}>
                    {connecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying connection...</> : "Connect to Cloudflare"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Setup Complete — Required Next Steps */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mx-auto mb-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold">API connected! Now finish setup:</p>
                </div>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-semibold text-amber-600 mb-2">Important: Two more steps required for blocking to work</p>
                  <p className="text-[11px] text-muted-foreground">
                    Connecting the API alone doesn&apos;t block anything yet. You need to (1) choose which tools to block, and (2) install Cloudflare WARP on your team&apos;s devices.
                  </p>
                </div>

                <div className="rounded-lg border border-border divide-y divide-border">
                  <div className="p-3">
                    <div className="flex gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">1</span>
                      <div>
                        <p className="text-xs font-semibold">Set up your AI Tool Policy</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Choose which AI tools to approve and which to block. Blocked tools will be enforced at the DNS level.</p>
                        <Button size="sm" className="mt-2 h-7 text-xs" asChild>
                          <a href="/guardrails">Go to Guardrails → AI Tools</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">2</span>
                      <div>
                        <p className="text-xs font-semibold">Install Cloudflare WARP on team devices</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">WARP routes your team&apos;s DNS through Cloudflare Gateway. Without it, the DNS rules won&apos;t be enforced. Download for Windows, macOS, iOS, Android, and Linux.</p>
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" asChild>
                          <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/download-warp/" target="_blank" rel="noopener noreferrer">Download WARP →</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold shrink-0">3</span>
                      <div>
                        <p className="text-xs font-semibold">Enroll devices in your Zero Trust org</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">After installing WARP, team members open the app and connect to your Cloudflare Zero Trust organization. For managed devices, use <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/deployment/mdm-deployment/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MDM deployment</a> for automatic enrollment.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={() => { setShowSetup(false); setWizardStep(1); }}>
                  I&apos;ll finish setup later
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowSetup(true)}>
            Connect Cloudflare
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
