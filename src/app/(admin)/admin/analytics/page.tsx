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
import {
  BarChart3,
  Loader2,
  Users,
  Building2,
  Archive,
  TrendingUp,
} from "lucide-react";

interface GrowthData {
  month: string;
  orgs: number;
  users: number;
  prompts: number;
}

export default function AnalyticsPage() {
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [topOrgs, setTopOrgs] = useState<{ name: string; prompts: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const supabase = createClient();

    // Get all orgs, users, prompts with created_at for monthly grouping
    const [orgsRes, usersRes, promptsRes] = await Promise.all([
      supabase.from("organizations").select("id, name, created_at"),
      supabase.from("profiles").select("created_at"),
      supabase.from("prompts").select("org_id, created_at"),
    ]);

    // Group by month (last 6 months)
    const months: GrowthData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const orgsCount = (orgsRes.data || []).filter(
        (o: { created_at: string }) => o.created_at.startsWith(key)
      ).length;
      const usersCount = (usersRes.data || []).filter(
        (u: { created_at: string }) => u.created_at.startsWith(key)
      ).length;
      const promptsCount = (promptsRes.data || []).filter(
        (p: { created_at: string }) => p.created_at.startsWith(key)
      ).length;

      months.push({ month: label, orgs: orgsCount, users: usersCount, prompts: promptsCount });
    }
    setGrowthData(months);

    // Top orgs by prompt count
    const orgPromptCounts = new Map<string, number>();
    const orgNames = new Map(
      (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
    );
    (promptsRes.data || []).forEach((p: { org_id: string }) => {
      orgPromptCounts.set(p.org_id, (orgPromptCounts.get(p.org_id) || 0) + 1);
    });
    const top = Array.from(orgPromptCounts.entries())
      .map(([id, count]) => ({ name: orgNames.get(id) || "Unknown", prompts: count }))
      .sort((a, b) => b.prompts - a.prompts)
      .slice(0, 10);
    setTopOrgs(top);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const maxVal = Math.max(
    ...growthData.map((d) => Math.max(d.orgs, d.users, d.prompts)),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Platform-wide growth and usage</p>
      </div>

      {/* Growth Chart (simple bar representation) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Growth (Last 6 Months)
          </CardTitle>
          <CardDescription>New signups per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {growthData.map((d) => (
              <div key={d.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium w-16">{d.month}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {d.orgs}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {d.users}
                    </span>
                    <span className="flex items-center gap-1">
                      <Archive className="h-3 w-3" /> {d.prompts}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 h-5">
                  <div
                    className="bg-blue-500 rounded-sm"
                    style={{ width: `${(d.orgs / maxVal) * 100}%`, minWidth: d.orgs > 0 ? "4px" : "0" }}
                  />
                  <div
                    className="bg-green-500 rounded-sm"
                    style={{ width: `${(d.users / maxVal) * 100}%`, minWidth: d.users > 0 ? "4px" : "0" }}
                  />
                  <div
                    className="bg-violet-500 rounded-sm"
                    style={{ width: `${(d.prompts / maxVal) * 100}%`, minWidth: d.prompts > 0 ? "4px" : "0" }}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-6 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Orgs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500" /> Users
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> Prompts
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Organizations by Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topOrgs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topOrgs.map((org, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {org.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {org.prompts}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(org.prompts / (topOrgs[0]?.prompts || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
