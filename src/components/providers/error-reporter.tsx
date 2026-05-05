"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

// Stack-trace fragments that mean the error originated outside our code:
// browser extensions intercepting fetch, or third-party marketing/analytics
// pixels we load (LinkedIn Insight, GTM, Google Ads, Meta, TikTok). When a
// user has an ad/tracker blocker, those scripts throw "Failed to fetch" which
// gets surfaced to window.onerror — there's nothing we can do about it.
const THIRD_PARTY_STACK_PATTERNS = [
  "chrome-extension://",
  "moz-extension://",
  "safari-extension://",
  "snap.licdn.com",            // LinkedIn Insight
  "px.ads.linkedin.com",       // LinkedIn Ads
  "googletagmanager.com",
  "google-analytics.com",
  "googleadservices.com",
  "doubleclick.net",
  "connect.facebook.net",      // Meta Pixel
  "analytics.tiktok.com",
];

function isThirdPartyNoise(stackOrFilename: string | undefined | null): boolean {
  if (!stackOrFilename) return false;
  return THIRD_PARTY_STACK_PATTERNS.some((p) => stackOrFilename.includes(p));
}

/**
 * Mounts global window.onerror and window.onunhandledrejection handlers
 * that forward uncaught errors to the error_logs table.
 * Render once near the root of the component tree.
 */
export function ErrorReporter({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      // Ignore benign ResizeObserver warnings (common with Radix UI components)
      if (event.message?.includes("ResizeObserver")) return;
      // Ignore cross-origin extension detection errors (e.g. "Permission denied to access property 'version'")
      if (event.message?.includes("Permission denied")) return;
      // Ignore React hydration mismatches (benign in production, caused by client-only state like theme/dates)
      if (event.message?.includes("Minified React error #425")) return;
      // Ignore noise from browser extensions and third-party marketing pixels
      const stack = event.error instanceof Error ? event.error.stack : undefined;
      if (isThirdPartyNoise(stack) || isThirdPartyNoise(event.filename)) return;
      reportError(event.error ?? event.message, {
        source: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      // Ignore AbortError from fetch timeouts (expected when requests are cancelled)
      const reason = event.reason;
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      if (reason instanceof Error && reason.name === "AbortError") return;
      // Ignore noise from browser extensions and third-party marketing pixels
      const stack = reason instanceof Error ? reason.stack : typeof reason === "string" ? reason : undefined;
      if (isThirdPartyNoise(stack)) return;
      reportError(event.reason, {
        source: "unhandledrejection",
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
