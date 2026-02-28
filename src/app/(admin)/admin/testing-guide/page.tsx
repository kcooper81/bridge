"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Shield,
  Users,
  UserCheck,
  Puzzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────── */

interface Step {
  action: string;
  expected: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  steps: Step[];
}

/* ── Testing data ───────────────────────────────── */

const sections: Section[] = [
  {
    id: "admin",
    title: "Admin / Manager",
    icon: Shield,
    description:
      "Test every admin-level feature. Log in as an Admin or Manager user.",
    steps: [
      {
        action: "Open the Dashboard",
        expected:
          "Overview widgets load (total prompts, users, usage chart). Setup wizard appears if onboarding is incomplete.",
      },
      {
        action: "Create a new prompt from the Vault",
        expected:
          'Prompt is created with status = "approved" (auto-approved for admin/manager).',
      },
      {
        action: "Edit an existing prompt",
        expected:
          "Version history is saved. Previous version appears in the version timeline.",
      },
      {
        action: "Compare two prompt versions using the diff view",
        expected:
          "Diff view opens showing additions (green) and deletions (red) between the selected versions.",
      },
      {
        action: "Delete a prompt from the Vault",
        expected:
          "Prompt is removed from the list. Confirmation dialog appears before deletion.",
      },
      {
        action: "Duplicate a prompt",
        expected:
          'A copy is created with "(Copy)" appended to the title. The copy is editable.',
      },
      {
        action: "Create a new folder with a color",
        expected:
          "Folder appears in the sidebar filter with its color-coded icon. Color picker shows 12 preset colors.",
      },
      {
        action: "Edit a folder's color via Manage Categories modal",
        expected:
          "Color picker appears in edit mode. Updated color reflects in both list and grid views.",
      },
      {
        action: "Create a new team",
        expected:
          "Team appears as a filter chip on the Team page.",
      },
      {
        action: "Double-click a team chip to open team detail view, then click the pencil icon to edit",
        expected:
          "Edit modal opens with name and description pre-filled. Changes save and reflect immediately.",
      },
      {
        action: "Delete a team from the team detail view (trash icon)",
        expected:
          "Confirmation dialog shows member count. Team is removed and members are unlinked from it.",
      },
      {
        action: "Invite a member via email",
        expected:
          "Invitation email sends successfully. Pending invite appears in the member list.",
      },
      {
        action:
          'Click "Import Members" on the Team page and download the CSV template',
        expected:
          "Modal opens with upload/paste area. CSV template file downloads with email, name, role, team columns.",
      },
      {
        action:
          "Paste CSV data with a mix of valid, invalid, and duplicate emails, then click Preview",
        expected:
          "Preview table shows green checks (valid), yellow warnings (new teams to be created), and red Xs (invalid/duplicate/already a member).",
      },
      {
        action: 'Click "Send Invites" on the preview step',
        expected:
          "Progress bar shows. Results screen displays counts for invited, skipped, and errors. New teams are listed if created.",
      },
      {
        action:
          "On the Team page, select multiple non-admin members using checkboxes, pick a role from the bulk action bar, and click Apply",
        expected:
          "Bulk action bar shows '{N} selected'. All selected members' roles update. Selection clears after apply.",
      },
      {
        action:
          "Try to bulk-demote all admins — select every admin and change to 'member'",
        expected:
          "Error toast: 'Cannot demote the last admin'. Operation is blocked.",
      },
      {
        action:
          "Go to Settings → Organization → Invite Email. Type a custom welcome message (max 500 chars) and save",
        expected:
          "Textarea shows character counter. Save succeeds. Message persists on page reload.",
      },
      {
        action:
          "Send an invite email after setting a custom welcome message",
        expected:
          "Invite email contains the custom message as a styled blockquote above the standard invite text.",
      },
      {
        action:
          "Toggle 'Auto-Join by Domain' in Settings → Organization → Preferences (requires a domain to be set)",
        expected:
          "Switch is disabled when no domain is set. When domain is set, toggle saves. New users with matching email domain auto-join on signup.",
      },
      {
        action:
          "Navigate to Settings → Organization and click the Integrations card",
        expected:
          "Integrations page loads with Google Workspace (available), Microsoft Entra ID (Coming Soon), and SCIM 2.0 (Coming Soon) cards.",
      },
      {
        action:
          "Click 'Connect' on the Google Workspace card (requires GOOGLE_CLIENT_ID env var)",
        expected:
          "Redirects to Google OAuth consent screen. After approval, redirects back with 'connected=google' toast.",
      },
      {
        action:
          "After connecting Google Workspace, click 'Sync Now'",
        expected:
          "Fetches directory users. Opens bulk import modal pre-populated with new users (skipping existing members).",
      },
      {
        action:
          "Disconnect Google Workspace using the unplug button",
        expected:
          "Confirmation dialog appears. After disconnect, card reverts to 'Not connected' state.",
      },
      {
        action: 'Send an extension install email (Team → "Send Install Email")',
        expected:
          "Email delivers with extension install link.",
      },
      {
        action: "Navigate to the Approvals page",
        expected:
          'Pending Prompts tab loads. Shows any prompts with status = "pending".',
      },
      {
        action: "Approve a pending prompt",
        expected:
          'Prompt status changes to "approved". It appears in the Vault as active.',
      },
      {
        action: "Reject a pending prompt",
        expected:
          'Prompt status changes to "draft". Notification is sent to the author.',
      },
      {
        action: "View the Rule Suggestions tab on the Approvals page",
        expected:
          "Suggestions submitted by members appear in a list.",
      },
      {
        action: 'Click "Create Rule" on a rule suggestion',
        expected:
          "Create Rule modal opens pre-filled with the suggestion. Fill in pattern details and save — rule is created in Guardrails.",
      },
      {
        action: "Dismiss a rule suggestion",
        expected:
          "Suggestion disappears from the list. No rule is created.",
      },
      {
        action: "Create a quality guideline",
        expected:
          "Guideline is enforced on prompt creation (validation fires when creating/editing prompts).",
      },
      {
        action:
          "Install a compliance pack (e.g. HIPAA) — click Preview first, then Install",
        expected:
          "Preview shows example rules and patterns. After install, rules appear in the Guardrails page.",
      },
      {
        action:
          "Test an installed compliance pack rule — copy an example from the pack preview and paste it into the extension",
        expected:
          "Guardrails detection fires (block or warn depending on rule severity).",
      },
      {
        action:
          "Create a custom security rule — use the pattern tester to verify matching",
        expected:
          "Pattern tester shows matches. Rule is saved and active.",
      },
      {
        action: "Toggle a security rule active/inactive",
        expected:
          "Toggle switch works. Inactive rules do not trigger detection.",
      },
      {
        action: "Add sensitive terms to the term list",
        expected:
          "Terms appear in the sensitive terms list. They trigger detection when matched.",
      },
      {
        action:
          "Configure detection settings — toggle smart patterns, entropy detection, AI detection",
        expected:
          "Toggles save correctly. Detection behavior updates accordingly.",
      },
      {
        action: "View Analytics page",
        expected:
          "Charts render (usage over time, top prompts, user activity). Data is current.",
      },
      {
        action: "Scroll to the Prompt Effectiveness section on Analytics",
        expected:
          "Rating distribution bars, top effective prompts, least effective prompts, and unrated high-usage list all render.",
      },
      {
        action: "View Activity Log",
        expected:
          "Events are logged (prompt created, edited, deleted, user invited, etc.).",
      },
      {
        action: "Import prompts from a JSON file",
        expected:
          "Imported prompts appear in the Vault with correct titles and content.",
      },
      {
        action: "Export prompts to JSON",
        expected:
          "JSON file downloads. Contains selected prompts with metadata.",
      },
      {
        action: "Install a template pack",
        expected:
          "Prompts and/or guidelines from the pack are created in your workspace.",
      },
      {
        action: "Upload an avatar on the Profile tab (Settings → Profile)",
        expected:
          "Hover overlay with camera icon appears. After upload, avatar displays immediately. Max 2 MB, JPEG/PNG/WebP/GIF.",
      },
      {
        action: "Remove your avatar using the X button",
        expected:
          "Avatar reverts to initials fallback. Toast confirms removal.",
      },
      {
        action: "Change your own email address on the Profile tab",
        expected:
          'Inline "Update" button appears when email differs. Confirmation toast on success.',
      },
      {
        action: "Change a non-admin member's email from the Team page (pencil icon)",
        expected:
          "Modal opens with current email pre-filled. Email updates on save. Admins cannot change other admins' emails.",
      },
      {
        action: "Enable Two-Factor Authentication in Settings",
        expected:
          "QR code appears. Scan with authenticator app, enter 6-digit code to verify. 2FA card shows enabled state with disable option.",
      },
      {
        action: 'Toggle "Require 2FA for Admins & Managers" in Organization preferences',
        expected:
          "Setting saves. Admins/managers without 2FA see a non-dismissible amber banner prompting enrollment.",
      },
      {
        action: "Log in as an admin without 2FA when org requires it",
        expected:
          "MFA-required banner appears at top of dashboard. Banner links to Settings for enrollment.",
      },
      {
        action: "Log in as an admin with 2FA enrolled",
        expected:
          "After password, redirected to /verify-mfa. Enter 6-digit TOTP code to complete login.",
      },
      {
        action: "Click the notification bell in the header",
        expected:
          "Bell shows unread count badge. Notification list opens with recent items.",
      },
      {
        action:
          'Click the version number in the sidebar to open "What\'s New"',
        expected:
          "Release notes modal/page opens showing recent changes.",
      },
    ],
  },
  {
    id: "member",
    title: "Member",
    icon: Users,
    description:
      "Test the member experience. Log in as a user with the Member role.",
    steps: [
      {
        action: "Check the sidebar navigation",
        expected:
          "Sidebar hides: Approvals, Team, Activity Log, Guardrails, and Settings cog. Only member-accessible items are visible.",
      },
      {
        action: "Create a new prompt",
        expected:
          'Prompt is created with status = "pending" — NOT auto-approved.',
      },
      {
        action: "Check the Vault for your pending prompt",
        expected:
          'Prompt appears under the "Pending" tab/filter.',
      },
      {
        action: "Try to archive a prompt",
        expected:
          "Action is blocked. Members cannot archive prompts.",
      },
      {
        action: "Use a prompt (click to insert or copy)",
        expected:
          "Usage count increments for that prompt.",
      },
      {
        action: "Rate a prompt with stars",
        expected:
          "Star rating saves. Average rating updates.",
      },
      {
        action: "Favorite a prompt",
        expected:
          "Prompt appears in the Favorites section/filter.",
      },
      {
        action:
          'Open a template pack and click "Request Install"',
        expected:
          'Request is sent. Admin sees the request in their template pack management.',
      },
      {
        action: "Submit a rule suggestion from the dashboard",
        expected:
          "Suggestion appears in the admin's Approvals → Rule Suggestions tab.",
      },
      {
        action: "Upload and remove your avatar on the Profile tab",
        expected:
          "Avatar upload and removal work the same as admin. Hover overlay, camera icon, X to remove.",
      },
      {
        action: "Change your own email address on the Profile tab",
        expected:
          'Inline "Update" button appears. Email change works for own account.',
      },
      {
        action: "View the Analytics page",
        expected:
          "Basic analytics are accessible. Data loads correctly.",
      },
      {
        action: "Click the notification bell",
        expected:
          "Notifications list works. Shows relevant member notifications.",
      },
      {
        action: "Check upgrade/billing gates",
        expected:
          '"Contact admin" messaging appears instead of billing links. No direct billing access.',
      },
    ],
  },
  {
    id: "extension",
    title: "Extension",
    icon: Puzzle,
    description:
      "Test the Chrome extension. Works for any role.",
    steps: [
      {
        action: "Install the extension and open the web app",
        expected:
          "Auth bridge syncs the Supabase session from the web app. Extension shows logged-in state.",
      },
      {
        action: "Open the side panel",
        expected:
          "Faves, Recent, and Prompts tabs load correctly.",
      },
      {
        action: "Browse prompts — filter by folder and tags",
        expected:
          "Filtering works. Results update when filters change.",
      },
      {
        action: "Insert a prompt into ChatGPT",
        expected:
          "Prompt text appears in the ChatGPT input field.",
      },
      {
        action: "Use a template prompt with variables",
        expected:
          "Variable substitution modal appears. After filling in variables, the final prompt is inserted.",
      },
      {
        action: "Create a prompt from the extension",
        expected:
          "Prompt appears in the dashboard. Status is pending for Member, approved for Admin.",
      },
      {
        action: "Submit a rule suggestion from the extension",
        expected:
          "Suggestion appears in the Approvals → Rule Suggestions tab in the dashboard.",
      },
      {
        action:
          'Test guardrails — paste a compliance pack test example (e.g. "Patient MRN: A12345678") into an AI tool',
        expected:
          "Block or warn fires depending on rule severity. Guardrails banner appears.",
      },
      {
        action:
          'Trigger a block and click "Send Sanitized Version" on the block overlay',
        expected:
          'Preview shows content with {{CATEGORY_N}} placeholders replacing sensitive data. Click "Confirm & Insert" to replace the chat input with the sanitized version.',
      },
      {
        action: "Check the guardrails status bar indicator",
        expected:
          "Status bar shows guardrails active/inactive state correctly.",
      },
      {
        action:
          'Click the "+ Add Rule" button in the extension',
        expected:
          "Navigates to the dashboard Guardrails page.",
      },
    ],
  },
];

