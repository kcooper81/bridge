"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import RichEditor from "@/components/admin/rich-editor";
import type { RichEditorRef } from "@/components/admin/rich-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Paperclip,
  Zap,
  History,
  ChevronRight,
  Plus,
  X,
  PartyPopper,
  UserRound,
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
  closed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const STATUS_LABELS: Record<string, string> = {
  new: "new",
  in_progress: "in progress",
  resolved: "done",
  closed: "done",
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

type QuickFilter = "all" | "open" | "mine" | "unassigned" | "resolved" | "closed";

// Add Filter icon
import { Filter } from "lucide-react";

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
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Revoke previous blob URL
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

    // Build a full HTML document with base styles
    const fullHtml = `<!DOCTYPE html><html><head><style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #374151; margin: 0; padding: 8px 0; word-wrap: break-word; }
      a { color: #2563eb; }
      img { max-width: 100%; height: auto; }
      blockquote { border-left: 3px solid #d1d5db; margin: 8px 0; padding: 4px 12px; color: #6b7280; }
      pre { background: #f3f4f6; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 13px; }
      table { border-collapse: collapse; max-width: 100%; }
      td, th { padding: 4px 8px; }
    </style></head><body>${html}</body></html>`;

    // Use a blob URL so the iframe gets its own origin, bypassing the parent page's CSP
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    iframe.src = url;

    const resizeIframe = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
        if (height > 60) iframe.style.height = `${height}px`;
      } catch {
        // Cross-origin after blob load — use fallback height
      }
    };

    iframe.onload = () => {
      resizeIframe();
      setTimeout(resizeIframe, 200);
      setTimeout(resizeIframe, 500);
    };

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
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
      {/* Header — compact with clear hierarchy */}
      <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-3 border-b flex-shrink-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 sm:truncate">
              {ticket.subject || "No subject"}
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              {ticket.sender_name && ticket.sender_name !== ticket.user_email
                ? `${ticket.sender_name} <${ticket.user_email}>`
                : ticket.user_email || "Anonymous"}
              {ticket.org_name && ` · ${ticket.org_name}`}
              <span className="hidden sm:inline">
                {" · "}{new Date(ticket.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge variant="outline" className="capitalize text-[10px] h-5">
              {ticket.type}
            </Badge>
            {ticket.inbox_email && (
              <Badge variant="secondary" className="text-[10px] h-5 gap-0.5 hidden sm:inline-flex">
                <Inbox className="h-2.5 w-2.5" />
                {ticket.inbox_email.split("@")[0]}
              </Badge>
            )}
          </div>
        </div>

        {/* Controls — stacked on mobile, inline on larger */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">Status</span>
            <Select value={ticket.status === "resolved" ? "closed" : ticket.status} onValueChange={(val) => updateStatus(ticket.id, val)}>
              <SelectTrigger className="w-full sm:w-[115px] h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">Priority</span>
            <Select value={ticket.priority} onValueChange={(val) => updatePriority(ticket.id, val)}>
              <SelectTrigger className="w-full sm:w-[95px] h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">Assignee</span>
            <Select value={ticket.assigned_to || "_unassigned"} onValueChange={(val) => assignTicket(ticket.id, val === "_unassigned" ? null : val)}>
              <SelectTrigger className="w-full sm:w-[140px] h-7 text-xs">
                <div className="flex items-center gap-1 truncate">
                  <UserRound className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Unassigned" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_unassigned">Unassigned</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name || s.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="px-3 sm:px-5 py-3 sm:py-4 space-y-4">
          {/* Original message — prominent card */}
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 text-[11px] flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3 w-3 text-primary" />
                </div>
                <span className="font-medium text-foreground">
                  {ticket.sender_name || ticket.user_email?.split("@")[0] || "Customer"}
                </span>
                {ticket.inbox_email && (
                  <span className="text-muted-foreground">
                    to {ticket.inbox_email.split("@")[0]}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                {new Date(ticket.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            <div className="p-4">
              {ticket.html_body ? (
                <EmailHtmlBody html={ticket.html_body} />
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {ticket.message}
                </p>
              )}
            </div>
            {/* Attachments inline with message */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {ticket.attachments.map((att, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] bg-muted/50">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{att.filename}</span>
                    <span className="text-muted-foreground">{formatBytes(att.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer history */}
          {customerHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className={cn("h-3 w-3 transition-transform", historyOpen && "rotate-90")} />
              <History className="h-3 w-3" />
              {customerHistory.length} previous ticket{customerHistory.length !== 1 ? "s" : ""}
            </button>
          )}
          {historyOpen && customerHistory.length > 0 && (
            <div className="space-y-1 pl-4">
              {customerHistory.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 text-[11px] rounded border px-2.5 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { onSelectTicket(t); setHistoryOpen(false); }}
                >
                  <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_COLORS[t.status])}>
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                  <span className="font-medium truncate flex-1">{t.subject || "No subject"}</span>
                  <span className="text-muted-foreground flex-shrink-0">{timeAgo(t.created_at)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes thread — timeline style */}
          {ticket.notes.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Activity ({ticket.notes.length})
                </h4>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Timeline line */}
              <div className="relative pl-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

                <div className="space-y-3">
                  {ticket.notes.map((note) => (
                    <div key={note.id} className="relative">
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute -left-6 top-2.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center",
                        note.is_internal
                          ? "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700"
                          : "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700"
                      )}>
                        {note.is_internal ? (
                          <Lock className="h-2 w-2 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Send className="h-2 w-2 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>

                      {/* Note card */}
                      <div className={cn(
                        "rounded-lg border text-sm",
                        note.is_internal
                          ? "border-amber-200 dark:border-amber-800/50"
                          : "border-blue-200 dark:border-blue-800/50"
                      )}>
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-[11px]",
                          note.is_internal
                            ? "bg-amber-50/80 dark:bg-amber-950/30"
                            : "bg-blue-50/80 dark:bg-blue-950/30"
                        )}>
                          <span className="font-medium">{note.author_email || "Admin"}</span>
                          <span className="text-muted-foreground">{timeAgo(note.created_at)}</span>
                          {note.is_internal && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Internal</span>
                          )}
                          {note.email_sent && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
                              <CheckCircle className="h-2.5 w-2.5" /> Sent
                            </span>
                          )}
                        </div>
                        <div className="px-3 py-2.5">
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
                            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("open");
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
      toast.success(status === "closed" ? "Marked as done" : `Status → ${status.replace("_", " ")}`);
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
      // Auto-progress: replying to a "new" ticket marks it as "in_progress" (read but still open)
      const wasUnassigned = !selectedTicket.assigned_to;
      const shouldProgress = isReply && selectedTicket.status === "new";
      const updateTicketNotes = (t: TicketRow): TicketRow => ({
        ...t,
        notes: [...t.notes, newNote],
        notes_count: t.notes_count + 1,
        ...(shouldProgress ? { status: "in_progress" } : {}),
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

    if (quickFilter === "open") {
      result = result.filter((t) => t.status === "new" || t.status === "in_progress");
    } else if (quickFilter === "mine") {
      result = result.filter((t) => t.assigned_to === user?.id && t.status !== "closed");
    } else if (quickFilter === "unassigned") {
      result = result.filter((t) => !t.assigned_to && t.status !== "resolved" && t.status !== "closed");
    } else if (quickFilter === "resolved") {
      result = result.filter((t) => t.status === "resolved" || t.status === "closed");
    }

    return [...result].sort(smartSort);
  }, [filtered, quickFilter, user?.id]);

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
          updateStatus(selectedTicket.id, "closed");
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

  // Auto-select first ticket on initial load (desktop only)
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (!loading && !hasAutoSelected.current && openTickets.length > 0 && !selectedTicket) {
      // Only auto-select on desktop (lg breakpoint = 1024px)
      if (window.innerWidth >= 1024) {
        setSelectedTicket(openTickets[0]);
        setFocusedIndex(0);
      }
      hasAutoSelected.current = true;
    }
  }, [loading, openTickets, selectedTicket]);

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
          "group flex gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 cursor-pointer transition-colors",
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
        <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 flex-shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelect(ticket.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${ticket.subject || ticket.id}`}
            className="hidden sm:inline-flex"
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
              {STATUS_LABELS[ticket.status] || ticket.status}
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

        {/* Quick-done button */}
        {ticket.status !== "closed" && ticket.status !== "resolved" && (
          <button
            type="button"
            title="Mark as done"
            onClick={(e) => { e.stopPropagation(); updateStatus(ticket.id, "closed"); }}
            className="self-center flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-green-100 dark:hover:bg-green-900/30 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-all"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  const renderTicketList = (ticketsList: TicketRow[], isMobile: boolean) => (
    <div className="divide-y">
      {ticketsList.map((ticket, i) => renderTicketRow(ticket, i, isMobile))}
    </div>
  );

  const renderEmptyState = () => {
    if (quickFilter === "open" && (stats.new + stats.open) === 0 && stats.total > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PartyPopper className="h-10 w-10 text-green-500 mb-3" />
          <p className="font-medium text-foreground">Inbox zero!</p>
          <p className="text-sm text-muted-foreground mt-1">
            All caught up. No open tickets.
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
    <div className="border-t bg-card flex-shrink-0">
      {/* Mode tabs — compact pill toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2">
        <div className="flex gap-0.5 bg-muted rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setIsInternal(false)}
            className={cn(
              "flex items-center gap-1 rounded px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-colors",
              !isInternal
                ? "bg-blue-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="h-3 w-3" />
            Reply
          </button>
          <button
            type="button"
            onClick={() => setIsInternal(true)}
            className={cn(
              "flex items-center gap-1 rounded px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-colors",
              isInternal
                ? "bg-amber-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Lock className="h-3 w-3" />
            Note
          </button>
        </div>

        {/* Reply context inline — hidden on very small screens */}
        {!isInternal && (
          <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
            to {selectedTicket.user_email || <span className="text-amber-600 dark:text-amber-400">no email</span>}
            {selectedTicket.inbox_email && <> via {selectedTicket.inbox_email.split("@")[0]}</>}
          </span>
        )}

        <div className="flex-1" />

        <Popover open={cannedOpen} onOpenChange={setCannedOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-1 px-1.5 sm:px-2">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end">
            {showAddCanned ? (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium">New Template</h4>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setShowAddCanned(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input placeholder="Title" value={newCannedTitle} onChange={(e) => setNewCannedTitle(e.target.value)} className="h-7 text-xs" />
                <Textarea placeholder="Content..." value={newCannedContent} onChange={(e) => setNewCannedContent(e.target.value)} rows={3} className="text-xs resize-none" />
                <Select value={newCannedCategory} onValueChange={setNewCannedCategory}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full h-7 text-xs" onClick={saveCannedResponse}>Save</Button>
              </div>
            ) : (
              <div>
                <ScrollArea className="max-h-48">
                  {cannedResponses.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground text-center">No templates yet</p>
                  ) : (
                    <div className="p-1">
                      {Array.from(cannedByCategory.entries()).map(([category, items]) => (
                        <div key={category}>
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{category}</p>
                          {items.map((r) => (
                            <div key={r.id} className="group flex items-center gap-1 rounded px-2 py-1 cursor-pointer hover:bg-muted transition-colors">
                              <button type="button" className="flex-1 text-left" onClick={() => insertCanned(r.content)}>
                                <p className="text-xs font-medium">{r.title}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{r.content}</p>
                              </button>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteCannedResponse(r.id); }}>
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-1.5 border-t">
                  <Button variant="ghost" size="sm" className="w-full h-6 text-[11px] gap-1" onClick={() => setShowAddCanned(true)}>
                    <Plus className="h-3 w-3" /> Add Template
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor area */}
      <div className="px-3 sm:px-4 pb-2 sm:pb-3">
        {isInternal ? (
          <Textarea
            placeholder="Internal note (only visible to admins)..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={3}
            className="resize-y min-h-[60px] sm:min-h-[72px] text-sm"
          />
        ) : (
          <RichEditor ref={editorRef} placeholder="Write your reply..." />
        )}
      </div>

      {/* Footer with send */}
      <div className="flex items-center justify-between px-3 sm:px-4 pb-3">
        {!isInternal && !selectedTicket.user_email ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            No email — saved as note only
          </p>
        ) : !isInternal ? (
          <p className="text-[11px] text-muted-foreground">
            Signature included automatically
          </p>
        ) : (
          <div />
        )}
        <Button
          size="sm"
          onClick={addNote}
          disabled={sendingNote}
          variant={isInternal ? "outline" : "default"}
          className="gap-1.5"
        >
          {sendingNote ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isInternal ? (
            <StickyNote className="h-3.5 w-3.5" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {isInternal ? "Add Note" : "Send"}
        </Button>
      </div>
    </div>
  );

  const hasActiveFilters = typeFilter !== "all" || priorityFilter !== "all";

  return (
    <div className="space-y-3">
      {/* Compact header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Inbox</h1>
          {stats.new > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-medium">
              {stats.new} new
            </span>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px]">j</kbd><kbd className="px-1 py-0.5 rounded bg-muted border text-[10px]">k</kbd>
          <span>nav</span>
          <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] ml-1.5">r</kbd>
          <span>reply</span>
          <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] ml-1.5">e</kbd>
          <span>done</span>
        </div>
      </div>

      {/* Split pane: ticket list + detail (desktop) / full-width list (mobile) */}
      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-0 lg:border lg:rounded-lg lg:overflow-hidden lg:bg-card" style={{ minHeight: "calc(100vh - 120px)" }}>
        {/* Left: Ticket list */}
        <div className="border rounded-lg lg:rounded-none lg:border-0 lg:border-r bg-card flex flex-col" style={{ maxHeight: "calc(100vh - 120px)" }}>

          {/* Filter tabs inside list pane */}
          <div className="flex items-center border-b overflow-x-auto flex-shrink-0 scrollbar-hide">
            {([
              { key: "open" as QuickFilter, label: "Open", count: stats.new + stats.open },
              { key: "mine" as QuickFilter, label: "Mine", count: stats.mine },
              { key: "unassigned" as QuickFilter, label: "Unassigned", count: stats.unassigned },
              { key: "resolved" as QuickFilter, label: "Done", count: stats.resolved + stats.closed },
              { key: "all" as QuickFilter, label: "All", count: stats.total },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setQuickFilter(tab.key); setFocusedIndex(-1); }}
                className={cn(
                  "px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                  quickFilter === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn(
                    "ml-1 text-[10px] rounded-full px-1.5 py-0.5",
                    quickFilter === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + filter bar inside list pane */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={hasActiveFilters ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1 px-2.5">
                  <Filter className="h-3 w-3" />
                  {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 space-y-3" align="end">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => { setTypeFilter("all"); setPriorityFilter("all"); }}>
                    Clear filters
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Select all + bulk actions */}
          {(selected.size > 0 || openTickets.length > 0) && (
            <div className="flex items-center justify-between gap-1 px-3 py-1.5 border-b flex-shrink-0 bg-muted/30">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected.size === activeFiltered.length && activeFiltered.length > 0}
                  onCheckedChange={selectAll}
                  aria-label="Select all"
                  className="h-3.5 w-3.5"
                />
                <span className="text-[11px] text-muted-foreground">
                  {selected.size > 0 ? `${selected.size} selected` : `${activeFiltered.length}`}
                </span>
                {selected.size > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearSelection} className="text-[11px] h-5 px-1">
                    Clear
                  </Button>
                )}
              </div>
              {selected.size > 0 && (
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-1.5 gap-1" disabled={bulkLoading} onClick={() => bulkUpdate({ status: "closed" })}>
                    <CheckCircle className="h-3 w-3" /> Done
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-1.5 text-destructive" disabled={bulkLoading} onClick={bulkDelete}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
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

                {/* Done tickets (only in "all" view) */}
                {quickFilter === "all" && resolvedTickets.length > 0 && (
                  <div className="border-t">
                    <div className="px-4 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                      Done ({resolvedTickets.length})
                    </div>
                    <div className="opacity-60">
                      <div className="hidden lg:block">
                        {renderTicketList(resolvedTickets, false)}
                      </div>
                      <div className="lg:hidden">
                        {renderTicketList(resolvedTickets, true)}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>

        {/* Right: Detail panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-col" style={{ maxHeight: "calc(100vh - 120px)" }}>
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
        <SheetContent className="sm:max-w-2xl w-[100vw] sm:w-full flex flex-col h-full overflow-hidden p-0 lg:hidden">
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
