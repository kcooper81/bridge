export function UsageBar({ label, current, max }: { label: string; current: number; max: number }) {
  const isUnlimited = max === -1;
  const pct = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
  const color = isUnlimited ? "bg-tp-green" : pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-tp-yellow" : "bg-tp-green";
  const glowColor = isUnlimited ? "shadow-tp-green/30" : pct >= 100 ? "shadow-destructive/30" : pct >= 80 ? "shadow-tp-yellow/30" : "shadow-tp-green/30";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {current} / {isUnlimited ? "Unlimited" : max}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden backdrop-blur-sm">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color} ${pct > 0 ? `shadow-md ${glowColor}` : ''}`}
          style={{ width: isUnlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}
