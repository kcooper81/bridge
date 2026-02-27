"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  ScrollText,
  AlertTriangle,
  Ticket,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavBadgeCounts {
  newTickets: number;
  unresolvedErrors: number;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badgeKey: null },
  { href: "/admin/organizations", label: "Organizations", icon: Building2, badgeKey: null },
  { href: "/admin/users", label: "Users", icon: Users, badgeKey: null },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, badgeKey: null },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, badgeKey: null },
  { href: "/admin/activity", label: "Activity Logs", icon: ScrollText, badgeKey: null },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket, badgeKey: "newTickets" as const },
  { href: "/admin/errors", label: "Error Logs", icon: AlertTriangle, badgeKey: "unresolvedErrors" as const },
  { href: "/admin/settings", label: "Settings", icon: Settings, badgeKey: null },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState<NavBadgeCounts>({
    newTickets: 0,
    unresolvedErrors: 0,
  });

  useEffect(() => {
    loadBadgeCounts();
    const interval = setInterval(loadBadgeCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadBadgeCounts = async () => {
    const supabase = createClient();

    const [ticketsResult, errorsResult] = await Promise.all([
      supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("error_logs")
        .select("*", { count: "exact", head: true })
        .eq("resolved", false),
    ]);

    setBadges({
      newTickets: ticketsResult.count || 0,
      unresolvedErrors: errorsResult.count || 0,
    });
  };

  const renderNavItem = (item: (typeof navItems)[0], mobile?: boolean) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href));

    const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        )}
      >
        <item.icon className="h-5 w-5" />
        <span className="flex-1">{item.label}</span>
        {badgeCount > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/15 px-1.5 text-[10px] font-medium text-blue-400">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-amber-500 text-slate-900 shadow-lg hover:bg-amber-600"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sliding Menu */}
      <nav
        className={cn(
          "lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-slate-900 text-white p-4 z-40 shadow-xl transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="space-y-1">
          {navItems.map((item) => renderNavItem(item, true))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:block w-64 min-h-[calc(100vh-64px)] bg-slate-900 text-white p-4">
        <div className="space-y-1">
          {navItems.map((item) => renderNavItem(item))}
        </div>
      </nav>
    </>
  );
}
