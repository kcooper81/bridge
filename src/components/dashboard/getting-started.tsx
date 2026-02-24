"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useOrg } from "@/components/providers/org-provider";
import { useExtensionDetection } from "@/hooks/use-extension-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  CheckCircle2,
  Chrome,
  Circle,
  FileText,
  FolderOpen,
  Rocket,
  Shield,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const DISMISS_KEY = "teamprompt-getting-started-dismissed";

export function GettingStarted() {
  const { org, members, teams, collections, guidelines, prompts, currentUserRole } = useOrg();
  const { detected: extensionDetected } = useExtensionDetection();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (dismissed) return null;
  if (currentUserRole !== "admin") return null;
  const items = [
    {
      label: "Name your organization",
      done: !!org?.name && org.name !== "My Organization" && org.name.length > 0,
      href: "/settings",
      icon: Building,
    },
    {
      label: "Create a team",
      done: teams.length > 0,
      href: "/team",
      icon: Users,
    },
    {
      label: "Invite team members",
      done: members.length > 1,
      href: "/team",
      icon: UserPlus,
    },
    {
      label: "Set up guardrails",
      done: guidelines.length > 0,
      href: "/guardrails",
      icon: Shield,
    },
    {
      label: "Install the Chrome extension",
      done: extensionDetected,
      href: "https://chromewebstore.google.com/detail/teamprompt",
      icon: Chrome,
      external: true,
    },
    {
      label: "Create your first prompt",
      done: prompts.some((p) => !p.is_template),
      href: "/vault",
      icon: FileText,
    },
    {
      label: "Organize into a collection",
      done: collections.length > 0,
      href: "/collections",
      icon: FolderOpen,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;

  // Auto-dismiss when all items are complete
  if (completedCount === items.length) {
    return null;
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-5 w-5 text-primary" />
          Getting Started
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{items.length} complete
          </span>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDismiss}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-background/60 transition-colors"
              >
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                )}
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
