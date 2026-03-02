"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCopy,
  Download,
  Filter,
  MinusCircle,
  Puzzle,
  RotateCcw,
  Search,
  Shield,
  Users,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────── */

type StepStatus = "untested" | "pass" | "fail" | "skip";
type Priority = "P0" | "P1" | "P2";
type FilterMode = "all" | "untested" | "pass" | "fail" | "skip";

interface Step {
  action: string;
  expected: string;
  priority: Priority;
}

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  preconditions: string[];
  steps: Step[];
}

interface StepState {
  status: StepStatus;
  note: string;
}

/* ── Testing data ───────────────────────────────── */

const sections: Section[] = [
  {
    id: "admin",
    title: "Admin / Manager",
    icon: Shield,
    description:
      "Test every admin-level feature. Log in as an Admin or Manager user.",
    preconditions: [
      "Logged in as Admin or Manager role",
      "Organization has at least one team with members",
      "Extension is installed and linked to same account",
      "At least one prompt exists in the vault",
    ],
    steps: [
      {
        action: "Open the Dashboard",
        expected:
          "Overview widgets load (total prompts, users, usage chart). Setup wizard appears if onboarding is incomplete.",
        priority: "P0",
      },
      {
        action: "Create a new prompt from the Vault",
        expected:
          'Prompt is created with status = "approved" (auto-approved for admin/manager).',
        priority: "P0",
      },
      {
        action: "Edit an existing prompt",
        expected:
          "Version history is saved. Previous version appears in the version timeline.",
        priority: "P0",
      },
      {
        action: "Compare two prompt versions using the diff view",
        expected:
          "Diff view opens showing additions (green) and deletions (red) between the selected versions.",
        priority: "P1",
      },
      {
        action: "Delete a prompt from the Vault",
        expected:
          "Prompt is removed from the list. Confirmation dialog appears before deletion.",
        priority: "P0",
      },
      {
        action: "Duplicate a prompt",
        expected:
          'A copy is created with "(Copy)" appended to the title. The copy is editable.',
        priority: "P1",
      },
      {
        action: "Create a new folder with a color",
        expected:
          "Folder appears in the sidebar filter with its color-coded icon. Color picker shows 12 preset colors.",
        priority: "P1",
      },
      {
        action: "Edit a folder's color via Manage Categories modal",
        expected:
          "Color picker appears in edit mode. Updated color reflects in both list and grid views.",
        priority: "P2",
      },
      {
        action: "Create a new team",
        expected:
          "Team appears as a filter chip on the Team page.",
        priority: "P0",
      },
      {
        action: "Double-click a team chip to open team detail view, then click the pencil icon to edit",
        expected:
          "Edit modal opens with name and description pre-filled. Changes save and reflect immediately.",
        priority: "P1",
      },
      {
        action: "Delete a team from the team detail view (trash icon)",
        expected:
          "Confirmation dialog shows member count. Team is removed and members are unlinked from it.",
        priority: "P1",
      },
      {
        action: "Invite a member via email",
        expected:
          "Invitation email sends successfully. Pending invite appears in the member list.",
        priority: "P0",
      },
      {
        action:
          'Click "Import Members" on the Team page and download the CSV template',
        expected:
          "Modal opens with upload/paste area. CSV template file downloads with email, name, role, team columns.",
        priority: "P1",
      },
      {
        action:
          "Paste CSV data with a mix of valid, invalid, and duplicate emails, then click Preview",
        expected:
          "Preview table shows green checks (valid), yellow warnings (new teams to be created), and red Xs (invalid/duplicate/already a member).",
        priority: "P1",
      },
      {
        action: 'Click "Send Invites" on the preview step',
        expected:
          "Progress bar shows. Results screen displays counts for invited, skipped, and errors. New teams are listed if created.",
        priority: "P1",
      },
      {
        action:
          "On the Team page, select multiple non-admin members using checkboxes, pick a role from the bulk action bar, and click Apply",
        expected:
          "Bulk action bar shows '{N} selected'. All selected members' roles update. Selection clears after apply.",
        priority: "P1",
      },
      {
        action:
          "Try to bulk-demote all admins — select every admin and change to 'member'",
        expected:
          "Error toast: 'Cannot demote the last admin'. Operation is blocked.",
        priority: "P0",
      },
      {
        action:
          "Go to Settings → Organization → Invite Email. Type a custom welcome message (max 500 chars) and save",
        expected:
          "Textarea shows character counter. Save succeeds. Message persists on page reload.",
        priority: "P2",
      },
      {
        action:
          "Send an invite email after setting a custom welcome message",
        expected:
          "Invite email contains the custom message as a styled blockquote above the standard invite text.",
        priority: "P2",
      },
      {
        action:
          "Toggle 'Auto-Join by Domain' in Settings → Organization → Preferences (requires a domain to be set)",
        expected:
          "Switch is disabled when no domain is set. When domain is set, toggle saves. New users with matching email domain auto-join on signup.",
        priority: "P1",
      },
      {
        action:
          "Navigate to Settings → Organization and click the Integrations card",
        expected:
          "Integrations page loads with Google Workspace (available), Microsoft Entra ID (Coming Soon), and SCIM 2.0 (Coming Soon) cards.",
        priority: "P1",
      },
      {
        action:
          "Click 'Connect' on the Google Workspace card (requires GOOGLE_CLIENT_ID env var)",
        expected:
          "Redirects to Google OAuth consent screen. After approval, redirects back with 'connected=google' toast.",
        priority: "P1",
      },
      {
        action:
          "After connecting Google Workspace, click 'Sync Now'",
        expected:
          "Fetches directory users. Opens bulk import modal pre-populated with new users (skipping existing members).",
        priority: "P1",
      },
      {
        action:
          "Disconnect Google Workspace using the unplug button",
        expected:
          "Confirmation dialog appears. After disconnect, card reverts to 'Not connected' state.",
        priority: "P2",
      },
      {
        action: 'Send an extension install email (Team → "Send Install Email")',
        expected:
          "Email delivers with extension install link pointing to user's browser store.",
        priority: "P1",
      },
      {
        action: "Navigate to the Approvals page",
        expected:
          'Pending Prompts tab loads. Shows any prompts with status = "pending".',
        priority: "P0",
      },
      {
        action: "Approve a pending prompt",
        expected:
          'Prompt status changes to "approved". It appears in the Vault as active.',
        priority: "P0",
      },
      {
        action: "Reject a pending prompt",
        expected:
          'Prompt status changes to "draft". Notification is sent to the author.',
        priority: "P0",
      },
      {
        action: "View the Rule Suggestions tab on the Approvals page",
        expected:
          "Suggestions submitted by members appear in a list.",
        priority: "P1",
      },
      {
        action: 'Click "Create Rule" on a rule suggestion',
        expected:
          "Create Rule modal opens pre-filled with the suggestion. Fill in pattern details and save — rule is created in Guardrails.",
        priority: "P1",
      },
      {
        action: "Dismiss a rule suggestion",
        expected:
          "Suggestion disappears from the list. No rule is created.",
        priority: "P2",
      },
      {
        action: "Create a quality guideline",
        expected:
          "Guideline is enforced on prompt creation (validation fires when creating/editing prompts).",
        priority: "P1",
      },
      {
        action:
          "Install a compliance pack (e.g. HIPAA) — click Preview first, then Install",
        expected:
          "Preview shows example rules and patterns. After install, rules appear in the Guardrails page.",
        priority: "P0",
      },
      {
        action:
          "Test an installed compliance pack rule — copy an example from the pack preview and paste it into the extension",
        expected:
          "Guardrails detection fires (block or warn depending on rule severity).",
        priority: "P0",
      },
      {
        action:
          "Create a custom security rule — use the pattern tester to verify matching",
        expected:
          "Pattern tester shows matches. Rule is saved and active.",
        priority: "P1",
      },
      {
        action: "Toggle a security rule active/inactive",
        expected:
          "Toggle switch works. Inactive rules do not trigger detection.",
        priority: "P1",
      },
      {
        action: "Add sensitive terms to the term list",
        expected:
          "Terms appear in the sensitive terms list. They trigger detection when matched.",
        priority: "P1",
      },
      {
        action:
          "Configure detection settings — toggle smart patterns, entropy detection, AI detection",
        expected:
          "Toggles save correctly. Detection behavior updates accordingly.",
        priority: "P2",
      },
      {
        action: "View Analytics page",
        expected:
          "Charts render (usage over time, top prompts, user activity). Data is current.",
        priority: "P1",
      },
      {
        action: "Scroll to the Prompt Effectiveness section on Analytics",
        expected:
          "Rating distribution bars, top effective prompts, least effective prompts, and unrated high-usage list all render.",
        priority: "P2",
      },
      {
        action: "View Activity Log",
        expected:
          "Events are logged (prompt created, edited, deleted, user invited, etc.).",
        priority: "P1",
      },
      {
        action: "Import prompts from a JSON file",
        expected:
          "Imported prompts appear in the Vault with correct titles and content.",
        priority: "P1",
      },
      {
        action: "Export prompts to JSON",
        expected:
          "JSON file downloads. Contains selected prompts with metadata.",
        priority: "P1",
      },
      {
        action: "Install a template pack",
        expected:
          "Prompts and/or guidelines from the pack are created in your workspace.",
        priority: "P1",
      },
      {
        action: "Upload an avatar on the Profile tab (Settings → Profile)",
        expected:
          "Hover overlay with camera icon appears. After upload, avatar displays immediately. Max 2 MB, JPEG/PNG/WebP/GIF.",
        priority: "P2",
      },
      {
        action: "Remove your avatar using the X button",
        expected:
          "Avatar reverts to initials fallback. Toast confirms removal.",
        priority: "P2",
      },
      {
        action: "Change your own email address on the Profile tab",
        expected:
          'Inline "Update" button appears when email differs. Confirmation toast on success.',
        priority: "P1",
      },
      {
        action: "Change a non-admin member's email from the Team page (pencil icon)",
        expected:
          "Modal opens with current email pre-filled. Email updates on save. Admins cannot change other admins' emails.",
        priority: "P1",
      },
      {
        action: "Enable Two-Factor Authentication in Settings",
        expected:
          "QR code appears. Scan with authenticator app, enter 6-digit code to verify. 2FA card shows enabled state with disable option.",
        priority: "P0",
      },
      {
        action: 'Toggle "Require 2FA for Admins & Managers" in Organization preferences',
        expected:
          "Setting saves. Admins/managers without 2FA see a non-dismissible amber banner prompting enrollment.",
        priority: "P0",
      },
      {
        action: "Log in as an admin without 2FA when org requires it",
        expected:
          "MFA-required banner appears at top of dashboard. Banner links to Settings for enrollment.",
        priority: "P0",
      },
      {
        action: "Log in as an admin with 2FA enrolled",
        expected:
          "After password, redirected to /verify-mfa. Enter 6-digit TOTP code to complete login.",
        priority: "P0",
      },
      {
        action: "Click the notification bell in the header",
        expected:
          "Bell shows unread count badge. Notification list opens with recent items.",
        priority: "P1",
      },
      {
        action:
          'Click the version number in the sidebar to open "What\'s New"',
        expected:
          "Release notes modal/page opens showing recent changes.",
        priority: "P2",
      },
      {
        action:
          "Navigate to Settings → Security tab",
        expected:
          "Security page loads with 3 cards: Extension Access, Guardrail Behavior, and Activity & Privacy. All 6 toggles render with correct defaults.",
        priority: "P0",
      },
      {
        action:
          "Toggle 'Enable DLP Guardrails' off in Settings → Security",
        expected:
          "Warning banner appears: 'DLP guardrails are disabled.' Override and Auto-Redact toggles become visually disabled. Setting persists on reload.",
        priority: "P0",
      },
      {
        action:
          "Toggle 'Allow Warning Override' off and test a warn-level guardrail in the extension",
        expected:
          "Extension treats the warning as a hard block. User cannot proceed past the detection.",
        priority: "P0",
      },
      {
        action:
          "Toggle 'Auto-Redact Sensitive Data' on and trigger a guardrail in the extension",
        expected:
          "Extension auto-replaces detected data with {{PLACEHOLDER}} tokens instead of blocking. Scan response returns action: 'auto_redact'.",
        priority: "P0",
      },
      {
        action:
          "Toggle 'Activity Logging' off and send a message in the extension",
        expected:
          "Message sends successfully. No new entry appears in the Activity Log. Usage count still increments if a prompt was used.",
        priority: "P1",
      },
      {
        action:
          "Verify plan-gated toggles on a Free plan org (Allow All AI Tools, Allow Warning Override, Auto-Redact, Activity Logging)",
        expected:
          "Gated toggles show Lock + 'Team' badge and are disabled. Upgrading to Team enables them.",
        priority: "P1",
      },
      {
        action: "Visit /extensions page",
        expected:
          "Page loads with browser-detected CTA button. All 3 browser store cards display. FAQ and features sections render.",
        priority: "P1",
      },
    ],
  },
  {
    id: "member",
    title: "Member",
    icon: Users,
    description:
      "Test the member experience. Log in as a user with the Member role.",
    preconditions: [
      "Logged in as Member role (not admin or manager)",
      "Organization has approved prompts available",
      "Extension is installed",
    ],
    steps: [
      {
        action: "Check the sidebar navigation",
        expected:
          "Sidebar hides: Approvals, Team, Activity Log, Guardrails, and Settings cog. Only member-accessible items are visible.",
        priority: "P0",
      },
      {
        action: "Create a new prompt",
        expected:
          'Prompt is created with status = "pending" — NOT auto-approved.',
        priority: "P0",
      },
      {
        action: "Check the Vault for your pending prompt",
        expected:
          'Prompt appears under the "Pending" tab/filter.',
        priority: "P0",
      },
      {
        action: "Try to archive a prompt",
        expected:
          "Action is blocked. Members cannot archive prompts.",
        priority: "P0",
      },
      {
        action: "Use a prompt (click to insert or copy)",
        expected:
          "Usage count increments for that prompt.",
        priority: "P1",
      },
      {
        action: "Rate a prompt with stars",
        expected:
          "Star rating saves. Average rating updates.",
        priority: "P1",
      },
      {
        action: "Favorite a prompt",
        expected:
          "Prompt appears in the Favorites section/filter.",
        priority: "P1",
      },
      {
        action:
          'Open a template pack and click "Request Install"',
        expected:
          "Request is sent. Admin sees the request in their template pack management.",
        priority: "P1",
      },
      {
        action: "Submit a rule suggestion from the dashboard",
        expected:
          "Suggestion appears in the admin's Approvals → Rule Suggestions tab.",
        priority: "P1",
      },
      {
        action: "Upload and remove your avatar on the Profile tab",
        expected:
          "Avatar upload and removal work the same as admin. Hover overlay, camera icon, X to remove.",
        priority: "P2",
      },
      {
        action: "Change your own email address on the Profile tab",
        expected:
          'Inline "Update" button appears. Email change works for own account.',
        priority: "P1",
      },
      {
        action: "View the Analytics page",
        expected:
          "Basic analytics are accessible. Data loads correctly.",
        priority: "P1",
      },
      {
        action: "Click the notification bell",
        expected:
          "Notifications list works. Shows relevant member notifications.",
        priority: "P1",
      },
      {
        action: "Check upgrade/billing gates",
        expected:
          '"Contact admin" messaging appears instead of billing links. No direct billing access.',
        priority: "P0",
      },
    ],
  },
  {
    id: "extension",
    title: "Extension",
    icon: Puzzle,
    description:
      "Test the browser extension. Works for any role.",
    preconditions: [
      "Extension installed from Chrome, Firefox, or Edge store",
      "Logged into TeamPrompt web app in the same browser",
      "At least one supported AI tool open (ChatGPT, Claude, Gemini, etc.)",
    ],
    steps: [
      {
        action: "Install the extension and open the web app",
        expected:
          "Auth bridge syncs the Supabase session from the web app. Extension shows logged-in state.",
        priority: "P0",
      },
      {
        action: "Open the side panel",
        expected:
          "Faves, Recent, and Prompts tabs load correctly.",
        priority: "P0",
      },
      {
        action: "Browse prompts — filter by folder and tags",
        expected:
          "Filtering works. Results update when filters change.",
        priority: "P0",
      },
      {
        action: "Insert a prompt into ChatGPT",
        expected:
          "Prompt text appears in the ChatGPT input field.",
        priority: "P0",
      },
      {
        action: "Use a template prompt with variables",
        expected:
          "Variable substitution modal appears. After filling in variables, the final prompt is inserted.",
        priority: "P0",
      },
      {
        action: "Create a prompt from the extension",
        expected:
          "Prompt appears in the dashboard. Status is pending for Member, approved for Admin.",
        priority: "P1",
      },
      {
        action: "Submit a rule suggestion from the extension",
        expected:
          "Suggestion appears in the Approvals → Rule Suggestions tab in the dashboard.",
        priority: "P1",
      },
      {
        action:
          'Test guardrails — paste a compliance pack test example (e.g. "Patient MRN: A12345678") into an AI tool',
        expected:
          "Block or warn fires depending on rule severity. Guardrails banner appears.",
        priority: "P0",
      },
      {
        action:
          'Trigger a block and click "Send Sanitized Version" on the block overlay',
        expected:
          'Preview shows content with {{CATEGORY_N}} placeholders replacing sensitive data. Click "Confirm & Insert" to replace the chat input with the sanitized version.',
        priority: "P0",
      },
      {
        action: "Check the guardrails status bar indicator",
        expected:
          "Status bar shows guardrails active/inactive state correctly.",
        priority: "P1",
      },
      {
        action:
          'Click the "+ Add Rule" button in the extension',
        expected:
          "Navigates to the dashboard Guardrails page.",
        priority: "P2",
      },
      {
        action: "Test extension in Firefox browser",
        expected:
          "All features work. Extension install banner links to Firefox Add-ons store.",
        priority: "P1",
      },
      {
        action: "Test extension in Edge browser",
        expected:
          "All features work. Extension install banner links to Edge Add-ons store.",
        priority: "P1",
      },
    ],
  },
];

