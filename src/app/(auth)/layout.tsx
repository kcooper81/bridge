import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Radial gradient background effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 flex items-center gap-2 mb-8 text-2xl font-bold text-foreground"
      >
        <Image src="/logo.svg" alt="TeamPrompt" width={32} height={32} className="rounded-lg" />
        TeamPrompt
      </Link>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} TeamPrompt. All rights reserved.
      </p>
    </div>
  );
}
