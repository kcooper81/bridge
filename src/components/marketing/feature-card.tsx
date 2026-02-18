import { cn } from "@/lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  large = false,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  large?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
        large && "sm:col-span-2",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {badge ? (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        ) : (
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
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
    </div>
  );
}
