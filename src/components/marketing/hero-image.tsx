import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeroImageBadge {
  icon: React.ReactNode;
  headline: string;
  subtitle: string;
}

interface HeroImageProps {
  src: string;
  alt: string;
  badge?: HeroImageBadge;
  topBadge?: HeroImageBadge;
  dark?: boolean;
  className?: string;
}

export function HeroImage({ src, alt, badge, topBadge, dark, className }: HeroImageProps) {
  return (
    <div className={cn("relative hidden lg:block", className)}>
      {/* Ambient glow behind the image */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent blur-2xl opacity-60" />

      {/* Main image container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <Image
          src={src}
          alt={alt}
          width={640}
          height={480}
          className="object-cover w-full h-auto"
          unoptimized
          priority
        />

        {/* Multi-layer gradient overlays */}
        {dark && (
          <>
            {/* Bottom fade for blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-zinc-950/10 to-transparent" />
            {/* Side fade for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/30 via-transparent to-transparent" />
            {/* Top-corner vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_50%,rgba(0,0,0,0.3)_100%)]" />
          </>
        )}

        {!dark && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_60%,rgba(0,0,0,0.15)_100%)]" />
          </>
        )}
      </div>

      {/* Frosted glass floating badge */}
      {badge && (
        <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl shadow-black/10 border border-white/60 px-5 py-3.5 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 shrink-0">
            {badge.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 leading-none">{badge.headline}</p>
            <p className="text-xs text-zinc-500 mt-1">{badge.subtitle}</p>
          </div>
        </div>
      )}

      {/* Top-right frosted glass badge */}
      {topBadge && (
        <div className="absolute -top-4 -right-4 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl shadow-black/10 border border-white/60 px-4 py-2.5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 shrink-0">
            {topBadge.icon}
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 leading-none">{topBadge.headline}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{topBadge.subtitle}</p>
          </div>
        </div>
      )}

      {/* Secondary decorative blur orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-400/15 blur-2xl pointer-events-none" />
    </div>
  );
}
