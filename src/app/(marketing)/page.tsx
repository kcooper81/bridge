import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  generateSoftwareApplicationSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/schemas";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
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
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">AI WorkOS</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
                Your team uses AI.{" "}
                <span className="text-primary">
                  Now make it safe.
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
                    Get Started
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
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80&auto=format&fit=crop"
                  alt="Team collaborating with AI tools on screens"
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
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground shrink-0">
              Works with
            </p>
            <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
              {[
                { name: "ChatGPT", color: "text-emerald-600" },
                { name: "Claude", color: "text-orange-600" },
                { name: "Gemini", color: "text-blue-600" },
                { name: "Copilot", color: "text-sky-600" },
                { name: "Perplexity", color: "text-teal-600" },
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/60 border border-border rounded-full px-3 py-1"
                >
                  <ShieldCheck className="h-3 w-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ AUDIT DASHBOARD MOCK — with flanking feature callouts ━━━ */}
      <section className="py-24 sm:py-32 border-b border-border" style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 40%, #fff 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              See everything in one dashboard
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Violations blocked, compliance scores, team activity, and risk insights — all at a glance.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_2fr_1fr] gap-6 items-center">
            {/* Left callouts */}
            <div className="hidden lg:flex flex-col gap-6">
              {[
                { icon: Eye, title: "Shadow AI Detection", desc: "See which AI tools your team actually uses" },
                { icon: Lock, title: "Real-Time DLP", desc: "Block sensitive data before it leaves the browser" },
                { icon: FileSearch, title: "19 Compliance Packs", desc: "HIPAA, SOC 2, PCI-DSS, GDPR and more" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 text-right">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <item.icon className="h-5 w-5 text-foreground/40 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>

            {/* Dashboard mock */}
            <div className="rounded-[20px] border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-3 py-0.5 rounded-md bg-background border border-border text-[10px] text-muted-foreground">
                    app.teamprompt.app/audit
                  </div>
                </div>
              </div>

              <div className="p-5 bg-background">
                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Blocked", value: "847", color: "text-red-500" },
                    { label: "Shared", value: "1,234", color: "text-blue-500" },
                    { label: "Interactions", value: "15.2K", color: "text-violet-500" },
                    { label: "Score", value: "98%", color: "text-emerald-500" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border p-3">
                      <p className={cn("text-lg font-bold tracking-tight", s.color)}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mini charts row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Trend chart mock */}
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-semibold mb-2">Violation Trend</p>
                    <div className="flex items-end gap-[3px] h-12">
                      {[3, 5, 2, 7, 4, 8, 6, 3, 5, 9, 4, 6, 8, 5, 3, 7, 4, 6, 2, 5, 8, 4, 6, 3, 5, 7, 4, 6, 8, 5].map((h, i) => (
                        <div key={i} className="flex-1 bg-red-500/60 rounded-sm" style={{ height: `${h * 10}%` }} />
                      ))}
                    </div>
                  </div>
                  {/* Donut mock */}
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[10px] font-semibold mb-2">By Category</p>
                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 36 36" className="w-12 h-12">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="25" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="60" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="85" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="5" />
                      </svg>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[9px] text-muted-foreground">PII</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[9px] text-muted-foreground">Credentials</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[9px] text-muted-foreground">API Keys</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-[9px] text-muted-foreground">Secrets</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity rows */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-3 py-2 bg-muted/30 border-b border-border">
                    <p className="text-[10px] font-semibold">Recent Activity</p>
                  </div>
                  {[
                    { event: "SSN detected in ChatGPT", action: "Blocked", severity: "block" },
                    { event: "Credit card in Claude prompt", action: "Redacted", severity: "warn" },
                    { event: "API key pattern detected", action: "Blocked", severity: "block" },
                  ].map((row) => (
                    <div key={row.event} className="flex items-center gap-3 px-3 py-2 border-b border-border/50 last:border-0">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", row.severity === "block" ? "bg-red-500" : "bg-amber-500")} />
                      <span className="flex-1 text-[10px] text-foreground truncate">{row.event}</span>
                      <span className={cn("text-[9px] font-bold uppercase", row.severity === "block" ? "text-red-500" : "text-amber-500")}>{row.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right callouts */}
            <div className="hidden lg:flex flex-col gap-6">
              {[
                { icon: ClipboardList, title: "Shared Prompt Library", desc: "Templates, approvals, and usage analytics" },
                { icon: Activity, title: "Full Audit Trail", desc: "Every AI interaction logged and exportable" },
                { icon: ShieldCheck, title: "Risk Scoring", desc: "Automatic risk assessment on every prompt" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-foreground/40 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 3. PLATFORM — 4-card grid with monochrome icons ━━━ */}
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
                src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80&auto=format&fit=crop",
                alt: "Team collaborating around laptop",
                title: "Real-Time DLP Scanning",
                desc: "Every prompt is scanned before it leaves the browser. Detect PII, credentials, and confidential data across ChatGPT, Claude, Gemini, and more.",
              },
              {
                src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80&auto=format&fit=crop",
                alt: "Professional at desk with monitor",
                title: "Shared Prompt Library",
                desc: "One searchable library of vetted prompts. Templates with variables, approval workflows, quality guidelines, and usage tracking.",
              },
              {
                src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80&auto=format&fit=crop",
                alt: "Team reviewing dashboard on screen",
                title: "Compliance & Audit Trail",
                desc: "19 compliance packs for HIPAA, SOC 2, PCI-DSS, GDPR, and more. Full activity log with exportable reports for auditors.",
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

      {/* ━━━ 5. TESTIMONIAL ━━━ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
          <blockquote className="text-2xl sm:text-3xl font-medium tracking-tight leading-snug">
            &ldquo;TeamPrompt gives us visibility and control over AI usage that we simply didn&apos;t have before. The DLP scanning alone has prevented dozens of data exposure incidents.&rdquo;
          </blockquote>
          <div className="mt-8">
            <p className="font-semibold">Dr. Rebecca Lin</p>
            <p className="text-sm text-muted-foreground">Compliance Officer, Regional Health System</p>
          </div>
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

      {/* ━━━ 8. GET STARTED IN 3 STEPS ━━━ */}
      <div className="border-t border-border">
        <GetStartedSteps />
      </div>

      {/* ━━━ 9. LEAD CAPTURE FORM ━━━ */}
      <LeadCaptureForm />
    </>
  );
}
