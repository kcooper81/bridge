// Server-only helper for writing to the audit_events table.
//
// Every privileged action endpoint that mutates org configuration, roles,
// integrations, or DLP rules should emit one of these events. Insert
// failures are logged but never throw — auditing should never break the
// underlying mutation.

import "server-only";
import type { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { deliverWebhookEvent } from "@/lib/webhook-delivery";

export type AuditAction =
  // Member/role management
  | "member.invite"
  | "member.remove"
  | "member.role_change"
  | "member.shield_toggled"
  | "org.transfer_admin"
  // DLP / guardrails
  | "rule.create"
  | "rule.update"
  | "rule.delete"
  | "rule.toggle"
  | "rule.export"
  | "rule.import"
  | "compliance_pack.install"
  // Integrations
  | "integration.connect"
  | "integration.disconnect"
  | "integration.sync"
  // Settings
  | "settings.update"
  | "auto_join_domain.set"
  | "auto_join_domain.verify"
  // Approvals
  | "approval.approve"
  | "approval.reject"
  // AI provider keys
  | "ai_provider.add"
  | "ai_provider.remove"
  | "ai_provider.update";

export interface EmitAuditOptions {
  orgId: string;
  actorId: string | null;
  actorEmail?: string | null;
  actorName?: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string | null;
  targetLabel?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  request?: NextRequest;
}

function extractClient(req?: NextRequest): { ip: string | null; user_agent: string | null } {
  if (!req) return { ip: null, user_agent: null };
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const user_agent = req.headers.get("user-agent");
  return { ip, user_agent };
}

export async function emitAuditEvent(opts: EmitAuditOptions): Promise<void> {
  try {
    const db = createServiceClient();
    const { ip, user_agent } = extractClient(opts.request);
    const occurredAt = new Date().toISOString();
    await db.from("audit_events").insert({
      org_id: opts.orgId,
      actor_id: opts.actorId,
      actor_email: opts.actorEmail ?? null,
      actor_name: opts.actorName ?? null,
      action: opts.action,
      target_type: opts.targetType ?? null,
      target_id: opts.targetId ?? null,
      target_label: opts.targetLabel ?? null,
      before: opts.before ?? null,
      after: opts.after ?? null,
      metadata: opts.metadata ?? null,
      ip,
      user_agent,
    });

    // Fan out to configured SIEM/webhook destinations — non-blocking.
    void deliverWebhookEvent({
      event: "audit",
      org_id: opts.orgId,
      occurred_at: occurredAt,
      data: {
        action: opts.action,
        actor_id: opts.actorId,
        actor_email: opts.actorEmail ?? null,
        target_type: opts.targetType ?? null,
        target_id: opts.targetId ?? null,
        target_label: opts.targetLabel ?? null,
        before: opts.before ?? null,
        after: opts.after ?? null,
        metadata: opts.metadata ?? null,
        ip,
        user_agent,
      },
    });
  } catch (err) {
    // Auditing should never break the underlying mutation. Log and move on.
    console.error("[audit_events] failed to write event", { action: opts.action, err });
  }
}

// Helper for endpoints that already have an actor profile loaded.
export async function emitAuditFromProfile(
  profile: { id: string; org_id: string | null; email?: string | null; name?: string | null },
  rest: Omit<EmitAuditOptions, "orgId" | "actorId" | "actorEmail" | "actorName">,
) {
  if (!profile.org_id) return;
  await emitAuditEvent({
    orgId: profile.org_id,
    actorId: profile.id,
    actorEmail: profile.email ?? null,
    actorName: profile.name ?? null,
    ...rest,
  });
}
