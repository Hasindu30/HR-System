import React from 'react';
import { Button } from './Button';

interface TableEmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  title = 'Nothing here yet',
  message = 'Get started by creating your first entry.',
  actionText, onAction, icon,
}) => (
  <div className="w-full py-14 px-6 text-center">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-[#2563eb] mx-auto mb-4">
      {icon ?? (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
    </div>
    <h4 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h4>
    <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">{message}</p>
    {actionText && onAction && (
      <div className="mt-5">
        <Button size="sm" onClick={onAction}>{actionText}</Button>
      </div>
    )}
  </div>
);
