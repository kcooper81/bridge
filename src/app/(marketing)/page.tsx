import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  generateSoftwareApplicationSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/schemas";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { FeatureCard } from "@/components/marketing/feature-card";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Eye,
  FileSearch,
  Lock,
  Quote,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "AI DLP & Prompt Management for Teams — Secure ChatGPT, Claude & Gemini",
  description:
    "Protect your team's data with real-time DLP for ChatGPT, Claude & Gemini. Share prompts securely, enforce AI policies, and get full compliance audit trails. Free for up to 3 members.",
  path: "/",
  keywords: [
    "AI DLP",
    "AI data loss prevention",
    "ChatGPT security",
    "AI governance",
    "AI compliance",
    "prompt management",
    "sensitive data protection",
    "enterprise AI security",
    "AI security for teams",
    "secure AI adoption",
  ],
});

export default function LandingPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateSoftwareApplicationSchema(),
            generateOrganizationSchema(),
            generateWebSiteSchema(),
          ]),
        }}
      />

      {/* ━━━ 1. HERO ━━━ Circle-inspired with lifestyle image */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F6F2FF 50%, #fff 100%)" }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div>
              <p className="text-sm font-semibold tracking-widest text-primary mb-4">AI WorkOS</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
                AI Data Loss Prevention{" "}
                <span className="text-primary">
                  & Prompt Management for Teams
                </span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                See and control how your team uses AI. Block sensitive data, share prompts securely, and enforce compliance — all from one platform.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-base px-8 h-12 rounded-lg font-bold"
                  >
                    Start free workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 h-12 rounded-lg font-bold"
                  >
                    See How It Works
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required. Free for up to 3 members.
              </p>
            </div>

            {/* Hero image with UI overlays that offset beyond the image */}
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-[20px] shadow-2xl shadow-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero-chatgpt-at-work.webp"
                  alt="Professional using ChatGPT at work"
                  className="w-full h-[480px] object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none rounded-[20px]"
                  style={{ background: "radial-gradient(circle at 100% 100%, rgba(0,0,0,0.35), transparent 65%)" }}
                />
              </div>

              {/* Overlay — DLP Block (offset top-left) */}
              <div className="absolute -top-4 -left-6 flex items-center gap-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-4 py-3 shadow-lg border border-white/50 z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                  <ShieldCheck className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">SSN Blocked</p>
                  <p className="text-xs text-muted-foreground">Sensitive data detected in ChatGPT</p>
                </div>
              </div>

              {/* Overlay — Prompt shared (offset bottom-left) */}
              <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-4 py-3 shadow-lg border border-white/50 z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <ClipboardList className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Prompt Shared</p>
                  <p className="text-xs text-muted-foreground">Customer Onboarding — 142 uses</p>
                </div>
              </div>

              {/* Overlay — Compliance score (offset bottom-right) */}
              <div className="absolute -bottom-5 -right-5 flex items-center gap-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-4 py-3 shadow-lg border border-white/50 z-10">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                  <p className="text-xl font-bold text-foreground leading-none">98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 2. TRUST / LOGO BAR ━━━ */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <p className="text-xs font-medium uppercase tracking-widest text-foreground/80 shrink-0">
              Works with
            </p>
            <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
              {[
                // Brand-color shades bumped from -600 to -700 so each name
                // clears WCAG AA 4.5:1 contrast on white. Each was failing
                // Lighthouse mobile color-contrast at -600.
                { name: "ChatGPT", color: "text-emerald-700" },
                { name: "Claude", color: "text-orange-700" },
                { name: "Gemini", color: "text-blue-700" },
                { name: "Copilot", color: "text-sky-700" },
                { name: "Perplexity", color: "text-teal-700" },
              ].map((tool) => (
                <span
                  key={tool.name}
                  className={cn("text-sm sm:text-base font-bold tracking-wide", tool.color)}
                >
                  {tool.name}
                </span>
              ))}
            </div>

            <div className="hidden sm:block w-px h-8 bg-border" />

            <div className="flex items-center gap-4 flex-wrap justify-center">
              {["HIPAA Ready", "SOC 2 Ready", "PCI-DSS", "GDPR"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80 bg-muted/60 border border-border rounded-full px-3 py-1"
                >
                  <ShieldCheck className="h-3 w-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ TWO LAYERS OF PROTECTION ━━━ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              Two layers of AI protection
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Control which AI tools your team can access, and scan what they send for sensitive data. Both layers work together.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Layer 1: Network */}
            <div className="rounded-[20px] border border-border bg-card p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Layer 1</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Network-Level Control</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Choose which AI tools your team is allowed to use. Unapproved tools are blocked at the DNS level — before any connection is made. Covers every device on your network.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "Block unapproved AI tools at DNS (via Cloudflare Gateway)",
                    "Covers browser, native apps, mobile, and CLI tools",
                    "Approve ChatGPT + Claude, block everything else",
                    "Users see a clear block page explaining why",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Powered by Cloudflare Zero Trust. Free for up to 50 users.
                </p>
              </div>
            </div>

            {/* Layer 2: Content */}
            <div className="rounded-[20px] border border-border bg-card p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Layer 2</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Content-Level DLP</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  On the approved tools, scan every prompt in real time for sensitive data. Block, warn, or auto-redact before it reaches the AI — all inside the browser.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "Real-time DLP scanning inside ChatGPT, Claude, Gemini, Copilot, Perplexity",
                    "40+ detection rules for PII, credentials, API keys, patient data",
                    "20 compliance packs (HIPAA, SOC 2, PCI-DSS, GDPR, and more)",
                    "Auto-redact sensitive data with safe placeholders",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <Lock className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Browser extension. Installs in under 2 minutes. No proxy needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 3. PLATFORM — 6-card grid with monochrome icons ━━━ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              Everything you need to{" "}
              <span className="text-primary">secure AI across your org.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              DLP scanning, prompt governance, compliance frameworks, and full audit trails — unified in one platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <FeatureCard
              icon={Eye}
              title="Shadow AI Discovery"
              description="See which AI tools your team actually uses — approved and unapproved. Monitor by department, role, individual, and device."
              href="/security"
              mono
            />
            <FeatureCard
              icon={Lock}
              title="Real-Time DLP Scanning"
              description="Detect and block sensitive information before it reaches AI tools. SSNs, credit cards, API keys, patient records — stopped in real time."
              href="/security"
              mono
            />
            <FeatureCard
              icon={ShieldCheck}
              title="AI Tool Policy + Network Blocking"
              description="Approve the AI tools you trust, block everything else. Enforce at the browser level and at DNS with Cloudflare Gateway — covering native apps, mobile, and CLI."
              href="/features"
              mono
            />
            <FeatureCard
              icon={FileSearch}
              title="19 Compliance Frameworks"
              description="HIPAA, SOC 2, PCI-DSS, GDPR, and 15 more. One-click install activates all detection rules for your regulatory requirements."
              href="/features#compliance-policy-packs"
              mono
            />
            <FeatureCard
              icon={ClipboardList}
              title="Shared Prompt Library"
              description="One searchable library of approved prompts with templates, approval workflows, quality guidelines, and usage analytics across your team."
              href="/features#prompt-library"
              mono
            />
            <FeatureCard
              icon={Activity}
              title="Audit & Compliance Dashboard"
              description="Sankey flow diagrams, violation heatmaps, risk scoring, compliance coverage, and CSV export — everything auditors need in one view."
              href="/features"
              mono
            />
          </div>
        </div>
      </section>

      {/* ━━━ 4. LIFESTYLE FEATURE SECTIONS ━━━ */}
      <section className="py-24 sm:py-32 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              Built for the way your team works
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              From the browser extension to the admin dashboard, every feature is designed to protect without slowing anyone down.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                src: "/images/hero-tech-workers.jpg",
                alt: "Tech workers in modern office",
                title: "Real-Time DLP Scanning",
                desc: "Every prompt is scanned before it leaves the browser. Detect PII, credentials, and confidential data across ChatGPT, Claude, Gemini, and more.",
              },
              {
                src: "/images/hero-office-collab.jpg",
                alt: "Two colleagues collaborating on laptop",
                title: "Shared Prompt Library",
                desc: "One searchable library of vetted prompts. Templates with variables, approval workflows, quality guidelines, and usage tracking.",
              },
              {
                src: "/images/hero-data-breach.jpg",
                alt: "Data breach alert on laptop screen",
                title: "Compliance & Audit Trail",
                desc: "20 compliance packs for HIPAA, SOC 2, PCI-DSS, GDPR, and more. Full activity log with exportable reports for auditors.",
              },
            ].map((feature) => (
              <div key={feature.title}>
                <div className="relative overflow-hidden rounded-[20px] aspect-square mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={feature.src}
                    alt={feature.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 0% 100%, rgba(0,0,0,0.4), transparent 70%)" }}
                  />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 5. TESTIMONIALS ━━━
          Real reviews from the Chrome Web Store (4.9★, 21 ratings, 78 users
          as of 2026-06-06). FTC-compliant social proof — verifiable at
          chrome.google.com/webstore/detail/hpdekjimndbhdkebpedfgaceohplbpil */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <span className="text-amber-500">★★★★★</span>
              <span>4.9 on the Chrome Web Store · 21 reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              What teams using TeamPrompt say
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Featured long-form review — Marcia, marketing/ops manager voice */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-8">
              <Quote className="h-7 w-7 text-primary/30 mb-4" />
              <blockquote className="text-base leading-relaxed text-foreground/90">
                Three things convinced me this was worth writing a review for. <strong>First — the onboarding.</strong> I&apos;ve set up a lot of SaaS tools for teams and the part that always kills adoption is the first fifteen minutes. With this I set up our workspace, imported prompts from a doc we had, and sent the chrome extension link to my team in one Slack message. Everyone was set up before our next standup. <strong>Second — the search.</strong> Bad search in a prompt tool is fatal; this one is fast and accurate. <strong>Third — it just keeps working.</strong> No updates that break things, no prompts that mysteriously disappear. For a tool embedded in my daily workflow that consistency matters more than any feature.
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-semibold text-primary text-sm">M</div>
                <div>
                  <p className="text-sm font-semibold">Marcia</p>
                  <p className="text-xs text-muted-foreground">Chrome Web Store · ★★★★★</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <Quote className="h-5 w-5 text-primary/30 mb-3" />
                <blockquote className="text-sm leading-relaxed text-foreground/90">
                  The data blocking caught something in my first week that would have been embarrassing to send to an AI tool. Not gonna say what but yeah. Install it.
                </blockquote>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center font-semibold text-emerald-700 text-xs">A</div>
                  <div>
                    <p className="text-xs font-semibold">Alex Stanvia</p>
                    <p className="text-[10px] text-muted-foreground">★★★★★</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <Quote className="h-5 w-5 text-primary/30 mb-3" />
                <blockquote className="text-sm leading-relaxed text-foreground/90">
                  Switched jobs recently and the first thing I did was get my new team on this. That&apos;s probably the strongest endorsement I can give.
                </blockquote>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 flex items-center justify-center font-semibold text-blue-700 text-xs">S</div>
                  <div>
                    <p className="text-xs font-semibold">shmuel leibovich</p>
                    <p className="text-[10px] text-muted-foreground">★★★★★</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary row — three more punchy quotes */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { quote: "I've tried keeping prompts in Notion, in a pinned Slack message, in a Google Doc — nothing stuck because it was always one extra step away from where I was actually working. This sidebar is just there when I open ChatGPT or Claude. That proximity is everything.", name: "Elliot" },
              { quote: "Our marketing team was copy-pasting prompts from a google doc like cavemen. Someone found this, we set it up in one sitting, and that doc hasn't been opened since.", name: "Car Spa 24" },
              { quote: "Tried three other prompt tools this year. Two were too complicated, one didn't have a chrome extension that actually worked. This is the first one I've stuck with past week two.", name: "Aditi Jain" },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-muted/30 p-5">
                <blockquote className="text-xs leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="mt-3 text-[11px] font-semibold text-muted-foreground">— {t.name} · Chrome Web Store</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            <a
              href="https://chromewebstore.google.com/detail/teamprompt-%E2%80%94-ai-prompt-ma/hpdekjimndbhdkebpedfgaceohplbpil/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline-offset-2 hover:underline"
            >
              Read all reviews on the Chrome Web Store →
            </a>
          </p>
        </div>
      </section>

      {/* ━━━ 6. STATS ROW ━━━ */}
      <section
        className="py-20 border-t border-b border-border"
        style={{ background: "linear-gradient(90deg, #F6F2FF, #F1F8FF)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: "Real-time", label: "PII detection" },
              { value: "19", label: "Compliance frameworks" },
              { value: "<5 min", label: "Setup time" },
              { value: "3 modes", label: "Block, Warn, or Redact" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-medium tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 7. BLOG / RESOURCES PREVIEW ━━━ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              From the TeamPrompt blog
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Practical guides on AI data protection, prompt management, and building AI policies that actually work.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                title: "The Shadow AI Problem: What IT Teams Are Missing",
                excerpt: "Most organizations have no visibility into how employees use AI. Here's what that means for your security posture.",
                category: "AI Governance",
              },
              {
                title: "Building an AI Acceptable Use Policy",
                excerpt: "A step-by-step guide to creating AI usage policies that protect your organization without killing productivity.",
                category: "Guide",
              },
              {
                title: "DLP for AI Tools: Beyond Traditional Approaches",
                excerpt: "Why traditional DLP solutions fail for AI interactions, and what a modern approach looks like.",
                category: "Data Protection",
              },
            ].map((post) => (
              <Link
                key={post.title}
                href="/blog"
                className="group rounded-[20px] border border-border bg-card p-6 hover:border-foreground/10 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {post.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
                  Read more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/blog">
              <Button variant="outline" className="rounded-lg px-8 font-bold">
                Read the Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ INTERNAL LINKING HUB ━━━
          Surfaces high-intent buyer pages (comparisons, industries,
          compliance) from the homepage. The strongest internal link is
          one that comes from a page Google already ranks well — the
          homepage. This section spreads that equity into pages we want
          to grow impressions on. */}
      <section className="py-20 sm:py-24 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
              Choosing an AI DLP solution?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Compare TeamPrompt side-by-side with the most-evaluated alternatives.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { label: "vs Nightfall AI", href: "/compare/nightfall", desc: "Browser DLP vs API-based SaaS DLP" },
              { label: "vs Microsoft Purview", href: "/compare/purview", desc: "Cross-AI-tool vs Microsoft ecosystem" },
              { label: "vs Polymer", href: "/compare/polymer", desc: "Real-time prevention vs post-hoc detection" },
              { label: "vs Prompt Security", href: "/compare/prompt-security", desc: "Self-serve extension vs reverse proxy" },
              { label: "vs Lakera", href: "/compare/lakera", desc: "Team DLP vs API-level prompt firewall" },
              { label: "vs BigID", href: "/compare/bigid", desc: "AI-specific DLP vs enterprise data discovery" },
              { label: "vs Cyberhaven", href: "/compare/cyberhaven", desc: "Browser DLP vs endpoint + data lineage" },
              { label: "vs Witness AI", href: "/compare/witness-ai", desc: "Browser DLP vs network observability" },
              { label: "vs Notion AI", href: "/compare/notion", desc: "Cross-platform vs single-platform" },
              { label: "vs ChatGPT Teams", href: "/compare/chatgpt-teams", desc: "Multi-tool DLP vs OpenAI-only" },
              { label: "Best AI DLP 2026", href: "/compare/best-ai-dlp-tools", desc: "Top platforms reviewed" },
              { label: "See all 11 comparisons →", href: "/compare", desc: "Full alternatives index" },
            ].map((item) => (
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

          <div className="mt-12 grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-semibold">By industry</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Government", href: "/industries/government" },
                  { label: "Healthcare", href: "/industries/healthcare" },
                  { label: "Finance", href: "/industries/finance" },
                  { label: "Legal", href: "/industries/legal" },
                  { label: "Insurance", href: "/industries/insurance" },
                  { label: "Technology", href: "/industries/technology" },
                  { label: "Education", href: "/industries/education" },
                ].map((i) => (
                  <Link key={i.href} href={i.href} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all">
                    {i.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-semibold">By compliance framework</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "HIPAA", href: "/compliance/hipaa" },
                  { label: "SOC 2", href: "/compliance/soc2" },
                  { label: "GDPR", href: "/compliance/gdpr" },
                  { label: "PCI-DSS", href: "/compliance/pci-dss" },
                  { label: "EU AI Act", href: "/compliance/eu-ai-act" },
                ].map((c) => (
                  <Link key={c.href} href={c.href} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all">
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-semibold">Free tools &amp; research</h3>
              <div className="flex flex-col gap-2">
                <Link href="/tools/prompt-pii-scanner" className="rounded-lg border border-border bg-background px-3 py-2 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <div className="font-semibold">Prompt PII Scanner</div>
                  <div className="text-muted-foreground mt-0.5">Detects 15+ sensitive data types — free, in-browser</div>
                </Link>
                <Link href="/research/state-of-prompt-data-leakage-q2-2026" className="rounded-lg border border-border bg-background px-3 py-2 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <div className="font-semibold">State of Prompt Data Leakage Q2 2026</div>
                  <div className="text-muted-foreground mt-0.5">Original research from real-world deployments</div>
                </Link>
                <Link href="/security/owasp-llm-top-10" className="rounded-lg border border-border bg-background px-3 py-2 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <div className="font-semibold">OWASP LLM Top 10</div>
                  <div className="text-muted-foreground mt-0.5">Threat reference for LLM-powered apps</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ LEAD CAPTURE FORM ━━━ */}
      <LeadCaptureForm />
    </>
  );
}
