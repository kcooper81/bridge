import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { GA4RouteTracker } from "@/components/analytics/ga4";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-83VRNN79X8";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TeamPrompt - AI Prompt Management for Teams",
    template: "%s | TeamPrompt",
  },
  description:
    "TeamPrompt gives your team a shared prompt library, quality guidelines, and security guardrails — so the best prompts get reused, not reinvented.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "TeamPrompt",
    title: "TeamPrompt - AI Prompt Management for Teams",
    description:
      "TeamPrompt gives your team a shared prompt library, quality guidelines, and security guardrails — so the best prompts get reused, not reinvented.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeamPrompt - AI Prompt Management for Teams",
    description:
      "TeamPrompt gives your team a shared prompt library, quality guidelines, and security guardrails.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('teamprompt-theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: false });
          `}
        </Script>
        <Suspense fallback={null}>
          <GA4RouteTracker />
        </Suspense>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(var(--elevated))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            },
          }}
        />
      </body>
    </html>
  );
}
