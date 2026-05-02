'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import Input from '@/components/ui/Form/Input';
import Select from '@/components/ui/Form/Select';
import Table from '@/components/ui/Table';
import { readJsonResponse } from '@/lib/api-client';
import { formatPhoneDisplay } from '@/lib/format';
import { compactIban, formatIban } from '@/lib/iban';
import type { InvoiceStatus } from '@/types/invoice';

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceDraft {
  id?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  servicePeriod: string;
  project: string;
  senderCompany: string;
  senderName: string;
  senderStreet: string;
  senderCity: string;
  senderEmail: string;
  senderPhone: string;
  senderTaxNumber: string;
  recipientCompany: string;
  recipientContact: string;
  recipientStreet: string;
  recipientCity: string;
  paymentPayee: string;
  paymentIban: string;
  paymentBic: string;
  paymentBank: string;
  emailTo: string;
  note: string;
  lineItems: InvoiceLine[];
}

interface InvoiceProfile {
  senderCompany: string;
  senderName: string;
  senderStreet: string;
  senderCity: string;
  senderEmail: string;
  senderPhone: string;
  senderTaxNumber: string;
  paymentPayee: string;
  paymentIban: string;
  paymentBic: string;
  paymentBank: string;
  note: string;
}

interface InvoiceListRow extends Record<string, unknown> {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  invoiceDate: string;
  project?: string;
  recipient: {
    company: string;
    contact: string;
  };
  total: number;
  updatedAt: string;
}

interface InvoiceSettingsPayload {
  senderProfile: {
    company: string;
    name: string;
    street: string;
    city: string;
    email: string;
    phone: string;
    taxNumber: string;
  };
  paymentProfile: {
    payee: string;
    iban: string;
    bic: string;
    bank: string;
  };
  defaultNote: string;
}

interface InvoiceApiDocument {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate?: string | null;
  servicePeriod?: string;
  project?: string;
  senderProfile: InvoiceSettingsPayload['senderProfile'];
  recipient: {
    company: string;
    contact: string;
    street: string;
    city: string;
    email?: string;
  };
  paymentProfile: InvoiceSettingsPayload['paymentProfile'];
  note: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

const DEFAULT_INVOICE_NUMBER = '2026-111';
const PAYMENT_QR_LOGO_SRC = '/favicon_light.png';

const initialDraft: InvoiceDraft = {
  id: undefined,
  invoiceNumber: DEFAULT_INVOICE_NUMBER,
  status: 'draft',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  servicePeriod: '',
  project: '',
  senderCompany: 'pfalz-development.de',
  senderName: '',
  senderStreet: '',
  senderCity: '',
  senderEmail: '',
  senderPhone: '',
  senderTaxNumber: '',
  recipientCompany: '',
  recipientContact: '',
  recipientStreet: '',
  recipientCity: '',
  paymentPayee: '',
  paymentIban: '',
  paymentBic: '',
  paymentBank: '',
  emailTo: '',
  note: 'Als Kleinunternehmer wird gemäß § 19 UStG keine Umsatzsteuer berechnet und ausgewiesen.',
  lineItems: [
    {
      id: 'line-1',
      description: 'Webentwicklung',
      quantity: 1,
      unitPrice: 85,
    },
  ],
};

const invoiceStatusOptions: Array<{ value: InvoiceStatus; label: string }> = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'issued', label: 'Erstellt' },
  { value: 'paid', label: 'Bezahlt' },
  { value: 'cancelled', label: 'Storniert' },
];

