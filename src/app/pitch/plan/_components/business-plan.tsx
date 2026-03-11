"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
  Target,
  BarChart3,
  Brain,
  Megaphone,
  HeadphonesIcon,
  Globe,
} from "lucide-react";

// ─── Proforma data (18 months) ──────────────────────────────────

const PROFORMA = [
  { month: "M1",  users: 1400,  teams: 90,   mrr: 13500,  arr: 162000 },
  { month: "M2",  users: 1650,  teams: 98,   mrr: 15500,  arr: 186000 },
  { month: "M3",  users: 1950,  teams: 108,  mrr: 18000,  arr: 216000 },
  { month: "M4",  users: 2300,  teams: 118,  mrr: 21000,  arr: 252000 },
  { month: "M5",  users: 2700,  teams: 130,  mrr: 25000,  arr: 300000 },
  { month: "M6",  users: 3100,  teams: 142,  mrr: 30000,  arr: 360000 },
  { month: "M7",  users: 3400,  teams: 152,  mrr: 34000,  arr: 408000 },
  { month: "M8",  users: 3700,  teams: 160,  mrr: 38000,  arr: 456000 },
  { month: "M9",  users: 4000,  teams: 168,  mrr: 42000,  arr: 504000 },
  { month: "M10", users: 4200,  teams: 174,  mrr: 47000,  arr: 564000 },
  { month: "M11", users: 4500,  teams: 182,  mrr: 53000,  arr: 636000 },
  { month: "M12", users: 4700,  teams: 188,  mrr: 58000,  arr: 696000 },
  { month: "M13", users: 4900,  teams: 192,  mrr: 62000,  arr: 744000 },
  { month: "M14", users: 5100,  teams: 195,  mrr: 66000,  arr: 792000 },
  { month: "M15", users: 5300,  teams: 197,  mrr: 69000,  arr: 828000 },
  { month: "M16", users: 5500,  teams: 198,  mrr: 71000,  arr: 852000 },
  { month: "M17", users: 5700,  teams: 199,  mrr: 73000,  arr: 876000 },
  { month: "M18", users: 6000,  teams: 200,  mrr: 75000,  arr: 900000 },
];

// ─── Monthly operating costs at scale tiers ─────────────────────

const COST_BREAKDOWN = {
  current: {
    label: "Current (~$12K MRR)",
    items: [
      { name: "Supabase Pro", cost: 25, category: "infra" },
      { name: "Vercel Pro", cost: 20, category: "infra" },
      { name: "Upstash Redis", cost: 0, category: "infra", note: "Free tier" },
      { name: "Resend", cost: 0, category: "infra", note: "Free tier" },
      { name: "Google Analytics", cost: 0, category: "infra", note: "Free" },
      { name: "LinkedIn Insight Tag", cost: 0, category: "infra", note: "Free" },
      { name: "Domain + DNS", cost: 2, category: "infra" },
      { name: "Stripe (2.9% + $0.30)", cost: 380, category: "payment" },
    ],
  },
  mid: {
    label: "Mid-Scale (~$40K MRR)",
    items: [
      { name: "Supabase Pro", cost: 50, category: "infra", note: "Storage overage" },
      { name: "Vercel Pro", cost: 20, category: "infra" },
      { name: "Upstash Redis", cost: 10, category: "infra" },
      { name: "Resend Pro", cost: 20, category: "infra" },
      { name: "Domain + DNS", cost: 2, category: "infra" },
      { name: "Stripe (2.9% + $0.30)", cost: 1260, category: "payment" },
      { name: "Part-Time Support", cost: 2500, category: "people" },
      { name: "Marketing / Ads", cost: 5000, category: "marketing" },
    ],
  },
  scale: {
    label: "At Scale (~$75K MRR)",
    items: [
      { name: "Supabase Pro", cost: 75, category: "infra", note: "Growth plan" },
      { name: "Vercel Pro", cost: 40, category: "infra" },
      { name: "Upstash Redis", cost: 20, category: "infra" },
      { name: "Resend Pro", cost: 20, category: "infra" },
      { name: "Domain + DNS", cost: 2, category: "infra" },
      { name: "Stripe (2.9% + $0.30)", cost: 2325, category: "payment" },
      { name: "Support Person (PT)", cost: 3500, category: "people" },
      { name: "Security Engineer (PT)", cost: 5000, category: "people" },
      { name: "Marketing / Ads", cost: 7500, category: "marketing" },
      { name: "AI Research Tools", cost: 500, category: "research" },
    ],
  },
};

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `$${n}`;
}

