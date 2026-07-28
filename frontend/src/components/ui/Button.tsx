import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white rounded-lg shadow-sm focus-visible:ring-[#2563eb]/40',
    secondary:
      'bg-[#64748b] hover:bg-[#475569] active:bg-[#334155] text-white rounded-lg shadow-sm focus-visible:ring-[#64748b]/40',
    success:
      'bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white rounded-lg shadow-sm focus-visible:ring-[#16a34a]/40',
    danger:
      'bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white rounded-lg shadow-sm focus-visible:ring-[#dc2626]/40',
    warning:
      'bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-white rounded-lg shadow-sm focus-visible:ring-[#f59e0b]/40',
    outline:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-xs focus-visible:ring-[#2563eb]/40',
    ghost:
      'bg-transparent hover:bg-slate-50 active:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg focus-visible:ring-[#64748b]/40',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-[11px] gap-1 leading-none',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 h-10 text-sm gap-2',
    lg: 'px-5 h-10 text-sm gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-3.5 w-3.5 text-current shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
