import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { OWASP_ENTRIES, type OwaspEntry } from "./_data";

export const metadata: Metadata = generatePageMetadata({
  title: "OWASP LLM Top 10 (2025) — Operational Guide for Production AI Systems",
  description:
    "How to detect, block, and log each of the OWASP LLM Top 10 (2025) risks in a real chat workflow. Beyond definitions — what to ship, what to log, what to test.",
  path: "/security/owasp-llm-top-10",
  keywords: [
    "OWASP LLM Top 10",
    "LLM security",
    "AI security checklist",
    "prompt injection defense",
    "LLM01 prompt injection",
    "LLM02 sensitive disclosure",
    "OWASP LLM 2025",
    "AI security operational guide",
  ],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Security", url: `${SITE_URL}/security` },
  { name: "OWASP LLM Top 10", url: `${SITE_URL}/security/owasp-llm-top-10` },
]);

const techArticleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "OWASP LLM Top 10 (2025) — Operational Guide for Production AI Systems",
  description:
    "How to detect, block, and log each of the OWASP LLM Top 10 (2025) risks in a real chat workflow.",
  datePublished: "2026-05-19",
  dateModified: "2026-05-19",
  author: {
    "@type": "Person",
    name: "Eric Campton",
    jobTitle: "Founder, TeamPrompt",
    url: `${SITE_URL}/about`,
  },
  publisher: {
    "@type": "Organization",
    name: "TeamPrompt",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-icon-blue.svg` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/security/owasp-llm-top-10` },
  about: [
    { "@type": "Thing", name: "OWASP LLM Top 10" },
    { "@type": "Thing", name: "Large Language Model Security" },
    { "@type": "Thing", name: "Prompt Injection" },
    { "@type": "Thing", name: "AI Data Loss Prevention" },
  ],
};

const RISK_ICON = {
  critical: ShieldX,
  high: ShieldAlert,
  medium: ShieldCheck,
};

const RISK_STYLE = {
  critical: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-900" },
  high: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-900" },
  medium: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-900" },
};

export default function OwaspLlmTop10Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }} />

      {/* Hero */}
      <section
        className="border-b border-border pt-28 pb-14 sm:pt-36 sm:pb-20"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 60%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/security" className="hover:text-primary">Security</Link>
            <span>/</span>
            <span className="text-foreground">OWASP LLM Top 10</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight leading-tight">
            OWASP LLM Top 10 (2025) — operational guide
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Most OWASP LLM Top 10 references stop at &quot;what is it.&quot; This page goes further: for
            every risk, the exact patterns to detect it in production, the controls that actually block it,
            what to log for audit, and which compliance frameworks it maps to. Updated for the 2025 edition.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>By <strong className="text-foreground">Eric Campton</strong>, Founder · TeamPrompt</span>
            <span>·</span>
            <span>Updated May 2026</span>
            <span>·</span>
            <a
              href="https://genai.owasp.org/llm-top-10/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              Official OWASP source
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* TOC + intro */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Contents</span>
            </div>
            <ol className="divide-y divide-border">
              {OWASP_ENTRIES.map((e) => {
                const style = RISK_STYLE[e.risk];
                return (
                  <li key={e.id}>
                    <a
                      href={`#${e.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 rounded-md ${style.bg} ${style.text} ${style.border} border px-2 py-0.5 text-xs font-mono font-semibold`}>
                          {e.id}
                        </span>
                        <span className="min-w-0">
                          <span className="text-sm font-medium">{e.title}</span>
                          <span className="block sm:inline sm:ml-2 text-xs text-muted-foreground truncate">{e.oneLiner}</span>
                        </span>
                      </span>
                      <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Entries */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
          {OWASP_ENTRIES.map((entry) => (
            <EntryBlock key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      {/* Closing context */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-semibold">Why we maintain this page</h2>
          <div className="mt-4 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              The official OWASP entries describe each risk in product-agnostic terms. That&apos;s the right
              call for a standards body — but operators need answers to four operational questions per
              risk: <strong className="text-foreground">how do I detect this in my logs?</strong>,{" "}
              <strong className="text-foreground">what control actually blocks it?</strong>,{" "}
              <strong className="text-foreground">what do I log for audit?</strong>, and{" "}
              <strong className="text-foreground">which framework requirements does this satisfy?</strong>
              {" "}This page tries to answer those four for each entry, grounded in real incidents (Samsung
              Semiconductor, Replit agent DB wipe, ChatGPT memory persistence, Hugging Face supply chain,
              Mata v. Avianca).
            </p>
            <p>
              <strong className="text-foreground">A note on scope:</strong> these recommendations target
              the SaaS-AI-consumer pattern (your team uses ChatGPT/Claude/Copilot, or you embed a
              third-party model in your product). Self-hosted training/fine-tuning has additional concerns
              not covered here.
            </p>
            <p>
              Spotted an error or want a control added? Email{" "}
              <a href="mailto:security@teamprompt.app" className="text-primary hover:underline">
                security@teamprompt.app
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-semibold">Implementing these controls without writing them from scratch</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            TeamPrompt ships LLM01, LLM02, LLM06, LLM07, LLM10 controls out of the box — prompt-side DLP,
            output redaction, tool-call audit, system-prompt isolation, and per-user cost controls. Connect
            your team&apos;s AI tools in under two minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85 transition"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tools/prompt-pii-scanner"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              Try the free Prompt PII Scanner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function EntryBlock({ entry }: { entry: OwaspEntry }) {
  const Icon = RISK_ICON[entry.risk];
  const style = RISK_STYLE[entry.risk];
  return (
    <article id={entry.slug} className="scroll-mt-24">
      <header className={`rounded-2xl border ${style.border} ${style.bg} p-5 sm:p-6`}>
        <div className="flex items-start gap-4">
          <div className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background ring-1 ring-border`}>
            <Icon className={`h-5 w-5 ${style.text}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold mb-1">
              <span className={`rounded-md ${style.text}`}>{entry.id}</span>
              <span className={`uppercase tracking-wider ${style.text}`}>{entry.risk}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{entry.title}</h2>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{entry.oneLiner}</p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-4 text-sm leading-relaxed text-foreground/85">
          <h3 className="text-base font-semibold text-foreground">What it is</h3>
          <p>{entry.whatItIs}</p>
          <h3 className="text-base font-semibold text-foreground pt-2">Concrete example</h3>
          <p className="text-muted-foreground italic">{entry.example}</p>
        </div>

        <div className="space-y-5">
          <ControlList title="How to detect" items={entry.howToDetect} />
          <ControlList title="How to block" items={entry.howToBlock} />
          <ControlList title="What to log" items={entry.whatToLog} />
          {entry.mappings.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-2">Compliance mappings</h3>
              <ul className="space-y-1.5 text-xs">
                {entry.mappings.map((m, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="font-mono text-muted-foreground shrink-0">{m.label}</span>
                    <span className="text-foreground/80">{m.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ControlList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <ul className="space-y-2 text-sm text-foreground/85">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/60 shrink-0" aria-hidden />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
