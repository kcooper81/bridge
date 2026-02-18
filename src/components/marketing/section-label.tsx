import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-sm font-semibold uppercase tracking-widest mb-3",
        dark ? "text-blue-400" : "text-primary",
        className
      )}
    >
      {children}
    </p>
  );
}
