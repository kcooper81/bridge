"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useOrg } from "@/components/providers/org-provider";
import { useExtensionDetection } from "@/hooks/use-extension-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  Check,
  Code,
  DollarSign,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Rocket,
  Scale,
  Stethoscope,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detectBrowser, getStoreForBrowser } from "@/lib/browser-detect";
import { createClient } from "@/lib/supabase/client";

const DISMISS_KEY = "teamprompt-setup-wizard-dismissed";

const INDUSTRIES = [
  { id: "healthcare", label: "Healthcare", icon: Stethoscope, color: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600", iconColor: "text-red-500" },
  { id: "finance", label: "Finance", icon: DollarSign, color: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600", iconColor: "text-emerald-500" },
  { id: "technology", label: "Technology", icon: Code, color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600", iconColor: "text-blue-500" },
  { id: "legal", label: "Legal", icon: Scale, color: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600", iconColor: "text-amber-500" },
  { id: "education", label: "Education", icon: GraduationCap, color: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600", iconColor: "text-purple-500" },
  { id: "marketing", label: "Marketing", icon: Megaphone, color: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600", iconColor: "text-pink-500" },
  { id: "other", label: "Other", icon: Building, color: "bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500", iconColor: "text-gray-500" },
] as const;

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
  const { org, members, teams, prompts, currentUserRole, refresh } = useOrg();
  const { detected: extensionDetected } = useExtensionDetection();
  const [dismissed, setDismissed] = useState(true);
  const [hasAiProviders, setHasAiProviders] = useState(false);
  const [industryLoading, setIndustryLoading] = useState(false);

  // Check if AI providers are configured
  useEffect(() => {
    fetch("/api/chat/providers").then((res) => res.json()).then((data) => {
      setHasAiProviders((data.providers || []).length > 0);
    }).catch(() => {});
  }, []);

  async function handleIndustrySelect(industry: string) {
    setIndustryLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/org/industry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ industry }),
      });

      if (res.ok) {
        await refresh();
        if (industry !== "other") toast.success("Industry prompts added to your library");
      } else {
        toast.error("Failed to set industry");
      }
    } catch (e) {
      console.error("Failed to set industry:", e);
      toast.error("Failed to set industry");
    } finally {
      setIndustryLoading(false);
    }
  }

  const browser = useMemo(() => detectBrowser(), []);
  const store = useMemo(() => getStoreForBrowser(browser), [browser]);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (dismissed) return null;
  if (currentUserRole !== "admin") return null;

  const steps: Step[] = [
    {
      id: "choose-industry",
      title: "Choose your industry",
      description: "We'll set up prompts tailored to your field.",
      done: !!org?.industry,
      href: "#",
      actionLabel: "Choose Industry",
      icon: Building,
    },
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

        {/* ── Industry Picker (shown when industry step is current) ── */}
        {currentStepIndex === 0 && !org?.industry && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-1">What industry are you in?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              We&apos;ll add starter prompts tailored to your team&apos;s needs.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                return (
                  <button
                    key={ind.id}
                    disabled={industryLoading}
                    onClick={() => handleIndustrySelect(ind.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      ind.color
                    )}
                  >
                    <Icon className={cn("h-8 w-8", ind.iconColor)} />
                    <span className="text-sm font-medium">{ind.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handleIndustrySelect("other")}
              disabled={industryLoading}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors disabled:opacity-50"
            >
              Skip this step
            </button>
          </div>
        )}

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
