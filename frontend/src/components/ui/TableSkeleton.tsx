import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="w-full animate-pulse divide-y divide-slate-100">
    {Array.from({ length: rows }).map((_, rIdx) => (
      <div key={rIdx} className="px-5 py-4 flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-1/3" />
          <div className="h-2.5 bg-slate-50 rounded w-1/4" />
        </div>
        {Array.from({ length: Math.max(0, cols - 2) }).map((_, cIdx) => (
          <div key={cIdx} className={`h-3 bg-slate-100 rounded ${cIdx === cols - 3 ? 'w-16' : 'w-24'}`} />
        ))}
      </div>
    ))}
  </div>
);
