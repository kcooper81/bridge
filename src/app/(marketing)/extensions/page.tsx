import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq-section";
import {
  ArrowRight,
  Download,
  MessageSquare,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { ExtensionHero } from "./_components/extension-hero";

export const metadata: Metadata = generatePageMetadata({
  title: "Browser Extension — Chrome, Firefox & Edge | TeamPrompt",
  description:
    "Install the TeamPrompt browser extension for Chrome, Firefox, or Edge. Use your team's prompts directly in ChatGPT, Claude, Gemini, and more — with DLP scanning and usage analytics.",
  path: "/extensions",
  keywords: [
    "browser extension",
    "Chrome extension",
    "Firefox extension",
    "Edge extension",
    "AI browser extension",
    "prompt extension",
  ],
});

const features = [
  {
    icon: Search,
    title: "One-Click Prompt Insertion",
    description:
      "Browse or search your team's prompt library from a sidebar panel. Click to insert directly into any supported AI tool — no copy-pasting.",
  },
  {
    icon: Shield,
    title: "DLP Scanning",
    description:
      "Every message is scanned for sensitive data before it leaves your browser. Credit cards, SSNs, API keys, and custom patterns are caught in real-time.",
  },
  {
    icon: MessageSquare,
    title: "Multi-AI Support",
    description:
      "Works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. One extension covers all the AI tools your team uses.",
  },
  {
    icon: Zap,
    title: "Usage Analytics",
    description:
      "Every prompt insertion is logged. Admins see which prompts are used, on which AI tools, and how often — giving visibility into team AI usage.",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Install the extension",
    description: "Add TeamPrompt to your browser from your browser's extension store.",
  },
  {
    step: 2,
    title: "Sign in",
    description:
      "Log in with your TeamPrompt account. The extension syncs your team's prompt library automatically.",
  },
  {
    step: 3,
    title: "Use prompts in any AI tool",
    description:
      "Open ChatGPT, Claude, or any supported tool. Click the TeamPrompt icon to browse and insert prompts.",
  },
  {
    step: 4,
    title: "Stay protected",
    description:
      "DLP scanning runs automatically. Sensitive data is flagged before it reaches the AI model.",
  },
];

const faqs = [
  {
    question: "Which browsers are supported?",
    answer:
      "TeamPrompt is available for Google Chrome, Mozilla Firefox, and Microsoft Edge. All Chromium-based browsers (Brave, Arc, Vivaldi) can use the Chrome Web Store version.",
  },
  {
    question: "Which AI tools does the extension work with?",
    answer:
      "The extension works with ChatGPT, Claude, Google Gemini, Microsoft Copilot, and Perplexity. We're continually adding support for more tools.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. The extension runs locally in your browser. DLP scanning happens client-side before any data is sent to the AI tool. Prompts are synced from your TeamPrompt workspace over HTTPS.",
  },
  {
    question: "Do I need a TeamPrompt account?",
    answer:
      "Yes, you need a free or paid TeamPrompt account. The extension uses your account to sync your team's prompt library, guardrails, and preferences.",
  },
  {
    question: "Can I use the extension without the web dashboard?",
    answer:
      "The extension works alongside the web dashboard. Admins manage prompts and settings on the dashboard, and team members access them through the extension in their browser.",
  },
];

const browsers = [
  {
    name: "Chrome",
    storeName: "Chrome Web Store",
    url: "https://chromewebstore.google.com/detail/teamprompt",
    note: "Also works with Brave, Arc, and Vivaldi",
    color: "from-yellow-500/20 to-green-500/10",
    borderColor: "border-yellow-500/20",
    iconColor: "text-yellow-500",
  },
  {
    name: "Firefox",
    storeName: "Firefox Add-ons",
    url: "https://addons.mozilla.org/en-US/firefox/addon/teamprompt/",
    note: "Full feature support on Firefox",
    color: "from-orange-500/20 to-red-500/10",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-500",
  },
  {
    name: "Edge",
    storeName: "Edge Add-ons",
    url: "https://microsoftedge.microsoft.com/addons/detail/teamprompt",
    note: "Native Edge integration",
    color: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
  },
];

export default function ExtensionsPage() {
  return (
    <>
      {/* Hero — client component for browser detection */}
      <ExtensionHero />

      {/* Browser store cards */}
      <section id="browsers" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <SectionLabel>Available For</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Install for your browser
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              TeamPrompt is available on all major browsers. Pick yours below.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {browsers.map((b) => (
              <a
                key={b.name}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg ${b.borderColor} hover:border-primary/30`}
              >
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${b.color}`}
                    >
                      <Download className={`h-6 w-6 ${b.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{b.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {b.storeName}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {b.note}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
                    Install
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel className="text-center">Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything your team needs in the browser
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

      {/* How It Works */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel className="text-center">How It Works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} />

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Your team uses AI every day."
            gradientText="Give them the right prompts."
            subtitle="Install the extension and start using your shared prompt library across every AI tool in minutes."
          />
        </div>
      </section>
    </>
  );
}
