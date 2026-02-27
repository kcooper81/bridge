"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  BarChart3,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Shield,
  Braces,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpgradeGate } from "@/components/upgrade";
import { getAnalytics, getEffectivenessMetrics } from "@/lib/vault-api";
import type { EffectivenessMetrics } from "@/lib/vault-api";
import type { Analytics } from "@/lib/types";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";

export default function AnalyticsPage() {
  const { teams, members, noOrg } = useOrg();
  const { canAccess } = useSubscription();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [effectiveness, setEffectiveness] = useState<EffectivenessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    Promise.all([getAnalytics(), getEffectivenessMetrics()])
      .then(([a, e]) => {
        setAnalytics(a);
        setEffectiveness(e);
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setFetchError(true);
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
        <UpgradeGate feature="analytics" />
      </>
    );
  }

  if (loading) {
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

  if (fetchError || !analytics) {
    return (
      <>
        <PageHeader title="Analytics" description="Usage insights and trends for your team" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Unable to load analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please try refreshing the page.
          </p>
        </div>
      </>
    );
  }

  const teamNames = new Map(teams.map((t) => [t.id, t.name]));
  const maxTeamUsage = Math.max(...Object.values(analytics.teamUsage), 1);

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

      {/* Team Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage by Team</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.teamUsage).length === 0 ? (
            <p className="text-sm text-muted-foreground">No team data — assign prompts to teams to see usage breakdown.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(analytics.teamUsage)
                .sort(([, a], [, b]) => b - a)
                .map(([tid, count]) => (
                  <div key={tid}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{teamNames.get(tid) || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / maxTeamUsage) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Prompt Effectiveness Section ─── */}
      {effectiveness && (
        <>
          <div className="flex items-center gap-2 mt-8 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Prompt Effectiveness</h2>
          </div>

          {/* Rating Distribution */}
          {effectiveness.ratingDistribution.some((b) => b.count > 0) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {effectiveness.ratingDistribution.map((bucket) => {
                    const maxBucket = Math.max(...effectiveness.ratingDistribution.map((b) => b.count), 1);
                    return (
                      <div key={bucket.bucket} className="flex items-center gap-3">
                        <span className="text-sm w-10 text-right tabular-nums">{bucket.bucket}</span>
                        <Star className="h-3 w-3 text-yellow-500" />
                        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-500/80"
                            style={{ width: `${Math.max((bucket.count / maxBucket) * 100, bucket.count > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 tabular-nums">{bucket.count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            {/* Top Effective Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  Top Effective Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {effectiveness.topRated.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rated prompts yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prompt</TableHead>
                        <TableHead className="w-[80px]">Rating</TableHead>
                        <TableHead className="w-[70px]">Uses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectiveness.topRated.slice(0, 8).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="text-sm font-medium truncate max-w-[200px]">{p.title}</p>
                            {p.ownerName && (
                              <p className="text-xs text-muted-foreground">{p.ownerName}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm tabular-nums">{p.avgRating.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs tabular-nums">
                              {p.usageCount}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Least Effective Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  Needs Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {effectiveness.leastEffective.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No low-rated prompts with sufficient usage</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prompt</TableHead>
                        <TableHead className="w-[80px]">Rating</TableHead>
                        <TableHead className="w-[70px]">Uses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectiveness.leastEffective.slice(0, 8).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="text-sm font-medium truncate max-w-[200px]">{p.title}</p>
                            {p.ownerName && (
                              <p className="text-xs text-muted-foreground">{p.ownerName}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm tabular-nums">{p.avgRating.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs tabular-nums">
                              {p.usageCount}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Unrated High-Usage */}
          {effectiveness.unratedHighUsage.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Needs Attention — High Usage, No Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="w-[80px]">Uses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effectiveness.unratedHighUsage.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{p.title}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.ownerName || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs tabular-nums">
                            {p.usageCount}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
}
