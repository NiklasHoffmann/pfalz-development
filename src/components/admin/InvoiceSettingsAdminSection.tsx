'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Form/Input';
import Textarea from '@/components/ui/Form/Textarea';
import { readJsonResponse } from '@/lib/api-client';
import { formatIban } from '@/lib/iban';

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

interface InvoiceSettingsAdminSectionProps {
  locale: string;
}

const defaultProfile: InvoiceProfile = {
  senderCompany: 'pfalz-development.de',
  senderName: '',
  senderStreet: '',
  senderCity: '',
  senderEmail: '',
  senderPhone: '',
  senderTaxNumber: '',
  paymentPayee: '',
  paymentIban: '',
  paymentBic: '',
  paymentBank: '',
  note: 'Als Kleinunternehmer wird gemäß § 19 UStG keine Umsatzsteuer berechnet und ausgewiesen.',
};

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
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

export function InvoiceSettingsAdminSection({
  locale,
}: InvoiceSettingsAdminSectionProps) {
  const [currentProfile, setCurrentProfile] =
    useState<InvoiceProfile>(defaultProfile);
  const [profileDraft, setProfileDraft] =
    useState<InvoiceProfile>(defaultProfile);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingNumbering, setIsResettingNumbering] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const invoicesHref = withLocale(locale, '/admin/rechnungen');
  const profileExists = useMemo(
    () => hasStoredProfile(currentProfile),
    [currentProfile]
  );

  useEffect(() => {
    void loadSettings(true);
  }, []);

  async function loadSettings(syncDraft: boolean) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/invoices/settings', {
        credentials: 'include',
      });

      const payload = await readJsonResponse<{
        success?: boolean;
        data?: {
          settings?: InvoiceSettingsPayload;
          nextInvoiceNumber?: string;
        };
        error?: string;
      }>(response);

      if (!response.ok || !payload?.success || !payload.data?.settings) {
        setActionError(
          payload?.error || 'Stammdaten konnten nicht geladen werden.'
        );
        return;
      }

      const mappedProfile = mapSettingsToProfile(payload.data.settings);
      setCurrentProfile(mappedProfile);
      setNextInvoiceNumber(payload.data.nextInvoiceNumber || '');

      if (syncDraft) {
        setProfileDraft(mappedProfile);
      }

      setIsEditing(!hasStoredProfile(mappedProfile));
    } finally {
      setIsLoading(false);
    }
  }

  function updateProfile<K extends keyof InvoiceProfile>(
    key: K,
    value: InvoiceProfile[K]
  ) {
    setProfileDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveProfile() {
    setIsSaving(true);
    setActionError('');
    setActionMessage('');

    const response = await fetch('/api/admin/invoices/settings', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderProfile: {
          company: profileDraft.senderCompany,
          name: profileDraft.senderName,
          street: profileDraft.senderStreet,
          city: profileDraft.senderCity,
          email: profileDraft.senderEmail,
          phone: profileDraft.senderPhone,
          taxNumber: profileDraft.senderTaxNumber,
        },
        paymentProfile: {
          payee: profileDraft.paymentPayee,
          iban: profileDraft.paymentIban,
          bic: profileDraft.paymentBic,
          bank: profileDraft.paymentBank,
        },
        defaultNote: profileDraft.note,
      }),
    });

    const payload = await readJsonResponse<{
      success?: boolean;
      error?: string;
    }>(response);

    if (!response.ok || !payload?.success) {
      setActionError(
        payload?.error || 'Stammdaten konnten nicht gespeichert werden.'
      );
      setIsSaving(false);
      return;
    }

    setCurrentProfile(profileDraft);
    setProfileDraft(profileDraft);
    setIsEditing(false);
    setActionMessage('Stammdaten wurden zentral gespeichert.');
    setIsSaving(false);
    await loadSettings(false);
  }

  async function resetInvoiceNumbering() {
    setIsResettingNumbering(true);
    setActionError('');
    setActionMessage('');

    try {
      const response = await fetch('/api/admin/invoices/settings', {
        method: 'POST',
        credentials: 'include',
      });

      const payload = await readJsonResponse<{
        success?: boolean;
        data?: {
          nextInvoiceNumber?: string;
        };
        error?: string;
      }>(response);

      if (!response.ok || !payload?.success) {
        setActionError(
          payload?.error || 'Rechnungsnummer konnte nicht zurückgesetzt werden.'
        );
        return;
      }

      setNextInvoiceNumber(payload.data?.nextInvoiceNumber || '');
      setActionMessage(
        `Rechnungsnummer wurde auf ${payload.data?.nextInvoiceNumber || 'den aktuellen Datenstand'} zurückgesetzt.`
      );
    } finally {
      setIsResettingNumbering(false);
    }
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
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5 dark:border-stone-800">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Rechnungs-Stammdaten
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
              Absender, Zahlungsdaten und Standardhinweis werden hier zentral
              gepflegt und bei neuen Rechnungen automatisch übernommen.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={invoicesHref}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
            >
              Zurück zu Rechnungen
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsResetConfirmOpen(true);
              }}
              disabled={isLoading || isResettingNumbering}
              className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 transition hover:border-amber-400 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:border-amber-700 dark:hover:bg-amber-950/50"
            >
              {isResettingNumbering
                ? 'Setzt zurück...'
                : 'Rechnungsnummer zurücksetzen'}
            </button>
            {profileExists && !isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setProfileDraft(currentProfile);
                  setIsEditing(true);
                }}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
              >
                Stammdaten bearbeiten
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
            Nächste serverseitige Rechnungsnummer:{' '}
            {nextInvoiceNumber || 'wird geladen'}
          </span>
          {profileExists ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              Stammdaten vollständig hinterlegt
            </span>
          ) : (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Bitte zuerst Stammdaten vervollständigen
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 px-4 py-6 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            Stammdaten werden geladen...
          </div>
        ) : profileExists && !isEditing ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                Absender
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-700 dark:text-stone-200">
                {currentProfile.senderCompany}
                {'\n'}
                {currentProfile.senderName}
                {'\n'}
                {currentProfile.senderStreet}
                {'\n'}
                {currentProfile.senderCity}
                {'\n\n'}
                E-Mail: {currentProfile.senderEmail || '-'}
                {'\n'}
                Telefon: {currentProfile.senderPhone || '-'}
                {'\n'}
                Steuernummer: {currentProfile.senderTaxNumber || '-'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                  Zahlung
                </p>
                <p className="mt-3 text-sm text-stone-700 dark:text-stone-200">
                  Kontoinhaber: {currentProfile.paymentPayee || '-'}
                </p>
                <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">
                  IBAN: {formatIban(currentProfile.paymentIban) || '-'}
                </p>
                <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">
                  BIC: {currentProfile.paymentBic || '-'}
                </p>
                <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">
                  Bank: {currentProfile.paymentBank || '-'}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                  Standardhinweis
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-200">
                  {currentProfile.note || '-'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_0.95fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold">Absender</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Firma"
                    value={profileDraft.senderCompany}
                    onChange={(event) =>
                      updateProfile('senderCompany', event.target.value)
                    }
                  />
                  <Input
                    label="Name"
                    value={profileDraft.senderName}
                    onChange={(event) =>
                      updateProfile('senderName', event.target.value)
                    }
                  />
                  <Input
                    label="Straße"
                    value={profileDraft.senderStreet}
                    onChange={(event) =>
                      updateProfile('senderStreet', event.target.value)
                    }
                  />
                  <Input
                    label="PLZ / Ort"
                    value={profileDraft.senderCity}
                    onChange={(event) =>
                      updateProfile('senderCity', event.target.value)
                    }
                  />
                  <Input
                    label="E-Mail"
                    type="email"
                    value={profileDraft.senderEmail}
                    onChange={(event) =>
                      updateProfile('senderEmail', event.target.value)
                    }
                  />
                  <Input
                    label="Telefon"
                    value={profileDraft.senderPhone}
                    onChange={(event) =>
                      updateProfile('senderPhone', event.target.value)
                    }
                  />
                  <Input
                    label="Steuernummer"
                    className="md:col-span-2"
                    value={profileDraft.senderTaxNumber}
                    onChange={(event) =>
                      updateProfile('senderTaxNumber', event.target.value)
                    }
                  />
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700">
                <h2 className="text-lg font-semibold">Zahlungsdaten</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Kontoinhaber"
                    value={profileDraft.paymentPayee}
                    onChange={(event) =>
                      updateProfile('paymentPayee', event.target.value)
                    }
                  />
                  <Input
                    label="IBAN"
                    value={profileDraft.paymentIban}
                    onChange={(event) =>
                      updateProfile('paymentIban', event.target.value)
                    }
                  />
                  <Input
                    label="BIC"
                    value={profileDraft.paymentBic}
                    onChange={(event) =>
                      updateProfile('paymentBic', event.target.value)
                    }
                  />
                  <Input
                    label="Bank"
                    value={profileDraft.paymentBank}
                    onChange={(event) =>
                      updateProfile('paymentBank', event.target.value)
                    }
                  />
                  <Textarea
                    label="Standardhinweis"
                    className="md:col-span-2"
                    rows={4}
                    value={profileDraft.note}
                    onChange={(event) =>
                      updateProfile('note', event.target.value)
                    }
                  />
                </div>
              </section>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void saveProfile();
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                >
                  {isSaving ? 'Speichert...' : 'Stammdaten speichern'}
                </button>
                {profileExists ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDraft(currentProfile);
                      setIsEditing(false);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                  >
                    Abbrechen
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        onConfirm={resetInvoiceNumbering}
        title="Rechnungsnummer zurücksetzen?"
        description="Die nächste serverseitige Rechnungsnummer wird auf Basis der noch vorhandenen Rechnungen neu berechnet. Stammdaten und bestehende Rechnungen bleiben unverändert."
        confirmText="Jetzt zurücksetzen"
        cancelText="Abbrechen"
        variant="warning"
        isLoading={isResettingNumbering}
      />
    </div>
  );
}
