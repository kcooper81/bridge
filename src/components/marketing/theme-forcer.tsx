"use client";

import { useEffect } from "react";

/**
 * Tiny client component that forces light theme on marketing pages.
 * Extracted from the marketing layout so the layout itself can be a server component.
 */
export function MarketingThemeForcer() {
  useEffect(() => {
    const prev = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "light");
    return () => {
      if (prev) document.documentElement.setAttribute("data-theme", prev);
    };
  }, []);

  return null;
}
