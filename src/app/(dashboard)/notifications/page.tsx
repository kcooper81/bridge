"use client";

import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  Info,
  Check,
  Plug,
  Trash2,
  CheckCheck,
  Filter,
  Square,
  CheckSquare,
  MinusSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteNotification, deleteAllNotifications } from "@/lib/notifications-api";
import Link from "next/link";
import type { NotificationType, Notification } from "@/lib/types";

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  security_violation: Shield,
  prompt_submitted: FileText,
  prompt_approved: CheckCircle,
  prompt_rejected: XCircle,
  member_joined: UserPlus,
  member_left: UserMinus,
  system: Info,
  extension_inactive: Plug,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  security_violation: "text-destructive bg-destructive/10",
  prompt_submitted: "text-primary bg-primary/10",
  prompt_approved: "text-tp-green bg-tp-green/10",
  prompt_rejected: "text-tp-yellow bg-tp-yellow/10",
  member_joined: "text-primary bg-primary/10",
  member_left: "text-muted-foreground bg-muted",
  system: "text-muted-foreground bg-muted",
  extension_inactive: "text-tp-yellow bg-tp-yellow/10",
};

const FILTER_OPTIONS: { value: NotificationType | "all" | "unread"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "security_violation", label: "Security" },
  { value: "prompt_submitted", label: "Submitted" },
  { value: "prompt_approved", label: "Approved" },
  { value: "prompt_rejected", label: "Rejected" },
  { value: "member_joined", label: "Joined" },
  { value: "member_left", label: "Left" },
  { value: "extension_inactive", label: "Extension" },
  { value: "system", label: "System" },
];

function getNotificationLink(notification: Notification): string | null {
  const metadata = notification.metadata || {};

  switch (notification.type) {
    case "security_violation":
      return "/guardrails";
    case "prompt_submitted":
    case "prompt_approved":
    case "prompt_rejected":
      if (metadata.prompt_id) {
        return `/vault?prompt=${metadata.prompt_id}`;
      }
      return "/vault";
    case "extension_inactive":
      return "/team";
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead, refresh } = useNotifications();
  const [deleting, setDeleting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationType | "all" | "unread">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // Only show filters that have notifications
  const visibleFilters = useMemo(() => {
    const typesPresent = new Set(notifications.map((n) => n.type));
    const hasUnread = notifications.some((n) => !n.read);
    return FILTER_OPTIONS.filter((f) => {
      if (f.value === "all") return true;
      if (f.value === "unread") return hasUnread;
      return typesPresent.has(f.value as NotificationType);
    });
  }, [notifications]);

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((n) => n.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refresh();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} notification${selectedIds.size > 1 ? "s" : ""}?`)) return;
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteNotification(id)));
      setSelectedIds(new Set());
      refresh();
      toast.success(`Deleted ${selectedIds.size} notification${selectedIds.size > 1 ? "s" : ""}`);
    } catch {
      toast.error("Failed to delete some notifications");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.size === 0) return;
    try {
      const unreadSelected = filtered.filter((n) => selectedIds.has(n.id) && !n.read);
      await Promise.all(unreadSelected.map((n) => markRead(n.id)));
      setSelectedIds(new Set());
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete all notifications?")) return;
    setDeleting(true);
    try {
      await deleteAllNotifications();
      setSelectedIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to delete notifications");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated on security alerts, prompt approvals, and team activity"
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={() => markAllRead()}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" onClick={handleDeleteAll} disabled={deleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        }
      />

      {/* Filter pills */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {visibleFilters.map((f) => {
            const count =
              f.value === "all"
                ? notifications.length
                : f.value === "unread"
                  ? notifications.filter((n) => !n.read).length
                  : notifications.filter((n) => n.type === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => {
                  setActiveFilter(f.value);
                  setSelectedIds(new Set());
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {f.label}
                <span className={cn(
                  "text-[10px] min-w-[18px] h-[18px] rounded-full inline-flex items-center justify-center",
                  activeFilter === f.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bulk actions bar */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : someSelected ? (
              <MinusSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : "Select all"}
          </button>
          {selectedIds.size > 0 && (
            <>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleBulkMarkRead}>
                <Check className="mr-1 h-3 w-3" />
                Mark read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleBulkDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[72px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">
              {activeFilter !== "all" ? "No matching notifications" : "No notifications"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {activeFilter !== "all"
                ? "Try a different filter or clear your selection."
                : "You\u2019re all caught up! Notifications will appear here when there\u2019s activity."}
            </p>
            {activeFilter !== "all" && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveFilter("all")}>
                Show all notifications
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Info;
            const colorClass = NOTIFICATION_COLORS[notification.type] || "text-muted-foreground bg-muted";
            const link = getNotificationLink(notification);
            const isSelected = selectedIds.has(notification.id);

            const content = (
              <Card
                className={cn(
                  "transition-all duration-200 hover:shadow-md group",
                  !notification.read && "border-primary/20 bg-primary/5",
                  isSelected && "ring-2 ring-primary/30 bg-primary/5"
                )}
              >
                <CardContent className="flex items-center gap-3 py-3 px-4">
                  {/* Checkbox */}
                  <button
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSelect(notification.id);
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>

                  {/* Icon */}
                  <div className={cn("flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium truncate", !notification.read && "font-semibold text-foreground")}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                          New
                        </Badge>
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {notification.message}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markRead(notification.id);
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );

            if (link) {
              return (
                <Link
                  key={notification.id}
                  href={link}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button")) return;
                    if (!notification.read) void markRead(notification.id);
                  }}
                >
                  {content}
                </Link>
              );
            }

            return <div key={notification.id}>{content}</div>;
          })}
        </div>
      )}
    </>
  );
}
