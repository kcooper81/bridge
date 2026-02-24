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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/providers/theme-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  ChevronUp,
  CreditCard,
  FolderOpen,
  HelpCircle,
  Library,
  LogOut,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { SupportModal } from "@/components/dashboard/support-modal";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Setup",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Team", href: "/team", icon: Users, roles: ["admin", "manager"] },
      { label: "Guardrails", href: "/guardrails", icon: Shield, roles: ["admin", "manager"] },
      { label: "Guidelines", href: "/guidelines", icon: BookOpen, roles: ["admin", "manager"] },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Prompts", href: "/vault", icon: Archive },
      { label: "Collections", href: "/collections", icon: FolderOpen },
      { label: "Library", href: "/library", icon: Library },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Activity Log", href: "/activity", icon: Activity, roles: ["admin", "manager"] },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
];

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { currentUserRole, members, prompts } = useOrg();
  const { user, signOut, isSuperAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const { subscription } = useSubscription();
  const { unreadCount } = useNotifications();
  const [supportOpen, setSupportOpen] = useState(false);

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
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                          : "text-foreground/70 hover:bg-muted/50 hover:text-foreground hover:scale-[1.02]"
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
                      {item.href === "/notifications" && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px] shadow-sm">
                          {unreadCount > 99 ? "99+" : unreadCount}
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

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />

      {/* User footer */}
      <div className="border-t border-border/50 px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/50 transition-colors">
              <Avatar className="h-10 w-10 shadow-md shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold truncate">
                  {currentMember?.name || user?.email}
                </p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5 border-border/50">
                  {currentUserRole}
                </Badge>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-64 mb-1">
            {/* Header */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {currentMember?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">
                      {currentUserRole}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                      {subscription?.plan || "free"}
                    </Badge>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Theme toggle */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Dark mode
              <span className="ml-auto text-xs text-muted-foreground">
                {theme === "dark" ? "On" : "Off"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/settings/billing" onClick={onItemClick}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => setSupportOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>

            {isSuperAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin" onClick={onItemClick} className="text-amber-600 focus:text-amber-600 dark:text-amber-400 dark:focus:text-amber-400">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            {/* Sign out */}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
