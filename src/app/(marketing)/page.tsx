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
import {
  ArrowRight,
  ClipboardList,
  Eye,
  FileSearch,
  Globe,
  Quote,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Lock,
  Activity,
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

      {/* ━━━ 1. HERO ━━━ Light, clean, Lumia-inspired */}
      <section className="relative overflow-hidden bg-[#FAFBFC] border-b border-border">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-foreground">
              Your team uses AI.{" "}
              <span className="text-primary">
                Now make it safe.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              See and control how your team uses AI. Block sensitive data, share prompts securely, and enforce compliance — all from one platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 rounded-full font-semibold"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 rounded-full font-semibold"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Free for up to 3 members.
            </p>
          </div>

          {/* Dashboard visual — clean card mockup */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background border border-border text-xs text-muted-foreground">
                    app.teamprompt.app/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 sm:p-8 bg-background">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Violations Blocked", value: "847", change: "+12%", icon: ShieldAlert, color: "text-red-500" },
                    { label: "Prompts Shared", value: "1,234", change: "+8%", icon: ClipboardList, color: "text-blue-500" },
                    { label: "AI Interactions", value: "15.2K", change: "+24%", icon: Activity, color: "text-violet-500" },
                    { label: "Compliance Score", value: "98%", change: "+2%", icon: ShieldCheck, color: "text-emerald-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border p-4 bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                        <span className="text-[10px] font-medium text-emerald-500">{stat.change}</span>
                      </div>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent activity rows */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                    <p className="text-xs font-semibold text-foreground">Recent Security Activity</p>
                  </div>
                  {[
                    { event: "SSN detected in ChatGPT prompt", action: "Blocked", user: "sarah.chen@acme.com", time: "2 min ago", severity: "block" },
                    { event: "Credit card number in Claude", action: "Redacted", user: "mike.ross@acme.com", time: "8 min ago", severity: "warn" },
                    { event: "API key pattern detected", action: "Blocked", user: "dev-team@acme.com", time: "15 min ago", severity: "block" },
                    { event: "Patient name flagged (HIPAA)", action: "Warned", user: "dr.lee@acme.com", time: "22 min ago", severity: "warn" },
                  ].map((row) => (
                    <div key={row.event} className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 text-sm">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        row.severity === "block" ? "bg-red-500" : "bg-amber-500"
                      )} />
                      <span className="flex-1 text-xs text-foreground truncate">{row.event}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{row.user}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase shrink-0",
                        row.severity === "block" ? "text-red-500" : "text-amber-500"
                      )}>
                        {row.action}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 2. TRUST / LOGO BAR ━━━ */}
      <section className="border-b border-border bg-card/50">
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

      {/* ━━━ 3. PLATFORM CONTROL ━━━ Lumia-style positioning */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Control AI usage. Protect your team. Govern compliance.
            </h2>
          </div>

          <div className="flex items-center justify-center gap-3 mb-14">
            <Link href="/features">
              <Button variant="outline" className="rounded-full px-6 font-medium">
                For Teams
              </Button>
            </Link>
            <Link href="/enterprise">
              <Button variant="outline" className="rounded-full px-6 font-medium">
                For Enterprise
              </Button>
            </Link>
          </div>

          <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-14">
            TeamPrompt works inside the AI tools your team already uses — scanning every interaction in real time to detect risk and enforce policy. Powered by 19 compliance frameworks and real-time DLP rules.
          </p>
        </div>
      </section>

      {/* ━━━ 4. COMPREHENSIVE PLATFORM — 4-CARD GRID ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border bg-[#FAFBFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-primary">secure AI across your org.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              DLP scanning, prompt governance, compliance frameworks, and full audit trails — unified in one platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
            {[
              {
                icon: Eye,
                title: "Shadow AI Analysis",
                desc: "Go beyond discovery to understand how AI is actually used across your organization. See which tools, which teams, and what data is being shared.",
                href: "/security",
                color: "bg-violet-500/10",
              },
              {
                icon: Lock,
                title: "Leakage & Oversharing Prevention",
                desc: "Detect and block sensitive information before it reaches AI tools. SSNs, credit cards, API keys, patient records — stopped in real time.",
                href: "/security",
                color: "bg-red-500/10",
              },
              {
                icon: FileSearch,
                title: "Maintaining Compliance",
                desc: "Ensure AI usage stays aligned with organizational policies, security frameworks, and evolving regulatory requirements. 19 pre-built compliance packs.",
                href: "/features#compliance-policy-packs",
                color: "bg-emerald-500/10",
              },
              {
                icon: ClipboardList,
                title: "Prompt Governance",
                desc: "One searchable library of approved prompts with templates, approval workflows, quality guidelines, and usage analytics across your team.",
                href: "/features#prompt-library",
                color: "bg-blue-500/10",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5", card.color)}>
                  <card.icon className="h-6 w-6 text-foreground/70" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 5. TESTIMONIAL ━━━ Lumia-style single prominent quote */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="h-10 w-10 text-primary/20 mx-auto mb-6" />
          <blockquote className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug">
            &ldquo;TeamPrompt gives us visibility and control over AI usage that we simply didn&apos;t have before. The DLP scanning alone has prevented dozens of data exposure incidents.&rdquo;
          </blockquote>
          <div className="mt-8">
            <p className="font-semibold">Dr. Rebecca Lin</p>
            <p className="text-sm text-muted-foreground">Compliance Officer, Regional Health System</p>
          </div>
        </div>
      </section>

      {/* ━━━ 6. STATS ROW ━━━ */}
      <section className="py-16 border-t border-b border-border bg-[#FAFBFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: ShieldAlert, value: "Real-time", label: "PII detection" },
              { icon: FileSearch, value: "19", label: "Compliance frameworks" },
              { icon: Globe, value: "<5 min", label: "Setup time" },
              { icon: EyeOff, value: "3 modes", label: "Block, Warn, or Redact" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 7. BLOG / RESOURCES PREVIEW ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
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
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
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
              <Button variant="outline" className="rounded-full px-8 font-medium">
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
