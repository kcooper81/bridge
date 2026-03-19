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
  Library,
  LayoutTemplate,
  CheckCircle,
  BarChart3,
  Puzzle,
  Star,
  Import,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export function generateMetadata(): Metadata {
  return {
    title:
      "Team Prompt Library — Shared AI Prompts for Your Whole Team | TeamPrompt",
    description:
      "Stop reinventing prompts. Build a shared library of tested AI prompts with templates, approvals, usage tracking, and 1-click insert into ChatGPT and Claude.",
    keywords: [
      "team prompt library",
      "shared prompts",
      "prompt management",
      "AI prompt templates",
      "prompt library tool",
      "shared AI prompts",
      "prompt vault",
    ],
    alternates: { canonical: `${SITE_URL}/lp/prompt-library` },
  };
}

const faqs = [
  {
    question: "What is a team prompt library?",
    answer:
      "A team prompt library is a shared collection of tested, approved AI prompts that your whole team can access and reuse. Instead of each employee writing prompts from scratch, they draw from a curated vault of templates that have been proven to produce good results.",
  },
  {
    question: "How do I insert prompts into ChatGPT or Claude?",
    answer:
      "TeamPrompt's browser extension adds a prompt picker directly inside ChatGPT, Claude, Gemini, and other AI tools. With one click, you can insert any prompt from your team's library — including filling in template variables — without switching tabs.",
  },
  {
    question: "Can I control who can add or edit prompts?",
    answer:
      "Yes. TeamPrompt includes an approval workflow so admins can review and approve new prompts before they are published to the team. You can also set role-based permissions to control who can create, edit, or delete prompts.",
  },
  {
    question: "Does TeamPrompt support prompt templates with variables?",
    answer:
      "Absolutely. You can create prompts with fill-in variables like {{customer_name}} or {{product}}. When a team member uses the prompt, they are asked to fill in the variables before inserting it into the AI tool.",
  },
  {
    question: "Can I import existing prompts?",
    answer:
      "Yes. TeamPrompt supports importing prompts from CSV files, JSON, and plain text. You can also export your entire library at any time. This makes migration from spreadsheets or Google Docs easy.",
  },
];

export default function PromptLibraryLandingPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Prompt Library", url: `${SITE_URL}/lp/prompt-library` },
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Team Prompt Library — Shared AI Prompts for Your Whole Team",
    description:
      "Build a shared library of tested AI prompts with templates, approvals, and usage tracking.",
    url: `${SITE_URL}/lp/prompt-library`,
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
          <SectionLabel>Prompt Management</SectionLabel>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Your Team&apos;s Shared
            <br />
            <span className="text-primary">AI Prompt Library</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop reinventing the wheel. Build a library of tested prompts your
            whole team can use — with templates, approvals, usage tracking, and
            1-click insert into any AI tool.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Build your prompt library
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
                30 min
              </p>
              <p className="mt-2 text-muted-foreground">
                saved per employee per day with shared prompts
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                1 click
              </p>
              <p className="mt-2 text-muted-foreground">
                to insert any prompt into ChatGPT or Claude
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                Track
              </p>
              <p className="mt-2 text-muted-foreground">
                which prompts get the best results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Library Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything your team needs to master AI prompts
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From a shared vault to usage analytics, TeamPrompt gives you the
              tools to standardize and optimize your team&apos;s AI interactions.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Library}
              title="Shared Prompt Vault"
              description="A centralized library of prompts organized by categories, tags, and favorites. Search and find the right prompt in seconds."
            />
            <FeatureCard
              icon={LayoutTemplate}
              title="Template Prompts"
              description="Create prompts with fill-in variables like {{customer_name}}. Team members fill in the blanks and insert with one click."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Approval Workflow"
              description="New prompts go through an approval queue before being published. Maintain quality and consistency across your team."
            />
            <FeatureCard
              icon={BarChart3}
              title="Usage Analytics"
              description="See which prompts are used most, by whom, and how often. Identify your best-performing prompts and double down."
            />
            <FeatureCard
              icon={Puzzle}
              title="Browser Extension"
              description="Insert prompts directly into ChatGPT, Claude, Gemini, and more from a sidebar — without switching tabs or copy-pasting."
            />
            <FeatureCard
              icon={Star}
              title="Favorites & Organization"
              description="Star your go-to prompts. Organize with tags and categories. Find what you need instantly with full-text search."
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            <FeatureCard
              icon={Import}
              title="Import & Export"
              description="Import prompts from CSV, JSON, or plain text. Export your library anytime. Migrate from spreadsheets in minutes."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl">
        <div className="text-center py-8">
          <SectionLabel dark>Why Teams Love TeamPrompt</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            From scattered prompts to a curated library
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto mt-10">
            <div>
              <p className="text-3xl font-bold text-blue-400">Before</p>
              <p className="mt-1 text-sm text-zinc-400">
                Prompts scattered across docs, Slack, and sticky notes
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">After</p>
              <p className="mt-1 text-sm text-zinc-400">
                One searchable library with templates and analytics
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">Result</p>
              <p className="mt-1 text-sm text-zinc-400">
                Better AI outputs, faster work, consistent quality
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
            headline="Build your team's"
            gradientText="AI prompt library today"
            subtitle="Free to start. No credit card required. Get your team on the same page with shared, tested prompts."
            buttonText="Start free trial"
            buttonHref="/signup"
          />
        </div>
      </section>
    </>
  );
}
