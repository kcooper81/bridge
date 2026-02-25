"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building, Settings } from "lucide-react";
import { saveOrg } from "@/lib/vault-api";
import { toast } from "sonner";
import type { CollectionVisibility } from "@/lib/types";

export function OrganizationTab() {
  const { org, currentUserRole, refresh } = useOrg();
  const [name, setName] = useState(org?.name || "");
  const [domain, setDomain] = useState(org?.domain || "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Preferences
  const [allowPersonalPrompts, setAllowPersonalPrompts] = useState(
    org?.settings?.allow_personal_prompts ?? true
  );
  const [defaultVisibility, setDefaultVisibility] = useState<CollectionVisibility>(
    org?.settings?.default_visibility ?? "org"
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (org && !dirty) {
      setName(org.name || "");
      setDomain(org.domain || "");
      setAllowPersonalPrompts(org.settings?.allow_personal_prompts ?? true);
      setDefaultVisibility(org.settings?.default_visibility ?? "org");
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
        default_visibility: defaultVisibility,
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

          <div className="space-y-2">
            <Label htmlFor="default-visibility">Default Visibility</Label>
            <p className="text-sm text-muted-foreground">
              Default visibility for new collections and prompts
            </p>
            <Select
              value={defaultVisibility}
              onValueChange={(v) => setDefaultVisibility(v as CollectionVisibility)}
              disabled={!isAdmin}
            >
              <SelectTrigger id="default-visibility" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="org">Organization</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSavePrefs} disabled={savingPrefs || !isAdmin}>
            {savingPrefs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
