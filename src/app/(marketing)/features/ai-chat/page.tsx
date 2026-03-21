import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Bot,
  Brain,
  Check,
  FileUp,
  FolderOpen,
  Keyboard,
  Lock,
  MessageSquare,
  RefreshCw,
  ScanSearch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  ThumbsUp,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Chat — DLP-Protected Chat with Multi-Model Support",
  description:
    "A built-in AI chat for your team with real-time DLP scanning, smart redaction, file uploads, conversation organization, and admin analytics. Connect OpenAI, Anthropic, or Google.",
  path: "/features/ai-chat",
});

/* ── Schema data ────────────────────────────────────────── */

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Features", url: "https://teamprompt.app/features" },
  { name: "AI Chat", url: "https://teamprompt.app/features/ai-chat" },
]);

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AI Chat — DLP-Protected Chat with Multi-Model Support",
  description:
    "A built-in AI chat for your team with real-time DLP scanning, smart redaction, file uploads, conversation organization, and admin analytics.",
  url: "https://teamprompt.app/features/ai-chat",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.itemListElement,
  },
};

/* ── FAQ data ───────────────────────────────────────────── */

const faqs = [
  {
    question: "How is the AI Chat different from ChatGPT?",
    answer:
      "It uses your own API keys, runs DLP scanning on every message, and is managed by your organization's security policies.",
  },
  {
    question: "Which AI models are supported?",
    answer:
      "OpenAI (GPT-4o, GPT-4.1, o3-mini), Anthropic (Claude Sonnet, Opus, Haiku), and Google (Gemini 2.5 Flash/Pro).",
  },
  {
    question: "Does DLP scanning work on file uploads?",
    answer:
      "Yes, uploaded files are scanned by the same DLP rules. PDFs, Word docs, code files, and text files are all supported.",
  },
  {
    question: "What is Smart Redaction?",
    answer:
      "Instead of blocking messages, sensitive data is automatically replaced with category placeholders like [API_KEY] or [EMAIL]. The message still sends safely.",
  },
  {
    question: "Can I use the chat and the browser extension together?",
    answer:
      "Yes. The chat is for sensitive work that needs DLP protection built-in. The extension protects your existing ChatGPT, Claude, and Gemini usage.",
  },
];

/* ── Inline mockup components ───────────────────────────── */

