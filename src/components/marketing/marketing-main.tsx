"use client";

import { usePathname } from "next/navigation";

/**
 * Tiny client wrapper that adds pt-16 on non-homepage marketing pages.
 * Homepage has a full-bleed hero that sits behind the transparent header.
 */
export function MarketingMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return <main className={isHomepage ? "" : "pt-16"}>{children}</main>;
}
