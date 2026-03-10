"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { SuperAdminRole } from "@/lib/constants";
import { DEFAULT_SUPPORT_PAGES } from "@/lib/constants";
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
  ClipboardCheck,
  UserCog,
  Inbox,
  PenLine,
  Megaphone,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavBadgeCounts {
  newTickets: number;
  unresolvedErrors: number;
  pastDueSubs: number;
  newSubs: number;
  newSignups: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeKey: keyof NavBadgeCounts | null;
  supportVisible: boolean;
  superAdminOnly?: boolean;
}

interface NavGroup {
  label: string;
  supportVisible: boolean;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    supportVisible: false,
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badgeKey: null, supportVisible: false },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3, badgeKey: null, supportVisible: false },
    ],
  },
  {
    label: "Inbox",
    supportVisible: true,
    items: [
      { href: "/admin/tickets", label: "Tickets & Email", icon: Ticket, badgeKey: "newTickets" as const, supportVisible: true },
      { href: "/admin/errors", label: "Error Logs", icon: AlertTriangle, badgeKey: "unresolvedErrors" as const, supportVisible: false },
    ],
  },
  {
    label: "Manage",
    supportVisible: false,
    items: [
      { href: "/admin/organizations", label: "Organizations", icon: Building2, badgeKey: "newSignups" as const, supportVisible: false },
      { href: "/admin/users", label: "Users", icon: Users, badgeKey: null, supportVisible: false },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, badgeKey: "newSubs" as const, supportVisible: false },
    ],
  },
  {
    label: "Logs",
    supportVisible: false,
    items: [
      { href: "/admin/activity", label: "Activity Logs", icon: ScrollText, badgeKey: null, supportVisible: false },
    ],
  },
  {
    label: "Growth",
    supportVisible: false,
    items: [
      { href: "/admin/content", label: "Content & SEO", icon: PenLine, badgeKey: null, supportVisible: false, superAdminOnly: true },
      { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone, badgeKey: null, supportVisible: false, superAdminOnly: true },
    ],
  },
  {
    label: "System",
    supportVisible: true,
    items: [
      { href: "/admin/testing-guide", label: "Testing Guide", icon: ClipboardCheck, badgeKey: null, supportVisible: true },
      { href: "/admin/settings/inbox", label: "Inbox Settings", icon: Inbox, badgeKey: null, supportVisible: false },
      { href: "/admin/settings", label: "Settings", icon: Settings, badgeKey: null, supportVisible: false },
      { href: "/admin/admin-users", label: "Admin Users", icon: UserCog, badgeKey: null, supportVisible: false, superAdminOnly: true },
    ],
  },
];

export function AdminNav({ superAdminRole, supportAllowedPages }: { superAdminRole: SuperAdminRole | null; supportAllowedPages?: string[] | null }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState<NavBadgeCounts>({
    newTickets: 0,
    unresolvedErrors: 0,
    pastDueSubs: 0,
    newSubs: 0,
    newSignups: 0,
  });
  const prevTicketCount = useRef(0);

  const isSupport = superAdminRole === "support";
  const allowedPages = isSupport
    ? (supportAllowedPages && supportAllowedPages.length > 0 ? supportAllowedPages : DEFAULT_SUPPORT_PAGES)
    : null;

  // Filter groups and items based on role
  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (isSupport) return allowedPages!.includes(item.href);
        if (item.superAdminOnly && isSupport) return false;
        return true;
      }),
    }))
    .filter((group) => {
      return group.items.length > 0;
    });

  const loadBadgeCounts = useCallback(async () => {
    const supabase = createClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [ticketsResult, errorsResult, pastDueResult, newSubsResult, newSignupsResult] = await Promise.all([
      supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("error_logs")
        .select("*", { count: "exact", head: true })
        .eq("resolved", false),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "past_due"),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneDayAgo),
      supabase
        .from("organizations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneDayAgo),
    ]);

    const newTicketCount = ticketsResult.count || 0;
    const prevCount = prevTicketCount.current;
    const pastDueCount = pastDueResult.count || 0;
    const newSubsCount = newSubsResult.count || 0;

    setBadges({
      newTickets: newTicketCount,
      unresolvedErrors: errorsResult.count || 0,
      pastDueSubs: pastDueCount,
      newSubs: pastDueCount > 0 ? pastDueCount : newSubsCount,
      newSignups: newSignupsResult.count || 0,
    });

    // Browser notification if ticket count increased (and not first load)
    if (prevCount > 0 && newTicketCount > prevCount) {
      const diff = newTicketCount - prevCount;
      showBrowserNotification(
        `${diff} new ticket${diff > 1 ? "s" : ""}`,
        "New support ticket received in TeamPrompt"
      );
    }

    prevTicketCount.current = newTicketCount;
  }, []);

  useEffect(() => {
    loadBadgeCounts();

    // Fallback polling every 60s
    const interval = setInterval(loadBadgeCounts, 60000);

    // Supabase Realtime: subscribe to new feedback inserts + updates
    const supabase = createClient();

    const feedbackChannel = supabase
      .channel("admin-nav-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feedback" }, () => loadBadgeCounts())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "feedback" }, () => loadBadgeCounts())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "error_logs" }, () => loadBadgeCounts())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "subscriptions" }, () => {
        loadBadgeCounts();
        showBrowserNotification("New subscription", "A new subscription was created in TeamPrompt");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "subscriptions" }, () => loadBadgeCounts())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "organizations" }, () => {
        loadBadgeCounts();
        showBrowserNotification("New signup", "A new organization signed up for TeamPrompt");
      })
      .subscribe();

    // Request notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(interval);
      supabase.removeChannel(feedbackChannel);
    };
  }, [loadBadgeCounts]);

  const renderNavItem = (item: NavItem, mobile?: boolean) => {
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
          <span className={cn(
            "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium",
            item.badgeKey === "newSubs" && badges.pastDueSubs > 0
              ? "bg-red-500/15 text-red-400"
              : item.badgeKey === "newSubs"
                ? "bg-green-500/15 text-green-400"
                : item.badgeKey === "newSignups"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-blue-500/15 text-blue-400"
          )}>
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
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => renderNavItem(item, true))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:block w-64 min-h-[calc(100vh-64px)] bg-slate-900 text-white p-4">
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const n = new Notification(title, {
    body,
    icon: "/brand/logo-icon-blue.svg",
    tag: "teamprompt-ticket",
  });

  n.onclick = () => {
    window.focus();
    window.location.href = "/admin/tickets";
    n.close();
  };
}
