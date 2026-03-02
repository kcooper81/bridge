"use client";

import { useMemo } from "react";
import { SectionLabel } from "@/components/marketing/section-label";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { detectBrowser, getStoreForBrowser } from "@/lib/browser-detect";

export function ExtensionHero() {
  const browser = useMemo(() => detectBrowser(), []);
  const store = useMemo(() => getStoreForBrowser(browser), [browser]);

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.3) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 40% at 80% 60%, hsl(260 60% 50% / 0.1) 0%, transparent 50%)",
          ].join(", "),
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel dark className="text-center">
            Browser Extension
          </SectionLabel>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Get the{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              TeamPrompt Extension
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Use your team&apos;s prompts directly in ChatGPT, Claude, Gemini,
            and more. Available for Chrome, Firefox, and Edge.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href={store.url} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
              >
                {store.buttonLabel}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="#browsers">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 rounded-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                All browsers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Detected: {store.name}
          </p>
        </div>
      </div>
    </section>
  );
}
