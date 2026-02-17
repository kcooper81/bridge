import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TeamPrompt - AI Prompt Vault & Context Bridge",
    template: "%s | TeamPrompt",
  },
  description:
    "Manage, share, and secure your team's AI prompts. Built-in quality standards, AI Security Shield, and seamless Chrome extension for 15+ AI tools.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "TeamPrompt",
    title: "TeamPrompt - AI Prompt Vault & Context Bridge",
    description:
      "Manage, share, and secure your team's AI prompts. Built-in quality standards, AI Security Shield, and seamless Chrome extension for 15+ AI tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeamPrompt - AI Prompt Vault & Context Bridge",
    description:
      "Manage, share, and secure your team's AI prompts with built-in quality standards and security.",
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
    <html lang="en">
      <body className={inter.className}>
        {children}
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
