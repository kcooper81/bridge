"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { deleteNotification } from "@/lib/notifications-api";
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

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Info;
  const colorClass = NOTIFICATION_COLORS[notification.type] || "text-muted-foreground bg-muted";
  const link = getNotificationLink(notification);

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
        !notification.read && "bg-primary/5",
        "hover:bg-muted/50 group"
      )}
    >
      <div className={cn("flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead(notification.id);
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
            onDelete(notification.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} onClick={() => !notification.read && onMarkRead(notification.id)}>
        {content}
      </Link>
    );
  }

  return content;
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead, refresh } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    refresh();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-110 transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-[10px] animate-scale-in"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 max-h-[500px] overflow-hidden"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[400px]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-border/50 p-2">
            <Link href="/notifications" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
