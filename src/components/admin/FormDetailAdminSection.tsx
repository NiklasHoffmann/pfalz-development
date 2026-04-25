'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type {
  IntakeNotificationConfig,
  IntakeQuestionDefinition,
  IntakeSectionDefinition,
  IntakeValidationRules,
} from '@/types/intake';
import { cn } from '@/lib/utils';

interface IntakeFormDetail {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: string;
  version: number;
  formType: string;
  defaultLocale?: string;
  sections: IntakeSectionDefinition[];
  notificationConfig?: IntakeNotificationConfig;
  createdAt?: string;
  updatedAt?: string;
}

interface FormDetailAdminSectionProps {
  formId: string;
  locale: string;
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('de-DE');
}

function getQuestionTypeLabel(question: IntakeQuestionDefinition) {
  switch (question.fieldType) {
    case 'checkbox-group':
      return 'Mehrfachauswahl';
    case 'yes-no':
      return 'Ja / Nein';
    case 'textarea':
      return 'Mehrzeiliger Text';
    case 'radio':
      return 'Einfachauswahl';
    case 'file':
      return 'Datei-Upload';
    case 'consent':
      return 'Einwilligung';
    case 'budget':
      return 'Budget';
    case 'contactPerson':
      return 'Kontaktperson';
    default:
      return question.fieldType;
  }
}

function formatFormTypeLabel(formType: string) {
  switch (formType) {
    case 'seo-content':
      return 'SEO Content';
    default:
      return formType;
  }
}

function getFormStatusClasses(status: string) {
  switch (status) {
    case 'active':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'inactive':
      return 'border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200';
    default:
      return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200';
  }
}

function formatPreviewValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatValidationRules(rules?: IntakeValidationRules) {
  if (!rules) {
    return [];
  }

  const values: string[] = [];

  if (typeof rules.minLength === 'number') {
    values.push(`Min. Laenge: ${rules.minLength}`);
  }

  if (typeof rules.maxLength === 'number') {
    values.push(`Max. Laenge: ${rules.maxLength}`);
  }

  if (typeof rules.min === 'number') {
    values.push(`Min: ${rules.min}`);
  }

  if (typeof rules.max === 'number') {
    values.push(`Max: ${rules.max}`);
  }

  if (rules.pattern) {
    values.push(`Pattern: ${rules.pattern}`);
  }

  if (typeof rules.maxFileSize === 'number') {
    values.push(`Max. Dateigroesse: ${rules.maxFileSize}`);
  }

  if (typeof rules.minSelections === 'number') {
    values.push(`Min. Auswahl: ${rules.minSelections}`);
  }

  if (typeof rules.maxSelections === 'number') {
    values.push(`Max. Auswahl: ${rules.maxSelections}`);
  }

  if (rules.allowMultiple) {
    values.push('Mehrfach-Upload erlaubt');
  }

  if (rules.allowedMimeTypes?.length) {
    values.push(`Dateitypen: ${rules.allowedMimeTypes.join(', ')}`);
  }

  return values;
}

