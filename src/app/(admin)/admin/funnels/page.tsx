"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard, StatCardRow } from "@/components/admin/admin-page-layout";
import {
  ArrowDown,
  CreditCard,
  Filter,
  Loader2,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
  FileText,
  Puzzle,
  BookOpen,
  ChevronRight,
} from "lucide-react";

// ─── Types ───

interface FunnelStep {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

interface FunnelData {
  // Core counts
  totalUsers: number;
  usersWithOrg: number;
  usersWithPrompts: number;
  usersWithMultiplePrompts: number;
  usersWithExtension: number;
  usersWithGuardrails: number;
  orgsWithSubscription: number;
  paidOrgs: number;

  // Time-based (period)
  newUsers: number;
  newOrgs: number;
  newPrompts: number;
  newSubscriptions: number;

  // Engagement
  activeUsersThisWeek: number;
  promptsUsedThisWeek: number;
  extensionActiveThisWeek: number;

  // Org-level funnel
  totalOrgs: number;
  orgsWithPrompts: number;
  orgsWithMultipleMembers: number;
  orgsWithGuardrails: number;
  orgsWithGuidelines: number;

  // Conversion detail
  trialOrgs: number;
  paidTeamOrgs: number;
  paidBusinessOrgs: number;

  // Top orgs by engagement
  topOrgs: { name: string; members: number; prompts: number; plan: string }[];
}

type Period = "7d" | "30d" | "90d" | "all";

export default function FunnelsPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Calculate period start date
      const periodStart = period === "all" ? null : new Date();
      if (periodStart && period !== "all") {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
        periodStart.setDate(periodStart.getDate() - days);
      }
      const periodISO = periodStart?.toISOString() ?? "2020-01-01T00:00:00Z";

      // Week ago for "active this week"
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoISO = weekAgo.toISOString();

