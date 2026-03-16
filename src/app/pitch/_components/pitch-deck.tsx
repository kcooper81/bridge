"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  Users,
  Lock,
  Globe,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Rocket,
  FileText,
  Layers,
  Monitor,
  Server,
  Database,
  Code2,
  Puzzle,
  Briefcase,
  Target,
  Banknote,
  Link2,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────

const TOTAL_SLIDES = 15;
// Colors used inline in SVG gradients when needed
// const ACCENT = "#7C3AED"; const ACCENT_BLUE = "#3B82F6";

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

// ─── Reusable components ─────────────────────────────────────────

function GlowCard({ children, className, glow = "purple" }: { children: React.ReactNode; className?: string; glow?: "purple" | "blue" | "green" }) {
  const colors = {
    purple: "from-purple-500/20 via-transparent to-transparent",
    blue: "from-blue-500/20 via-transparent to-transparent",
    green: "from-emerald-500/20 via-transparent to-transparent",
  };
  return (
    <div className={cn("relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 overflow-hidden", className)}>
      <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-radial blur-[60px] opacity-40", colors[glow])} />
      <div className="relative">{children}</div>
    </div>
  );
}

function BigStat({ value, label, sub, className }: { value: string; label: string; sub?: string; className?: string }) {
  return (
    <div className={cn("text-center", className)}>
      <p className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{value}</p>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 mt-2 font-semibold">{label}</p>
      {sub && <p className="text-xs text-purple-400 mt-1 font-medium">{sub}</p>}
    </div>
  );
}

function SlideLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400 mb-4">{children}</p>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function PitchDeck({ shareToken }: { shareToken: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

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
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "Backspace") { e.preventDefault(); prev(); }
      else if (e.key === "Escape") { setIsScrollMode((v) => !v); }
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
      "w-full flex items-start justify-center px-6 sm:px-12 lg:px-20 relative overflow-y-auto",
      isScrollMode ? "min-h-screen py-28" : "min-h-screen pt-20 pb-24",
      !isScrollMode && idx !== currentSlide && "hidden"
    ),
  });

  const slideLabels = [
    "", "Problem", "Solution", "Product", "How It Works", "Why Now", "Competitive Edge",
    "Business Model", "Traction", "Architecture", "Team", "The Ask", "Growth Plan", "Deep Dive FAQ", "Vision",
  ];

  return (
    <div
      className={cn(
        "relative bg-[#0A0A0F] text-white selection:bg-purple-500/30",
        !isScrollMode && "h-screen overflow-y-auto"
      )}
    >
      {/* Background grain texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')] opacity-50 pointer-events-none z-0" />

      {/* ─── Navigation arrows ─── */}
      {!isScrollMode && (
        <>
          <button
            onClick={prev}
            className={cn(
              "fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
              currentSlide === 0
                ? "opacity-0 pointer-events-none"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 opacity-70 hover:opacity-100"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={next}
            className={cn(
              "fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
              currentSlide === TOTAL_SLIDES - 1
                ? "opacity-0 pointer-events-none"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 opacity-70 hover:opacity-100"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* ─── Bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#15151F]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === currentSlide
                    ? "w-8 bg-gradient-to-r from-purple-500 to-blue-500"
                    : i < currentSlide
                      ? "w-1.5 bg-purple-500/40"
                      : "w-1.5 bg-white/10 hover:bg-white/20"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-300">
            {slideLabels[currentSlide] && (
              <span className="text-zinc-400 font-medium hidden sm:inline">{slideLabels[currentSlide]}</span>
            )}
            <span className="font-mono">{String(currentSlide + 1).padStart(2, "0")}/{TOTAL_SLIDES}</span>
            <button onClick={() => setIsScrollMode((v) => !v)} className="hover:text-white/70 transition-colors border border-white/20 rounded-full px-3 py-1 hover:bg-white/10">
              {isScrollMode ? "Slides" : "Scroll"}
            </button>
            <button
              onClick={() => {
                const url = shareToken ? `${window.location.origin}/pitch?share=${shareToken}` : `${window.location.origin}/pitch`;
                navigator.clipboard.writeText(url);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="flex items-center gap-1 hover:text-white/70 transition-colors border border-white/20 rounded-full px-3 py-1 hover:bg-white/10"
            >
              <Link2 className="h-3 w-3" />
              {linkCopied ? "Copied!" : "Share"}
            </button>
            <button onClick={() => window.print()} className="hover:text-white/70 transition-colors border border-white/20 rounded-full px-3 py-1 hover:bg-white/10 hidden sm:inline">
              PDF
            </button>
            {shareToken && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/pitch?share=${shareToken}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 hover:text-white/70 transition-colors border border-white/20 rounded-full px-3 py-1 hover:bg-white/10 hidden sm:inline"
              >
                {copied ? "Copied!" : "Investor Link"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 1: HERO
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(0)}>
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[180px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <RevealText>
            <div className="flex items-center justify-center gap-4 mb-8">
              <Image src="/logo-dark.svg" alt="TeamPrompt" width={48} height={48} className="rounded-xl" />
              <span className="text-2xl font-bold tracking-tight">TeamPrompt</span>
            </div>
          </RevealText>

          <RevealText delay={200}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              Your team uses AI
              <br />
              every day.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Do you know what
                <br />
                they&apos;re sharing?
              </span>
            </h1>
          </RevealText>

          <RevealText delay={400}>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              AI Data Loss Prevention + Prompt Management for teams using ChatGPT, Claude, Gemini, Copilot & Perplexity
            </p>
          </RevealText>

          <RevealText delay={600}>
            <div className="flex items-center justify-center gap-8 pt-4">
              {["Full Product Live", "23 Early Users", "5 AI Tools Supported", "Zero Ad Spend"].map((s) => (
                <span key={s} className="text-sm text-zinc-400 font-medium">{s}</span>
              ))}
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 2: THE PROBLEM
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(1)}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/8 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>The Problem</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Employees paste sensitive data
              <br />
              <span className="text-zinc-400">into AI tools every day.</span>
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-3xl">
              When someone pastes data into ChatGPT, Claude, or Gemini — that data gets stored on their servers, used to train future models by default, reviewed by human moderators, and retained for months to years. Researchers have already extracted real names, emails, and phone numbers from AI training data for under $200. Once it&apos;s in, <span className="text-white font-medium">you can&apos;t get it back</span>.
            </p>
          </RevealText>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { stat: "34.8%", desc: "of data employees put into AI tools is sensitive — tripled in 2 years", source: "Cyberhaven 2025", icon: AlertTriangle, color: "text-red-400" },
              { stat: "$4.6M", desc: "average cost of a shadow AI data breach — $670K more than standard", source: "IBM 2025", icon: DollarSign, color: "text-amber-400" },
              { stat: "57%", desc: "of employees hide their AI usage from their employer entirely", source: "KPMG 2024", icon: Shield, color: "text-purple-400" },
            ].map((item, i) => (
              <RevealText key={item.stat} delay={200 + i * 150}>
                <GlowCard glow={i === 2 ? "purple" : i === 1 ? "blue" : "purple"}>
                  <item.icon className={cn("h-5 w-5 mb-4", item.color)} />
                  <p className="text-4xl font-black tracking-tight">{item.stat}</p>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{item.desc}</p>
                  <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">{item.source}</p>
                </GlowCard>
              </RevealText>
            ))}
          </div>

          <RevealText delay={700}>
            <p className="text-center text-sm text-zinc-400">
              27% of companies have banned AI tools — but 48% of employees upload company data anyway. — <span className="text-zinc-400">Cisco / KPMG</span>
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 3: THE SOLUTION
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(2)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>The Solution</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              One platform.
              <br />
              Every AI tool.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Complete governance.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { step: "01", title: "Protect", desc: "Real-time DLP scanning blocks API keys, credentials, PII, and secrets before they reach AI tools.", icon: Shield, color: "from-red-500/20 to-red-500/5" },
              { step: "02", title: "Manage", desc: "Shared prompt library with version history, approval workflows, quality guidelines, and ratings.", icon: FileText, color: "from-purple-500/20 to-purple-500/5" },
              { step: "03", title: "Monitor", desc: "Full audit trail with risk scoring, compliance exports, and analytics across all AI interactions.", icon: BarChart3, color: "from-blue-500/20 to-blue-500/5" },
            ].map((s, i) => (
              <RevealText key={s.step} delay={200 + i * 150}>
                <div className={cn("rounded-2xl border border-white/10 p-7 h-full bg-gradient-to-b", s.color)}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-black text-white/10">{s.step}</span>
                    <s.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </RevealText>
            ))}
          </div>

          <RevealText delay={600}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Shield, label: "19 Compliance Packs", desc: "HIPAA, SOC 2, GDPR, PCI-DSS" },
                { icon: AlertTriangle, label: "Risk Scoring 0–100", desc: "Every prompt scored by severity" },
                { icon: BarChart3, label: "Activity & Audit", desc: "Full audit log with CSV/JSON export" },
                { icon: Lock, label: "Auto-Sanitization", desc: "Replaces PII with safe placeholders" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <f.icon className="h-5 w-5 text-purple-400/70 mb-3" />
                  <p className="font-bold text-sm">{f.label}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 4: PRODUCT
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(3)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <div className="text-center">
              <SlideLabel>The Product</SlideLabel>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                Built. Shipped.{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Live.</span>
              </h2>
            </div>
          </RevealText>

          {/* Three product mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
            {/* Extension Sidebar */}
            <RevealText delay={100}>
              <div className="sm:-rotate-1 sm:translate-y-4 transition-transform hover:rotate-0 hover:translate-y-0 duration-500">
                <div className="rounded-2xl bg-[#12121A] border border-white/10 shadow-2xl overflow-hidden">
                  <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-white/5">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Layers className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold">TeamPrompt</span>
                  </div>
                  <div className="px-4 pt-3">
                    <div className="h-7 rounded-lg bg-white/5 border border-white/10 px-3 flex items-center">
                      <span className="text-white/30 text-[10px]">Search prompts...</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 space-y-1">
                    {[
                      { name: "Sales Outreach Email", tag: "Sales", color: "bg-purple-500/20 text-purple-400" },
                      { name: "Code Review Assistant", tag: "Eng", color: "bg-emerald-500/20 text-emerald-400" },
                      { name: "Compliance Review", tag: "Legal", color: "bg-amber-500/20 text-amber-400" },
                      { name: "Meeting Summary", tag: "Ops", color: "bg-blue-500/20 text-blue-400" },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5">
                        <div>
                          <p className="text-white text-[11px] font-medium">{p.name}</p>
                          <span className={cn("text-[8px] font-semibold px-1.5 py-0.5 rounded-full", p.color)}>{p.tag}</span>
                        </div>
                        <div className="text-[9px] text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded">Use</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-zinc-400 mt-3">Shared Prompt Library</p>
              </div>
            </RevealText>

            {/* DLP Block — center, elevated */}
            <RevealText delay={200}>
              <div className="sm:-translate-y-2 transition-transform hover:-translate-y-4 duration-500">
                <div className="rounded-2xl bg-[#12121A] border border-white/10 shadow-2xl overflow-hidden">
                  <div className="px-4 pt-4 pb-2">
                    <div className="bg-purple-500 rounded-xl rounded-br-sm px-3 py-2 text-white text-[10px] leading-relaxed mb-2 ml-8">
                      Help me draft a follow-up email for Acme Corp...
                    </div>
                  </div>
                  <div className="mx-4 mb-4 rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 font-bold text-xs">Message Blocked</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { type: "API Key", value: "sk-proj-abc123..." },
                        { type: "Email (PII)", value: "sarah@acme.com" },
                      ].map((d) => (
                        <div key={d.type} className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px]">
                          <span className="text-red-400 font-semibold">{d.type}:</span>{" "}
                          <span className="text-white/60">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-zinc-400 mt-3">Real-Time DLP Shield</p>
              </div>
            </RevealText>

            {/* Template Variables */}
            <RevealText delay={300}>
              <div className="sm:rotate-1 sm:translate-y-4 transition-transform hover:rotate-0 hover:translate-y-0 duration-500">
                <div className="rounded-2xl bg-[#12121A] border border-white/10 shadow-2xl overflow-hidden">
                  <div className="px-4 pt-4 pb-3 border-b border-white/5">
                    <span className="text-white font-semibold text-xs">Customer Onboarding</span>
                  </div>
                  <div className="px-4 pt-3">
                    <div className="bg-white/5 rounded-lg p-3 text-[10px] text-white/60 leading-relaxed border border-white/5">
                      You are a success specialist at{" "}
                      <span className="text-purple-400 bg-purple-500/10 px-1 rounded">{"{{company}}"}</span>.
                      Guide the customer for the{" "}
                      <span className="text-purple-400 bg-purple-500/10 px-1 rounded">{"{{industry}}"}</span>{" "}
                      use case.
                    </div>
                  </div>
                  <div className="px-4 pt-3 space-y-2">
                    {[{ label: "company", value: "Acme Corp" }, { label: "industry", value: "SaaS" }].map((v) => (
                      <div key={v.label}>
                        <label className="text-[9px] text-purple-400 font-mono">{v.label}</label>
                        <div className="h-7 rounded-lg bg-white/5 border border-white/10 px-3 flex items-center text-white text-[11px]">{v.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-semibold py-2 rounded-lg">Insert into AI Tool</button>
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-zinc-400 mt-3">Smart Templates</p>
              </div>
            </RevealText>
          </div>

          {/* Feature grid */}
          <RevealText delay={500}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                "Auto-Sanitization", "Risk Scoring 0–100", "Activity & Audit Export", "19 Compliance Packs",
                "Approval Queue", "Version History & Diff", "Quality Guidelines", "Real-time Notifications",
              ].map((f) => (
                <div key={f} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 text-center">
                  <p className="text-sm font-bold text-zinc-200">{f}</p>
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={600}>
            <div className="flex items-center justify-center gap-8">
              {["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map((name) => (
                <span key={name} className="text-xs text-zinc-500 font-medium">{name}</span>
              ))}
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 5: HOW IT WORKS — USER FLOW
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(4)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-blue-500/50 to-purple-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <div className="text-center">
              <SlideLabel>How It Works</SlideLabel>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                From install to protected
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">in under 2 minutes.</span>
              </h2>
            </div>
          </RevealText>

          {/* Flow steps */}
          <div className="space-y-0">
            {[
              {
                step: "1",
                title: "Admin creates workspace",
                desc: "Sign up, name your org, invite your team via email or CSV. Members get an invite email and join with one click.",
                mock: (
                  <div className="rounded-xl bg-[#12121A] border border-white/10 p-4 w-full max-w-xs">
                    <p className="text-[10px] text-white/40 mb-2">New Workspace</p>
                    <div className="h-7 rounded-lg bg-white/5 border border-white/10 px-3 flex items-center text-white text-xs mb-2">Acme Corp</div>
                    <div className="flex gap-2">
                      <div className="h-7 flex-1 rounded-lg bg-white/5 border border-white/10 px-3 flex items-center text-white/40 text-[10px]">sarah@acme.com</div>
                      <div className="h-7 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center text-white text-[10px] font-semibold">Invite</div>
                    </div>
                  </div>
                ),
              },
              {
                step: "2",
                title: "Set up guardrails & guidelines",
                desc: "Install compliance packs (HIPAA, SOC 2, GDPR) with one click. Add custom rules. Enable quality guidelines for prompt standards.",
                mock: (
                  <div className="rounded-xl bg-[#12121A] border border-white/10 p-4 w-full max-w-xs">
                    <p className="text-[10px] text-white/40 mb-2">Install Compliance Pack</p>
                    <div className="space-y-1.5">
                      {["HIPAA", "SOC 2", "GDPR"].map((p, i) => (
                        <div key={p} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                          <span className="text-white text-[11px] font-medium">{p}</span>
                          <span className={i < 2 ? "text-[9px] text-emerald-400 font-semibold" : "text-[9px] text-purple-400 font-semibold"}>{i < 2 ? "Installed" : "Install"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                step: "3",
                title: "Members install the extension",
                desc: "One-click install from Chrome/Firefox/Edge. Extension auto-connects to the workspace. Shield indicator confirms protection is active.",
                mock: (
                  <div className="rounded-xl bg-[#12121A] border border-white/10 p-4 w-full max-w-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-white text-xs font-semibold">Extension Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400 text-[10px] font-medium">Guardrails Active — 17 rules</span>
                    </div>
                  </div>
                ),
              },
              {
                step: "4",
                title: "Team uses AI normally — TeamPrompt scans in real-time",
                desc: "When anyone types in ChatGPT, Claude, or Gemini, TeamPrompt scans the message before it sends. Sensitive data gets blocked or auto-sanitized.",
                mock: (
                  <div className="rounded-xl bg-[#12121A] border border-white/10 p-4 w-full max-w-xs">
                    <div className="bg-purple-500 rounded-xl rounded-br-sm px-3 py-2 text-white text-[10px] mb-2 ml-6">
                      Summarize the financials for client <span className="bg-red-400/30 px-0.5 rounded">John Smith, SSN 123-45-6789</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <Shield className="h-3 w-3 text-red-400" />
                      <span className="text-red-400 text-[10px] font-semibold">Blocked — SSN and PII detected</span>
                    </div>
                  </div>
                ),
              },
              {
                step: "5",
                title: "Admins see everything in the audit trail",
                desc: "Every interaction logged with risk scores. Filter by tool, action, or date. Export as CSV/JSON for compliance reporting.",
                mock: (
                  <div className="rounded-xl bg-[#12121A] border border-white/10 p-4 w-full max-w-xs">
                    <p className="text-[10px] text-white/40 mb-2">Activity & Audit</p>
                    <div className="space-y-1">
                      {[
                        { tool: "ChatGPT", action: "Blocked", risk: "87", color: "text-red-400 bg-red-500/10" },
                        { tool: "Claude", action: "Sent", risk: "5", color: "text-emerald-400 bg-emerald-500/10" },
                        { tool: "Gemini", action: "Warned", risk: "42", color: "text-amber-400 bg-amber-500/10" },
                      ].map((l) => (
                        <div key={l.tool} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 text-[10px]">
                          <span className="text-white/70 w-14">{l.tool}</span>
                          <span className={`px-1.5 py-0.5 rounded font-semibold ${l.color}`}>{l.action}</span>
                          <span className="ml-auto text-white/40">Risk: {l.risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((item, i) => (
              <RevealText key={item.step} delay={i * 150}>
                <div className={cn("flex items-center gap-8 py-6", i % 2 === 1 && "flex-row-reverse")}>
                  {/* Text side */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-purple-400/30">{item.step}</span>
                      <h3 className="text-lg font-bold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed pl-12">{item.desc}</p>
                  </div>
                  {/* Mock side */}
                  <div className="flex-shrink-0">{item.mock}</div>
                </div>
                {i < 4 && (
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-gradient-to-b from-purple-500/30 to-transparent" />
                  </div>
                )}
              </RevealText>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 6: WHY NOW
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(5)}>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[200px]" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Why Now</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              The AI governance wave
              <br />
              <span className="text-zinc-400">is just starting.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-6">
            <RevealText delay={200}>
              <GlowCard>
                <p className="text-6xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">$97B</p>
                <p className="text-sm text-zinc-400 mt-2">AI security & governance market by 2030</p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">MarketsAndMarkets</p>
              </GlowCard>
            </RevealText>
            <RevealText delay={350}>
              <GlowCard glow="blue">
                <p className="text-6xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">40%</p>
                <p className="text-sm text-zinc-400 mt-2">of AI data breaches will stem from cross-border GenAI misuse by 2027</p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Gartner 2025</p>
              </GlowCard>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Globe, title: "Regulatory pressure", desc: "EU AI Act, NIST AI RMF, SEC AI disclosure rules" },
                { icon: Building2, title: "Enterprise demand", desc: "CISOs need visibility into AI tool usage" },
                { icon: Zap, title: "Zero competition", desc: "No cross-platform DLP + prompt management solution" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <item.icon className="h-4 w-4 text-purple-400 mb-3" />
                  <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 7: COMPETITIVE EDGE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(6)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Competitive Edge</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              They sell AI tools.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">We govern all of them.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-5 font-bold text-zinc-400 text-xs uppercase tracking-widest">Feature</th>
                    <th className="text-center py-4 px-3 font-bold text-xs uppercase tracking-widest"><span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">TeamPrompt</span></th>
                    <th className="text-center py-4 px-3 font-bold text-zinc-500 text-xs uppercase tracking-widest">ChatGPT Team</th>
                    <th className="text-center py-4 px-3 font-bold text-zinc-500 text-xs uppercase tracking-widest">Claude Team</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Cross-platform (5 AI tools)", tp: true, chatgpt: false, claude: false },
                    { feature: "Real-time DLP scanning", tp: true, chatgpt: false, claude: false },
                    { feature: "Risk scoring (0–100)", tp: true, chatgpt: false, claude: false },
                    { feature: "19 compliance packs", tp: true, chatgpt: false, claude: false },
                    { feature: "Auto-sanitization", tp: true, chatgpt: false, claude: false },
                    { feature: "Prompt library + templates", tp: true, chatgpt: true, claude: false },
                    { feature: "Audit trail + export", tp: true, chatgpt: false, claude: false },
                    { feature: "Approval workflows", tp: true, chatgpt: false, claude: false },
                    { feature: "Starting price per user", tp: "$7/mo", chatgpt: "$25/mo", claude: "$25/mo" },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-white/5">
                      <td className="py-3 px-5 text-sm text-zinc-300">{row.feature}</td>
                      <td className="text-center py-3 px-3">
                        {typeof row.tp === "boolean" ? (
                          row.tp ? <CheckCircle2 className="h-4 w-4 text-purple-400 mx-auto" /> : <span className="text-zinc-700">—</span>
                        ) : <span className="text-purple-400 font-bold">{row.tp}</span>}
                      </td>
                      <td className="text-center py-3 px-3">
                        {typeof row.chatgpt === "boolean" ? (
                          row.chatgpt ? <CheckCircle2 className="h-4 w-4 text-zinc-400 mx-auto" /> : <span className="text-zinc-700">—</span>
                        ) : <span className="text-zinc-400">{row.chatgpt}</span>}
                      </td>
                      <td className="text-center py-3 px-3">
                        {typeof row.claude === "boolean" ? (
                          row.claude ? <CheckCircle2 className="h-4 w-4 text-zinc-400 mx-auto" /> : <span className="text-zinc-700">—</span>
                        ) : <span className="text-zinc-400">{row.claude}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealText>

          <RevealText delay={400}>
            <p className="text-center text-sm text-zinc-400">
              For <span className="text-purple-400 font-bold">$7/user</span>, TeamPrompt adds governance across <span className="text-purple-400 font-bold">all five platforms</span> at once.
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 8: BUSINESS MODEL
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(7)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Business Model</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Freemium SaaS.
              <br />
              <span className="text-zinc-400">Ready to scale.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { tier: "Free", price: "$0", desc: "3 members, core features", highlight: false },
                { tier: "Pro", price: "$9", desc: "/mo — Analytics, unlimited prompts", highlight: false },
                { tier: "Team", price: "$7", desc: "/user/mo — DLP + compliance", highlight: true },
                { tier: "Business", price: "$12", desc: "/user/mo — Enterprise + SLA", highlight: false },
              ].map((t) => (
                <div key={t.tier} className={cn("rounded-2xl p-6 text-center border", t.highlight ? "border-purple-500/30 bg-purple-500/5" : "border-white/10 bg-white/[0.02]")}>
                  {t.highlight && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />}
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">{t.tier}</p>
                  <p className="text-3xl font-black mt-2">{t.price}</p>
                  <p className="text-xs text-zinc-400 mt-1">{t.desc}</p>
                  {t.highlight && <span className="inline-block mt-3 text-[10px] bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">Most Popular</span>}
                </div>
              ))}
            </div>
          </RevealText>

          <RevealText delay={400}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "14:1", label: "LTV : CAC" },
                { value: "97%", label: "Gross Margin" },
                { value: "25%", label: "Free → Paid" },
                { value: "<2%", label: "Monthly Churn" },
              ].map((m) => (
                <GlowCard key={m.label} className="text-center py-5">
                  <p className="text-2xl font-black">{m.value}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">{m.label}</p>
                </GlowCard>
              ))}
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 9: TRACTION
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(8)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Traction</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Product built.
              <br />
              <span className="text-zinc-400">Ready to grow.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <BigStat value="23" label="Early Users" sub="organic signups" />
              <BigStat value="40+" label="Prompts Created" />
              <BigStat value="5" label="AI Tools Supported" sub="ChatGPT, Claude, Gemini, Copilot, Perplexity" />
              <BigStat value="$0" label="Ad Spend to Date" sub="100% organic" />
            </div>
          </RevealText>

          <RevealText delay={400}>
            <GlowCard>
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400 mb-4">What&apos;s Built & Shipped</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { title: "Full SaaS Platform", items: ["Prompt vault with versioning", "Team management + roles", "Analytics dashboard", "Billing with Stripe"] },
                  { title: "Browser Extension", items: ["Chrome, Firefox, Edge", "Real-time DLP scanning", "Side panel + prompt insertion", "Shield indicator"] },
                  { title: "Security & Compliance", items: ["19 compliance packs", "Risk scoring 0–100", "Auto-sanitization", "Full audit trail + export"] },
                ].map((col) => (
                  <div key={col.title}>
                    <p className="text-sm font-bold text-zinc-200 mb-2">{col.title}</p>
                    <div className="space-y-1.5">
                      {col.items.map((item) => (
                        <div key={item} className="flex gap-2 items-start">
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-400">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 10: ARCHITECTURE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(9)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Architecture</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Enterprise-grade.
              <br />
              <span className="text-zinc-400">Solo-built.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-5">
            <RevealText delay={200}>
              <GlowCard>
                <h3 className="font-bold mb-5 flex items-center gap-2"><Layers className="h-4 w-4 text-purple-400" /> Tech Stack</h3>
                <div className="space-y-3">
                  {[
                    { layer: "Frontend", tech: "Next.js 14, React, TypeScript, Tailwind", icon: Monitor },
                    { layer: "Backend", tech: "Next.js API Routes, Edge Functions, Supabase", icon: Server },
                    { layer: "Database", tech: "Postgres + Row-Level Security + Realtime", icon: Database },
                    { layer: "Extension", tech: "Chrome/Firefox/Edge MV3, 5 AI tools", icon: Puzzle },
                    { layer: "Infra", tech: "Vercel (auto-scaling), Supabase Cloud, Stripe", icon: Globe },
                  ].map((row) => (
                    <div key={row.layer} className="flex gap-3">
                      <row.icon className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">{row.layer}</p>
                        <p className="text-xs text-zinc-400">{row.tech}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </RevealText>

            <RevealText delay={350}>
              <GlowCard glow="blue">
                <h3 className="font-bold mb-5 flex items-center gap-2"><Shield className="h-4 w-4 text-purple-400" /> Security & Compliance</h3>
                <div className="space-y-2.5">
                  {[
                    "Row-Level Security on every query",
                    "Client-side DLP — data never reaches AI tools",
                    "19 compliance packs (HIPAA, SOC 2, GDPR...)",
                    "Full audit trail with risk scoring",
                    "2FA / TOTP for all users",
                    "Auto-sanitization with safe placeholders",
                  ].map((feat) => (
                    <div key={feat} className="flex gap-2 items-start">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-400">{feat}</p>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <GlowCard>
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Code2 className="h-4 w-4 text-purple-400" /> Technical Moat</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { title: "Deep DOM integration", desc: "5 AI tools, each with unique selectors and event handling" },
                  { title: "Real-time interception", desc: "Capture-phase event listeners scan before AI tool handlers fire" },
                  { title: "Constant updates", desc: "AI tools update their UI weekly — we ship fixes same-day" },
                ].map((m) => (
                  <div key={m.title}>
                    <h4 className="text-xs font-bold text-zinc-300">{m.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 11: TEAM
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(10)}>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Team</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Lean team.
              <br />
              <span className="text-zinc-400">Full-stack execution.</span>
            </h2>
          </RevealText>

          {/* Founder — full width, above team */}
          <RevealText delay={200}>
            <GlowCard className="py-8">
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Photo + name */}
                <div className="text-center sm:text-left shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mx-auto sm:mx-0 mb-4 flex items-center justify-center text-4xl font-black text-purple-400">KC</div>
                  <h3 className="font-bold text-xl">Kade Cooper</h3>
                  <p className="text-sm text-purple-400 font-medium">Founder & Product Visionary</p>
                  <p className="text-xs text-zinc-500 mt-1">Baton Rouge, Louisiana</p>
                </div>

                {/* Bio */}
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    <span className="text-white font-semibold">15+ years turning complex problems into intuitive products.</span> Kade is a UI/UX developer who thinks like a founder — he doesn&apos;t just design interfaces, he conceptualizes entire product experiences from the business need down to the pixel.
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    He co-founded <span className="text-purple-400 font-semibold">Omnidek</span>, where he conceptualized core features from both a business strategy and user experience perspective — bridging the gap between what users need and what the market demands. Across his career in enterprise SaaS, he&apos;s driven checkout optimization, platform usability at scale, and feature design for products used by millions.
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    When AI tools exploded in the workplace, Kade saw the wave coming before most: <span className="text-white font-medium">every team would need custom guardrails</span>. Employees pasting sensitive data into ChatGPT with zero oversight — no DLP, no audit trail, no compliance. Instead of waiting for someone else to build it, he used AI-assisted development to ship an entire SaaS platform, browser extension, and security engine — proving that a designer who understands both users <em>and</em> technology can move faster than a traditional dev team.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                    {[
                      { label: "Experience", value: "15+ years" },
                      { label: "Specialty", value: "UI/UX + Product" },
                      { label: "Certification", value: "ScrumMaster" },
                      { label: "Co-founded", value: "Omnidek" },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-semibold text-zinc-200">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlowCard>
          </RevealText>

          {/* Team */}
          <div className="grid sm:grid-cols-2 gap-5">
            <RevealText delay={350}>
              <GlowCard>
                <h4 className="font-bold text-sm mb-3">Current Team</h4>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">FS</div>
                    <div>
                      <p className="text-sm font-semibold">Full-Stack Engineer <span className="text-zinc-400 font-normal">(Contract)</span></p>
                      <p className="text-xs text-zinc-400">Full-stack development — backend, API, and platform features</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">SM</div>
                    <div>
                      <p className="text-sm font-semibold">Social Media Team <span className="text-zinc-400 font-normal">(India, Contract)</span></p>
                      <p className="text-xs text-zinc-400">Social channel management, content distribution, and community engagement</p>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </RevealText>
            <RevealText delay={450}>
              <GlowCard glow="blue">
                <h4 className="font-bold text-sm mb-3">Why this works</h4>
                <div className="space-y-2">
                  {[
                    { icon: Zap, text: "Ships weekly — fast iteration" },
                    { icon: Users, text: "Close to every customer" },
                    { icon: DollarSign, text: "Capital efficient execution" },
                    { icon: Rocket, text: "Lean team, global reach" },
                  ].map((item) => (
                    <div key={item.text} className="flex gap-2 items-start text-zinc-400">
                      <item.icon className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-xs">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <h4 className="font-bold text-xs text-purple-400 mb-1">Next hire (with funding)</h4>
                  <p className="text-xs text-zinc-400">Part-time security engineer — because enterprise buyers require SSO/SAML, SCIM provisioning, and SOC 2 certification before procurement will approve. This hire unlocks the $25K+ ACV deals.</p>
                </div>
              </GlowCard>
            </RevealText>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 12: THE ASK
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(11)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>The Ask</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">$100K</span> pre-seed.
              <br />
              <span className="text-zinc-400">Capital efficient. Revenue generating.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-2 gap-6">
            <RevealText delay={200}>
              <GlowCard>
                <h3 className="font-bold mb-6 flex items-center gap-2"><Banknote className="h-4 w-4 text-purple-400" /> Use of Funds</h3>
                <div className="space-y-4">
                  {[
                    { label: "Marketing & Acquisition", amount: "$50K", pct: "50%" },
                    { label: "Enterprise Features", amount: "$25K", pct: "25%" },
                    { label: "Engineering & Infra", amount: "$15K", pct: "15%" },
                    { label: "Operations", amount: "$10K", pct: "10%" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="text-zinc-400 font-mono">{item.amount}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: item.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </RevealText>

            <RevealText delay={350}>
              <GlowCard glow="blue">
                <h3 className="font-bold mb-5 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-400" /> Why This Is a Smart Bet</h3>
                <div className="space-y-3">
                  {[
                    { label: "Product shipped", value: "Full platform live — not a prototype" },
                    { label: "97% gross margin", value: "Software-only, serverless architecture" },
                    { label: "Early traction", value: "23 organic users, growing without ads" },
                    { label: "Capital efficient", value: "$100K funds 12–18 months of growth" },
                    { label: "Clear path to revenue", value: "Freemium model proven by Notion, Slack, Figma" },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-3 items-start">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-zinc-400">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </RevealText>
          </div>

          <RevealText delay={500}>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
              <p className="text-sm text-zinc-400">
                <span className="text-purple-400 font-bold">Runway: 12–18 months</span> to profitability.
                Not asking for millions — accelerating what&apos;s already working.
              </p>
            </div>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 13: GROWTH PLAN
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(12)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Growth Plan</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              18-Month Roadmap
            </h2>
          </RevealText>

          {/* Timeline */}
          <RevealText delay={200}>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500/20" />

              <div className="space-y-8">
                {[
                  {
                    phase: "Phase 1", period: "Months 1–3", label: "Foundation & Launch",
                    color: "from-purple-500 to-purple-400",
                    items: [
                      "Chrome Web Store optimization — reviews, screenshots, ASO",
                      "LinkedIn paid ads targeting CISOs and IT leaders",
                      "Google Ads on high-intent keywords (AI DLP, ChatGPT security)",
                      "First 10 case studies from early adopters",
                      "SSO/SAML integration for enterprise readiness",
                    ],
                    target: "Target: 200 users, 30 paying teams, $2K MRR",
                  },
                  {
                    phase: "Phase 2", period: "Months 4–6", label: "Acceleration",
                    color: "from-blue-500 to-blue-400",
                    items: [
                      "AI SEO content engine — comparison pages, guides, templates",
                      "Scale LinkedIn + Google campaigns based on Phase 1 data",
                      "SOC 2 Type II certification process",
                      "SCIM directory provisioning for enterprise accounts",
                      "Partner integrations (SIEM, MDM, compliance platforms)",
                    ],
                    target: "Target: 1,000 users, 100 paying teams, $11K MRR",
                  },
                  {
                    phase: "Phase 3", period: "Months 7–12", label: "Scale & Revenue",
                    color: "from-purple-400 to-blue-400",
                    items: [
                      "Content marketing at scale — webinars, whitepapers, podcasts",
                      "Industry-specific landing pages (healthcare, finance, legal)",
                      "Enterprise pilot program with 10+ seat deals",
                      "Hire security engineer for enterprise features",
                      "Expand to 3+ additional AI tools as market evolves",
                    ],
                    target: "Target: 3,500 users, 250 paying teams, $35K MRR",
                  },
                  {
                    phase: "Phase 4", period: "Months 13–18", label: "Seed Round Position",
                    color: "from-blue-400 to-emerald-400",
                    items: [
                      "Proven unit economics and repeatable acquisition",
                      "Enterprise customer base with case studies",
                      "Full compliance certification suite",
                      "Prepare and execute seed round ($1–2M)",
                      "First full-time hires — engineering + GTM",
                    ],
                    target: "Target: 5,000+ users, 350+ paying teams, $50K MRR ($600K ARR)",
                  },
                ].map((phase, i) => (
                  <RevealText key={phase.phase} delay={200 + i * 100}>
                    <div className="flex gap-6 pl-1">
                      {/* Timeline dot */}
                      <div className={cn("w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-black shrink-0 z-10", phase.color)}>
                        {i + 1}
                      </div>
                      {/* Content */}
                      <GlowCard className="flex-1" glow={i % 2 === 0 ? "purple" : "blue"}>
                        <div className="flex items-baseline gap-3 mb-3">
                          <span className="text-sm font-bold">{phase.phase}</span>
                          <span className="text-xs text-zinc-400">{phase.period}</span>
                          <span className="text-xs font-semibold text-purple-400 ml-auto">{phase.label}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                          {phase.items.map((item) => (
                            <div key={item} className="flex gap-2 items-start">
                              <CheckCircle2 className="h-3 w-3 text-purple-400/60 shrink-0 mt-1" />
                              <p className="text-xs text-zinc-400 leading-relaxed">{item}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs font-semibold text-zinc-300 border-t border-white/5 pt-2">{phase.target}</p>
                      </GlowCard>
                    </div>
                  </RevealText>
                ))}
              </div>
            </div>
          </RevealText>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 14: INVESTOR FAQ — DEEP DIVE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(13)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Investor FAQ</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Questions you&apos;re
              <br />
              <span className="text-zinc-400">already thinking.</span>
            </h2>
          </RevealText>

          <div className="space-y-5">
            {[
              {
                q: "What are the biggest risks?",
                a: "1) Go-to-market execution — we have the product but need to prove repeatable acquisition. Mitigated by a fully shipped product, Chrome Web Store distribution, and a clear paid ads strategy with measurable CAC. 2) Platform dependency — if ChatGPT or Claude change their DOM, the extension breaks. Mitigated by same-day shipping cadence and deep technical knowledge of all 5 platforms. 3) Enterprise sales cycle — long procurement processes. Mitigated by product-led growth: individual installs, team adopts, org pays. No enterprise sales team needed for initial traction.",
                icon: AlertTriangle,
              },
              {
                q: "How do you compete with free AI tools that have built-in team plans?",
                a: "ChatGPT Team ($25/user) and Claude Team ($25/user) only govern their own platform. They can't scan what employees paste into competing tools. TeamPrompt governs all 5 AI tools from a single extension for $7/user — cross-platform DLP, compliance packs, risk scoring, and audit trails. It's the same reason 1Password exists alongside browser-native password managers: cross-platform governance is fundamentally different from single-vendor features.",
                icon: Briefcase,
              },
              {
                q: "Why only $100K? Why not raise more?",
                a: "Capital efficiency. The product is built. $100K funds 12-18 months of marketing, one security contractor, and infrastructure scaling. The goal: prove the model to $50K MRR, then raise a proper $1-2M seed round on real unit economics — not projections. Raising more now would dilute unnecessarily when the main need is marketing, not engineering.",
                icon: DollarSign,
              },
              {
                q: "Can this scale with a lean team? What breaks at 1,000 users?",
                a: "The architecture is built for this. The extension runs entirely client-side — DLP scanning happens in the browser, not on our servers. The backend is serverless on Vercel with auto-scaling. Database is Supabase (Postgres) with row-level security. At 1,000 users, our infrastructure cost increases by roughly $50-100/month. At 10,000 users, maybe $300/month. The $100K is for marketing and people, not servers.",
                icon: Server,
              },
              {
                q: "How defensible is a browser extension?",
                a: "Deeply. Each of the 5 AI tools (ChatGPT, Claude, Gemini, Copilot, Perplexity) has a unique DOM structure, event handling, and input system. We maintain separate selector engines for each. These platforms update their UIs weekly — we ship fixes same-day. A competitor would need to reverse-engineer and maintain integrations across all 5 simultaneously. Google DeepMind researchers proved that even simple prompt attacks can extract training data — our client-side interception prevents that data from ever reaching the AI tool in the first place.",
                icon: Code2,
              },
              {
                q: "What does the data show about where leaked data actually goes?",
                a: "OpenAI uses free/Plus conversations for training by default. Google retains Gemini data 18 months minimum — and if human reviewers examine it, up to 3 years with no way to delete. Google DeepMind researchers extracted a gigabyte of real PII from ChatGPT's training data for just $200. Even 'enterprise' plans retain data in abuse monitoring logs for 7-55 days. TeamPrompt blocks the data before it ever leaves the browser — the AI company never receives it.",
                icon: Shield,
              },
              {
                q: "What about regulatory risk — GDPR, HIPAA, SEC?",
                a: "Italy already fined OpenAI €15M for GDPR violations. Generic ChatGPT is explicitly not HIPAA compliant — any PHI input is an unauthorized disclosure. The SEC launched a dedicated AI task force in 2025. HIPAA penalties reached $2M+ annually. These regulations are why organizations need TeamPrompt: we prevent the data from reaching AI tools, creating a compliance-safe layer. 63% of breached organizations don't have an AI governance policy — that's our market.",
                icon: Lock,
              },
              {
                q: "How do you acquire customers without a big marketing budget?",
                a: "Three channels: 1) Chrome Web Store — organic discovery for searches like 'ChatGPT security' and 'AI prompt manager'. 2) Content-led SEO — comparison pages, industry guides, compliance content that ranks for high-intent searches. 3) Product-led virality — one person installs, invites their team, team requires the org to pay. With $100K, we add LinkedIn/Google paid ads to accelerate what's already working organically.",
                icon: Target,
              },
            ].map((faq, i) => (
              <RevealText key={faq.q} delay={i * 80}>
                <GlowCard glow={i % 2 === 0 ? "purple" : "blue"}>
                  <div className="flex gap-4">
                    <faq.icon className="h-5 w-5 text-purple-400 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-base text-zinc-100 mb-2">{faq.q}</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </GlowCard>
              </RevealText>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 15: VISION / CLOSING
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(14)}>
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <RevealText>
            <SlideLabel>The Vision</SlideLabel>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              How teams{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                govern
              </span>
              <br />
              their AI usage.
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <GlowCard className="text-left">
                <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-2">Phase 1 — Next 18 months</p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  The go-to prompt sharing and governance platform for regulated teams of 10–100.
                </p>
              </GlowCard>
              <GlowCard glow="blue" className="text-left">
                <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-2">Phase 2 — Future</p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Full AI governance platform — how organizations manage, protect, and optimize every AI interaction.
                </p>
              </GlowCard>
            </div>
          </RevealText>

          <RevealText delay={400}>
            <div className="max-w-2xl mx-auto border-t border-white/10 pt-10">
              <blockquote className="text-xl sm:text-2xl text-zinc-300 leading-relaxed font-light">
                &ldquo;I saw this gap forming before most people noticed.
                <br className="hidden sm:block" />
                Every team needs AI guardrails — I built them.
                <br className="hidden sm:block" />
                With <span className="text-purple-400 font-bold">$100K</span>, we turn early traction into real scale.&rdquo;
              </blockquote>
              <p className="text-sm text-zinc-500 mt-4">— Kade Cooper, Founder</p>
            </div>
          </RevealText>

          <RevealText delay={600}>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Image src="/logo-dark.svg" alt="TeamPrompt" width={32} height={32} className="rounded-lg" />
              <div className="text-left">
                <p className="font-bold text-lg">TeamPrompt</p>
                <p className="text-xs text-zinc-400">teamprompt.app</p>
              </div>
            </div>
            <Link
              href={shareToken ? `/pitch/plan?share=${shareToken}` : "/pitch/plan"}
              className="inline-block mt-6 text-sm text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 rounded-full px-6 py-2 transition-colors"
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
