# TeamPrompt Backlog

## Completed
- [x] Member role dashboard restrictions
  - Settings layout: hide Billing & Plan tabs for members
  - Billing page: role gate (admin only message)
  - Plan & Usage tab: role gate (contact admin message)
  - UpgradeGate: member-aware messaging (no upgrade button, "contact admin")
  - Dashboard quick actions: "My Settings" instead of "Manage Team" for members
  - Payment banner: member-safe messaging (no billing links for members)
  - Templates: request+approval system for member installs
    - DB migration: `029_pack_install_requests.sql`
    - API: `/api/template-packs/request` (POST create, GET list)
    - API: `/api/template-packs/request/[requestId]` (PATCH approve/reject)
    - UI: "Request Install" button for members, "Requested" badge, admin approval banner
- [x] Extension install email system
  - API: `POST /api/invite/extension-email` (bulk or targeted, admin/manager only)
  - Auto-sends extension install email on invite accept (non-blocking)
  - Email links to `/extensions` page with browser store links
  - Rate limited (5/min per org)
- [x] Extension tab restructure: Faves, Recent, Prompts
  - Tabs: Faves (default) | Recent | Prompts — Shield removed, now overlay via status bar
  - Guardrails button in status bar with checkmark icon when active
  - "+ Add Rule" text button in status bar → opens dashboard guardrails page
- [x] Categories & tags filtering on all tabs
  - Filter bar (folder dropdown + tag multi-select) now shows on Faves, Recent, and Prompts tabs
- [x] Dashboard: hide settings cog from members
  - Settings gear dropdown hidden for member role
  - Organization tab in settings gated to admin/manager
- [x] Guardrails: member rule/policy suggestion flow
  - DB: `rule_suggestions` table (org_id, team_id nullable, suggested_by, name, description, category, severity, status, reviewed_by)
  - DB migration: `030_rule_suggestions.sql` with RLS policies
  - API: `POST /api/guardrails/suggest` (any org member can suggest)
  - API: `GET /api/guardrails/suggest` (admin/manager gets pending suggestions)
  - API: `PATCH /api/guardrails/suggest/[id]` (approve/reject with notes)

## Pending
