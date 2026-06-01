import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export const metadata: Metadata = generatePageMetadata({
  title: "Search TeamPrompt — Find Guides, Comparisons & Tools",
  description:
    "Search the TeamPrompt resource library — guides, comparisons, compliance frameworks, glossary, and free tools for AI data loss prevention.",
  path: "/search",
});

// Minimal search hub. The Google sitelinks searchbox sends users here
// with ?q={term}; we surface the catalog of indexable content + a simple
// client-side filter. Power users land on a useful page; Google gets a
// resolvable target URL for the WebSite SearchAction schema.
export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").toLowerCase().trim();

  const SECTIONS: Array<{ heading: string; items: { label: string; href: string; desc: string }[] }> = [
    {
      heading: "Compare",
      items: [
        { label: "TeamPrompt vs Nightfall AI", href: "/compare/nightfall", desc: "Browser DLP vs API-based SaaS DLP" },
        { label: "TeamPrompt vs Microsoft Purview", href: "/compare/purview", desc: "Cross-AI-tool DLP vs Microsoft ecosystem DLP" },
        { label: "TeamPrompt vs Polymer", href: "/compare/polymer", desc: "Real-time browser prevention vs SaaS post-hoc" },
        { label: "TeamPrompt vs Prompt Security", href: "/compare/prompt-security", desc: "Self-serve extension vs enterprise reverse proxy" },
        { label: "TeamPrompt vs Lakera", href: "/compare/lakera", desc: "Team DLP vs API-level prompt firewall" },
        { label: "Best AI DLP tools 2026", href: "/compare/best-ai-dlp-tools", desc: "Landscape review of the top AI DLP platforms" },
      ],
    },
    {
      heading: "Compliance",
      items: [
        { label: "HIPAA Compliance for AI Tools", href: "/compliance/hipaa", desc: "Protect PHI in ChatGPT and Claude" },
        { label: "SOC 2 Audit Trails for ChatGPT", href: "/compliance/soc2", desc: "Audit trails of everything tried in AI tools" },
        { label: "GDPR for AI Tools", href: "/compliance/gdpr", desc: "Personal data protection in commercial AI" },
        { label: "PCI-DSS for AI Prompts", href: "/compliance/pci-dss", desc: "Block payment card data before it reaches AI" },
        { label: "EU AI Act Compliance", href: "/compliance/eu-ai-act", desc: "Governance and audit trails for AI usage" },
      ],
    },
    {
      heading: "Industries",
      items: [
        { label: "Government AI DLP", href: "/industries/government", desc: "Block CUI, classified markings, citizen PII" },
        { label: "Healthcare AI DLP", href: "/industries/healthcare", desc: "HIPAA-ready ChatGPT, Claude, Gemini controls" },
        { label: "Finance AI DLP", href: "/industries/finance", desc: "Block MNPI, account numbers, PCI in AI prompts" },
        { label: "Legal AI DLP", href: "/industries/legal", desc: "Protect privileged client data in AI tools" },
        { label: "Insurance AI DLP", href: "/industries/insurance", desc: "Block PHI, claims, underwriting data" },
        { label: "Technology AI DLP", href: "/industries/technology", desc: "Block secrets, source code, PII in Copilot" },
        { label: "Education AI DLP", href: "/industries/education", desc: "FERPA-aligned student data controls" },
      ],
    },
    {
      heading: "Free Tools",
      items: [
        { label: "Prompt PII Scanner", href: "/tools/prompt-pii-scanner", desc: "Free client-side scanner — detects 15+ sensitive data types" },
        { label: "OWASP LLM Top 10", href: "/security/owasp-llm-top-10", desc: "Threat reference for LLM-powered applications" },
        { label: "State of Prompt Data Leakage Q2 2026", href: "/research/state-of-prompt-data-leakage-q2-2026", desc: "Original research from TeamPrompt deployments" },
      ],
    },
    {
      heading: "Glossary",
      items: [
        { label: "What is Prompt Injection?", href: "/solutions/what-is-prompt-injection", desc: "Definition, attack patterns, defense" },
        { label: "What is LLM Security?", href: "/solutions/what-is-llm-security", desc: "Security model for large language models" },
        { label: "What is AI Audit Trail?", href: "/solutions/what-is-ai-audit-trail", desc: "Logging every AI interaction for compliance" },
        { label: "What is PII Detection?", href: "/solutions/what-is-pii-detection", desc: "Detecting personally identifiable information" },
        { label: "What is AI Governance?", href: "/solutions/what-is-ai-governance", desc: "Policies, controls, and accountability for AI usage" },
        { label: "What is Shadow AI?", href: "/solutions/what-is-shadow-ai", desc: "Unsanctioned AI tools in the workplace" },
        { label: "View the full glossary", href: "/glossary", desc: "50+ AI security and prompt management terms" },
      ],
    },
  ];

  const filtered = q
    ? SECTIONS.map((s) => ({
        ...s,
        items: s.items.filter(
          (i) => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
        ),
      })).filter((s) => s.items.length > 0)
    : SECTIONS;

  const total = filtered.reduce((sum, s) => sum + s.items.length, 0);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Search", url: `${SITE_URL}/search` },
  ]);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "TeamPrompt Resource Library",
    description: "Guides, comparisons, compliance frameworks, glossary, and free tools for AI data loss prevention.",
    url: `${SITE_URL}/search`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: SECTIONS.flatMap((s) => s.items).map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${item.href}`,
        name: item.label,
      })),
    },
  };

  return (
    <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-3">
          {q ? `Results for "${searchParams.q}"` : "Search TeamPrompt"}
        </h1>
        <p className="text-muted-foreground mb-10">
          {q
            ? `${total} ${total === 1 ? "match" : "matches"} in our resource library`
            : "Browse our complete library of guides, comparisons, and tools for AI data loss prevention."}
        </p>

        <form action="/search" method="GET" className="mb-12">
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder="Search for guides, comparisons, or tools…"
            className="w-full rounded-full border border-border bg-background px-5 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary/40 focus:outline-none"
          />
        </form>

        <div className="space-y-10">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No matches for &ldquo;{searchParams.q}&rdquo;. Try a broader term, or{" "}
                <Link href="/contact" className="text-primary hover:underline">ask us directly</Link>.
              </p>
            </div>
          ) : (
            filtered.map((section) => (
              <div key={section.heading}>
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-semibold">
                  {section.heading}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl border border-border bg-background p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                    >
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
