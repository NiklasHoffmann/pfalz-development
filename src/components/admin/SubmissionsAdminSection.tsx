'use client';

import { useMemo, useState } from 'react';
import Select from '@/components/ui/Form/Select';
import { AdminDataSection } from '@/components/admin/AdminDataSection';
import { useRouter } from 'next/navigation';
import { intakeFormTypes, intakeSubmissionStatuses } from '@/types/intake';

interface IntakeSubmissionRow {
  [key: string]: unknown;
  id: string;
  status: string;
  projectId: string;
  updatedAt: string;
  internalNotes?: string;
  accessLink?: {
    customerName?: string;
    email?: string;
    company?: string;
    formSnapshot?: {
      title?: string;
      formType?: string;
    };
  } | null;
}

interface SubmissionsAdminSectionProps {
  locale: string;
  canExport?: boolean;
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

const statusLabelMap: Record<string, string> = {
  begonnen: 'Begonnen',
  teilweise_ausgefüllt: 'Teilweise ausgefuellt',
  vollständig_eingereicht: 'Eingereicht',
  intern_geprüft: 'Intern geprueft',
  rückfrage_offen: 'Rueckfrage offen',
  abgeschlossen: 'Abgeschlossen',
};

const statusColorMap: Record<string, string> = {
  begonnen:
    'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200',
  teilweise_ausgefüllt:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  vollständig_eingereicht:
    'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  intern_geprüft:
    'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200',
  rückfrage_offen:
    'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200',
  abgeschlossen:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
};

function getStatusLabel(status: string) {
  return statusLabelMap[status] || status;
}

function getStatusBadgeClass(status: string) {
  return statusColorMap[status] || statusColorMap.begonnen;
}

export function SubmissionsAdminSection({
  locale,
  canExport = false,
}: SubmissionsAdminSectionProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [isUpdatingKey, setIsUpdatingKey] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [actionMessage, setActionMessage] = useState<string>();

  const queryParams = useMemo(
    () => ({
      status: statusFilter || undefined,
      formType: formTypeFilter || undefined,
    }),
    [formTypeFilter, statusFilter]
  );

  async function updateStatus(
    id: string,
    status: string,
    event: React.MouseEvent
  ) {
    event.stopPropagation();
    setIsUpdatingKey(`${id}:${status}`);
    setActionError(undefined);
    setActionMessage(undefined);

    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const payload = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: string;
    } | null;

    if (!response.ok || !payload?.success) {
      setActionError(
        payload?.error || 'Status konnte nicht aktualisiert werden'
      );
      setIsUpdatingKey(undefined);
      return;
    }

    setActionMessage(`Status wurde auf ${getStatusLabel(status)} gesetzt.`);
    setReloadToken((currentValue) => currentValue + 1);
    setIsUpdatingKey(undefined);
  }

  function exportSubmissionsCsv() {
    const exportUrl = new URL(
      '/api/admin/submissions/export',
      window.location.origin
    );

    if (statusFilter) {
      exportUrl.searchParams.set('status', statusFilter);
    }

    if (formTypeFilter) {
      exportUrl.searchParams.set('formType', formTypeFilter);
    }

    window.open(exportUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  const headerActions = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Status filtern"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={intakeSubmissionStatuses.map((value) => ({
            value,
            label: getStatusLabel(value),
          }))}
          placeholder="Alle Status"
        />
        <Select
          label="Typ filtern"
          value={formTypeFilter}
          onChange={(event) => setFormTypeFilter(event.target.value)}
          options={intakeFormTypes.map((value) => ({
            value,
            label: value,
          }))}
          placeholder="Alle Formulartypen"
        />
      </div>
      {canExport ? (
        <div className="flex justify-start sm:justify-end">
          <button
            type="button"
            onClick={exportSubmissionsCsv}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
          >
            CSV exportieren
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-4">
      {(actionError || actionMessage) && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${actionError ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'}`}
        >
          {actionError || actionMessage}
        </div>
      )}

      <AdminDataSection<IntakeSubmissionRow>
        title="Einreichungen"
        description="Suche und Uebersicht ueber alle laufenden und abgeschlossenen Intake-Einreichungen."
        endpoint="/api/admin/submissions"
        searchPlaceholder="Suche nach Kunde, Firma, E-Mail oder Projekt"
        emptyMessage="Noch keine Einreichungen vorhanden"
        headerActions={headerActions}
        queryParams={queryParams}
        reloadToken={reloadToken}
        onRowClick={(row) => {
          router.push(withLocale(locale, `/admin/submissions/${row.id}`));
        }}
        columns={[
          {
            key: 'projectId',
            label: 'Projekt',
            className: 'min-w-[12rem]',
            render: (row) => (
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-50">
                  {row.projectId}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {row.accessLink?.company ||
                    row.accessLink?.email ||
                    'Ohne Zusatzinfo'}
                </p>
              </div>
            ),
          },
          {
            key: 'customer',
            label: 'Kunde',
            className: 'min-w-[12rem]',
            render: (row) => (
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-50">
                  {row.accessLink?.customerName || '-'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {row.accessLink?.email || 'Keine E-Mail'}
                </p>
              </div>
            ),
          },
          {
            key: 'form',
            label: 'Formular',
            className: 'min-w-[14rem]',
            render: (row) => (
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-50">
                  {row.accessLink?.formSnapshot?.title || '-'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {row.accessLink?.formSnapshot?.formType || 'Ohne Typ'}
                </p>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            className: 'whitespace-nowrap',
            render: (row) => (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(row.status)}`}
              >
                {getStatusLabel(row.status)}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Schnellaktionen',
            className: 'min-w-[12rem]',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                {row.status !== 'intern_geprüft' && (
                  <button
                    type="button"
                    onClick={(event) =>
                      void updateStatus(row.id, 'intern_geprüft', event)
                    }
                    disabled={Boolean(isUpdatingKey)}
                    className="rounded-full border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:border-indigo-500 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900 dark:text-indigo-200"
                  >
                    {isUpdatingKey === `${row.id}:intern_geprüft`
                      ? '...'
                      : 'Pruefen'}
                  </button>
                )}
                {row.status !== 'rückfrage_offen' && (
                  <button
                    type="button"
                    onClick={(event) =>
                      void updateStatus(row.id, 'rückfrage_offen', event)
                    }
                    disabled={Boolean(isUpdatingKey)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700 transition hover:border-rose-500 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:text-rose-200"
                  >
                    {isUpdatingKey === `${row.id}:rückfrage_offen`
                      ? '...'
                      : 'Rueckfrage'}
                  </button>
                )}
                {row.status !== 'abgeschlossen' && (
                  <button
                    type="button"
                    onClick={(event) =>
                      void updateStatus(row.id, 'abgeschlossen', event)
                    }
                    disabled={Boolean(isUpdatingKey)}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-900 dark:text-emerald-200"
                  >
                    {isUpdatingKey === `${row.id}:abgeschlossen`
                      ? '...'
                      : 'Abschliessen'}
                  </button>
                )}
              </div>
            ),
          },
          {
            key: 'updatedAt',
            label: 'Aktualisiert',
            className: 'whitespace-nowrap',
            render: (row) => new Date(row.updatedAt).toLocaleString('de-DE'),
          },
        ]}
      />
    </div>
  );
}
