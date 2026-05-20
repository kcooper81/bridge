import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Download } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { REPORT_META, REPORT_STATS } from "@/lib/research/state-of-prompt-data-leakage-q2-2026";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export const metadata: Metadata = generatePageMetadata({
  title: "TeamPrompt Research — Original data on AI security, prompt DLP, and governance",
  description:
    "Original-data research on the AI security operational gap. Quarterly reports synthesizing public studies with anonymized signals from TeamPrompt's free Prompt PII Scanner. Free, CC-BY licensed, no email gate.",
  path: "/research",
  keywords: [
    "AI security research",
    "prompt DLP research",
    "AI data leak statistics",
    "TeamPrompt research",
    "state of prompt data leakage",
    "AI governance research",
  ],
});

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Research", url: `${SITE_URL}/research` },
]);

export default function ResearchIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      {/* Hero */}
      <section
        className="border-b border-border pt-28 pb-14 sm:pt-36 sm:pb-20"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 60%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            TeamPrompt Research
          </p>
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight leading-[1.1]">
            Original data on AI security and prompt governance
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Quarterly reports synthesizing public research with anonymized signals from the free
            Prompt PII Scanner. CC-BY licensed, no email gate. Free to cite with attribution.
          </p>
        </div>
      </section>

      {/* Featured report card */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Latest report · {REPORT_META.edition}
          </p>
          <Link
            href="/research/state-of-prompt-data-leakage-q2-2026"
            className="group block rounded-2xl border border-border bg-card p-6 sm:p-8 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <BarChart3 className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {REPORT_META.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {REPORT_META.subtitle}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {REPORT_STATS.slice(0, 4).map((s) => (
                <div key={s.id} className="rounded-xl bg-muted/30 px-3 py-3">
                  <div className="text-2xl font-bold tabular-nums">
                    {s.value}<span className="text-sm text-muted-foreground">{s.unit || ""}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-snug mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-primary font-medium group-hover:underline">
                Read the report <ArrowRight className="h-4 w-4" />
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Download className="h-3.5 w-3.5" /> CSV + JSON downloads
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Cadence + license */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Cadence
            </h3>
            <p className="text-sm leading-relaxed">
              Quarterly. Each report compounds on the methodology of the previous edition;
              changelogs and revisions are appended to the same URL so citations stay durable.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              License
            </h3>
            <p className="text-sm leading-relaxed">
              All TeamPrompt Research reports ship under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                CC-BY 4.0
              </a>
              . Reuse, embed, quote, or republish — please cite the source URL.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
