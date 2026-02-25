import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateFAQSchema } from "@/lib/seo/schemas";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import { SectionLabel } from "@/components/marketing/section-label";
import { SupportForm } from "./_components/support-form";
import { HelpSearch } from "./_components/help-search";
import { HELP_FAQS, HELP_OVERVIEW, HELP_CATEGORIES } from "@/lib/help-content";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

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

            {/* Search */}
            <div className="mt-8 max-w-xl mx-auto">
              <HelpSearch />
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24">
            {HELP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/help/${cat.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 text-left hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                      {cat.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cat.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {cat.articles.length} articles
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              );
            })}
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
