import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Eye,
  Key,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { DarkSection } from "@/components/marketing/dark-section";
import { SectionLabel } from "@/components/marketing/section-label";
import { BenefitsGrid } from "@/components/marketing/benefits-grid";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Guardrails",
  description:
    "Protect your organization from data leaks in AI prompts. Detect patient records, financial data, credentials, and confidential information automatically.",
  path: "/security",
  keywords: ["AI guardrails", "DLP scanning", "data loss prevention", "AI security"],
});

const categories = [
  {
    icon: UserX,
    title: "Personal & Protected Info",
    description:
      "Detect and block personally identifiable information — Social Security numbers, credit cards, patient names, dates of birth, and email addresses.",
    patterns: ["XXX-XX-XXXX (SSN)", "4XXX-XXXX-XXXX (CC)", "Patient DOB", "user@email.com"],
  },
  {
    icon: Lock,
    title: "Confidential Data",
    description:
      "Block financial records, client names, case numbers, internal documents, account numbers, and other sensitive business information from being shared.",
    patterns: ["Account #...", "Client: ...", "Case No. ...", "CONFIDENTIAL"],
  },
  {
    icon: Key,
    title: "Credentials & Secrets",
    description:
      "Catch passwords, API keys, access tokens, and connection strings before they reach AI tools.",
    patterns: ["password=...", "AKIA... (AWS)", "sk_... (API key)", "Bearer eyJ..."],
  },
  {
    icon: Eye,
    title: "Custom Rules",
    description:
      "Create organization-specific rules for internal terms, project names, proprietary processes, and industry-specific data patterns.",
    patterns: ["Exact match", "Pattern matching", "Custom keywords"],
  },
];

const benefits = [
  "Automatic scanning on every prompt save",
  "Block or warn severity levels",
  "Pattern tester built into rule editor",
  "Full audit trail of all violations",
  "15 pre-built policies covering common data types",
  "Custom policies for your industry's requirements",
  "Role-based access for policy management",
  "Browser extension scans outbound text in real-time",
];

export default function SecurityPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
            <Shield className="h-3.5 w-3.5" />
            <span className="font-medium">AI Guardrails</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Stop sensitive data from leaking into AI tools
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            TeamPrompt&apos;s AI Guardrails automatically detect and block
            sensitive information — patient records, financial data, client
            details, credentials, and more — before they reach AI tools.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-12 rounded-full font-semibold">
                Get Protected
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories — bento layout */}
        <div className="grid gap-4 sm:grid-cols-2 mb-24">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <cat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{cat.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {cat.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.patterns.map((p) => (
                  <code
                    key={p}
                    className="text-xs bg-muted/80 px-2.5 py-1 rounded-md font-mono text-muted-foreground"
                  >
                    {p}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* How it works — dark section */}
        <DarkSection gradient="right" className="mb-24">
          <SectionLabel dark>How it works</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">
            Three steps to secure your AI workflow
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: ShieldCheck,
                title: "Install Policies",
                desc: "Start with 15 built-in patterns or create your own custom policies using keyword matching, pattern rules, or exact match.",
              },
              {
                step: "02",
                icon: ShieldAlert,
                title: "Auto-Scan",
                desc: "Every prompt is automatically scanned against active policies before saving. Violations are caught in real-time.",
              },
              {
                step: "03",
                icon: Eye,
                title: "Audit & Review",
                desc: "Review all violations in the audit log. See who triggered what rule, when, and what action was taken.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-4xl font-black text-white/5">
                  {item.step}
                </span>
                <div className="flex items-center gap-2 mt-2 mb-3">
                  <item.icon className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </DarkSection>

        {/* Benefits */}
        <div className="max-w-3xl mx-auto mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            Security features included
          </h2>
          <BenefitsGrid benefits={benefits} />
        </div>

        {/* CTA */}
        <CTASection
          headline="Your team is already pasting sensitive data into AI."
          gradientText="Fix that today."
          subtitle="Free tier includes basic security patterns. Upgrade for custom rules and full audit logging."
          buttonText="Start Free"
        />
      </div>
    </div>
  );
}
