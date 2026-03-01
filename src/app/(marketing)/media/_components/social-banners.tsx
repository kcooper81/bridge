import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/* ── Shared sub-components ──────────────────────── */

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] sm:text-[10px] font-medium text-white/90 whitespace-nowrap">
      <Check className="h-2.5 w-2.5 text-blue-400" />
      {label}
    </span>
  );
}

function MiniVaultMockup({ className }: { className?: string }) {
  const categories = [
    { color: "bg-blue-400", label: "Sales outreach", count: 142, width: 85 },
    { color: "bg-emerald-400", label: "Customer support", count: 89, width: 70 },
    { color: "bg-amber-400", label: "Marketing copy", count: 67, width: 60 },
    { color: "bg-purple-400", label: "Legal review", count: 34, width: 50 },
  ];

  return (
    <div
      className={cn(
        "rounded-lg bg-white/[0.07] backdrop-blur-sm border border-white/10 overflow-hidden shadow-2xl",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-white/[0.03]">
        <div className="w-2 h-2 rounded-full bg-red-400/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
        <div className="w-2 h-2 rounded-full bg-green-400/60" />
        <div className="ml-2 flex-1 h-4 rounded-md bg-white/[0.06] flex items-center px-2">
          <span className="text-[6px] text-white/30 font-medium">teamprompt.app/vault</span>
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-14 border-r border-white/10 p-2 space-y-2 bg-white/[0.02]">
          <div className="w-full h-5 rounded bg-blue-500/20 flex items-center justify-center">
            <span className="text-[5px] text-blue-300 font-bold">Vault</span>
          </div>
          <div className="w-full h-4 rounded bg-white/5" />
          <div className="w-full h-4 rounded bg-white/5" />
          <div className="w-full h-4 rounded bg-white/5" />
        </div>
        {/* Prompt rows */}
        <div className="flex-1 p-2 space-y-1.5">
          {categories.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-md bg-white/[0.03] px-1.5 py-1">
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.color)} />
              <div className="flex-1 space-y-0.5">
                <div
                  className="h-1.5 rounded bg-white/15"
                  style={{ width: `${item.width}%` }}
                />
                <div
                  className="h-1 rounded bg-white/[0.06]"
                  style={{ width: `${item.width - 20}%` }}
                />
              </div>
              <div className="h-3.5 w-9 rounded-full bg-blue-400/15 flex items-center justify-center">
                <span className="text-[6px] text-blue-300 font-medium">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoWordmark() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/brand/logo-wordmark-white.svg"
        alt="TeamPrompt"
        width={160}
        height={32}
        className="h-6 sm:h-7 w-auto"
      />
    </div>
  );
}

function Tagline({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-white/80 text-[11px] sm:text-xs font-semibold tracking-wide",
        className
      )}
    >
      Your team&apos;s AI prompt library — with built-in guardrails
    </p>
  );
}

function FeaturePills() {
  return (
    <div className="flex flex-wrap gap-1.5">
      <FeaturePill label="Shared Prompt Vault" />
      <FeaturePill label="DLP Guardrails" />
      <FeaturePill label="Usage Analytics" />
      <FeaturePill label="One-Click Insert" />
    </div>
  );
}

const aiToolLogos = [
  { name: "ChatGPT", initial: "G", color: "bg-emerald-500/20 text-emerald-300" },
  { name: "Claude", initial: "C", color: "bg-amber-500/20 text-amber-300" },
  { name: "Gemini", initial: "G", color: "bg-blue-500/20 text-blue-300" },
  { name: "Copilot", initial: "C", color: "bg-cyan-500/20 text-cyan-300" },
  { name: "Perplexity", initial: "P", color: "bg-purple-500/20 text-purple-300" },
];

function CompatibilityLine({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-white/30 text-[7px] sm:text-[8px] font-medium uppercase tracking-wider">
        Works with
      </span>
      <div className="flex items-center gap-1">
        {aiToolLogos.map((tool) => (
          <div
            key={tool.name}
            className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center",
              tool.color
            )}
            title={tool.name}
          >
            <span className="text-[6px] font-bold">{tool.initial}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Banner shell ───────────────────────────────── */

function BannerShell({
  aspectRatio,
  children,
  className,
}: {
  aspectRatio: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl overflow-hidden bg-[#0F1117]",
        className
      )}
      style={{ aspectRatio }}
    >
      <div className="w-full h-full relative p-4 sm:p-6 flex flex-col justify-between">
        {/* Subtle radial blue glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
}

/* ── Twitter Banner (1500 x 500) ────────────────── */

export function TwitterBanner() {
  return (
    <BannerShell aspectRatio="1500/500">
      <div className="flex items-center h-full gap-6">
        {/* Left content */}
        <div className="flex-1 space-y-3">
          <LogoWordmark />
          <Tagline />
          <FeaturePills />
          <CompatibilityLine />
        </div>
        {/* Right mockup */}
        <div className="hidden sm:block w-1/3">
          <MiniVaultMockup />
        </div>
      </div>
    </BannerShell>
  );
}

/* ── LinkedIn Banner (1584 x 396) ───────────────── */

export function LinkedInBanner() {
  return (
    <BannerShell aspectRatio="1584/396">
      <div className="flex items-center h-full gap-6">
        <div className="flex-1 space-y-2.5">
          <LogoWordmark />
          <Tagline />
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:block w-1/3">
          <MiniVaultMockup />
        </div>
      </div>
    </BannerShell>
  );
}

/* ── Facebook Cover (851 x 315) ─────────────────── */

export function FacebookCover() {
  return (
    <BannerShell aspectRatio="851/315">
      <div className="flex items-center h-full gap-4">
        <div className="flex-1 space-y-2">
          <LogoWordmark />
          <Tagline />
          <FeaturePills />
        </div>
        <div className="hidden sm:block w-1/4">
          <MiniVaultMockup />
        </div>
      </div>
      <CompatibilityLine className="mt-auto" />
    </BannerShell>
  );
}

/* ── YouTube Banner (2560 x 1440) ───────────────── */

export function YouTubeBanner() {
  return (
    <BannerShell aspectRatio="2560/1440">
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <LogoWordmark />
        <p className="text-white/80 text-sm sm:text-base font-semibold max-w-md">
          Your team&apos;s AI prompt library — with built-in guardrails
        </p>
        <FeaturePills />
        <MiniVaultMockup className="w-full max-w-xs" />
        <CompatibilityLine />
      </div>
    </BannerShell>
  );
}

/* ── OG Banner (1200 x 630) ─────────────────────── */

export function OGBanner() {
  return (
    <BannerShell aspectRatio="1200/630">
      <div className="flex items-center h-full gap-6">
        <div className="flex-1 space-y-3">
          <LogoWordmark />
          <p className="text-white/90 text-sm sm:text-base font-semibold leading-snug">
            AI Prompt Management
            <br />
            for Teams
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-2/5">
          <MiniVaultMockup />
        </div>
      </div>
    </BannerShell>
  );
}

/* ── Export map for media page ───────────────────── */

export const socialBannerComponents = {
  twitter: { Component: TwitterBanner, label: "X (Twitter) Header", dims: "1500 x 500" },
  linkedin: { Component: LinkedInBanner, label: "LinkedIn Cover", dims: "1584 x 396" },
  facebook: { Component: FacebookCover, label: "Facebook Cover", dims: "851 x 315" },
  youtube: { Component: YouTubeBanner, label: "YouTube Channel Art", dims: "2560 x 1440" },
  og: { Component: OGBanner, label: "OG / Social Share Card", dims: "1200 x 630" },
} as const;
