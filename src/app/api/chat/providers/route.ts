import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { PROVIDER_MODELS } from "@/lib/ai/providers";
import { emitAuditEvent } from "@/lib/audit-events";

// Probe the provider's models endpoint with the supplied key. A 401 means
// invalid/revoked; anything 2xx means at least the key is structurally
// valid. We tolerate non-2xx network errors as "couldn't probe" and let
// the save proceed — we don't want to refuse a save because the provider
// is having an outage.
async function probeProviderKey(
  provider: string,
  apiKey: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const controller = AbortSignal.timeout(5000);
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller,
      });
      if (res.status === 401) return { ok: false, error: "OpenAI rejected the key (401 Unauthorized). Double-check the secret." };
      if (res.status === 403) return { ok: false, error: "OpenAI returned 403 Forbidden — the key exists but lacks model access." };
      return { ok: true };
    }
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        signal: controller,
      });
      if (res.status === 401) return { ok: false, error: "Anthropic rejected the key (401 Unauthorized)." };
      if (res.status === 403) return { ok: false, error: "Anthropic returned 403 Forbidden." };
      return { ok: true };
    }
    if (provider === "google") {
      // Google AI uses query-param API key — listModels is the cheapest validate.
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
        { signal: controller },
      );
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Google rejected the key. Verify it's a valid Generative Language API key." };
      }
      return { ok: true };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/** GET — list configured AI providers (never returns keys) */
export async function GET() {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createServiceClient();

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ providers: [] });

  const { data } = await db
    .from("ai_provider_keys")
    .select("id, provider, model_whitelist, is_active, created_at")
    .eq("org_id", profile.org_id);

  // Merge with available provider info
  const providers = (data || []).map((p) => ({
    ...p,
    label: PROVIDER_MODELS[p.provider]?.label || p.provider,
    availableModels: PROVIDER_MODELS[p.provider]?.models || [],
  }));

  return NextResponse.json({ providers });
}

/** POST — add or update a provider API key (admin only) */
export async function POST(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role, is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });
  const isAdmin = profile.is_super_admin || profile.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = await request.json();
  const { provider, api_key, model_whitelist } = body;

  if (!provider || !api_key?.trim()) {
    return NextResponse.json({ error: "Provider and API key are required" }, { status: 400 });
  }

  if (!PROVIDER_MODELS[provider]) {
    return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
  }

  // Validate the key with the provider before saving. A wrong/revoked key
  // saved without this check breaks Chat silently for the whole org — the
  // first time anyone discovers is when they try to chat and get a 401.
  const probeResult = await probeProviderKey(provider, api_key.trim());
  if (!probeResult.ok) {
    return NextResponse.json(
      { error: probeResult.error || "Provider rejected the API key" },
      { status: 400 },
    );
  }

  // Encrypt the API key
  const encryptedKey = encrypt(api_key.trim());

  const { data, error } = await db
    .from("ai_provider_keys")
    .upsert({
      org_id: profile.org_id,
      provider,
      encrypted_api_key: encryptedKey,
      model_whitelist: Array.isArray(model_whitelist) ? model_whitelist : [],
      is_active: true,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "org_id,provider" })
    .select("id, provider, model_whitelist, is_active, created_at")
    .single();

  if (error) {
    console.error("Provider key save error:", error);
    return NextResponse.json({ error: "Failed to save provider key" }, { status: 500 });
  }

  await emitAuditEvent({
    orgId: profile.org_id,
    actorId: user.id,
    actorEmail: user.email ?? null,
    action: "ai_provider.add",
    targetType: "ai_provider",
    targetLabel: PROVIDER_MODELS[provider]?.label || provider,
    metadata: { provider, model_whitelist },
    request,
  });

  return NextResponse.json({
    provider: {
      ...data,
      label: PROVIDER_MODELS[provider]?.label || provider,
      availableModels: PROVIDER_MODELS[provider]?.models || [],
    },
  });
}

/** DELETE — remove a provider key (admin only) */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const { data: { user } } = await auth.auth.getUser();
  const db = createServiceClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role, is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });
  const isAdmin = profile.is_super_admin || profile.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { provider } = await request.json();
  if (!provider) return NextResponse.json({ error: "Provider required" }, { status: 400 });

  await db
    .from("ai_provider_keys")
    .delete()
    .eq("org_id", profile.org_id)
    .eq("provider", provider);

  await emitAuditEvent({
    orgId: profile.org_id,
    actorId: user.id,
    actorEmail: user.email ?? null,
    action: "ai_provider.remove",
    targetType: "ai_provider",
    targetLabel: PROVIDER_MODELS[provider]?.label || provider,
    metadata: { provider },
    request,
  });

  return NextResponse.json({ success: true });
}
