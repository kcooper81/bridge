import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  Eye,
  FileCheck,
  Heart,
  Key,
  Lock,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { DarkSection } from "@/components/marketing/dark-section";
import { SectionLabel } from "@/components/marketing/section-label";
import { BenefitsGrid } from "@/components/marketing/benefits-grid";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";

export const metadata: Metadata = generatePageMetadata({
  title: "Sensitive Data Protection for AI Tools",
  description:
    "Protect your organization from data leaks in AI prompts. Detect patient records, financial data, passwords, and confidential information automatically.",
  path: "/security",
  keywords: ["AI data protection", "sensitive data blocking", "data loss prevention", "AI security"],
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
    patterns: ["Project Falcon", "/internal/", "@company.com", "Custom keywords"],
  },
];

const benefits = [
  "Automatic scanning on every prompt",
  "Choose to block or just warn for each rule",
  "Automatically replace sensitive data with safe placeholders",
  "Pattern tester built into the rule editor",
  "Full activity log of all violations",
  "15 pre-built rules covering common data types",
  "19 one-click compliance packs — HIPAA, SOC 2, PCI-DSS, GDPR, and more",
  "Custom rules for your industry's requirements",
  "Role-based access for managing security rules",
  "Browser extension scans text before it reaches AI tools",
];

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Data Protection", url: "https://teamprompt.app/security" },
]);

export default function SecurityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    {/* Hero — Light, Lumia-inspired */}
    <section className="border-b border-border" style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 50%, #fff 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-tight max-w-4xl mx-auto">
          Stop sensitive data{" "}
          <span className="text-primary">before it reaches AI.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          TeamPrompt automatically detects and blocks sensitive information
          — patient records, financial data, passwords, and more — before
          it reaches AI tools like ChatGPT, Claude, and Gemini.
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
    </section>

    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

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

        {/* Compliance Packs */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
              <FileCheck className="h-3.5 w-3.5" />
              <span className="font-medium">New</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              One-click compliance rule packs
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Pre-built security rules for regulated industries. Install an entire set of protections in seconds.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {[
              { name: "HIPAA", desc: "Protected health information detection", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
              { name: "GDPR", desc: "EU personal data protection rules", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
              { name: "PCI-DSS", desc: "Payment card industry standards", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
              { name: "CCPA", desc: "California consumer privacy act", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
              { name: "SOC 2", desc: "Service organization controls", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
              { name: "General PII", desc: "Common personally identifiable info", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
            ].map((pack) => (
              <div key={pack.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${pack.color}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{pack.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{pack.desc}</p>
                </div>
              </div>
            ))}
          </div>
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
                title: "Turn On Security Rules",
                desc: "Start with 15 built-in rules or create your own using keyword matching, pattern rules, or exact match.",
              },
              {
                step: "02",
                icon: ShieldAlert,
                title: "Auto-Scan & Sanitize",
                desc: "Every prompt is automatically scanned against your active rules. Detected data is blocked, warned, or auto-replaced with safe placeholders like {{PATIENT_NAME}}.",
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
            What&apos;s included
          </h2>
          <BenefitsGrid benefits={benefits} />
        </div>

        {/* Popular in regulated industries */}
        <div className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Popular in regulated industries
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Teams in these industries rely on TeamPrompt to keep sensitive data out of AI tools.
          </p>
          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { href: "/industries/healthcare", icon: Heart, name: "Healthcare", desc: "HIPAA-ready PHI detection" },
              { href: "/industries/finance", icon: Building2, name: "Finance", desc: "PCI-DSS & SOX compliance" },
              { href: "/industries/legal", icon: Scale, name: "Legal", desc: "Privilege & client data protection" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
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
