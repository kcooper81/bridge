import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { ArrowRight, BookOpen, Lock, Shield, Cpu } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Security & Prompt Management Glossary — TeamPrompt",
  description:
    "Learn key terms in AI data loss prevention, prompt engineering, AI governance, and compliance. 50+ definitions with practical explanations.",
  path: "/glossary",
  keywords: [
    "AI DLP glossary",
    "prompt management terms",
    "AI governance glossary",
    "AI security terminology",
    "what is prompt engineering",
    "what is AI DLP",
  ],
});

const categories = [
  {
    title: "Prompt Management",
    icon: BookOpen,
    terms: [
      { slug: "what-is-prompt-management", label: "Prompt Management" },
      { slug: "what-is-prompt-engineering", label: "Prompt Engineering" },
      { slug: "what-is-prompt-templates", label: "Prompt Templates" },
      { slug: "what-is-prompt-library", label: "Prompt Library" },
      { slug: "what-is-prompt-chaining", label: "Prompt Chaining" },
      { slug: "what-is-system-prompts", label: "System Prompts" },
      { slug: "what-is-few-shot-prompting", label: "Few-Shot Prompting" },
      { slug: "what-is-zero-shot-prompting", label: "Zero-Shot Prompting" },
      { slug: "what-is-prompt-injection", label: "Prompt Injection" },
      { slug: "what-is-prompt-variables", label: "Prompt Variables" },
      { slug: "what-is-prompt-versioning", label: "Prompt Versioning" },
      { slug: "what-is-prompt-analytics", label: "Prompt Analytics" },
      { slug: "what-is-prompt-governance", label: "Prompt Governance" },
      { slug: "what-is-prompt-optimization", label: "Prompt Optimization" },
      { slug: "what-is-prompt-testing", label: "Prompt Testing" },
    ],
  },
  {
    title: "AI Security & DLP",
    icon: Shield,
    terms: [
      { slug: "what-is-data-loss-prevention", label: "Data Loss Prevention (DLP)" },
      { slug: "what-is-ai-governance", label: "AI Governance" },
      { slug: "what-is-ai-compliance", label: "AI Compliance" },
      { slug: "what-is-llm-security", label: "LLM Security" },
      { slug: "what-is-ai-acceptable-use-policy", label: "AI Acceptable Use Policy" },
      { slug: "what-is-data-exfiltration", label: "Data Exfiltration" },
      { slug: "what-is-pii-detection", label: "PII Detection" },
      { slug: "what-is-sensitive-data-scanning", label: "Sensitive Data Scanning" },
      { slug: "what-is-ai-audit-trail", label: "AI Audit Trail" },
      { slug: "what-is-ai-access-controls", label: "AI Access Controls" },
      { slug: "what-is-model-poisoning", label: "Model Poisoning" },
      { slug: "what-is-ai-risk-management", label: "AI Risk Management" },
      { slug: "what-is-ai-data-residency", label: "AI Data Residency" },
      { slug: "what-is-token-logging", label: "Token Logging" },
      { slug: "what-is-shadow-ai", label: "Shadow AI" },
    ],
  },
  {
    title: "Compliance Frameworks",
    icon: Lock,
    terms: [
      { slug: "what-is-hipaa-ai", label: "HIPAA & AI" },
      { slug: "what-is-soc2-ai", label: "SOC 2 & AI" },
      { slug: "what-is-gdpr-ai", label: "GDPR & AI" },
      { slug: "what-is-nist-ai-rmf", label: "NIST AI RMF" },
      { slug: "what-is-eu-ai-act", label: "EU AI Act" },
      { slug: "what-is-iso-42001", label: "ISO 42001" },
      { slug: "what-is-ccpa-ai", label: "CCPA & AI" },
      { slug: "what-is-fedramp-ai", label: "FedRAMP & AI" },
      { slug: "what-is-pci-dss-ai", label: "PCI-DSS & AI" },
      { slug: "what-is-cmmc-ai", label: "CMMC & AI" },
    ],
  },
  {
    title: "AI Technology",
    icon: Cpu,
    terms: [
      { slug: "what-is-rag", label: "RAG (Retrieval Augmented Generation)" },
      { slug: "what-is-fine-tuning", label: "Fine-Tuning" },
      { slug: "what-is-embeddings", label: "Embeddings" },
      { slug: "what-is-context-window", label: "Context Window" },
      { slug: "what-is-temperature-llm", label: "Temperature (LLM)" },
      { slug: "what-is-tokens-ai", label: "Tokens" },
      { slug: "what-is-hallucination-ai", label: "AI Hallucination" },
      { slug: "what-is-grounding-ai", label: "Grounding" },
      { slug: "what-is-multi-modal-ai", label: "Multi-Modal AI" },
      { slug: "what-is-agentic-ai", label: "Agentic AI" },
    ],
  },
];

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Glossary", url: "https://teamprompt.app/glossary" },
]);

export default function GlossaryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section
        className="border-b border-border pt-32 pb-20 sm:pt-40 sm:pb-28"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 50%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
            AI Security & Prompt Management Glossary
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            50+ terms explained — from prompt engineering basics to AI compliance frameworks and DLP concepts.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-16">
            {categories.map((cat) => (
              <div key={cat.title}>
                <div className="flex items-center gap-3 mb-6">
                  <cat.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{cat.title}</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cat.terms.length} terms</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.terms.map((term) => (
                    <Link
                      key={term.slug}
                      href={`/solutions/${term.slug}`}
                      className="group flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:border-foreground/10 hover:shadow-sm transition-all"
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{term.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LeadCaptureForm />
    </>
  );
}
