"use client";

import Link from "next/link";
import { useOrg } from "@/components/providers/org-provider";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Archive,
  BarChart3,
  BookOpen,
  Plus,
  Settings,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Analytics } from "@/lib/types";
import type { PromptStatus } from "@/lib/types";

const STATUS_COLORS: Record<PromptStatus, string> = {
  draft: "bg-muted-foreground/60",
  pending: "bg-amber-500",
  approved: "bg-primary",
  archived: "bg-destructive/60",
};

const STATUS_BADGE_VARIANT: Record<PromptStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  pending: "outline",
  approved: "default",
  archived: "destructive",
};

interface DashboardWidgetsProps {
  analytics: Analytics | null;
  loading: boolean;
}

export function DashboardWidgets({ analytics, loading }: DashboardWidgetsProps) {
  const { prompts, members, currentUserRole } = useOrg();

  if (loading) {
    return <WidgetsSkeleton />;
  }

  const statusCounts: Record<PromptStatus, number> = {
    draft: prompts.filter((p) => p.status === "draft").length,
    pending: prompts.filter((p) => p.status === "pending").length,
    approved: prompts.filter((p) => p.status === "approved").length,
    archived: prompts.filter((p) => p.status === "archived").length,
  };

  const totalForBar = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const recentPrompts = [...prompts]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const topPrompts = analytics?.topPrompts?.slice(0, 5) || [];

  // Usage trend (last 14 days)
  const dailyUsage = analytics?.dailyUsage?.slice(-14) || [];
  const maxDaily = Math.max(...dailyUsage.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Prompts"
          value={prompts.length}
          icon={<Archive className="h-5 w-5" />}
        />
        <StatCard
          label="Team Members"
          value={members.length}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Uses This Week"
          value={analytics?.usesThisWeek ?? 0}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Avg Rating"
          value={analytics?.avgRating ? analytics.avgRating.toFixed(1) : "—"}
          icon={<Star className="h-5 w-5" />}
        />
      </div>

      {/* Status Breakdown + Quick Actions */}
      <div className="grid lg:grid-cols-7 gap-6">
        {/* Prompt Status Breakdown */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Prompt Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalForBar === 0 ? (
              <p className="text-sm text-muted-foreground">No prompts yet. Create your first prompt to see status breakdown.</p>
            ) : (
              <>
                {/* Segmented bar */}
                <div className="h-3 rounded-full overflow-hidden flex">
                  {(["approved", "pending", "draft", "archived"] as PromptStatus[]).map((status) => {
                    const pct = (statusCounts[status] / totalForBar) * 100;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={status}
                        className={`${STATUS_COLORS[status]} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["approved", "pending", "draft", "archived"] as PromptStatus[]).map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                      <span className="text-sm capitalize">{status}</span>
                      <span className="text-sm font-semibold tabular-nums ml-auto">{statusCounts[status]}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Prompt", href: "/vault", icon: Plus },
                { label: "Analytics", href: "/analytics", icon: BarChart3 },
                currentUserRole === "member"
                  ? { label: "My Settings", href: "/settings", icon: Settings }
                  : { label: "Manage Team", href: "/team", icon: Users },
                { label: "Templates", href: "/templates", icon: BookOpen },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border transition-colors"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Prompts + Recent Prompts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Prompts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Top Prompts</CardTitle>
            <Link href="/analytics" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all &rarr;
            </Link>
          </CardHeader>
          <CardContent>
            {topPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage data yet. Prompts will appear here once your team starts using them.</p>
            ) : (
              <div className="space-y-3">
                {topPrompts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <p className="flex-1 text-sm font-medium truncate min-w-0">{p.title}</p>
                    <Badge variant="secondary" className="text-xs tabular-nums shrink-0">
                      {p.usage_count} uses
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prompts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Prompts</CardTitle>
            <Link href="/vault" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all &rarr;
            </Link>
          </CardHeader>
          <CardContent>
            {recentPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prompts yet. Create one to get started.</p>
            ) : (
              <div className="space-y-3">
                {recentPrompts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant={STATUS_BADGE_VARIANT[p.status]}
                      className="text-[10px] px-1.5 py-0 shrink-0 capitalize"
                    >
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend */}
      {dailyUsage.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Usage Trend — Last 14 Days</CardTitle>
            <Link href="/analytics" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View full analytics &rarr;
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[3px] h-24">
              {dailyUsage.map((d) => (
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
              <span>{dailyUsage[0]?.date}</span>
              <span>{dailyUsage[dailyUsage.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WidgetsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4 h-48 rounded-lg bg-muted animate-pulse" />
        <div className="lg:col-span-3 h-48 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-56 rounded-lg bg-muted animate-pulse" />
        <div className="h-56 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}
