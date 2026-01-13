/**
 * NotificationContext
 * Global context for managing notifications
 * Provides notification updates and toast notifications
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProfile } from './ProfileContext';
import { useApp } from './AppContext';
import notificationService from '../modules/notification/services/notificationService';

const NotificationContext = createContext(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { profile } = useProfile();
  const { showInfo } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = profile?.companyId;

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
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  /**
   * Handle new notification
   */
  const handleNewNotification = useCallback((notification) => {
    console.log('🔔 New notification received:', notification);

    // Add new notification to the beginning of the list
    setNotifications((prev) => [notification, ...prev]);

    // Increment unread count
    setUnreadCount((prev) => prev + 1);

    // Show toast notification in top-right corner
    showInfo(notification.message, {
      title: notification.subject,
      duration: 5000,
    });

    // Optional: Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.subject, {
        body: notification.message,
        icon: '/notification-icon.png',
        tag: notification.id,
      });
    }
  }, [showInfo]);

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
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
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
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all as read in the backend (assuming there's an API for this)
      const unreadNotifications = notifications.filter((n) => !n.read);
      
      // Mark each unread notification
      await Promise.all(
        unreadNotifications.map((n) => notificationService.markAsRead(n.id))
      );

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [notifications]);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }, []);

  // Initialize: Fetch notifications
  useEffect(() => {
    if (!companyId) return;

    // Fetch initial notifications
    fetchNotifications();

    // Request notification permission
    requestNotificationPermission();
  }, [companyId, fetchNotifications, requestNotificationPermission]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
