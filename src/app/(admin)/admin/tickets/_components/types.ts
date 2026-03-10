// Shared types for the ticket inbox system

export interface NoteRow {
  id: string;
  content: string;
  is_internal: boolean;
  email_sent: boolean;
  cc_emails: string[];
  author_email: string | null;
  created_at: string;
}

export interface AttachmentMeta {
  filename: string;
  content_type: string;
  size: number;
}

export interface TicketRow {
  id: string;
  type: string;
  subject: string | null;
  message: string;
  html_body: string | null;
  sender_name: string | null;
  status: string;
  priority: string;
  direction: "inbound" | "outbound";
  user_id: string | null;
  user_email: string | null;
  org_name: string | null;
  org_plan: string | null;
  inbox_email: string | null;
  assigned_to: string | null;
  assigned_email: string | null;
  assigned_name: string | null;
  attachments: AttachmentMeta[];
  starred_by: string[];
  snoozed_until: string | null;
  folder: string;
  cc_emails: string[];
  is_read: boolean;
  notes: NoteRow[];
  notes_count: number;
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  super_admin_role: string | null;
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
}

export type QuickFilter = "all" | "open" | "mine" | "starred" | "unassigned" | "resolved" | "sent" | "snoozed" | "spam" | "trash";

// --- Constants ---

export const STATUS_ICONS_MAP: Record<string, string> = {
  new: "AlertCircle",
  in_progress: "Clock",
  resolved: "CheckCircle",
  closed: "CheckCircle",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "new",
  in_progress: "in progress",
  resolved: "done",
  closed: "done",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-500",
  normal: "text-blue-500",
  high: "text-amber-500",
  urgent: "text-red-500",
};

// --- Helpers ---

export function timeAgo(dateStr: string): string {
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

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

export function lastActivity(ticket: TicketRow): string {
  if (ticket.notes.length > 0) {
    return ticket.notes[ticket.notes.length - 1].created_at;
  }
  return ticket.updated_at || ticket.created_at;
}

export function slaColor(dateStr: string): string {
  const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  if (hours < 4) return "text-green-600 dark:text-green-400";
  if (hours < 24) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function isStarred(ticket: TicketRow, userId: string): boolean {
  return ticket.starred_by.includes(userId);
}

export function isSnoozed(ticket: TicketRow): boolean {
  return !!ticket.snoozed_until && new Date(ticket.snoozed_until) > new Date();
}

export function snoozeLabel(dateStr: string): string {
  const dt = new Date(dateStr);
  const now = new Date();
  const diff = dt.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const hours = diff / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}
