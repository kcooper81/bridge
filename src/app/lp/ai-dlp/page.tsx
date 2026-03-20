import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

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

export default function AiDlpLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Your Employees Are Leaking Data
            <br />
            to ChatGPT Right Now
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            API keys, customer PII, and proprietary source code are being pasted
            into AI tools every day. TeamPrompt blocks it in real time — before
            anything leaves the browser.
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
            Trusted by security teams at 100+ companies
          </p>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            How TeamPrompt Stops Data Leaks
          </h2>
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                Employees paste API keys and secrets — TeamPrompt detects and blocks them instantly
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                Customer PII slips into prompts — TeamPrompt scans for SSNs, emails, and personal data in real time
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                Source code gets shared without oversight — TeamPrompt enforces DLP policies across ChatGPT, Claude, and Gemini
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stat + Testimonial */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-5xl sm:text-6xl font-bold text-primary">77%</p>
          <p className="mt-3 text-lg text-muted-foreground max-w-lg mx-auto">
            of employees have shared sensitive data with AI tools
          </p>
          <blockquote className="mt-12 text-xl italic text-muted-foreground max-w-xl mx-auto">
            &ldquo;Finally, visibility into what our team sends to AI. We caught
            API keys in prompts within the first hour.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm font-medium text-foreground">
            — Security Lead, Series B SaaS Company
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
