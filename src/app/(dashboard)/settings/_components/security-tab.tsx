"use client";

import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Activity, AlertTriangle, Info, Lock, Puzzle, Shield } from "lucide-react";
import { saveOrg } from "@/lib/vault-api";
import { toast } from "sonner";

interface SettingRow {
  key: string;
  label: string;
  description: string;
  defaultValue: boolean;
  featureGate?: "custom_security" | "audit_log";
  /** Disable this toggle when a parent toggle is off */
  disabledWhen?: string;
  /** Notice shown when the toggle is OFF (destructive style) */
  noticeWhenOff?: string;
  /** Notice shown when the toggle is ON but non-default (info style) */
  noticeWhenOn?: string;
}

const extensionAccessSettings: SettingRow[] = [
  {
    key: "require_signin_for_extension",
    label: "Require Sign-in for Extension",
    description:
      "Users must be signed in to their TeamPrompt account before the extension activates. Prevents unauthenticated usage.",
    defaultValue: true,
    noticeWhenOff:
      "Sign-in is not required. Anyone with the extension installed can use it without authenticating.",
  },
  {
    key: "allow_external_ai_tools",
    label: "Allow All AI Tools",
    description:
      "When disabled, the extension only works on AI tools your organization has approved. Restricts usage to sanctioned platforms.",
    defaultValue: true,
    featureGate: "custom_security",
  },
];

const guardrailSettings: SettingRow[] = [
  {
    key: "guardrails_enabled",
    label: "Enable DLP Guardrails",
    description:
      "Run real-time DLP scanning on all outbound messages before they reach AI tools. Disabling this turns off all guardrail enforcement org-wide.",
    defaultValue: true,
    noticeWhenOff:
      "DLP guardrails are disabled. Outbound messages to AI tools will not be scanned for sensitive data.",
  },
  {
    key: "allow_guardrail_override",
    label: "Allow Warning Override",
    description:
      "Let users proceed past warning-level guardrail detections. When disabled, all warnings are treated as hard blocks.",
    defaultValue: true,
    featureGate: "custom_security",
    disabledWhen: "guardrails_enabled",
    noticeWhenOff:
      "Warning overrides are disabled. All guardrail detections — including warnings — will hard-block message submission.",
  },
  {
    key: "auto_redact_sensitive_data",
    label: "Auto-Redact Sensitive Data",
    description:
      "Automatically replace detected sensitive data with safe {{PLACEHOLDER}} tokens instead of blocking. Users can still review before sending.",
    defaultValue: false,
    featureGate: "custom_security",
    disabledWhen: "guardrails_enabled",
    noticeWhenOn:
      "Auto-redact is active. Detected sensitive data will be replaced with placeholder tokens automatically. Users can still review before sending.",
  },
];

const activitySettings: SettingRow[] = [
  {
    key: "activity_logging_enabled",
    label: "Activity Logging",
    description:
      "Log all AI interactions captured by the extension to the Activity Log. Disabling this stops recording conversations but still tracks usage counts.",
    defaultValue: true,
    featureGate: "audit_log",
    noticeWhenOff:
      "Activity logging is disabled. AI conversations will not be recorded. Usage counts and guardrail events are still tracked.",
  },
];

const PLAN_BADGE_LABELS: Record<string, string> = {
  custom_security: "Team",
  audit_log: "Team",
};

export function SecurityTab() {
  const { org, currentUserRole, refresh } = useOrg();
  const { canAccess } = useSubscription();

  const isAdmin = currentUserRole === "admin";
  const settings = org?.settings || {};

  function getSettingValue(key: string, defaultValue: boolean): boolean {
    const val = (settings as Record<string, unknown>)[key];
    return typeof val === "boolean" ? val : defaultValue;
  }

  async function handleToggle(key: string, value: boolean) {
    try {
      const merged = { ...(org?.settings || {}), [key]: value };
      await saveOrg({ settings: merged });
      toast.success("Setting updated");
      refresh();
    } catch {
      toast.error("Failed to update setting");
    }
  }

  function renderSettingRow(row: SettingRow) {
    const value = getSettingValue(row.key, row.defaultValue);
    const gated = row.featureGate && !canAccess(row.featureGate);

    // Disable child toggles when their parent toggle is off
    const parentOff =
      row.disabledWhen &&
      !getSettingValue(row.disabledWhen, true);

    const disabled = !isAdmin || !!gated || !!parentOff;

    // Determine which notice to show (if any)
    const showNoticeOff = !value && row.noticeWhenOff && !gated && !parentOff;
    const showNoticeOn = value && row.noticeWhenOn && !gated && !parentOff;

    return (
      <div key={row.key} className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5 flex-1">
            <Label
              htmlFor={row.key}
              className="flex items-center gap-1.5"
            >
              {row.label}
              {gated && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 font-normal"
                >
                  <Lock className="h-2.5 w-2.5 mr-0.5" />
                  {PLAN_BADGE_LABELS[row.featureGate!] || "Team"}
                </Badge>
              )}
            </Label>
            <p className="text-sm text-muted-foreground">{row.description}</p>
          </div>
          <Switch
            id={row.key}
            checked={gated ? false : value}
            onCheckedChange={(v) => handleToggle(row.key, v)}
            disabled={disabled}
          />
        </div>

        {showNoticeOff && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {row.noticeWhenOff}
            </p>
          </div>
        )}

        {showNoticeOn && (
          <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-2.5">
            <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {row.noticeWhenOn}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Extension Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Extension Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {extensionAccessSettings.map(renderSettingRow)}
        </CardContent>
      </Card>

      {/* Guardrail Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Guardrail Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {guardrailSettings.map(renderSettingRow)}
        </CardContent>
      </Card>

      {/* Activity & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity &amp; Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {activitySettings.map(renderSettingRow)}
        </CardContent>
      </Card>
    </div>
  );
}
