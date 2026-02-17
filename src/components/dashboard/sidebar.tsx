"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/providers/org-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Archive,
  BarChart3,
  BookOpen,
  Building2,
  FolderOpen,
  Import,
  LogOut,
  Menu,
  Shield,
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
    title: "Prompt Manager",
    items: [
      { label: "Vault", href: "/vault", icon: Archive },
      { label: "Collections", href: "/collections", icon: FolderOpen },
      { label: "Standards", href: "/standards", icon: BookOpen, roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Organization",
    items: [
      { label: "Team", href: "/team", icon: Users, roles: ["admin", "manager"] },
      { label: "Security", href: "/security-shield", icon: Shield, roles: ["admin", "manager"] },
      { label: "Settings", href: "/settings", icon: Building2, roles: ["admin"] },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Import/Export", href: "/import-export", icon: Import },
    ],
  },
];

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { currentUserRole, members } = useOrg();
  const { user, signOut } = useAuth();

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
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          T
        </div>
        <span className="text-lg font-bold">TeamPrompt</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) =>
              !item.roles || item.roles.includes(currentUserRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {currentMember?.name || user?.email}
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {currentUserRole}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
      <aside className="hidden md:flex h-full w-[var(--sidebar-width)] flex-col border-r border-border bg-card">
        <NavContent />
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-card">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[var(--sidebar-width)] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
