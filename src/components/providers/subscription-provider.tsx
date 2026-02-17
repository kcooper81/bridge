"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanLimits, PlanTier, Subscription } from "@/lib/types";

interface SubscriptionContextValue {
  subscription: Subscription | null;
  planLimits: PlanLimits;
  loading: boolean;
  refresh: () => Promise<void>;
  canAccess: (feature: keyof Pick<PlanLimits, "analytics" | "import_export" | "custom_security" | "audit_log">) => boolean;
  checkLimit: (action: "create_prompt" | "add_member" | "add_standard", currentCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits>(PLAN_LIMITS.free);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.org_id) return;

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("org_id", profile.org_id)
      .single();

    if (subError) {
      console.error("Failed to fetch subscription:", subError);
      return;
    }

    if (sub) {
      setSubscription(sub);
      setPlanLimits(PLAN_LIMITS[sub.plan as PlanTier] || PLAN_LIMITS.free);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const canAccess = useCallback(
    (feature: keyof Pick<PlanLimits, "analytics" | "import_export" | "custom_security" | "audit_log">): boolean => {
      return planLimits[feature];
    },
    [planLimits]
  );

  const checkLimit = useCallback(
    (action: "create_prompt" | "add_member" | "add_standard", currentCount: number): boolean => {
      const limitMap = {
        create_prompt: planLimits.max_prompts,
        add_member: planLimits.max_members,
        add_standard: planLimits.max_standards,
      };
      const max = limitMap[action];
      return max === -1 || currentCount < max;
    },
    [planLimits]
  );

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        planLimits,
        loading,
        refresh,
        canAccess,
        checkLimit,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}
