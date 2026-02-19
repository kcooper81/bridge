"use client";

import { useState, useEffect } from "react";

interface ExtensionDetectionResult {
  detected: boolean;
  version: string | null;
  loading: boolean;
}

/**
 * Detects whether the TeamPrompt browser extension is installed by sending
 * a PING message via chrome.runtime.sendMessage (externally_connectable).
 * Tries Chrome ID first, then Edge ID. Returns {detected, version, loading}.
 * 2-second timeout. Firefox doesn't support externally_connectable so detection
 * won't work there (acceptable — Firefox is a minority use case).
 */
export function useExtensionDetection(): ExtensionDetectionResult {
  const [detected, setDetected] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chromeId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
    const edgeId = process.env.NEXT_PUBLIC_EDGE_EXTENSION_ID;

    // No extension IDs configured — skip detection
    if (!chromeId && !edgeId) {
      setLoading(false);
      return;
    }

    // chrome.runtime.sendMessage is only available in Chromium browsers
    const chrome = (window as unknown as { chrome?: { runtime?: { sendMessage: (id: string, msg: unknown, cb: (response?: { type?: string; version?: string }) => void) => void } } }).chrome;
    if (!chrome?.runtime?.sendMessage) {
      setLoading(false);
      return;
    }

    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
      }
    }, 2000);

    function tryPing(extensionId: string): Promise<{ type?: string; version?: string } | undefined> {
      return new Promise((resolve) => {
        try {
          chrome!.runtime!.sendMessage(extensionId, { type: "PING" }, (response) => {
            // Clear lastError to prevent console noise
            const _ = (globalThis as unknown as { chrome?: { runtime?: { lastError?: unknown } } }).chrome?.runtime?.lastError;
            void _;
            resolve(response);
          });
        } catch {
          resolve(undefined);
        }
      });
    }

    async function detect() {
      const idsToTry = [chromeId, edgeId].filter(Boolean) as string[];

      for (const id of idsToTry) {
        if (resolved) return;
        const response = await tryPing(id);
        if (response?.type === "PONG") {
          resolved = true;
          clearTimeout(timeout);
          setDetected(true);
          setVersion(response.version || null);
          setLoading(false);
          return;
        }
      }

      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    detect();

    return () => {
      clearTimeout(timeout);
      resolved = true;
    };
  }, []);

  return { detected, version, loading };
}
