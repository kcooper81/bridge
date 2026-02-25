import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateFAQSchema } from "@/lib/seo/schemas";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import { SectionLabel } from "@/components/marketing/section-label";
import { Search } from "lucide-react";
import { SupportForm } from "./_components/support-form";
import { HelpDocs } from "./_components/help-docs";
import { HELP_FAQS, HELP_OVERVIEW } from "@/lib/help-content";

export const metadata: Metadata = generatePageMetadata({
  title: "Help & Documentation",
  description:
    "Complete documentation for TeamPrompt — setup guides, prompt management, guardrails, team administration, billing, and more.",
  path: "/help",
  keywords: ["TeamPrompt documentation", "help center", "getting started guide"],
});

export default function HelpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(HELP_FAQS)),
        }}
      />

      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-16 sm:mb-20">
            <SectionLabel className="text-center">Documentation</SectionLabel>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {HELP_OVERVIEW.title}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {HELP_OVERVIEW.subtitle}
            </p>
          </div>

          {/* Overview */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                What is TeamPrompt?
              </h2>
              {HELP_OVERVIEW.description.map((para, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Documentation — navigable views */}
          <div className="mb-24">
            <HelpDocs />
          </div>

          {/* FAQ */}
          <div className="mb-24">
            <FAQSection faqs={HELP_FAQS} />
          </div>

          {/* Support Form */}
          <div className="max-w-2xl mx-auto mb-24">
            <SectionLabel className="text-center">Contact Us</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              Send us a message
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Have a question, found a bug, or want to request a feature? Fill
              out the form below and we&apos;ll get back to you.
            </p>
            <SupportForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Prefer email? Reach us at{" "}
              <a
                href="mailto:support@teamprompt.app"
                className="text-primary hover:underline"
              >
                support@teamprompt.app
              </a>
            </p>
          </div>

          {/* CTA */}
          <CTASection
            headline="Ready to give your team"
            gradientText="a proper prompt system?"
            subtitle="Set up your workspace in under two minutes. No credit card needed."
          />
        </div>
      </div>
    </>
  );
}
