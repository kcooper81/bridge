"use client";

import { useState, useEffect, useMemo } from "react";
import { useExtensionDetection } from "@/hooks/use-extension-detection";
import { Chrome, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackExtensionInstallClick } from "@/lib/analytics";
import { detectBrowser, getStoreForBrowser } from "@/lib/browser-detect";

const DISMISS_KEY = "teamprompt-extension-banner-dismissed";

// Simple inline SVG icons for Firefox and Edge (lucide doesn't have them)
function FirefoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15-.63-.44-1.3-.95-1.87.4.75.57 1.52.57 1.52s-.65-1.29-1.83-1.89c-.67-.34-1.31-.39-1.85-.35.06-.03.12-.05.19-.07-.97-.06-2.02.32-2.62.87-.07-.04-.14-.08-.2-.11.04.07.09.14.15.22-.55.42-.98 1.06-1.12 1.82-.02.08-.03.16-.04.24-.01.08-.02.15-.02.23 0 .04 0 .09-.01.13 0 3.38 2.74 6.12 6.12 6.12 2.5 0 4.65-1.5 5.61-3.65.06-.14.11-.28.16-.43.34-1.07.36-2.24-.16-3.78z" />
    </svg>
  );
}

function EdgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.86 17.86q.14 0 .25.12.1.13.1.25t-.11.33l-.32.46-.43.53-.44.5q-.21.25-.38.42l-.22.23q-.58.53-1.34 1.04-.76.51-1.6.91-.86.4-1.74.64-.88.25-1.64.25-1.31 0-2.41-.34-1.11-.34-2-1-.9-.65-1.54-1.6-.63-.96-.96-2.18l.02.02q.61.32 1.37.52.76.21 1.42.21 1.17 0 2.12-.37.95-.37 1.65-1.01.7-.65 1.13-1.51.42-.87.57-1.83-.4.5-.96.89-.56.39-1.2.66-.65.26-1.33.4-.69.14-1.33.14-.72 0-1.42-.17-.71-.17-1.35-.52-.63-.36-1.16-.88-.52-.53-.86-1.23-.34.67-.34 1.43l-.01.27q0 1.06.4 2.03.39.97 1.07 1.72.69.75 1.63 1.2.93.44 2 .44.78 0 1.68-.28.89-.27 1.69-.78.8-.51 1.44-1.23.64-.72.96-1.6zM9.61 8.07q0-.42.11-.87.11-.45.34-.83.22-.38.57-.64.36-.27.83-.27.39 0 .64.17.25.17.25.5 0 .39-.25.73-.25.34-.62.6-.37.26-.78.42-.41.17-.74.2-.12-.37-.12-.72l-.03-.29zm12.25 3.76q0-.93-.27-1.84-.26-.91-.75-1.72-.49-.8-1.18-1.46-.69-.66-1.53-1.12-.85-.46-1.8-.72-.96-.25-2-.25-.71 0-1.5.18-.78.17-1.52.52-.73.35-1.37.87-.63.51-1.07 1.2-.44.68-.68 1.5-.25.83-.25 1.78 0 .37.03.74.04.37.11.73.08.36.2.7l.02.07q.08-.47.26-.96.19-.49.5-.93.31-.45.73-.8.42-.36.98-.53-.06-.27-.06-.57 0-.76.29-1.36.3-.61.77-1.02.47-.4 1.06-.62.59-.2 1.2-.2.63 0 1.17.2.54.2.94.56.39.36.62.87.23.52.23 1.13 0 .63-.2 1.24-.2.6-.55 1.11-.35.5-.82.89-.47.38-1.01.57-.53.19-1.1.19-.56 0-1.02-.17-.46-.17-.83-.46.28.93.86 1.62.58.7 1.34 1.14.76.44 1.62.64.87.2 1.71.2 1.32 0 2.47-.47 1.15-.47 2-1.33.86-.85 1.36-2.05.5-1.2.5-2.65z" />
    </svg>
  );
}

function BrowserIcon({ browser, className }: { browser: string; className?: string }) {
  switch (browser) {
    case "chrome":
      return <Chrome className={className} />;
    case "firefox":
      return <FirefoxIcon className={className} />;
    case "edge":
      return <EdgeIcon className={className} />;
    default:
      return <Globe className={className} />;
  }
}

export function ExtensionInstallBanner() {
  const { detected, loading } = useExtensionDetection();
  const [dismissed, setDismissed] = useState(true); // default hidden until checked

  const browser = useMemo(() => detectBrowser(), []);
  const store = useMemo(() => getStoreForBrowser(browser), [browser]);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (loading || detected || dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <BrowserIcon browser={browser} className="h-5 w-5 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Install the TeamPrompt Extension</p>
        <p className="text-xs text-muted-foreground">
          Use your team&apos;s prompts directly in ChatGPT, Claude, Gemini, and more. DLP scanning keeps sensitive data safe.
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <a
          href={store.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackExtensionInstallClick(browser)}
        >
          {store.buttonLabel}
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={handleDismiss}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
