"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ArrowLeft, ArrowUpDown, CheckCircle2, Clock, FileSpreadsheet, LayoutList, Loader2, Mail, Network, Pencil, Plug, Plus, RefreshCw, Search, Send, Shield, ShieldOff, Trash2, UserPlus, Users, X } from "lucide-react";
import { getExtensionStatus } from "@/lib/extension-status";
import { SelectWithQuickAdd } from "@/components/ui/select-with-quick-add";
import { ExtensionStatusBadge } from "@/components/dashboard/extension-status-badge";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import {
  saveTeamApi,
  deleteTeamApi,
  updateMemberRole,
  removeMember,
  sendInvite,
  getInvites,
  revokeInvite,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  toggleMemberShield,
} from "@/lib/vault-api";
import { BulkImportModal } from "@/components/dashboard/bulk-import-modal";
import { toast } from "sonner";
import { trackInviteSent } from "@/lib/analytics";
import type { BulkImportRow, Invite, Team, UserRole } from "@/lib/types";
import { UpgradePrompt, LimitNudge } from "@/components/upgrade";
import Link from "next/link";

export default function TeamPage() {
  const { teams, setTeams, members, currentUserRole, loading, refresh, noOrg } = useOrg();
  const { checkLimit, planLimits, canAccess } = useSubscription();

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");

  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("member");
  const [inviteTeamId, setInviteTeamId] = useState<string>("");
  const [inviting, setInviting] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);

  // Team detail view
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [addMemberToTeamOpen, setAddMemberToTeamOpen] = useState(false);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<string>("");
  const [addingMember, setAddingMember] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [removingFromTeamId, setRemovingFromTeamId] = useState<string | null>(null);
  const [togglingShieldId, setTogglingShieldId] = useState<string | null>(null);

  // View mode toggle
  const [teamViewMode, setTeamViewMode] = useState<"table" | "chart">("table");

  // Bulk role assignment
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<UserRole>("member");
  const [applyingBulkRole, setApplyingBulkRole] = useState(false);

  // Change member email
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetId, setEmailTargetId] = useState<string | null>(null);
  const [emailTargetName, setEmailTargetName] = useState("");
  const [emailNewValue, setEmailNewValue] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Google Workspace sync
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncedRows, setSyncedRows] = useState<BulkImportRow[]>([]);
  const [syncImportOpen, setSyncImportOpen] = useState(false);

  useEffect(() => {
    if (currentUserRole !== "admin") return;
    (async () => {
      try {
        const supabase = (await import("@/lib/supabase/client")).createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch("/api/integrations/google/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGoogleConnected(data.connected);
          if (data.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
        }
      } catch { /* ignore */ }
    })();
  }, [currentUserRole]);

  async function handleGoogleSync() {
    setSyncingGoogle(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/integrations/google/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Sync failed");
        return;
      }
      setLastSyncedAt(new Date().toISOString());
      if (data.users?.length > 0) {
        setSyncedRows(data.users);
        setSyncImportOpen(true);
        toast.success(`Found ${data.users.length} new user(s)`);
      } else {
        toast.info("All directory users are already members");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncingGoogle(false);
    }
  }

  // Member search, filter & sort
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTeamFilter, setMemberTeamFilter] = useState<string>("all");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"all" | "admin" | "manager" | "member">("all");
  const [memberShieldFilter, setMemberShieldFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [memberSort, setMemberSort] = useState<{ key: "name" | "email" | "role"; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  // Members after search/role/shield filters but BEFORE team filter (for accurate chip counts)
  const membersPreTeamFilter = useMemo(() => {
    let result = [...members];

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      result = result.filter(
        (m) => m.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    if (memberRoleFilter !== "all") {
      result = result.filter((m) => m.role === memberRoleFilter);
    }

    if (memberShieldFilter !== "all") {
      result = result.filter((m) =>
        memberShieldFilter === "disabled" ? m.shield_disabled : !m.shield_disabled
      );
    }

    return result;
  }, [members, memberSearch, memberRoleFilter, memberShieldFilter]);

  // Members with inactive extensions (for alert banner)
  const inactiveExtensionMembers = useMemo(() => {
    if (currentUserRole !== "admin" && currentUserRole !== "manager") return [];
    return members.filter((m) => getExtensionStatus(m.last_extension_active) === "inactive");
  }, [members, currentUserRole]);

  const filteredMembers = useMemo(() => {
    let result = [...membersPreTeamFilter];

    if (memberTeamFilter !== "all") {
      result = result.filter((m) => m.teamIds.includes(memberTeamFilter));
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (memberSort.key) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role);
          break;
      }
      return memberSort.dir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [membersPreTeamFilter, memberTeamFilter, memberSort]);

  const handleMemberSort = (key: "name" | "email" | "role") => {
    setMemberSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  useEffect(() => {
    getInvites().then(setInvites).catch(() => {});
  }, []);

  const pendingInvites = invites.filter((i) => i.status === "pending");

  // Filtered pending invites (match search, role, and team filters)
  const filteredInvites = useMemo(() => {
    let result = pendingInvites;

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      result = result.filter((inv) => inv.email.toLowerCase().includes(q));
    }

    if (memberRoleFilter !== "all") {
      result = result.filter((inv) => inv.role === memberRoleFilter);
    }

    if (memberTeamFilter !== "all") {
      result = result.filter((inv) => inv.team_id === memberTeamFilter);
    }

    return result;
  }, [pendingInvites, memberSearch, memberRoleFilter, memberTeamFilter]);

  // Check if typed email matches an existing org member
  const existingMemberMatch = useMemo(() => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed) return null;
    return members.find((m) => m.email.toLowerCase() === trimmed) || null;
  }, [inviteEmail, members]);

  if (loading) {
    return (
      <>
        <PageHeader title="Team" description="Manage members, teams, and invitations" />
        <div className="space-y-3">
          <div className="h-10 rounded-lg bg-muted animate-pulse" />
          <div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  if (noOrg) {
    return (
      <>
        <PageHeader title="Team" description="Manage members, teams, and invitations" />
        <NoOrgBanner />
      </>
    );
  }

  function openTeamModal(team: Team | null) {
    setEditTeam(team);
    setTeamName(team?.name || "");
    setTeamDesc(team?.description || "");
    setTeamModalOpen(true);
  }

  async function handleSaveTeam() {
    if (!teamName.trim()) return;
    setSavingTeam(true);
    try {
      await saveTeamApi({ id: editTeam?.id, name: teamName.trim(), description: teamDesc.trim() || null });
      toast.success(editTeam ? "Team updated" : "Team created");
      setTeamModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save team");
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleChangeRole(memberId: string, role: string) {
    if (role !== "admin") {
      const admins = members.filter((m) => m.role === "admin");
      const changingMember = members.find((m) => m.id === memberId);
      if (changingMember?.role === "admin" && admins.length <= 1) {
        toast.error("Cannot remove the last admin. Promote another member first.");
        return;
      }
    }
    setChangingRoleId(memberId);
    try {
      await updateMemberRole(memberId, role);
      toast.success("Role updated");
      setSelectedMemberIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setChangingRoleId(null);
    }
  }

  async function handleBulkRoleChange() {
    if (selectedMemberIds.size === 0) return;

    // Guard last-admin: if any selected admin is being demoted, check count
    if (bulkRole !== "admin") {
      const admins = members.filter((m) => m.role === "admin");
      const selectedAdmins = admins.filter((a) => selectedMemberIds.has(a.id));
      if (selectedAdmins.length > 0 && admins.length - selectedAdmins.length < 1) {
        toast.error("Cannot demote the last admin. Promote another member first.");
        return;
      }
    }

    setApplyingBulkRole(true);
    try {
      await Promise.all(
        Array.from(selectedMemberIds).map((id) => updateMemberRole(id, bulkRole))
      );
      toast.success(`Updated ${selectedMemberIds.size} member(s) to ${bulkRole}`);
      setSelectedMemberIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to update some roles");
    } finally {
      setApplyingBulkRole(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    const member = members.find((m) => m.id === memberId);
    if (member?.role === "admin") {
      const admins = members.filter((m) => m.role === "admin");
      if (admins.length <= 1) {
        toast.error("Cannot remove the last admin.");
        return;
      }
    }
    if (!confirm(`Remove ${member?.name || member?.email || "this member"} from the organization? This cannot be undone.`)) return;
    setRemovingMemberId(memberId);
    try {
      await removeMember(memberId);
      toast.success("Member removed");
      setSelectedMemberIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim()) return;

    // If the email belongs to an existing member, add them to the selected team instead
    if (existingMemberMatch) {
      if (!inviteTeamId) {
        toast.error("Please select a team to add this member to");
        return;
      }
      if (existingMemberMatch.teamIds.includes(inviteTeamId)) {
        toast.error("This member is already on that team");
        return;
      }
      setInviting(true);
      try {
        const success = await addTeamMember(inviteTeamId, existingMemberMatch.id);
        if (success) {
          toast.success("Member added to team");
          setInviteEmail("");
          setInviteTeamId("");
          setInviteModalOpen(false);
          await refresh();
        } else {
          toast.error("Failed to add member to team");
        }
      } catch {
        toast.error("Failed to add member to team");
      } finally {
        setInviting(false);
      }
      return;
    }

    if (!checkLimit("add_member", members.length)) return;
    setInviting(true);
    try {
      const result = await sendInvite(inviteEmail.trim(), inviteRole, inviteTeamId || undefined);
      if (result.success) {
        trackInviteSent();
        toast.success("Invite sent");
        setInviteEmail("");
        setInviteTeamId("");
        const newInvites = await getInvites();
        setInvites(newInvites);
      } else {
        toast.error(result.error || "Failed to send invite");
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRevokeInvite(id: string) {
    try {
      const success = await revokeInvite(id);
      if (success) {
        toast.success("Invite revoked");
      } else {
        toast.error("Failed to revoke invite");
      }
      const newInvites = await getInvites();
      setInvites(newInvites);
    } catch {
      toast.error("Failed to revoke invite");
    }
  }

  async function handleAddMemberToTeam() {
    if (!selectedTeam || !selectedMemberToAdd || addingMember) return;
    setAddingMember(true);
    try {
      const success = await addTeamMember(selectedTeam.id, selectedMemberToAdd);
      if (success) {
        toast.success("Member added to team");
        setAddMemberToTeamOpen(false);
        setSelectedMemberToAdd("");
        await refresh();
      } else {
        toast.error("Failed to add member to team");
      }
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveFromTeam(teamId: string, userId: string) {
    if (!confirm("Remove this member from the team?")) return;
    setRemovingFromTeamId(userId);
    try {
      const success = await removeTeamMember(teamId, userId);
      if (success) {
        toast.success("Removed from team");
        await refresh();
      } else {
        toast.error("Failed to remove from team");
      }
    } finally {
      setRemovingFromTeamId(null);
    }
  }

  async function handleChangeTeamRole(teamId: string, userId: string, role: string) {
    const success = await updateTeamMemberRole(teamId, userId, role);
    if (success) {
      toast.success("Team role updated");
      refresh();
    } else {
      toast.error("Failed to update team role");
    }
  }

  async function handleToggleShield(memberId: string, currentlyDisabled: boolean) {
    setTogglingShieldId(memberId);
    try {
      const success = await toggleMemberShield(memberId, !currentlyDisabled);
      if (success) {
        toast.success(currentlyDisabled ? "Shield re-enabled" : "Shield disabled for member");
        refresh();
      } else {
        toast.error("Failed to toggle shield");
      }
    } catch {
      toast.error("Failed to toggle shield");
    } finally {
      setTogglingShieldId(null);
    }
  }

  function openEmailModal(memberId: string, memberName: string, memberEmail: string) {
    setEmailTargetId(memberId);
    setEmailTargetName(memberName || memberEmail);
    setEmailNewValue(memberEmail);
    setEmailModalOpen(true);
  }

  async function handleChangeEmail() {
    if (!emailTargetId || !emailNewValue.trim()) return;
    setSavingEmail(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/profile/email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailNewValue.trim(),
          targetUserId: emailTargetId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Email updated");
        setEmailModalOpen(false);
        refresh();
      } else {
        toast.error(data.error || "Failed to update email");
      }
    } catch {
      toast.error("Failed to update email");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleDeleteTeam(team: Team) {
    const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
    const msg = teamMembers.length > 0
      ? `Delete "${team.name}"? ${teamMembers.length} member(s) will be removed from this team. This cannot be undone.`
      : `Delete "${team.name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    const ok = await deleteTeamApi(team.id);
    if (ok) {
      toast.success("Team deleted");
      setSelectedTeam(null);
      refresh();
    } else {
      toast.error("Failed to delete team");
    }
  }

  // Team detail view
  if (selectedTeam) {
    const teamMembers = members.filter((m) => m.teamIds.includes(selectedTeam.id));
    const nonTeamMembers = members.filter((m) => !m.teamIds.includes(selectedTeam.id));

    return (
      <>
        <PageHeader title="Team" description="Manage members, teams, and invitations" />
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(null)} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedTeam.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedTeam.description || `${teamMembers.length} members`}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTeamModal(selectedTeam)} title="Edit team">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTeam(selectedTeam)} title="Delete team">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setAddMemberToTeamOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No members in this team yet</p>
              </CardContent>
            </Card>
          ) : (
            teamMembers.map((member) => {
              const initials = member.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
              const teamRole = member.teamRoles[selectedTeam.id] || "member";
              return (
                <div key={member.id} className="flex items-center gap-3 rounded-lg border border-border p-3 group">
                  <Avatar className="h-9 w-9">
                    {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name || "Avatar"} />}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <Badge variant={teamRole === "admin" ? "default" : "outline"} className="text-xs capitalize">
                    {teamRole}
                  </Badge>
                  {currentUserRole === "admin" && (
                    <div className="flex items-center gap-2">
                      <Select value={teamRole} onValueChange={(v) => handleChangeTeamRole(selectedTeam.id, member.id, v)}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleRemoveFromTeam(selectedTeam.id, member.id)} disabled={removingFromTeamId === member.id}>
                        {removingFromTeamId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add member to team modal */}
        <Dialog open={addMemberToTeamOpen} onOpenChange={setAddMemberToTeamOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Member to {selectedTeam.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Member</Label>
                <Select value={selectedMemberToAdd} onValueChange={setSelectedMemberToAdd}>
                  <SelectTrigger><SelectValue placeholder="Choose a member..." /></SelectTrigger>
                  <SelectContent>
                    {nonTeamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name} ({m.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddMemberToTeamOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMemberToTeam} disabled={!selectedMemberToAdd || addingMember}>
                {addingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage members, teams, and invitations"
        actions={
          <div className="flex gap-2">
            {canAccess("bulk_import") && (
              <Button variant="outline" size="sm" onClick={() => setBulkImportOpen(true)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import Members
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
            <Button size="sm" onClick={() => openTeamModal(null)}>
              <Plus className="mr-2 h-4 w-4" />
              New Team
            </Button>
          </div>
        }
      />

      {!checkLimit("add_member", members.length) && (
        <UpgradePrompt feature="add_member" current={members.length} max={planLimits.max_members} className="mb-6" />
      )}
      <LimitNudge feature="add_member" current={members.length} max={planLimits.max_members} className="mb-4" />

      {/* Google Workspace sync banner */}
      {currentUserRole === "admin" && (canAccess("google_workspace_sync") ? googleConnected !== null : true) && (
        <div className={cn(
          "flex items-center gap-3 rounded-lg border px-4 py-3 mb-4",
          googleConnected && canAccess("google_workspace_sync") ? "border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/20" : "bg-muted/30"
        )}>
          {!canAccess("google_workspace_sync") ? (
            <>
              <Plug className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground flex-1">
                Sync your company directory from Google Workspace.
              </p>
              <Badge variant="secondary" className="text-xs shrink-0">Business</Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/billing">Upgrade</Link>
              </Button>
            </>
          ) : googleConnected ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Google Workspace connected
                </p>
                {lastSyncedAt && (
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">
                    Last synced {new Date(lastSyncedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleGoogleSync} disabled={syncingGoogle} className="border-green-200 dark:border-green-800">
                {syncingGoogle && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Sync Directory
              </Button>
            </>
          ) : (
            <>
              <Plug className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground flex-1">
                Connect Google Workspace to import your company directory.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Inactive extension alert */}
      {inactiveExtensionMembers.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20 px-4 py-3 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
            <span className="font-medium">{inactiveExtensionMembers.length} member{inactiveExtensionMembers.length > 1 ? "s have" : " has"} an inactive extension</span>
            <span className="text-amber-600/70 dark:text-amber-400/70"> — no activity in 24+ hours ({inactiveExtensionMembers.slice(0, 3).map((m) => m.name || m.email.split("@")[0]).join(", ")}{inactiveExtensionMembers.length > 3 ? ` +${inactiveExtensionMembers.length - 3} more` : ""})</span>
          </p>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-2 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={memberRoleFilter} onValueChange={(v) => setMemberRoleFilter(v as typeof memberRoleFilter)}>
              <SelectTrigger className="w-[130px] h-10">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            {currentUserRole === "admin" && (
              <Select value={memberShieldFilter} onValueChange={(v) => setMemberShieldFilter(v as typeof memberShieldFilter)}>
                <SelectTrigger className="w-[140px] h-10">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{memberShieldFilter === "all" ? "All shields" : memberShieldFilter === "enabled" ? "Enabled" : "Disabled"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All shields</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
              <Button
                variant={teamViewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setTeamViewMode("table")}
                title="Table view"
              >
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={teamViewMode === "chart" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setTeamViewMode("chart")}
                title="Org chart view"
              >
                <Network className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {teams.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <Button
              variant={memberTeamFilter === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs hover:scale-100 active:scale-100"
              onClick={() => setMemberTeamFilter("all")}
            >
              All teams
            </Button>
            {teams.map((team) => (
              <Button
                key={team.id}
                variant={memberTeamFilter === team.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs !transition-colors !duration-150 hover:scale-100 active:scale-100"
                onClick={() => setMemberTeamFilter(memberTeamFilter === team.id ? "all" : team.id)}
                onDoubleClick={() => { if (currentUserRole === "admin") setSelectedTeam(team); }}
                title={currentUserRole === "admin" ? "Click to filter, double-click to manage" : undefined}
              >
                {team.name}
                <span className="ml-1 text-[10px] opacity-60">
                  {membersPreTeamFilter.filter((m) => m.teamIds.includes(team.id)).length}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {currentUserRole === "admin" && canAccess("bulk_role_assignment") && selectedMemberIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2 mb-2">
          <span className="text-sm font-medium">{selectedMemberIds.size} selected</span>
          <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as UserRole)}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8" onClick={handleBulkRoleChange} disabled={applyingBulkRole}>
            {applyingBulkRole && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Apply
          </Button>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedMemberIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Org Chart View */}
      {teamViewMode === "chart" && (
        <div className="space-y-6">
          {/* Unassigned members */}
          {(() => {
            const unassigned = filteredMembers.filter((m) => m.teamIds.length === 0);
            const assigned = teams.map((team) => ({
              team,
              members: filteredMembers.filter((m) => m.teamIds.includes(team.id)),
            })).filter((g) => g.members.length > 0 || true);

            return (
              <>
                {/* Organization header node */}
                <div className="flex flex-col items-center">
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-3 shadow-sm">
                    <p className="text-sm font-semibold text-primary">{members.length} Members</p>
                    <p className="text-xs text-muted-foreground text-center">{teams.length} Teams</p>
                  </div>
                  {/* Connector line */}
                  <div className="w-px h-6 bg-border" />
                </div>

                {/* Teams grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {assigned.map(({ team, members: teamMembers }) => {
                    const admins = teamMembers.filter((m) => m.role === "admin" || m.teamRoles[team.id] === "admin");
                    const rest = teamMembers.filter((m) => m.role !== "admin" && m.teamRoles[team.id] !== "admin");
                    return (
                      <div
                        key={team.id}
                        className="group rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                      >
                        {/* Team header — clickable to enter team detail */}
                        <div
                          className="flex items-center justify-between border-b border-border/50 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl"
                          onClick={() => setSelectedTeam(team)}
                        >
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                            {team.description && (
                              <p className="text-xs text-muted-foreground truncate">{team.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="secondary" className="text-[10px]">
                              {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
                            </Badge>
                          </div>
                        </div>

                        {/* Team members */}
                        <div className="p-3 space-y-1">
                          {teamMembers.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">No members</p>
                          ) : (
                            <>
                              {/* Team leads/admins first */}
                              {admins.map((m) => {
                                const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                                return (
                                  <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                                    <div className="relative">
                                      <Avatar className="h-8 w-8">
                                        {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                        <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{initials}</AvatarFallback>
                                      </Avatar>
                                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-amber-500" title="Team Lead" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium truncate">{m.name || m.email}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize shrink-0">
                                      {m.teamRoles[team.id] || m.role}
                                    </Badge>
                                  </div>
                                );
                              })}
                              {rest.map((m) => {
                                const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                                return (
                                  <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                                    <Avatar className="h-8 w-8">
                                      {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium truncate">{m.name || m.email}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize shrink-0">
                                      {m.teamRoles[team.id] || m.role}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>

                        {/* Stacked avatar footer */}
                        {teamMembers.length > 0 && (
                          <div className="flex items-center gap-2 border-t border-border/50 px-4 py-2">
                            <div className="flex -space-x-2">
                              {teamMembers.slice(0, 5).map((m) => {
                                const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                                return (
                                  <Avatar key={m.id} className="h-6 w-6 border-2 border-card">
                                    {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                    <AvatarFallback className="bg-muted text-[8px]">{initials}</AvatarFallback>
                                  </Avatar>
                                );
                              })}
                            </div>
                            {teamMembers.length > 5 && (
                              <span className="text-[10px] text-muted-foreground">+{teamMembers.length - 5} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Unassigned card */}
                  {unassigned.length > 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20">
                      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground">Unassigned</h3>
                          <p className="text-xs text-muted-foreground/70">Not on any team</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {unassigned.length} {unassigned.length === 1 ? "member" : "members"}
                        </Badge>
                      </div>
                      <div className="p-3 space-y-1">
                        {unassigned.map((m) => {
                          const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                          return (
                            <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                              <Avatar className="h-8 w-8">
                                {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">{initials}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium truncate">{m.name || m.email}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                              </div>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize shrink-0">
                                {m.role}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Result count */}
      {teamViewMode === "table" && (
        <p className="text-xs text-muted-foreground mb-2">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
          {filteredInvites.length > 0 && ` · ${filteredInvites.length} pending`}
        </p>
      )}

      {/* Members Table */}
      {teamViewMode === "table" && <Card>
        <CardContent className="p-0">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {currentUserRole === "admin" && canAccess("bulk_role_assignment") && (
                      <th className="p-3 w-10">
                        <Checkbox
                          checked={
                            filteredMembers.filter((m) => !m.isCurrentUser).length > 0 &&
                            filteredMembers.filter((m) => !m.isCurrentUser).every((m) => selectedMemberIds.has(m.id))
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMemberIds(new Set(filteredMembers.filter((m) => !m.isCurrentUser).map((m) => m.id)));
                            } else {
                              setSelectedMemberIds(new Set());
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("name")}>
                        Name <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Extension</th>
                    {currentUserRole === "admin" && (
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Shield</th>
                    )}
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("role")}>
                        Role <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    {currentUserRole === "admin" && (
                      <th className="text-left p-3 font-medium w-10">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    const initials = member.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                    return (
                      <tr key={member.id} className={cn("border-b hover:bg-muted/30 transition-colors group", selectedMemberIds.has(member.id) && "bg-primary/5")}>
                        {currentUserRole === "admin" && canAccess("bulk_role_assignment") && (
                          <td className="p-3 w-10">
                            {!member.isCurrentUser ? (
                              <Checkbox
                                checked={selectedMemberIds.has(member.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedMemberIds((prev) => {
                                    const next = new Set(prev);
                                    if (checked) next.add(member.id);
                                    else next.delete(member.id);
                                    return next;
                                  });
                                }}
                              />
                            ) : null}
                          </td>
                        )}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name || "Avatar"} />}
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium truncate">{member.name}</p>
                                {member.invite_source === "google" && (
                                  <span className="shrink-0" title="Synced from Google Workspace">
                                    <RefreshCw className="h-3 w-3 text-muted-foreground/60" />
                                  </span>
                                )}
                                {member.invite_source === "bulk" && (
                                  <span className="shrink-0" title="Bulk imported">
                                    <FileSpreadsheet className="h-3 w-3 text-muted-foreground/60" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <ExtensionStatusBadge
                            lastActive={member.last_extension_active}
                            version={member.extension_version}
                          />
                        </td>
                        {currentUserRole === "admin" && (
                          <td className="p-3 hidden sm:table-cell">
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-7 text-xs gap-1.5",
                                member.shield_disabled
                                  ? "text-muted-foreground"
                                  : "text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-950/50"
                              )}
                              onClick={() => handleToggleShield(member.id, member.shield_disabled)}
                              disabled={togglingShieldId === member.id}
                            >
                              {togglingShieldId === member.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : member.shield_disabled ? (
                                <>
                                  <ShieldOff className="h-3.5 w-3.5" />
                                  Off
                                </>
                              ) : (
                                <>
                                  <Shield className="h-3.5 w-3.5" />
                                  On
                                </>
                              )}
                            </Button>
                          </td>
                        )}
                        <td className="p-3">
                          {currentUserRole === "admin" && !member.isCurrentUser ? (
                            <Select value={member.role} onValueChange={(v) => handleChangeRole(member.id, v)} disabled={changingRoleId === member.id}>
                              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                          )}
                        </td>
                        {currentUserRole === "admin" && (
                          <td className="p-3">
                            {!member.isCurrentUser && (
                              <div className="flex items-center gap-0.5">
                                {member.role !== "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                    title="Change email"
                                    onClick={() => openEmailModal(member.id, member.name, member.email)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={removingMemberId === member.id}
                                >
                                  {removingMemberId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                </Button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {/* Pending invite rows */}
                  {filteredInvites.map((inv) => {
                    const invTeam = inv.team_id ? teams.find((t) => t.id === inv.team_id) : null;
                    return (
                      <tr key={`inv-${inv.id}`} className="border-b bg-muted/10 group">
                        {currentUserRole === "admin" && canAccess("bulk_role_assignment") && (
                          <td className="p-3 w-10" />
                        )}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 opacity-50">
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                <Mail className="h-3.5 w-3.5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm text-muted-foreground truncate">{inv.email}</p>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                                  <Clock className="mr-0.5 h-2.5 w-2.5" />
                                  Pending
                                </Badge>
                              </div>
                              {invTeam && (
                                <p className="text-[11px] text-muted-foreground/70">{invTeam.name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">—</span>
                        </td>
                        {currentUserRole === "admin" && (
                          <td className="p-3 hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground">—</span>
                          </td>
                        )}
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs capitalize">{inv.role}</Badge>
                        </td>
                        {currentUserRole === "admin" && (
                          <td className="p-3">
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                title="Resend invite"
                                onClick={() => {
                                  handleRevokeInvite(inv.id).then(() => {
                                    setInviteEmail(inv.email);
                                    setInviteRole(inv.role);
                                    setInviteTeamId(inv.team_id || "");
                                    setInviteModalOpen(true);
                                  });
                                }}
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                                title="Revoke invite"
                                onClick={() => handleRevokeInvite(inv.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>}

      {/* Team Modal */}
      <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTeam ? "Edit Team" : "New Team"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTeamModalOpen(false)} disabled={savingTeam}>Cancel</Button>
            <Button onClick={handleSaveTeam} disabled={savingTeam || !teamName.trim()}>
              {savingTeam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savingTeam ? "Saving..." : editTeam ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{existingMemberMatch ? "Add to Team" : "Invite Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
            </div>

            {/* Existing member detected banner */}
            {existingMemberMatch && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={existingMemberMatch.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {(existingMemberMatch.name || existingMemberMatch.email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{existingMemberMatch.name || existingMemberMatch.email}</p>
                  <p className="text-xs text-muted-foreground">Already a member &middot; {existingMemberMatch.role}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              </div>
            )}

            {/* Only show role picker for new invites */}
            {!existingMemberMatch && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{existingMemberMatch ? "Add to Team" : "Add to Team (optional)"}</Label>
              <SelectWithQuickAdd
                value={inviteTeamId}
                onValueChange={setInviteTeamId}
                items={teams.map((t) => ({ id: t.id, name: t.name }))}
                onQuickCreate={async (name) => {
                  const team = await saveTeamApi({ name });
                  if (team) {
                    setTeams((prev) => [team, ...prev]);
                    return { id: team.id, name: team.name };
                  }
                  return null;
                }}
                noneLabel={existingMemberMatch ? "Select a team" : "No team"}
                createLabel="team"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvite} disabled={inviting || (!!existingMemberMatch && !inviteTeamId)}>
              {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingMemberMatch ? "Add to Team" : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email for {emailTargetName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Email Address</Label>
              <Input
                type="email"
                value={emailNewValue}
                onChange={(e) => setEmailNewValue(e.target.value)}
                placeholder="new@company.com"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEmailModalOpen(false)} disabled={savingEmail}>Cancel</Button>
            <Button onClick={handleChangeEmail} disabled={savingEmail || !emailNewValue.trim()}>
              {savingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        teams={teams}
        members={members}
        pendingInvites={invites}
        onComplete={() => {
          refresh();
          getInvites().then(setInvites).catch(() => {});
        }}
      />

      {/* Google Sync Import Modal */}
      <BulkImportModal
        open={syncImportOpen}
        onOpenChange={setSyncImportOpen}
        teams={teams}
        members={members}
        pendingInvites={invites}
        initialRows={syncedRows}
        onComplete={() => {
          refresh();
          setSyncedRows([]);
          getInvites().then(setInvites).catch(() => {});
        }}
      />
    </>
  );
}
