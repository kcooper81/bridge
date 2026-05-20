import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
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
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </Link>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-3">
            Or try one of these
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Blog", href: "/blog" },
              { label: "Pricing", href: "/pricing" },
              { label: "Prompt PII Scanner", href: "/tools/prompt-pii-scanner" },
              { label: "AI Glossary", href: "/glossary" },
              { label: "Compare", href: "/compare" },
              { label: "Help", href: "/help" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-foreground/80 hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
