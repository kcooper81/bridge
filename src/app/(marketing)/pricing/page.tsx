import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for TeamPrompt. Start free, upgrade when you're ready.",
  path: "/pricing",
});

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals getting started",
    cta: "Start Free",
    href: "/signup",
    features: {
      "Prompts": "25",
      "Members": "3",
      "Standards": "5",
      "Basic Security Patterns": true,
      "Custom Security Rules": false,
      "Security Audit Log": false,
      "Analytics": false,
      "Import/Export": false,
      "Chrome Extension": true,
    },
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users and solopreneurs",
    cta: "Start 14-Day Trial",
    href: "/signup?plan=pro",
    features: {
      "Prompts": "Unlimited",
      "Members": "1",
      "Standards": "All 14",
      "Basic Security Patterns": true,
      "Custom Security Rules": true,
      "Security Audit Log": false,
      "Analytics": true,
      "Import/Export": true,
      "Chrome Extension": true,
    },
  },
  {
    name: "Team",
    price: "$7",
    period: "/user/month",
    description: "For growing teams",
    cta: "Start 14-Day Trial",
    href: "/signup?plan=team",
    popular: true,
    features: {
      "Prompts": "Unlimited",
      "Members": "Up to 50",
      "Standards": "All 14",
      "Basic Security Patterns": true,
      "Custom Security Rules": true,
      "Security Audit Log": true,
      "Analytics": true,
      "Import/Export": true,
      "Chrome Extension": true,
    },
  },
  {
    name: "Business",
    price: "$12",
    period: "/user/month",
    description: "For large organizations",
    cta: "Get Started",
    href: "/signup?plan=business",
    features: {
      "Prompts": "Unlimited",
      "Members": "Up to 500",
      "Standards": "All 14 + custom",
      "Basic Security Patterns": true,
      "Custom Security Rules": true,
      "Security Audit Log": true,
      "Analytics": true,
      "Import/Export": true,
      "Chrome Extension": true,
    },
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold">Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when your team needs more. All paid plans include
            a 14-day free trial.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.popular
                  ? "border-primary bg-card shadow-lg shadow-primary/5 relative"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 flex-1">
                {Object.entries(plan.features).map(([feature, value]) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    {value === false ? (
                      <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-tp-green shrink-0" />
                    )}
                    <span className={value === false ? "text-muted-foreground/60" : ""}>
                      {typeof value === "string" ? `${feature}: ${value}` : feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="mt-6">
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
