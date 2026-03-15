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
  Lock,
  MinusCircle,
  Puzzle,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
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
          "Overview widgets load (total prompts, users, usage chart, guardrail activity if violations exist). Setup wizard appears if onboarding is incomplete.",
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
        action: "Create a new team via the 'Manage Teams' button on the Team page",
        expected:
          "Manage Teams modal opens. Click 'New Team' — create modal opens. After saving, team appears in the modal list and as a filter chip.",
        priority: "P0",
      },
      {
        action: "Edit a team from the Manage Teams modal (pencil icon)",
        expected:
          "Edit modal opens with name and description pre-filled. Changes save and reflect immediately in both the modal list and filter chips.",
        priority: "P1",
      },
      {
        action: "Delete a team from the Manage Teams modal (trash icon)",
        expected:
          "Confirmation dialog shows member count with reassign/remove options. Team is removed and members are handled per selection.",
        priority: "P1",
      },
      {
        action: "In org chart view, click a team card to drill into team detail, then click Edit or Delete",
        expected:
          "Edit and Delete buttons work from within the team detail view. Edit opens modal, Delete shows confirmation. No need to navigate back first.",
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
          "Preview shows example rules and patterns. After install, rules appear in the Guardrails Policies tab with the pack name in the Source column.",
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
          'Click "Browse All Packs" on the Guardrails Policies tab',
        expected:
          "Modal opens showing 19 compliance packs grouped into 8 industry categories (Healthcare, Education, Finance, etc.). Installed packs show a green checkmark.",
        priority: "P1",
      },
      {
        action:
          "Install a pack from the Browse All Packs modal, then check the Policies tab",
        expected:
          "Pack installs. Rules appear in the Policies table with the pack name badge in the Source column. Pack filter dropdown now includes the installed pack.",
        priority: "P1",
      },
      {
        action:
          "Use the Pack filter dropdown on the Policies tab to filter by an installed pack",
        expected:
          "Table filters to show only rules from the selected pack. Selecting 'No Pack' shows custom/default rules. 'All' shows everything.",
        priority: "P1",
      },
      {
        action:
          "Click column headers on the Policies table (Name, Source, Scope, Category, Severity, Active)",
        expected:
          "Table sorts by the clicked column. Clicking again reverses sort direction. Arrow icon indicates current sort.",
        priority: "P1",
      },
      {
        action:
          "Click column headers on the Violations table (Date, User, Policy, Detection, Action)",
        expected:
          "Table sorts by the clicked column. Clicking again reverses sort direction.",
        priority: "P1",
      },
      {
        action:
          "Check the 4 stat cards at the top of the Guardrails page",
        expected:
          "Shows: Active/Inactive policies count, violations with week-over-week trend arrow, block rate percentage, and top triggered rule name. If no violations, shows 'Install packs' prompt.",
        priority: "P1",
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
        action: "Scroll to the Guardrail Activity section on Analytics (requires violations)",
        expected:
          "Shows 4 stat cards (Total Blocks with weekly count, Total Warnings, Block Rate, Users Flagged), most-triggered rules bar chart with severity badges, and per-member violations breakdown table.",
        priority: "P1",
      },
      {
        action: "Check the Dashboard for Guardrail Activity widget (requires violations)",
        expected:
          "Dashboard shows Guardrail Activity card with blocks/warnings this week, total blocks, users flagged, and top 3 triggered rules. Links to /guardrails. Only visible to admin/manager.",
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
  {
    id: "guardrails",
    title: "Guardrails & Compliance Packs",
    icon: ShieldAlert,
    description:
      "Test every compliance pack and built-in security rule with real sample data. Copy-paste the test strings into an AI tool with the extension active.",
    preconditions: [
      "Logged in as Admin or Manager role",
      "Extension is installed and active on a supported AI tool",
      "DLP Guardrails enabled in Settings → Security",
      "At least one compliance pack installed OR default rules active",
    ],
    steps: [
      // ── HIPAA ──
      {
        action:
          'Install the HIPAA compliance pack from Guardrails → Policies → "Install Compliance Pack"',
        expected:
          "4 rules are created: Medical Record Number (block), Health Insurance ID (block), Diagnosis Code ICD-10 (warn), Drug/Prescription Names (warn).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Patient MRN: A12345678 was admitted on Monday"',
        expected:
          "BLOCK fires — Medical Record Number detected. Block overlay appears.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Member ID: XYZ123456789 for Blue Cross plan"',
        expected:
          "BLOCK fires — Health Insurance ID detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Diagnosis code J45.20 indicates moderate asthma"',
        expected:
          "WARN fires — ICD-10 Diagnosis Code detected. Warning banner appears (user can override if allowed).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Patient is taking Metformin 500 mg twice daily"',
        expected:
          "WARN fires — Drug/Prescription Name detected.",
        priority: "P0",
      },
      // ── PCI-DSS ──
      {
        action:
          'Install the PCI-DSS compliance pack',
        expected:
          "5 rules are created: Visa CC (block), Mastercard CC (block), Amex CC (block), CVV/CVC (block), Card Expiration (warn).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Please charge card 4111111111111111 for the order"',
        expected:
          "BLOCK fires — Visa credit card number detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Customer\'s Mastercard is 5425233430109903"',
        expected:
          "BLOCK fires — Mastercard number detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Amex card ending 378282246310005 was declined"',
        expected:
          "BLOCK fires — Amex card number detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "The CVV is 742 on the back of the card"',
        expected:
          "BLOCK fires — CVV/CVC code detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Card expiry 09/2027, please update before then"',
        expected:
          "WARN fires — Card expiration date detected.",
        priority: "P1",
      },
      // ── GDPR ──
      {
        action:
          'Install the GDPR compliance pack',
        expected:
          "5 rules are created: EU National ID (block), EU Passport (block), IBAN (block), EU VAT Number (warn), Date of Birth (warn).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Her national ID: AB12345678 is on file"',
        expected:
          "BLOCK fires — EU National ID detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Passport #L987654321 expires next year"',
        expected:
          "BLOCK fires — EU Passport Number detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Wire to IBAN DE89370400440532013000 by Friday"',
        expected:
          "BLOCK fires — IBAN detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Invoice VAT: DE123456789 for Acme GmbH"',
        expected:
          "WARN fires — EU VAT Number detected.",
        priority: "P1",
      },
      {
        action:
          'Paste into AI tool: "Date of birth: 15/03/1990, verified in system"',
        expected:
          "WARN fires — Date of Birth detected.",
        priority: "P1",
      },
      // ── CCPA ──
      {
        action:
          'Install the CCPA compliance pack',
        expected:
          "4 rules are created: CA Driver License (block), Social Security Number (block), US Phone Number (warn), Physical Address (warn).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "License number B1234567 was used for verification"',
        expected:
          "BLOCK fires — California Driver License detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "SSN on file is 123-45-6789 for this applicant"',
        expected:
          "BLOCK fires — Social Security Number detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Contact the client at (415) 555-0198 for follow-up"',
        expected:
          "WARN fires — US Phone Number detected.",
        priority: "P1",
      },
      {
        action:
          'Paste into AI tool: "Ship to 742 Evergreen Ave, Springfield IL 62704"',
        expected:
          "WARN fires — Physical Address detected.",
        priority: "P1",
      },
      // ── SOC 2 ──
      {
        action:
          'Install the SOC 2 compliance pack',
        expected:
          "6 rules are created: Access Log Entry (warn), Encryption Key Reference (block), Audit Trail Data (warn), System Configuration (block), Internal IP/Hostname (warn), Service Account Credentials (block).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "AES key: dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGVuYw=="',
        expected:
          "BLOCK fires — Encryption Key Reference detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "DATABASE_URL=postgres://admin:s3cret@db.internal:5432/prod"',
        expected:
          "BLOCK fires — System Configuration detected. May also trigger Connection String from default rules.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "client_secret=aB3dEfGhIjKlMnOpQrStUv_xYz012345"',
        expected:
          "BLOCK fires — Service Account Credentials detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Connect to api-gateway.internal.corp on 10.0.3.55"',
        expected:
          "WARN fires — Internal IP/Hostname detected.",
        priority: "P1",
      },
      {
        action:
          'Paste into AI tool: "audit: action=delete_record by user=jsmith at 14:32"',
        expected:
          "WARN fires — Audit Trail Data detected.",
        priority: "P1",
      },
      // ── General PII ──
      {
        action:
          'Install the General PII compliance pack',
        expected:
          "4 rules are created: Email Address (warn), Phone Number International (warn), IP Address (warn), Geolocation Coordinates (warn).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "Send the report to jane.doe@acmecorp.com today"',
        expected:
          "WARN fires — Email Address detected.",
        priority: "P1",
      },
      {
        action:
          'Paste into AI tool: "Call the vendor at +442071234567 for pricing"',
        expected:
          "WARN fires — International Phone Number detected.",
        priority: "P1",
      },
      {
        action:
          'Paste into AI tool: "The production server is running on 192.168.1.42"',
        expected:
          "WARN fires — IP Address detected.",
        priority: "P1",
      },
      {
        action:
          'Paste into AI tool: "Office is located at 37.7749, -122.4194 in SF"',
        expected:
          "WARN fires — Geolocation Coordinates detected.",
        priority: "P1",
      },
      // ── Default Built-in Rules (API Keys & Credentials) ──
      {
        action:
          'Paste into AI tool: "AKIAIOSFODNN7EXAMPLE is the AWS access key"',
        expected:
          "BLOCK fires — AWS Access Key detected (built-in default rule, active by default).",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef1234"',
        expected:
          "BLOCK fires — GitHub Token detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "sk_test_" followed by 24 random chars (e.g. sk_test_xxxx…)',
        expected:
          "BLOCK fires — Stripe Secret Key detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "sk-proj-ABCDEFGHIJKLMNOPqrst"',
        expected:
          "BLOCK fires — OpenAI API Key detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "xoxb-" followed by number-token-string format (e.g. xoxb-xxxx…)',
        expected:
          "BLOCK fires — Slack Token detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "password=MyS3cretP@ss! in the config file"',
        expected:
          "BLOCK fires — Password in Text detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "mongodb://admin:password123@db.example.com:27017/production"',
        expected:
          "BLOCK fires — Connection String detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "-----BEGIN RSA PRIVATE KEY-----\\nMIIEpAIBAAKCAQ..."',
        expected:
          "BLOCK fires — Private Key Block detected.",
        priority: "P0",
      },
      {
        action:
          'Paste into AI tool: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"',
        expected:
          "BLOCK fires — JWT Token detected.",
        priority: "P0",
      },
      // ── Sanitization / Auto-Redact ──
      {
        action:
          'Enable Auto-Redact in Settings → Security, then paste: "SSN 123-45-6789 and card 4111111111111111"',
        expected:
          'Auto-redact replaces with placeholders like "SSN {{PII_1}} and card {{PII_2}}". Scan returns action: "auto_redact" with sanitized content.',
        priority: "P0",
      },
      {
        action:
          'With a block-level violation, click "Send Sanitized Version" on the block overlay',
        expected:
          "Preview shows sanitized text with {{CATEGORY_N}} placeholders. Confirm inserts the sanitized version into the AI chat input.",
        priority: "P0",
      },
      // ── Pattern Tester ──
      {
        action:
          'Go to Guardrails → create or edit a rule. Use Pattern Tester with regex: \\b\\d{3}-\\d{2}-\\d{4}\\b and test text: "My SSN is 123-45-6789"',
        expected:
          "Pattern tester highlights the match. Shows 1 match found.",
        priority: "P1",
      },
      {
        action:
          'In Pattern Tester, try a keyword rule with keywords: "confidential, internal only, secret" and test: "This is a confidential document for internal only use"',
        expected:
          "Pattern tester shows 2 matches: 'confidential' and 'internal only'.",
        priority: "P1",
      },
      // ── Sensitive Terms ──
      {
        action:
          'Go to Guardrails → Sensitive Terms. Add terms: "Project Phoenix", "Operation Sunrise", "Q4 acquisition target"',
        expected:
          "Terms appear in list. Pasting any of these into an AI tool triggers detection.",
        priority: "P1",
      },
      {
        action:
          'Paste into AI tool: "The Q4 acquisition target is Company XYZ"',
        expected:
          "Detection fires for sensitive term match.",
        priority: "P1",
      },
      // ── Custom Rules ──
      {
        action:
          'Create a custom regex rule for internal project codes: pattern = "PROJ-\\d{4,6}" with category "internal_terms" and severity "warn"',
        expected:
          "Rule saves. Pattern tester validates. Pasting 'Update PROJ-12345 status' triggers a warn.",
        priority: "P1",
      },
      {
        action:
          'Create an exact-match rule for a client name: pattern = "Acme Corp Confidential" with severity "block"',
        expected:
          'Rule saves. Pasting "This is Acme Corp Confidential information" triggers a block.',
        priority: "P1",
      },
      // ── Edge Cases ──
      {
        action:
          "Paste a message with multiple violations: \"Patient MRN: A12345678, SSN 123-45-6789, card 4111111111111111\"",
        expected:
          "All violations detected and listed. Highest severity (block) takes priority.",
        priority: "P0",
      },
      {
        action:
          "Paste clean text with no sensitive data: \"Please summarize our Q3 marketing strategy for the team meeting\"",
        expected:
          "No detection fires. Message passes through without any guardrails banner.",
        priority: "P0",
      },
      {
        action:
          "Toggle a compliance pack rule to inactive, then test with its sample data",
        expected:
          "No detection fires for the inactive rule. Re-enabling the rule restores detection.",
        priority: "P1",
      },
    ],
  },
  {
    id: "security-settings",
    title: "Security Settings & Org Policies",
    icon: Lock,
    description:
      "Test org-level security toggles and their effect on guardrail behavior.",
    preconditions: [
      "Logged in as Admin",
      "Extension installed and active",
      "At least one block-level and one warn-level rule active",
    ],
    steps: [
      {
        action:
          "Go to Settings → Security. Toggle 'Enable DLP Guardrails' OFF",
        expected:
          "Warning banner appears: 'DLP guardrails are disabled.' All guardrail detection stops in the extension. Override and Auto-Redact toggles become disabled.",
        priority: "P0",
      },
      {
        action:
          "With DLP disabled, paste: \"AKIAIOSFODNN7EXAMPLE\" into an AI tool",
        expected:
          "No block fires. Message goes through undetected.",
        priority: "P0",
      },
      {
        action:
          "Re-enable DLP Guardrails, then toggle 'Allow Warning Override' OFF",
        expected:
          "Setting saves. Warn-level rules now behave as blocks — user cannot proceed past detection.",
        priority: "P0",
      },
      {
        action:
          'With Override OFF, paste: "Send the report to jane.doe@acmecorp.com"',
        expected:
          "BLOCK fires (email is a warn-level rule, but override is disabled so it becomes a block). No override button shown.",
        priority: "P0",
      },
      {
        action:
          "Toggle 'Allow Warning Override' back ON",
        expected:
          "Warn-level rules show warning banner with override option again.",
        priority: "P1",
      },
      {
        action:
          "Toggle 'Auto-Redact Sensitive Data' ON",
        expected:
          "Setting saves. Violations now auto-replace with {{PLACEHOLDER}} tokens instead of blocking.",
        priority: "P0",
      },
      {
        action:
          "Toggle 'Activity Logging' OFF, then trigger a guardrail violation",
        expected:
          "Violation is still caught (block/warn fires), but no new entry appears in the Activity Log.",
        priority: "P1",
      },
      {
        action:
          "On a Free plan org, check that gated toggles show Lock icon + 'Team' badge",
        expected:
          "Allow All AI Tools, Allow Warning Override, Auto-Redact, and Activity Logging show as locked/disabled for Free plan.",
        priority: "P1",
      },
    ],
  },
  {
    id: "team-notifications-v190",
    title: "Team & Notification Features (v1.9.0)",
    icon: UserCheck,
    description:
      "Test org chart view, smart invite flow, pending invites in table, extension inactive alerts, and prompt grid view.",
    preconditions: [
      "Logged in as Admin or Manager role",
      "Organization has at least one team with members",
      "Extension is installed and linked to same account",
      "At least one prompt exists in the vault",
    ],
    steps: [
      {
        action:
          "Go to Team page → click the network icon toggle in the toolbar",
        expected:
          "View switches to org chart. Teams display as cards with member avatars, roles, and team counts. Click a team card header to enter detail view.",
        priority: "P0",
      },
      {
        action:
          "Click Invite Member → type the email of an existing member in your org",
        expected:
          "Modal detects the member is already in the org and switches to 'Add to Team' mode, showing the member's avatar and a badge. Select a team and click 'Add to Team'.",
        priority: "P0",
      },
      {
        action:
          "Send an invite to a new email → check the members table",
        expected:
          "Pending invite appears as a row in the members table with an amber 'Pending' badge.",
        priority: "P1",
      },
      {
        action:
          "(Manual test) Set a member's last_extension_active to >24h ago in DB → trigger /api/cron/extension-check",
        expected:
          "Notification appears in the bell icon for all admins and managers. Email alert is also sent. Alerts are throttled to once per member every 7 days.",
        priority: "P1",
      },
      {
        action:
          "Go to Prompts → click the grid icon in the toolbar",
        expected:
          "View switches to grid layout. Cards display with title, preview, tags, rating, and usage count.",
        priority: "P1",
      },
    ],
  },
  {
    id: "recent",
    title: "Risk Scoring, Audit & Export (v1.11.0+)",
    icon: ShieldAlert,
    description:
      "Test prompt risk scoring, activity & audit log export, notification management, and usage cap indicators.",
    preconditions: [
      "Logged in as Admin or Manager role",
      "Extension is installed and has logged at least a few AI interactions",
      "At least one guardrail rule is active (to trigger violations for risk scoring)",
      "Organization is on Team plan or above (for audit log access)",
    ],
    steps: [
      // ── Risk Scoring ──
      {
        action:
          "Open the Analytics & Audit page from the sidebar",
        expected:
          "Page title shows 'Analytics & Audit'. Summary cards at top include Average Risk Score, High Risk (40+) count, and Critical (70+) count.",
        priority: "P0",
      },
      {
        action:
          "Send a message through the extension that triggers a guardrail violation (e.g. paste a test API key)",
        expected:
          "Log entry appears with a color-coded risk score badge. Score is 0–100 based on severity: green (0–15), yellow (16–39), orange (40–69), red (70–89), dark red (90–100).",
        priority: "P0",
      },
      {
        action:
          "Send a clean message through the extension with no sensitive data",
        expected:
          "Log entry appears with a low risk score (0–15) and a green badge.",
        priority: "P0",
      },
      {
        action:
          "Send a message with multiple violations (e.g. an API key AND an email address)",
        expected:
          "Risk score is higher than a single-violation entry. Multiple guardrail flags shown on the log entry.",
        priority: "P1",
      },
      // ── Audit Log Export ──
      {
        action:
          "On the Analytics & Audit page, click the Export dropdown button",
        expected:
          "Dropdown shows two options: 'Export as CSV' and 'Export as JSON'.",
        priority: "P0",
      },
      {
        action:
          "Click 'Export as CSV' with no filters applied",
        expected:
          "CSV file downloads containing all log entries. File includes columns for timestamp, AI tool, action, risk score, guardrail flags, and prompt text (if full logging mode is on).",
        priority: "P0",
      },
      {
        action:
          "Apply a date filter (e.g. 'Last 7 Days') and an action filter (e.g. 'Blocked'), then export as JSON",
        expected:
          "JSON file downloads containing only filtered entries. Verify the exported data matches the visible filtered results.",
        priority: "P1",
      },
      {
        action:
          "Switch to metadata-only logging mode in Settings → Security, then export",
        expected:
          "Exported data includes action, tool, timestamps, and risk scores but does NOT include prompt text content.",
        priority: "P1",
      },
      // ── Notifications Management ──
      {
        action:
          "Click the notification bell in the header → navigate to the full Notifications page",
        expected:
          "Notifications page shows all notifications with type icons, timestamps, and read/unread status.",
        priority: "P0",
      },
      {
        action:
          "Use the type filter dropdown to filter by 'Security' notifications only",
        expected:
          "Only security_violation notifications are shown. Other types are hidden. Filter badge shows active count.",
        priority: "P1",
      },
      {
        action:
          "Select multiple notifications using the checkboxes, then click 'Mark Read'",
        expected:
          "All selected notifications are marked as read. Unread badge count in header decreases accordingly.",
        priority: "P0",
      },
      {
        action:
          "Select multiple notifications using the checkboxes, then click 'Delete'",
        expected:
          "Confirmation appears. Selected notifications are permanently removed from the list.",
        priority: "P1",
      },
      {
        action:
          "Click 'Mark All Read' button",
        expected:
          "All notifications are marked as read. Bell icon badge disappears.",
        priority: "P1",
      },
      // ── Usage Cap Indicators ──
      {
        action:
          "Navigate to the Prompts (Vault) page on a Free plan account",
        expected:
          "Usage indicator appears near the top showing current prompt count vs max (e.g. '12 / 25 prompts'). Badge warns when approaching limit.",
        priority: "P0",
      },
      {
        action:
          "Navigate to the Team page on a Free plan account",
        expected:
          "Usage indicator shows current member count vs max (e.g. '2 / 3 members'). Upgrade prompt appears when at limit.",
        priority: "P1",
      },
      {
        action:
          "Navigate to the Guidelines page on a Free or Pro plan account",
        expected:
          "Usage indicator shows current guideline count vs max. Upgrade nudge appears when limit is reached.",
        priority: "P1",
      },
      // ── Audit Trail Compliance ──
      {
        action:
          "Set log retention to 30 days in Settings → Security → Activity & Privacy",
        expected:
          "Retention setting saves. Confirmation shows logs older than 30 days will be auto-deleted.",
        priority: "P1",
      },
      {
        action:
          "Verify the sidebar label shows 'Analytics & Audit' under Intelligence section",
        expected:
          "Sidebar navigation item reads 'Analytics & Audit', not just 'Activity Log'.",
        priority: "P0",
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
