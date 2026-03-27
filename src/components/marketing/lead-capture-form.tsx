"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LeadCaptureForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      // POST to contact API
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: "",
          message: "Lead capture form submission — requesting demo/info.",
          subject: "Website Lead Capture",
        }),
      });
      setSubmitted(true);
    } catch {
      // Still show success to avoid friction
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 sm:py-28 bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Ready to secure your team&apos;s AI usage?
        </h2>
        <p className="mt-4 text-lg text-zinc-400">
          Drop your email and we&apos;ll get you set up with TeamPrompt.
        </p>

        {submitted ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
            <p className="text-lg font-medium">Thank you! We&apos;ll be in touch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Work email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-zinc-500 focus:border-blue-400 rounded-full px-5"
            />
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 rounded-full px-8 font-semibold bg-white text-zinc-900 hover:bg-zinc-200 shrink-0"
            >
              {loading ? "Sending..." : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        <p className="mt-4 text-sm text-zinc-500">
          Free for up to 3 members. No credit card required.
        </p>
      </div>
    </section>
  );
}
