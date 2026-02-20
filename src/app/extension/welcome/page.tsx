"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Puzzle, Shield, Zap, MessageSquare } from "lucide-react";

type AuthMode = "signin" | "signup";

/** Push session data to the auth-bridge content script via postMessage */
function notifyExtension(session: {
  access_token: string;
  refresh_token: string;
  user: unknown;
}) {
  window.postMessage(
    {
      type: "TP_SESSION_READY",
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: session.user,
    },
    window.location.origin
  );
}

function ExtensionWelcomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "signin" ? "signin" : "signup"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const oauthTriggered = useRef(false);
  const notified = useRef(false);

  // Show a loading spinner while waiting for session after OAuth redirect
  const isReturningFromAuth =
    searchParams.get("auth") === "success" || !!searchParams.get("provider");
  const [checking, setChecking] = useState(isReturningFromAuth);

  const redirectAfterAuth = "/extension/welcome?auth=success";

  // Helper: start OAuth flow using the Supabase JS client (proper PKCE)
  function startOAuth(provider: "google" | "github") {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectAfterAuth)}`,
      },
    });
  }

  /** Notify extension and transition to success state (idempotent) */
  function handleAuthSuccess(session: {
    access_token: string;
    refresh_token: string;
    user: unknown;
  }) {
    if (notified.current) return;
    notified.current = true;
    notifyExtension(session);
    setAuthSuccess(true);
    setChecking(false);
  }

  // On mount: check for existing session OR listen for auth state changes.
  // Also handle ?provider= auto-trigger from extension popup OAuth buttons.
  useEffect(() => {
    // Auto-trigger OAuth if ?provider= is present (extension popup routed here)
    const provider = searchParams.get("provider") as
      | "google"
      | "github"
      | null;
    if (
      provider &&
      (provider === "google" || provider === "github") &&
      !oauthTriggered.current
    ) {
      oauthTriggered.current = true;
      startOAuth(provider);
      return;
    }

    const supabase = createClient();

    // Listen for auth state changes — catches delayed session establishment
    // after OAuth redirect (e.g. when getSession() hasn't resolved yet).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handleAuthSuccess(session);
    });

    // Also check immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthSuccess(session);
      } else {
        // If no session found after 3s, stop the loading spinner
        setTimeout(() => setChecking(false), 3000);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-redirect to vault after successful auth
  useEffect(() => {
    if (!authSuccess) return;
    const timer = setTimeout(() => router.push("/vault"), 2500);
    return () => clearTimeout(timer);
  }, [authSuccess, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectAfterAuth)}`,
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (data.user && data.user.identities?.length === 0) {
          setError(
            "An account with this email already exists. Try signing in."
          );
          return;
        }
        setEmailSent(true);
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        if (data.session) {
          handleAuthSuccess(data.session);
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Loading state while checking auth after OAuth redirect
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Connecting your account&hellip;
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (authSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-7 w-7 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">You&apos;re all set!</h1>
            <p className="mt-2 text-muted-foreground">
              Your TeamPrompt extension is now connected. Redirecting to your
              dashboard&hellip;
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Taking you to your dashboard
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Or <Link href="/vault" className="underline">click here</Link> if
              you&apos;re not redirected, or close this tab and use the extension
              directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Email confirmation sent
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Click the
              link to activate your account and connect the extension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2 mb-6 text-2xl font-bold text-foreground">
        <Image
          src="/logo.svg"
          alt="TeamPrompt"
          width={32}
          height={32}
          className="rounded-lg dark:hidden"
        />
        <Image
          src="/logo-dark.svg"
          alt="TeamPrompt"
          width={32}
          height={32}
          className="rounded-lg hidden dark:block"
        />
        TeamPrompt
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Extension info card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Puzzle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Extension Installed!</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to connect your prompt library
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">
                Insert prompts into any AI tool
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">
                Scan for sensitive data before sending
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <MessageSquare className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">
                Log conversations for compliance
              </p>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => startOAuth("google")}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => startOAuth("github")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-xs text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-lg bg-muted/50 p-1 mb-4">
            <button
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              Create Account
            </button>
            <button
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => {
                setMode("signin");
                setError("");
              }}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={mode === "signup"}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={
                  mode === "signup"
                    ? "At least 6 characters"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create Account" : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} TeamPrompt. All rights reserved.
      </p>
    </div>
  );
}

export default function ExtensionWelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ExtensionWelcomeContent />
    </Suspense>
  );
}
