import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { StatsRow } from "@/components/marketing/stats-row";
import { AppMockup } from "@/components/marketing/app-mockup";
import { HeroImage } from "@/components/marketing/hero-image";
import { ArrowRight, Shield, MessageCircle } from "lucide-react";
import {
  Archive,
  ArrowDownUp,
  BarChart3,
  BookOpen,
  Building2,
  Chrome,
  Eye,
  GitBranch,
  Globe,
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
  Globe,
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

const industryHeroImages: Record<string, { src: string; alt: string; badgeIcon: string; badgeHeadline: string; badgeSubtitle: string; topBadgeIcon: string; topBadgeHeadline: string; topBadgeSubtitle: string }> = {
  healthcare: { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80&auto=format&fit=crop", alt: "Healthcare professional reviewing patient information", badgeIcon: "ShieldCheck", badgeHeadline: "PHI detection", badgeSubtitle: "HIPAA-ready scanning", topBadgeIcon: "Eye", topBadgeHeadline: "17 rules active", topBadgeSubtitle: "Real-time monitoring" },
  legal: { src: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=640&q=80&auto=format&fit=crop", alt: "Legal professional reviewing documents", badgeIcon: "Scale", badgeHeadline: "Client data protected", badgeSubtitle: "Privileged info secured", topBadgeIcon: "Lock", topBadgeHeadline: "100% blocked", topBadgeSubtitle: "Sensitive data caught" },
  technology: { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&q=80&auto=format&fit=crop", alt: "Software team collaborating on code", badgeIcon: "Key", badgeHeadline: "Secrets detected", badgeSubtitle: "API keys & tokens caught", topBadgeIcon: "Shield", topBadgeHeadline: "DLP active", topBadgeSubtitle: "Code protected" },
  finance: { src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=640&q=80&auto=format&fit=crop", alt: "Finance team analyzing data", badgeIcon: "Lock", badgeHeadline: "PII protected", badgeSubtitle: "Financial data secured", topBadgeIcon: "BarChart3", topBadgeHeadline: "SOX ready", topBadgeSubtitle: "Audit trail active" },
  government: { src: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=640&q=80&auto=format&fit=crop", alt: "Government office building", badgeIcon: "Shield", badgeHeadline: "CUI compliant", badgeSubtitle: "Controlled info blocked", topBadgeIcon: "Lock", topBadgeHeadline: "FedRAMP aligned", topBadgeSubtitle: "Security controls" },
  education: { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=640&q=80&auto=format&fit=crop", alt: "Students collaborating in classroom", badgeIcon: "Users", badgeHeadline: "Student data safe", badgeSubtitle: "FERPA-ready protection", topBadgeIcon: "ShieldCheck", topBadgeHeadline: "PII blocked", topBadgeSubtitle: "Auto-detected" },
  insurance: { src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=640&q=80&auto=format&fit=crop", alt: "Insurance professional at desk", badgeIcon: "ShieldAlert", badgeHeadline: "Claims secured", badgeSubtitle: "PII auto-detected", topBadgeIcon: "Eye", topBadgeHeadline: "15 blocked", topBadgeSubtitle: "This week" },
};

export function IndustryPage({ data }: { data: IndustryPageData }) {
  const heroImg = industryHeroImages[data.slug];
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
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
                    See data protection
                  </Button>
                </Link>
              </div>
            </div>

            {heroImg && (() => {
              const BadgeIcon = iconMap[heroImg.badgeIcon] || Shield;
              const TopIcon = iconMap[heroImg.topBadgeIcon] || Shield;
              return (
                <HeroImage
                  src={heroImg.src}
                  alt={heroImg.alt}
                  badge={{
                    icon: <BadgeIcon className="h-4 w-4" />,
                    headline: heroImg.badgeHeadline,
                    subtitle: heroImg.badgeSubtitle,
                  }}
                  topBadge={{
                    icon: <TopIcon className="h-3.5 w-3.5" />,
                    headline: heroImg.topBadgeHeadline,
                    subtitle: heroImg.topBadgeSubtitle,
                  }}
                  dark
                />
              );
            })()}
          </div>
        </div>
      </section>

      {/* ━━━ PAIN POINTS ━━━ */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Without TeamPrompt
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Teams across {data.industry.toLowerCase()} face the same risks when AI tools go unmanaged.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {data.painPoints.map((point, i) => (
              <div
                key={point.title}
                className="relative rounded-2xl border border-destructive/20 bg-card p-6 pl-8 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-destructive/60 to-destructive/20" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-destructive/60 mb-3 block">
                  Risk {i + 1}
                </span>
                <h3 className="font-semibold mb-2">{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ APP MOCKUP ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <SectionLabel>With TeamPrompt</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Purpose-built for {data.industry.toLowerCase()} teams
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              See how the dashboard looks for your team — complete with industry-specific security rules and prompts.
            </p>
          </div>
          <AppMockup
            variant={data.mockupVariant}
            items={data.mockupItems}
            sidebarUser={data.mockupUser}
            alertBanner={data.mockupAlert}
            toasts={data.mockupToasts}
            navBadges={data.mockupNavBadges}
          />
        </div>
      </section>

      {/* ━━━ KEY FEATURES ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>Key Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for {data.industry.toLowerCase()} compliance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with your industry&apos;s requirements in mind.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {data.features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || Shield;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl p-px bg-gradient-to-b from-border via-border/50 to-transparent hover:from-primary/40 hover:via-primary/20 hover:to-transparent transition-all duration-500"
                >
                  <div className="rounded-[15px] bg-card h-full p-7 relative overflow-hidden">
                    {/* Subtle gradient accent on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10 group-hover:ring-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5 transition-all duration-500">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums mt-1">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold leading-snug">{feature.title}</h3>
                      <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ SCENARIO ━━━ */}
      {data.scenario && (
        <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <SectionLabel className="mb-0">{data.scenario.title}</SectionLabel>
                <p className="text-sm text-muted-foreground">{data.scenario.persona}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1: Setup */}
              <div className="rounded-xl border border-border bg-card p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                  1 · Situation
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.scenario.setup}
                </p>
              </div>

              {/* Step 2: Trigger — highlighted */}
              <div className="rounded-xl border border-primary/20 bg-card p-5 border-l-4 border-l-primary/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-2 block">
                  2 · What TeamPrompt does
                </span>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {data.scenario.trigger}
                </p>
              </div>

              {/* Step 3: Resolution */}
              <div className="rounded-xl border border-border bg-card p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/60 mb-2 block">
                  3 · Result
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.scenario.resolution}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

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
