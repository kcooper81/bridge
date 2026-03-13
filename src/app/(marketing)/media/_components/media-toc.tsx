"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const TOC_ITEMS = [
  { id: "logos", label: "Logos" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "brand-guidelines", label: "Brand Guidelines" },
  { id: "product-info", label: "Product Info" },
  { id: "social-banners", label: "Social Banners" },
  { id: "og-cards", label: "OG Cards" },
  { id: "extension-assets", label: "Extension Assets" },
  { id: "store-copy", label: "Store Copy" },
  { id: "linkedin-campaign", label: "LinkedIn Ads" },
  { id: "positioning", label: "Positioning" },
  { id: "contact", label: "Contact" },
];

export function MediaTOC() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible section from the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    TOC_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden xl:block fixed top-32 right-8 w-44 z-30">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        On this page
      </p>
      <ul className="space-y-1 border-l border-border">
        {TOC_ITEMS.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "block pl-3 py-1 text-xs transition-colors border-l-2 -ml-px",
                activeId === id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
