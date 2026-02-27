"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useOrg } from "@/components/providers/org-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building,
  CreditCard,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Settings,
  Shield,
  Sun,
  User,
  Users,
} from "lucide-react";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { MobileSidebarSheet } from "@/components/dashboard/sidebar";

export function DashboardHeader() {
  const { user, signOut, isSuperAdmin } = useAuth();
  const { currentUserRole, members } = useOrg();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentMember = members.find((m) => m.isCurrentUser);
  const initials =
    currentMember?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
      {/* Left: mobile hamburger */}
      <div className="md:hidden">
        <MobileSidebarSheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </MobileSidebarSheet>
      </div>
      <div className="hidden md:block" />

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <NotificationBell />

        {/* Settings dropdown — admin/manager only */}
        {(currentUserRole === "admin" || currentUserRole === "manager") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52" sideOffset={8}>
              <DropdownMenuItem asChild>
                <Link href="/settings/organization">
                  <Building className="mr-2 h-4 w-4" />
                  Organization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/plan">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Plan & Usage
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/billing">
                  <Receipt className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/team">
                  <Users className="mr-2 h-4 w-4" />
                  Team
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-all duration-200"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">
                {currentMember?.name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUserRole}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              Dark mode
              <span className="ml-auto text-xs text-muted-foreground">
                {theme === "dark" ? "On" : "Off"}
              </span>
            </DropdownMenuItem>
            {isSuperAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin"
                    className="text-amber-600 focus:text-amber-600 dark:text-amber-400 dark:focus:text-amber-400"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
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
    </header>
  );
}
