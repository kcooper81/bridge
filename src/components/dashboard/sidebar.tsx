"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/providers/org-provider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/providers/theme-provider";
import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  HelpCircle,
  LayoutDashboard,
  Library,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";
import { SupportModal } from "@/components/dashboard/support-modal";
import { APP_VERSION } from "@/lib/release-notes";
import { useHasUnseenRelease } from "@/components/dashboard/whats-new-modal";
import { getExtensionStatus } from "@/lib/extension-status";

// ── Sidebar collapse context ──
// Shared so the dashboard layout can read the collapsed state
const COLLAPSE_KEY = "teamprompt-sidebar-collapsed";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const pathname = usePathname();

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved === "true") setCollapsedState(true);
  }, []);

  // Auto-collapse on /chat
  useEffect(() => {
    if (pathname === "/chat") {
      setCollapsedState(true);
    }
  }, [pathname]);

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    localStorage.setItem(COLLAPSE_KEY, String(v));
  };

  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ── Nav items ──

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Prompts", href: "/vault", icon: Archive },
      { label: "Templates", href: "/templates", icon: Library },
      { label: "AI Chat", href: "/chat", icon: MessageSquare, roles: ["__ai_chat__"] },
      { label: "Approvals", href: "/approvals", icon: CheckSquare, roles: ["admin", "manager"] },
      { label: "Guidelines", href: "/guidelines", icon: BookOpen },
      { label: "Team", href: "/team", icon: Users },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
      { label: "Activity & Audit", href: "/activity", icon: Activity, roles: ["admin", "manager"] },
      { label: "Guardrails", href: "/guardrails", icon: Shield },
    ],
  },
];

// ── NavContent ──

function NavContent({ onItemClick, collapsed: isCollapsed }: { onItemClick?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  const { currentUserRole, org, prompts, members, loading: orgLoading } = useOrg();
  const { theme } = useTheme();
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportTab, setSupportTab] = useState<"help" | "whats-new" | "contact">("help");
  const { unseen } = useHasUnseenRelease();

  const pendingCount = orgLoading ? 0 : prompts.filter((p) => p.status === "pending").length;
  const inactiveExtensionCount = orgLoading ? 0 : (currentUserRole === "admin" || currentUserRole === "manager")
    ? members.filter((m) => getExtensionStatus(m.last_extension_active) === "inactive").length
    : 0;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn(
        "flex items-center border-b border-border/50 flex-shrink-0",
        isCollapsed ? "justify-center px-2 py-4" : "gap-3 px-5 py-5"
      )}>
        <Image
          src={theme === "dark" ? "/logo-dark.svg" : "/logo.svg"}
          alt="TeamPrompt"
          width={isCollapsed ? 28 : 36}
          height={isCollapsed ? 28 : 36}
          className="rounded-xl shadow-md"
        />
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight">TeamPrompt</span>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto scrollbar-thin py-5 space-y-6",
        isCollapsed ? "px-1.5" : "px-3"
      )}>
        {/* Dashboard link */}
        <div className={isCollapsed ? "mb-2" : "mb-4"}>
          <Link
            href="/home"
            onClick={onItemClick}
            title={isCollapsed ? "Dashboard" : undefined}
            className={cn(
              "relative flex items-center rounded-xl text-sm font-medium",
              "transition-all duration-200 ease-spring",
              isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-3",
              pathname === "/home"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {pathname === "/home" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-glow-sm" />
            )}
            <LayoutDashboard className={cn("h-[18px] w-[18px] flex-shrink-0", pathname === "/home" && "drop-shadow-sm")} />
            {!isCollapsed && "Dashboard"}
          </Link>
        </div>

        {navSections.map((section) => {
          const orgSettings = (org?.settings || {}) as Record<string, unknown>;
          const isAdmin = currentUserRole === "admin";
          const aiChatEnabled = orgSettings.ai_chat_enabled === true;

          const visibleItems = section.items.filter((item) => {
            if (item.roles?.includes("__ai_chat__")) {
              return isAdmin || aiChatEnabled;
            }
            return !item.roles || orgLoading || item.roles.includes(currentUserRole);
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              {!isCollapsed && (
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {section.title}
                </p>
              )}
              {isCollapsed && (
                <div className="mb-2 mx-auto w-6 border-t border-border/50" />
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "relative flex items-center rounded-xl text-sm font-medium",
                        "transition-all duration-200 ease-spring",
                        isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-3",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-glow-sm" />
                      )}
                      <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive && "drop-shadow-sm")} />
                      {!isCollapsed && (
                        <>
                          {item.label}
                          {(item.href === "/vault" || item.href === "/approvals") && pendingCount > 0 && (
                            <Badge variant="notification" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                              {pendingCount}
                            </Badge>
                          )}
                          {item.href === "/team" && inactiveExtensionCount > 0 && (
                            <span className="ml-auto flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{inactiveExtensionCount}</span>
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && (item.href === "/vault" || item.href === "/approvals") && pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-primary text-[9px] text-primary-foreground flex items-center justify-center px-1">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Help & Support button + version */}
      <div className={cn("pb-3 space-y-1", isCollapsed ? "px-1.5" : "px-3")}>
        <button
          onClick={() => { setSupportTab("help"); setSupportOpen(true); }}
          title={isCollapsed ? "Help & Support" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl text-sm font-medium",
            "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            "transition-all duration-200 ease-spring",
            isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-3"
          )}
        >
          <HelpCircle className="h-[18px] w-[18px] flex-shrink-0" />
          {!isCollapsed && "Help & Support"}
        </button>
        {!isCollapsed && (
          <button
            onClick={() => { setSupportTab("whats-new"); setSupportOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors w-full"
          >
            v{APP_VERSION}
            {unseen && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </button>
        )}
      </div>

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} initialTab={supportTab} />
    </div>
  );
}

// ── Desktop Sidebar ──

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside className={cn(
      "hidden md:flex sticky top-0 h-screen flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-200 relative",
      collapsed ? "w-[60px]" : "w-[var(--sidebar-width)]"
    )}>
      <NavContent collapsed={collapsed} />
      {/* Collapse toggle button */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm flex items-center justify-center hover:bg-muted transition-colors z-10"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}

// ── Mobile Sidebar Sheet ──

export function MobileSidebarSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-[var(--sidebar-width)] max-w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <NavContent onItemClick={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
