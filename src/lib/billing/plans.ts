import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanLimits, PlanTier } from "@/lib/types";

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
    "analytics" | "import_export" | "custom_security" | "audit_log"
  >
): boolean {
  return getPlanLimits(plan)[feature];
}

export const STRIPE_PLAN_CONFIG = {
  pro: {
    priceEnv: "STRIPE_PRICE_PRO",
    minSeats: 1,
    maxSeats: 1,
    trial: true,
  },
  team: {
    priceEnv: "STRIPE_PRICE_TEAM",
    minSeats: 2,
    maxSeats: 50,
    trial: true,
  },
  business: {
    priceEnv: "STRIPE_PRICE_BUSINESS",
    minSeats: 5,
    maxSeats: 500,
    trial: false,
  },
} as const;

export const TRIAL_DAYS = 14;