export function FormDetailAdminSection({
  formId,
  locale,
}: FormDetailAdminSectionProps) {
  const [detail, setDetail] = useState<IntakeFormDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>([]);
  const [isRawJsonVisible, setIsRawJsonVisible] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch(`/api/admin/forms/${formId}`, {
        credentials: 'include',
      });
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: IntakeFormDetail;
        error?: string;
      } | null;

      if (isCancelled) {
        return;
      }

      if (!response.ok || !payload?.success || !payload.data) {
        setError(payload?.error || 'Formular konnte nicht geladen werden');
        setIsLoading(false);
        return;
      }

      setDetail(payload.data);
      setExpandedSectionIds(payload.data.sections.map((section) => section.id));
      setIsLoading(false);
    }

    void loadDetail();

    return () => {
      isCancelled = true;
    };
  }, [formId]);

  const rawJson = useMemo(() => {
    if (!detail) {
      return '';
    }

    return JSON.stringify(detail, null, 2);
  }, [detail]);

  const sortedSections = useMemo(() => {
    if (!detail) {
      return [];
    }

    return [...detail.sections].sort((left, right) => left.order - right.order);
  }, [detail]);

  const totalQuestionCount = useMemo(
    () =>
      sortedSections.reduce(
        (count, section) => count + section.questions.length,
        0
      ),
    [sortedSections]
  );

  const requiredQuestionCount = useMemo(
    () =>
      sortedSections.reduce(
        (count, section) =>
          count +
          section.questions.filter((question) => question.required).length,
        0
      ),
    [sortedSections]
  );

  const conditionalQuestionCount = useMemo(
    () =>
      sortedSections.reduce(
        (count, section) =>
          count +
          section.questions.filter(
            (question) => question.visibilityRules?.length
          ).length,
        0
      ),
    [sortedSections]
  );

  function toggleSection(sectionId: string) {
    setExpandedSectionIds((currentState) =>
      currentState.includes(sectionId)
        ? currentState.filter((value) => value !== sectionId)
        : [...currentState, sectionId]
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Formular wird geladen...
        </p>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <p className="text-sm text-red-700 dark:text-red-300">
          {error || 'Formular wurde nicht gefunden.'}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="bg-gradient-to-r from-white via-stone-50 to-emerald-50/60 p-6 dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/10 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-stone-800 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Formular
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {detail.title}
                </h1>
                <span
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    getFormStatusClasses(detail.status)
                  )}
                >
                  {detail.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                {detail.description || 'Keine Beschreibung hinterlegt.'}
              </p>
            </div>
            <Link
              href={withLocale(locale, '/admin/forms')}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
            >
              Zurueck zur Liste
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Slug
              </p>
              <p className="mt-2 break-all font-medium">{detail.slug}</p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Typ
              </p>
              <p className="mt-2 font-medium">
                {formatFormTypeLabel(detail.formType)}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                Version v{detail.version}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Sprache
              </p>
              <p className="mt-2 font-medium">{detail.defaultLocale || 'de'}</p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Struktur
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {sortedSections.length}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                Sections
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Fragen
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {totalQuestionCount}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                {requiredQuestionCount} Pflichtfelder
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-stone-800 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Struktur
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Vollstaendige Sections und Fragen, so wie sie spaeter im
                Kundenfragebogen verwendet werden.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setExpandedSectionIds(
                    sortedSections.map((section) => section.id)
                  )
                }
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                Alle oeffnen
              </button>
              <button
                type="button"
                onClick={() => setExpandedSectionIds([])}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                Alle schliessen
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {sortedSections.map((section) => {
              const isExpanded = expandedSectionIds.includes(section.id);
              const requiredInSection = section.questions.filter(
                (question) => question.required
              ).length;
              const conditionalInSection = section.questions.filter(
                (question) => question.visibilityRules?.length
              ).length;

              return (
                <article
                  key={section.id}
                  className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-950/40"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                        Schritt {section.order} · {section.stepKey}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight">
                        {section.title}
                      </h3>
                      {section.description && (
                        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300 sm:justify-end">
                      <span className="rounded-full border border-stone-200 bg-white px-3 py-1 dark:border-stone-700 dark:bg-stone-900">
                        {section.questions.length} Fragen
                      </span>
                      <span className="rounded-full border border-stone-200 bg-white px-3 py-1 dark:border-stone-700 dark:bg-stone-900">
                        {requiredInSection} Pflicht
                      </span>
                      {!!conditionalInSection && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                          {conditionalInSection} bedingt
                        </span>
                      )}
                      <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 dark:border-stone-700 dark:bg-stone-800">
                        {isExpanded ? 'Ausblenden' : 'Anzeigen'}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-5 grid gap-3 lg:grid-cols-2">
                      {section.questions
                        .slice()
                        .sort((left, right) => left.order - right.order)
                        .map((question) => {
                          const validationSummaries = formatValidationRules(
                            question.validationRules
                          );

                          return (
                            <div
                              key={question.id}
                              className="rounded-[1.5rem] border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-stone-950 dark:text-stone-50">
                                    {question.label}
                                  </p>
                                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                    Key: {question.key} · Typ:{' '}
                                    {getQuestionTypeLabel(question)} ·{' '}
                                    {question.required
                                      ? 'Pflichtfeld'
                                      : 'Optional'}
                                  </p>
                                </div>
                                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
                                  #{question.order}
                                </span>
                              </div>

                              {question.helpText && (
                                <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                                  {question.helpText}
                                </p>
                              )}

                              <div className="mt-4 space-y-3 text-sm">
                                {question.placeholder && (
                                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                      Placeholder
                                    </p>
                                    <p className="mt-1 text-stone-700 dark:text-stone-300">
                                      {question.placeholder}
                                    </p>
                                  </div>
                                )}

                                {question.defaultValue !== undefined && (
                                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                      Standardwert
                                    </p>
                                    <p className="mt-1 text-stone-700 dark:text-stone-300">
                                      {formatPreviewValue(
                                        question.defaultValue
                                      )}
                                    </p>
                                  </div>
                                )}

                                {!!validationSummaries.length && (
                                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                      Validierung
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {validationSummaries.map((entry) => (
                                        <span
                                          key={`${question.id}-${entry}`}
                                          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                                        >
                                          {entry}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {!!question.options?.length && (
                                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                      Optionen
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {question.options.map((option) => (
                                        <span
                                          key={`${question.id}-${option.value}`}
                                          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                                        >
                                          {option.label} ({option.value})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {!!question.visibilityRules?.length && (
                                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                                    Sichtbarkeit:{' '}
                                    {question.visibilityRules
                                      .map((rule) => {
                                        const targetValue = Array.isArray(
                                          rule.values
                                        )
                                          ? rule.values.join(', ')
                                          : formatPreviewValue(rule.value);
                                        return `${rule.sourceQuestionKey} ${rule.operator} ${targetValue}`;
                                      })
                                      .join(' | ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-4">
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 pb-5 dark:border-stone-800">
              <h2 className="text-xl font-semibold tracking-tight">
                Zusammenfassung
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Wichtige Kennzahlen und Metadaten des Formulars auf einen Blick.
              </p>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Fragen
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-950 dark:text-stone-50">
                  {totalQuestionCount}
                </p>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  {requiredQuestionCount} Pflichtfelder
                </p>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  {conditionalQuestionCount} bedingte Fragen
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Zeitstempel
                </p>
                <dl className="mt-2 space-y-2 text-stone-700 dark:text-stone-300">
                  <div className="flex items-start justify-between gap-4">
                    <dt>Erstellt</dt>
                    <dd className="text-right">
                      {formatDate(detail.createdAt)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Aktualisiert</dt>
                    <dd className="text-right">
                      {formatDate(detail.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 pb-5 dark:border-stone-800">
              <h2 className="text-xl font-semibold tracking-tight">
                Benachrichtigungen
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Interne und optionale Kunden-Mails des Formulars.
              </p>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Empfaenger intern
                </p>
                {detail.notificationConfig?.internalRecipients?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detail.notificationConfig.internalRecipients.map(
                      (recipient) => (
                        <span
                          key={recipient}
                          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                        >
                          {recipient}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-stone-600 dark:text-stone-300">
                    Keine Empfaenger hinterlegt
                  </p>
                )}
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Betreff intern
                </p>
                <p className="mt-2 text-stone-700 dark:text-stone-300">
                  {detail.notificationConfig?.internalSubject || '-'}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Kundenbestaetigung
                </p>
                <p className="mt-2 font-medium text-stone-950 dark:text-stone-50">
                  {detail.notificationConfig?.customerConfirmationEnabled
                    ? 'Aktiv'
                    : 'Deaktiviert'}
                </p>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  {detail.notificationConfig?.customerSubject ||
                    'Kein Kundenbetreff hinterlegt'}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-5 dark:border-stone-800">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Raw JSON
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                  Das komplette Dokument, wie es aktuell in der Datenbank
                  gespeichert ist.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setIsRawJsonVisible((currentState) => !currentState)
                }
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                {isRawJsonVisible ? 'Ausblenden' : 'Anzeigen'}
              </button>
            </div>

            {isRawJsonVisible && (
              <pre className="mt-5 overflow-x-auto rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-xs leading-6 text-stone-100 dark:border-stone-700">
                <code>{rawJson}</code>
              </pre>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
