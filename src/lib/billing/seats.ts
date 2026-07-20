import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/billing/plans";
import type { PlanTier } from "@/lib/types";

/**
 * Seat entitlement.
 *
 * Before this, nothing enforced `max_members` at runtime: the Stripe webhook
 * only rewrote `organizations.plan`, so an org could buy Team (50 seats),
 * invite 50 people, cancel, and keep all 50 on Free (cap 3) forever.
 *
 * Rather than deleting members on downgrade (destructive and irreversible —
 * `org_id` is nulled and team memberships are dropped), we gate ACCESS by a
 * deterministic seat rank. The moment the org upgrades, everyone is restored.
 *
 * Rank order is stable and self-healing: admins first (so an org can always be
 * administered back into compliance), then earliest `created_at`, then id as a
 * final tiebreak so the ordering is total.
 */

/** Days an over-limit org keeps full access after a downgrade. */
export const SEAT_GRACE_DAYS = 14;

export interface SeatStatus {
  /** The caller may use the product. */
  hasSeat: boolean;
  /** Org headcount exceeds the plan's max_members. */
  overLimit: boolean;
  /** Enforcement is deferred until this time (null = not over limit / already enforcing). */
  graceUntil: Date | null;
  /** True while over limit but still inside the grace window. */
  inGrace: boolean;
  /** Zero-based position in the seat ordering (null if not a member). */
  rank: number | null;
  /** Plan seat cap (-1 = unlimited). */
  maxMembers: number;
  memberCount: number;
}

const UNLIMITED = -1;

/**
 * Resolve whether a user currently holds a seat in their org.
 *
 * Fails OPEN on any error: a billing lookup problem must never lock paying
 * customers out of the product.
 */
export async function getSeatStatus(userId: string, orgId: string): Promise<SeatStatus> {
  const open: SeatStatus = {
    hasSeat: true, overLimit: false, graceUntil: null,
    inGrace: false, rank: null, maxMembers: UNLIMITED, memberCount: 0,
  };

  try {
    const db = createServiceClient();

    const { data: org, error: orgError } = await db
      .from("organizations")
      .select("plan, plan_grace_until")
      .eq("id", orgId)
      .maybeSingle();
    if (orgError || !org) return open;

    const maxMembers = getPlanLimits(org.plan as PlanTier).max_members;
    if (maxMembers === UNLIMITED) return { ...open, maxMembers };

    // Ordering must match the doc above. `created_at` ascending keeps the
    // longest-standing members seated; id breaks exact-timestamp ties.
    const { data: members, error: memberError } = await db
      .from("profiles")
      .select("id, role, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
    if (memberError || !members) return { ...open, maxMembers };

    const ranked = [...members].sort((a, b) => {
      const aAdmin = a.role === "admin" ? 0 : 1;
      const bAdmin = b.role === "admin" ? 0 : 1;
      if (aAdmin !== bAdmin) return aAdmin - bAdmin;
      const t = String(a.created_at).localeCompare(String(b.created_at));
      return t !== 0 ? t : String(a.id).localeCompare(String(b.id));
    });

    const memberCount = ranked.length;
    const overLimit = memberCount > maxMembers;
    const rankIndex = ranked.findIndex((m) => m.id === userId);
    const rank = rankIndex === -1 ? null : rankIndex;

    const graceUntil = org.plan_grace_until ? new Date(org.plan_grace_until) : null;
    const inGrace = Boolean(overLimit && graceUntil && graceUntil.getTime() > Date.now());

    // Seated when: within cap, still in grace, or ranked inside the cap.
    // A non-member (rank null) is not gated here — other guards handle that.
    const hasSeat = !overLimit || inGrace || rank === null || rank < maxMembers;

    return { hasSeat, overLimit, graceUntil, inGrace, rank, maxMembers, memberCount };
  } catch {
    return open;
  }
}

/** Convenience wrapper for guards that only care about the boolean. */
export async function hasSeat(userId: string, orgId: string): Promise<boolean> {
  return (await getSeatStatus(userId, orgId)).hasSeat;
}

/**
 * Grace deadline to store when an org lands over its cap. Returns null when the
 * org is within its new plan's limit (nothing to enforce).
 */
export function computeGraceUntil(plan: PlanTier, memberCount: number): string | null {
  const maxMembers = getPlanLimits(plan).max_members;
  if (maxMembers === UNLIMITED || memberCount <= maxMembers) return null;
  return new Date(Date.now() + SEAT_GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
