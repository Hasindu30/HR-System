import React, { ReactNode } from 'react';

interface FormSectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ number, title, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-md bg-[#2563eb] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
        {number}
      </div>
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
      <div className="flex-1 border-t border-slate-100" />
    </div>
    <div className="pl-9 space-y-4">{children}</div>
  </div>
);
