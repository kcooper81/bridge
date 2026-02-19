"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Loader2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_super_admin: boolean;
  org_id: string | null;
  org_name: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [filterSuperAdmin, setFilterSuperAdmin] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, filterSuperAdmin, page]);

  const loadUsers = async () => {
    const supabase = createClient();

    const [profilesRes, orgsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, email, role, is_super_admin, org_id, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("organizations").select("id, name"),
    ]);

    const orgMap = new Map(
      (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
    );

    const rows: UserRow[] = (profilesRes.data || []).map(
      (p: { id: string; name: string; email: string; role: string; is_super_admin: boolean; org_id: string | null; created_at: string }) => ({
        ...p,
        org_name: p.org_id ? orgMap.get(p.org_id) || null : null,
      })
    );

    setUsers(rows);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (filterSuperAdmin) {
      filtered = filtered.filter((u) => u.is_super_admin);
    }

    setFilteredUsers(filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
  };

  const toggleSuperAdmin = async (userId: string, current: boolean) => {
    const action = current ? "remove super admin from" : "make super admin";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_super_admin: !current })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update user");
    } else {
      toast.success(`Super admin ${current ? "removed" : "granted"}`);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_super_admin: !current } : u
        )
      );
    }
  };

  const totalFiltered = (() => {
    let filtered = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    if (filterSuperAdmin) {
      filtered = filtered.filter((u) => u.is_super_admin);
    }
    return filtered.length;
  })();

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

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
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          {users.length} users across all organizations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <Button
          variant={filterSuperAdmin ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setFilterSuperAdmin(!filterSuperAdmin);
            setPage(0);
          }}
        >
          <Shield className="mr-2 h-4 w-4" />
          Super Admins
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Organization</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Joined</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.is_super_admin && (
                            <Badge className="bg-amber-500 text-xs">
                              Super Admin
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        {user.org_name ? (
                          <a
                            href={`/admin/organizations/${user.org_id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {user.org_name}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleSuperAdmin(user.id, user.is_super_admin)
                          }
                          title={
                            user.is_super_admin
                              ? "Remove super admin"
                              : "Make super admin"
                          }
                        >
                          {user.is_super_admin ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
