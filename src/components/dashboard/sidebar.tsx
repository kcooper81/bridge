"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/providers/org-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/providers/theme-provider";
import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  Building2,
  FolderOpen,
  Import,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  Users,
} from "lucide-react";

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
      { label: "Collections", href: "/collections", icon: FolderOpen },
      { label: "Guidelines", href: "/guidelines", icon: BookOpen, roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Team", href: "/team", icon: Users, roles: ["admin", "manager"] },
      { label: "Guardrails", href: "/guardrails", icon: Shield, roles: ["admin", "manager"] },
      { label: "Settings", href: "/settings", icon: Building2, roles: ["admin"] },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Activity Log", href: "/activity", icon: Activity, roles: ["admin", "manager"] },
      { label: "Import/Export", href: "/import-export", icon: Import },
    ],
  },
];

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { currentUserRole, members, prompts } = useOrg();
  const { user, signOut, isSuperAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const pendingCount = prompts.filter((p) => p.status === "pending").length;
  const currentMember = members.find((m) => m.isCurrentUser);
  const initials =
    currentMember?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
        <Image src={theme === "dark" ? "/logo-dark.svg" : "/logo.svg"} alt="TeamPrompt" width={36} height={36} className="rounded-xl shadow-md" />
        <span className="text-xl font-bold tracking-tight">TeamPrompt</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-5 space-y-6">
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
                      {item.href === "/vault" && pendingCount > 0 && (
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

      {/* Super Admin link */}
      {isSuperAdmin && (
        <div className="px-3 pb-2">
          <Link
            href="/admin"
            onClick={onItemClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {currentMember?.name || user?.email}
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5 border-border/50">
              {currentUserRole}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-110 transition-all duration-200"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-110 transition-all duration-200"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-[var(--sidebar-width)] flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl">
        <NavContent />
      </aside>

      {/* Mobile sidebar */}
      <MobileSidebar />
    </>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden fixed top-4 left-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 bg-card">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[var(--sidebar-width)] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <NavContent onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
