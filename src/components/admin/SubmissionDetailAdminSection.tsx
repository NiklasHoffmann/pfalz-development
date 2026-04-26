'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Textarea from '@/components/ui/Form/Textarea';
import Select from '@/components/ui/Form/Select';
import { readJsonResponse } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  formatSubmissionAnswerValue,
  isSubmissionAnswerFilled,
} from '@/lib/intake/submission-format';
import { intakeSubmissionStatuses } from '@/types/intake';

interface SubmissionAnswerFile {
  fileAssetId: string;
  originalFilename: string;
  mimeType: string;
  size: number;
}

interface SubmissionAnswer {
  questionId: string;
  questionKey: string;
  value: unknown;
  displayValue?: string;
  files?: SubmissionAnswerFile[];
}

interface SubmissionQuestion {
  id: string;
  key: string;
  label: string;
  required?: boolean;
}

interface SubmissionSection {
  id: string;
  title: string;
  description?: string;
  stepKey: string;
  order: number;
  questions: SubmissionQuestion[];
}

interface SubmissionDetail {
  id: string;
  projectId: string;
  status: string;
  currentStep?: string | null;
  progressPercent: number;
  internalNotes?: string | null;
  assigneeUserId?: string;
  lastSavedAt?: string;
  submittedAt?: string | null;
  updatedAt: string;
  answers: SubmissionAnswer[];
  customerSnapshot: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  consent?: {
    accepted?: boolean;
    acceptedAt?: string;
    privacyVersion?: string;
  };
  accessLink?: {
    customerName?: string;
    company?: string;
    email?: string;
    phone?: string;
    formSnapshot?: {
      title?: string;
      formType?: string;
      sections?: SubmissionSection[];
    };
  } | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AssignableStaffUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

interface SubmissionDetailAdminSectionProps {
  submissionId: string;
  locale: string;
  canPrint?: boolean;
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('de-DE');
}

function formatStatusLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function getSubmissionStatusClasses(status: string) {
  switch (status) {
    case 'vollst\u00E4ndig_eingereicht':
      return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300';
    case 'intern_gepr\u00FCft':
      return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200';
    case 'r\u00FCckfrage_offen':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
    case 'abgeschlossen':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    default:
      return 'border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200';
  }
}

export function SubmissionDetailAdminSection({
  submissionId,
  locale,
  canPrint = false,
}: SubmissionDetailAdminSectionProps) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>('begonnen');
  const [internalNotes, setInternalNotes] = useState('');
  const [assigneeUserId, setAssigneeUserId] = useState('');
  const [assignableStaffUsers, setAssignableStaffUsers] = useState<
    AssignableStaffUser[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>();

  useEffect(() => {
    let isCancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(undefined);
      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        credentials: 'include',
      });
      const payload = await readJsonResponse<{
        success?: boolean;
        data?: SubmissionDetail;
        error?: string;
      }>(response);

      if (isCancelled) {
        return;
      }

      if (!response.ok || !payload?.success || !payload.data) {
        setError(payload?.error || 'Einreichung konnte nicht geladen werden');
        setIsLoading(false);
        return;
      }

      setDetail(payload.data);
      setStatus(payload.data.status);
      setInternalNotes(payload.data.internalNotes || '');
      setAssigneeUserId(
        payload.data.assignee?.id || payload.data.assigneeUserId || ''
      );
      setIsLoading(false);
    }

    void loadDetail();

