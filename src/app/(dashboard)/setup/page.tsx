"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/org-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  UserPlus,
  Shield,
  Rocket,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { saveOrg, sendInvite } from "@/lib/vault-api";
import { toast } from "sonner";
import { trackInviteSent } from "@/lib/analytics";
import type { UserRole } from "@/lib/types";

const STEPS = [
  { label: "Welcome", icon: Building },
  { label: "Invite", icon: UserPlus },
  { label: "Security", icon: Shield },
  { label: "Done", icon: Rocket },
] as const;

interface InviteRow {
  email: string;
  role: UserRole;
}

export default function SetupPage() {
  const { org, refresh } = useOrg();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState(org?.name || "");
  const [savingName, setSavingName] = useState(false);

  // Invite step
  const [inviteRows, setInviteRows] = useState<InviteRow[]>([
    { email: "", role: "member" },
  ]);
  const [sendingInvites, setSendingInvites] = useState(false);

  // Complete step
  const [completing, setCompleting] = useState(false);

  async function handleSaveName() {
    if (!orgName.trim()) return;
    setSavingName(true);
    try {
      await saveOrg({ name: orgName.trim() });
      refresh();
      setStep(1);
    } catch {
      toast.error("Failed to save organization name");
    } finally {
      setSavingName(false);
    }
  }

  function addInviteRow() {
    setInviteRows((prev) => [...prev, { email: "", role: "member" }]);
  }

  function removeInviteRow(index: number) {
    setInviteRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateInviteRow(index: number, field: keyof InviteRow, value: string) {
    setInviteRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function handleSendInvites() {
    const validRows = inviteRows.filter((r) => r.email.trim());
    if (validRows.length === 0) {
      setStep(2);
      return;
    }
    setSendingInvites(true);
    let sent = 0;
    for (const row of validRows) {
      const result = await sendInvite(row.email.trim(), row.role);
      if (result.success) {
        trackInviteSent();
        sent++;
      }
    }
    if (sent > 0) {
      toast.success(`${sent} invite${sent > 1 ? "s" : ""} sent`);
    }
    setSendingInvites(false);
    setStep(2);
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      const merged = {
        ...(org?.settings || {}),
        setup_complete: true,
      };
      await saveOrg({ settings: merged });
      await refresh();
      router.replace("/vault");
    } catch {
      toast.error("Failed to complete setup");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i < step) setStep(i);
              }}
              className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 ${i < step ? "bg-primary/40" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          {/* Step 1: Welcome — Name your org */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Welcome to TeamPrompt</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Let&apos;s get your workspace set up. Start by naming your organization.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  autoFocus
                />
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { setStep(1); }}>
                  Skip
                </Button>
                <Button onClick={handleSaveName} disabled={savingName || !orgName.trim()}>
                  {savingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Invite team */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Invite Your Team</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add team members so they can access shared prompts and guidelines.
                </p>
              </div>
              <div className="space-y-3">
                {inviteRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={row.email}
                      onChange={(e) => updateInviteRow(i, "email", e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={row.role}
                      onValueChange={(v) => updateInviteRow(i, "role", v)}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {inviteRows.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeInviteRow(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addInviteRow}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add another
                </Button>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Skip
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSendInvites} disabled={sendingInvites}>
                    {sendingInvites && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Invites
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Security overview */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Security & Guardrails</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  TeamPrompt scans every prompt for sensitive data before it reaches any AI tool.
                  Configure guardrails to protect your organization.
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border p-3 flex items-start gap-3">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Built-in DLP patterns</p>
                    <p className="text-muted-foreground">API keys, credentials, and PII are automatically detected.</p>
                  </div>
                </div>
                <div className="rounded-lg border p-3 flex items-start gap-3">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Custom security rules</p>
                    <p className="text-muted-foreground">Add your own patterns to block or warn on sensitive terms.</p>
                  </div>
                </div>
                <div className="rounded-lg border p-3 flex items-start gap-3">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Activity log</p>
                    <p className="text-muted-foreground">Track all AI interactions and security events across your team.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  Skip
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">You&apos;re All Set!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your workspace is ready. You can always adjust settings later.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization</span>
                  <span className="font-medium">{org?.name || orgName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium capitalize">{org?.plan || "free"}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={completing}>
                  {completing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Setup
                  <Rocket className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
