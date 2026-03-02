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
  dark?: boolean;
  className?: string;
}

export function HeroImage({ src, alt, badge, dark, className }: HeroImageProps) {
  return (
    <div className={cn("relative hidden lg:block", className)}>
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src={src}
          alt={alt}
          width={640}
          height={480}
          className="object-cover w-full h-auto"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        {/* Dark-edge gradient overlay for blending with dark hero backgrounds */}
        {dark && (
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent" />
        )}
      </div>

      {/* Floating stat badge */}
      {badge && (
        <div className="absolute -bottom-4 -left-4 rounded-xl bg-white shadow-lg shadow-black/10 px-4 py-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
            {badge.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 leading-none">{badge.headline}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{badge.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
