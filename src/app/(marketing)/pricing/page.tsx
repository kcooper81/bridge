import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { FAQSection } from "@/components/marketing/faq-section";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { PricingGrid } from "./_components/pricing-grid";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generatePageMetadata({
  title: "Pricing — Plans for Every Team Size",
  description:
    "Start free, no credit card required. Pro and Team plans include a 14-day trial. Upgrade when your team grows.",
  path: "/pricing",
  keywords: ["TeamPrompt pricing", "AI tool pricing", "AI DLP pricing", "AI security pricing", "AI governance pricing"],
});

const faqs = [
  {
    question: "Can I try paid plans before committing?",
    answer:
      "Yes. Pro and Team plans include a 14-day free trial — no credit card required to start. Business plans start immediately without a trial.",
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

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Pricing", url: "https://teamprompt.app/pricing" },
]);

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs),
        }}
      />
    {/* Hero — Light, Lumia-inspired */}
    <section className="border-b border-border" style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 50%, #fff 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight">
          Start free.{" "}
          <span className="text-primary">Upgrade when your team grows.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          No credit card required. Pro and Team plans include a
          14-day trial.
        </p>
      </div>
    </section>

    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

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

        {/* What AI tools are missing */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-2">
            What ChatGPT, Claude, and Gemini are missing
          </h2>
          <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto text-sm">
            Even on team plans at $25-30/user/mo, AI tools don&apos;t include DLP, shared prompts, or audit trails. TeamPrompt adds what they&apos;re missing.
          </p>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-3 text-sm">
              {/* Header */}
              <div className="px-5 py-3 border-b border-border bg-muted/40 font-semibold" />
              <div className="px-5 py-3 border-b border-border bg-muted/40 text-center font-semibold">
                AI Team Plans
                <span className="block text-xs font-normal text-muted-foreground">ChatGPT, Claude, Gemini</span>
              </div>
              <div className="px-5 py-3 border-b border-border bg-primary/5 text-center font-semibold text-primary">
                + TeamPrompt
                <span className="block text-xs font-normal text-muted-foreground">Add for $8/user/mo</span>
              </div>
              {/* Price */}
              <div className="px-5 py-3 border-b border-border text-muted-foreground">
                Price
              </div>
              <div className="px-5 py-3 border-b border-border text-center">
                $25-30/user/mo
              </div>
              <div className="px-5 py-3 border-b border-border bg-primary/5 text-center font-semibold text-primary">
                $8/user/mo
              </div>
              {/* Rows */}
              {[
                { feature: "Shared prompt library", chatgpt: false, tp: true },
                { feature: "DLP scanning", chatgpt: false, tp: true },
                { feature: "Admin audit trails", chatgpt: false, tp: true },
                { feature: "Compliance packs", chatgpt: false, tp: "19 packs" },
                { feature: "Multi-model AI chat", chatgpt: false, tp: true },
              ].map((row) => (
                <div key={row.feature} className="contents">
                  <div className="px-5 py-2.5 border-b border-border text-muted-foreground">
                    {row.feature}
                  </div>
                  <div className="px-5 py-2.5 border-b border-border flex justify-center">
                    {row.chatgpt ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="px-5 py-2.5 border-b border-border bg-primary/5 flex justify-center items-center gap-1.5">
                    {typeof row.tp === "string" ? (
                      <span className="text-xs font-medium text-primary">{row.tp}</span>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learn More */}
        <div className="mt-24">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-8">
            Learn More
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { href: "/features", title: "See all features", subtitle: "Everything included in each plan" },
              { href: "/security", title: "Data protection", subtitle: "Enterprise-grade security for your AI usage" },
              { href: "/help", title: "Help center", subtitle: "Guides, tutorials, and FAQs" },
              { href: "/blog", title: "Blog", subtitle: "Tips for AI prompt management" },
              { href: "/integrations", title: "Integrations", subtitle: "Works with ChatGPT, Claude, Gemini & more" },
              { href: "/enterprise", title: "Enterprise", subtitle: "Custom solutions for large teams" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/50"
              >
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {link.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {link.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <FAQSection faqs={faqs} />
        </div>

      </div>
    </div>

    {/* Get Started + Lead Capture */}
    <div className="border-t border-border">
      <GetStartedSteps />
    </div>
    <LeadCaptureForm />
    </>
  );
}
