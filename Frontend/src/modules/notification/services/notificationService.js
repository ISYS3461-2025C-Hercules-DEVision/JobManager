/**
 * Notification Service
 * Handles all notification-related API calls
 */

import { httpClient } from '../../../utils/HttpUtil';
import { ENV } from '../../../config/env';

const NOTIFICATION_BASE_URL = ENV.NOTIFICATION_SERVICE_URL;

/**
 * Get notifications for a specific company
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} List of notifications
 */
export const getNotifications = async (companyId) => {
  try {
    const response = await httpClient.get(`${NOTIFICATION_BASE_URL}/notifications/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read (if backend supports)
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await httpClient.patch(`${NOTIFICATION_BASE_URL}/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await httpClient.delete(`${NOTIFICATION_BASE_URL}/notifications/${notificationId}`);
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};

/**
 * Get unread notification count for a company
 * @param {string} companyId - Company ID
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadCount = async (companyId) => {
  try {
    const notifications = await getNotifications(companyId);
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
};

export default {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
};

