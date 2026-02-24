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
  ExternalLink,
  FileText,
  Rocket,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "teamprompt-setup-wizard-dismissed";

interface Step {
  id: string;
  title: string;
  description: string;
  done: boolean;
  href: string;
  actionLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

export function SetupWizard() {
  const { org, members, teams, prompts, currentUserRole } = useOrg();
  const { detected: extensionDetected } = useExtensionDetection();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (dismissed) return null;
  if (currentUserRole !== "admin") return null;

  const steps: Step[] = [
    {
      id: "name-org",
      title: "Name your organization",
      description: "Give your workspace a name so your team knows where they are.",
      done: !!org?.name && org.name !== "My Organization" && org.name.length > 0,
      href: "/settings",
      actionLabel: "Go to Settings",
      icon: Building,
    },
    {
      id: "create-team",
      title: "Create a team",
      description: "Teams let you organize members and control who sees which prompts.",
      done: teams.length > 0,
      href: "/team",
      actionLabel: "Create Team",
      icon: Users,
    },
    {
      id: "invite-members",
      title: "Invite team members",
      description: "Add your colleagues so they can use and contribute prompts.",
      done: members.length > 1,
      href: "/team",
      actionLabel: "Invite Members",
      icon: UserPlus,
    },
    {
      id: "install-extension",
      title: "Install Chrome extension",
      description: "The browser extension lets your team use prompts directly inside AI tools.",
      done: extensionDetected,
      href: "https://chromewebstore.google.com/detail/teamprompt",
      actionLabel: "Install Extension",
      icon: Chrome,
      external: true,
    },
    {
      id: "create-prompt",
      title: "Create your first prompt",
      description: "Write a prompt and assign it to your team. They'll see it in the extension.",
      done: prompts.some((p) => !p.is_template),
      href: "/vault",
      actionLabel: "Create Prompt",
      icon: FileText,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  // Auto-hide when all steps complete
  if (completedCount === steps.length) return null;

  // Find current (first incomplete) step
  const currentStepIndex = steps.findIndex((s) => !s.done);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <Card className="mb-6 border-primary/20 overflow-hidden">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-5 w-5 text-primary" />
          Get started with TeamPrompt
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDismiss}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedCount}/{steps.length} complete</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Vertical stepper */}
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isCurrent = i === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative flex gap-3">
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[15px] top-8 w-0.5 bottom-0",
                      step.done ? "bg-primary/40" : "bg-border"
                    )}
                  />
                )}

                {/* Step circle */}
                <div className="relative z-10 shrink-0">
                  {step.done ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold",
                        isCurrent
                          ? "border-primary text-primary bg-primary/5"
                          : "border-muted-foreground/30 text-muted-foreground/50"
                      )}
                    >
                      {i + 1}
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div className={cn("flex-1 pb-4", i === steps.length - 1 && "pb-0")}>
                  {step.done ? (
                    // Completed: collapsed
                    <p className="pt-1.5 text-sm text-muted-foreground line-through">
                      {step.title}
                    </p>
                  ) : isCurrent ? (
                    // Current: expanded
                    <div className="space-y-2 pt-0.5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <Button size="sm" asChild>
                        {step.external ? (
                          <a href={step.href} target="_blank" rel="noopener noreferrer">
                            {step.actionLabel}
                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <Link href={step.href}>{step.actionLabel}</Link>
                        )}
                      </Button>
                    </div>
                  ) : (
                    // Future: muted
                    <p className="pt-1.5 text-sm text-muted-foreground/50">
                      {step.title}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
