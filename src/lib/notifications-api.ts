import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

export async function getNotifications(options?: {
  limit?: number;
  unreadOnly?: boolean;
}): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const { limit = 50, unreadOnly = false } = options || {};
  const supabase = createClient();

  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const [notificationsRes, countRes] = await Promise.all([
    query,
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
  ]);

  return {
    notifications: (notificationsRes.data || []) as Notification[],
    unreadCount: countRes.count || 0,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", id);
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("read", false);
}

export async function deleteNotification(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").delete().eq("id", id);
}

export async function deleteAllNotifications(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("notifications").delete().eq("user_id", user.id);
  }
}
