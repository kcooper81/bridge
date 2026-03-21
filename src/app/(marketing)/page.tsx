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
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,

  EyeOff,
  FileSearch,
  Globe,
  Quote,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,

  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "AI DLP & Prompt Management for Teams — Secure ChatGPT, Claude & Gemini",
  description:
    "Protect your team's data with real-time DLP for ChatGPT, Claude & Gemini. Share prompts securely, enforce AI policies, and get full compliance audit trails. Free for up to 3 members.",
  path: "/",
  keywords: [
    "AI DLP",
    "AI data loss prevention",
    "ChatGPT security",
    "AI governance",
    "AI compliance",
    "prompt management",
    "sensitive data protection",
    "enterprise AI security",
    "AI security for teams",
    "secure AI adoption",
  ],
});

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

      {/* ━━━ 1. HERO ━━━ Dark with grid pattern */}
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
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 mb-8 backdrop-blur-sm">
                <Shield className="h-3.5 w-3.5 text-blue-400" />
                <span>Real-time AI data loss prevention</span>
                <ArrowRight className="h-3 w-3 text-zinc-500" />
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                AI DLP{" "}
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  & prompt management
                </span>
                <br />
                for your team
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
                Block sensitive data before it reaches ChatGPT, Claude, or Gemini. Give your team shared prompts, compliance guardrails, and a full audit trail — all in one platform.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
                  >
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                  >
                    See How It Works
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-zinc-500">
                No credit card required. Free for up to 3 members.
              </p>
            </div>

            {/* Hero mockup — guardrails/security focused */}
            <div className="relative hidden lg:block">
              <AppMockup
                variant="vault"
                items={[
                  {
                    title: "SSN detected — input blocked",
                    badge: "Blocked",
                    stat: "just now",
                    iconColor: "red",
                    highlight: "block",
                  },
                  {
                    title: "Credit card number — redacted",
                    badge: "Redacted",
                    stat: "2m ago",
                    iconColor: "amber",
                    highlight: "warn",
                  },
                  {
                    title: "Customer Onboarding Prompt",
                    stat: "142 uses",
                    subtitle: "Marketing",
                    iconColor: "blue",
                    highlight: "shared",
                    badge: "Shared",
                  },
                  {
                    title: "Patient name flagged — warned",
                    badge: "Warned",
                    stat: "5m ago",
                    iconColor: "red",
                    highlight: "block",
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
                label="HIPAA pack active"
                icon={<MockupShieldCheck className="h-3 w-3" />}
                color="amber"
                position="top-right"
              />
              <FloatingCard
                label="3 violations blocked"
                icon={<MockupShieldBlock className="h-3 w-3" />}
                color="red"
                position="top-left"
              />
              <FloatingCard
                label="Sensitive data removed"
                icon={<MockupSparklesIcon className="h-3 w-3" />}
                color="cyan"
                position="mid-left"
              />
              <FloatingCard
                label="Prompt approved"
                icon={<MockupCheckIcon className="h-3 w-3" />}
                color="green"
                position="bottom-left"
              />
              <FloatingCard
                label="47 prompts shared"
                icon={<MockupShareIcon className="h-3 w-3" />}
                color="green"
                position="mid-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 2. TRUST / LOGO BAR ━━━ */}
      <section className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Works with */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground shrink-0">
              Works with
            </p>
            <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
              {[
                { name: "ChatGPT", color: "text-emerald-600 dark:text-emerald-400" },
                { name: "Claude", color: "text-orange-600 dark:text-orange-400" },
                { name: "Gemini", color: "text-blue-600 dark:text-blue-400" },
                { name: "Copilot", color: "text-sky-600 dark:text-sky-400" },
                { name: "Perplexity", color: "text-teal-600 dark:text-teal-400" },
              ].map((tool) => (
                <span
                  key={tool.name}
                  className={cn("text-sm sm:text-base font-bold tracking-wide", tool.color)}
                >
                  {tool.name}
                </span>
              ))}
            </div>

            <div className="hidden sm:block w-px h-8 bg-border" />

            <div className="flex items-center gap-4 flex-wrap justify-center">
              {["HIPAA Ready", "SOC 2 Ready", "PCI-DSS", "GDPR"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/60 border border-border rounded-full px-3 py-1"
                >
                  <ShieldCheck className="h-3 w-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 3. PROBLEM / SOLUTION ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Why TeamPrompt</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              AI data loss prevention{" "}
              <span className="text-primary">that works where your team does</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Problem */}
            <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.02] p-8">
              <h3 className="text-lg font-bold text-destructive flex items-center gap-2 mb-6">
                <XCircle className="h-5 w-5" />
                The Problem
              </h3>
              <div className="space-y-5">
                {[
                  {
                    title: "Employees paste sensitive data into AI",
                    desc: "SSNs, patient records, API keys, and financial data end up in ChatGPT prompts with no guardrails.",
                  },
                  {
                    title: "Zero visibility into AI usage",
                    desc: "No audit trail, no logs, no way to know what data has been shared with AI tools.",
                  },
                  {
                    title: "No standards for prompt quality",
                    desc: "Every person writes prompts differently. Inconsistent output, wasted time, no best practices.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Solution */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-8">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-6">
                <CheckCircle2 className="h-5 w-5" />
                The Solution
              </h3>
              <div className="space-y-5">
                {[
                  {
                    title: "Real-time DLP scanning",
                    desc: "Detect and block PII, credentials, and confidential data before it reaches any AI tool.",
                  },
                  {
                    title: "Full audit trail and compliance",
                    desc: "Every AI interaction is logged. 19 compliance packs for HIPAA, SOC 2, PCI-DSS, and more.",
                  },
                  {
                    title: "Shared prompt library with standards",
                    desc: "One searchable library of approved prompts. Quality guidelines, approval workflows, templates.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 4. CORE FEATURES — BENTO GRID ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <SectionLabel>Core Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Shared prompt library & AI governance.{" "}
              <span className="text-primary">One platform.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No competitor combines data loss prevention, a shared prompt library, and built-in secure chat. TeamPrompt does all three.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Feature 1: Real-Time DLP */}
            <FeatureCard
              icon={Shield}
              title="Real-Time DLP Scanning"
              description="Detect SSNs, credit cards, API keys, patient records, and confidential data in real time. Choose to block, warn, or auto-redact before data reaches the AI."
              large={false}
              href="/security"
              iconBg="bg-red-500/10"
            >
              <div className="mt-5 space-y-2">
                {[
                  { label: "SSN detected in prompt", action: "Blocked", severity: "block" },
                  { label: "Credit card number found", action: "Redacted", severity: "warn" },
                  { label: "API key pattern matched", action: "Blocked", severity: "block" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-1.5"
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        item.severity === "block" ? "bg-destructive" : "bg-yellow-500"
                      )}
                    />
                    <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase",
                        item.severity === "block" ? "text-destructive" : "text-yellow-600"
                      )}
                    >
                      {item.action}
                    </span>
                  </div>
                ))}
              </div>
            </FeatureCard>

            {/* Feature 2: Shared Prompt Library */}
            <FeatureCard
              icon={ClipboardList}
              title="Shared Prompt Library"
              description="One searchable library of approved, reusable prompts. Templates with variables, approval workflows, quality guidelines, and usage analytics across your team."
              large={false}
              href="/features#prompt-library"
              iconBg="bg-blue-500/10"
            >
              <div className="mt-5 rounded-xl border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 flex-1 rounded-md border border-border bg-background px-2.5 flex items-center gap-1.5">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Search prompts...</span>
                  </div>
                </div>
                {[
                  { name: "Customer Onboarding Email", uses: "142", status: "Approved" },
                  { name: "Code Review Feedback", uses: "89", status: "Template" },
                  { name: "Weekly Status Update", uses: "67", status: "Shared" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
                  >
                    <span className="text-[11px] font-medium truncate">{p.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground tabular-nums">{p.uses} uses</span>
                      <span className="text-[8px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </FeatureCard>

            {/* Feature 3: Browser Extension */}
            <FeatureCard
              icon={Globe}
              title="Browser Extension"
              description="Works directly inside ChatGPT, Claude, Gemini, Copilot, and Perplexity. No proxy, no VPN. Install in under 2 minutes and DLP scanning starts immediately."
              large={false}
              href="/extensions"
              iconBg="bg-violet-500/10"
            >
              <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                {["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map((tool) => (
                  <span key={tool} className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs">{tool}</span>
                  </span>
                ))}
              </div>
            </FeatureCard>

            {/* Feature 4: Compliance & Audit Trail */}
            <FeatureCard
              icon={FileSearch}
              title="Compliance & Audit Trail"
              description="19 pre-built compliance packs for HIPAA, SOC 2, PCI-DSS, GDPR, and more. Full activity log of every AI interaction with exportable reports for auditors."
              large={false}
              href="/features#compliance-policy-packs"
              iconBg="bg-teal-500/10"
            >
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["HIPAA", "SOC 2", "PCI-DSS", "GDPR", "FERPA", "CCPA", "GLBA", "+12 more"].map(
                  (pack) => (
                    <span
                      key={pack}
                      className={cn(
                        "text-[10px] font-semibold rounded-md px-2 py-1 border",
                        pack.startsWith("+")
                          ? "border-dashed border-border text-muted-foreground"
                          : "border-border bg-muted/50 text-foreground/70"
                      )}
                    >
                      {pack}
                    </span>
                  )
                )}
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ━━━ 5. HOW IT WORKS ━━━ Dark section */}
      <section className="py-20 sm:py-28 bg-zinc-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(221 83% 53% / 0.08) 0%, transparent 70%)",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel dark className="text-center">
              How It Works
            </SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Protected in{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                three steps
              </span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              From install to full AI security coverage in under two minutes.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-blue-500/30 via-blue-500/50 to-blue-500/30" />

            {[
              {
                step: "01",
                title: "Install",
                desc: "Add the browser extension to Chrome, Edge, or Firefox. Or use the built-in secure chat. Takes less than 2 minutes.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Configure",
                desc: "Enable compliance packs for your industry. Add your team's prompts. Set DLP rules to block, warn, or auto-redact.",
                icon: Shield,
              },
              {
                step: "03",
                title: "Protected",
                desc: "Every AI interaction is scanned in real time. Your team has shared standards. You have a full audit trail.",
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-5">
                  <item.icon className="h-7 w-7 text-blue-400" />
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full text-xs font-bold text-blue-400/60 tracking-widest">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 6. SOCIAL PROOF ━━━ */}
      <section className="py-20 sm:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {[
              { icon: ShieldAlert, value: "Real-time", label: "PII detection" },
              { icon: FileSearch, value: "19", label: "Compliance frameworks" },
              { icon: Globe, value: "<2 min", label: "Setup time" },
              { icon: EyeOff, value: "3 modes", label: "Block, Warn, or Redact" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="text-center mb-10">
            <SectionLabel>What Teams Are Saying</SectionLabel>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                quote:
                  "We needed a way to make sure patient data never ends up in an AI prompt. TeamPrompt's data blocking caught things we would have missed entirely.",
                name: "Dr. Rebecca Lin",
                role: "Compliance Officer",
                company: "Regional Health System",
                roleIcon: Shield,
              },
              {
                quote:
                  "Our team was writing the same outreach prompts from scratch every week. Now we have one library everyone pulls from -- and the quality is way more consistent.",
                name: "James Okoro",
                role: "Marketing Team Lead",
                company: "B2B SaaS Company",
                roleIcon: Users,
              },
              {
                quote:
                  "The browser extension is the killer feature. My engineers can search and insert prompts right inside ChatGPT and Claude without breaking their flow.",
                name: "Priya Sharma",
                role: "Engineering Manager",
                company: "Fintech Startup",
                roleIcon: Globe,
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 hover:border-primary/20 transition-colors duration-300"
              >
                <Quote className="h-8 w-8 text-primary/10 mb-4" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <testimonial.roleIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-6 text-xs text-muted-foreground/60">
            Placeholder testimonials shown. Real customer quotes coming soon.
          </p>
        </div>
      </section>

      {/* ━━━ 7. PRICING PREVIEW ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-10 sm:p-14 text-center">
            <SectionLabel className="text-center">Pricing</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3">
              Free for up to 3 members.{" "}
              <span className="text-primary">Pro starts at $8/user/month.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              DLP scanning, shared prompts, browser extension, and compliance packs.
              No competitor offers all three at this price.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link href="/signup">
                <Button size="lg" className="rounded-full font-semibold px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="rounded-full font-semibold px-8">
                  Compare Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              14-day free trial on paid plans. No credit card required to start.
            </p>
          </div>
        </div>
      </section>

      {/* ━━━ 8. FINAL CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Your team is already using AI."
            gradientText="Make sure it's secure."
            subtitle="Set up AI data loss prevention in under two minutes. No credit card needed."
            buttonText="Start for free"
          />
        </div>
      </section>
    </>
  );
}
