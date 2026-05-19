"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ArrowRight, CheckCircle2, Copy, Lock, Loader2, Building, Mail, Plug, Settings, ShieldCheck } from "lucide-react";
import { saveOrg } from "@/lib/vault-api";
import { useSubscription } from "@/components/providers/subscription-provider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export function OrganizationTab() {
  const { org, currentUserRole, refresh } = useOrg();
  const { canAccess } = useSubscription();
  const [name, setName] = useState(org?.name || "");
  const [domain, setDomain] = useState(org?.domain || "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Preferences
  const [allowPersonalPrompts, setAllowPersonalPrompts] = useState(
    org?.settings?.allow_personal_prompts ?? true
  );
  const [requireMfa, setRequireMfa] = useState(
    org?.settings?.require_mfa_for_admins ?? false
  );
  const [autoJoinDomain, setAutoJoinDomain] = useState(
    org?.settings?.auto_join_domain ?? false
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    org?.settings?.invite_welcome_message ?? ""
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Domain verification state — populated on mount + after init/check
  interface VerifyState {
    verified: boolean;
    verifiedAt: string | null;
    blocked: boolean;
    instructions: { host: string; type: string; value: string } | null;
  }
  const [verifyState, setVerifyState] = useState<VerifyState | null>(null);
  const [verifying, setVerifying] = useState(false);

  const loadVerifyState = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch("/api/org/domain/verify", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setVerifyState(await res.json());
    } catch {
      // Non-fatal — UI just won't render verification widget
    }
  };

  useEffect(() => {
    if (org?.domain && currentUserRole === "admin") loadVerifyState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.domain, currentUserRole]);

  async function handleVerifyAction(action: "init" | "check") {
    setVerifying(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch("/api/org/domain/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Domain verification failed");
        return;
      }
      if (action === "init") {
        toast.success("Verification token generated — add the DNS record, then click Check");
      } else {
        toast.success("Domain verified");
      }
      await loadVerifyState();
    } catch {
      toast.error("Domain verification failed");
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    if (org && !dirty) {
      setName(org.name || "");
      setDomain(org.domain || "");
      setAllowPersonalPrompts(org.settings?.allow_personal_prompts ?? true);
      setRequireMfa(org.settings?.require_mfa_for_admins ?? false);
      setAutoJoinDomain(org.settings?.auto_join_domain ?? false);
      setWelcomeMessage(org.settings?.invite_welcome_message ?? "");
    }
  }, [org, dirty]);

  const isAdmin = currentUserRole === "admin";

  async function handleSaveOrg() {
    setSaving(true);
    try {
      const result = await saveOrg({ name: name.trim(), domain: domain.trim() || null });
      if (!result) {
        toast.error("Failed to update organization");
        return;
      }
      toast.success("Organization updated");
      setDirty(false);
      refresh();
    } catch {
      toast.error("Failed to update organization");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePrefs() {
    setSavingPrefs(true);
    try {
      const merged = {
        ...(org?.settings || {}),
        allow_personal_prompts: allowPersonalPrompts,
        require_mfa_for_admins: requireMfa,
        auto_join_domain: autoJoinDomain,
        invite_welcome_message: welcomeMessage.trim() || undefined,
      };
      const result = await saveOrg({ settings: merged });
      if (!result) {
        toast.error("Failed to update preferences");
        return;
      }
      toast.success("Preferences updated");
      refresh();
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setSavingPrefs(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} disabled={!isAdmin} />
          </div>
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setDirty(true); }}
              placeholder="company.com"
              disabled={!isAdmin}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>Plan</Label>
            <Badge className="capitalize">{org?.plan || "free"}</Badge>
          </div>
          <Button onClick={handleSaveOrg} disabled={saving || !isAdmin}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Organization Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-personal">Allow Personal Prompts</Label>
              <p className="text-sm text-muted-foreground">
                Let members create prompts visible only to themselves
              </p>
            </div>
            <Switch
              id="allow-personal"
              checked={allowPersonalPrompts}
              onCheckedChange={setAllowPersonalPrompts}
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-mfa" className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Require 2FA for Admins &amp; Managers
              </Label>
              <p className="text-sm text-muted-foreground">
                Require admins and managers to enable two-factor authentication. They&apos;ll see a banner until they set it up.
              </p>
            </div>
            <Switch
              id="require-mfa"
              checked={requireMfa}
              onCheckedChange={setRequireMfa}
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-join-domain" className="flex items-center gap-1.5">
                  Auto-Join by Domain
                  {!canAccess("domain_auto_join") && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                      <Lock className="h-2.5 w-2.5 mr-0.5" />
                      Team
                    </Badge>
                  )}
                  {verifyState?.verified && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Verified
                    </Badge>
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {!canAccess("domain_auto_join")
                    ? "Upgrade to Team to let matching-domain users auto-join"
                    : !org?.domain
                      ? "Set a domain above to enable auto-join"
                      : verifyState?.blocked
                        ? `${org.domain} is a public webmail or disposable domain — auto-join is disabled for those.`
                        : !verifyState?.verified
                          ? `Verify ownership of ${org.domain} before enabling auto-join`
                          : `New users with @${org.domain} emails will automatically join this organization`}
                </p>
              </div>
              <Switch
                id="auto-join-domain"
                checked={autoJoinDomain}
                onCheckedChange={setAutoJoinDomain}
                disabled={
                  !isAdmin ||
                  !org?.domain ||
                  !canAccess("domain_auto_join") ||
                  !verifyState?.verified ||
                  verifyState?.blocked
                }
              />
            </div>

            {isAdmin && canAccess("domain_auto_join") && org?.domain && !verifyState?.blocked && !verifyState?.verified && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium">Verify domain ownership</div>
                    <p className="text-muted-foreground mt-0.5">
                      Add a TXT record to <code className="bg-background px-1 rounded text-xs">{org.domain}</code> so we know you control it.
                      Without this, anyone with an @{org.domain} email could auto-join your org.
                    </p>
                  </div>
                </div>
                {verifyState?.instructions ? (
                  <div className="rounded-md bg-background p-3 space-y-2 text-xs font-mono">
                    <Row label="Host" value={verifyState.instructions.host} />
                    <Row label="Type" value={verifyState.instructions.type} />
                    <Row label="Value" value={verifyState.instructions.value} copyable />
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleVerifyAction("init")} disabled={verifying}>
                    {verifying && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    {verifyState?.instructions ? "Regenerate token" : "Generate token"}
                  </Button>
                  {verifyState?.instructions && (
                    <Button size="sm" onClick={() => handleVerifyAction("check")} disabled={verifying}>
                      {verifying && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                      Check now
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSavePrefs} disabled={savingPrefs || !isAdmin}>
            {savingPrefs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Invite Email */}
      {isAdmin && (
        <Card className={!canAccess("custom_welcome_email") ? "opacity-60" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite Email
              {!canAccess("custom_welcome_email") && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  <Lock className="h-2.5 w-2.5 mr-0.5" />
                  Team
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canAccess("custom_welcome_email") ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add a personalized welcome message to all invite emails from your organization.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/billing">Upgrade to Team</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Custom Welcome Message</Label>
                  <p className="text-sm text-muted-foreground">
                    This message will appear at the top of all invite emails sent from your organization.
                  </p>
                  <Textarea
                    id="welcome-message"
                    placeholder="Welcome to our team! We use TeamPrompt to manage and share AI prompts..."
                    value={welcomeMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) setWelcomeMessage(e.target.value);
                    }}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {welcomeMessage.length}/500
                  </p>
                </div>
                <Button onClick={handleSavePrefs} disabled={savingPrefs}>
                  {savingPrefs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {isAdmin && (
        <Card>
          <CardContent className="p-6">
            <Link
              href="/settings/integrations"
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Plug className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:underline">Integrations</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect Google Workspace, Microsoft Entra ID, or SCIM to sync your directory
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="grid grid-cols-[60px_1fr_auto] gap-2 items-center">
      <span className="text-muted-foreground">{label}</span>
      <code className="break-all">{value}</code>
      {copyable && (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value).then(
              () => toast.success("Copied"),
              () => toast.error("Couldn't copy")
            );
          }}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
