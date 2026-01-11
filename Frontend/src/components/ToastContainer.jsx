import Toast from './Toast';
import { useApp } from '../state/AppContext';

/**
 * ToastContainer Component
 * Manages and displays all toast notifications
 * Positioned fixed at top-right of screen
 */
const ToastContainer = () => {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="flex flex-col items-end pointer-events-auto">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
