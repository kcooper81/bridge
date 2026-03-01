import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  StickyNote,
  Users,
} from "lucide-react";

export interface MockupItem {
  title: string;
  badge?: string;
  stat?: string;
  iconColor?: "blue" | "red" | "green" | "amber" | "purple" | "cyan";
  highlight?: "block" | "warn" | "shared" | "new";
  subtitle?: string;
}

export interface ToastOverlay {
  message: string;
  type: "block" | "warn" | "shared" | "success";
  position?: "bottom-right" | "top-right";
}

export interface AppMockupProps {
  variant?: "vault" | "guardrails" | "guidelines";
  items: MockupItem[];
  sidebarUser?: { name: string; initials: string };
  activeNav?: string;
  alertBanner?: { type: "block" | "warn"; message: string };
  toasts?: ToastOverlay[];
  navBadges?: Record<string, number>;
  className?: string;
}

/* ── Sidebar nav structure matching the real app ── */
const workspaceNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Prompts", icon: StickyNote },
  { label: "Templates", icon: FileText },
  { label: "Approvals", icon: CheckSquare },
  { label: "Guidelines", icon: BookOpen },
  { label: "Team", icon: Users },
];

const intelligenceNav = [
  { label: "Analytics", icon: BarChart3 },
  { label: "Activity Log", icon: Activity },
  { label: "Guardrails", icon: Shield },
];

const highlightStyles = {
  block: "border-l-2 border-l-red-500 bg-red-500/[0.04]",
  warn: "border-l-2 border-l-amber-500 bg-amber-500/[0.04]",
  shared: "border-l-2 border-l-blue-500 bg-blue-500/[0.04]",
  new: "border-l-2 border-l-emerald-500 bg-emerald-500/[0.04]",
};

const iconColorMap = {
  blue: "bg-blue-500/10 text-blue-600",
  red: "bg-red-500/10 text-red-500",
  green: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/10 text-amber-600",
  purple: "bg-violet-500/10 text-violet-600",
  cyan: "bg-cyan-500/10 text-cyan-600",
};

