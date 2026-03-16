"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

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
