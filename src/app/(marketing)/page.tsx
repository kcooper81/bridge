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
      "Your team writes the same prompts over and over — in docs, Slack threads, personal notes. The vault gives everyone one place to find what already works.",
  },
  {
    icon: Shield,
    title: "AI Guardrails",
    description:
      "People paste API keys, credentials, and internal data into AI tools every day. Guardrails catch sensitive content before it leaves your org.",
  },
  {
    icon: BookOpen,
    title: "Quality Guidelines",
    description:
      "Bad prompts waste tokens and produce bad output. Guidelines enforce structure, tone, and completeness — so your team writes prompts that actually perform.",
  },
  {
    icon: Users,
    title: "Teams & Roles",
    description:
      "Not everyone needs the same access. Assign Admin, Manager, or Member roles and organize people into teams so the right prompts reach the right people.",
  },
  {
    icon: Chrome,
    title: "Chrome Extension",
    description:
      "Your prompts live in TeamPrompt, but your team works in ChatGPT, Claude, and Gemini. The extension bridges the gap with one-click injection into 15+ tools.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description:
      "You can't improve what you can't measure. See which prompts get reused, which teams are most active, and where your library has gaps.",
  },
];

const stats = [
  { value: "15+", label: "AI tools connected" },
  { value: "14", label: "quality guidelines built in" },
  { value: "2 min", label: "to set up your workspace" },
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
        {/* Dot-grid background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--primary) / 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% -20%, hsl(var(--primary) / 0.2) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span>AI Guardrails — now built in</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            Your team&apos;s prompts deserve{" "}
            <span className="text-primary">a system</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            TeamPrompt gives your team a shared library, quality guidelines, and
            security guardrails — so the best prompts get reused, not
            reinvented.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="text-base px-8">
                See features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="hidden sm:block w-1 h-10 rounded-full bg-primary/30" />
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
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
              Built for how teams actually use AI
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Not another bookmark folder. TeamPrompt is purpose-built for
              prompt management.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-8 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
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
              One price per user. No surprises.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when your team grows.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", desc: "For trying it out", features: ["25 prompts", "3 members", "5 guidelines", "Basic guardrails"] },
              { name: "Pro", price: "$9/mo", desc: "For solo power users", features: ["Unlimited prompts", "All 14 guidelines", "Custom guardrails", "Analytics", "14-day trial"] },
              { name: "Team", price: "$7/user/mo", desc: "For teams up to 50", features: ["Up to 50 members", "Custom guardrails", "Audit log", "Import/export", "14-day trial"], popular: true },
              { name: "Business", price: "$12/user/mo", desc: "For larger organizations", features: ["Up to 500 members", "Custom guidelines", "Full audit log", "Priority support"] },
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
            Your team is already using AI. Now give them a system.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Set up your workspace in under two minutes. No credit card needed.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Create your workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
