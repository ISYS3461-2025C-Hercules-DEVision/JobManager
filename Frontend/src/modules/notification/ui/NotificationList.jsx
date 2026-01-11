/**
 * NotificationList Component
 * Displays a list of notifications with read/unread status
 */

const NotificationList = ({ notifications, onMarkAsRead, onDelete }) => {
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      onDelete(notificationId);
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
            !notification.read ? 'bg-blue-50' : 'bg-white'
          }`}
        >
          {/* Unread Indicator */}
          {!notification.read && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
          )}

          <div className={`${!notification.read ? 'ml-4' : ''} flex justify-between items-start`}>
            <div className="flex-1 min-w-0 pr-4">
              {/* Subject/Title */}
              <h4 className={`text-sm font-semibold text-gray-900 mb-1 ${
                !notification.read ? 'font-bold' : 'font-medium'
              }`}>
                {notification.subject}
              </h4>

              {/* Message */}
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {notification.message}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTimeAgo(notification.createdAt)}
                </span>
                
                {notification.applicantName && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {notification.applicantName}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-2">
              {/* Mark as Read Button */}
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                  title="Mark as read"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}

              {/* Delete Button */}
              <button
                onClick={(e) => handleDelete(e, notification.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                title="Delete notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
