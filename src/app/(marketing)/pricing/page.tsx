import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import { SectionLabel } from "@/components/marketing/section-label";
import { PricingGrid } from "./_components/pricing-grid";
import { generateFAQSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generatePageMetadata({
  title: "Pricing",
  description:
    "Pick the plan that fits your team. Start free, no credit card required. All paid plans include a 14-day trial.",
  path: "/pricing",
});

const faqs = [
  {
    question: "Can I try paid plans before committing?",
    answer:
      "Yes. All paid plans include a 14-day free trial. You can explore every feature before deciding.",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      "Your workspace stays intact. You'll be moved to the Free plan until you choose to upgrade. No data is deleted.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Absolutely. Upgrade, downgrade, or cancel at any time from your workspace settings.",
  },
  {
    question: "Do you offer discounts for nonprofits or education?",
    answer:
      "Yes. Contact us at support@teamprompt.app and we'll set up a discounted plan for your organization.",
  },
  {
    question: "What counts as a 'member'?",
    answer:
      "Anyone with an active account in your workspace. Pending invitations don't count toward your limit.",
  },
  {
    question: "Is there an annual billing option?",
    answer:
      "Yes! Toggle to annual billing above to save 20% on any paid plan. Annual plans are billed once per year.",
  },
];

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-16 sm:mb-20">
          <SectionLabel className="text-center">Pricing</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Pick the plan that fits your team
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Start free, no credit card required. All paid plans include a
            14-day trial.
          </p>
        </div>

        {/* Plan grid with billing toggle (client component) */}
        <PricingGrid />

        {/* Enterprise */}
        <div className="mt-8 max-w-6xl mx-auto rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-lg font-semibold">
            Need more than 500 members?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact us at{" "}
            <a
              href="mailto:support@teamprompt.app"
              className="text-primary hover:underline"
            >
              support@teamprompt.app
            </a>{" "}
            for custom enterprise pricing.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <FAQSection faqs={faqs} />
        </div>

        {/* CTA */}
        <div className="mt-24">
          <CTASection
            headline="Ready to give your team"
            gradientText="a proper prompt system?"
            subtitle="Set up your workspace in under two minutes. No credit card needed."
          />
        </div>
      </div>
    </div>
    </>
  );
}
