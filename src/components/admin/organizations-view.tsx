"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, Users as UsersIcon, Calendar } from "lucide-react";
import {
  AdminPageHeader,
  AdminLoadingState,
  StatCardRow,
  StatCard,
} from "@/components/admin/admin-page-layout";
import { OrgListPanel, type OrgListItem } from "@/components/admin/org-list-panel";
import { OrgDetailPanel } from "@/components/admin/org-detail-panel";
import { MemberTable, type MemberRow } from "@/components/admin/member-table";

interface OrgFull {
  id: string;
  name: string;
  domain: string | null;
  is_suspended: boolean;
  created_at: string;
}

interface SubRow {
  org_id: string;
  plan: string;
  status: string;
  seats: number;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

interface PromptCountRow {
  org_id: string;
}

export function OrganizationsView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<OrgFull[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([]);
  const [profiles, setProfiles] = useState<MemberRow[]>([]);
  const [promptCounts, setPromptCounts] = useState<Map<string, number>>(new Map());

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(searchParams.get("org"));
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("view") === "users" ? "users" : "teams");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab === "users") {
      params.set("view", "users");
    } else if (selectedOrgId) {
      params.set("org", selectedOrgId);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : "/admin/organizations";
    router.replace(newUrl, { scroll: false });
  }, [selectedOrgId, activeTab, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const [orgsRes, subsRes, profilesRes, promptsRes] = await Promise.all([
      supabase.from("organizations").select("id, name, domain, is_suspended, created_at").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("org_id, plan, status, seats, current_period_end, stripe_customer_id"),
      supabase.from("profiles").select("id, name, email, role, is_super_admin, org_id, created_at, extension_status, last_extension_active").order("created_at", { ascending: false }),
      supabase.from("prompts").select("org_id"),
    ]);

    setOrgs((orgsRes.data || []).map((o) => ({ ...o, is_suspended: o.is_suspended || false })));
    setSubscriptions(subsRes.data || []);
    setProfiles((profilesRes.data || []).map((p) => ({
      ...p,
      extension_status: p.extension_status || "unknown",
      last_extension_active: p.last_extension_active || null,
    })));

    const pCounts = new Map<string, number>();
    (promptsRes.data || []).forEach((p: PromptCountRow) => {
      pCounts.set(p.org_id, (pCounts.get(p.org_id) || 0) + 1);
    });
    setPromptCounts(pCounts);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-select first org on desktop when none is selected
  useEffect(() => {
    if (!loading && orgs.length > 0 && !selectedOrgId && activeTab === "teams" && window.innerWidth >= 1024) {
      setSelectedOrgId(orgs[0].id);
    }
  }, [loading, orgs, selectedOrgId, activeTab]);

  const subMap = useMemo(() => new Map(subscriptions.map((s) => [s.org_id, s])), [subscriptions]);

  const membersByOrg = useMemo(() => {
    const map = new Map<string, MemberRow[]>();
    for (const p of profiles) {
      if (p.org_id) {
        const existing = map.get(p.org_id) || [];
        existing.push(p);
        map.set(p.org_id, existing);
      }
    }
    return map;
  }, [profiles]);

  const orgListItems: OrgListItem[] = useMemo(
    () => orgs.map((o) => ({
      ...o,
      plan: subMap.get(o.id)?.plan || "free",
      status: subMap.get(o.id)?.status || "active",
      memberCount: membersByOrg.get(o.id)?.length || 0,
    })),
    [orgs, subMap, membersByOrg]
  );

  const stats = useMemo(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return {
      total: orgs.length,
      paidOrgs: orgListItems.filter((o) => o.plan !== "free").length,
      newThisWeek: orgs.filter((o) => o.created_at >= oneWeekAgo).length,
      totalMembers: profiles.length,
    };
  }, [orgs, orgListItems, profiles]);

  const orgMap = useMemo(() => new Map(orgs.map((o) => [o.id, o.name])), [orgs]);

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) || null;
  const selectedSub = selectedOrgId ? subMap.get(selectedOrgId) || null : null;
  const selectedMembers = selectedOrgId ? membersByOrg.get(selectedOrgId) || [] : [];
  const selectedPromptCount = selectedOrgId ? promptCounts.get(selectedOrgId) || 0 : 0;

  const handleSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId);
    setMobileShowDetail(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "users") {
      setSelectedOrgId(null);
      setMobileShowDetail(false);
    }
  };

  const handleOrgUpdate = (updatedOrg: OrgFull) => {
    setOrgs((prev) => prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
  };

  const handleOrgDelete = () => {
    setOrgs((prev) => prev.filter((o) => o.id !== selectedOrgId));
    setSelectedOrgId(null);
    setMobileShowDetail(false);
  };

  if (loading) return <AdminLoadingState />;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Organizations"
        subtitle={`${orgs.length} organizations \u00B7 ${profiles.length} total users`}
      />

      <StatCardRow>
        <StatCard label="Total Orgs" value={stats.total} icon={Building2} color="blue" />
        <StatCard label="Paid Orgs" value={stats.paidOrgs} icon={TrendingUp} color="green" />
        <StatCard label="New This Week" value={stats.newThisWeek} icon={Calendar} color="amber" />
        <StatCard label="Total Members" value={stats.totalMembers} icon={UsersIcon} color="purple" />
      </StatCardRow>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="teams">Organizations</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "teams" ? (
        <>
          {/* Desktop: side-by-side */}
          <div className="hidden lg:flex border rounded-lg overflow-hidden h-[calc(100vh-280px)]">
            <div className="w-80 border-r shrink-0 overflow-hidden">
              <OrgListPanel orgs={orgListItems} selectedOrgId={selectedOrgId} onSelect={handleSelectOrg} />
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedOrg ? (
                <OrgDetailPanel
                  org={selectedOrg}
                  subscription={selectedSub}
                  members={selectedMembers}
                  promptCount={selectedPromptCount}
                  onRefresh={loadData}
                  onOrgUpdate={handleOrgUpdate}
                  onOrgDelete={handleOrgDelete}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Select an organization to view details</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: stacked */}
          <div className="lg:hidden">
            {mobileShowDetail && selectedOrg ? (
              <div className="border rounded-lg overflow-hidden">
                <OrgDetailPanel
                  org={selectedOrg}
                  subscription={selectedSub}
                  members={selectedMembers}
                  promptCount={selectedPromptCount}
                  onRefresh={loadData}
                  onOrgUpdate={handleOrgUpdate}
                  onOrgDelete={handleOrgDelete}
                  showBackButton
                  onBack={() => setMobileShowDetail(false)}
                />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden h-[calc(100vh-280px)]">
                <OrgListPanel orgs={orgListItems} selectedOrgId={selectedOrgId} onSelect={handleSelectOrg} />
              </div>
            )}
          </div>
        </>
      ) : (
        <MemberTable
          members={profiles}
          showOrgColumn
          orgMap={orgMap}
          onSelectOrg={(orgId) => {
            setActiveTab("teams");
            handleSelectOrg(orgId);
          }}
        />
      )}
    </div>
  );
}