/* ── Storage key ────────────────────────────────── */
const STORAGE_KEY = "tp-testing-guide-v2";

/* ── Helpers ────────────────────────────────────── */

function getDefaultState(): Record<string, StepState> {
  return {};
}

function getSavedState(): Record<string, StepState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveState(state: Record<string, StepState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function stepKey(sectionId: string, stepIndex: number) {
  return `${sectionId}-${stepIndex}`;
}

function getStepState(state: Record<string, StepState>, key: string): StepState {
  return state[key] || { status: "untested", note: "" };
}

const statusConfig: Record<StepStatus, { label: string; color: string; icon: React.ElementType }> = {
  untested: { label: "Untested", color: "text-slate-400", icon: Circle },
  pass: { label: "Pass", color: "text-emerald-600", icon: CheckCircle2 },
  fail: { label: "Fail", color: "text-red-600", icon: XCircle },
  skip: { label: "Skip", color: "text-amber-500", icon: MinusCircle },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  P0: { label: "P0", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  P1: { label: "P1", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
  P2: { label: "P2", className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
};

function exportResults(state: Record<string, StepState>): string {
  const lines: string[] = [];
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  lines.push(`TeamPrompt Testing Report — ${now}`);
  lines.push(`${"=".repeat(60)}`);
  lines.push("");

  let totalPass = 0, totalFail = 0, totalSkip = 0, totalUntested = 0;

  for (const section of sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    for (let i = 0; i < section.steps.length; i++) {
      const step = section.steps[i];
      const key = stepKey(section.id, i);
      const s = getStepState(state, key);
      const statusLabel = statusConfig[s.status].label.toUpperCase();
      lines.push(`[${statusLabel}] [${step.priority}] ${i + 1}. ${step.action}`);
      lines.push(`   Expected: ${step.expected}`);
      if (s.note) lines.push(`   Note: ${s.note}`);
      lines.push("");
      if (s.status === "pass") totalPass++;
      else if (s.status === "fail") totalFail++;
      else if (s.status === "skip") totalSkip++;
      else totalUntested++;
    }
  }

  lines.push(`${"=".repeat(60)}`);
  lines.push(`Summary: ${totalPass} pass, ${totalFail} fail, ${totalSkip} skip, ${totalUntested} untested`);
  lines.push(`Total: ${totalPass + totalFail + totalSkip + totalUntested} steps`);
  return lines.join("\n");
}

function buildBugReport(section: Section, step: Step, index: number, note: string): string {
  return [
    `**Bug Report**`,
    ``,
    `**Section:** ${section.title}`,
    `**Step ${index + 1}:** ${step.action}`,
    `**Priority:** ${step.priority}`,
    `**Expected:** ${step.expected}`,
    `**Actual:** ${note || "(describe what happened)"}`,
    `**Browser:** ${typeof navigator !== "undefined" ? navigator.userAgent.split(" ").slice(-3).join(" ") : ""}`,
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
  ].join("\n");
}

/* ── Components ─────────────────────────────────── */

function ProgressBar({ counts, total }: { counts: Record<StepStatus, number>; total: number }) {
  const passPct = total === 0 ? 0 : (counts.pass / total) * 100;
  const failPct = total === 0 ? 0 : (counts.fail / total) * 100;
  const skipPct = total === 0 ? 0 : (counts.skip / total) * 100;
  const tested = counts.pass + counts.fail + counts.skip;
  return (
    <div className="space-y-2">
      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
        {passPct > 0 && (
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${passPct}%` }}
          />
        )}
        {failPct > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${failPct}%` }}
          />
        )}
        {skipPct > 0 && (
          <div
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${skipPct}%` }}
          />
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> {counts.pass} pass
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> {counts.fail} fail
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> {counts.skip} skip
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> {counts.untested} untested
        </span>
        <span className="ml-auto font-medium tabular-nums">
          {tested}/{total} tested ({total === 0 ? 0 : Math.round((tested / total) * 100)}%)
        </span>
      </div>
    </div>
  );
}

function StatusCycleButton({
  status,
  onChange,
}: {
  status: StepStatus;
  onChange: (next: StepStatus) => void;
}) {
  const cycle: StepStatus[] = ["untested", "pass", "fail", "skip"];
  const nextStatus = cycle[(cycle.indexOf(status) + 1) % cycle.length];
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onChange(nextStatus)}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        config.color
      )}
      title={`Click to cycle: ${config.label} → ${statusConfig[nextStatus].label}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
}

function SectionBlock({
  section,
  state,
  onStatusChange,
  onNoteChange,
  filter,
  searchQuery,
}: {
  section: Section;
  state: Record<string, StepState>;
  onStatusChange: (key: string, status: StepStatus) => void;
  onNoteChange: (key: string, note: string) => void;
  filter: FilterMode;
  searchQuery: string;
}) {
  const [open, setOpen] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const c: Record<StepStatus, number> = { untested: 0, pass: 0, fail: 0, skip: 0 };
    section.steps.forEach((_, i) => {
      const s = getStepState(state, stepKey(section.id, i));
      c[s.status]++;
    });
    return c;
  }, [section, state]);

  const filteredSteps = useMemo(() => {
    return section.steps.map((step, i) => ({ step, index: i })).filter(({ step, index }) => {
      const s = getStepState(state, stepKey(section.id, index));
      if (filter !== "all" && s.status !== filter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return step.action.toLowerCase().includes(q) || step.expected.toLowerCase().includes(q);
      }
      return true;
    });
  }, [section, state, filter, searchQuery]);

  if (filteredSteps.length === 0 && filter !== "all") return null;

  const toggleNote = (key: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const failCount = counts.fail;

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
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold">{section.title}</h2>
            <span className="text-xs text-slate-500">
              {section.steps.length} steps
            </span>
            {failCount > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-100 dark:bg-red-500/15 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Bug className="h-3 w-3" /> {failCount} fail
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-emerald-600 tabular-nums">
            {counts.pass}
          </span>
          <span className="text-xs text-slate-300">/</span>
          <span className="text-xs font-medium text-red-600 tabular-nums">
            {counts.fail}
          </span>
          <span className="text-xs text-slate-300">/</span>
          <span className="text-xs font-medium text-amber-500 tabular-nums">
            {counts.skip}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {/* Preconditions */}
          {section.preconditions.length > 0 && (
            <div className="px-4 sm:px-5 py-3 bg-blue-50/50 dark:bg-blue-500/[0.04] border-b border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                Preconditions
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                {section.preconditions.map((p) => (
                  <li key={p} className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          {filteredSteps.map(({ step, index }) => {
            const key = stepKey(section.id, index);
            const s = getStepState(state, key);
            const noteOpen = expandedNotes.has(key);
            const pConfig = priorityConfig[step.priority];

            return (
              <div
                key={key}
                className={cn(
                  "px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors",
                  s.status === "pass" && "bg-emerald-50/40 dark:bg-emerald-500/[0.03]",
                  s.status === "fail" && "bg-red-50/40 dark:bg-red-500/[0.03]",
                  s.status === "skip" && "bg-amber-50/30 dark:bg-amber-500/[0.02]"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Status button */}
                  <div className="shrink-0 pt-0.5">
                    <StatusCycleButton
                      status={s.status}
                      onChange={(next) => onStatusChange(key, next)}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-slate-400 tabular-nums shrink-0 pt-0.5">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              s.status === "pass" && "line-through text-slate-400"
                            )}
                          >
                            {step.action}
                          </p>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", pConfig.className)}>
                            {pConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Expected: {step.expected}
                        </p>
                      </div>
                    </div>

                    {/* Note toggle + bug report */}
                    <div className="flex items-center gap-2 mt-2 ml-5">
                      <button
                        onClick={() => toggleNote(key)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
                      >
                        {noteOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        {s.note ? "Edit note" : "Add note"}
                      </button>
                      {s.status === "fail" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(buildBugReport(section, step, index, s.note));
                          }}
                          className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1"
                          title="Copy bug report to clipboard"
                        >
                          <Bug className="h-3 w-3" />
                          Copy bug report
                        </button>
                      )}
                    </div>

                    {/* Note input */}
                    {noteOpen && (
                      <div className="mt-2 ml-5">
                        <textarea
                          className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows={2}
                          placeholder="Notes, actual result, reproduction steps..."
                          value={s.note}
                          onChange={(e) => onNoteChange(key, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSteps.length === 0 && (
            <div className="px-4 sm:px-5 py-6 text-center text-xs text-slate-400">
              No steps match the current filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */

export default function TestingGuidePage() {
  const [state, setState] = useState<Record<string, StepState>>(getDefaultState);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setState(getSavedState());
    setMounted(true);
  }, []);

  const handleStatusChange = useCallback((key: string, status: StepStatus) => {
    setState((prev) => {
      const current = getStepState(prev, key);
      const next = { ...prev, [key]: { ...current, status } };
      saveState(next);
      return next;
    });
  }, []);

  const handleNoteChange = useCallback((key: string, note: string) => {
    setState((prev) => {
      const current = getStepState(prev, key);
      const next = { ...prev, [key]: { ...current, note } };
      saveState(next);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset all test progress? This cannot be undone.")) return;
    setState({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleExport = useCallback(() => {
    const text = exportResults(state);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teamprompt-test-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleCopyResults = useCallback(() => {
    navigator.clipboard.writeText(exportResults(state));
  }, [state]);

  const totalSteps = sections.reduce((sum, s) => sum + s.steps.length, 0);
  const counts = useMemo(() => {
    const c: Record<StepStatus, number> = { untested: 0, pass: 0, fail: 0, skip: 0 };
    for (const section of sections) {
      for (let i = 0; i < section.steps.length; i++) {
        const s = getStepState(state, stepKey(section.id, i));
        c[s.status]++;
      }
    }
    return c;
  }, [state]);

  if (!mounted) {
    return (
      <div className="max-w-4xl">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-4" />
        <div className="h-4 w-96 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  const filterOptions: { value: FilterMode; label: string; count: number }[] = [
    { value: "all", label: "All", count: totalSteps },
    { value: "untested", label: "Untested", count: counts.untested },
    { value: "pass", label: "Pass", count: counts.pass },
    { value: "fail", label: "Fail", count: counts.fail },
    { value: "skip", label: "Skip", count: counts.skip },
  ];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Testing Guide</h1>
          <p className="text-sm text-slate-500 mt-1">
            Step-by-step QA checklist. Click the status icon to cycle through
            Pass / Fail / Skip. Add notes and export results.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyResults}
            className="gap-1.5"
            title="Copy results to clipboard"
          >
            <ClipboardCopy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <ProgressBar counts={counts} total={totalSteps} />
      </div>

      {/* Toolbar — search + filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search test steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <Filter className="h-3.5 w-3.5 text-slate-400 mx-1.5" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-md transition-colors tabular-nums",
                filter === opt.value
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {opt.label}
              <span className="ml-1 text-slate-400">{opt.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            state={state}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
            filter={filter}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Completion message */}
      {counts.pass + counts.fail + counts.skip === totalSteps && totalSteps > 0 && (
        <div className={cn(
          "mt-8 rounded-xl border p-6 text-center",
          counts.fail > 0
            ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10"
            : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10"
        )}>
          {counts.fail > 0 ? (
            <>
              <Bug className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                Testing complete — {counts.fail} failure{counts.fail > 1 ? "s" : ""} found
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-1">
                Export the report to share results with the team.
              </p>
            </>
          ) : (
            <>
              <UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                All tests passed!
              </p>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70 mt-1">
                Every feature has been verified across all roles.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
