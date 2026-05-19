// Server-only helper for delivering events to org-configured webhook
// destinations (SIEM / Datadog / Splunk integrations). Non-blocking —
// errors are logged on the destination row but never break the caller.

import "server-only";
import { createHmac } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";

export type WebhookEventType = "violation" | "audit";

export interface WebhookEventPayload {
  event: WebhookEventType;
  org_id: string;
  occurred_at: string;
  data: Record<string, unknown>;
}

function signBody(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export async function deliverWebhookEvent(payload: WebhookEventPayload): Promise<void> {
  try {
    const db = createServiceClient();
    const { data: dests } = await db
      .from("webhook_destinations")
      .select("id, url, secret, events")
      .eq("org_id", payload.org_id)
      .eq("enabled", true);
    if (!dests || dests.length === 0) return;

    const body = JSON.stringify(payload);

    await Promise.all(
      dests
        .filter((d) => Array.isArray(d.events) && d.events.includes(payload.event))
        .map(async (d) => {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "X-TeamPrompt-Event": payload.event,
            "X-TeamPrompt-Timestamp": payload.occurred_at,
          };
          if (d.secret) {
            headers["X-TeamPrompt-Signature"] = `sha256=${signBody(d.secret, body)}`;
          }

          try {
            const res = await fetch(d.url, {
              method: "POST",
              headers,
              body,
              // Don't let a slow webhook back up the caller.
              signal: AbortSignal.timeout(8000),
            });
            await db
              .from("webhook_destinations")
              .update({
                last_delivery_at: new Date().toISOString(),
                last_delivery_status: String(res.status),
                last_delivery_error: res.ok ? null : `HTTP ${res.status}`,
              })
              .eq("id", d.id);
          } catch (err) {
            await db
              .from("webhook_destinations")
              .update({
                last_delivery_at: new Date().toISOString(),
                last_delivery_status: "error",
                last_delivery_error: (err as Error).message,
              })
              .eq("id", d.id);
          }
        }),
    );
  } catch (err) {
    console.error("[webhook-delivery] failed", err);
  }
}
