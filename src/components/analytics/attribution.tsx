"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records the first marketing page a visitor lands on. Mounted in the
 * marketing layout only — dashboard routes are post-signup and would just
 * overwrite nothing (the capture is first-touch), but there's no reason to
 * run it there.
 */
export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    // Depends on pathname so a client-side nav still captures for visitors
    // whose very first paint was a soft navigation. captureAttribution()
    // no-ops once the cookie exists, so repeat calls are free.
    captureAttribution();
  }, [pathname]);

  return null;
}

/**
 * Once a user is authenticated, copies the attribution cookie onto their
 * profile. Mounted in the root layout so it covers every auth path — email
 * signup, OAuth callback, and returning logins — without having to thread it
 * through each flow.
 *
 * Runs at most once per browser session. The endpoint is write-once, so the
 * repeat calls that do slip through are harmless no-ops.
 */
export function AttributionClaim() {
  useEffect(() => {
    const SESSION_KEY = "tp_attr_claimed";
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token || cancelled) return;

        await fetch("/api/attribution/claim", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Analytics only — a failure here must never affect the app.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
