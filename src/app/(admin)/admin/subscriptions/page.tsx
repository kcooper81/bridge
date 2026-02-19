"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";

interface SubRow {
  id: string;
  org_id: string;
  org_name: string;
  plan: string;
  status: string;
  seats: number;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  past_due: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  canceled: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    const supabase = createClient();

    const [subsRes, orgsRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("id, org_id, plan, status, seats, current_period_end, stripe_customer_id, stripe_subscription_id, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("organizations").select("id, name"),
    ]);

    const orgMap = new Map(
      (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
    );

    const rows: SubRow[] = (subsRes.data || []).map(
      (s: Omit<SubRow, "org_name">) => ({
        ...s,
        org_name: orgMap.get(s.org_id) || "Unknown",
      })
    );

    setSubs(rows);
    setLoading(false);
  };

  const filtered = search.trim()
    ? subs.filter((s) => s.org_name.toLowerCase().includes(search.toLowerCase()))
    : subs;

  const totalMrr = subs
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((acc, s) => {
      const prices: Record<string, number> = { free: 0, pro: 9, team: 7, business: 12 };
      return acc + (prices[s.plan] || 0);
    }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          {subs.length} subscriptions &middot; ${totalMrr.toFixed(0)} MRR
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by organization..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No subscriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Organization</th>
                    <th className="text-left p-3 font-medium">Plan</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium hidden sm:table-cell">Seats</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Renews</th>
                    <th className="text-right p-3 font-medium">Stripe</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <a
                          href={`/admin/organizations/${sub.org_id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {sub.org_name}
                        </a>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {sub.plan}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[sub.status] || ""}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 text-right hidden sm:table-cell">
                        {sub.seats}
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {sub.current_period_end
                          ? new Date(sub.current_period_end).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-3 text-right">
                        {sub.stripe_subscription_id ? (
                          <a
                            href={`https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
