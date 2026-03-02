import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { BenefitsGrid } from "@/components/marketing/benefits-grid";
import { StatsRow } from "@/components/marketing/stats-row";
import { ArrowRight, Shield } from "lucide-react";
import {
  Archive,
  BarChart3,
  BookOpen,
  Braces,
  Eye,
  GitBranch,
  Globe,
  Key,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schemas";
import type { SeoPageData, SeoCategory, SeoContentSection } from "@/lib/seo-pages/types";
import { CheckCircle2 } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const categoryBadgeColors: Record<SeoCategory, string> = {
  comparison: "text-blue-400",
  "use-case": "text-blue-400",
  integration: "text-emerald-400",
  alternative: "text-violet-400",
  guide: "text-amber-400",
  workflow: "text-cyan-400",
  role: "text-rose-400",
  template: "text-orange-400",
  platform: "text-indigo-400",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Archive,
  BarChart3,
  BookOpen,
  Braces,
  Eye,
  GitBranch,
  Globe,
  Key,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
};

export function SeoLandingPage({ data }: { data: SeoPageData }) {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...(data.faqs ? [generateFAQSchema(data.faqs)] : []),
            generateBreadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Solutions", url: `${SITE_URL}/solutions` },
              {
                name: data.meta.title,
                url: `${SITE_URL}/solutions/${data.slug}`,
              },
            ]),
          ]),
        }}
      />

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="max-w-3xl">
            {data.hero.badges && data.hero.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {data.hero.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm"
                  >
                    <Shield className={`h-3 w-3 ${categoryBadgeColors[data.category] || "text-blue-400"}`} />
                    {badge}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              {data.hero.headline}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
              {data.hero.subtitle}
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
                  See all features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      {data.features && (
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <SectionLabel>{data.features.sectionLabel}</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.features.heading}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {data.features.items.map((feature) => {
                const Icon = iconMap[feature.icon] || Shield;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ CONTENT SECTIONS ━━━ */}
      {data.sections && data.sections.length > 0 && data.sections.map((section, idx) => (
        <ContentSection key={idx} section={section} />
      ))}

      {/* ━━━ BENEFITS ━━━ */}
      {data.benefits && (
        <section className="py-20 sm:py-28 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <SectionLabel>Benefits</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.benefits.heading}
              </h2>
            </div>
            <div className="max-w-3xl mx-auto">
              <BenefitsGrid benefits={data.benefits.items} />
            </div>
          </div>
        </section>
      )}

      {/* ━━━ STATS ━━━ */}
      {data.stats && data.stats.length > 0 && (
        <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-5xl">
          <div className="py-4">
            <StatsRow stats={data.stats} dark className="max-w-3xl mx-auto" />
          </div>
        </DarkSection>
      )}

      {/* ━━━ FAQ ━━━ */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FAQSection faqs={data.faqs} includeSchema={false} />
          </div>
        </section>
      )}

      {/* ━━━ CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline={data.cta.headline}
            gradientText={data.cta.gradientText}
            subtitle={data.cta.subtitle}
          />
        </div>
      </section>
    </>
  );
}

/* ━━━ Section Renderers ━━━ */

function ContentSection({ section }: { section: SeoContentSection }) {
  switch (section.type) {
    case "checklist":
      return <ChecklistSection section={section} />;
    case "comparison-table":
      return <ComparisonTableSection section={section} />;
    case "how-it-works":
      return <HowItWorksSection section={section} />;
    case "prose":
      return <ProseSection section={section} />;
    case "use-cases-grid":
      return <UseCasesGridSection section={section} />;
    default:
      return null;
  }
}

function ChecklistSection({ section }: { section: SeoContentSection }) {
  const items = (section.content.items as string[]) || [];
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>Checklist</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <ul className="max-w-2xl mx-auto space-y-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ComparisonTableSection({ section }: { section: SeoContentSection }) {
  const headers = (section.content.headers as string[]) || [];
  const rows = (section.content.rows as { label: string; values: string[] }[]) || [];
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>Comparison</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                {headers.map((h) => (
                  <th key={h} className="text-center py-3 px-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-3 px-4 text-muted-foreground">{row.label}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="text-center py-3 px-4 text-muted-foreground">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ section }: { section: SeoContentSection }) {
  const steps = (section.content.steps as { title: string; description: string }[]) || [];
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProseSection({ section }: { section: SeoContentSection }) {
  const body = (section.content.body as string) || "";
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">{section.heading}</h2>
          <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesGridSection({ section }: { section: SeoContentSection }) {
  const cases = (section.content.cases as { title: string; description: string }[]) || [];
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>Use cases</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {cases.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
