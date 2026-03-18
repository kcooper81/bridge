"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useOrg } from "@/components/providers/org-provider";
import { useExtensionDetection } from "@/hooks/use-extension-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  Check,
  ExternalLink,
  FileText,
  Globe,
  MessageSquare,
  Rocket,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detectBrowser, getStoreForBrowser } from "@/lib/browser-detect";

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
  const [hasAiProviders, setHasAiProviders] = useState(false);

  // Check if AI providers are configured
  useEffect(() => {
    fetch("/api/chat/providers").then((res) => res.json()).then((data) => {
      setHasAiProviders((data.providers || []).length > 0);
    }).catch(() => {});
  }, []);

  const browser = useMemo(() => detectBrowser(), []);
  const store = useMemo(() => getStoreForBrowser(browser), [browser]);

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
      title: "Install browser extension",
      description: "Use prompts and DLP scanning directly inside ChatGPT, Claude, Gemini, Copilot, and Perplexity.",
      done: extensionDetected,
      href: store.url,
      actionLabel: store.buttonLabel,
      icon: Globe,
      external: true,
    },
    {
      id: "setup-ai-chat",
      title: "Try AI Chat (optional)",
      description: "Use any AI model through TeamPrompt with built-in DLP. Add your own API key — or skip this and use the extension with ChatGPT, Claude, etc.",
      done: hasAiProviders,
      href: "/settings/ai-providers",
      actionLabel: "Set Up AI Chat",
      icon: MessageSquare,
    },
    {
      id: "create-prompt",
      title: "Create your first prompt",
      description: "Write a prompt and assign it to your team. They'll see it in the extension and AI Chat.",
      done: prompts.length > 0,
      href: "/vault",
      actionLabel: "Create Prompt",
      icon: FileText,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  if (completedCount === steps.length) return null;

  const currentStepIndex = steps.findIndex((s) => !s.done);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <Card className="mb-6 border-primary/20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-5 w-5 text-primary" />
          Get started with TeamPrompt
        </CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{steps.length} complete
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDismiss}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Horizontal stepper (lg+) ── */}
        <div className="hidden lg:block">
          {/* Connector lines layer — sits behind the circles */}
          <div className="relative flex items-start">
            {steps.map((step, i) => {
              const isCurrent = i === currentStepIndex;
              const Icon = step.icon;
              const isLast = i === steps.length - 1;
              // Line goes from this step to the next
              const lineColor = step.done ? "bg-emerald-400" : "bg-border";

              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line to next step */}
                  {!isLast && (
                    <div
                      className={cn(
                        "absolute top-[18px] left-1/2 w-full h-0.5",
                        lineColor
                      )}
                    />
                  )}

                  {/* Step circle */}
                  <div className="relative z-10">
                    {step.done ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-500/25">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all bg-background",
                          isCurrent
                            ? "border-2 border-primary text-primary ring-4 ring-primary/15 shadow-md shadow-primary/20"
                            : "border-2 border-muted-foreground/20 text-muted-foreground/40"
                        )}
                      >
                        {i + 1}
                      </div>
                    )}
                  </div>

                  {/* Label area */}
                  <div className="flex flex-col items-center text-center mt-3 px-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          step.done
                            ? "text-emerald-500"
                            : isCurrent
                              ? "text-primary"
                              : "text-muted-foreground/30"
                        )}
                      />
                      <h4
                        className={cn(
                          "text-sm font-semibold",
                          step.done
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isCurrent
                              ? "text-foreground"
                              : "text-muted-foreground/40"
                        )}
                      >
                        {step.title}
                      </h4>
                    </div>

                    {step.done && (
                      <p className="text-[11px] text-emerald-500 font-medium">Done</p>
                    )}

                    {isCurrent && (
                      <div className="mt-1.5 space-y-2">
                        <p className="text-xs text-muted-foreground max-w-[180px]">
                          {step.description}
                        </p>
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Vertical stepper (mobile) ── */}
        <div className="lg:hidden space-y-0">
          {steps.map((step, i) => {
            const isCurrent = i === currentStepIndex;
            const Icon = step.icon;
            const isLast = i === steps.length - 1;

            return (
              <div key={step.id} className="relative flex gap-3">
                {/* Connecting line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[15px] top-9 w-0.5 bottom-0",
                      step.done ? "bg-emerald-400" : "bg-border"
                    )}
                  />
                )}

                {/* Step circle */}
                <div className="relative z-10 shrink-0">
                  {step.done ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-500/25">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all bg-background",
                        isCurrent
                          ? "border-primary text-primary ring-4 ring-primary/15 shadow-md shadow-primary/20"
                          : "border-muted-foreground/20 text-muted-foreground/40"
                      )}
                    >
                      {i + 1}
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div className={cn("flex-1", isLast ? "pb-0" : "pb-5")}>
                  {step.done ? (
                    <div className="pt-1.5 flex items-center gap-2">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {step.title}
                      </p>
                      <span className="text-[11px] text-emerald-500 font-medium">Done</span>
                    </div>
                  ) : isCurrent ? (
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
                    <p className="pt-1.5 text-sm text-muted-foreground/40">
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
