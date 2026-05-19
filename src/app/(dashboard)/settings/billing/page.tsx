"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Download, FileText, Loader2, CreditCard, ArrowUpRight, CheckCircle2, X } from "lucide-react";
import { PLAN_DISPLAY } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import type { PlanTier } from "@/lib/types";
import type { BillingInterval } from "@/lib/billing/plans";

export default function BillingPage() {
  const { org, members, currentUserRole } = useOrg();
  const { subscription } = useSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  interface InvoiceRow {
    id: string;
    number: string | null;
    amount_paid: number;
    amount_due: number;
    currency: string;
    status: string | null;
    hosted_invoice_url: string | null;
    invoice_pdf: string | null;
    created: number;
  }
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    if (!subscription?.stripe_customer_id || currentUserRole !== "admin") return;
    let cancelled = false;
    (async () => {
      setLoadingInvoices(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch("/api/stripe/invoices", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setInvoices(data.invoices || []);
      } finally {
        if (!cancelled) setLoadingInvoices(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subscription?.stripe_customer_id, currentUserRole]);

  // Handle checkout success redirect
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const plan = searchParams.get("plan") || "your new plan";
      const sessionId = searchParams.get("session_id") || undefined;
      trackPurchase(plan, sessionId);
      toast.success(`Welcome to ${plan}! Your upgrade is active.`);
      router.replace("/settings/billing");
    }
  }, [searchParams, router]);

  // Handle pending plan from signup/login flow
  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam && !searchParams.get("checkout")) {
      toast.info(`Select your ${planParam} plan below to start your free trial.`);
      router.replace("/settings/billing");
    }
  }, [searchParams, router]);

  async function openPortal() {
    if (!org) return;
    setLoadingPortal(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orgId: org.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Request failed (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setLoadingPortal(false);
    }
  }

  async function startCheckout(plan: PlanTier) {
    if (!org) return;
    if (members.length === 0) {
      toast.error("Still loading team members. Please try again in a moment.");
      return;
    }
    setLoadingCheckout(plan);
    const info = PLAN_DISPLAY[plan];
    const priceNum = parseFloat(info.price.replace(/[^0-9.]/g, "")) || 0;
    trackBeginCheckout({
      plan,
      price: priceNum,
      interval,
      seats: members.length,
    });
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan,
          orgId: org.id,
          seats: members.length,
          interval,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Request failed (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } finally {
      setLoadingCheckout(null);
    }
  }

  const currentPlan = org?.plan || "free";
  const plans: PlanTier[] = ["free", "pro", "team", "business"];

  if (currentUserRole === "member") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Billing is managed by your admin</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Only admins can manage billing and subscriptions. Contact your organization admin if you need changes to your plan.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
        {/* Past-due / failed-payment recovery banner */}
        {subscription?.status === "past_due" && (
          <Card className="border-red-500/40 bg-red-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Your last payment failed</div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Update your card to keep <strong className="capitalize">{currentPlan}</strong> access
                  {subscription.current_period_end && (
                    <> through <strong>{format(new Date(subscription.current_period_end), "MMM d, yyyy")}</strong></>
                  )}.
                </p>
              </div>
              <Button size="sm" onClick={openPortal} disabled={loadingPortal}>
                {loadingPortal && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                Update card
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan badge and status */}
            <div className="flex items-center gap-3">
              <Badge className="text-base px-3 py-1 capitalize">{currentPlan}</Badge>
              {subscription?.status && (
                <Badge variant={subscription.status === "active" ? "default" : subscription.status === "trialing" ? "secondary" : "destructive"}>
                  {subscription.status === "trialing" ? "Free Trial" : subscription.status}
                </Badge>
              )}
            </div>

            {/* Trial info — friendly messaging */}
            {subscription?.trial_ends_at && subscription.status === "trialing" && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm font-semibold">You get 14 days free, then your subscription begins</p>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Your free trial ends on{" "}
                  <span className="font-medium text-foreground">
                    {format(new Date(subscription.trial_ends_at), "MMMM d, yyyy")}
                  </span>
                  . After that, your <span className="font-medium capitalize">{currentPlan}</span> plan will automatically activate and billing starts. You can cancel anytime before then.
                </p>
              </div>
            )}

            {/* Active subscription info */}
            {subscription?.status === "active" && subscription.current_period_end && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  {subscription.cancel_at_period_end ? (
                    <>Your plan will be canceled on <span className="font-medium text-foreground">{format(new Date(subscription.current_period_end), "MMMM d, yyyy")}</span>. You&apos;ll keep access until then.</>
                  ) : (
                    <>Next billing date: <span className="font-medium text-foreground">{format(new Date(subscription.current_period_end), "MMMM d, yyyy")}</span></>
                  )}
                </p>
              </div>
            )}

            {/* Free plan upsell */}
            {currentPlan === "free" && !subscription?.stripe_customer_id && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-sm font-medium">You&apos;re on the Free plan</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock unlimited prompts, custom security rules, analytics, and more. All paid plans include a 14-day free trial.
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "Prompts", free: "25", paid: "Unlimited" },
                    { label: "Guidelines", free: "5", paid: "14+" },
                    { label: "Members", free: "3", paid: "Up to 500" },
                    { label: "Analytics", free: "No", paid: "Pro+" },
                    { label: "Import / Export", free: "No", paid: "Pro+" },
                    { label: "Custom Security", free: "No", paid: "Team+" },
                    { label: "Audit Log & Export", free: "No", paid: "Team+" },
                    { label: "Risk Scoring", free: "No", paid: "Team+" },
                    { label: "Google Workspace Sync", free: "No", paid: "Team+" },
                    { label: "Priority Support", free: "No", paid: "Business" },
                    { label: "SLA Guarantee", free: "No", paid: "Business" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-16 text-right">{row.free}</span>
                        <span className="text-tp-green w-16 text-right">{row.paid}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seats & members */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Seats: <span className="font-medium text-foreground">{subscription?.seats ?? 1}</span></span>
              <span className="text-border">|</span>
              <span>Members: <span className="font-medium text-foreground">{members.length}</span></span>
            </div>

            {/* Manage billing button */}
            {subscription?.stripe_customer_id && subscription.stripe_customer_id !== "manual_upgrade" && (
              <Button variant="outline" onClick={openPortal} disabled={loadingPortal}>
                {loadingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Billing
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent invoices */}
        {subscription?.stripe_customer_id && currentUserRole === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium">
                          {inv.number || inv.id.slice(0, 8)}
                          {inv.status && inv.status !== "paid" && (
                            <Badge variant="outline" className="ml-2 text-[10px] capitalize">{inv.status}</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(inv.created * 1000), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono tabular-nums">
                          {(inv.amount_paid / 100).toLocaleString("en-US", { style: "currency", currency: inv.currency || "USD" })}
                        </span>
                        {inv.hosted_invoice_url && (
                          <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            View
                          </a>
                        )}
                        {inv.invoice_pdf && (
                          <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                            <Download className="h-3 w-3" /> PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-3">
          <Label htmlFor="billing-toggle" className={interval === "monthly" ? "font-semibold" : "text-muted-foreground"}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={interval === "annual"}
            onCheckedChange={(checked) => setInterval(checked ? "annual" : "monthly")}
          />
          <Label htmlFor="billing-toggle" className={interval === "annual" ? "font-semibold" : "text-muted-foreground"}>
            Annual
          </Label>
          {interval === "annual" && (
            <Badge variant="secondary" className="text-xs text-tp-green">
              Save 20%
            </Badge>
          )}
        </div>

        {/* Plan Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const info = PLAN_DISPLAY[plan];
            const isCurrent = currentPlan === plan;
            const displayPrice = interval === "annual" ? info.annualMonthly : info.price;
            return (
              <Card
                key={plan}
                className={`relative flex flex-col ${
                  isCurrent
                    ? "ring-2 ring-primary/50 bg-primary/5"
                    : info.popular
                      ? "border-primary"
                      : ""
                }`}
              >
                {info.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{info.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-2xl font-bold">{displayPrice}</p>
                  {interval === "annual" && plan !== "free" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      billed as {info.annualPrice}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{info.description}</p>

                  {/* Feature list */}
                  <ul className="mt-4 space-y-2 flex-1">
                    {Object.entries(info.features).map(([feature, value]) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        {value === false ? (
                          <X className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                        <span className={value === false ? "text-muted-foreground/50" : ""}>
                          {typeof value === "string" ? `${feature}: ${value}` : feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : plan === "free" ? (
                      <Button variant="outline" className="w-full" disabled>
                        Free
                      </Button>
                    ) : subscription?.stripe_customer_id && (subscription.status === "active" || subscription.status === "trialing") ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={openPortal}
                        disabled={loadingPortal}
                      >
                        {loadingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Switch via Billing
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => startCheckout(plan)}
                        disabled={!!loadingCheckout}
                      >
                        {loadingCheckout === plan && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Upgrade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
    </div>
  );
}
