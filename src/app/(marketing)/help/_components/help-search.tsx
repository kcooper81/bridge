"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchHelpContent } from "@/lib/help-content";

export function HelpSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => (query.trim() ? searchHelpContent(query) : []),
    [query],
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search help articles..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-10 h-12 text-base rounded-xl"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-card shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.slice(0, 10).map(({ category, article }) => (
            <Link
              key={`${category.id}-${article.slug}`}
              href={`/help/${category.id}/${article.slug}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <span className="text-sm font-medium">{article.q}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                {category.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