      // Parallel data fetches
      const [
        profilesRes,
        orgsRes,
        promptsRes,
        subsRes,
        secRulesRes,
        guidelinesRes,
        usageEventsRes,
        orgMembersRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, org_id, created_at, last_extension_active"),
        supabase.from("organizations").select("id, name, plan, created_at"),
        supabase.from("prompts").select("id, org_id, owner_id, created_at"),
        supabase.from("subscriptions").select("id, org_id, plan, status, trial_ends_at, created_at"),
        supabase.from("security_rules").select("id, org_id, created_at"),
        supabase.from("guidelines").select("id, org_id, created_at"),
        supabase.from("usage_events").select("id, user_id, created_at").gte("created_at", weekAgoISO),
        supabase.from("profiles").select("org_id"),
      ]);

      const profiles = profilesRes.data || [];
      const orgs = orgsRes.data || [];
      const prompts = promptsRes.data || [];
      const subs = subsRes.data || [];
      const secRules = secRulesRes.data || [];
      const guidelines = guidelinesRes.data || [];
      const usageEvents = usageEventsRes.data || [];
      const orgMembers = orgMembersRes.data || [];

      // ─── Core Funnel Counts ───
      const totalUsers = profiles.length;
      const usersWithOrg = profiles.filter((p) => p.org_id).length;

      const userPromptSet = new Set(prompts.map((p) => p.owner_id).filter(Boolean));
      const usersWithPrompts = userPromptSet.size;

      // Users with 5+ prompts
      const userPromptCounts = new Map<string, number>();
      prompts.forEach((p) => {
        if (p.owner_id) userPromptCounts.set(p.owner_id, (userPromptCounts.get(p.owner_id) || 0) + 1);
      });
      const usersWithMultiplePrompts = Array.from(userPromptCounts.values()).filter((c) => c >= 5).length;

      const usersWithExtension = profiles.filter((p) => p.last_extension_active).length;

      const orgsWithSecRules = new Set(secRules.map((r) => r.org_id));
      const usersWithGuardrails = profiles.filter((p) => p.org_id && orgsWithSecRules.has(p.org_id)).length;

      const orgsWithSub = new Set(subs.filter((s) => s.status === "active" || s.status === "trialing").map((s) => s.org_id));
      const orgsWithSubscription = orgsWithSub.size;

      const paidSubs = subs.filter((s) => s.status === "active" && s.plan !== "free");
      const paidOrgs = new Set(paidSubs.map((s) => s.org_id)).size;

      // ─── Period-based ───
      const newUsers = profiles.filter((p) => p.created_at >= periodISO).length;
      const newOrgs = orgs.filter((o) => o.created_at >= periodISO).length;
      const newPrompts = prompts.filter((p) => p.created_at >= periodISO).length;
      const newSubscriptions = subs.filter((s) => s.created_at >= periodISO).length;

      // ─── Engagement (this week) ───
      const activeUserIds = new Set(usageEvents.map((e) => e.user_id));
      const activeUsersThisWeek = activeUserIds.size;
      const promptsUsedThisWeek = usageEvents.length;
      const extensionActiveThisWeek = profiles.filter(
        (p) => p.last_extension_active && p.last_extension_active >= weekAgoISO
      ).length;

      // ─── Org-level Funnel ───
      const totalOrgs = orgs.length;
      const orgPromptSet = new Set(prompts.map((p) => p.org_id));
      const orgsWithPrompts = orgs.filter((o) => orgPromptSet.has(o.id)).length;

      const orgMemberCounts = new Map<string, number>();
      orgMembers.forEach((m) => {
        if (m.org_id) orgMemberCounts.set(m.org_id, (orgMemberCounts.get(m.org_id) || 0) + 1);
      });
      const orgsWithMultipleMembers = Array.from(orgMemberCounts.entries()).filter(([, c]) => c >= 2).length;

      const orgsWithGuardrails = orgsWithSecRules.size;
      const orgGuidelineSet = new Set(guidelines.map((g) => g.org_id));
      const orgsWithGuidelines = orgGuidelineSet.size;

      // ─── Subscription Breakdown ───
      const trialOrgs = subs.filter((s) => s.status === "trialing").length;
      const paidTeamOrgs = paidSubs.filter((s) => s.plan === "team").length;
      const paidBusinessOrgs = paidSubs.filter((s) => s.plan === "business").length;

      // ─── Top Orgs ───
      const orgPromptCounts = new Map<string, number>();
      prompts.forEach((p) => orgPromptCounts.set(p.org_id, (orgPromptCounts.get(p.org_id) || 0) + 1));

      const topOrgs = orgs
        .map((o) => ({
          name: o.name,
          members: orgMemberCounts.get(o.id) || 0,
          prompts: orgPromptCounts.get(o.id) || 0,
          plan: o.plan,
        }))
        .sort((a, b) => b.prompts - a.prompts)
        .slice(0, 10);

      setData({
        totalUsers,
        usersWithOrg,
        usersWithPrompts,
        usersWithMultiplePrompts,
        usersWithExtension,
        usersWithGuardrails,
        orgsWithSubscription,
        paidOrgs,
        newUsers,
        newOrgs,
        newPrompts,
        newSubscriptions,
        activeUsersThisWeek,
        promptsUsedThisWeek,
        extensionActiveThisWeek,
        totalOrgs,
        orgsWithPrompts,
        orgsWithMultipleMembers,
        orgsWithGuardrails,
        orgsWithGuidelines,
        trialOrgs,
        paidTeamOrgs,
        paidBusinessOrgs,
        topOrgs,
      });
    } catch (err) {
      console.error("Failed to load funnel data:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground p-6">Failed to load data.</p>;

  // ─── Funnel helpers ───
  function convRate(count: number, total: number) {
    if (total === 0) return "–";
    return `${((count / total) * 100).toFixed(1)}%`;
  }

  // ─── User Activation Funnel ───
  const userFunnel: FunnelStep[] = [
    { label: "Signed Up", count: data.totalUsers, icon: <UserPlus className="h-4 w-4" />, color: "bg-blue-500" },
    { label: "Joined an Org", count: data.usersWithOrg, icon: <Users className="h-4 w-4" />, color: "bg-indigo-500" },
    { label: "Created a Prompt", count: data.usersWithPrompts, icon: <FileText className="h-4 w-4" />, color: "bg-violet-500" },
    { label: "Installed Extension", count: data.usersWithExtension, icon: <Puzzle className="h-4 w-4" />, color: "bg-purple-500" },
    { label: "5+ Prompts (Power User)", count: data.usersWithMultiplePrompts, icon: <Zap className="h-4 w-4" />, color: "bg-amber-500" },
  ];

  // ─── Org Conversion Funnel ───
  const orgFunnel: FunnelStep[] = [
    { label: "Created Org", count: data.totalOrgs, icon: <Users className="h-4 w-4" />, color: "bg-blue-500" },
    { label: "Added Prompts", count: data.orgsWithPrompts, icon: <FileText className="h-4 w-4" />, color: "bg-cyan-500" },
    { label: "Multiple Members", count: data.orgsWithMultipleMembers, icon: <UserPlus className="h-4 w-4" />, color: "bg-teal-500" },
    { label: "Set Up Guidelines", count: data.orgsWithGuidelines, icon: <BookOpen className="h-4 w-4" />, color: "bg-green-500" },
    { label: "Set Up Guardrails", count: data.orgsWithGuardrails, icon: <Shield className="h-4 w-4" />, color: "bg-emerald-500" },
    { label: "Active Subscription", count: data.orgsWithSubscription, icon: <CreditCard className="h-4 w-4" />, color: "bg-amber-500" },
    { label: "Paid Plan", count: data.paidOrgs, icon: <TrendingUp className="h-4 w-4" />, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funnel Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            User activation, org conversion, and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Stats */}
      <StatCardRow>
        <StatCard label="New Users" value={data.newUsers} icon={UserPlus} color="blue" subtitle={`${period} period`} />
        <StatCard label="New Orgs" value={data.newOrgs} icon={Users} color="green" subtitle={`${period} period`} />
        <StatCard label="New Prompts" value={data.newPrompts} icon={FileText} color="purple" subtitle={`${period} period`} />
        <StatCard label="New Subscriptions" value={data.newSubscriptions} icon={CreditCard} color="amber" subtitle={`${period} period`} />
      </StatCardRow>

      {/* Weekly Engagement */}
      <StatCardRow>
        <StatCard label="Active Users (7d)" value={data.activeUsersThisWeek} icon={Zap} color="blue" subtitle={`of ${data.totalUsers} total`} />
        <StatCard label="Prompts Used (7d)" value={data.promptsUsedThisWeek} icon={FileText} color="green" />
        <StatCard label="Extension Active (7d)" value={data.extensionActiveThisWeek} icon={Puzzle} color="purple" subtitle={`of ${data.usersWithExtension} installed`} />
        <StatCard
          label="Overall Conversion"
          value={convRate(data.paidOrgs, data.totalOrgs)}
          icon={TrendingUp}
          color="amber"
          subtitle={`${data.paidOrgs} paid of ${data.totalOrgs} orgs`}
        />
      </StatCardRow>

      {/* User Activation Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Activation Funnel</CardTitle>
          <CardDescription>How individual users progress through activation milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart steps={userFunnel} />
        </CardContent>
      </Card>

      {/* Org Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Conversion Funnel</CardTitle>
          <CardDescription>How organizations progress from creation to paid subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart steps={orgFunnel} />
        </CardContent>
      </Card>

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Breakdown</CardTitle>
          <CardDescription>Current subscription distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold">{data.totalOrgs - data.orgsWithSubscription}</p>
              <p className="text-xs text-muted-foreground mt-1">Free</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <p className="text-3xl font-bold text-blue-600">{data.trialOrgs}</p>
              <p className="text-xs text-muted-foreground mt-1">Trialing</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <p className="text-3xl font-bold text-green-600">{data.paidTeamOrgs}</p>
              <p className="text-xs text-muted-foreground mt-1">Team Plan</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <p className="text-3xl font-bold text-purple-600">{data.paidBusinessOrgs}</p>
              <p className="text-xs text-muted-foreground mt-1">Business Plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Orgs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Organizations by Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topOrgs.map((org, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.members} member{org.members !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{org.prompts} prompts</span>
                  <Badge variant={org.plan === "free" ? "secondary" : org.plan === "team" ? "default" : "destructive"}>
                    {org.plan}
                  </Badge>
                </div>
              </div>
            ))}
            {data.topOrgs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No organizations yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Funnel Visualization Component ───

function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  if (steps.length === 0) return null;
  const maxCount = steps[0].count || 1;

  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const widthPct = Math.max((step.count / maxCount) * 100, 8);
        const prevCount = i > 0 ? steps[i - 1].count : step.count;
        const dropoff = prevCount > 0 ? ((prevCount - step.count) / prevCount) * 100 : 0;

        return (
          <div key={i}>
            {/* Step bar */}
            <div className="flex items-center gap-3">
              <div className="w-[140px] shrink-0 flex items-center gap-2 text-xs">
                {step.icon}
                <span className="truncate">{step.label}</span>
              </div>
              <div className="flex-1 relative">
                <div
                  className={`${step.color} h-9 rounded-md flex items-center justify-between px-3 text-white text-sm font-medium transition-all`}
                  style={{ width: `${widthPct}%`, minWidth: "80px" }}
                >
                  <span>{step.count.toLocaleString()}</span>
                  <span className="text-xs opacity-80">
                    {((step.count / maxCount) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            {/* Drop-off indicator between steps */}
            {i < steps.length - 1 && dropoff > 0 && (
              <div className="flex items-center gap-3 py-0.5">
                <div className="w-[140px]" />
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground pl-2">
                  <ArrowDown className="h-3 w-3" />
                  <span>{dropoff.toFixed(1)}% drop-off</span>
                  <ChevronRight className="h-3 w-3 mx-0.5" />
                  <span className="text-foreground/70">
                    {i + 1 < steps.length
                      ? `${((steps[i + 1].count / (prevCount || 1)) * 100).toFixed(1)}% conversion`
                      : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
