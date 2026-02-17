"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Star, TrendingUp, Zap } from "lucide-react";
import { getAnalytics } from "@/lib/vault-api";
import type { Analytics } from "@/lib/types";

export default function AnalyticsPage() {
  const { departments } = useOrg();
  const { canAccess } = useSubscription();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, []);

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
        <PageHeader title="Analytics" description="Usage insights for your team" />
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

  return (
    <>
      <PageHeader title="Analytics" description="Usage insights for your team" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Prompts" value={analytics.totalPrompts} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Total Uses" value={analytics.totalUses} icon={<Zap className="h-5 w-5" />} />
        <StatCard label="Avg Rating" value={analytics.avgRating.toFixed(1)} icon={<Star className="h-5 w-5" />} />
        <StatCard label="Uses This Week" value={analytics.usesThisWeek} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Department Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.departmentUsage).length === 0 ? (
              <p className="text-sm text-muted-foreground">No department data</p>
            ) : (
              <div className="space-y-3">
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
      </div>
    </>
  );
}
