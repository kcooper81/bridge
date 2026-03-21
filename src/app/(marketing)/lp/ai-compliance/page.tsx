import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  FileCheck,
  ClipboardList,

  Eye,
  Download,
  Globe,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Stethoscope,
  Scale,
  GraduationCap,
  Search,
  ScanLine,
  Ban,
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
      "AI Compliance for HIPAA, SOC 2 & PCI-DSS — Governance Made Simple | TeamPrompt",
    description:
      "Prove your team's AI usage is controlled. TeamPrompt provides audit trails, PII detection, and pre-built compliance packs for HIPAA, SOC 2, PCI-DSS, and GDPR.",
    keywords: [
      "AI compliance",
      "HIPAA AI",
      "SOC 2 AI",
      "AI governance tool",
      "PCI-DSS AI compliance",
      "GDPR AI",
      "AI audit trail",
      "AI compliance software",
      "AI policy enforcement",
      "regulated AI usage",
    ],
    alternates: { canonical: `${SITE_URL}/lp/ai-compliance` },
  };
}

/* ── Data ── */

const complianceFrameworks = [
  {
    framework: "HIPAA",
    industry: "Healthcare",
    capabilities: ["PHI detection", "Access controls", "Audit logging"],
    status: "Full coverage",
  },
  {
    framework: "SOC 2 Type II",
    industry: "Technology",
    capabilities: ["Access monitoring", "Change management", "Data integrity"],
    status: "Full coverage",
  },
  {
    framework: "PCI-DSS",
    industry: "Finance",
    capabilities: ["Card data blocking", "Encryption checks", "Access logs"],
    status: "Full coverage",
  },
  {
    framework: "GDPR",
    industry: "All (EU)",
    capabilities: ["PII scanning", "Data minimization", "Right to erasure"],
    status: "Full coverage",
  },
  {
    framework: "FERPA",
    industry: "Education",
    capabilities: ["Student data protection", "Access restrictions", "Consent tracking"],
    status: "Full coverage",
  },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Choose your frameworks",
    description:
      "Select from 19+ pre-built compliance packs — HIPAA, SOC 2, PCI-DSS, GDPR, and more. Enable with one click.",
    icon: Shield,
  },
  {
    step: "02",
    title: "Policies enforce automatically",
    description:
      "Every AI interaction is scanned in real time. Sensitive data is blocked, warned, or redacted based on your rules.",
    icon: ScanLine,
  },
  {
    step: "03",
    title: "Generate audit reports",
    description:
      "Export compliance reports with full metadata — who sent what, when, and what was blocked. Auditors accept them.",
    icon: Download,
  },
];

const faqs = [
  {
    question: "Which compliance frameworks does TeamPrompt support?",
    answer:
      "TeamPrompt ships with 19+ pre-built compliance packs covering HIPAA, SOC 2 Type II, PCI-DSS, GDPR, FERPA, CCPA, GLBA, and more. Each pack includes industry-specific guardrail rules, data detection patterns, and enforcement actions. You can also create custom rules using regex patterns, sensitive term lists, and entropy detection.",
  },
  {
    question: "How does the DLP scanning work?",
    answer:
      "Every message sent through TeamPrompt (via the built-in AI chat or the browser extension) is scanned in real time before it reaches any AI model. The scanner detects PII, PHI, credit card numbers, API keys, and other sensitive data patterns. Depending on your policy, matches can be blocked entirely, flagged with a warning, or automatically redacted with Smart Redaction.",
  },
  {
    question: "Can I use TeamPrompt with existing AI tools like ChatGPT?",
    answer:
      "Yes. TeamPrompt includes a browser extension that works with ChatGPT, Claude, Gemini, and other AI tools. The extension scans every message before it leaves the browser, enforcing your compliance policies across all AI platforms your team uses — not just the built-in chat.",
  },
  {
    question: "What does the audit trail capture?",
    answer:
      "The audit trail logs every AI interaction with full metadata: the user, timestamp, AI model used, the full prompt and response, any guardrail violations detected, and the enforcement action taken (blocked, warned, or redacted). All logs are exportable as CSV or PDF for compliance reviews.",
  },
  {
    question: "How quickly can we get set up for our next audit?",
    answer:
      "Most teams go from zero AI governance to fully audit-ready in under an hour. Select your compliance packs, invite your team, and policies start enforcing immediately. There is no infrastructure to deploy — TeamPrompt is a SaaS platform with a browser extension.",
  },
];

