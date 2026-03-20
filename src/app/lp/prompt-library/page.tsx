import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

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

export default function PromptLibraryLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Your Team Writes the Same Prompts
            <br />
            Over and Over
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every employee reinvents prompts from scratch. No sharing, no
            standards, no way to track what works. TeamPrompt&apos;s shared prompt
            library fixes that in minutes.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg"
            >
              Start Free Trial
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card &middot; 2 min setup &middot; Cancel anytime
            </p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Trusted by teams at 100+ companies
          </p>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            How TeamPrompt Standardizes Your AI Prompts
          </h2>
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                No way to share prompts — TeamPrompt gives your team a searchable library with categories, tags, and favorites
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                No quality standards — TeamPrompt includes approval workflows so admins review prompts before they go live
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                No tracking of what works — TeamPrompt shows usage analytics so you know which prompts drive the best results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stat + Testimonial */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-5xl sm:text-6xl font-bold text-primary">30 min</p>
          <p className="mt-3 text-lg text-muted-foreground max-w-lg mx-auto">
            saved per employee per day with shared prompts
          </p>
          <blockquote className="mt-12 text-xl italic text-muted-foreground max-w-xl mx-auto">
            &ldquo;Our team went from scattered Google Docs to a proper prompt
            library in one afternoon. Everyone gets better AI outputs now.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm font-medium text-foreground">
            — Operations Manager, Growth-Stage Startup
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to secure your AI usage?
          </h2>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 shadow-lg"
            >
              Start Free Trial
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card &middot; 2 min setup &middot; Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
