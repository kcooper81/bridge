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
  Filter,
  Star,
  AlarmClock,
  Forward,
  ShieldBan,
  ArchiveRestore,
  ChevronDown,
  Building2,
  CreditCard,
  TicketCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ComposeEmailModal } from "@/components/admin/compose-email-modal";
import { useAuth } from "@/components/providers/auth-provider";
import { SnoozePopover } from "./_components/snooze-popover";
import type {
  TicketRow,
  StaffMember,
  CannedResponse,
  NoteRow,
  QuickFilter,
} from "./_components/types";
import {
  TICKET_TYPES,
  EMAIL_TYPES,
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  timeAgo,
  formatBytes,
  lastActivity,
  slaColor,
  isStarred,
  isSnoozed,
  snoozeLabel,
} from "./_components/types";

// --- Icon maps ---

const STATUS_ICONS: Record<string, React.ElementType> = {
  new: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: CheckCircle,
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  bug: Bug,
  feature: Lightbulb,
  feedback: MessageSquare,
  email: Mail,
  sales: DollarSign,
};

// --- Email HTML renderer ---

function EmailHtmlBody({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

    const fullHtml = `<!DOCTYPE html><html><head><base target="_blank"><style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #374151; margin: 0; padding: 8px 0; word-wrap: break-word; }
      a { color: #2563eb; }
      img { max-width: 100%; height: auto; }
      blockquote { border-left: 3px solid #d1d5db; margin: 8px 0; padding: 4px 12px; color: #6b7280; }
      pre { background: #f3f4f6; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 13px; }
      table { border-collapse: collapse; max-width: 100%; }
      td, th { padding: 4px 8px; }
    </style></head><body>${html}</body></html>`;

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
        // Cross-origin after blob load
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
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ minHeight: "400px" }}
      title="Email content"
    />
  );
}

// --- Contact card ---

