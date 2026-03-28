import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui/button";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { ArrowRight, Building2, HeartPulse, TrendingUp, CheckCircle2, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "Case Studies — How Teams Use TeamPrompt for AI Security & Governance",
  description:
    "See how healthcare, fintech, and marketing teams use TeamPrompt to protect sensitive data, manage prompts, and maintain compliance when using AI tools.",
  path: "/case-studies",
  keywords: ["TeamPrompt case studies", "AI DLP case study", "AI governance examples", "prompt management case study"],
});

const caseStudies = [
  {
    icon: HeartPulse,
    industry: "Healthcare",
    title: "Regional Health System Prevents PHI Exposure in AI Tools",
    company: "450-bed regional health system",
    challenge:
      "Clinicians were using ChatGPT to summarize patient notes and draft communications. IT discovered patient names, MRNs, and diagnosis codes were being pasted directly into AI prompts — a clear HIPAA violation risk with no visibility or controls.",
    solution: [
      "Deployed TeamPrompt browser extension across 200+ clinical workstations",
      "Installed HIPAA compliance pack — activating detection for patient names, MRNs, diagnosis codes, and insurance IDs",
      "Enabled auto-redaction to replace PHI with [PATIENT], [MRN], [DIAGNOSIS] placeholders",
      "Set up the Audit dashboard for weekly compliance reviews",
    ],
    results: [
      { metric: "847", label: "PHI exposures blocked in first 90 days" },
      { metric: "98%", label: "Compliance score maintained" },
      { metric: "Zero", label: "HIPAA incidents since deployment" },
      { metric: "<5 min", label: "IT setup time per workstation" },
    ],
    quote: "TeamPrompt gives us visibility and control over AI usage that we simply didn't have before. The DLP scanning alone has prevented dozens of data exposure incidents.",
    quotePerson: "Dr. Rebecca Lin",
    quoteRole: "Compliance Officer",
    color: "rose",
  },
  {
    icon: TrendingUp,
    industry: "Fintech",
    title: "Fintech Startup Secures AI Usage Across Engineering and Support",
    company: "Series B fintech, 120 employees",
    challenge:
      "Engineers were pasting code snippets with API keys and connection strings into AI coding assistants. Customer support reps were sharing ticket details containing payment card data with ChatGPT for draft responses.",
    solution: [
      "Rolled out TeamPrompt to engineering (40 devs) and support (25 reps)",
      "Enabled SOC 2 and PCI-DSS compliance packs for credential and payment card detection",
      "Configured team-scoped policies — stricter rules for support (PCI-DSS) vs engineering (credential blocking)",
      "Connected Cloudflare Gateway to block unapproved AI tools at the network level",
    ],
    results: [
      { metric: "23", label: "API keys blocked in first month" },
      { metric: "100%", label: "Credit card data blocked before reaching AI" },
      { metric: "5", label: "Unapproved AI tools discovered and blocked" },
      { metric: "Passed", label: "SOC 2 Type II audit with AI controls evidence" },
    ],
    quote: "The browser extension is the killer feature. My engineers can search and insert prompts right inside ChatGPT and Claude without breaking their flow.",
    quotePerson: "Priya Sharma",
    quoteRole: "Engineering Manager",
    color: "blue",
  },
  {
    icon: Building2,
    industry: "Marketing Agency",
    title: "B2B Agency Standardizes AI Prompts and Eliminates Client Data Leaks",
    company: "45-person B2B marketing agency",
    challenge:
      "Account managers were writing prompts from scratch every time, producing inconsistent output across clients. Worse, they were pasting client-confidential data — campaign budgets, launch dates, competitive analysis — into AI tools with no controls.",
    solution: [
      "Built a shared prompt library with 89 approved templates for email, social, content, and reporting",
      "Set up approval workflows — managers review new prompts before team-wide use",
      "Enabled DLP rules for client names, project code names, and budget figures",
      "Deployed template packs for each service area (content, paid media, analytics)",
    ],
    results: [
      { metric: "89", label: "Approved prompts in shared library" },
      { metric: "3x", label: "Faster content production with templates" },
      { metric: "Zero", label: "Client data leaked to AI since deployment" },
      { metric: "142", label: "Average monthly prompt uses across team" },
    ],
    quote: "Our team was writing the same outreach prompts from scratch every week. Now we have one library everyone pulls from — and the quality is way more consistent.",
    quotePerson: "James Okoro",
    quoteRole: "Marketing Team Lead",
    color: "violet",
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <section
        className="border-b border-border pt-32 pb-20 sm:pt-40 sm:pb-28"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F6F2FF 50%, #fff 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
            Customer Stories
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            See how healthcare, fintech, and marketing teams use TeamPrompt to secure AI usage and standardize prompt quality.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-20">
          {caseStudies.map((study) => (
            <div key={study.title} className="rounded-[20px] border border-border overflow-hidden">
              {/* Header */}
              <div className={cn(
                "px-8 py-6 border-b border-border",
                study.color === "rose" ? "bg-rose-50/50 dark:bg-rose-950/10" :
                study.color === "blue" ? "bg-blue-50/50 dark:bg-blue-950/10" :
                "bg-violet-50/50 dark:bg-violet-950/10"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <study.icon className={cn(
                    "h-5 w-5",
                    study.color === "rose" ? "text-rose-500" :
                    study.color === "blue" ? "text-blue-500" : "text-violet-500"
                  )} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{study.industry}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold">{study.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{study.company}</p>
              </div>

              <div className="p-8">
                {/* Challenge */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">The Challenge</h3>
                  <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                </div>

                {/* Solution */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">The Solution</h3>
                  <div className="space-y-2">
                    {study.solution.map((s) => (
                      <div key={s} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Results</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {study.results.map((r) => (
                      <div key={r.label} className="text-center rounded-xl border border-border p-4">
                        <p className="text-2xl font-bold tracking-tight text-primary">{r.metric}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="rounded-xl bg-muted/30 p-6">
                  <Quote className="h-6 w-6 text-primary/20 mb-3" />
                  <p className="text-sm italic text-muted-foreground leading-relaxed mb-3">
                    &ldquo;{study.quote}&rdquo;
                  </p>
                  <p className="text-sm font-semibold">{study.quotePerson}</p>
                  <p className="text-xs text-muted-foreground">{study.quoteRole}, {study.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-28 border-t border-border text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
            Ready to protect your team&apos;s AI usage?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. No credit card required.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="rounded-lg font-bold px-8">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <LeadCaptureForm />
    </>
  );
}
