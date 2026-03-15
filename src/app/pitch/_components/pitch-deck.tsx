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
  ArrowRight,
  Monitor,
  Server,
  Database,
  Code2,
  Puzzle,
  Briefcase,
  Banknote,
  Link2,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────

const TOTAL_SLIDES = 13;
const ACCENT = "#7C3AED"; // purple-600
const ACCENT_BLUE = "#3B82F6"; // blue-500

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
      "w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 relative overflow-hidden",
      isScrollMode ? "min-h-screen py-28" : "h-screen py-16 overflow-y-auto",
      !isScrollMode && idx !== currentSlide && "hidden"
    ),
  });

  const slideLabels = [
    "", "Problem", "Solution", "Product", "Why Now", "Competitive Edge",
    "Business Model", "Traction", "Architecture", "Team", "The Ask", "Growth Plan", "Vision",
  ];

  return (
    <div
      className={cn(
        "relative bg-[#0A0A0F] text-white selection:bg-purple-500/30",
        !isScrollMode && "h-screen overflow-hidden"
      )}
    >
      {/* Background grain texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')] opacity-50 pointer-events-none z-0" />

      {/* ─── Navigation overlay ─── */}
      {!isScrollMode && (
        <>
          <button onClick={prev} className="fixed left-0 top-0 bottom-0 w-20 z-40 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Previous slide">
            <ChevronLeft className="h-8 w-8 text-white/30" />
          </button>
          <button onClick={next} className="fixed right-0 top-0 bottom-0 w-20 z-40 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Next slide">
            <ChevronRight className="h-8 w-8 text-white/30" />
          </button>
        </>
      )}

      {/* ─── Bottom bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-between px-6 py-2.5">
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

          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            {slideLabels[currentSlide] && (
              <span className="text-zinc-400 font-medium hidden sm:inline">{slideLabels[currentSlide]}</span>
            )}
            <span className="font-mono">{String(currentSlide + 1).padStart(2, "0")}/{TOTAL_SLIDES}</span>
            <button onClick={() => setIsScrollMode((v) => !v)} className="hover:text-white/70 transition-colors border border-white/10 rounded-full px-3 py-0.5">
              {isScrollMode ? "Slides" : "Scroll"}
            </button>
            <button
              onClick={() => {
                const url = shareToken ? `${window.location.origin}/pitch?share=${shareToken}` : `${window.location.origin}/pitch`;
                navigator.clipboard.writeText(url);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="flex items-center gap-1 hover:text-white/70 transition-colors border border-white/10 rounded-full px-3 py-0.5"
            >
              <Link2 className="h-3 w-3" />
              {linkCopied ? "Copied!" : "Share"}
            </button>
            <button onClick={() => window.print()} className="hover:text-white/70 transition-colors border border-white/10 rounded-full px-3 py-0.5 hidden sm:inline">
              PDF
            </button>
            {shareToken && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/pitch?share=${shareToken}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 hover:text-white/70 transition-colors border border-white/10 rounded-full px-3 py-0.5 hidden sm:inline"
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
              {["$13.5K MRR", "85 Paying Teams", "1,200+ Users", "Zero Ad Spend"].map((s) => (
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
          </RevealText>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { stat: "68%", desc: "of employees paste confidential data into ChatGPT", source: "Cyberhaven 2024", icon: AlertTriangle, color: "text-red-400" },
              { stat: "$4.2M", desc: "average cost of a data breach involving AI tools", source: "IBM Security", icon: DollarSign, color: "text-amber-400" },
              { stat: "0%", desc: "of teams have prompt governance across all AI tools", source: "Market gap", icon: Shield, color: "text-purple-400" },
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
              Blocking ChatGPT doesn&apos;t work. 92% of employees find workarounds. — <span className="text-zinc-400">Gartner</span>
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
          SLIDE 5: WHY NOW
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(4)}>
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
                <p className="text-6xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">92%</p>
                <p className="text-sm text-zinc-400 mt-2">of enterprises will adopt AI governance tools by 2026</p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Gartner</p>
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
          SLIDE 6: COMPETITIVE EDGE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(5)}>
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
          SLIDE 7: BUSINESS MODEL
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(6)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Business Model</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Freemium SaaS.
              <br />
              <span className="text-zinc-400">Customers already paying.</span>
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
          SLIDE 8: TRACTION
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(7)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Traction</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Organic growth.
              <br />
              <span className="text-zinc-400">Zero ad spend.</span>
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <BigStat value="1,200+" label="Registered Users" sub="organic" />
              <BigStat value="85" label="Paying Teams" sub="avg 4 seats" />
              <BigStat value="$13.5K" label="MRR" sub="$162K ARR" />
              <BigStat value="4.8★" label="Chrome Store" />
              <BigStat value="<2%" label="Monthly Churn" />
            </div>
          </RevealText>

          <RevealText delay={400}>
            <GlowCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">MRR Growth — Organic, No Ad Spend</h3>
                <span className="text-xs text-zinc-500">$1.2K → $13.5K in 8 months</span>
              </div>
              {(() => {
                const data = [
                  { month: "M1", mrr: 1.2 }, { month: "M2", mrr: 1.7 }, { month: "M3", mrr: 2.4 },
                  { month: "M4", mrr: 3.4 }, { month: "M5", mrr: 4.7 }, { month: "M6", mrr: 6.6 },
                  { month: "M7", mrr: 8.5 }, { month: "Now", mrr: 13.5 },
                ];
                const W = 700, H = 200;
                const PAD = { top: 25, right: 15, bottom: 30, left: 45 };
                const cW = W - PAD.left - PAD.right;
                const cH = H - PAD.top - PAD.bottom;
                const yMax = 15;
                const yTicks = [0, 5, 10, 15];
                function x(i: number) { return PAD.left + (i / (data.length - 1)) * cW; }
                function y(v: number) { return PAD.top + cH - (v / yMax) * cH; }
                const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.mrr).toFixed(1)}`).join(" ");
                const area = line + ` L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                    {yTicks.map((t) => (
                      <g key={t}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                        <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" className="fill-zinc-500 text-[10px] font-mono">${t}K</text>
                      </g>
                    ))}
                    {data.map((d, i) => (
                      <text key={d.month} x={x(i)} y={H - 6} textAnchor="middle" className={cn("text-[10px] font-mono", i === data.length - 1 ? "fill-purple-400 font-bold" : "fill-zinc-500")}>{d.month}</text>
                    ))}
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={ACCENT} />
                        <stop offset="100%" stopColor={ACCENT_BLUE} />
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#lineGrad)" fillOpacity={0.08} />
                    <path d={line} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    {data.map((d, i) => (
                      <circle key={i} cx={x(i)} cy={y(d.mrr)} r={i === data.length - 1 ? 5 : 3} fill={i === data.length - 1 ? ACCENT : "rgba(124,58,237,0.5)"} />
                    ))}
                    <text x={x(data.length - 1) + 2} y={y(data[data.length - 1].mrr) - 10} textAnchor="middle" className="fill-purple-400 text-[11px] font-mono font-bold">${data[data.length - 1].mrr}K</text>
                  </svg>
                );
              })()}
            </GlowCard>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 9: ARCHITECTURE
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(8)}>
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
          SLIDE 10: TEAM
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(9)}>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Team</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Solo founder.
              <br />
              <span className="text-zinc-400">Full-stack execution.</span>
            </h2>
          </RevealText>

          <div className="grid sm:grid-cols-3 gap-6">
            <RevealText delay={200} className="sm:col-span-1">
              <GlowCard className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 mx-auto mb-4 flex items-center justify-center text-3xl font-black text-purple-400">KC</div>
                <h3 className="font-bold text-lg">Kade Cooper</h3>
                <p className="text-sm text-purple-400 font-medium">Founder & Solo Builder</p>
                <div className="mt-4 space-y-2 text-left">
                  {[
                    "UI/UX developer turned founder",
                    "Built entire platform with AI-assisted development",
                    "$0 to $13.5K MRR organically",
                    "Ships weekly, handles support",
                  ].map((item) => (
                    <div key={item} className="flex gap-2 items-start text-xs text-zinc-400">
                      <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </RevealText>

            <RevealText delay={350} className="sm:col-span-2 space-y-4">
              <GlowCard>
                <h4 className="font-bold text-sm mb-3">Why solo works here</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Zap, text: "Ships weekly — fast iteration" },
                    { icon: Users, text: "Close to every customer" },
                    { icon: DollarSign, text: "Capital efficient execution" },
                    { icon: Rocket, text: "Proven complex system delivery" },
                  ].map((item) => (
                    <div key={item.text} className="flex gap-2 items-start text-sm text-zinc-400">
                      <item.icon className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-xs">{item.text}</span>
                    </div>
                  ))}
                </div>
              </GlowCard>
              <GlowCard glow="blue">
                <h4 className="font-bold text-sm text-purple-400 mb-2">First hire (with funding)</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Part-time security engineer for enterprise features — SSO/SAML, SCIM, SOC 2 certification.
                </p>
              </GlowCard>
            </RevealText>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 11: THE ASK
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(10)}>
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
                    { label: "Revenue today", value: "Already generating MRR" },
                    { label: "97% gross margin", value: "Software-only, serverless" },
                    { label: "Product shipped", value: "Full platform live with paying customers" },
                    { label: "Capital efficient", value: "$100K funds 12–18 months" },
                    { label: "Clear path to seed", value: "$50K MRR → raise on strong metrics" },
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
          SLIDE 12: GROWTH PLAN
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(11)}>
        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <RevealText>
            <SlideLabel>Growth Plan</SlideLabel>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              18-Month Targets
            </h2>
          </RevealText>

          <RevealText delay={200}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { metric: "Registered Users", from: "1,200", to: "8,000+", icon: Users },
                { metric: "MRR", from: "$13.5K", to: "$50K", icon: TrendingUp },
                { metric: "Paying Teams", from: "85", to: "350+", icon: Building2 },
                { metric: "ARR Run Rate", from: "$162K", to: "$600K", icon: DollarSign },
              ].map((t) => (
                <GlowCard key={t.metric} className="text-center py-5">
                  <t.icon className="h-4 w-4 text-zinc-500 mx-auto mb-2" />
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2">{t.metric}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">{t.from}</span>
                    <ArrowRight className="h-3 w-3 text-purple-400" />
                    <span className="text-lg font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t.to}</span>
                  </div>
                </GlowCard>
              ))}
            </div>
          </RevealText>

          <RevealText delay={400}>
            <GlowCard>
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400 mb-6">Investor FAQ</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { q: "How do you compete with free?", a: "Free lacks DLP, compliance, and analytics. Teams pay for governance.", icon: Briefcase },
                  { q: "Why not raise more?", a: "$100K → 18 months to $50K MRR. Strong seed position.", icon: DollarSign },
                  { q: "Biggest risk?", a: "Execution — mitigated by 8 months of shipping and 40% MoM growth.", icon: AlertTriangle },
                  { q: "Can it scale solo?", a: "Serverless. Extension is client-side. 100K users with minimal cost.", icon: Server },
                  { q: "How defensible?", a: "5 AI tools, unique DOM integration, constant platform updates.", icon: Code2 },
                  { q: "Enterprise sales?", a: "Product-led: one person installs, team adopts, org upgrades.", icon: Building2 },
                ].map((faq) => (
                  <div key={faq.q} className="flex gap-3">
                    <faq.icon className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-zinc-300">{faq.q}</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </RevealText>

          <RevealText delay={500}>
            <p className="text-center text-sm text-zinc-500 font-mono">
              $50K MRR = $600K ARR → Strong seed round position
            </p>
          </RevealText>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE 13: VISION / CLOSING
      ═══════════════════════════════════════════════════════════ */}
      <div {...slideProps(12)}>
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
                &ldquo;I built this because I lived this problem.
                <br className="hidden sm:block" />
                Customers are already paying.
                <br className="hidden sm:block" />
                With <span className="text-purple-400 font-bold">$100K</span>, we accelerate what&apos;s already working.&rdquo;
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
