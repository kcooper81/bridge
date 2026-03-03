import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  generateSoftwareApplicationSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/schemas";
import { SectionLabel } from "@/components/marketing/section-label";
import { StatsRow } from "@/components/marketing/stats-row";
import { FeatureCard } from "@/components/marketing/feature-card";
import { CTASection } from "@/components/marketing/cta-section";
import {
  AppMockup,
  FloatingCard,
  MockupShieldBlock,
  MockupShareIcon,
  MockupSparklesIcon,
  MockupShieldCheck,
  MockupCheckIcon,
} from "@/components/marketing/app-mockup";
import {
  Archive,
  ArrowRight,
  BarChart3,
  BookOpen,
  Braces,
  CheckCircle2,
  CheckSquare,
  FileCheck,
  Globe,
  Heart,
  Search,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_DISPLAY, PLAN_ORDER } from "@/lib/constants";

export const metadata: Metadata = generatePageMetadata({
  title: "Stop Rewriting the Same AI Prompts — TeamPrompt",
  description:
    "TeamPrompt gives your team a shared prompt library, quality standards, and data protection — so the best AI prompts get reused, not reinvented.",
  path: "/",
  keywords: ["AI prompt management", "team prompts", "prompt library", "shared prompts"],
});

const supportedTools = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Copilot",
  "Perplexity",
];

