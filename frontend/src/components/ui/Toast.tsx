'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const config = {
    success: { bar: 'bg-[#16a34a]', icon: 'text-[#16a34a]', border: 'border-emerald-100', iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' },
    error:   { bar: 'bg-[#dc2626]', icon: 'text-[#dc2626]', border: 'border-rose-100',    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' },
    info:    { bar: 'bg-[#2563eb]', icon: 'text-[#2563eb]', border: 'border-blue-100',    iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-full max-w-xs pointer-events-none">
        {toasts.map((toast) => {
          const c = config[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-stretch bg-white rounded-xl shadow-lg border ${c.border} overflow-hidden`}
            >
              <div className={`w-1 shrink-0 ${c.bar}`} />
              <div className="flex items-start justify-between gap-3 px-4 py-3 flex-1">
                <div className="flex items-start gap-2.5">
                  <svg className={`w-4 h-4 shrink-0 mt-0.5 fill-current ${c.icon}`} viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={c.iconPath} clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-800">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
                  aria-label="Dismiss"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
