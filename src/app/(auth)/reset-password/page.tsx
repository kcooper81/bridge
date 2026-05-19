"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Synchronous early-fail: if the URL hash doesn't even claim to be a
    // recovery, the long auth-state wait below is wasted. The Supabase
    // recovery flow always sets `#type=recovery` in the hash before the
    // SDK processes it.
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      if (hash && !hash.includes("type=recovery")) {
        setSessionValid(false);
        return;
      }
    }

    const supabase = createClient();

    // Only accept PASSWORD_RECOVERY events — NOT regular SIGNED_IN.
    // A logged-in user navigating here must not be able to reset their
    // password without the recovery token from their email link.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionValid(true);
        }
      }
    );

    // Network-blip safety net. The recovery hash exchange normally
    // completes in <1s; 20s was way too long for the (common) bad-link case.
    const timeout = setTimeout(() => {
      setSessionValid((prev) => (prev === null ? false : prev));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      // Route through the server so the recovery-session check actually runs.
      // The bare client `supabase.auth.updateUser({ password })` works for any
      // authenticated session, not just recovery ones — so a signed-in user
      // landing on this page from a forged URL would have been able to change
      // their own password silently.
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to update password");
        return;
      }

      toast.success("Password updated successfully");
      window.location.href = "/vault";
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (sessionValid === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-destructive">Invalid Reset Link</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 10 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={10}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </form>
    </>
  );
}
