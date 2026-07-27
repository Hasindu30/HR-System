import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  const normalized = status.toUpperCase();

  if (['ACTIVE', 'PAID'].includes(normalized)) {
    badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['INACTIVE', 'TERMINATED', 'FAILED'].includes(normalized)) {
    badgeStyles = 'bg-red-50 text-red-700 border-red-200/80';
  } else if (['ONBOARDING', 'PENDING'].includes(normalized)) {
    badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200/80';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        ['ACTIVE', 'PAID'].includes(normalized) ? 'bg-emerald-500' :
        ['INACTIVE', 'TERMINATED', 'FAILED'].includes(normalized) ? 'bg-red-500' : 'bg-amber-500'
      }`} />
      {status}
    </span>
  );
};