export default function AiComplianceLandingPage() {
  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.18),transparent)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <SectionLabel dark>AI Compliance & Governance</SectionLabel>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08]">
              Make every AI interaction{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                audit-ready
              </span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed">
              Auditors want proof that AI usage is controlled. TeamPrompt gives
              you pre-built compliance packs, real-time DLP scanning, and a
              complete audit trail for HIPAA, SOC 2, PCI-DSS, and GDPR.
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
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-lg font-semibold hover:bg-white/5 transition-colors"
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
              activeNav="Guardrails"
              items={[
                {
                  title: "HIPAA Compliance Pack",
                  badge: "Approved",
                  stat: "Enabled",
                  iconColor: "green",
                  subtitle: "PHI \u00b7 PII \u00b7 Block",
                },
                {
                  title: "SOC 2 Type II Rules",
                  badge: "Approved",
                  stat: "Enabled",
                  iconColor: "blue",
                  subtitle: "Access Controls \u00b7 Audit",
                },
                {
                  title: "PCI-DSS Card Data",
                  badge: "Blocked",
                  stat: "4 blocked",
                  iconColor: "red",
                  subtitle: "Card Numbers \u00b7 Block",
                  highlight: "block",
                },
                {
                  title: "GDPR Personal Data",
                  badge: "Warning",
                  stat: "2 flagged",
                  iconColor: "amber",
                  subtitle: "EU Residents \u00b7 Warn",
                  highlight: "warn",
                },
              ]}
              toasts={[
                {
                  message: "PCI-DSS: card number blocked",
                  type: "block",
                  position: "bottom-right",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUST BAR ═══════════════════ */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <StatsRow
            stats={[
              { value: "19+", label: "Pre-built compliance packs" },
              { value: "100%", label: "Audit trail coverage" },
              { value: "<1hr", label: "Time to audit-ready" },
              { value: "3", label: "Enforcement modes" },
            ]}
          />
        </div>
      </section>

      {/* ═══════════════════ PROBLEM STATEMENT ═══════════════════ */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Your team is using AI.
              <br />
              <span className="text-muted-foreground">Can you prove it&apos;s compliant?</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Employees paste patient records, financial data, and customer PII
              into AI tools every day. Without guardrails, every conversation is
              a compliance risk.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No visibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You don&apos;t know what data your team is sending to AI tools,
                or which tools they&apos;re using.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4">
                <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No enforcement</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Policies exist on paper but nothing prevents a developer from
                pasting an API key into ChatGPT.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No audit trail</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When auditors ask for evidence of AI governance, you have
                nothing to show them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-muted/30" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Audit-ready in three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px border-t-2 border-dashed border-primary/20" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 relative">
                    <step.icon className="h-8 w-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ DLP SCANNING (Feature Deep-dive) ═══════════════════ */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <SectionLabel>Real-Time Protection</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                DLP scanning that actually{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  stops leaks
                </span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every prompt is scanned before it reaches the AI model. Choose
                how to handle violations — block, warn, or automatically redact
                with Smart Redaction.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: Ban,
                    title: "Block",
                    desc: "Prevent the message from being sent. The user sees exactly which rule triggered.",
                    color: "text-red-500 bg-red-500/10",
                  },
                  {
                    icon: AlertTriangle,
                    title: "Warn",
                    desc: "Flag the violation and let the user decide whether to proceed or edit their message.",
                    color: "text-amber-500 bg-amber-500/10",
                  },
                  {
                    icon: Fingerprint,
                    title: "Smart Redact",
                    desc: "Automatically replace sensitive data with placeholders. The original is never sent to the AI.",
                    color: "text-blue-500 bg-blue-500/10",
                  },
                ].map((mode) => (
                  <div key={mode.title} className="flex gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${mode.color} flex items-center justify-center shrink-0`}
                    >
                      <mode.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mode.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <AppMockup
                variant="guardrails"
                activeNav="Guardrails"
                items={[
                  {
                    title: "SSN Pattern Detection",
                    badge: "Blocked",
                    stat: "12 blocked",
                    iconColor: "red",
                    subtitle: "Regex \u00b7 xxx-xx-xxxx",
                    highlight: "block",
                  },
                  {
                    title: "Smart Redaction - PHI",
                    badge: "Approved",
                    stat: "Active",
                    iconColor: "blue",
                    subtitle: "Auto-redact \u00b7 Names, DOB",
                  },
                  {
                    title: "API Key Detection",
                    badge: "Blocked",
                    stat: "3 blocked",
                    iconColor: "red",
                    subtitle: "Entropy \u00b7 High-entropy strings",
                    highlight: "block",
                  },
                  {
                    title: "Email Address Warning",
                    badge: "Warning",
                    stat: "8 flagged",
                    iconColor: "amber",
                    subtitle: "PII \u00b7 User decides",
                    highlight: "warn",
                  },
                ]}
                toasts={[
                  {
                    message: "SSN detected and blocked",
                    type: "block",
                    position: "bottom-right",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPLIANCE FRAMEWORK TABLE ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <DarkSection gradient="right">
          <div className="max-w-5xl mx-auto">
            <SectionLabel dark className="text-center">
              Framework Coverage
            </SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
              Pre-built packs for every major framework
            </h2>
            <p className="text-center text-zinc-400 max-w-2xl mx-auto mb-10">
              Each compliance pack includes detection patterns, enforcement
              rules, and report templates tailored to the framework&apos;s
              requirements.
            </p>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-5 py-3 font-semibold text-zinc-300">
                      Framework
                    </th>
                    <th className="px-5 py-3 font-semibold text-zinc-300">
                      Industry
                    </th>
                    <th className="px-5 py-3 font-semibold text-zinc-300">
                      Key Capabilities
                    </th>
                    <th className="px-5 py-3 font-semibold text-zinc-300 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {complianceFrameworks.map((fw) => (
                    <tr
                      key={fw.framework}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-white">
                        {fw.framework}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {fw.industry}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {fw.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {fw.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {complianceFrameworks.map((fw) => (
                <div
                  key={fw.framework}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">
                      {fw.framework}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      {fw.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">{fw.industry}</p>
                  <div className="flex flex-wrap gap-1">
                    {fw.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-zinc-500 text-sm mt-6">
              + 14 more packs including CCPA, GLBA, NIST, ISO 27001, and
              industry-specific bundles
            </p>
          </div>
        </DarkSection>
      </div>

      {/* ═══════════════════ FEATURE GRID ═══════════════════ */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Capabilities</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need for AI governance
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Shield}
              title="Pre-Built Guardrail Rules"
              description="19+ compliance packs with detection patterns for PII, PHI, financial data, secrets, and more. Enable with one click."
            />
            <FeatureCard
              icon={ClipboardList}
              title="Full Audit Trail"
              description="Every AI interaction logged with user, timestamp, model, prompt, response, and enforcement action. Nothing is missed."
            />
            <FeatureCard
              icon={Fingerprint}
              title="Smart Redaction"
              description="Automatically replace sensitive data with safe placeholders before it reaches the AI. The original text never leaves your control."
            />
            <FeatureCard
              icon={Search}
              title="Custom Security Rules"
              description="Define your own rules with regex patterns, sensitive term lists, and entropy detection for high-randomness strings like API keys."
            />
            <FeatureCard
              icon={Download}
              title="Exportable Reports"
              description="Generate compliance reports as CSV or PDF. Structured for auditors with violation summaries, user activity, and policy coverage."
            />
            <FeatureCard
              icon={Globe}
              title="Browser Extension + AI Chat"
              description="Enforce policies across ChatGPT, Claude, Gemini, and more via the browser extension. Or use TeamPrompt's built-in AI chat."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════ INDUSTRY ONBOARDING ═══════════════════ */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-5 lg:gap-16 lg:items-start">
            <div className="lg:col-span-2 mb-12 lg:mb-0">
              <SectionLabel>Built for Your Industry</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Onboarding tailored to regulated industries
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                TeamPrompt understands that healthcare compliance is different
                from financial compliance. That&apos;s why onboarding
                automatically configures the right rules for your industry.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                Get started for your industry
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Stethoscope,
                  title: "Healthcare",
                  desc: "HIPAA packs, PHI detection, patient data blocking, BAA-ready audit exports.",
                  color: "bg-red-500/10",
                  iconColor: "text-red-500",
                },
                {
                  icon: Building2,
                  title: "Finance",
                  desc: "PCI-DSS card data rules, GLBA compliance, SOX audit trail, transaction data protection.",
                  color: "bg-blue-500/10",
                  iconColor: "text-blue-500",
                },
                {
                  icon: Scale,
                  title: "Legal",
                  desc: "Attorney-client privilege detection, case data protection, confidentiality enforcement.",
                  color: "bg-purple-500/10",
                  iconColor: "text-purple-500",
                },
                {
                  icon: GraduationCap,
                  title: "Education",
                  desc: "FERPA student data rules, minor PII protection, research data governance.",
                  color: "bg-green-500/10",
                  iconColor: "text-green-500",
                },
              ].map((industry) => (
                <div
                  key={industry.title}
                  className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${industry.color} flex items-center justify-center mb-4`}
                  >
                    <industry.icon
                      className={`h-5 w-5 ${industry.iconColor}`}
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {industry.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {industry.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SOCIAL PROOF / TESTIMONIAL ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <DarkSection gradient="center">
          <div className="max-w-3xl mx-auto text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-8">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed text-zinc-100">
              &ldquo;We went from zero AI governance to audit-ready in an
              afternoon. The compliance packs saved us months of policy
              work, and our SOC 2 auditor accepted the reports on the first
              review.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm font-semibold text-zinc-400">
              &mdash; Compliance Officer, Healthcare Organization
            </p>
          </div>
        </DarkSection>
      </div>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={faqs} />
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        {/* Grid dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.12),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <SectionLabel dark>Get Started Today</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Your next audit is coming.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Be ready for it.
            </span>
          </h2>
          <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto">
            Enable compliance packs in one click. Get a full audit trail from
            day one. Pass your next review with confidence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 transition-colors"
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
