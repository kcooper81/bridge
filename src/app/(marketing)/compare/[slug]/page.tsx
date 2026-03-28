import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui/button";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { ArrowRight, Check, X } from "lucide-react";
import { COMPARISON_PAGES, getComparisonBySlug } from "./_data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return COMPARISON_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getComparisonBySlug(params.slug);
  if (!page) return {};
  return generatePageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/compare/${page.slug}`,
    keywords: page.keywords,
  });
}

export default function ComparisonDetailPage({ params }: { params: { slug: string } }) {
  const page = getComparisonBySlug(params.slug);
  if (!page) notFound();

  const isListicle = page.slug === "best-ai-dlp-tools";

  return (
    <>
      {/* Hero */}
      <section
        className="border-b border-border pt-32 pb-20 sm:pt-40 sm:pb-28"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 50%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
            {page.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {page.intro}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="rounded-lg font-bold px-8">
                Try TeamPrompt Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-center mb-12">
            Feature Comparison
          </h2>

          <div className="rounded-[20px] border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 text-sm bg-muted/30">
              <div className="px-5 py-4 font-semibold border-b border-border">Feature</div>
              <div className="px-5 py-4 font-semibold border-b border-border text-center text-primary">TeamPrompt</div>
              <div className="px-5 py-4 font-semibold border-b border-border text-center">
                {isListicle ? "Others" : page.competitor}
              </div>
            </div>

            {/* Rows */}
            {page.features.map((row, i) => (
              <div key={row.feature} className={cn("grid grid-cols-3 text-sm", i % 2 === 0 ? "" : "bg-muted/10")}>
                <div className="px-5 py-3 border-b border-border/50 text-muted-foreground">
                  {row.feature}
                </div>
                <div className="px-5 py-3 border-b border-border/50 text-center bg-primary/[0.02]">
                  <CellValue value={row.teamPrompt} positive />
                </div>
                <div className="px-5 py-3 border-b border-border/50 text-center">
                  <CellValue value={row.competitor} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strengths */}
      {page.teamPromptStrengths.length > 0 && (
        <section className="py-20 sm:py-28 border-t border-border" style={{ background: "linear-gradient(180deg, #fff 0%, #F6F2FF 50%, #fff 100%)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className={cn("grid gap-8", page.competitorStrengths.length > 0 ? "lg:grid-cols-2" : "max-w-3xl mx-auto")}>
              <div>
                <h3 className="text-xl font-semibold mb-6 text-emerald-600">Where TeamPrompt wins</h3>
                <div className="space-y-3">
                  {page.teamPromptStrengths.map((s) => (
                    <div key={s} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {page.competitorStrengths.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Where {page.competitor} wins</h3>
                  <div className="space-y-3">
                    {page.competitorStrengths.map((s) => (
                      <div key={s} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Verdict */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-center mb-6">
            The Verdict
          </h2>
          <p className="text-lg text-muted-foreground text-center leading-relaxed">
            {page.verdict}
          </p>
          <div className="text-center mt-8">
            <Link href="/signup">
              <Button size="lg" className="rounded-lg font-bold px-8">
                Start Free with TeamPrompt <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <GetStartedSteps />
      <LeadCaptureForm />
    </>
  );
}

function CellValue({ value, positive = false }: { value: string | boolean; positive?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className={cn("h-5 w-5 mx-auto", positive ? "text-emerald-500" : "text-muted-foreground")} />
    ) : (
      <X className="h-5 w-5 mx-auto text-muted-foreground/40" />
    );
  }
  return (
    <span className={cn("text-xs font-medium", positive ? "text-emerald-600" : "text-muted-foreground")}>
      {value}
    </span>
  );
}
