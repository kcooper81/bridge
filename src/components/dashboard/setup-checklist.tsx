"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useOrg } from "@/components/providers/org-provider";
import { useExtensionDetection } from "@/hooks/use-extension-detection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectBrowser, getStoreForBrowser } from "@/lib/browser-detect";

const DISMISS_KEY = "teamprompt-setup-checklist-dismissed";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href: string;
  actionLabel: string;
  external?: boolean;
}

export function SetupChecklist() {
  const { org, members, currentUserRole } = useOrg();
  const { detected: extensionDetected } = useExtensionDetection();
  const [dismissed, setDismissed] = useState(true);

  const browser = useMemo(() => detectBrowser(), []);
  const store = useMemo(() => getStoreForBrowser(browser), [browser]);

  // Key dismiss by org ID so it resets on new account/org
  // Don't use fallback key — wait for org to load
  const dismissKey = org?.id ? `${DISMISS_KEY}-${org.id}` : null;

  useEffect(() => {
    if (!dismissKey) return;
    setDismissed(localStorage.getItem(dismissKey) === "true");
  }, [dismissKey]);

  if (dismissed) return null;
  if (currentUserRole !== "admin") return null;

  const items: ChecklistItem[] = [
    {
      id: "industry",
      label: "Choose industry",
      done: !!org?.industry,
      href: "/settings",
      actionLabel: "Set up",
    },
    {
      id: "extension",
      label: "Install browser extension (or deploy via MDM)",
      done: extensionDetected,
      href: store.url,
      actionLabel: "Install",
      external: true,
    },
    {
      id: "invite",
      label: "Invite a teammate",
      done: members.length > 1,
      href: "/team",
      actionLabel: "Invite",
    },
    {
      id: "cloudflare",
      label: "Connect Cloudflare Gateway (optional)",
      done: false, // We don't check this dynamically — it's always shown as a suggestion
      href: "/settings/integrations",
      actionLabel: "Connect",
    },
  ];

  const allDone = items.every((item) => item.done);
  if (allDone) return null;

  function handleDismiss() {
    if (dismissKey) localStorage.setItem(dismissKey, "true");
    setDismissed(true);
  }

  return (
    <Card className="mb-6 border-primary/20">
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {item.done ? (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      item.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground font-medium"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                {!item.done && (
                  item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline shrink-0"
                    >
                      {item.actionLabel} &rarr;
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-primary hover:underline shrink-0"
                    >
                      {item.actionLabel} &rarr;
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground h-auto py-1 px-2 shrink-0"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
