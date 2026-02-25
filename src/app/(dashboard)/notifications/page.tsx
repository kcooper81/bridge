"use client";

import { useState } from "react";
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
  Trash2,
  CheckCheck,
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
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  security_violation: "text-destructive bg-destructive/10",
  prompt_submitted: "text-primary bg-primary/10",
  prompt_approved: "text-tp-green bg-tp-green/10",
  prompt_rejected: "text-tp-yellow bg-tp-yellow/10",
  member_joined: "text-primary bg-primary/10",
  member_left: "text-muted-foreground bg-muted",
  system: "text-muted-foreground bg-muted",
};

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
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead, refresh } = useNotifications();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      refresh();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete all notifications?")) return;
    setDeleting(true);
    try {
      await deleteAllNotifications();
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;re all caught up! Notifications will appear here when there&apos;s activity.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Info;
            const colorClass = NOTIFICATION_COLORS[notification.type] || "text-muted-foreground bg-muted";
            const link = getNotificationLink(notification);

            const content = (
              <Card
                className={cn(
                  "transition-all duration-200 hover:shadow-md group",
                  !notification.read && "border-primary/20 bg-primary/5"
                )}
              >
                <CardContent className="flex items-start gap-4 py-4 px-5">
                  <div className={cn("flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center", colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm font-semibold", !notification.read && "text-foreground")}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              New
                            </Badge>
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markRead(notification.id);
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
                    // Don't mark as read if user clicked a button inside (stopPropagation already handled)
                    if ((e.target as HTMLElement).closest("button")) return;
                    if (!notification.read) markRead(notification.id);
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
