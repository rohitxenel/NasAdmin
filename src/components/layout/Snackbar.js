'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

export default function Snackbar({ 
  message, 
  type = 'success', 
  visible, 
  onClose, 
  duration = 4000,
  position = 'bottom-right',
  action,
  actionText = 'Action'
}) {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'error':
        return <FiXCircle className="w-5 h-5" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5" />;
      case 'info':
        return <FiInfo className="w-5 h-5" />;
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  // Get background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-800';
    }
  };

  // Get position classes
  const getPosition = () => {
    switch (position) {
      case 'top-left':
        return 'top-6 left-6';
      case 'top-center':
        return 'top-6 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-center':
        return 'bottom-6 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position.includes('bottom') ? 50 : -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.includes('bottom') ? 50 : -50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`fixed z-50 max-w-sm rounded-xl shadow-lg text-white ${getBgColor()} ${getPosition()}`}
        >
          <div className="flex items-start p-4">
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
              {action && (
                <button
                  onClick={action}
                  className="mt-2 text-xs font-semibold underline opacity-90 hover:opacity-100 transition-opacity"
                >
                  {actionText}
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-3 text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="h-1 bg-white/30 rounded-b-xl"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}