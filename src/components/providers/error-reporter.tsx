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
      reportError(event.error ?? event.message, {
        source: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
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
