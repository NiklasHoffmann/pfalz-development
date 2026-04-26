'use client';

import { useEffect, useState } from 'react';
import SearchInput from '@/components/ui/SearchInput';
import Table, { type Column } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { readJsonResponse } from '@/lib/api-client';

interface AdminDataSectionProps<T extends Record<string, unknown>> {
  title: string;
  description: string;
  endpoint: string;
  columns: Column<T>[];
  emptyMessage: string;
  searchPlaceholder?: string;
  headerActions?: React.ReactNode;
  reloadToken?: number;
  onRowClick?: (row: T) => void;
  queryParams?: Record<string, string | undefined>;
}

export function AdminDataSection<T extends Record<string, unknown>>({
  title,
  description,
  endpoint,
  columns,
  emptyMessage,
  searchPlaceholder = 'Suchen',
  headerActions,
  reloadToken,
  onRowClick,
  queryParams,
}: AdminDataSectionProps<T>) {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [rows, setRows] = useState<T[]>([]);
  const activeFilterCount = Object.values(queryParams || {}).filter((value) =>
    Boolean(value?.trim())
  ).length;

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(undefined);

      const url = new URL(endpoint, window.location.origin);

      Object.entries(queryParams || {}).forEach(([key, value]) => {
        if (value?.trim()) {
          url.searchParams.set(key, value);
        }
      });

      if (search.trim()) {
        url.searchParams.set('search', search.trim());
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      const payload = await readJsonResponse<{
        success?: boolean;
        data?: T[];
        error?: string;
      }>(response);

      if (isCancelled) {
        return;
      }

      if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
        setRows([]);
        setError(payload?.error || 'Daten konnten nicht geladen werden');
        setIsLoading(false);
        return;
      }

      setRows(payload.data);
      setIsLoading(false);
    }

    const timeout = window.setTimeout(() => {
      void loadData();
    }, 180);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [endpoint, queryParams, reloadToken, search]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
      <div className="flex flex-col gap-5 border-b border-stone-200 pb-5 dark:border-stone-800 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Datenbereich
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
            {description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
              {isLoading ? 'Laedt...' : `${rows.length} Eintraege`}
            </span>
            {search.trim() ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
                Suche aktiv
              </span>
            ) : null}
            {activeFilterCount ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
                {activeFilterCount} Filter aktiv
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 xl:max-w-md">
          {headerActions}
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch('')}
            placeholder={searchPlaceholder}
            isLoading={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="flex min-h-[12rem] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Table
            data={rows}
            columns={columns}
            onRowClick={onRowClick}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </section>
  );
}
