import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { Button } from "@/components/ui/button";
import { FAQSection } from "@/components/marketing/faq-section";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { ArrowRight, AlertTriangle, CheckCircle2, Shield, ShieldCheck } from "lucide-react";
import { COMPLIANCE_FRAMEWORKS, getFrameworkBySlug } from "./_data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return COMPLIANCE_FRAMEWORKS.map((f) => ({ framework: f.slug }));
}

export function generateMetadata({ params }: { params: { framework: string } }): Metadata {
  const fw = getFrameworkBySlug(params.framework);
  if (!fw) return {};
  return generatePageMetadata({
    title: fw.metaTitle,
    description: fw.metaDescription,
    path: `/compliance/${fw.slug}`,
    keywords: fw.keywords,
  });
}

export default function ComplianceFrameworkPage({ params }: { params: { framework: string } }) {
  const fw = getFrameworkBySlug(params.framework);
  if (!fw) notFound();

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "https://teamprompt.app" },
    { name: "Compliance", url: "https://teamprompt.app/compliance" },
    { name: fw.name, url: `https://teamprompt.app/compliance/${fw.slug}` },
  ]);
  const faqSchema = fw.faq.length > 0 ? generateFAQSchema(fw.faq.map((f) => ({ question: f.q, answer: f.a }))) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* Hero */}
      <section
        className="border-b border-border pt-32 pb-20 sm:pt-40 sm:pb-28"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F6F2FF 50%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Shield className="h-3.5 w-3.5 text-primary" />
            {fw.name} Compliance
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
            {fw.name} Compliance for AI Tools
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {fw.intro}
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" className="rounded-lg font-bold px-8">
                Get {fw.name} Protected <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Risks */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-center mb-12">
            The AI risk for {fw.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {fw.risks.map((risk) => (
              <div key={risk.title} className="rounded-[20px] border border-border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold">{risk.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{risk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How TeamPrompt Helps */}
      <section className="py-20 sm:py-28 border-t border-border" style={{ background: "linear-gradient(90deg, #F6F2FF, #F1F8FF)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-center mb-12">
            How TeamPrompt ensures {fw.name} compliance
          </h2>
          <div className="space-y-4">
            {fw.howTeamPromptHelps.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[16px] bg-card border border-border p-5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detection Rules */}
      {fw.rules.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-center mb-4">
              {fw.name} Detection Rules
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Install the {fw.name} compliance pack with one click. These rules activate automatically.
            </p>
            <div className="space-y-3">
              {fw.rules.map((rule) => (
                <div key={rule.name} className="flex items-center justify-between rounded-[16px] border border-border p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">{rule.desc}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full",
                    rule.severity === "block" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {rule.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {fw.faq.length > 0 && (
        <section className="py-20 sm:py-28 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <FAQSection faqs={fw.faq.map((f) => ({ question: f.q, answer: f.a }))} includeSchema={false} />
          </div>
        </section>
      )}

      <GetStartedSteps />
      <LeadCaptureForm />
    </>
  );
}
