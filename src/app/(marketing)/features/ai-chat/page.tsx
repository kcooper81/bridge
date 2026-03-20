import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Brain,
  FileUp,
  FolderOpen,
  Keyboard,
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
import { FeatureCard } from "@/components/marketing/feature-card";
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

/* ── Chat mockup components ─────────────────────────────── */

function ChatMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl shadow-primary/5">
      {/* Browser bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
        <div className="ml-3 flex-1 h-5 rounded-md bg-background border border-border" />
      </div>
      <div className="flex min-h-[300px]">
        {/* Sidebar */}
        <div className="w-44 border-r border-border bg-muted/20 p-3 hidden sm:block">
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-foreground">
              Conversations
            </span>
          </div>
          {[
            { name: "API integration help", active: true },
            { name: "Marketing copy draft" },
            { name: "Code review feedback" },
            { name: "Quarterly report Q&A" },
          ].map((c) => (
            <div
              key={c.name}
              className={`rounded-md px-2 py-1.5 mb-1 text-[9px] truncate ${
                c.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {c.name}
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1 mb-1">
              <FolderOpen className="w-2.5 h-2.5 text-amber-500" />
              <span className="text-[8px] font-medium text-muted-foreground">
                Collections
              </span>
            </div>
            <div className="text-[8px] text-muted-foreground pl-3.5 py-0.5">
              Engineering
            </div>
            <div className="text-[8px] text-muted-foreground pl-3.5 py-0.5">
              Marketing
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col p-4">
          {/* Model selector + DLP badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium bg-muted rounded-md px-2 py-1">
                GPT-4o
              </span>
              <span className="text-[8px] text-muted-foreground">
                OpenAI
              </span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 rounded-full px-2 py-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="text-[8px] font-semibold">DLP Active</span>
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end mb-3">
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 max-w-[75%]">
              <p className="text-[10px] leading-relaxed">
                Can you review this configuration and check for security issues?
              </p>
            </div>
          </div>

          {/* Redaction banner */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 mb-3">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span className="text-[9px] font-medium text-amber-700">
              1 item redacted
            </span>
            <span className="text-[8px] text-amber-600/70 ml-1">
              API key replaced with [API_KEY]
            </span>
          </div>

          {/* AI response */}
          <div className="flex justify-start mb-3">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
              <p className="text-[10px] leading-relaxed text-foreground">
                I&apos;ve reviewed the configuration. Here are the key findings:
              </p>
              <ul className="text-[9px] text-muted-foreground mt-1.5 space-y-1 list-disc pl-3">
                <li>Authentication is properly configured</li>
                <li>Rate limiting should be increased to 100 req/min</li>
                <li>CORS headers need tightening</li>
              </ul>
            </div>
          </div>

          {/* Input area */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
              <Upload className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground flex-1">
                Type a message...
              </span>
              <ArrowRight className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RedactionMockup() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Original message */}
        <div>
          <p className="text-[9px] font-medium text-zinc-400 mb-1.5">
            Original message
          </p>
          <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
            <p className="text-[10px] text-zinc-300 leading-relaxed">
              My API key is{" "}
              <span className="bg-red-500/20 text-red-400 px-1 rounded line-through">
                sk-proj-abc123def456
              </span>{" "}
              and my email is{" "}
              <span className="bg-red-500/20 text-red-400 px-1 rounded line-through">
                john@acme.com
              </span>
            </p>
          </div>
        </div>
        {/* Redacted message */}
        <div>
          <p className="text-[9px] font-medium text-zinc-400 mb-1.5">
            Sent to AI
          </p>
          <div className="rounded-lg bg-white/5 border border-emerald-500/20 px-3 py-2">
            <p className="text-[10px] text-zinc-300 leading-relaxed">
              My API key is{" "}
              <span className="bg-emerald-500/20 text-emerald-400 px-1 rounded font-mono">
                [API_KEY]
              </span>{" "}
              and my email is{" "}
              <span className="bg-emerald-500/20 text-emerald-400 px-1 rounded font-mono">
                [EMAIL]
              </span>
            </p>
          </div>
        </div>
        {/* Redaction banner */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
          <ShieldAlert className="w-3 h-3 text-amber-500" />
          <span className="text-[9px] font-medium text-amber-400">
            2 items redacted
          </span>
          <span className="text-[8px] text-amber-500/60 ml-1">
            API_KEY, EMAIL
          </span>
        </div>
      </div>
    </div>
  );
}

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
      <DarkSection className="rounded-none py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 max-w-xl">
              <SectionLabel dark>AI Chat</SectionLabel>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-white">
                AI Chat That Protects Your Data
              </h1>
              <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
                A built-in AI chat for your team. Every message is scanned by
                DLP rules. Upload files, compare models, save important
                responses — all with your own API keys.
              </p>
              <Link href="/signup" className="mt-8 inline-block">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 rounded-full font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <ChatMockup />
            </div>
          </div>
        </div>
      </DarkSection>

      {/* ── Section 1: Multi-Model Support ───────────────── */}
      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <SectionLabel>Flexible AI</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Connect Any AI Provider
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Use OpenAI GPT-4o, Anthropic Claude, or Google Gemini. Switch
              models per conversation. Compare responses side-by-side.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="Multiple Providers"
              description="Connect OpenAI, Anthropic, and Google with your own API keys."
            />
            <FeatureCard
              icon={RefreshCw}
              title="Model Switching"
              description="Change models mid-conversation without losing context."
            />
            <FeatureCard
              icon={Sparkles}
              title="Compare Mode"
              description="Send the same prompt to two models side-by-side."
              badge="New"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: DLP & Smart Redaction ─────────────── */}
      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <DarkSection gradient="right">
            <div className="max-w-2xl mb-12">
              <SectionLabel dark>Security</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Every Message Protected by DLP
              </h2>
              <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
                The same security rules that protect your browser extension
                protect your chat. Block, warn, or automatically redact
                sensitive data.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mb-10">
              <FeatureCard
                icon={ScanSearch}
                title="Real-Time Scanning"
                description="Every message scanned before it reaches the AI."
                className="border-white/10 bg-white/5 text-white [&_h3]:text-white [&_p]:text-zinc-400"
                iconBg="bg-white/10"
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Smart Redaction"
                description="Sensitive data auto-replaced with [API_KEY], [EMAIL], [PII] placeholders."
                className="border-white/10 bg-white/5 text-white [&_h3]:text-white [&_p]:text-zinc-400"
                iconBg="bg-white/10"
              />
              <FeatureCard
                icon={FileUp}
                title="File Upload Scanning"
                description="PDFs, docs, code files scanned by DLP before text extraction."
                className="border-white/10 bg-white/5 text-white [&_h3]:text-white [&_p]:text-zinc-400"
                iconBg="bg-white/10"
              />
            </div>
            <div className="max-w-md mx-auto">
              <RedactionMockup />
            </div>
          </DarkSection>
        </div>
      </div>

      {/* ── Section 3: Conversation Organization ─────────── */}
      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <SectionLabel>Organized</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Never Lose an Important Conversation
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Collections, favorites, search, and a smart timeline that tracks
              every topic change.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={FolderOpen}
              title="Collections"
              description="Group conversations with color-coded labels."
            />
            <FeatureCard
              icon={Star}
              title="Favorites"
              description="Star important conversations to the top."
            />
            <FeatureCard
              icon={Zap}
              title="Conversation Outline"
              description="Auto-detected timeline: code, links, files, topic changes."
            />
            <FeatureCard
              icon={Bookmark}
              title="Saved Items"
              description="Bookmark any AI response to your personal knowledge base."
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Admin Intelligence ────────────────── */}
      <div className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <SectionLabel>Admin Power</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Real Data, Real Insights
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Admin slash commands query your actual database. See team
              activity, DLP violations, usage analytics, and audit trails — all
              from the chat.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={Users}
              title="/activity"
              description="Team AI usage summary with active users, tools, and trends."
            />
            <FeatureCard
              icon={ShieldAlert}
              title="/violations"
              description="DLP violation report with categories, repeat offenders, and severity."
            />
            <FeatureCard
              icon={Terminal}
              title="/usage"
              description="Prompt adoption metrics, unused prompts, weekly trends."
            />
            <FeatureCard
              icon={Shield}
              title="/audit"
              description="Searchable audit trail of all AI interactions."
            />
          </div>
        </div>
      </div>

      {/* ── Section 5: Productivity Features ─────────────── */}
      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <SectionLabel>Productive</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for Speed
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={Keyboard}
              title="Keyboard Shortcuts"
              description="Ctrl+N for new chat, / for commands, double-click to rename."
            />
            <FeatureCard
              icon={Upload}
              title="Drag & Drop Files"
              description="Drop files anywhere on the chat to upload and analyze."
            />
            <FeatureCard
              icon={ThumbsUp}
              title="Response Rating"
              description="Thumbs up/down on AI responses to track quality."
            />
          </div>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={faqs} />
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Ready to give your team"
            gradientText="a secure AI chat?"
            subtitle="Create a free workspace in under two minutes. No credit card required."
            buttonText="Start Free Trial"
          />
        </div>
      </div>
    </>
  );
}
