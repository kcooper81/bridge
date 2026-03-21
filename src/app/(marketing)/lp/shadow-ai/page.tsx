import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Monitor,
  Shield,
  Zap,
  Users,
  BarChart3,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Search,
  Globe,
} from "lucide-react";
import { AppMockup } from "@/components/marketing/app-mockup";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { FeatureCard } from "@/components/marketing/feature-card";
import { StatsRow } from "@/components/marketing/stats-row";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export function generateMetadata(): Metadata {
  return {
    title:
      "Shadow AI Monitoring — See Every AI Tool Your Team Uses | TeamPrompt",
    description:
      "60% of employees use AI without IT approval. TeamPrompt gives you full visibility into shadow AI usage across ChatGPT, Claude, Gemini, and more — no proxy required.",
    keywords: [
      "shadow AI",
      "employees using ChatGPT",
      "AI usage monitoring",
      "AI governance",
      "shadow IT AI",
      "AI visibility",
      "AI tool monitoring",
    ],
    alternates: { canonical: `${SITE_URL}/lp/shadow-ai` },
  };
}

const faqs = [
  {
    question: "What is Shadow AI and why is it a risk?",
    answer:
      "Shadow AI refers to employees using AI tools like ChatGPT, Claude, or Gemini without IT knowledge or approval. It creates data security risks because sensitive company information — source code, customer data, financial records — can be pasted into these tools without any oversight or audit trail.",
  },
  {
    question: "How does TeamPrompt detect AI tool usage?",
    answer:
      "TeamPrompt uses a lightweight browser extension that monitors web traffic for 50+ known AI tool domains. When an employee visits ChatGPT, Claude, Gemini, Copilot, Perplexity, or any other AI platform, it is logged instantly. No proxy, VPN, or network changes are needed.",
  },
  {
    question: "Does the extension slow down employee browsers?",
    answer:
      "No. The extension is extremely lightweight — under 500KB — and runs passively in the background. It only activates when an AI tool domain is detected. Employees will not notice any performance difference.",
  },
  {
    question: "Can I block specific AI tools while allowing others?",
    answer:
      "Yes. TeamPrompt lets you set granular policies per tool, per team, or per role. For example, you can approve Claude for your engineering team while blocking ChatGPT company-wide, or restrict all AI tools except your approved internal chat.",
  },
  {
    question: "How long does deployment take?",
    answer:
      "Most teams are fully deployed in under 2 minutes. You install the browser extension via your MDM or group policy, and monitoring begins immediately. There is no server to configure, no proxy to set up, and no network changes required.",
  },
];

