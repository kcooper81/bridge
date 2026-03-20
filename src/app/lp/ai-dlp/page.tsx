import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Quote,
} from "lucide-react";
import { AppMockup } from "@/components/marketing/app-mockup";

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
    ],
    alternates: { canonical: `${SITE_URL}/lp/ai-dlp` },
  };
}

const problemCards = [
  {
    icon: Shield,
    title: "Block Credentials & Secrets",
    description:
      "API keys, tokens, and passwords are detected and blocked before they reach any AI tool.",
    color: "text-red-500 bg-red-500/10",
  },
  {
    icon: ShieldAlert,
    title: "Detect PII in Real Time",
    description:
      "SSNs, emails, phone numbers, and personal data are scanned and flagged instantly.",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Audit Every Interaction",
    description:
      "Full audit trail of who sent what, when, and to which AI tool — exportable for compliance.",
    color: "text-blue-500 bg-blue-500/10",
  },
];

export default function AiDlpLandingPage() {
  return (
    <>
      {/* Hero — dark background with two-column layout */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-400 tracking-wide uppercase mb-4">
              AI Data Loss Prevention
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Your Employees Are Leaking Data to ChatGPT Right Now
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg">
              API keys, customer PII, and proprietary source code are being
              pasted into AI tools every day. TeamPrompt blocks it in real
              time — before anything leaves the browser.
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
                  subtitle: "Credentials · Block",
                  highlight: "block",
                },
                {
                  title: "PII Detection",
                  badge: "Warning",
                  stat: "8 caught",
                  iconColor: "amber",
                  subtitle: "Personal Data · Warn",
                  highlight: "warn",
                },
                {
                  title: "Source Code Scanner",
                  badge: "Blocked",
                  stat: "3 blocked",
                  iconColor: "red",
                  subtitle: "Code · Block",
                  highlight: "block",
                },
                {
                  title: "PHI Detection",
                  stat: "0 today",
                  iconColor: "green",
                  subtitle: "HIPAA · Block",
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

      {/* Problem cards — white background */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            How TeamPrompt Stops Data Leaks
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Three layers of protection that work inside the browser — no
            proxy, no agent, no network changes.
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
          <p className="text-6xl sm:text-8xl font-bold">77%</p>
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-lg mx-auto">
            of employees have shared sensitive data with AI tools
          </p>
        </div>
      </section>

      {/* Testimonial — light gray background */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl italic text-foreground leading-relaxed">
            &ldquo;Finally, visibility into what our team sends to AI. We
            caught API keys in prompts within the first hour.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm font-semibold text-foreground">
            — Security Lead, Series B SaaS Company
          </p>
        </div>
      </section>

      {/* Final CTA — dark background */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to secure your AI usage?
          </h2>
          <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
            Deploy in 2 minutes. No network changes required.
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
