"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Link2,
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

export function PitchDeck({ shareToken }: { shareToken: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [copied, setCopied] = useState(false);
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
      "w-full flex items-center justify-center px-8 sm:px-16 lg:px-24 relative overflow-hidden",
      isScrollMode ? "min-h-screen py-28 border-b border-zinc-200" : "h-screen py-20 overflow-y-auto",
      !isScrollMode && idx !== currentSlide && "hidden"
    ),
  });

  // Slide label for progress
  const slideLabels = [
    "", "Problem", "Solution", "Product", "Why Now", "Competitive Edge",
    "Business Model", "Traction", "Architecture", "Team", "The Ask", "Growth Plan", "Vision",
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-[#f5f7fb] text-zinc-900 selection:bg-blue-600/20 selection:text-zinc-900",
        !isScrollMode && "h-screen overflow-hidden"
      )}
    >
      {/* ─── CSS animations ─── */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
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
            <ChevronLeft className="h-8 w-8 text-zinc-400" />
          </button>
          <button
            onClick={next}
            className="fixed right-0 top-0 bottom-0 w-20 z-40 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8 text-zinc-400" />
          </button>
        </>
      )}

      {/* ─── Bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-zinc-200">
        <div className="flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === currentSlide
                    ? "w-8 bg-gradient-to-r from-blue-500 to-blue-600"
                    : i < currentSlide
                      ? "w-1.5 bg-blue-600/30"
                      : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {slideLabels[currentSlide] && (
              <span className="text-zinc-600 font-medium">{slideLabels[currentSlide]}</span>
            )}
            <span className="font-mono">
              {String(currentSlide + 1).padStart(2, "0")}/{TOTAL_SLIDES}
            </span>
            <button
              onClick={() => setIsScrollMode((v) => !v)}
              className="hover:text-zinc-700 transition-colors border border-zinc-200 rounded px-2 py-0.5"
            >
              {isScrollMode ? "Slides" : "Scroll"}
            </button>
            {shareToken && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/pitch?share=${shareToken}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 hover:text-zinc-700 transition-colors border border-zinc-200 rounded px-2 py-0.5"
              >
                <Link2 className="h-3 w-3" />
                {copied ? "Copied!" : "Copy Investor Link"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 1: TITLE — HERO
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(0)}>
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 pt-8">
          <RevealText>
            <div className="flex justify-center">
              <div className="relative bg-white rounded-2xl p-3 shadow-md border border-zinc-200">
                <Image
                  src="/brand/logo-icon.svg"
                  alt="TeamPrompt"
                  width={56}
                  height={56}
                />
              </div>
            </div>
          </RevealText>

          <RevealText delay={150}>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.85]">
              Team<span className="text-blue-600">Prompt</span>
            </h1>
          </RevealText>

          <RevealText delay={300}>
            <p className="text-xl sm:text-2xl text-zinc-600 font-light tracking-wide max-w-xl mx-auto">
              Share, govern, and protect your team&apos;s
              <br className="hidden sm:block" />
              AI prompts across every platform.
            </p>
          </RevealText>

          <RevealText delay={450}>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-zinc-500 max-w-md mx-auto">
              {["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map((ai) => (
                <span key={ai} className="border border-zinc-200 bg-white rounded-full px-3 py-1.5 hover:border-zinc-300 transition-colors shadow-sm">
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
                  <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">{s.value}</p>
                  <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={700}>
            <p className="text-zinc-400 text-sm tracking-widest uppercase">
              All organic growth &middot; Zero marketing spend
            </p>
          </RevealText>

          {!isScrollMode && (
            <button onClick={next} className="animate-bounce mt-2" style={{ animation: "float 2s ease-in-out infinite" }}>
              <ChevronDown className="h-5 w-5 text-zinc-400 mx-auto" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 2: THE PROBLEM
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(1)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600/80 mb-4">
              The Problem
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Your team is<br />
              <span className="text-red-600">bleeding AI productivity.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-6">
            <RevealText delay={200}>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-5 h-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold">Real story. Real team.</h3>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  A 40-person engineering team. Developers pasting internal API keys, database
                  connection strings, and proprietary code into ChatGPT and Claude daily.
                  One engineer accidentally leaked <span className="text-red-600 font-semibold">production AWS credentials</span> into
                  a prompt. The VP of Engineering said:
                </p>
                <blockquote className="border-l-2 border-red-400/40 pl-4 text-zinc-700 italic text-sm">
                  &ldquo;Everyone uses AI differently. Nobody shares what works.
                  And we have zero visibility into what&apos;s being sent to these tools.&rdquo;
                </blockquote>
              </div>
            </RevealText>

            <RevealText delay={350}>
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 space-y-5 h-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                    <XIcon className="h-5 w-5 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-bold">Current &ldquo;solutions&rdquo;</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { tool: "Google Docs", issue: "No AI integration, no protection" },
                    { tool: "ChatGPT Teams", issue: "Single platform, no prompt sharing" },
                    { tool: "Slack / Notion", issue: "No version control, no DLP" },
                    { tool: "Copy & Paste", issue: "Zero governance, zero visibility" },
                  ].map((row) => (
                    <div key={row.tool} className="flex items-center gap-3 text-sm">
                      <span className="text-zinc-500 w-28 shrink-0 font-medium">{row.tool}</span>
                      <ArrowRight className="h-3 w-3 text-zinc-300 shrink-0" />
                      <span className="text-red-600/80">{row.issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { stat: "40%", label: "AI time wasted recreating the same prompts", width: "40%", color: "from-red-500 to-red-400" },
                { stat: "67%", label: "Teams have zero AI usage governance", width: "67%", color: "from-red-500 to-amber-400" },
                { stat: "87%", label: "Enterprises use 2+ AI tools daily", width: "87%", color: "from-amber-500 to-amber-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-2xl sm:text-3xl font-black text-red-600">{s.stat}</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mb-2">
                    <div className={cn("h-full rounded-full bg-gradient-to-r", s.color)} style={{ width: s.width }} />
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed">{s.label}</p>
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600/80 mb-4">
              The Solution
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              One shared library.<br />
              Every AI tool.<br />
              <span className="text-blue-600">Complete governance.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Create",
                desc: "Build prompts with templates, variables, and version history. Set quality guidelines per team.",
                icon: FileText,
                accent: "text-blue-600",
                cardClass: "bg-blue-50 border border-blue-200",
              },
              {
                step: "02",
                title: "Share",
                desc: "Distribute with role-based access. Organize by category, tag, and scope. Approval workflows built-in.",
                icon: Users,
                accent: "text-emerald-600",
                cardClass: "bg-emerald-50 border border-emerald-200",
              },
              {
                step: "03",
                title: "Use Everywhere",
                desc: "One-click insert via browser extension across ChatGPT, Claude, Gemini, Copilot, and Perplexity.",
                icon: Globe,
                accent: "text-blue-600",
                cardClass: "bg-amber-50 border border-amber-200",
              },
            ].map((s) => (
              <RevealText key={s.step} delay={parseInt(s.step) * 150}>
                <div className={cn("rounded-2xl p-7 space-y-4 h-full", s.cardClass)}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-4xl font-black opacity-20", s.accent)}>{s.step}</span>
                    <s.icon className={cn("h-6 w-6", s.accent)} />
                  </div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{s.desc}</p>
                </div>
              </RevealText>
            ))}
          </div>

          <RevealText delay={500}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Shield, label: "DLP Protection", desc: "Blocks API keys, credentials, PII, and secrets in real-time" },
                { icon: Lock, label: "19 Compliance Packs", desc: "HIPAA, SOC 2, GDPR, PCI-DSS, and more" },
                { icon: BarChart3, label: "Team Analytics", desc: "Track which prompts perform best" },
                { icon: BadgeCheck, label: "Approval Workflows", desc: "Review & approve before team-wide use" },
              ].map((f) => (
                <div key={f.label} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
                  <f.icon className="h-4 w-4 text-blue-600/60 mb-2" />
                  <p className="font-semibold text-xs text-zinc-900">{f.label}</p>
                  <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{f.desc}</p>
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
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600/80 mb-4">
                The Product
              </p>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                Built. Shipped. <span className="text-blue-600">Live.</span>
              </h2>
            </div>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { src: "/store-assets/screenshot-light-4-popup.png", alt: "Prompt library popup", label: "Browse and search your team's shared prompt library" },
              { src: "/store-assets/screenshot-light-5-template.png", alt: "Template variables", label: "Template variables — fill in and insert into any AI tool" },
              { src: "/store-assets/screenshot-light-6-insert.png", alt: "Browser extension", label: "One-click insert across ChatGPT, Claude, Gemini, Copilot, Perplexity" },
              { src: "/store-assets/screenshot-light-3-dlp-block.png", alt: "DLP protection", label: "Real-time DLP blocks API keys, credentials, and PII before it reaches AI" },
            ].map((img, i) => (
              <RevealText key={img.alt} delay={i * 120}>
                <div className="group relative">
                  <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={1280}
                      height={800}
                      className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="text-sm text-zinc-500 mt-2 text-center">{img.label}</p>
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600/80 mb-4">
              Market Opportunity
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              $50B market.<br />
              <span className="text-emerald-600">No one owns AI governance for teams.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "180M+", label: "Business AI users globally", source: "OpenAI 2024" },
                { value: "87%", label: "Enterprises use 2+ AI tools", source: "McKinsey" },
                { value: "3x", label: "AI adoption growth since 2023", source: "Gartner" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 text-center">
                  <p className="text-4xl sm:text-5xl font-black text-emerald-600">{s.value}</p>
                  <p className="text-sm text-zinc-700 mt-2">{s.label}</p>
                  <p className="text-xs text-zinc-400 mt-1">{s.source}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
              <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-zinc-500">Market Sizing</h3>
              <div className="space-y-5">
                {[
                  { label: "TAM", value: "$50B", desc: "AI productivity software", width: "100%", color: "from-emerald-600 to-emerald-400" },
                  { label: "SAM", value: "$12B", desc: "Teams using AI for business workflows", width: "24%", color: "from-blue-600 to-blue-400" },
                  { label: "SOM", value: "$300M", desc: "Regulated industries, early adopters", width: "6%", color: "from-blue-500 to-blue-400" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400 w-10 shrink-0 font-mono font-bold">{m.label}</span>
                    <div className="flex-1">
                      <div className="h-10 rounded-lg bg-zinc-100 relative overflow-hidden">
                        <div
                          className={cn("h-full rounded-lg bg-gradient-to-r flex items-center px-4", m.color)}
                          style={{ width: m.width }}
                        >
                          <span className="text-xs font-black whitespace-nowrap text-white">{m.value}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{m.desc}</p>
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
                <div key={seg.title} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                  <seg.icon className="h-5 w-5 text-zinc-500 mb-3" />
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="font-bold text-sm">{seg.title}</h4>
                    <span className="text-xs text-blue-600 font-bold">{seg.pct}</span>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed">{seg.desc}</p>
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600/80 mb-4">
              Competitive Edge
            </p>
            <h2 className="text-4xl sm:text-5xl font-black leading-[0.95] tracking-tight">
              They sell AI access.<br />
              <span className="text-blue-600">We sell AI governance.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 overflow-x-auto">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500 mb-6">
                What teams actually pay for AI today
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
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
                    <tr key={row.plan} className="border-b border-zinc-100">
                      <td className="py-2.5 px-3 text-zinc-600">{row.plan}</td>
                      <td className="text-center py-2.5 px-3 text-zinc-700 font-mono">{row.price}</td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-300">&mdash;</span></td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-300">&mdash;</span></td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-300">&mdash;</span></td>
                      <td className="text-center py-2.5 px-3"><span className="text-zinc-300">&mdash;</span></td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-blue-500/30 bg-blue-50">
                    <td className="py-3 px-3 text-blue-600 font-bold">TeamPrompt Team</td>
                    <td className="text-center py-3 px-3 text-blue-600 font-mono font-bold">$7</td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-blue-600 mx-auto" /></td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-blue-600 mx-auto" /></td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-blue-600 mx-auto" /></td>
                    <td className="text-center py-3 px-3"><CheckCircle2 className="h-4 w-4 text-blue-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500 mb-5">
                The pitch
              </h3>
              <blockquote className="text-lg sm:text-xl text-zinc-700 leading-relaxed italic">
                &ldquo;You&apos;re already paying $20–60/user for ChatGPT and Claude.
                For <span className="text-blue-600 font-bold not-italic">$7/user</span>, TeamPrompt
                makes every seat more productive, compliant, and consistent —
                across <span className="text-blue-600 font-bold not-italic">all five AI platforms</span> at once.&rdquo;
              </blockquote>
            </div>
          </RevealText>

          <RevealText delay={500}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                <Brain className="h-5 w-5 text-blue-600 mb-3" />
                <h4 className="font-bold text-sm mb-1">&ldquo;Why won&apos;t ChatGPT just build this?&rdquo;</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  ChatGPT sells models. We govern how teams share and use prompts across <em>every</em> AI tool.
                  Same reason GitHub exists alongside programming languages.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                <Puzzle className="h-5 w-5 text-blue-600 mb-3" />
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
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600/80 mb-4">
              Business Model
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
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
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-white border border-zinc-200 shadow-sm"
                  )}
                >
                  {t.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600" />
                  )}
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{t.tier}</p>
                  <p className="text-3xl font-black mt-2 text-zinc-900">{t.price}</p>
                  <p className="text-sm text-zinc-500 mt-1">{t.desc}</p>
                  {t.highlight && (
                    <span className="inline-block mt-3 text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
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
                { value: "14:1", label: "LTV : CAC", icon: TrendingUp, accent: "text-emerald-600" },
                { value: "97%", label: "Gross margin", icon: DollarSign, accent: "text-emerald-600" },
                { value: "25%", label: "Free → Paid", icon: Rocket, accent: "text-blue-600" },
                { value: "<2%", label: "Monthly churn", icon: Star, accent: "text-blue-600" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 text-center">
                  <m.icon className={cn("h-5 w-5 mx-auto mb-2", m.accent)} />
                  <p className="text-2xl font-black text-zinc-900">{m.value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={500}>
            <p className="text-center text-sm text-zinc-400">
              Follows Notion&apos;s playbook: free tier drives organic adoption, teams convert when they need collaboration and security.
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 8: TRACTION
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(7)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600/80 mb-4">
              Traction
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Product-market fit.<br />
              <span className="text-emerald-600">Proven.</span>
            </h2>
            <p className="mt-3 text-base text-zinc-500">6 months. Organic growth. Zero ad spend.</p>
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
                <div key={m.label} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 text-center">
                  <p className="text-xl sm:text-2xl font-black text-zinc-900">{m.value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{m.label}</p>
                  {m.sub && <p className="text-xs text-emerald-600 mt-0.5 font-medium">{m.sub}</p>}
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
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
                    <span className="text-xs text-zinc-500 font-mono">${bar.mrr}K</span>
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-700",
                        i === 7
                          ? "bg-gradient-to-t from-blue-600 to-blue-400"
                          : "bg-gradient-to-t from-blue-600/30 to-blue-400/30"
                      )}
                      style={{ height: bar.h }}
                    />
                    <span className={cn("text-xs font-mono", i === 7 ? "text-blue-600 font-bold" : "text-zinc-400")}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealText>

          <RevealText delay={500}>
            <p className="text-center text-sm text-zinc-400">
              Growth engine: Chrome Web Store discovery + word-of-mouth. <span className="text-emerald-600 font-medium">No marketing spend yet.</span>
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 9: TECHNICAL ARCHITECTURE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(8)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600/80 mb-4">
              Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Enterprise-grade. <span className="text-zinc-500">Solo-built.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-5">
            <RevealText delay={200}>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-7 space-y-4 h-full">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
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
                      <row.icon className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{row.layer}</p>
                        <p className="text-xs text-zinc-600">{row.tech}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>

            <RevealText delay={350}>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-7 space-y-4 h-full">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold">Security & Compliance</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    "Row-Level Security on every query",
                    "Client-side DLP — API keys, credentials, PII never reach AI",
                    "23 compliance packs (HIPAA, SOC 2, GDPR...)",
                    "Full audit trail on every action",
                    "2FA / TOTP for all users",
                    "Domain auto-join (SSO-like experience)",
                  ].map((feat) => (
                    <div key={feat} className="flex gap-2 items-start">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-600">{feat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-7">
              <div className="flex items-center gap-2 mb-5">
                <Code2 className="h-5 w-5 text-blue-600" />
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
                    <m.icon className="h-4 w-4 text-blue-600/60 mb-2" />
                    <h4 className="font-bold text-xs mb-1">{m.title}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">{m.desc}</p>
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-600/80 mb-4">
              The Team
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Built by someone who<br />
              <span className="text-purple-600">lives the problem.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-5 gap-6">
            <RevealText delay={200} className="sm:col-span-3">
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 space-y-6 h-full">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white shrink-0">
                    KC
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Kade Cooper</h3>
                    <p className="text-sm text-zinc-500">Founder & CEO</p>
                    <p className="text-xs text-zinc-400 mt-1">Software engineer &middot; Full-stack developer &middot; Product builder</p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Built entire product solo — frontend, backend, extension, infra</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>$0 to $12K MRR with zero funding, zero marketing spend</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Deep customer insights from 50+ team interviews</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Ships weekly. Handles support personally. Close to every customer.</span>
                  </li>
                </ul>
              </div>
            </RevealText>

            <RevealText delay={350} className="sm:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                <h4 className="font-bold text-sm mb-3">Why solo works here</h4>
                <div className="space-y-2.5">
                  {[
                    { icon: Zap, text: "Faster iteration — ships weekly" },
                    { icon: Users, text: "Close to customers" },
                    { icon: DollarSign, text: "Capital efficient execution" },
                    { icon: Rocket, text: "Proven ability to ship complex systems" },
                  ].map((item) => (
                    <div key={item.text} className="flex gap-2 items-start text-sm text-zinc-500">
                      <item.icon className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <h4 className="font-bold text-sm text-emerald-600 mb-2">First hire (with funding)</h4>
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600/80 mb-4">
              The Ask
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              <span className="text-blue-600">$100K</span> pre-seed.
            </h2>
            <p className="mt-3 text-base text-zinc-500">Capital efficient. Revenue generating. Tax credit eligible.</p>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-6">
            <RevealText delay={200}>
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-7 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Banknote className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold">Use of Funds</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Marketing & Acquisition", amount: "$50K", pct: "50%", color: "from-blue-500 to-blue-400" },
                    { label: "Enterprise Features", amount: "$25K", pct: "25%", color: "from-blue-600 to-blue-400" },
                    { label: "Engineering & Infra", amount: "$15K", pct: "15%", color: "from-emerald-500 to-emerald-400" },
                    { label: "Operations", amount: "$10K", pct: "10%", color: "from-purple-500 to-purple-400" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-600">{item.label}</span>
                        <span className="text-zinc-500 font-mono">{item.amount}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
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
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-7 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[60px]" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold">Louisiana LEB Tax Credit</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      TeamPrompt qualifies for the <span className="text-blue-600 font-semibold">Louisiana Enterprise Zone / LEB program</span>.
                      Investors receive a <span className="text-blue-600 font-semibold">25% state tax credit</span> on their investment.
                    </p>
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-zinc-500">Investment</span>
                        <span className="text-lg font-black text-zinc-900">$100,000</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-zinc-500">Tax credit (25%)</span>
                        <span className="text-lg font-black text-emerald-600">−$25,000</span>
                      </div>
                      <div className="border-t border-zinc-200 pt-3 flex justify-between items-baseline">
                        <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Effective cost</span>
                        <span className="text-2xl font-black text-blue-600">$75,000</span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Louisiana Economic Development program designed to incentivize investment in Louisiana-based technology startups.
                    </p>
                  </div>
                </div>
              </div>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 text-center">
              <p className="text-sm text-zinc-600">
                <span className="text-blue-600 font-bold">Runway: 12–18 months</span> to profitability.
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
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <RevealText>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600/80 mb-4">
              Growth Plan
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
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
                <div key={t.metric} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 text-center">
                  <t.icon className="h-4 w-4 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{t.metric}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono">{t.from}</span>
                    <ArrowRight className="h-3 w-3 text-emerald-600" />
                    <span className="text-lg font-black text-emerald-600">{t.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={350}>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-7">
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
                    <faq.icon className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-zinc-700">{faq.q}</p>
                      <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealText>

          <RevealText delay={500}>
            <p className="text-center text-sm text-zinc-400 font-mono">
              $75K MRR = $900K ARR → Strong seed round position
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 13: VISION — CLOSING
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(12)}>
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <RevealText>
            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600/80">
                The Vision
              </p>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tighter">
                How teams share,<br />
                govern, and protect<br />
                <span className="text-blue-600">their AI usage.</span>
              </h2>
            </div>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 text-left">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">
                  Phase 1 — Next 18 months
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The go-to prompt sharing and governance platform for teams of 10–100 in regulated industries.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 text-left">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">
                  Phase 2 — Future
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Full AI governance platform — how organizations manage, protect, and optimize every AI interaction.
                </p>
              </div>
            </div>
          </RevealText>

          <RevealText delay={400}>
            <div className="max-w-2xl mx-auto border-t border-zinc-200 pt-10">
              <blockquote className="text-xl sm:text-2xl text-zinc-700 leading-relaxed font-light">
                &ldquo;I built this because I lived this problem.
                <br className="hidden sm:block" />
                Customers are already paying.
                <br className="hidden sm:block" />
                With <span className="text-blue-600 font-bold">$100K</span>, we accelerate what&apos;s already working.&rdquo;
              </blockquote>
              <p className="text-sm text-zinc-500 mt-4">— Kade Cooper, Founder</p>
            </div>
          </RevealText>

          <RevealText delay={600}>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="bg-white rounded-xl p-2 shadow-md border border-zinc-200">
                <Image
                  src="/brand/logo-icon.svg"
                  alt="TeamPrompt"
                  width={40}
                  height={40}
                />
              </div>
              <div className="text-left">
                <p className="font-black text-lg">TeamPrompt</p>
                <p className="text-xs text-zinc-500">teamprompt.app</p>
              </div>
            </div>
            <Link
              href={shareToken ? `/pitch/plan?share=${shareToken}` : "/pitch/plan"}
              className="inline-block mt-6 text-sm text-blue-600 hover:text-blue-700 border border-blue-600/20 hover:border-blue-600/40 rounded-full px-6 py-2 transition-colors"
            >
              View Full Business Plan & Proforma →
            </Link>
          </RevealText>
        </div>
      </div>

      {/* Bottom spacer for scroll mode */}
      {isScrollMode && <div className="h-16" />}
    </div>
  );
}
