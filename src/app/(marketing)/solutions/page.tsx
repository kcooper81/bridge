import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers, Plug, GitCompareArrows } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { allSeoPages } from "@/lib/seo-pages/data";
import type { SeoPageData } from "@/lib/seo-pages/types";

export const metadata: Metadata = generatePageMetadata({
  title: "Solutions",
  description:
    "Explore TeamPrompt solutions: use cases for prompt management, integrations with ChatGPT, Claude, Gemini & more, and comparisons with alternative tools.",
  path: "/solutions",
  keywords: [
    "AI prompt management",
    "ChatGPT extension",
    "prompt library",
    "AI governance",
    "DLP for AI",
  ],
});

const categories: {
  key: SeoPageData["category"];
  label: string;
  sectionLabel: string;
  heading: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "use-case",
    label: "Use Cases",
    sectionLabel: "Use Cases",
    heading: "How teams use TeamPrompt",
    description:
      "From centralized prompt libraries to AI compliance, see how teams put TeamPrompt to work.",
    icon: Layers,
  },
  {
    key: "integration",
    label: "Integrations",
    sectionLabel: "Integrations",
    heading: "Works with your AI tools",
    description:
      "TeamPrompt lives inside the AI tools your team already uses. One extension, every platform.",
    icon: Plug,
  },
  {
    key: "comparison",
    label: "Comparisons",
    sectionLabel: "Comparisons",
    heading: "Why teams switch to TeamPrompt",
    description:
      "See how a purpose-built prompt manager compares to general-purpose tools.",
    icon: GitCompareArrows,
  },
];

function SolutionCard({ page }: { page: SeoPageData }) {
  return (
    <Link
      href={`/solutions/${page.slug}`}
      className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col"
    >
      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
        {page.meta.title.split("—")[0].split("for")[0].trim()}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
        {page.meta.description}
      </p>
      <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
        Learn more
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}

export default function SolutionsPage() {
  return (
    <>
      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.3) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 80% 50%, hsl(260 60% 50% / 0.12) 0%, transparent 60%)",
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
            Solutions for every team
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Explore how TeamPrompt helps teams manage prompts, secure AI usage, and integrate with the tools you already use.
          </p>
        </div>
      </section>

      {/* ━━━ CATEGORIES ━━━ */}
      {categories.map((cat) => {
        const pages = allSeoPages.filter((p) => p.category === cat.key);
        if (pages.length === 0) return null;
        const Icon = cat.icon;
        return (
          <section
            key={cat.key}
            id={cat.key}
            className="py-20 sm:py-28 border-t border-border"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-14">
                <SectionLabel>
                  <Icon className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                  {cat.sectionLabel}
                </SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {cat.heading}
                </h2>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                  {cat.description}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {pages.map((page) => (
                  <SolutionCard key={page.slug} page={page} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ━━━ CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Ready to get started?"
            gradientText="Try TeamPrompt free"
            subtitle="No credit card required. Set up your team in under 2 minutes."
          />
        </div>
      </section>
    </>
  );
}
