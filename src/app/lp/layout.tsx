import Link from "next/link";

export default function LPLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header — just logo, no navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <img src="/brand/logo-icon-blue.svg" alt="TeamPrompt" className="h-7 w-7" />
          <span className="font-semibold text-foreground">TeamPrompt</span>
        </Link>
      </div>
      <main className="pt-16">{children}</main>
    </div>
  );
}
