import { createClient } from "@/lib/supabase/client";

/**
 * Fire-and-forget client-side error reporter.
 * Inserts a row into the `error_logs` table via the Supabase client.
 * Never throws — all failures are silently swallowed so callers
 * don't need try/catch.
 */
export function reportError(
  error: unknown,
  metadata?: Record<string, unknown>
): void {
  try {
    const message =
      error instanceof Error ? error.message : String(error);
    const stack =
      error instanceof Error ? error.stack ?? null : null;
    const url =
      typeof window !== "undefined" ? window.location.href : null;

    const supabase = createClient();

    // Fire-and-forget — we intentionally don't await.
    Promise.resolve(
      supabase
        .from("error_logs")
        .insert({
          message,
          stack,
          url,
          service: "app",
          ...(metadata ? { metadata } : {}),
        })
    )
      .then(({ error: insertError }) => {
        if (insertError) {
          console.warn("[reportError] failed to insert:", insertError.message);
        }
      })
      .catch(() => {
        // swallow network / unexpected errors
      });
  } catch {
    // Never throw from the reporter itself.
  }
}
