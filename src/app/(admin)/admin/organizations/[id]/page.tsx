"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Archive,
  CreditCard,
  Loader2,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface OrgDetail {
  id: string;
  name: string;
  domain: string | null;
  logo: string | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

interface SubDetail {
  plan: string;
  status: string;
  seats: number;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_super_admin: boolean;
  created_at: string;
}

export default function OrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [subscription, setSubscription] = useState<SubDetail | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [promptCount, setPromptCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrgDetail();
  }, [orgId]);

  const loadOrgDetail = async () => {
    const supabase = createClient();

    const [orgRes, subRes, membersRes, promptsRes] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", orgId).single(),
      supabase.from("subscriptions").select("plan, status, seats, current_period_end, stripe_customer_id, stripe_subscription_id").eq("org_id", orgId).single(),
      supabase.from("profiles").select("id, name, email, role, is_super_admin, created_at").eq("org_id", orgId).order("created_at"),
      supabase.from("prompts").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    ]);

    setOrg(orgRes.data || null);
    setSubscription(subRes.data || null);
    setMembers(membersRes.data || []);
    setPromptCount(promptsRes.count || 0);
    setLoading(false);
  };

  const handleToggleSuspend = async () => {
    if (!org) return;
    const action = org.is_suspended ? "unsuspend" : "suspend";
    if (!confirm(`Are you sure you want to ${action} "${org.name}"?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ is_suspended: !org.is_suspended })
      .eq("id", org.id);

    if (error) {
      toast.error(`Failed to ${action} organization`);
    } else {
      toast.success(`Organization ${action}ed`);
      setOrg({ ...org, is_suspended: !org.is_suspended });
    }
  };

  const handleDelete = async () => {
    if (!org) return;
    if (
      !confirm(
        `DANGER: This will permanently delete "${org.name}" and all its data. This cannot be undone. Continue?`
      )
    )
      return;

    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", org.id);

    if (error) {
      toast.error("Failed to delete organization");
    } else {
      toast.success("Organization deleted");
      router.push("/admin/organizations");
    }
  };

  const handleImpersonate = () => {
    if (!org) return;
    localStorage.setItem(
      "admin_impersonate_org",
      JSON.stringify({ id: org.id, name: org.name })
    );
    window.location.href = "/vault";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Organization not found</p>
        <Link href="/admin/organizations">
          <Button variant="link" className="mt-2">
            Back to organizations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
            {org.is_suspended && (
              <Badge variant="destructive">Suspended</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {org.domain || "No domain"} &middot; Created{" "}
            {new Date(org.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImpersonate}>
            <Eye className="mr-2 h-4 w-4" />
            Impersonate
          </Button>
          <Button
            variant={org.is_suspended ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSuspend}
          >
            {org.is_suspended ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Unsuspend
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {subscription?.plan || "free"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {subscription?.status || "No subscription"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscription?.seats || 0} seats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promptCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {subscription?.stripe_customer_id ? (
              <a
                href={`https://dashboard.stripe.com/customers/${subscription.stripe_customer_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View in Stripe
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No Stripe customer</p>
            )}
            {subscription?.current_period_end && (
              <p className="text-xs text-muted-foreground mt-1">
                Renews{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.name}</span>
                        {m.is_super_admin && (
                          <Badge className="bg-amber-500 text-xs">
                            Super Admin
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">
                      {m.email}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize">
                        {m.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
