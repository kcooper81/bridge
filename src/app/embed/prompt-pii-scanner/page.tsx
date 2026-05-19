import type { Metadata } from "next";
import { PromptPiiScanner } from "@/app/(marketing)/tools/prompt-pii-scanner/_components/scanner";

export const metadata: Metadata = {
  title: "Prompt PII Scanner",
  description: "Free client-side scanner for sensitive data in AI prompts. Powered by TeamPrompt.",
  robots: { index: false, follow: false },
};

export default function PromptPiiScannerEmbedPage() {
  return (
    <main className="min-h-screen bg-background p-3 sm:p-4">
      <PromptPiiScanner embedMode />
    </main>
  );
}
