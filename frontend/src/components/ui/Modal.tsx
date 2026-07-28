import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, subtitle, children, maxWidth = 'lg',
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-[20px] shadow-2xl w-full ${widths[maxWidth]} border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#2563eb] to-[#64748b] shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
