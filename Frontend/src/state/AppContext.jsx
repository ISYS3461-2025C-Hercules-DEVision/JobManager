import { createContext, useContext, useState, useCallback } from 'react';

/**
 * App Context
 * Manages global application state
 */

const AppContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Theme state (for future dark mode support)
  const [theme, setTheme] = useState('light');

  // Notification/Toast state
  const [notifications, setNotifications] = useState([]);

  // Loading state for global operations
  const [globalLoading, setGlobalLoading] = useState(false);

  /**
   * Toggle sidebar open/close
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Remove notification (defined first to avoid reference error)
   */
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Add notification
   */
  const addNotification = useCallback((notification) => {
    const id = `notif-${Date.now()}-${Math.random()}`; // Generate unique ID
    const newNotification = {
      id,
      type: 'info', // info, success, warning, error
      message: '',
      duration: 5000,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [removeNotification]);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Show success message
   */
  const showSuccess = useCallback((message, duration = 3000) => {
    return addNotification({ type: 'success', message, duration });
  }, [addNotification]);

  /**
   * Show error message
   */
  const showError = useCallback((message, duration = 5000) => {
    return addNotification({ type: 'error', message, duration });
  }, [addNotification]);

  /**
   * Show info message
   */
  const showInfo = useCallback((message, duration = 4000) => {
    return addNotification({ type: 'info', message, duration });
  }, [addNotification]);

  /**
   * Show warning message
   */
  const showWarning = useCallback((message, duration = 4000) => {
    return addNotification({ type: 'warning', message, duration });
  }, [addNotification]);

  /**
   * Toggle theme
   */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = {
    // Sidebar
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,

    // Theme
    theme,
    setTheme,
    toggleTheme,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,

    // Global loading
    globalLoading,
    setGlobalLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

