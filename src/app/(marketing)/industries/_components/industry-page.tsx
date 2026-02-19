import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { StatsRow } from "@/components/marketing/stats-row";
import { AppMockup } from "@/components/marketing/app-mockup";
import { ArrowRight, Shield, X } from "lucide-react";
import {
  Archive,
  ArrowDownUp,
  BarChart3,
  BookOpen,
  Building2,
  Chrome,
  Eye,
  GitBranch,
  Key,
  Lock,
  ShieldAlert,
  Users,
  Zap,
  FileText,
  ClipboardList,
  Scale,
  ShieldCheck,
  UserX,
} from "lucide-react";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schemas";
import type { IndustryPageData } from "../_data/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  ShieldAlert,
  Archive,
  ArrowDownUp,
  Building2,
  GitBranch,
  BarChart3,
  BookOpen,
  Chrome,
  Eye,
  Key,
  Lock,
  Users,
  Zap,
  FileText,
  ClipboardList,
  Scale,
  ShieldCheck,
  UserX,
};

export function IndustryPage({ data }: { data: IndustryPageData }) {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateFAQSchema(data.faqs),
            generateBreadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Industries", url: `${SITE_URL}/industries` },
              {
                name: data.industry,
                url: `${SITE_URL}/industries/${data.slug}`,
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
            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {data.compliance.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm"
                >
                  <Shield className="h-3 w-3 text-blue-400" />
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              {data.headline}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
              {data.subtitle}
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
              <Link href="/security">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                >
                  See guardrails
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ PAIN POINTS ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Without TeamPrompt
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {data.painPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-destructive/20 bg-destructive/[0.02] p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <X className="h-5 w-5 text-destructive shrink-0" />
                  <h3 className="font-semibold">{point.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ APP MOCKUP ━━━ */}
      <section className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <SectionLabel>With TeamPrompt</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Purpose-built for {data.industry.toLowerCase()} teams
            </h2>
          </div>
          <AppMockup
            variant={data.mockupVariant}
            items={data.mockupItems}
            sidebarUser={data.mockupUser}
            alertBanner={data.mockupAlert}
          />
        </div>
      </section>

      {/* ━━━ KEY FEATURES ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Key Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for {data.industry.toLowerCase()} compliance
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {data.features.map((feature) => {
              const Icon = iconMap[feature.icon] || Shield;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ STATS ━━━ */}
      <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-5xl">
        <div className="py-4">
          <StatsRow stats={data.stats} dark className="max-w-3xl mx-auto" />
        </div>
      </DarkSection>

      {/* ━━━ FAQ ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={data.faqs} />
        </div>
      </section>

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
