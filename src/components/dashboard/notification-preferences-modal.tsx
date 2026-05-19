"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Channel = "email" | "in_app";

interface Prefs {
  email: Record<string, boolean>;
  in_app: Record<string, boolean>;
  weekly_digest: boolean;
}

const TYPES: { key: string; label: string; description: string }[] = [
  { key: "violation_block", label: "DLP block events", description: "Prompts that were blocked from reaching an AI tool" },
  { key: "violation_warn", label: "DLP warn events", description: "Prompts flagged but not blocked" },
  { key: "member_changes", label: "Member changes", description: "Joins, leaves, role changes" },
  { key: "billing", label: "Billing & payments", description: "Subscription, invoice, payment-failed alerts" },
];

const DEFAULT: Prefs = {
  email: { violation_block: true, violation_warn: false, member_changes: true, billing: true },
  in_app: { violation_block: true, violation_warn: true, member_changes: true, billing: true },
  weekly_digest: true,
};

export function NotificationPreferencesModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch("/api/profile/notification-preferences", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPrefs({ ...DEFAULT, ...data.preferences });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  function setChannel(channel: Channel, key: string, value: boolean) {
    setPrefs((p) => ({ ...p, [channel]: { ...p[channel], [key]: value } }));
  }

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch("/api/profile/notification-preferences", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save");
        return;
      }
      toast.success("Notification preferences saved");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" /> Notification preferences
          </DialogTitle>
          <DialogDescription>
            Choose which notification types reach you on each channel. Defaults are tuned so admins get
            blocked-prompt alerts but aren&apos;t pinged on every warn.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-[1fr_80px_80px] gap-3 items-center font-medium text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">
              <span>Event</span>
              <span className="text-center">In-app</span>
              <span className="text-center">Email</span>
            </div>
            {TYPES.map((t) => (
              <div key={t.key} className="grid grid-cols-[1fr_80px_80px] gap-3 items-center">
                <div>
                  <Label className="text-sm">{t.label}</Label>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <div className="flex justify-center">
                  <Switch checked={prefs.in_app[t.key] ?? false} onCheckedChange={(v) => setChannel("in_app", t.key, v)} />
                </div>
                <div className="flex justify-center">
                  <Switch checked={prefs.email[t.key] ?? false} onCheckedChange={(v) => setChannel("email", t.key, v)} />
                </div>
              </div>
            ))}

            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Weekly DLP digest</Label>
                <p className="text-xs text-muted-foreground">
                  Monday-morning summary of last week&apos;s blocked / warned / redacted events
                </p>
              </div>
              <Switch
                checked={prefs.weekly_digest}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, weekly_digest: v }))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
