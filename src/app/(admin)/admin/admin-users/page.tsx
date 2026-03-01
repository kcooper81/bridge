"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import type { SuperAdminRole } from "@/lib/constants";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_super_admin: boolean;
  super_admin_role: SuperAdminRole | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { isSuperAdmin, isSupportStaff } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<SuperAdminRole>("support");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/admin-users");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch");
      }
      const data = await res.json();
      setAdmins(data.admins);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Support staff should not see this page
  if (isSupportStaff && !isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add user");

      setNewEmail("");
      setNewRole("support");
      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    setError(null);

    try {
      const res = await fetch(`/api/admin/admin-users?userId=${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove user");

      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove admin");
    } finally {
      setRemovingId(null);
    }
  }

  function getRoleBadge(user: AdminUser) {
    const role = user.super_admin_role || (user.is_super_admin ? "super_admin" : null);
    if (role === "super_admin") {
      return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-0">Super Admin</Badge>;
    }
    if (role === "support") {
      return <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-0">Support</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
        <p className="text-muted-foreground">
          Manage super admin and support staff access to the admin panel.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add new admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Admin User
          </CardTitle>
          <CardDescription>
            Grant admin panel access to an existing user. They must have an account first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="user@example.com"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Select value={newRole} onValueChange={(v) => setNewRole(v as SuperAdminRole)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="support">Support Staff</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={adding || !newEmail.trim()}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Super Admin</strong> — full access to all admin pages and can manage other admins.{" "}
            <strong>Support</strong> — can only view Tickets and Testing Guide.
          </p>
        </CardContent>
      </Card>

      {/* Admin users table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Current Admin Users
          </CardTitle>
          <CardDescription>
            {admins.length} user{admins.length !== 1 ? "s" : ""} with admin panel access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No admin users found.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Added</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b last:border-0">
                      <td className="p-3 font-mono text-xs">{admin.email}</td>
                      <td className="p-3">{admin.name || "—"}</td>
                      <td className="p-3">{getRoleBadge(admin)}</td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(admin.id)}
                          disabled={removingId === admin.id}
                        >
                          {removingId === admin.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
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
