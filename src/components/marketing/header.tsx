"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  ArrowRight,
  Menu,
  ChevronDown,
  BookOpen,
  MessageSquare,
  PenLine,
  Shield,
  Lock,
  FileSearch,
  ClipboardList,
  Eye,
  Zap,
  HeartPulse,
  Gavel,
  Laptop,
  PiggyBank,
  Landmark,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

export function MarketingHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerBg = scrolled
    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
    : "bg-background border-b border-border";

  const textClass = "text-foreground/70 hover:text-foreground";
  const activeTextClass = "text-foreground";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        headerBg
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
          <span className="text-lg font-bold text-foreground">
            TeamPrompt
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/features"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/features" ? activeTextClass : textClass
            )}
          >
            Platform
          </Link>

          <UseCasesDropdown textClass={textClass} activeTextClass={activeTextClass} />

          <SolutionsDropdown textClass={textClass} activeTextClass={activeTextClass} />

          <Link
            href="/pricing"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/pricing" ? activeTextClass : textClass
            )}
          >
            Pricing
          </Link>

          <ResourcesDropdown
            textClass={textClass}
            activeTextClass={activeTextClass}
          />
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={cn("text-sm font-medium transition-colors", textClass)}
          >
            Log in
          </Link>
          <Link href="/signup">
            <Button
              size="default"
              className="rounded-full px-6 font-semibold"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/features"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Platform
                </Link>

                <MobileAccordion title="Use Cases" onNavigate={() => setMobileOpen(false)} items={useCaseItems} />
                <MobileAccordion title="Solutions" onNavigate={() => setMobileOpen(false)} items={solutionItems} />

                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Pricing
                </Link>

                <MobileAccordion title="Resources" onNavigate={() => setMobileOpen(false)} items={resourceItems} />

                <div className="border-t border-border pt-4 mt-4 flex flex-col gap-3">
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-full">Get Started</Button>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ── Data ────────────────────── */

const useCaseItems = [
  { label: "Teams & Employees", desc: "Enable AI without the risk.", href: "/features", icon: Zap, bg: "bg-blue-500/10" },
  { label: "Enterprise", desc: "Auto-deploy across your organization.", href: "/enterprise", icon: Shield, bg: "bg-violet-500/10" },
  { label: "Healthcare", desc: "HIPAA-ready AI workflows.", href: "/industries/healthcare", icon: HeartPulse, bg: "bg-rose-500/10" },
  { label: "Legal", desc: "Confidential prompt governance.", href: "/industries/legal", icon: Gavel, bg: "bg-amber-500/10" },
  { label: "Finance", desc: "Compliant AI for financial teams.", href: "/industries/finance", icon: PiggyBank, bg: "bg-emerald-500/10" },
  { label: "Technology", desc: "Ship faster with shared prompts.", href: "/industries/technology", icon: Laptop, bg: "bg-blue-500/10" },
  { label: "Government", desc: "Secure AI for public sector.", href: "/industries/government", icon: Landmark, bg: "bg-violet-500/10" },
  { label: "Education", desc: "FERPA-safe AI for institutions.", href: "/industries/education", icon: GraduationCap, bg: "bg-orange-500/10" },
];

const solutionItems = [
  { label: "Shadow AI Analysis", desc: "Discover how AI is actually used.", href: "/security", icon: Eye, bg: "bg-violet-500/10" },
  { label: "Leakage Prevention", desc: "Block sensitive data in real time.", href: "/security", icon: Lock, bg: "bg-red-500/10" },
  { label: "Maintaining Compliance", desc: "19 frameworks, one-click enable.", href: "/features#compliance-policy-packs", icon: FileSearch, bg: "bg-emerald-500/10" },
  { label: "Prompt Library", desc: "Organize and share prompt collections.", href: "/features#prompt-library", icon: ClipboardList, bg: "bg-blue-500/10" },
  { label: "Browser Extension", desc: "Works inside ChatGPT, Claude & more.", href: "/extensions", icon: ShieldCheck, bg: "bg-teal-500/10" },
];

const resourceItems = [
  { label: "Documentation", desc: "Guides & articles.", href: "/help", icon: BookOpen, bg: "bg-blue-500/10" },
  { label: "Blog", desc: "Tips, insights & research.", href: "/blog", icon: PenLine, bg: "bg-amber-500/10" },
  { label: "Contact", desc: "Get in touch.", href: "/contact", icon: MessageSquare, bg: "bg-emerald-500/10" },
];

/* ── Reusable desktop dropdown ────────────────────── */

function NavDropdown({
  label,
  items,
  textClass,
  activeTextClass,
  wide = false,
  showPromo = false,
}: {
  label: string;
  items: typeof useCaseItems;
  textClass: string;
  activeTextClass: string;
  wide?: boolean;
  showPromo?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => setOpen(false), 150);
      }}
    >
      <button
        className={cn(
          "text-sm font-medium transition-colors flex items-center gap-1",
          open ? activeTextClass : textClass
        )}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
          <div className={cn(
            "rounded-xl border border-border bg-card shadow-xl shadow-black/10 overflow-hidden",
            showPromo
              ? wide ? "w-[620px]" : "w-[440px]"
              : wide ? "w-[480px] p-3" : "w-72 p-3"
          )}>
            <div className={showPromo ? "flex" : ""}>
              {/* Nav links */}
              <div className={cn(
                showPromo ? "flex-1 p-3" : "",
                wide ? "grid grid-cols-2 gap-1" : "space-y-1"
              )}>
                {items.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-foreground/50 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Promo column */}
              {showPromo && (
                <div className="w-[200px] border-l border-border p-4 flex flex-col justify-between" style={{ background: "linear-gradient(180deg, #F6F2FF 0%, #F1F8FF 100%)" }}>
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-primary mb-1">AI WorkOS</p>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      Two layers of AI protection for your team
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Network-level tool control + content-level DLP scanning. Free to start.
                    </p>
                  </div>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UseCasesDropdown({ textClass, activeTextClass }: { textClass: string; activeTextClass: string }) {
  return <NavDropdown label="Use Cases" items={useCaseItems} textClass={textClass} activeTextClass={activeTextClass} wide showPromo />;
}

function SolutionsDropdown({ textClass, activeTextClass }: { textClass: string; activeTextClass: string }) {
  return <NavDropdown label="Solutions" items={solutionItems} textClass={textClass} activeTextClass={activeTextClass} wide showPromo />;
}

function ResourcesDropdown({ textClass, activeTextClass }: { textClass: string; activeTextClass: string }) {
  return <NavDropdown label="Resources" items={resourceItems} textClass={textClass} activeTextClass={activeTextClass} />;
}

/* ── Mobile accordion ────────────────────── */

function MobileAccordion({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: typeof useCaseItems;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-1 w-full"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="ml-4 mt-2 space-y-3">
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              <item.icon className="h-4 w-4 text-foreground/50 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
