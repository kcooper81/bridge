"use client";

import { useState, useEffect } from "react";
import { useExtensionDetection } from "@/hooks/use-extension-detection";
import { Chrome, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "teamprompt-extension-banner-dismissed";

export function ExtensionInstallBanner() {
  const { detected, loading } = useExtensionDetection();
  const [dismissed, setDismissed] = useState(true); // default hidden until checked

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
      <Chrome className="h-5 w-5 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Install the TeamPrompt Extension</p>
        <p className="text-xs text-muted-foreground">
          Use your team&apos;s prompts directly in ChatGPT, Claude, Gemini, and more. DLP scanning keeps sensitive data safe.
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <a
          href="https://chromewebstore.google.com/detail/teamprompt"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install
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
