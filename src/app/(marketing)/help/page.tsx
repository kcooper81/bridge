import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateFAQSchema } from "@/lib/seo/schemas";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import { SectionLabel } from "@/components/marketing/section-label";
import { ChevronDown, Search } from "lucide-react";
import { SupportForm } from "./_components/support-form";
import { HELP_CATEGORIES, HELP_FAQS, HELP_OVERVIEW } from "@/lib/help-content";

export const metadata: Metadata = generatePageMetadata({
  title: "Help & Documentation",
  description:
    "Complete documentation for TeamPrompt — setup guides, prompt management, guardrails, team administration, billing, and more.",
  path: "/help",
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

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-16">
            {HELP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center hover:bg-muted/50 hover:border-primary/20 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{cat.title}</span>
                </a>
              );
            })}
          </div>

          {/* Documentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
            {HELP_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <details
                  key={cat.id}
                  id={cat.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden scroll-mt-24"
                >
                  <summary className="flex items-center gap-4 p-6 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold">{cat.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 space-y-5">
                    {cat.articles.map((article) => (
                      <div key={article.q}>
                        <h3 className="font-medium text-sm">{article.q}</h3>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {article.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
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