function ContactCard({ ticket, tickets }: { ticket: TicketRow; tickets: TicketRow[] }) {
  const customerTickets = useMemo(() => {
    if (!ticket.user_email) return [];
    return tickets.filter((t) => t.user_email === ticket.user_email);
  }, [tickets, ticket.user_email]);

  if (!ticket.user_email) return null;

  const openCount = customerTickets.filter((t) => t.status === "new" || t.status === "in_progress").length;
  const totalCount = customerTickets.length;

  return (
    <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <UserRound className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">
            {ticket.sender_name || ticket.user_email.split("@")[0]}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{ticket.user_email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {ticket.org_name && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{ticket.org_name}</span>
          </div>
        )}
        {ticket.org_plan && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            <span className="capitalize">{ticket.org_plan}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <TicketCheck className="h-3 w-3" />
          <span>{totalCount} ticket{totalCount !== 1 ? "s" : ""}{openCount > 0 ? ` (${openCount} open)` : ""}</span>
        </div>
      </div>
    </div>
  );
}

// --- Ticket detail content ---

function TicketContent({
  ticket,
  tickets,
  staff,
  userId,
  onSelectTicket,
  updateStatus,
  updatePriority,
  assignTicket,
  toggleStar,
  onSnooze,
}: {
  ticket: TicketRow;
  tickets: TicketRow[];
  staff: StaffMember[];
  userId: string;
  onSelectTicket: (t: TicketRow) => void;
  updateStatus: (id: string, status: string) => void;
  updatePriority: (id: string, priority: string) => void;
  assignTicket: (id: string, assignedTo: string | null) => void;
  toggleStar: (id: string) => void;
  onSnooze: (id: string, until: string | null) => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const customerHistory = useMemo(() => {
    if (!ticket?.user_email) return [];
    return tickets.filter(
      (t) => t.id !== ticket.id && t.user_email === ticket.user_email
    );
  }, [tickets, ticket]);

  const starred = isStarred(ticket, userId);

  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      {/* Compact header */}
      <div className="px-3 sm:px-4 pt-3 pb-2 border-b flex-shrink-0">
        {/* Subject row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex items-start gap-2">
            <button
              type="button"
              onClick={() => toggleStar(ticket.id)}
              className="mt-0.5 flex-shrink-0"
              title={starred ? "Unstar" : "Star"}
            >
              <Star className={cn("h-4 w-4 transition-colors", starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 hover:text-amber-400")} />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-snug truncate">
                {ticket.subject || "No subject"}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {ticket.sender_name && ticket.sender_name !== ticket.user_email
                  ? `${ticket.sender_name} <${ticket.user_email}>`
                  : ticket.user_email || "Anonymous"}
                {ticket.org_name && ` · ${ticket.org_name}`}
                {ticket.org_plan && ` (${ticket.org_plan})`}
                {" · "}{new Date(ticket.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isSnoozed(ticket) && (
              <Badge variant="outline" className="text-[10px] h-5 gap-0.5 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
                <AlarmClock className="h-2.5 w-2.5" />
                {snoozeLabel(ticket.snoozed_until!)}
              </Badge>
            )}
            <Badge variant="outline" className="capitalize text-[10px] h-5">
              {ticket.type}
            </Badge>
            {ticket.direction === "outbound" && (
              <Badge variant="outline" className="text-[10px] h-5 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
                Outbound
              </Badge>
            )}
            {ticket.inbox_email && (
              <Badge variant="secondary" className="text-[10px] h-5 gap-0.5 hidden sm:inline-flex">
                <Inbox className="h-2.5 w-2.5" />
                {ticket.inbox_email.split("@")[0]}
              </Badge>
            )}
          </div>
        </div>

        {/* Inline controls row — all on one line */}
        <div className="flex items-center gap-1.5 mt-2">
          <Select value={ticket.status === "resolved" ? "closed" : ticket.status} onValueChange={(val) => updateStatus(ticket.id, val)}>
            <SelectTrigger className="w-[100px] h-6 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ticket.priority} onValueChange={(val) => updatePriority(ticket.id, val)}>
            <SelectTrigger className="w-[80px] h-6 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ticket.assigned_to || "_unassigned"} onValueChange={(val) => assignTicket(ticket.id, val === "_unassigned" ? null : val)}>
            <SelectTrigger className="w-[120px] h-6 text-[11px]">
              <div className="flex items-center gap-1 truncate">
                <UserRound className="h-2.5 w-2.5 flex-shrink-0 text-muted-foreground" />
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
          <SnoozePopover onSnooze={(until) => onSnooze(ticket.id, until)}>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Snooze">
              <AlarmClock className="h-3 w-3 text-muted-foreground" />
            </Button>
          </SnoozePopover>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", detailsOpen && "rotate-90")} />
            Details
          </button>
        </div>

        {/* Collapsible details: contact card + CC */}
        {detailsOpen && (
          <div className="mt-2 space-y-2">
            <ContactCard ticket={ticket} tickets={tickets} />
            {ticket.cc_emails && ticket.cc_emails.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                <span className="font-medium">CC:</span>
                {ticket.cc_emails.map((email, i) => (
                  <span key={i} className="bg-muted rounded px-1.5 py-0.5">{email}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable content — email body takes primary focus */}
      <ScrollArea className="flex-1">
        <div className="px-3 sm:px-4 py-3 space-y-4">
          {/* Original message — full width, prominent */}
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-muted/40 px-3 py-1.5 text-[11px] flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-2.5 w-2.5 text-primary" />
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

              <div className="relative pl-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-3">
                  {ticket.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
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

function NoteCard({ note }: { note: NoteRow }) {
  return (
    <div className="relative">
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
          {note.cc_emails && note.cc_emails.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              CC: {note.cc_emails.join(", ")}
            </span>
          )}
        </div>
        <div className="px-3 py-2.5">
          {!note.is_internal && note.content.startsWith("<") ? (
            <EmailHtmlBody html={note.content} />
          ) : (
            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function TicketsPage() {
  const { user } = useAuth();
  const userId = user?.id || "";
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("open");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [folder, setFolder] = useState<"inbox" | "spam" | "trash">("inbox");

  // Detail
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Compose
  const [composeOpen, setComposeOpen] = useState(false);

  // Note/reply form
  const [noteContent, setNoteContent] = useState("");
  const [replyMode, setReplyMode] = useState<"reply" | "note" | "forward">("reply");
  const [sendingNote, setSendingNote] = useState(false);
  const editorRef = useRef<RichEditorRef>(null);
  const [ccInput, setCcInput] = useState("");
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [forwardTo, setForwardTo] = useState("");

  // Canned responses
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [showAddCanned, setShowAddCanned] = useState(false);
  const [newCannedTitle, setNewCannedTitle] = useState("");
  const [newCannedContent, setNewCannedContent] = useState("");
  const [newCannedCategory, setNewCannedCategory] = useState("general");

  // Keyboard nav
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // More tabs dropdown
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const loadTickets = useCallback(async (append = false) => {
    if (append) setLoadingMore(true);
    try {
      const offset = append ? tickets.length : 0;
      const res = await fetch(`/api/admin/tickets?folder=${folder}&limit=50&offset=${offset}`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      const fresh = data.tickets || [];
      setHasMore(data.pagination?.hasMore || false);
      setTotalTickets(data.pagination?.total || fresh.length);
      if (append) {
        setTickets((prev) => [...prev, ...fresh]);
      } else {
        setTickets(fresh);
        setSelectedTicket((prev) => {
          if (!prev) return null;
          const updated = fresh.find((t: TicketRow) => t.id === prev.id);
          return updated || null;
        });
      }
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [folder, tickets.length]);

  const loadCannedResponses = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/canned-responses");
      if (res.ok) {
        const data = await res.json();
        setCannedResponses(data.responses || []);
      }
    } catch { /* Non-critical */ }
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch { /* Non-critical */ }
  }, []);

  useEffect(() => {
    loadTickets();
    loadCannedResponses();
    loadStaff();

    const supabase = createClient();
    const channel = supabase
      .channel("admin-tickets-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feedback" }, () => loadTickets())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "feedback" }, () => loadTickets())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_notes" }, () => loadTickets())
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

  const updateStatus = async (id: string, status: string, silent = false) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      // Auto-mark as read when marking done
      const isDone = status === "closed" || status === "resolved";
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status, ...(isDone ? { is_read: true } : {}) } : t)));
      setSelectedTicket((prev) => (prev?.id === id ? { ...prev, status, ...(isDone ? { is_read: true } : {}) } : prev));
      if (isDone) markRead(id);
      if (!silent) {
        toast.success(status === "closed" ? "Marked as done" : `Status → ${status.replace("_", " ")}`);
      }
    } catch {
      if (!silent) toast.error("Failed to update status");
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
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
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

  const toggleStar = async (id: string) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;
    const currentlyStarred = isStarred(ticket, userId);

    // Optimistic update
    setTickets((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const newStarred = currentlyStarred
        ? t.starred_by.filter((uid) => uid !== userId)
        : [...t.starred_by, userId];
      return { ...t, starred_by: newStarred };
    }));
    setSelectedTicket((prev) => {
      if (prev?.id !== id) return prev;
      const newStarred = currentlyStarred
        ? prev.starred_by.filter((uid) => uid !== userId)
        : [...prev.starred_by, userId];
      return { ...prev, starred_by: newStarred };
    });

    try {
      await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, starred: !currentlyStarred }),
      });
    } catch {
      // Revert on failure
      loadTickets();
    }
  };

  const snoozeTicket = async (id: string, until: string | null) => {
    try {
      await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, snoozed_until: until }),
      });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, snoozed_until: until } : t)));
      setSelectedTicket((prev) => (prev?.id === id ? { ...prev, snoozed_until: until } : prev));
      toast.success(until ? "Snoozed" : "Unsnooze");
    } catch {
      toast.error("Failed to snooze ticket");
    }
  };

  const moveToFolder = async (ids: string[], targetFolder: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, folder: targetFolder }),
      });
      if (!res.ok) throw new Error("Failed");
      // Remove from current view
      setTickets((prev) => prev.filter((t) => !ids.includes(t.id)));
      if (selectedTicket && ids.includes(selectedTicket.id)) {
        setSelectedTicket(null);
      }
      setSelected(new Set());
      const label = targetFolder === "inbox" ? "Moved to inbox" : targetFolder === "spam" ? "Marked as spam" : "Moved to trash";
      toast.success(label);
    } catch {
      toast.error("Failed to move ticket");
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
      const isDone = updates.status === "closed" || updates.status === "resolved";
      setTickets((prev) => prev.map((t) => (selected.has(t.id) ? { ...t, ...updates, ...(isDone ? { is_read: true } : {}) } : t)));
      // Also mark all as read in the DB when closing
      if (isDone) {
        Array.from(selected).forEach((id) => markRead(id));
      }
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
    if (folder === "trash") {
      if (!confirm(`Permanently delete ${selected.size} ticket(s)? This cannot be undone.`)) return;
      setBulkLoading(true);
      try {
        const res = await fetch("/api/admin/tickets", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selected), permanent: true }),
        });
        if (!res.ok) throw new Error("Failed");
        setTickets((prev) => prev.filter((t) => !selected.has(t.id)));
        if (selectedTicket && selected.has(selectedTicket.id)) setSelectedTicket(null);
        toast.success(`Permanently deleted ${selected.size} ticket(s)`);
        setSelected(new Set());
      } catch {
        toast.error("Failed to delete tickets");
      } finally {
        setBulkLoading(false);
      }
    } else {
      // Soft delete — move to trash
      await moveToFolder(Array.from(selected), "trash");
    }
  };

  const markRead = async (id: string) => {
    // Optimistic
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, is_read: true } : t)));
    setSelectedTicket((prev) => (prev?.id === id ? { ...prev, is_read: true } : prev));
    try {
      await fetch(`/api/admin/tickets/${id}/read`, { method: "POST" });
    } catch { /* Non-critical */ }
  };

  const addNote = async () => {
    const isReply = replyMode === "reply";
    const isForwardMode = replyMode === "forward";
    const isInternal = replyMode === "note";
    let content: string;
    let isHtml = false;

    if ((isReply || isForwardMode) && editorRef.current) {
      if (editorRef.current.isEmpty()) return;
      content = editorRef.current.getHTML();
      isHtml = true;
    } else {
      if (!noteContent.trim()) return;
      content = noteContent.trim();
    }

    if (!selectedTicket) return;
    if (isForwardMode && !forwardTo.trim()) {
      toast.error("Forward-to email is required");
      return;
    }

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
            cc: ccEmails,
            action: isForwardMode ? "forward" : "reply",
            forward_to: isForwardMode ? forwardTo.trim() : undefined,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to add note");

      const data = await res.json();
      const newNote: NoteRow = data.note;

      const wasUnassigned = !selectedTicket.assigned_to;
      const shouldProgress = isReply && selectedTicket.status === "new";
      const updateTicketNotes = (t: TicketRow): TicketRow => ({
        ...t,
        notes: [...t.notes, newNote],
        notes_count: t.notes_count + 1,
        ...(shouldProgress ? { status: "in_progress" } : {}),
        ...(wasUnassigned && user ? { assigned_to: user.id, assigned_email: user.email || null, assigned_name: null } : {}),
      });

      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updateTicketNotes(t) : t)));
      setSelectedTicket((prev) => (prev ? updateTicketNotes(prev) : prev));
      setNoteContent("");
      setCcEmails([]);
      setCcInput("");
      setShowCc(false);
      setForwardTo("");
      if (editorRef.current) editorRef.current.clear();
      if (isInternal) {
        toast.success("Internal note added");
      } else if (isForwardMode) {
        toast.success(data.note?.email_sent ? `Forwarded to ${forwardTo}` : "Forward note saved");
      } else if (data.note?.email_sent) {
        toast.success("Response sent via email");
      } else if (data.recipient_email) {
        toast.warning("Note saved but email failed to send");
      } else {
        toast.success("Note saved (no recipient email found)");
      }
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSendingNote(false);
    }
  };

  const openTicket = (ticket: TicketRow) => {
    setSelectedTicket(ticket);
    setNoteContent("");
    setReplyMode("reply");
    setCcEmails([]);
    setShowCc(false);
    setForwardTo("");

    // Mark as read (separate from status change)
    if (!ticket.is_read) {
      markRead(ticket.id);
    }
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

  const addCcEmail = () => {
    const email = ccInput.trim();
    if (email && email.includes("@") && !ccEmails.includes(email)) {
      setCcEmails([...ccEmails, email]);
      setCcInput("");
    }
  };

  const removeCcEmail = (email: string) => {
    setCcEmails(ccEmails.filter((e) => e !== email));
  };

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

  const smartSort = useCallback((a: TicketRow, b: TicketRow): number => {
    // Starred first
    const aStarred = isStarred(a, userId) ? 1 : 0;
    const bStarred = isStarred(b, userId) ? 1 : 0;
    if (aStarred !== bStarred) return bStarred - aStarred;

    // Unread first
    const aUnread = a.is_read ? 0 : 1;
    const bUnread = b.is_read ? 0 : 1;
    if (aUnread !== bUnread) return bUnread - aUnread;

    // Priority
    const aUrgent = a.priority === "urgent" ? 1 : a.priority === "high" ? 0.5 : 0;
    const bUrgent = b.priority === "urgent" ? 1 : b.priority === "high" ? 0.5 : 0;
    if (aUrgent !== bUrgent) return bUrgent - aUrgent;

    return new Date(lastActivity(b)).getTime() - new Date(lastActivity(a)).getTime();
  }, [userId]);

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

  const activeFiltered = useMemo(() => {
    let result = filtered;

    switch (quickFilter) {
      case "open":
        result = result.filter((t) => (t.status === "new" || t.status === "in_progress") && !isSnoozed(t));
        break;
      case "mine":
        result = result.filter((t) => t.assigned_to === userId && t.status !== "closed");
        break;
      case "starred":
        result = result.filter((t) => isStarred(t, userId));
        break;
      case "unassigned":
        result = result.filter((t) => !t.assigned_to && t.status !== "resolved" && t.status !== "closed");
        break;
      case "resolved":
        result = result.filter((t) => t.status === "resolved" || t.status === "closed");
        break;
      case "sent":
        result = result.filter((t) => t.direction === "outbound");
        break;
      case "snoozed":
        result = result.filter((t) => isSnoozed(t));
        break;
      case "tickets":
        result = result.filter((t) => (TICKET_TYPES as readonly string[]).includes(t.type) && (t.status === "new" || t.status === "in_progress") && !isSnoozed(t));
        break;
      case "emails":
        result = result.filter((t) => (EMAIL_TYPES as readonly string[]).includes(t.type) && t.direction === "inbound" && (t.status === "new" || t.status === "in_progress") && !isSnoozed(t));
        break;
      // "all" / "spam" / "trash" — no extra filtering (folder handles it)
    }

    return [...result].sort(smartSort);
  }, [filtered, quickFilter, userId, smartSort]);

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
      unread: tickets.filter((t) => !t.is_read).length,
      mine: tickets.filter((t) => t.assigned_to === userId && t.status !== "closed").length,
      starred: tickets.filter((t) => isStarred(t, userId)).length,
      unassigned: tickets.filter((t) => !t.assigned_to && t.status !== "resolved" && t.status !== "closed").length,
      resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
      sent: tickets.filter((t) => t.direction === "outbound").length,
      snoozed: tickets.filter((t) => isSnoozed(t)).length,
      tickets: tickets.filter((t) => (TICKET_TYPES as readonly string[]).includes(t.type) && (t.status === "new" || t.status === "in_progress") && !isSnoozed(t)).length,
      emails: tickets.filter((t) => (EMAIL_TYPES as readonly string[]).includes(t.type) && t.direction === "inbound" && (t.status === "new" || t.status === "in_progress") && !isSnoozed(t)).length,
    }),
    [tickets, userId]
  );

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
        if (selectedTicket) { e.preventDefault(); setReplyMode("reply"); }
      } else if (e.key === "n") {
        if (selectedTicket) { e.preventDefault(); setReplyMode("note"); }
      } else if (e.key === "e") {
        if (selectedTicket) { e.preventDefault(); updateStatus(selectedTicket.id, "closed"); }
      } else if (e.key === "s") {
        if (selectedTicket) { e.preventDefault(); toggleStar(selectedTicket.id); }
      } else if (e.key === "#") {
        if (selectedTicket) { e.preventDefault(); moveToFolder([selectedTicket.id], "trash"); }
      } else if (e.key === "!") {
        if (selectedTicket) { e.preventDefault(); moveToFolder([selectedTicket.id], "spam"); }
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
      if (window.innerWidth >= 1024) {
        setSelectedTicket(openTickets[0]);
        setFocusedIndex(0);
        if (!openTickets[0].is_read) markRead(openTickets[0].id);
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
    const isUnread = !ticket.is_read;
    const isSelected = selected.has(ticket.id);
    const isActive = selectedTicket?.id === ticket.id;
    const hasAttachments = ticket.attachments && ticket.attachments.length > 0;
    const activity = lastActivity(ticket);
    const hasReply = ticket.notes.some((n) => !n.is_internal);
    const starred = isStarred(ticket, userId);
    const snoozed = isSnoozed(ticket);
    const preview = ticket.message.replace(/^From:.*?\n\n/, "").slice(0, 80);

    // Gmail-style mobile row
    if (isMobile) {
      return (
        <div
          key={ticket.id}
          className={cn(
            "flex gap-3 px-4 py-3 cursor-pointer transition-colors active:bg-accent/80",
            isUnread
              ? "bg-blue-50/50 dark:bg-blue-950/15"
              : "hover:bg-accent/40"
          )}
          onClick={() => openTicketMobile(ticket)}
        >
          {/* Avatar / type icon */}
          <div className="flex-shrink-0 pt-0.5">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold",
              isUnread
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {(ticket.sender_name || ticket.user_email || "?")[0].toUpperCase()}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Line 1: sender + time */}
            <div className="flex items-center justify-between gap-2">
              <span className={cn("truncate text-sm", isUnread ? "font-semibold text-foreground" : "text-foreground")}>
                {ticket.direction === "outbound"
                  ? `To: ${ticket.user_email?.split("@")[0] || "Unknown"}`
                  : (ticket.sender_name || ticket.user_email?.split("@")[0] || "Anonymous")}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                <span className={cn("text-xs", isUnread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {timeAgo(activity)}
                </span>
              </div>
            </div>

            {/* Line 2: subject */}
            <p className={cn("truncate text-[13px] mt-0.5", isUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
              {ticket.subject || "No subject"}
            </p>

            {/* Line 3: preview + badges */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="truncate text-xs text-muted-foreground flex-1">
                {preview}
              </p>
              {ticket.priority === "urgent" && (
                <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 flex-shrink-0">!</span>
              )}
              {ticket.priority === "high" && (
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 flex-shrink-0">!</span>
              )}
            </div>

            {/* Line 4: minimal status indicators */}
            <div className="flex items-center gap-2 mt-1">
              {snoozed && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 dark:text-purple-400">
                  <AlarmClock className="h-2.5 w-2.5" />
                  {snoozeLabel(ticket.snoozed_until!)}
                </span>
              )}
              {ticket.direction === "outbound" && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Sent</span>
              )}
              {ticket.notes_count > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <MessageSquare className="h-2.5 w-2.5" />
                  {ticket.notes_count}
                </span>
              )}
              {!hasReply && ticket.status !== "closed" && ticket.status !== "resolved" && (
                <span className={cn("text-[10px] font-medium", slaColor(activity))}>
                  Needs reply
                </span>
              )}
            </div>
          </div>

          {/* Star */}
          <div className="flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleStar(ticket.id); }}
            >
              <Star className={cn("h-4 w-4 transition-colors", starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25")} />
            </button>
          </div>
        </div>
      );
    }

    // Desktop row (unchanged)
    return (
      <div
        key={ticket.id}
        className={cn(
          "group flex gap-3 px-4 py-3.5 cursor-pointer transition-colors",
          isActive
            ? "bg-primary/10 border-l-2 border-l-primary"
            : isUnread
              ? "bg-blue-50/70 dark:bg-blue-950/20 border-l-2 border-l-blue-500 hover:bg-blue-100/70 dark:hover:bg-blue-950/30"
              : "border-l-2 border-l-transparent hover:bg-accent/60",
          isSelected && !isActive && "bg-primary/5",
          focusedIndex === index && !isActive && "ring-1 ring-inset ring-primary/30"
        )}
        onClick={() => openTicket(ticket)}
      >
        {/* Left: star + checkbox + unread */}
        <div className="flex items-center gap-1.5 pt-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleStar(ticket.id); }}
            className="flex-shrink-0"
            title={starred ? "Unstar" : "Star"}
          >
            <Star className={cn("h-3.5 w-3.5 transition-colors", starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-400")} />
          </button>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelect(ticket.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${ticket.subject || ticket.id}`}
          />
          <div className="w-2">
            {isUnread && <div className="h-2 w-2 rounded-full bg-blue-500" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Line 1: sender + time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <TypeIcon className={cn("h-3 w-3 flex-shrink-0", isUnread ? "text-foreground" : "text-muted-foreground")} />
              <span className={cn("truncate text-xs", isUnread ? "font-semibold" : "text-muted-foreground")}>
                {ticket.direction === "outbound" ? `To: ${ticket.user_email || ticket.sender_name || "Unknown"}` : (ticket.sender_name || ticket.user_email || "Anonymous")}
              </span>
              {ticket.inbox_email && (
                <span className="text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5 flex-shrink-0">
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
            <p className={cn("truncate text-xs", isUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
              {ticket.subject || "No subject"}
              <span className="font-normal text-muted-foreground">
                {" — "}{preview.slice(0, 50)}
              </span>
            </p>
          </div>

          {/* Line 3: badges */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_COLORS[ticket.status] || "")}>
              <StatusIcon className="h-2.5 w-2.5" />
              {STATUS_LABELS[ticket.status] || ticket.status}
            </span>
            <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 h-4">
              {ticket.type}
            </Badge>
            {ticket.direction === "outbound" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
                Sent
              </Badge>
            )}
            {snoozed && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
                <AlarmClock className="h-2.5 w-2.5" />
                {snoozeLabel(ticket.snoozed_until!)}
              </Badge>
            )}
            {ticket.priority !== "normal" && (
              <span className={cn("text-[10px] font-semibold capitalize", PRIORITY_COLORS[ticket.priority])}>
                {ticket.priority}
              </span>
            )}
            {hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
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
            {!hasReply && ticket.status !== "closed" && ticket.status !== "resolved" && (
              <span className={cn("text-[10px] font-medium", slaColor(activity))}>
                Awaiting reply
              </span>
            )}
          </div>
        </div>

        {/* Quick hover actions */}
        <div className="self-center flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
          {folder === "inbox" && (
            <>
              {!ticket.assigned_to && (
                <button
                  type="button"
                  title="Assign to me"
                  onClick={(e) => { e.stopPropagation(); assignTicket(ticket.id, userId); }}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  <UserRound className="h-3.5 w-3.5" />
                </button>
              )}
              <SnoozePopover onSnooze={(until) => snoozeTicket(ticket.id, until)}>
                <button
                  type="button"
                  title="Snooze"
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/30 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                >
                  <AlarmClock className="h-3.5 w-3.5" />
                </button>
              </SnoozePopover>
              {ticket.status !== "closed" && ticket.status !== "resolved" && (
                <button
                  type="button"
                  title="Mark as done"
                  onClick={(e) => { e.stopPropagation(); updateStatus(ticket.id, "closed"); }}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/30 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-all"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
          {(folder === "spam" || folder === "trash") && (
            <button
              type="button"
              title="Move to inbox"
              onClick={(e) => { e.stopPropagation(); moveToFolder([ticket.id], "inbox"); }}
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            >
              <ArchiveRestore className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderTicketList = (ticketsList: TicketRow[], isMobile: boolean) => (
    <div className="divide-y">
      {ticketsList.map((ticket, i) => renderTicketRow(ticket, i, isMobile))}
      {hasMore && (
        <div className="flex items-center justify-center py-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => loadTickets(true)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Loading...</>
            ) : (
              <>Load more ({totalTickets - tickets.length} remaining)</>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  const renderEmptyState = () => {
    if (folder === "spam") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldBan className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No spam</p>
          <p className="text-sm text-muted-foreground mt-1">Spam tickets will appear here.</p>
        </div>
      );
    }
    if (folder === "trash") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trash2 className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">Trash is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Deleted tickets will appear here.</p>
        </div>
      );
    }
    if (quickFilter === "open" && (stats.new + stats.open) === 0 && stats.total > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PartyPopper className="h-10 w-10 text-green-500 mb-3" />
          <p className="font-medium text-foreground">Inbox zero!</p>
          <p className="text-sm text-muted-foreground mt-1">All caught up. No open tickets.</p>
        </div>
      );
    }
    if (quickFilter === "mine" && stats.mine === 0 && stats.total > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UserRound className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No tickets assigned to you</p>
          <p className="text-sm text-muted-foreground mt-1">Pick up tickets from the Unassigned tab.</p>
        </div>
      );
    }
    if (quickFilter === "starred" && stats.starred === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Star className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No starred tickets</p>
          <p className="text-sm text-muted-foreground mt-1">Click the star icon to pin important tickets.</p>
        </div>
      );
    }
    if (quickFilter === "unassigned" && stats.unassigned === 0 && stats.total > 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PartyPopper className="h-10 w-10 text-green-500 mb-3" />
          <p className="font-medium text-foreground">All tickets assigned!</p>
          <p className="text-sm text-muted-foreground mt-1">Every open ticket has an owner.</p>
        </div>
      );
    }
    if (quickFilter === "tickets" && stats.tickets === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No form submissions</p>
          <p className="text-sm text-muted-foreground mt-1">Bug reports, feature requests, and feedback will appear here.</p>
        </div>
      );
    }
    if (quickFilter === "emails" && stats.emails === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Mail className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No emails</p>
          <p className="text-sm text-muted-foreground mt-1">Inbound emails will appear here.</p>
        </div>
      );
    }
    if (quickFilter === "sent" && stats.sent === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Send className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No sent emails yet</p>
          <p className="text-sm text-muted-foreground mt-1">Use the Compose button to send an email.</p>
        </div>
      );
    }
    if (quickFilter === "snoozed" && stats.snoozed === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlarmClock className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">No snoozed tickets</p>
          <p className="text-sm text-muted-foreground mt-1">Snooze a ticket to hide it until later.</p>
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

  // Reply form JSX
  const replyForm = selectedTicket && (
    <div className="border-t bg-card flex-shrink-0">
      {/* Mode tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2">
        <div className="flex gap-0.5 bg-muted rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setReplyMode("reply")}
            className={cn(
              "flex items-center gap-1 rounded px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-colors",
              replyMode === "reply"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="h-3 w-3" />
            Reply
          </button>
          <button
            type="button"
            onClick={() => setReplyMode("note")}
            className={cn(
              "flex items-center gap-1 rounded px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-colors",
              replyMode === "note"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Lock className="h-3 w-3" />
            Note
          </button>
          <button
            type="button"
            onClick={() => setReplyMode("forward")}
            className={cn(
              "flex items-center gap-1 rounded px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-colors",
              replyMode === "forward"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Forward className="h-3 w-3" />
            Fwd
          </button>
        </div>

        {/* Reply context */}
        {replyMode === "reply" && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate hidden sm:flex">
            <span>to {selectedTicket.user_email || <span className="text-amber-600 dark:text-amber-400">no email</span>}</span>
            {selectedTicket.inbox_email && <span>via {selectedTicket.inbox_email.split("@")[0]}</span>}
            {!showCc && (
              <button type="button" onClick={() => setShowCc(true)} className="text-primary hover:underline ml-1">
                CC
              </button>
            )}
          </div>
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
                            <div key={r.id} className="group/canned flex items-center gap-1 rounded px-2 py-1 cursor-pointer hover:bg-muted transition-colors">
                              <button type="button" className="flex-1 text-left" onClick={() => insertCanned(r.content)}>
                                <p className="text-xs font-medium">{r.title}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{r.content}</p>
                              </button>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 opacity-0 group-hover/canned:opacity-100" onClick={(e) => { e.stopPropagation(); deleteCannedResponse(r.id); }}>
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

      {/* Forward-to field */}
      {replyMode === "forward" && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground w-8">To:</span>
            <Input
              placeholder="Forward to email..."
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              className="h-7 text-xs flex-1"
              type="email"
            />
          </div>
        </div>
      )}

      {/* CC field */}
      {showCc && replyMode === "reply" && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground w-8">CC:</span>
            <div className="flex-1 flex flex-wrap items-center gap-1 border rounded-md px-2 py-1 min-h-[28px]">
              {ccEmails.map((email) => (
                <span key={email} className="inline-flex items-center gap-0.5 bg-muted rounded px-1.5 py-0.5 text-[10px]">
                  {email}
                  <button type="button" onClick={() => removeCcEmail(email)}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <input
                placeholder="Add CC email..."
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCcEmail(); } }}
                onBlur={addCcEmail}
                className="flex-1 min-w-[120px] text-xs bg-transparent outline-none"
              />
            </div>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setShowCc(false); setCcEmails([]); setCcInput(""); }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className="px-3 sm:px-4 pb-2 sm:pb-3">
        {replyMode === "note" ? (
          <Textarea
            placeholder="Internal note (only visible to admins)..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={3}
            className="resize-y min-h-[60px] sm:min-h-[72px] text-sm"
          />
        ) : (
          <RichEditor ref={editorRef} placeholder={replyMode === "forward" ? "Add a message (optional)..." : "Write your reply..."} />
        )}
      </div>

      {/* Footer with send */}
      <div className="flex items-center justify-between px-3 sm:px-4 pb-3">
        {replyMode === "reply" && !selectedTicket.user_email ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            No email — saved as note only
          </p>
        ) : replyMode === "reply" ? (
          <p className="text-[11px] text-muted-foreground">
            Signature included automatically
          </p>
        ) : replyMode === "forward" ? (
          <p className="text-[11px] text-muted-foreground">
            Original message will be included
          </p>
        ) : (
          <div />
        )}
        <Button
          size="sm"
          onClick={addNote}
          disabled={sendingNote}
          variant={replyMode === "note" ? "outline" : "default"}
          className={cn("gap-1.5", replyMode === "forward" && "bg-purple-600 hover:bg-purple-700")}
        >
          {sendingNote ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : replyMode === "note" ? (
            <StickyNote className="h-3.5 w-3.5" />
          ) : replyMode === "forward" ? (
            <Forward className="h-3.5 w-3.5" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {replyMode === "note" ? "Add Note" : replyMode === "forward" ? "Forward" : "Send"}
        </Button>
      </div>
    </div>
  );

  const hasActiveFilters = typeFilter !== "all" || priorityFilter !== "all";

  // Primary tabs (always shown) and secondary tabs (in dropdown)
  const primaryTabs: { key: QuickFilter; label: string; count: number; icon?: React.ElementType }[] = [
    { key: "open", label: "All Open", count: stats.new + stats.open },
    { key: "tickets", label: "Tickets", count: stats.tickets, icon: MessageSquare },
    { key: "emails", label: "Emails", count: stats.emails, icon: Mail },
    { key: "mine", label: "Mine", count: stats.mine },
    { key: "starred", label: "Starred", count: stats.starred },
    { key: "unassigned", label: "Unassigned", count: stats.unassigned },
    { key: "resolved", label: "Done", count: stats.resolved },
    { key: "sent", label: "Sent", count: stats.sent },
  ];

  const secondaryTabs: { key: QuickFilter | "folder:spam" | "folder:trash"; label: string; count: number; icon: React.ElementType }[] = [
    { key: "snoozed", label: "Snoozed", count: stats.snoozed, icon: AlarmClock },
    { key: "all", label: "All", count: stats.total, icon: Inbox },
    { key: "folder:spam", label: "Spam", count: 0, icon: ShieldBan },
    { key: "folder:trash", label: "Trash", count: 0, icon: Trash2 },
  ];

  const handleTabClick = (key: string) => {
    if (key === "folder:spam") {
      setFolder("spam");
      setQuickFilter("all");
    } else if (key === "folder:trash") {
      setFolder("trash");
      setQuickFilter("all");
    } else {
      if (folder !== "inbox") setFolder("inbox");
      setQuickFilter(key as QuickFilter);
    }
    setFocusedIndex(-1);
    setShowMoreTabs(false);
    setSelected(new Set());
    setSelectedTicket(null);
  };

  const activeTabKey = folder !== "inbox" ? `folder:${folder}` : quickFilter;

  return (
    <div className="space-y-3">
      {/* Compact header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            {folder === "spam" ? "Spam" : folder === "trash" ? "Trash" : "Inbox"}
          </h1>
          {folder === "inbox" && stats.unread > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-medium">
              {stats.unread} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setComposeOpen(true)} className="hidden sm:inline-flex">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Compose
          </Button>
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px]">j</kbd><kbd className="px-1 py-0.5 rounded bg-muted border text-[10px]">k</kbd>
            <span>nav</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] ml-1.5">s</kbd>
            <span>star</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] ml-1.5">r</kbd>
            <span>reply</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] ml-1.5">e</kbd>
            <span>done</span>
          </div>
        </div>
      </div>

      {/* Mobile search bar (collapsible) */}
      {mobileSearchOpen && (
        <div className="lg:hidden flex items-center gap-2 px-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm rounded-full bg-muted/50 border-0 focus-visible:ring-1"
              autoFocus
            />
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setMobileSearchOpen(false); setSearch(""); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Filter tabs — mobile: scrollable pills, desktop: border-bottom tabs */}
      {/* Mobile pill tabs */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-1.5 pb-1">
          {[...primaryTabs, ...secondaryTabs].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                activeTabKey === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground active:bg-muted"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "text-[10px] rounded-full px-1 min-w-[16px] text-center",
                  activeTabKey === tab.key ? "bg-primary-foreground/20" : "bg-background/60"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop border-bottom tabs */}
      <div className="hidden lg:flex items-center border border-border rounded-lg bg-card overflow-x-auto scrollbar-hide px-2">
        {primaryTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            className={cn(
              "px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
              activeTabKey === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon && <tab.icon className="h-3 w-3 mr-1 inline-block" />}
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "ml-1.5 text-[10px] rounded-full px-1.5 py-0.5",
                activeTabKey === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}

        {/* More dropdown */}
        <Popover open={showMoreTabs} onOpenChange={setShowMoreTabs}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "px-3 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap flex items-center gap-0.5",
                secondaryTabs.some((t) => activeTabKey === t.key)
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              More
              <ChevronDown className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="end">
            {secondaryTabs.map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                className={cn("w-full justify-start h-7 text-xs gap-2", activeTabKey === tab.key && "bg-muted")}
                onClick={() => handleTabClick(tab.key)}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
                {tab.count > 0 && <span className="ml-auto text-[10px] text-muted-foreground">{tab.count}</span>}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Split pane */}
      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-0 lg:border lg:rounded-lg lg:overflow-hidden lg:bg-card" style={{ height: "calc(100vh - 190px)" }}>
        {/* Left: Ticket list */}
        <div className="border-0 lg:border rounded-none lg:rounded-none lg:border-0 lg:border-r bg-card flex flex-col overflow-hidden" style={{ height: "calc(100vh - 230px)" }}>

          {/* Search + filter bar (desktop only — mobile has collapsible search in header) */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 border-b flex-shrink-0">
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

          {/* Select all + bulk actions (desktop only) */}
          {(selected.size > 0 || openTickets.length > 0) && (
            <div className="hidden lg:flex items-center justify-between gap-1 px-3 py-1.5 border-b flex-shrink-0 bg-muted/30">
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
                  {folder === "inbox" && (
                    <>
                      <Button variant="ghost" size="sm" className="h-6 text-[11px] px-1.5 gap-1" disabled={bulkLoading} onClick={() => bulkUpdate({ status: "closed" })}>
                        <CheckCircle className="h-3 w-3" /> Done
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[11px] px-1.5 gap-1" disabled={bulkLoading} onClick={() => moveToFolder(Array.from(selected), "spam")}>
                        <ShieldBan className="h-3 w-3" /> Spam
                      </Button>
                    </>
                  )}
                  {(folder === "spam" || folder === "trash") && (
                    <Button variant="ghost" size="sm" className="h-6 text-[11px] px-1.5 gap-1" disabled={bulkLoading} onClick={() => moveToFolder(Array.from(selected), "inbox")}>
                      <ArchiveRestore className="h-3 w-3" /> Inbox
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-1.5 text-destructive" disabled={bulkLoading} onClick={bulkDelete}>
                    <Trash2 className="h-3 w-3" />
                    {folder === "trash" ? " Delete" : ""}
                  </Button>
                </div>
              )}
            </div>
          )}

          <ScrollArea className="flex-1 [&>div]:overscroll-contain">
            {openTickets.length === 0 && resolvedTickets.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
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

                {quickFilter === "all" && resolvedTickets.length > 0 && (
                  <div className="border-t">
                    <div className="px-4 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                      Done ({resolvedTickets.length})
                    </div>
                    <div className="opacity-60">
                      <div className="hidden lg:block">{renderTicketList(resolvedTickets, false)}</div>
                      <div className="lg:hidden">{renderTicketList(resolvedTickets, true)}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>

        {/* Right: Detail panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-col overflow-hidden" style={{ height: "calc(100vh - 190px)" }}>
          {selectedTicket ? (
            <>
              <TicketContent
                ticket={selectedTicket}
                tickets={tickets}
                staff={staff}
                userId={userId}
                onSelectTicket={openTicket}
                updateStatus={updateStatus}
                updatePriority={updatePriority}
                assignTicket={assignTicket}
                toggleStar={toggleStar}
                onSnooze={snoozeTicket}
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
                userId={userId}
                onSelectTicket={openTicket}
                updateStatus={updateStatus}
                updatePriority={updatePriority}
                assignTicket={assignTicket}
                toggleStar={toggleStar}
                onSnooze={snoozeTicket}
              />
              {replyForm}
            </>
          )}
        </SheetContent>
      </Sheet>

      <ComposeEmailModal
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSent={() => loadTickets()}
      />

      {/* Mobile FAB — compose button (above admin nav menu button) */}
      <button
        type="button"
        onClick={() => setComposeOpen(true)}
        className="sm:hidden fixed bottom-24 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Compose"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
