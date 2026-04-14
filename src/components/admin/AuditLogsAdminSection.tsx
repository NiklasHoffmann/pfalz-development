'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/ui/Form/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import SearchInput from '@/components/ui/SearchInput';
import Table, { type Column } from '@/components/ui/Table';
import { cn } from '@/lib/utils';
import type { AdminAuditActorType, IntakeStaffRole } from '@/types/intake';

interface AdminAuditLogRow {
  [key: string]: unknown;
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  actorType: AdminAuditActorType;
  actorUserId?: string;
  actorEmail?: string;
  actorRole?: IntakeStaffRole;
  requestPath: string;
  method: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const actorTypeLabels: Record<AdminAuditActorType, string> = {
  'staff-user': 'Staff',
  'api-key': 'API-Key',
  system: 'System',
};

const methodBadgeClasses: Record<string, string> = {
  POST: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  PATCH:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
};

const actorBadgeClasses: Record<AdminAuditActorType, string> = {
  'staff-user':
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
  'api-key':
    'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200',
  system:
    'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200',
};

const resourceTypeOptions = [
  { value: 'form', label: 'Formulare' },
  { value: 'access-link', label: 'Zugangslinks' },
  { value: 'submission', label: 'Einreichungen' },
  { value: 'staff-user', label: 'Staff-Nutzer' },
  { value: 'template-bootstrap', label: 'Template-Bootstrap' },
];

function formatAuditTimestamp(value: string) {
  return new Date(value).toLocaleString('de-DE');
}

function formatMetadata(value?: Record<string, unknown>) {
  if (!value || Object.keys(value).length === 0) {
    return 'Keine Zusatzdaten gespeichert.';
  }

  return JSON.stringify(value, null, 2);
}

function getMethodBadgeClass(method: string) {
  return (
    methodBadgeClasses[method] ||
    'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'
  );
}

function getActorBadgeClass(actorType: AdminAuditActorType) {
  return actorBadgeClasses[actorType] || actorBadgeClasses.system;
}

export function AuditLogsAdminSection() {
  const [search, setSearch] = useState('');
  const [actorTypeFilter, setActorTypeFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [rows, setRows] = useState<AdminAuditLogRow[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string>();

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(undefined);

      const url = new URL('/api/intake/admin/audit', window.location.origin);

      if (search.trim()) {
        url.searchParams.set('search', search.trim());
      }

      if (actorTypeFilter) {
        url.searchParams.set('actorType', actorTypeFilter);
      }

      if (resourceTypeFilter) {
        url.searchParams.set('resourceType', resourceTypeFilter);
      }

      if (methodFilter) {
        url.searchParams.set('method', methodFilter);
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: AdminAuditLogRow[];
        error?: string;
      } | null;

      if (isCancelled) {
        return;
      }

      if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
        setRows([]);
        setSelectedLogId(undefined);
        setError(payload?.error || 'Audit-Logs konnten nicht geladen werden');
        setIsLoading(false);
        return;
      }

      const nextRows = payload.data;

      setRows(nextRows);
      setSelectedLogId((currentValue) => {
        if (
          currentValue &&
          nextRows.some((entry) => entry.id === currentValue)
        ) {
          return currentValue;
        }

        return nextRows[0]?.id;
      });
      setIsLoading(false);
    }

    const timeout = window.setTimeout(() => {
      void loadData();
    }, 180);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [actorTypeFilter, methodFilter, reloadToken, resourceTypeFilter, search]);

  const selectedLog =
    rows.find((entry) => entry.id === selectedLogId) || rows[0] || null;
  const activeFilterCount = [
    actorTypeFilter,
    resourceTypeFilter,
    methodFilter,
  ].filter(Boolean).length;

