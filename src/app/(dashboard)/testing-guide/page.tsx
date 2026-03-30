"use client";

import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  Minus,
  AlertTriangle,
  Shield,
  FileText,
  Users,
  BookOpen,
  ArrowRight,
  Eye,
  Zap,
  Cloud,
  Download,
  Monitor,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import Link from "next/link";

// ─── Plan matrix data ─────────────────────────────────────────────

const FEATURE_ROWS: {
  label: string;
  type: "boolean" | "number";
  free: string | boolean;
  pro: string | boolean;
  team: string | boolean;
  business: string | boolean;
}[] = [
  { label: "Prompts",           type: "number",  free: "25",        pro: "Unlimited",  team: "Unlimited",  business: "Unlimited" },
  { label: "Members",           type: "number",  free: "3",         pro: "12",   team: "50",         business: "500" },
  { label: "AI Tools",          type: "number",  free: "3",         pro: "Unlimited",  team: "Unlimited",  business: "Unlimited" },
  { label: "Guidelines",        type: "number",  free: "5",         pro: "14",         team: "14",         business: "Unlimited" },
  { label: "Analytics",         type: "boolean", free: false,       pro: true,         team: true,         business: true },
  { label: "Import / Export",   type: "boolean", free: false,       pro: true,         team: true,         business: true },
  { label: "Basic Security",    type: "boolean", free: true,        pro: true,         team: true,         business: true },
  { label: "Custom Security",   type: "boolean", free: false,       pro: true,         team: true,         business: true },
  { label: "Activity / Audit Log", type: "boolean", free: false,    pro: false,        team: true,         business: true },
];

// ─── Test steps ───────────────────────────────────────────────────

interface TestStep {
  id: string;
  page: string;
  path: string;
  plan: string;
  component: string;
  what: string;
  trigger: string;
  expected: string;
}

