import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

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

export default function AiComplianceLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Your AI Usage Isn&apos;t Audit-Ready.
            <br />
            Yet.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            HIPAA, SOC 2, PCI-DSS — auditors want proof that AI usage is
            controlled. TeamPrompt gives you the audit trail, policy
            enforcement, and compliance packs to pass any review.
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
            Trusted by compliance teams in healthcare, finance, and legal
          </p>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
            How TeamPrompt Makes You Audit-Ready
          </h2>
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                HIPAA / SOC 2 / PCI-DSS gaps in AI usage — TeamPrompt ships 19 compliance packs you enable with one click
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                No proof of controls for auditors — TeamPrompt logs every AI interaction with full metadata and exportable reports
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-lg text-muted-foreground">
                PII slipping through undetected — TeamPrompt scans and blocks sensitive data before it reaches any AI tool
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stat + Testimonial */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-5xl sm:text-6xl font-bold text-primary">19</p>
          <p className="mt-3 text-lg text-muted-foreground max-w-lg mx-auto">
            compliance packs ready out of the box
          </p>
          <blockquote className="mt-12 text-xl italic text-muted-foreground max-w-xl mx-auto">
            &ldquo;We went from zero AI governance to audit-ready in an
            afternoon. The compliance packs saved us months of work.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm font-medium text-foreground">
            — Compliance Officer, Healthcare Organization
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
