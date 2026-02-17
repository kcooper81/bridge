import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  generateSoftwareApplicationSchema,
  generateOrganizationSchema,
} from "@/lib/seo/schemas";
import {
  Archive,
  BarChart3,
  BookOpen,
  Chrome,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Archive,
    title: "Shared Prompt Vault",
    description:
      "Centralized repository for all your team's AI prompts with folders, departments, and tagging.",
  },
  {
    icon: Shield,
    title: "AI Guardrails",
    description:
      "Block API keys, credentials, personal info, and sensitive data from leaking into AI tools automatically.",
  },
  {
    icon: BookOpen,
    title: "Quality Guidelines",
    description:
      "14 built-in guidelines covering writing, coding, marketing, legal, and more. Create custom ones too.",
  },
  {
    icon: Users,
    title: "Teams & Roles",
    description:
      "Role-based access control with Admin, Manager, and Member roles. Invite teammates via email.",
  },
  {
    icon: Chrome,
    title: "Chrome Extension",
    description:
      "One-click prompt injection into 15+ AI tools including ChatGPT, Claude, Gemini, and more.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description:
      "Track prompt usage, top performers, department trends, and team productivity metrics.",
  },
];

const stats = [
  { value: "15+", label: "AI Tools Supported" },
  { value: "14", label: "Built-in Guidelines" },
  { value: "100%", label: "Free to Start" },
];

export default function LandingPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateSoftwareApplicationSchema(),
            generateOrganizationSchema(),
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        {/* Gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% -20%, hsl(239 84% 67% / 0.2) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span>Now with AI Guardrails</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            Stop losing your best{" "}
            <span className="text-primary">AI prompts</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            TeamPrompt helps teams manage, share, and secure their AI prompts
            across 15+ AI tools with built-in quality guidelines and
            enterprise-grade guardrails.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="text-base px-8">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From prompt management to enterprise security, TeamPrompt has you
              covered.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-16 sm:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", desc: "For individuals", features: ["25 prompts", "3 members", "5 guidelines", "Basic guardrails"] },
              { name: "Pro", price: "$9/mo", desc: "For power users", features: ["Unlimited prompts", "All 14 guidelines", "Custom guardrails", "Analytics", "14-day trial"] },
              { name: "Team", price: "$7/user/mo", desc: "For growing teams", features: ["Up to 50 members", "Custom guardrails", "Audit log", "Import/export", "14-day trial"], popular: true },
              { name: "Business", price: "$12/user/mo", desc: "For enterprises", features: ["Up to 500 members", "Custom guidelines", "Full audit log", "Priority support"] },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 ${
                  plan.popular
                    ? "border-primary bg-card shadow-lg shadow-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-semibold text-primary mb-2">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">{plan.price}</p>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-tp-green shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === "Free" ? "/signup" : `/signup?plan=${plan.name.toLowerCase()}`}>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full mt-6"
                  >
                    {plan.name === "Free" ? "Start Free" : "Start Trial"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to secure your team&apos;s AI workflow?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join teams who trust TeamPrompt to manage, share, and protect their
            AI prompts.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
