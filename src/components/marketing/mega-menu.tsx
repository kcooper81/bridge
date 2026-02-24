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
  { label: "Healthcare", description: "HIPAA-ready AI workflows", href: "/industries/healthcare", icon: HeartPulse, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { label: "Legal", description: "Confidential prompt governance", href: "/industries/legal", icon: Gavel, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Technology", description: "Ship faster with shared prompts", href: "/industries/technology", icon: Laptop, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Finance", description: "Compliant AI for financial teams", href: "/industries/finance", icon: PiggyBank, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { label: "Government", description: "Secure AI for public sector", href: "/industries/government", icon: Landmark, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
];

const useCases = [
  { label: "Prompt Management", description: "Organize and version prompts", href: "/features", icon: Zap, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  { label: "Security & Compliance", description: "Guardrails and audit trails", href: "/security", icon: Shield, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { label: "Team Collaboration", description: "Share prompts across teams", href: "/features#teams", icon: Users, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { label: "Enterprise", description: "SSO, roles, and analytics", href: "/enterprise", icon: Landmark, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
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
          <div className="w-[520px] rounded-xl border border-border bg-card shadow-xl shadow-black/10 p-5">
            <div className="grid grid-cols-2 gap-6">
              {/* By Industry */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-2">
                  By Industry
                </p>
                <div className="space-y-1">
                  {industries.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", item.color)}>
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* By Use Case */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-2">
                  By Use Case
                </p>
                <div className="space-y-1">
                  {useCases.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", item.color)}>
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link
                href="/solutions"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors py-1"
              >
                See all solutions
                <span aria-hidden="true">&rarr;</span>
              </Link>
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
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0", item.color)}>
                <item.icon className="h-3.5 w-3.5" />
              </span>
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
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0", item.color)}>
                <item.icon className="h-3.5 w-3.5" />
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