export default function LandingPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateSoftwareApplicationSchema(),
            generateOrganizationSchema(),
            generateWebSiteSchema(),
          ]),
        }}
      />

      {/* ━━━ HERO ━━━ Dark background with gradient mesh */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        {/* Gradient mesh background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.35) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 80% 50%, hsl(260 60% 50% / 0.15) 0%, transparent 60%)",
              "radial-gradient(ellipse 40% 50% at 20% 80%, hsl(221 83% 53% / 0.1) 0%, transparent 50%)",
            ].join(", "),
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 mb-8 backdrop-blur-sm">
                <Shield className="h-3.5 w-3.5 text-blue-400" />
                <span>Sensitive data protection — built in</span>
                <ArrowRight className="h-3 w-3 text-zinc-500" />
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                Your team writes the
                <br />
                same prompts{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  every week
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
                TeamPrompt gives everyone one shared library for AI prompts
                — with quality standards and data protection built in. The best prompts get reused, not reinvented.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
                  >
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                  >
                    See how it works
                  </Button>
                </Link>
              </div>

              <div className="mt-16 sm:mt-20">
                <StatsRow
                  dark
                  stats={[
                    { value: "5", label: "AI tools supported" },
                    { value: "14", label: "Built-in guidelines" },
                    { value: "<2m", label: "Setup time" },
                  ]}
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Hero mockup */}
            <div className="relative hidden lg:block">
              <AppMockup
                variant="vault"
                items={[
                  {
                    title: "Customer Onboarding Prompt",
                    stat: "142 uses",
                    subtitle: "Marketing · 4.8★",
                    iconColor: "blue",
                    highlight: "shared",
                    badge: "Shared",
                  },
                  {
                    title: "Weekly Report Summary",
                    stat: "89 uses",
                    subtitle: "Operations · 4.5★",
                    iconColor: "green",
                  },
                  {
                    title: "SSN detected — input blocked",
                    badge: "Blocked",
                    stat: "just now",
                    iconColor: "red",
                    highlight: "block",
                  },
                  {
                    title: "Sales Outreach Drafter",
                    stat: "34 uses",
                    subtitle: "Sales · new",
                    iconColor: "purple",
                    highlight: "new",
                    badge: "Approved",
                  },
                ]}
                sidebarUser={{ name: "Alex J.", initials: "AJ" }}
                navBadges={{ Security: 3 }}
                toasts={[
                  {
                    message: "API key blocked in Claude",
                    type: "block",
                    position: "bottom-right",
                  },
                ]}
              />
              <FloatingCard
                label="Shared to Marketing"
                icon={<MockupShareIcon className="h-3 w-3" />}
                color="blue"
                position="top-right"
              />
              <FloatingCard
                label="Prompt approved"
                icon={<MockupCheckIcon className="h-3 w-3" />}
                color="green"
                position="top-left"
              />
              <FloatingCard
                label="HIPAA pack active"
                icon={<MockupShieldCheck className="h-3 w-3" />}
                color="amber"
                position="mid-left"
              />
              <FloatingCard
                label="3 violations blocked"
                icon={<MockupShieldBlock className="h-3 w-3" />}
                color="red"
                position="bottom-left"
              />
              <FloatingCard
                label="Sensitive data removed"
                icon={<MockupSparklesIcon className="h-3 w-3" />}
                color="cyan"
                position="mid-right"
              />
              <FloatingCard
                label="47 prompts shared"
                icon={<MockupShareIcon className="h-3 w-3" />}
                color="green"
                position="bottom-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ WORKS WITH STRIP ━━━ */}
      <section className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6">
            Works with your favorite AI tools
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
            {supportedTools.map((name) => (
              <span
                key={name}
                className="text-sm sm:text-base font-semibold text-muted-foreground tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ BENTO FEATURES ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <SectionLabel>Platform</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for how teams actually use AI
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tools for sharing prompts, catching data leaks, and keeping
              quality consistent — across every department.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Archive}
              title="Shared Prompt Library"
              description="Your team writes the same prompts over and over — in docs, Slack, and personal notes. The library gives everyone one searchable place to find what already works."
              large
              href="/features#prompt-library"
              iconBg="bg-blue-500/10"
            >
              {/* Mini table mockup matching features page library style */}
              <div className="mt-6 rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 flex-1 rounded-md border border-border bg-background px-3 flex items-center gap-2">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Search prompts...</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">All Categories</span>
                </div>
                {/* Table header */}
                <div className="flex items-center gap-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                  <span className="w-4" />
                  <span className="flex-1">Prompt</span>
                  <span className="w-10 text-center">Uses</span>
                  <span className="w-14 text-center">Rating</span>
                </div>
                {[
                  { name: "Customer Onboarding Email", uses: "142", rating: 5, fav: true, template: false },
                  { name: "Code Review Feedback", uses: "89", rating: 4, fav: false, template: true },
                  { name: "Weekly Status Update", uses: "67", rating: 0, fav: true, template: true },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
                    <Heart className={cn("w-3 h-3 shrink-0", p.fav ? "text-red-500 fill-red-500" : "text-muted-foreground/20")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-medium text-foreground truncate">{p.name}</p>
                        {p.template && <span className="text-[7px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{"{}"} Template</span>}
                      </div>
                    </div>
                    <span className="w-10 text-center text-[10px] text-muted-foreground tabular-nums">{p.uses}</span>
                    <div className="w-14 flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("w-2 h-2", s <= p.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard
              icon={Shield}
              title="Sensitive Data Blocking"
              description="Catch patient records, financial data, passwords, and confidential info before they get pasted into AI tools. Block or warn automatically."
              badge="New"
              href="/security"
              iconBg="bg-red-500/10"
            >
              <div className="mt-5 space-y-2">
                {[
                  { label: "SSN detected", severity: "block" },
                  { label: "Patient name blocked", severity: "block" },
                  { label: "Credit card warning", severity: "warn" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", item.severity === "block" ? "bg-destructive" : "bg-yellow-500")} />
                    <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                    <span className={cn("text-[9px] font-bold uppercase", item.severity === "block" ? "text-destructive" : "text-yellow-600")}>
                      {item.severity === "block" ? "Blocked" : "Warning"}
                    </span>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard
              icon={BookOpen}
              title="Quality Guidelines"
              description="Set rules like &quot;every prompt needs a clear role and output format&quot; — prompts get flagged if they don&apos;t meet the bar."
              href="/features#quality-guidelines"
              iconBg="bg-emerald-500/10"
            >
              {/* Mini guideline cards matching features page style */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  { name: "Clear Instructions", active: true },
                  { name: "Role Definition", active: true },
                  { name: "Output Format", active: false },
                  { name: "Context Window", active: true },
                ].map((g) => (
                  <div key={g.name} className="rounded-lg border border-border px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-foreground truncate">{g.name}</span>
                    <div className={cn("w-5 h-3 rounded-full p-0.5 flex items-center shrink-0", g.active ? "bg-primary justify-end" : "bg-muted justify-start")}>
                      <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard
              icon={Braces}
              title="Prompt Templates"
              description="Create reusable templates with fill-in-the-blank variables that your team completes each time. Consistent output, every time."
              href="/features#prompt-library"
              iconBg="bg-amber-500/10"
            >
              {/* Mini template preview */}
              <div className="mt-5 rounded-lg border border-border bg-background/50 p-3 space-y-2">
                <p className="text-[10px] text-muted-foreground">
                  Draft a follow-up email to <span className="bg-primary/10 text-primary px-1 rounded font-mono">{"{{"}client_name{"}}"}</span> regarding our <span className="bg-primary/10 text-primary px-1 rounded font-mono">{"{{"}product{"}}"}</span> demo...
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 h-5 rounded border border-border bg-background px-2 flex items-center">
                    <span className="text-[9px] text-emerald-600 font-medium">Sarah Chen</span>
                  </div>
                  <div className="flex-1 h-5 rounded border border-border bg-background px-2 flex items-center">
                    <span className="text-[9px] text-emerald-600 font-medium">Enterprise Suite</span>
                  </div>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={Globe}
              title="Browser Extension"
              description="Use your saved prompts directly inside ChatGPT, Claude, Gemini, and Copilot — no copy-paste needed."
              href="/features#browser-extension"
              iconBg="bg-violet-500/10"
            >
              {/* Extension mockup mini — dark theme */}
              <div className="mt-5 rounded-lg bg-zinc-900 border border-zinc-700 p-3 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-[10px] font-bold text-white">TeamPrompt</span>
                </div>
                <div className="h-5 rounded bg-zinc-800 flex items-center px-2">
                  <span className="text-[9px] text-zinc-500">Search prompts...</span>
                </div>
                <div className="flex gap-2">
                  {["Faves", "Recent", "Prompts"].map((t, i) => (
                    <span key={t} className={cn("text-[8px] font-medium", i === 0 ? "text-blue-400" : "text-zinc-500")}>{t}</span>
                  ))}
                </div>
                {["Code Review Feedback", "Weekly Status Update"].map((p) => (
                  <div key={p} className="rounded bg-zinc-800/60 border border-zinc-700/50 px-2 py-1">
                    <p className="text-[9px] text-white font-medium">{p}</p>
                    <span className="text-[7px] text-rose-400 font-bold">Template</span>
                  </div>
                ))}
              </div>
            </FeatureCard>
          </div>

          {/* Secondary features row */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: Users, title: "Teams & Roles", desc: "Admin, Manager, Member — the right access for the right people.", href: "/features#team-management", bg: "bg-sky-500/10" },
              { icon: BarChart3, title: "Usage Analytics", desc: "See which prompts actually get reused and which sit unused.", href: "/features#analytics-insights", bg: "bg-indigo-500/10" },
              { icon: Zap, title: "Import / Export", desc: "Bring existing prompts in or share them with another team.", href: "/features#import-export", bg: "bg-yellow-500/10" },
              { icon: FileCheck, title: "Compliance Rules", desc: "One-click security rules for healthcare, finance, and regulated industries.", href: "/features#compliance-policy-packs", bg: "bg-teal-500/10" },
              { icon: CheckSquare, title: "Approval Queue", desc: "Managers review and approve prompts before the team can use them.", href: "/features#approval-queue", bg: "bg-violet-500/10" },
            ].map((f) => (
              <Link key={f.title} href={f.href} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", f.bg)}>
                      <f.icon className="h-4 w-4 text-foreground/70" />
                    </div>
                    <h3 className="font-semibold">{f.title}</h3>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SOCIAL PROOF / HOW IT WORKS ━━━ */}
      <section className="py-20 sm:py-28 bg-zinc-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(221 83% 53% / 0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel dark className="text-center">
              How it works
            </SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              From scattered prompts to one shared library
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Three steps to get your team on the same page.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create your workspace",
                desc: "Sign up, name your org, invite your team. Takes less than two minutes.",
              },
              {
                step: "02",
                title: "Add prompts and security rules",
                desc: "Import existing prompts or write new ones. Turn on data protection to block sensitive info from reaching AI tools.",
              },
              {
                step: "03",
                title: "Your team starts reusing",
                desc: "Members search the library, use the browser extension, and your best prompts get adopted across the org.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="text-5xl font-black text-white/5">
                  {item.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PRICING PREVIEW ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              One price per user. No surprises.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when your team grows.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {PLAN_ORDER.map((tier) => {
              const plan = PLAN_DISPLAY[tier];
              // Show first 6 included features for the homepage preview
              const highlights = Object.entries(plan.features)
                .filter(([, v]) => v !== false)
                .slice(0, 6)
                .map(([k, v]) => (typeof v === "string" ? `${k}: ${v}` : k));
              return (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-2xl border p-8 flex flex-col transition-all duration-300",
                    plan.popular
                      ? "border-primary bg-card shadow-lg shadow-primary/5"
                      : "border-border bg-card hover:border-primary/20 hover:shadow-md"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">{plan.monthlyPrice}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {highlights.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-8 block">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full rounded-full font-semibold"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            All plans include the browser extension for ChatGPT, Claude, Gemini, Copilot, and Perplexity.{" "}
            <Link href="/pricing" className="text-primary hover:underline font-medium">
              Compare all features &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* ━━━ BOTTOM CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Your team is already using AI."
            gradientText="Now make it consistent."
            subtitle="Set up your workspace in under two minutes. No credit card needed."
          />
        </div>
      </section>
    </>
  );
}
