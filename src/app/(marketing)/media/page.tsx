import type { Metadata } from "next";
import Image from "next/image";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";
import { Download, Chrome, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkSection } from "@/components/marketing/dark-section";
import { CopyButton } from "./_components/copy-button";
import { BannerDownloadWrapper } from "./_components/banner-download";
import { DownloadAllButton } from "./_components/download-all-button";
import {
  TwitterBanner,
  TwitterBannerWhite,
  TwitterBannerGradient,
  TwitterBannerLifestyle,
  LinkedInBanner,
  LinkedInBannerWhite,
  LinkedInBannerGradient,
  LinkedInBannerLifestyle,
  FacebookCover,
  FacebookCoverWhite,
  FacebookCoverGradient,
  FacebookCoverLifestyle,
  YouTubeBanner,
  YouTubeBannerGradient,
  YouTubeBannerLifestyle,
  OGBanner,
  OGBannerWhite,
  OGBannerGradient,
  OGBannerLifestyle,
  ExtensionScreenshotDark,
  ExtensionScreenshotWhite,
  ExtensionScreenshotGradient,
  ExtensionScreenshotLifestyle1,
  ExtensionScreenshotLifestyle2,
  ExtensionScreenshotLifestyle3,
  ExtensionScreenshotLifestyle4,
  ExtensionScreenshotLifestyle5,
  ExtensionMarqueeLifestyle1,
  ExtensionMarqueeLifestyle2,
  ExtensionMarqueeLifestyle3,
  ExtensionSmallPromoLifestyle,
  ChromeScreenshot1,
  ChromeScreenshot2,
  ChromeScreenshot3,
  ChromeScreenshot4,
  ChromeScreenshot5,
  ProScreenshot1,
  ProScreenshot2,
  ProScreenshot3,
  ProScreenshot4,
  ProScreenshot5,
  ProMarquee1,
  ProMarquee2,
  ProMarquee3,
  ProSmallPromo,
} from "./_components/social-banners";

export const metadata: Metadata = generatePageMetadata({
  title: "Media Kit & Brand Assets",
  description:
    "Download TeamPrompt logos, brand colors, extension marketplace assets, and media resources for press, partnerships, and store submissions.",
  path: "/media",
  keywords: ["brand assets", "press kit", "media resources"],
});