export default function ShadowAiLandingPage() {
  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <SectionLabel dark>Shadow AI Monitoring</SectionLabel>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              You Can&apos;t Secure{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                What You Can&apos;t See
              </span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed">
              Your employees are using ChatGPT, Claude, Gemini, and dozens of
              other AI tools right now — without IT approval. You have zero
              visibility into what data they are sharing.
              TeamPrompt changes that in 2 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 text-lg font-medium text-zinc-300 hover:bg-white/5 transition-all"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              No credit card &middot; 2 min setup &middot; Cancel anytime
            </p>
          </div>
          <div className="mt-12 lg:mt-0">
            <AppMockup
              variant="guardrails"
              activeNav="Activity Log"
              items={[
                {
                  title: "ChatGPT Usage",
                  badge: "Warning",
                  stat: "142 msgs",
                  iconColor: "amber",
                  subtitle: "12 users \u00b7 Unrestricted",
                  highlight: "warn",
                },
                {
                  title: "Claude Sessions",
                  stat: "87 msgs",
                  iconColor: "blue",
                  subtitle: "8 users \u00b7 Approved",
                },
                {
                  title: "Gemini Activity",
                  badge: "Blocked",
                  stat: "23 attempts",
                  iconColor: "red",
                  subtitle: "5 users \u00b7 Not Approved",
                  highlight: "block",
                },
                {
                  title: "Copilot Usage",
                  stat: "56 msgs",
                  iconColor: "green",
                  subtitle: "6 users \u00b7 Approved",
                },
              ]}
              toasts={[
                {
                  message: "New AI tool detected: Perplexity",
                  type: "warn",
                  position: "bottom-right",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ───────── TRUST BAR ───────── */}
      <section className="py-10 sm:py-12 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StatsRow
            stats={[
              { value: "50+", label: "AI tools monitored" },
              { value: "<2 min", label: "Deployment time" },
              { value: "0", label: "Network changes needed" },
              { value: "100%", label: "Browser-based visibility" },
            ]}
          />
        </div>
      </section>

      {/* ───────── THE PROBLEM — Before/After ───────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Shadow AI is already in your organization
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Most IT teams discover shadow AI usage only after a data breach.
              Here is what changes when you have visibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* WITHOUT column */}
            <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                  Without TeamPrompt
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "No idea which AI tools employees use",
                  "Sensitive data pasted into unknown AI platforms",
                  "No audit trail for compliance reviews",
                  "IT discovers shadow AI only after incidents",
                  "No way to enforce approved-tool policies",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* WITH column */}
            <div className="rounded-2xl border-2 border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/40">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                  With TeamPrompt
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Full dashboard of every AI tool in use",
                  "Real-time alerts when new AI tools appear",
                  "Complete audit trail: who, what, when, which tool",
                  "Block or restrict unapproved AI platforms",
                  "Built-in approved AI chat as alternative",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── BIG STAT BANNER ───────── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            60%
          </p>
          <p className="mt-4 text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto">
            of employees use AI tools without IT knowledge or approval
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Source: Salesforce 2024 Generative AI Snapshot
          </p>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              From blind spot to full visibility in three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-blue-500/30 via-blue-500/50 to-blue-500/30" />

            {[
              {
                step: "01",
                icon: Zap,
                title: "Deploy the Extension",
                description:
                  "Push the TeamPrompt browser extension via MDM, group policy, or direct install. Takes under 2 minutes for the whole team.",
              },
              {
                step: "02",
                icon: Search,
                title: "Detect All AI Tools",
                description:
                  "The extension monitors 50+ AI tool domains automatically. Every visit to ChatGPT, Claude, Gemini, Copilot, Perplexity, and more is logged.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Control & Govern",
                description:
                  "Review usage in your dashboard. Set policies to allow, restrict, or block specific tools. Get alerts when new AI platforms appear.",
              },
            ].map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/5 border border-primary/10 mb-6">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Step {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CORE CAPABILITIES — Mixed Layout ───────── */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Capabilities</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to govern AI usage
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A lightweight browser extension that gives IT and security teams
              instant visibility — no proxy or network changes needed.
            </p>
          </div>

          {/* Bento-style grid: 2 large + 3 regular */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Eye}
              title="Full Visibility Dashboard"
              description="See every AI tool your team uses — ChatGPT, Claude, Gemini, Copilot, Perplexity, and more — from a single real-time dashboard."
              large
            />
            <FeatureCard
              icon={Bell}
              title="Instant Alerts"
              description="Get notified the moment a new, unapproved AI tool is detected in your organization. Never be caught off guard."
            />
            <FeatureCard
              icon={Monitor}
              title="Block or Restrict Tools"
              description="Set granular policies per tool, per team, or per role. Allow approved tools while blocking everything else."
            />
            <FeatureCard
              icon={Activity}
              title="Complete Audit Trail"
              description="Log every AI interaction with who used it, when, which tool, and what was discussed. Export reports for compliance reviews."
            />
            <FeatureCard
              icon={BarChart3}
              title="Per-User Analytics"
              description="Break down AI usage by individual, team, or department. Identify your heaviest users and most popular tools."
              large
            />
          </div>
        </div>
      </section>

      {/* ───────── AI TOOLS DETECTED ───────── */}
      <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-6xl my-16">
        <div className="text-center mb-10">
          <SectionLabel dark>Coverage</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold">
            50+ AI tools monitored out of the box
          </h2>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-sm">
            TeamPrompt detects all major AI platforms and continuously adds new
            ones. No configuration required.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            "ChatGPT",
            "Claude",
            "Gemini",
            "Copilot",
            "Perplexity",
            "Midjourney",
            "Jasper",
            "Poe",
            "DeepSeek",
            "Grok",
            "Mistral",
            "Character.AI",
            "Notion AI",
            "Writesonic",
            "Copy.ai",
          ].map((tool) => (
            <div
              key={tool}
              className="flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-zinc-300"
            >
              <Globe className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              {tool}
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-xs text-zinc-600">
          Plus 35+ more AI tools and growing
        </p>
      </DarkSection>

      {/* ───────── WHY DIFFERENT — Two-column with mockup ───────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <SectionLabel>Why TeamPrompt</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Not another network tool.{" "}
                <span className="text-muted-foreground">
                  A smarter approach to AI governance.
                </span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Traditional DLP and proxy tools are expensive, complex, and miss
                AI-specific context. TeamPrompt works at the browser level —
                where AI tools actually run.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    icon: Zap,
                    title: "No proxy or VPN required",
                    desc: "Works instantly via browser extension. No network architecture changes, no IT tickets, no downtime.",
                  },
                  {
                    icon: Clock,
                    title: "Deploy in under 2 minutes",
                    desc: "Push via MDM or group policy. Monitoring begins immediately across your entire organization.",
                  },
                  {
                    icon: Users,
                    title: "Built-in approved AI chat",
                    desc: "Give employees a governed AI chat alternative so they don't need to go outside approved tools.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <AppMockup
                variant="guardrails"
                activeNav="Activity Log"
                items={[
                  {
                    title: "Marketing Team",
                    stat: "3 tools",
                    iconColor: "blue",
                    subtitle: "ChatGPT, Claude, Jasper",
                  },
                  {
                    title: "Engineering",
                    stat: "2 tools",
                    iconColor: "green",
                    subtitle: "Copilot, Claude",
                  },
                  {
                    title: "Sales Team",
                    badge: "Warning",
                    stat: "5 tools",
                    iconColor: "amber",
                    subtitle: "Unapproved tools detected",
                    highlight: "warn",
                  },
                  {
                    title: "Legal & Compliance",
                    stat: "1 tool",
                    iconColor: "purple",
                    subtitle: "TeamPrompt Chat only",
                  },
                ]}
                toasts={[
                  {
                    message: "Policy applied: Block Gemini for Sales",
                    type: "success",
                    position: "bottom-right",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── SOCIAL PROOF ───────── */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <SectionLabel>What Teams Say</SectionLabel>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                quote:
                  "We had no idea 14 different AI tools were being used across the company. TeamPrompt showed us everything in the first hour.",
                role: "IT Director, Mid-Market SaaS",
              },
              {
                quote:
                  "Deployment took less time than our morning standup. We had full visibility before lunch.",
                role: "CISO, Financial Services",
              },
            ].map((t) => (
              <div
                key={t.role}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-4 text-xs font-semibold text-foreground">
                  -- {t.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-0 max-w-6xl mx-auto">
        <FAQSection faqs={faqs} />
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.12),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Stop guessing.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Start seeing.
            </span>
          </h2>
          <p className="mt-6 text-lg text-zinc-400 max-w-lg mx-auto">
            Deploy TeamPrompt in 2 minutes and get full visibility into every
            AI tool your team is using — today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            No credit card &middot; 2 min setup &middot; Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}
