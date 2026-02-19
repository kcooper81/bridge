import { cn } from "@/lib/utils";
import {
  Archive,
  BarChart3,
  BookOpen,
  Search,
  Shield,
  Users,
} from "lucide-react";

export interface MockupItem {
  title: string;
  badge?: string;
  stat?: string;
}

export interface AppMockupProps {
  variant?: "vault" | "guardrails" | "guidelines";
  items: MockupItem[];
  sidebarUser?: { name: string; initials: string };
  activeNav?: string;
  alertBanner?: { type: "block" | "warn"; message: string };
  className?: string;
}

const navItems = [
  { label: "Vault", icon: Archive },
  { label: "Guardrails", icon: Shield },
  { label: "Guidelines", icon: BookOpen },
  { label: "Teams", icon: Users },
  { label: "Analytics", icon: BarChart3 },
];

export function AppMockup({
  variant = "vault",
  items,
  sidebarUser = { name: "Dr. Smith", initials: "DS" },
  activeNav,
  alertBanner,
  className,
}: AppMockupProps) {
  const active =
    activeNav ||
    (variant === "vault"
      ? "Vault"
      : variant === "guardrails"
        ? "Guardrails"
        : "Guidelines");

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        <div className="ml-3 flex-1 h-5 rounded-md bg-background border border-border px-3 flex items-center">
          <span className="text-[10px] text-muted-foreground">
            app.teamprompt.app/{variant}
          </span>
        </div>
      </div>

      <div className="flex min-h-[280px]">
        {/* Sidebar */}
        <div className="w-40 border-r border-border bg-muted/20 flex flex-col p-3 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4 px-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-icon-blue.svg" alt="" className="w-6 h-6 rounded" />
            <span className="text-xs font-semibold text-foreground">
              TeamPrompt
            </span>
          </div>

          {/* Nav items */}
          <nav className="space-y-0.5 flex-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px]",
                  item.label === active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
          </nav>

          {/* User avatar */}
          <div className="flex items-center gap-2 px-1 pt-3 border-t border-border mt-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">
                {sidebarUser.initials}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate">
              {sidebarUser.name}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Search bar + New button */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-7 rounded-md border border-border bg-background px-2 flex items-center gap-1.5">
              <Search className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                Search prompts...
              </span>
            </div>
            <div className="h-7 px-2.5 rounded-md bg-primary text-[10px] text-primary-foreground font-medium flex items-center justify-center">
              + New
            </div>
          </div>

          {/* Alert banner */}
          {alertBanner && (
            <div
              className={cn(
                "rounded-md border px-3 py-2 mb-3",
                alertBanner.type === "block"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-yellow-500/30 bg-yellow-500/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-3.5 h-3.5 rounded-full flex items-center justify-center",
                    alertBanner.type === "block"
                      ? "bg-destructive/30"
                      : "bg-yellow-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-[7px] font-bold",
                      alertBanner.type === "block"
                        ? "text-destructive"
                        : "text-yellow-600"
                    )}
                  >
                    !
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    alertBanner.type === "block"
                      ? "text-destructive"
                      : "text-yellow-600"
                  )}
                >
                  {alertBanner.message}
                </span>
              </div>
            </div>
          )}

          {/* Content rows */}
          <div className="divide-y divide-border/50">
            {items.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 py-2.5 first:pt-0"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[9px] font-semibold",
                        item.badge === "Blocked"
                          ? "text-destructive"
                          : item.badge === "Warning"
                            ? "text-yellow-600"
                            : "text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.stat && (
                  <span className="text-[10px] text-primary font-medium tabular-nums shrink-0">
                    {item.stat}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Tags row */}
          {variant === "vault" && items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 flex gap-1.5">
              {["onboarding", "reports", "team"].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Floating context cards for homepage hero */
export function FloatingCard({
  label,
  color = "blue",
  position,
  className,
}: {
  label: string;
  color?: "blue" | "red" | "green";
  position: "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  const colorMap = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
  };

  const positionMap = {
    "top-right": "top-4 right-0 translate-x-1/4 -translate-y-1/4",
    "bottom-left": "bottom-8 left-0 -translate-x-1/4",
    "bottom-right": "bottom-4 right-0 translate-x-1/4",
  };

  const animDuration =
    position === "top-right"
      ? "3s"
      : position === "bottom-left"
        ? "4s"
        : "3.5s";

  return (
    <div
      className={cn(
        "absolute rounded-lg border px-3 py-1.5 backdrop-blur-sm text-xs font-medium shadow-lg",
        colorMap[color],
        positionMap[position],
        className
      )}
      style={{
        animation: `float ${animDuration} ease-in-out infinite`,
      }}
    >
      {label}
    </div>
  );
}
