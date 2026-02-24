"use client";

import { useState, useEffect } from "react";
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
  const { loading, noOrg } = useOrg();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch((err) => {
        console.error("Failed to load analytics:", err);
      })
      .finally(() => setAnalyticsLoading(false));
  }, []);

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
