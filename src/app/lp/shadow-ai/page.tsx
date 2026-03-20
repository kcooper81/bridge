import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

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

export default function ShadowAiLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            You Have No Idea Which AI Tools
            <br />
            Your Team Is Using
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Employees are using ChatGPT, Claude, and other AI tools without IT
            approval. You have zero visibility into what data they are sharing.
            TeamPrompt changes that in minutes.
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
            Trusted by IT and security teams at 100+ companies
          </p>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            How TeamPrompt Eliminates Shadow AI
          </h2>
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                No visibility into AI usage — TeamPrompt monitors ChatGPT, Claude, Gemini, Copilot, and Perplexity from one dashboard
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                No control over which tools are used — TeamPrompt lets you allow, restrict, or block specific AI platforms
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                No audit trail of AI interactions — TeamPrompt logs every conversation with who, what, when, and which tool
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stat + Testimonial */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-5xl sm:text-6xl font-bold text-primary">60%</p>
          <p className="mt-3 text-lg text-muted-foreground max-w-lg mx-auto">
            of employees use AI tools without IT approval
          </p>
          <blockquote className="mt-12 text-xl italic text-muted-foreground max-w-xl mx-auto">
            &ldquo;We had no idea how many AI tools our team was using until
            TeamPrompt showed us. Now we have full control.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm font-medium text-foreground">
            — IT Director, Mid-Market Enterprise
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
