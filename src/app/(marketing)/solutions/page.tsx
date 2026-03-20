import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers, Plug, GitCompareArrows, Replace, BookOpen, Workflow, UserCircle, FileText, Users, Shield, MessageSquare } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { CTASection } from "@/components/marketing/cta-section";
import { DarkSection } from "@/components/marketing/dark-section";
import { allSeoPages } from "@/lib/seo-pages/data";
import type { SeoPageData } from "@/lib/seo-pages/types";

export const metadata: Metadata = generatePageMetadata({
  title: "Solutions — Use Cases, Guides & Templates",
  description:
    "Explore TeamPrompt solutions: use cases, integrations, comparisons, guides, workflows, role-based solutions, and ready-to-use prompt templates.",
  path: "/solutions",
  keywords: [
    "AI prompt management",
    "ChatGPT extension",
    "prompt library",
    "AI governance",
    "DLP for AI",
    "prompt management software",
  ],
});

const categories: {
  key: SeoPageData["category"];
  label: string;
  heading: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { key: "use-case", label: "Use Cases", heading: "How teams use TeamPrompt", description: "From centralized prompt libraries to AI compliance, see how teams put TeamPrompt to work.", icon: Layers, color: "bg-blue-500/10 text-blue-600" },
  { key: "integration", label: "Integrations", heading: "Works with your AI tools", description: "TeamPrompt lives inside the AI tools your team already uses.", icon: Plug, color: "bg-emerald-500/10 text-emerald-600" },
  { key: "comparison", label: "Comparisons", heading: "Why teams switch", description: "See how a purpose-built prompt manager compares to general-purpose tools.", icon: GitCompareArrows, color: "bg-violet-500/10 text-violet-600" },
  { key: "alternative", label: "Alternatives", heading: "Compare to other tools", description: "Compare TeamPrompt to other tools for managing AI prompts.", icon: Replace, color: "bg-amber-500/10 text-amber-600" },
  { key: "guide", label: "Guides", heading: "Best practices", description: "Learn best practices for prompt management, AI governance, and more.", icon: BookOpen, color: "bg-sky-500/10 text-sky-600" },
  { key: "workflow", label: "Workflows", heading: "Department workflows", description: "AI-powered workflows for every department.", icon: Workflow, color: "bg-pink-500/10 text-pink-600" },
  { key: "role", label: "By Role", heading: "For your role", description: "See how TeamPrompt helps your specific role.", icon: UserCircle, color: "bg-indigo-500/10 text-indigo-600" },
  { key: "template", label: "Templates", heading: "Prompt templates", description: "Ready-to-use prompt templates for common tasks.", icon: FileText, color: "bg-teal-500/10 text-teal-600" },
];

// Featured solutions — hand-picked popular pages
const FEATURED_SLUGS = [
  "ai-dlp-for-teams",
  "chatgpt-prompt-library-for-teams",
  "ai-governance-compliance-framework",
  "shared-prompt-library-vs-google-docs",
  "prompt-management-for-security-teams",
  "chatgpt-dlp-extension",
];

function SolutionCard({ page }: { page: SeoPageData }) {
  return (
    <Link
      href={`/solutions/${page.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all duration-200 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
          {page.meta.title.split("—")[0].split("for")[0].trim()}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {page.meta.description}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
    </Link>
  );
}

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Solutions", url: "https://teamprompt.app/solutions" },
]);

export default function SolutionsPage() {
  const featured = FEATURED_SLUGS
    .map((slug) => allSeoPages.find((p) => p.slug === slug))
    .filter(Boolean) as SeoPageData[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* ━━━ HERO ━━━ */}
      <DarkSection gradient="center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white">
              Solutions for every team
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Explore how TeamPrompt helps teams manage prompts, secure AI usage, and work smarter with AI.
            </p>
          </div>

          {/* Quick nav — category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {categories.map((cat) => {
              const count = allSeoPages.filter((p) => p.category === cat.key).length;
              return (
                <a
                  key={cat.key}
                  href={`#${cat.key}`}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300 hover:border-primary/50 hover:text-white transition-colors"
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                  <span className="text-xs text-zinc-500 ml-0.5">{count}</span>
                </a>
              );
            })}
          </div>
        </div>
      </DarkSection>

      {/* ━━━ FEATURED ━━━ */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Popular Solutions</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((page) => (
                <SolutionCard key={page.slug} page={page} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ Quick links: AI Chat + Landing Pages ━━━ */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/features/ai-chat" className="group rounded-xl border bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/30 p-5 hover:shadow-md transition-all">
              <MessageSquare className="h-6 w-6 text-violet-600 mb-3" />
              <h3 className="font-semibold group-hover:text-violet-700 transition-colors">AI Chat</h3>
              <p className="text-xs text-muted-foreground mt-1">Built-in DLP-protected chat</p>
            </Link>
            <Link href="/lp/ai-dlp" className="group rounded-xl border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 p-5 hover:shadow-md transition-all">
              <Shield className="h-6 w-6 text-red-600 mb-3" />
              <h3 className="font-semibold group-hover:text-red-700 transition-colors">AI DLP</h3>
              <p className="text-xs text-muted-foreground mt-1">Prevent data leaks to AI</p>
            </Link>
            <Link href="/lp/shadow-ai" className="group rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 p-5 hover:shadow-md transition-all">
              <Users className="h-6 w-6 text-amber-600 mb-3" />
              <h3 className="font-semibold group-hover:text-amber-700 transition-colors">Shadow AI</h3>
              <p className="text-xs text-muted-foreground mt-1">See every AI tool in use</p>
            </Link>
            <Link href="/lp/ai-compliance" className="group rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 p-5 hover:shadow-md transition-all">
              <BookOpen className="h-6 w-6 text-emerald-600 mb-3" />
              <h3 className="font-semibold group-hover:text-emerald-700 transition-colors">AI Compliance</h3>
              <p className="text-xs text-muted-foreground mt-1">HIPAA, SOC 2, PCI-DSS ready</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ CATEGORIES — show first 6 per category with "View all" ━━━ */}
      {categories.map((cat, catIdx) => {
        const pages = allSeoPages.filter((p) => p.category === cat.key);
        if (pages.length === 0) return null;
        const Icon = cat.icon;
        const preview = pages.slice(0, 6);
        const hasMore = pages.length > 6;

        return (
          <section
            key={cat.key}
            id={cat.key}
            className={catIdx % 2 === 0 ? "py-16 sm:py-20" : "py-16 sm:py-20 bg-muted/30"}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{cat.heading}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                </div>
                {hasMore && (
                  <span className="text-xs text-muted-foreground/60 bg-muted rounded-full px-3 py-1 flex-shrink-0">
                    {pages.length} solutions
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {preview.map((page) => (
                  <SolutionCard key={page.slug} page={page} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <Link
                    href={`/solutions#${cat.key}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    View all {pages.length} {cat.label.toLowerCase()}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ━━━ CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Ready to get started?"
            gradientText="Try TeamPrompt free"
            subtitle="No credit card required. Set up your team in under 2 minutes."
          />
        </div>
      </section>
    </>
  );
}
