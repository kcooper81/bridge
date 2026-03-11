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
  X as XIcon,
  Award,
  BadgeCheck,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────

const TOTAL_SLIDES = 13;

// ─── Animated text reveal ───────────────────────────────────────
function RevealText({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

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
    ref: (el: HTMLDivElement | null) => { slideRefs.current[idx] = el; },
    className: cn(
      "min-h-screen w-full flex items-center justify-center px-6 py-16 sm:px-12 lg:px-20 relative overflow-hidden",
      !isScrollMode && idx !== currentSlide && "hidden"
    ),
  });

  // Slide label for progress
  const slideLabels = [
    "", "Problem", "Solution", "Product", "Why Now", "Competitive Edge",
    "Business Model", "Traction", "Architecture", "Team", "The Ask", "Growth Plan", "Vision",
  ];

  return (
    <div ref={containerRef} className="relative bg-[#09090b] text-white selection:bg-amber-500/30 selection:text-white">
      {/* ─── CSS animations ─── */}
      <style jsx global>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          30% { transform: translate(3%, -15%); }
          50% { transform: translate(12%, 9%); }
          70% { transform: translate(9%, 4%); }
          90% { transform: translate(-1%, 7%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .grain-overlay::before {
          content: '';
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 1;
        }
        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%);
          background-size: 200% 200%;
          animation: gradient-shift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%);
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
        }
        .glow-card-amber {
          background: linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%);
          border: 1px solid rgba(245,158,11,0.15);
        }
        .glow-card-blue {
          background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%);
          border: 1px solid rgba(59,130,246,0.15);
        }
        .glow-card-emerald {
          background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%);
          border: 1px solid rgba(16,185,129,0.15);
        }
        .glow-card-red {
          background: linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 100%);
          border: 1px solid rgba(239,68,68,0.15);
        }
      `}</style>

      {/* ─── Navigation overlay ─── */}
      {!isScrollMode && (
        <>
          <button
            onClick={prev}
            className="fixed left-0 top-0 bottom-0 w-20 z-40 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8 text-zinc-500" />
          </button>
          <button
            onClick={next}
            className="fixed right-0 top-0 bottom-0 w-20 z-40 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8 text-zinc-500" />
          </button>
        </>
      )}

      {/* ─── Bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === currentSlide
                    ? "w-8 bg-gradient-to-r from-amber-400 to-amber-600"
                    : i < currentSlide
                      ? "w-1.5 bg-amber-400/30"
                      : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {slideLabels[currentSlide] && (
              <span className="text-zinc-400 font-medium">{slideLabels[currentSlide]}</span>
            )}
            <span className="font-mono">
              {String(currentSlide + 1).padStart(2, "0")}/{TOTAL_SLIDES}
            </span>
            <button
              onClick={() => setIsScrollMode((v) => !v)}
              className="hover:text-zinc-300 transition-colors border border-zinc-800 rounded px-2 py-0.5"
            >
              {isScrollMode ? "Slides" : "Scroll"}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 1: TITLE — HERO
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(0)}>
        {/* Background elements */}
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
          <RevealText>
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src="/brand/logo-icon-blue.svg"
                  alt="TeamPrompt"
                  width={72}
                  height={72}
                  className="rounded-2xl"
                />
                <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-xl -z-10" />
              </div>
            </div>
          </RevealText>

          <RevealText delay={150}>
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85]">
              Team<span className="gradient-text">Prompt</span>
            </h1>
          </RevealText>

          <RevealText delay={300}>
            <p className="text-xl sm:text-2xl text-zinc-400 font-light tracking-wide max-w-xl mx-auto">
              The prompt management layer for teams
              <br className="hidden sm:block" />
              using AI across every platform.
            </p>
          </RevealText>

          <RevealText delay={450}>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-zinc-500 max-w-md mx-auto">
              {["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map((ai) => (
                <span key={ai} className="border border-zinc-800 rounded-full px-3 py-1.5 hover:border-zinc-600 transition-colors">
                  {ai}
                </span>
              ))}
            </div>
          </RevealText>

          <RevealText delay={600}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto pt-4">
              {[
                { value: "1,200+", label: "Active users" },
                { value: "$12K", label: "MRR" },
                { value: "85", label: "Paying teams" },
                { value: "4.8★", label: "Chrome Store" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-zinc-600 mt-1 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={700}>
            <p className="text-zinc-600 text-xs tracking-widest uppercase">
              All organic growth &middot; Zero marketing spend
            </p>
          </RevealText>

          {!isScrollMode && (
            <button onClick={next} className="animate-bounce mt-2" style={{ animation: "float 2s ease-in-out infinite" }}>
              <ChevronDown className="h-5 w-5 text-zinc-600 mx-auto" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 2: THE PROBLEM
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(1)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400/80 mb-4">
              The Problem
            </p>
            <h2 className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight">
              Your team is<br />
              <span className="text-red-400">bleeding AI productivity.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-6">
            <RevealText delay={200}>
              <div className="glow-card-red rounded-2xl p-8 space-y-5 h-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold">Real story. Real firm.</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  A 50-person law firm. 10 lawyers writing different versions of the same
                  &ldquo;contract analysis&rdquo; prompt. One accidentally pasted <span className="text-red-400 font-semibold">client Social Security numbers</span> into
                  ChatGPT. The managing partner said:
                </p>
                <blockquote className="border-l-2 border-red-500/40 pl-4 text-zinc-300 italic text-sm">
                  &ldquo;We pay $30/seat for ChatGPT Enterprise but outputs are
                  wildly inconsistent and we&apos;re terrified of data leaks.&rdquo;
                </blockquote>
              </div>
            </RevealText>

            <RevealText delay={350}>
              <div className="glow-card rounded-2xl p-8 space-y-5 h-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <XIcon className="h-5 w-5 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-bold">Current &ldquo;solutions&rdquo;</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { tool: "Google Docs", issue: "No AI tool integration" },
                    { tool: "ChatGPT Teams", issue: "No prompt library, single platform" },
                    { tool: "Slack / Notion", issue: "No version control or DLP" },
                    { tool: "Copy & Paste", issue: "No security, no analytics, chaos" },
                  ].map((row) => (
                    <div key={row.tool} className="flex items-center gap-3 text-sm">
                      <span className="text-zinc-500 w-28 shrink-0 font-medium">{row.tool}</span>
                      <ArrowRight className="h-3 w-3 text-zinc-700 shrink-0" />
                      <span className="text-red-400/80">{row.issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="flex items-center justify-center gap-6 sm:gap-10 text-center">
              {[
                { stat: "40%", label: "of AI time wasted on duplicate prompts" },
                { stat: "67%", label: "of teams have no prompt governance" },
                { stat: "87%", label: "of enterprises use 2+ AI tools" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl sm:text-4xl font-black text-red-400">{s.stat}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-600 mt-1 max-w-[140px]">{s.label}</p>
                </div>
              ))}
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 3: THE SOLUTION
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(2)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80 mb-4">
              The Solution
            </p>
            <h2 className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight">
              One library.<br />
              Every AI tool.<br />
              <span className="gradient-text">Total control.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Create",
                desc: "Build prompts with templates, variables, and version history. Set quality guidelines per team.",
                icon: FileText,
                accent: "text-blue-400",
                card: "glow-card-blue",
              },
              {
                step: "02",
                title: "Share",
                desc: "Distribute with role-based access. Organize by category, tag, and scope. Approval workflows built-in.",
                icon: Users,
                accent: "text-emerald-400",
                card: "glow-card-emerald",
              },
              {
                step: "03",
                title: "Use Everywhere",
                desc: "One-click insert via browser extension across ChatGPT, Claude, Gemini, Copilot, and Perplexity.",
                icon: Globe,
                accent: "text-amber-400",
                card: "glow-card-amber",
              },
            ].map((s) => (
              <RevealText key={s.step} delay={parseInt(s.step) * 150}>
                <div className={cn("rounded-2xl p-7 space-y-4 h-full", s.card)}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-4xl font-black opacity-20", s.accent)}>{s.step}</span>
                    <s.icon className={cn("h-6 w-6", s.accent)} />
                  </div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </RevealText>
            ))}
          </div>

          <RevealText delay={500}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Shield, label: "DLP Protection", desc: "Blocks SSNs, credit cards, API keys in real-time" },
                { icon: Lock, label: "19 Compliance Packs", desc: "HIPAA, SOC 2, GDPR, PCI-DSS, and more" },
                { icon: BarChart3, label: "Team Analytics", desc: "Track which prompts perform best" },
                { icon: BadgeCheck, label: "Approval Workflows", desc: "Review & approve before team-wide use" },
              ].map((f) => (
                <div key={f.label} className="glow-card rounded-xl p-4">
                  <f.icon className="h-4 w-4 text-amber-400/60 mb-2" />
                  <p className="font-semibold text-xs">{f.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={600}>
            <p className="text-center text-sm text-zinc-500">
              2-minute setup &middot; Free to start &middot; No credit card required
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 4: PRODUCT
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(3)}>
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          <RevealText>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400/80 mb-4">
                The Product
              </p>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
                Built. Shipped. <span className="gradient-text-blue">Live.</span>
              </h2>
            </div>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { src: "/store-assets/screenshot-light-1-prompts.png", alt: "Prompt library", label: "Shared prompt library with categories, tags, and team scopes" },
              { src: "/store-assets/screenshot-light-6-insert.png", alt: "Browser extension", label: "One-click insert across 5 AI platforms" },
              { src: "/store-assets/screenshot-light-3-dlp-block.png", alt: "DLP protection", label: "Real-time DLP blocks sensitive data before it reaches AI" },
              { src: "/store-assets/screenshot-light-2-dashboard.png", alt: "Analytics dashboard", label: "Admin dashboard with usage analytics and security insights" },
            ].map((img, i) => (
              <RevealText key={img.alt} delay={i * 120}>
                <div className="group relative">
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={1280}
                      height={800}
                      className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-2 text-center">{img.label}</p>
                </div>
              </RevealText>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 5: WHY NOW — MARKET TIMING
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(4)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
              Market Opportunity
            </p>
            <h2 className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight">
              $50B market.<br />
              <span className="text-emerald-400">No one owns the workflow layer.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "180M+", label: "Business AI users globally", source: "OpenAI 2024" },
                { value: "87%", label: "Enterprises use 2+ AI tools", source: "McKinsey" },
                { value: "3x", label: "AI adoption growth since 2023", source: "Gartner" },
              ].map((s) => (
                <div key={s.label} className="glow-card rounded-2xl p-6 text-center">
                  <p className="text-4xl sm:text-5xl font-black text-emerald-400">{s.value}</p>
                  <p className="text-sm text-zinc-300 mt-2">{s.label}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">{s.source}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="glow-card rounded-2xl p-8">
              <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-zinc-500">Market Sizing</h3>
              <div className="space-y-5">
                {[
                  { label: "TAM", value: "$50B", desc: "AI productivity software", width: "100%", color: "from-emerald-600 to-emerald-400" },
                  { label: "SAM", value: "$12B", desc: "Teams using AI for business workflows", width: "24%", color: "from-blue-600 to-blue-400" },
                  { label: "SOM", value: "$300M", desc: "Regulated industries, early adopters", width: "6%", color: "from-amber-600 to-amber-400" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-4">
                    <span className="text-xs text-zinc-600 w-10 shrink-0 font-mono font-bold">{m.label}</span>
                    <div className="flex-1">
                      <div className="h-10 rounded-lg bg-white/[0.03] relative overflow-hidden">
                        <div
                          className={cn("h-full rounded-lg bg-gradient-to-r flex items-center px-4", m.color)}
                          style={{ width: m.width }}
                        >
                          <span className="text-xs font-black whitespace-nowrap">{m.value}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealText>

          <RevealText delay={500}>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Scale, title: "Legal & Compliance", pct: "40%", desc: "Highest willingness to pay. Needs consistency + audit trails." },
                { icon: Target, title: "Marketing & Agencies", pct: "35%", desc: "Brand voice control across clients and AI tools." },
                { icon: Heart, title: "Healthcare & Finance", pct: "25%", desc: "Regulatory requirements. HIPAA, SOC 2, PCI-DSS." },
              ].map((seg) => (
                <div key={seg.title} className="glow-card rounded-xl p-5">
                  <seg.icon className="h-5 w-5 text-zinc-500 mb-3" />
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="font-bold text-sm">{seg.title}</h4>
                    <span className="text-[10px] text-amber-400 font-bold">{seg.pct}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{seg.desc}</p>
                </div>
              ))}
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 6: COMPETITIVE EDGE — vs ChatGPT/Claude paid plans
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(5)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80 mb-4">
              Competitive Edge
            </p>
            <h2 className="text-4xl sm:text-5xl font-black leading-[0.95] tracking-tight">
              They sell AI access.<br />
              <span className="gradient-text">We sell AI governance.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="glow-card rounded-2xl p-6 sm:p-8 overflow-x-auto">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500 mb-6">
                What teams actually pay for AI today
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-zinc-500 font-medium text-xs">Plan</th>
                    <th className="text-center py-3 px-3 text-zinc-500 font-medium text-xs">Price/user/mo</th>
                    <th className="text-center py-3 px-3 text-zinc-500 font-medium text-xs">Prompt Library</th>
                    <th className="text-center py-3 px-3 text-zinc-500 font-medium text-xs">Multi-AI</th>
                    <th className="text-center py-3 px-3 text-zinc-500 font-medium text-xs">DLP</th>
                    <th className="text-center py-3 px-3 text-zinc-500 font-medium text-xs">Compliance</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    { plan: "ChatGPT Plus", price: "$20", lib: false, multi: false, dlp: false, comp: false },
                    { plan: "ChatGPT Team", price: "$25", lib: false, multi: false, dlp: false, comp: false },
                    { plan: "ChatGPT Enterprise", price: "$60+", lib: false, multi: false, dlp: false, comp: false },
                    { plan: "Claude Pro", price: "$20", lib: false, multi: false, dlp: false, comp: false },
                    { plan: "Claude Team", price: "$25", lib: false, multi: false, dlp: false, comp: false },
                    { plan: "Gemini Advanced", price: "$20", lib: false, multi: false, dlp: false, comp: false },
                  ].map((row) => (
                    <tr key={row.plan} className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-zinc-400">{row.plan}</td>
                      <td className="text-center py-2.5 px-3 text-zinc-300 font-mono">{row.price}</td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-700">&mdash;</span></td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-700">&mdash;</span></td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-700">&mdash;</span></td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-700">&mdash;</span></td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-amber-500/30 bg-amber-500/5">
                    <td className="py-3 px-3 text-amber-400 font-bold">TeamPrompt Team</td>
                    <td className="text-center py-3 px-3 text-amber-400 font-mono font-bold">$7</td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="glow-card-amber rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500 mb-5">
                The pitch
              </h3>
              <blockquote className="text-lg sm:text-xl text-zinc-200 leading-relaxed italic">
                &ldquo;You&apos;re already paying $20–60/user for ChatGPT and Claude.
                For <span className="text-amber-400 font-bold not-italic">$7/user</span>, TeamPrompt
                makes every seat more productive, compliant, and consistent —
                across <span className="text-amber-400 font-bold not-italic">all five AI platforms</span> at once.&rdquo;
              </blockquote>
            </div>
          </RevealText>

          <RevealText delay={500}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glow-card rounded-xl p-5">
                <Brain className="h-5 w-5 text-blue-400 mb-3" />
                <h4 className="font-bold text-sm mb-1">&ldquo;Why won&apos;t ChatGPT just build this?&rdquo;</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  ChatGPT sells models. We sell workflow governance across <em>every</em> AI tool.
                  Same reason GitHub exists alongside programming languages.
                </p>
              </div>
              <div className="glow-card rounded-xl p-5">
                <Puzzle className="h-5 w-5 text-amber-400 mb-3" />
                <h4 className="font-bold text-sm mb-1">&ldquo;What if AI tools add prompt libraries?&rdquo;</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  They&apos;ll optimize for their own platform. We&apos;re the cross-platform standard —
                  like 1Password works across browsers. Teams use 2+ AI tools.
                </p>
              </div>
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 7: BUSINESS MODEL
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(6)}>
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400/80 mb-4">
              Business Model
            </p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
              Freemium SaaS.
              <br />
              <span className="text-zinc-500">Customers already paying.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { tier: "Free", price: "$0", desc: "5 users, core features", highlight: false },
                { tier: "Pro", price: "$9", desc: "/user/mo — Analytics, unlimited", highlight: false },
                { tier: "Team", price: "$7", desc: "/user/mo — Collaboration + compliance", highlight: true },
                { tier: "Business", price: "$12", desc: "/user/mo — Enterprise security + SLA", highlight: false },
              ].map((t) => (
                <div
                  key={t.tier}
                  className={cn(
                    "rounded-2xl p-5 text-center relative overflow-hidden",
                    t.highlight
                      ? "glow-card-amber"
                      : "glow-card"
                  )}
                >
                  {t.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600" />
                  )}
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t.tier}</p>
                  <p className="text-3xl font-black mt-2">{t.price}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">{t.desc}</p>
                  {t.highlight && (
                    <span className="inline-block mt-3 text-[9px] bg-amber-500 text-black px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      Most popular
                    </span>
                  )}
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "14:1", label: "LTV : CAC", icon: TrendingUp, accent: "text-emerald-400" },
                { value: "92%", label: "Gross margin", icon: DollarSign, accent: "text-emerald-400" },
                { value: "25%", label: "Free → Paid", icon: Rocket, accent: "text-amber-400" },
                { value: "<2%", label: "Monthly churn", icon: Star, accent: "text-blue-400" },
              ].map((m) => (
                <div key={m.label} className="glow-card rounded-xl p-5 text-center">
                  <m.icon className={cn("h-5 w-5 mx-auto mb-2", m.accent)} />
                  <p className="text-2xl font-black">{m.value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={500}>
            <p className="text-center text-xs text-zinc-600">
              Follows Notion&apos;s playbook: free tier drives organic adoption, teams convert when they need collaboration and security.
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 8: TRACTION
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(7)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
              Traction
            </p>
            <h2 className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight">
              Product-market fit.<br />
              <span className="text-emerald-400">Proven.</span>
            </h2>
            <p className="mt-3 text-sm text-zinc-500">6 months. Organic growth. Zero ad spend.</p>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { value: "1,200+", label: "Active users", sub: "organic" },
                { value: "85", label: "Paying teams", sub: "" },
                { value: "$12K", label: "MRR", sub: "40% MoM" },
                { value: "4.8★", label: "Chrome Store", sub: "500+ reviews" },
                { value: "<2%", label: "Monthly churn", sub: "" },
              ].map((m) => (
                <div key={m.label} className="glow-card rounded-xl p-4 text-center">
                  <p className="text-xl sm:text-2xl font-black">{m.value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{m.label}</p>
                  {m.sub && <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">{m.sub}</p>}
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="glow-card rounded-2xl p-8">
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500 mb-6">MRR Growth — 40% Month-over-Month</h3>
              <div className="flex items-end gap-2 h-44">
                {[
                  { month: "M1", mrr: 1.2, h: "8%" },
                  { month: "M2", mrr: 1.7, h: "11%" },
                  { month: "M3", mrr: 2.4, h: "16%" },
                  { month: "M4", mrr: 3.4, h: "22%" },
                  { month: "M5", mrr: 4.7, h: "31%" },
                  { month: "M6", mrr: 6.6, h: "44%" },
                  { month: "M7", mrr: 8.5, h: "57%" },
                  { month: "Now", mrr: 12, h: "80%" },
                ].map((bar, i) => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-500 font-mono">${bar.mrr}K</span>
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-700",
                        i === 7
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                          : "bg-gradient-to-t from-emerald-600/40 to-emerald-400/40"
                      )}
                      style={{ height: bar.h }}
                    />
                    <span className={cn("text-[10px] font-mono", i === 7 ? "text-emerald-400 font-bold" : "text-zinc-600")}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealText>

          <RevealText delay={500}>
            <p className="text-center text-xs text-zinc-600">
              Growth engine: Chrome Web Store discovery + word-of-mouth. <span className="text-emerald-400 font-medium">No marketing spend yet.</span>
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 9: TECHNICAL ARCHITECTURE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(8)}>
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400/80 mb-4">
              Architecture
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              Enterprise-grade. <span className="text-zinc-500">Solo-built.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-5">
            <RevealText delay={200}>
              <div className="glow-card-blue rounded-2xl p-7 space-y-4 h-full">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold">Tech Stack</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { layer: "Frontend", tech: "Next.js 14, React, TypeScript, Tailwind", icon: Monitor },
                    { layer: "Backend", tech: "Next.js API Routes, Edge Functions, Supabase", icon: Server },
                    { layer: "Database", tech: "Postgres + Row-Level Security + Realtime", icon: Database },
                    { layer: "Extension", tech: "Chrome/Firefox/Edge MV3, works across 5 AI tools", icon: Puzzle },
                    { layer: "Infra", tech: "Vercel (auto-scaling), Supabase Cloud, Stripe", icon: Globe },
                  ].map((row) => (
                    <div key={row.layer} className="flex gap-3">
                      <row.icon className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{row.layer}</p>
                        <p className="text-xs text-zinc-400">{row.tech}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>

            <RevealText delay={350}>
              <div className="glow-card-emerald rounded-2xl p-7 space-y-4 h-full">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold">Security & Compliance</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    "Row-Level Security on every query",
                    "Client-side DLP — PII never reaches AI",
                    "19 compliance packs (HIPAA, SOC 2, GDPR...)",
                    "Full audit trail on every action",
                    "2FA / TOTP for all users",
                    "Domain auto-join (SSO-like experience)",
                  ].map((feat) => (
                    <div key={feat} className="flex gap-2 items-start">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-400">{feat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="glow-card rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-5">
                <Code2 className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-sm">Technical Moat</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  {
                    title: "Universal Extension",
                    desc: "Single extension integrates with 5 AI tools, each with unique DOM, auth, and injection points. Hard to replicate.",
                    icon: Puzzle,
                  },
                  {
                    title: "Client-Side DLP",
                    desc: "Sensitive data caught before it leaves the browser. No server-side PII processing. Configurable compliance packs.",
                    icon: Shield,
                  },
                  {
                    title: "Real-Time Sync",
                    desc: "Supabase Realtime for instant sharing, live analytics, and policy enforcement. <500ms propagation.",
                    icon: Zap,
                  },
                ].map((m) => (
                  <div key={m.title}>
                    <m.icon className="h-4 w-4 text-amber-400/60 mb-2" />
                    <h4 className="font-bold text-xs mb-1">{m.title}</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 10: TEAM
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(9)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400/80 mb-4">
              The Team
            </p>
            <h2 className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight">
              Built by someone who<br />
              <span className="text-purple-400">lives the problem.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-5 gap-6">
            <RevealText delay={200} className="sm:col-span-3">
              <div className="glow-card rounded-2xl p-8 space-y-6 h-full">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-3xl font-black shrink-0">
                    KC
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Kade Cooper</h3>
                    <p className="text-sm text-zinc-500">Founder & CEO</p>
                    <p className="text-xs text-zinc-600 mt-1">Technical founder &middot; Full-stack engineer &middot; Product builder</p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Built entire product solo — frontend, backend, extension, infra</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>$0 to $12K MRR with zero funding, zero marketing spend</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Deep customer insights from 50+ team interviews</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Ships weekly. Handles support personally. Close to every customer.</span>
                  </li>
                </ul>
              </div>
            </RevealText>

            <RevealText delay={350} className="sm:col-span-2 space-y-4">
              <div className="glow-card rounded-xl p-5">
                <h4 className="font-bold text-sm mb-3">Why solo works here</h4>
                <div className="space-y-2.5">
                  {[
                    { icon: Zap, text: "Faster iteration — ships weekly" },
                    { icon: Users, text: "Close to customers" },
                    { icon: DollarSign, text: "Capital efficient execution" },
                    { icon: Rocket, text: "Proven ability to ship complex systems" },
                  ].map((item) => (
                    <div key={item.text} className="flex gap-2 items-start text-xs text-zinc-500">
                      <item.icon className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glow-card-emerald rounded-xl p-5">
                <h4 className="font-bold text-sm text-emerald-400 mb-2">First hire (with funding)</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Part-time security engineer for enterprise features — SSO/SAML, SCIM, SOC 2 certification.
                </p>
              </div>
            </RevealText>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 11: THE ASK + LOUISIANA LEB
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(10)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80 mb-4">
              The Ask
            </p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
              <span className="gradient-text">$100K</span> pre-seed.
            </h2>
            <p className="mt-3 text-lg text-zinc-500">Capital efficient. Revenue generating. Tax credit eligible.</p>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-6">
            <RevealText delay={200}>
              <div className="glow-card rounded-2xl p-7 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Banknote className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold">Use of Funds</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Marketing & Acquisition", amount: "$50K", pct: "50%", color: "from-amber-500 to-amber-400" },
                    { label: "Enterprise Features", amount: "$25K", pct: "25%", color: "from-blue-500 to-blue-400" },
                    { label: "Engineering & Infra", amount: "$15K", pct: "15%", color: "from-emerald-500 to-emerald-400" },
                    { label: "Operations", amount: "$10K", pct: "10%", color: "from-purple-500 to-purple-400" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="text-zinc-500 font-mono">{item.amount}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                        <div
                          className={cn("h-full rounded-full bg-gradient-to-r", item.color)}
                          style={{ width: item.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>

            <RevealText delay={350}>
              <div className="glow-card-amber rounded-2xl p-7 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[60px]" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-amber-400" />
                    <h3 className="font-bold">Louisiana LEB Tax Credit</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      TeamPrompt qualifies for the <span className="text-amber-400 font-semibold">Louisiana Enterprise Zone / LEB program</span>.
                      Investors receive a <span className="text-amber-400 font-semibold">25% state tax credit</span> on their investment.
                    </p>
                    <div className="glow-card rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-zinc-500">Investment</span>
                        <span className="text-lg font-black">$100,000</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-zinc-500">Tax credit (25%)</span>
                        <span className="text-lg font-black text-emerald-400">−$25,000</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Effective cost</span>
                        <span className="text-2xl font-black text-amber-400">$75,000</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      Louisiana Economic Development program designed to incentivize investment in Louisiana-based technology startups.
                    </p>
                  </div>
                </div>
              </div>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="glow-card rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400">
                <span className="text-amber-400 font-bold">Runway: 12–18 months</span> to profitability.
                Not asking for millions to figure things out — accelerating what&apos;s already working.
              </p>
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 12: GROWTH PLAN — 18 MONTH TARGETS
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(11)}>
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400/80 mb-4">
              Growth Plan
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              18-Month Targets
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { metric: "Active Users", from: "1,200", to: "5,000", icon: Users },
                { metric: "MRR", from: "$12K", to: "$75K", icon: TrendingUp },
                { metric: "Paying Teams", from: "85", to: "200", icon: Building2 },
                { metric: "ARR Run Rate", from: "$144K", to: "$900K", icon: DollarSign },
              ].map((t) => (
                <div key={t.metric} className="glow-card rounded-xl p-5 text-center">
                  <t.icon className="h-4 w-4 text-zinc-600 mx-auto mb-2" />
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">{t.metric}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-zinc-600 font-mono">{t.from}</span>
                    <ArrowRight className="h-3 w-3 text-emerald-400" />
                    <span className="text-lg font-black text-emerald-400">{t.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="glow-card rounded-2xl p-7">
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500 mb-6">Investor FAQ</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    q: "How do you compete with free solutions?",
                    a: "Free solutions lack security, multi-AI integration, and analytics. Teams pay for compliance and consistency.",
                    icon: Briefcase,
                  },
                  {
                    q: "Why not raise more money?",
                    a: "Capital efficient. $100K gives us 18 months to $75K MRR — a strong seed round position.",
                    icon: DollarSign,
                  },
                  {
                    q: "What's your biggest risk?",
                    a: "Execution risk — mitigated by 6 months of proven shipping, paying customers, and 40% MoM growth.",
                    icon: AlertTriangle,
                  },
                  {
                    q: "Can this scale without a big team?",
                    a: "Serverless architecture. Extension runs client-side. Can serve 100K users with minimal cost increase.",
                    icon: Server,
                  },
                  {
                    q: "How defensible is the extension?",
                    a: "5 different AI tools, each with unique DOM integration. Deep technical moat with constant platform updates.",
                    icon: Code2,
                  },
                  {
                    q: "Enterprise sales cycles?",
                    a: "Product-led: one person installs, team adopts, org upgrades. No enterprise sales needed. Slack/Notion playbook.",
                    icon: Building2,
                  },
                ].map((faq) => (
                  <div key={faq.q} className="flex gap-3">
                    <faq.icon className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-zinc-300">{faq.q}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealText>

          <RevealText delay={500}>
            <p className="text-center text-xs text-zinc-600 font-mono">
              $75K MRR = $900K ARR → Strong seed round position
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 13: VISION — CLOSING
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(12)}>
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <RevealText>
            <div className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80">
                The Vision
              </p>
              <h2 className="text-5xl sm:text-7xl font-black leading-[0.85] tracking-tighter">
                The control plane<br />
                for how teams<br />
                <span className="gradient-text">use AI.</span>
              </h2>
            </div>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="glow-card rounded-xl p-6 text-left">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-2">
                  Phase 1 — Next 18 months
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  The go-to prompt management tool for teams of 10–100 in regulated industries.
                </p>
              </div>
              <div className="glow-card rounded-xl p-6 text-left">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">
                  Phase 2 — Future
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Platform for AI workflow orchestration — the control plane for how organizations use AI.
                </p>
              </div>
            </div>
          </RevealText>

          <RevealText delay={400}>
            <div className="max-w-2xl mx-auto border-t border-white/5 pt-10">
              <blockquote className="text-xl sm:text-2xl text-zinc-300 leading-relaxed font-light">
                &ldquo;I built this because I lived this problem.
                <br className="hidden sm:block" />
                Customers are already paying.
                <br className="hidden sm:block" />
                With <span className="text-amber-400 font-bold">$100K</span>, we accelerate what&apos;s already working.&rdquo;
              </blockquote>
              <p className="text-sm text-zinc-500 mt-4">— Kade Cooper, Founder</p>
            </div>
          </RevealText>

          <RevealText delay={600}>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="relative">
                <Image
                  src="/brand/logo-icon-blue.svg"
                  alt="TeamPrompt"
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
                <div className="absolute -inset-1.5 bg-blue-500/15 rounded-xl blur-md -z-10" />
              </div>
              <div className="text-left">
                <p className="font-black text-lg">TeamPrompt</p>
                <p className="text-xs text-zinc-500">teamprompt.app</p>
              </div>
            </div>
          </RevealText>
        </div>
      </div>

      {/* Bottom spacer for scroll mode */}
      {isScrollMode && <div className="h-16" />}
    </div>
  );
}
