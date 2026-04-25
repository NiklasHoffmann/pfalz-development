'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDataSection } from '@/components/admin/AdminDataSection';
import Checkbox from '@/components/ui/Form/Checkbox';
import Input from '@/components/ui/Form/Input';
import Select from '@/components/ui/Form/Select';
import Textarea from '@/components/ui/Form/Textarea';

interface IntakeFormRow {
  [key: string]: unknown;
  id: string;
  title: string;
  slug: string;
  status: string;
  formType: string;
  version: number;
  updatedAt: string;
}

interface ImportedIntakeFieldOptionPreview {
  label: string;
  value: string;
}

interface ImportedIntakeQuestionPreview {
  id: string;
  key: string;
  label: string;
  fieldType: string;
  required: boolean;
  order: number;
  helpText?: string;
  placeholder?: string;
  defaultValue?: unknown;
  options?: ImportedIntakeFieldOptionPreview[];
  validationRules?: Record<string, unknown>;
  visibilityRules?: unknown[];
}

interface ImportedIntakeSectionPreview {
  id: string;
  title: string;
  order: number;
  stepKey: string;
  description?: string;
  questions: ImportedIntakeQuestionPreview[];
}

interface ImportPreviewWarning {
  code: string;
  message: string;
  path?: string;
}

interface ImportedIntakeFormPreview {
  title: string;
  slug: string;
  description?: string;
  status: string;
  version: number;
  formType: string;
  defaultLocale?: string;
  sections: ImportedIntakeSectionPreview[];
}

interface ImportPreviewData {
  document: ImportedIntakeFormPreview;
  summary: {
    sectionCount: number;
    questionCount: number;
    conditionalQuestionCount: number;
    fileQuestionCount: number;
  };
  warnings: ImportPreviewWarning[];
  existingForm?: {
    id: string;
    title: string;
    slug: string;
    status: string;
    updatedAt: string;
  } | null;
}

type FormCreationMode = 'template' | 'duplicate';

interface FormCreationState {
  mode: FormCreationMode;
  templateSlug: string;
  duplicateFromFormId: string;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
}

interface FormsAdminSectionProps {
  locale: string;
}

const templateOptions = [
  {
    value: 'website-relaunch',
    label: 'Website-Relaunch',
  },
  {
    value: 'branding-logo',
    label: 'Branding und Logo',
  },
  {
    value: 'content-seo',
    label: 'Content und SEO',
  },
];

