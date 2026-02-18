"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Gavel,
  HeartPulse,
  Landmark,
  Laptop,
  PiggyBank,
  Shield,
  Users,
  Zap,
} from "lucide-react";

const industries = [
  { label: "Healthcare", href: "/industries/healthcare", icon: HeartPulse },
  { label: "Legal", href: "/industries/legal", icon: Gavel },
  { label: "Technology", href: "/industries/technology", icon: Laptop },
  { label: "Finance", href: "/industries/finance", icon: PiggyBank },
  { label: "Government", href: "/industries/government", icon: Landmark },
];

const useCases = [
  { label: "Prompt Management", href: "/features", icon: Zap },
  { label: "Security & Compliance", href: "/security", icon: Shield },
  { label: "Team Collaboration", href: "/features#teams", icon: Users },
  { label: "Enterprise", href: "/enterprise", icon: Landmark },
];

export function SolutionsDropdown({
  textClass,
  activeTextClass,
}: {
  textClass: string;
  activeTextClass: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={cn(
          "text-sm font-medium transition-colors flex items-center gap-1",
          open ? activeTextClass : textClass
        )}
        onClick={() => setOpen(!open)}
      >
        Solutions
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
          <div className="w-[420px] rounded-xl border border-border bg-card shadow-xl shadow-black/10 p-4 grid grid-cols-2 gap-4">
            {/* By Industry */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                By Industry
              </p>
              <div className="space-y-0.5">
                {industries.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-primary/70" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* By Use Case */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                By Use Case
              </p>
              <div className="space-y-0.5">
                {useCases.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-primary/70" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Mobile Solutions accordion for Sheet menu */
export function MobileSolutionsMenu({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-1 w-full"
      >
        Solutions
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="ml-4 mt-2 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            By Industry
          </p>
          {industries.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-2">
            By Use Case
          </p>
          {useCases.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
