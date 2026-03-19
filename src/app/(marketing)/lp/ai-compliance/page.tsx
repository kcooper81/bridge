import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/marketing/feature-card";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import { DarkSection } from "@/components/marketing/dark-section";
import { SectionLabel } from "@/components/marketing/section-label";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import {
  ArrowRight,
  ClipboardCheck,
  ScanSearch,
  FileStack,
  Users,
  FolderArchive,
  Workflow,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export function generateMetadata(): Metadata {
  return {
    title:
      "AI Compliance for HIPAA, SOC 2 & PCI-DSS — Governance Made Simple | TeamPrompt",
    description:
      "Prove your team's AI usage is controlled. TeamPrompt provides audit trails, PII detection, and pre-built compliance packs for HIPAA, SOC 2, PCI-DSS, and GDPR.",
    keywords: [
      "AI compliance",
      "HIPAA AI",
      "SOC 2 AI",
      "AI governance tool",
      "PCI-DSS AI compliance",
      "GDPR AI",
      "AI audit trail",
    ],
    alternates: { canonical: `${SITE_URL}/lp/ai-compliance` },
  };
}

const faqs = [
  {
    question: "Which compliance frameworks does TeamPrompt support?",
    answer:
      "TeamPrompt ships with 19 pre-built compliance packs covering HIPAA, SOC 2, PCI-DSS, GDPR, CCPA, and more. Each pack includes detection patterns tailored to the specific regulation, so you can enable compliance enforcement with a single click.",
  },
  {
    question: "How does TeamPrompt help with audits?",
    answer:
      "TeamPrompt maintains a complete audit log of every AI interaction — including who sent the message, what data was included, which AI tool was used, and when it happened. These logs can be exported for auditors or reviewed in the analytics dashboard.",
  },
  {
    question:
      "Does TeamPrompt store the content my employees send to AI tools?",
    answer:
      "TeamPrompt logs metadata and policy violations for audit purposes, but the actual content sent to AI tools is processed locally in the browser. Your data never passes through TeamPrompt servers. This zero-trust architecture is designed for regulated environments.",
  },
  {
    question: "Can I set different policies for different teams?",
    answer:
      "Yes. TeamPrompt supports per-team and per-department policy enforcement. For example, your engineering team might have different DLP rules than your healthcare operations team. Policies are managed centrally by workspace admins.",
  },
  {
    question: "How quickly can we deploy TeamPrompt for compliance?",
    answer:
      "Most regulated teams are fully deployed in under 10 minutes. You create a workspace, enable the relevant compliance packs, invite your team, and they install the browser extension. No infrastructure changes are needed.",
  },
];

export default function AiComplianceLandingPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "AI Compliance", url: `${SITE_URL}/lp/ai-compliance` },
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Compliance for HIPAA, SOC 2 & PCI-DSS",
    description:
      "Prove your team's AI usage is controlled with audit trails, PII detection, and compliance packs.",
    url: `${SITE_URL}/lp/ai-compliance`,
    publisher: {
      "@type": "Organization",
      name: "TeamPrompt",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, webPageSchema]),
        }}
      />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <SectionLabel>AI Compliance</SectionLabel>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            AI Compliance Made Simple
            <br />
            <span className="text-primary">for Regulated Teams</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            HIPAA, SOC 2, PCI-DSS — you need proof that AI usage is controlled.
            TeamPrompt gives you the audit trail, policy enforcement, and
            compliance packs to satisfy any auditor.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Get compliant now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 sm:py-28 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">19</p>
              <p className="mt-2 text-muted-foreground">
                pre-built compliance packs ready to enable
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                HIPAA & SOC 2
              </p>
              <p className="mt-2 text-muted-foreground">
                ready out of the box
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                Zero-trust
              </p>
              <p className="mt-2 text-muted-foreground">
                AI architecture — data stays in the browser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Compliance Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need for AI compliance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From automatic PII detection to auditor-ready reports, TeamPrompt
              covers every angle of AI governance.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={ClipboardCheck}
              title="Pre-Built Compliance Packs"
              description="Enable HIPAA, SOC 2, PCI-DSS, GDPR, and 15 more compliance packs with a single click. Each includes tailored detection patterns."
            />
            <FeatureCard
              icon={ScanSearch}
              title="Automatic PII Detection"
              description="TeamPrompt scans every message for personally identifiable information and blocks it before it reaches any AI tool."
            />
            <FeatureCard
              icon={FileStack}
              title="Complete Audit Logs"
              description="Every AI interaction is logged with who, what, when, and which tool. Export logs for auditors or review them in the dashboard."
            />
            <FeatureCard
              icon={Users}
              title="Per-Team Policy Enforcement"
              description="Set different compliance policies for different teams or departments. Engineering can have different rules than healthcare ops."
            />
            <FeatureCard
              icon={FolderArchive}
              title="Evidence Collection"
              description="Automatically collect evidence of policy enforcement for audit preparation. Show auditors exactly how AI usage is controlled."
            />
            <FeatureCard
              icon={Workflow}
              title="Zero Workflow Disruption"
              description="Employees keep using their preferred AI tools. TeamPrompt works invisibly in the background, enforcing policies without slowing anyone down."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl">
        <div className="text-center py-8">
          <SectionLabel dark>Built for Regulated Industries</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Trusted by healthcare, finance, and legal teams
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto mt-10">
            <div>
              <p className="text-3xl font-bold text-blue-400">Healthcare</p>
              <p className="mt-1 text-sm text-zinc-400">
                HIPAA-compliant AI usage with PHI detection
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">Finance</p>
              <p className="mt-1 text-sm text-zinc-400">
                PCI-DSS and SOX compliance for AI interactions
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">Legal</p>
              <p className="mt-1 text-sm text-zinc-400">
                Client confidentiality and privilege protection
              </p>
            </div>
          </div>
        </div>
      </DarkSection>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={faqs} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Get AI compliance"
            gradientText="in minutes, not months"
            subtitle="19 compliance packs. Full audit trail. No credit card required. Satisfy your next audit with confidence."
            buttonText="Start free trial"
            buttonHref="/signup"
          />
        </div>
      </section>
    </>
  );
}