function fmtFull(n: number) {
  return `$${n.toLocaleString()}`;
}

function sumCosts(items: { cost: number }[]) {
  return items.reduce((a, b) => a + b.cost, 0);
}

// ─── Section wrapper ────────────────────────────────────────────

function Section({ id, title, subtitle, children, accent = "amber" }: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: "amber" | "blue" | "emerald" | "purple" | "red";
}) {
  const accentColor = {
    amber: "text-amber-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    red: "text-red-400",
  }[accent];

  return (
    <section id={id} className="py-16 border-b border-white/[0.04]">
      <div className="mb-8">
        <h2 className={cn("text-3xl sm:text-4xl font-black tracking-tight", accentColor)}>
          {title}
        </h2>
        {subtitle && <p className="text-base text-zinc-500 mt-2">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ─── Card ───────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl p-6 sm:p-8",
      "bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06]",
      className
    )}>
      {children}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function BusinessPlan() {
  const maxMrr = PROFORMA[PROFORMA.length - 1].mrr;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/pitch" className="text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-1.5">
                <Image src="/brand/logo-icon.svg" alt="TeamPrompt" width={24} height={24} />
              </div>
              <div>
                <p className="font-bold text-sm">TeamPrompt</p>
                <p className="text-xs text-zinc-500">Business Plan & Proforma</p>
              </div>
            </div>
          </div>
          <Link
            href="/pitch"
            className="text-xs text-zinc-500 hover:text-white border border-zinc-800 rounded-full px-4 py-1.5 transition-colors"
          >
            Back to Deck
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        {/* Hero */}
        <div className="py-16 space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400/80">
            Business Plan
          </p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
            18-Month Proforma<br />
            <span className="text-zinc-500">&amp; Growth Strategy</span>
          </h1>
          <p className="text-base text-zinc-400 max-w-2xl">
            Detailed financial projections, unit economics, cost structure, hiring plan,
            and strategy for scaling TeamPrompt from $12K to $75K MRR.
          </p>
        </div>

        {/* ═══════════════════════════════════════════
            SECTION 1: 18-MONTH PROFORMA
        ═══════════════════════════════════════════ */}
        <Section id="proforma" title="18-Month Revenue Proforma" subtitle="Conservative growth trajectory assuming funded marketing spend" accent="emerald">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Starting MRR", value: "$12K", sub: "Current" },
              { label: "Target MRR", value: "$75K", sub: "Month 18" },
              { label: "Target ARR", value: "$900K", sub: "Run rate" },
              { label: "Target Users", value: "6,000", sub: "Active" },
            ].map((s) => (
              <Card key={s.label}>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-black mt-1">{s.value}</p>
                <p className="text-xs text-emerald-400 mt-1">{s.sub}</p>
              </Card>
            ))}
          </div>

          {/* MRR Growth Chart */}
          <Card className="mb-8">
            <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500 mb-6">
              Monthly Recurring Revenue
            </h3>
            <div className="flex items-end gap-1.5 h-56">
              {PROFORMA.map((row, i) => (
                <div key={row.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-zinc-500 font-mono">{fmt(row.mrr)}</span>
                  <div
                    className={cn(
                      "w-full rounded-t transition-all",
                      i === PROFORMA.length - 1
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                        : i < 6
                          ? "bg-gradient-to-t from-blue-600/60 to-blue-400/60"
                          : "bg-gradient-to-t from-emerald-600/50 to-emerald-400/50"
                    )}
                    style={{ height: `${(row.mrr / maxMrr) * 100}%` }}
                  />
                  <span className={cn(
                    "text-xs font-mono",
                    i === PROFORMA.length - 1 ? "text-emerald-400 font-bold" : "text-zinc-600"
                  )}>
                    {row.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-6 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="h-2 w-6 rounded bg-gradient-to-r from-blue-600/60 to-blue-400/60" />
                Pre-funding trajectory
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-6 rounded bg-gradient-to-r from-emerald-600/50 to-emerald-400/50" />
                Funded growth
              </div>
            </div>
          </Card>

          {/* Full table */}
          <Card>
            <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500 mb-4">
              Detailed Projections
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Month</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Users</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Teams</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">MRR</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">ARR</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">MoM</th>
                  </tr>
                </thead>
                <tbody>
                  {PROFORMA.map((row, i) => {
                    const prevMrr = i > 0 ? PROFORMA[i - 1].mrr : 12000;
                    const mom = ((row.mrr - prevMrr) / prevMrr * 100).toFixed(0);
                    return (
                      <tr key={row.month} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-mono text-zinc-400">{row.month}</td>
                        <td className="text-right py-2.5 px-3 font-mono">{row.users.toLocaleString()}</td>
                        <td className="text-right py-2.5 px-3 font-mono">{row.teams}</td>
                        <td className="text-right py-2.5 px-3 font-mono text-emerald-400">{fmtFull(row.mrr)}</td>
                        <td className="text-right py-2.5 px-3 font-mono text-zinc-400">{fmtFull(row.arr)}</td>
                        <td className="text-right py-2.5 px-3 font-mono text-amber-400">+{mom}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 2: UNIT ECONOMICS
        ═══════════════════════════════════════════ */}
        <Section id="unit-economics" title="Unit Economics" subtitle="Revenue per user and cost to serve" accent="blue">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold mb-6">Revenue Per Customer</h3>
              <div className="space-y-4">
                {[
                  { metric: "Avg Revenue Per User", value: "$8.50/mo", note: "Blended across tiers" },
                  { metric: "Avg Team Size", value: "7 seats", note: "Team & Business plans" },
                  { metric: "Avg Contract Value", value: "$59.50/mo", note: "Per paying team" },
                  { metric: "Annual Contract Value", value: "$714/yr", note: "Per paying team" },
                  { metric: "Customer Lifetime", value: "36+ months", note: "<2% monthly churn" },
                  { metric: "LTV Per Team", value: "$2,142", note: "ACV × 3yr lifetime" },
                ].map((row) => (
                  <div key={row.metric} className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">{row.metric}</p>
                      <p className="text-xs text-zinc-600">{row.note}</p>
                    </div>
                    <p className="text-lg font-bold font-mono">{row.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-6">Acquisition Economics</h3>
              <div className="space-y-4">
                {[
                  { metric: "CAC (Current)", value: "$0", note: "100% organic, Chrome Store + WOM" },
                  { metric: "CAC (Funded)", value: "~$150", note: "Projected with paid marketing" },
                  { metric: "LTV : CAC", value: "14:1", note: "Current (infinite with $0 CAC)" },
                  { metric: "LTV : CAC (Funded)", value: "~14:1", note: "$2,142 LTV / $150 CAC" },
                  { metric: "Payback Period", value: "<3 months", note: "$150 CAC / $59.50 MRR" },
                  { metric: "Free → Paid Rate", value: "25%", note: "Conversion from free tier" },
                ].map((row) => (
                  <div key={row.metric} className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">{row.metric}</p>
                      <p className="text-xs text-zinc-600">{row.note}</p>
                    </div>
                    <p className="text-lg font-bold font-mono">{row.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 3: FULL COST STRUCTURE
        ═══════════════════════════════════════════ */}
        <Section id="costs" title="Cost Structure" subtitle="All infrastructure, payment processing, people, and operational costs" accent="amber">
          <div className="grid sm:grid-cols-3 gap-6">
            {(["current", "mid", "scale"] as const).map((tier) => {
              const data = COST_BREAKDOWN[tier];
              const total = sumCosts(data.items);
              const revenue = tier === "current" ? 12000 : tier === "mid" ? 40000 : 75000;
              const margin = ((1 - total / revenue) * 100).toFixed(0);

              return (
                <Card key={tier}>
                  <h3 className="font-bold text-sm mb-1">{data.label}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <p className="text-2xl font-black text-amber-400">{fmtFull(total)}/mo</p>
                    <p className="text-xs text-emerald-400">({margin}% margin)</p>
                  </div>

                  <div className="space-y-2">
                    {data.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item.category === "infra" ? "bg-blue-400" :
                            item.category === "payment" ? "bg-amber-400" :
                            item.category === "people" ? "bg-purple-400" :
                            item.category === "marketing" ? "bg-emerald-400" :
                            "bg-zinc-400"
                          )} />
                          <span className="text-zinc-400">{item.name}</span>
                        </div>
                        <span className="font-mono text-zinc-300">
                          {item.cost === 0 ? "Free" : fmtFull(item.cost)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Revenue</span>
                    <span className="font-mono font-bold">{fmtFull(revenue)}/mo</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Category legend */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-zinc-500">
            {[
              { color: "bg-blue-400", label: "Infrastructure" },
              { color: "bg-amber-400", label: "Payment Processing" },
              { color: "bg-purple-400", label: "People" },
              { color: "bg-emerald-400", label: "Marketing" },
              { color: "bg-zinc-400", label: "Research" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", c.color)} />
                {c.label}
              </div>
            ))}
          </div>

          {/* Gross margin note */}
          <Card className="mt-8">
            <div className="flex items-start gap-4">
              <DollarSign className="h-6 w-6 text-emerald-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-2">Gross Margin: 96–97%</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  TeamPrompt has near-zero marginal cost per user. The product stores text data (prompts) in Postgres,
                  the browser extension runs client-side, and there are no server-side AI API costs.
                  The primary cost at scale is Stripe&apos;s transaction fee (2.9% + $0.30) which is unavoidable
                  with any payment processor. Infrastructure costs remain under $200/mo even at 6,000 users.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 4: HIRING PLAN
        ═══════════════════════════════════════════ */}
        <Section id="hiring" title="Hiring Plan" subtitle="Lean team. Hire only when revenue justifies it." accent="purple">
          <div className="space-y-6">
            {[
              {
                role: "Part-Time Support Person",
                when: "Month 3–4 (~$20K MRR)",
                cost: "$2,500–3,500/mo",
                why: "Handle growing ticket volume, onboarding calls, and documentation. Free up founder time for product and growth.",
                icon: HeadphonesIcon,
              },
              {
                role: "Part-Time Security Engineer",
                when: "Month 6–8 (~$35K MRR)",
                cost: "$4,000–5,000/mo",
                why: "Enterprise features: SSO/SAML, SCIM provisioning, SOC 2 certification prep. Unlocks $12/seat Business tier for larger organizations.",
                icon: Shield,
              },
              {
                role: "Marketing Contractor",
                when: "Month 4–6 (~$25K MRR)",
                cost: "$3,000–5,000/mo",
                why: "Content marketing, LinkedIn campaigns, case studies, and SEO. Transition from pure organic to funded acquisition.",
                icon: Megaphone,
              },
            ].map((hire) => (
              <Card key={hire.role}>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <hire.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <h4 className="font-bold">{hire.role}</h4>
                      <span className="text-xs text-purple-400 font-mono">{hire.cost}</span>
                    </div>
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">{hire.when}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{hire.why}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <h4 className="font-bold mb-4">Monthly People Costs Over Time</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Phase</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">MRR</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">People Cost</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { phase: "M1–3 (Solo)", mrr: "$13–18K", cost: "$0", pct: "0%" },
                    { phase: "M4–6 (Support + Marketing)", mrr: "$21–30K", cost: "$5,500", pct: "18–26%" },
                    { phase: "M7–12 (+ Security Eng)", mrr: "$34–58K", cost: "$11,500", pct: "20–34%" },
                    { phase: "M13–18 (Full team)", mrr: "$62–75K", cost: "$12,000", pct: "16–19%" },
                  ].map((row) => (
                    <tr key={row.phase} className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-zinc-400">{row.phase}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-emerald-400">{row.mrr}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-purple-400">{row.cost}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-400">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 5: MARKETING STRATEGY
        ═══════════════════════════════════════════ */}
        <Section id="marketing" title="Marketing & Growth Strategy" subtitle="From organic discovery to funded acquisition" accent="emerald">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-emerald-400" />
                <h4 className="font-bold">Organic (Current — $0 spend)</h4>
              </div>
              <div className="space-y-3">
                {[
                  "Chrome Web Store discovery (4.8★ rating, 500+ reviews)",
                  "Word-of-mouth from existing teams",
                  "SEO blog content (AI governance, prompt engineering)",
                  "Product-led growth: free tier → team adoption → org upgrade",
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-zinc-400">
                    <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-1" />
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="h-5 w-5 text-amber-400" />
                <h4 className="font-bold">Paid (Funded — $5–7.5K/mo)</h4>
              </div>
              <div className="space-y-3">
                {[
                  "LinkedIn Ads targeting IT leaders, compliance officers, legal teams",
                  "Google Ads for high-intent keywords (\"AI prompt management\", \"ChatGPT for teams\")",
                  "Retargeting website visitors and free-tier users",
                  "Case study content amplification (legal, healthcare, finance)",
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-zinc-400">
                    <Target className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-1" />
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <h4 className="font-bold mb-4">Growth Funnel</h4>
            <div className="space-y-3">
              {[
                { stage: "Awareness", channel: "LinkedIn Ads + SEO + Chrome Store", metric: "50K impressions/mo", width: "100%" },
                { stage: "Visit", channel: "Landing page + pricing", metric: "5,000 visits/mo", width: "70%" },
                { stage: "Sign Up", channel: "Free tier", metric: "500 signups/mo", width: "45%" },
                { stage: "Activate", channel: "Extension install + first prompt", metric: "250 activated/mo", width: "30%" },
                { stage: "Convert", channel: "Team adoption → paid upgrade", metric: "15 teams/mo", width: "15%" },
              ].map((s) => (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-zinc-300 font-medium">{s.stage}</span>
                    <span className="text-xs text-zinc-500">{s.metric}</span>
                  </div>
                  <div className="h-6 rounded bg-white/[0.03] overflow-hidden">
                    <div
                      className="h-full rounded bg-gradient-to-r from-emerald-600/40 to-emerald-400/40 flex items-center px-3"
                      style={{ width: s.width }}
                    >
                      <span className="text-xs text-zinc-400 truncate">{s.channel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 6: AI STRATEGY — STAYING CUTTING EDGE
        ═══════════════════════════════════════════ */}
        <Section id="ai-strategy" title="AI Strategy" subtitle="How we stay ahead as the AI landscape evolves" accent="blue">
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Platform Agnostic by Design",
                desc: "TeamPrompt integrates with ChatGPT, Claude, Gemini, Copilot, and Perplexity — not dependent on any single AI vendor. As new AI tools emerge, we add support. Our value is the governance layer, not the model underneath.",
                icon: Globe,
              },
              {
                title: "Extension-First Architecture",
                desc: "The browser extension gives us a unique vantage point — we see how teams actually use AI across every platform. This data informs product decisions and helps us stay ahead of workflow changes each AI tool makes.",
                icon: Zap,
              },
              {
                title: "Rapid Platform Adaptation",
                desc: "When AI tools update their interfaces (which happens weekly), we ship compatibility updates within days. Our WXT-based extension framework supports Chrome, Firefox, and Edge simultaneously. This responsiveness is a competitive moat.",
                icon: TrendingUp,
              },
              {
                title: "AI-Powered Features Roadmap",
                desc: "Future product features include: prompt quality scoring, AI-suggested improvements, automatic compliance checking, and smart prompt recommendations. These use AI to improve AI governance — a compounding advantage.",
                icon: Brain,
              },
            ].map((item) => (
              <Card key={item.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h4 className="font-bold">{item.title}</h4>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <h4 className="font-bold mb-4">AI Landscape Risk Mitigation</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Scenario</th>
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Risk</th>
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Our Response</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      scenario: "ChatGPT adds prompt library",
                      risk: "Medium",
                      response: "Single-platform only. We're cross-platform + DLP + compliance. Different value prop.",
                    },
                    {
                      scenario: "New dominant AI tool emerges",
                      risk: "Low",
                      response: "We add support in days. More AI tools = more need for cross-platform governance.",
                    },
                    {
                      scenario: "AI tools become commoditized",
                      risk: "Low",
                      response: "Commoditization increases multi-tool usage, strengthening our position as the unifying layer.",
                    },
                    {
                      scenario: "Enterprise builds in-house",
                      risk: "Low",
                      response: "5-platform DOM integration + compliance packs = 6+ months build time. We're cheaper and faster.",
                    },
                    {
                      scenario: "Browser extension restrictions",
                      risk: "Medium",
                      response: "MV3 compliant on all browsers. API-based integrations as fallback for enterprise.",
                    },
                  ].map((row) => (
                    <tr key={row.scenario} className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-zinc-300">{row.scenario}</td>
                      <td className="py-2.5 px-3">
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded",
                          row.risk === "Low" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        )}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sm text-zinc-400">{row.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 7: USE OF FUNDS DETAILED
        ═══════════════════════════════════════════ */}
        <Section id="use-of-funds" title="Use of Funds — $100K" subtitle="Detailed allocation with Louisiana LEB 25% investor tax credit" accent="amber">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-bold mb-6">Allocation Breakdown</h4>
              <div className="space-y-5">
                {[
                  {
                    category: "Marketing & Customer Acquisition",
                    amount: 50000,
                    pct: "50%",
                    color: "from-emerald-500 to-emerald-400",
                    details: "LinkedIn Ads, Google Ads, content marketing, case studies, conference attendance",
                  },
                  {
                    category: "Enterprise Features & Security",
                    amount: 25000,
                    pct: "25%",
                    color: "from-blue-500 to-blue-400",
                    details: "Security engineer (PT), SSO/SAML, SCIM, SOC 2 prep, compliance certifications",
                  },
                  {
                    category: "Engineering & Infrastructure",
                    amount: 15000,
                    pct: "15%",
                    color: "from-purple-500 to-purple-400",
                    details: "Infrastructure scaling, monitoring tools, AI research tools, testing infrastructure",
                  },
                  {
                    category: "Operations & Tools",
                    amount: 10000,
                    pct: "10%",
                    color: "from-amber-500 to-amber-400",
                    details: "Legal, accounting, business tools, support tooling, documentation",
                  },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex items-baseline justify-between text-sm mb-1">
                      <span className="text-zinc-300 font-medium">{item.category}</span>
                      <span className="font-mono text-zinc-400">{fmtFull(item.amount)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/[0.03] overflow-hidden mb-1">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r", item.color)}
                        style={{ width: item.pct }}
                      />
                    </div>
                    <p className="text-xs text-zinc-600">{item.details}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                  </div>
                  <h4 className="font-bold">Louisiana LEB Tax Credit</h4>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400">
                    TeamPrompt qualifies for the Louisiana Economic Development program.
                    Investors receive a 25% state tax credit on their investment.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-zinc-500">Investment</span>
                      <span className="text-lg font-black font-mono">$100,000</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-zinc-500">Tax credit (25%)</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">−$25,000</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                      <span className="text-sm text-amber-400 font-bold">Effective cost</span>
                      <span className="text-2xl font-black text-amber-400 font-mono">$75,000</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="font-bold mb-4">Runway Analysis</h4>
                <div className="space-y-3">
                  {[
                    { metric: "Monthly burn (M1–3)", value: "$3,000", note: "Solo + marketing ramp" },
                    { metric: "Monthly burn (M4–6)", value: "$8,500", note: "+ Support + marketing" },
                    { metric: "Monthly burn (M7–12)", value: "$14,000", note: "+ Security engineer" },
                    { metric: "Cash-flow positive", value: "Month 8–10", note: "Revenue > expenses" },
                    { metric: "Total runway", value: "12–18 months", note: "Conservative" },
                  ].map((row) => (
                    <div key={row.metric} className="flex items-baseline justify-between">
                      <div>
                        <p className="text-sm text-zinc-300">{row.metric}</p>
                        <p className="text-xs text-zinc-600">{row.note}</p>
                      </div>
                      <p className="font-bold font-mono text-sm">{row.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 8: PATH TO PROFITABILITY
        ═══════════════════════════════════════════ */}
        <Section id="profitability" title="Path to Profitability" subtitle="From $100K investment to self-sustaining business" accent="emerald">
          <Card>
            <div className="space-y-6">
              {[
                {
                  phase: "Phase 1: Foundation",
                  months: "Month 1–3",
                  mrr: "$13K → $18K",
                  focus: "Set up marketing infrastructure, start LinkedIn/Google ad campaigns, hire support person, optimize conversion funnel",
                  milestone: "$18K MRR, marketing engine running",
                },
                {
                  phase: "Phase 2: Accelerate",
                  months: "Month 4–6",
                  mrr: "$21K → $30K",
                  focus: "Scale paid acquisition, publish case studies, begin enterprise feature development (SSO/SAML), hire security engineer",
                  milestone: "$30K MRR, enterprise features in beta",
                },
                {
                  phase: "Phase 3: Scale",
                  months: "Month 7–12",
                  mrr: "$34K → $58K",
                  focus: "Launch Business tier with enterprise features, SOC 2 compliance, expand to larger teams, refine marketing spend",
                  milestone: "$58K MRR, cash-flow positive",
                },
                {
                  phase: "Phase 4: Position for Seed",
                  months: "Month 13–18",
                  mrr: "$62K → $75K",
                  focus: "Hit $900K ARR run rate, build case for seed round, explore strategic partnerships, expand internationally",
                  milestone: "$75K MRR / $900K ARR — seed round ready",
                },
              ].map((p, i) => (
                <div key={p.phase} className={cn(
                  "flex gap-6",
                  i < 3 && "pb-6 border-b border-white/5"
                )}>
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {i + 1}
                    </div>
                    {i < 3 && <div className="flex-1 w-px bg-white/5 mt-2" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-1">
                      <h4 className="font-bold">{p.phase}</h4>
                      <span className="text-xs text-zinc-500 font-mono">{p.months}</span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">{p.mrr}</span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-2">{p.focus}</p>
                    <p className="text-xs text-amber-400 font-medium">Milestone: {p.milestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Footer */}
        <div className="py-16 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white rounded-lg p-1.5">
              <Image src="/brand/logo-icon.svg" alt="TeamPrompt" width={28} height={28} />
            </div>
            <div className="text-left">
              <p className="font-bold">TeamPrompt</p>
              <p className="text-xs text-zinc-500">teamprompt.app</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600">
            Confidential. Prepared March 2026.
          </p>
          <Link
            href="/pitch"
            className="inline-block text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            ← Back to Pitch Deck
          </Link>
        </div>
      </div>
    </div>
  );
}
