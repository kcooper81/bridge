import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Eye,
  FileCheck,
  Globe,
  Heart,
  Import,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  StickyNote,
  Users,
  Zap,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/marketing/section-label";
import { FeatureCard } from "@/components/marketing/feature-card";

import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";

export const metadata: Metadata = generatePageMetadata({
  title: "Features — AI DLP, Prompt Library, Compliance & Extensions",
  description:
    "AI data loss prevention, shared prompt library, 19 compliance packs, real-time scanning, audit logging, browser extension, and team analytics.",
  path: "/features",
  keywords: ["AI DLP", "AI data loss prevention", "sensitive data detection", "compliance packs", "HIPAA AI", "SOC 2 AI", "prompt library", "browser extension", "AI governance", "audit logging"],
});

/* ── CSS-only app preview mockups ────────────────────────── */

function MockBrowser({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
        <div className="ml-3 flex-1 h-5 rounded-md bg-background border border-border" />
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Shared small stat card used across mockups ── */
function StatCard({ icon: Icon, value, label, iconColor = "bg-primary/10 text-primary" }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  iconColor?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-2 flex items-center gap-2">
      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", iconColor)}>
        <Icon className="w-3 h-3" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground leading-none">{value}</p>
        <p className="text-[8px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Primary Feature Mockups ────────────────────────────── */

function DLPMockup() {
  return (
    <MockBrowser>
      <div className="space-y-2.5">
        {/* Original with red highlights */}
        <div className="rounded-lg border border-red-500/20 p-3 bg-red-500/[0.03]">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldX className="w-3 h-3 text-red-500" />
            <p className="text-[10px] text-red-600 font-semibold">Original — 3 violations detected</p>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">
            Patient <span className="bg-red-500/15 text-red-600 px-1 rounded font-medium">John Smith</span>, SSN{" "}
            <span className="bg-red-500/15 text-red-600 px-1 rounded font-medium">123-45-6789</span>, was admitted to{" "}
            <span className="bg-red-500/15 text-red-600 px-1 rounded font-medium">St. Mary&apos;s Hospital</span> on Jan 15.
          </p>
        </div>
        {/* Arrow with sparkle */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>
        {/* Sanitized with blue highlights */}
        <div className="rounded-lg border border-emerald-500/20 p-3 bg-emerald-500/[0.03]">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <p className="text-[10px] text-emerald-600 font-semibold">Redacted — safe to send</p>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">
            Patient <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"[PII]"}</span>, SSN{" "}
            <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"[SSN]"}</span>, was admitted to{" "}
            <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"[FACILITY]"}</span> on Jan 15.
          </p>
        </div>
        {/* Severity levels */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[8px] font-bold bg-red-500 text-white px-2 py-0.5 rounded">Block</span>
          <span className="text-[8px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded">Warn</span>
          <span className="text-[8px] font-bold bg-primary text-white px-2 py-0.5 rounded">Redact</span>
          <span className="text-[8px] text-muted-foreground ml-1">Per-rule severity</span>
        </div>
      </div>
    </MockBrowser>
  );
}

function VaultMockup() {
  const prompts = [
    { name: "Customer Onboarding Email", desc: "marketing, email, outreach", uses: 142, rating: 4.8, fav: true, template: false },
    { name: "Code Review Feedback", desc: "Review the following code and provide constructive fe...", uses: 89, rating: 4.0, fav: false, template: true, tags: ["development", "code-review"] },
    { name: "Weekly Status Update", desc: "Summarize my progress this week in a clear, professio...", uses: 67, rating: 0, fav: true, template: true, tags: ["productivity", "template"] },
    { name: "Sales Outreach Drafter", desc: "sales, outreach", uses: 34, rating: 3.0, fav: false, template: false },
  ];
  return (
    <MockBrowser>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <StatCard icon={StickyNote} value="8" label="Total Prompts" />
        <StatCard icon={BarChart3} value="2" label="Total Uses" />
        <StatCard icon={Share2} value="7" label="Shared" />
        <StatCard icon={BookOpen} value="1" label="Active Guidelines" />
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-3 mb-3 border-b border-border pb-2">
        {["All", "Draft", "Pending", "Approved", "Archived"].map((t, i) => (
          <span key={t} className={cn("text-[10px] font-medium", i === 0 ? "text-primary border-b border-primary pb-1.5" : "text-muted-foreground")}>{t}</span>
        ))}
      </div>
      {/* Search + filters */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-6 rounded-md border border-border bg-background px-2 flex items-center gap-1.5">
          <Search className="h-2.5 w-2.5 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Search prompts...</span>
        </div>
        <span className="text-[9px] text-muted-foreground">All Categories</span>
        <span className="text-[9px] text-muted-foreground">All Teams</span>
      </div>
      {/* Table header */}
      <div className="flex items-center gap-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
        <span className="w-5" />
        <span className="flex-1">Prompt</span>
        <span className="w-12 text-center">Uses</span>
        <span className="w-16 text-center">Rating</span>
        <span className="w-16 text-right">Updated</span>
        <span className="w-4" />
      </div>
      {/* Rows */}
      {prompts.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
          <Heart className={cn("w-3 h-3 shrink-0", p.fav ? "text-red-500 fill-red-500" : "text-muted-foreground/30")} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-medium text-foreground truncate">{p.name}</p>
              {p.template && (
                <span className="text-[7px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{"{}"} Template</span>
              )}
            </div>
            <p className="text-[8px] text-muted-foreground truncate mt-0.5">{p.desc}</p>
          </div>
          <span className="w-12 text-center text-[10px] text-muted-foreground tabular-nums">{p.uses}</span>
          <div className="w-16 flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("w-2 h-2", s <= Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
            ))}
          </div>
          <span className="w-16 text-right text-[9px] text-muted-foreground">2 days ago</span>
          <MoreHorizontal className="w-3 h-3 text-muted-foreground/40 shrink-0" />
        </div>
      ))}
    </MockBrowser>
  );
}

