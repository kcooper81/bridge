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
  Eye,
  BarChart3,
  Bell,
  TrendingUp,
  Puzzle,
  Ban,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export function generateMetadata(): Metadata {
  return {
    title:
      "Shadow AI Monitoring — See Every AI Tool Your Team Uses | TeamPrompt",
    description:
      "60% of employees use AI without IT approval. TeamPrompt gives you full visibility into shadow AI usage across ChatGPT, Claude, Gemini, and more — no proxy required.",
    keywords: [
      "shadow AI",
      "employees using ChatGPT",
      "AI usage monitoring",
      "AI governance",
      "shadow IT AI",
      "AI visibility",
      "AI tool monitoring",
    ],
    alternates: { canonical: `${SITE_URL}/lp/shadow-ai` },
  };
}

const faqs = [
  {
    question: "What is shadow AI?",
    answer:
      "Shadow AI refers to the use of AI tools like ChatGPT, Claude, or Gemini by employees without the knowledge or approval of IT or security teams. It creates blind spots in your security posture because sensitive data can be shared with third-party AI providers without oversight.",
  },
  {
    question: "How does TeamPrompt detect shadow AI usage?",
    answer:
      "TeamPrompt deploys as a browser extension that automatically detects when employees interact with AI tools. It logs which tools are being used, by whom, and how often — giving IT and security teams complete visibility without requiring a VPN, proxy, or network changes.",
  },
  {
    question: "Can I block specific AI tools?",
    answer:
      "Yes. TeamPrompt lets you define policies to allow, restrict, or block specific AI platforms. For example, you can allow Claude but block ChatGPT, or require DLP scanning on all tools while allowing usage to continue.",
  },
  {
    question: "Does TeamPrompt slow down employees?",
    answer:
      "No. The browser extension runs silently in the background. Employees can continue using their preferred AI tools while TeamPrompt monitors for policy violations and sensitive data exposure. The scanning happens in milliseconds.",
  },
  {
    question: "How long does deployment take?",
    answer:
      "Most teams are fully deployed in under 5 minutes. You create a workspace, invite your team via email or domain-based auto-join, and they install the browser extension. No IT infrastructure changes are needed.",
  },
];

export default function ShadowAiLandingPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Shadow AI", url: `${SITE_URL}/lp/shadow-ai` },
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Shadow AI Monitoring — See Every AI Tool Your Team Uses",
    description:
      "Get full visibility into shadow AI usage across your organization.",
    url: `${SITE_URL}/lp/shadow-ai`,
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
          <SectionLabel>Shadow AI Monitoring</SectionLabel>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            See Every AI Tool
            <br />
            <span className="text-primary">Your Team Is Using</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Employees are using ChatGPT, Claude, and other AI tools without IT
            approval. You have no visibility into what data is being shared.
            TeamPrompt changes that.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Get AI visibility now
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
                60%
              </p>
              <p className="mt-2 text-muted-foreground">
                of employees use AI without IT approval
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                5 min
              </p>
              <p className="mt-2 text-muted-foreground">
                deployment — no infrastructure changes
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                100%
              </p>
              <p className="mt-2 text-muted-foreground">
                audit trail for every AI interaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Full Visibility</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Take control of AI usage across your org
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              TeamPrompt gives IT and security teams the visibility they need
              without slowing down employees.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Eye}
              title="Monitor All AI Platforms"
              description="See usage across ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity from a single dashboard."
            />
            <FeatureCard
              icon={BarChart3}
              title="Team-Level Analytics"
              description="Understand which teams and departments are using which AI tools, how often, and what kind of data they send."
            />
            <FeatureCard
              icon={Bell}
              title="Real-Time Alerts"
              description="Get notified instantly when sensitive data is at risk of being shared with an AI tool. Integrate with Slack or email."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Usage Trends"
              description="Track AI adoption over time. Identify power users, spot risky behavior, and make informed policy decisions."
            />
            <FeatureCard
              icon={Puzzle}
              title="No VPN or Proxy"
              description="Deploys as a browser extension in minutes. No network changes, no infrastructure to maintain, no disruption."
            />
            <FeatureCard
              icon={Ban}
              title="Block or Allow Tools"
              description="Create granular policies to allow, restrict, or fully block specific AI platforms per team or department."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl">
        <div className="text-center py-8">
          <SectionLabel dark>Why Teams Choose TeamPrompt</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Visibility without friction
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto mt-10">
            <div>
              <p className="text-3xl font-bold text-blue-400">5 tools</p>
              <p className="mt-1 text-sm text-zinc-400">
                monitored from a single dashboard
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">Instant</p>
              <p className="mt-1 text-sm text-zinc-400">
                alerts when policies are violated
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">Zero</p>
              <p className="mt-1 text-sm text-zinc-400">
                infrastructure changes required
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
            headline="Get visibility into"
            gradientText="shadow AI today"
            subtitle="Deploy in 5 minutes. No credit card required. See which AI tools your team is really using."
            buttonText="Start free trial"
            buttonHref="/signup"
          />
        </div>
      </section>
    </>
  );
}
