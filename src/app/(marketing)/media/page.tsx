import type { Metadata } from "next";
import Image from "next/image";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = generatePageMetadata({
  title: "Media Kit & Brand Assets",
  description:
    "Download TeamPrompt logos, brand colors, and media assets for press, partnerships, and integrations.",
  path: "/media",
});

const logos = [
  {
    label: "Icon — Light",
    file: "/brand/logo-icon.svg",
    bg: "bg-white",
    desc: "For light backgrounds",
  },
  {
    label: "Icon — Dark",
    file: "/brand/logo-icon-dark.svg",
    bg: "bg-zinc-900",
    desc: "For dark backgrounds",
  },
  {
    label: "Wordmark — Light",
    file: "/brand/logo-wordmark.svg",
    bg: "bg-white",
    desc: "Full logo for light backgrounds",
    wide: true,
  },
  {
    label: "Wordmark — Dark",
    file: "/brand/logo-wordmark-dark.svg",
    bg: "bg-zinc-900",
    desc: "Full logo for dark backgrounds",
    wide: true,
  },
  {
    label: "Wordmark — White",
    file: "/brand/logo-wordmark-white.svg",
    bg: "bg-zinc-900",
    desc: "White text on dark or colored backgrounds",
    wide: true,
  },
];

const brandColors = [
  {
    name: "Primary Blue",
    hex: "#2563EB",
    hsl: "221 83% 53%",
    usage: "Primary brand color, buttons, links",
  },
  {
    name: "Light Blue",
    hex: "#60A5FA",
    hsl: "217 92% 76%",
    usage: "Dark mode accent, hover states",
  },
  {
    name: "Dark Background",
    hex: "#0F1117",
    hsl: "222 22% 7%",
    usage: "Dark sections, email headers",
  },
  {
    name: "Zinc 950",
    hex: "#09090B",
    hsl: "240 10% 4%",
    usage: "Hero sections, footer",
  },
  {
    name: "White",
    hex: "#FFFFFF",
    hsl: "0 0% 100%",
    usage: "Light backgrounds, text on dark",
  },
  {
    name: "Zinc 100",
    hex: "#F4F4F5",
    hsl: "240 5% 96%",
    usage: "Page backgrounds, email body",
  },
];

const typography = [
  {
    name: "Primary Font",
    value: "Inter / System UI",
    desc: "Used across the web app, marketing pages, and emails. Falls back to system font stack: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto.",
  },
  {
    name: "Monospace",
    value: "JetBrains Mono / System Mono",
    desc: "Used for code blocks, pattern examples, and technical content.",
  },
];

export default function MediaPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <SectionLabel>Brand</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Media Kit & Brand Assets
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Everything you need to reference TeamPrompt in press, partnerships,
            and integrations. Download logos, get brand colors, and follow our
            usage guidelines.
          </p>
        </div>

        {/* ── Logos ──────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Logos
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Use the icon when space is limited. Use the wordmark when the
            TeamPrompt name needs to be visible. Always maintain clear space
            around the logo.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {logos.map((logo) => (
              <div
                key={logo.label}
                className={`group rounded-2xl border border-border overflow-hidden ${
                  logo.wide ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div
                  className={`${logo.bg} flex items-center justify-center p-8 min-h-[140px]`}
                >
                  <Image
                    src={logo.file}
                    alt={logo.label}
                    width={logo.wide ? 220 : 80}
                    height={logo.wide ? 40 : 80}
                    className="max-h-16"
                  />
                </div>
                <div className="p-4 bg-card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{logo.label}</p>
                    <p className="text-xs text-muted-foreground">{logo.desc}</p>
                  </div>
                  <a
                    href={logo.file}
                    download
                    className="shrink-0"
                  >
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      SVG
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold mb-2">Usage Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>
                Do not alter, rotate, or distort the logo
              </li>
              <li>
                Maintain a minimum clear space equal to the height of the &quot;T&quot;
                icon around the logo
              </li>
              <li>
                Do not place the light logo on a light background or the dark
                logo on a dark background
              </li>
              <li>
                Do not add effects like shadows, gradients, or outlines to the
                logo
              </li>
              <li>
                The logo icon can be used independently; do not use the wordmark
                text without the icon
              </li>
            </ul>
          </div>
        </section>

        {/* ── Colors ──────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Brand Colors
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Our palette is built around a bold blue primary with neutral zinc
            tones. Use the primary blue sparingly for emphasis — most UI should
            use the neutral scale.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandColors.map((color) => (
              <div
                key={color.name}
                className="rounded-2xl border border-border overflow-hidden group"
              >
                <div
                  className="h-24"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="p-4 bg-card">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{color.name}</p>
                    <code className="text-xs font-mono text-muted-foreground">
                      {color.hex}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ──────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Typography
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            We use system fonts for performance and consistency across platforms.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {typography.map((font) => (
              <div
                key={font.name}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  {font.name}
                </p>
                <p
                  className={`text-2xl font-bold mb-3 ${
                    font.name === "Monospace" ? "font-mono" : ""
                  }`}
                >
                  {font.value}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {font.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Product Screenshots ──────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Product Name & Description
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            When referencing TeamPrompt in writing, use the following.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Product Name
              </p>
              <p className="text-lg font-bold">TeamPrompt</p>
              <p className="text-sm text-muted-foreground mt-2">
                One word, capital T and P. Never &quot;Team Prompt&quot;, &quot;team
                prompt&quot;, or &quot;TEAMPROMPT&quot;.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Short Description
              </p>
              <p className="text-lg font-semibold">
                AI prompt management for teams
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Use this as the one-line description in press, app stores, and
                partner listings.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 sm:col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Boilerplate
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                TeamPrompt is a prompt management platform that gives teams a
                shared library, quality guidelines, and security guardrails for
                AI. It works with ChatGPT, Claude, Gemini, Copilot, and
                Perplexity through a browser extension, and helps organizations
                across healthcare, legal, finance, government, and technology
                manage how their teams use AI tools.
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact ──────────────────────────── */}
        <section>
          <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-2">Need something else?</h2>
            <p className="text-muted-foreground text-sm mb-4">
              For press inquiries, custom asset sizes, or partnership materials,
              reach out to our team.
            </p>
            <a href="mailto:support@teamprompt.app">
              <Button variant="outline" className="rounded-full">
                Contact us
              </Button>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