  const columns: Column<AdminAuditLogRow>[] = [
    {
      key: 'createdAt',
      label: 'Zeitpunkt',
      className: 'min-w-[11rem] whitespace-nowrap',
      render: (row) => (
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-50">
            {formatAuditTimestamp(row.createdAt)}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {row.method}
          </p>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Aktion',
      className: 'min-w-[14rem]',
      render: (row) => (
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-50">
            {row.action}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {row.requestPath}
          </p>
        </div>
      ),
    },
    {
      key: 'resource',
      label: 'Ressource',
      className: 'min-w-[12rem]',
      render: (row) => (
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-50">
            {row.resourceType}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {row.resourceId || 'Ohne Resource-ID'}
          </p>
        </div>
      ),
    },
    {
      key: 'actor',
      label: 'Akteur',
      className: 'min-w-[12rem]',
      render: (row) => (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                getActorBadgeClass(row.actorType)
              )}
            >
              {actorTypeLabels[row.actorType]}
            </span>
            {row.actorRole ? (
              <span className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {row.actorRole}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">
            {row.actorEmail || row.actorUserId || 'Kein Nutzerkontext'}
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
      <div className="flex flex-col gap-5 border-b border-stone-200 pb-5 dark:border-stone-800">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Datenbereich
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Audit-Log
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
              Nachvollziehbare Historie fuer Admin-Aktionen inklusive Akteur,
              Ressource, Request-Pfad und bereinigten Metadaten.
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

          <div className="flex w-full flex-col gap-3 xl:max-w-2xl">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Select
                label="Akteur"
                value={actorTypeFilter}
                onChange={(event) => setActorTypeFilter(event.target.value)}
                options={[
                  { value: 'staff-user', label: 'Staff' },
                  { value: 'api-key', label: 'API-Key' },
                  { value: 'system', label: 'System' },
                ]}
                placeholder="Alle"
              />
              <Select
                label="Ressource"
                value={resourceTypeFilter}
                onChange={(event) => setResourceTypeFilter(event.target.value)}
                options={resourceTypeOptions}
                placeholder="Alle"
              />
              <Select
                label="Methode"
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
                options={[
                  { value: 'POST', label: 'POST' },
                  { value: 'PATCH', label: 'PATCH' },
                ]}
                placeholder="Alle"
              />
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setReloadToken((currentValue) => currentValue + 1)
                  }
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                >
                  Aktualisieren
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setActorTypeFilter('');
                    setResourceTypeFilter('');
                    setMethodFilter('');
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                >
                  Reset
                </button>
              </div>
            </div>

            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch('')}
              placeholder="Suche nach Aktion, Ressource, Nutzer, Request-Pfad oder IP"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50/55 p-4 dark:border-stone-800 dark:bg-stone-950/25 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Verlauf
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Letzte Audit-Eintraege
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                Waehle einen Eintrag aus der Liste, um darunter die komplette
                Detailansicht mit Request-Kontext und Metadaten zu sehen.
              </p>
            </div>
            {selectedLog ? (
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                <p className="font-medium text-stone-900 dark:text-stone-50">
                  Aktiv ausgewaehlt
                </p>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  {selectedLog.action}
                </p>
              </div>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex min-h-[18rem] items-center justify-center rounded-[1.75rem] border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950/40">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table
              data={rows}
              columns={columns}
              onRowClick={(row) => setSelectedLogId(row.id)}
              rowClassName={(row) =>
                row.id === selectedLogId
                  ? '!bg-amber-100/75 dark:!bg-amber-950/30'
                  : undefined
              }
              emptyMessage="Noch keine Audit-Eintraege vorhanden"
              className="max-h-[70vh] overflow-auto"
            />
          )}
        </div>

        <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-950/30 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-stone-800 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Detailansicht
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {selectedLog ? selectedLog.action : 'Kein Eintrag ausgewaehlt'}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                Vollstaendiger Eintrag mit Akteur, Ressource, technischem
                Request-Kontext und bereinigten Metadaten in lesbarer Breite.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedLog ? (
                <span
                  className={cn(
                    'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                    getMethodBadgeClass(selectedLog.method)
                  )}
                >
                  {selectedLog.method}
                </span>
              ) : null}
              {selectedLog ? (
                <span
                  className={cn(
                    'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                    getActorBadgeClass(selectedLog.actorType)
                  )}
                >
                  {actorTypeLabels[selectedLog.actorType]}
                </span>
              ) : null}
            </div>
          </div>

          {selectedLog ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Zeitpunkt
                  </p>
                  <p className="mt-3 text-sm font-medium text-stone-900 dark:text-stone-50">
                    {formatAuditTimestamp(selectedLog.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Akteur
                  </p>
                  <p className="mt-3 text-sm font-medium text-stone-900 dark:text-stone-50">
                    {selectedLog.actorEmail ||
                      selectedLog.actorUserId ||
                      actorTypeLabels[selectedLog.actorType]}
                  </p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {actorTypeLabels[selectedLog.actorType]}
                    {selectedLog.actorRole ? ` • ${selectedLog.actorRole}` : ''}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Ressource
                  </p>
                  <p className="mt-3 text-sm font-medium text-stone-900 dark:text-stone-50">
                    {selectedLog.resourceType}
                  </p>
                  <p className="mt-1 break-all text-xs text-stone-500 dark:text-stone-400">
                    {selectedLog.resourceId || 'Ohne Resource-ID'}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Request-Pfad
                  </p>
                  <p className="mt-3 break-all text-sm font-medium text-stone-900 dark:text-stone-50">
                    {selectedLog.requestPath}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
                <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                        Aktion
                      </p>
                      <p className="mt-2 break-all text-sm font-medium text-stone-900 dark:text-stone-50">
                        {selectedLog.action}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                        Methode
                      </p>
                      <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">
                        {selectedLog.method}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                        IP-Adresse
                      </p>
                      <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">
                        {selectedLog.ip || 'Nicht gespeichert'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                        Rolle
                      </p>
                      <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">
                        {selectedLog.actorRole || 'Nicht gespeichert'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    User-Agent
                  </p>
                  <p className="mt-3 break-words text-sm leading-6 text-stone-700 dark:text-stone-200">
                    {selectedLog.userAgent || 'Nicht gespeichert'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                <div className="flex flex-col gap-2 border-b border-stone-200 pb-4 dark:border-stone-800 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                      Metadaten
                    </p>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                      Bereinigtes Payload fuer schnelle forensische Einordnung
                      ohne schmale Seitenleiste.
                    </p>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    JSON, formatiert
                  </span>
                </div>
                <pre className="mt-5 min-h-[18rem] overflow-auto rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-xs leading-6 text-stone-100 dark:border-stone-700">
                  {formatMetadata(selectedLog.metadata)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900/45 dark:text-stone-400">
              Noch kein Audit-Eintrag vorhanden.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
