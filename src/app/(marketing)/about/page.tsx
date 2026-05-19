import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Linkedin, Mail, ShieldCheck } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = generatePageMetadata({
  title: "About TeamPrompt — Built by Operators for Teams Running AI in Regulated Industries",
  description:
    "Who builds TeamPrompt, why it exists, and how to reach us. Founder bio, company background, and the principles that drive our product decisions on prompt DLP and AI governance.",
  path: "/about",
  keywords: [
    "about TeamPrompt",
    "Kade Cooper founder",
    "TeamPrompt company",
    "prompt DLP founder",
    "AI governance company",
  ],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "About", url: `${SITE_URL}/about` },
]);

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kade Cooper",
  jobTitle: "Founder",
  worksFor: { "@type": "Organization", name: "TeamPrompt", url: SITE_URL },
  url: `${SITE_URL}/about`,
  sameAs: ["https://www.linkedin.com/company/teamprompt"],
  description:
    "Founder of TeamPrompt. Fifteen-plus years building security and developer-tooling products. Writes about prompt DLP, AI governance, and operational AI security in regulated industries.",
  knowsAbout: [
    "AI Data Loss Prevention",
    "Prompt Management",
    "AI Governance",
    "HIPAA Compliance for AI",
    "SOC 2 for AI",
    "EU AI Act",
    "OWASP LLM Top 10",
  ],
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TeamPrompt",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-icon-blue.svg`,
  description:
    "AI Data Loss Prevention and prompt management platform for teams. Monitor, redact, and audit every prompt across ChatGPT, Claude, Gemini, Copilot, and more.",
  sameAs: ["https://www.linkedin.com/company/teamprompt"],
  founder: { "@type": "Person", name: "Kade Cooper" },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@teamprompt.app",
      availableLanguage: "English",
    },
    {
      "@type": "ContactPoint",
      contactType: "security",
      email: "security@teamprompt.app",
      availableLanguage: "English",
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <section
        className="border-b border-border pt-28 pb-12 sm:pt-36 sm:pb-16"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 60%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">About TeamPrompt</h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            TeamPrompt is an AI data-loss-prevention and prompt-management platform built for teams that
            have to use AI <em>and</em> answer to a security or compliance review. We sit between your
            employees and the LLMs they already use — ChatGPT, Claude, Gemini, Copilot — and make sure the
            wrong data never leaves the building.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">Founder</span>
            <div className="mt-3 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
                  KC
                </div>
                <div>
                  <div className="text-sm font-semibold">Kade Cooper</div>
                  <div className="text-xs text-muted-foreground">Founder</div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <a
                  href="https://www.linkedin.com/company/teamprompt"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
                <br />
                <a href="mailto:kade@teamprompt.app" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                  <Mail className="h-3.5 w-3.5" /> kade@teamprompt.app
                </a>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4 text-sm leading-relaxed text-foreground/85">
            <p>
              Kade Cooper founded TeamPrompt after fifteen years building products at the intersection of
              security and developer experience. The pattern was the same every time: security teams want
              to say yes, employees keep saying yes anyway, and the gap between policy and reality widens
              until something embarrassing happens.
            </p>
            <p>
              The 2023 wave of Samsung-style incidents — proprietary code pasted into ChatGPT, then
              retrieved by other employees from cross-tenant memory — made it obvious that traditional DLP
              had a blind spot for the prompt channel. TeamPrompt closes it.
            </p>
            <p>
              Kade writes most of the long-form on this site. If you want to challenge or correct anything
              you read, email{" "}
              <a href="mailto:kade@teamprompt.app" className="text-primary hover:underline">
                kade@teamprompt.app
              </a>{" "}
              directly.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">What we believe</span>
          <h2 className="mt-2 text-2xl font-semibold">Operating principles</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{p.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Company</span>
          <h2 className="mt-2 text-2xl font-semibold">The basics</h2>
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <FactRow term="Founded" value="2025" />
            <FactRow term="Headquarters" value="United States (distributed team)" />
            <FactRow term="What we build" value="AI DLP, prompt management, AI governance tooling" />
            <FactRow term="Who we serve" value="Security, compliance, and operations teams in regulated industries" />
            <FactRow term="Security contact" value={<a href="mailto:security@teamprompt.app" className="text-primary hover:underline">security@teamprompt.app</a>} />
            <FactRow term="Press / partnerships" value={<a href="mailto:hello@teamprompt.app" className="text-primary hover:underline">hello@teamprompt.app</a>} />
          </dl>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Building2 className="mx-auto h-6 w-6 text-primary" />
          <h2 className="mt-3 text-2xl font-semibold">See what we&apos;re building</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Free to start. No credit card. Production-ready DLP and prompt management in under two minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85 transition"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/security/owasp-llm-top-10"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              Read the OWASP LLM Top 10 guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const PRINCIPLES = [
  {
    title: "Default to ship, then ship safe",
    body: "Security is most valuable when it doesn't break the workflow. Our default is allow with logging — the controls layer in as policy matures.",
  },
  {
    title: "Specific over generic",
    body: "Generic AI tools generate generic results. Our detection, our policies, and our content are built for specific regulatory regimes — HIPAA, SOC 2, PCI-DSS, EU AI Act — not a one-size-fits-all 'AI safety' wrapper.",
  },
  {
    title: "Operators, not theorists",
    body: "Every feature ships with a real run-book: what to monitor, what alerts look like, what false positives look like, what to log for audit. We've worked on the other side of the engagement.",
  },
  {
    title: "Honest reporting over vibes",
    body: "Our dashboards show the data, not narratives. If your AI usage is fine, we say so. If something looks bad, we say what would prove it bad rather than alarm-bell first.",
  },
];

function FactRow({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline border-b border-border/60 pb-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{term}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
