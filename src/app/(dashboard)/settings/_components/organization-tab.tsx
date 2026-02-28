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
import { ArrowRight, Lock, Loader2, Building, Mail, Plug, Settings, ShieldCheck } from "lucide-react";
import { saveOrg } from "@/lib/vault-api";
import { useSubscription } from "@/components/providers/subscription-provider";
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
      await saveOrg({ name: name.trim(), domain: domain.trim() || null });
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
      await saveOrg({ settings: merged });
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
              </Label>
              <p className="text-sm text-muted-foreground">
                {!canAccess("domain_auto_join")
                  ? "Upgrade to Team to let matching-domain users auto-join"
                  : org?.domain
                    ? `New users with @${org.domain} emails will automatically join this organization`
                    : "Set a domain above to enable auto-join"}
              </p>
            </div>
            <Switch
              id="auto-join-domain"
              checked={autoJoinDomain}
              onCheckedChange={setAutoJoinDomain}
              disabled={!isAdmin || !org?.domain || !canAccess("domain_auto_join")}
            />
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
