import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { PitchDeck } from "./_components/pitch-deck";

export const metadata: Metadata = generatePageMetadata({
  title: "Investor Pitch — TeamPrompt",
  description: "TeamPrompt investor pitch deck. The Git for AI Prompts.",
  path: "/pitch",
  noIndex: true,
});

export default function PitchPage() {
  const shareToken = process.env.PITCH_SHARE_TOKEN ?? "";
  return <PitchDeck shareToken={shareToken} />;
}