    return () => {
      isCancelled = true;
    };
  }, [submissionId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadAssignableStaffUsers() {
      const response = await fetch('/api/admin/staff/options', {
        credentials: 'include',
      });
      const payload = await readJsonResponse<{
        success?: boolean;
        data?: AssignableStaffUser[];
      }>(response);

      if (isCancelled) {
        return;
      }

      if (response.ok && payload?.success && Array.isArray(payload.data)) {
        setAssignableStaffUsers(payload.data);
      }
    }

    void loadAssignableStaffUsers();

    return () => {
      isCancelled = true;
    };
  }, []);

  const answerMap = useMemo(() => {
    return new Map(
      (detail?.answers || []).map((answer) => [answer.questionKey, answer])
    );
  }, [detail?.answers]);

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(undefined);
    setError(undefined);

    const response = await fetch(`/api/admin/submissions/${submissionId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        internalNotes,
        assigneeUserId: assigneeUserId || null,
      }),
    });

    const payload = await readJsonResponse<{
      success?: boolean;
      data?: SubmissionDetail;
      error?: string;
    }>(response);

    if (!response.ok || !payload?.success || !payload.data) {
      setError(payload?.error || 'Einreichung konnte nicht gespeichert werden');
      setIsSaving(false);
      return;
    }

    setDetail(payload.data);
    setStatus(payload.data.status);
    setInternalNotes(payload.data.internalNotes || '');
    setAssigneeUserId(
      payload.data.assignee?.id || payload.data.assigneeUserId || ''
    );
    setSaveMessage('Änderungen wurden gespeichert.');
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Einreichung wird geladen...
        </p>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <p className="text-sm text-red-700 dark:text-red-300">
          {error || 'Einreichung wurde nicht gefunden.'}
        </p>
      </section>
    );
  }

  const sections = detail.accessLink?.formSnapshot?.sections || [];
  const knownQuestionKeys = new Set(
    sections.flatMap((section) =>
      section.questions.map((question) => question.key)
    )
  );
  const totalQuestionsCount = sections.reduce(
    (count, section) => count + section.questions.length,
    0
  );
  const answeredQuestionsCount = sections.reduce(
    (count, section) =>
      count +
      section.questions.filter((question) =>
        isSubmissionAnswerFilled(answerMap.get(question.key))
      ).length,
    0
  );
  const uploadedFilesCount = detail.answers.reduce(
    (count, answer) => count + (answer.files?.length || 0),
    0
  );
  const fallbackAnswers = detail.answers.filter(
    (answer) => !knownQuestionKeys.has(answer.questionKey)
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="bg-gradient-to-r from-white via-stone-50 to-amber-50/60 p-6 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/10 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-stone-800 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Einreichung
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {detail.projectId}
                </h1>
                <span
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    getSubmissionStatusClasses(detail.status)
                  )}
                >
                  {formatStatusLabel(detail.status)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                {detail.accessLink?.formSnapshot?.title ||
                  'Unbekanntes Formular'}{' '}
                für{' '}
                {detail.accessLink?.customerName ||
                  detail.customerSnapshot.name ||
                  'Unbekannter Kunde'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <Link
                href={withLocale(locale, '/admin/submissions')}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
              >
                Zurück zur Liste
              </Link>
              {canPrint ? (
                <>
                  <a
                    href={`/api/admin/submissions/${submissionId}/json`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                  >
                    JSON exportieren
                  </a>
                  <Link
                    href={withLocale(
                      locale,
                      `/admin/submissions/${submissionId}/print`
                    )}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                  >
                    Druckansicht öffnen
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Kunde
              </p>
              <p className="mt-2 font-medium">
                {detail.accessLink?.customerName ||
                  detail.customerSnapshot.name ||
                  '-'}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                {detail.accessLink?.company ||
                  detail.customerSnapshot.company ||
                  '-'}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Kontakt
              </p>
              <p className="mt-2 text-sm">
                {detail.accessLink?.email ||
                  detail.customerSnapshot.email ||
                  '-'}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                {detail.accessLink?.phone ||
                  detail.customerSnapshot.phone ||
                  '-'}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Fortschritt
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {detail.progressPercent}%
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-stone-950 transition-all dark:bg-stone-100"
                  style={{
                    width: `${Math.max(0, Math.min(detail.progressPercent, 100))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                Aktueller Schritt: {detail.currentStep || '-'}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4 dark:border-stone-800 dark:bg-stone-950/55">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Antwortstand
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {answeredQuestionsCount}/
                {totalQuestionsCount || detail.answers.length}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                {uploadedFilesCount} Dateien hochgeladen
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 dark:border-stone-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Antworten
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Snapshot der Antworten auf Basis des zum Link gehoerenden
                Formularstands.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
                {sections.length} Bereiche
              </span>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 dark:border-stone-700 dark:bg-stone-950/60">
                {answeredQuestionsCount} beantwortet
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {sections.map((section) => {
              const answeredInSection = section.questions.filter((question) =>
                isSubmissionAnswerFilled(answerMap.get(question.key))
              ).length;

              return (
                <article
                  key={section.id}
                  className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-950/40"
                >
                  <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 dark:border-stone-800 sm:flex-row sm:items-end sm:justify-between">
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
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
                      <span className="rounded-full border border-stone-200 bg-white px-3 py-1 dark:border-stone-700 dark:bg-stone-900">
                        {answeredInSection}/{section.questions.length}{' '}
                        beantwortet
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-2">
                    {section.questions.map((question) => {
                      const answer = answerMap.get(question.key);
                      const hasAnswer = isSubmissionAnswerFilled(answer);

                      return (
                        <div
                          key={question.id}
                          className={cn(
                            'rounded-[1.5rem] border p-4 transition',
                            hasAnswer
                              ? 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
                              : 'border-dashed border-stone-300 bg-stone-100/80 dark:border-stone-700 dark:bg-stone-950/30'
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-stone-950 dark:text-stone-50">
                                {question.label}
                              </p>
                              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                Key: {question.key} ·{' '}
                                {question.required ? 'Pflichtfeld' : 'Optional'}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                                hasAnswer
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                              )}
                            >
                              {hasAnswer ? 'Beantwortet' : 'Offen'}
                            </span>
                          </div>

                          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
                            <p className="whitespace-pre-wrap break-words">
                              {answer?.displayValue ||
                                formatSubmissionAnswerValue(answer?.value)}
                            </p>
                          </div>

                          {!!answer?.files?.length && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {answer.files.map((file) => (
                                <a
                                  key={file.fileAssetId}
                                  href={`/api/intake/uploads/${file.fileAssetId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                                >
                                  {file.originalFilename}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}

            {!sections.length && (
              <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-6 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-300">
                Für diese Einreichung liegt kein Formular-Snapshot mit Sections
                vor. Antworten können trotzdem unten eingesehen werden.
              </div>
            )}

            {!!fallbackAnswers.length && (
              <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-950/40">
                <div className="border-b border-stone-200 pb-4 dark:border-stone-800">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Weitere gespeicherte Antworten
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    Diese Werte sind vorhanden, konnten aber keiner aktuellen
                    Formularfrage zugeordnet werden.
                  </p>
                </div>
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {fallbackAnswers.map((answer) => (
                    <div
                      key={`${answer.questionId}-${answer.questionKey}`}
                      className="rounded-[1.5rem] border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                    >
                      <p className="text-sm font-semibold text-stone-950 dark:text-stone-50">
                        {answer.questionKey}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700 dark:text-stone-300">
                        {answer.displayValue ||
                          formatSubmissionAnswerValue(answer.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-4">
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 pb-5 dark:border-stone-800">
              <h2 className="text-2xl font-semibold tracking-tight">
                Interne Bearbeitung
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Status, Bearbeiter und interne Notizen für die weitere
                Projektbearbeitung.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <Select
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                options={intakeSubmissionStatuses.map((value) => ({
                  value,
                  label: formatStatusLabel(value),
                }))}
                disabled={isSaving}
              />
              <Select
                label="Bearbeiter"
                value={assigneeUserId}
                onChange={(event) => setAssigneeUserId(event.target.value)}
                options={assignableStaffUsers
                  .map((staffUser) => ({
                    value: String(staffUser.id || staffUser._id || ''),
                    label: `${staffUser.name} (${staffUser.role})`,
                  }))
                  .filter((option) => option.value)}
                placeholder="Nicht zugewiesen"
                disabled={isSaving}
                hint="Zuständigen internen Bearbeiter für diesen Fall festlegen."
              />
              <Textarea
                label="Interne Notizen"
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                rows={8}
                placeholder="Nächste Schritte, offene Rückfragen, Priorisierung, technische Hinweise ..."
                disabled={isSaving}
              />
            </div>

            {(error || saveMessage) && (
              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm ${error ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'}`}
              >
                {error || saveMessage}
              </div>
            )}

            <div className="mt-5">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
              >
                {isSaving ? 'Speichert...' : 'Änderungen speichern'}
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 pb-5 dark:border-stone-800">
              <h2 className="text-xl font-semibold tracking-tight">Kontext</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Kontakt- und Verlaufsdaten für schnelle interne Einordnung.
              </p>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Zugewiesen an
                </p>
                <p className="mt-2 font-medium text-stone-950 dark:text-stone-50">
                  {detail.assignee?.name || 'Noch nicht zugewiesen'}
                </p>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  {detail.assignee
                    ? `${detail.assignee.email} · ${detail.assignee.role}`
                    : 'Bearbeiter kann im Panel oben festgelegt werden.'}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Zeitstempel
                </p>
                <dl className="mt-2 space-y-2 text-stone-700 dark:text-stone-300">
                  <div className="flex items-start justify-between gap-4">
                    <dt>Zuletzt gespeichert</dt>
                    <dd className="text-right">
                      {formatDate(detail.lastSavedAt || detail.updatedAt)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Eingereicht</dt>
                    <dd className="text-right">
                      {formatDate(detail.submittedAt)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Zuletzt aktualisiert</dt>
                    <dd className="text-right">
                      {formatDate(detail.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/60">
                <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Datenschutz
                </p>
                <p className="mt-2 font-medium text-stone-950 dark:text-stone-50">
                  {detail.consent?.accepted
                    ? 'Einwilligung erteilt'
                    : 'Keine dokumentierte Einwilligung'}
                </p>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  {detail.consent?.acceptedAt
                    ? `Zeitpunkt: ${formatDate(detail.consent.acceptedAt)}`
                    : 'Kein Zeitpunkt gespeichert'}
                </p>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  Version: {detail.consent?.privacyVersion || '-'}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
