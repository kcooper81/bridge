"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Shield } from "lucide-react";
import { detectBrowser, getStoreForBrowser } from "@/lib/browser-detect";

export function ExtensionHero() {
  const browser = useMemo(() => detectBrowser(), []);
  const store = useMemo(() => getStoreForBrowser(browser), [browser]);

  return (
    <section
      className="relative overflow-hidden border-b border-border"
      style={{ background: "linear-gradient(180deg, #fff 0%, #F1F8FF 50%, #fff 100%)" }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-tight">
              One extension,{" "}
              <span className="text-primary">every AI tool.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Use your team&apos;s prompts directly in ChatGPT, Claude, Gemini,
              Copilot, and Perplexity. DLP scanning runs automatically.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a href={store.url} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 rounded-lg font-bold"
                >
                  {store.buttonLabel}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#browsers">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-12 rounded-lg font-bold"
                >
                  All browsers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Chrome, Firefox, and Edge. Free with any TeamPrompt plan.
            </p>
          </div>

          {/* Extension mockup with UI overlay */}
          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-[20px] shadow-xl shadow-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=80&auto=format&fit=crop"
                alt="Developer using AI tools in browser"
                className="w-full h-[380px] object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 100% 100%, rgba(0,0,0,0.3), transparent 70%)" }}
              />
              {/* UI overlay */}
              <div className="absolute bottom-4 right-4 flex items-center gap-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-4 py-3 shadow-lg border border-white/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">DLP Active</p>
                  <p className="text-xs text-muted-foreground">Scanning all AI interactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
