import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SubmissionPrintActions } from '@/components/admin/SubmissionPrintActions';
import {
  getAdminSubmissionDetail,
  type SubmissionSection,
} from '@/lib/intake/admin-submissions';
import { formatSubmissionAnswerValue } from '@/lib/intake/submission-format';
import { createInternalMetadata } from '@/lib/intake/metadata';
import connectToDatabase from '@/lib/mongodb';
import { requireStaffPageAccess } from '@/lib/auth/admin-session';

interface AdminSubmissionPrintPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

function formatDate(value?: string | Date | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('de-DE');
}

export async function generateMetadata({
  params,
}: AdminSubmissionPrintPageProps): Promise<Metadata> {
  const { locale, id } = await params;

  return createInternalMetadata({
    locale,
    path: `/admin/submissions/${id}/print`,
    title: 'Druckansicht Einreichung',
    description:
      'Druckoptimierte Einzelansicht fuer eine interne Intake-Einreichung.',
  });
}

function renderAnswerSections(
  sections: SubmissionSection[],
  answerMap: Map<
    string,
    {
      value: unknown;
      displayValue?: string;
      files?: Array<{ fileAssetId: string; originalFilename: string }>;
    }
  >
) {
  return sections.map((section) => (
    <section
      key={section.id}
      className="print-break-avoid rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
      {section.description && (
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {section.description}
        </p>
      )}
      <div className="mt-5 space-y-4">
        {section.questions.map((question) => {
          const answer = answerMap.get(question.key);

          return (
            <div
              key={question.id}
              className="rounded-2xl bg-stone-50 px-4 py-3 dark:bg-stone-950/60"
            >
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {question.label}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
                {answer?.displayValue ||
                  formatSubmissionAnswerValue(answer?.value)}
              </p>
              {!!answer?.files?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {answer.files.map((file) => (
                    <span
                      key={file.fileAssetId}
                      className="inline-flex items-center rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:text-stone-200"
                    >
                      {file.originalFilename}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  ));
}

export default async function AdminSubmissionPrintPage({
  params,
}: AdminSubmissionPrintPageProps) {
  const { locale, id } = await params;
  await requireStaffPageAccess(locale, ['admin']);
  await connectToDatabase();
  const detail = await getAdminSubmissionDetail(id);

  if (!detail) {
    notFound();
  }

  const sections = detail.accessLink?.formSnapshot?.sections || [];
  const answerMap = new Map(
    detail.answers.map((answer) => [answer.questionKey, answer])
  );
  const jsonDownloadHref = `/api/admin/submissions/${id}/json`;

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 dark:bg-stone-950 dark:text-stone-50 print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="print-sheet mx-auto flex max-w-5xl flex-col gap-6">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 print:border-0 print:shadow-none">
          <SubmissionPrintActions
            backHref={withLocale(locale, `/admin/submissions/${id}`)}
            jsonDownloadHref={jsonDownloadHref}
          />

          <div className="pt-6 print:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 print:text-stone-500">
              Druckansicht Einreichung
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {detail.projectId}
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
              {detail.accessLink?.formSnapshot?.title || 'Unbekanntes Formular'}{' '}
              fuer{' '}
              {detail.accessLink?.customerName ||
                detail.customerSnapshot.name ||
                'Unbekannter Kunde'}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="print-break-avoid rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
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
            <div className="print-break-avoid rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
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
            <div className="print-break-avoid rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Status
              </p>
              <p className="mt-2 font-medium">{detail.status}</p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                Fortschritt: {detail.progressPercent}%
              </p>
            </div>
            <div className="print-break-avoid rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Zeitstempel
              </p>
              <p className="mt-2 text-sm">
                Aktualisiert: {formatDate(detail.updatedAt)}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                Eingereicht: {formatDate(detail.submittedAt)}
              </p>
            </div>
          </div>
        </section>

        {!!detail.internalNotes && (
          <section className="print-break-avoid rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-xl font-semibold tracking-tight">
              Interne Notizen
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700 dark:text-stone-300">
              {detail.internalNotes}
            </p>
          </section>
        )}

        {renderAnswerSections(sections, answerMap)}

        <section className="print-break-avoid rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-semibold tracking-tight">Consent</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 px-4 py-3 dark:bg-stone-950/60">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Akzeptiert
              </p>
              <p className="mt-2 text-sm">
                {detail.consent?.accepted ? 'Ja' : 'Nein'}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-3 dark:bg-stone-950/60">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Akzeptiert am
              </p>
              <p className="mt-2 text-sm">
                {formatDate(detail.consent?.acceptedAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-3 dark:bg-stone-950/60">
              <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Privacy-Version
              </p>
              <p className="mt-2 text-sm">
                {detail.consent?.privacyVersion || '-'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
