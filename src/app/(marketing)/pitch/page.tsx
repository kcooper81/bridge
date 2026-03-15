import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { cn } from "@/lib/utils";
import {
  Activity,
  Archive,
  ArrowRight,
  Bell,
  BookOpen,
  Braces,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  GitCompare,
  Heart,
  Lock,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  Upload,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TeamPrompt — The Pitch | AI DLP & Prompt Management",
  description:
    "See why teams trust TeamPrompt to protect sensitive data, manage AI prompts, and stay compliant. Full product walkthrough with every feature.",
};

/* ── Shared mock components ───────────────────────────────── */

function MockBrowser({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden shadow-lg", className)}>
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

function MockExtension({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg w-[280px]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
          <Shield className="w-3 h-3 text-primary" />
        </div>
        <span className="text-[10px] font-semibold text-foreground">TeamPrompt</span>
        <span className="text-[8px] text-muted-foreground ml-auto">v1.11</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/* ── Feature section layout (text left, mock right) ───── */

function FeatureSection({
  label,
  headline,
  description,
  bullets,
  children,
  reverse = false,
  dark = false,
}: {
  label: string;
  headline: string;
  description: string;
  bullets?: string[];
  children: React.ReactNode;
  reverse?: boolean;
  dark?: boolean;
}) {
  return (
    <section className={cn("py-20 sm:py-28", dark && "bg-zinc-950 text-white")}>
      <div className="mx-auto max-w-6xl px-6">
        <div className={cn(
          "grid gap-12 lg:gap-16 items-center",
          "lg:grid-cols-2",
          reverse && "lg:[direction:rtl] lg:[&>*]:[direction:ltr]"
        )}>
          {/* Text */}
          <div>
            <SectionLabel dark={dark}>{label}</SectionLabel>
            <h2 className={cn(
              "text-3xl sm:text-4xl font-bold tracking-tight",
              dark ? "text-white" : "text-foreground"
            )}>
              {headline}
            </h2>
            <p className={cn(
              "mt-4 text-lg leading-relaxed",
              dark ? "text-zinc-400" : "text-muted-foreground"
            )}>
              {description}
            </p>
            {bullets && (
              <ul className="mt-6 space-y-3">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className={cn("w-5 h-5 mt-0.5 shrink-0", dark ? "text-blue-400" : "text-primary")} />
                    <span className={cn("text-sm", dark ? "text-zinc-300" : "text-foreground")}>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Mock */}
          <div className="flex justify-center">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Inline mockups ───────────────────────────────────────── */

function VaultMock() {
  const prompts = [
    { name: "Customer Onboarding Email", tags: "marketing, email", uses: 142, rating: 4.8, fav: true, tpl: false },
    { name: "Code Review Feedback", tags: "development, code-review", uses: 89, rating: 4.2, fav: false, tpl: true },
    { name: "Weekly Status Update", tags: "productivity, template", uses: 67, rating: 0, fav: true, tpl: true },
    { name: "Sales Discovery Call", tags: "sales, outreach", uses: 34, rating: 3.5, fav: false, tpl: false },
  ];
  return (
    <MockBrowser>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="rounded-lg border border-border p-2"><p className="text-[8px] text-muted-foreground">Prompts</p><p className="text-sm font-bold">128</p></div>
        <div className="rounded-lg border border-border p-2"><p className="text-[8px] text-muted-foreground">Total Uses</p><p className="text-sm font-bold">2.4k</p></div>
        <div className="rounded-lg border border-border p-2"><p className="text-[8px] text-muted-foreground">Templates</p><p className="text-sm font-bold">34</p></div>
        <div className="rounded-lg border border-border p-2"><p className="text-[8px] text-muted-foreground">Avg Rating</p><p className="text-sm font-bold">4.3 <Star className="w-2.5 h-2.5 inline text-amber-400 fill-amber-400" /></p></div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-6 rounded-md border border-border bg-background px-2 flex items-center gap-1.5">
          <Search className="h-2.5 w-2.5 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Search prompts...</span>
        </div>
      </div>
      {prompts.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
          <Heart className={cn("w-3 h-3 shrink-0", p.fav ? "text-red-500 fill-red-500" : "text-muted-foreground/30")} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-medium truncate">{p.name}</p>
              {p.tpl && <span className="text-[7px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{"{}"} Template</span>}
            </div>
            <p className="text-[8px] text-muted-foreground truncate mt-0.5">{p.tags}</p>
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">{p.uses}</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => <Star key={s} className={cn("w-2 h-2", s <= Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />)}
          </div>
        </div>
      ))}
    </MockBrowser>
  );
}

function DLPMock() {
  return (
    <MockBrowser>
      <div className="space-y-3">
        <div className="rounded-lg border border-red-500/20 p-3 bg-red-500/[0.03]">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldX className="w-3.5 h-3.5 text-red-500" />
            <p className="text-[10px] text-red-600 font-semibold">3 violations detected</p>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">
            Patient <span className="bg-red-500/15 text-red-600 px-1 rounded font-medium">John Smith</span>, SSN{" "}
            <span className="bg-red-500/15 text-red-600 px-1 rounded font-medium">123-45-6789</span>, was treated at{" "}
            <span className="bg-red-500/15 text-red-600 px-1 rounded font-medium">St. Mary&apos;s Hospital</span>.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="rounded-lg border border-emerald-500/20 p-3 bg-emerald-500/[0.03]">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] text-emerald-600 font-semibold">Auto-sanitized — safe to send</p>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">
            Patient <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"{{PATIENT_NAME}}"}</span>, SSN{" "}
            <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"{{SSN}}"}</span>, was treated at{" "}
            <span className="bg-primary/15 text-primary px-1 rounded font-mono text-[10px]">{"{{FACILITY}}"}</span>.
          </p>
        </div>
      </div>
    </MockBrowser>
  );
}

function RiskScoreMock() {
  const logs = [
    { tool: "ChatGPT", action: "Blocked", risk: 87, color: "text-red-600 bg-red-500/10", flags: 3 },
    { tool: "Claude", action: "Warned", risk: 42, color: "text-orange-600 bg-orange-500/10", flags: 1 },
    { tool: "Gemini", action: "Sent", risk: 8, color: "text-emerald-600 bg-emerald-500/10", flags: 0 },
    { tool: "ChatGPT", action: "Sent", risk: 3, color: "text-emerald-600 bg-emerald-500/10", flags: 0 },
  ];
  return (
    <MockBrowser>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg border border-border p-2 text-center">
          <p className="text-[8px] text-muted-foreground">Avg Risk</p>
          <p className="text-lg font-bold text-orange-500">35</p>
        </div>
        <div className="rounded-lg border border-border p-2 text-center">
          <p className="text-[8px] text-muted-foreground">High Risk (40+)</p>
          <p className="text-lg font-bold text-red-500">12</p>
        </div>
        <div className="rounded-lg border border-border p-2 text-center">
          <p className="text-[8px] text-muted-foreground">Critical (70+)</p>
          <p className="text-lg font-bold text-red-700">4</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
        <span className="flex-1">AI Tool</span>
        <span className="w-14 text-center">Action</span>
        <span className="w-12 text-center">Risk</span>
        <span className="w-10 text-center">Flags</span>
      </div>
      {logs.map((l, i) => (
        <div key={i} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
          <span className="flex-1 text-[11px] font-medium">{l.tool}</span>
          <span className={cn("w-14 text-center text-[9px] font-semibold px-1.5 py-0.5 rounded", l.color)}>{l.action}</span>
          <div className="w-12 flex justify-center">
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums",
              l.risk >= 70 ? "bg-red-500/15 text-red-600" :
              l.risk >= 40 ? "bg-orange-500/15 text-orange-600" :
              "bg-emerald-500/15 text-emerald-600"
            )}>{l.risk}</span>
          </div>
          <span className="w-10 text-center text-[10px] text-muted-foreground">{l.flags > 0 ? `${l.flags}` : "-"}</span>
        </div>
      ))}
    </MockBrowser>
  );
}

function ExtensionMock() {
  return (
    <div className="space-y-4">
      {/* Shield indicator */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] px-4 py-3 w-fit mx-auto shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-600">Guardrails Active</p>
          <p className="text-[9px] text-muted-foreground">17 rules protecting this session</p>
        </div>
      </div>
      {/* Side panel */}
      <MockExtension>
        <div className="flex gap-1 mb-2">
          {["Faves", "Recent", "Prompts"].map((t, i) => (
            <span key={t} className={cn("text-[9px] font-medium px-2 py-1 rounded", i === 2 ? "bg-primary/10 text-primary" : "text-muted-foreground")}>{t}</span>
          ))}
        </div>
        <div className="h-6 rounded-md border border-border bg-background px-2 flex items-center gap-1.5 mb-2">
          <Search className="h-2.5 w-2.5 text-muted-foreground" />
          <span className="text-[8px] text-muted-foreground">Search prompts...</span>
        </div>
        {["Customer Reply", "Bug Report Template", "Meeting Recap"].map((p) => (
          <div key={p} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
            <Archive className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-medium flex-1">{p}</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
          </div>
        ))}
      </MockExtension>
    </div>
  );
}

function ComplianceMock() {
  const packs = [
    { name: "HIPAA", rules: 8, color: "bg-rose-500/10 text-rose-600", on: true },
    { name: "GDPR", rules: 6, color: "bg-blue-500/10 text-blue-600", on: true },
    { name: "PCI-DSS", rules: 7, color: "bg-amber-500/10 text-amber-600", on: false },
    { name: "SOC 2", rules: 9, color: "bg-violet-500/10 text-violet-600", on: true },
    { name: "CCPA", rules: 5, color: "bg-emerald-500/10 text-emerald-600", on: false },
    { name: "NIST 800-171", rules: 6, color: "bg-sky-500/10 text-sky-600", on: false },
  ];
  return (
    <MockBrowser>
      <div className="grid grid-cols-2 gap-2">
        {packs.map((p) => (
          <div key={p.name} className={cn("flex items-center gap-2 rounded-lg border p-2.5", p.on ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-border")}>
            <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", p.color)}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium truncate">{p.name}</p>
                {p.on && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
              </div>
              <p className="text-[9px] text-muted-foreground">{p.rules} rules</p>
            </div>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function AnalyticsMock() {
  return (
    <MockBrowser>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: "Interactions", val: "1,247" },
          { label: "Active Users", val: "23" },
          { label: "Blocks This Week", val: "15" },
          { label: "Avg Risk Score", val: "18" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border p-2">
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border p-3 mb-3">
        <p className="text-[10px] font-semibold mb-2">Daily Usage — Last 30 Days</p>
        <div className="h-12 flex items-end gap-[2px]">
          {[20,35,25,40,55,30,45,60,40,50,35,65,45,55,70,50,60,75,55,65,45,70,80,60,70,50,75,85,65,80].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-primary/30" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border p-2">
          <p className="text-[9px] font-semibold mb-1.5">Most Used Prompts</p>
          {["Customer Reply", "Meeting Summary", "Bug Report"].map((p, i) => (
            <div key={p} className="flex items-center justify-between py-1 text-[9px]">
              <span className="text-muted-foreground">{i+1}. {p}</span>
              <span className="font-medium tabular-nums">{[142,89,67][i]}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border p-2">
          <p className="text-[9px] font-semibold mb-1.5">Top Triggered Rules</p>
          {["SSN Pattern", "API Key", "Email PII"].map((p, i) => (
            <div key={p} className="flex items-center justify-between py-1 text-[9px]">
              <span className="text-muted-foreground">{p}</span>
              <span className={cn("font-medium text-[8px] px-1 rounded", i === 0 ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600")}>{["Block","Warn","Warn"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </MockBrowser>
  );
}

function ApprovalsMock() {
  return (
    <MockBrowser>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-semibold text-primary border-b-2 border-primary pb-1">Pending Prompts <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded-full ml-1">3</span></span>
        <span className="text-[10px] text-muted-foreground pb-1">Rule Suggestions <span className="bg-muted text-[8px] px-1.5 py-0.5 rounded-full ml-1">2</span></span>
      </div>
      {["New Onboarding Email", "API Integration Guide", "Quarterly Report Template"].map((p, i) => (
        <div key={p} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
          <div className="flex-1">
            <p className="text-[11px] font-medium">{p}</p>
            <p className="text-[8px] text-muted-foreground">Submitted by {["Sarah C.", "Mike T.", "Alex R."][i]} &middot; {["2h", "5h", "1d"][i]} ago</p>
          </div>
          <div className="flex gap-1.5">
            <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded cursor-pointer">Approve</span>
            <span className="text-[8px] font-semibold text-red-600 bg-red-500/10 px-2 py-1 rounded cursor-pointer">Reject</span>
          </div>
        </div>
      ))}
    </MockBrowser>
  );
}

function VersionDiffMock() {
  return (
    <MockBrowser>
      <div className="flex items-center gap-2 mb-3">
        <GitCompare className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-semibold">Version Diff — v3 vs v4</span>
      </div>
      <div className="rounded-lg border border-border overflow-hidden text-[10px] font-mono">
        <div className="bg-red-500/5 px-3 py-1.5 border-b border-border text-red-600">
          <span className="select-none mr-2 text-red-400">-</span>
          Summarize the meeting notes in <span className="bg-red-500/15 px-0.5 rounded">a brief paragraph</span>.
        </div>
        <div className="bg-emerald-500/5 px-3 py-1.5 border-b border-border text-emerald-600">
          <span className="select-none mr-2 text-emerald-400">+</span>
          Summarize the meeting notes in <span className="bg-emerald-500/15 px-0.5 rounded">3-5 bullet points with action items</span>.
        </div>
        <div className="px-3 py-1.5 text-muted-foreground">
          <span className="select-none mr-2">&nbsp;</span>
          Include names and deadlines where mentioned.
        </div>
        <div className="bg-emerald-500/5 px-3 py-1.5 text-emerald-600">
          <span className="select-none mr-2 text-emerald-400">+</span>
          <span className="bg-emerald-500/15 px-0.5 rounded">Flag any items that are overdue or at risk.</span>
        </div>
      </div>
    </MockBrowser>
  );
}

function AuditExportMock() {
  return (
    <MockBrowser>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">Analytics & Audit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Filter className="w-2.5 h-2.5" /> Last 30 Days</span>
          <div className="flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-semibold px-2 py-1 rounded">
            <Download className="w-2.5 h-2.5" /> Export
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 mb-3 flex items-center gap-2">
        <Shield className="w-3 h-3 text-blue-600 shrink-0" />
        <p className="text-[9px] text-blue-700"><span className="font-medium">Metadata-only mode:</span> Prompt text not recorded for privacy.</p>
      </div>
      <div className="space-y-1">
        {[
          { time: "2:34 PM", tool: "ChatGPT", action: "Sent", risk: 5 },
          { time: "2:31 PM", tool: "Claude", action: "Blocked", risk: 82 },
          { time: "1:15 PM", tool: "Gemini", action: "Warned", risk: 38 },
        ].map((l) => (
          <div key={l.time} className="flex items-center gap-2 py-1.5 text-[10px] border-b border-border/40 last:border-0">
            <span className="text-muted-foreground w-12">{l.time}</span>
            <span className="font-medium w-16">{l.tool}</span>
            <span className={cn("w-14 text-center text-[9px] font-semibold px-1.5 py-0.5 rounded",
              l.action === "Blocked" ? "bg-red-500/10 text-red-600" :
              l.action === "Warned" ? "bg-amber-500/10 text-amber-600" :
              "bg-emerald-500/10 text-emerald-600"
            )}>{l.action}</span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded tabular-nums ml-auto",
              l.risk >= 70 ? "bg-red-500/15 text-red-600" :
              l.risk >= 40 ? "bg-orange-500/15 text-orange-600" :
              "bg-emerald-500/15 text-emerald-600"
            )}>{l.risk}</span>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function TeamMock() {
  return (
    <MockBrowser>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold">Team Members</span>
        <span className="text-[9px] bg-primary text-white px-2 py-1 rounded font-medium">+ Invite</span>
      </div>
      {[
        { name: "Sarah Chen", role: "Admin", email: "sarah@acme.com", ext: "active" },
        { name: "Mike Torres", role: "Manager", email: "mike@acme.com", ext: "active" },
        { name: "Alex Rivera", role: "Member", email: "alex@acme.com", ext: "inactive" },
      ].map((m) => (
        <div key={m.name} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {m.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium">{m.name}</p>
            <p className="text-[8px] text-muted-foreground">{m.email}</p>
          </div>
          <span className={cn("text-[8px] font-semibold px-1.5 py-0.5 rounded",
            m.role === "Admin" ? "bg-primary/10 text-primary" :
            m.role === "Manager" ? "bg-amber-500/10 text-amber-600" :
            "bg-muted text-muted-foreground"
          )}>{m.role}</span>
          <div className={cn("w-2 h-2 rounded-full", m.ext === "active" ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
        </div>
      ))}
      <div className="mt-2 text-[9px] text-muted-foreground flex items-center gap-1">
        <Users className="w-3 h-3" /> 3 / 50 members &middot; Team plan
      </div>
    </MockBrowser>
  );
}

/* ── Main page ────────────────────────────────────────────── */

export default function PitchPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white pt-32 pb-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-4">
            The TeamPrompt Pitch
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Your team uses AI every day.
            <br />
            <span className="text-primary">Do you know what they&apos;re sharing?</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            TeamPrompt gives you real-time DLP scanning, a shared prompt library, risk scoring, compliance packs, and full audit trails — so your team can use AI freely without putting your data at risk.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-12 rounded-full font-semibold">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-base px-8 h-12 rounded-full font-semibold border-zinc-700 text-white hover:bg-zinc-800">
                See Pricing
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-500">
            <span>Works with ChatGPT, Claude, Gemini, Copilot & Perplexity</span>
          </div>
        </div>
      </section>

      {/* ── Feature 1: DLP / Sensitive Data Protection ── */}
      <FeatureSection
        label="Data Loss Prevention"
        headline="Stop sensitive data before it reaches AI."
        description="Every message your team sends to ChatGPT, Claude, or Gemini is scanned in real-time. Social security numbers, API keys, patient names, credit card numbers — TeamPrompt catches them all and blocks or auto-sanitizes before they leave the browser."
        bullets={[
          "15+ built-in detection patterns for PII, credentials, and secrets",
          "Auto-sanitize replaces data with safe placeholders like {{SSN}}",
          "Block or warn — you choose the severity per rule",
          "Custom rules with regex, exact match, or keyword patterns",
        ]}
      >
        <DLPMock />
      </FeatureSection>

      {/* ── Feature 2: Risk Scoring ── */}
      <FeatureSection
        label="Risk Scoring"
        headline="Every prompt gets a risk score, 0 to 100."
        description="Know exactly how risky your team's AI usage is. Each prompt is scored based on what sensitive data it contains — from routine (0-15) to severe (90-100). Spot patterns, identify high-risk users, and prove compliance with hard numbers."
        bullets={[
          "Color-coded risk badges on every audit log entry",
          "Average risk score and high/critical count at a glance",
          "Risk data included in CSV and JSON exports",
          "Scores factor in violation category, severity, and detection method",
        ]}
        reverse
      >
        <RiskScoreMock />
      </FeatureSection>

      {/* ── Feature 3: Compliance Packs ── */}
      <FeatureSection
        label="Compliance"
        headline="19 compliance frameworks. One click to deploy."
        description="HIPAA, GDPR, PCI-DSS, SOC 2, CCPA, NIST 800-171, FedRAMP — whatever your industry requires. Each pack installs pre-configured detection rules tuned for that framework. Customize anything after installation."
        bullets={[
          "Covers healthcare, finance, government, legal, education, and more",
          "Each pack maps to specific regulatory requirements",
          "Mix and match — install multiple packs simultaneously",
          "Extend any pack with your own organization-specific rules",
        ]}
        dark
      >
        <ComplianceMock />
      </FeatureSection>

      {/* ── Feature 4: Browser Extension ── */}
      <FeatureSection
        label="Browser Extension"
        headline="Works right where your team already uses AI."
        description="A lightweight browser extension that lives inside ChatGPT, Claude, Gemini, Copilot, and Perplexity. It scans outbound messages in real-time, lets users insert prompts from the vault, and shows a shield indicator so everyone knows they're protected."
        bullets={[
          "Side panel with search, favorites, and recent prompts",
          "Template variables auto-fill before insertion",
          "Shield indicator shows guardrail status and rule count",
          "Works on Chrome, Firefox, and Edge",
        ]}
        reverse
      >
        <ExtensionMock />
      </FeatureSection>

      {/* ── Feature 5: Prompt Library ── */}
      <FeatureSection
        label="Prompt Library"
        headline="Your team's best prompts, in one place."
        description="Stop rewriting the same prompts. Build a shared library that everyone can search, use, rate, and improve. Version history means nothing gets lost. Template variables make prompts reusable across contexts."
        bullets={[
          "Full-text search across titles, content, and tags",
          "Organize by folders and teams with color coding",
          "5-star ratings and usage tracking show what actually works",
          "Template system with {{variables}} for dynamic prompts",
          "Import/export as JSON for backup or migration",
        ]}
      >
        <VaultMock />
      </FeatureSection>

      {/* ── Feature 6: Approval Queue ── */}
      <FeatureSection
        label="Governance"
        headline="Nothing goes live without your say-so."
        description="New prompts enter a pending queue. Admins and managers review, approve, or reject with one click. Members can also suggest guardrail rules, which show up in the same unified queue."
        bullets={[
          "Unified queue for prompt approvals and rule suggestions",
          "Inline feedback when rejecting — authors know why",
          "Badge count in the sidebar so nothing slips through",
          "Create guardrail rules directly from suggestions",
        ]}
        reverse
        dark
      >
        <ApprovalsMock />
      </FeatureSection>

      {/* ── Feature 7: Analytics & Audit ── */}
      <FeatureSection
        label="Analytics & Audit"
        headline="Full audit trail. Exportable. Filterable."
        description="Every AI interaction is logged — which tool, what action, when, by whom, and with what risk score. Filter by date, tool, or action type. Export as CSV or JSON for compliance reporting. Choose metadata-only or full logging to balance privacy and oversight."
        bullets={[
          "CSV and JSON export with filters applied",
          "Metadata-only mode protects employee privacy by default",
          "Full logging mode captures prompt text for compliance",
          "Configurable retention — auto-delete after N days",
          "Risk scores on every entry for security analysis",
        ]}
      >
        <AuditExportMock />
      </FeatureSection>

      {/* ── Feature 8: Version Diff ── */}
      <FeatureSection
        label="Version History"
        headline="See exactly what changed, and when."
        description="Every prompt edit creates a new version. Compare any two versions side-by-side with color-coded diffs. Restore a previous version instantly if something goes wrong."
        bullets={[
          "Side-by-side diff with additions and deletions highlighted",
          "Full version timeline with timestamps and authors",
          "One-click restore to any previous version",
        ]}
        reverse
      >
        <VersionDiffMock />
      </FeatureSection>

      {/* ── Feature 9: Team Management ── */}
      <FeatureSection
        label="Teams & Roles"
        headline="The right access for every person."
        description="Admins, Managers, and Members — each with the right level of control. Invite via email, bulk CSV, or Google Workspace sync. Domain auto-join means new hires are in the right workspace automatically."
        bullets={[
          "Bulk CSV import with auto-team creation",
          "Google Workspace directory sync (Team+)",
          "Domain-based auto-join for zero-friction onboarding",
          "Custom welcome emails for new team members",
          "Extension status tracking — see who's protected",
          "Usage cap indicators show plan limits at a glance",
        ]}
        dark
      >
        <TeamMock />
      </FeatureSection>

      {/* ── Feature 10: Analytics Dashboard ── */}
      <FeatureSection
        label="Usage Analytics"
        headline="See how your team actually uses AI."
        description="30-day usage charts, top prompts by usage, per-member breakdowns, prompt effectiveness ratings, and guardrail activity — all in one dashboard. Spot adoption trends, identify power users, and prove ROI."
        bullets={[
          "Daily usage chart with week-over-week trends",
          "Top prompts ranked by usage and effectiveness",
          "Rating distribution and per-member activity breakdowns",
          "Guardrail activity: blocks, warnings, and top triggered rules",
        ]}
        reverse
      >
        <AnalyticsMock />
      </FeatureSection>

      {/* ── More features grid ── */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <SectionLabel>And there&apos;s more</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything else your team needs</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Quality Guidelines", desc: "Enforce prompt structure with do/don't lists, banned words, length constraints, and required tags. 14 built-in guidelines to start." },
              { icon: Bell, title: "Real-time Notifications", desc: "Security violations, prompt approvals, member joins, extension alerts — with bulk select, type filters, and mark-all-read." },
              { icon: Upload, title: "Import / Export", desc: "Import prompts from JSON or CSV. Export your library as named packs. Move prompts between organizations." },
              { icon: Braces, title: "Template Variables", desc: "Build reusable prompts with {{variable}} syntax. Users fill in values before insertion — consistent output every time." },
              { icon: Lock, title: "Two-Factor Authentication", desc: "Admins can require 2FA for all admins and managers. TOTP-based setup with recovery codes." },
              { icon: Settings, title: "Admin Security Controls", desc: "Toggle DLP on/off, enforce hard blocks, control logging mode, require extension sign-in, set log retention." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <CTASection
            headline="Ready to secure your team's AI usage?"
            gradientText="Start free. Upgrade when you're ready."
            subtitle="No credit card required. 14-day free trial on all paid plans. Your prompts, your data, your rules."
          />
        </div>
      </section>
    </>
  );
}
