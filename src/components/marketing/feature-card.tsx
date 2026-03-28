import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  large = false,
  href,
  iconBg,
  children,
  className,
  mono = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  large?: boolean;
  href?: string;
  iconBg?: string;
  children?: React.ReactNode;
  className?: string;
  /** Monochrome icon style — no colored background (Circle-inspired) */
  mono?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        {mono ? (
          <Icon className="h-6 w-6 text-foreground/50" />
        ) : (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBg ?? "bg-primary/10")}>
            <Icon className={cn("h-5 w-5", iconBg ? "text-foreground/70" : "text-primary")} />
          </div>
        )}
        {badge ? (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        ) : href ? (
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        ) : null}
      </div>
      <h3 className={cn("text-xl font-semibold", mono ? "mt-4 font-medium" : "mt-5")}>{title}</h3>
      <p
        className={cn(
          "mt-2 text-muted-foreground leading-relaxed",
          large ? "max-w-lg" : "text-sm"
        )}
      >
        {description}
      </p>
      {children}
    </>
  );

  const cardClass = cn(
    "group rounded-[20px] border border-border bg-card p-8 transition-all duration-300",
    "hover:border-foreground/10 hover:shadow-lg hover:shadow-black/[0.03]",
    large && "sm:col-span-2",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(cardClass, "block")}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
