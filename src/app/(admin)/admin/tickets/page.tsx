"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Ticket,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Send,
  MessageSquare,
  Bug,
  Lightbulb,
  StickyNote,
  Lock,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NoteRow {
  id: string;
  content: string;
  is_internal: boolean;
  email_sent: boolean;
  author_email: string | null;
  created_at: string;
}

interface TicketRow {
  id: string;
  type: string;
  subject: string | null;
  message: string;
  status: string;
  priority: string;
  user_id: string | null;
  user_email: string | null;
  org_name: string | null;
  notes: NoteRow[];
  notes_count: number;
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
  in_progress:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-500",
  normal: "text-blue-500",
  high: "text-amber-500",
  urgent: "text-red-500",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  bug: Bug,
  feature: Lightbulb,
  feedback: MessageSquare,
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Detail sheet
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Note form
  const [noteContent, setNoteContent] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [sendingNote, setSendingNote] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await fetch("/api/admin/tickets");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update ticket");

      toast.success(`Ticket marked as ${newStatus.replace("_", " ")}`);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      if (selectedTicket?.id === id) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: newStatus } : prev
        );
      }
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  const updatePriority = async (id: string, newPriority: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, priority: newPriority }),
      });

      if (!res.ok) throw new Error("Failed to update priority");

      toast.success(`Priority set to ${newPriority}`);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority: newPriority } : t))
      );
      if (selectedTicket?.id === id) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, priority: newPriority } : prev
        );
      }
    } catch {
      toast.error("Failed to update priority");
    }
  };

  const addNote = async () => {
    if (!selectedTicket || !noteContent.trim()) return;
    setSendingNote(true);

    try {
      const res = await fetch(
        `/api/admin/tickets/${selectedTicket.id}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: noteContent.trim(),
            is_internal: isInternal,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to add note");

      const data = await res.json();
      const newNote: NoteRow = data.note;

      // Update ticket in list and selectedTicket
      const updateTicketNotes = (t: TicketRow): TicketRow => ({
        ...t,
        notes: [...t.notes, newNote],
        notes_count: t.notes_count + 1,
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? updateTicketNotes(t) : t))
      );
      setSelectedTicket((prev) => (prev ? updateTicketNotes(prev) : prev));
      setNoteContent("");
      toast.success(
        isInternal ? "Internal note added" : "Response sent"
      );
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSendingNote(false);
    }
  };

  const openTicket = (ticket: TicketRow) => {
    setSelectedTicket(ticket);
    setSheetOpen(true);
    setNoteContent("");
    setIsInternal(true);
  };

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = tickets;

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          t.message.toLowerCase().includes(q) ||
          (t.user_email && t.user_email.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tickets, statusFilter, typeFilter, priorityFilter, search]);

  // Stats
  const stats = useMemo(
    () => ({
      total: tickets.length,
      new: tickets.filter((t) => t.status === "new").length,
      bugs: tickets.filter((t) => t.type === "bug").length,
      features: tickets.filter((t) => t.type === "feature").length,
    }),
    [tickets]
  );

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
        <p className="text-muted-foreground">{tickets.length} tickets total</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.new}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats.bugs}</div>
            <p className="text-xs text-muted-foreground">Bugs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-500">
              {stats.features}
            </div>
            <p className="text-xs text-muted-foreground">Features</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + status filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subject, message, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "new", "in_progress", "resolved", "closed"] as const).map(
            (f) => (
              <Button
                key={f}
                variant={statusFilter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(f)}
                className="capitalize"
              >
                {f.replace("_", " ")}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Type + priority filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "bug", "feature", "feedback"] as const).map((f) => {
            const TypeIcon = f !== "all" ? TYPE_ICONS[f] : null;
            return (
              <Button
                key={f}
                variant={typeFilter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(f)}
                className="capitalize"
              >
                {TypeIcon && <TypeIcon className="h-3.5 w-3.5 mr-1" />}
                {f}
              </Button>
            );
          })}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "low", "normal", "high", "urgent"] as const).map((f) => (
            <Button
              key={f}
              variant={priorityFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setPriorityFilter(f)}
              className={cn(
                "capitalize",
                priorityFilter === f ? "" : PRIORITY_COLORS[f]
              )}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} ticket{filtered.length !== 1 ? "s" : ""} found
      </p>

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
              <Card
                key={ticket.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => openTicket(ticket)}
              >
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
                        <Badge
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {ticket.type}
                        </Badge>
                        <span
                          className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}
                        >
                          {ticket.priority}
                        </span>
                        {ticket.notes_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <StickyNote className="h-3 w-3" />
                            {ticket.notes_count}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium">
                        {ticket.subject || "No subject"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {ticket.user_email && (
                          <span>{ticket.user_email}</span>
                        )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(ticket.id, "in_progress");
                          }}
                        >
                          Start
                        </Button>
                      )}
                      {(ticket.status === "new" ||
                        ticket.status === "in_progress") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(ticket.id, "resolved");
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                      {ticket.status === "resolved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(ticket.id, "closed");
                          }}
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

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg flex flex-col h-full overflow-hidden p-0">
          {selectedTicket && (
            <>
              {/* Header */}
              <div className="p-6 pb-0">
                <SheetHeader>
                  <SheetTitle>
                    {selectedTicket.subject || "No subject"}
                  </SheetTitle>
                  <SheetDescription>
                    {selectedTicket.user_email || "Anonymous"} &middot;{" "}
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </SheetDescription>
                </SheetHeader>

                {/* Status + Priority + Type */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(val) =>
                      updateStatus(selectedTicket.id, val)
                    }
                  >
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(val) =>
                      updatePriority(selectedTicket.id, val)
                    }
                  >
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Badge variant="outline" className="capitalize">
                    {selectedTicket.type}
                  </Badge>
                </div>
              </div>

              {/* Scrollable content */}
              <ScrollArea className="flex-1 px-6">
                <div className="py-4 space-y-4">
                  {/* Original message */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Message</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                  </div>

                  <Separator />

                  {/* Notes thread */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Notes & Responses ({selectedTicket.notes.length})
                    </h4>
                    {selectedTicket.notes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No notes yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedTicket.notes.map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              "rounded-lg p-3 text-sm",
                              note.is_internal
                                ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50"
                                : "bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              {note.is_internal ? (
                                <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              )}
                              <span className="text-xs font-medium">
                                {note.author_email || "Admin"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(note.created_at).toLocaleString()}
                              </span>
                              {note.email_sent && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 h-4"
                                >
                                  Email sent
                                </Badge>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Bottom pinned note form */}
              <div className="border-t p-4 space-y-3">
                <Textarea
                  placeholder={
                    isInternal
                      ? "Add an internal note..."
                      : "Write a response to the user..."
                  }
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!isInternal}
                      onCheckedChange={(checked) => setIsInternal(!checked)}
                    />
                    <span className="text-sm">
                      {isInternal ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Lock className="h-3 w-3" /> Internal note
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Mail className="h-3 w-3" /> Send email
                        </span>
                      )}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={addNote}
                    disabled={!noteContent.trim() || sendingNote}
                  >
                    {sendingNote ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    {isInternal ? "Add Note" : "Send"}
                  </Button>
                </div>

                {/* Warning if public note but no user */}
                {!isInternal && !selectedTicket.user_id && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    This ticket has no associated user — email cannot be sent.
                    The note will still be saved.
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
