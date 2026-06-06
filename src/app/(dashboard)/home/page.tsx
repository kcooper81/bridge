"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/components/providers/org-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { OnboardingFlow } from "@/components/dashboard/onboarding-flow";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { PageSkeleton } from "@/components/dashboard/skeleton-loader";
import { getAnalytics } from "@/lib/vault-api";
import type { Analytics } from "@/lib/types";

export default function DashboardHomePage() {
  const { org, loading, noOrg } = useOrg();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("mfa_reset") === "1") {
      toast.warning(
        "Two-factor authentication was reset after recovery-code use. Re-enroll a new authenticator in Settings to keep your account protected.",
        { duration: 10000, action: { label: "Open settings", onClick: () => router.push("/settings") } }
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("mfa_reset");
      window.history.replaceState({}, "", url.toString());
    }
    if (searchParams.get("error") === "no_mfa_factor") {
      toast.error("Set up two-factor authentication to continue.");
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, router]);

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

  // Hide DashboardWidgets until there's real activity. The widget grid
  // renders 4 stat cards with 0 + "Top Prompts: No prompts yet" + "Recent:
  // No prompts yet" on day 1 — a wall of zeros that demoralizes new users.
  // Mirror the vault pattern (hide stats until ≥1 prompt). Show widgets
  // when there's any signal: prompts, members beyond the founder, or
  // analytics data has arrived.
  const hasActivity =
    !analyticsLoading &&
    !!analytics &&
    (analytics.totalPrompts > 0 || analytics.totalUses > 0 || (analytics.topPrompts?.length ?? 0) > 0);

  return (
    <>
      <PageHeader
        title="Home"
        description={`${greeting}${firstName ? `, ${firstName}` : ""}`}
      />
      <OnboardingFlow />
      <SetupChecklist />
      {hasActivity && (
        <DashboardWidgets analytics={analytics} loading={analyticsLoading} />
      )}
      {!hasActivity && !analyticsLoading && (
        <FirstRunPanel firstName={firstName} />
      )}
    </>
  );
}

function FirstRunPanel({ firstName }: { firstName: string }) {
  return (
    <div className="mt-2 rounded-2xl border border-border bg-card p-8 sm:p-10">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
        Welcome{firstName ? `, ${firstName}` : ""} — here&apos;s what to try first
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your workspace is empty. Pick any of these to start. Analytics, top prompts, and team activity will fill in as you use TeamPrompt.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/vault", title: "Create your first prompt", desc: "Templates with variables, version history, and one-click insert into ChatGPT, Claude, and Gemini." },
          { href: "/team", title: "Invite a teammate", desc: "TeamPrompt gets useful around 2 people — start with one." },
          { href: "/guardrails", title: "Install default DLP policies", desc: "20 compliance packs ready to go: HIPAA, SOC 2, PCI-DSS, GDPR, and more." },
          { href: "/chat", title: "Try AI Chat", desc: "Bring an OpenAI / Anthropic / Google key. Every prompt scanned by your DLP rules." },
          { href: "/settings/integrations", title: "Connect Slack or Cloudflare", desc: "Slack notifications on violations. Cloudflare for network-level AI tool control." },
          { href: "/settings/billing", title: "See plans", desc: "Free forever for 3 users. Upgrade when your team grows." },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block rounded-xl border border-border bg-background p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
          >
            <div className="text-sm font-semibold">{item.title}</div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
