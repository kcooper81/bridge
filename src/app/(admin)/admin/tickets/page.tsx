"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import RichEditor from "@/components/admin/rich-editor";
import type { RichEditorRef } from "@/components/admin/rich-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
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
  DollarSign,
  Inbox,
  Trash2,
  ArrowUp,
  XCircle,
  Paperclip,
  Zap,
  History,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  PartyPopper,
  UserRound,
  UserRoundX,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

// --- Types ---

interface NoteRow {
  id: string;
  content: string;
  is_internal: boolean;
  email_sent: boolean;
  author_email: string | null;
  created_at: string;
}

interface AttachmentMeta {
  filename: string;
  content_type: string;
  size: number;
}

interface TicketRow {
  id: string;
  type: string;
  subject: string | null;
  message: string;
  html_body: string | null;
  sender_name: string | null;
  status: string;
  priority: string;
  user_id: string | null;
  user_email: string | null;
  org_name: string | null;
  inbox_email: string | null;
  assigned_to: string | null;
  assigned_email: string | null;
  assigned_name: string | null;
  attachments: AttachmentMeta[];
  notes: NoteRow[];
  notes_count: number;
  created_at: string;
  updated_at: string;
}

interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  super_admin_role: string | null;
}

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
}

// --- Constants ---

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
  email: Mail,
  sales: DollarSign,
};

type QuickFilter = "all" | "unread" | "open" | "mine" | "unassigned" | "resolved" | "closed";

// --- Helpers ---

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

/** Get the last response/activity time for a ticket */
function lastActivity(ticket: TicketRow): string {
  if (ticket.notes.length > 0) {
    return ticket.notes[ticket.notes.length - 1].created_at;
  }
  return ticket.updated_at || ticket.created_at;
}

