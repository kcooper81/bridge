import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-5",
        "shadow-elevation-2 backdrop-blur-sm",
        "transition-all duration-250 ease-spring",
        "hover:scale-[1.02] hover:shadow-elevation-3 hover:border-primary/20",
        "group cursor-default",
        className
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-transform duration-250 ease-spring group-hover:scale-110">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}
