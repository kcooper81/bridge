import { CheckCircle2 } from "lucide-react";

export function BenefitsGrid({ benefits }: { benefits: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {benefits.map((b) => (
        <div
          key={b}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
        >
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <span className="text-sm leading-relaxed">{b}</span>
        </div>
      ))}
    </div>
  );
}
