import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { HeroImage } from "@/components/marketing/hero-image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Chrome,
  CheckCircle2,
  Globe,
  MessageSquare,
  Shield,
  Zap,
  Search,
  Copy,
} from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Integrations — Works With Every Major AI Tool",
  description:
    "DLP scanning, audit logging, and a shared prompt library for ChatGPT, Claude, Gemini, Copilot, and Perplexity — all from one browser extension.",
  path: "/integrations",
  keywords: ["ChatGPT extension", "Claude extension", "Gemini extension", "AI tool integration"],
});

const aiTools = [
  {
    name: "ChatGPT",
    by: "OpenAI",
    description:
      "Insert prompts directly into ChatGPT conversations. The extension detects the input field automatically and supports both GPT-4 and GPT-3.5 sessions.",
    url: "https://chatgpt.com",
    color: "from-green-500/20 to-green-600/5",
    borderColor: "border-green-500/20",
    iconColor: "text-green-500",
  },
  {
    name: "Claude",
    by: "Anthropic",
    description:
      "Works seamlessly with Claude's conversation interface. Insert prompts with one click and use DLP scanning to protect sensitive data before it reaches the model.",
    url: "https://claude.ai",
    color: "from-orange-500/20 to-orange-600/5",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-500",
  },
  {
    name: "Gemini",
    by: "Google",
    description:
      "Full DLP scanning and prompt library support for Google Gemini. Insert prompts directly into Gemini's chat.",
    url: "https://gemini.google.com",
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    name: "Microsoft Copilot",
    by: "Microsoft",
    description:
      "Insert prompts into Microsoft Copilot conversations. Works with the web-based Copilot interface at copilot.microsoft.com.",
    url: "https://copilot.microsoft.com",
    color: "from-cyan-500/20 to-cyan-600/5",
    borderColor: "border-cyan-500/20",
    iconColor: "text-cyan-500",
  },
  {
    name: "Perplexity",
    by: "Perplexity AI",
    description:
      "DLP scanning and prompt library for Perplexity search. Standardize research prompts with built-in data protection.",
    url: "https://www.perplexity.ai",
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-500",
  },
];

const features = [
  {
    icon: Search,
    title: "Search & Insert",
    description:
      "DLP scanning, shared prompt library, and audit logging — accessible from a sidebar panel in any supported AI tool.",
  },
  {
    icon: Copy,
    title: "Template Variables",
    description:
      "Fill in template variables before insertion. Prompts with {{placeholders}} show input fields so each use is customized.",
  },
  {
    icon: Shield,
    title: "DLP Scanning",
    description:
      "Messages are scanned for sensitive data before they reach the AI tool. Credit cards, SSNs, API keys, and custom patterns are caught in real-time.",
  },
  {
    icon: Zap,
    title: "Usage Logging",
    description:
      "Every prompt insertion is logged — which prompt, which AI tool, when. Your team gets visibility into how prompts are actually being used.",
  },
];

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Integrations", url: "https://teamprompt.app/integrations" },
]);

export default function IntegrationsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.3) 0%, transparent 60%)",
              "radial-gradient(ellipse 40% 40% at 80% 60%, hsl(260 60% 50% / 0.1) 0%, transparent 50%)",
            ].join(", "),
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel dark>
                Integrations
              </SectionLabel>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                One extension,{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  every AI tool
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
                The TeamPrompt browser extension works wherever your team uses AI.
                Search prompts, insert with one click, and block sensitive data —
                across ChatGPT, Claude, Gemini, Copilot, and Perplexity.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <HeroImage
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=640&q=80&auto=format&fit=crop"
              alt="Developer working with multiple tools"
              badge={{
                icon: <Globe className="h-4 w-4" />,
                headline: "5 AI tools supported",
                subtitle: "One extension, everywhere",
              }}
              dark
            />
          </div>
        </div>
      </section>

      {/* Supported AI tools grid */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <SectionLabel>Supported AI Tools</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Works with the tools your team already uses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The browser extension detects supported AI tools automatically and
              adds prompt insertion, DLP scanning, and usage logging.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aiTools.map((tool) => (
              <div
                key={tool.name}
                className={`group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg ${tool.borderColor} hover:border-primary/30`}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color.split(" ")[0].replace("from-", "").replace("/20", "")}15, transparent)`,
                  }}
                />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color}`}
                    >
                      <MessageSquare className={`h-5 w-5 ${tool.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tool.by}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Prompt insertion",
                      "DLP scanning",
                      "Usage logging",
                    ].map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary/60" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Slack */}
            <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/30">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
                    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
                    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
                    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Slack</h3>
                  <p className="text-xs text-muted-foreground">Notifications & Alerts</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Get real-time DLP violation alerts, prompt approval requests, and weekly activity digests directly in your Slack channels.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["DLP alerts", "Approval notifications", "Weekly digest"].map((feat) => (
                  <span key={feat} className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary/60" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* MCP */}
            <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 5a7 7 0 110 14 7 7 0 010-14z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">MCP Server</h3>
                  <p className="text-xs text-muted-foreground">AI Coding Tools</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Connect Claude Desktop, Cursor, Windsurf, and any MCP-compatible tool to your prompt library, DLP scanning, and audit logging.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Search prompts", "DLP scanning", "Audit logging", "Templates"].map((feat) => (
                  <span key={feat} className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary/60" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Coming soon card */}
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-3">
                <Chrome className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">More coming soon</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;re adding support for more AI tools and integrations.{" "}
                <Link
                  href="/help"
                  className="text-primary hover:underline"
                >
                  Let us know
                </Link>{" "}
                what you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel className="text-center">How It Works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              What the extension does on every AI tool
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Your team uses multiple AI tools."
            gradientText="Give them one prompt system."
            subtitle="Install the extension and get AI data loss prevention and a shared prompt library across every AI tool in minutes."
          />
        </div>
      </section>
    </>
  );
}
