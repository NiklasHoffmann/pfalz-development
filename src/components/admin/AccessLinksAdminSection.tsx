'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { AdminDataSection } from '@/components/admin/AdminDataSection';
import Input from '@/components/ui/Form/Input';
import Select from '@/components/ui/Form/Select';

interface IntakeAccessLinkRow {
  [key: string]: unknown;
  id: string;
  locale?: string;
  projectId: string;
  customerName: string;
  email?: string;
  isActive: boolean;
  tokenPreview: string;
  createdAt: string;
  formSnapshot: {
    title: string;
  };
}

interface FormOption {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface AccessLinkCreateResult {
  accessUrl: string;
  qrValue: string;
  tokenPreview: string;
}

interface AccessLinkUpdateResult {
  accessLink?: IntakeAccessLinkRow;
  accessUrl?: string;
  qrValue?: string;
}

interface AccessLinkShareResult {
  accessUrl: string;
  qrValue: string;
  tokenPreview: string;
}

interface AccessLinkFormState {
  formId: string;
  projectId: string;
  customerName: string;
  company: string;
  email: string;
  phone: string;
  expiresAt: string;
  locale: 'de' | 'en' | 'pfl';
}

const initialFormState: AccessLinkFormState = {
  formId: '',
  projectId: '',
  customerName: '',
  company: '',
  email: '',
  phone: '',
  expiresAt: '',
  locale: 'de',
};

export function AccessLinksAdminSection() {
  const [forms, setForms] = useState<FormOption[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [formState, setFormState] =
    useState<AccessLinkFormState>(initialFormState);
  const [submitError, setSubmitError] = useState<string>();
  const [submitSuccess, setSubmitSuccess] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] =
    useState<AccessLinkShareResult | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle'
  );
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>();
  const [qrCodeError, setQrCodeError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [actionMessage, setActionMessage] = useState<string>();
  const [activeActionKey, setActiveActionKey] = useState<string>();

  useEffect(() => {
    let isCancelled = false;

    async function loadForms() {
      setIsLoadingForms(true);
      const response = await fetch('/api/admin/forms', {
        credentials: 'include',
      });
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: Array<{
          id?: string;
          _id?: string;
          title?: string;
          slug?: string;
          status?: string;
        }>;
      } | null;

      if (isCancelled) {
        return;
      }

      if (response.ok && payload?.success && Array.isArray(payload.data)) {
        const nextForms = payload.data
          .map((form) => ({
            id: String(form.id || form._id || ''),
            title: form.title || 'Ohne Titel',
            slug: form.slug || '',
            status: form.status || 'draft',
          }))
          .filter((form) => form.id);

        setForms(nextForms);
        setFormState((currentState) => ({
          ...currentState,
          formId: currentState.formId || nextForms[0]?.id || '',
        }));
      }

      setIsLoadingForms(false);
    }

    void loadForms();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function generateQrCode() {
      if (!createdResult?.qrValue) {
        setQrCodeDataUrl(undefined);
        setQrCodeError(undefined);
        return;
      }

      try {
        const nextDataUrl = await QRCode.toDataURL(createdResult.qrValue, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 320,
          color: {
            dark: '#1c1917',
            light: '#fcfbf7',
          },
        });

        if (!isCancelled) {
          setQrCodeDataUrl(nextDataUrl);
          setQrCodeError(undefined);
        }
      } catch {
        if (!isCancelled) {
          setQrCodeDataUrl(undefined);
          setQrCodeError('QR-Code konnte nicht erzeugt werden.');
        }
      }
    }

    void generateQrCode();

    return () => {
      isCancelled = true;
    };
  }, [createdResult]);

  function updateField<Key extends keyof AccessLinkFormState>(
    key: Key,
    value: AccessLinkFormState[Key]
  ) {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    window.setTimeout(() => {
      setCopyState('idle');
    }, 1800);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);
    setSubmitSuccess(undefined);
    setActionError(undefined);
    setActionMessage(undefined);
    setCreatedResult(null);

    const payload = {
      formId: formState.formId,
      projectId: formState.projectId.trim(),
      customerName: formState.customerName.trim(),
      company: formState.company.trim() || undefined,
      email: formState.email.trim() || undefined,
      phone: formState.phone.trim() || undefined,
      locale: formState.locale,
      expiresAt: formState.expiresAt
        ? new Date(formState.expiresAt).toISOString()
        : undefined,
    };

    const response = await fetch('/api/admin/access-links', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: string;
      data?: AccessLinkCreateResult;
    } | null;

    if (!response.ok || !result?.success || !result.data) {
      setSubmitError(
        result?.error || 'Zugangslink konnte nicht erstellt werden'
      );
      setIsSubmitting(false);
      return;
    }

    setCreatedResult(result.data);
    setSubmitSuccess(
      'Zugangslink wurde erstellt und steht sofort zur Verfuegung.'
    );
    setReloadToken((currentValue) => currentValue + 1);
    setFormState((currentState) => ({
      ...initialFormState,
      formId: currentState.formId,
      locale: currentState.locale,
    }));
    setIsSubmitting(false);
  }

  const formOptions = forms.map((form) => ({
    value: form.id,
    label: `${form.title} (${form.slug})`,
  }));

  function exportAccessLinksCsv() {
    const exportUrl = new URL(
      '/api/admin/access-links/export',
      window.location.origin
    );

    if (isActiveFilter) {
      exportUrl.searchParams.set('isActive', isActiveFilter);
    }

    window.open(exportUrl.toString(), '_blank', 'noopener,noreferrer');
  }

  async function updateAccessLink(
    row: IntakeAccessLinkRow,
    payload: { isActive?: boolean; regenerateToken?: boolean },
    successMessage: string,
    event: React.MouseEvent
  ) {
    event.stopPropagation();
    setActiveActionKey(
      `${row.id}:${payload.regenerateToken ? 'regenerate' : payload.isActive ? 'activate' : 'deactivate'}`
    );
    setActionError(undefined);
    setActionMessage(undefined);

    const response = await fetch(`/api/admin/access-links/${row.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: string;
      data?: AccessLinkUpdateResult;
    } | null;

    if (!response.ok || !result?.success || !result.data) {
      setActionError(
        result?.error || 'Access-Link konnte nicht aktualisiert werden'
      );
      setActiveActionKey(undefined);
      return;
    }

    if (
      result.data.accessUrl &&
      result.data.qrValue &&
      result.data.accessLink?.tokenPreview
    ) {
      setCreatedResult({
        accessUrl: result.data.accessUrl,
        qrValue: result.data.qrValue,
        tokenPreview: result.data.accessLink.tokenPreview,
      });
      setSubmitSuccess(undefined);
    }

    setActionMessage(successMessage);
    setReloadToken((currentValue) => currentValue + 1);
    setActiveActionKey(undefined);
  }

  async function shareAccessLink(
    row: IntakeAccessLinkRow,
    event: React.MouseEvent
  ) {
    event.stopPropagation();
    setActiveActionKey(`${row.id}:share`);
    setActionError(undefined);
    setActionMessage(undefined);

    const response = await fetch(`/api/admin/access-links/${row.id}/share`, {
      credentials: 'include',
    });

    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: string;
      data?: AccessLinkShareResult;
    } | null;

    if (!response.ok || !result?.success || !result.data) {
      setActionError(
        result?.error ||
          'Zugangslink konnte nicht fuer das Teilen geladen werden'
      );
      setActiveActionKey(undefined);
      return;
    }

    setCreatedResult(result.data);
    setSubmitSuccess(undefined);
    setActionMessage(
      'Bestehender Zugangslink wurde zum erneuten Teilen bereitgestellt.'
    );
    setActiveActionKey(undefined);
  }

  function downloadQrCode() {
    if (!qrCodeDataUrl || !createdResult) {
      return;
    }

    const link = document.createElement('a');
    const safeProjectId = createdResult.tokenPreview
      .replace(/[^a-z0-9-]+/gi, '-')
      .toLowerCase();

    link.href = qrCodeDataUrl;
    link.download = `intake-qr-${safeProjectId || 'access-link'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {(actionError || actionMessage) && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${actionError ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'}`}
        >
          {actionError || actionMessage}
        </div>
      )}

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 dark:border-stone-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Zugangslink anlegen
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
              Erstellt einen individuellen Projektzugang fuer Kunden. Der
              erzeugte Link kann direkt verschickt oder als QR-Wert
              weiterverarbeitet werden.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
            {isLoadingForms
              ? 'Formulare werden geladen...'
              : `${forms.length} Formular${forms.length === 1 ? '' : 'e'} verfuegbar`}
          </div>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select
              name="formId"
              label="Formular"
              required
              value={formState.formId}
              onChange={(event) => updateField('formId', event.target.value)}
              options={formOptions}
              placeholder="Formular waehlen"
              disabled={isLoadingForms || !formOptions.length || isSubmitting}
              hint="Es wird ein Snapshot des aktuell ausgewaehlten Formulars eingefroren."
            />
            <Input
              name="projectId"
              label="Projekt-ID"
              required
              value={formState.projectId}
              onChange={(event) => updateField('projectId', event.target.value)}
              placeholder="z. B. RELAUNCH-HOTEL-001"
              disabled={isSubmitting}
            />
            <Input
              name="customerName"
              label="Kundenname"
              required
              value={formState.customerName}
              onChange={(event) =>
                updateField('customerName', event.target.value)
              }
              placeholder="Vor- und Nachname"
              disabled={isSubmitting}
            />
            <Input
              name="company"
              label="Unternehmen"
              value={formState.company}
              onChange={(event) => updateField('company', event.target.value)}
              placeholder="Optional"
              disabled={isSubmitting}
            />
            <Input
              name="email"
              type="email"
              label="E-Mail"
              value={formState.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="kunde@example.de"
              disabled={isSubmitting}
            />
            <Input
              name="phone"
              label="Telefon"
              value={formState.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="Optional"
              disabled={isSubmitting}
            />
            <Select
              name="locale"
              label="Sprache des Einstiegs"
              value={formState.locale}
              onChange={(event) =>
                updateField('locale', event.target.value as 'de' | 'en' | 'pfl')
              }
              options={[
                { value: 'de', label: 'Deutsch' },
                { value: 'en', label: 'English' },
                { value: 'pfl', label: 'Pfaelzisch' },
              ]}
              disabled={isSubmitting}
            />
            <Input
              name="expiresAt"
              type="datetime-local"
              label="Ablaufdatum"
              value={formState.expiresAt}
              onChange={(event) => updateField('expiresAt', event.target.value)}
              hint="Optional. Ohne Datum bleibt der Link aktiv."
              disabled={isSubmitting}
            />
          </div>

          {submitError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {submitSuccess}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingForms || !formState.formId}
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
            >
              {isSubmitting ? 'Link wird erstellt...' : 'Zugangslink erstellen'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormState((currentState) => ({
                  ...initialFormState,
                  formId: currentState.formId,
                  locale: currentState.locale,
                }));
                setSubmitError(undefined);
                setSubmitSuccess(undefined);
              }}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
            >
              Formular leeren
            </button>
          </div>
        </form>

        {createdResult && (
          <div className="mt-6 grid gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/60 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Direktlink
                </p>
                <p className="mt-2 break-all text-sm text-stone-700 dark:text-stone-200">
                  {createdResult.accessUrl}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  QR-Wert
                </p>
                <p className="mt-2 break-all text-sm text-stone-700 dark:text-stone-200">
                  {createdResult.qrValue}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Token-Vorschau
                </p>
                <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">
                  {createdResult.tokenPreview}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <button
                type="button"
                onClick={() => void copyToClipboard(createdResult.accessUrl)}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                Link kopieren
              </button>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    createdResult.accessUrl,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
              >
                Link testen
              </button>
              <button
                type="button"
                onClick={downloadQrCode}
                disabled={!qrCodeDataUrl}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                QR als PNG laden
              </button>
              {copyState === 'copied' && (
                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                  Link kopiert.
                </p>
              )}
              {copyState === 'failed' && (
                <p className="text-sm text-red-600 dark:text-red-300">
                  Kopieren war nicht moeglich.
                </p>
              )}
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                QR-Vorschau
              </p>
              {qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  alt="QR-Code fuer den erzeugten Zugangslink"
                  width={224}
                  height={224}
                  unoptimized
                  className="mt-4 h-56 w-56 rounded-2xl border border-stone-200 bg-white p-2 dark:border-stone-700"
                />
              ) : (
                <div className="mt-4 flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-400">
                  {qrCodeError || 'QR-Code wird erzeugt...'}
                </div>
              )}
              <p className="mt-4 text-center text-xs leading-5 text-stone-500 dark:text-stone-400">
                Derselbe Link kann per Browser oder durch Scan des QR-Codes
                geoefnnet werden.
              </p>
            </div>
          </div>
        )}
      </section>

      <AdminDataSection<IntakeAccessLinkRow>
        title="Zugangslinks"
        description="Individuelle Projektlinks fuer Kunden, die per Direktlink oder QR-Code verteilt werden."
        endpoint="/api/admin/access-links"
        searchPlaceholder="Suche nach Projekt, Kunde oder E-Mail"
        emptyMessage="Noch keine Zugangslinks vorhanden"
        headerActions={
          <div className="space-y-3">
            <Select
              label="Status filtern"
              value={isActiveFilter}
              onChange={(event) => setIsActiveFilter(event.target.value)}
              options={[
                { value: 'true', label: 'Nur aktive Links' },
                { value: 'false', label: 'Nur deaktivierte Links' },
              ]}
              placeholder="Alle Links"
            />
            <div className="flex justify-start sm:justify-end">
              <button
                type="button"
                onClick={exportAccessLinksCsv}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                CSV exportieren
              </button>
            </div>
          </div>
        }
        queryParams={{
          isActive: isActiveFilter || undefined,
        }}
        reloadToken={reloadToken}
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
                  Sprache: {row.locale || 'de'}
                </p>
              </div>
            ),
          },
          {
            key: 'customerName',
            label: 'Kunde',
            className: 'min-w-[12rem]',
            render: (row) => (
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-50">
                  {row.customerName}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {row.email || 'Keine E-Mail'}
                </p>
              </div>
            ),
          },
          {
            key: 'formTitle',
            label: 'Formular',
            className: 'min-w-[14rem]',
            render: (row) => (
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-50">
                  {row.formSnapshot?.title || '-'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Token: {row.tokenPreview}
                </p>
              </div>
            ),
          },
          {
            key: 'tokenPreview',
            label: 'Token',
            className: 'whitespace-nowrap',
          },
          {
            key: 'isActive',
            label: 'Aktiv',
            className: 'whitespace-nowrap',
            render: (row) => (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${row.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200' : 'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'}`}
              >
                {row.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Aktionen',
            className: 'min-w-[12rem]',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(event) => void shareAccessLink(row, event)}
                  disabled={Boolean(activeActionKey)}
                  className="rounded-full border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700 transition hover:border-sky-500 hover:text-sky-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-900 dark:text-sky-200"
                >
                  {activeActionKey === `${row.id}:share` ? '...' : 'Teilen'}
                </button>
                <button
                  type="button"
                  onClick={(event) =>
                    void updateAccessLink(
                      row,
                      { isActive: !row.isActive },
                      row.isActive
                        ? 'Access-Link wurde deaktiviert.'
                        : 'Access-Link wurde aktiviert.',
                      event
                    )
                  }
                  disabled={Boolean(activeActionKey)}
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                >
                  {activeActionKey ===
                  `${row.id}:${row.isActive ? 'deactivate' : 'activate'}`
                    ? '...'
                    : row.isActive
                      ? 'Deaktivieren'
                      : 'Aktivieren'}
                </button>
                <button
                  type="button"
                  onClick={(event) =>
                    void updateAccessLink(
                      row,
                      { regenerateToken: true },
                      'Token wurde neu erzeugt. Alter Direktlink ist damit ungueltig.',
                      event
                    )
                  }
                  disabled={Boolean(activeActionKey)}
                  className="rounded-full border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:border-indigo-500 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900 dark:text-indigo-200"
                >
                  {activeActionKey === `${row.id}:regenerate`
                    ? '...'
                    : 'Token neu'}
                </button>
              </div>
            ),
          },
          {
            key: 'createdAt',
            label: 'Erstellt',
            className: 'whitespace-nowrap',
            render: (row) => new Date(row.createdAt).toLocaleString('de-DE'),
          },
        ]}
      />
    </div>
  );
}
