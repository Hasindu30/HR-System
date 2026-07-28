'use client';

import React, {
  SelectHTMLAttributes,
  useRef,
  useState,
  useEffect,
  useId,
} from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/* ── Status colour map ── */
const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  ACTIVE:      { dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  PAID:        { dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  INACTIVE:    { dot: 'bg-rose-500',    bg: 'bg-rose-50',     text: 'text-rose-700'    },
  TERMINATED:  { dot: 'bg-rose-500',    bg: 'bg-rose-50',     text: 'text-rose-700'    },
  FAILED:      { dot: 'bg-rose-500',    bg: 'bg-rose-50',     text: 'text-rose-700'    },
  ONBOARDING:  { dot: 'bg-amber-400',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  PENDING:     { dot: 'bg-amber-400',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  'FULL-TIME': { dot: 'bg-blue-500',    bg: 'bg-blue-50',     text: 'text-blue-700'    },
  'PART-TIME': { dot: 'bg-purple-500',  bg: 'bg-purple-50',   text: 'text-purple-700'  },
  CONTRACT:    { dot: 'bg-slate-500',   bg: 'bg-slate-100',   text: 'text-slate-700'   },
  INTERNSHIP:  { dot: 'bg-cyan-500',    bg: 'bg-cyan-50',     text: 'text-cyan-700'    },
};

function getStatusColors(label: string) {
  return STATUS_COLORS[label.toUpperCase().replace('-', '-')] ?? null;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  id: externalId,
  className = '',
  required,
  disabled,
  value,
  onChange,
  ...props
}) => {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenSelectRef = useRef<HTMLSelectElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value)) ?? options[0];
  const selectedColors = selectedOption ? getStatusColors(String(selectedOption.label)) : null;

  const triggerSelect = (optValue: string | number) => {
    if (!hiddenSelectRef.current) return;
    const nativeSelectSetter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      'value'
    )?.set;
    nativeSelectSetter?.call(hiddenSelectRef.current, String(optValue));
    hiddenSelectRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    setOpen(false);
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide"
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}

      {/* Hidden native select – handles form value and onChange wiring */}
      <select
        ref={hiddenSelectRef}
        id={id}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom trigger */}
      <button
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${id} ${id}-trigger` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`
          w-full h-10 px-3.5 flex items-center justify-between gap-2
          text-sm rounded-lg border transition-all duration-150 text-left
          focus:outline-none focus-visible:ring-1
          ${
            error
              ? 'border-red-300 focus-visible:ring-red-300/50 focus-visible:border-red-400 bg-red-50/10'
              : disabled
              ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
              : open
              ? 'border-[#2563eb] ring-1 ring-blue-300/50 bg-white shadow-sm'
              : 'border-slate-200 hover:border-slate-300 bg-white focus-visible:ring-blue-300/50 focus-visible:border-[#2563eb]'
          }
          ${className}
        `}
      >
        {/* Selected value display */}
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption && selectedColors ? (
            <>
              <span className={`w-2 h-2 rounded-full shrink-0 ${selectedColors.dot}`} />
              <span className={`text-sm font-semibold truncate ${selectedColors.text}`}>
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className={`truncate ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
              {selectedOption?.label ?? 'Select…'}
            </span>
          )}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && !disabled && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute z-50 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden min-w-[180px] py-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
          style={{ minWidth: containerRef.current?.offsetWidth }}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            const colors = getStatusColors(String(opt.label));

            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => triggerSelect(opt.value)}
                className={`
                  w-full flex items-center justify-between gap-3 px-4 py-2.5
                  text-sm transition-colors duration-100 text-left
                  ${isSelected
                    ? 'bg-blue-50/60 text-[#2563eb]'
                    : 'hover:bg-slate-50 text-slate-700'}
                `}
              >
                {/* Option label */}
                <span className="flex items-center gap-2.5 min-w-0">
                  {colors ? (
                    <>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                      <span
                        className={`text-[13px] font-semibold ${
                          isSelected ? 'text-[#2563eb]' : colors.text
                        }`}
                      >
                        {opt.label}
                      </span>
                    </>
                  ) : (
                    <span className={`text-[13px] ${isSelected ? 'font-semibold text-[#2563eb]' : 'font-medium text-slate-700'}`}>
                      {opt.label}
                    </span>
                  )}
                </span>

                {/* Checkmark */}
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 shrink-0 text-[#2563eb]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>}
    </div>
  );
};
