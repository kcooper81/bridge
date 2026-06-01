import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
const URL = `${SITE_URL}/about/team/eric-campton`;

export const metadata: Metadata = generatePageMetadata({
  title: "Eric Campton — Founder, TeamPrompt",
  description:
    "Eric Campton is the founder of TeamPrompt. Background in security and developer tooling. Writes about prompt DLP, AI governance, and operating AI safely in regulated industries.",
  path: "/about/team/eric-campton",
});

export default function EricCamptonPage() {
  // Person JSON-LD lives directly on the bio page (the canonical place for
  // it). Article schema across the site references this page via the
  // author.url field, giving Google a single resolvable entity to attach
  // E-E-A-T signals to.
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Eric Campton",
    jobTitle: "Founder",
    url: URL,
    sameAs: ["https://www.linkedin.com/company/teamprompt"],
    worksFor: {
      "@type": "Organization",
      name: "TeamPrompt",
      url: SITE_URL,
    },
    description:
      "Founder of TeamPrompt, an AI data loss prevention and prompt management platform for teams using ChatGPT, Claude, Gemini, and Copilot.",
    knowsAbout: [
      "AI data loss prevention",
      "Prompt management",
      "AI governance",
      "LLM security",
      "Prompt injection",
      "SOC 2 compliance for AI",
      "HIPAA-aligned AI controls",
    ],
  };

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "About", url: `${SITE_URL}/about` },
    { name: "Eric Campton", url: URL },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="border-b border-border pt-32 pb-16 sm:pt-40 sm:pb-20" style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 50%, #fff 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <span className="mx-2">/</span>
            <span>Eric Campton</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">Eric Campton</h1>
          <p className="mt-3 text-lg text-muted-foreground">Founder, TeamPrompt</p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-zinc max-w-none">
          <p className="lead text-lg leading-relaxed">
            Eric is the founder of TeamPrompt — a platform that stops employees from leaking sensitive data into ChatGPT, Claude, Gemini, and Copilot, while giving teams a shared library of vetted prompts and a clean compliance trail.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Background</h2>
          <p>
            Fifteen-plus years building security and developer-tooling products. Has shipped browser extensions used inside Fortune 500 environments, network-level access controls that survived real adversarial conditions, and developer SDKs that other teams have built on top of.
          </p>
          <p>
            Day-to-day, Eric works at the intersection of three things most security vendors keep separate: data loss prevention, prompt engineering practice, and the audit-trail requirements that legal, compliance, and risk teams actually ask for in procurement.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What Eric writes about</h2>
          <ul>
            <li>Prompt DLP — how to scan content before it leaves the browser, not after it&apos;s already in ChatGPT</li>
            <li>AI governance — building review workflows that don&apos;t slow teams down</li>
            <li>Operating AI safely in regulated industries — healthcare, finance, government, legal</li>
            <li>Prompt injection defense beyond model-level filters</li>
            <li>Audit trails that satisfy SOC 2 and HIPAA auditors without becoming a tax on engineering</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Where to find more</h2>
          <ul>
            <li>
              <Link href="/blog" className="text-primary hover:underline">TeamPrompt blog</Link>{" "}
              — published guides on AI security, prompt management, and compliance
            </li>
            <li>
              <Link href="/research/state-of-prompt-data-leakage-q2-2026" className="text-primary hover:underline">State of Prompt Data Leakage Q2 2026</Link>{" "}
              — original research from TeamPrompt deployments
            </li>
            <li>
              <a href="https://www.linkedin.com/company/teamprompt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TeamPrompt on LinkedIn</a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
