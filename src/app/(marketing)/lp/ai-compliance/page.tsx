import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  FileCheck,
  ClipboardList,
  ArrowRight,
  Quote,
} from "lucide-react";
import { AppMockup } from "@/components/marketing/app-mockup";

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
    ],
    alternates: { canonical: `${SITE_URL}/lp/ai-compliance` },
  };
}

const problemCards = [
  {
    icon: Shield,
    title: "Pre-Built Compliance Packs",
    description:
      "HIPAA, SOC 2, PCI-DSS, GDPR, and more — enable compliance rules with one click, no manual config needed.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: FileCheck,
    title: "Exportable Audit Reports",
    description:
      "Every AI interaction logged with full metadata. Generate compliance reports auditors actually accept.",
    color: "text-green-500 bg-green-500/10",
  },
  {
    icon: ClipboardList,
    title: "Automated Policy Enforcement",
    description:
      "PII, PHI, and sensitive data are scanned and blocked automatically — no manual review required.",
    color: "text-purple-500 bg-purple-500/10",
  },
];

export default function AiComplianceLandingPage() {
  return (
    <>
      {/* Hero — dark background with two-column layout */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-400 tracking-wide uppercase mb-4">
              AI Compliance & Governance
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Your AI Usage Isn&apos;t Audit-Ready. Yet.
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg">
              HIPAA, SOC 2, PCI-DSS — auditors want proof that AI usage is
              controlled. TeamPrompt gives you the audit trail, policy
              enforcement, and compliance packs to pass any review.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              No credit card &middot; 2 min setup &middot; Cancel anytime
            </p>
          </div>
          <div className="mt-10 lg:mt-0">
            <AppMockup
              variant="guardrails"
              items={[
                {
                  title: "HIPAA Compliance Pack",
                  badge: "Approved",
                  stat: "Enabled",
                  iconColor: "green",
                  subtitle: "PHI · PII · Block",
                },
                {
                  title: "SOC 2 Type II Rules",
                  badge: "Approved",
                  stat: "Enabled",
                  iconColor: "blue",
                  subtitle: "Access Controls · Audit",
                },
                {
                  title: "PCI-DSS Card Data",
                  badge: "Blocked",
                  stat: "4 blocked",
                  iconColor: "red",
                  subtitle: "Card Numbers · Block",
                  highlight: "block",
                },
                {
                  title: "GDPR Personal Data",
                  badge: "Warning",
                  stat: "2 flagged",
                  iconColor: "amber",
                  subtitle: "EU Residents · Warn",
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

      {/* Problem cards — white background */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            How TeamPrompt Makes You Audit-Ready
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Purpose-built for regulated industries — healthcare, finance,
            legal, and government.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {problemCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stat section — full-width colored background */}
      <section className="py-16 sm:py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-6xl sm:text-8xl font-bold">19</p>
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-lg mx-auto">
            compliance packs ready out of the box
          </p>
        </div>
      </section>

      {/* Testimonial — light gray background */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl italic text-foreground leading-relaxed">
            &ldquo;We went from zero AI governance to audit-ready in an
            afternoon. The compliance packs saved us months of work.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm font-semibold text-foreground">
            — Compliance Officer, Healthcare Organization
          </p>
        </div>
      </section>

      {/* Final CTA — dark background */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to become audit-ready?
          </h2>
          <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
            Enable compliance packs in one click. Pass your next audit with
            confidence.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-sm text-zinc-500">
              No credit card &middot; 2 min setup &middot; Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
