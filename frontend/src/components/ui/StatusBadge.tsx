import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  let dot = 'bg-slate-400';
  let text = 'text-slate-700';
  let bg = 'bg-slate-50';

  if (['ACTIVE', 'PAID'].includes(normalized)) {
    dot = 'bg-[#16a34a]'; // Success Green
    text = 'text-emerald-800';
    bg = 'bg-emerald-50';
  } else if (['INACTIVE', 'TERMINATED', 'FAILED'].includes(normalized)) {
    dot = 'bg-[#dc2626]'; // Danger Red
    text = 'text-rose-700';
    bg = 'bg-rose-50';
  } else if (['ONBOARDING', 'PENDING'].includes(normalized)) {
    dot = 'bg-[#f59e0b]'; // Warning Amber
    text = 'text-amber-800';
    bg = 'bg-amber-50';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  );
};
