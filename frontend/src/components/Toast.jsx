import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ type = 'info', message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  };

  const iconColors = {
    success: 'text-success-500',
    error: 'text-danger-500',
    warning: 'text-warning-500',
    info: 'text-primary-500',
  };

  const Icon = icons[type];

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg border-l-4 shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${colors[type]}`}
    >
      <div className="flex items-start p-4">
        <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${iconColors[type]}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`ml-3 flex-shrink-0 ${iconColors[type]} hover:opacity-70`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast context and hook
const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = {
    success: (message, duration) => addToast({ type: 'success', message, duration }),
    error: (message, duration) => addToast({ type: 'error', message, duration }),
    warning: (message, duration) => addToast({ type: 'warning', message, duration }),
    info: (message, duration) => addToast({ type: 'info', message, duration }),
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-0 right-0 p-4 space-y-4 z-50">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;
