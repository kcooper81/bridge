import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { PROVIDER_MODELS } from "@/lib/ai/providers";

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

  return NextResponse.json({ success: true });
}
