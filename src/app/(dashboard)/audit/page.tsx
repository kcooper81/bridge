"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { UpgradeGate } from "@/components/upgrade";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Download,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { getAuditData, type AuditData } from "@/lib/audit-api";
import { ChartCard } from "@/components/charts/chart-card";
import { AreaChart } from "@/components/charts/area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { SankeyDiagram } from "@/components/charts/sankey-diagram";
import { Heatmap } from "@/components/charts/heatmap";
import { cn } from "@/lib/utils";

function NoOrgBanner() {
  return (
    <Card className="p-8 text-center text-muted-foreground">
      <p>Create or join an organization to see audit data.</p>
    </Card>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-3 w-20 bg-muted rounded mb-3" />
            <div className="h-8 w-24 bg-muted rounded" />
          </Card>
        ))}
      </div>
      <Card className="p-6 h-80 animate-pulse">
        <div className="h-4 w-40 bg-muted rounded" />
      </Card>
    </div>
  );
}

export default function AuditPage() {
  const { org, loading: orgLoading, noOrg, currentUserRole } = useOrg();
  const { canAccess } = useSubscription();
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState<"30d" | "90d">("30d");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditData();
      setData(result);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!org || noOrg) return;
    refresh();
  }, [org, noOrg, refresh]);

  // Role gate
  const isAdminOrManager = currentUserRole === "admin" || currentUserRole === "manager";

  if (noOrg) {
    return (
      <>
        <PageHeader title="Audit & Compliance" />
        <NoOrgBanner />
      </>
    );
  }

  if (!isAdminOrManager) {
    return (
      <>
        <PageHeader title="Audit & Compliance" />
        <Card className="p-8 text-center text-muted-foreground">
          <p>This page is only available to admins and managers.</p>
        </Card>
      </>
    );
  }

  if (!canAccess("analytics")) {
    return (
      <>
        <PageHeader title="Audit & Compliance" />
        <UpgradeGate feature="analytics" />
      </>
    );
  }

  if (orgLoading || loading) {
    return (
      <>
        <PageHeader title="Audit & Compliance" description="Security insights, violation analytics, and compliance reporting" />
        <PageSkeleton />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader title="Audit & Compliance" description="Security insights, violation analytics, and compliance reporting" />
        <Card className="p-8 text-center text-muted-foreground">
          <p>Unable to load audit data. Please try again.</p>
        </Card>
      </>
    );
  }

  const trendData = trendRange === "30d" ? data.violationTrend.slice(-30) : data.violationTrend;
  const formattedTrend = trendData.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <>
      <PageHeader
        title="Audit & Compliance"
        description="Security insights, violation analytics, and compliance reporting"
        actions={
          <Button variant="outline" size="sm" onClick={() => exportAuditCSV(data)}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* ━━━ Hero Stats ━━━ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Activity}
          label="Total Interactions"
          value={data.totalInteractions.toLocaleString()}
          sublabel="Last 90 days"
        />
        <StatCard
          icon={ShieldAlert}
          label="Violations Blocked"
          value={data.totalViolationsBlocked.toLocaleString()}
          sublabel={`${data.totalViolationsWarned} warned`}
          color="text-red-500"
        />
        <StatCard
          icon={ShieldCheck}
          label="Compliance Score"
          value={`${data.complianceScore}%`}
          sublabel={data.complianceScore >= 95 ? "Excellent" : data.complianceScore >= 80 ? "Good" : "Needs attention"}
          color={data.complianceScore >= 95 ? "text-emerald-500" : data.complianceScore >= 80 ? "text-blue-500" : "text-amber-500"}
        />
        <StatCard
          icon={Shield}
          label="Active Policies"
          value={data.activePolicies.toString()}
          sublabel={`${data.policyCoverage.filter((p) => p.enabled).length} frameworks`}
        />
      </div>

      {/* ━━━ Sankey: Teams → AI Tools ━━━ */}
      <ChartCard
        title="Interaction Flow"
        description="How teams interact with AI tools"
        className="mb-6"
      >
        <SankeyDiagram
          nodes={data.sankeyNodes}
          links={data.sankeyLinks}
          height={350}
        />
      </ChartCard>

      {/* ━━━ Violation Trend + Heatmap ━━━ */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <ChartCard
          title="Violation Trend"
          description="Blocked and warned violations over time"
          actions={
            <div className="flex gap-1">
              {(["30d", "90d"] as const).map((r) => (
                <Button
                  key={r}
                  variant={trendRange === r ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setTrendRange(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          }
        >
          <AreaChart
            data={formattedTrend}
            xAxisKey="date"
            areas={[
              { dataKey: "blocked", color: "#ef4444", name: "Blocked" },
              { dataKey: "warned", color: "#f59e0b", name: "Warned" },
            ]}
            height={250}
            showLegend
          />
        </ChartCard>

        <ChartCard
          title="Violations by Time"
          description="When violations occur (day and hour)"
        >
          <Heatmap data={data.violationHeatmap} />
        </ChartCard>
      </div>

      {/* ━━━ Category Donut + Risk Histogram ━━━ */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <ChartCard
          title="Violations by Category"
          description="What types of data are being caught"
        >
          {data.violationsByCategory.length > 0 ? (
            <DonutChart data={data.violationsByCategory} height={260} />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
              No violation data yet
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Risk Score Distribution"
          description="Distribution of interaction risk scores"
        >
          <BarChart
            data={data.riskDistribution}
            xAxisKey="bucket"
            bars={[{ dataKey: "count", color: "hsl(var(--primary))", name: "Interactions" }]}
            height={260}
            showGrid={false}
          />
        </ChartCard>
      </div>

      {/* ━━━ Policy Coverage ━━━ */}
      <ChartCard
        title="Compliance Coverage"
        description="Status of regulatory framework policies"
        className="mb-6"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.policyCoverage.map((pack) => (
            <div
              key={pack.name}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4",
                pack.enabled
                  ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                  : "border-border"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                  pack.enabled ? "bg-emerald-500/10" : "bg-muted"
                )}
              >
                <ShieldCheck
                  className={cn(
                    "h-5 w-5",
                    pack.enabled ? "text-emerald-500" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{pack.name}</p>
                  {pack.enabled && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 border-0">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pack.enabled
                    ? `${pack.installedRules} of ${pack.totalRules} rules installed`
                    : `${pack.totalRules} rules available`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* ━━━ Top Triggered Rules ━━━ */}
      {data.topTriggeredRules.length > 0 && (
        <ChartCard
          title="Most Triggered Rules"
          description="Security rules with the highest violation count"
          className="mb-6"
        >
          <div className="space-y-2">
            {data.topTriggeredRules.map((rule, i) => {
              const maxCount = data.topTriggeredRules[0]?.count || 1;
              return (
                <div key={rule.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{rule.name}</span>
                      <Badge
                        variant={rule.severity === "block" ? "destructive" : "outline"}
                        className="text-[10px] h-5 shrink-0"
                      >
                        {rule.severity}
                      </Badge>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          rule.severity === "block" ? "bg-red-500" : "bg-amber-500"
                        )}
                        style={{ width: `${(rule.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-12 text-right shrink-0">
                    {rule.count}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}

      {/* ━━━ Usage Overview (migrated from analytics) ━━━ */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <ChartCard title="Daily Usage" description="Prompt usage over the last 30 days">
          <AreaChart
            data={data.dailyUsage.map((d) => ({
              ...d,
              date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            }))}
            xAxisKey="date"
            areas={[{ dataKey: "count", color: "hsl(var(--primary))", name: "Uses" }]}
            height={220}
          />
        </ChartCard>

        <ChartCard title="Top Prompts" description="Most used prompts by your team">
          <div className="space-y-2.5">
            {data.topPrompts.slice(0, 8).map((prompt, i) => (
              <div key={prompt.title} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm truncate flex-1">{prompt.title}</span>
                <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
                  {prompt.usageCount} uses
                </Badge>
              </div>
            ))}
            {data.topPrompts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No usage data yet</p>
            )}
          </div>
        </ChartCard>
      </div>
    </>
  );
}

// ── Stat Card ──

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel?: string;
  color?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", color || "text-primary")} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", color)}>{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </Card>
  );
}

// ── Export ──

function exportAuditCSV(data: AuditData) {
  const rows = [
    ["Metric", "Value"],
    ["Total Interactions", data.totalInteractions.toString()],
    ["Violations Blocked", data.totalViolationsBlocked.toString()],
    ["Violations Warned", data.totalViolationsWarned.toString()],
    ["Compliance Score", `${data.complianceScore}%`],
    ["Active Policies", data.activePolicies.toString()],
    [],
    ["Top Triggered Rules", "Count", "Severity", "Category"],
    ...data.topTriggeredRules.map((r) => [r.name, r.count.toString(), r.severity, r.category]),
    [],
    ["Category", "Violations"],
    ...data.violationsByCategory.map((c) => [c.name, c.value.toString()]),
    [],
    ["Risk Bucket", "Count"],
    ...data.riskDistribution.map((r) => [r.bucket, r.count.toString()]),
    [],
    ["Compliance Framework", "Installed Rules", "Total Rules", "Active"],
    ...data.policyCoverage.map((p) => [p.name, p.installedRules.toString(), p.totalRules.toString(), p.enabled ? "Yes" : "No"]),
  ];

  const csv = rows.map((row) => (row as string[]).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-report-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
