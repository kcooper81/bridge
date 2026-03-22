import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  FileSearch,
  ClipboardList,
  Zap,
  Lock,
  Eye,
  Replace,
  Globe,
  MonitorSmartphone,
  Ban,
  AlertTriangle,
  FileText,
  CheckCircle2,
  X,
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
    title: "AI DLP — Prevent Data Leaks to ChatGPT & AI Tools | TeamPrompt",
    description:
      "Stop sensitive data from reaching AI tools. TeamPrompt scans every message for PII, secrets, and source code before it leaves your browser. HIPAA & SOC 2 ready.",
    keywords: [
      "AI DLP",
      "data loss prevention",
      "prevent data leaks ChatGPT",
      "DLP software",
      "AI data protection",
      "ChatGPT DLP",
      "AI security",
      "smart redaction AI",
      "AI audit trail",
      "file upload scanning AI",
    ],
    alternates: { canonical: `${SITE_URL}/lp/ai-dlp` },
  };
}

const faqs = [
  {
    question: "How does TeamPrompt intercept messages before they reach AI tools?",
    answer:
      "TeamPrompt uses a lightweight browser extension that sits between your team and AI tools like ChatGPT, Claude, and Gemini. Every message and file upload is scanned locally in the browser before it is sent. There is no proxy, no network rerouting, and no VPN required -- it works instantly after installation.",
  },
  {
    question: "What is smart redaction and how is it different from blocking?",
    answer:
      "Smart redaction automatically replaces sensitive data with safe placeholders (e.g., an API key becomes [API_KEY], an email becomes [EMAIL]) so the prompt still works but the real data never reaches the AI. Unlike blocking, which stops the entire message and disrupts workflows, redaction lets employees keep working productively while staying compliant.",
  },
  {
    question: "Which AI tools does TeamPrompt support?",
    answer:
      "TeamPrompt works with ChatGPT, Claude, Google Gemini, Microsoft Copilot, Perplexity, and more. The browser extension monitors all major AI platforms, and TeamPrompt also includes a built-in AI chat with the same DLP protection built in. New platforms are added regularly.",
  },
  {
    question: "How long does deployment take?",
    answer:
      "Most teams are fully deployed in under 5 minutes. Install the browser extension, invite your team, and configure your guardrail rules. There are no agents to install, no network changes, and no IT tickets required. Admins can push the extension via Chrome Enterprise policies for larger rollouts.",
  },
  {
    question: "Does TeamPrompt meet compliance requirements like HIPAA and SOC 2?",
    answer:
      "Yes. TeamPrompt provides a complete audit trail of every AI interaction -- who sent what, when, and to which tool. Logs are exportable for compliance reviews. The DLP scanning covers PHI, PII, credentials, and custom patterns, making it suitable for HIPAA, SOC 2, GDPR, and other regulatory frameworks.",
  },
];

