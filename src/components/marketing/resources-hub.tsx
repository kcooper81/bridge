import Link from "next/link";
import { ArrowRight, FileText, Search, Shield } from "lucide-react";

/**
 * Resources hub strip — surfaces the 3 highest-value linkable assets we
 * own (free PII scanner tool, original research report, OWASP LLM Top 10
 * reference) at the bottom of deep landing pages (industries, compliance).
 *
 * Audit finding (2026-06-06): the homepage shipped a "Free tools &
 * research" section; deep landing pages got GetStartedSteps + lead form
 * only — leaving buyers from /compliance/hipaa or /industries/government
 * with no path to the high-trust assets that build credibility.
 */
export function ResourcesHub() {
  return (
    <section className="py-20 sm:py-24 border-t border-border bg-muted/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            More from TeamPrompt
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
            Free tools, original research, and a security reference
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/tools/prompt-pii-scanner"
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 mb-3">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-sm font-semibold group-hover:text-primary transition-colors">Prompt PII Scanner</div>
            <div className="text-xs text-muted-foreground mt-1">Detects 15+ sensitive data types — free, runs in your browser.</div>
            <div className="mt-3 inline-flex items-center text-xs text-primary group-hover:underline">
              Try the free tool <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </Link>

          <Link
            href="/research/state-of-prompt-data-leakage-q2-2026"
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm font-semibold group-hover:text-primary transition-colors">State of Prompt Data Leakage — Q2 2026</div>
            <div className="text-xs text-muted-foreground mt-1">Original research from real-world TeamPrompt deployments.</div>
            <div className="mt-3 inline-flex items-center text-xs text-primary group-hover:underline">
              Read the report <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </Link>

          <Link
            href="/security/owasp-llm-top-10"
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 mb-3">
              <Search className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-sm font-semibold group-hover:text-primary transition-colors">OWASP LLM Top 10</div>
            <div className="text-xs text-muted-foreground mt-1">Threat reference for teams building or operating LLM-powered apps.</div>
            <div className="mt-3 inline-flex items-center text-xs text-primary group-hover:underline">
              See the reference <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
