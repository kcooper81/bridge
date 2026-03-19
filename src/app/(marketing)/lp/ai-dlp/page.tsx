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
  ShieldCheck,
  ScanSearch,
  Globe,
  FileText,
  Settings2,
  MonitorSmartphone,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export function generateMetadata(): Metadata {
  return {
    title: "AI DLP — Prevent Data Leaks to ChatGPT & AI Tools | TeamPrompt",
    description:
      "Stop sensitive data from reaching AI tools. TeamPrompt scans every message for PII, secrets, and source code before it leaves your browser. HIPAA & SOC 2 ready.",
    keywords: [
      "AI DLP",
      "data loss prevention",
      "prevent data leaks ChatGPT",
      "DLP software",
      "AI data protection",
      "ChatGPT DLP",
      "AI security",
    ],
    alternates: { canonical: `${SITE_URL}/lp/ai-dlp` },
  };
}

const faqs = [
  {
    question: "How does TeamPrompt prevent data leaks to AI tools?",
    answer:
      "TeamPrompt installs as a lightweight browser extension that scans every message before it is sent to ChatGPT, Claude, Gemini, Copilot, or Perplexity. If sensitive data like API keys, PII, or source code is detected, the message is blocked or the user is warned — all in real time, before anything leaves the browser.",
  },
  {
    question: "Which AI tools does TeamPrompt monitor?",
    answer:
      "TeamPrompt currently monitors ChatGPT, Claude, Google Gemini, Microsoft Copilot, and Perplexity. New AI tools are added regularly. The extension works on any Chromium-based browser.",
  },
  {
    question: "Do I need to install a VPN or proxy?",
    answer:
      "No. TeamPrompt works entirely through a browser extension. There is no network proxy, no VPN, and no changes to your infrastructure. Deployment takes about 2 minutes per user.",
  },
  {
    question: "Is TeamPrompt HIPAA and SOC 2 compliant?",
    answer:
      "Yes. TeamPrompt includes pre-built compliance packs for HIPAA, SOC 2, PCI-DSS, and GDPR. It provides a full audit trail of every AI interaction so you can demonstrate compliance to auditors.",
  },
  {
    question: "Can I create custom DLP rules?",
    answer:
      "Absolutely. In addition to the 19 built-in compliance packs, you can create custom security rules using regex patterns, keyword lists, or natural-language descriptions. Rules can be set to block or warn.",
  },
];

export default function AiDlpLandingPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "AI DLP", url: `${SITE_URL}/lp/ai-dlp` },
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI DLP — Prevent Data Leaks to ChatGPT & AI Tools",
    description:
      "Stop sensitive data from reaching AI tools with real-time DLP scanning.",
    url: `${SITE_URL}/lp/ai-dlp`,
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
          <SectionLabel>AI Data Loss Prevention</SectionLabel>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Stop Sensitive Data From
            <br />
            <span className="text-primary">Reaching AI Tools</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your employees are pasting secrets, PII, and source code into
            ChatGPT every day. TeamPrompt scans and blocks sensitive data in
            real time — before it ever leaves the browser.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Start protecting your data
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
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                77%
              </p>
              <p className="mt-2 text-muted-foreground">
                of employees have pasted sensitive data into AI
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                2 min
              </p>
              <p className="mt-2 text-muted-foreground">
                to set up and start protecting your team
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">5</p>
              <p className="mt-2 text-muted-foreground">
                AI tools monitored out of the box
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Enterprise-grade DLP for the AI era
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              TeamPrompt sits between your employees and every AI tool they use,
              scanning content in real time before anything is sent.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={ScanSearch}
              title="Real-Time DLP Scanning"
              description="Every message is scanned for PII, API keys, credentials, and source code before it reaches the AI provider."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="19 Compliance Packs"
              description="Pre-built rule sets for HIPAA, SOC 2, PCI-DSS, GDPR, and more. Enable with one click."
            />
            <FeatureCard
              icon={Globe}
              title="Works Across 5 AI Tools"
              description="Monitor and protect ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity from a single dashboard."
            />
            <FeatureCard
              icon={MonitorSmartphone}
              title="Browser Extension + Secure Chat"
              description="Deploy as a lightweight extension — no VPN or proxy needed. Or use TeamPrompt's built-in secure AI chat."
            />
            <FeatureCard
              icon={FileText}
              title="Full Audit Trail"
              description="Every AI interaction is logged: who sent what, when, and to which tool. Ready for compliance reviews."
            />
            <FeatureCard
              icon={Settings2}
              title="Custom Security Rules"
              description="Build your own rules with regex, keywords, or natural language. Set policies to block, warn, or log."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl">
        <div className="text-center py-8">
          <SectionLabel dark>Trusted by Security Teams</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Built for teams that take data security seriously
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto mt-10">
            <div>
              <p className="text-3xl font-bold text-blue-400">Zero-trust</p>
              <p className="mt-1 text-sm text-zinc-400">
                AI architecture — data never touches our servers
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">SOC 2</p>
              <p className="mt-1 text-sm text-zinc-400">
                Type II compliant infrastructure
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">HIPAA</p>
              <p className="mt-1 text-sm text-zinc-400">
                Ready with pre-built compliance packs
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
            headline="Protect your data from"
            gradientText="AI leaks today"
            subtitle="Deploy in 2 minutes. No credit card required. See every piece of sensitive data your team sends to AI."
            buttonText="Start free trial"
            buttonHref="/signup"
          />
        </div>
      </section>
    </>
  );
}