export default function AiDlpLandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        {/* Gradient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.18),transparent)]" />
        {/* Dot pattern */}
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
            <SectionLabel dark>AI Data Loss Prevention</SectionLabel>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08]">
              Your team is leaking data to AI.{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Stop it in real time.
              </span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed">
              API keys, customer PII, and proprietary code are pasted into
              ChatGPT every day. TeamPrompt scans every message and file upload
              before anything leaves the browser -- block, warn, or
              auto-redact in milliseconds.
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 text-zinc-300 px-8 py-4 text-lg font-semibold hover:bg-zinc-800/50 transition-all"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              No credit card &middot; 2 min setup &middot; Cancel anytime
            </p>
          </div>
          <div className="mt-12 lg:mt-0">
            <AppMockup
              variant="guardrails"
              alertBanner={{
                type: "block",
                message: "2 sensitive items blocked today",
              }}
              items={[
                {
                  title: "Block API Keys",
                  badge: "Blocked",
                  stat: "12 blocked",
                  iconColor: "red",
                  subtitle: "Credentials \u00b7 Block",
                  highlight: "block",
                },
                {
                  title: "PII Detection",
                  badge: "Warning",
                  stat: "8 caught",
                  iconColor: "amber",
                  subtitle: "Personal Data \u00b7 Warn",
                  highlight: "warn",
                },
                {
                  title: "Source Code Scanner",
                  badge: "Blocked",
                  stat: "3 blocked",
                  iconColor: "red",
                  subtitle: "Code \u00b7 Block",
                  highlight: "block",
                },
                {
                  title: "PHI Detection",
                  stat: "0 today",
                  iconColor: "green",
                  subtitle: "HIPAA \u00b7 Block",
                },
              ]}
              toasts={[
                {
                  message: "API key blocked from ChatGPT",
                  type: "block",
                  position: "bottom-right",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Social proof stats ── */}
      <section className="py-12 sm:py-14 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StatsRow
            stats={[
              { value: "77%", label: "of employees share sensitive data with AI" },
              { value: "<2 min", label: "to deploy across your entire team" },
              { value: "5+", label: "AI platforms monitored simultaneously" },
              { value: "100%", label: "browser-based, no proxy or agent" },
            ]}
          />
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <SectionLabel>The problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Every AI conversation is a potential data leak
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Your team uses AI tools to move faster. But without guardrails,
              sensitive data flows out of your organization with every prompt.
            </p>
          </div>

          {/* Before / After comparison */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Without TeamPrompt */}
            <div className="rounded-2xl border-2 border-red-500/20 bg-red-50/30 dark:bg-red-950/10 p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X className="h-4 w-4 text-red-500" />
                </div>
                <h3 className="font-semibold text-red-600 dark:text-red-400">Without DLP</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Engineer pastes API keys into ChatGPT prompt",
                  "Support rep shares customer SSNs with Claude",
                  "Developer uploads proprietary codebase to Copilot",
                  "No visibility into what data left the org",
                  "Compliance violations discovered months later",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* With TeamPrompt */}
            <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">With TeamPrompt</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "API keys auto-redacted to [API_KEY] before sending",
                  "PII detected and replaced with safe placeholders",
                  "File uploads scanned before content extraction",
                  "Real-time dashboard shows every AI interaction",
                  "Instant alerts for policy violations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              From zero to protected in three steps
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  title: "Install the extension",
                  description:
                    "Add the TeamPrompt browser extension to Chrome or Edge. Takes 30 seconds, no IT tickets required. Push via Chrome Enterprise for larger teams.",
                  icon: MonitorSmartphone,
                },
                {
                  step: "02",
                  title: "Configure your rules",
                  description:
                    "Set up guardrails: choose what to block, what to warn on, and what to auto-redact. Pre-built templates for HIPAA, SOC 2, and common secrets.",
                  icon: Shield,
                },
                {
                  step: "03",
                  title: "Monitor & respond",
                  description:
                    "Watch the dashboard light up with real-time detections. Review the audit trail, export compliance reports, and refine policies as needed.",
                  icon: Eye,
                },
              ].map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    Step {item.step}
                  </span>
                  <h3 className="text-xl font-semibold mt-2 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core capabilities (mixed grid) ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <SectionLabel>Core capabilities</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three response modes, one policy engine
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Not all data leaks are created equal. TeamPrompt lets you choose
              the right response for each type of sensitive data.
            </p>
          </div>

          {/* Severity level cards -- horizontal layout */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="rounded-2xl border-2 border-red-500/20 bg-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Ban className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Block</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hard stop. The message is prevented from being sent entirely.
                Best for API keys, credentials, and trade secrets.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-amber-500/20 bg-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Warn</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The user sees a warning and can choose to proceed or cancel.
                Useful for internal names, project details, and partial matches.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-blue-500/20 bg-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Replace className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Redact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sensitive data is auto-replaced with safe placeholders like
                [EMAIL] or [API_KEY]. The prompt still works, but real data
                never reaches the AI.
              </p>
            </div>
          </div>

          {/* Feature cards -- asymmetric grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Zap}
              title="Real-Time Scanning"
              description="Every message is analyzed before it reaches the AI tool. Detection happens in the browser in milliseconds -- no round-trip to a server."
              large
            />
            <FeatureCard
              icon={FileSearch}
              title="File Upload Scanning"
              description="PDFs, DOCX files, spreadsheets, and code files are scanned before content extraction. Catches secrets hidden in attachments."
            />
            <FeatureCard
              icon={ClipboardList}
              title="Complete Audit Trail"
              description="Full log of who sent what, to which AI tool, and when. Exportable reports for SOC 2, HIPAA, and compliance reviews."
            />
            <FeatureCard
              icon={Globe}
              title="Works Everywhere"
              description="Monitors ChatGPT, Claude, Gemini, Copilot, Perplexity, and more. One extension covers all the AI tools your team uses."
            />
            <FeatureCard
              icon={Lock}
              title="No Proxy Required"
              description="Runs as a browser extension. No network changes, no VPN, no agent installation. Deploys in minutes, not months."
              large
            />
          </div>
        </div>
      </section>

      {/* ── Smart Redaction deep-dive (dark section with mockup) ── */}
      <section className="px-4 sm:px-6 pb-4">
        <DarkSection gradient="right">
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <SectionLabel dark>Smart Redaction</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Don&apos;t block productivity.{" "}
                <span className="text-blue-400">Redact the risk.</span>
              </h2>
              <p className="mt-4 text-zinc-400 text-lg leading-relaxed">
                Traditional DLP tools block the entire message when they detect
                sensitive data. TeamPrompt&apos;s smart redaction replaces only the
                sensitive tokens, so your team keeps working while staying compliant.
              </p>

              {/* Redaction example */}
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-2">
                    Before redaction
                  </p>
                  <p className="text-sm text-zinc-300 font-mono leading-relaxed">
                    Deploy to prod using key{" "}
                    <span className="text-red-400 bg-red-500/10 px-1 rounded">
                      sk-proj-abc123xyz
                    </span>{" "}
                    and email the results to{" "}
                    <span className="text-red-400 bg-red-500/10 px-1 rounded">
                      sarah@acme.com
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                    After redaction
                  </p>
                  <p className="text-sm text-zinc-300 font-mono leading-relaxed">
                    Deploy to prod using key{" "}
                    <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded">
                      [API_KEY]
                    </span>{" "}
                    and email the results to{" "}
                    <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded">
                      [EMAIL]
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <AppMockup
                variant="guardrails"
                items={[
                  {
                    title: "Smart Redaction",
                    badge: "Blocked",
                    stat: "23 redacted",
                    iconColor: "blue",
                    subtitle: "Auto-replace \u00b7 Redact",
                    highlight: "block",
                  },
                  {
                    title: "Email Addresses",
                    badge: "Blocked",
                    stat: "15 redacted",
                    iconColor: "blue",
                    subtitle: "PII \u00b7 Redact",
                    highlight: "block",
                  },
                  {
                    title: "API Keys & Tokens",
                    badge: "Blocked",
                    stat: "8 redacted",
                    iconColor: "red",
                    subtitle: "Credentials \u00b7 Block",
                    highlight: "block",
                  },
                  {
                    title: "Phone Numbers",
                    badge: "Warning",
                    stat: "4 warned",
                    iconColor: "amber",
                    subtitle: "PII \u00b7 Warn",
                    highlight: "warn",
                  },
                ]}
                toasts={[
                  {
                    message: "3 items auto-redacted in Claude",
                    type: "success",
                    position: "bottom-right",
                  },
                ]}
              />
            </div>
          </div>
        </DarkSection>
      </section>

      {/* ── Built-in AI Chat ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="order-2 lg:order-1 mt-10 lg:mt-0">
              <AppMockup
                variant="vault"
                activeNav="AI Chat"
                items={[
                  {
                    title: "Summarize Q3 customer feedback",
                    stat: "just now",
                    iconColor: "purple",
                    subtitle: "GPT-4o",
                  },
                  {
                    title: "Draft incident response plan",
                    stat: "2m ago",
                    iconColor: "blue",
                    subtitle: "Claude 3.5",
                  },
                  {
                    title: "Analyze support ticket trends",
                    stat: "15m ago",
                    iconColor: "cyan",
                    subtitle: "GPT-4o",
                  },
                ]}
                toasts={[
                  {
                    message: "DLP active on all messages",
                    type: "success",
                    position: "top-right",
                  },
                ]}
              />
            </div>
            <div className="order-1 lg:order-2">
              <SectionLabel>Built-in AI Chat</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                An AI chat that&apos;s{" "}
                <span className="text-primary">secure by default</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                TeamPrompt includes a built-in AI chat with the same DLP
                protection baked in. Your team gets a powerful AI assistant
                where every message is scanned before it is sent -- no
                extension needed, no separate tool to manage.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Same guardrail rules apply automatically",
                  "Full audit trail for every conversation",
                  "Access GPT-4o, Claude, and more from one interface",
                  "Shared prompt library for consistent AI usage",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform support strip ── */}
      <section className="py-12 sm:py-14 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            Works on every major AI platform
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {["ChatGPT", "Claude", "Gemini", "Microsoft Copilot", "Perplexity"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg sm:text-xl font-semibold text-foreground/60"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <blockquote className="text-xl sm:text-2xl italic text-foreground leading-relaxed">
            &ldquo;We deployed TeamPrompt on a Friday and caught three API keys
            in production prompts by Monday morning. The smart redaction means
            our engineers never even notice it&apos;s there -- they just keep
            working.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm font-semibold text-foreground">
            -- VP of Engineering, Series B SaaS Company
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 sm:px-6 pb-4">
        <FAQSection faqs={faqs} />
      </section>

      {/* ── Final CTA ── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.12),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Stop the leaks.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Keep the productivity.
            </span>
          </h2>
          <p className="mt-6 text-lg text-zinc-400 max-w-lg mx-auto">
            Deploy AI DLP in 2 minutes. No network changes, no proxy, no
            disruption. Your team keeps using AI -- safely.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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

          <div className="mt-10 max-w-2xl mx-auto rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <p className="text-sm text-zinc-300 leading-relaxed text-center">
              ChatGPT, Claude, and Gemini don&apos;t come with DLP, shared prompt libraries, or admin audit trails — even on team plans at $25-30/user/mo.{" "}
              <span className="text-white font-semibold">TeamPrompt adds all three for $8/user/mo.</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