function LiveChatMockup() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
        <div className="ml-3 flex-1 h-5 rounded-md bg-white/5 border border-white/10 px-3 flex items-center">
          <span className="text-[10px] text-zinc-500">app.teamprompt.app/chat</span>
        </div>
      </div>
      <div className="flex min-h-[320px]">
        {/* Sidebar */}
        <div className="w-40 border-r border-white/10 bg-white/[0.02] p-3 hidden sm:block">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] font-semibold text-zinc-300">Chats</span>
            <span className="text-[10px] text-zinc-600">Favorites</span>
            <span className="text-[10px] text-zinc-600">Collections</span>
          </div>
          {[
            { name: "Security config review", active: true },
            { name: "Marketing copy draft" },
            { name: "Q1 budget analysis" },
            { name: "Code review: auth flow" },
          ].map((c) => (
            <div
              key={c.name}
              className={`rounded-md px-2 py-1.5 mb-0.5 text-[9px] truncate ${
                c.active
                  ? "bg-blue-500/10 text-blue-400 font-medium"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {c.name}
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1 mb-1.5">
              <FolderOpen className="w-2.5 h-2.5 text-amber-500/70" />
              <span className="text-[8px] font-medium text-zinc-500">Collections</span>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-zinc-600 pl-3.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />Engineering
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-zinc-600 pl-3.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />Marketing
            </div>
          </div>
        </div>

        {/* Main chat */}
        <div className="flex-1 flex flex-col p-4">
          {/* User message */}
          <div className="flex justify-end mb-3">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 max-w-[75%]">
              <p className="text-[10px] leading-relaxed">
                Review this config for security issues. The API key is sk-proj-abc123def456
              </p>
            </div>
          </div>

          {/* Redaction notice */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 mb-3">
            <ShieldAlert className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-medium text-amber-400">1 item redacted</span>
            <span className="text-[8px] text-amber-500/60 ml-1">API key → [API_KEY]</span>
          </div>

          {/* AI response */}
          <div className="flex gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-zinc-400" />
            </div>
            <div className="max-w-[80%]">
              <p className="text-[10px] leading-relaxed text-zinc-300">
                I&apos;ve reviewed the configuration. Here are the key findings:
              </p>
              <div className="mt-2 rounded-lg bg-white/5 border border-white/10 p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[8px] text-zinc-500 font-mono">typescript</span>
                </div>
                <pre className="text-[9px] text-emerald-400 font-mono leading-relaxed">
{`// Recommendations
auth: "properly configured"
rateLimit: "increase to 100/min"
cors: "tighten allowed origins"`}</pre>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button className="text-zinc-600 hover:text-zinc-400"><ThumbsUp className="w-3 h-3" /></button>
                <button className="text-zinc-600 hover:text-zinc-400"><Bookmark className="w-3 h-3" /></button>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
              <Upload className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[10px] text-zinc-600 flex-1">Type a message...</span>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 rounded-full px-1.5 py-0.5">
                <ShieldCheck className="w-2 h-2" />
                <span className="text-[7px] font-semibold">DLP</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RedactionDemo() {
  return (
    <div className="space-y-4">
      {/* Before */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">What you type</p>
        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
          <p className="text-sm text-zinc-300 leading-relaxed font-mono">
            My API key is{" "}
            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded line-through decoration-red-500/50">
              sk-proj-abc123def456
            </span>{" "}
            and my email is{" "}
            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded line-through decoration-red-500/50">
              john@acme.com
            </span>
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-400">Smart Redaction</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* After */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">What the AI sees</p>
        <div className="rounded-xl bg-white/5 border border-emerald-500/20 px-4 py-3">
          <p className="text-sm text-zinc-300 leading-relaxed font-mono">
            My API key is{" "}
            <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
              [API_KEY]
            </span>{" "}
            and my email is{" "}
            <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
              [EMAIL]
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function AIChatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbs, webPageSchema]),
        }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        {/* Background effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.25) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 80% 50%, hsl(260 60% 50% / 0.1) 0%, transparent 60%)",
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 mb-6">
                <Sparkles className="h-3 w-3" />
                Built-In AI Chat
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
                AI Chat That{" "}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Protects
                </span>{" "}
                Your Data
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
                Every message scanned by DLP. Files analyzed safely. Sensitive data
                auto-redacted. All with your own API keys and your team&apos;s security policies.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                  >
                    See Pricing
                  </Button>
                </Link>
              </div>

              <p className="mt-5 text-sm text-zinc-500">
                No credit card required. 2 minute setup.
              </p>
            </div>

            <div className="w-full max-w-lg lg:max-w-none">
              <LiveChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { label: "Messages Scanned", value: "Every single one" },
              { label: "Models Available", value: "10+" },
              { label: "Setup Time", value: "< 2 min" },
              { label: "File Types", value: "PDF, DOCX, Code, Images" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works (3 steps) ────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Security built into every message
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your team chats naturally. TeamPrompt handles the security automatically.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: MessageSquare,
                title: "Your team chats with AI",
                description: "Use GPT-4o, Claude, or Gemini. Switch models anytime. Upload files, compare responses.",
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "02",
                icon: ScanSearch,
                title: "DLP scans every message",
                description: "API keys, PII, credentials, source code — caught and handled before reaching the AI.",
                color: "from-amber-500 to-orange-500",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "Data stays protected",
                description: "Block, warn, or auto-redact sensitive data. Full audit trail for compliance.",
                color: "from-emerald-500 to-emerald-600",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-center">
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg mb-5`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">
                    Step {item.step}
                  </p>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Smart Redaction (visual demo) ─────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <DarkSection>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionLabel dark>Smart Redaction</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Don&apos;t block the message.{" "}
                  <span className="text-emerald-400">Redact the risk.</span>
                </h2>
                <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
                  Instead of blocking entire messages, sensitive data is automatically
                  replaced with safe placeholders. The AI still gets the context it needs.
                  Your data stays protected.
                </p>
                <div className="mt-8 space-y-3">
                  {[
                    "API keys, tokens, and secrets → [API_KEY]",
                    "Emails, SSNs, phone numbers → [EMAIL], [SSN]",
                    "Custom patterns your org defines",
                    "Works on messages AND file uploads",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <RedactionDemo />
              </div>
            </div>
          </DarkSection>
        </div>
      </section>

      {/* ── Multi-Model Bento Grid ────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>Multi-Model</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Every model. One secure interface.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Large card - Compare mode */}
            <div className="sm:col-span-2 group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    New
                  </span>
                </div>
                <h3 className="text-xl font-semibold">Compare Mode</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">
                  Send the same prompt to two models side-by-side. GPT-4o vs Claude.
                  Claude vs Gemini. See which gives the best answer for your use case.
                </p>
                {/* Mini compare mockup */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-[9px] font-semibold text-blue-500">GPT-4o</span>
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1.5 w-full rounded bg-muted" />
                      <div className="h-1.5 w-4/5 rounded bg-muted" />
                      <div className="h-1.5 w-3/5 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-[9px] font-semibold text-violet-500">Claude</span>
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1.5 w-full rounded bg-muted" />
                      <div className="h-1.5 w-3/4 rounded bg-muted" />
                      <div className="h-1.5 w-5/6 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider cards */}
            {[
              { name: "OpenAI", models: "GPT-4o, GPT-4.1, o3-mini", color: "text-emerald-500", icon: Brain },
              { name: "Anthropic", models: "Claude Sonnet, Opus, Haiku", color: "text-orange-500", icon: Sparkles },
              { name: "Google", models: "Gemini 2.5 Flash & Pro", color: "text-blue-500", icon: Zap },
            ].map((provider) => (
              <div key={provider.name} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className={`h-11 w-11 rounded-xl bg-muted flex items-center justify-center mb-4 ${provider.color}`}>
                  <provider.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{provider.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{provider.models}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── File Uploads + DLP ───────────────────────────── */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>File Intelligence</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Upload anything. We scan everything.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Drag and drop PDFs, Word docs, code files, and images. Every file is
                scanned by DLP before the text is extracted and sent to the AI.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: FileUp, label: "PDF documents" },
                  { icon: FileUp, label: "Word documents" },
                  { icon: FileUp, label: "Code files" },
                  { icon: FileUp, label: "Plain text & CSV" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File upload mockup */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
              <div className="p-5 border-b border-border bg-muted/20">
                <p className="text-xs font-semibold text-foreground">Uploaded Files</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: "quarterly-report.pdf", size: "2.4 MB", status: "passed", type: "PDF" },
                  { name: "api-config.json", size: "12 KB", status: "redacted", type: "JSON" },
                  { name: "customer-data.csv", size: "890 KB", status: "blocked", type: "CSV" },
                ].map((file) => (
                  <div key={file.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                      {file.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.size}</p>
                    </div>
                    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                      file.status === "passed" ? "bg-emerald-500/10 text-emerald-600" :
                      file.status === "redacted" ? "bg-amber-500/10 text-amber-600" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {file.status === "passed" ? <ShieldCheck className="w-2.5 h-2.5" /> :
                       file.status === "redacted" ? <ShieldAlert className="w-2.5 h-2.5" /> :
                       <Shield className="w-2.5 h-2.5" />}
                      {file.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Organization Features ─────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>Stay Organized</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Never lose an important conversation
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: FolderOpen,
                title: "Collections",
                description: "Color-coded groups to organize conversations by project or topic.",
              },
              {
                icon: Star,
                title: "Favorites",
                description: "Star important conversations so they always appear at the top.",
              },
              {
                icon: Zap,
                title: "Conversation Outline",
                description: "Auto-detected timeline showing code, links, files, and topic changes.",
              },
              {
                icon: Bookmark,
                title: "Saved Items",
                description: "Bookmark any AI response to your personal knowledge base.",
              },
            ].map((item) => (
              <div key={item.title} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admin Intelligence ────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <DarkSection gradient="left">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionLabel dark>Admin Commands</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Query your data from the chat
                </h2>
                <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
                  Admin slash commands query your actual database. See team activity,
                  DLP violations, usage analytics — without leaving the chat.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { cmd: "/activity", icon: Users, desc: "Team AI usage, active users, trends" },
                  { cmd: "/violations", icon: ShieldAlert, desc: "DLP violations, categories, severity" },
                  { cmd: "/usage", icon: Terminal, desc: "Prompt adoption, unused prompts, metrics" },
                  { cmd: "/audit", icon: Lock, desc: "Full audit trail of all AI interactions" },
                ].map((item) => (
                  <div key={item.cmd} className="flex items-center gap-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                    <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white font-mono">{item.cmd}</p>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DarkSection>
        </div>
      </section>

      {/* ── Productivity shortcuts ────────────────────────── */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>Productivity</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for speed
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Keyboard, title: "Keyboard Shortcuts", desc: "Ctrl+N new chat, / for commands, double-click rename" },
              { icon: Upload, title: "Drag & Drop Files", desc: "Drop files anywhere on the page to upload and analyze" },
              { icon: ThumbsUp, title: "Response Rating", desc: "Thumbs up/down on AI responses to track quality" },
            ].map((item) => (
              <div key={item.title} className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={faqs} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Ready to give your team"
            gradientText="a secure AI chat?"
            subtitle="Create a free workspace in under two minutes. No credit card required."
            buttonText="Start Free Trial"
          />
        </div>
      </section>
    </>
  );
}
