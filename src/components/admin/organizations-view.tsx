"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2 } from "lucide-react";
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
  const [promptCounts, setPromptCounts] = useState<Map<string, number>>(
    new Map()
  );

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    searchParams.get("org")
  );
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get("view") === "users" ? "users" : "teams"
  );
  // Mobile: when an org is selected on mobile, show the detail view
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab === "users") {
      params.set("view", "users");
    } else if (selectedOrgId) {
      params.set("org", selectedOrgId);
    }
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : "/admin/organizations";
    router.replace(newUrl, { scroll: false });
  }, [selectedOrgId, activeTab, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const [orgsRes, subsRes, profilesRes, promptsRes] = await Promise.all([
      supabase
        .from("organizations")
        .select("id, name, domain, is_suspended, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select(
          "org_id, plan, status, seats, current_period_end, stripe_customer_id"
        ),
      supabase
        .from("profiles")
        .select(
          "id, name, email, role, is_super_admin, org_id, created_at, extension_status, last_extension_active"
        )
        .order("created_at", { ascending: false }),
      supabase.from("prompts").select("org_id"),
    ]);

    setOrgs(
      (orgsRes.data || []).map((o) => ({
        ...o,
        is_suspended: o.is_suspended || false,
      }))
    );
    setSubscriptions(subsRes.data || []);
    setProfiles(
      (profilesRes.data || []).map((p) => ({
        ...p,
        extension_status: p.extension_status || "unknown",
        last_extension_active: p.last_extension_active || null,
      }))
    );

    const pCounts = new Map<string, number>();
    (promptsRes.data || []).forEach((p: PromptCountRow) => {
      pCounts.set(p.org_id, (pCounts.get(p.org_id) || 0) + 1);
    });
    setPromptCounts(pCounts);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived data
  const subMap = useMemo(
    () => new Map(subscriptions.map((s) => [s.org_id, s])),
    [subscriptions]
  );

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
    () =>
      orgs.map((o) => ({
        ...o,
        plan: subMap.get(o.id)?.plan || "free",
        status: subMap.get(o.id)?.status || "active",
        memberCount: membersByOrg.get(o.id)?.length || 0,
      })),
    [orgs, subMap, membersByOrg]
  );

  const orgMap = useMemo(
    () => new Map(orgs.map((o) => [o.id, o.name])),
    [orgs]
  );

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) || null;
  const selectedSub = selectedOrgId ? subMap.get(selectedOrgId) || null : null;
  const selectedMembers = selectedOrgId
    ? membersByOrg.get(selectedOrgId) || []
    : [];
  const selectedPromptCount = selectedOrgId
    ? promptCounts.get(selectedOrgId) || 0
    : 0;

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

  const handleOrgUpdate = (updatedOrg: {
    id: string;
    name: string;
    domain: string | null;
    is_suspended: boolean;
    created_at: string;
  }) => {
    setOrgs((prev) =>
      prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o))
    );
  };

  const handleOrgDelete = () => {
    setOrgs((prev) => prev.filter((o) => o.id !== selectedOrgId));
    setSelectedOrgId(null);
    setMobileShowDetail(false);
  };

  const handleMobileBack = () => {
    setMobileShowDetail(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground">
          {orgs.length} organizations &middot; {profiles.length} total users
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "teams" ? (
        <>
          {/* Desktop: side-by-side */}
          <div className="hidden lg:flex border rounded-lg overflow-hidden h-[calc(100vh-220px)]">
            <div className="w-72 border-r shrink-0 overflow-hidden">
              <OrgListPanel
                orgs={orgListItems}
                selectedOrgId={selectedOrgId}
                onSelect={handleSelectOrg}
              />
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
                  <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Select a team to view details
                  </p>
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
                  onBack={handleMobileBack}
                />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden h-[calc(100vh-220px)]">
                <OrgListPanel
                  orgs={orgListItems}
                  selectedOrgId={selectedOrgId}
                  onSelect={handleSelectOrg}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        /* All Users tab */
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
