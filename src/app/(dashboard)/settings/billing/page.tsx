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
import { Loader2, CreditCard, ArrowUpRight, CheckCircle2, X } from "lucide-react";
import { PLAN_DISPLAY } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import type { PlanTier } from "@/lib/types";
import type { BillingInterval } from "@/lib/billing/plans";

export default function BillingPage() {
  const { org, members } = useOrg();
  const { subscription } = useSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  // Handle checkout success redirect
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const plan = searchParams.get("plan") || "your new plan";
      trackPurchase(plan);
      toast.success(`Welcome to ${plan}! Your upgrade is active.`);
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
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } finally {
      setLoadingPortal(false);
    }
  }

  async function startCheckout(plan: PlanTier) {
    if (!org) return;
    setLoadingCheckout(plan);
    const info = PLAN_DISPLAY[plan];
    const priceNum = parseFloat(info.price.replace(/[^0-9.]/g, "")) || 0;
    trackBeginCheckout({
      plan,
      price: priceNum,
      interval,
      seats: members.length || 1,
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
          seats: members.length || 1,
          interval,
        }),
      });
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

  return (
    <div className="max-w-5xl space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="text-base px-3 py-1 capitalize">{currentPlan}</Badge>
              {subscription?.status && (
                <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
                  {subscription.status}
                </Badge>
              )}
            </div>
            {currentPlan === "free" && !subscription?.stripe_customer_id && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-sm font-medium">You&apos;re on the Free plan</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock unlimited prompts, custom security rules, analytics, and more.
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "Prompts", free: "25", paid: "Unlimited" },
                    { label: "Guidelines", free: "5", paid: "14+" },
                    { label: "Members", free: "3", paid: "Up to 500" },
                    { label: "Analytics", free: "No", paid: "Pro+" },
                    { label: "Import / Export", free: "No", paid: "Pro+" },
                    { label: "Custom Security", free: "No", paid: "Pro+" },
                    { label: "Activity Log", free: "No", paid: "Team+" },
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
            {subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground">
                {subscription.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
                {format(new Date(subscription.current_period_end), "MMMM d, yyyy")}
              </p>
            )}
            {subscription?.trial_ends_at && subscription.status === "trialing" && (
              <p className="text-sm text-tp-yellow">
                Trial ends {format(new Date(subscription.trial_ends_at), "MMMM d, yyyy")}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Seats: {subscription?.seats || 1}</span>
              <span className="text-sm text-muted-foreground">Members: {members.length}</span>
            </div>
            {subscription?.stripe_customer_id && (
              <Button variant="outline" onClick={openPortal} disabled={loadingPortal}>
                {loadingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Billing
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

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
