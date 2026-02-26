import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fire-and-forget update of extension_version and last_extension_active on the user's profile.
 * Called from each extension API route after auth succeeds.
 */
export function trackExtensionActivity(
  db: SupabaseClient,
  userId: string,
  extensionVersion: string | null
) {
  const update: Record<string, unknown> = {
    last_extension_active: new Date().toISOString(),
  };
  if (extensionVersion) {
    update.extension_version = extensionVersion;
  }

  // Fire-and-forget — don't await
  db.from("profiles").update(update).eq("id", userId).then(({ error }) => {
    if (error) console.error("Failed to track extension activity:", error.message);
  });
}
