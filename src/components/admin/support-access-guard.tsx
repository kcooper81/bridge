"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DEFAULT_SUPPORT_PAGES } from "@/lib/constants";

/**
 * Client-side guard that redirects support staff away from pages they don't have access to.
 * Rendered only for support users.
 */
export function SupportAccessGuard({ allowedPages }: { allowedPages: string[] }) {
  const pathname = usePathname();
  const router = useRouter();

  const pages = allowedPages.length > 0 ? allowedPages : DEFAULT_SUPPORT_PAGES;

  useEffect(() => {
    if (!pathname.startsWith("/admin")) return;

    const isAllowed = pages.some(
      (page) => pathname === page || pathname.startsWith(page + "/")
    );

    // Allow /admin exactly (redirect to first allowed page)
    if (pathname === "/admin") {
      router.replace(pages[0] || "/admin/tickets");
      return;
    }

    if (!isAllowed) {
      router.replace(pages[0] || "/admin/tickets");
    }
  }, [pathname, pages, router]);

  return null;
}
