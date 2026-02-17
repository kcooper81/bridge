import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Key,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Guardrails",
  description:
    "Protect your organization from data leaks in AI prompts. Detect API keys, credentials, personal info, and sensitive information automatically.",
  path: "/security",
});

const categories = [
  {
    icon: Key,
    title: "API Keys & Tokens",
    description:
      "Detect AWS, GitHub, Stripe, OpenAI, Slack, and other API keys before they leak into AI conversations.",
    patterns: ["AKIA... (AWS)", "ghp_... (GitHub)", "sk_... (Stripe/OpenAI)", "xoxb-... (Slack)"],
  },
  {
    icon: Lock,
    title: "Credentials & Secrets",
    description:
      "Block passwords, connection strings, private keys, bearer tokens, and JWT tokens from being shared.",
    patterns: ["password=...", "mongodb://...", "-----BEGIN PRIVATE KEY-----", "Bearer eyJ..."],
  },
  {
    icon: UserX,
    title: "Personal Info (PII) Protection",
    description:
      "Optionally detect and block personally identifiable information like SSNs, credit cards, and email addresses.",
    patterns: ["XXX-XX-XXXX (SSN)", "4XXX-XXXX-XXXX (CC)", "user@email.com"],
  },
  {
    icon: Eye,
    title: "Custom Rules",
    description:
      "Create organization-specific rules for internal terms, project codenames, competitive intelligence, and more.",
    patterns: ["Exact match", "Regex patterns", "Glob wildcards"],
  },
];

const benefits = [
  "Automatic scanning on every prompt save",
  "Block or warn severity levels",
  "Pattern tester built into rule editor",
  "Full audit trail of all violations",
  "15 pre-built policies covering common secrets",
  "Custom policies with regex, exact, and glob matching",
  "Role-based access: Admins and Managers manage policies",
  "Per-plan controls: basic guardrails for all, custom for Pro+",
];

export default function SecurityPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <Shield className="h-4 w-4" />
            AI Guardrails
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold max-w-3xl mx-auto">
            Protect your data from AI prompt leaks
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            TeamPrompt&apos;s AI Guardrails automatically detect and block
            sensitive information — API keys, credentials, personal info, and company secrets
            — before they&apos;re pasted into AI tools.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Get Protected
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="grid gap-6 sm:grid-cols-2 mb-16">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <cat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{cat.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {cat.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.patterns.map((p) => (
                  <code
                    key={p}
                    className="text-xs bg-muted px-2 py-1 rounded font-mono"
                  >
                    {p}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How it works</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 mb-16 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              icon: ShieldCheck,
              title: "Install Policies",
              desc: "Start with 15 built-in patterns or create your own custom policies using regex, exact match, or glob patterns.",
            },
            {
              step: "2",
              icon: ShieldAlert,
              title: "Auto-Scan",
              desc: "Every prompt is automatically scanned against active policies before saving. Violations are caught in real-time.",
            },
            {
              step: "3",
              icon: Eye,
              title: "Audit & Review",
              desc: "Review all violations in the audit log. See who triggered what rule, when, and what action was taken.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4 text-xl font-bold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="rounded-xl border border-border bg-card p-8 mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Security features included
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-tp-green shrink-0 mt-0.5" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Don&apos;t wait for a data leak
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start protecting your team&apos;s AI prompts today. Free tier
            includes basic security patterns.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" className="text-base px-8">
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
