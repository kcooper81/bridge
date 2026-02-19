"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TicketRow {
  id: string;
  type: string;
  subject: string | null;
  message: string;
  status: string;
  priority: string;
  user_email: string | null;
  org_name: string | null;
  created_at: string;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  new: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: CheckCircle,
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-500",
  normal: "text-blue-500",
  high: "text-amber-500",
  urgent: "text-red-500",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const supabase = createClient();

    const { data: rawTickets } = await supabase
      .from("feedback")
      .select("id, type, subject, message, status, priority, user_id, org_id, created_at")
      .order("created_at", { ascending: false });

    if (!rawTickets || rawTickets.length === 0) {
      setTickets([]);
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set(rawTickets.map((t: { user_id: string | null }) => t.user_id).filter(Boolean) as string[]));
    const orgIds = Array.from(new Set(rawTickets.map((t: { org_id: string | null }) => t.org_id).filter(Boolean) as string[]));

    const [usersRes, orgsRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from("profiles").select("id, email").in("id", userIds)
        : { data: [] },
      orgIds.length > 0
        ? supabase.from("organizations").select("id, name").in("id", orgIds)
        : { data: [] },
    ]);

    const userMap = new Map(
      (usersRes.data || []).map((u: { id: string; email: string }) => [u.id, u.email])
    );
    const orgMap = new Map(
      (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
    );

    setTickets(
      rawTickets.map((t: { id: string; type: string; subject: string | null; message: string; status: string; priority: string; user_id: string | null; org_id: string | null; created_at: string }) => ({
        id: t.id,
        type: t.type,
        subject: t.subject,
        message: t.message,
        status: t.status,
        priority: t.priority || "normal",
        user_email: t.user_id ? userMap.get(t.user_id) || null : null,
        org_name: t.org_id ? orgMap.get(t.org_id) || null : null,
        created_at: t.created_at,
      }))
    );

    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient();
    const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === "resolved") updates.resolved_at = new Date().toISOString();

    const { error } = await supabase
      .from("feedback")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update ticket");
    } else {
      toast.success(`Ticket marked as ${newStatus}`);
      setTickets(
        tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  };

  const filtered =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const statusCounts = {
    all: tickets.length,
    new: tickets.filter((t) => t.status === "new").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">
          {tickets.length} tickets total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "new", "in_progress", "resolved"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f.replace("_", " ")}
            {statusCounts[f] > 0 && (
              <span className="ml-1.5 text-xs opacity-75">
                ({statusCounts[f]})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Ticket cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Ticket className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;
            return (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status] || ""}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {ticket.status.replace("_", " ")}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {ticket.type}
                        </Badge>
                        <span
                          className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <h3 className="font-medium">
                        {ticket.subject || "No subject"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {ticket.user_email && <span>{ticket.user_email}</span>}
                        {ticket.org_name && (
                          <span>&middot; {ticket.org_name}</span>
                        )}
                        <span>
                          &middot;{" "}
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {ticket.status === "new" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStatus(ticket.id, "in_progress")
                          }
                        >
                          Start
                        </Button>
                      )}
                      {(ticket.status === "new" ||
                        ticket.status === "in_progress") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(ticket.id, "resolved")}
                        >
                          Resolve
                        </Button>
                      )}
                      {ticket.status === "resolved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(ticket.id, "closed")}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
