"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Archive,
  CreditCard,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MemberTable, type MemberRow } from "@/components/admin/member-table";

interface SubDetail {
  plan: string;
  status: string;
  seats: number;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

interface OrgForDetail {
  id: string;
  name: string;
  domain: string | null;
  is_suspended: boolean;
  created_at: string;
}

interface OrgDetailPanelProps {
  org: OrgForDetail;
  subscription: SubDetail | null;
  members: MemberRow[];
  promptCount: number;
  onRefresh: () => void;
  onOrgUpdate: (org: OrgForDetail) => void;
  onOrgDelete: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function OrgDetailPanel({
  org,
  subscription,
  members,
  promptCount,
  onOrgUpdate,
  onOrgDelete,
  showBackButton,
  onBack,
}: OrgDetailPanelProps) {
  const handleToggleSuspend = async () => {
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
      onOrgUpdate({ ...org, is_suspended: !org.is_suspended });
    }
  };

  const handleDelete = async () => {
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
      onOrgDelete();
    }
  };

  const handleImpersonate = () => {
    localStorage.setItem(
      "admin_impersonate_org",
      JSON.stringify({ id: org.id, name: org.name })
    );
    window.location.href = "/vault";
  };

  return (
    <div className="p-4 space-y-4 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight truncate">
              {org.name}
            </h2>
            {org.is_suspended && (
              <Badge variant="destructive">Suspended</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {org.domain || "No domain"} &middot; Created{" "}
            {new Date(org.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleImpersonate}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Impersonate
          </Button>
          <Button
            variant={org.is_suspended ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSuspend}
          >
            {org.is_suspended ? (
              <>
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Unsuspend
              </>
            ) : (
              <>
                <Ban className="mr-1.5 h-3.5 w-3.5" />
                Suspend
              </>
            )}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Plan</CardTitle>
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold capitalize">
              {subscription?.plan || "free"}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {subscription?.status || "No subscription"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Members</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscription?.seats || 0} seats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Prompts</CardTitle>
            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{promptCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Billing</CardTitle>
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {subscription?.stripe_customer_id ? (
              <a
                href={`https://dashboard.stripe.com/customers/${subscription.stripe_customer_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View in Stripe
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">No Stripe customer</p>
            )}
            {subscription?.current_period_end && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Renews{" "}
                {new Date(
                  subscription.current_period_end
                ).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Members */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Members ({members.length})
        </h3>
        <MemberTable members={members} />
      </div>
    </div>
  );
}
