"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useNotifications(userId) {
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    userId ? { userId, limit: 20 } : "skip"
  );

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    userId ? { userId } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  return {
    notifications: notifications ?? [],
    unreadCount: unreadCount ?? 0,
    markAsRead,
    markAllAsRead: () => userId && markAllAsRead({ userId }),
    isLoading: notifications === undefined,
  };
}
