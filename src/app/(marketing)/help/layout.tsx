"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HelpSidebar } from "./_components/help-sidebar";
import { usePathname } from "next/navigation";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  // Only show sidebar on sub-pages (category / article), not the help index
  const isIndex = pathname === "/help";

  if (isIndex) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex gap-8 py-10 sm:py-16">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border bg-card">
            <HelpSidebar />
          </div>
        </aside>

        {/* Mobile sidebar trigger */}
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open help navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetTitle className="px-4 pt-4">Help Navigation</SheetTitle>
              <HelpSidebar onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
