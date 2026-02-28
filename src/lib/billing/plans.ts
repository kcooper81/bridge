import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanLimits, PlanTier } from "@/lib/types";

export type BillingInterval = "monthly" | "annual";

export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function isWithinLimit(current: number, max: number): boolean {
  return max === -1 || current < max;
}

export function canAccessFeature(
  plan: PlanTier,
  feature: keyof Pick<
    PlanLimits,
    "analytics" | "import_export" | "custom_security" | "audit_log" | "bulk_import" | "bulk_role_assignment" | "custom_welcome_email" | "domain_auto_join" | "google_workspace_sync"
  >
): boolean {
  return getPlanLimits(plan)[feature];
}

export const STRIPE_PLAN_CONFIG = {
  pro: {
    priceEnv: { monthly: "STRIPE_PRICE_PRO", annual: "STRIPE_PRICE_PRO_ANNUAL" },
    minSeats: 1,
    maxSeats: 1,
    trial: true,
  },
  team: {
    priceEnv: { monthly: "STRIPE_PRICE_TEAM", annual: "STRIPE_PRICE_TEAM_ANNUAL" },
    minSeats: 2,
    maxSeats: 50,
    trial: true,
  },
  business: {
    priceEnv: { monthly: "STRIPE_PRICE_BUSINESS", annual: "STRIPE_PRICE_BUSINESS_ANNUAL" },
    minSeats: 10,
    maxSeats: 500,
    trial: false,
  },
} as const;

export const TRIAL_DAYS = 14;
