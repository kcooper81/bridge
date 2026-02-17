import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  generateSoftwareApplicationSchema,
  generateOrganizationSchema,
} from "@/lib/seo/schemas";
import {
  Archive,
  ArrowRight,
  BarChart3,
  BookOpen,
  Braces,
  CheckCircle2,
  Chrome,
  Shield,
  Users,
  Zap,
} from "lucide-react";

const logos = [
  "Acme Corp",
  "Globex",
  "Umbrella",
  "Aperture",
  "Cyberdyne",
  "Soylent",
  "Initech",
  "Massive Dynamic",
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

      {/* ━━━ HERO ━━━ Dark background with gradient mesh */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        {/* Gradient mesh background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.35) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 80% 50%, hsl(260 60% 50% / 0.15) 0%, transparent 60%)",
              "radial-gradient(ellipse 40% 50% at 20% 80%, hsl(221 83% 53% / 0.1) 0%, transparent 50%)",
            ].join(", "),
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 mb-8 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              <span>AI Guardrails — now built in</span>
              <ArrowRight className="h-3 w-3 text-zinc-500" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Your team&apos;s prompts
              <br />
              deserve{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                a system
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
              A shared library, quality guidelines, and security guardrails
              — so the best prompts get reused, not reinvented.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                >
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-8 sm:gap-12 max-w-2xl">
            {[
              { value: "15+", label: "AI tools connected" },
              { value: "14", label: "Built-in guidelines" },
              { value: "<2m", label: "Setup time" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ TRUST STRIP ━━━ */}
      <section className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6">
            Trusted by forward-thinking teams
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40">
            {logos.map((name) => (
              <span
                key={name}
                className="text-sm sm:text-base font-semibold text-muted-foreground tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ BENTO FEATURES ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Platform
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for how teams actually use AI
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not another bookmark folder. Purpose-built infrastructure for
              prompt management, security, and collaboration.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Large card — Vault */}
            <div className="sm:col-span-2 group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Archive className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Shared Prompt Vault</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed max-w-lg">
                Your team writes the same prompts over and over — in docs, Slack
                threads, personal notes. The vault gives everyone one searchable
                place to find what already works.
              </p>
              {/* Mini mockup */}
              <div className="mt-6 rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 flex-1 rounded-md border border-border bg-background px-3 flex items-center">
                    <span className="text-xs text-muted-foreground">Search prompts...</span>
                  </div>
                  <div className="h-7 w-7 rounded-md bg-primary/10" />
                </div>
                {[85, 65, 45].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="w-7 h-7 rounded-md bg-primary/10 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 rounded bg-foreground/8" style={{ width: `${w}%` }} />
                      <div className="h-2 rounded bg-muted-foreground/5" style={{ width: `${w - 20}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guardrails card */}
            <div className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  New
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">AI Guardrails</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Catch API keys, credentials, and internal data before they leak
                into AI tools. Block or warn in real-time.
              </p>
              <div className="mt-5 space-y-2">
                {["AWS Key detected", "GitHub token blocked", "PII warning"].map((item, i) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${i < 2 ? "bg-destructive" : "bg-yellow-500"}`} />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guidelines card */}
            <div className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Quality Guidelines</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Enforce structure, tone, and completeness so every prompt
                meets a quality bar before it ships.
              </p>
            </div>

            {/* Templates card */}
            <div className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Braces className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Prompt Templates</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Create reusable templates with {"{{variables}}"} that your
                team fills in each time. Consistent output, every time.
              </p>
            </div>

            {/* Large card — Chrome Extension + Analytics */}
            <div className="sm:col-span-2 lg:col-span-1 group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Chrome className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Chrome Extension</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Inject prompts directly into ChatGPT, Claude, Gemini,
                Copilot, and more — without leaving the AI tool.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map((tool) => (
                  <span key={tool} className="text-[11px] font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary features row */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Users, title: "Teams & Roles", desc: "Admin, Manager, Member — the right access for the right people." },
              { icon: BarChart3, title: "Usage Analytics", desc: "See which prompts get reused and where your library has gaps." },
              { icon: Zap, title: "Import / Export", desc: "Move prompt packs between orgs. No copy-pasting required." },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SOCIAL PROOF / HOW IT WORKS ━━━ */}
      <section className="py-20 sm:py-28 bg-zinc-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(221 83% 53% / 0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              From scattered prompts to a managed system
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Three steps to give your team a prompt management workflow.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create your workspace",
                desc: "Sign up, name your org, invite your team. Takes less than two minutes.",
              },
              {
                step: "02",
                title: "Add prompts and guardrails",
                desc: "Import existing prompts or write new ones. Turn on security policies to protect sensitive data.",
              },
              {
                step: "03",
                title: "Your team starts reusing",
                desc: "Members search the vault, use the Chrome extension, and your best prompts get adopted across the org.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="text-5xl font-black text-white/5">
                  {item.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PRICING PREVIEW ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              One price per user. No surprises.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when your team grows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                desc: "For trying it out",
                features: ["25 prompts", "3 members", "5 guidelines", "Basic guardrails"],
              },
              {
                name: "Pro",
                price: "$9",
                period: "/month",
                desc: "For solo power users",
                features: ["Unlimited prompts", "All 14 guidelines", "Custom guardrails", "Analytics"],
              },
              {
                name: "Team",
                price: "$7",
                period: "/user/mo",
                desc: "For teams up to 50",
                features: ["Up to 50 members", "Custom guardrails", "Audit log", "Import/export"],
                popular: true,
              },
              {
                name: "Business",
                price: "$12",
                period: "/user/mo",
                desc: "For larger orgs",
                features: ["Up to 500 members", "Custom guidelines", "Full audit log", "Priority support"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-200 ${
                  plan.popular
                    ? "border-primary bg-card shadow-lg shadow-primary/5 scale-[1.02]"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                </div>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary/70 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Free" ? "/signup" : `/signup?plan=${plan.name.toLowerCase()}`}
                  className="mt-6 block"
                >
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full rounded-full ${plan.popular ? "" : ""}`}
                  >
                    {plan.name === "Free" ? "Start Free" : "Start Trial"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ BOTTOM CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Your team is already using AI.
            <br />
            <span className="text-primary">Now give them a system.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Set up your workspace in under two minutes.
            No credit card needed.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-12 rounded-full font-semibold">
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