const TEST_STEPS: TestStep[] = [
  // ── Full-page gates (UpgradeGate) ─────────────────────────────
  {
    id: "FG-1",
    page: "Audit",
    path: "/audit",
    plan: "Free",
    component: "UpgradeGate",
    what: "Full-page feature gate",
    trigger: "Navigate to /audit as a Free user (must be admin/manager)",
    expected: "Centered card with BarChart3 icon, \"Analytics\" heading, 3 benefit bullets, \"Upgrade to Pro\" button linking to /settings/billing, and \"Pro plan\" badge. Members see a role-gate message instead.",
  },
  {
    id: "FG-2",
    page: "Import / Export",
    path: "/import-export",
    plan: "Free",
    component: "UpgradeGate",
    what: "Full-page feature gate",
    trigger: "Navigate to /import-export as a Free user",
    expected: "Centered card with Import icon, \"Import / Export\" heading, 3 benefit bullets, \"Upgrade to Pro\" button, \"Pro plan\" badge.",
  },
  {
    id: "FG-3",
    page: "Activity Log",
    path: "/activity",
    plan: "Free or Pro",
    component: "UpgradeGate",
    what: "Full-page feature gate",
    trigger: "Navigate to /activity as a Free or Pro user (must be admin/manager role)",
    expected: "Centered card with Activity icon, \"Activity Log\" heading, 3 benefit bullets, \"Upgrade to Team\" button, \"Team plan\" badge.",
  },
  {
    id: "FG-4",
    page: "Guardrails \u2192 Violations tab",
    path: "/guardrails",
    plan: "Free or Pro",
    component: "UpgradeGate",
    what: "Tab-level feature gate",
    trigger: "Navigate to /guardrails and click the \"Violations\" tab as Free or Pro user",
    expected: "\"Security Violation Log\" heading with Activity icon, 3 benefit bullets, \"Upgrade to Team\" button.",
  },
  {
    id: "FG-5",
    page: "Guardrails \u2192 Policies tab",
    path: "/guardrails",
    plan: "Free",
    component: "UpgradeGate",
    what: "Inline feature gate",
    trigger: "Navigate to /guardrails as a Free user, stay on Policies tab",
    expected: "UpgradeGate for \"Custom Security Policies\" appears above the policies table. Shield icon, 3 benefit bullets, \"Upgrade to Pro\" button. \"New Policy\" button is hidden. \"Install Defaults\" button is gated (silently blocked).",
  },
  {
    id: "FG-6",
    page: "Guardrails \u2192 Detection tab",
    path: "/guardrails",
    plan: "Free",
    component: "Badge + Button",
    what: "Inline feature label",
    trigger: "Navigate to /guardrails \u2192 Detection tab as Free user, scroll to AI-Powered Detection card",
    expected: "AI-Powered Detection shows a \"Pro Plan\" badge (not a toggle). Below the description, an \"Upgrade to Pro\" button links to /settings/billing.",
  },

  // ── Limit banners (UpgradePrompt) ─────────────────────────────
  {
    id: "LP-1",
    page: "Vault (Prompts)",
    path: "/vault",
    plan: "Free at 25/25",
    component: "UpgradePrompt",
    what: "At-limit inline banner",
    trigger: "As a Free user with 25 prompts, visit /vault",
    expected: "Below the page header: a primary-tinted banner with FileText icon showing \"You've used 25 of 25 prompts\", subtitle \"Upgrade to Pro for unlimited prompts\", and an \"Upgrade\" button. Clicking \"New Prompt\" does nothing (no toast).",
  },
  {
    id: "LP-2",
    page: "Team",
    path: "/team",
    plan: "Free at 3/3",
    component: "UpgradePrompt",
    what: "At-limit inline banner",
    trigger: "As a Free user with 3 members, visit /team",
    expected: "Below the page header: banner with Users icon showing \"You've used 3 of 3 members\", subtitle \"Upgrade to Team for up to 50 members\", and \"Upgrade\" button. Clicking \"Invite Member\" and trying to send does nothing (no toast).",
  },
  {
    id: "LP-3",
    page: "Prompt Library → Guidelines tab",
    path: "/vault",
    plan: "Free at 5/5",
    component: "UpgradePrompt",
    what: "At-limit inline banner",
    trigger: "As a Free user with 5 guidelines, visit /vault and click the Guidelines tab",
    expected: "Banner with BookOpen icon showing \"You've used 5 of 5 guidelines\", subtitle \"Upgrade to Pro for up to 14 guidelines\", and \"Upgrade\" button. Clicking \"New Guideline\" does nothing (no toast).",
  },

  // ── Approaching-limit nudges (LimitNudge) ─────────────────────
  {
    id: "LN-1",
    page: "Vault (Prompts)",
    path: "/vault",
    plan: "Free at 20-24",
    component: "LimitNudge",
    what: "Approaching-limit warning",
    trigger: "As a Free user with 20\u201324 prompts, visit /vault",
    expected: "Below the page header (before stats): a subtle muted banner with FileText icon, text \"You're using **20** of **25** prompts.\" with a \"View plans\" link and an X dismiss button. Does NOT appear at 19 or fewer, or at 25 (UpgradePrompt shows instead).",
  },
  {
    id: "LN-2",
    page: "Team",
    path: "/team",
    plan: "Free at 2/3",
    component: "LimitNudge",
    what: "Approaching-limit warning",
    trigger: "As a Free user with 2 members, visit /team",
    expected: "Muted banner: Users icon, \"You're using **2** of **3** members.\" + \"View plans\" link + dismiss X. Threshold for max=3 is max-1=2, so shows at exactly 2 members. Does NOT show at 1 or at 3.",
  },
  {
    id: "LN-3",
    page: "Guidelines",
    path: "/guidelines",
    plan: "Free at 4/5",
    component: "LimitNudge",
    what: "Approaching-limit warning",
    trigger: "As a Free user with 4 guidelines, visit /guidelines",
    expected: "Muted banner: BookOpen icon, \"You're using **4** of **5** guidelines.\" + \"View plans\" link + dismiss X. Threshold for max=5 is max-1=4, so shows at exactly 4. Does NOT show at 3 or at 5.",
  },
  {
    id: "LN-4",
    page: "LimitNudge dismiss",
    path: "/vault",
    plan: "Free at 20+",
    component: "LimitNudge",
    what: "Dismiss behavior",
    trigger: "Click the X button on any LimitNudge",
    expected: "The nudge disappears immediately. It will reappear on the next navigation or page refresh (state resets, which is intentional for a nudge).",
  },

  // ── Billing flow ──────────────────────────────────────────────
  {
    id: "BF-1",
    page: "Settings \u2192 Billing",
    path: "/settings/billing",
    plan: "Free",
    component: "Billing page",
    what: "Free plan comparison table",
    trigger: "Visit /settings/billing as a Free user",
    expected: "Shows Current Plan badge \"free\", then a comparison table with 7 rows: Prompts (25 vs Unlimited), Guidelines (5 vs 14+), Members (3 vs Up to 500), Analytics (No vs Pro+), Import / Export (No vs Pro+), Custom Security (No vs Pro+), Activity Log (No vs Team+). Plan grid shows all 4 plans with pricing.",
  },
  {
    id: "BF-2",
    page: "All upgrade buttons",
    path: "(any gated page)",
    plan: "Free",
    component: "All",
    what: "Upgrade navigation",
    trigger: "Click any \"Upgrade\", \"Upgrade to Pro\", \"Upgrade to Team\", or \"View plans\" link",
    expected: "All navigate to /settings/billing. No dead links.",
  },

  // ── Super admin bypass ────────────────────────────────────────
  {
    id: "SA-1",
    page: "All pages",
    path: "(all)",
    plan: "Super Admin",
    component: "All",
    what: "Super admin bypass",
    trigger: "Log in as super admin and visit every gated page",
    expected: "No UpgradeGate, UpgradePrompt, or LimitNudge components appear anywhere. All features are accessible. All action buttons (New Prompt, Invite Member, New Guideline, New Policy, Install Defaults) work without restriction.",
  },

  // ── Paid plan users ───────────────────────────────────────────
  {
    id: "PP-1",
    page: "Analytics, Import/Export",
    path: "/analytics, /import-export",
    plan: "Pro+",
    component: "None",
    what: "Paid user sees content",
    trigger: "Log in as a Pro, Team, or Business user",
    expected: "Analytics shows the full dashboard. Import/Export shows export/import panels. No upgrade gates.",
  },
  {
    id: "PP-2",
    page: "Activity Log",
    path: "/activity",
    plan: "Team+",
    component: "None",
    what: "Team user sees content",
    trigger: "Log in as a Team or Business user with admin/manager role",
    expected: "Full activity log with filters and conversation entries. No upgrade gate.",
  },
  {
    id: "PP-3",
    page: "Vault, Team, Guidelines",
    path: "/vault, /team, /guidelines",
    plan: "Pro+ (unlimited)",
    component: "None",
    what: "Unlimited limits show nothing",
    trigger: "Log in as a Pro user (unlimited prompts) with any number of prompts",
    expected: "No UpgradePrompt or LimitNudge appears. max=-1 causes both components to return null.",
  },

  // ── Edge cases ────────────────────────────────────────────────
  {
    id: "EC-1",
    page: "Activity Log",
    path: "/activity",
    plan: "Free (member role)",
    component: "Role gate",
    what: "Role check before plan check",
    trigger: "Log in as a Free user with 'member' role, visit /activity",
    expected: "Shows role gate first: \"Activity log requires admin or manager role\" (not the upgrade gate). The plan check only runs for admin/manager roles.",
  },
  {
    id: "EC-2",
    page: "Guardrails \u2192 Policies",
    path: "/guardrails",
    plan: "Pro",
    component: "None",
    what: "Pro user sees policies",
    trigger: "Log in as a Pro user, visit /guardrails Policies tab",
    expected: "No UpgradeGate above the table. \"New Policy\" button is visible. \"Install Defaults\" button works.",
  },
  {
    id: "EC-3",
    page: "Settings \u2192 Plan & Usage",
    path: "/settings",
    plan: "Any",
    component: "UsageBar",
    what: "Usage bars match limits",
    trigger: "Visit /settings and click Plan & Usage tab",
    expected: "Usage bars show current/max for Prompts, Members, Guidelines. Bars should match the same numbers shown in UpgradePrompt banners. Unlimited (-1) shows as \"Unlimited\" label.",
  },

  // ── AI Chat ─────────────────────────────────────────────────────
  {
    id: "CH-1",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "New conversation",
    trigger: "Click 'New Chat' or press Ctrl+N",
    expected: "Empty state shows 'What can I help you with?' heading with 2x2 suggestion cards. Input bar shows 'Message TeamPrompt...' placeholder.",
  },
  {
    id: "CH-2",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Send message and receive response",
    trigger: "Type a message and press Enter",
    expected: "User message appears as blue pill on right. Loading dots appear with TeamPrompt logo avatar. Response streams in with no bubble (document-style). Timestamp shows below each message.",
  },
  {
    id: "CH-3",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Smart scroll during streaming",
    trigger: "Send a message that generates a long response. Scroll up mid-stream.",
    expected: "Auto-scroll stops when you scroll up. Scroll back to bottom and auto-scroll resumes. On new message send, always scrolls to bottom.",
  },
  {
    id: "CH-4",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "File upload with DLP scan",
    trigger: "Click paperclip icon, select a .txt or .pdf file",
    expected: "File card appears showing 'Scanning...' with spinner. After processing: green border, shield icon, 'DLP passed \u00B7 [size]'. Send button enables.",
  },
  {
    id: "CH-5",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "File upload DLP block",
    trigger: "Upload a file containing text that matches a block-severity DLP rule",
    expected: "File is removed from pending list. Red DLP block banner appears showing violated rules.",
  },
  {
    id: "CH-6",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Right-click context menu",
    trigger: "Right-click any conversation in the sidebar",
    expected: "Menu shows: model + date header, Add to Favorites, Rename, Share, Export Markdown, Export as PDF, Collections submenu, Delete.",
  },
  {
    id: "CH-7",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Favorites persist across refresh",
    trigger: "Right-click a conversation \u2192 'Add to Favorites'. Refresh the page.",
    expected: "Conversation appears in the Favorites tab with a star icon. Still there after refresh.",
  },
  {
    id: "CH-8",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Collections",
    trigger: "Right-click a conversation \u2192 Collections \u2192 'New collection'. Name it and assign.",
    expected: "Collection appears in Collections tab. Click to filter conversations. Color dot shows on conversation item.",
  },
  {
    id: "CH-9",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Undo delete",
    trigger: "Delete a conversation (right-click \u2192 Delete or hover trash icon)",
    expected: "Toast appears: 'Conversation deleted' with 'Undo' button. Click Undo within 3 seconds to restore. Conversation returns to correct sort position.",
  },
  {
    id: "CH-10",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Code block copy + language label",
    trigger: "Ask the AI to write code (e.g. 'write a Python hello world')",
    expected: "Code block shows dark header bar with language label (e.g. 'python') on left and 'Copy' button on right. Click Copy \u2192 toast 'Copied!'.",
  },
  {
    id: "CH-11",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Compare mode",
    trigger: "Type /compare to toggle compare mode",
    expected: "Split view with two model selectors. Send a message \u2192 both models respond side-by-side.",
  },
  {
    id: "CH-12",
    page: "AI Chat",
    path: "/chat",
    plan: "Admin/Manager",
    component: "Chat page",
    what: "Admin slash commands with real data",
    trigger: "Type /activity, /violations, /usage, or /audit",
    expected: "Toast 'Fetching data from your database...' \u2192 message auto-sends \u2192 AI responds with real data from conversation_logs/security_violations tables.",
  },
  {
    id: "CH-13",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Sidebar tabs",
    trigger: "Click Chats, Favorites, Collections tabs in the sidebar",
    expected: "Each tab shows its content. Chats: time-grouped list. Favorites: starred conversations (or empty state). Collections: collection list with click-to-filter.",
  },
  {
    id: "CH-14",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Sidebar text truncation",
    trigger: "Create a conversation with a very long title",
    expected: "Title truncates with ellipsis. Full title shown on hover tooltip. Text does NOT overflow outside the sidebar panel.",
  },
  {
    id: "CH-15",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Double-click to rename",
    trigger: "Double-click a conversation title in the sidebar",
    expected: "Inline edit input appears. Press Enter to save, Escape to cancel.",
  },
  {
    id: "CH-16",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Response rating",
    trigger: "Hover over an AI response. Click thumbs up or thumbs down.",
    expected: "Selected rating highlights (green for up, red for down). Click again to clear. Rating persists on conversation reload.",
  },

  // ── Smart Redaction ─────────────────────────────────────────────
  {
    id: "SR-1",
    page: "Guardrails",
    path: "/guardrails",
    plan: "Pro+",
    component: "Rule editor",
    what: "Redact severity option",
    trigger: "Create or edit a security rule. Look at the Severity dropdown.",
    expected: "Three options: Block, Warn, Redact. Selecting 'Redact' shows badge as 'Redacts' with outline variant.",
  },
  {
    id: "SR-2",
    page: "Guardrails \u2192 Sensitive Terms",
    path: "/guardrails",
    plan: "Pro+",
    component: "Sensitive terms manager",
    what: "Redact severity on terms",
    trigger: "Add a new sensitive term. Look at the Action dropdown.",
    expected: "Three options: Block, Warn, Redact.",
  },
  {
    id: "SR-3",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Chat page",
    what: "Smart redaction in chat",
    trigger: "Set a DLP rule to severity 'Redact' (e.g. for a keyword). Type a message containing that keyword in AI Chat.",
    expected: "Message sends successfully (not blocked). Amber banner appears: 'X items redacted before sending'. The AI receives the sanitized message with [CATEGORY] placeholder. User sees the redacted version in the chat.",
  },
  {
    id: "SR-4",
    page: "Extension",
    path: "(ChatGPT/Claude/Gemini)",
    plan: "Any",
    component: "Content script",
    what: "Smart redaction in extension",
    trigger: "With a 'Redact' severity rule active, type a message containing matching text in ChatGPT.",
    expected: "Extension auto-redacts the text before sending. Warning banner shows what was replaced. Message is sent with placeholder text.",
  },

  // ── DLP & Guardrails ───────────────────────────────────────────
  {
    id: "DLP-1",
    page: "AI Chat",
    path: "/chat",
    plan: "Any",
    component: "Chat page",
    what: "DLP block in chat",
    trigger: "With a 'Block' severity rule active, type a message containing matching text.",
    expected: "Red banner: 'Message blocked by DLP' with rule name and category. Message is NOT sent to AI.",
  },
  {
    id: "DLP-2",
    page: "AI Chat",
    path: "/chat",
    plan: "Any",
    component: "Chat page",
    what: "DLP badge in header",
    trigger: "Navigate to /chat",
    expected: "Green 'DLP Active' badge with pulsing dot visible in the chat header.",
  },
  {
    id: "DLP-3",
    page: "AI Chat",
    path: "/chat",
    plan: "Any (admin)",
    component: "Admin notice",
    what: "Dismissible admin notice",
    trigger: "Click the X on 'Only admins can see AI Chat right now' banner. Refresh.",
    expected: "Banner disappears and stays dismissed after refresh (stored in localStorage).",
  },

  // ── Navigation ─────────────────────────────────────────────────
  {
    id: "NAV-1",
    page: "Sidebar",
    path: "(all)",
    plan: "Any",
    component: "Sidebar",
    what: "Nav structure",
    trigger: "Look at the sidebar navigation",
    expected: "Top section (no label): AI Chat, Prompt Library. 'Security' section: Guardrails, Activity, Audit. 'Manage' section: Team, Approvals. Template Packs and Guidelines are now inside Prompt Library (Tabs + Browse Packs button).",
  },
  {
    id: "NAV-2",
    page: "Sidebar",
    path: "(all)",
    plan: "Member role",
    component: "Sidebar",
    what: "Member nav visibility",
    trigger: "Log in as a member (not admin/manager)",
    expected: "Only see: AI Chat (if enabled), Prompt Library, Guardrails, Team. Activity, Audit, and Approvals are hidden.",
  },

  // ── Prompt Library consolidation ──────────────────────────────
  {
    id: "VAULT-1",
    page: "Prompt Library",
    path: "/vault",
    plan: "Any",
    component: "Tabs",
    what: "Prompts and Guidelines tabs",
    trigger: "Visit /vault",
    expected: "Two tabs at top: 'Prompts' (default active) and 'Guidelines'. Click 'Guidelines' to see guidelines list. Click back to 'Prompts' for prompt library.",
  },
  {
    id: "VAULT-2",
    page: "Prompt Library",
    path: "/vault",
    plan: "Any",
    component: "Sheet",
    what: "Browse Packs flyout",
    trigger: "Click 'Browse Packs' button in the page header",
    expected: "Right-side Sheet (flyout) opens showing built-in template packs and custom packs. Each pack shows install button. Sheet is scrollable. Close by clicking outside or X.",
  },
  {
    id: "VAULT-3",
    page: "Old routes redirect",
    path: "/templates, /guidelines",
    plan: "Any",
    component: "redirect",
    what: "Old routes redirect to /vault",
    trigger: "Navigate directly to /templates or /guidelines",
    expected: "Redirects to /vault (after auth if not logged in).",
  },

  // ── Audit page ────────────────────────────────────────────────
  {
    id: "AUDIT-1",
    page: "Audit",
    path: "/audit",
    plan: "Pro+ (admin/manager)",
    component: "AuditPage",
    what: "Full audit dashboard",
    trigger: "Navigate to /audit as admin",
    expected: "4 hero stat cards (Interactions, Violations Blocked, Compliance Score, Active Policies). Sankey flow diagram. Violation trend area chart with 30d/90d toggle. Heatmap. Donut chart. Bar histogram. Policy coverage grid. Top triggered rules. Daily usage chart. Top prompts. Export CSV button.",
  },
  {
    id: "AUDIT-2",
    page: "Audit",
    path: "/audit",
    plan: "Any (member role)",
    component: "Role gate",
    what: "Member role blocked",
    trigger: "Navigate to /audit as a member",
    expected: "Message: 'This page is only available to admins and managers.'",
  },

  // ── AI Tool Policy ────────────────────────────────────────────
  {
    id: "TOOL-1",
    page: "Guardrails → AI Tools",
    path: "/guardrails",
    plan: "Any (admin)",
    component: "ToolPolicy",
    what: "AI Tool Policy tab",
    trigger: "Go to Guardrails page, click 'AI Tools' tab",
    expected: "Shows AI Tool Restriction Policy toggle. Two enforcement info cards (Browser Extension + Cloudflare Gateway). When policy enabled: list of 18 AI tools with approve/block toggles.",
  },
  {
    id: "TOOL-2",
    page: "Guardrails → AI Tools",
    path: "/guardrails",
    plan: "Any (admin)",
    component: "ToolPolicy",
    what: "Toggle tool approval",
    trigger: "Enable the policy, then toggle a tool's switch off (block it)",
    expected: "Tool shows 'Blocked' badge. Toast confirms 'Policy saved'. If Cloudflare is connected, toast shows 'X blocked at DNS'.",
  },

  // ── Cloudflare Gateway ────────────────────────────────────────
  {
    id: "CF-1",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Any (admin)",
    component: "CloudflareCard",
    what: "Connect Cloudflare Gateway",
    trigger: "Click 'Connect Cloudflare' on the Cloudflare Gateway card. Enter Account ID and API Token.",
    expected: "On valid credentials: badge changes to green 'Connected'. Tool list appears. On invalid: error toast.",
  },
  {
    id: "CF-2",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Any (admin, connected)",
    component: "CloudflareCard",
    what: "Disconnect Cloudflare",
    trigger: "Click 'Disconnect' on the Cloudflare card. Confirm the dialog.",
    expected: "Badge reverts to 'Not Connected'. Note: existing Cloudflare Gateway rules are NOT auto-deleted.",
  },

  // ── Policy Export ──────────────────────────────────────────────
  {
    id: "EXPORT-1",
    page: "Guardrails → Policies",
    path: "/guardrails",
    plan: "Any (admin/manager)",
    component: "Export button",
    what: "Export DLP rules for external firewall",
    trigger: "With at least one active rule, click 'Export Rules' on the Policies tab",
    expected: "Downloads teamprompt-dlp-rules.json with all active rules, patterns, categories, and AI tool domain list.",
  },
  {
    id: "EXPORT-2",
    page: "API",
    path: "/api/guardrails/export",
    plan: "Any (admin/manager)",
    component: "Export API",
    what: "Export in different formats",
    trigger: "Call GET /api/guardrails/export?format=csv (also try regex-list, suricata, and an invalid format like xml)",
    expected: "CSV/regex-list/suricata: correct format downloaded. Invalid format: 400 error 'Invalid format'.",
  },

  // ── Enterprise DLP (Content Scanning) ────────────────────────
  {
    id: "CF-DLP-1",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Pro+ (custom_security)",
    component: "CloudflareCard DLP section",
    what: "Enterprise DLP section visible when connected",
    trigger: "Connect Cloudflare Gateway on a custom_security-eligible plan. Look for 'Content Scanning (DLP)' section inside the Cloudflare card.",
    expected: "Shows 'Content Scanning (DLP)' with 'Not configured' badge and 'Enable DLP Scanning' button. Not visible on Free plan.",
  },
  {
    id: "CF-DLP-2",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Pro+ (custom_security)",
    component: "CloudflareCard DLP section",
    what: "DLP sync with severity-aware rules (block/warn/redact)",
    trigger: "Have active rules with block, warn, and redact severities. Click 'Enable DLP Scanning'.",
    expected: "Toast: 'X block rules → Cloudflare block policy; Y warn rules → Cloudflare audit policy'. Info toast: 'Z redact rules skipped — handled by browser extension'. Badge → 'Active'.",
  },
  {
    id: "CF-DLP-3",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Pro+ (custom_security)",
    component: "CloudflareCard DLP section",
    what: "DLP re-sync and remove",
    trigger: "With DLP active, click 'Re-sync Rules'. Then click 'Remove' and confirm.",
    expected: "Re-sync: updates Cloudflare profiles with latest rules. Remove: deletes both DLP profiles + HTTP policies. Badge → 'Not configured'. Warnings shown if partial cleanup fails.",
  },
  {
    id: "CF-DLP-4",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Pro+ (custom_security)",
    component: "CloudflareCard DLP section",
    what: "DLP sync with only redact rules fails gracefully",
    trigger: "Set all active security rules to severity 'Redact'. Click 'Enable DLP Scanning'.",
    expected: "Error toast: 'No rules eligible for Cloudflare sync.' Explains that redact rules are client-side only.",
  },
  // ── Error Handling ──────────────────────────────────────────
  {
    id: "CF-ERR-1",
    page: "Guardrails",
    path: "/guardrails",
    plan: "Any (admin)",
    component: "Tool Policy",
    what: "Cloudflare out-of-sync warning on tool policy save",
    trigger: "Connect Cloudflare, then revoke the API token in Cloudflare dashboard. Save a tool policy change.",
    expected: "Policy saves locally with success toast. Additional warning toast: 'Cloudflare out of sync: credentials may be expired'.",
  },
  {
    id: "CF-ERR-2",
    page: "Guardrails",
    path: "/guardrails",
    plan: "Any (admin)",
    component: "Export button",
    what: "Export error toast on failure",
    trigger: "Simulate a network error (DevTools throttle) and click 'Export Rules'.",
    expected: "Error toast: 'Failed to export rules' instead of silent failure.",
  },
  {
    id: "CF-ERR-3",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Any (admin)",
    component: "CloudflareCard",
    what: "Disconnect checks server response before clearing UI",
    trigger: "Click 'Disconnect'. If server fails, UI should NOT clear state.",
    expected: "On success: badge reverts, wizard resets, blocked badges clear. On failure: error toast, UI stays in 'Connected' state.",
  },
  // ── Cloudflare Wizard Flow ────────────────────────────────────
  {
    id: "CF-WIZARD-1",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Any (admin)",
    component: "Cloudflare wizard",
    what: "4-step wizard flow",
    trigger: "Click 'Connect Cloudflare'. Walk through all 4 steps: Get Token → Connect → Choose Tools → Deploy WARP.",
    expected: "Step 1: instructions + links. Step 2: credential fields. Step 3: inline tool toggles (no page navigation). Step 4: WARP deployment with admin prerequisites (DNS only mode, enrollment policy). Finish Setup closes wizard.",
  },
  {
    id: "CF-WIZARD-2",
    page: "Settings → Integrations",
    path: "/settings/integrations",
    plan: "Any (admin)",
    component: "Cloudflare wizard step 3",
    what: "Tool selection stays in wizard",
    trigger: "After connecting in step 2, block a tool in step 3, click Save & Continue",
    expected: "Wizard advances to step 4 (WARP deploy), NOT to the connected card view. Progress bar shows step 4 active.",
  },

  // ── Managed Browser Deployment ──────────────────────────────
  {
    id: "DEPLOY-1",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "DeploymentTab",
    what: "Page loads with tool policy status",
    trigger: "Navigate to Settings → Deployment as an admin",
    expected: "Page shows: header explaining managed browser deployment, policy status card (green if tool policy active, amber if not), MDM platform selector (4 options), enforcement level selector (3 options), config preview, deployment guide, verification checklist, FAQ.",
  },
  {
    id: "DEPLOY-2",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "DeploymentTab",
    what: "Non-admin sees access denied",
    trigger: "Navigate to Settings → Deployment as a non-admin (member/manager). Note: tab may be hidden from nav.",
    expected: "Shield icon with 'Only admins can manage browser deployment policies.' message.",
  },
  {
    id: "DEPLOY-3",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Platform selector",
    what: "Switch between MDM platforms",
    trigger: "Click each platform card: Google Admin, Intune, JAMF, GPO",
    expected: "Selected card highlights with primary border/bg + checkmark. Config preview, deployment guide, and download button label update for each platform. GPO shows .reg format, others show JSON.",
  },
  {
    id: "DEPLOY-4",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Enforcement selector",
    what: "Switch between enforcement levels",
    trigger: "Click each level: Monitor, Restrict, Lockdown",
    expected: "Monitor: config only has force-install + pin. Restrict: adds URLBlocklist/URLAllowlist entries (if tool policy active). Lockdown: adds incognito disable, dev tools disable, block all other extensions, guest mode disable. Summary checklist updates dynamically.",
  },
  {
    id: "DEPLOY-5",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Config preview",
    what: "Copy and Download work correctly",
    trigger: "Click 'Copy' — paste into text editor. Click 'Download' — open the downloaded file.",
    expected: "Copy: clipboard contains the config text. Download: correct file with correct extension (.json for Google Admin/Intune/JAMF, .reg for GPO). Both match what's shown in the preview.",
  },
  {
    id: "DEPLOY-6",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Edge toggle",
    what: "Edge toggle filters config entries",
    trigger: "Select Intune or GPO platform. Toggle 'Include Microsoft Edge policies' off.",
    expected: "Config entries with '(Edge)' in the name disappear. Toggle on: they reappear. Toggle not visible for Google Admin or JAMF (Chrome only).",
  },
  {
    id: "DEPLOY-7",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Config preview",
    what: "Config with no tool policy shows warning",
    trigger: "Disable tool policy in Guardrails → AI Tools, then visit Deployment page and select 'Restrict' or 'Lockdown'.",
    expected: "Amber policy status card: 'No Tool Policy Set'. In the config summary: amber warning 'No URL rules — enable tool policy first'. Config still generates force-install entries but no URLBlocklist.",
  },
  {
    id: "DEPLOY-8",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Deployment guide",
    what: "Step-by-step guide expands per platform",
    trigger: "Click the deployment guide accordion. Switch platforms and re-expand.",
    expected: "Guide shows numbered steps specific to the selected MDM. Includes external links (open in new tab), monospace detail callouts for extension IDs and commands. Step count badge matches actual steps.",
  },
  {
    id: "DEPLOY-9",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Verification checklist",
    what: "Verification adapts to platform and level",
    trigger: "Select Intune + Lockdown, then check the verification section.",
    expected: "Mentions both chrome:// and edge:// URLs. Includes steps to test incognito disabled and dev tools disabled (only in Lockdown). Restrict level: includes blocked domain test but no incognito/devtools. Monitor: only force-install check.",
  },
  {
    id: "DEPLOY-10",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "FAQ section",
    what: "FAQ answers expand on click",
    trigger: "Click each FAQ question.",
    expected: "5 questions: BYOD, Firefox/Safari, re-generate frequency, VPN bypass, vs Cloudflare. Each expands with a detailed answer. Cloudflare FAQ mentions Settings → Integrations.",
  },
  {
    id: "DEPLOY-11",
    page: "API",
    path: "/api/deployment/compliance",
    plan: "Any (authenticated)",
    component: "Compliance API",
    what: "GET returns org deployment policy",
    trigger: "Call GET /api/deployment/compliance with a valid Bearer token.",
    expected: "Returns JSON with: policyEnabled, deploymentLevel, approvedTools, blockedDomains, allowedDomains, extensionId. Domains match your current tool policy.",
  },
  {
    id: "DEPLOY-12",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "GPO config",
    what: "GPO .reg file is valid Windows Registry format",
    trigger: "Select Windows GPO, download the .reg file, open in Notepad.",
    expected: "Starts with 'Windows Registry Editor Version 5.00'. Registry paths are correctly formatted (HKLM\\SOFTWARE\\...). REG_DWORD values are in hex (dword:00000001). REG_SZ values are quoted strings. File can be imported via right-click → Merge on Windows.",
  },
  {
    id: "DEPLOY-13",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Config preview",
    what: "Copy fails gracefully on HTTP or unsupported browsers",
    trigger: "Open the deployment page on an HTTP URL (not HTTPS) or block clipboard permissions in browser settings. Click 'Copy'.",
    expected: "Error toast: 'Clipboard not available. Use Download instead.' or 'Failed to copy. Use Download instead.' Download button still works as fallback.",
  },
  {
    id: "DEPLOY-14",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "GPO config",
    what: "GPO generates both blocklist AND allowlist for Chrome + Edge",
    trigger: "Enable tool policy with some tools blocked. Select GPO + Restrict or Lockdown. Download the .reg file.",
    expected: "File contains 4 URL list sections: Chrome\\URLBlocklist, Edge\\URLBlocklist, Chrome\\URLAllowlist, Edge\\URLAllowlist. Allowlist includes teamprompt.app + approved tool domains.",
  },
  {
    id: "DEPLOY-15",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Edge toggle + GPO",
    what: "Edge toggle removes all Edge entries from .reg file",
    trigger: "Select GPO platform. Toggle Edge OFF. Download .reg file.",
    expected: "No Microsoft\\Edge paths in the file. Only Google\\Chrome paths remain. Toggle Edge ON: Microsoft\\Edge paths reappear for ExtensionInstallForcelist, URLBlocklist, URLAllowlist, and lockdown policies.",
  },
  {
    id: "DEPLOY-16",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "DeploymentTab",
    what: "Error state shows retry button",
    trigger: "Simulate API failure (e.g., revoke session, throttle network in DevTools) and reload the deployment page.",
    expected: "Shows error card with amber warning icon, error message, and 'Retry' button. Clicking retry re-fetches the tool policy.",
  },
  {
    id: "DEPLOY-17",
    page: "Settings → Deployment",
    path: "/settings/deployment",
    plan: "Any (admin)",
    component: "Platform selector",
    what: "JAMF description is accurate",
    trigger: "Look at the JAMF platform card description.",
    expected: "Says 'Chrome on macOS (managed profiles)' — NOT 'Chrome & Edge'. JAMF config only generates Chrome policies.",
  },
];

