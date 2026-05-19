// Server-only helper for reading/writing organization-scoped secrets.
//
// Secrets live in the `organization_secrets` table, which has RLS enabled
// with no policies — so only the service-role client can touch it. Every
// caller of these helpers must already have authenticated the request
// and (for writes) verified the caller is an org admin. These helpers
// do NOT re-check authorization; they assume the caller did it.

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export interface OrgSecrets {
  cloudflare_account_id: string | null;
  cloudflare_api_token: string | null;
  cloudflare_connected_at: string | null;
}

const EMPTY: OrgSecrets = {
  cloudflare_account_id: null,
  cloudflare_api_token: null,
  cloudflare_connected_at: null,
};

export async function getOrgSecrets(orgId: string): Promise<OrgSecrets> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("organization_secrets")
    .select("cloudflare_account_id, cloudflare_api_token, cloudflare_connected_at")
    .eq("org_id", orgId)
    .maybeSingle();
  if (error) {
    // Don't leak DB error details to callers; null-out means "treat as not configured".
    return { ...EMPTY };
  }
  if (!data) return { ...EMPTY };
  return {
    cloudflare_account_id: data.cloudflare_account_id ?? null,
    cloudflare_api_token: data.cloudflare_api_token ?? null,
    cloudflare_connected_at: data.cloudflare_connected_at ?? null,
  };
}

export async function updateOrgSecrets(
  orgId: string,
  updates: Partial<OrgSecrets>,
): Promise<void> {
  const db = createServiceClient();
  await db
    .from("organization_secrets")
    .upsert({ org_id: orgId, ...updates }, { onConflict: "org_id" });
}

export async function clearOrgSecrets(
  orgId: string,
  keys: (keyof OrgSecrets)[],
): Promise<void> {
  const wipe: Partial<OrgSecrets> = {};
  for (const k of keys) wipe[k] = null;
  await updateOrgSecrets(orgId, wipe);
}