const logos = [
  {
    label: "Icon — Light",
    file: "/brand/logo-icon.svg",
    bg: "bg-white",
    desc: "Dark logo for light backgrounds",
  },
  {
    label: "Icon — Dark",
    file: "/brand/logo-icon-dark.svg",
    bg: "bg-zinc-900",
    desc: "White logo for dark backgrounds",
  },
  {
    label: "Icon — Blue",
    file: "/brand/logo-icon-blue.svg",
    bg: "bg-zinc-100",
    desc: "White on blue — social media, extensions",
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

const storeScreenshots = [
  { file: "/store-assets/screenshot-1-login.png", label: "Sign-in screen", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-2-prompt-list.png", label: "Prompt library", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-3-insert.png", label: "Insert into AI tool", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-4-template.png", label: "Template variables", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-5-sidepanel.png", label: "Side panel view", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-6-dlp-block.png", label: "DLP block — sensitive data detected", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-7-warning.png", label: "Warning banner notification", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-8-session-loss.png", label: "Session loss protection banner", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-9-admin-dashboard.png", label: "Admin dashboard — protection coverage", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-10-admin-users.png", label: "Admin users — protection status", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-11-multi-ai.png", label: "Multi-AI tool support", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-12-dlp-rules.png", label: "DLP rules configuration", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-13-activity-log.png", label: "Activity & conversation audit log", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-light-1-prompts.png", label: "Prompt library (light mode)", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-light-2-dashboard.png", label: "Admin dashboard (light mode)", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-light-3-dlp-block.png", label: "DLP block on ChatGPT (light mode)", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-light-4-popup.png", label: "Extension popup — prompt list (light mode)", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-light-5-template.png", label: "Template variables (light mode)", dims: "1280 x 800" },
  { file: "/store-assets/screenshot-light-6-insert.png", label: "Insert prompt into ChatGPT (light mode)", dims: "1280 x 800" },
];

const storePromos = [
  { file: "/store-assets/promo-small.png", label: "Small promo tile", dims: "440 x 280" },
  { file: "/store-assets/promo-marquee.png", label: "Marquee promo banner", dims: "1400 x 560" },
  { file: "/store-assets/social-hero.png", label: "Social / OG hero banner", dims: "1200 x 630" },
  { file: "/store-assets/promo-dlp.png", label: "DLP feature hero banner", dims: "1400 x 560" },
];

const socialMediaAssets = [
  {
    platform: "X (Twitter)",
    banners: [
      { Component: TwitterBanner, variant: "Dark", downloadFile: "/store-assets/twitter-banner.png" },
      { Component: TwitterBannerWhite, variant: "White", downloadFile: null },
      { Component: TwitterBannerGradient, variant: "Gradient", downloadFile: null },
      { Component: TwitterBannerLifestyle, variant: "Lifestyle", downloadFile: null },
    ],
    assets: [
      { file: "/store-assets/social-profile-400.png", label: "Profile picture", dims: "400 x 400" },
      { file: "/store-assets/twitter-banner.png", label: "Header banner", dims: "1500 x 500" },
    ],
  },
  {
    platform: "LinkedIn",
    banners: [
      { Component: LinkedInBanner, variant: "Dark", downloadFile: "/store-assets/linkedin-banner.png" },
      { Component: LinkedInBannerWhite, variant: "White", downloadFile: null },
      { Component: LinkedInBannerGradient, variant: "Gradient", downloadFile: null },
      { Component: LinkedInBannerLifestyle, variant: "Lifestyle", downloadFile: null },
    ],
    assets: [
      { file: "/store-assets/social-profile-400.png", label: "Profile picture", dims: "400 x 400" },
      { file: "/store-assets/social-profile-300.png", label: "Company logo", dims: "300 x 300" },
      { file: "/store-assets/linkedin-banner.png", label: "Cover banner", dims: "1584 x 396" },
    ],
  },
  {
    platform: "Facebook",
    banners: [
      { Component: FacebookCover, variant: "Dark", downloadFile: "/store-assets/facebook-cover.png" },
      { Component: FacebookCoverWhite, variant: "White", downloadFile: null },
      { Component: FacebookCoverGradient, variant: "Gradient", downloadFile: null },
      { Component: FacebookCoverLifestyle, variant: "Lifestyle", downloadFile: null },
    ],
    assets: [
      { file: "/store-assets/social-profile-800.png", label: "Profile picture", dims: "720 x 720 (use 800px)" },
      { file: "/store-assets/facebook-cover.png", label: "Cover photo", dims: "851 x 315" },
    ],
  },
  {
    platform: "YouTube",
    banners: [
      { Component: YouTubeBanner, variant: "Dark", downloadFile: "/store-assets/youtube-channel-art.png" },
      { Component: YouTubeBannerGradient, variant: "Gradient", downloadFile: null },
      { Component: YouTubeBannerLifestyle, variant: "Lifestyle", downloadFile: null },
    ],
    assets: [
      { file: "/store-assets/social-profile-800.png", label: "Profile picture", dims: "800 x 800" },
      { file: "/store-assets/youtube-channel-art.png", label: "Channel art / banner", dims: "2560 x 1440" },
    ],
  },
  {
    platform: "Instagram",
    banners: [],
    assets: [
      { file: "/store-assets/social-profile-800.png", label: "Profile picture", dims: "720 x 720 (use 800px)" },
    ],
  },
];

const stores = [
  {
    name: "Chrome Web Store",
    icon: Chrome,
    category: "Productivity",
    assets: [
      { name: "Store Icon", dims: "128 x 128", format: "PNG", required: true, file: "/store-assets/store-icon-128.png" },
      { name: "Small Promo Tile", dims: "440 x 280", format: "PNG", required: true, file: "/store-assets/promo-small.png" },
      { name: "Marquee Promo", dims: "1400 x 560", format: "PNG", required: false, file: "/store-assets/promo-marquee.png" },
      { name: "Screenshots", dims: "1280 x 800", format: "PNG", required: true, note: "Min 1, max 5" },
    ],
  },
  {
    name: "Firefox Add-ons",
    icon: Globe,
    category: "Productivity > Workflow & Planning",
    assets: [
      { name: "Extension Icon", dims: "128 x 128", format: "PNG", required: true, file: "/store-assets/store-icon-128.png" },
      { name: "Screenshots", dims: "1280 x 800 (recommended)", format: "PNG/JPEG", required: false, note: "Optional, no hard limit" },
    ],
  },
  {
    name: "Edge Add-ons",
    icon: Globe,
    category: "Productivity",
    assets: [
      { name: "Store Logo", dims: "300 x 300", format: "PNG", required: true, file: "/store-assets/edge-store-icon-300.png" },
      { name: "Small Promo Tile", dims: "440 x 280", format: "PNG", required: false, file: "/store-assets/promo-small.png" },
      { name: "Large Promo", dims: "1400 x 560", format: "PNG", required: false, file: "/store-assets/promo-marquee.png" },
      { name: "Screenshots", dims: "1280 x 800 or 640 x 480", format: "PNG/JPEG", required: true, note: "Min 1, max 10" },
    ],
  },
];

const storeListing = {
  name: "TeamPrompt — AI Prompt Manager & DLP Shield",
  firefoxName: "TeamPrompt — AI Prompt Manager & DLP Shield",
  shortDescription:
    "Access your team's approved AI prompt library, scan for sensitive data, and log conversations — right inside ChatGPT, Claude & more.",
  fullDescription: `TeamPrompt is the prompt management platform for teams that use AI every day.

Instead of sharing prompts in Slack threads, Google Docs, or spreadsheets, your team gets a centralized library that works everywhere — right inside ChatGPT, Claude, Gemini, Copilot, and Perplexity.

Key features:
• Shared Prompt Library — Browse, search, and insert team prompts in one click
• Template Variables — Fill in dynamic fields like {{client_name}} before inserting
• Data Protection — Automatically scan outbound text for sensitive data (SSNs, API keys, patient records, financial data)
• Quality Guidelines — Set organization-wide standards for prompt quality and consistency
• Usage Analytics — See which prompts get used, by whom, and where
• Side Panel & Popup — Access prompts from a persistent side panel or quick popup overlay
• Works Everywhere — ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity

Built for healthcare, legal, finance, government, and technology teams that need data protection around AI usage.

Free plan available. No credit card required.`,
  singlePurpose:
    "Access a shared team prompt library and scan outbound AI messages for sensitive data.",
  privacyPolicyUrl: "https://teamprompt.app/privacy",
  homepageUrl: "https://teamprompt.app",
  supportUrl: "https://teamprompt.app/help",
  supportEmail: "support@teamprompt.app",
  firefoxTags: ["productivity", "privacy-and-security", "search-tools"],
  license: "Proprietary",
  reviewerTestInstructions: `1. Install the extension and click the TeamPrompt icon in the toolbar
2. Click "Create Free Account" and sign up with any email
3. After signing in, you'll see the prompt library with sample prompts
4. Navigate to chatgpt.com — the extension detects the AI tool automatically
5. Click any prompt to preview it, then click "Insert" to paste it into the chat input
6. Try a template prompt — fill in the variable fields, then insert
7. Open the side panel (right-click extension icon → "Open side panel") for persistent access
8. To test DLP: type a fake SSN (e.g., 123-45-6789) into the AI chat — the extension will flag it`,
  permissions: [
    { perm: "storage", reason: "Store authentication tokens and user preferences locally" },
    { perm: "activeTab", reason: "Read the current tab URL to detect which AI tool is active" },
    { perm: "alarms", reason: "Periodically refresh authentication tokens in the background" },
    { perm: "sidePanel", reason: "Provide a persistent side panel UI for browsing prompts (Chrome/Edge)" },
  ],
  hostPermissions: [
    { host: "chatgpt.com, chat.openai.com", reason: "Inject prompts and DLP scan outbound text" },
    { host: "claude.ai", reason: "Inject prompts and DLP scan outbound text" },
    { host: "gemini.google.com", reason: "Inject prompts and DLP scan outbound text" },
    { host: "copilot.microsoft.com", reason: "Inject prompts and DLP scan outbound text" },
    { host: "perplexity.ai", reason: "Inject prompts and DLP scan outbound text" },
    { host: "teamprompt.app", reason: "Sync authentication session from web app" },
  ],
};

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
            and integrations. Download logos, get brand colors, and access
            extension marketplace assets for store submissions.
          </p>
        </div>

        {/* ── 1. Logos ──────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Logos
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Use the icon when space is limited. Use the wordmark when the
            TeamPrompt name needs to be visible. Always maintain clear space
            around the logo.
          </p>

          <div className="flex justify-end mb-4">
            <DownloadAllButton
              files={logos.map((l) => ({
                url: l.file,
                filename: l.file.split("/").pop()!,
              }))}
              zipName="teamprompt-logos"
            />
          </div>

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

        {/* ── 2. Colors ──────────────────────────── */}
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

        {/* ── 3. Typography ──────────────────────────── */}
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

        {/* ── 4. Product Name & Description ──────────────────────────── */}
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
                shared library, quality guidelines, and data protection for
                AI. It works with ChatGPT, Claude, Gemini, Copilot, and
                Perplexity through a browser extension, and helps organizations
                across healthcare, legal, finance, government, and technology
                manage how their teams use AI tools.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Social Media Banners (moved up — brand asset) ──────── */}
        <section className="mb-24">
          <SectionLabel>Social</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Social Media Banners
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Visually rich banners for every major platform. Each preview shows
            the live CSS-rendered banner — download the original PNGs below for
            upload.
          </p>

          <div className="space-y-12">
            {socialMediaAssets.map((platform) => (
              <div key={platform.platform}>
                <h3 className="text-lg font-semibold mb-4">{platform.platform}</h3>

                {/* Rendered banner previews — every variant is downloadable */}
                {platform.banners.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {platform.banners.map((banner) => (
                      <div key={banner.variant}>
                        <p className="text-xs text-muted-foreground font-medium mb-1.5">
                          {banner.variant} variant
                        </p>
                        <BannerDownloadWrapper
                          filename={`teamprompt-${platform.platform.toLowerCase().replace(/[^a-z]/g, "")}-${banner.variant.toLowerCase()}`}
                        >
                          <banner.Component />
                        </BannerDownloadWrapper>
                      </div>
                    ))}
                  </div>
                )}

                {/* Downloadable assets grid */}
                {platform.assets.length > 1 && (
                  <div className="flex justify-end mb-3">
                    <DownloadAllButton
                      files={platform.assets.map((a) => ({
                        url: a.file,
                        filename: a.file.split("/").pop()!,
                      }))}
                      zipName={`teamprompt-${platform.platform.toLowerCase().replace(/[^a-z]/g, "")}-assets`}
                      label="Download All Assets"
                    />
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {platform.assets.map((asset) => (
                    <div
                      key={asset.file}
                      className="rounded-xl border border-border overflow-hidden"
                    >
                      <Image
                        src={asset.file}
                        alt={`${platform.platform} ${asset.label}`}
                        width={640}
                        height={400}
                        className="w-full h-auto"
                      />
                      <div className="p-3 bg-card flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">{asset.label}</p>
                          <p className="text-xs text-muted-foreground">{asset.dims} px</p>
                        </div>
                        <a href={asset.file} download>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            <Download className="h-3 w-3" /> PNG
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. OG / Social Share Card ──────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            OG / Social Share Card
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            The default Open Graph image used when sharing any TeamPrompt page on social media.
          </p>
          <div className="space-y-3">
            {[
              { label: "Dark", Component: OGBanner, name: "og-dark" },
              { label: "White", Component: OGBannerWhite, name: "og-white" },
              { label: "Gradient", Component: OGBannerGradient, name: "og-gradient" },
              { label: "Lifestyle", Component: OGBannerLifestyle, name: "og-lifestyle" },
            ].map((variant) => (
              <div key={variant.name}>
                <p className="text-xs text-muted-foreground font-medium mb-1.5">
                  {variant.label} variant
                </p>
                <BannerDownloadWrapper filename={`teamprompt-${variant.name}`}>
                  <variant.Component />
                </BannerDownloadWrapper>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Extension Marketplace Assets (dark) ────────────────── */}
        <DarkSection gradient="right" className="mb-24">
          <SectionLabel dark>Extension</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Extension Marketplace Media
          </h2>
          <p className="text-zinc-400 mb-10 max-w-2xl">
            Store-ready assets, screenshots, and listing copy for Chrome Web Store,
            Firefox Add-ons, and Edge Add-ons submissions.
          </p>

          {/* Per-store asset checklists */}
          <div className="grid gap-4 sm:grid-cols-3 mb-12">
            {stores.map((store) => (
              <div
                key={store.name}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <store.icon className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold">{store.name}</h3>
                </div>
                <p className="text-[11px] text-zinc-500 mb-3">Category: {store.category}</p>
                <ul className="space-y-2">
                  {store.assets.map((asset) => (
                    <li key={asset.name} className="flex items-start gap-2 text-xs">
                      <span className={`shrink-0 mt-0.5 ${asset.required ? "text-blue-400" : "text-zinc-600"}`}>
                        {asset.required ? "\u2713" : "\u25CB"}
                      </span>
                      <div>
                        <span className="text-zinc-200 font-medium">{asset.name}</span>
                        <span className="text-zinc-500 ml-1">
                          {asset.dims} {asset.format}
                        </span>
                        {asset.note && (
                          <span className="text-zinc-500 block">{asset.note}</span>
                        )}
                        <span className={`text-[10px] uppercase tracking-wider ml-1 ${asset.required ? "text-blue-400/80" : "text-zinc-600"}`}>
                          {asset.required ? "Required" : "Optional"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Store icons */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Store Icons</h3>
              <DownloadAllButton
                files={[
                  { url: "/store-assets/store-icon-128.png", filename: "store-icon-128.png" },
                  { url: "/store-assets/edge-store-icon-300.png", filename: "edge-store-icon-300.png" },
                ]}
                zipName="teamprompt-store-icons"
                dark
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <Image
                  src="/store-assets/store-icon-128.png"
                  alt="Store icon 128x128"
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
                <div>
                  <p className="text-sm font-medium">128 &times; 128 px</p>
                  <p className="text-xs text-zinc-500">Chrome Web Store & Firefox</p>
                  <a href="/store-assets/store-icon-128.png" download className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </div>
              <div className="inline-flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <Image
                  src="/store-assets/edge-store-icon-300.png"
                  alt="Edge store icon 300x300"
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
                <div>
                  <p className="text-sm font-medium">300 &times; 300 px</p>
                  <p className="text-xs text-zinc-500">Edge Add-ons (required size)</p>
                  <a href="/store-assets/edge-store-icon-300.png" download className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Promo images */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Promotional Images</h3>
              <DownloadAllButton
                files={storePromos.map((p) => ({
                  url: p.file,
                  filename: p.file.split("/").pop()!,
                }))}
                zipName="teamprompt-promo-images"
                dark
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {storePromos.map((promo) => (
                <div key={promo.file} className="rounded-xl border border-zinc-800 overflow-hidden">
                  <Image
                    src={promo.file}
                    alt={promo.label}
                    width={700}
                    height={280}
                    className="w-full h-auto"
                  />
                  <div className="p-3 bg-zinc-900/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{promo.label}</p>
                      <p className="text-xs text-zinc-500">{promo.dims} px</p>
                    </div>
                    <a href={promo.file} download>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-zinc-300 hover:text-white">
                        <Download className="h-3 w-3" />
                        PNG
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chrome Web Store Screenshots — Loom-style */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-2">Chrome Web Store Screenshots</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Clean, Loom-style marketing screenshots — one bold headline per slide with a large product mockup.
              Recommended for Chrome Web Store (max 5). Three color palettes to choose from.
            </p>

            {/* Palette A — Ocean */}
            <h4 className="text-sm font-medium text-zinc-300 mb-3 mt-6">Palette A — Ocean</h4>
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {([
                { Component: ChromeScreenshot1, variant: "Prompt Library", name: "chrome-a1-prompts", gradient: "blue" as const },
                { Component: ChromeScreenshot2, variant: "Data Protection", name: "chrome-a2-dlp", gradient: "indigo" as const },
                { Component: ChromeScreenshot3, variant: "One-Click Insert", name: "chrome-a3-insert", gradient: "emerald" as const },
                { Component: ChromeScreenshot4, variant: "Analytics", name: "chrome-a4-analytics", gradient: "violet" as const },
                { Component: ChromeScreenshot5, variant: "Multi-AI Support", name: "chrome-a5-multi-ai", gradient: "slate" as const },
              ]).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1280}>
                    <b.Component gradient={b.gradient} />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1280 &times; 800 px</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Palette B — Sunset */}
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Palette B — Sunset</h4>
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {([
                { Component: ChromeScreenshot1, variant: "Prompt Library", name: "chrome-b1-prompts", gradient: "sky" as const },
                { Component: ChromeScreenshot2, variant: "Data Protection", name: "chrome-b2-dlp", gradient: "rose" as const },
                { Component: ChromeScreenshot3, variant: "One-Click Insert", name: "chrome-b3-insert", gradient: "teal" as const },
                { Component: ChromeScreenshot4, variant: "Analytics", name: "chrome-b4-analytics", gradient: "amber" as const },
                { Component: ChromeScreenshot5, variant: "Multi-AI Support", name: "chrome-b5-multi-ai", gradient: "violet" as const },
              ]).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1280}>
                    <b.Component gradient={b.gradient} />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1280 &times; 800 px</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Palette C — Midnight */}
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Palette C — Midnight</h4>
            <div className="grid gap-4 sm:grid-cols-2 mb-10">
              {([
                { Component: ChromeScreenshot1, variant: "Prompt Library", name: "chrome-c1-prompts", gradient: "slate" as const },
                { Component: ChromeScreenshot2, variant: "Data Protection", name: "chrome-c2-dlp", gradient: "blue" as const },
                { Component: ChromeScreenshot3, variant: "One-Click Insert", name: "chrome-c3-insert", gradient: "cyan" as const },
                { Component: ChromeScreenshot4, variant: "Analytics", name: "chrome-c4-analytics", gradient: "indigo" as const },
                { Component: ChromeScreenshot5, variant: "Multi-AI Support", name: "chrome-c5-multi-ai", gradient: "emerald" as const },
              ]).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1280}>
                    <b.Component gradient={b.gradient} />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1280 &times; 800 px</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Palette D — Professional (Light) */}
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Palette D — Professional (Light)</h4>
            <p className="text-[10px] text-zinc-500 mb-4">
              White background with subtle accent glow and dot pattern. Inspired by Loom &amp; Viitor Translate.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {([
                { Component: ProScreenshot1, variant: "Prompt Library", name: "chrome-d1-prompts", accent: "blue" as const },
                { Component: ProScreenshot2, variant: "Data Protection", name: "chrome-d2-dlp", accent: "rose" as const },
                { Component: ProScreenshot3, variant: "One-Click Insert", name: "chrome-d3-insert", accent: "emerald" as const },
                { Component: ProScreenshot4, variant: "Analytics", name: "chrome-d4-analytics", accent: "violet" as const },
                { Component: ProScreenshot5, variant: "Multi-AI Support", name: "chrome-d5-multi-ai", accent: "teal" as const },
              ]).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1280}>
                    <b.Component accent={b.accent} />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1280 &times; 800 px</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Palette E — Professional (Blue accent) */}
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Palette E — Professional (All Blue)</h4>
            <div className="grid gap-4 sm:grid-cols-2 mb-10">
              {([
                { Component: ProScreenshot1, variant: "Prompt Library", name: "chrome-e1-prompts", accent: "blue" as const },
                { Component: ProScreenshot2, variant: "Data Protection", name: "chrome-e2-dlp", accent: "blue" as const },
                { Component: ProScreenshot3, variant: "One-Click Insert", name: "chrome-e3-insert", accent: "blue" as const },
                { Component: ProScreenshot4, variant: "Analytics", name: "chrome-e4-analytics", accent: "blue" as const },
                { Component: ProScreenshot5, variant: "Multi-AI Support", name: "chrome-e5-multi-ai", accent: "blue" as const },
              ]).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1280}>
                    <b.Component accent={b.accent} />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1280 &times; 800 px</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Store-Ready Banners */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-2">Store-Ready Banners</h3>
            <p className="text-xs text-zinc-400 mb-8">
              CSS-rendered banners sized for extension stores. Each downloads at exact pixel dimensions.
            </p>

            <h4 className="text-sm font-medium text-zinc-300 mb-4">Screenshots — 1280 &times; 800 px</h4>
            <div className="grid gap-4 sm:grid-cols-2 mb-10">
              {([
                { Component: ExtensionScreenshotDark, variant: "Dark", name: "ext-screenshot-dark" },
                { Component: ExtensionScreenshotWhite, variant: "White", name: "ext-screenshot-white" },
                { Component: ExtensionScreenshotGradient, variant: "Gradient", name: "ext-screenshot-gradient" },
                { Component: ExtensionScreenshotLifestyle1, variant: "Lifestyle — Team + Vault", name: "ext-screenshot-lifestyle-1" },
                { Component: ExtensionScreenshotLifestyle2, variant: "Lifestyle — DLP Shield", name: "ext-screenshot-lifestyle-2" },
                { Component: ExtensionScreenshotLifestyle3, variant: "Lifestyle — Insert Flow", name: "ext-screenshot-lifestyle-3" },
                { Component: ExtensionScreenshotLifestyle4, variant: "Lifestyle — Analytics", name: "ext-screenshot-lifestyle-4" },
                { Component: ExtensionScreenshotLifestyle5, variant: "Lifestyle — Multi-AI", name: "ext-screenshot-lifestyle-5" },
              ] as const).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1280}>
                    <b.Component />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1280 &times; 800 px</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-medium text-zinc-300 mb-4">Marquee Promo — 1400 &times; 560 px</h4>
            <p className="text-[10px] text-zinc-500 -mt-3 mb-4">Lifestyle (dark)</p>
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              {([
                { Component: ExtensionMarqueeLifestyle1, variant: "Team + Vault", name: "ext-marquee-lifestyle-1" },
                { Component: ExtensionMarqueeLifestyle2, variant: "DLP Shield", name: "ext-marquee-lifestyle-2" },
                { Component: ExtensionMarqueeLifestyle3, variant: "Insert Flow", name: "ext-marquee-lifestyle-3" },
              ] as const).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1400}>
                    <b.Component />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1400 &times; 560 px</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-zinc-500 mb-4">Professional (light)</p>
            <div className="grid gap-4 sm:grid-cols-2 mb-10">
              {([
                { Component: ProMarquee1, variant: "Prompt Library", name: "pro-marquee-1-prompts", accent: "blue" as const },
                { Component: ProMarquee2, variant: "Data Protection", name: "pro-marquee-2-dlp", accent: "rose" as const },
                { Component: ProMarquee3, variant: "Insert Flow", name: "pro-marquee-3-insert", accent: "emerald" as const },
              ]).map((b) => (
                <div key={b.name}>
                  <BannerDownloadWrapper filename={`teamprompt-${b.name}`} downloadWidth={1400}>
                    <b.Component accent={b.accent} />
                  </BannerDownloadWrapper>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <p className="text-xs font-medium text-zinc-300">{b.variant}</p>
                    <p className="text-[10px] text-zinc-500">1400 &times; 560 px</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-medium text-zinc-300 mb-4">Small Promo Tile — 440 &times; 280 px</h4>
            <div className="flex gap-6 flex-wrap">
              <div className="max-w-sm">
                <p className="text-[10px] text-zinc-500 mb-2">Lifestyle (dark)</p>
                <BannerDownloadWrapper filename="teamprompt-ext-small-promo-lifestyle" downloadWidth={440}>
                  <ExtensionSmallPromoLifestyle />
                </BannerDownloadWrapper>
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <p className="text-xs font-medium text-zinc-300">Lifestyle</p>
                  <p className="text-[10px] text-zinc-500">440 &times; 280 px</p>
                </div>
              </div>
              <div className="max-w-sm">
                <p className="text-[10px] text-zinc-500 mb-2">Professional (light)</p>
                <BannerDownloadWrapper filename="teamprompt-pro-small-promo" downloadWidth={440}>
                  <ProSmallPromo />
                </BannerDownloadWrapper>
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <p className="text-xs font-medium text-zinc-300">Professional</p>
                  <p className="text-[10px] text-zinc-500">440 &times; 280 px</p>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Store Screenshots</h3>
              <DownloadAllButton
                files={storeScreenshots.map((ss) => ({
                  url: ss.file,
                  filename: ss.file.split("/").pop()!,
                }))}
                zipName="teamprompt-store-screenshots"
                dark
              />
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 mb-6 text-xs text-zinc-400 space-y-1">
              <p><strong className="text-zinc-300">Chrome Web Store:</strong> Upload screenshots 1–5 (max 5 allowed)</p>
              <p><strong className="text-zinc-300">Edge Add-ons:</strong> Upload screenshots 1–10 (max 10 allowed)</p>
              <p><strong className="text-zinc-300">Firefox Add-ons:</strong> Optional — upload as many as needed, 1280 x 800 recommended</p>
              <p className="text-zinc-500">All screenshots are 1280 x 800 px PNG. Dark-mode screenshots are listed first (1–13), light-mode variants follow (14–19).</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {storeScreenshots.map((ss, i) => (
                <div key={ss.file} className="rounded-xl border border-zinc-800 overflow-hidden">
                  <Image
                    src={ss.file}
                    alt={ss.label}
                    width={640}
                    height={400}
                    className="w-full h-auto"
                  />
                  <div className="p-3 bg-zinc-900/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{i + 1}. {ss.label}</p>
                      <p className="text-xs text-zinc-500">{ss.dims} px</p>
                    </div>
                    <a href={ss.file} download>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-zinc-300 hover:text-white">
                        <Download className="h-3 w-3" />
                        PNG
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DarkSection>

        {/* ── 8. Store Listing Copy ──────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Store Listing Copy
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Copy-ready text for Chrome Web Store, Firefox Add-ons, and Edge Add-ons submissions.
          </p>

          <div className="space-y-4">
            <CopyableField label="Extension Name (Chrome/Edge)" value={storeListing.name} />
            <CopyableField label="Extension Name (Firefox, 47 chars)" value={storeListing.firefoxName} />
            <CopyableField label="Short Description (132 chars)" value={storeListing.shortDescription} />
            <CopyableField label="Full Description" value={storeListing.fullDescription} />
            <CopyableField label="Single Purpose Statement (Chrome review)" value={storeListing.singlePurpose} />
            <CopyableField label="Reviewer Test Instructions" value={storeListing.reviewerTestInstructions} />
            <CopyableField label="Firefox Tags" value={storeListing.firefoxTags.join(", ")} />
            <CopyableField label="License" value={storeListing.license} />
          </div>

          {/* Permission justifications */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Permission Justifications</h3>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Permission</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {storeListing.permissions.map((p) => (
                    <tr key={p.perm} className="border-b border-border last:border-0">
                      <td className="p-3 font-mono text-xs">{p.perm}</td>
                      <td className="p-3 text-muted-foreground">{p.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Host Permission Justifications</h3>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Host</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {storeListing.hostPermissions.map((h) => (
                    <tr key={h.host} className="border-b border-border last:border-0">
                      <td className="p-3 font-mono text-xs whitespace-nowrap">{h.host}</td>
                      <td className="p-3 text-muted-foreground">{h.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Store URLs & Links */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Store URLs & Links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Homepage URL", value: storeListing.homepageUrl },
                { label: "Privacy Policy URL", value: storeListing.privacyPolicyUrl },
                { label: "Support URL", value: storeListing.supportUrl },
                { label: "Support Email", value: storeListing.supportEmail },
              ].map((link) => (
                <div
                  key={link.label}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                    {link.label}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono truncate mr-3">{link.value}</p>
                    <CopyButton text={link.value} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. Contact ──────────────────────────── */}
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

function CopyableField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
        <CopyButton text={value} />
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}
