import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Download, FileText, User } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import {
  REPORT_META,
  REPORT_STATS,
  LEAK_CATEGORIES,
  ROLE_BREAKDOWN,
  TOOL_BREAKDOWN,
  KEY_FINDINGS,
  METHODOLOGY,
  ONE_PAGER_BULLETS,
} from "@/lib/research/state-of-prompt-data-leakage-q2-2026";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
const PATH = "/research/state-of-prompt-data-leakage-q2-2026";

export const metadata: Metadata = generatePageMetadata({
  title: REPORT_META.title + " — TeamPrompt Research",
  description: REPORT_META.subtitle,
  path: PATH,
  keywords: [
    "state of prompt data leakage",
    "AI prompt data leak statistics",
    "Cyberhaven 11% prompt leak",
    "shadow AI statistics 2026",
    "ChatGPT data leak research",
    "AI DLP report",
    "prompt injection statistics",
    "AI governance research 2026",
  ],
});

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Research", url: `${SITE_URL}/research` },
  { name: REPORT_META.title, url: `${SITE_URL}${PATH}` },
]);

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: REPORT_META.title,
  description: REPORT_META.subtitle,
  url: `${SITE_URL}${PATH}`,
  creator: {
    "@type": "Organization",
    name: "TeamPrompt",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "TeamPrompt",
    url: SITE_URL,
  },
  datePublished: REPORT_META.publishedAt,
  dateModified: REPORT_META.publishedAt,
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
  distribution: [
    {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `${SITE_URL}${PATH}/data.csv`,
    },
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${SITE_URL}${PATH}/data.json`,
    },
  ],
  variableMeasured: REPORT_STATS.map((s) => s.label),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: REPORT_META.title,
  description: REPORT_META.subtitle,
  datePublished: REPORT_META.publishedAt,
  dateModified: REPORT_META.publishedAt,
  author: {
    "@type": "Person",
    name: REPORT_META.authorName,
    jobTitle: REPORT_META.authorRole,
    url: `${SITE_URL}/about`,
  },
  publisher: {
    "@type": "Organization",
    name: "TeamPrompt",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-icon-blue.svg` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${PATH}` },
};

export default function StateOfPromptDataLeakageReport() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* Hero */}
      <section
        className="border-b border-border pt-28 pb-14 sm:pt-36 sm:pb-20"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 60%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">
              Research
            </Link>
            <span>/</span>
            <span className="text-foreground">Q2 2026</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            TeamPrompt Research · {REPORT_META.edition}
          </p>
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight leading-[1.1]">
            {REPORT_META.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {REPORT_META.subtitle}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              By <Link href="/about" className="text-foreground hover:underline">{REPORT_META.authorName}</Link>, {REPORT_META.authorRole}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Published {new Date(REPORT_META.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`${PATH}/data.csv`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/85 transition"
            >
              <Download className="h-4 w-4" /> Download data (CSV)
            </a>
            <a
              href={`${PATH}/data.json`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              <FileText className="h-4 w-4" /> JSON
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            CC-BY 4.0 license. Free to cite with attribution; no email gate.
          </p>
        </div>
      </section>

      {/* Headline number */}
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Headline finding
          </p>
          <div className="text-7xl sm:text-9xl font-bold tracking-tight text-foreground tabular-nums">
            {REPORT_META.headlineNumber}
          </div>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {REPORT_META.headlineCaption}
          </p>
        </div>
      </section>

      {/* Key findings */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Key findings
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Five takeaways</h2>
          <ol className="space-y-6">
            {KEY_FINDINGS.map((f) => (
              <li key={f.n} className="flex gap-4">
                <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {f.n}
                </span>
                <p className="text-base text-foreground/85 leading-relaxed pt-1">{f.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stats cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">By the numbers</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Eight headline statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_STATS.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold tabular-nums">{s.value}</span>
                  {s.unit && <span className="text-lg font-semibold text-muted-foreground">{s.unit}</span>}
                </div>
                <p className="text-sm font-medium leading-snug">{s.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{s.context}</p>
                <a
                  href={s.source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-3 inline-block text-[11px] text-primary hover:underline"
                >
                  Source: {s.source.name} ({s.source.year})
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Category breakdown</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">
            What&apos;s actually in the leaked 11.3%
          </h2>
          <div className="space-y-3">
            {LEAK_CATEGORIES.sort((a, b) => b.percentage - a.percentage).map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className="text-base font-bold tabular-nums">{c.percentage}%</div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(100, c.percentage * 4)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic mt-4">
            Percentages reflect share of flagged prompts containing each category. Single prompts often
            contain multiple categories, so percentages sum to more than 100%.
          </p>
        </div>
      </section>

      {/* Role and tool tables */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">By role</p>
            <h2 className="text-xl font-bold mb-5">Leak rate by job function</h2>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Role</th>
                    <th className="text-right px-4 py-2 font-medium">Leak rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ROLE_BREAKDOWN.map((r) => (
                    <tr key={r.role}>
                      <td className="px-4 py-2.5">
                        <div>{r.role}</div>
                        <div className="text-[11px] text-muted-foreground">{r.primaryCategory}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{r.leakRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">By tool</p>
            <h2 className="text-xl font-bold mb-5">Leak rate by AI provider</h2>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Tool</th>
                    <th className="text-right px-4 py-2 font-medium">Leak rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TOOL_BREAKDOWN.map((t) => (
                    <tr key={t.tool}>
                      <td className="px-4 py-2.5">
                        <div>{t.tool}</div>
                        <div className="text-[11px] text-muted-foreground">{t.note}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{t.leakRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Methodology</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">How we got these numbers</h2>
          <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none prose-p:leading-[1.7] prose-p:text-foreground/85">
            {METHODOLOGY.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* One-pager */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Press-ready summary</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">The one-pager</h2>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <ul className="space-y-3 text-sm sm:text-base">
              {ONE_PAGER_BULLETS.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 mt-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span className="text-foreground/85 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
              Citation: TeamPrompt, &quot;{REPORT_META.title},&quot; published{" "}
              {new Date(REPORT_META.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
              CC-BY 4.0.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-semibold">Your team has prompts going somewhere right now.</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            See what&apos;s in them — for free, in your browser. The same engine that produces these
            aggregate signals also runs on the public scanner.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/prompt-pii-scanner"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85 transition"
            >
              Try the free scanner <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              Start a free workspace
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
