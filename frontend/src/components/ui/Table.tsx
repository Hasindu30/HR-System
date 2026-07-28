import React, { ReactNode } from 'react';
import { TableSkeleton } from './TableSkeleton';
import { TableEmptyState } from './TableEmptyState';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyTitle?: string;
  emptyMessage?: string;
  onEmptyAction?: () => void;
  emptyActionText?: string;
  emptyIcon?: ReactNode;
  isLoading?: boolean;
}

export function Table<T>({
  columns, data, keyExtractor,
  emptyTitle, emptyMessage, onEmptyAction, emptyActionText, emptyIcon,
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-[20px] border border-slate-100 bg-white">
        <TableSkeleton rows={5} cols={columns.length} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-[20px] border border-slate-100 bg-white">
        <TableEmptyState title={emptyTitle} message={emptyMessage} onAction={onEmptyAction} actionText={emptyActionText} icon={emptyIcon} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {columns.map((col, idx) => {
                const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                return (
                  <th key={idx} className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${align} ${col.className ?? ''}`}>
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-50/60 transition-colors duration-100">
                {columns.map((col, idx) => {
                  const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                  return (
                    <td key={idx} className={`px-5 py-3.5 text-sm text-slate-700 ${align} ${col.className ?? ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as ReactNode)
                        : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