function toMoney(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function formatMoney(value: number) {
  return toMoney(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function withTodayPlusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDateInput(value?: string | null) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
}

function formatDisplayDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const [year, month, day] = value.split('-');

  if (year && month && day) {
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('de-DE');
}

function getPrintableInvoiceStatusLabel(status: InvoiceStatus) {
  if (status === 'draft') {
    return 'Entwurf';
  }

  if (status === 'cancelled') {
    return 'Storniert';
  }

  return null;
}

function buildEpcPayload(draft: InvoiceDraft, amount: number) {
  if (!draft.paymentPayee.trim() || !draft.paymentIban.trim()) {
    return '';
  }

  const iban = compactIban(draft.paymentIban);
  const bic = draft.paymentBic.trim().toUpperCase();
  const amountValue = toMoney(amount).toFixed(2);
  const remittance = `Rechnung ${draft.invoiceNumber}`.slice(0, 140);

  return [
    'BCD',
    '002',
    '1',
    'SCT',
    bic,
    draft.paymentPayee.trim().slice(0, 70),
    iban,
    `EUR${amountValue}`,
    '',
    '',
    remittance,
    '',
  ].join('\n');
}

function createEmptyLine(id: string): InvoiceLine {
  return {
    id,
    description: 'Webentwicklung',
    quantity: 1,
    unitPrice: 85,
  };
}

function createDraftFromProfile(
  profile: InvoiceProfile,
  invoiceNumber: string = DEFAULT_INVOICE_NUMBER
): InvoiceDraft {
  return {
    ...initialDraft,
    ...profile,
    invoiceNumber,
    status: 'draft',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: withTodayPlusDays(14),
    lineItems: [createEmptyLine('line-1')],
  };
}

function hasStoredProfile(profile: InvoiceProfile) {
  return [
    profile.senderName,
    profile.senderStreet,
    profile.senderCity,
    profile.senderEmail,
    profile.paymentPayee,
    profile.paymentIban,
  ].some((value) => value.trim().length > 0);
}

function mapSettingsToProfile(
  settings: InvoiceSettingsPayload
): InvoiceProfile {
  return {
    senderCompany: settings.senderProfile.company,
    senderName: settings.senderProfile.name,
    senderStreet: settings.senderProfile.street,
    senderCity: settings.senderProfile.city,
    senderEmail: settings.senderProfile.email,
    senderPhone: settings.senderProfile.phone,
    senderTaxNumber: settings.senderProfile.taxNumber,
    paymentPayee: settings.paymentProfile.payee,
    paymentIban: settings.paymentProfile.iban,
    paymentBic: settings.paymentProfile.bic,
    paymentBank: settings.paymentProfile.bank,
    note: settings.defaultNote,
  };
}

function mapInvoiceToDraft(invoice: InvoiceApiDocument): InvoiceDraft {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    invoiceDate: formatDateInput(invoice.invoiceDate),
    dueDate: formatDateInput(invoice.dueDate),
    servicePeriod: invoice.servicePeriod || '',
    project: invoice.project || '',
    senderCompany: invoice.senderProfile.company,
    senderName: invoice.senderProfile.name,
    senderStreet: invoice.senderProfile.street,
    senderCity: invoice.senderProfile.city,
    senderEmail: invoice.senderProfile.email,
    senderPhone: invoice.senderProfile.phone,
    senderTaxNumber: invoice.senderProfile.taxNumber,
    recipientCompany: invoice.recipient.company,
    recipientContact: invoice.recipient.contact,
    recipientStreet: invoice.recipient.street,
    recipientCity: invoice.recipient.city,
    paymentPayee: invoice.paymentProfile.payee,
    paymentIban: invoice.paymentProfile.iban,
    paymentBic: invoice.paymentProfile.bic,
    paymentBank: invoice.paymentProfile.bank,
    emailTo: invoice.recipient.email || '',
    note: invoice.note,
    lineItems:
      invoice.lineItems.length > 0
        ? invoice.lineItems.map((lineItem) => ({
            id: lineItem.id,
            description: lineItem.description,
            quantity: lineItem.quantity,
            unitPrice: lineItem.unitPrice,
          }))
        : [createEmptyLine('line-1')],
  };
}

function buildInvoicePayload(draft: InvoiceDraft) {
  return {
    invoiceNumber: draft.invoiceNumber.trim(),
    status: draft.status,
    invoiceDate: draft.invoiceDate,
    dueDate: draft.dueDate || null,
    servicePeriod: draft.servicePeriod,
    project: draft.project,
    senderProfile: {
      company: draft.senderCompany,
      name: draft.senderName,
      street: draft.senderStreet,
      city: draft.senderCity,
      email: draft.senderEmail,
      phone: draft.senderPhone,
      taxNumber: draft.senderTaxNumber,
    },
    recipient: {
      company: draft.recipientCompany,
      contact: draft.recipientContact,
      street: draft.recipientStreet,
      city: draft.recipientCity,
      email: draft.emailTo,
    },
    paymentProfile: {
      payee: draft.paymentPayee,
      iban: draft.paymentIban,
      bic: draft.paymentBic,
      bank: draft.paymentBank,
    },
    note: draft.note,
    lineItems: draft.lineItems.map((lineItem) => ({
      id: lineItem.id,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unitPrice: lineItem.unitPrice,
    })),
  };
}

const defaultProfile: InvoiceProfile = {
  senderCompany: initialDraft.senderCompany,
  senderName: initialDraft.senderName,
  senderStreet: initialDraft.senderStreet,
  senderCity: initialDraft.senderCity,
  senderEmail: initialDraft.senderEmail,
  senderPhone: initialDraft.senderPhone,
  senderTaxNumber: initialDraft.senderTaxNumber,
  paymentPayee: initialDraft.paymentPayee,
  paymentIban: initialDraft.paymentIban,
  paymentBic: initialDraft.paymentBic,
  paymentBank: initialDraft.paymentBank,
  note: initialDraft.note,
};

export function InvoicesAdminSection({ locale }: { locale: string }) {
  const [draft, setDraft] = useState<InvoiceDraft>(initialDraft);
  const [currentProfile, setCurrentProfile] =
    useState<InvoiceProfile>(defaultProfile);
  const [invoices, setInvoices] = useState<InvoiceListRow[]>([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(
    DEFAULT_INVOICE_NUMBER
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<
    'all' | InvoiceStatus
  >('all');
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [actionError, setActionError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrError, setQrError] = useState<string>('');
  const printableInvoiceStatusLabel = getPrintableInvoiceStatusLabel(
    draft.status
  );

  const subtotal = useMemo(
    () =>
      draft.lineItems.reduce(
        (sum, line) => sum + toMoney(line.quantity) * toMoney(line.unitPrice),
        0
      ),
    [draft.lineItems]
  );

  const total = subtotal;

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = invoiceSearch.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesStatus =
        invoiceStatusFilter === 'all' || invoice.status === invoiceStatusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        invoice.invoiceNumber,
        invoice.project || '',
        invoice.recipient.company,
        invoice.recipient.contact,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [invoiceSearch, invoiceStatusFilter, invoices]);

  const selectedInvoice = useMemo(() => {
    const activeInvoiceId = selectedInvoiceId || draft.id || '';
    return invoices.find((invoice) => invoice.id === activeInvoiceId) || null;
  }, [draft.id, invoices, selectedInvoiceId]);

  const selectedInvoicePreview = useMemo(() => {
    if (!selectedInvoice || draft.id !== selectedInvoice.id) {
      return null;
    }

    return draft;
  }, [draft, selectedInvoice]);

  const invoiceStats = useMemo(
    () => ({
      total: invoices.length,
      open: invoices.filter(
        (invoice) => invoice.status === 'draft' || invoice.status === 'issued'
      ).length,
      paid: invoices.filter((invoice) => invoice.status === 'paid').length,
    }),
    [invoices]
  );

  const profileExists = useMemo(
    () => hasStoredProfile(currentProfile),
    [currentProfile]
  );

  const loadBootstrapData = useCallback(
    async (replaceDraft: boolean, activeDraftId?: string) => {
      setIsBootstrapLoading(true);

      try {
        const [settingsResponse, invoicesResponse] = await Promise.all([
          fetch('/api/admin/invoices/settings', {
            credentials: 'include',
          }),
          fetch('/api/admin/invoices', {
            credentials: 'include',
          }),
        ]);

        const settingsPayload = (await settingsResponse
          .json()
          .catch(() => null)) as {
          success?: boolean;
          data?: {
            settings?: InvoiceSettingsPayload;
            nextInvoiceNumber?: string;
          };
          error?: string;
        } | null;
        const invoicesPayload = (await invoicesResponse
          .json()
          .catch(() => null)) as {
          success?: boolean;
          data?: {
            invoices?: InvoiceListRow[];
            nextInvoiceNumber?: string;
          };
          error?: string;
        } | null;

        if (
          !settingsResponse.ok ||
          !settingsPayload?.success ||
          !settingsPayload.data?.settings ||
          !invoicesResponse.ok ||
          !invoicesPayload?.success ||
          !Array.isArray(invoicesPayload.data?.invoices)
        ) {
          setActionError(
            settingsPayload?.error ||
              invoicesPayload?.error ||
              'Rechnungsdaten konnten nicht geladen werden'
          );
          return;
        }

        const profile = mapSettingsToProfile(settingsPayload.data.settings);
        const resolvedNextInvoiceNumber =
          invoicesPayload.data?.nextInvoiceNumber ||
          settingsPayload.data.nextInvoiceNumber ||
          DEFAULT_INVOICE_NUMBER;

        setInvoices(invoicesPayload.data.invoices);
        setNextInvoiceNumber(resolvedNextInvoiceNumber);
        setCurrentProfile(profile);

        setSelectedInvoiceId((current) => {
          if (
            current &&
            invoicesPayload.data?.invoices?.some(
              (invoice) => invoice.id === current
            )
          ) {
            return current;
          }

          if (
            activeDraftId &&
            invoicesPayload.data?.invoices?.some(
              (invoice) => invoice.id === activeDraftId
            )
          ) {
            return activeDraftId;
          }

          return invoicesPayload.data?.invoices?.[0]?.id || '';
        });

        if (replaceDraft) {
          setDraft(createDraftFromProfile(profile, resolvedNextInvoiceNumber));
        }
      } finally {
        setIsBootstrapLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadBootstrapData(true);
  }, [loadBootstrapData]);

  useEffect(() => {
    const payload = buildEpcPayload(draft, total);

    if (!payload) {
      setQrDataUrl('');
      setQrError('');
      return;
    }

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
        setQrError('');
      })
      .catch(() => {
        setQrDataUrl('');
        setQrError('QR-Code konnte nicht erstellt werden');
      });
  }, [draft, total]);

  function updateDraft<K extends keyof InvoiceDraft>(
    key: K,
    value: InvoiceDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateLine(lineId: string, patch: Partial<InvoiceLine>) {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line
      ),
    }));
  }

  function addLine() {
    setDraft((current) => ({
      ...current,
      lineItems: [
        ...current.lineItems,
        {
          id: `line-${Date.now()}`,
          description: 'Neue Position',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
  }

  function removeLine(lineId: string) {
    setDraft((current) => ({
      ...current,
      lineItems:
        current.lineItems.length <= 1
          ? current.lineItems
          : current.lineItems.filter((line) => line.id !== lineId),
    }));
  }

  async function createNewInvoiceDraft() {
    await loadBootstrapData(true);
    setSelectedInvoiceId('');
    setActionError('');
    setActionMessage(
      'Neue Rechnung mit serverseitig vorgeschlagener Nummer vorbereitet.'
    );
  }

  async function saveInvoice() {
    setIsSavingInvoice(true);
    setActionError('');
    setActionMessage('');

    const response = await fetch(
      draft.id ? `/api/admin/invoices/${draft.id}` : '/api/admin/invoices',
      {
        method: draft.id ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildInvoicePayload(draft)),
      }
    );

    const payload = await readJsonResponse<{
      success?: boolean;
      data?: InvoiceApiDocument;
      error?: string;
    }>(response);

    if (!response.ok || !payload?.success || !payload.data) {
      setActionError(
        payload?.error || 'Rechnung konnte nicht gespeichert werden'
      );
      setIsSavingInvoice(false);
      return;
    }

    setDraft(mapInvoiceToDraft(payload.data));
    setSelectedInvoiceId(payload.data.id);
    setActionMessage(
      draft.id
        ? 'Rechnung wurde aktualisiert.'
        : 'Rechnung wurde als Datensatz gespeichert.'
    );
    setIsSavingInvoice(false);
    await loadBootstrapData(false, payload.data.id);
  }

  async function loadInvoice(invoiceId: string) {
    setIsLoadingInvoice(true);
    setActionError('');

    const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
      credentials: 'include',
    });

    const payload = await readJsonResponse<{
      success?: boolean;
      data?: InvoiceApiDocument;
      error?: string;
    }>(response);

    if (!response.ok || !payload?.success || !payload.data) {
      setActionError(payload?.error || 'Rechnung konnte nicht geladen werden');
      setIsLoadingInvoice(false);
      return;
    }

    setDraft(mapInvoiceToDraft(payload.data));
    setSelectedInvoiceId(payload.data.id);
    setActionMessage(`Rechnung ${payload.data.invoiceNumber} wurde geladen.`);
    setIsLoadingInvoice(false);
  }

  function exportDraftJson() {
    const blob = new Blob(
      [JSON.stringify(buildInvoicePayload(draft), null, 2)],
      {
        type: 'application/json',
      }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `rechnung-${draft.invoiceNumber || 'entwurf'}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  const settingsHref =
    locale === 'de'
      ? '/admin/rechnungen/stammdaten'
      : `/${locale}/admin/rechnungen/stammdaten`;

  return (
    <div className="invoice-admin-root space-y-6">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .admin-shell-sidebar,
          .admin-shell-header,
          .admin-shell > .pointer-events-none {
            display: none !important;
          }

          .admin-shell,
          .admin-shell > .relative {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .admin-shell-content,
          .admin-shell-content main,
          .invoice-admin-root {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .invoice-admin-root > :not(.invoice-print-shell) {
            display: none !important;
          }

          .invoice-print-shell {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow: visible !important;
          }

          .invoice-print-root {
            margin: 0 !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 297mm !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 12mm !important;
            background: #fcfbf7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .invoice-print-main {
            flex: 1 1 auto !important;
          }

          .invoice-print-footer {
            margin-top: auto !important;
            padding-top: 8mm !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .invoice-print-table thead {
            display: table-header-group !important;
          }

          .invoice-print-table tr,
          .invoice-print-summary,
          .invoice-print-note,
          .invoice-print-payment-box,
          .invoice-print-party-card,
          .invoice-print-meta-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .invoice-print-parties {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }

          .invoice-print-meta {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }

          .invoice-print-meta-project {
            grid-column: 1 / -1 !important;
          }

          .invoice-print-payment {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto !important;
            align-items: end !important;
          }
        }
      `}</style>
      {(actionError || actionMessage) && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${actionError ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'}`}
        >
          {actionError || actionMessage}
        </div>
      )}

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8 print:hidden">
        <div className="border-b border-stone-200 pb-5 dark:border-stone-800">
          <h2 className="text-2xl font-semibold tracking-tight">
            Rechnungsarchiv
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Hier kannst du alle gespeicherten Rechnungen ansehen, filtern und
            gezielt in den Editor laden.
          </p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                  Gesamt
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-50">
                  {invoiceStats.total}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                  Offen
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-100">
                  {invoiceStats.open}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                  Bezahlt
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
                  {invoiceStats.paid}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <Input
                label="Rechnungen durchsuchen"
                value={invoiceSearch}
                onChange={(event) => setInvoiceSearch(event.target.value)}
                placeholder="Nach Rechnungsnummer, Firma oder Projekt suchen"
              />
              <Select
                label="Status filtern"
                value={invoiceStatusFilter}
                onChange={(event) =>
                  setInvoiceStatusFilter(
                    event.target.value as 'all' | InvoiceStatus
                  )
                }
                options={[
                  { value: 'all', label: 'Alle Status' },
                  ...invoiceStatusOptions,
                ]}
              />
            </div>

            <Table<InvoiceListRow>
              data={filteredInvoices}
              isLoading={isBootstrapLoading || isLoadingInvoice}
              emptyMessage="Noch keine Rechnungen gespeichert"
              onRowClick={(row) => {
                setSelectedInvoiceId(row.id);
                void loadInvoice(row.id);
              }}
              rowClassName={(row) =>
                row.id === (selectedInvoiceId || draft.id)
                  ? 'ring-1 ring-amber-500/60 inset bg-amber-50/80 dark:bg-amber-950/20'
                  : undefined
              }
              columns={[
                {
                  key: 'invoiceNumber',
                  label: 'Rechnung',
                  className: 'min-w-[10rem]',
                  render: (row) => (
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">
                        {row.invoiceNumber}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {new Date(row.invoiceDate).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'recipient',
                  label: 'Empfänger',
                  className: 'min-w-[14rem]',
                  render: (row) => (
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">
                        {row.recipient.company || '-'}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {row.recipient.contact || 'Ohne Kontakt'}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'project',
                  label: 'Projekt',
                  className: 'min-w-[12rem]',
                  render: (row) => row.project || '-',
                },
                {
                  key: 'status',
                  label: 'Status',
                  className: 'whitespace-nowrap',
                  render: (row) => (
                    <span className="inline-flex rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-200">
                      {invoiceStatusOptions.find(
                        (option) => option.value === row.status
                      )?.label || row.status}
                    </span>
                  ),
                },
                {
                  key: 'total',
                  label: 'Betrag',
                  className: 'whitespace-nowrap',
                  render: (row) => `${formatMoney(row.total)} EUR`,
                },
                {
                  key: 'updatedAt',
                  label: 'Aktualisiert',
                  className: 'whitespace-nowrap',
                  render: (row) =>
                    new Date(row.updatedAt).toLocaleString('de-DE'),
                },
              ]}
            />
          </div>

          <aside className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-950/40">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
              Ausgewählte Rechnung
            </p>
            {selectedInvoice ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {selectedInvoice.project || 'Ohne Projektbezeichnung'}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Kunde
                  </p>
                  <p className="mt-2 font-medium text-stone-900 dark:text-stone-50">
                    {selectedInvoice.recipient.company || '-'}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {selectedInvoice.recipient.contact ||
                      'Ohne Ansprechpartner'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                      Status
                    </p>
                    <p className="mt-2 font-medium text-stone-900 dark:text-stone-50">
                      {invoiceStatusOptions.find(
                        (option) => option.value === selectedInvoice.status
                      )?.label || selectedInvoice.status}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                      Betrag
                    </p>
                    <p className="mt-2 font-medium text-stone-900 dark:text-stone-50">
                      {formatMoney(selectedInvoice.total)} EUR
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Zeitstempel
                  </p>
                  <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">
                    Rechnungsdatum:{' '}
                    {new Date(selectedInvoice.invoiceDate).toLocaleDateString(
                      'de-DE'
                    )}
                  </p>
                  <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">
                    Zuletzt aktualisiert:{' '}
                    {new Date(selectedInvoice.updatedAt).toLocaleString(
                      'de-DE'
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Detailvorschau
                  </p>
                  {selectedInvoicePreview ? (
                    <div className="mt-3 space-y-3 text-sm text-stone-700 dark:text-stone-200">
                      <p>
                        <strong>Fälligkeit:</strong>{' '}
                        {formatDisplayDate(selectedInvoicePreview.dueDate)}
                      </p>
                      <p>
                        <strong>E-Mail:</strong>{' '}
                        {selectedInvoicePreview.emailTo || '-'}
                      </p>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-50">
                          Positionen
                        </p>
                        <div className="mt-2 space-y-2">
                          {selectedInvoicePreview.lineItems
                            .slice(0, 4)
                            .map((lineItem) => (
                              <div
                                key={lineItem.id}
                                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-950/50"
                              >
                                <p className="font-medium text-stone-900 dark:text-stone-50">
                                  {lineItem.description}
                                </p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                  {formatMoney(lineItem.quantity)} x{' '}
                                  {formatMoney(lineItem.unitPrice)} EUR
                                </p>
                              </div>
                            ))}
                          {selectedInvoicePreview.lineItems.length > 4 ? (
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              +{selectedInvoicePreview.lineItems.length - 4}{' '}
                              weitere Positionen
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-50">
                          Hinweis
                        </p>
                        <p className="mt-1 text-sm leading-6 text-stone-700 dark:text-stone-200">
                          {selectedInvoicePreview.note || '-'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                      Lade die Rechnung in den Editor, um hier Positionen und
                      Hinweis kompakt zu sehen.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void loadInvoice(selectedInvoice.id);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                >
                  Rechnung im Editor öffnen
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-stone-300 px-4 py-6 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                Noch keine Rechnung ausgewählt. Klick links im Archiv auf eine
                Rechnung, um sie anzuschauen.
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5 dark:border-stone-800">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Rechnungen
            </h1>
          </div>

          <div className="flex flex-wrap items-start justify-end gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void createNewInvoiceDraft();
                }}
                className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-500 dark:border-amber-700 dark:bg-amber-950/20 dark:text-amber-200"
              >
                Neue Rechnung
              </button>
              <Link
                href={settingsHref}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                Stammdaten
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={exportDraftJson}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                Entwurf exportieren
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                Drucken
              </button>
              <button
                type="button"
                onClick={() => {
                  void saveInvoice();
                }}
                disabled={isSavingInvoice}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
              >
                {isSavingInvoice
                  ? 'Speichert...'
                  : draft.id
                    ? 'Rechnung aktualisieren'
                    : 'Rechnung speichern'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
          {profileExists ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              Stammdaten aktiv:{' '}
              {currentProfile.senderCompany || 'Profil gespeichert'}
            </span>
          ) : (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Bitte zuerst Stammdaten speichern
            </span>
          )}
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
            Nächste serverseitige Rechnungsnummer: {nextInvoiceNumber}
          </span>
          {draft.id ? (
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
              Bearbeitet aktuell: {draft.invoiceNumber}
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
              <h2 className="text-lg font-semibold">Rechnungsdaten</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Rechnungsnummer"
                  value={draft.invoiceNumber}
                  onChange={(event) =>
                    updateDraft('invoiceNumber', event.target.value)
                  }
                  hint="Wird beim Neuanlegen serverseitig vorgeschlagen und kann bei Bedarf angepasst werden."
                />
                <Select
                  label="Status"
                  value={draft.status}
                  onChange={(event) =>
                    updateDraft('status', event.target.value as InvoiceStatus)
                  }
                  options={invoiceStatusOptions}
                />
                <Input
                  label="Rechnungsdatum"
                  type="date"
                  value={draft.invoiceDate}
                  onChange={(event) =>
                    updateDraft('invoiceDate', event.target.value)
                  }
                />
                <Input
                  label="Fälligkeit"
                  type="date"
                  value={draft.dueDate}
                  onChange={(event) =>
                    updateDraft('dueDate', event.target.value)
                  }
                />
                <Input
                  label="Leistungszeitraum"
                  value={draft.servicePeriod}
                  onChange={(event) =>
                    updateDraft('servicePeriod', event.target.value)
                  }
                />
                <Input
                  label="Projekt"
                  className="md:col-span-2"
                  value={draft.project}
                  onChange={(event) =>
                    updateDraft('project', event.target.value)
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
              <h2 className="text-lg font-semibold">Empfänger</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Firma"
                  value={draft.recipientCompany}
                  onChange={(event) =>
                    updateDraft('recipientCompany', event.target.value)
                  }
                />
                <Input
                  label="Ansprechpartner"
                  value={draft.recipientContact}
                  onChange={(event) =>
                    updateDraft('recipientContact', event.target.value)
                  }
                />
                <Input
                  label="Straße"
                  value={draft.recipientStreet}
                  onChange={(event) =>
                    updateDraft('recipientStreet', event.target.value)
                  }
                />
                <Input
                  label="PLZ / Ort"
                  value={draft.recipientCity}
                  onChange={(event) =>
                    updateDraft('recipientCity', event.target.value)
                  }
                />
                <Input
                  label="E-Mail Empfänger"
                  type="email"
                  className="md:col-span-2"
                  value={draft.emailTo}
                  onChange={(event) =>
                    updateDraft('emailTo', event.target.value)
                  }
                  hint="Wird für den E-Mail-vorbereiten-Button und im Datensatz verwendet."
                />
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Positionen</h2>
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                >
                  Position hinzufügen
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {draft.lineItems.map((line, index) => (
                  <div
                    key={line.id}
                    className="rounded-xl border border-stone-200 p-3 dark:border-stone-700"
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_120px_140px_auto]">
                      <Input
                        label={`Leistung ${index + 1}`}
                        value={line.description}
                        onChange={(event) =>
                          updateLine(line.id, {
                            description: event.target.value,
                          })
                        }
                      />
                      <Input
                        label="Menge"
                        type="number"
                        min="0"
                        step="0.01"
                        value={String(line.quantity)}
                        onChange={(event) =>
                          updateLine(line.id, {
                            quantity: Number(event.target.value) || 0,
                          })
                        }
                      />
                      <Input
                        label="Einzelpreis"
                        type="number"
                        min="0"
                        step="0.01"
                        value={String(line.unitPrice)}
                        onChange={(event) =>
                          updateLine(line.id, {
                            unitPrice: Number(event.target.value) || 0,
                          })
                        }
                      />
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          disabled={draft.lineItems.length <= 1}
                          className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-300"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
              <p className="text-sm font-semibold">Aktive Stammdaten</p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Werden für neue Rechnungen automatisch verwendet.
              </p>
              <div className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-200">
                <p>
                  <strong>Absender:</strong> {draft.senderCompany || '-'}
                </p>
                <p>
                  <strong>Name:</strong> {draft.senderName || '-'}
                </p>
                <p>
                  <strong>Bank:</strong> {draft.paymentBank || '-'}
                </p>
                <p>
                  <strong>IBAN:</strong> {formatIban(draft.paymentIban) || '-'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-950/40">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Summe
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Zwischensumme</span>
                  <strong>{formatMoney(subtotal)} EUR</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Umsatzsteuer</span>
                  <span>0,00 EUR</span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-300 pt-2 text-base font-semibold text-amber-900 dark:border-stone-700 dark:text-amber-200">
                  <span>Rechnungsbetrag</span>
                  <span>{formatMoney(total)} EUR</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 dark:border-emerald-900 dark:from-emerald-950/30 dark:via-stone-900 dark:to-amber-950/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                    Direkt bezahlen
                  </p>
                  <p className="mt-1 text-base font-semibold text-stone-900 dark:text-stone-50">
                    Scan un Pay
                  </p>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
                    Der Code übergibt Empfänger, IBAN, Rechnungsnummer und
                    Betrag direkt an die Banking-App.
                  </p>
                </div>
                <div className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {formatMoney(total)} EUR
                </div>
              </div>
              {qrDataUrl ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900 dark:bg-stone-950">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2 text-sm text-stone-700 dark:text-stone-200">
                      <p className="font-semibold text-stone-900 dark:text-stone-50">
                        Jetzt per Scan bezahlen
                      </p>
                      <p>
                        <strong>Empfänger:</strong> {draft.paymentPayee || '-'}
                      </p>
                      <p>
                        <strong>Betrag:</strong> {formatMoney(total)} EUR
                      </p>
                      <p>
                        <strong>Referenz:</strong> {draft.invoiceNumber || '-'}
                      </p>
                    </div>
                    <div className="relative mx-auto rounded-2xl border-2 border-emerald-500 bg-white p-2 shadow-sm sm:mx-0">
                      <Image
                        src={qrDataUrl}
                        alt="QR-Code zum Bezahlen per Banking-App"
                        width={144}
                        height={144}
                        unoptimized
                        className="h-36 w-36"
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="rounded-xl border border-emerald-200 bg-white/95 p-1.5 shadow-sm">
                          <Image
                            src={PAYMENT_QR_LOGO_SRC}
                            alt="pfalz-development.de"
                            width={28}
                            height={28}
                            className="h-7 w-7 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    Banking-App öffnen, QR-Code scannen und Überweisung
                    bestätigt absenden.
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-stone-300 px-3 py-6 text-xs text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  IBAN und Kontoinhaber eintragen, dann wird hier ein echter
                  Zahlungs-QR-Code für die Banking-App erzeugt.
                </div>
              )}
              {qrError ? (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {qrError}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="invoice-print-shell mx-auto box-border w-full max-w-[210mm] overflow-hidden rounded-3xl border border-[#e8dcc8] bg-white p-0 shadow-sm dark:border-stone-700 dark:bg-stone-900 print:rounded-none print:border-0 print:shadow-none">
        <article className="invoice-print-root mx-auto box-border flex min-h-[calc(297mm-2px)] w-full max-w-[210mm] flex-col bg-[#fcfbf7] p-6 text-sm text-[#1c1917] sm:p-8">
          <header className="grid items-start gap-4 border-b-2 border-[#92400e] pb-4 sm:grid-cols-[1fr_auto]">
            <div className="flex items-center">
              <Image
                src="/pfalz-development-logo-light.webp"
                alt="Pfalz Development"
                width={360}
                height={90}
                priority
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="rounded-lg border border-[#e8dcc8] bg-[#f5efe4] px-3 py-2 text-left sm:text-right">
              <h2 className="text-2xl font-bold tracking-wide text-[#78350f]">
                RECHNUNG
              </h2>
              {printableInvoiceStatusLabel ? (
                <p className="text-xs text-stone-600">
                  {printableInvoiceStatusLabel}
                </p>
              ) : null}
            </div>
          </header>

          <main className="invoice-print-main flex-1">
            <div className="invoice-print-parties mt-5 grid gap-3 md:grid-cols-2">
              <section className="invoice-print-party-card rounded-lg border border-[#cfb290] bg-[#fffdf8] p-3 shadow-[0_1px_0_rgba(120,53,15,0.06)]">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c5a2c]">
                  Absender
                </h3>
                <p className="mt-2 whitespace-pre-line">
                  {draft.senderName}
                  {'\n'}
                  {draft.senderStreet}
                  {'\n'}
                  {draft.senderCity}
                  {'\n\n'}
                  Telefon: {formatPhoneDisplay(draft.senderPhone)}
                  {'\n'}
                  E-Mail: {draft.senderEmail}
                  {'\n'}
                  Steuernummer: {draft.senderTaxNumber}
                </p>
              </section>

              <section className="invoice-print-party-card rounded-lg border border-[#cfb290] bg-[#fffdf8] p-3 shadow-[0_1px_0_rgba(120,53,15,0.06)]">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c5a2c]">
                  Empfänger
                </h3>
                <p className="mt-2 whitespace-pre-line">
                  {draft.recipientCompany}
                  {'\n'}
                  {draft.recipientContact}
                  {'\n'}
                  {draft.recipientStreet}
                  {'\n'}
                  {draft.recipientCity}
                </p>
              </section>
            </div>

            <section className="invoice-print-meta-card mt-3 rounded-lg border border-[#cfb290] bg-[#fffdf8] p-3 shadow-[0_1px_0_rgba(120,53,15,0.06)]">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c5a2c]">
                Rechnungsdaten
              </h3>
              <div className="invoice-print-meta mt-2 grid gap-1 sm:grid-cols-2">
                <p>Rechnungsnummer: {draft.invoiceNumber}</p>
                <p>Rechnungsdatum: {formatDisplayDate(draft.invoiceDate)}</p>
                <p>Leistungszeitraum: {draft.servicePeriod}</p>
                <p>Fälligkeit: {formatDisplayDate(draft.dueDate)}</p>
                <p className="invoice-print-meta-project sm:col-span-2">
                  Projekt: {draft.project}
                </p>
              </div>
            </section>

            <div className="mt-4 overflow-x-auto">
              <table className="invoice-print-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-[#cfb290] bg-[#efdfc7] px-2 py-2 text-left text-[#78350f]">
                      Pos.
                    </th>
                    <th className="border border-[#cfb290] bg-[#efdfc7] px-2 py-2 text-left text-[#78350f]">
                      Leistung
                    </th>
                    <th className="border border-[#cfb290] bg-[#efdfc7] px-2 py-2 text-right text-[#78350f]">
                      Menge
                    </th>
                    <th className="border border-[#cfb290] bg-[#efdfc7] px-2 py-2 text-right text-[#78350f]">
                      Einzelpreis
                    </th>
                    <th className="border border-[#cfb290] bg-[#efdfc7] px-2 py-2 text-right text-[#78350f]">
                      Gesamt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {draft.lineItems.map((line, index) => {
                    const lineTotal =
                      toMoney(line.quantity) * toMoney(line.unitPrice);
                    return (
                      <tr key={line.id}>
                        <td className="border border-[#d7c2a8] px-2 py-2">
                          {index + 1}
                        </td>
                        <td className="border border-[#d7c2a8] px-2 py-2">
                          {line.description}
                        </td>
                        <td className="border border-[#d7c2a8] px-2 py-2 text-right">
                          {formatMoney(line.quantity)}
                        </td>
                        <td className="border border-[#d7c2a8] px-2 py-2 text-right">
                          {formatMoney(line.unitPrice)} EUR
                        </td>
                        <td className="border border-[#d7c2a8] px-2 py-2 text-right">
                          {formatMoney(lineTotal)} EUR
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="invoice-print-summary ml-auto mt-4 w-full max-w-[360px] overflow-hidden rounded-lg border border-[#cfb290] bg-[#fffdfa] shadow-[0_1px_0_rgba(120,53,15,0.06)]">
              <div className="grid grid-cols-2">
                <span className="border-b border-[#cfb290] bg-[#efdfc7] px-3 py-2 font-medium text-[#6f4d1f]">
                  Zwischensumme
                </span>
                <span className="border-b border-l border-[#cfb290] px-3 py-2 text-right">
                  {formatMoney(subtotal)} EUR
                </span>
                <span className="border-b border-[#cfb290] bg-[#efdfc7] px-3 py-2 font-medium text-[#6f4d1f]">
                  Umsatzsteuer
                </span>
                <span className="border-b border-l border-[#cfb290] px-3 py-2 text-right">
                  0,00 EUR
                </span>
                <span className="bg-[#e9d6ba] px-3 py-2 text-base font-semibold text-[#78350f]">
                  Rechnungsbetrag
                </span>
                <span className="border-l border-[#cfb290] px-3 py-2 text-right text-base font-semibold text-[#78350f]">
                  {formatMoney(total)} EUR
                </span>
              </div>
            </div>

            <p className="invoice-print-note mt-4 rounded-lg border border-[#d3b07d] bg-[#fbf3e5] px-3 py-2 text-sm text-[#4f3b20]">
              {draft.note}
            </p>
          </main>

          <footer className="invoice-print-footer mt-6 border-t border-[#ede4d6] pt-4 text-[13px] text-stone-600">
            <div className="invoice-print-payment invoice-print-payment-box grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="leading-6">
                  <strong>Zahlungsbedingungen:</strong> Bitte bis spätestens{' '}
                  {formatDisplayDate(draft.dueDate)} unter Angabe der
                  Rechnungsnummer {draft.invoiceNumber} überweisen.
                </p>
                <p className="mt-1 leading-6">
                  <strong>Bankverbindung:</strong> IBAN{' '}
                  {formatIban(draft.paymentIban)}, BIC{' '}
                  {draft.paymentBic.toUpperCase()}, Bank {draft.paymentBank}
                </p>
              </div>
              {qrDataUrl ? (
                <div className="rounded-xl border border-[#ddd2c1] bg-[#fffdfa] p-2 text-center shadow-none">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Scan un Pay
                  </p>
                  <div className="relative mx-auto h-24 w-24">
                    <Image
                      src={qrDataUrl}
                      alt="QR-Code zum Bezahlen per Banking-App"
                      width={96}
                      height={96}
                      unoptimized
                      className="h-24 w-24 rounded border border-stone-300 bg-white p-1"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="rounded-lg border border-emerald-200 bg-white/95 p-1 shadow-sm">
                        <Image
                          src={PAYMENT_QR_LOGO_SRC}
                          alt="pfalz-development.de"
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-stone-600">
                    {formatMoney(total)} EUR
                  </p>
                </div>
              ) : null}
            </div>
          </footer>
        </article>
      </section>
    </div>
  );
}
