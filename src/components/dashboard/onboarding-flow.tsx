"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useOrg } from "@/components/providers/org-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building,
  Code,
  DollarSign,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Monitor,
  Scale,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detectBrowser, getStoreForBrowser } from "@/lib/browser-detect";
import { createClient } from "@/lib/supabase/client";
import { saveOrg } from "@/lib/vault-api";

const DISMISS_KEY = "teamprompt-onboarding-dismissed";

const INDUSTRIES = [
  { id: "healthcare", label: "Healthcare", icon: Stethoscope, color: "bg-red-50 border-red-200 hover:border-red-400", iconColor: "text-red-500" },
  { id: "finance", label: "Finance", icon: DollarSign, color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400", iconColor: "text-emerald-500" },
  { id: "technology", label: "Technology", icon: Code, color: "bg-blue-50 border-blue-200 hover:border-blue-400", iconColor: "text-blue-500" },
  { id: "legal", label: "Legal", icon: Scale, color: "bg-amber-50 border-amber-200 hover:border-amber-400", iconColor: "text-amber-500" },
  { id: "education", label: "Education", icon: GraduationCap, color: "bg-purple-50 border-purple-200 hover:border-purple-400", iconColor: "text-purple-500" },
  { id: "marketing", label: "Marketing", icon: Megaphone, color: "bg-pink-50 border-pink-200 hover:border-pink-400", iconColor: "text-pink-500" },
  { id: "other", label: "Other", icon: Building, color: "bg-gray-50 border-gray-200 hover:border-gray-400", iconColor: "text-gray-500" },
] as const;

export function OnboardingFlow() {
  const { org, refresh } = useOrg();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const browser = useMemo(() => detectBrowser(), []);
  const store = useMemo(() => getStoreForBrowser(browser), [browser]);

  // Key dismiss by org ID so it resets on new account/org
  const dismissKey = org?.id ? `${DISMISS_KEY}-${org.id}` : DISMISS_KEY;

  // Determine if onboarding should show
  useEffect(() => {
    if (!org) return;
    const dismissed = localStorage.getItem(dismissKey) === "true";
    if (dismissed) return;

    const isFreshAccount = !org.industry && org.name?.includes("'s Org");
    if (isFreshAccount) {
      setVisible(true);
      setWorkspaceName(org.name || "");
    }
  }, [org, dismissKey]);

  function dismiss() {
    localStorage.setItem(dismissKey, "true");
    setVisible(false);
  }

  function goToStep(next: number) {
    setTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setTransitioning(false);
    }, 200);
  }

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
        goToStep(1);
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

  async function handleSaveName() {
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    setNameSaving(true);
    try {
      const result = await saveOrg({ name: trimmed });
      if (result) {
        await refresh();
        goToStep(2);
      } else {
        toast.error("Failed to update workspace name");
      }
    } catch {
      toast.error("Failed to update workspace name");
    } finally {
      setNameSaving(false);
    }
  }

  function handleInstallExtension() {
    window.open(store.url, "_blank");
    dismiss();
  }

  function handleTryChat() {
    dismiss();
    router.push("/chat");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Logo top-left */}
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <Image src="/logo.svg" alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
        <span className="text-lg font-semibold text-gray-900">TeamPrompt</span>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "w-full max-w-xl px-6 transition-all duration-200",
          transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}
      >
        {/* Step 1: Industry Selection */}
        {step === 0 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What does your team do?</h1>
            <p className="text-gray-500 mb-8">
              We&apos;ll customize your prompt library and security settings
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                return (
                  <button
                    key={ind.id}
                    disabled={industryLoading}
                    onClick={() => handleIndustrySelect(ind.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      ind.color
                    )}
                  >
                    <Icon className={cn("h-8 w-8", ind.iconColor)} />
                    <span className="text-sm font-medium text-gray-700">{ind.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Name your workspace */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Name your workspace</h1>
            <p className="text-gray-500 mb-8">This is what your team will see</p>
            <div className="max-w-sm mx-auto space-y-4">
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="text-center text-lg h-12"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                }}
              />
              <Button
                onClick={handleSaveName}
                disabled={nameSaving || !workspaceName.trim()}
                className="w-full"
                size="lg"
              >
                {nameSaving ? "Saving..." : "Continue"}
              </Button>
              <button
                onClick={() => goToStep(2)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Step 3: How will you use AI? */}
        {step === 2 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">How will your team use AI?</h1>
            <p className="text-gray-500 mb-8">You can always change this later</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Browser Extension card */}
              <div className="rounded-xl border-2 border-gray-200 p-6 text-center hover:border-blue-300 transition-colors">
                <Monitor className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Browser Extension</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Scan prompts in ChatGPT, Claude, Gemini
                </p>
                <Button onClick={handleInstallExtension} className="w-full">
                  Install Extension
                </Button>
              </div>

              {/* Built-In AI Chat card */}
              <div className="rounded-xl border-2 border-gray-200 p-6 text-center hover:border-purple-300 transition-colors">
                <MessageSquare className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Built-In AI Chat</h3>
                <p className="text-sm text-gray-500 mb-4">
                  DLP-protected chat with your own API keys
                </p>
                <Button onClick={handleTryChat} variant="outline" className="w-full">
                  Try AI Chat
                </Button>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip &mdash; I&apos;ll set this up later
            </button>
          </div>
        )}
      </div>

      {/* Step dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              i === step ? "bg-gray-900" : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}
