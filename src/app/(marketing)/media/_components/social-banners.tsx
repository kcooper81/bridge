import { cn } from "@/lib/utils";

/* ── Shared sub-components ──────────────────────── */

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-[9px] sm:text-[10px] font-medium text-white/90 whitespace-nowrap">
      {label}
    </span>
  );
}

function MiniVaultMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 overflow-hidden",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/10">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
        <div className="ml-1.5 flex-1 h-3 rounded bg-white/5" />
      </div>
      {/* Vault rows */}
      <div className="p-2 space-y-1.5">
        {[85, 70, 60, 50].map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-blue-400/20 shrink-0" />
            <div className="flex-1 space-y-0.5">
              <div
                className="h-1.5 rounded bg-white/15"
                style={{ width: `${w}%` }}
              />
              <div
                className="h-1 rounded bg-white/8"
                style={{ width: `${w - 20}%` }}
              />
            </div>
            <div className="h-3 w-8 rounded-full bg-blue-400/15 flex items-center justify-center">
              <span className="text-[6px] text-blue-300 font-medium">
                {[142, 89, 67, 34][i]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoWordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500 flex items-center justify-center">
        <span className="text-white font-bold text-sm sm:text-base">T</span>
      </div>
      <span className="text-white font-bold text-lg sm:text-xl tracking-tight">
        TeamPrompt
      </span>
    </div>
  );
}

function Tagline({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-white/70 text-[10px] sm:text-xs font-medium",
        className
      )}
    >
      AI Prompt Management for Teams
    </p>
  );
}

function FeaturePills() {
  return (
    <div className="flex flex-wrap gap-1.5">
      <FeaturePill label="Shared Vault" />
      <FeaturePill label="AI Guardrails" />
      <FeaturePill label="Compliance Packs" />
      <FeaturePill label="Analytics" />
    </div>
  );
}

function CompatibilityLine({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-white/40 text-[7px] sm:text-[8px] font-medium",
        className
      )}
    >
      Works with ChatGPT, Claude, Gemini, Copilot, Perplexity
    </p>
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
        "w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900",
        className
      )}
      style={{ aspectRatio }}
    >
      <div className="w-full h-full relative p-4 sm:p-6 flex flex-col justify-between">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
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
          AI Prompt Management for Teams
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
