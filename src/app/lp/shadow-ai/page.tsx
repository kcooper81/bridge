import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Monitor, Lock, ArrowRight, Quote } from "lucide-react";
import { AppMockup } from "@/components/marketing/app-mockup";

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

const problemCards = [
  {
    icon: Eye,
    title: "Full Visibility Dashboard",
    description:
      "See every AI tool your team uses — ChatGPT, Claude, Gemini, Copilot, and Perplexity — from one dashboard.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Monitor,
    title: "Control & Restrict Access",
    description:
      "Allow, restrict, or block specific AI platforms. Set granular policies per team, role, or department.",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: Lock,
    title: "Complete Audit Trail",
    description:
      "Log every AI conversation with who, what, when, and which tool. Export reports for compliance reviews.",
    color: "text-purple-500 bg-purple-500/10",
  },
];

export default function ShadowAiLandingPage() {
  return (
    <>
      {/* Hero — dark background with two-column layout */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-400 tracking-wide uppercase mb-4">
              Shadow AI Monitoring
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              You Have No Idea Which AI Tools Your Team Is Using
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg">
              Employees are using ChatGPT, Claude, and other AI tools without
              IT approval. You have zero visibility into what data they are
              sharing. TeamPrompt changes that in minutes.
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
              activeNav="Activity Log"
              items={[
                {
                  title: "ChatGPT Usage",
                  badge: "Warning",
                  stat: "142 msgs",
                  iconColor: "amber",
                  subtitle: "12 users · Unrestricted",
                  highlight: "warn",
                },
                {
                  title: "Claude Sessions",
                  stat: "87 msgs",
                  iconColor: "blue",
                  subtitle: "8 users · Approved",
                },
                {
                  title: "Gemini Activity",
                  badge: "Blocked",
                  stat: "23 attempts",
                  iconColor: "red",
                  subtitle: "5 users · Not Approved",
                  highlight: "block",
                },
                {
                  title: "Copilot Usage",
                  stat: "56 msgs",
                  iconColor: "green",
                  subtitle: "6 users · Approved",
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

      {/* Problem cards — white background */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            How TeamPrompt Eliminates Shadow AI
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            A lightweight browser extension that gives IT and security teams
            instant visibility — no proxy or network changes needed.
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
          <p className="text-6xl sm:text-8xl font-bold">60%</p>
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-lg mx-auto">
            of employees use AI tools without IT approval
          </p>
        </div>
      </section>

      {/* Testimonial — light gray background */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl italic text-foreground leading-relaxed">
            &ldquo;We had no idea how many AI tools our team was using until
            TeamPrompt showed us. Now we have full control.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm font-semibold text-foreground">
            — IT Director, Mid-Market Enterprise
          </p>
        </div>
      </section>

      {/* Final CTA — dark background */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to see what your team is really using?
          </h2>
          <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
            Deploy in 2 minutes. Full visibility from day one.
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
