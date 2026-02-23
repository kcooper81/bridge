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
  { label: "Members",           type: "number",  free: "3",         pro: "1 (solo)",   team: "50",         business: "500" },
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
    page: "Analytics",
    path: "/analytics",
    plan: "Free",
    component: "UpgradeGate",
    what: "Full-page feature gate",
    trigger: "Navigate to /analytics as a Free user",
    expected: "Centered card with BarChart3 icon, \"Analytics\" heading, 3 benefit bullets, \"Upgrade to Pro\" button linking to /settings/billing, and \"Pro plan\" badge.",
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
    page: "Guidelines",
    path: "/guidelines",
    plan: "Free at 5/5",
    component: "UpgradePrompt",
    what: "At-limit inline banner",
    trigger: "As a Free user with 5 guidelines, visit /guidelines",
    expected: "Below the page header: banner with BookOpen icon showing \"You've used 5 of 5 guidelines\", subtitle \"Upgrade to Pro for up to 14 guidelines\", and \"Upgrade\" button. Clicking \"New Guideline\" does nothing (no toast).",
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
      ].map((group) => {
        const steps = TEST_STEPS.filter((s) => s.id.startsWith(group.prefix));
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

      {/* Section 5: Config source of truth */}
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
