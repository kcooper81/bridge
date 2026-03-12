"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Shield,
  Zap,

  BarChart3,
  Brain,
  Megaphone,
  HeadphonesIcon,
  Globe,
  Copy,
  Check,
} from "lucide-react";

// ─── Proforma data (18 months) — two scenarios ─────────────────
// Stripe fees = 3.5% of MRR (2.9% + $0.30 blended)
// Opex = infra ($50-200) + people + marketing (funded only)

// Organic-only: no paid marketing, no marketing contractor, no hires until M9
// Growth: ~5% MoM slowing to ~3% (SEO + Chrome Store + WOM only)
// People: PT support M9+ ($2,000) — no security eng or mktg contractor
const PROFORMA_ORGANIC = [
  { month: "M1",  mrr: 13500,  opex: 500,   adSpend: 0, stripe: 473 },
  { month: "M2",  mrr: 14200,  opex: 500,   adSpend: 0, stripe: 497 },
  { month: "M3",  mrr: 14900,  opex: 500,   adSpend: 0, stripe: 522 },
  { month: "M4",  mrr: 15600,  opex: 500,   adSpend: 0, stripe: 546 },
  { month: "M5",  mrr: 16300,  opex: 500,   adSpend: 0, stripe: 571 },
  { month: "M6",  mrr: 17000,  opex: 500,   adSpend: 0, stripe: 595 },
  { month: "M7",  mrr: 17700,  opex: 500,   adSpend: 0, stripe: 620 },
  { month: "M8",  mrr: 18400,  opex: 500,   adSpend: 0, stripe: 644 },
  { month: "M9",  mrr: 19100,  opex: 2500,  adSpend: 0, stripe: 669 },
  { month: "M10", mrr: 19800,  opex: 2500,  adSpend: 0, stripe: 693 },
  { month: "M11", mrr: 20500,  opex: 2500,  adSpend: 0, stripe: 718 },
  { month: "M12", mrr: 21200,  opex: 2500,  adSpend: 0, stripe: 742 },
  { month: "M13", mrr: 21900,  opex: 2500,  adSpend: 0, stripe: 767 },
  { month: "M14", mrr: 22600,  opex: 2500,  adSpend: 0, stripe: 791 },
  { month: "M15", mrr: 23300,  opex: 2500,  adSpend: 0, stripe: 816 },
  { month: "M16", mrr: 24000,  opex: 2500,  adSpend: 0, stripe: 840 },
  { month: "M17", mrr: 24700,  opex: 2500,  adSpend: 0, stripe: 865 },
  { month: "M18", mrr: 25500,  opex: 2500,  adSpend: 0, stripe: 893 },
];

// With paid marketing: ad spend + marketing contractor accelerate acquisition
// Growth: ~10-15% MoM (M3-5) as ads ramp, moderating to 3-5% by M13+
// People: marketing contractor M2+ ($3,500), support M4+ ($2,500),
//         security engineer M7+ ($4,500)
// Ad spend: M2 $2K → M6 $5.5K → M7+ $6-7K (LinkedIn, Google, retargeting)
// opex = infra + people (excludes ad spend); adSpend shown separately
const PROFORMA_FUNDED = [
  { month: "M1",  mrr: 13500,  opex: 2000,   adSpend: 0,    stripe: 473 },
  { month: "M2",  mrr: 14800,  opex: 5500,   adSpend: 2000, stripe: 518 },
  { month: "M3",  mrr: 17000,  opex: 5500,   adSpend: 3500, stripe: 595 },
  { month: "M4",  mrr: 19500,  opex: 8000,   adSpend: 4500, stripe: 683 },
  { month: "M5",  mrr: 22000,  opex: 8000,   adSpend: 5000, stripe: 770 },
  { month: "M6",  mrr: 24500,  opex: 8000,   adSpend: 5500, stripe: 858 },
  { month: "M7",  mrr: 27000,  opex: 13000,  adSpend: 6000, stripe: 945 },
  { month: "M8",  mrr: 29500,  opex: 13000,  adSpend: 6500, stripe: 1033 },
  { month: "M9",  mrr: 32000,  opex: 13000,  adSpend: 7000, stripe: 1120 },
  { month: "M10", mrr: 34500,  opex: 13500,  adSpend: 7000, stripe: 1208 },
  { month: "M11", mrr: 37000,  opex: 13500,  adSpend: 7000, stripe: 1295 },
  { month: "M12", mrr: 39000,  opex: 14000,  adSpend: 7000, stripe: 1365 },
  { month: "M13", mrr: 41000,  opex: 14000,  adSpend: 7000, stripe: 1435 },
  { month: "M14", mrr: 43000,  opex: 14000,  adSpend: 7000, stripe: 1505 },
  { month: "M15", mrr: 45000,  opex: 14000,  adSpend: 7000, stripe: 1575 },
  { month: "M16", mrr: 47000,  opex: 14000,  adSpend: 7000, stripe: 1645 },
  { month: "M17", mrr: 48500,  opex: 14000,  adSpend: 7000, stripe: 1698 },
  { month: "M18", mrr: 50000,  opex: 14000,  adSpend: 7000, stripe: 1750 },
];

