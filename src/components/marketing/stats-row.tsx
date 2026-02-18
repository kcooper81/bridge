import { cn } from "@/lib/utils";

export function StatsRow({
  stats,
  dark = false,
  className,
}: {
  stats: { value: string; label: string }[];
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-8 sm:gap-12",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((stat) => (
        <div key={stat.label}>
          <p
            className={cn(
              "text-3xl sm:text-4xl font-bold tabular-nums",
              dark ? "text-white" : "text-foreground"
            )}
          >
            {stat.value}
          </p>
          <p
            className={cn(
              "mt-1 text-sm",
              dark ? "text-zinc-500" : "text-muted-foreground"
            )}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
