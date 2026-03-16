"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/components/providers/org-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupWizard } from "@/components/dashboard/setup-wizard";
import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { PageSkeleton } from "@/components/dashboard/skeleton-loader";
import { getAnalytics } from "@/lib/vault-api";
import type { Analytics } from "@/lib/types";

export default function DashboardHomePage() {
  const { org, loading, noOrg } = useOrg();
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const refreshAnalytics = useCallback(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch((err) => {
        console.error("Failed to load analytics:", err);
      })
      .finally(() => setAnalyticsLoading(false));
  }, []);

  useEffect(() => {
    if (loading || noOrg) return;
    refreshAnalytics();
  }, [loading, noOrg, refreshAnalytics]);

  // Realtime: refresh dashboard stats when prompts or members change
  useEffect(() => {
    if (!org?.id || loading || noOrg) return;
    const supabase = createClient();
    const channel = supabase
      .channel("home-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prompts", filter: `org_id=eq.${org.id}` },
        () => { refreshAnalytics(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `org_id=eq.${org.id}` },
        () => { refreshAnalytics(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [org?.id, loading, noOrg, refreshAnalytics]);

  // Consume pending plan selection from signup/login flow
  useEffect(() => {
    if (loading || noOrg) return;
    const pendingPlan = sessionStorage.getItem("pending_plan");
    if (pendingPlan) {
      sessionStorage.removeItem("pending_plan");
      router.push(`/settings/billing?plan=${encodeURIComponent(pendingPlan)}`);
    }
  }, [loading, noOrg, router]);

  if (loading) return <PageSkeleton />;

  const greeting = getGreeting();
  const firstName = user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  if (noOrg) {
    return (
      <>
        <PageHeader title="Home" description={`${greeting}${firstName ? `, ${firstName}` : ""}`} />
        <NoOrgBanner />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Home"
        description={`${greeting}${firstName ? `, ${firstName}` : ""}`}
      />
      <SetupWizard />
      <DashboardWidgets analytics={analytics} loading={analyticsLoading} />
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
