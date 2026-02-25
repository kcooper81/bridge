"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Building2,
  Users,
  Archive,
  Loader2,
  DollarSign,
  AlertTriangle,
  Ticket,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  UserPlus,
  Shield,
} from "lucide-react";

interface ProtectionCoverage {
  protected: number;
  inactive: number;
  unprotected: number;
  noExtension: number;
}

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalPrompts: number;
  newOrgsThisWeek: number;
  newOrgsLastWeek: number;
  newOrgsThisMonth: number;
  mrr: number;
  planDistribution: {
    free: number;
    pro: number;
    team: number;
    business: number;
  };
  protectionCoverage: ProtectionCoverage;
}

interface AlertItem {
  type: string;
  count: number;
  label: string;
  href: string;
  color: string;
  icon: React.ElementType;
}

interface RecentSignup {
  id: string;
  name: string;
  createdAt: string;
  plan: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const supabase = createClient();

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      orgsResult,
      usersResult,
      promptsResult,
      subsResult,
      orgsThisWeekResult,
      orgsLastWeekResult,
      orgsThisMonthResult,
      newTicketsResult,
      unresolvedErrorsResult,
      recentOrgsResult,
      protectionResult,
    ] = await Promise.all([
      supabase.from("organizations").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("prompts").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("plan, status, org_id, seats"),
      supabase.from("organizations").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek.toISOString()),
      supabase.from("organizations").select("*", { count: "exact", head: true }).gte("created_at", startOfLastWeek.toISOString()).lt("created_at", startOfWeek.toISOString()),
      supabase.from("organizations").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
      supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("error_logs").select("*", { count: "exact", head: true }).eq("resolved", false),
      supabase.from("organizations").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("profiles").select("extension_status, last_extension_active"),
    ]);

    const planDistribution = { free: 0, pro: 0, team: 0, business: 0 };
    let pastDueCount = 0;
    let totalMrr = 0;

    const planPrices: Record<string, number> = { free: 0, pro: 9, team: 7, business: 12 };

    (subsResult.data || []).forEach((sub: { plan: string; status: string; seats?: number }) => {
      const plan = sub.plan || "free";
      if (plan in planDistribution) {
        planDistribution[plan as keyof typeof planDistribution]++;
      }
      if (sub.status === "past_due") pastDueCount++;
      if (sub.status === "active" || sub.status === "trialing") {
        const seats = sub.seats || 1;
        totalMrr += (planPrices[plan] || 0) * seats;
      }
    });

    // Compute protection coverage
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    const protectionCoverage: ProtectionCoverage = { protected: 0, inactive: 0, unprotected: 0, noExtension: 0 };
    (protectionResult.data || []).forEach((p: { extension_status: string | null; last_extension_active: string | null }) => {
      const status = p.extension_status || "unknown";
      if (status === "session_lost") {
        protectionCoverage.unprotected++;
      } else if (status === "active" && p.last_extension_active) {
        if (new Date(p.last_extension_active).getTime() > thirtyMinAgo) {
          protectionCoverage.protected++;
        } else {
          protectionCoverage.inactive++;
        }
      } else {
        protectionCoverage.noExtension++;
      }
    });

    const recentOrgIds = recentOrgsResult.data?.map((o: { id: string }) => o.id) || [];
    const { data: recentSubs } = recentOrgIds.length > 0
      ? await supabase.from("subscriptions").select("org_id, plan").in("org_id", recentOrgIds)
      : { data: [] };

    const recentSubMap = new Map((recentSubs || []).map((s: { org_id: string; plan: string }) => [s.org_id, s.plan]));

    setStats({
      totalOrganizations: orgsResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalPrompts: promptsResult.count || 0,
      newOrgsThisWeek: orgsThisWeekResult.count || 0,
      newOrgsLastWeek: orgsLastWeekResult.count || 0,
      newOrgsThisMonth: orgsThisMonthResult.count || 0,
      mrr: totalMrr,
      planDistribution,
      protectionCoverage,
    });

    const alertItems: AlertItem[] = [];
    const newTicketCount = newTicketsResult.count || 0;
    const unresolvedErrorCount = unresolvedErrorsResult.count || 0;

    if (newTicketCount > 0) {
      alertItems.push({
        type: "tickets",
        count: newTicketCount,
        label: "new support tickets",
        href: "/admin/tickets",
        color: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200",
        icon: Ticket,
      });
    }
    if (unresolvedErrorCount > 0) {
      alertItems.push({
        type: "errors",
        count: unresolvedErrorCount,
        label: "unresolved errors",
        href: "/admin/errors",
        color: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
        icon: AlertTriangle,
      });
    }
    if (pastDueCount > 0) {
      alertItems.push({
        type: "pastdue",
        count: pastDueCount,
        label: "past-due subscriptions",
        href: "/admin/subscriptions",
        color: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200",
        icon: CreditCard,
      });
    }
    setAlerts(alertItems);

    setRecentSignups(
      (recentOrgsResult.data || []).map((org: { id: string; name: string; created_at: string }) => ({
        id: org.id,
        name: org.name,
        createdAt: org.created_at,
        plan: recentSubMap.get(org.id) || "free",
      }))
    );

    setLoading(false);
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const weekOverWeekChange = stats
    ? stats.newOrgsLastWeek > 0
      ? Math.round(
          ((stats.newOrgsThisWeek - stats.newOrgsLastWeek) /
            stats.newOrgsLastWeek) *
            100
        )
      : stats.newOrgsThisWeek > 0
        ? 100
        : 0
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and key metrics
        </p>
      </div>

      {/* Attention Needed Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {alerts.map((alert) => (
            <Link key={alert.type} href={alert.href}>
              <div
                className={`rounded-lg border p-4 ${alert.color} hover:opacity-80 transition-opacity cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <alert.icon className="h-5 w-5" />
                  <div>
                    <p className="text-2xl font-bold">{alert.count}</p>
                    <p className="text-sm">{alert.label}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.mrr.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${((stats?.mrr || 0) * 12).toFixed(0)} ARR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalOrganizations || 0}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {weekOverWeekChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600" />
              )}
              <p
                className={`text-xs ${weekOverWeekChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats?.newOrgsThisWeek} this week (
                {weekOverWeekChange >= 0 ? "+" : ""}
                {weekOverWeekChange}%)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalOrganizations
                ? (stats.totalUsers / stats.totalOrganizations).toFixed(1)
                : "0"}{" "}
              avg per org
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPrompts || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalOrganizations
                ? (stats.totalPrompts / stats.totalOrganizations).toFixed(1)
                : "0"}{" "}
              avg per org
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan Distribution
          </CardTitle>
          <CardDescription>Breakdown of subscriptions by plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.planDistribution.free || 0}
              </div>
              <div className="text-sm text-muted-foreground">Free</div>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.planDistribution.pro || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pro</div>
            </div>
            <div className="text-center p-4 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.planDistribution.team || 0}
              </div>
              <div className="text-sm text-muted-foreground">Team</div>
            </div>
            <div className="text-center p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.planDistribution.business || 0}
              </div>
              <div className="text-sm text-muted-foreground">Business</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protection Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Protection Coverage
          </CardTitle>
          <CardDescription>Extension protection status across all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.protectionCoverage.protected || 0}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Protected
              </div>
            </div>
            <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.protectionCoverage.inactive || 0}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                Inactive
              </div>
            </div>
            <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.protectionCoverage.unprotected || 0}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                Unprotected
              </div>
            </div>
            <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold">
                {stats?.protectionCoverage.noExtension || 0}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                No Extension
              </div>
            </div>
          </div>
          {(() => {
            const total =
              (stats?.protectionCoverage.protected || 0) +
              (stats?.protectionCoverage.inactive || 0) +
              (stats?.protectionCoverage.unprotected || 0) +
              (stats?.protectionCoverage.noExtension || 0);
            const pct = total > 0 ? Math.round(((stats?.protectionCoverage.protected || 0) / total) * 100) : 0;
            return (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Active protection rate</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Signups
            </CardTitle>
            <Link
              href="/admin/organizations"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentSignups.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent signups
            </p>
          ) : (
            <div className="space-y-3">
              {recentSignups.map((org) => (
                <Link
                  key={org.id}
                  href={`/admin/organizations/${org.id}`}
                  className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{org.name}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className="capitalize text-xs">
                      {org.plan}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {getTimeAgo(org.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
