"use client";

import Link from "next/link";
import Image from "next/image";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.1) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Image src="/logo.svg" alt="TeamPrompt" width={32} height={32} className="dark:hidden" />
          <Image src="/logo-dark.svg" alt="TeamPrompt" width={32} height={32} className="hidden dark:block" />
        </Link>
        <h1 className="text-5xl font-bold text-foreground mb-4">Oops</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Something went wrong loading this page. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            Back to Home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
