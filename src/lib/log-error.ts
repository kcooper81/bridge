import { createServiceClient } from "@/lib/supabase/server";

export type ErrorService = "app" | "resend" | "stripe" | "supabase" | "upstash" | "vercel";

/**
 * Log an error to the error_logs table with a service tag.
 * Use from server-side code (API routes, server actions, etc.)
 */
export async function logServiceError(
  service: ErrorService,
  error: unknown,
  context?: {
    userId?: string;
    orgId?: string;
    url?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    const supabase = createServiceClient();
    const message =
      error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack ?? null : null;

    await supabase.from("error_logs").insert({
      service,
      message,
      stack,
      user_id: context?.userId ?? null,
      org_id: context?.orgId ?? null,
      url: context?.url ?? null,
      metadata: context?.metadata ?? null,
    });
  } catch {
    // Don't let error logging break the app
    console.error(`[logServiceError] Failed to log ${service} error:`, error);
  }
}
