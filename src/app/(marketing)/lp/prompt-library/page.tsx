import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Tag,
  FolderOpen,
  MousePointerClick,
  ShieldCheck,
  BarChart3,
  Variable,
  PackageOpen,
  Sparkles,
  History,
  CheckCircle2,
  Users,
  BookOpen,
  Star,
} from "lucide-react";
import { AppMockup } from "@/components/marketing/app-mockup";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { FAQSection } from "@/components/marketing/faq-section";

import { FeatureCard } from "@/components/marketing/feature-card";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export function generateMetadata(): Metadata {
  return {
    title:
      "Team Prompt Library — Shared AI Prompts for Your Whole Team | TeamPrompt",
    description:
      "Stop reinventing prompts. Build a shared library of tested AI prompts with templates, approvals, usage tracking, and 1-click insert into ChatGPT and Claude.",
    keywords: [
      "team prompt library",
      "shared prompts",
      "prompt management",
      "AI prompt templates",
      "prompt library tool",
      "shared AI prompts",
      "prompt vault",
    ],
    alternates: { canonical: `${SITE_URL}/lp/prompt-library` },
  };
}

const howItWorks = [
  {
    step: "01",
    title: "Create or import prompts",
    description:
      "Write new prompts with variables like {{customer_name}} or import what your team already uses. Add categories, tags, and descriptions.",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Review and approve",
    description:
      "Admins review submitted prompts before they go live. Ensure quality, consistency, and compliance across the whole library.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Share with your team",
    description:
      "Publish to the shared library. Team members search, browse, and find the right prompt instantly. No more Slack-searching.",
    icon: Users,
  },
  {
    step: "04",
    title: "Insert with one click",
    description:
      "Use the browser extension to insert any prompt directly into ChatGPT, Claude, or Gemini. Fill in variables and go.",
    icon: MousePointerClick,
  },
];

const faqs = [
  {
    question: "How do I import my existing prompts?",
    answer:
      "You can paste prompts directly into the editor, or use our bulk import feature. Most teams are up and running in under 30 minutes. We also offer industry-specific seed prompts during onboarding to give you a head start.",
  },
  {
    question: "What AI tools does the browser extension support?",
    answer:
      "The TeamPrompt extension works with ChatGPT, Claude, Google Gemini, and other browser-based AI tools. Install it once and insert prompts with a single click into any supported tool.",
  },
  {
    question: "How do template variables work?",
    answer:
      "Add placeholders like {{customer_name}}, {{product}}, or {{tone}} to any prompt. When a team member inserts the prompt, they fill in the blanks and get a fully customized message. Variables ensure consistency while keeping prompts flexible.",
  },
  {
    question: "Can we control who publishes prompts?",
    answer:
      "Yes. The approval workflow lets admins review every prompt before it enters the shared library. You can also set team-level permissions so only certain groups see certain prompts.",
  },
  {
    question: "Is there a limit on how many prompts we can store?",
    answer:
      "The free plan includes generous prompt storage to get started. Paid plans offer unlimited prompts, template packs, advanced analytics, and more. Check the pricing page for details.",
  },
];

