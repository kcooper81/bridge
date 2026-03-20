import type { Metadata } from "next";
import Link from "next/link";
import { Library, Zap, BarChart3, ArrowRight, Quote } from "lucide-react";
import { AppMockup } from "@/components/marketing/app-mockup";

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

const problemCards = [
  {
    icon: Library,
    title: "Searchable Prompt Library",
    description:
      "Organize prompts by category, tag, and team. Search and insert the right prompt in seconds, not minutes.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "1-Click Insert Anywhere",
    description:
      "Insert prompts directly into ChatGPT, Claude, or Gemini with a single click from the browser extension.",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics & Insights",
    description:
      "See which prompts get the best results. Track usage, ratings, and adoption across your entire team.",
    color: "text-green-500 bg-green-500/10",
  },
];

export default function PromptLibraryLandingPage() {
  return (
    <>
      {/* Hero — dark background with two-column layout */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-400 tracking-wide uppercase mb-4">
              Team Prompt Library
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Your Team Writes the Same Prompts Over and Over
            </h1>
            <p className="mt-6 text-lg text-zinc-400 max-w-lg">
              Every employee reinvents prompts from scratch. No sharing, no
              standards, no way to track what works. TeamPrompt&apos;s shared
              prompt library fixes that in minutes.
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

      {/* Problem cards — white background */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            How TeamPrompt Standardizes Your AI Prompts
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            From scattered Google Docs to a proper prompt library — set up in
            an afternoon, adopted by the whole team.
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
          <p className="text-6xl sm:text-8xl font-bold">30min</p>
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-lg mx-auto">
            saved per employee per day with shared prompts
          </p>
        </div>
      </section>

      {/* Testimonial — light gray background */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl italic text-foreground leading-relaxed">
            &ldquo;Our team went from scattered Google Docs to a proper prompt
            library in one afternoon. Everyone gets better AI outputs
            now.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm font-semibold text-foreground">
            — Operations Manager, Growth-Stage Startup
          </p>
        </div>
      </section>

      {/* Final CTA — dark background */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to build your team&apos;s prompt library?
          </h2>
          <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
            Import existing prompts or start fresh. Your team will thank you.
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
