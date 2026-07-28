import React, { ReactNode } from 'react';

interface PageHeaderProps {
  context: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ description, action }) => {
  // If there's no description and no action, render nothing
  if (!description && !action) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-1">
      <div className="min-w-0">
        {description && (
          <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xl truncate sm:whitespace-normal">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
          {action}
        </div>
      )}
    </div>
  );
};
