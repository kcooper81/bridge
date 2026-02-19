"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Star,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Shield,
  Braces,
} from "lucide-react";
import { getAnalytics } from "@/lib/vault-api";
import type { Analytics } from "@/lib/types";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";

export default function AnalyticsPage() {
  const { departments, members, noOrg } = useOrg();
  const { canAccess } = useSubscription();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch((err) => {
        console.error("Failed to load analytics:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (noOrg) {
    return (
      <>
        <PageHeader title="Analytics" />
        <NoOrgBanner />
      </>
    );
  }

  if (!canAccess("analytics")) {
    return (
      <>
        <PageHeader title="Analytics" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Analytics requires Pro or higher</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upgrade your plan to access usage analytics and insights.
          </p>
        </div>
      </>
    );
  }

  if (loading || !analytics) {
    return (
      <>
        <PageHeader title="Analytics" description="Usage insights and trends for your team" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  const deptNames = new Map(departments.map((d) => [d.id, d.name]));
  const maxDeptUsage = Math.max(...Object.values(analytics.departmentUsage), 1);

  // Week-over-week trend
  const weekTrend =
    analytics.usesLastWeek > 0
      ? ((analytics.usesThisWeek - analytics.usesLastWeek) / analytics.usesLastWeek) * 100
      : analytics.usesThisWeek > 0
        ? 100
        : 0;

  // Max daily for chart scaling
  const maxDaily = Math.max(...(analytics.dailyUsage || []).map((d) => d.count), 1);

  return (
    <>
      <PageHeader title="Analytics" description="Usage insights and trends for your team" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Prompts" value={analytics.totalPrompts} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Total Uses" value={analytics.totalUses} icon={<Zap className="h-5 w-5" />} />
        <StatCard label="Avg Rating" value={analytics.avgRating.toFixed(1)} icon={<Star className="h-5 w-5" />} />
        <StatCard
          label="Uses This Week"
          value={analytics.usesThisWeek}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Week Trend</p>
              <p className="text-xl font-bold tabular-nums">
                {weekTrend >= 0 ? "+" : ""}{weekTrend.toFixed(0)}%
              </p>
            </div>
            {weekTrend >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active Members</p>
              <p className="text-xl font-bold tabular-nums">{members.length}</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Templates</p>
              <p className="text-xl font-bold tabular-nums">{analytics.templateCount}</p>
            </div>
            <Braces className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Guardrail Blocks</p>
              <p className="text-xl font-bold tabular-nums">{analytics.guardrailBlocks}</p>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Usage chart (30-day bar chart) */}
      {analytics.dailyUsage && analytics.dailyUsage.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Daily Usage — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[2px] h-32">
              {analytics.dailyUsage.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors min-h-[2px]"
                    style={{ height: `${Math.max((d.count / maxDaily) * 100, 2)}%` }}
                  />
                  <div className="absolute -top-8 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.date}: {d.count} uses
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{analytics.dailyUsage[0]?.date}</span>
              <span>{analytics.dailyUsage[analytics.dailyUsage.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Top Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topPrompts.slice(0, 8).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs tabular-nums">
                      {p.usage_count} uses
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per-User Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage by Member</CardTitle>
          </CardHeader>
          <CardContent>
            {(!analytics.userUsage || analytics.userUsage.length === 0) ? (
              <p className="text-sm text-muted-foreground">No usage data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.userUsage.slice(0, 8).map((u, i) => {
                  const maxUser = analytics.userUsage[0]?.count || 1;
                  return (
                    <div key={u.userId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                          <span className="text-sm truncate">{u.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{u.count} actions</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden ml-7">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(u.count / maxUser) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.departmentUsage).length === 0 ? (
            <p className="text-sm text-muted-foreground">No department data — assign prompts to departments to see usage breakdown.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(analytics.departmentUsage)
                .sort(([, a], [, b]) => b - a)
                .map(([deptId, count]) => (
                  <div key={deptId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{deptNames.get(deptId) || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / maxDeptUsage) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
