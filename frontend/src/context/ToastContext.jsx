import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-slate-900/90 border border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
        };
      case 'error':
        return {
          bg: 'bg-slate-900/90 border border-rose-500/30 text-rose-400',
          icon: <AlertCircle className="w-5 h-5 text-rose-400" />
        };
      case 'warning':
        return {
          bg: 'bg-slate-900/90 border border-amber-500/30 text-amber-400',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
        };
      default:
        return {
          bg: 'bg-slate-900/90 border border-indigo-500/30 text-indigo-400',
          icon: <Info className="w-5 h-5 text-indigo-400" />
        };
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto animate-slide-in transition-all ${styles.bg}`}
            >
              <div className="flex items-center gap-3">
                {styles.icon}
                <span className="text-sm font-medium text-slate-100">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
