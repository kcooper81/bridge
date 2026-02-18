import { cn } from "@/lib/utils";

export function DarkSection({
  children,
  className,
  gradient = "center",
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: "center" | "left" | "right";
}) {
  const gradientStyle =
    gradient === "left"
      ? "radial-gradient(ellipse 60% 60% at 30% 50%, hsl(221 83% 53% / 0.08) 0%, transparent 60%)"
      : gradient === "right"
        ? "radial-gradient(ellipse 60% 60% at 70% 30%, hsl(221 83% 53% / 0.12) 0%, transparent 60%)"
        : "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(221 83% 53% / 0.08) 0%, transparent 70%)";

  return (
    <div
      className={cn(
        "rounded-3xl bg-zinc-950 text-white p-8 sm:p-12 relative overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: gradientStyle }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
