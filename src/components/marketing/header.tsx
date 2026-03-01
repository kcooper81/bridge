"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, BookOpen, MessageSquare } from "lucide-react";
import { SolutionsDropdown, MobileSolutionsMenu } from "./mega-menu";

export function MarketingHeader() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
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
    : isHomepage
      ? "bg-transparent"
      : "bg-background border-b border-border";

  const textClass = isHomepage && !scrolled
    ? "text-zinc-300 hover:text-white"
    : "text-foreground/90 hover:text-foreground";

  const activeTextClass = isHomepage && !scrolled
    ? "text-white"
    : "text-foreground";

  const logoTextClass = isHomepage && !scrolled
    ? "text-white"
    : "text-foreground";

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
          <Image src={isHomepage && !scrolled ? "/logo-dark.svg" : "/logo.svg"} alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
          <span className={cn("text-lg font-bold transition-colors", logoTextClass)}>
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
            Features
          </Link>

          <SolutionsDropdown
            textClass={textClass}
            activeTextClass={activeTextClass}
          />

          <Link
            href="/pricing"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/pricing" ? activeTextClass : textClass
            )}
          >
            Pricing
          </Link>

          <Link
            href="/integrations"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/integrations" ? activeTextClass : textClass
            )}
          >
            Integrations
          </Link>

          <Link
            href="/security"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/security" ? activeTextClass : textClass
            )}
          >
            Guardrails
          </Link>

          <HelpDropdown
            textClass={textClass}
            activeTextClass={activeTextClass}
            pathname={pathname}
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
              <Button
                variant="ghost"
                size="icon"
                className={isHomepage && !scrolled ? "text-white hover:bg-white/10" : ""}
              >
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
                  Features
                </Link>

                <MobileSolutionsMenu onNavigate={() => setMobileOpen(false)} />

                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/integrations"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Integrations
                </Link>
                <Link
                  href="/security"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Guardrails
                </Link>
                <MobileHelpMenu onNavigate={() => setMobileOpen(false)} />
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

/* ── Help dropdown (desktop) ────────────────────── */

function HelpDropdown({
  textClass,
  activeTextClass,
  pathname,
}: {
  textClass: string;
  activeTextClass: string;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isActive = pathname === "/help" || pathname.startsWith("/help/") || pathname === "/contact";

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
          open || isActive ? activeTextClass : textClass
        )}
        onClick={() => setOpen(!open)}
      >
        Help
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 pt-3 z-50">
          <div className="w-52 rounded-xl border border-border bg-card shadow-xl shadow-black/10 p-2">
            <Link
              href="/help"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                <BookOpen className="h-4 w-4 text-foreground/70" />
              </span>
              <div>
                <p className="text-sm font-medium">Documentation</p>
                <p className="text-xs text-muted-foreground">Guides & articles</p>
              </div>
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                <MessageSquare className="h-4 w-4 text-foreground/70" />
              </span>
              <div>
                <p className="text-sm font-medium">Contact</p>
                <p className="text-xs text-muted-foreground">Get in touch</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Help accordion (mobile) ────────────────────── */

function MobileHelpMenu({ onNavigate }: { onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-1 w-full"
      >
        Help
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="ml-4 mt-2 space-y-3">
          <Link
            href="/help"
            onClick={onNavigate}
            className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-foreground/70" />
            </span>
            Documentation
          </Link>
          <Link
            href="/contact"
            onClick={onNavigate}
            className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-foreground/70" />
            </span>
            Contact
          </Link>
        </div>
      )}
    </div>
  );
}
