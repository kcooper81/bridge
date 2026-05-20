"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LeadCaptureForm() {
  const [email, setEmail] = useState("");
  // Honeypot: real users never see or fill this; bots that fill every
  // input get silently dropped server-side.
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: "",
          message: "Lead capture form submission — requesting demo/info.",
          subject: "Website Lead Capture",
          website, // honeypot
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Surface the failure instead of swallowing it as success — every
        // lead matters, and a silent fail used to mean lost demos.
        setError(data.error || "Couldn't submit right now. Try again or email sales@teamprompt.app.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Try again or email sales@teamprompt.app.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 sm:py-28 bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Want help getting set up?
        </h2>
        <p className="mt-4 text-lg text-zinc-400">
          Tell us where you are with AI today and we&apos;ll walk you through the right setup for your team. No demo gating, no pressure.
        </p>

        {submitted ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
            <p className="text-lg font-medium">Thank you! We&apos;ll be in touch.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Work email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-zinc-500 focus:border-blue-400 rounded-full px-5"
              />
              {/* Honeypot — invisible to humans, tab-skipped, autofill off. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{
                  position: "absolute",
                  left: "-9999px",
                  height: 0,
                  width: 0,
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="h-12 rounded-full px-8 font-semibold bg-white text-zinc-900 hover:bg-zinc-200 shrink-0"
              >
                {loading ? "Sending..." : "Request setup help"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}
          </>
        )}

        <p className="mt-4 text-sm text-zinc-500">
          Free for up to 3 members. No credit card required.
        </p>
      </div>
    </section>
  );
}
