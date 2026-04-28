'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function Table<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  rowClassName,
  isLoading,
  emptyMessage = 'No data available',
  className,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-400">
        {emptyMessage}
      </div>
    );
  }

  const renderCellValue = (row: T, column: Column<T>) =>
    column.render ? column.render(row) : String(row[column.key] ?? '');

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950/40',
        className
      )}
    >
      <div className="divide-y divide-stone-200 dark:divide-stone-800 sm:hidden">
        {data.map((row, index) => (
          <article
            key={String(row.id ?? index)}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'space-y-3 px-4 py-4 transition-colors odd:bg-white even:bg-stone-50/55 dark:odd:bg-transparent dark:even:bg-stone-900/35',
              onRowClick &&
                'cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-900',
              rowClassName?.(row)
            )}
          >
            {columns.map((column) => (
              <div
                key={String(column.key)}
                className="grid gap-1 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-2.5 dark:border-stone-800 dark:bg-stone-950/40"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                  {column.label}
                </span>
                <div
                  className={cn(
                    'min-w-0 text-sm leading-6 text-stone-700 dark:text-stone-200',
                    column.className
                  )}
                >
                  {renderCellValue(row, column)}
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-100/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400',
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {data.map((row, index) => (
              <tr
                key={String(row.id ?? index)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors odd:bg-white even:bg-stone-50/55 dark:odd:bg-transparent dark:even:bg-stone-900/35',
                  onRowClick &&
                    'cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-900',
                  rowClassName?.(row)
                )}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3.5 align-top text-sm leading-6 text-stone-700 dark:text-stone-200',
                      column.className
                    )}
                  >
                    {renderCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
