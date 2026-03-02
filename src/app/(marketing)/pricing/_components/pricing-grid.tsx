"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, X } from "lucide-react";
import { PLAN_DISPLAY, PLAN_ORDER } from "@/lib/constants";

export function PricingGrid() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <Label className={!annual ? "font-semibold" : "text-muted-foreground"}>
          Monthly
        </Label>
        <Switch
          checked={annual}
          onCheckedChange={setAnnual}
        />
        <Label className={annual ? "font-semibold" : "text-muted-foreground"}>
          Annual
        </Label>
        {annual && (
          <Badge variant="secondary" className="text-xs text-primary font-semibold">
            Save 20%
          </Badge>
        )}
      </div>

      {/* Plan grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {PLAN_ORDER.map((tier) => {
          const plan = PLAN_DISPLAY[tier];
          const price = annual ? plan.annualMonthlyPrice : plan.monthlyPrice;
          const period = annual ? plan.annualPeriod : plan.period;
          return (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? "border-primary bg-card shadow-lg shadow-primary/5 relative hover:shadow-xl hover:shadow-primary/10"
                  : "border-border bg-card hover:border-primary/20 hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">
                    {price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {period}
                  </span>
                </div>
                {annual && plan.name !== "Free" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    billed as {plan.annualPrice}
                  </p>
                )}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3.5 flex-1">
                {Object.entries(plan.features).map(([feature, value]) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    {value === false ? (
                      <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span
                      className={
                        value === false ? "text-muted-foreground/50" : ""
                      }
                    >
                      {typeof value === "string"
                        ? `${feature}: ${value}`
                        : feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="mt-8">
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full rounded-full font-semibold"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
