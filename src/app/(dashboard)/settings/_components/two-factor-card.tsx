"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, KeyRound, Loader2, ShieldCheck, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

type State = "loading" | "disabled" | "enrolling" | "enabled";

interface EnrollData {
  factorId: string;
  qr: string; // data URL
  secret: string;
  uri: string;
}

export function TwoFactorCard() {
  const confirm = useConfirm();
  const [state, setState] = useState<State>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollData, setEnrollData] = useState<EnrollData | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [recoveryRemaining, setRecoveryRemaining] = useState<number | null>(null);
  const [generatingCodes, setGeneratingCodes] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  useEffect(() => {
    if (state === "enabled") loadRecoveryStatus();
  }, [state]);

  async function loadRecoveryStatus() {
    try {
      const res = await fetch("/api/auth/mfa/recovery-codes");
      if (res.ok) {
        const data = await res.json();
        setRecoveryRemaining(data.remaining ?? 0);
      }
    } catch {
      // Non-fatal — recovery codes section just won't show count.
    }
  }

  async function handleGenerateRecoveryCodes() {
    if (recoveryRemaining && recoveryRemaining > 0) {
      const ok = await confirm({
        title: "Generate new recovery codes?",
        description: "This will invalidate your existing recovery codes immediately. Anyone who has them won't be able to use them to sign in.",
        confirmLabel: "Generate new codes",
      });
      if (!ok) return;
    }
    setGeneratingCodes(true);
    try {
      const res = await fetch("/api/auth/mfa/recovery-codes", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate codes");
        return;
      }
      setRecoveryCodes(data.codes);
      setRecoveryRemaining(data.codes.length);
      toast.success("Recovery codes generated — save them now");
    } finally {
      setGeneratingCodes(false);
    }
  }

  function downloadRecoveryCodes() {
    if (!recoveryCodes) return;
    const blob = new Blob(
      [
        `TeamPrompt MFA Recovery Codes\nGenerated: ${new Date().toISOString()}\n\nEach code is single-use. Keep these somewhere safe — they're your way back in if you lose your authenticator device.\n\n${recoveryCodes.join("\n")}\n`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teamprompt-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyRecoveryCodes() {
    if (!recoveryCodes) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success("Recovery codes copied to clipboard");
  }

  async function loadFactors() {
    setState("loading");
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f: { status: string; id: string }) => f.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setState("enabled");
    } else {
      setState("disabled");
    }
  }

  async function handleEnroll() {
    setError("");
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "TeamPrompt",
    });

    if (enrollError || !data) {
      toast.error(enrollError?.message || "Failed to start enrollment");
      return;
    }

    const qrDataUrl = await QRCode.toDataURL(data.totp.uri);
    setEnrollData({
      factorId: data.id,
      qr: qrDataUrl,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
    setState("enrolling");
  }

  async function handleVerifyEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollData) return;
    setError("");
    setVerifying(true);

    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: enrollData.factorId });

      if (challengeError) {
        setError(challengeError.message);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      setFactorId(enrollData.factorId);
      setEnrollData(null);
      setCode("");
      setState("enabled");
      toast.success("Two-factor authentication enabled");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDisable() {
    if (!factorId) return;
    const ok = await confirm({
      title: "Disable two-factor authentication?",
      description: "Your account will be less secure. Anyone with your password will be able to sign in without a second factor.",
      confirmLabel: "Disable 2FA",
      variant: "destructive",
    });
    if (!ok) return;

    setDisabling(true);
    try {
      const supabase = createClient();
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (unenrollError) {
        toast.error(unenrollError.message);
        return;
      }

      setFactorId(null);
      setState("disabled");
      toast.success("Two-factor authentication disabled");
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setDisabling(false);
    }
  }

  function handleCopySecret() {
    if (!enrollData) return;
    navigator.clipboard.writeText(enrollData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCancelEnroll() {
    // Unenroll the pending factor
    if (enrollData) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: enrollData.factorId });
    }
    setEnrollData(null);
    setCode("");
    setError("");
    setState("disabled");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state === "loading" && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )}

        {state === "disabled" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account by requiring a verification code from your authenticator app when signing in.
            </p>
            <Button onClick={handleEnroll}>Enable Two-Factor Authentication</Button>
          </div>
        )}

        {state === "enrolling" && enrollData && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter the 6-digit code below to verify.
            </p>

            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enrollData.qr} alt="TOTP QR Code" className="rounded-lg border" width={200} height={200} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Manual entry key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
                  {enrollData.secret}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopySecret}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyEnrollment} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="totp-verify">Verification Code</Label>
                <Input
                  id="totp-verify"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  autoComplete="one-time-code"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={verifying || code.length !== 6}>
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancelEnroll}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {state === "enabled" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 hover:bg-emerald-500/10">
                Enabled
              </Badge>
              <span className="text-sm text-muted-foreground">
                Your account is protected with two-factor authentication.
              </span>
            </div>

            {/* Recovery codes section — visible once 2FA is on */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <KeyRound className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Recovery codes</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Single-use codes that let you sign in if you lose access to your authenticator device. Each is consumed when used.
                  </p>
                  {recoveryRemaining !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {recoveryRemaining > 0
                        ? `${recoveryRemaining} unused recovery code${recoveryRemaining === 1 ? "" : "s"} on file.`
                        : "No recovery codes generated yet. We strongly recommend generating a set now."}
                    </p>
                  )}
                </div>
              </div>

              {recoveryCodes ? (
                <div className="space-y-2">
                  <div className="rounded-md bg-background border border-border p-3 grid grid-cols-2 gap-1.5 text-xs font-mono">
                    {recoveryCodes.map((c) => (
                      <code key={c} className="select-all">{c}</code>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Save these now — we won&apos;t show them again.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyRecoveryCodes}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadRecoveryCodes}>
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Download .txt
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRecoveryCodes(null)}>
                      I&apos;ve saved them
                    </Button>
                  </div>
                </div>
              ) : recoveryRemaining === 0 ? (
                <div className="space-y-2">
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                    You have no recovery codes. If you lose your authenticator device,
                    you&apos;ll be locked out of your account. Generate a set now and store
                    them somewhere safe.
                  </div>
                  <Button size="sm" onClick={handleGenerateRecoveryCodes} disabled={generatingCodes}>
                    {generatingCodes && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    Generate recovery codes
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={handleGenerateRecoveryCodes} disabled={generatingCodes}>
                  {generatingCodes && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                  Regenerate codes
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={handleDisable} disabled={disabling}>
              {disabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
