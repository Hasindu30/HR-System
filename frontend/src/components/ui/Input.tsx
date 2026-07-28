import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label, error, helperText, id, className = '', required, disabled, ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        required={required}
        disabled={disabled}
        className={`w-full h-10 px-3.5 text-sm text-slate-800 placeholder:text-slate-300 bg-white rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-300 focus:ring-red-300/50 focus:border-red-400 bg-red-50/10'
            : disabled
            ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
            : 'border-slate-200 hover:border-slate-300 focus:ring-blue-300/50 focus:border-[#2563eb]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>}
    </div>
  );
};
