/**
 * useNotifications Hook
 * Manages notification state
 */

import { useState, useEffect, useCallback } from "react";
import notificationService from "../services/notificationService";

export const useNotifications = (companyId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch initial notifications from REST API
   */
  const fetchNotifications = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(companyId);
      setNotifications(data || []);

      // Calculate unread count
      const unread = (data || []).filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  /**
   * Handle new notification (polling-based)
   */
  const handleNewNotification = useCallback((notification) => {
    console.log("New notification received:", notification);

    // Add new notification to the beginning of the list
    setNotifications((prev) => [notification, ...prev]);

    // Increment unread count
    setUnreadCount((prev) => prev + 1);

    // Optional: Show browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.subject, {
        body: notification.message,
        icon: "/notification-icon.png", // Add your icon path
        tag: notification.id,
      });
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // Decrement unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await notificationService.deleteNotification(notificationId);

        // Find if the notification was unread
        const notification = notifications.find((n) => n.id === notificationId);

        // Update local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Decrement unread count if it was unread
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    },
    [notifications]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
    }
  }, []);

  // Initialize: Fetch notifications and connect to WebSocket
  useEffect(() => {
    if (!companyId) return;

    // Fetch initial notifications
    fetchNotifications();

    // Connect to WebSocket for real-time updates
    webSocketService.connect(companyId, handleNewNotification);

    // Request notification permission
    requestNotificationPermission();

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [
    companyId,
    fetchNotifications,
    handleNewNotification,
    requestNotificationPermission,
  ]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
