"use client";

import { useState, useEffect } from "react";

interface ExtensionDetectionResult {
  detected: boolean;
  version: string | null;
  loading: boolean;
}

/**
 * Detects the TeamPrompt browser extension using two methods:
 *
 * 1. DOM marker: The auth-bridge content script sets
 *    `document.documentElement.dataset.tpExtension` and dispatches
 *    a `tp-extension-detected` CustomEvent. Works without knowing
 *    the extension ID (dev and production).
 *
 * 2. chrome.runtime.sendMessage PING/PONG (requires extension ID in
 *    NEXT_PUBLIC_CHROME_EXTENSION_ID or NEXT_PUBLIC_EDGE_EXTENSION_ID).
 *
 * 2-second timeout. Firefox doesn't support externally_connectable so
 * only the DOM marker method works there.
 */
export function useExtensionDetection(): ExtensionDetectionResult {
  const [detected, setDetected] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;

    function resolve(v: string | null) {
      if (resolved) return;
      resolved = true;
      setDetected(true);
      setVersion(v);
      setLoading(false);
    }

    // --- Method 1: DOM marker (set by auth-bridge content script) ---

    const marker = document.documentElement.dataset.tpExtension;
    if (marker) {
      resolve(marker);
      return;
    }

    // Content script may not have run yet — listen for the event
    function onExtensionDetected(e: Event) {
      const detail = (e as CustomEvent).detail;
      resolve(detail?.version || null);
    }
    window.addEventListener("tp-extension-detected", onExtensionDetected);

    // --- Method 2: PING/PONG via externally_connectable ---

    const chromeId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
    const edgeId = process.env.NEXT_PUBLIC_EDGE_EXTENSION_ID;

    const chrome = (
      window as unknown as {
        chrome?: {
          runtime?: {
            sendMessage: (
              id: string,
              msg: unknown,
              cb: (response?: { type?: string; version?: string }) => void
            ) => void;
          };
        };
      }
    ).chrome;

    if (chrome?.runtime?.sendMessage && (chromeId || edgeId)) {
      const tryPing = (
        extensionId: string
      ): Promise<{ type?: string; version?: string } | undefined> => {
        return new Promise((res) => {
          try {
            chrome!.runtime!.sendMessage(
              extensionId,
              { type: "PING" },
              (response) => {
                const _ = (
                  globalThis as unknown as {
                    chrome?: { runtime?: { lastError?: unknown } };
                  }
                ).chrome?.runtime?.lastError;
                void _;
                res(response);
              }
            );
          } catch {
            res(undefined);
          }
        });
      };

      (async () => {
        for (const id of [chromeId, edgeId].filter(Boolean) as string[]) {
          if (resolved) return;
          const response = await tryPing(id);
          if (response?.type === "PONG") {
            resolve(response.version || null);
            return;
          }
        }
      })();
    }

    // --- Timeout fallback ---

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("tp-extension-detected", onExtensionDetected);
      resolved = true;
    };
  }, []);

  return { detected, version, loading };
}