function RowIcon({ badge, iconColor }: { badge?: string; iconColor?: string }) {
  const color = iconColor
    ? iconColorMap[iconColor as keyof typeof iconColorMap]
    : "bg-primary/10 text-primary";

  const Icon =
    badge === "Blocked"
      ? ShieldX
      : badge === "Warning"
        ? AlertTriangle
        : badge === "Shared"
          ? Share2
          : badge === "Approved"
            ? CheckCircle2
            : FileText;

  return (
    <div
      className={cn(
        "w-7 h-7 rounded-md shrink-0 flex items-center justify-center",
        color
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

function ToastNotification({ toast }: { toast: ToastOverlay }) {
  const toastStyles = {
    block: {
      border: "border-red-500/30",
      bg: "bg-card/95",
      icon: ShieldX,
      iconColor: "text-red-500",
      dotColor: "bg-red-500",
    },
    warn: {
      border: "border-amber-500/30",
      bg: "bg-card/95",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      dotColor: "bg-amber-500",
    },
    shared: {
      border: "border-blue-500/30",
      bg: "bg-card/95",
      icon: Share2,
      iconColor: "text-blue-500",
      dotColor: "bg-blue-500",
    },
    success: {
      border: "border-emerald-500/30",
      bg: "bg-card/95",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      dotColor: "bg-emerald-500",
    },
  };

  const s = toastStyles[toast.type];
  const pos =
    toast.position === "top-right"
      ? { top: "3.5rem", right: "0.75rem" }
      : { bottom: "0.75rem", right: "0.75rem" };

  return (
    <div
      className={cn(
        "absolute z-10 rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm max-w-[200px]",
        s.border,
        s.bg
      )}
      style={{
        ...pos,
        animation: "mockup-toast-in 0.5s ease-out both",
      }}
    >
      <div className="flex items-start gap-2">
        <div className="relative mt-0.5 shrink-0">
          <s.icon className={cn("h-3.5 w-3.5", s.iconColor)} />
          <div
            className={cn(
              "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
              s.dotColor
            )}
            style={{ animation: "mockup-pulse 2s ease-in-out infinite" }}
          />
        </div>
        <span className="text-[10px] leading-tight text-foreground font-medium">
          {toast.message}
        </span>
      </div>
    </div>
  );
}

/* Maps variant → active sidebar label */
const variantNavMap: Record<string, string> = {
  vault: "Prompts",
  guardrails: "Guardrails",
  guidelines: "Guidelines",
};

function NavItem({
  item,
  active,
  badge,
}: {
  item: { label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  badge?: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] relative",
        active
          ? "bg-primary/8 text-primary font-medium"
          : "text-muted-foreground"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-primary" />
      )}
      <item.icon className="h-3.5 w-3.5" />
      <span className="flex-1">{item.label}</span>
      {badge != null && badge > 0 && (
        <span className="text-[7px] font-bold bg-primary text-white rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-1">
          {badge}
        </span>
      )}
    </div>
  );
}

export function AppMockup({
  variant = "vault",
  items,
  sidebarUser = { name: "Dr. Smith", initials: "DS" },
  activeNav,
  alertBanner,
  toasts,
  navBadges,
  className,
}: AppMockupProps) {
  const active = activeNav || variantNavMap[variant] || "Prompts";

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5",
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
            app.teamprompt.app
          </span>
        </div>
      </div>

      <div className="flex min-h-[300px]">
        {/* ── Sidebar ── */}
        <div className="w-[145px] border-r border-border bg-background flex flex-col shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-icon-blue.svg"
              alt=""
              className="w-5 h-5 rounded"
            />
            <span className="text-[11px] font-semibold text-foreground">
              TeamPrompt
            </span>
          </div>

          <div className="flex-1 px-2 pt-3 space-y-3 overflow-hidden">
            {/* WORKSPACE section */}
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
                Workspace
              </p>
              <nav className="space-y-0.5">
                {workspaceNav.map((item) => (
                  <NavItem
                    key={item.label}
                    item={item}
                    active={item.label === active}
                    badge={navBadges?.[item.label]}
                  />
                ))}
              </nav>
            </div>

            {/* INTELLIGENCE section */}
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
                Intelligence
              </p>
              <nav className="space-y-0.5">
                {intelligenceNav.map((item) => (
                  <NavItem
                    key={item.label}
                    item={item}
                    active={item.label === active}
                    badge={navBadges?.[item.label]}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom: Help & version */}
          <div className="px-3 py-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
              <HelpCircle className="h-3 w-3" />
              Help &amp; Support
            </div>
            <p className="text-[8px] text-muted-foreground/50 px-0.5">v1.7.0</p>
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar: notification bell, settings, avatar */}
          <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border/50">
            <div className="relative">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary text-[5px] text-white flex items-center justify-center font-bold">
                2
              </div>
            </div>
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[7px] font-bold text-white">
                {sidebarUser.initials}
              </span>
            </div>
          </div>

          {/* Page content */}
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
                    {alertBanner.type === "block" ? (
                      <ShieldAlert className="h-2.5 w-2.5 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-2.5 w-2.5 text-yellow-600" />
                    )}
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
            <div className="space-y-0.5">
              {items.map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    "flex items-center gap-3 py-2 px-2 rounded-md transition-colors",
                    item.highlight
                      ? highlightStyles[item.highlight]
                      : "hover:bg-muted/30"
                  )}
                >
                  <RowIcon badge={item.badge} iconColor={item.iconColor} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.subtitle && (
                        <span className="text-[9px] text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-semibold inline-flex items-center gap-1",
                            item.badge === "Blocked"
                              ? "text-destructive"
                              : item.badge === "Warning"
                                ? "text-yellow-600"
                                : item.badge === "Shared"
                                  ? "text-blue-600"
                                  : item.badge === "Approved"
                                    ? "text-emerald-600"
                                    : "text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
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

      {/* Toast notification overlays */}
      {toasts?.map((toast, i) => (
        <ToastNotification key={i} toast={toast} />
      ))}
    </div>
  );
}

/* Floating context cards for homepage hero */
export function FloatingCard({
  label,
  icon,
  color = "blue",
  position,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  color?: "blue" | "red" | "green" | "purple" | "amber" | "cyan";
  position:
    | "top-right"
    | "top-left"
    | "bottom-left"
    | "bottom-right"
    | "mid-left"
    | "mid-right";
  className?: string;
}) {
  const colorMap = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    "top-right": { top: "1rem", right: "-1.5rem" },
    "top-left": { top: "1.5rem", left: "-2rem" },
    "mid-left": { top: "45%", left: "-2.5rem" },
    "mid-right": { top: "30%", right: "-1.5rem" },
    "bottom-left": { bottom: "2rem", left: "-1.5rem" },
    "bottom-right": { bottom: "1rem", right: "-1.5rem" },
  };

  const animDurations: Record<string, string> = {
    "top-right": "3s",
    "top-left": "3.5s",
    "mid-left": "4.5s",
    "mid-right": "3.8s",
    "bottom-left": "4s",
    "bottom-right": "3.5s",
  };

  return (
    <div
      className={cn(
        "absolute rounded-lg border px-3 py-1.5 backdrop-blur-sm text-xs font-medium shadow-lg flex items-center gap-1.5",
        colorMap[color],
        className
      )}
      style={{
        ...positionStyles[position],
        animation: `float ${animDurations[position] || "3.5s"} ease-in-out infinite`,
      }}
    >
      {icon}
      {label}
    </div>
  );
}

/* Re-export icons for convenient use in page files */
export {
  ShieldX as MockupShieldBlock,
  Share2 as MockupShareIcon,
  Sparkles as MockupSparklesIcon,
  Star as MockupStarIcon,
  ShieldCheck as MockupShieldCheck,
  CheckCircle2 as MockupCheckIcon,
  AlertTriangle as MockupAlertIcon,
};