// ─── Monthly operating costs at scale tiers ─────────────────────

const COST_BREAKDOWN = {
  current: {
    label: "Current (~$13.5K MRR)",
    items: [
      { name: "Supabase Pro", cost: 25, note: "" },
      { name: "Vercel Pro", cost: 20, note: "" },
      { name: "Upstash Redis", cost: 0, note: "Free tier" },
      { name: "Resend", cost: 0, note: "Free tier" },
      { name: "Google Analytics", cost: 0, note: "Free" },
      { name: "LinkedIn Insight Tag", cost: 0, note: "Free" },
      { name: "Domain + DNS", cost: 2, note: "" },
      { name: "Stripe (3.5%)", cost: 473, note: "$13,500 x 3.5%" },
    ],
  },
  mid: {
    label: "Mid-Scale (~$30K MRR)",
    items: [
      { name: "Supabase Pro", cost: 35, note: "Storage overage" },
      { name: "Vercel Pro", cost: 20, note: "" },
      { name: "Upstash Redis", cost: 10, note: "" },
      { name: "Domain + DNS", cost: 2, note: "" },
      { name: "Stripe (3.5%)", cost: 1050, note: "$30,000 x 3.5%" },
      { name: "Support Person (PT)", cost: 2500, note: "" },
      { name: "Security Engineer (PT)", cost: 4500, note: "" },
      { name: "Marketing Contractor", cost: 3500, note: "" },
      { name: "Ad Spend", cost: 6500, note: "" },
    ],
  },
  scale: {
    label: "At Scale (~$50K MRR)",
    items: [
      { name: "Supabase Pro", cost: 75, note: "Growth plan" },
      { name: "Vercel Pro", cost: 40, note: "" },
      { name: "Upstash Redis", cost: 20, note: "" },
      { name: "Resend Pro", cost: 20, note: "" },
      { name: "Domain + DNS", cost: 2, note: "" },
      { name: "Stripe (3.5%)", cost: 1750, note: "$50,000 x 3.5%" },
      { name: "Support Person (PT)", cost: 2500, note: "" },
      { name: "Security Engineer (PT)", cost: 4500, note: "" },
      { name: "Marketing Contractor", cost: 3500, note: "" },
      { name: "Ad Spend", cost: 7000, note: "" },
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

function Section({ id, title, subtitle, children }: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-16 border-b border-zinc-200">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-500 mt-2">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ─── Card ───────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl p-6 sm:p-8 bg-white border border-zinc-200 shadow-sm", className)}>
      {children}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function BusinessPlan({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);
  const maxMrr = PROFORMA_FUNDED[PROFORMA_FUNDED.length - 1].mrr;

  function handleCopyLink() {
    const url = `${window.location.origin}/pitch/plan?share=${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function getBackHref() {
    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const share = params.get("share");
      if (share) return `/pitch?share=${share}`;
    }
    return "/pitch";
  }

  // Compute cumulative net for both scenarios
  let cumOrg = 0;
  const organicRows = PROFORMA_ORGANIC.map((row) => {
    const net = row.mrr - row.opex - row.adSpend - row.stripe;
    cumOrg += net;
    return { ...row, net, cumulative: cumOrg };
  });

  let cumFund = 0;
  const fundedRows = PROFORMA_FUNDED.map((row) => {
    const net = row.mrr - row.opex - row.adSpend - row.stripe;
    cumFund += net;
    return { ...row, net, cumulative: cumFund };
  });

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-zinc-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={getBackHref()} className="text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
              <div>
                <p className="font-bold text-sm text-zinc-900">TeamPrompt</p>
                <p className="text-xs text-zinc-500">Business Plan &amp; Proforma</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {shareToken && (
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-full px-4 py-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-blue-600">Link copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Investor Link
                  </>
                )}
              </button>
            )}
            <Link
              href={getBackHref()}
              className="text-xs text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-full px-4 py-1.5 transition-colors"
            >
              Back to Deck
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        {/* Hero */}
        <div className="py-16 space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
            Business Plan
          </p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight text-zinc-900">
            18-Month Proforma<br />
            <span className="text-zinc-500">&amp; Growth Strategy</span>
          </h1>
          <p className="text-base text-zinc-600 max-w-2xl">
            Detailed financial projections, unit economics, cost structure, hiring plan,
            and strategy for scaling TeamPrompt from $13.5K to $50K MRR.
          </p>
        </div>

        {/* ═══════════════════════════════════════════
            SECTION 1: 18-MONTH PROFORMA
        ═══════════════════════════════════════════ */}
        <Section id="proforma" title="18-Month Revenue Proforma" subtitle="Two scenarios: organic growth vs. funded growth with paid marketing">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Starting MRR", value: "$13.5K", sub: "Current" },
              { label: "Organic M18", value: fmt(organicRows[organicRows.length - 1].mrr), sub: "$306K ARR" },
              { label: "Funded M18", value: fmt(fundedRows[fundedRows.length - 1].mrr), sub: "$600K ARR" },
              { label: "M18 Net (Funded)", value: fmt(fundedRows[fundedRows.length - 1].net), sub: "/month" },
            ].map((s) => (
              <Card key={s.label}>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-black mt-1 text-zinc-900">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.sub}</p>
              </Card>
            ))}
          </div>

          {/* MRR Growth Chart — dual line */}
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500">
                Monthly Recurring Revenue
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-blue-600 inline-block" />
                  <span className="text-zinc-600">With Paid Ads</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-zinc-400 inline-block" />
                  <span className="text-zinc-500">Organic Only</span>
                </span>
              </div>
            </div>
            {(() => {
              const W = 800;
              const H = 280;
              const PAD = { top: 30, right: 20, bottom: 40, left: 60 };
              const cW = W - PAD.left - PAD.right;
              const cH = H - PAD.top - PAD.bottom;
              const n = PROFORMA_FUNDED.length;
              const yMax = maxMrr;
              const yTicks = [0, 10000, 20000, 30000, 40000, 50000];

              function x(i: number) { return PAD.left + (i / (n - 1)) * cW; }
              function y(v: number) { return PAD.top + cH - (v / yMax) * cH; }

              const fundedLine = PROFORMA_FUNDED.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r.mrr).toFixed(1)}`).join(" ");
              const organicLine = PROFORMA_ORGANIC.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r.mrr).toFixed(1)}`).join(" ");
              // Fill area between lines
              const areaPath = [
                ...PROFORMA_FUNDED.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r.mrr).toFixed(1)}`),
                ...PROFORMA_ORGANIC.slice().reverse().map((r, i) => `L${x(n - 1 - i).toFixed(1)},${y(r.mrr).toFixed(1)}`),
                "Z",
              ].join(" ");

              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                  {/* Y-axis grid lines & labels */}
                  {yTicks.map((tick) => (
                    <g key={tick}>
                      <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#e4e4e7" strokeWidth={1} />
                      <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-zinc-400 text-[11px] font-mono">
                        {fmt(tick)}
                      </text>
                    </g>
                  ))}
                  {/* X-axis labels */}
                  {PROFORMA_FUNDED.map((r, i) => (
                    <text key={r.month} x={x(i)} y={H - 8} textAnchor="middle" className={cn("text-[11px] font-mono", i === n - 1 ? "fill-blue-600 font-bold" : "fill-zinc-400")}>
                      {r.month}
                    </text>
                  ))}
                  {/* Shaded area between lines */}
                  <path d={areaPath} fill="#2563eb" fillOpacity={0.06} />
                  {/* Organic line */}
                  <path d={organicLine} fill="none" stroke="#a1a1aa" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {/* Funded line */}
                  <path d={fundedLine} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {/* End dots */}
                  <circle cx={x(n - 1)} cy={y(PROFORMA_FUNDED[n - 1].mrr)} r={5} fill="#2563eb" />
                  <circle cx={x(n - 1)} cy={y(PROFORMA_ORGANIC[n - 1].mrr)} r={5} fill="#a1a1aa" />
                  {/* End labels */}
                  <text x={x(n - 1) - 8} y={y(PROFORMA_FUNDED[n - 1].mrr) - 10} textAnchor="end" className="fill-blue-600 text-[12px] font-mono font-bold">
                    {fmt(PROFORMA_FUNDED[n - 1].mrr)}
                  </text>
                  <text x={x(n - 1) - 8} y={y(PROFORMA_ORGANIC[n - 1].mrr) - 10} textAnchor="end" className="fill-zinc-500 text-[12px] font-mono font-bold">
                    {fmt(PROFORMA_ORGANIC[n - 1].mrr)}
                  </text>
                </svg>
              );
            })()}
          </Card>

          {/* Full table with operating costs — WITH paid ads */}
          <Card className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500">
                Detailed Projections — With Paid Ads
              </h3>
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded">Funded</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Month</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">MRR</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Opex</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Ad Spend</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Stripe</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Net Income</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {fundedRows.map((row) => (
                    <tr key={row.month} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{row.month}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-900">{fmtFull(row.mrr)}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-600">{fmtFull(row.opex)}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-blue-600">{row.adSpend > 0 ? fmtFull(row.adSpend) : "—"}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-500">{fmtFull(row.stripe)}</td>
                      <td className={cn(
                        "text-right py-2.5 px-3 font-mono",
                        row.net >= 0 ? "text-emerald-600" : "text-zinc-500"
                      )}>
                        {row.net >= 0 ? "+" : ""}{fmtFull(row.net)}
                      </td>
                      <td className={cn(
                        "text-right py-2.5 px-3 font-mono",
                        row.cumulative >= 0 ? "text-emerald-600" : "text-zinc-500"
                      )}>
                        {row.cumulative >= 0 ? "+" : ""}{fmtFull(row.cumulative)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Full table — WITHOUT paid ads (organic only) */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500">
                Detailed Projections — Organic Only
              </h3>
              <span className="text-xs bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded">No Ads</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Month</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">MRR</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Opex</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Ad Spend</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Stripe</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Net Income</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {organicRows.map((row) => (
                    <tr key={row.month} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-2.5 px-3 font-mono text-zinc-600">{row.month}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-900">{fmtFull(row.mrr)}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-600">{fmtFull(row.opex)}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-400">—</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-500">{fmtFull(row.stripe)}</td>
                      <td className={cn(
                        "text-right py-2.5 px-3 font-mono",
                        row.net >= 0 ? "text-emerald-600" : "text-zinc-500"
                      )}>
                        {row.net >= 0 ? "+" : ""}{fmtFull(row.net)}
                      </td>
                      <td className={cn(
                        "text-right py-2.5 px-3 font-mono",
                        row.cumulative >= 0 ? "text-emerald-600" : "text-zinc-500"
                      )}>
                        {row.cumulative >= 0 ? "+" : ""}{fmtFull(row.cumulative)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 2: UNIT ECONOMICS
        ═══════════════════════════════════════════ */}
        <Section id="unit-economics" title="Unit Economics" subtitle="Revenue per user and cost to serve">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold mb-6 text-zinc-900">Revenue Per Customer</h3>
              <div className="space-y-4">
                {[
                  { metric: "Avg Revenue Per User", value: "$8.50/mo", note: "Blended across tiers" },
                  { metric: "Avg Team Size", value: "7 seats", note: "Team & Business plans" },
                  { metric: "Avg Contract Value", value: "$59.50/mo", note: "Per paying team" },
                  { metric: "Annual Contract Value", value: "$714/yr", note: "Per paying team" },
                  { metric: "Customer Lifetime", value: "36+ months", note: "<2% monthly churn" },
                  { metric: "LTV Per Team", value: "$2,142", note: "ACV x 3yr lifetime" },
                ].map((row) => (
                  <div key={row.metric} className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm text-zinc-600">{row.metric}</p>
                      <p className="text-xs text-zinc-500">{row.note}</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-zinc-900">{row.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-6 text-zinc-900">Acquisition Economics</h3>
              <div className="space-y-4">
                {[
                  { metric: "CAC (Current)", value: "$0", note: "100% organic, Chrome Store + WOM" },
                  { metric: "CAC (Funded)", value: "~$150", note: "Projected with paid marketing" },
                  { metric: "LTV : CAC", value: "14:1", note: "Current (infinite with $0 CAC)" },
                  { metric: "LTV : CAC (Funded)", value: "~14:1", note: "$2,142 LTV / $150 CAC" },
                  { metric: "Payback Period", value: "<3 months", note: "$150 CAC / $59.50 MRR" },
                  { metric: "Free to Paid Rate", value: "25%", note: "Conversion from free tier" },
                ].map((row) => (
                  <div key={row.metric} className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm text-zinc-600">{row.metric}</p>
                      <p className="text-xs text-zinc-500">{row.note}</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-zinc-900">{row.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 3: COST STRUCTURE
        ═══════════════════════════════════════════ */}
        <Section id="costs" title="Cost Structure" subtitle="All infrastructure, payment processing, people, and operational costs">
          <div className="grid sm:grid-cols-3 gap-6">
            {(["current", "mid", "scale"] as const).map((tier) => {
              const data = COST_BREAKDOWN[tier];
              const total = sumCosts(data.items);
              const revenue = tier === "current" ? 13500 : tier === "mid" ? 30000 : 50000;
              const margin = ((1 - total / revenue) * 100).toFixed(0);

              return (
                <Card key={tier}>
                  <h3 className="font-bold text-sm mb-1 text-zinc-900">{data.label}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <p className="text-2xl font-black text-blue-600">{fmtFull(total)}/mo</p>
                    <p className="text-xs text-zinc-500">({margin}% margin)</p>
                  </div>

                  <div className="space-y-2">
                    {data.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">{item.name}</span>
                        <span className="font-mono text-zinc-900">
                          {item.cost === 0 ? "Free" : fmtFull(item.cost)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Revenue</span>
                    <span className="font-mono font-bold text-zinc-900">{fmtFull(revenue)}/mo</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Gross margin note */}
          <Card className="mt-8">
            <div className="flex items-start gap-4">
              <DollarSign className="h-6 w-6 text-zinc-500 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-2 text-zinc-900">Software Gross Margin: 96%+</h4>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  TeamPrompt has near-zero marginal cost per user. The product stores text data (prompts) in Postgres,
                  the browser extension runs client-side, and there are no server-side AI API costs.
                  Infrastructure costs (Supabase, Vercel, Redis) stay under $200/mo even at 6,000 users.
                  Stripe&apos;s 3.5% blended transaction fee is the primary variable cost. People and marketing
                  are growth investments, not cost-of-goods — the underlying software margin remains 96%+.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 4: HIRING PLAN
        ═══════════════════════════════════════════ */}
        <Section id="hiring" title="Hiring Plan" subtitle="Lean team. Hire only when revenue justifies it.">
          <div className="space-y-6">
            {[
              {
                role: "Marketing Contractor",
                when: "Month 2 (~$15K MRR)",
                cost: "$3,000-5,000/mo",
                why: "Manages the full paid acquisition funnel: LinkedIn and Google ad campaigns (creative, targeting, A/B testing, budget optimization), writes SEO blog content and landing pages, produces customer case studies for legal/healthcare/finance verticals, and builds email nurture sequences for free-tier users. This role is the bridge from $0 organic-only growth to a repeatable, scalable acquisition engine that targets $150 CAC.",
                icon: Megaphone,
              },
              {
                role: "Part-Time Support Person",
                when: "Month 4 (~$19.5K MRR)",
                cost: "$2,000-3,000/mo",
                why: "As the user base grows past 1,500 users, support ticket volume will exceed what a solo founder can handle while still shipping product. This person handles inbound tickets, runs onboarding calls with new teams, writes and maintains help documentation, monitors community feedback, and triages bug reports. Frees up 15–20 hours/week of founder time for product development and growth strategy.",
                icon: HeadphonesIcon,
              },
              {
                role: "Part-Time Security Engineer",
                when: "Month 7 (~$27K MRR)",
                cost: "$4,000-5,000/mo",
                why: "Enterprise buyers require SSO/SAML integration, SCIM directory provisioning, and SOC 2 Type II certification before they sign. This engineer builds those features, conducts penetration testing, implements advanced audit logging, and manages the SOC 2 certification process with our compliance partner. Directly unlocks the $12/seat Business tier — the highest-margin plan — and removes the #1 objection from 50+ seat organizations.",
                icon: Shield,
              },
            ].map((hire) => (
              <Card key={hire.role}>
                <div className="flex items-start gap-4">
                  <hire.icon className="h-5 w-5 text-zinc-500 shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <h4 className="font-bold text-zinc-900">{hire.role}</h4>
                      <span className="text-xs text-zinc-500 font-mono">{hire.cost}</span>
                    </div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">{hire.when}</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{hire.why}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <h4 className="font-bold mb-4 text-zinc-900">Monthly People Costs Over Time</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 px-3 text-zinc-500 font-medium">Phase</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">MRR</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">People Cost</th>
                    <th className="text-right py-2 px-3 text-zinc-500 font-medium">% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { phase: "M1 (Solo)", mrr: "$13.5K", cost: "$0", pct: "0%" },
                    { phase: "M2-3 (+ Mktg contractor)", mrr: "$14.8-17K", cost: "$3,500", pct: "21-24%" },
                    { phase: "M4-6 (+ Support person)", mrr: "$19.5-24.5K", cost: "$6,000", pct: "24-31%" },
                    { phase: "M7-12 (+ Security eng)", mrr: "$27-39K", cost: "$10,500", pct: "27-39%" },
                    { phase: "M13-18 (Full team)", mrr: "$41-50K", cost: "$10,500", pct: "21-26%" },
                  ].map((row) => (
                    <tr key={row.phase} className="border-b border-zinc-100">
                      <td className="py-2.5 px-3 text-zinc-600">{row.phase}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-900">{row.mrr}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-900">{row.cost}</td>
                      <td className="text-right py-2.5 px-3 font-mono text-zinc-500">{row.pct}</td>
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
        <Section id="marketing" title="Marketing & Growth Strategy" subtitle="From organic discovery to funded acquisition">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-zinc-500" />
                <h4 className="font-bold text-zinc-900">Organic (Current — $0 spend)</h4>
              </div>
              <div className="space-y-3">
                {[
                  "Chrome Web Store discovery (4.8 star rating, 500+ reviews)",
                  "Word-of-mouth from existing teams",
                  "SEO blog content (AI governance, prompt engineering)",
                  "Product-led growth: free tier to team adoption to org upgrade",
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-zinc-600">
                    <span className="text-zinc-400 shrink-0 mt-0.5">-</span>
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="h-5 w-5 text-zinc-500" />
                <h4 className="font-bold text-zinc-900">Paid (Funded — $2-7K/mo)</h4>
              </div>
              <div className="space-y-3">
                {[
                  "LinkedIn Ads targeting IT leaders, compliance officers, legal teams",
                  "Google Ads for high-intent keywords (\"AI prompt management\", \"ChatGPT for teams\")",
                  "Retargeting website visitors and free-tier users",
                  "Case study content amplification (legal, healthcare, finance)",
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-zinc-600">
                    <span className="text-zinc-400 shrink-0 mt-0.5">-</span>
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <h4 className="font-bold mb-4 text-zinc-900">Growth Funnel</h4>
            <div className="space-y-3">
              {[
                { stage: "Awareness", channel: "LinkedIn Ads + SEO + Chrome Store", metric: "40K impressions/mo", width: "100%" },
                { stage: "Visit", channel: "Landing page + pricing", metric: "3,000 visits/mo", width: "70%" },
                { stage: "Sign Up", channel: "Free tier", metric: "250 signups/mo", width: "45%" },
                { stage: "Activate", channel: "Extension install + first prompt", metric: "125 activated/mo", width: "30%" },
                { stage: "Convert", channel: "Team adoption + paid upgrade", metric: "8 teams/mo", width: "15%" },
              ].map((s) => (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-zinc-900 font-medium">{s.stage}</span>
                    <span className="text-xs text-zinc-500">{s.metric}</span>
                  </div>
                  <div className="h-6 rounded bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded bg-blue-600/10 flex items-center px-3"
                      style={{ width: s.width }}
                    >
                      <span className="text-xs text-zinc-600 truncate">{s.channel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 6: AI STRATEGY
        ═══════════════════════════════════════════ */}
        <Section id="ai-strategy" title="AI Strategy" subtitle="How we stay ahead as the AI landscape evolves">
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
                  <item.icon className="h-5 w-5 text-zinc-500" />
                  <h4 className="font-bold text-zinc-900">{item.title}</h4>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <h4 className="font-bold mb-4 text-zinc-900">AI Landscape Risk Mitigation</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
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
                    <tr key={row.scenario} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-2.5 px-3 text-zinc-900">{row.scenario}</td>
                      <td className="py-2.5 px-3">
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded",
                          row.risk === "Low" ? "bg-zinc-100 text-zinc-500" : "bg-blue-50 text-blue-600"
                        )}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sm text-zinc-600">{row.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════
            SECTION 7: USE OF FUNDS
        ═══════════════════════════════════════════ */}
        <Section id="use-of-funds" title="Use of Funds — $100K" subtitle="Detailed allocation with Louisiana LEB 25% investor tax credit">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-bold mb-6 text-zinc-900">Allocation Breakdown</h4>
              <div className="space-y-5">
                {[
                  {
                    category: "Marketing & Customer Acquisition",
                    amount: 50000,
                    pct: "50%",
                    details: "LinkedIn Accelerate campaigns targeting CISOs and IT leaders ($3–5K/mo), Google Ads on high-intent keywords like \"AI prompt management\" and \"ChatGPT for teams\" ($2–3K/mo), marketing contractor salary ($3–5K/mo), customer case study production for legal/healthcare/finance verticals, conference sponsorship at 1–2 industry events, and landing page A/B testing tools.",
                  },
                  {
                    category: "Enterprise Features & Security",
                    amount: 25000,
                    pct: "25%",
                    details: "Part-time security engineer salary for 5–6 months ($4–5K/mo) to build SSO/SAML single sign-on, SCIM directory provisioning for automated user management, SOC 2 Type II certification (audit partner fees ~$5K, tooling ~$2K), penetration testing engagement, and advanced audit logging required by enterprise procurement teams.",
                  },
                  {
                    category: "Engineering & Infrastructure",
                    amount: 15000,
                    pct: "15%",
                    details: "Infrastructure scaling as user base grows (Supabase growth plan, Vercel bandwidth, Upstash Redis for caching), error monitoring and observability tooling (Sentry, LogTail), automated E2E testing infrastructure, AI research tools and API access for building prompt quality scoring and smart recommendations, and staging environment costs.",
                  },
                  {
                    category: "Operations & Tools",
                    amount: 10000,
                    pct: "10%",
                    details: "Business incorporation and legal counsel for investor agreements and terms of service updates, accounting and bookkeeping software, support ticketing and CRM tooling, help documentation platform, part-time support person salary bridge for months 3–4 ($2.5–3.5K/mo), and business insurance.",
                  },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex items-baseline justify-between text-sm mb-1">
                      <span className="text-zinc-900 font-medium">{item.category}</span>
                      <span className="font-mono text-zinc-500">{fmtFull(item.amount)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-100 overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full bg-blue-600/30"
                        style={{ width: item.pct }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">{item.details}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-bold text-zinc-900">Louisiana LEB Tax Credit</h4>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-zinc-600">
                    TeamPrompt qualifies for the Louisiana Economic Development program.
                    Investors receive a 25% state tax credit on their investment.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-zinc-500">Investment</span>
                      <span className="text-lg font-black font-mono text-zinc-900">$100,000</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-zinc-500">Tax credit (25%)</span>
                      <span className="text-lg font-black text-blue-600 font-mono">-$25,000</span>
                    </div>
                    <div className="border-t border-zinc-200 pt-2 flex justify-between items-baseline">
                      <span className="text-sm text-blue-600 font-bold">Effective cost</span>
                      <span className="text-2xl font-black text-blue-600 font-mono">$75,000</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="font-bold mb-4 text-zinc-900">Runway Analysis</h4>
                <div className="space-y-3">
                  {[
                    { metric: "Monthly costs (M1)", value: "$2,500", note: "Infra + Stripe only" },
                    { metric: "Monthly costs (M2-3)", value: "$8-9.5K", note: "+ Marketing contractor + ads" },
                    { metric: "Monthly costs (M4-6)", value: "$13-14.5K", note: "+ Support person" },
                    { metric: "Monthly costs (M7+)", value: "$20-23K", note: "+ Security engineer + ad scale" },
                    { metric: "Cash-flow positive", value: "Month 1", note: "Revenue > expenses from day 1" },
                  ].map((row) => (
                    <div key={row.metric} className="flex items-baseline justify-between">
                      <div>
                        <p className="text-sm text-zinc-600">{row.metric}</p>
                        <p className="text-xs text-zinc-500">{row.note}</p>
                      </div>
                      <p className="font-bold font-mono text-sm text-zinc-900">{row.value}</p>
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
        <Section id="profitability" title="Path to Profitability" subtitle="From $100K investment to self-sustaining business">
          <Card>
            <div className="space-y-6">
              {[
                {
                  phase: "Phase 1: Foundation",
                  months: "Month 1-3",
                  mrr: "$13.5K to $17K",
                  focus: "Hire marketing contractor, launch LinkedIn/Google ad campaigns, optimize conversion funnel, ramp ad spend from $2K to $3.5K/mo",
                  milestone: "$17K MRR, marketing engine running",
                },
                {
                  phase: "Phase 2: Accelerate",
                  months: "Month 4-6",
                  mrr: "$19.5K to $24.5K",
                  focus: "Hire support person, scale paid acquisition to $5.5K/mo, publish case studies, begin enterprise feature development (SSO/SAML)",
                  milestone: "$24.5K MRR, 10-15% MoM growth",
                },
                {
                  phase: "Phase 3: Scale",
                  months: "Month 7-12",
                  mrr: "$27K to $39K",
                  focus: "Hire security engineer, launch Business tier with enterprise features, SOC 2 compliance, scale ad spend to $7K/mo",
                  milestone: "$39K MRR, team fully ramped",
                },
                {
                  phase: "Phase 4: Position for Seed",
                  months: "Month 13-18",
                  mrr: "$41K to $50K",
                  focus: "Hit $600K ARR run rate, build case for seed round, explore strategic partnerships, expand internationally",
                  milestone: "$50K MRR / $600K ARR — seed round ready",
                },
              ].map((p, i) => (
                <div key={p.phase} className={cn(
                  "flex gap-6",
                  i < 3 && "pb-6 border-b border-zinc-100"
                )}>
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                      {i + 1}
                    </div>
                    {i < 3 && <div className="flex-1 w-px bg-zinc-200 mt-2" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-1">
                      <h4 className="font-bold text-zinc-900">{p.phase}</h4>
                      <span className="text-xs text-zinc-500 font-mono">{p.months}</span>
                      <span className="text-xs text-blue-600 font-mono font-bold">{p.mrr}</span>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-2">{p.focus}</p>
                    <p className="text-xs text-zinc-500 font-medium">Milestone: {p.milestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Footer */}
        <div className="py-16 text-center space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <Image src="/logo.svg" alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
            <div className="text-left">
              <p className="font-bold text-zinc-900">TeamPrompt</p>
              <p className="text-xs text-zinc-500">teamprompt.app</p>
            </div>
          </div>
          <p className="text-sm text-zinc-500">
            Confidential. Prepared March 2026.
          </p>
          <Link
            href={getBackHref()}
            className="inline-block text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Back to Pitch Deck
          </Link>
        </div>
      </div>
    </div>
  );
}
