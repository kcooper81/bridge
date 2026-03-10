"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Zap,
  BarChart3,
  Users,
  Lock,
  Globe,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Rocket,
  Star,
  Eye,
  FileText,
  Layers,
  ArrowRight,
  Monitor,
  Server,
  Database,
  Code2,
  Brain,
  Puzzle,
  Briefcase,
  Scale,
  Heart,
  Banknote,
  MessageCircle,
} from "lucide-react";

// ─── Slide Data ──────────────────────────────────────────────────

const TOTAL_SLIDES = 12;

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_SLIDES - 1, idx));
      setCurrentSlide(clamped);
      if (isScrollMode && slideRefs.current[clamped]) {
        slideRefs.current[clamped]!.scrollIntoView({ behavior: "smooth" });
      }
    },
    [isScrollMode]
  );

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        setIsScrollMode((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Scroll-mode intersection observer
  useEffect(() => {
    if (!isScrollMode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx >= 0) setCurrentSlide(idx);
          }
        }
      },
      { threshold: 0.5 }
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isScrollMode]);

  const slideProps = (idx: number) => ({
    ref: (el: HTMLDivElement | null) => {
      slideRefs.current[idx] = el;
    },
    className: cn(
      "min-h-screen w-full flex items-center justify-center px-6 py-12 sm:px-12 lg:px-20",
      !isScrollMode && idx !== currentSlide && "hidden"
    ),
  });

  return (
    <div ref={containerRef} className="relative bg-zinc-950 text-white -mt-16">
      {/* ─── Navigation overlay ─── */}
      {!isScrollMode && (
        <>
          {/* Side click zones */}
          <button
            onClick={prev}
            className="fixed left-0 top-0 bottom-0 w-20 z-40 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8 text-white/60" />
          </button>
          <button
            onClick={next}
            className="fixed right-0 top-0 bottom-0 w-20 z-40 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8 text-white/60" />
          </button>
        </>
      )}

      {/* ─── Bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/90 backdrop-blur-sm border-t border-white/5">
        <div className="flex items-center justify-between px-6 py-2">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentSlide
                    ? "w-6 bg-blue-500"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>
              {currentSlide + 1}/{TOTAL_SLIDES}
            </span>
            <button
              onClick={() => setIsScrollMode((v) => !v)}
              className="hover:text-white transition-colors"
            >
              {isScrollMode ? "Slide mode" : "Scroll mode"}
            </button>
            <span className="hidden sm:inline">
              Arrow keys / Click / Space
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 1: TITLE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(0)}>
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="flex justify-center">
            <Image
              src="/brand/logo-icon-blue.svg"
              alt="TeamPrompt"
              width={80}
              height={80}
              className="rounded-2xl"
            />
          </div>

          <div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              Team<span className="text-blue-500">Prompt</span>
            </h1>
            <p className="mt-4 text-2xl sm:text-3xl text-zinc-400 font-light">
              The Git for AI Prompts
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-lg text-zinc-300 leading-relaxed">
              Teams waste <span className="text-white font-semibold">40% of AI time</span> recreating the same prompts every week.
              We built a shared prompt library that works inside ChatGPT, Claude, Gemini, Copilot, and Perplexity.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: "1,200+", label: "Active users" },
              { value: "$12K", label: "MRR" },
              { value: "85", label: "Paying teams" },
              { value: "4.8\u2605", label: "Chrome Store" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-zinc-600 text-sm">All organic growth. Zero marketing spend.</p>

          {!isScrollMode && (
            <button onClick={next} className="animate-bounce mt-4">
              <ChevronDown className="h-6 w-6 text-zinc-600 mx-auto" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 2: THE PAIN
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(1)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              The Problem
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
              &ldquo;I watched a 50-person law firm<br className="hidden sm:block" /> waste hours every week&rdquo;
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 space-y-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <h3 className="text-xl font-semibold">The Real Story</h3>
              <ul className="space-y-3 text-zinc-300 text-sm leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-red-400 shrink-0">&bull;</span>
                  10 lawyers writing different versions of the same &ldquo;contract analysis&rdquo; prompt
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 shrink-0">&bull;</span>
                  One accidentally included <span className="text-red-300 font-medium">client SSNs</span> in their prompt
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 shrink-0">&bull;</span>
                  Partner: &ldquo;We pay for ChatGPT Enterprise but outputs are inconsistent and we&apos;re terrified of data leaks&rdquo;
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 space-y-4">
              <Eye className="h-8 w-8 text-zinc-400" />
              <h3 className="text-xl font-semibold">Current &ldquo;Solutions&rdquo; Are Broken</h3>
              <div className="space-y-3">
                {[
                  { tool: "Google Docs", issue: "No AI tool integration" },
                  { tool: "ChatGPT Teams", issue: "No prompt library" },
                  { tool: "Slack / Notion", issue: "No version control" },
                  { tool: "Copy & Paste", issue: "No security or analytics" },
                ].map((row) => (
                  <div key={row.tool} className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-500 w-28 shrink-0">{row.tool}</span>
                    <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
                    <span className="text-red-300">{row.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-xl p-6 text-center">
            <p className="text-lg text-zinc-300">
              Result: <span className="text-white font-semibold">Inconsistent AI output</span> + <span className="text-red-400 font-semibold">Security risks</span> + <span className="text-amber-400 font-semibold">Wasted time</span>
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 3: HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(2)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              The Solution
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              How TeamPrompt Works
            </h2>
            <p className="mt-3 text-lg text-zinc-400">3 simple steps. 2-minute setup. Free to start.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Create",
                desc: "Build prompts with templates, variables, and version control. Set quality guidelines per team.",
                icon: FileText,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                step: "2",
                title: "Share",
                desc: "Distribute to your team with role-based access. Organize by category, tag, and team scope.",
                icon: Users,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
              {
                step: "3",
                title: "Use Everywhere",
                desc: "One-click insert via browser extension in ChatGPT, Claude, Gemini, Copilot, and Perplexity.",
                icon: Globe,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
            ].map((s) => (
              <div
                key={s.step}
                className={cn("rounded-2xl border p-8 space-y-4", s.bg)}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("text-3xl font-bold", s.color)}>{s.step}</span>
                  <s.icon className={cn("h-6 w-6", s.color)} />
                </div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Key features grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: "DLP Protection", desc: "Blocks SSNs, credit cards, API keys" },
              { icon: Globe, label: "5 AI Tools", desc: "ChatGPT, Claude, Gemini, Copilot, Perplexity" },
              { icon: BarChart3, label: "Analytics", desc: "Track which prompts work best" },
              { icon: Lock, label: "19 Compliance Packs", desc: "HIPAA, SOC 2, GDPR, PCI-DSS, and more" },
            ].map((f) => (
              <div key={f.label} className="bg-zinc-900/60 border border-white/5 rounded-xl p-4">
                <f.icon className="h-5 w-5 text-blue-400 mb-2" />
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs text-zinc-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
            <p className="text-emerald-300 font-medium">
              &ldquo;40% time savings in our legal department&rdquo;
              <span className="text-zinc-500 text-sm ml-2">— 200-lawyer firm</span>
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 4: PRODUCT SCREENSHOTS
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(3)}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              The Product
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Built & Shipping
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/store-assets/screenshot-2-prompt-list.png"
                  alt="Prompt library"
                  width={1280}
                  height={800}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-zinc-500 text-center">Prompt library with categories, tags, and team sharing</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/store-assets/screenshot-11-multi-ai.png"
                  alt="Browser extension in multiple AI tools"
                  width={1280}
                  height={800}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-zinc-500 text-center">Browser extension working across 5 AI platforms</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/store-assets/screenshot-6-dlp-block.png"
                  alt="DLP protection blocking sensitive data"
                  width={1280}
                  height={800}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-zinc-500 text-center">Real-time DLP: blocks SSNs, credit cards, API keys</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/store-assets/screenshot-9-admin-dashboard.png"
                  alt="Admin analytics dashboard"
                  width={1280}
                  height={800}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-zinc-500 text-center">Admin dashboard with usage analytics and security insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 5: MARKET
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(4)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Market Opportunity
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              $50B AI Productivity Market
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { value: "180M+", label: "Business ChatGPT users", trend: "OpenAI Enterprise 2024" },
              { value: "87%", label: "Enterprises use 2+ AI tools", trend: "McKinsey AI Survey" },
              { value: "3x", label: "AI adoption growth since 2023", trend: "Gartner 2024" },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-3xl sm:text-4xl font-bold text-blue-400">{s.value}</p>
                <p className="text-sm text-zinc-300 mt-2">{s.label}</p>
                <p className="text-[10px] text-zinc-600 mt-1">{s.trend}</p>
              </div>
            ))}
          </div>

          {/* Market sizing */}
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h3 className="font-semibold mb-6 text-lg">Market Sizing</h3>
            <div className="space-y-4">
              {[
                { label: "TAM", value: "$50B", desc: "AI productivity software", width: "100%" },
                { label: "SAM", value: "$12B", desc: "Teams using ChatGPT/Claude for business", width: "24%" },
                { label: "SOM", value: "$300M", desc: "Early adopters in regulated industries", width: "6%" },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-4">
                  <span className="text-xs text-zinc-500 w-10 shrink-0 font-mono">{m.label}</span>
                  <div className="flex-1">
                    <div className="h-8 rounded-lg bg-blue-500/10 relative overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 flex items-center px-3"
                        style={{ width: m.width }}
                      >
                        <span className="text-xs font-bold whitespace-nowrap">{m.value}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target customers */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Scale, title: "Legal Teams", pct: "40%", desc: "Need compliance + consistency. Highest willingness to pay." },
              { icon: Target, title: "Marketing Agencies", pct: "35%", desc: "Need brand voice control across clients and AI tools." },
              { icon: Heart, title: "Healthcare / Finance", pct: "25%", desc: "Need security, audit trails, and regulatory compliance." },
            ].map((seg) => (
              <div key={seg.title} className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                <seg.icon className="h-6 w-6 text-blue-400 mb-3" />
                <div className="flex items-baseline gap-2 mb-2">
                  <h4 className="font-semibold">{seg.title}</h4>
                  <span className="text-xs text-blue-400">{seg.pct} of revenue</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{seg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 6: BUSINESS MODEL
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(5)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Business Model
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Freemium SaaS — Customers Already Paying
            </h2>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            {[
              {
                tier: "Free",
                price: "$0",
                desc: "5 users, core features",
                highlight: false,
              },
              {
                tier: "Pro",
                price: "$9",
                desc: "/user/month — Analytics, unlimited prompts",
                highlight: false,
              },
              {
                tier: "Team",
                price: "$7",
                desc: "/user/month — Collaboration + compliance",
                highlight: true,
              },
              {
                tier: "Business",
                price: "$12",
                desc: "/user/month — Enterprise security + SLA",
                highlight: false,
              },
            ].map((t) => (
              <div
                key={t.tier}
                className={cn(
                  "rounded-2xl p-6 text-center border",
                  t.highlight
                    ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                    : "bg-zinc-900/60 border-white/10"
                )}
              >
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{t.tier}</p>
                <p className="text-3xl font-bold mt-2">{t.price}</p>
                <p className="text-xs text-zinc-400 mt-1">{t.desc}</p>
                {t.highlight && (
                  <span className="inline-block mt-3 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                    Most popular
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Unit economics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "14:1", label: "LTV : CAC", icon: TrendingUp },
              { value: "92%", label: "Gross Margin", icon: DollarSign },
              { value: "25%", label: "Free \u2192 Paid", icon: Rocket },
              { value: "<2%", label: "Monthly Churn", icon: Star },
            ].map((m) => (
              <div key={m.label} className="bg-zinc-900/60 border border-white/10 rounded-xl p-5 text-center">
                <m.icon className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900/40 rounded-xl p-6 text-center text-sm text-zinc-400">
            Reference: Follows Notion&apos;s successful freemium model — free tier drives organic adoption, teams convert when they need collaboration and security.
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 7: TRACTION
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(6)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Traction
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Product-Market Fit Proven
            </h2>
            <p className="mt-3 text-lg text-zinc-400">6 months. Organic growth. Zero ad spend.</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { value: "1,200+", label: "Active users", sub: "organic" },
              { value: "85", label: "Paying teams", sub: "" },
              { value: "$12K", label: "MRR", sub: "40% MoM" },
              { value: "4.8\u2605", label: "Chrome Store", sub: "500+ reviews" },
              { value: "<2%", label: "Monthly churn", sub: "" },
            ].map((m) => (
              <div key={m.label} className="bg-zinc-900/60 border border-white/10 rounded-xl p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold">{m.value}</p>
                <p className="text-xs text-zinc-400 mt-1">{m.label}</p>
                {m.sub && <p className="text-[10px] text-emerald-400 mt-0.5">{m.sub}</p>}
              </div>
            ))}
          </div>

          {/* MRR growth visualization */}
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h3 className="font-semibold mb-6">MRR Growth (40% MoM)</h3>
            <div className="flex items-end gap-2 h-40">
              {[
                { month: "M1", mrr: 1.2, h: "8%" },
                { month: "M2", mrr: 1.7, h: "11%" },
                { month: "M3", mrr: 2.4, h: "16%" },
                { month: "M4", mrr: 3.4, h: "22%" },
                { month: "M5", mrr: 4.7, h: "31%" },
                { month: "M6", mrr: 6.6, h: "44%" },
                { month: "M7", mrr: 8.5, h: "57%" },
                { month: "Now", mrr: 12, h: "80%" },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-zinc-500">${bar.mrr}K</span>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all"
                    style={{ height: bar.h }}
                  />
                  <span className="text-[10px] text-zinc-600">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                quote: "40% time savings in our legal department",
                from: "200-lawyer firm",
                icon: Scale,
              },
              {
                quote: "Consistent AI output across 50 marketers",
                from: "Digital agency",
                icon: Target,
              },
              {
                quote: "HIPAA compliance we can trust",
                from: "Healthcare provider",
                icon: Heart,
              },
            ].map((t) => (
              <div key={t.from} className="bg-zinc-900/40 border border-white/5 rounded-xl p-5">
                <t.icon className="h-5 w-5 text-blue-400 mb-3" />
                <p className="text-sm font-medium text-zinc-200 mb-2">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-xs text-zinc-500">— {t.from}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-zinc-500">
              Growth engine: Chrome Web Store discovery + word-of-mouth. <span className="text-emerald-400">No marketing spend yet.</span>
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 8: TECHNICAL ARCHITECTURE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(7)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Technical Architecture
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Enterprise-Grade Stack
            </h2>
            <p className="mt-3 text-lg text-zinc-400">Built for scale, security, and speed.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Stack */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 space-y-5">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-400" />
                Tech Stack
              </h3>
              <div className="space-y-3">
                {[
                  { layer: "Frontend", tech: "Next.js 14 (App Router), React, TypeScript, Tailwind CSS", icon: Monitor },
                  { layer: "Backend", tech: "Next.js API Routes, Edge Functions, Supabase (Postgres + Auth + Realtime)", icon: Server },
                  { layer: "Database", tech: "Supabase (Postgres) with Row-Level Security, real-time subscriptions", icon: Database },
                  { layer: "Extension", tech: "Chrome MV3 extension — vanilla JS, works across 5 AI platforms", icon: Puzzle },
                  { layer: "Infra", tech: "Vercel (auto-scaling), Supabase Cloud, Resend (email), Stripe", icon: Globe },
                ].map((row) => (
                  <div key={row.layer} className="flex gap-3">
                    <row.icon className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-400 font-semibold">{row.layer}</p>
                      <p className="text-sm text-zinc-300">{row.tech}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 space-y-5">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Security & Compliance
              </h3>
              <div className="space-y-3">
                {[
                  { feature: "Row-Level Security", desc: "Every DB query enforced at Postgres level — no data leaks between orgs" },
                  { feature: "Real-time DLP", desc: "Client-side + server-side scanning blocks PII, credit cards, API keys before they reach AI" },
                  { feature: "19 Compliance Packs", desc: "Pre-built rule sets for HIPAA, SOC 2, GDPR, PCI-DSS, FERPA, GLBA, NIST, and more" },
                  { feature: "Audit Logging", desc: "Full activity trail — every prompt use, edit, and security event tracked" },
                  { feature: "2FA / TOTP", desc: "Two-factor authentication for all users, enforced at org level" },
                  { feature: "Domain Auto-Join", desc: "SSO-like experience — users auto-join org by verified email domain" },
                ].map((row) => (
                  <div key={row.feature} className="flex gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-200 font-medium">{row.feature}</p>
                      <p className="text-xs text-zinc-500">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical moat */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-400" />
              Technical Moat
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  title: "Universal Extension",
                  desc: "Single Chrome extension integrates with ChatGPT, Claude, Gemini, Copilot, and Perplexity simultaneously. This is hard to replicate — each AI tool has a different DOM structure, session model, and injection point.",
                  icon: Puzzle,
                },
                {
                  title: "Client-Side DLP Engine",
                  desc: "Sensitive data is caught before it leaves the browser. No server-side processing of PII means data never hits a third-party API. Real-time regex + pattern matching with configurable compliance packs.",
                  icon: Shield,
                },
                {
                  title: "Real-Time Collaboration",
                  desc: "Supabase Realtime enables instant prompt sharing, live analytics, and team-wide security policy enforcement. Changes propagate in <500ms across all connected users.",
                  icon: Zap,
                },
              ].map((m) => (
                <div key={m.title}>
                  <m.icon className="h-5 w-5 text-blue-400 mb-2" />
                  <h4 className="font-medium text-sm mb-1">{m.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 9: COMPETITIVE LANDSCAPE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(8)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Competitive Landscape
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Why We Win
            </h2>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-zinc-500 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 text-blue-400 font-bold">TeamPrompt</th>
                  <th className="text-center py-3 px-4 text-zinc-500 font-medium">ChatGPT Teams</th>
                  <th className="text-center py-3 px-4 text-zinc-500 font-medium">Notion AI</th>
                  <th className="text-center py-3 px-4 text-zinc-500 font-medium">Google Docs</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {[
                  { feature: "Prompt library", us: true, chatgpt: false, notion: false, gdocs: false },
                  { feature: "Multi-AI integration", us: true, chatgpt: false, notion: false, gdocs: false },
                  { feature: "Browser extension", us: true, chatgpt: false, notion: false, gdocs: false },
                  { feature: "DLP / Data protection", us: true, chatgpt: false, notion: false, gdocs: false },
                  { feature: "Compliance packs", us: true, chatgpt: false, notion: false, gdocs: false },
                  { feature: "Version control", us: true, chatgpt: false, notion: true, gdocs: true },
                  { feature: "Team analytics", us: true, chatgpt: true, notion: false, gdocs: false },
                  { feature: "Role-based access", us: true, chatgpt: true, notion: true, gdocs: true },
                  { feature: "Template variables", us: true, chatgpt: false, notion: false, gdocs: false },
                  { feature: "Audit trail", us: true, chatgpt: false, notion: false, gdocs: false },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="py-2.5 px-4 text-zinc-300">{row.feature}</td>
                    <td className="text-center py-2.5 px-4">
                      {row.us ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="text-center py-2.5 px-4">
                      {row.chatgpt ? <CheckCircle2 className="h-4 w-4 text-zinc-500 mx-auto" /> : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="text-center py-2.5 px-4">
                      {row.notion ? <CheckCircle2 className="h-4 w-4 text-zinc-500 mx-auto" /> : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="text-center py-2.5 px-4">
                      {row.gdocs ? <CheckCircle2 className="h-4 w-4 text-zinc-500 mx-auto" /> : <span className="text-zinc-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Investor FAQ preview */}
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              &ldquo;Why won&apos;t ChatGPT just build this?&rdquo;
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              ChatGPT focuses on <span className="text-white font-medium">models</span>, not workflow management.
              They optimize inference, not team governance. We&apos;re the <span className="text-blue-400 font-medium">workflow layer</span> that
              makes teams productive and safe across <em>all</em> AI tools — not just one.
              This is the same reason GitHub exists alongside programming languages.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 10: TEAM
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(9)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              The Team
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Built by Someone Who Lives the Problem
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-bold">
                  F
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Founder / CEO</h3>
                  <p className="text-sm text-zinc-400">Technical founder & product builder</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  Built product solo while consulting with AI teams
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  Deep customer insights from 50+ team interviews
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  Understands enterprise security requirements firsthand
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  Shipped working product with real revenue — solo
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
                <h4 className="font-semibold mb-3">Why Solo Founder Works Here</h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex gap-2">
                    <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    Faster iteration than big teams — ship weekly
                  </li>
                  <li className="flex gap-2">
                    <Users className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    Stay close to customers — handles support personally
                  </li>
                  <li className="flex gap-2">
                    <DollarSign className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    Capital efficient — $0 to $12K MRR with no funding
                  </li>
                  <li className="flex gap-2">
                    <Rocket className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    Proven ability to ship and iterate on complex systems
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <h4 className="font-semibold mb-2 text-emerald-300">First Hire (With Funding)</h4>
                <p className="text-sm text-zinc-400">
                  Part-time security engineer for enterprise features (SSO/SAML, SCIM provisioning, SOC 2 certification).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 11: THE ASK
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(10)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              The Ask
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              $100K for Smart Growth
            </h2>
            <p className="mt-3 text-lg text-zinc-400">Pre-seed round. Capital efficient.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Use of funds */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-blue-400" />
                Use of Funds
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Security Engineer (PT)", amount: "$40K", pct: "40%", color: "bg-blue-500" },
                  { label: "Customer Acquisition", amount: "$30K", pct: "30%", color: "bg-emerald-500" },
                  { label: "Enterprise Features", amount: "$20K", pct: "20%", color: "bg-amber-500" },
                  { label: "Infrastructure & Tools", amount: "$10K", pct: "10%", color: "bg-purple-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-300">{item.label}</span>
                      <span className="text-zinc-500">
                        {item.amount} ({item.pct})
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: item.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 18-month targets */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                18-Month Targets
              </h3>
              <div className="space-y-6">
                {[
                  { metric: "Active Users", from: "1,200", to: "5,000" },
                  { metric: "MRR", from: "$12K", to: "$75K" },
                  { metric: "Paying Teams", from: "85", to: "200" },
                  { metric: "ARR Run Rate", from: "$144K", to: "$900K" },
                ].map((t) => (
                  <div key={t.metric} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500">{t.metric}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-zinc-500">{t.from}</span>
                        <ArrowRight className="h-3 w-3 text-blue-400" />
                        <span className="text-lg font-bold text-emerald-400">{t.to}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-zinc-500">
                  $75K MRR = $900K ARR <ArrowRight className="inline h-3 w-3 text-blue-400 mx-1" />
                  Strong seed round position
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-300">
              <span className="text-blue-400 font-semibold">Runway: 12-18 months</span> to profitability.
              We&apos;re not asking for millions to figure things out. We&apos;re asking for $100K to accelerate what&apos;s already working.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 12: INVESTOR Q&A + CLOSING
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(11)}>
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Q&A & Vision
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Anticipated Questions
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                q: "Why won't ChatGPT just build this?",
                a: "ChatGPT focuses on models, not workflow management. We're the governance layer across ALL AI tools. GitHub exists alongside programming languages for the same reason.",
                icon: Brain,
              },
              {
                q: "How do you compete with free solutions?",
                a: "Free solutions lack security, multi-AI integration, and analytics. Teams pay for consistency, compliance, and audit trails — not just storage.",
                icon: Briefcase,
              },
              {
                q: "Why not raise more money?",
                a: "We're capital efficient. $100K gives us 18 months to hit $75K MRR, positioning us for a larger seed round on strong terms.",
                icon: DollarSign,
              },
              {
                q: "What's your biggest risk?",
                a: "Execution risk — but we've proven we can ship and acquire customers with zero marketing spend. The product is live with paying customers.",
                icon: AlertTriangle,
              },
              {
                q: "What if AI tools add prompt libraries?",
                a: "They'll optimize for their own platform. We're the cross-platform standard — like 1Password works across browsers. Teams use 2+ AI tools on average.",
                icon: Puzzle,
              },
              {
                q: "How defensible is the extension?",
                a: "Each AI tool requires unique DOM integration, auth bridge, and injection logic. We maintain compatibility across 5 platforms with different update cycles. It's a deep technical moat.",
                icon: Code2,
              },
              {
                q: "Can this scale without a big team?",
                a: "Architecture is serverless (Vercel + Supabase). Infra auto-scales. The extension runs client-side. We can serve 100K users on current infrastructure with minimal cost increase.",
                icon: Server,
              },
              {
                q: "What about enterprise sales cycles?",
                a: "We start bottom-up: one team member installs the extension, team adopts, then org upgrades. No enterprise sales needed — it's a product-led motion like Slack and Notion.",
                icon: Building2,
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-zinc-900/60 border border-white/10 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <faq.icon className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-zinc-200">{faq.q}</p>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk assessment */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
            <h3 className="font-semibold text-sm mb-4 text-zinc-400 uppercase tracking-wider">Risk Assessment</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { risk: "Technical", level: "Low", reason: "Product works, scales, ships weekly" },
                { risk: "Market", level: "Low", reason: "Paying customers, growing 40% MoM" },
                { risk: "Team", level: "Low", reason: "Proven solo execution to revenue" },
                { risk: "Capital", level: "Low", reason: "18-month runway to profitability" },
              ].map((r) => (
                <div key={r.risk} className="text-center">
                  <p className="text-xs text-zinc-500">{r.risk} Risk</p>
                  <p className="text-emerald-400 font-bold text-lg mt-1">{r.level}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 border border-blue-500/20 rounded-2xl p-8 text-center space-y-6">
            <h3 className="text-2xl font-bold">The Vision</h3>
            <div className="grid sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
              <div className="bg-zinc-950/50 rounded-xl p-5">
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">Phase 1 — Next 18 Months</p>
                <p className="text-sm text-zinc-300">
                  Become the go-to prompt management tool for teams of 10-100 people in regulated industries.
                </p>
              </div>
              <div className="bg-zinc-950/50 rounded-xl p-5">
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">Phase 2 — Future</p>
                <p className="text-sm text-zinc-300">
                  Platform for AI workflow orchestration — the control plane for how organizations use AI.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
                &ldquo;I built this because I lived this problem. Customers are already paying.
                With <span className="text-blue-400 font-semibold">$100K</span>, we accelerate what&apos;s already working.&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Image
                src="/brand/logo-icon-blue.svg"
                alt="TeamPrompt"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className="text-left">
                <p className="font-bold">TeamPrompt</p>
                <p className="text-xs text-zinc-500">teamprompt.app</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacer for scroll mode */}
      {isScrollMode && <div className="h-16" />}
    </div>
  );
}
