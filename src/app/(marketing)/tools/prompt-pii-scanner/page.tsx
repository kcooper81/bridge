import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { PromptPiiScanner, EmbedSnippet } from "./_components/scanner";

export const metadata: Metadata = generatePageMetadata({
  title: "Prompt PII Scanner — Free Tool to Detect Sensitive Data in AI Prompts",
  description:
    "Paste any prompt and instantly see what PII, PHI, credentials, or financial data it leaks. Runs 100% in your browser — nothing is sent to any server. Free, no signup.",
  path: "/tools/prompt-pii-scanner",
  keywords: [
    "prompt PII scanner",
    "ChatGPT data leak check",
    "prompt redaction tool",
    "AI prompt DLP",
    "sensitive data scanner",
    "prompt safety checker",
    "free PII detector",
    "HIPAA prompt scan",
    "PCI prompt scan",
  ],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Tools", url: `${SITE_URL}/tools` },
  { name: "Prompt PII Scanner", url: `${SITE_URL}/tools/prompt-pii-scanner` },
]);

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Prompt PII Scanner",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Free browser-side scanner that flags PII, PHI, credentials, and financial data in AI prompts before they reach ChatGPT, Claude, or any LLM.",
  url: `${SITE_URL}/tools/prompt-pii-scanner`,
  publisher: { "@type": "Organization", name: "TeamPrompt", url: SITE_URL },
  aggregateRating: undefined,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is anything I paste sent to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The entire scanner runs in your browser using JavaScript pattern matching and Luhn validation. There are no network calls, no telemetry on the content, and nothing is stored. You can verify by opening DevTools → Network and watching that pasting a prompt produces zero requests.",
      },
    },
    {
      "@type": "Question",
      name: "What categories of sensitive data does it detect?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Credit cards (Luhn-validated), US Social Security Numbers, AWS access/secret keys, generic API keys (Stripe, GitHub, GitLab, Slack, SendGrid, bearer tokens), JWTs, PEM private keys, IBANs, ICD-10 diagnosis codes, medical record numbers, dates of birth, US street addresses, passport numbers, email addresses, phone numbers, and IP addresses.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is detection?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Detection is heuristic. High-confidence categories (Luhn-valid card numbers, well-formed AWS keys, PEM blocks) have low false-positive rates. Broader patterns (street addresses, ICD-10 codes, generic API keys) trade some precision for recall and may flag legitimate text. Always review the redacted output before assuming a prompt is safe.",
      },
    },
    {
      "@type": "Question",
      name: "Can I embed this scanner on my own site?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use the iframe snippet on this page. The embedded version preserves the same client-side guarantee — nothing leaves the user's browser — and links back to teamprompt.app for attribution.",
      },
    },
    {
      "@type": "Question",
      name: "Will this replace my enterprise DLP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This is an awareness tool, not a control. For organization-wide enforcement, you need server-side or browser-extension DLP that can block, redact, or log policy violations across every prompt — which is what TeamPrompt's commercial product does.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between this and ChatGPT Enterprise's data controls?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ChatGPT Enterprise commits to not train on your prompts and isolates them from other tenants. It does not detect or redact sensitive content inside the prompts you send — that's the gap this scanner (and prompt DLP generally) addresses. The two are complementary.",
      },
    },
  ],
};

const faqs = faqSchema.mainEntity;

export default function PromptPiiScannerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section
        className="border-b border-border pt-28 pb-12 sm:pt-36 sm:pb-16"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 60%, #fff 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            100% client-side · no data leaves your browser
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-tight">
            Prompt PII Scanner
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste any prompt and instantly see what sensitive data it contains — PII, PHI, credentials,
            payment info — before it reaches ChatGPT, Claude, Gemini, Copilot, or any LLM. Free, no
            signup, nothing logged.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Detects 15+ categories
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Luhn-validated card numbers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> HIPAA &amp; PCI categories
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Embeddable on any site
            </span>
          </div>
        </div>
      </section>

      {/* Scanner */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <PromptPiiScanner />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-primary">How it works</span>
              <h2 className="mt-2 text-2xl font-semibold">Local pattern matching, then a weighted risk score</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Every keystroke triggers a scan in your browser. We run validated patterns — Luhn for
                cards, IBAN structure, AWS key prefixes, JWT three-part shape, PEM block markers, and
                contextual regexes for PHI and addresses — then weight each finding by severity to
                produce a 0–100 score.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
              {[
                { label: "Critical", weight: "35 pts", desc: "Cards, SSN, AWS keys, private keys" },
                { label: "High", weight: "15 pts", desc: "JWTs, API keys, IBAN, PHI codes" },
                { label: "Medium", weight: "6 pts", desc: "Email, phone, DOB, addresses" },
                { label: "Low", weight: "2 pts", desc: "IP addresses, host names" },
                { label: "Multi-find", weight: "+log10×0.3", desc: "Diminishing returns within category" },
                { label: "Cap", weight: "100 max", desc: "Score never exceeds 100" },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{c.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{c.weight}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Why this exists</span>
          <h2 className="mt-2 text-2xl font-semibold">Traditional DLP is blind to AI prompts</h2>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Network DLP fingerprints files leaving the organization — PDFs, CSVs, images. A 4,000-character
              ChatGPT prompt is just request body text to api.openai.com. It doesn&apos;t look like
              exfiltration to your network controls, and it doesn&apos;t touch endpoint triggers like USB
              writes or clipboard policy.
            </p>
            <p>
              A 2023 Cyberhaven study found <strong className="text-foreground">11% of employees</strong>{" "}
              had pasted confidential company data into ChatGPT — and that&apos;s before considering Claude,
              Gemini, Copilot, Perplexity, and dozens of other tools. Three years later, the rate has only
              grown.
            </p>
            <p>
              This scanner is the awareness layer. For organization-wide enforcement — automatic redaction,
              policy violations logged to your SIEM, role-based exceptions for legal/finance — see{" "}
              <Link href="/solutions/ai-dlp" className="text-primary hover:underline">
                TeamPrompt AI DLP
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Embed */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20" id="embed">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Embed</span>
          <h2 className="mt-2 text-2xl font-semibold">Put this scanner on your site</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Free to embed on internal wikis, security training pages, blog posts, or vendor portals.
            Same client-side guarantee — nothing is sent to any server. A small &quot;Powered by
            TeamPrompt&quot; link sits at the bottom of the widget.
          </p>
          <div className="mt-6">
            <EmbedSnippet />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">FAQ</span>
          <h2 className="mt-2 text-2xl font-semibold">Common questions</h2>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {faqs.map((f, i) => (
              <details key={i} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-start justify-between gap-3 font-medium text-sm">
                  <span>{f.name}</span>
                  <span className="text-muted-foreground transition-transform group-open:rotate-45 text-xl leading-none select-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="border-t border-border py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-semibold">Ready for organization-wide prompt DLP?</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This scanner runs locally per-prompt. TeamPrompt enforces it across every employee, every AI
            tool, in real time — with logging, exceptions, and SIEM export.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85 transition"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/solutions/ai-dlp"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              See how AI DLP works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
