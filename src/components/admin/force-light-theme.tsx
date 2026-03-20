"use client";

import { useEffect } from "react";

/**
 * Forces light theme on admin pages — the app's dark mode toggle
 * should not affect the super admin panel.
 */
export function ForceLightTheme() {
  useEffect(() => {
    const prev = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "light");
    return () => {
      if (prev) document.documentElement.setAttribute("data-theme", prev);
    };
  }, []);

  return null;
}
