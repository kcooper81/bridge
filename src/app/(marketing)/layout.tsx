"use client";

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
