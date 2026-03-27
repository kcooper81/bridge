import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { FAQSection } from "@/components/marketing/faq-section";
import { StatsRow } from "@/components/marketing/stats-row";
import { AppMockup } from "@/components/marketing/app-mockup";
import { ArrowRight, Shield, MessageCircle, ArrowUpRight } from "lucide-react";
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

const relatedIndustries: Record<string, { slug: string; name: string; desc: string }[]> = {
  healthcare: [
    { slug: "insurance", name: "Insurance", desc: "Claims & policyholder data protection" },
    { slug: "legal", name: "Legal", desc: "Privilege & client data security" },
    { slug: "government", name: "Government", desc: "CUI & citizen data compliance" },
  ],
  legal: [
    { slug: "finance", name: "Finance", desc: "PCI-DSS & financial data protection" },
    { slug: "healthcare", name: "Healthcare", desc: "HIPAA-ready PHI detection" },
    { slug: "insurance", name: "Insurance", desc: "Claims & policyholder data protection" },
  ],
  technology: [
    { slug: "finance", name: "Finance", desc: "PCI-DSS & financial data protection" },
    { slug: "healthcare", name: "Healthcare", desc: "HIPAA-ready PHI detection" },
    { slug: "government", name: "Government", desc: "CUI & citizen data compliance" },
  ],
  finance: [
    { slug: "insurance", name: "Insurance", desc: "Claims & policyholder data protection" },
    { slug: "legal", name: "Legal", desc: "Privilege & client data security" },
    { slug: "healthcare", name: "Healthcare", desc: "HIPAA-ready PHI detection" },
  ],
  government: [
    { slug: "healthcare", name: "Healthcare", desc: "HIPAA-ready PHI detection" },
    { slug: "education", name: "Education", desc: "FERPA & student data protection" },
    { slug: "legal", name: "Legal", desc: "Privilege & client data security" },
  ],
  education: [
    { slug: "government", name: "Government", desc: "CUI & citizen data compliance" },
    { slug: "healthcare", name: "Healthcare", desc: "HIPAA-ready PHI detection" },
    { slug: "technology", name: "Technology", desc: "API key & source code protection" },
  ],
  insurance: [
    { slug: "healthcare", name: "Healthcare", desc: "HIPAA-ready PHI detection" },
    { slug: "finance", name: "Finance", desc: "PCI-DSS & financial data protection" },
    { slug: "legal", name: "Legal", desc: "Privilege & client data security" },
  ],
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

      {/* ━━━ HERO ━━━ Light, centered */}
      <section className="bg-[#FAFBFC] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
          {/* Compliance badges */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {data.compliance.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                <Shield className="h-3 w-3 text-primary" />
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] max-w-4xl mx-auto">
            {data.headline}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/security">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                See data protection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ PAIN POINTS — Before / After split ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              What changes with TeamPrompt
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {data.industry} teams face real risks when AI tools go unmanaged. Here&apos;s how TeamPrompt fixes each one.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-4">
            {data.painPoints.map((point, i) => (
              <div
                key={point.title}
                className="grid sm:grid-cols-2 rounded-2xl border border-border overflow-hidden"
              >
                {/* Before — the problem */}
                <div className="p-6 sm:p-8 bg-red-50/50 dark:bg-red-950/10 border-b sm:border-b-0 sm:border-r border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
                      <span className="text-[10px] font-bold text-red-500">{i + 1}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-500/70">Without TeamPrompt</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </div>

                {/* After — the fix */}
                <div className="p-6 sm:p-8 bg-emerald-50/50 dark:bg-emerald-950/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500/70">With TeamPrompt</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {point.title.includes("sensitive") || point.title.includes("data") || point.title.includes("leak")
                      ? "Real-time DLP scanning detects and blocks sensitive data before it reaches any AI tool."
                      : point.title.includes("compliance") || point.title.includes("audit") || point.title.includes("regulation")
                      ? "19 pre-built compliance packs with full audit trails and exportable reports for regulators."
                      : point.title.includes("prompt") || point.title.includes("quality") || point.title.includes("standard")
                      ? "One shared prompt library with approval workflows, templates, and quality guidelines."
                      : point.title.includes("visibility") || point.title.includes("shadow") || point.title.includes("monitor")
                      ? "Complete visibility into who uses which AI tools, what data is shared, and when."
                      : "Automated guardrails that protect your team without slowing them down."}
                  </p>
                </div>
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
          <FAQSection faqs={data.faqs} includeSchema={false} />
        </div>
      </section>

      {/* ━━━ RELATED INDUSTRIES ━━━ */}
      {relatedIndustries[data.slug] && (
        <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <SectionLabel>Related Industries</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Explore other industries we serve
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
              {relatedIndustries[data.slug].map((related) => (
                <Link
                  key={related.slug}
                  href={`/industries/${related.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {related.name}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{related.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ GET STARTED + LEAD CAPTURE ━━━ */}
      <div className="border-t border-border">
        <GetStartedSteps />
      </div>
      <LeadCaptureForm />
    </>
  );
}