/* ── Storage key ────────────────────────────────── */
const STORAGE_KEY = "tp-testing-guide-checks";

/* ── Helpers ────────────────────────────────────── */

function getSavedChecks(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChecks(checks: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
}

function checkKey(sectionId: string, stepIndex: number) {
  return `${sectionId}-${stepIndex}`;
}

/* ── Components ─────────────────────────────────── */

function ProgressBar({ checked, total }: { checked: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">
        {checked}/{total} ({pct}%)
      </span>
    </div>
  );
}

function SectionBlock({
  section,
  checks,
  onToggle,
}: {
  section: Section;
  checks: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const sectionChecked = section.steps.filter(
    (_, i) => checks[checkKey(section.id, i)]
  ).length;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        )}
        <section.icon className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{section.title}</h2>
            <span className="text-xs text-slate-500">
              {section.steps.length} steps
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
            sectionChecked === section.steps.length
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          {sectionChecked}/{section.steps.length}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {section.steps.map((step, i) => {
            const key = checkKey(section.id, i);
            const checked = !!checks[key];
            return (
              <label
                key={key}
                className={cn(
                  "flex items-start gap-3 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer transition-colors",
                  checked
                    ? "bg-emerald-50/50 dark:bg-emerald-500/[0.04]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                )}
              >
                <div className="pt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(key)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-slate-400 tabular-nums shrink-0 pt-0.5">
                      {i + 1}.
                    </span>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          checked && "line-through text-slate-400"
                        )}
                      >
                        {step.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Expected: {step.expected}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */

export default function TestingGuidePage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChecks(getSavedChecks());
    setMounted(true);
  }, []);

  const handleToggle = useCallback((key: string) => {
    setChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveChecks(next);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setChecks({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalSteps = sections.reduce((sum, s) => sum + s.steps.length, 0);
  const totalChecked = Object.values(checks).filter(Boolean).length;

  if (!mounted) {
    return (
      <div className="max-w-4xl">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-4" />
        <div className="h-4 w-96 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Testing Guide</h1>
          <p className="text-sm text-slate-500 mt-1">
            Step-by-step checklist to test every feature. Progress is saved
            locally.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="shrink-0 gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Overall progress */}
      <div className="mb-8">
        <ProgressBar checked={totalChecked} total={totalSteps} />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            checks={checks}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Completion message */}
      {totalChecked === totalSteps && totalSteps > 0 && (
        <div className="mt-8 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center">
          <UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            All tests complete!
          </p>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70 mt-1">
            Every feature has been verified across all roles.
          </p>
        </div>
      )}
    </div>
  );
}