/** SLA color based on wait time since last activity */
function slaColor(dateStr: string): string {
  const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  if (hours < 4) return "text-green-600 dark:text-green-400";
  if (hours < 24) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

/** Smart sort: unread first, then by most recent activity */
function smartSort(a: TicketRow, b: TicketRow): number {
  const aIsNew = a.status === "new" ? 1 : 0;
  const bIsNew = b.status === "new" ? 1 : 0;
  if (aIsNew !== bIsNew) return bIsNew - aIsNew;

  const aUrgent = a.priority === "urgent" ? 1 : a.priority === "high" ? 0.5 : 0;
  const bUrgent = b.priority === "urgent" ? 1 : b.priority === "high" ? 0.5 : 0;
  if (aUrgent !== bUrgent) return bUrgent - aUrgent;

  return new Date(lastActivity(b)).getTime() - new Date(lastActivity(a)).getTime();
}

// --- Email HTML renderer ---

function EmailHtmlBody({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resizeIframe = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
      if (height > 60) {
        iframe.style.height = `${height}px`;
      }
    };

    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #374151; margin: 0; padding: 8px 0; word-wrap: break-word; }
        a { color: #2563eb; }
        img { max-width: 100%; height: auto; }
        blockquote { border-left: 3px solid #d1d5db; margin: 8px 0; padding: 4px 12px; color: #6b7280; }
        pre { background: #f3f4f6; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 13px; }
        table { border-collapse: collapse; max-width: 100%; }
        td, th { padding: 4px 8px; }
      </style></head><body>${html}</body></html>`);
      doc.close();
      iframe.onload = resizeIframe;
      // Multiple retries to catch late-rendering content
      setTimeout(resizeIframe, 50);
      setTimeout(resizeIframe, 200);
      setTimeout(resizeIframe, 500);
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0"
      sandbox="allow-same-origin"
      style={{ minHeight: "120px" }}
      title="Email content"
    />
  );
}

// --- Read-only ticket content (shared between split pane and sheet) ---

function TicketContent({
  ticket,
  tickets,
  staff,
  onSelectTicket,
  updateStatus,
  updatePriority,
  assignTicket,
}: {
  ticket: TicketRow;
  tickets: TicketRow[];
  staff: StaffMember[];
  onSelectTicket: (t: TicketRow) => void;
  updateStatus: (id: string, status: string) => void;
  updatePriority: (id: string, priority: string) => void;
  assignTicket: (id: string, assignedTo: string | null) => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const customerHistory = useMemo(() => {
    if (!ticket?.user_email) return [];
    return tickets.filter(
      (t) => t.id !== ticket.id && t.user_email === ticket.user_email
    );
  }, [tickets, ticket]);

  return (
    <>
      {/* Header */}
      <div className="p-5 pb-3 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold leading-tight">
          {ticket.subject || "No subject"}
        </h2>
        <div className="flex items-center gap-2 flex-wrap mt-1 text-sm text-muted-foreground">
          <span>{ticket.user_email || "Anonymous"}</span>
          <span>&middot;</span>
          <span>{new Date(ticket.created_at).toLocaleString()}</span>
          {ticket.org_name && (
            <>
              <span>&middot;</span>
              <span>{ticket.org_name}</span>
            </>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Select
            value={ticket.status}
            onValueChange={(val) => updateStatus(ticket.id, val)}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
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
            value={ticket.priority}
            onValueChange={(val) => updatePriority(ticket.id, val)}
          >
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={ticket.assigned_to || "_unassigned"}
            onValueChange={(val) => assignTicket(ticket.id, val === "_unassigned" ? null : val)}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <UserRound className="h-3 w-3 flex-shrink-0" />
                <SelectValue placeholder="Unassigned" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_unassigned">
                <span className="flex items-center gap-1.5">
                  <UserRoundX className="h-3 w-3 text-muted-foreground" />
                  Unassigned
                </span>
              </SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="truncate">{s.name || s.email}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="outline" className="capitalize text-xs">
            {ticket.type}
          </Badge>
          {ticket.inbox_email && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Inbox className="h-3 w-3" />
              {ticket.inbox_email}
            </Badge>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-5 space-y-5">
          {/* Original message — email-style display */}
          <div className="rounded-lg border overflow-hidden">
            {/* Email header */}
            <div className="bg-muted/50 px-4 py-2.5 text-xs space-y-1 border-b">
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-10 flex-shrink-0">From</span>
                <span className="text-foreground">
                  {ticket.sender_name && ticket.sender_name !== ticket.user_email ? (
                    <>
                      <span className="font-medium">{ticket.sender_name}</span>
                      {ticket.user_email && (
                        <span className="text-muted-foreground"> &lt;{ticket.user_email}&gt;</span>
                      )}
                    </>
                  ) : (
                    <span className="font-medium">{ticket.user_email || "Anonymous"}</span>
                  )}
                </span>
              </div>
              {ticket.inbox_email && (
                <div className="flex gap-2">
                  <span className="font-medium text-muted-foreground w-10 flex-shrink-0">To</span>
                  <span className="text-foreground">{ticket.inbox_email}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-10 flex-shrink-0">Date</span>
                <span className="text-foreground">
                  {new Date(ticket.created_at).toLocaleString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Email body */}
            <div className="p-5">
              {ticket.html_body ? (
                <EmailHtmlBody html={ticket.html_body} />
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {ticket.message}
                </p>
              )}
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                Attachments ({ticket.attachments.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs bg-muted/50"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{att.filename}</span>
                    <span className="text-muted-foreground">
                      {formatBytes(att.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer history */}
          {customerHistory.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex items-center gap-1.5 text-sm font-medium hover:text-foreground transition-colors"
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    historyOpen && "rotate-90"
                  )}
                />
                <History className="h-3.5 w-3.5" />
                Customer History ({customerHistory.length} other ticket{customerHistory.length !== 1 ? "s" : ""})
              </button>
              {historyOpen && (
                <div className="mt-2 space-y-1.5 pl-5">
                  {customerHistory.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-xs rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        onSelectTicket(t);
                        setHistoryOpen(false);
                      }}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          STATUS_COLORS[t.status]
                        )}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="font-medium truncate flex-1">
                        {t.subject || "No subject"}
                      </span>
                      <span className="text-muted-foreground flex-shrink-0">
                        {timeAgo(t.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Notes thread */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Notes & Responses ({ticket.notes.length})
            </h4>
            {ticket.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No notes yet
              </p>
            ) : (
              <div className="space-y-3">
                {ticket.notes.map((note) => (
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
                    {!note.is_internal && note.content.startsWith("<") ? (
                      <div
                        className="prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:underline"
                        dangerouslySetInnerHTML={{
                          __html: note.content
                            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                            .replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
                            .replace(/<iframe\b[^>]*>/gi, "")
                            .replace(/<object\b[^>]*>/gi, "")
                            .replace(/<embed\b[^>]*>/gi, "")
                        }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

// --- Main Component ---

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("unread");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Detail
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false); // mobile only

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Note form
  const [noteContent, setNoteContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);
  const editorRef = useRef<RichEditorRef>(null);

  // Canned responses
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [showAddCanned, setShowAddCanned] = useState(false);
  const [newCannedTitle, setNewCannedTitle] = useState("");
  const [newCannedContent, setNewCannedContent] = useState("");
  const [newCannedCategory, setNewCannedCategory] = useState("general");

  // Resolved/closed section
  const [showResolved, setShowResolved] = useState(false);

  // Track focused index for keyboard nav
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tickets");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      const fresh = data.tickets || [];
      setTickets(fresh);
      setSelectedTicket((prev) => {
        if (!prev) return null;
        const updated = fresh.find((t: TicketRow) => t.id === prev.id);
        return updated || null;
      });
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCannedResponses = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/canned-responses");
      if (res.ok) {
        const data = await res.json();
        setCannedResponses(data.responses || []);
      }
    } catch {
      // Non-critical
    }
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadTickets();
    loadCannedResponses();
    loadStaff();

    const supabase = createClient();
    const channel = supabase
      .channel("admin-tickets-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback" },
        () => loadTickets()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "feedback" },
        () => loadTickets()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_notes" },
        () => loadTickets()
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("Realtime channel error — falling back to polling");
        }
      });

    const pollInterval = setInterval(loadTickets, 10000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadTickets();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleFocus = () => loadTickets();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, [loadTickets, loadCannedResponses, loadStaff]);

  // --- Actions ---

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
      setSelectedTicket((prev) => (prev?.id === id ? { ...prev, status } : prev));
      toast.success(`Status updated to ${status.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const updatePriority = async (id: string, priority: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, priority }),
      });
      if (!res.ok) throw new Error("Failed");
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority } : t))
      );
      setSelectedTicket((prev) => (prev?.id === id ? { ...prev, priority } : prev));
      toast.success(`Priority updated to ${priority}`);
    } catch {
      toast.error("Failed to update priority");
    }
  };

  const assignTicket = async (id: string, assignedTo: string | null) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, assigned_to: assignedTo }),
      });
      if (!res.ok) throw new Error("Failed");
      const assignee = assignedTo ? staff.find((s) => s.id === assignedTo) : null;
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, assigned_to: assignedTo, assigned_email: assignee?.email || null, assigned_name: assignee?.name || null }
            : t
        )
      );
      setSelectedTicket((prev) =>
        prev?.id === id
          ? { ...prev, assigned_to: assignedTo, assigned_email: assignee?.email || null, assigned_name: assignee?.name || null }
          : prev
      );
      toast.success(assignedTo ? `Assigned to ${assignee?.name || assignee?.email}` : "Unassigned");
    } catch {
      toast.error("Failed to assign ticket");
    }
  };

  const bulkUpdate = async (updates: { status?: string; priority?: string }) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), ...updates }),
      });
      if (!res.ok) throw new Error("Failed");
      setTickets((prev) =>
        prev.map((t) => (selected.has(t.id) ? { ...t, ...updates } : t))
      );
      toast.success(`Updated ${selected.size} ticket(s)`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to update tickets");
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} ticket(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Failed");
      setTickets((prev) => prev.filter((t) => !selected.has(t.id)));
      if (selectedTicket && selected.has(selectedTicket.id)) {
        setSelectedTicket(null);
      }
      toast.success(`Deleted ${selected.size} ticket(s)`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to delete tickets");
    } finally {
      setBulkLoading(false);
    }
  };

  const addNote = async () => {
    const isReply = !isInternal;
    let content: string;
    let isHtml = false;

    if (isReply && editorRef.current) {
      if (editorRef.current.isEmpty()) return;
      content = editorRef.current.getHTML();
      isHtml = true;
    } else {
      if (!noteContent.trim()) return;
      content = noteContent.trim();
    }

    if (!selectedTicket) return;
    setSendingNote(true);

    try {
      const res = await fetch(
        `/api/admin/tickets/${selectedTicket.id}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            is_internal: isInternal,
            is_html: isHtml,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to add note");

      const data = await res.json();
      const newNote: NoteRow = data.note;

      // Auto-assign: if ticket was unassigned, the API auto-assigned to current user
      const wasUnassigned = !selectedTicket.assigned_to;
      const updateTicketNotes = (t: TicketRow): TicketRow => ({
        ...t,
        notes: [...t.notes, newNote],
        notes_count: t.notes_count + 1,
        ...(wasUnassigned && user ? { assigned_to: user.id, assigned_email: user.email || null, assigned_name: null } : {}),
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? updateTicketNotes(t) : t))
      );
      setSelectedTicket((prev) => (prev ? updateTicketNotes(prev) : prev));
      setNoteContent("");
      if (editorRef.current) editorRef.current.clear();
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
    setNoteContent("");
    setIsInternal(false);
  };

  const openTicketMobile = (ticket: TicketRow) => {
    openTicket(ticket);
    setSheetOpen(true);
  };

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === activeFiltered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(activeFiltered.map((t) => t.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  const insertCanned = (content: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(content);
    } else {
      setNoteContent((prev) => (prev ? `${prev}\n\n${content}` : content));
    }
    setCannedOpen(false);
  };

  const saveCannedResponse = async () => {
    if (!newCannedTitle.trim() || !newCannedContent.trim()) return;
    try {
      const res = await fetch("/api/admin/canned-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCannedTitle.trim(),
          content: newCannedContent.trim(),
          category: newCannedCategory,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCannedResponses((prev) => [...prev, data.response]);
      setNewCannedTitle("");
      setNewCannedContent("");
      setShowAddCanned(false);
      toast.success("Template saved");
    } catch {
      toast.error("Failed to save template");
    }
  };

  const deleteCannedResponse = async (id: string) => {
    try {
      await fetch("/api/admin/canned-responses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setCannedResponses((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Failed to delete template");
    }
  };

  // --- Filtering & Sorting ---

  const filtered = useMemo(() => {
    let result = tickets;

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
          (t.user_email && t.user_email.toLowerCase().includes(q)) ||
          t.notes.some((n) => n.content.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tickets, typeFilter, priorityFilter, search]);

  // Split into active (new/in_progress) and resolved/closed
  const activeFiltered = useMemo(() => {
    let result = filtered;

    if (quickFilter === "unread") {
      result = result.filter((t) => t.status === "new");
    } else if (quickFilter === "open") {
      result = result.filter((t) => t.status === "new" || t.status === "in_progress");
    } else if (quickFilter === "mine") {
      result = result.filter((t) => t.assigned_to === user?.id && t.status !== "closed");
    } else if (quickFilter === "unassigned") {
      result = result.filter((t) => !t.assigned_to && t.status !== "resolved" && t.status !== "closed");
    } else if (quickFilter === "resolved") {
      result = result.filter((t) => t.status === "resolved");
    } else if (quickFilter === "closed") {
      result = result.filter((t) => t.status === "closed");
    }

    return [...result].sort(smartSort);
  }, [filtered, quickFilter]);

  // Separate resolved/closed for collapsible section (only shown in "all" view)
  const resolvedTickets = useMemo(() => {
    if (quickFilter !== "all") return [];
    return filtered
      .filter((t) => t.status === "resolved" || t.status === "closed")
      .sort((a, b) => new Date(lastActivity(b)).getTime() - new Date(lastActivity(a)).getTime());
  }, [filtered, quickFilter]);

  const openTickets = useMemo(() => {
    if (quickFilter !== "all") return activeFiltered;
    return activeFiltered.filter((t) => t.status !== "resolved" && t.status !== "closed");
  }, [activeFiltered, quickFilter]);

  // Stats
  const stats = useMemo(
    () => ({
      total: tickets.length,
      new: tickets.filter((t) => t.status === "new").length,
      open: tickets.filter((t) => t.status === "in_progress").length,
      mine: tickets.filter((t) => t.assigned_to === user?.id && t.status !== "closed").length,
      unassigned: tickets.filter((t) => !t.assigned_to && t.status !== "resolved" && t.status !== "closed").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    }),
    [tickets, user?.id]
  );

  // Canned responses by category
  const cannedByCategory = useMemo(() => {
    const map = new Map<string, CannedResponse[]>();
    for (const r of cannedResponses) {
      const arr = map.get(r.category) || [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return map;
  }, [cannedResponses]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const visibleTickets = quickFilter === "all" ? openTickets : activeFiltered;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.min(prev + 1, visibleTickets.length - 1);
          if (visibleTickets[next]) openTicket(visibleTickets[next]);
          return next;
        });
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          if (visibleTickets[next]) openTicket(visibleTickets[next]);
          return next;
        });
      } else if (e.key === "r") {
        if (selectedTicket) {
          e.preventDefault();
          setIsInternal(false);
        }
      } else if (e.key === "n") {
        if (selectedTicket) {
          e.preventDefault();
          setIsInternal(true);
        }
      } else if (e.key === "e") {
        if (selectedTicket) {
          e.preventDefault();
          updateStatus(selectedTicket.id, "resolved");
        }
      } else if (e.key === "Escape") {
        if (sheetOpen) {
          setSheetOpen(false);
        } else {
          setSelectedTicket(null);
          setFocusedIndex(-1);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicket, sheetOpen, openTickets, activeFiltered, quickFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // --- Render helpers ---

  const renderTicketRow = (ticket: TicketRow, index: number, isMobile: boolean) => {
    const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;
    const TypeIcon = TYPE_ICONS[ticket.type] || MessageSquare;
    const isNew = ticket.status === "new";
    const isSelected = selected.has(ticket.id);
    const isActive = selectedTicket?.id === ticket.id;
    const hasAttachments = ticket.attachments && ticket.attachments.length > 0;
    const activity = lastActivity(ticket);
    const hasReply = ticket.notes.some((n) => !n.is_internal);

    return (
      <div
        key={ticket.id}
        className={cn(
          "flex gap-3 px-4 py-3.5 cursor-pointer transition-colors",
          isActive
            ? "bg-primary/10 border-l-2 border-l-primary"
            : isNew
              ? "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500 hover:bg-blue-100/70 dark:hover:bg-blue-950/30"
              : "border-l-2 border-l-transparent hover:bg-accent/60",
          isSelected && !isActive && "bg-primary/5",
          focusedIndex === index && !isActive && "ring-1 ring-inset ring-primary/30"
        )}
        onClick={() => isMobile ? openTicketMobile(ticket) : openTicket(ticket)}
      >
        {/* Left: checkbox + unread dot */}
        <div className="flex items-center gap-2 pt-0.5 flex-shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelect(ticket.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${ticket.subject || ticket.id}`}
          />
          <div className="w-2">
            {isNew && <div className="h-2 w-2 rounded-full bg-blue-500" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Line 1: sender + time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <TypeIcon className={cn("h-3 w-3 flex-shrink-0", isNew ? "text-foreground" : "text-muted-foreground")} />
              <span className={cn("truncate text-xs", isNew ? "font-semibold" : "text-muted-foreground")}>
                {ticket.sender_name || ticket.user_email || "Anonymous"}
              </span>
              {ticket.inbox_email && (
                <span className="hidden sm:inline text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5 flex-shrink-0">
                  {ticket.inbox_email.split("@")[0]}
                </span>
              )}
            </div>
            <span className={cn("text-[11px] flex-shrink-0", hasReply ? "text-muted-foreground" : slaColor(activity))}>
              {timeAgo(activity)}
            </span>
          </div>

          {/* Line 2: subject + preview */}
          <div className="flex items-center gap-2 mt-0.5">
            <p className={cn("truncate text-xs", isNew ? "font-medium text-foreground" : "text-muted-foreground")}>
              {ticket.subject || "No subject"}
              <span className="hidden sm:inline font-normal text-muted-foreground">
                {" — "}{ticket.message.replace(/^From:.*?\n\n/, "").slice(0, 50)}
              </span>
            </p>
          </div>

          {/* Line 3: badges */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                STATUS_COLORS[ticket.status] || ""
              )}
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {ticket.status.replace("_", " ")}
            </span>
            <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 h-4">
              {ticket.type}
            </Badge>
            {ticket.priority !== "normal" && (
              <span className={cn("text-[10px] font-semibold capitalize", PRIORITY_COLORS[ticket.priority])}>
                {ticket.priority}
              </span>
            )}
            {hasAttachments && (
              <Paperclip className="h-3 w-3 text-muted-foreground" />
            )}
            {ticket.notes_count > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <StickyNote className="h-3 w-3" />
                {ticket.notes_count}
              </span>
            )}
            {ticket.assigned_to && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground" title={`Assigned to ${ticket.assigned_name || ticket.assigned_email}`}>
                <UserRound className="h-3 w-3" />
                {(ticket.assigned_name || ticket.assigned_email || "").split("@")[0]}
              </span>
            )}
            {/* Waiting indicator: no admin reply yet */}
            {!hasReply && ticket.status !== "closed" && ticket.status !== "resolved" && (
              <span className={cn("text-[10px] font-medium", slaColor(activity))}>
                Awaiting reply
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTicketList = (ticketsList: TicketRow[], isMobile: boolean) => (
    <div className="divide-y">
      {ticketsList.map((ticket, i) => renderTicketRow(ticket, i, isMobile))}
    </div>
  );

  const renderEmptyState = () => {
    if (quickFilter === "unread" && stats.new === 0 && stats.total > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PartyPopper className="h-10 w-10 text-green-500 mb-3" />
          <p className="font-medium text-foreground">Inbox zero!</p>
          <p className="text-sm text-muted-foreground mt-1">
            All caught up. No unread tickets.
          </p>
        </div>
      );
    }
    if (quickFilter === "mine" && stats.mine === 0 && stats.total > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UserRound className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No tickets assigned to you</p>
          <p className="text-sm text-muted-foreground mt-1">
            Pick up tickets from the Unassigned tab.
          </p>
        </div>
      );
    }
    if (quickFilter === "unassigned" && stats.unassigned === 0 && stats.total > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PartyPopper className="h-10 w-10 text-green-500 mb-3" />
          <p className="font-medium text-foreground">All tickets assigned!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Every open ticket has an owner.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No tickets found</p>
      </div>
    );
  };

  // Reply form JSX — rendered inline in the parent so the ref stays connected
  const replyForm = selectedTicket && (
    <div className="border-t-2 border-primary/20 bg-muted/30 p-4 space-y-3 flex-shrink-0">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <button
          type="button"
          onClick={() => setIsInternal(false)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            !isInternal
              ? "bg-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Mail className="h-3.5 w-3.5" />
          Reply
        </button>
        <button
          type="button"
          onClick={() => setIsInternal(true)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isInternal
              ? "bg-amber-500 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Lock className="h-3.5 w-3.5" />
          Internal Note
        </button>
      </div>

      {/* Reply context */}
      {!isInternal && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 px-3 py-2 text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-medium text-foreground">To:</span>
            {selectedTicket.user_email || (
              <span className="text-amber-600 dark:text-amber-400">
                No email found
              </span>
            )}
          </div>
          {selectedTicket.inbox_email && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium text-foreground">From:</span>
              {selectedTicket.inbox_email}
            </div>
          )}
        </div>
      )}

      {/* Templates + editor/textarea */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Popover open={cannedOpen} onOpenChange={setCannedOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Zap className="h-3 w-3" />
                Templates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              {showAddCanned ? (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">New Template</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowAddCanned(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Title"
                    value={newCannedTitle}
                    onChange={(e) => setNewCannedTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Textarea
                    placeholder="Response content..."
                    value={newCannedContent}
                    onChange={(e) => setNewCannedContent(e.target.value)}
                    rows={3}
                    className="text-xs resize-none"
                  />
                  <Select value={newCannedCategory} onValueChange={setNewCannedCategory}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="w-full h-7 text-xs" onClick={saveCannedResponse}>
                    Save Template
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground px-1">Insert a template</p>
                  </div>
                  <ScrollArea className="max-h-60">
                    {cannedResponses.length === 0 ? (
                      <p className="p-3 text-xs text-muted-foreground text-center">
                        No templates yet
                      </p>
                    ) : (
                      <div className="p-1">
                        {Array.from(cannedByCategory.entries()).map(([category, items]) => (
                          <div key={category}>
                            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {category}
                            </p>
                            {items.map((r) => (
                              <div
                                key={r.id}
                                className="group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted transition-colors"
                              >
                                <button
                                  type="button"
                                  className="flex-1 text-left"
                                  onClick={() => insertCanned(r.content)}
                                >
                                  <p className="text-xs font-medium">{r.title}</p>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                                    {r.content}
                                  </p>
                                </button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCannedResponse(r.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs gap-1"
                      onClick={() => setShowAddCanned(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Add Template
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {!isInternal && (
            <span className="text-[10px] text-muted-foreground">
              Replies include email signature automatically
            </span>
          )}
        </div>

        {isInternal ? (
          <Textarea
            placeholder="Add an internal note (only visible to admins)..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
            className="resize-y min-h-[80px]"
          />
        ) : (
          <RichEditor
            ref={editorRef}
            placeholder="Write your reply to the customer..."
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        {!isInternal && !selectedTicket.user_email ? (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            No customer email — reply saved but not sent.
          </p>
        ) : (
          <div />
        )}

        <Button
          size="sm"
          onClick={addNote}
          disabled={sendingNote}
          variant={isInternal ? "outline" : "default"}
        >
          {sendingNote ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : isInternal ? (
            <StickyNote className="h-4 w-4 mr-1" />
          ) : (
            <Send className="h-4 w-4 mr-1" />
          )}
          {isInternal ? "Add Note" : "Send Reply"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            {stats.new + stats.open > 0
              ? `${stats.new + stats.open} open · ${stats.total} total`
              : `${stats.total} tickets`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">j</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">k</kbd>
          <span>navigate</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] ml-2">r</kbd>
          <span>reply</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] ml-2">e</kbd>
          <span>resolve</span>
        </div>
      </div>

      {/* Quick filter tabs */}
      <div className="flex items-center gap-1 border-b">
        {([
          { key: "unread" as QuickFilter, label: "Unread", count: stats.new },
          { key: "open" as QuickFilter, label: "Open", count: stats.new + stats.open },
          { key: "mine" as QuickFilter, label: "Mine", count: stats.mine },
          { key: "unassigned" as QuickFilter, label: "Unassigned", count: stats.unassigned },
          { key: "resolved" as QuickFilter, label: "Resolved", count: stats.resolved },
          { key: "closed" as QuickFilter, label: "Closed", count: stats.closed },
          { key: "all" as QuickFilter, label: "All", count: stats.total },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setQuickFilter(tab.key); setFocusedIndex(-1); }}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              quickFilter === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "ml-1.5 text-xs rounded-full px-1.5 py-0.5",
                quickFilter === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + secondary filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets, messages, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Select all + bulk actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap min-h-[32px]">
        <div className="flex items-center gap-2">
          {openTickets.length > 0 && (
            <Checkbox
              checked={selected.size === activeFiltered.length && activeFiltered.length > 0}
              onCheckedChange={selectAll}
              aria-label="Select all"
            />
          )}
          <p className="text-xs text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} of ${activeFiltered.length} selected`
              : `${activeFiltered.length} result${activeFiltered.length !== 1 ? "s" : ""}`}
          </p>
          {selected.size > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs h-6 px-1.5">
              Clear
            </Button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={bulkLoading} onClick={() => bulkUpdate({ status: "in_progress" })}>
              <Clock className="h-3 w-3 mr-1" /> Start
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={bulkLoading} onClick={() => bulkUpdate({ status: "resolved" })}>
              <CheckCircle className="h-3 w-3 mr-1" /> Resolve
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={bulkLoading} onClick={() => bulkUpdate({ status: "closed" })}>
              <XCircle className="h-3 w-3 mr-1" /> Close
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={bulkLoading} onClick={() => bulkUpdate({ priority: "urgent" })}>
              <ArrowUp className="h-3 w-3 mr-1 text-red-500" /> Urgent
            </Button>
            <Button variant="destructive" size="sm" className="h-7 text-xs" disabled={bulkLoading} onClick={bulkDelete}>
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Split pane: ticket list + detail (desktop) / full-width list (mobile) */}
      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-0 lg:border lg:rounded-lg lg:overflow-hidden lg:bg-card" style={{ minHeight: "calc(100vh - 130px)" }}>
        {/* Left: Ticket list */}
        <div className="border rounded-lg lg:rounded-none lg:border-0 lg:border-r bg-card lg:flex lg:flex-col" style={{ maxHeight: "calc(100vh - 130px)" }}>
          <ScrollArea className="flex-1">
            {openTickets.length === 0 && resolvedTickets.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {/* Active tickets (visible on mobile too) */}
                <div className="lg:hidden">
                  {openTickets.length === 0
                    ? renderEmptyState()
                    : renderTicketList(openTickets, true)}
                </div>
                <div className="hidden lg:block">
                  {openTickets.length === 0 && quickFilter !== "all"
                    ? renderEmptyState()
                    : renderTicketList(openTickets, false)}
                </div>

                {/* Resolved/closed collapsible section (only in "all" view) */}
                {quickFilter === "all" && resolvedTickets.length > 0 && (
                  <div className="border-t">
                    <button
                      type="button"
                      onClick={() => setShowResolved(!showResolved)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {showResolved ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      <CheckCircle className="h-3.5 w-3.5" />
                      Resolved & Closed ({resolvedTickets.length})
                    </button>
                    {showResolved && (
                      <>
                        <div className="hidden lg:block">
                          {renderTicketList(resolvedTickets, false)}
                        </div>
                        <div className="lg:hidden">
                          {renderTicketList(resolvedTickets, true)}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>

        {/* Right: Detail panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-col" style={{ maxHeight: "calc(100vh - 130px)" }}>
          {selectedTicket ? (
            <>
              <TicketContent
                ticket={selectedTicket}
                tickets={tickets}
                staff={staff}
                onSelectTicket={openTicket}
                updateStatus={updateStatus}
                updatePriority={updatePriority}
                assignTicket={assignTicket}
              />
              {replyForm}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-12">
              <div>
                <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Select a ticket to view details
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px]">j</kbd> / <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px]">k</kbd> to navigate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Sheet flyout */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col h-full overflow-hidden p-0 lg:hidden">
          {selectedTicket && sheetOpen && (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedTicket.subject || "Ticket"}</SheetTitle>
                <SheetDescription>Ticket details and reply</SheetDescription>
              </SheetHeader>
              <TicketContent
                ticket={selectedTicket}
                tickets={tickets}
                staff={staff}
                onSelectTicket={openTicket}
                updateStatus={updateStatus}
                updatePriority={updatePriority}
                assignTicket={assignTicket}
              />
              {replyForm}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