export default function PromptLibraryLandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.18),transparent)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center">
          <div>
            <SectionLabel dark>Team Prompt Library</SectionLabel>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.1]">
              Stop Reinventing Prompts.{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                Start Sharing Them.
              </span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed">
              Every team member writes the same prompts from scratch. No
              sharing, no standards, no way to know what works. TeamPrompt
              gives your team a single, searchable library of approved
              prompts&nbsp;&mdash; ready to insert into any AI tool with one
              click.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 text-lg font-medium text-zinc-300 hover:text-white hover:border-white/30 transition-colors"
              >
                See All Features
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              No credit card &middot; 2 min setup &middot; Cancel anytime
            </p>
          </div>

          <div className="mt-12 lg:mt-0">
            <AppMockup
              variant="vault"
              items={[
                {
                  title: "Customer Email Template",
                  stat: "89 uses",
                  iconColor: "blue",
                  subtitle: "Marketing · 4.9★",
                  badge: "Shared",
                  highlight: "shared",
                },
                {
                  title: "Code Review Checklist",
                  stat: "64 uses",
                  iconColor: "green",
                  subtitle: "Engineering · 4.8★",
                  badge: "Approved",
                },
                {
                  title: "Sales Objection Handler",
                  stat: "52 uses",
                  iconColor: "purple",
                  subtitle: "Sales · 4.7★",
                  badge: "Shared",
                  highlight: "shared",
                },
                {
                  title: "Bug Report Summarizer",
                  stat: "41 uses",
                  iconColor: "amber",
                  subtitle: "Support · 4.6★",
                },
              ]}
              toasts={[
                {
                  message: "Prompt shared with Marketing team",
                  type: "shared",
                  position: "bottom-right",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Your team wastes hours rewriting the same prompts
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Scattered across Slack threads, Google Docs, and sticky notes,
              your best prompts are invisible. New hires start from zero.
              Nobody knows which prompts actually work.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20 p-6">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                73%
              </div>
              <p className="text-sm font-medium mb-1">Duplicated effort</p>
              <p className="text-sm text-muted-foreground">
                of teams have multiple people writing the same prompts
                independently, wasting hours every week.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 p-6">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                45 min
              </div>
              <p className="text-sm font-medium mb-1">Lost daily per person</p>
              <p className="text-sm text-muted-foreground">
                searching for, writing, and testing prompts that someone on the
                team already perfected.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30 p-6">
              <div className="text-3xl font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                0
              </div>
              <p className="text-sm font-medium mb-1">Visibility</p>
              <p className="text-sm text-muted-foreground">
                into which prompts produce the best results, which get used
                most, or where teams struggle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works — step flow ── */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              From scattered prompts to shared library in{" "}
              <span className="text-primary">four steps</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="relative">
                {/* Connector line (hidden on last item and on mobile) */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+28px)] right-[-28px] h-px bg-gradient-to-r from-primary/40 to-primary/10" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-[11px] font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Template System visual ── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left: Visual showing template with variables */}
            <div className="mb-12 lg:mb-0">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                {/* Title bar */}
                <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                  <Variable className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">
                    Customer Follow-Up Template
                  </span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    Template
                  </span>
                </div>
                {/* Template body */}
                <div className="p-5 text-sm leading-relaxed font-mono text-muted-foreground">
                  <p>
                    Write a follow-up email to{" "}
                    <span className="bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded">
                      {"{{customer_name}}"}
                    </span>{" "}
                    about their recent purchase of{" "}
                    <span className="bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded">
                      {"{{product}}"}
                    </span>
                    .
                  </p>
                  <p className="mt-3">
                    Tone:{" "}
                    <span className="bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded">
                      {"{{tone}}"}
                    </span>
                  </p>
                  <p className="mt-3">
                    Include a mention of our{" "}
                    <span className="bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded">
                      {"{{upcoming_feature}}"}
                    </span>{" "}
                    launch and ask for feedback on their experience.
                  </p>
                </div>
                {/* Variable fill form */}
                <div className="px-5 py-4 border-t border-border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground min-w-[120px]">
                      customer_name
                    </span>
                    <span className="flex-1 bg-background border border-border rounded-md px-3 py-1 text-foreground">
                      Sarah Chen
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground min-w-[120px]">
                      product
                    </span>
                    <span className="flex-1 bg-background border border-border rounded-md px-3 py-1 text-foreground">
                      Pro Plan
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground min-w-[120px]">
                      tone
                    </span>
                    <span className="flex-1 bg-background border border-border rounded-md px-3 py-1 text-foreground">
                      Friendly, professional
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy */}
            <div>
              <SectionLabel>Template System</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Variables make every prompt{" "}
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  reusable
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Add placeholders like{" "}
                <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
                  {"{{customer_name}}"}
                </code>{" "}
                to any prompt. When team members use the prompt, they fill in
                the blanks and get a perfectly customized message every time.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Consistent output quality across the team",
                  "New hires produce expert-level prompts on day one",
                  "Variables auto-populate in the extension",
                  "Version history tracks every change",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>Everything You Need</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              A complete prompt management platform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From creation to analytics, TeamPrompt covers the entire
              prompt lifecycle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Search}
              title="Search & Browse"
              description="Find any prompt by keyword, category, or tag. Filter by team, rating, or popularity. Instant results."
            />
            <FeatureCard
              icon={Tag}
              title="Tags & Categories"
              description="Organize prompts by department, use case, AI tool, or any taxonomy your team needs. Custom tags supported."
            />
            <FeatureCard
              icon={PackageOpen}
              title="Template Packs"
              description="Pre-built prompt collections for common workflows: sales outreach, code review, customer support, and more."
            />
            <FeatureCard
              icon={MousePointerClick}
              title="1-Click Insert"
              description="The browser extension injects prompts directly into ChatGPT, Claude, or Gemini. No copy-paste needed."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Approval Workflow"
              description="Admins review and approve prompts before they enter the shared library. Maintain quality and compliance."
            />
            <FeatureCard
              icon={BarChart3}
              title="Usage Analytics"
              description="See which prompts are most popular, highest-rated, and most effective. Data-driven prompt optimization."
            />
          </div>
        </div>
      </section>

      {/* ── Template Packs + AI Chat Highlight (two-col) ── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Template Packs */}
            <div className="rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-5">
                <FolderOpen className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Ready-Made Template Packs
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Get started fast with curated prompt collections for common
                business workflows. Install a pack and your team is productive
                immediately.
              </p>
              <div className="space-y-2.5">
                {[
                  { name: "Sales Outreach", count: "12 prompts" },
                  { name: "Customer Support", count: "9 prompts" },
                  { name: "Code Review", count: "8 prompts" },
                  { name: "Marketing Copy", count: "14 prompts" },
                ].map((pack) => (
                  <div
                    key={pack.name}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium">{pack.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {pack.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Built-in AI Chat */}
            <div className="rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Built-In AI Chat
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Use your prompts directly inside TeamPrompt without switching
                tools. Our built-in AI chat supports multiple models and keeps
                everything in one place.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: Star,
                    label: "Use library prompts in chat with one click",
                  },
                  {
                    icon: History,
                    label: "Full conversation history and search",
                  },
                  {
                    icon: Users,
                    label: "All usage tracked in team analytics",
                  },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <feature.icon className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-muted-foreground">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Stats ── */}
      <DarkSection gradient="center" className="mx-4 sm:mx-6 lg:mx-auto lg:max-w-6xl">
        <div className="py-6 sm:py-10">
          <div className="grid sm:grid-cols-3 gap-10 text-center">
            <div>
              <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                30 min
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                saved per employee per day
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                3x
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                faster AI adoption across teams
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                &lt;5 min
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                to set up your first shared library
              </p>
            </div>
          </div>
        </div>
      </DarkSection>

      {/* ── Onboarding / Seed Prompts ── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <SectionLabel>Quick Start</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Hit the ground running with{" "}
                <span className="text-primary">seed prompts</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                During onboarding, choose your industry and TeamPrompt
                populates your library with battle-tested prompts from day
                one. Your team can start using AI effectively before they
                write a single prompt.
              </p>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                >
                  Try it free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Industry selector visual */}
            <div className="mt-12 lg:mt-0">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <p className="text-sm font-semibold mb-4">
                  Choose your industry to get started:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: "SaaS / Tech", prompts: "24 prompts", active: true },
                    { name: "Marketing Agency", prompts: "18 prompts", active: false },
                    { name: "E-commerce", prompts: "16 prompts", active: false },
                    { name: "Healthcare", prompts: "12 prompts", active: false },
                    { name: "Finance", prompts: "14 prompts", active: false },
                    { name: "Education", prompts: "10 prompts", active: false },
                  ].map((industry) => (
                    <div
                      key={industry.name}
                      className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                        industry.active
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="block font-medium text-foreground">
                        {industry.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {industry.prompts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl font-medium text-foreground leading-relaxed">
            &ldquo;Our team went from scattered Google Docs to a proper prompt
            library in one afternoon. Everyone gets better AI outputs now, and
            new hires are productive with AI on day one.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              Operations Manager
            </span>{" "}
            &mdash; Growth-Stage SaaS Startup
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={faqs} />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.12),transparent)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to build your team&apos;s{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              prompt library
            </span>
            ?
          </h2>
          <p className="mt-6 text-lg text-zinc-400 max-w-lg mx-auto">
            Import existing prompts or start fresh with industry-specific
            templates. Your team will be sharing prompts in minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-lg font-medium text-zinc-300 hover:text-white hover:border-white/30 transition-colors"
            >
              View Pricing
            </Link>
          </div>
          <p className="mt-5 text-sm text-zinc-500">
            No credit card &middot; 2 min setup &middot; Cancel anytime
          </p>

          <div className="mt-10 max-w-2xl mx-auto rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <p className="text-sm text-zinc-300 leading-relaxed text-center">
              ChatGPT, Claude, and Gemini don&apos;t come with shared prompt libraries, DLP, or admin audit trails — even on team plans at $25-30/user/mo.{" "}
              <span className="text-white font-semibold">TeamPrompt adds all three for $8/user/mo.</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
