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
}) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBg ?? "bg-primary/10")}>
          <Icon className={cn("h-5 w-5", iconBg ? "text-foreground/70" : "text-primary")} />
        </div>
        {badge ? (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        ) : (
          <ArrowRight className={cn(
            "h-4 w-4 text-muted-foreground transition-all duration-300",
            href
              ? "opacity-60 group-hover:opacity-100 group-hover:translate-x-1"
              : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
          )} />
        )}
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
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
    "group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
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