function ExtensionMockup() {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden shadow-sm max-w-[280px] mx-auto">
      {/* Extension header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-icon-blue.svg" alt="" className="w-4 h-4 rounded" />
          <span className="text-[11px] font-semibold text-white">TeamPrompt</span>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-3 h-3 text-zinc-500" />
          <Share2 className="w-3 h-3 text-zinc-500" />
        </div>
      </div>
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-7 rounded-lg bg-zinc-800 px-2.5 flex items-center gap-1.5">
            <Search className="w-2.5 h-2.5 text-zinc-500" />
            <span className="text-[10px] text-zinc-500">Search prompts...</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm">+</div>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-3 px-3 pb-2">
        {[{ name: "Faves", active: true }, { name: "Recent" }, { name: "Prompts" }, { name: "Security" }].map((t) => (
          <span key={t.name} className={cn("text-[10px] font-medium", t.active ? "text-primary" : "text-zinc-500")}>{t.name}</span>
        ))}
      </div>
      {/* Filter row */}
      <div className="flex items-center gap-2 px-3 pb-2">
        <span className="text-[9px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">All categories</span>
        <span className="text-[9px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">All tags</span>
      </div>
      {/* Prompt cards */}
      <div className="px-3 pb-2 space-y-2">
        {[
          { name: "Code Review Feedback", desc: "Get thorough, constructive code review feedback f...", tags: ["development", "code-review", "template"] },
          { name: "Weekly Status Update", desc: "A template for writing weekly status updates. Fill in...", tags: ["productivity", "template", "weekly-update"] },
        ].map((p) => (
          <div key={p.name} className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-2.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-medium text-white">{p.name}</p>
              <Heart className="w-3 h-3 text-zinc-500" />
            </div>
            <span className="text-[8px] font-semibold text-rose-400 mb-1 inline-block">Template</span>
            <p className="text-[9px] text-zinc-400 leading-relaxed mb-1.5">{p.desc}</p>
            <div className="flex gap-1">
              {p.tags.map((tag) => (
                <span key={tag} className="text-[7px] bg-zinc-700/50 text-zinc-400 px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px] text-emerald-400 font-medium">Protected</span>
        </div>
        <span className="text-[9px] text-zinc-500">2 prompts</span>
      </div>
    </div>
  );
}

function ComplianceAuditMockup() {
  const packs = [
    { name: "HIPAA", rules: 8, color: "bg-rose-500/10 text-rose-600", installed: true },
    { name: "GDPR", rules: 6, color: "bg-blue-500/10 text-blue-600", installed: true },
    { name: "PCI-DSS", rules: 7, color: "bg-amber-500/10 text-amber-600" },
    { name: "CCPA", rules: 5, color: "bg-emerald-500/10 text-emerald-600" },
    { name: "SOC 2", rules: 9, color: "bg-violet-500/10 text-violet-600" },
    { name: "General PII", rules: 4, color: "bg-sky-500/10 text-sky-600", installed: true },
  ];
  return (
    <MockBrowser>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatCard icon={Shield} value="19" label="Compliance Packs" iconColor="bg-primary/10 text-primary" />
        <StatCard icon={Activity} value="1,247" label="Events Logged" iconColor="bg-primary/10 text-primary" />
        <StatCard icon={ShieldCheck} value="100%" label="Block Rate" iconColor="bg-primary/10 text-primary" />
      </div>
      {/* Packs grid */}
      <p className="text-[9px] font-semibold text-foreground mb-2">Compliance Packs</p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {packs.map((pack) => (
          <div key={pack.name} className={cn(
            "flex items-center gap-2 rounded-lg border p-2",
            pack.installed ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-border"
          )}>
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", pack.color)}>
              <ShieldCheck className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-medium truncate">{pack.name}</p>
                {pack.installed && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
              </div>
              <p className="text-[8px] text-muted-foreground">{pack.rules} rules</p>
            </div>
          </div>
        ))}
      </div>
      {/* Recent audit log */}
      <p className="text-[9px] font-semibold text-foreground mb-1.5">Recent Activity Log</p>
      {[
        { action: "SSN blocked", user: "Kate P.", time: "2m ago", severity: "block" },
        { action: "API key redacted", user: "Sam R.", time: "8m ago", severity: "redact" },
        { action: "PII warning shown", user: "Alex J.", time: "15m ago", severity: "warn" },
      ].map((log) => (
        <div key={log.action} className="flex items-center gap-2 py-1.5 text-[9px] border-b border-border/40 last:border-0">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            log.severity === "block" ? "bg-red-500" : log.severity === "redact" ? "bg-primary" : "bg-amber-500"
          )} />
          <span className="flex-1 font-medium text-foreground">{log.action}</span>
          <span className="text-muted-foreground">{log.user}</span>
          <span className="text-muted-foreground">{log.time}</span>
        </div>
      ))}
    </MockBrowser>
  );
}

/* ── Primary feature data ── */

const primaryFeatures = [
  {
    icon: Shield,
    title: "DLP / Sensitive Data Protection",
    description:
      "Your team pastes confidential data into AI tools every day. TeamPrompt scans every message in real time and blocks, warns, or redacts sensitive information before it leaves your organization.",
    details: [
      "15+ built-in rules for PII, financial data, API keys, and credentials",
      "Three enforcement levels per rule: Block, Warn, or Redact",
      "Custom rules with keyword, regex, and exact-match patterns",
      "Category-aware placeholders: [API_KEY], [EMAIL], [SSN], [PII]",
      "Works in the browser extension and the built-in AI chat",
    ],
    mockup: DLPMockup,
  },
  {
    icon: Archive,
    title: "Shared Prompt Library",
    description:
      "Stop digging through docs, Slack messages, and bookmarks. Your library is one searchable place for every prompt your team writes, with approval workflows to keep quality high.",
    details: [
      "Full-text search across titles, content, and tags",
      "Template variables with fill-in-the-blank insertion",
      "Approval queue: Draft, Pending, Approved, Archived",
      "Version history so nothing gets lost",
      "Usage tracking, star ratings, and favorites",
    ],
    mockup: VaultMockup,
  },
  {
    icon: Globe,
    title: "Browser Extension",
    description:
      "Your prompts live in TeamPrompt. Your team works in ChatGPT, Claude, and Gemini. The extension bridges the gap with one-click insert and real-time DLP scanning.",
    details: [
      "ChatGPT, Claude, Gemini, Perplexity, and Copilot support",
      "One-click paste of any saved prompt into the AI tool",
      "Fill in template variables before sending",
      "Real-time sensitive data scanning on outbound text",
      "Shield status indicator shows protection is active",
    ],
    mockup: ExtensionMockup,
  },
  {
    icon: FileCheck,
    title: "Compliance & Audit",
    description:
      "Pre-built compliance packs for regulated industries, plus a full activity log of every scan, block, and redaction. Export reports for auditors in one click.",
    details: [
      "19 compliance frameworks: HIPAA, GDPR, PCI-DSS, SOC 2, CCPA, and more",
      "One-click install activates all rules in a pack",
      "Full activity log with user, action, timestamp, and severity",
      "Exportable audit reports for compliance reviews",
      "Customize or extend any pack after installation",
    ],
    mockup: ComplianceAuditMockup,
  },
];

/* ── Governance & Security features ── */

const governanceFeatures = [
  {
    icon: ShieldCheck,
    title: "Smart Redaction",
    description:
      "Automatically replaces sensitive data with category placeholders like [API_KEY] or [SSN]. The message still sends safely without interrupting your team.",
  },
  {
    icon: Activity,
    title: "Violation Tracking",
    description:
      "Every blocked, warned, or redacted interaction is logged with the matched rule, user, AI tool, and timestamp. Risk scoring rates each violation 0-100.",
  },
  {
    icon: Settings,
    title: "40+ Detection Rules",
    description:
      "Pre-built rules for AWS keys, GitHub tokens, Stripe keys, JWT tokens, SSNs, credit cards, passwords, PEM keys, connection strings, and more.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Detection",
    description:
      "Entropy-based scanning catches high-randomness strings like API keys. AI detection via multiple providers flags data that regex patterns miss.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Usage by team, by member, by AI tool. Violation trends, block rates, most-triggered rules, top-rated prompts, and week-over-week comparisons.",
  },
  {
    icon: Eye,
    title: "Full Audit Trail",
    description:
      "Metadata-only or full-text logging of every AI interaction. Filter by tool, action, date range. Export to CSV or JSON for compliance reviews.",
  },
  {
    icon: Globe,
    title: "AI Tool Policy + Cloudflare Gateway",
    description:
      "Approve trusted AI tools, block everything else. Browser extension enforcement plus optional DNS-level blocking via Cloudflare Gateway — covers native apps and mobile.",
  },
  {
    icon: Shield,
    title: "Audit & Compliance Dashboard",
    description:
      "Sankey flow diagrams showing team→tool usage, violation heatmaps, risk score distribution, compliance framework coverage, and one-click CSV export for auditors.",
  },
];

/* ── Platform features ── */

const platformFeatures = [
  {
    icon: MessageSquare,
    title: "Built-In AI Chat",
    href: "/features/ai-chat",
    description:
      "DLP-protected AI chat with GPT-4o, Claude Sonnet/Opus, Gemini Flash/Pro. File uploads, conversation collections, compare mode, and admin commands.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Admin, Manager, and Member roles with per-team policies. Bulk CSV import, Google Workspace sync, domain auto-join, and invite tracking.",
  },
  {
    icon: BookOpen,
    title: "Quality Guidelines",
    description:
      "14 built-in guideline categories. Enforce tone rules, banned words, required fields, and length constraints. Scope them per-team or org-wide.",
  },
  {
    icon: CheckSquare,
    title: "Approval Workflows",
    description:
      "Managers review prompts and AI-suggested rules before they go live. Approve or reject with inline feedback. Full audit trail of decisions.",
  },
  {
    icon: Import,
    title: "Import / Export",
    description:
      "Export prompt packs as JSON, import from file, bulk CSV user import. Move prompts between orgs or share curated packs with teams.",
  },
  {
    icon: FileCheck,
    title: "Template Packs",
    description:
      "8 pre-built packs for marketing, sales, engineering, support, HR, legal, executive, and analytics. Install and your team is productive on day one.",
  },
  {
    icon: Star,
    title: "Sensitive Terms Manager",
    description:
      "Custom sensitive terms by category: customer data, employee data, project names, financial data. Import from CSV or let AI suggest terms from violations.",
  },
  {
    icon: Globe,
    title: "MCP Integration",
    description:
      "Model Context Protocol support for AI coding tools like Claude Desktop, Cursor, and Windsurf. Generate API keys and configure MCP-enabled tools.",
  },
];

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Features", url: "https://teamprompt.app/features" },
]);

export default function FeaturesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    {/* ── Hero ── Circle-inspired with gradient */}
    <section
      className="border-b border-border pt-32 pb-20 sm:pt-40 sm:pb-28"
      style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 50%, #fff 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-tight">
          AI Usage Control.{" "}
          <span className="text-primary">One Platform.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          TeamPrompt combines a shared prompt library, real-time DLP protection, compliance packs for 19 frameworks, and a browser extension that works inside ChatGPT, Claude, and Gemini.
        </p>
      </div>
    </section>

    {/* ── How it works — numbered steps ── */}
    <section className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-wider text-primary mb-2">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Three layers of AI governance
          </h2>
        </div>

        <div className="space-y-8">
          {[
            {
              step: "1",
              title: "Control which AI tools are used",
              subtitle: "Network-Level Enforcement",
              desc: "Approve trusted AI tools and block everything else at the DNS level via Cloudflare Gateway. Covers all devices — browser, native apps, mobile, CLI. Users on unapproved tools see a clear block page.",
              color: "bg-blue-500",
            },
            {
              step: "2",
              title: "Scan what gets sent to AI",
              subtitle: "Content-Level DLP",
              desc: "On approved tools, the browser extension scans every outbound prompt in real time. 40+ detection rules catch SSNs, credit cards, API keys, patient data, and more. Block, warn, or auto-redact before it leaves the browser.",
              color: "bg-emerald-500",
            },
            {
              step: "3",
              title: "Audit everything",
              subtitle: "Compliance & Reporting",
              desc: "Every AI interaction is logged with user, tool, action, and risk score. Sankey flow diagrams show team→tool usage. Heatmaps show when violations occur. 19 compliance packs cover HIPAA, SOC 2, PCI-DSS, GDPR, and more. Export CSV for auditors.",
              color: "bg-violet-500",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shrink-0", item.color)}>
                {item.step}
              </div>
              <div className="flex-1 pb-8 border-b border-border last:border-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{item.subtitle}</p>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Primary Features ── */}
        <div className="space-y-28">
          {primaryFeatures.map((feature, i) => {
            const Mockup = feature.mockup;
            return (
              <div
                key={feature.title}
                id={feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}
                className={cn(
                  "flex flex-col gap-10 lg:gap-16 items-center",
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                )}
              >
                <div className="flex-1 max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold">{feature.title}</h2>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {feature.details.map((d) => (
                      <li key={d} className="flex items-start gap-3 text-sm">
                        <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full max-w-lg">
                  <Mockup />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Governance & Security ── */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Layer 1 + 2</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
              Detection, enforcement, and accountability
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From network-level DNS blocking to content-level DLP scanning — every tool your team touches is monitored, every violation is logged, and every audit is one click away.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {governanceFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>

        {/* ── Platform Capabilities ── */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Layer 3</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
              Prompt management and team productivity
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Beyond security — TeamPrompt gives your team a shared prompt library, multi-model AI chat, approval workflows, and template packs to standardize AI usage.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href={"href" in feature ? feature.href : undefined}
              />
            ))}
          </div>
        </div>

        {/* ── Explore by use case ── */}
        <div className="mt-28 mb-28">
          <div className="text-center mb-10">
            <SectionLabel>Solutions</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Explore by use case
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              { href: "/solutions/prompt-library", icon: BookOpen, name: "Prompt Library", desc: "Organize, version, and share prompts across your team" },
              { href: "/solutions/ai-dlp", icon: Shield, name: "AI Data Protection", desc: "Block sensitive data before it reaches AI tools" },
              { href: "/solutions/ai-governance", icon: Activity, name: "AI Governance", desc: "Activity logging, approvals, and compliance controls" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>

    {/* ── Get Started + Lead Capture ── */}
    <div className="border-t border-border">
      <GetStartedSteps />
    </div>
    <LeadCaptureForm />
    </>
  );
}
