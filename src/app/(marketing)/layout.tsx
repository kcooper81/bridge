"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Force light theme on marketing pages — app theme toggle should not affect marketing site
  useEffect(() => {
    const prev = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "light");
    return () => {
      // Restore previous theme when navigating away from marketing
      if (prev) document.documentElement.setAttribute("data-theme", prev);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className={isHomepage ? "" : "pt-16"}>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
