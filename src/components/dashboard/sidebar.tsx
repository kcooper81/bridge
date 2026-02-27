"use client";

import { useState } from "react";
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
  HelpCircle,
  LayoutDashboard,
  Library,
  Shield,
  Users,
} from "lucide-react";
import { SupportModal } from "@/components/dashboard/support-modal";

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
      { label: "Approvals", href: "/approvals", icon: CheckSquare, roles: ["admin", "manager"] },
      { label: "Guidelines", href: "/guidelines", icon: BookOpen, roles: ["admin", "manager"] },
      { label: "Team", href: "/team", icon: Users, roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Activity Log", href: "/activity", icon: Activity, roles: ["admin", "manager"] },
      { label: "Guardrails", href: "/guardrails", icon: Shield, roles: ["admin", "manager"] },
    ],
  },
];

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { currentUserRole, prompts } = useOrg();
  const { theme } = useTheme();
  const [supportOpen, setSupportOpen] = useState(false);

  const pendingCount = prompts.filter((p) => p.status === "pending").length;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
        <Image src={theme === "dark" ? "/logo-dark.svg" : "/logo.svg"} alt="TeamPrompt" width={36} height={36} className="rounded-xl shadow-md" />
        <span className="text-xl font-bold tracking-tight">TeamPrompt</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-5 space-y-6">
        {/* Dashboard link */}
        <div className="mb-4">
          <Link
            href="/home"
            onClick={onItemClick}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
              "transition-all duration-200 ease-spring",
              pathname === "/home"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.02]"
            )}
          >
            {pathname === "/home" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-glow-sm" />
            )}
            <LayoutDashboard className={cn("h-[18px] w-[18px]", pathname === "/home" && "drop-shadow-sm")} />
            Dashboard
          </Link>
        </div>

        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) =>
              !item.roles || item.roles.includes(currentUserRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {section.title}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                        "transition-all duration-200 ease-spring",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.02]"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-glow-sm" />
                      )}
                      <item.icon className={cn("h-[18px] w-[18px]", isActive && "drop-shadow-sm")} />
                      {item.label}
                      {(item.href === "/vault" || item.href === "/approvals") && pendingCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px] shadow-sm">
                          {pendingCount}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Help & Support button */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setSupportOpen(true)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
            "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            "transition-all duration-200 ease-spring"
          )}
        >
          <HelpCircle className="h-[18px] w-[18px]" />
          Help & Support
        </button>
      </div>

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex h-full w-[var(--sidebar-width)] flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl">
      <NavContent />
    </aside>
  );
}

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
      <SheetContent side="left" className="w-[var(--sidebar-width)] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <NavContent onItemClick={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