// ─── Helper to render boolean cell ──────────────────────────────

function BoolCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium tabular-nums">{value}</span>;
  }
  return value ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-muted-foreground/40" />
  );
}

// ─── Page component ─────────────────────────────────────────────

export default function TestingGuidePage() {
  const { user, isSuperAdmin } = useAuth();
  const { prompts, members, guidelines } = useOrg();
  const { subscription, planLimits } = useSubscription();

  const currentPlan = planLimits.plan || "free";

  return (
    <>
      <PageHeader
        title="Upgrade UX Testing Guide"
        description="Step-by-step manual QA for all paygate components"
      />

      {/* Your current session info */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Your Current Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <Badge className="capitalize">{currentPlan}</Badge>
              {isSuperAdmin && (
                <Badge variant="destructive" className="ml-1">Super Admin</Badge>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subscription Status</p>
              <p className="text-sm font-medium">{subscription?.status || "none"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Counts</p>
              <p className="text-sm font-medium">
                {prompts.length} prompts, {members.length} members, {guidelines.length} guidelines
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Prompt Limit</p>
              <p className="text-sm font-medium">
                {prompts.length} / {planLimits.max_prompts === -1 ? "\u221e" : planLimits.max_prompts}
                {planLimits.max_prompts !== -1 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({Math.round((prompts.length / planLimits.max_prompts) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Limit</p>
              <p className="text-sm font-medium">
                {members.length} / {planLimits.max_members === -1 ? "\u221e" : planLimits.max_members}
                {planLimits.max_members !== -1 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({Math.round((members.length / planLimits.max_members) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Guideline Limit</p>
              <p className="text-sm font-medium">
                {guidelines.length} / {planLimits.max_guidelines === -1 ? "\u221e" : planLimits.max_guidelines}
                {planLimits.max_guidelines !== -1 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({Math.round((guidelines.length / planLimits.max_guidelines) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Plan Feature Matrix */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Zap className="h-5 w-5" />
        Plan Feature Matrix
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        This is the source of truth. Every paygate in the app should align with this table.
      </p>
      <Card className="mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead className="text-center">
                  Free
                  {currentPlan === "free" && <Badge variant="outline" className="ml-1 text-[10px]">You</Badge>}
                </TableHead>
                <TableHead className="text-center">
                  Pro ($9/mo)
                  {currentPlan === "pro" && <Badge variant="outline" className="ml-1 text-[10px]">You</Badge>}
                </TableHead>
                <TableHead className="text-center">
                  Team ($7/user/mo)
                  {currentPlan === "team" && <Badge variant="outline" className="ml-1 text-[10px]">You</Badge>}
                </TableHead>
                <TableHead className="text-center">
                  Business ($12/user/mo)
                  {currentPlan === "business" && <Badge variant="outline" className="ml-1 text-[10px]">You</Badge>}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURE_ROWS.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium text-sm">{row.label}</TableCell>
                  <TableCell className="text-center"><BoolCell value={row.free} /></TableCell>
                  <TableCell className="text-center"><BoolCell value={row.pro} /></TableCell>
                  <TableCell className="text-center"><BoolCell value={row.team} /></TableCell>
                  <TableCell className="text-center"><BoolCell value={row.business} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Section 2: Component Reference */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Upgrade Component Reference
      </h2>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">UpgradeGate</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Full-page or section-level block for <strong>boolean features</strong> (analytics, import_export, custom_security, audit_log).</p>
            <p>Shows: gradient icon, heading, description, 3 benefit bullets, upgrade button + plan badge.</p>
            <p>Used on: Analytics, Import/Export, Activity, Guardrails (Violations + Policies tabs).</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">UpgradePrompt</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Inline banner for <strong>count-based limits at capacity</strong> (prompts, members, guidelines).</p>
            <p>Shows: icon circle, &quot;X of Y used&quot; text, upgrade CTA, Upgrade button.</p>
            <p>Used on: Vault, Team, Guidelines. Returns null if max=-1 (unlimited).</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">LimitNudge</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Subtle <strong>approaching-limit warning</strong> at 80%+ usage. Dismissible.</p>
            <p>Shows: icon, bold count text, &quot;View plans&quot; link, dismiss X.</p>
            <p>Threshold: max&le;5 ? max-1 : ceil(max*0.8). Hidden at limit (UpgradePrompt takes over).</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Threshold Reference */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        LimitNudge Threshold Reference
      </h2>
      <Card className="mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Limit</TableHead>
                <TableHead>Max (Free)</TableHead>
                <TableHead>Nudge Appears At</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>UpgradePrompt At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-sm flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Prompts</TableCell>
                <TableCell>25</TableCell>
                <TableCell>20 &ndash; 24</TableCell>
                <TableCell className="text-xs text-muted-foreground">ceil(25 * 0.8) = 20</TableCell>
                <TableCell>25 (at limit)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-sm flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Members</TableCell>
                <TableCell>3</TableCell>
                <TableCell>2 only</TableCell>
                <TableCell className="text-xs text-muted-foreground">max&le;5 \u2192 max-1 = 2</TableCell>
                <TableCell>3 (at limit)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-sm flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Guidelines</TableCell>
                <TableCell>5</TableCell>
                <TableCell>4 only</TableCell>
                <TableCell className="text-xs text-muted-foreground">max&le;5 \u2192 max-1 = 4</TableCell>
                <TableCell>5 (at limit)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-sm flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Guidelines (Pro)</TableCell>
                <TableCell>14</TableCell>
                <TableCell>12 &ndash; 13</TableCell>
                <TableCell className="text-xs text-muted-foreground">ceil(14 * 0.8) = 12</TableCell>
                <TableCell>14 (at limit)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-sm flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Members (Team)</TableCell>
                <TableCell>50</TableCell>
                <TableCell>40 &ndash; 49</TableCell>
                <TableCell className="text-xs text-muted-foreground">ceil(50 * 0.8) = 40</TableCell>
                <TableCell>50 (at limit)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Section 4: Full Test Cases */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5" />
        Test Cases ({TEST_STEPS.length})
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Work through each row. Click the page link to navigate directly.
      </p>

      {/* Group by category */}
      {[
        { title: "Full-Page Feature Gates (UpgradeGate)", prefix: "FG", icon: <Shield className="h-4 w-4" /> },
        { title: "At-Limit Banners (UpgradePrompt)", prefix: "LP", icon: <Minus className="h-4 w-4" /> },
        { title: "Approaching-Limit Nudges (LimitNudge)", prefix: "LN", icon: <AlertTriangle className="h-4 w-4" /> },
        { title: "Billing Flow", prefix: "BF", icon: <ArrowRight className="h-4 w-4" /> },
        { title: "Super Admin Bypass", prefix: "SA", icon: <Shield className="h-4 w-4" /> },
        { title: "Paid Plan Users", prefix: "PP", icon: <CheckCircle2 className="h-4 w-4" /> },
        { title: "Edge Cases", prefix: "EC", icon: <AlertTriangle className="h-4 w-4" /> },
        { title: "Guardrails — Tool Policy", prefix: "TOOL", icon: <ShieldAlert className="h-4 w-4" /> },
        { title: "Guardrails — Policy Export", prefix: "EXPORT", icon: <Download className="h-4 w-4" /> },
        { title: "Cloudflare Gateway — Connection & DNS Blocking", prefix: "CF-W", icon: <Cloud className="h-4 w-4" /> },
        { title: "Cloudflare Gateway — Basic", prefix: "CF-", exact: ["CF-1", "CF-2"], icon: <Cloud className="h-4 w-4" /> },
        { title: "Cloudflare — Enterprise DLP (Network Content Scanning)", prefix: "CF-DLP", icon: <Shield className="h-4 w-4" /> },
        { title: "Cloudflare — Error Handling & Fallbacks", prefix: "CF-ERR", icon: <AlertTriangle className="h-4 w-4" /> },
        { title: "Managed Browser Deployment (MDM)", prefix: "DEPLOY", icon: <Monitor className="h-4 w-4" /> },
      ].map((group) => {
        const g = group as { title: string; prefix: string; icon: React.ReactNode; exact?: string[] };
        const steps = g.exact
          ? TEST_STEPS.filter((s) => g.exact!.includes(s.id))
          : TEST_STEPS.filter((s) => s.id.startsWith(g.prefix));
        if (steps.length === 0) return null;
        return (
          <div key={group.prefix} className="mb-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              {group.icon}
              {group.title}
            </h3>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead className="w-[140px]">Page</TableHead>
                      <TableHead className="w-[100px]">Plan</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead className="min-w-[300px]">Expected Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {steps.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">{step.id}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={step.path.startsWith("(") ? "#" : step.path}
                            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {step.page}
                            {!step.path.startsWith("(") && <ArrowRight className="h-3 w-3" />}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{step.plan}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{step.trigger}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{step.expected}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        );
      })}

      {/* Section 5: Cloudflare Testing Setup Guide */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Wrench className="h-5 w-5" />
        Cloudflare Integration Testing Guide
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Three levels of testing, from easiest to most thorough. Start at Level 1 and work up.
      </p>

      {/* Level 1: UI only */}
      <Card className="mb-4 border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Level 1</Badge>
            UI-Only Testing (no Cloudflare account needed)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p className="text-muted-foreground">
            Tests wizard flow, error states, DLP section visibility, toasts, and feature gates without touching Cloudflare.
          </p>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="font-medium text-xs">Steps:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Go to <Link href="/settings/integrations" className="text-primary hover:underline">Settings → Integrations</Link></li>
              <li>Click &ldquo;Connect Cloudflare&rdquo; → walk through wizard steps (enter garbage credentials to test error toasts)</li>
              <li>Verify the DLP section appears only on Pro+ plans (switch to Free plan to confirm it&apos;s hidden)</li>
              <li>Go to <Link href="/guardrails" className="text-primary hover:underline">Guardrails</Link> → test export button with no rules (should be hidden) and with rules (should download)</li>
              <li>On the Tool Policy tab, toggle tools with Cloudflare disconnected → verify &ldquo;Policy saved&rdquo; toast (no Cloudflare mention)</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Level 2: DNS blocking */}
      <Card className="mb-4 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="bg-blue-500/10 text-blue-600 border-0">Level 2</Badge>
            DNS Blocking (free Cloudflare account, ~10 min setup)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p className="text-muted-foreground">
            Tests real DNS-level blocking of AI tool domains. This is the most common use case.
          </p>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="font-medium text-xs">Setup:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Sign up at <span className="text-primary">dash.cloudflare.com</span> (free tier works)</li>
              <li>Navigate to <strong>Zero Trust</strong> in the left sidebar</li>
              <li>Go to <strong>Profile → API Tokens → Create Custom Token</strong></li>
              <li>Permissions: select <strong>Account → Zero Trust → Edit</strong></li>
              <li>Copy the token and your <strong>Account ID</strong> (visible on the Zero Trust overview page)</li>
              <li>In TeamPrompt: <Link href="/settings/integrations" className="text-primary hover:underline">Settings → Integrations</Link> → Connect Cloudflare → enter credentials</li>
              <li>Block a tool in the wizard (e.g. Poe, Character.AI)</li>
            </ol>
            <p className="font-medium text-xs mt-3">Testing DNS blocking:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Download + install <strong>Cloudflare WARP</strong> on your device (<span className="text-primary">one.one.one.one</span>)</li>
              <li>Open WARP → Settings → Account → Login with organization → enter your Zero Trust team name</li>
              <li>Visit the blocked domain (e.g. poe.com) → should show a Cloudflare block page</li>
              <li>Unblock the tool in TeamPrompt → refresh → domain should load again</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Level 3: DLP content scanning */}
      <Card className="mb-4 border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="bg-amber-500/10 text-amber-600 border-0">Level 3</Badge>
            DLP Content Scanning (requires proxy mode + TLS decryption)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p className="text-muted-foreground">
            Tests HTTP-level content inspection. This is the enterprise feature. Use a test machine or VM — TLS decryption can break some apps.
          </p>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="font-medium text-xs">Cloudflare Setup:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>In Cloudflare Zero Trust: <strong>Settings → Network → Proxy</strong> → toggle ON</li>
              <li><strong>Settings → Network → TLS Decryption</strong> → toggle ON</li>
              <li>Download Cloudflare root CA certificate from <strong>Settings → Network → Certificates → Download</strong></li>
              <li>Install the root CA on your test machine:
                <ul className="ml-4 mt-1 list-disc">
                  <li><strong>Windows:</strong> double-click .crt → Install Certificate → Local Machine → Trusted Root</li>
                  <li><strong>macOS:</strong> double-click .pem → add to Keychain → mark &ldquo;Always Trust&rdquo;</li>
                  <li><strong>Linux:</strong> copy to /usr/local/share/ca-certificates/ → run sudo update-ca-certificates</li>
                </ul>
              </li>
              <li>Ensure WARP is connected and enrolled in your Zero Trust org</li>
            </ol>
            <p className="font-medium text-xs mt-3">TeamPrompt Setup:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Create security rules in <Link href="/guardrails" className="text-primary hover:underline">Guardrails</Link> with different severities:
                <ul className="ml-4 mt-1 list-disc">
                  <li><strong>Block severity:</strong> e.g. &ldquo;SSN Pattern&rdquo; with regex <code className="bg-muted px-1 rounded">\d&#123;3&#125;-\d&#123;2&#125;-\d&#123;4&#125;</code></li>
                  <li><strong>Warn severity:</strong> e.g. &ldquo;Email Address&rdquo; with regex <code className="bg-muted px-1 rounded">[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+</code></li>
                  <li><strong>Redact severity:</strong> e.g. &ldquo;Credit Card&rdquo; — this should NOT sync to Cloudflare</li>
                </ul>
              </li>
              <li>Go to <Link href="/settings/integrations" className="text-primary hover:underline">Settings → Integrations</Link> → Cloudflare card → click &ldquo;Enable Network DLP&rdquo;</li>
              <li>Verify toast shows: &ldquo;X block rules → Cloudflare block policy; Y warn rules → Cloudflare audit policy&rdquo;</li>
              <li>Verify redact rules show info toast about being skipped</li>
            </ol>
            <p className="font-medium text-xs mt-3">Testing DLP enforcement:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Open an approved AI tool (e.g. ChatGPT) in your browser (with WARP connected)</li>
              <li>Paste a fake SSN like <code className="bg-muted px-1 rounded">123-45-6789</code> into the prompt</li>
              <li>The request should be blocked by Cloudflare with a block page explaining the DLP policy violation</li>
              <li>Try an email address → should NOT be blocked (warn rules create audit-only policies)</li>
              <li>Check Cloudflare Zero Trust → <strong>Logs → Gateway → HTTP</strong> to see audit entries for warn-level matches</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* API Verification */}
      <Card className="mb-8 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="bg-purple-500/10 text-purple-600 border-0">API Check</Badge>
            Verify Cloudflare API State (no device setup needed)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p className="text-muted-foreground">
            After connecting and syncing, verify TeamPrompt actually wrote data to Cloudflare by checking the API directly.
            Replace <code className="bg-muted px-1 rounded">YOUR_TOKEN</code> and <code className="bg-muted px-1 rounded">YOUR_ACCOUNT_ID</code> with your Cloudflare credentials.
          </p>
          <div className="rounded-lg bg-muted/50 p-3 space-y-3">
            <div>
              <p className="font-medium text-xs mb-1">Check DNS block rules:</p>
              <pre className="text-[11px] bg-background rounded-md p-2 overflow-x-auto border border-border">
{`curl -s -H "Authorization: Bearer YOUR_TOKEN" \\
  "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/gateway/rules" \\
  | jq '.result[] | select(.name | startswith("TeamPrompt")) | {name, enabled, action}'`}
              </pre>
              <p className="text-[10px] text-muted-foreground mt-1">
                Should show &ldquo;TeamPrompt: Block Poe&rdquo; etc. for each blocked tool, plus &ldquo;TeamPrompt: DLP Content Scan&rdquo; and/or &ldquo;TeamPrompt: DLP Warn Audit&rdquo; if DLP is synced.
              </p>
            </div>
            <div>
              <p className="font-medium text-xs mb-1">Check DLP profiles:</p>
              <pre className="text-[11px] bg-background rounded-md p-2 overflow-x-auto border border-border">
{`curl -s -H "Authorization: Bearer YOUR_TOKEN" \\
  "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/dlp/profiles" \\
  | jq '.result[] | select(.name | startswith("TeamPrompt")) | {name, id, entries: (.entries | length)}'`}
              </pre>
              <p className="text-[10px] text-muted-foreground mt-1">
                Should show &ldquo;TeamPrompt DLP&rdquo; (block rules) and optionally &ldquo;TeamPrompt DLP (Warn)&rdquo; with entry counts matching your synced rule count.
              </p>
            </div>
            <div>
              <p className="font-medium text-xs mb-1">Check specific DLP profile entries:</p>
              <pre className="text-[11px] bg-background rounded-md p-2 overflow-x-auto border border-border">
{`curl -s -H "Authorization: Bearer YOUR_TOKEN" \\
  "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/dlp/profiles" \\
  | jq '.result[] | select(.name == "TeamPrompt DLP") | .entries[] | {name, enabled, pattern: .pattern.regex}'`}
              </pre>
              <p className="text-[10px] text-muted-foreground mt-1">
                Shows each individual DLP entry with its regex pattern. Verify patterns match your security rules.
              </p>
            </div>
            <div>
              <p className="font-medium text-xs mb-1">Quick cleanup (delete all TeamPrompt rules from Cloudflare):</p>
              <pre className="text-[11px] bg-background rounded-md p-2 overflow-x-auto border border-border">
{`# Just use the "Remove" button in the DLP section + "Disconnect" in the Cloudflare card.
# Or to clean up manually via API:
curl -s -H "Authorization: Bearer YOUR_TOKEN" \\
  "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/gateway/rules" \\
  | jq -r '.result[] | select(.name | startswith("TeamPrompt")) | .id' \\
  | while read id; do
      curl -s -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \\
        "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/gateway/rules/$id"
    done`}
              </pre>
            </div>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 mt-2">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Severity mapping reference:</strong>{" "}
              <span className="text-red-500 font-medium">Block</span> → Cloudflare <code className="bg-muted px-1 rounded text-[10px]">action: &ldquo;block&rdquo;</code> (request denied){" · "}
              <span className="text-amber-500 font-medium">Warn</span> → Cloudflare <code className="bg-muted px-1 rounded text-[10px]">action: &ldquo;audit&rdquo;</code> (logged only){" · "}
              <span className="text-blue-500 font-medium">Redact</span> → Not synced (handled client-side by extension before data reaches the network)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Config source of truth */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Paygate Config Source Files
      </h2>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <code className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs">src/lib/constants.ts</code>
              <span className="text-muted-foreground">PLAN_LIMITS \u2014 canonical plan limits (max_prompts, max_members, etc.)</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs">src/components/upgrade/config.ts</code>
              <span className="text-muted-foreground">LIMIT_CONFIG + FEATURE_CONFIG \u2014 icons, copy, unlock plans for each gate</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs">src/components/providers/subscription-provider.tsx</code>
              <span className="text-muted-foreground">canAccess() + checkLimit() \u2014 runtime access checks with super admin bypass</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs">src/components/upgrade/</code>
              <span className="text-muted-foreground">UpgradeGate, UpgradePrompt, LimitNudge \u2014 shared UI components</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick nav note */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Tip:</strong> To test Free plan limits, use the admin impersonation feature or create a test account. As super admin, all gates are bypassed \u2014 you won&apos;t see any upgrade components. Use <Link href="/admin" className="text-primary hover:underline">the admin panel</Link> to impersonate a Free user for testing.
      </div>
    </>
  );
}
