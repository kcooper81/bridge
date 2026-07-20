import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateTechArticleSchema, generateFAQSchema } from "@/lib/seo/schemas";
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
  const url = `https://teamprompt.app/compare/${page.slug}`;
  const articleSchema = generateTechArticleSchema({
    headline: page.metaTitle,
    description: page.metaDescription,
    url,
  });
  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "https://teamprompt.app" },
    { name: "Compare", url: "https://teamprompt.app/compare" },
    { name: page.title, url },
  ]);

  // FAQ schema generated from the comparison data — single most impactful
  // schema type for AI Overview citations (firepits/Authoritas 2026 data).
  const faqSchema = !isListicle ? generateFAQSchema([
    {
      question: `How is TeamPrompt different from ${page.competitor}?`,
      answer:
        page.teamPromptStrengths.slice(0, 3).join(". ") +
        (page.teamPromptStrengths.length > 0 ? "." : ""),
    },
    {
      question: `When should I choose ${page.competitor} over TeamPrompt?`,
      answer:
        page.competitorStrengths.length > 0
          ? page.competitorStrengths.slice(0, 3).join(". ") + "."
          : `${page.competitor} can be a better fit when your DLP need extends well beyond AI tools. For teams whose primary concern is ChatGPT, Claude, Gemini, and Copilot, TeamPrompt covers more ground at a lower price point.`,
    },
    {
      question: `Does TeamPrompt have a free tier?`,
      answer:
        "Yes — TeamPrompt is free for up to 3 users with full DLP scanning, prompt library, and audit logs included. Paid plans (Pro and Team) include a 14-day trial, no credit card required.",
    },
    {
      question: `Which AI tools does TeamPrompt protect?`,
      answer:
        "TeamPrompt's browser extension protects ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. Network-level blocking via Cloudflare Gateway extends coverage to any other AI tool your team accesses.",
    },
    {
      question: `How long does it take to deploy TeamPrompt vs ${page.competitor}?`,
      answer:
        "TeamPrompt is self-serve and deploys in under 5 minutes — install the extension, invite your team, done. Enterprise DLP vendors typically require multi-week onboarding with IT and security teams.",
    },
  ]) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

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

          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>By{" "}
              <Link href="/about/team/eric-campton" className="text-foreground/80 hover:text-foreground hover:underline font-medium">
                Eric Campton
              </Link>
            </span>
            <span className="text-border">·</span>
            <span>Founder, TeamPrompt</span>
            <span className="text-border">·</span>
            <span>Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-lg font-bold px-8">
              <Link href="/signup">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-lg font-bold px-8">
              <Link href="/pricing">
                See pricing
              </Link>
            </Button>
          </div>

          {/* Pricing tile — buyers arriving from "X alternative" queries
              want to see price before they finish reading the comparison.
              Nightfall/BigID/Cyberhaven all hide pricing; we don't. */}
          <div className="mt-8 inline-flex items-center gap-4 rounded-full border border-border bg-muted/40 px-5 py-2.5 text-xs">
            <span><strong className="text-foreground">Free</strong> for 3 users</span>
            <span className="text-border">·</span>
            <span><strong className="text-foreground">$8</strong>/user/mo Pro</span>
            <span className="text-border">·</span>
            <span><strong className="text-foreground">$12</strong>/user/mo Team</span>
            <Link href="/pricing" className="text-primary hover:underline">Full pricing →</Link>
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
            <div className="grid grid-cols-3 text-xs sm:text-sm bg-muted/30">
              <div className="px-2 sm:px-5 py-4 font-semibold border-b border-border">Feature</div>
              <div className="px-2 sm:px-5 py-4 font-semibold border-b border-border text-center text-primary">TeamPrompt</div>
              <div className="px-2 sm:px-5 py-4 font-semibold border-b border-border text-center">
                {isListicle ? "Others" : page.competitor}
              </div>
            </div>

            {/* Rows */}
            {page.features.map((row, i) => (
              <div key={row.feature} className={cn("grid grid-cols-3 text-xs sm:text-sm", i % 2 === 0 ? "" : "bg-muted/10")}>
                <div className="px-2 sm:px-5 py-3 border-b border-border/50 text-muted-foreground">
                  {row.feature}
                </div>
                <div className="px-2 sm:px-5 py-3 border-b border-border/50 text-center bg-primary/[0.02]">
                  <CellValue value={row.teamPrompt} positive />
                </div>
                <div className="px-2 sm:px-5 py-3 border-b border-border/50 text-center">
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
            <Button asChild size="lg" className="rounded-lg font-bold px-8">
              <Link href="/signup">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related comparisons — topically sorted by category. Polymer
          buyer should see Cyberhaven / BigID / Witness AI (other DLP +
          observability), not Notion / ChatGPT Teams (different category).
          Groups: dlp-platform / enterprise-data / ai-firewall /
          single-tool / listicle. */}
      <section className="py-16 sm:py-20 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-center mb-8">
            More TeamPrompt comparisons
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(() => {
              // Topical clusters — keep ordering stable so users coming
              // from /compare/polymer see Cyberhaven first, not Notion.
              //
              // SLUG_CLUSTER is the single source of truth for membership;
              // TOPICAL is derived from it. These were previously two
              // hand-maintained maps that had drifted — cyberhaven was listed
              // under both dlp-platform and data-discovery in TOPICAL while
              // SLUG_CLUSTER assigned it dlp-platform, so its "same cluster"
              // set resolved inconsistently depending on which map was read.
              const SLUG_CLUSTER: Record<string, string> = {
                "nightfall": "dlp-platform",
                "polymer": "dlp-platform",
                "purview": "dlp-platform",
                "cyberhaven": "dlp-platform",
                "bigid": "data-discovery",
                "prompt-security": "ai-observability",
                "witness-ai": "ai-observability",
                "lakera": "ai-observability",
                "chatgpt-teams": "ai-tool-direct",
                "notion": "ai-tool-direct",
                "best-ai-dlp-tools": "listicle",
              };
              const TOPICAL = Object.entries(SLUG_CLUSTER).reduce<Record<string, string[]>>(
                (acc, [slug, cluster]) => {
                  (acc[cluster] ||= []).push(slug);
                  return acc;
                },
                {}
              );

              // The category hub is pinned rather than left to cluster
              // overflow. It sits alone in the "listicle" cluster, so under
              // plain declaration-order overflow it landed past the display
              // cap on nearly every page and received almost no internal
              // links — while being the page we most want to rank.
              const HUB = "best-ai-dlp-tools";

              const myCluster = SLUG_CLUSTER[page.slug] || "dlp-platform";
              const sameCluster = (TOPICAL[myCluster] || []).filter((s) => s !== page.slug);
              const otherClusters = Object.entries(TOPICAL)
                .filter(([k]) => k !== myCluster)
                .flatMap(([, slugs]) => slugs)
                .filter((s) => s !== page.slug);
              const seen = new Set<string>();
              const deduped: string[] = [];
              for (const s of [HUB, ...sameCluster, ...otherClusters]) {
                if (s !== page.slug && !seen.has(s)) { seen.add(s); deduped.push(s); }
              }
              // 8, not 4: with 11 comparison pages this interlinks nearly the
              // whole cluster and fills two clean rows at lg. The old cap of 4
              // left the weakest pages with almost no inbound internal links.
              const ranked = deduped
                .map((slug) => COMPARISON_PAGES.find((p) => p.slug === slug))
                .filter((p): p is NonNullable<typeof p> => Boolean(p))
                .slice(0, 8);
              return ranked.map((p) => (
                <Link
                  key={p.slug}
                  href={`/compare/${p.slug}`}
                  className="rounded-2xl border border-border bg-background p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group"
                >
                  <div className="text-xs text-muted-foreground mb-1">vs</div>
                  <div className="text-sm font-semibold group-hover:text-primary transition-colors">{p.competitor}</div>
                  <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.intro.split(". ")[0]}.</div>
                  <div className="mt-3 inline-flex items-center text-xs text-primary group-hover:underline">
                    Read comparison <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </Link>
              ));
            })()}
          </div>
          <div className="text-center mt-8">
            <Link href="/compare" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              See all AI DLP comparisons <ArrowRight className="ml-1 h-3 w-3" />
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
