import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * Generate a new MCP API key.
 * Returns the raw key (shown once) and the hash (stored in DB).
 */
export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const random = crypto.randomBytes(24).toString("hex"); // 48 hex chars
  const rawKey = `tp_live_${random}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 16); // "tp_live_xxxxxxxx"
  return { rawKey, keyHash, keyPrefix };
}

/**
 * Hash a raw API key for lookup.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Authenticate an MCP request by API key.
 * Returns org_id and scopes if valid, null otherwise.
 */
export async function authenticateMcpKey(
  authHeader: string | null
): Promise<{ orgId: string; keyId: string; scopes: string[] } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const rawKey = authHeader.slice(7);
  if (!rawKey.startsWith("tp_live_")) return null;

  const keyHash = hashApiKey(rawKey);
  const db = createServiceClient();

  const { data: key } = await db
    .from("mcp_api_keys")
    .select("id, org_id, scopes, revoked_at, expires_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (!key) return null;
  if (key.revoked_at) return null;
  if (key.expires_at && new Date(key.expires_at) < new Date()) return null;

  // Update last_used_at (fire-and-forget)
  db.from("mcp_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id)
    .then(() => {});

  return {
    orgId: key.org_id,
    keyId: key.id,
    scopes: key.scopes || [],
  };
}
