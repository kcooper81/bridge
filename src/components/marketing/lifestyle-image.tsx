"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  ClipboardList,
  Lock,
  Eye,
  Globe,
  Activity,
  Shield,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldAlert,
  ShieldCheck,
  ClipboardList,
  Lock,
  Eye,
  Globe,
  Activity,
  Shield,
};

/* ── Overlay Card ── */

interface OverlayCardProps {
  /** Icon name string — resolved internally to avoid server→client serialization issues */
  icon: string;
  label: string;
  value?: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const positionClasses: Record<OverlayCardProps["position"], string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

export function OverlayCard({ icon, label, value, position, className }: OverlayCardProps) {
  const Icon = ICON_MAP[icon] || Shield;
  return (
    <div
      className={cn(
        "absolute z-10 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5",
        "bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl",
        "border border-white/50 dark:border-white/10",
        "shadow-lg shadow-black/10",
        "transition-transform duration-500 hover:scale-105",
        positionClasses[position],
        className
      )}
    >
      <Icon className="h-4 w-4 text-foreground/60 shrink-0" />
      <div className="min-w-0">
        {value && <p className="text-sm font-bold tracking-tight leading-none">{value}</p>}
        <p className={cn("text-xs text-muted-foreground leading-tight", value && "mt-0.5")}>{label}</p>
      </div>
    </div>
  );
}

/* ── Lifestyle Image ── */

interface LifestyleImageProps {
  src: string;
  alt: string;
  overlayCards?: OverlayCardProps[];
  /** Gradient direction: which corner the white fades from */
  gradientFrom?: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "none";
  aspectRatio?: "square" | "4/3" | "16/9" | "3/4";
  className?: string;
  priority?: boolean;
}

const aspectClasses: Record<NonNullable<LifestyleImageProps["aspectRatio"]>, string> = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
  "3/4": "aspect-[3/4]",
};

const gradientStyles: Record<string, string> = {
  "bottom-left": "radial-gradient(circle at 0% 100%, rgba(255,255,255,0.6), transparent 70%)",
  "bottom-right": "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.6), transparent 70%)",
  "top-left": "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.6), transparent 70%)",
  "top-right": "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.6), transparent 70%)",
};

export function LifestyleImage({
  src,
  alt,
  overlayCards = [],
  gradientFrom = "bottom-left",
  aspectRatio = "4/3",
  className,
  priority = false,
}: LifestyleImageProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[20px]", aspectClasses[aspectRatio], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />

      {/* Radial gradient overlay */}
      {gradientFrom !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: gradientStyles[gradientFrom] }}
        />
      )}

      {/* Overlay cards — hidden on small screens */}
      {overlayCards.map((card, i) => (
        <OverlayCard key={i} {...card} className="hidden sm:flex" />
      ))}
    </div>
  );
}
