export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  details?: string;
  badge?: "new" | "fix" | "improvement";
}

export const APP_VERSION = "1.10.0";

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.10.0",
    date: "2026-03-09",
    title: "19 Compliance Packs, Sortable Tables & Guardrail Insights",
    highlights: [
      "13 new compliance packs — FERPA, GLBA, NIST 800-171, FedRAMP, NAIC, ITAR, CJIS, COPPA, FTC/Retail, HITECH, SOX, RESPA/TILA, and Legal Privilege (19 total across 8 industries)",
      "Browse All Packs modal — explore compliance packs organized by industry category with install status",
      "Sortable guardrail tables — click any column header on Policies or Violations to sort ascending/descending",
      "Pack source tracking & filtering — see which compliance pack each rule came from, filter policies by pack",
      "Smarter guardrail stats — week-over-week violation trends, block rate, top triggered rule, active/inactive policy counts",
      "Dashboard & Analytics guardrail widgets — admins and managers see guardrail activity, top triggered rules, and per-user breakdowns",
      "Manage Teams modal — centralized team management (create, edit, delete) without cluttering filter chips",
      "Fixed org chart team detail — edit and delete now work correctly from within team drill-down views",
    ],
    badge: "new",
  },
  {
    version: "1.9.0",
    date: "2026-03-09",
    title: "Org Chart, Extension Alerts & Team UX Improvements",
    highlights: [
      "Visual org chart — toggle between table and org chart view to see teams, members, and roles at a glance",
      "Extension inactive alerts — admins and managers receive in-app notifications and emails when a member's extension goes inactive for 24+ hours",
      "Prompt grid view — switch between list and tile layout on the Prompts page",
      "Smart invite modal — auto-detects existing members and switches to 'Add to Team' instead of sending a duplicate invite",
      "Pending invites in table — pending invitations now appear inline in the members table with status badges and quick actions",
      "Member source tracking — see which members were manually invited, bulk imported, or synced from Google Workspace",
    ],
    badge: "new",
  },
  {
    version: "1.8.0",
    date: "2026-03-09",
    title: "Team-Scoped Prompts, Role Permissions & Extension Redesign",
    highlights: [
      "AI-powered rule generation — describe what to protect in plain English, AI creates the guardrail patterns",
      "Anthropic (Claude) support — connect your Anthropic API key alongside OpenAI for AI detection and rule generation",
      "Team-scoped prompt visibility — members only see their own prompts and approved prompts from their teams",
      "Guardrail suggestions — team members can suggest new security rules for admin review",
      "Redesigned extension overlay — shield indicator with contextual states (active, inactive, scanning)",
      "Compose email from admin inbox — send emails to any address directly from the ticket system",
    ],
    badge: "new",
  },
  {
    version: "1.7.0",
    date: "2026-02-28",
    title: "Admin Security Controls & Extension Settings",
    highlights: [
      "New Security settings tab — 6 org-level toggles to control extension behavior, guardrails, and activity logging",
      "Disable guardrail overrides — treat all warnings as hard blocks for stricter enforcement",
      "Auto-redact mode — automatically replace sensitive data with {{PLACEHOLDER}} tokens instead of blocking",
      "Activity logging toggle — disable conversation logging while still tracking usage counts",
      "Plan-gated security features with Team+ badges for custom_security and audit_log controls",
    ],
    badge: "new",
  },
  {
    version: "1.6.0",
    date: "2026-02-28",
    title: "Google Workspace Sync, Auto-Join & Bulk Role Management",
    highlights: [
      "Google Workspace directory sync — connect your Google admin, import users, and map groups to teams",
      "Domain-based auto-join — new users with matching email domains automatically join your org",
      "Custom invite welcome message — add a personal note that appears in all invite emails",
      "Bulk role assignment — select multiple members and change their roles at once from the Team page",
    ],
    badge: "new",
  },
  {
    version: "1.5.0",
    date: "2026-02-28",
    title: "Bulk Employee Import & Integrations",
    highlights: [
      "Bulk CSV import — upload or paste a CSV to invite dozens of members at once",
      "Auto-create teams during import when team names don't exist yet",
      "Preview validation before sending: see which rows are valid, which will create new teams, and which will be skipped",
      "New Integrations settings page with Google Workspace, Microsoft Entra ID, and SCIM 2.0 cards",
    ],
    badge: "new",
  },
  {
    version: "1.4.0",
    date: "2026-02-28",
    title: "Two-Factor Auth, Profile & Team Improvements",
    highlights: [
      "Two-factor authentication (TOTP) for admins and managers with org-level enforcement",
      "Avatar upload with drag-and-drop on your profile",
      "Change your email address — admins can update member emails too",
      "Color-coded categories with 12 preset colors",
      "Edit and delete teams from the team detail view",
    ],
    badge: "new",
  },
  {
    version: "1.3.0",
    date: "2026-02-27",
    title: "Compliance Packs, Auto-Sanitization & More",
    highlights: [
      "One-click compliance policy packs (HIPAA, GDPR, PCI-DSS, CCPA, SOC 2, General PII)",
      "Auto-sanitization replaces sensitive data with safe {{PLACEHOLDER}} tokens",
      "Prompt effectiveness analytics with rating distribution",
      "Dedicated approval queue for pending prompts and rule suggestions",
      "Version diff view — compare any two versions side by side",
    ],
    badge: "new",
  },
  {
    version: "1.2.0",
    date: "2026-01-15",
    title: "Template Packs & Import Improvements",
    highlights: [
      "Built-in template packs for common workflows",
      "Improved CSV/JSON import with column mapping",
      "Bulk export with metadata preservation",
      "Template variable default values",
    ],
    badge: "improvement",
  },
  {
    version: "1.1.0",
    date: "2025-12-10",
    title: "Browser Extension & Guardrails",
    highlights: [
      "Chrome extension with side panel support",
      "Real-time DLP scanning on outbound prompts",
      "15 built-in security patterns",
      "Activity logging and audit trail",
    ],
    badge: "new",
  },
  {
    version: "1.0.0",
    date: "2025-11-01",
    title: "Initial Release",
    highlights: [
      "Shared prompt vault with search and tags",
      "Quality guidelines with 14 built-in templates",
      "Team management with Admin, Manager, and Member roles",
      "Analytics dashboard with usage tracking",
    ],
    badge: "new",
  },
];
