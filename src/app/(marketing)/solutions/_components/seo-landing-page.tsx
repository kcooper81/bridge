import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { BenefitsGrid } from "@/components/marketing/benefits-grid";
import { StatsRow } from "@/components/marketing/stats-row";
import { HeroImage } from "@/components/marketing/hero-image";
import { ArrowRight, Shield } from "lucide-react";
import {
  Archive,
  BarChart3,
  BookOpen,
  Braces,
  Eye,
  GitBranch,
  Globe,
  Key,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schemas";
import type { SeoPageData, SeoCategory, SeoContentSection } from "@/lib/seo-pages/types";
import { getRelatedPages } from "@/lib/seo-pages/data";
import { CheckCircle2 } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const categoryBadgeColors: Record<SeoCategory, string> = {
  comparison: "text-blue-400",
  "use-case": "text-blue-400",
  integration: "text-emerald-400",
  alternative: "text-violet-400",
  guide: "text-amber-400",
  workflow: "text-cyan-400",
  role: "text-rose-400",
  template: "text-orange-400",
  platform: "text-indigo-400",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Archive,
  BarChart3,
  BookOpen,
  Braces,
  Eye,
  GitBranch,
  Globe,
  Key,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
};

type HeroImgData = { src: string; alt: string; badgeIcon: string; badgeHeadline: string; badgeSubtitle: string; topBadgeIcon?: string; topBadgeHeadline?: string; topBadgeSubtitle?: string };
const u = (id: string) => `https://images.unsplash.com/${id}?w=640&q=80&auto=format&fit=crop`;

const slugHeroImages: Record<string, HeroImgData> = {
  // ── use-case ──
  "prompt-library":         { src: u("photo-1552664730-d307ca884978"), alt: "Team organizing shared documents", badgeIcon: "Archive", badgeHeadline: "Shared library", badgeSubtitle: "All prompts, one place", topBadgeIcon: "Users", topBadgeHeadline: "8 teams", topBadgeSubtitle: "Sharing prompts" },
  "prompt-governance":      { src: u("photo-1557804506-669a67965ba0"), alt: "Office strategy meeting", badgeIcon: "ShieldCheck", badgeHeadline: "Full visibility", badgeSubtitle: "Every prompt approved", topBadgeIcon: "Eye", topBadgeHeadline: "Audit trail", topBadgeSubtitle: "Complete history" },
  "team-collaboration":     { src: u("photo-1600880292203-757bb62b4baf"), alt: "Team collaborating at whiteboard", badgeIcon: "Users", badgeHeadline: "Real-time sharing", badgeSubtitle: "Teams stay in sync", topBadgeIcon: "Zap", topBadgeHeadline: "Instant sync", topBadgeSubtitle: "Share in one click" },
  "ai-security-compliance": { src: u("photo-1555949963-ff9fe0c870eb"), alt: "Secure office environment", badgeIcon: "Shield", badgeHeadline: "Protected by default", badgeSubtitle: "Data stays safe", topBadgeIcon: "Lock", topBadgeHeadline: "17 rules", topBadgeSubtitle: "Active scanning" },
  "knowledge-management":   { src: u("photo-1434030216411-0b793f4b4173"), alt: "Person studying with notes", badgeIcon: "BookOpen", badgeHeadline: "Organized knowledge", badgeSubtitle: "Find any prompt", topBadgeIcon: "Archive", topBadgeHeadline: "142 prompts", topBadgeSubtitle: "Searchable library" },
  "training-onboarding":    { src: u("photo-1522202176988-66273c2fd55f"), alt: "Training session in progress", badgeIcon: "Zap", badgeHeadline: "Quick onboarding", badgeSubtitle: "Up and running fast", topBadgeIcon: "Users", topBadgeHeadline: "New hires", topBadgeSubtitle: "Day-one ready" },
  "quality-assurance":      { src: u("photo-1556761175-b413da4baf72"), alt: "Quality review process", badgeIcon: "ShieldCheck", badgeHeadline: "Quality enforced", badgeSubtitle: "Every prompt checked", topBadgeIcon: "Eye", topBadgeHeadline: "100% reviewed", topBadgeSubtitle: "Before publishing" },
  "ai-standards":           { src: u("photo-1556742031-c6961e8560b0"), alt: "Corporate standards meeting", badgeIcon: "BookOpen", badgeHeadline: "Standards set", badgeSubtitle: "Consistent AI usage", topBadgeIcon: "ShieldCheck", topBadgeHeadline: "Policy enforced", topBadgeSubtitle: "Company-wide" },
  "prompt-templates":       { src: u("photo-1600880292089-90a7e086ee0c"), alt: "Employee working with templates on screen", badgeIcon: "Archive", badgeHeadline: "Ready-made", badgeSubtitle: "Templates for any task", topBadgeIcon: "Zap", topBadgeHeadline: "One-click", topBadgeSubtitle: "Fill and insert" },
  "ai-governance":          { src: u("photo-1521737604893-d14cc237f11d"), alt: "Team in glass conference room", badgeIcon: "ShieldCheck", badgeHeadline: "AI governed", badgeSubtitle: "Full control", topBadgeIcon: "Eye", topBadgeHeadline: "Audit ready", topBadgeSubtitle: "Complete visibility" },
  "ai-compliance":          { src: u("photo-1504384308090-c894fdcc538d"), alt: "Professional reviewing compliance docs", badgeIcon: "Shield", badgeHeadline: "Compliant", badgeSubtitle: "Meet every standard", topBadgeIcon: "Lock", topBadgeHeadline: "Data secured", topBadgeSubtitle: "Auto-detected" },
  "prompt-sharing":         { src: u("photo-1527192491265-7e15c55b1ed2"), alt: "Colleagues sharing work on screens", badgeIcon: "Users", badgeHeadline: "Share instantly", badgeSubtitle: "With your whole team", topBadgeIcon: "Zap", topBadgeHeadline: "142 shared", topBadgeSubtitle: "This month" },
  "ai-dlp":                 { src: u("photo-1573164713714-d95e436ab8d6"), alt: "Security professional at workstation", badgeIcon: "ShieldAlert", badgeHeadline: "DLP active", badgeSubtitle: "Real-time scanning", topBadgeIcon: "Lock", topBadgeHeadline: "15 blocked", topBadgeSubtitle: "This week" },
  "prompt-management":      { src: u("photo-1497215842964-222b430dc094"), alt: "Modern open-plan office", badgeIcon: "Archive", badgeHeadline: "Organized", badgeSubtitle: "Every prompt managed", topBadgeIcon: "BarChart3", topBadgeHeadline: "+23% usage", topBadgeSubtitle: "This month" },
  "ai-audit-trail":         { src: u("photo-1551434678-e076c223a692"), alt: "Developer reviewing logs on screen", badgeIcon: "Eye", badgeHeadline: "Full history", badgeSubtitle: "Every action logged", topBadgeIcon: "ShieldCheck", topBadgeHeadline: "Audit ready", topBadgeSubtitle: "Export anytime" },
  "ai-code-review-prompts": { src: u("photo-1553028826-f4804a6dba3b"), alt: "Engineers reviewing code together", badgeIcon: "Key", badgeHeadline: "Code reviews", badgeSubtitle: "Consistent feedback", topBadgeIcon: "Zap", topBadgeHeadline: "89 reviews", topBadgeSubtitle: "This sprint" },
  "ai-onboarding-playbooks":{ src: u("photo-1560439514-4e9645039924"), alt: "Onboarding session with new employees", badgeIcon: "Users", badgeHeadline: "Playbooks ready", badgeSubtitle: "Day-one success", topBadgeIcon: "BookOpen", topBadgeHeadline: "12 guides", topBadgeSubtitle: "Pre-built" },
  "ai-meeting-summaries":   { src: u("photo-1517048676732-d65bc937f952"), alt: "Team in productive meeting", badgeIcon: "BookOpen", badgeHeadline: "Auto-summaries", badgeSubtitle: "Capture every detail", topBadgeIcon: "Zap", topBadgeHeadline: "5 min saved", topBadgeSubtitle: "Per meeting" },
  "ai-data-analysis":       { src: u("photo-1551288049-bebda4e38f71"), alt: "Analyst reviewing data charts", badgeIcon: "BarChart3", badgeHeadline: "Data insights", badgeSubtitle: "Analyze faster", topBadgeIcon: "Zap", topBadgeHeadline: "10x faster", topBadgeSubtitle: "Analysis time" },
  "ai-content-localization":{ src: u("photo-1559136555-9303baea8ebd"), alt: "Content team working on translations", badgeIcon: "Globe", badgeHeadline: "Go global", badgeSubtitle: "Localize content", topBadgeIcon: "Zap", topBadgeHeadline: "12 languages", topBadgeSubtitle: "Supported" },
  "ai-compliance-reporting": { src: u("photo-1460925895917-afdab827c52f"), alt: "Compliance reports on dashboard", badgeIcon: "ShieldCheck", badgeHeadline: "Reports ready", badgeSubtitle: "One-click export", topBadgeIcon: "BarChart3", topBadgeHeadline: "100% covered", topBadgeSubtitle: "All activities" },
  "ai-incident-response":   { src: u("photo-1555949963-ff9fe0c870eb"), alt: "Security team responding to alert", badgeIcon: "ShieldAlert", badgeHeadline: "Fast response", badgeSubtitle: "Contain threats", topBadgeIcon: "Shield", topBadgeHeadline: "< 5 min", topBadgeSubtitle: "Response time" },
  // ── integration ──
  "chatgpt":    { src: u("photo-1517694712202-14dd9538aa97"), alt: "Developer at screen with code", badgeIcon: "Zap", badgeHeadline: "ChatGPT ready", badgeSubtitle: "Insert prompts instantly", topBadgeIcon: "Shield", topBadgeHeadline: "DLP active", topBadgeSubtitle: "Data protected" },
  "claude":     { src: u("photo-1556745757-8d76bdb6984b"), alt: "Modern creative workspace", badgeIcon: "Zap", badgeHeadline: "Claude supported", badgeSubtitle: "One-click insertion", topBadgeIcon: "Users", topBadgeHeadline: "Team access", topBadgeSubtitle: "Shared library" },
  "gemini":     { src: u("photo-1519389950473-47ba0277781c"), alt: "Tech workspace with monitors", badgeIcon: "Globe", badgeHeadline: "Gemini connected", badgeSubtitle: "Search and insert", topBadgeIcon: "Zap", topBadgeHeadline: "One-click", topBadgeSubtitle: "Insert prompts" },
  "copilot":    { src: u("photo-1515378960530-7c0da6231fb1"), alt: "Coding session on laptop", badgeIcon: "Zap", badgeHeadline: "Copilot enabled", badgeSubtitle: "Prompts in your browser", topBadgeIcon: "Key", topBadgeHeadline: "Secrets safe", topBadgeSubtitle: "Keys detected" },
  "perplexity": { src: u("photo-1504868584819-f8e8b4b6d7e3"), alt: "Research and discovery", badgeIcon: "Eye", badgeHeadline: "Perplexity linked", badgeSubtitle: "Research prompts ready", topBadgeIcon: "Archive", topBadgeHeadline: "Prompt vault", topBadgeSubtitle: "Organized" },
  "slack":      { src: u("photo-1556761175-4b46a572b786"), alt: "Team chat and messaging", badgeIcon: "Users", badgeHeadline: "Slack integrated", badgeSubtitle: "Share from chat", topBadgeIcon: "Zap", topBadgeHeadline: "Instant share", topBadgeSubtitle: "From any channel" },
  // ── role ──
  "for-engineering-teams": { src: u("photo-1498050108023-c5249f4df085"), alt: "Engineers coding at workstation", badgeIcon: "Key", badgeHeadline: "Built for devs", badgeSubtitle: "Code prompts ready", topBadgeIcon: "Shield", topBadgeHeadline: "No leaks", topBadgeSubtitle: "API keys caught" },
  "for-product-teams":     { src: u("photo-1552581234-26160f608093"), alt: "Product team planning session", badgeIcon: "BarChart3", badgeHeadline: "Product focus", badgeSubtitle: "Specs and planning", topBadgeIcon: "Users", topBadgeHeadline: "Cross-team", topBadgeSubtitle: "Shared prompts" },
  "for-sales-teams":       { src: u("photo-1556742049-0cfed4f6a45d"), alt: "Sales team in action", badgeIcon: "Zap", badgeHeadline: "Close faster", badgeSubtitle: "Sales prompts ready", topBadgeIcon: "BarChart3", topBadgeHeadline: "+34% speed", topBadgeSubtitle: "Outreach time" },
  "for-marketing-teams":   { src: u("photo-1542626991-cbc4e32524cc"), alt: "Creative marketing workspace", badgeIcon: "Eye", badgeHeadline: "Creative edge", badgeSubtitle: "Content prompts", topBadgeIcon: "Globe", topBadgeHeadline: "Multi-channel", topBadgeSubtitle: "Blog to social" },
  "for-support-teams":     { src: u("photo-1553028826-f4804a6dba3b"), alt: "Support agent helping customer", badgeIcon: "Users", badgeHeadline: "Faster replies", badgeSubtitle: "Response templates", topBadgeIcon: "Zap", topBadgeHeadline: "< 2 min", topBadgeSubtitle: "Avg response" },
  "for-operations-teams":  { src: u("photo-1454165804606-c3d57bc86b40"), alt: "Operations team at work", badgeIcon: "BarChart3", badgeHeadline: "Ops streamlined", badgeSubtitle: "Process prompts", topBadgeIcon: "Archive", topBadgeHeadline: "SOPs ready", topBadgeSubtitle: "Standardized" },
  // ── workflow ──
  "customer-support-ai-workflow":    { src: u("photo-1556742111-a301076d9d18"), alt: "Support desk with headset", badgeIcon: "Users", badgeHeadline: "Support flow", badgeSubtitle: "Resolve tickets faster", topBadgeIcon: "Zap", topBadgeHeadline: "Auto-reply", topBadgeSubtitle: "Template ready" },
  "sales-workflow":                  { src: u("photo-1560472354-b33ff0c44a43"), alt: "Sales pipeline and deals", badgeIcon: "Zap", badgeHeadline: "Sales pipeline", badgeSubtitle: "Close more deals", topBadgeIcon: "BarChart3", topBadgeHeadline: "+28% close", topBadgeSubtitle: "Rate increase" },
  "content-marketing-workflow":      { src: u("photo-1542744094-3a31f272c490"), alt: "Content creation process", badgeIcon: "Eye", badgeHeadline: "Content engine", badgeSubtitle: "Create at scale", topBadgeIcon: "Globe", topBadgeHeadline: "5 channels", topBadgeSubtitle: "One workflow" },
  "code-review-workflow":            { src: u("photo-1581091226825-a6a2a5aee158"), alt: "Code review on screen", badgeIcon: "Key", badgeHeadline: "Review flow", badgeSubtitle: "Better code reviews", topBadgeIcon: "ShieldCheck", topBadgeHeadline: "Standards met", topBadgeSubtitle: "Every PR" },
  "hiring-workflow":                 { src: u("photo-1573496359142-b8d87734a5a2"), alt: "Interview and hiring process", badgeIcon: "Users", badgeHeadline: "Hiring pipeline", badgeSubtitle: "Screen candidates", topBadgeIcon: "Zap", topBadgeHeadline: "3x faster", topBadgeSubtitle: "Screening time" },
  "product-documentation-workflow":  { src: u("photo-1586281380349-632531db7ed4"), alt: "Documentation writing session", badgeIcon: "BookOpen", badgeHeadline: "Doc workflow", badgeSubtitle: "Ship docs faster", topBadgeIcon: "Archive", topBadgeHeadline: "Templates", topBadgeSubtitle: "Pre-built" },
  // ── template ──
  "email-prompt-templates":        { src: u("photo-1557426272-fc759fdf7a8d"), alt: "Email communication workflow", badgeIcon: "Archive", badgeHeadline: "Email ready", badgeSubtitle: "Send better emails", topBadgeIcon: "Zap", topBadgeHeadline: "One-click", topBadgeSubtitle: "Fill and send" },
  "code-review-templates":         { src: u("photo-1516321318423-f06f85e504b3"), alt: "Code displayed on monitor", badgeIcon: "Key", badgeHeadline: "Code reviews", badgeSubtitle: "Thorough feedback", topBadgeIcon: "ShieldCheck", topBadgeHeadline: "Consistent", topBadgeSubtitle: "Every review" },
  "meeting-notes-templates":       { src: u("photo-1517048676732-d65bc937f952"), alt: "Team meeting in progress", badgeIcon: "BookOpen", badgeHeadline: "Meeting notes", badgeSubtitle: "Capture action items", topBadgeIcon: "Zap", topBadgeHeadline: "Auto-fill", topBadgeSubtitle: "Template ready" },
  "report-writing-templates":      { src: u("photo-1460925895917-afdab827c52f"), alt: "Data dashboard and reporting", badgeIcon: "BarChart3", badgeHeadline: "Reports ready", badgeSubtitle: "Professional outputs", topBadgeIcon: "Archive", topBadgeHeadline: "6 formats", topBadgeSubtitle: "Pre-built" },
  "social-media-templates":        { src: u("photo-1556761175-5973dc0f32e7"), alt: "Social media content creation", badgeIcon: "Globe", badgeHeadline: "Social ready", badgeSubtitle: "Post everywhere", topBadgeIcon: "Zap", topBadgeHeadline: "5 platforms", topBadgeSubtitle: "One template" },
  "customer-response-templates":   { src: u("photo-1559028012-481c04fa702d"), alt: "Customer support interaction", badgeIcon: "Users", badgeHeadline: "Responses ready", badgeSubtitle: "Fast and consistent", topBadgeIcon: "Zap", topBadgeHeadline: "< 2 min", topBadgeSubtitle: "Avg reply" },
  "data-analysis-templates":       { src: u("photo-1551288049-bebda4e38f71"), alt: "Data analysis and charts", badgeIcon: "BarChart3", badgeHeadline: "Data insights", badgeSubtitle: "Analyze anything", topBadgeIcon: "Zap", topBadgeHeadline: "10x faster", topBadgeSubtitle: "Analysis time" },
  "project-planning-templates":    { src: u("photo-1531482615713-2afd69097998"), alt: "Project planning whiteboard", badgeIcon: "Archive", badgeHeadline: "Plans ready", badgeSubtitle: "Project kickstart", topBadgeIcon: "Users", topBadgeHeadline: "Team aligned", topBadgeSubtitle: "Shared plans" },
  "interview-prep-templates":      { src: u("photo-1560439514-4e9645039924"), alt: "Interview preparation", badgeIcon: "Users", badgeHeadline: "Interview prep", badgeSubtitle: "Be prepared", topBadgeIcon: "BookOpen", topBadgeHeadline: "12 questions", topBadgeSubtitle: "Pre-built" },
  "documentation-templates":       { src: u("photo-1504384764586-bb4cdc1707b0"), alt: "Technical documentation", badgeIcon: "BookOpen", badgeHeadline: "Docs ready", badgeSubtitle: "Technical writing", topBadgeIcon: "Archive", topBadgeHeadline: "8 formats", topBadgeSubtitle: "API to guides" },
  "content-marketing-templates":   { src: u("photo-1559136555-9303baea8ebd"), alt: "Content strategy session", badgeIcon: "Eye", badgeHeadline: "Content ready", badgeSubtitle: "Blog to social", topBadgeIcon: "Globe", topBadgeHeadline: "Multi-format", topBadgeSubtitle: "One template" },
  "hiring-templates":              { src: u("photo-1556155092-490a1ba16284"), alt: "Hiring and recruitment", badgeIcon: "Users", badgeHeadline: "Hiring ready", badgeSubtitle: "Screen and assess", topBadgeIcon: "Zap", topBadgeHeadline: "3x faster", topBadgeSubtitle: "Screening" },
  "brainstorm-templates":          { src: u("photo-1542744173-05336fcc7ad4"), alt: "Creative brainstorming session", badgeIcon: "Zap", badgeHeadline: "Ideas flowing", badgeSubtitle: "Creative sessions", topBadgeIcon: "Users", topBadgeHeadline: "Team ideation", topBadgeSubtitle: "Collaborate" },
  // ── comparison / alternative / guide ──
  "vs-notion":             { src: u("photo-1460925895917-afdab827c52f"), alt: "Comparing software tools", badgeIcon: "BarChart3", badgeHeadline: "Side-by-side", badgeSubtitle: "See the difference", topBadgeIcon: "ShieldCheck", topBadgeHeadline: "DLP included", topBadgeSubtitle: "Built-in security" },
  "notion-alternative":    { src: u("photo-1553877522-43269d4ea984"), alt: "Professional switching tools", badgeIcon: "Zap", badgeHeadline: "Better alternative", badgeSubtitle: "Purpose-built for prompts", topBadgeIcon: "Shield", topBadgeHeadline: "Data safe", topBadgeSubtitle: "DLP built-in" },
  "prompt-management-101": { src: u("photo-1434030216411-0b793f4b4173"), alt: "Learning prompt management", badgeIcon: "BookOpen", badgeHeadline: "Best practices", badgeSubtitle: "Step-by-step guide", topBadgeIcon: "Zap", topBadgeHeadline: "Quick start", topBadgeSubtitle: "15 min read" },
};

const categoryFallback: Record<SeoCategory, HeroImgData> = {
  "use-case":    slugHeroImages["prompt-library"],
  integration:   slugHeroImages["chatgpt"],
  comparison:    slugHeroImages["vs-notion"],
  alternative:   slugHeroImages["notion-alternative"],
  guide:         slugHeroImages["prompt-management-101"],
  workflow:      slugHeroImages["customer-support-ai-workflow"],
  role:          slugHeroImages["for-engineering-teams"],
  template:      slugHeroImages["email-prompt-templates"],
  platform:      { src: u("photo-1551434678-e076c223a692"), alt: "Cross-platform AI usage", badgeIcon: "Globe", badgeHeadline: "Any platform", badgeSubtitle: "Works everywhere", topBadgeIcon: "Zap", topBadgeHeadline: "5 AI tools", topBadgeSubtitle: "Connected" },
};

export function SeoLandingPage({ data }: { data: SeoPageData }) {
  const heroImg = slugHeroImages[data.slug] || categoryFallback[data.category];
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...(data.faqs ? [generateFAQSchema(data.faqs)] : []),
            generateBreadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Solutions", url: `${SITE_URL}/solutions` },
              {
                name: data.meta.title,
                url: `${SITE_URL}/solutions/${data.slug}`,
              },
            ]),
          ]),
        }}
      />

      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.3) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 80% 50%, hsl(260 60% 50% / 0.12) 0%, transparent 60%)",
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {data.hero.badges && data.hero.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {data.hero.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm"
                    >
                      <Shield className={`h-3 w-3 ${categoryBadgeColors[data.category] || "text-blue-400"}`} />
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
                {data.hero.headline}
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
                {data.hero.subtitle}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
                  >
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                  >
                    See all features
                  </Button>
                </Link>
              </div>
            </div>

            {heroImg && (() => {
              const BadgeIcon = iconMap[heroImg.badgeIcon] || Shield;
              const TopIcon = heroImg.topBadgeIcon ? (iconMap[heroImg.topBadgeIcon] || Shield) : null;
              return (
                <HeroImage
                  src={heroImg.src}
                  alt={heroImg.alt}
                  badge={{
                    icon: <BadgeIcon className="h-4 w-4" />,
                    headline: heroImg.badgeHeadline,
                    subtitle: heroImg.badgeSubtitle,
                  }}
                  topBadge={TopIcon && heroImg.topBadgeHeadline ? {
                    icon: <TopIcon className="h-3.5 w-3.5" />,
                    headline: heroImg.topBadgeHeadline,
                    subtitle: heroImg.topBadgeSubtitle || "",
                  } : undefined}
                  dark
                />
              );
            })()}
          </div>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      {data.features && (
        <section className="py-20 sm:py-28 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <SectionLabel>{data.features.sectionLabel}</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.features.heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Every feature designed to help your team work smarter with AI.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {data.features.items.map((feature, i) => {
                const Icon = iconMap[feature.icon] || Shield;
                return (
                  <div
                    key={feature.title}
                    className="group relative rounded-2xl p-px bg-gradient-to-b from-border via-border/50 to-transparent hover:from-primary/40 hover:via-primary/20 hover:to-transparent transition-all duration-500"
                  >
                    <div className="rounded-[15px] bg-card h-full p-7 relative overflow-hidden">
                      {/* Subtle gradient accent on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10 group-hover:ring-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5 transition-all duration-500">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums mt-1">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold leading-snug">
                          {feature.title}
                        </h3>
                        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ CONTENT SECTIONS ━━━ */}
      {data.sections && data.sections.length > 0 && data.sections.map((section, idx) => (
        <ContentSection key={idx} section={section} />
      ))}

      {/* ━━━ BENEFITS ━━━ */}
      {data.benefits && (
        <section className="py-20 sm:py-28 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <SectionLabel>Benefits</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.benefits.heading}
              </h2>
            </div>
            <div className="max-w-3xl mx-auto">
              <BenefitsGrid benefits={data.benefits.items} />
            </div>
          </div>
        </section>
      )}

      {/* ━━━ STATS ━━━ */}
      {data.stats && data.stats.length > 0 && (
        <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-5xl">
          <div className="py-4">
            <StatsRow stats={data.stats} dark className="max-w-3xl mx-auto" />
          </div>
        </DarkSection>
      )}

      {/* ━━━ FAQ ━━━ */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FAQSection faqs={data.faqs} includeSchema={false} />
          </div>
        </section>
      )}

      {/* ━━━ RELATED SOLUTIONS ━━━ */}
      <RelatedSolutions slug={data.slug} />

      {/* ━━━ CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline={data.cta.headline}
            gradientText={data.cta.gradientText}
            subtitle={data.cta.subtitle}
          />
        </div>
      </section>
    </>
  );
}

function RelatedSolutions({ slug }: { slug: string }) {
  const related = getRelatedPages(slug, 6);
  if (related.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>Related Solutions</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Explore more solutions
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {related.map((page) => (
            <Link
              key={page.slug}
              href={`/solutions/${page.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col"
            >
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {page.meta.title.split("—")[0].split("for")[0].trim()}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                {page.meta.description}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Learn more
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ━━━ Section Renderers ━━━ */

function ContentSection({ section }: { section: SeoContentSection }) {
  switch (section.type) {
    case "checklist":
      return <ChecklistSection section={section} />;
    case "comparison-table":
      return <ComparisonTableSection section={section} />;
    case "how-it-works":
      return <HowItWorksSection section={section} />;
    case "prose":
      return <ProseSection section={section} />;
    case "use-cases-grid":
      return <UseCasesGridSection section={section} />;
    default:
      return null;
  }
}

function ChecklistSection({ section }: { section: SeoContentSection }) {
  const items = (section.content.items as string[]) || [];
  const half = Math.ceil(items.length / 2);
  return (
    <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-14">
          <SectionLabel>Checklist</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[items.slice(0, half), items.slice(half)].map((col, colIdx) => (
            <div key={colIdx} className="space-y-3">
              {col.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonTableSection({ section }: { section: SeoContentSection }) {
  const headers = (section.content.headers as string[]) || [];
  const rows = (section.content.rows as { label: string; values: string[] }[]) || [];
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>Comparison</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <div className="max-w-3xl mx-auto rounded-2xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-4 px-6 font-semibold">Feature</th>
                {headers.map((h) => (
                  <th key={h} className="text-center py-4 px-6 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={row.label} className={rIdx % 2 === 1 ? "bg-muted/20" : ""}>
                  <td className="py-3.5 px-6 font-medium">{row.label}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="text-center py-3.5 px-6 text-muted-foreground">
                      {val === "✓" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : val === "✗" ? (
                        <span className="text-destructive/50">—</span>
                      ) : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ section }: { section: SeoContentSection }) {
  const steps = (section.content.steps as { title: string; description: string }[]) || [];
  return (
    <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-px bg-border" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm mx-auto mb-4 relative z-10 shadow-md shadow-primary/20">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProseSection({ section }: { section: SeoContentSection }) {
  const body = (section.content.body as string) || "";
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="border-l-4 border-primary/30 pl-6 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
          </div>
          <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesGridSection({ section }: { section: SeoContentSection }) {
  const cases = (section.content.cases as { title: string; description: string }[]) || [];
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-14">
          <SectionLabel>Use cases</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{section.heading}</h2>
        </div>
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto rounded-2xl border border-border overflow-hidden bg-border">
          {cases.map((c, i) => (
            <div key={c.title} className="bg-card p-7 hover:bg-primary/[0.02] transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary/50 mb-3 block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