const initialFormState: FormCreationState = {
  mode: 'template',
  templateSlug: templateOptions[0].value,
  duplicateFromFormId: '',
  title: '',
  slug: '',
  description: '',
  status: 'draft',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('de-DE');
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

function formatPreviewValue(value: unknown) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

function formatValidationRules(rules?: Record<string, unknown>) {
  if (!rules) {
    return '';
  }

  const entries = Object.entries(rules).filter(
    ([, value]) => value !== undefined
  );

  if (!entries.length) {
    return '';
  }

  return entries
    .map(([key, value]) => `${key}: ${formatPreviewValue(value)}`)
    .join(' · ');
}

export function FormsAdminSection({ locale }: FormsAdminSectionProps) {
  const router = useRouter();
  const [formState, setFormState] =
    useState<FormCreationState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [submitSuccess, setSubmitSuccess] = useState<string>();
  const [reloadToken, setReloadToken] = useState(0);
  const [availableForms, setAvailableForms] = useState<IntakeFormRow[]>([]);
  const [isLoadingAvailableForms, setIsLoadingAvailableForms] = useState(true);
  const [importJson, setImportJson] = useState('');
  const [importPreview, setImportPreview] = useState<ImportPreviewData | null>(
    null
  );
  const [importError, setImportError] = useState<string>();
  const [importSuccess, setImportSuccess] = useState<string>();
  const [isPreviewingImport, setIsPreviewingImport] = useState(false);
  const [isImportingForm, setIsImportingForm] = useState(false);
  const [overwriteImportedForm, setOverwriteImportedForm] = useState(false);
  const [expandedPreviewSections, setExpandedPreviewSections] = useState<
    string[]
  >([]);
  const [isRawJsonExpanded, setIsRawJsonExpanded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadForms() {
      setIsLoadingAvailableForms(true);
      const response = await fetch('/api/admin/forms', {
        credentials: 'include',
      });
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: IntakeFormRow[];
      } | null;

      if (isCancelled) {
        return;
      }

      if (response.ok && payload?.success && Array.isArray(payload.data)) {
        setAvailableForms(payload.data);
        setFormState((currentState) => ({
          ...currentState,
          duplicateFromFormId:
            currentState.duplicateFromFormId || payload.data?.[0]?.id || '',
        }));
      }

      setIsLoadingAvailableForms(false);
    }

    void loadForms();

    return () => {
      isCancelled = true;
    };
  }, [reloadToken]);

  const duplicateOptions = useMemo(
    () =>
      availableForms.map((form) => ({
        value: form.id,
        label: `${form.title} (${form.slug})`,
      })),
    [availableForms]
  );
  const importPreviewJson = useMemo(
    () =>
      importPreview ? JSON.stringify(importPreview.document, null, 2) : '',
    [importPreview]
  );
  const expandedPreviewSectionSet = useMemo(
    () => new Set(expandedPreviewSections),
    [expandedPreviewSections]
  );

  function updateField<Key extends keyof FormCreationState>(
    key: Key,
    value: FormCreationState[Key]
  ) {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  function resetForm() {
    setFormState((currentState) => ({
      ...initialFormState,
      duplicateFromFormId: duplicateOptions[0]?.value || '',
      mode: currentState.mode,
    }));
    setSubmitError(undefined);
    setSubmitSuccess(undefined);
  }

  function resetImport() {
    setImportJson('');
    setImportPreview(null);
    setImportError(undefined);
    setImportSuccess(undefined);
    setOverwriteImportedForm(false);
    setExpandedPreviewSections([]);
    setIsRawJsonExpanded(false);
  }

  function togglePreviewSection(sectionId: string) {
    setExpandedPreviewSections((currentSections) =>
      currentSections.includes(sectionId)
        ? currentSections.filter(
            (currentSectionId) => currentSectionId !== sectionId
          )
        : [...currentSections, sectionId]
    );
  }

  function expandAllPreviewSections() {
    if (!importPreview) {
      return;
    }

    setExpandedPreviewSections(
      importPreview.document.sections.map((section) => section.id)
    );
  }

  function collapseAllPreviewSections() {
    setExpandedPreviewSections([]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);
    setSubmitSuccess(undefined);

    const payload = {
      title: formState.title.trim(),
      slug: slugify(formState.slug || formState.title),
      description: formState.description.trim() || undefined,
      status: formState.status,
      templateSlug:
        formState.mode === 'template' ? formState.templateSlug : undefined,
      duplicateFromFormId:
        formState.mode === 'duplicate'
          ? formState.duplicateFromFormId
          : undefined,
    };

    const response = await fetch('/api/admin/forms', {
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
      data?: IntakeFormRow;
    } | null;

    if (!response.ok || !result?.success || !result.data) {
      setSubmitError(result?.error || 'Formular konnte nicht erstellt werden');
      setIsSubmitting(false);
      return;
    }

    setSubmitSuccess(`Formular "${result.data.title}" wurde angelegt.`);
    setReloadToken((currentValue) => currentValue + 1);
    setFormState((currentState) => ({
      ...initialFormState,
      mode: currentState.mode,
      duplicateFromFormId: currentState.duplicateFromFormId,
    }));
    setIsSubmitting(false);
  }

  async function handlePreviewImport() {
    setIsPreviewingImport(true);
    setImportError(undefined);
    setImportSuccess(undefined);

    const response = await fetch('/api/admin/forms/import', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'preview',
        json: importJson,
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: string;
      data?: ImportPreviewData;
    } | null;

    if (!response.ok || !result?.success || !result.data) {
      setImportPreview(null);
      setImportError(result?.error || 'Vorschau konnte nicht erstellt werden');
      setIsPreviewingImport(false);
      return;
    }

    setImportPreview(result.data);
    setOverwriteImportedForm(false);
    setExpandedPreviewSections(
      result.data.document.sections.map((section) => section.id)
    );
    setIsRawJsonExpanded(false);
    setIsPreviewingImport(false);
  }

  async function handleImportIntoDatabase() {
    setIsImportingForm(true);
    setImportError(undefined);
    setImportSuccess(undefined);

    const response = await fetch('/api/admin/forms/import', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'import',
        json: importJson,
        overwrite: overwriteImportedForm,
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: string;
      data?: IntakeFormRow;
    } | null;

    if (!response.ok || !result?.success || !result.data) {
      setImportError(
        result?.error || 'Formular konnte nicht importiert werden'
      );
      setIsImportingForm(false);
      return;
    }

    setImportSuccess(`Formular "${result.data.title}" wurde gespeichert.`);
    setReloadToken((currentValue) => currentValue + 1);
    setImportPreview(null);
    setImportJson('');
    setOverwriteImportedForm(false);
    setExpandedPreviewSections([]);
    setIsRawJsonExpanded(false);
    setIsImportingForm(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 dark:border-stone-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Formular anlegen
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
              Erstellt ein neues Intake-Formular aus einer Startvorlage oder als
              Duplikat eines bestehenden Formulars.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
            {isLoadingAvailableForms
              ? 'Formulare werden geladen...'
              : `${availableForms.length} Formular${availableForms.length === 1 ? '' : 'e'} vorhanden`}
          </div>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select
              name="mode"
              label="Quelle"
              value={formState.mode}
              onChange={(event) =>
                updateField('mode', event.target.value as FormCreationMode)
              }
              options={[
                { value: 'template', label: 'Aus Vorlage' },
                {
                  value: 'duplicate',
                  label: 'Bestehendes Formular duplizieren',
                },
              ]}
              disabled={isSubmitting}
            />
            {formState.mode === 'template' ? (
              <Select
                name="templateSlug"
                label="Vorlage"
                value={formState.templateSlug}
                onChange={(event) =>
                  updateField('templateSlug', event.target.value)
                }
                options={templateOptions}
                disabled={isSubmitting}
              />
            ) : (
              <Select
                name="duplicateFromFormId"
                label="Bestehendes Formular"
                value={formState.duplicateFromFormId}
                onChange={(event) =>
                  updateField('duplicateFromFormId', event.target.value)
                }
                options={duplicateOptions}
                placeholder="Formular waehlen"
                disabled={
                  isSubmitting ||
                  isLoadingAvailableForms ||
                  !duplicateOptions.length
                }
              />
            )}
            <Select
              name="status"
              label="Status"
              value={formState.status}
              onChange={(event) =>
                updateField(
                  'status',
                  event.target.value as FormCreationState['status']
                )
              }
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              disabled={isSubmitting}
            />
            <Input
              name="title"
              label="Titel"
              required
              value={formState.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="z. B. Relaunch Ferienwohnung 2026"
              disabled={isSubmitting}
            />
            <Input
              name="slug"
              label="Slug"
              required
              value={formState.slug}
              onChange={(event) =>
                updateField('slug', slugify(event.target.value))
              }
              placeholder="wird aus dem Titel abgeleitet"
              hint="Nur Kleinbuchstaben, Zahlen und Bindestriche."
              disabled={isSubmitting}
            />
            <Input
              name="description"
              label="Kurzbeschreibung"
              value={formState.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Optional"
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
              disabled={
                isSubmitting ||
                !formState.title.trim() ||
                (formState.mode === 'duplicate' &&
                  !formState.duplicateFromFormId)
              }
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
            >
              {isSubmitting
                ? 'Formular wird erstellt...'
                : 'Formular erstellen'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
            >
              Formular leeren
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 dark:border-stone-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Formular per JSON importieren
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
              Fuege hier ein DB-taugliches Formular-JSON ein, lass es
              serverseitig pruefen und speichere es erst nach einer Vorschau
              bewusst in die Datenbank.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
            Copy-Paste statt manueller Formulareingabe
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <Textarea
            name="importJson"
            label="Formular-JSON"
            rows={16}
            value={importJson}
            onChange={(event) => {
              setImportJson(event.target.value);
              setImportPreview(null);
              setImportError(undefined);
              setImportSuccess(undefined);
            }}
            placeholder='{
  "title": "...",
  "slug": "...",
  "formType": "relaunch",
  "sections": []
}'
            hint="Erwartet wird das reine Formular-Dokument, nicht ein insertOne- oder updateOne-Skript."
            disabled={isPreviewingImport || isImportingForm}
          />

          {importError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {importError}
            </div>
          )}

          {importSuccess && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {importSuccess}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handlePreviewImport()}
              disabled={
                !importJson.trim() || isPreviewingImport || isImportingForm
              }
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
            >
              {isPreviewingImport
                ? 'Vorschau wird geprueft...'
                : 'Vorschau pruefen'}
            </button>
            <button
              type="button"
              onClick={() => void handleImportIntoDatabase()}
              disabled={
                !importPreview ||
                isPreviewingImport ||
                isImportingForm ||
                Boolean(importPreview.existingForm && !overwriteImportedForm)
              }
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
            >
              {isImportingForm
                ? 'Formular wird gespeichert...'
                : 'In Datenbank speichern'}
            </button>
            <button
              type="button"
              onClick={resetImport}
              disabled={isPreviewingImport || isImportingForm}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
            >
              Importfeld leeren
            </button>
          </div>

          {importPreview && (
            <div className="grid gap-6 rounded-3xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/60 2xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                      Vorschau
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                      {importPreview.document.title}
                    </h3>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                      {importPreview.document.description ||
                        'Keine Beschreibung hinterlegt.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={expandAllPreviewSections}
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                    >
                      Alles aufklappen
                    </button>
                    <button
                      type="button"
                      onClick={collapseAllPreviewSections}
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                    >
                      Alles einklappen
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsRawJsonExpanded((currentValue) => !currentValue)
                      }
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                    >
                      {isRawJsonExpanded
                        ? 'Raw JSON ausblenden'
                        : 'Raw JSON anzeigen'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Slug
                    </p>
                    <p className="mt-2 break-all text-sm font-medium">
                      {importPreview.document.slug}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Typ
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {importPreview.document.formType}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Status / Version
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {importPreview.document.status} · v
                      {importPreview.document.version}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                    <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Sprache
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {importPreview.document.defaultLocale || 'de'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {importPreview.document.sections
                    .slice()
                    .sort((left, right) => left.order - right.order)
                    .map((section) => {
                      const isExpanded = expandedPreviewSectionSet.has(
                        section.id
                      );

                      return (
                        <div
                          key={section.id}
                          className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                {section.title}
                              </p>
                              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                Schritt {section.order} · {section.stepKey}
                              </p>
                              {section.description && (
                                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                                  {section.description}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
                                {section.questions.length} Fragen
                              </div>
                              <button
                                type="button"
                                onClick={() => togglePreviewSection(section.id)}
                                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                              >
                                {isExpanded
                                  ? 'Section einklappen'
                                  : 'Section aufklappen'}
                              </button>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="mt-4 space-y-3">
                              {section.questions
                                .slice()
                                .sort((left, right) => left.order - right.order)
                                .map((question) => {
                                  const validationRules = formatValidationRules(
                                    question.validationRules
                                  );
                                  const defaultValue = formatPreviewValue(
                                    question.defaultValue
                                  );

                                  return (
                                    <div
                                      key={question.id}
                                      className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-950/60"
                                    >
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                            {question.label}
                                          </p>
                                          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                            Key: {question.key} · Typ:{' '}
                                            {question.fieldType}
                                            {question.required
                                              ? ' · Pflichtfeld'
                                              : ' · Optional'}
                                          </p>
                                        </div>
                                        <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                                          #{question.order}
                                        </span>
                                      </div>

                                      {question.helpText && (
                                        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                                          {question.helpText}
                                        </p>
                                      )}

                                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                                        {question.placeholder ? (
                                          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 dark:border-stone-700 dark:bg-stone-900">
                                            Placeholder: {question.placeholder}
                                          </span>
                                        ) : null}
                                        {defaultValue ? (
                                          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 dark:border-stone-700 dark:bg-stone-900">
                                            Default: {defaultValue}
                                          </span>
                                        ) : null}
                                        {validationRules ? (
                                          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 dark:border-stone-700 dark:bg-stone-900">
                                            Regeln: {validationRules}
                                          </span>
                                        ) : null}
                                      </div>

                                      {question.options?.length ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {question.options.map((option) => (
                                            <span
                                              key={`${question.id}-${option.value}`}
                                              className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                                            >
                                              {option.label} ({option.value})
                                            </span>
                                          ))}
                                        </div>
                                      ) : null}

                                      {question.visibilityRules?.length ? (
                                        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                                          Bedingte Anzeige:{' '}
                                          {question.visibilityRules.length}{' '}
                                          Regel
                                          {question.visibilityRules.length === 1
                                            ? ''
                                            : 'n'}{' '}
                                          hinterlegt
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                </div>

                {isRawJsonExpanded ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-950 p-4 dark:border-stone-700">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                      Raw JSON
                    </p>
                    <pre className="mt-3 max-h-[28rem] overflow-auto text-xs leading-6 text-stone-100">
                      <code>{importPreviewJson}</code>
                    </pre>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 2xl:sticky 2xl:top-6 2xl:self-start">
                <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Zusammenfassung
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-200">
                    <p>Sections: {importPreview.summary.sectionCount}</p>
                    <p>Fragen: {importPreview.summary.questionCount}</p>
                    <p>
                      Bedingte Fragen:{' '}
                      {importPreview.summary.conditionalQuestionCount}
                    </p>
                    <p>
                      Datei-Uploads: {importPreview.summary.fileQuestionCount}
                    </p>
                    <p>Warnungen: {importPreview.warnings.length}</p>
                  </div>
                </div>

                {importPreview.warnings.length ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Vorschau-Warnungen
                    </p>
                    <div className="mt-3 space-y-3">
                      {importPreview.warnings.map((warning, index) => (
                        <div
                          key={`${warning.code}-${warning.path || index}`}
                          className="rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-stone-950/40 dark:text-amber-100"
                        >
                          <p>{warning.message}</p>
                          {warning.path ? (
                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                              Referenz: {warning.path}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Keine strukturellen Warnungen erkannt. Das Formular ist
                    nicht nur valide, sondern wirkt auch konsistent aufgebaut.
                  </div>
                )}

                {importPreview.existingForm ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Formular mit gleichem Slug bereits vorhanden
                    </p>
                    <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                      {importPreview.existingForm.title} ·{' '}
                      {importPreview.existingForm.status}
                    </p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                      Zuletzt aktualisiert:{' '}
                      {formatDateTime(importPreview.existingForm.updatedAt)}
                    </p>
                    <div className="mt-4">
                      <Checkbox
                        name="overwriteImportedForm"
                        checked={overwriteImportedForm}
                        onChange={(event) =>
                          setOverwriteImportedForm(event.target.checked)
                        }
                        label="Vorhandenes Formular ueberschreiben"
                        hint="Nur aktivieren, wenn dieses Formular mit gleichem Slug bewusst aktualisiert werden soll."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Kein bestehendes Formular mit diesem Slug gefunden. Der
                    Import wird als neues Formular gespeichert.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <AdminDataSection<IntakeFormRow>
        title="Formulare"
        description="Verfuegbare Intake-Vorlagen und duplizierte Formulare fuer konkrete Projektarten."
        endpoint="/api/admin/forms"
        searchPlaceholder="Suche nach Titel oder Slug"
        emptyMessage="Noch keine Formulare vorhanden"
        reloadToken={reloadToken}
        onRowClick={(row) =>
          router.push(withLocale(locale, `/admin/forms/${row.id}`))
        }
        columns={[
          {
            key: 'title',
            label: 'Titel',
            className: 'min-w-[16rem]',
            render: (row) => (
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-50">
                  {row.title}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {row.slug}
                </p>
              </div>
            ),
          },
          {
            key: 'slug',
            label: 'Slug',
            className:
              'min-w-[12rem] text-xs text-stone-500 dark:text-stone-400',
          },
          {
            key: 'formType',
            label: 'Typ',
            className: 'whitespace-nowrap',
          },
          {
            key: 'version',
            label: 'Version',
            className: 'whitespace-nowrap',
            render: (row) => (
              <span className="font-medium">v{row.version}</span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            className: 'whitespace-nowrap',
            render: (row) => (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${row.status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200' : row.status === 'draft' ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200' : 'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'}`}
              >
                {row.status}
              </span>
            ),
          },
          {
            key: 'updatedAt',
            label: 'Aktualisiert',
            className: 'whitespace-nowrap',
            render: (row) => formatDateTime(row.updatedAt),
          },
        ]}
      />
    </div>
  );
}
