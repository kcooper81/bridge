import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Chrome,
  CheckCircle2,
  MessageSquare,
  Shield,
  Zap,
  Search,
  Copy,
} from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Integrations — Works With Every Major AI Tool",
  description:
    "TeamPrompt's browser extension works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. Insert prompts, scan for sensitive data, and log usage — across all your AI tools.",
  path: "/integrations",
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
      "Full support for Google Gemini. Search your prompt library and insert directly into Gemini's chat — no copy-pasting needed.",
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
      "Use your team's prompt library directly in Perplexity search. Great for standardizing research prompts across your organization.",
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
      "Browse or search your team's prompt library from any supported AI tool. Click to insert — the prompt lands directly in the chat input.",
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

export default function IntegrationsPage() {
  return (
    <>
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
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel dark className="text-center">
              Integrations
            </SectionLabel>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              One extension,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                every AI tool
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              The TeamPrompt browser extension works wherever your team uses AI.
              Search prompts, insert with one click, and enforce guardrails —
              across ChatGPT, Claude, Gemini, Copilot, and Perplexity.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
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

            {/* Coming soon card */}
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-3">
                <Chrome className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">More coming soon</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;re adding support for more AI tools. Have a request?{" "}
                <Link
                  href="/help"
                  className="text-primary hover:underline"
                >
                  Let us know
                </Link>
                .
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
            subtitle="Install the extension and start using your shared prompt library across every AI tool in minutes."
          />
        </div>
      </section>
    </>
  );
}
