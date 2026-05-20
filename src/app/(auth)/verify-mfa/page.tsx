"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";

type Mode = "totp" | "recovery";

export default function VerifyMfaPage() {
  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/vault";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/vault";

  useEffect(() => {
    async function loadFactor() {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.find((f: { status: string; id: string }) => f.status === "verified");
      if (!totp) {
        window.location.href = "/home?error=no_mfa_factor";
        return;
      }
      setFactorId(totp.id);
      setInitializing(false);
    }
    loadFactor();
  }, [redirectTo]);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setCode("");
    setRecoveryCode("");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) {
        setError(challengeError.message);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/mfa/recovery-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: recoveryCode.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        valid?: boolean;
        unenrolled?: boolean;
        error?: string;
      };

      if (!res.ok || !data.valid) {
        setError(data.error || "Invalid or already-used code");
        return;
      }

      if (data.unenrolled === false) {
        setError(
          "Code accepted, but we couldn't reset your authenticator automatically. Contact support to finish recovery."
        );
        return;
      }

      window.location.href = `/home?mfa_reset=1`;
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mode === "recovery") {
    return (
      <>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
            <KeyRound className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold">Use a recovery code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lost access to your authenticator app? Enter one of the one-time codes you saved
            when you set up two-factor authentication.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRecovery} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-code">Recovery code</Label>
            <Input
              id="recovery-code"
              type="text"
              placeholder="XXXXX-XXXXX"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              autoFocus
              autoComplete="one-time-code"
              required
              className="font-mono tracking-wider"
            />
            <p className="text-xs text-muted-foreground">
              Each code works once. After you sign in, two-factor authentication will be
              removed from your account so you can re-enroll a new device.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading || recoveryCode.length < 10}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify and sign in
          </Button>
        </form>

        <button
          type="button"
          onClick={() => switchMode("totp")}
          className="mt-6 inline-flex items-center text-sm text-primary hover:underline mx-auto block"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to authenticator code
        </button>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Two-Factor Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Verification Code</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
            autoComplete="one-time-code"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </form>

      <button
        type="button"
        onClick={() => switchMode("recovery")}
        className="mt-6 text-sm text-primary hover:underline mx-auto block"
      >
        Lost access to your authenticator? Use a recovery code
      </button>
    </>
  );
}
