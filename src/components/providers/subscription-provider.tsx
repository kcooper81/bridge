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
import { useAuth } from "./auth-provider";

interface SubscriptionContextValue {
  subscription: Subscription | null;
  planLimits: PlanLimits;
  loading: boolean;
  refresh: () => Promise<void>;
  canAccess: (feature: keyof Pick<PlanLimits, "analytics" | "import_export" | "custom_security" | "audit_log">) => boolean;
  checkLimit: (action: "create_prompt" | "add_member" | "add_guideline", currentCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSuperAdmin } = useAuth();
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
      .maybeSingle();

    if (profileError || !profile?.org_id) return;

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("org_id", profile.org_id)
      .maybeSingle();

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
      if (isSuperAdmin) return true;
      return planLimits[feature];
    },
    [planLimits, isSuperAdmin]
  );

  const checkLimit = useCallback(
    (action: "create_prompt" | "add_member" | "add_guideline", currentCount: number): boolean => {
      if (isSuperAdmin) return true;
      const limitMap = {
        create_prompt: planLimits.max_prompts,
        add_member: planLimits.max_members,
        add_guideline: planLimits.max_guidelines,
      };
      const max = limitMap[action];
      return max === -1 || currentCount < max;
    },
    [planLimits, isSuperAdmin]
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
