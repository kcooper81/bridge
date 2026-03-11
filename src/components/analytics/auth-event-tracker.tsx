"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { trackLogin, trackSignUp } from "@/lib/analytics";

/**
 * Picks up auth_event & auth_method query params (set by OAuth callback)
 * and fires the corresponding GA4 + LinkedIn tracking events, then
 * cleans the URL so the params don't persist.
 */
export function AuthEventTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authEvent = searchParams.get("auth_event");
    const authMethod = searchParams.get("auth_method") as "google" | "github" | null;
    if (!authEvent || !authMethod) return;

    if (authEvent === "login") {
      trackLogin(authMethod);
    } else if (authEvent === "signup") {
      trackSignUp(authMethod);
    }

    // Clean up query params from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth_event");
    params.delete("auth_method");
    const cleanUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(cleanUrl, { scroll: false });
  }, [searchParams, router, pathname]);

  return null;
}
