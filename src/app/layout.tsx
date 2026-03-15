import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorReporter } from "@/components/providers/error-reporter";
import { GA4RouteTracker } from "@/components/analytics/ga4";
import { AuthEventTracker } from "@/components/analytics/auth-event-tracker";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-83VRNN79X8";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "TeamPrompt - AI Data Loss Prevention for ChatGPT & AI Tools",
    template: "%s | TeamPrompt",
  },
  description:
    "Monitor, detect, and block sensitive data before employees send it to AI. TeamPrompt gives your team DLP protection, a shared prompt library, and full audit logging.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "TeamPrompt",
    title: "TeamPrompt - AI Data Loss Prevention for ChatGPT & AI Tools",
    description:
      "Monitor, detect, and block sensitive data before employees send it to AI. DLP protection, shared prompt library, and audit logging for teams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeamPrompt - AI Data Loss Prevention for ChatGPT & AI Tools",
    description:
      "Monitor, detect, and block sensitive data before employees send it to AI. DLP + prompt management for teams.",
    site: "@teampromptapp",
    creator: "@teampromptapp",
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
        <link rel="apple-touch-icon" href="/brand/logo-icon-blue.svg" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
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
        {/* LinkedIn Insight Tag — deferred to avoid blocking interactivity */}
        <Script id="linkedin-partner" strategy="lazyOnload">
          {`
            _linkedin_partner_id = "8806306";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          `}
        </Script>
        <Script id="linkedin-insight" strategy="lazyOnload">
          {`
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} alt="" src="https://px.ads.linkedin.com/collect/?pid=8806306&fmt=gif" />
        </noscript>
        <Suspense fallback={null}>
          <GA4RouteTracker />
          <AuthEventTracker />
        </Suspense>
        <ThemeProvider>
          <ErrorReporter>
            {children}
          </ErrorReporter>
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
