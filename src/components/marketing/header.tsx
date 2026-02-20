"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
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
    : "text-foreground/70 hover:text-foreground";

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

          <Link
            href="/help"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/help" ? activeTextClass : textClass
            )}
          >
            Help
          </Link>
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
                <Link
                  href="/help"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Help
                </Link>
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
