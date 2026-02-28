"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ArrowLeft, ArrowUpDown, FileSpreadsheet, Loader2, Mail, Pencil, Plug, Plus, Search, Shield, ShieldOff, Trash2, UserPlus, Users, X } from "lucide-react";
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
  const { checkLimit, planLimits } = useSubscription();

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

  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      result = result.filter(
        (m) => m.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    if (memberTeamFilter !== "all") {
      result = result.filter((m) => m.teamIds.includes(memberTeamFilter));
    }

    if (memberRoleFilter !== "all") {
      result = result.filter((m) => m.role === memberRoleFilter);
    }

    if (memberShieldFilter !== "all") {
      result = result.filter((m) =>
        memberShieldFilter === "disabled" ? m.shield_disabled : !m.shield_disabled
      );
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
  }, [members, memberSearch, memberTeamFilter, memberRoleFilter, memberShieldFilter, memberSort]);

  const handleMemberSort = (key: "name" | "email" | "role") => {
    setMemberSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  useEffect(() => {
    getInvites().then(setInvites).catch(() => {});
  }, []);

  const pendingInvites = invites.filter((i) => i.status === "pending");

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
        refresh();
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
        refresh();
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
            <Button variant="outline" size="sm" onClick={() => setBulkImportOpen(true)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import Members
            </Button>
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
      {currentUserRole === "admin" && googleConnected !== null && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 mb-4">
          <Plug className="h-4 w-4 text-muted-foreground shrink-0" />
          {googleConnected ? (
            <>
              <p className="text-sm text-muted-foreground flex-1">
                Google Workspace is connected. Sync your directory to import new employees.
              </p>
              <Button variant="outline" size="sm" onClick={handleGoogleSync} disabled={syncingGoogle}>
                {syncingGoogle && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Sync Directory
              </Button>
            </>
          ) : (
            <>
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
                  {members.filter((m) => m.teamIds.includes(team.id)).length}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {currentUserRole === "admin" && selectedMemberIds.size > 0 && (
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

      {/* Result count */}
      <p className="text-xs text-muted-foreground mb-2">
        {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
      </p>

      {/* Members Table */}
      <Card>
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
                    {currentUserRole === "admin" && (
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
                        {currentUserRole === "admin" && (
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
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{member.name}</p>
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
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Pending Invites</h3>
          <div className="space-y-2">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{inv.email}</p>
                  <Badge variant="outline" className="text-xs mt-0.5">{inv.role}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => handleRevokeInvite(inv.id)}>
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
            </div>
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
            <div className="space-y-2">
              <Label>Add to Team (optional)</Label>
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
                noneLabel="No team"
                createLabel="team"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvite} disabled={inviting}>
              {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invite
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
