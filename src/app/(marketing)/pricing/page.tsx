import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateFAQSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generatePageMetadata({
  title: "Pricing",
  description:
    "Pick the plan that fits your team. Start free, no credit card required. All paid plans include a 14-day trial.",
  path: "/pricing",
});

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For trying it out",
    cta: "Start Free",
    href: "/signup",
    features: {
      Prompts: "25",
      Members: "3",
      Guidelines: "5",
      "Basic Security Patterns": true,
      "Custom Security Rules": false,
      "Security Audit Log": false,
      Analytics: false,
      "Import/Export": false,
      "Chrome Extension": true,
    },
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For solo power users",
    cta: "Start 14-Day Trial",
    href: "/signup?plan=pro",
    features: {
      Prompts: "Unlimited",
      Members: "1",
      Guidelines: "All 14",
      "Basic Security Patterns": true,
      "Custom Security Rules": true,
      "Security Audit Log": false,
      Analytics: true,
      "Import/Export": true,
      "Chrome Extension": true,
    },
  },
  {
    name: "Team",
    price: "$7",
    period: "/user/month",
    description: "For teams up to 50",
    cta: "Start 14-Day Trial",
    href: "/signup?plan=team",
    popular: true,
    features: {
      Prompts: "Unlimited",
      Members: "Up to 50",
      Guidelines: "All 14",
      "Basic Security Patterns": true,
      "Custom Security Rules": true,
      "Security Audit Log": true,
      Analytics: true,
      "Import/Export": true,
      "Chrome Extension": true,
    },
  },
  {
    name: "Business",
    price: "$12",
    period: "/user/month",
    description: "For larger organizations",
    cta: "Get Started",
    href: "/signup?plan=business",
    features: {
      Prompts: "Unlimited",
      Members: "Up to 500",
      Guidelines: "All 14 + custom",
      "Basic Security Patterns": true,
      "Custom Security Rules": true,
      "Security Audit Log": true,
      Analytics: true,
      "Import/Export": true,
      "Chrome Extension": true,
    },
  },
];

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
      "Not yet, but it's on our roadmap. Monthly billing keeps things flexible while we're growing.",
  },
];

export default function PricingPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(faqs)),
          }}
        />

        {/* Hero */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Pick the plan that fits your team
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Start free, no credit card required. All paid plans include a
            14-day trial.
          </p>
        </div>

        {/* Plan grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? "border-primary bg-card shadow-lg shadow-primary/5 relative hover:shadow-xl hover:shadow-primary/10"
                  : "border-border bg-card hover:border-primary/20 hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3.5 flex-1">
                {Object.entries(plan.features).map(([feature, value]) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    {value === false ? (
                      <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span
                      className={
                        value === false ? "text-muted-foreground/50" : ""
                      }
                    >
                      {typeof value === "string"
                        ? `${feature}: ${value}`
                        : feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="mt-8">
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full rounded-full font-semibold"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

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

        {/* FAQ — dark section */}
        <div className="mt-24 rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 30% 50%, hsl(221 83% 53% / 0.08) 0%, transparent 60%)",
            }}
          />
          <div className="relative max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3 text-center">
              FAQ
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Frequently asked questions
            </h2>
            <div className="space-y-0 divide-y divide-white/10">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-6 first:pt-0 last:pb-0">
                  <h3 className="font-semibold text-zinc-100">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to give your team
            <br />
            <span className="text-primary">a proper prompt system?</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto">
            Set up your workspace in under two minutes. No credit card needed.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button
              size="lg"
              className="text-base px-8 h-12 rounded-full font-semibold"
            >
              Create your workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
