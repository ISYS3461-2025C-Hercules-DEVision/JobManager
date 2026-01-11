import { useEffect, useState } from 'react';

/**
 * Toast Component
 * Individual toast notification with auto-dismiss and animations
 */
const Toast = ({ id, type, message, duration, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Fade in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    if (duration > 0) {
      const hideTimer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => onClose(id), 300); // Wait for fade out animation
      }, duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    return () => clearTimeout(showTimer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  // Toast styles based on type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-700';
      case 'error':
        return 'bg-red-500 border-red-700';
      case 'warning':
        return 'bg-yellow-500 border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-500 border-blue-700';
    }
  };

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        border-4 border-black text-white
        px-6 py-4 mb-4 min-w-[320px] max-w-md
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="font-bold text-white leading-tight">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white hover:text-black transition-colors font-black text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Progress bar for duration */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 overflow-hidden">
          <div
            className="h-full bg-white bg-opacity-50"
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
