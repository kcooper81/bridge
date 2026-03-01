import type { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Download,
  FileCheck,
  GitCompare,
  Globe,
  Heart,
  Import,
  Lock,
  MoreHorizontal,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  StickyNote,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = generatePageMetadata({
  title: "Features",
  description:
    "Explore TeamPrompt's features: prompt vault, AI guardrails, quality guidelines, team management, browser extension, and analytics.",
  path: "/features",
  keywords: ["prompt vault", "AI guardrails", "browser extension", "prompt templates", "compliance packs", "auto-sanitization", "approval queue", "version diff"],
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

function GuardrailsMockup() {
  const packs = [
    { name: "HIPAA", desc: "Protects PHI and medical info", rules: 4 },
    { name: "PCI-DSS", desc: "Protects cardholder data", rules: 5 },
    { name: "GDPR", desc: "Protects EU personal data", rules: 5, installed: true },
  ];
  const policies = [
    { name: "AWS Access Key", scope: "Global", pattern: "regex", category: "Api Keys", severity: "Blocked" },
    { name: "Social Security Number", scope: "Global", pattern: "regex", category: "PII", severity: "Blocked" },
  ];
  return (
    <MockBrowser>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatCard icon={Shield} value="17" label="Active Policies" iconColor="bg-primary/10 text-primary" />
        <StatCard icon={ShieldAlert} value="15" label="Violations (7d)" iconColor="bg-primary/10 text-primary" />
        <StatCard icon={ShieldCheck} value="100%" label="Block Rate" iconColor="bg-primary/10 text-primary" />
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-3 mb-3 border-b border-border pb-2">
        {["Policies (17)", "Sensitive Terms", "Detection", "Suggestions", "Violations (15)"].map((t, i) => (
          <span key={t} className={cn("text-[9px] font-medium whitespace-nowrap", i === 0 ? "text-primary border-b border-primary pb-1.5" : "text-muted-foreground")}>{t}</span>
        ))}
      </div>
      {/* Compliance packs */}
      <p className="text-[9px] font-semibold text-foreground mb-2">Compliance Packs <span className="font-normal text-muted-foreground">One-click install regulatory rule sets</span></p>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {packs.map((p) => (
          <div key={p.name} className="rounded-lg border border-border p-2">
            <p className="text-[10px] font-semibold">{p.name}</p>
            <p className="text-[7px] text-muted-foreground truncate">{p.desc}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[8px] text-muted-foreground">{p.rules} rules</span>
              {p.installed ? (
                <span className="text-[7px] text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="w-2 h-2" />Installed</span>
              ) : (
                <span className="text-[7px] bg-primary text-white px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><Download className="w-2 h-2" />Install</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Policy table header */}
      <div className="flex items-center gap-2 py-1 text-[7px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <span className="flex-1">Policy</span>
        <span className="w-10 text-center">Scope</span>
        <span className="w-10 text-center">Category</span>
        <span className="w-12 text-center">Severity</span>
        <span className="w-8 text-center">Active</span>
      </div>
      {policies.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
          <span className="flex-1 text-[10px] font-medium">{p.name}</span>
          <span className="w-10 text-center text-[8px] text-muted-foreground">{p.scope}</span>
          <span className="w-10 text-center text-[8px] text-muted-foreground">{p.category}</span>
          <span className="w-12 text-center"><span className="text-[7px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">{p.severity}</span></span>
          <div className="w-8 flex justify-center"><div className="w-5 h-3 rounded-full bg-primary p-0.5 flex justify-end"><div className="w-2 h-2 rounded-full bg-white" /></div></div>
        </div>
      ))}
    </MockBrowser>
  );
}

function GuidelinesMockup() {
  const guidelines = [
    { name: "Coding", cat: "development", desc: "Standards for code-related prompts", on: false },
    { name: "Customer Support", cat: "support", desc: "Customer-facing communication standards", on: false },
    { name: "Executive Communication", cat: "executive", desc: "C-suite and leadership standards", on: false },
    { name: "Marketing & Content", cat: "marketing", desc: "Marketing content standards", on: true },
    { name: "Writing", cat: "writing", desc: "General writing quality standards", on: false },
  ];
  return (
    <MockBrowser>
      <div className="grid grid-cols-3 gap-2">
        {guidelines.map((g) => (
          <div key={g.name} className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-start justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-foreground leading-tight">{g.name}</p>
              {/* Toggle */}
              <div className={cn(
                "w-6 h-3.5 rounded-full p-0.5 flex items-center shrink-0",
                g.on ? "bg-primary justify-end" : "bg-muted-foreground/20 justify-start"
              )}>
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <span className="text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded inline-block mb-1">{g.cat}</span>
            <p className="text-[8px] text-muted-foreground leading-relaxed">{g.desc}</p>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function TeamsMockup() {
  const members = [
    { initials: "AJ", name: "Alex Johnson", email: "alex@acme.co", ext: "Active", extColor: "text-emerald-600", shield: true, role: "Admin" },
    { initials: "KP", name: "Kate Parker", email: "kate@acme.co", ext: "Active", extColor: "text-emerald-600", shield: true, role: "Manager" },
    { initials: "SR", name: "Sam Rivera", email: "sam@acme.co", ext: "Not installed", extColor: "text-muted-foreground", shield: true, role: "Member" },
    { initials: "ML", name: "Morgan Lee", email: "morgan@acme.co", ext: "Inactive", extColor: "text-amber-500", shield: true, role: "Member" },
  ];
  return (
    <MockBrowser>
      {/* Google Workspace banner */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <div>
            <span className="text-[10px] font-semibold text-emerald-700">Google Workspace connected</span>
            <p className="text-[8px] text-emerald-600/70">Last synced Feb 28, 4:40 PM</p>
          </div>
        </div>
        <span className="text-[8px] bg-background border border-border rounded px-2 py-1 font-medium text-muted-foreground">Sync Directory</span>
      </div>
      {/* Table header */}
      <div className="flex items-center gap-2 py-1.5 text-[7px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border mb-0.5">
        <span className="flex-1">Name</span>
        <span className="w-16 text-center">Extension</span>
        <span className="w-10 text-center">Shield</span>
        <span className="w-14 text-right">Role</span>
      </div>
      {members.map((m) => (
        <div key={m.email} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-white shrink-0">
              {m.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-foreground truncate">{m.name}</p>
              <p className="text-[8px] text-muted-foreground truncate">{m.email}</p>
            </div>
          </div>
          <span className={cn("w-16 text-center text-[8px] font-medium flex items-center justify-center gap-1", m.extColor)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", m.ext === "Active" ? "bg-emerald-500" : m.ext === "Inactive" ? "bg-amber-500" : "bg-muted-foreground/30")} />
            {m.ext}
          </span>
          <div className="w-10 flex justify-center">
            <div className={cn("w-5 h-3 rounded-full p-0.5 flex items-center", m.shield ? "bg-primary justify-end" : "bg-muted justify-start")}>
              <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
            </div>
          </div>
          <span className="w-14 text-right text-[9px] font-medium text-muted-foreground">{m.role}</span>
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
        {[{ name: "Faves", active: true }, { name: "Recent" }, { name: "Prompts" }, { name: "Guardrails" }].map((t) => (
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
          <span className="text-[9px] text-emerald-400 font-medium">Guardrails</span>
        </div>
        <span className="text-[9px] text-zinc-500">2 prompts</span>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  return (
    <MockBrowser>
      {/* Primary stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <StatCard icon={StickyNote} value="142" label="Total Prompts" />
        <StatCard icon={BarChart3} value="89" label="Total Uses" />
        <StatCard icon={Star} value="4.2" label="Avg Rating" />
        <StatCard icon={Activity} value="12" label="Uses This Week" />
      </div>
      {/* Secondary stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: "Week Trend", val: "+8%", icon: "↗" },
          { label: "Active Members", val: "5", icon: "👥" },
          { label: "Templates", val: "6", icon: "{}" },
          { label: "Guardrail Blocks", val: "15", icon: "🛡" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border p-2">
            <div className="flex items-center justify-between">
              <p className="text-[8px] text-muted-foreground">{s.label}</p>
              <span className="text-[8px]">{s.icon}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{s.val}</p>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="rounded-lg border border-border p-3 mb-3">
        <p className="text-[10px] font-semibold text-foreground mb-2">Daily Usage — Last 30 Days</p>
        <div className="h-12 flex items-end gap-[2px]">
          {[20, 35, 25, 40, 55, 30, 45, 60, 40, 50, 35, 65, 45, 55, 70, 50, 60, 75, 55, 65, 45, 70, 80, 60, 70, 50, 75, 85, 65, 80].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-primary/30" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[7px] text-muted-foreground">Jan 29</span>
          <span className="text-[7px] text-muted-foreground">Feb 28</span>
        </div>
      </div>
      {/* Top Prompts + Usage by Member */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border p-2">
          <p className="text-[9px] font-semibold mb-1.5">Top Prompts</p>
          {["Customer Email Reply", "Meeting Summary", "Code Review"].map((p, i) => (
            <div key={p} className="flex items-center justify-between py-1 text-[9px]">
              <span className="text-muted-foreground">{i + 1}. {p}</span>
              <span className="font-medium tabular-nums">{[42, 31, 18][i]} uses</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border p-2">
          <p className="text-[9px] font-semibold mb-1.5">Usage by Member</p>
          {["Alex J.", "Kate P.", "Sam R."].map((p, i) => (
            <div key={p} className="flex items-center justify-between py-1 text-[9px]">
              <span className="text-muted-foreground">{p}</span>
              <span className="font-medium tabular-nums">{[34, 28, 15][i]} uses</span>
            </div>
          ))}
        </div>
      </div>
    </MockBrowser>
  );
}

function ImportMockup() {
  return (
    <MockBrowser>
      <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center bg-primary/[0.02] mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
          <Import className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs font-medium text-foreground">Drop a prompt pack here</p>
        <p className="text-[10px] text-muted-foreground mt-1">or click to browse (.json)</p>
      </div>
      {/* Imported pack preview */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-600">marketing-pack.json imported</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span>12 prompts</span>
          <span>&middot;</span>
          <span>3 categories</span>
          <span>&middot;</span>
          <span>2 duplicates skipped</span>
        </div>
      </div>
    </MockBrowser>
  );
}

function CompliancePacksMockup() {
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
      <div className="grid grid-cols-2 gap-2">
        {packs.map((pack) => (
          <div key={pack.name} className={cn(
            "flex items-center gap-2 rounded-lg border p-2.5",
            pack.installed ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-border"
          )}>
            <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", pack.color)}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium truncate">{pack.name}</p>
                {pack.installed && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
              </div>
              <p className="text-[9px] text-muted-foreground">{pack.rules} rules</p>
            </div>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function AutoSanitizationMockup() {
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
            <p className="text-[10px] text-emerald-600 font-semibold">Sanitized — safe to send</p>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">
            Patient <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"{{PATIENT_NAME}}"}</span>, SSN{" "}
            <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"{{SSN}}"}</span>, was admitted to{" "}
            <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"{{FACILITY}}"}</span> on Jan 15.
          </p>
        </div>
      </div>
    </MockBrowser>
  );
}

function ApprovalQueueMockup() {
  const items = [
    { title: "New onboarding prompt", author: "KP", type: "Prompt", time: "2m ago", priority: false },
    { title: "Block internal IPs rule", author: "SR", type: "Rule Suggestion", time: "15m ago", priority: true },
    { title: "Q1 report template", author: "ML", type: "Prompt", time: "1h ago", priority: false },
  ];
  return (
    <MockBrowser>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Pending Review</span>
          <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">3</span>
        </div>
        <div className="flex gap-1">
          <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Prompts</span>
          <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Rules</span>
        </div>
      </div>
      {items.map((item, i) => (
        <div key={i} className={cn(
          "flex items-center gap-3 py-2.5 px-2 rounded-md mb-0.5",
          item.priority ? "border-l-2 border-l-amber-500 bg-amber-500/[0.04]" : "border-b border-border/50 last:border-0"
        )}>
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
            {item.author}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{item.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-muted-foreground">{item.type}</span>
              <span className="text-[8px] text-muted-foreground">&middot;</span>
              <span className="text-[9px] text-muted-foreground">{item.time}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className={cn(
              "h-6 rounded-md text-[9px] font-medium flex items-center justify-center gap-1",
              item.type === "Rule Suggestion"
                ? "w-[4.5rem] bg-primary text-primary-foreground"
                : "w-16 bg-emerald-500 text-white"
            )}>
              {item.type === "Rule Suggestion" ? (
                <>
                  <Shield className="w-2.5 h-2.5" /> Create
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5" /> Approve
                </>
              )}
            </div>
            <div className="h-6 w-14 rounded-md bg-muted text-[9px] text-muted-foreground font-medium flex items-center justify-center">
              Reject
            </div>
          </div>
        </div>
      ))}
    </MockBrowser>
  );
}

function VersionDiffMockup() {
  return (
    <MockBrowser>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-medium">v2</span>
          <span className="text-[10px] text-muted-foreground">vs</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium">v3 (current)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span>by Kate P.</span>
          <span>&middot;</span>
          <span>2 days ago</span>
        </div>
      </div>
      <div className="space-y-1 font-mono text-[10px]">
        <div className="rounded bg-muted/30 px-2 py-1.5 text-muted-foreground flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground/50 w-3 text-right">1</span>
          Analyze the quarterly report for...
        </div>
        <div className="rounded bg-red-500/10 px-2 py-1.5 text-red-600 line-through flex items-center gap-2">
          <span className="text-[8px] text-red-400 w-3 text-right">2</span>
          Focus on revenue trends
        </div>
        <div className="rounded bg-emerald-500/10 px-2 py-1.5 text-emerald-600 flex items-center gap-2">
          <span className="text-[8px] text-emerald-400 w-3 text-right">2</span>
          Focus on revenue trends and cost reduction
        </div>
        <div className="rounded bg-emerald-500/10 px-2 py-1.5 text-emerald-600 flex items-center gap-2">
          <span className="text-[8px] text-emerald-400 w-3 text-right">3</span>
          Include year-over-year comparison
        </div>
        <div className="rounded bg-muted/30 px-2 py-1.5 text-muted-foreground flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground/50 w-3 text-right">4</span>
          Output as bullet points...
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[9px]">
          <span className="text-emerald-600 font-medium">+2 added</span>
          <span className="text-red-600 font-medium">-1 removed</span>
        </div>
        <div className="h-6 px-3 rounded-md bg-primary/10 text-[9px] text-primary font-medium flex items-center justify-center gap-1">
          Restore v2
        </div>
      </div>
    </MockBrowser>
  );
}

function AdminSecurityMockup() {
  const toggles = [
    { label: "DLP Guardrails", desc: "Scan outbound text for sensitive data", on: true },
    { label: "Block override", desc: "Prevent users from bypassing warnings", on: true },
    { label: "Auto-redact PII", desc: "Replace sensitive data with placeholders", on: false },
    { label: "Activity logging", desc: "Log all prompt activity for audit", on: true },
  ];
  return (
    <MockBrowser>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Security Settings</span>
      </div>
      <div className="space-y-1.5">
        {toggles.map((t) => (
          <div key={t.label} className={cn(
            "flex items-center gap-3 py-2 px-2.5 rounded-lg",
            t.on ? "bg-primary/[0.04] border-l-2 border-l-primary" : "bg-muted/20"
          )}>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground">{t.label}</p>
              <p className="text-[9px] text-muted-foreground">{t.desc}</p>
            </div>
            <div className={cn(
              "w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors shrink-0",
              t.on ? "bg-primary justify-end" : "bg-muted justify-start"
            )}>
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function BulkOperationsMockup() {
  const rows = [
    { name: "jane@acme.co", team: "Marketing", status: "valid" as const },
    { name: "tom@acme.co", team: "Engineering", status: "valid" as const },
    { name: "lisa@acme.co", team: "Sales", status: "warning" as const },
    { name: "invalid-email", team: "—", status: "error" as const },
  ];
  const statusStyle = {
    valid: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    error: "bg-red-500/10 text-red-600",
  };
  const statusIcon = {
    valid: CheckCircle2,
    warning: AlertTriangle,
    error: ShieldX,
  };
  return (
    <MockBrowser>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground">CSV Import Preview</span>
        <span className="text-[9px] text-muted-foreground">4 rows parsed</span>
      </div>
      {/* Progress */}
      <div className="h-1.5 rounded-full bg-muted mb-3 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: "75%" }} />
      </div>
      <div className="space-y-1">
        {rows.map((r) => {
          const Icon = statusIcon[r.status];
          return (
            <div key={r.name} className={cn(
              "flex items-center gap-2.5 py-1.5 px-2 rounded-md text-[10px]",
              r.status === "error" ? "bg-red-500/[0.04] border-l-2 border-l-red-500" :
              r.status === "warning" ? "bg-amber-500/[0.04] border-l-2 border-l-amber-500" : ""
            )}>
              <Icon className={cn("w-3 h-3 shrink-0", statusStyle[r.status].split(" ")[1])} />
              <span className="flex-1 font-mono truncate">{r.name}</span>
              <span className="text-muted-foreground">{r.team}</span>
              <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full", statusStyle[r.status])}>
                {r.status}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">
          <span className="text-emerald-600 font-medium">2 valid</span> &middot;{" "}
          <span className="text-amber-600 font-medium">1 warning</span> &middot;{" "}
          <span className="text-red-600 font-medium">1 error</span>
        </span>
        <div className="h-6 px-3 rounded-md bg-primary text-[9px] text-primary-foreground font-medium flex items-center justify-center">
          Import 3
        </div>
      </div>
    </MockBrowser>
  );
}

const mockups: Record<string, () => React.JSX.Element> = {
  "Prompt Vault": VaultMockup,
  "AI Guardrails": GuardrailsMockup,
  "Quality Guidelines": GuidelinesMockup,
  "Team Management": TeamsMockup,
  "Browser Extension": ExtensionMockup,
  "Analytics & Insights": AnalyticsMockup,
  "Import / Export": ImportMockup,
  "Compliance Policy Packs": CompliancePacksMockup,
  "Auto-Sanitization": AutoSanitizationMockup,
  "Approval Queue": ApprovalQueueMockup,
  "Version Diff": VersionDiffMockup,
  "Admin Security Controls": AdminSecurityMockup,
  "Bulk Operations": BulkOperationsMockup,
};

/* ── Feature data ────────────────────────────────────────── */

const features = [
  {
    icon: Archive,
    title: "Prompt Vault",
    description:
      "Stop digging through documents, shared drives, and bookmarks. Your vault is a single searchable home for every prompt your org writes.",
    details: [
      "Full-text search across titles, content, and tags",
      "Filter by folder, department, or favorites",
      "Version history so nothing gets lost",
      "Usage tracking and rating system",
    ],
  },
  {
    icon: Shield,
    title: "AI Guardrails",
    badge: "NEW",
    description:
      "Your team pastes confidential data, client details, and internal context into AI tools every day. Guardrails catch sensitive information before it leaves.",
    details: [
      "15 built-in policies for PII, financial data, credentials, and more",
      "Custom rules with keyword, pattern, and exact matching",
      "Block or warn severity levels",
      "Full audit log of violations for compliance",
    ],
  },
  {
    icon: BookOpen,
    title: "Quality Guidelines",
    description:
      "Without structure, prompts vary wildly in quality. Guidelines enforce the basics so every prompt meets a bar.",
    details: [
      "Do/don't lists, banned words, length constraints",
      "Required fields and tags per guideline",
      "Enforce toggle for real-time validation",
      "14 built-in guidelines to start with",
    ],
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Different people need different access. Admins manage policies, managers curate libraries, members use what's there.",
    details: [
      "Admin, Manager, and Member roles",
      "Bulk CSV import and bulk role assignment",
      "Google Workspace directory sync (Business)",
      "Domain-based auto-join and custom welcome emails",
    ],
  },
  {
    icon: Globe,
    title: "Browser Extension",
    description:
      "Your prompts live in TeamPrompt. Your team works in ChatGPT, Claude, Gemini, and a dozen other tools. The extension bridges the gap.",
    details: [
      "ChatGPT, Claude, Gemini, Perplexity, Copilot support",
      "One-click prompt injection into AI tools",
      "Template variable fill-in before sending",
      "Real-time sensitive data scanning on outbound text",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "You can't improve what you can't see. Analytics show which prompts get reused, which teams are active, and where gaps exist.",
    details: [
      "30-day daily usage chart",
      "Top prompts ranking by usage",
      "Effectiveness ratings and distribution metrics",
      "Per-user and per-department breakdowns",
      "Week-over-week trend tracking",
    ],
  },
  {
    icon: Import,
    title: "Import / Export",
    description:
      "Moving between orgs or onboarding a new team? Export prompt packs as JSON and import them anywhere.",
    details: [
      "Select specific prompts to export",
      "Named prompt packs with metadata",
      "Drag-and-drop import from JSON",
      "Cross-organization portability",
    ],
  },
  {
    icon: FileCheck,
    title: "Compliance Policy Packs",
    badge: "NEW",
    description:
      "Pre-built security policy bundles for regulated industries. Install HIPAA, GDPR, PCI-DSS, CCPA, SOC 2, or General PII rules with one click.",
    details: [
      "6 compliance frameworks ready to deploy",
      "One-click install activates all relevant rules",
      "Covers PHI, PII, financial data, and credentials",
      "Customize or extend any pack after installation",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Auto-Sanitization",
    badge: "NEW",
    description:
      "Automatically replace sensitive data with safe placeholder tokens before prompts reach AI tools. Keep the context, remove the risk.",
    details: [
      "Replaces detected data with {{PLACEHOLDER}} tokens",
      "Works with all built-in and custom security rules",
      "Preserves prompt structure and intent",
      "Sanitized version logged for audit trail",
    ],
  },
  {
    icon: CheckSquare,
    title: "Approval Queue",
    badge: "NEW",
    description:
      "A dedicated dashboard for reviewing pending prompts and rule suggestions. Approve, reject, or request changes — all in one place.",
    details: [
      "Unified queue for prompts and rule suggestions",
      "Approve or reject with one click",
      "Inline feedback for rejected items",
      "Badge count in sidebar for pending items",
    ],
  },
  {
    icon: GitCompare,
    title: "Version Diff",
    badge: "NEW",
    description:
      "Compare any two versions of a prompt side by side. See exactly what changed — additions, deletions, and modifications — in a clean diff view.",
    details: [
      "Side-by-side comparison of any two versions",
      "Color-coded additions and deletions",
      "Full version history timeline",
      "Restore any previous version instantly",
    ],
  },
  {
    icon: Settings,
    title: "Admin Security Controls",
    badge: "NEW",
    description:
      "Fine-tune how the extension behaves across your organization. Control guardrails, sign-in requirements, activity logging, and more from a dedicated Security settings tab.",
    details: [
      "Toggle DLP guardrails on/off at the org level",
      "Disable warning overrides to enforce hard blocks",
      "Auto-redact sensitive data with placeholder tokens",
      "Control activity logging and extension sign-in requirements",
    ],
  },
  {
    icon: Upload,
    title: "Bulk Operations",
    badge: "NEW",
    description:
      "Onboard entire departments at once. Import members via CSV, assign roles in bulk, and sync your Google Workspace directory — all from the Team page.",
    details: [
      "CSV import with preview validation and auto-team creation",
      "Select multiple members for bulk role changes",
      "Google Workspace directory sync with one-click invite",
      "Domain-based auto-join for zero-friction onboarding",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <SectionLabel>Features</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Everything your team needs to manage prompts
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            From shared libraries to security guardrails, TeamPrompt replaces
            scattered documents and shared drives with a proper system.
          </p>
        </div>

        {/* Feature blocks */}
        <div className="space-y-24">
          {features.map((feature, i) => {
            const Mockup = mockups[feature.title];
            return (
              <div
                key={feature.title}
                id={feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}
                className={`flex flex-col gap-10 lg:gap-16 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center`}
              >
                <div className="flex-1 max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold">{feature.title}</h2>
                    {feature.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                        {feature.badge}
                      </span>
                    )}
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
                  {Mockup ? <Mockup /> : (
                    <div className="rounded-2xl border border-border bg-card/50 aspect-video flex items-center justify-center">
                      <feature.icon className="h-16 w-16 text-muted-foreground/10" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-28">
          <CTASection
            headline="See it for yourself."
            gradientText="Start for free."
            subtitle="Create a free workspace in under two minutes. No credit card required."
            buttonText="Start for free"
          />
        </div>
      </div>
    </div>
  );
}
