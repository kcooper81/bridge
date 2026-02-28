"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Copy, Check } from "lucide-react";
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
  const [state, setState] = useState<State>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollData, setEnrollData] = useState<EnrollData | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  async function loadFactors() {
    setState("loading");
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === "verified");
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
    if (!confirm("Are you sure you want to disable two-factor authentication?")) return;

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

  function handleCancelEnroll() {
    // Unenroll the pending factor
    if (enrollData) {
      const supabase = createClient();
      supabase.auth.mfa.unenroll({ factorId: enrollData.factorId });
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10">
                Enabled
              </Badge>
              <span className="text-sm text-muted-foreground">
                Your account is protected with two-factor authentication.
              </span>
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
