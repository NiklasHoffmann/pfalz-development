import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { IntakeQuestionnaireShell } from '@/components/intake/IntakeQuestionnaireShell';
import { buildQuestionnaireCompletePath } from '@/lib/intake/path';
import { createInternalMetadata } from '@/lib/intake/metadata';
import { getIntakeContextFromSession } from '@/lib/intake/access';
import { INTAKE_SESSION_COOKIE_NAME } from '@/lib/intake/constants';
import { decodeIntakeSession } from '@/lib/intake/session';

interface IntakeQuestionnairePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function formatTimestamp(locale: string, value?: Date | null): string {
  if (!value) {
    return 'Noch nicht gespeichert';
  }

  const formatter = new Intl.DateTimeFormat(
    locale === 'en' ? 'en-US' : 'de-DE',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );

  return formatter.format(value);
}

function AccessState({ title, message }: { title: string; message: string }) {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          Geschuetzter Kundenbereich
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-300">
          {message}
        </p>
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: IntakeQuestionnairePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  return createInternalMetadata({
    locale,
    path: `/fragebogen/${slug}`,
    title: 'Kundenfragebogen',
    description: 'Geschuetzter, nicht oeffentlich verlinkter Kundenfragebogen.',
  });
}

export default async function IntakeQuestionnairePage({
  params,
}: IntakeQuestionnairePageProps) {
  const { locale, slug } = await params;
  const cookieStore = await cookies();
  const session = decodeIntakeSession(
    cookieStore.get(INTAKE_SESSION_COOKIE_NAME)?.value
  );

  if (!session) {
    return (
      <AccessState
        title="Zugang erforderlich"
        message="Bitte oeffne deinen persoenlichen Fragebogen erneut ueber den individuellen Link oder den zugehoerigen QR-Code."
      />
    );
  }

  const context = await getIntakeContextFromSession(session, slug);

  if (!context) {
    return (
      <AccessState
        title="Zugang nicht mehr gueltig"
        message="Der gespeicherte Zugriff konnte nicht mehr bestaetigt werden. Bitte verwende erneut deinen persoenlichen Link oder den QR-Code."
      />
    );
  }

  const formSnapshot = JSON.parse(
    JSON.stringify(context.accessLink.formSnapshot)
  );
  const initialAnswers = JSON.parse(JSON.stringify(context.submission.answers));

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Geschuetzter Kundenbereich
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {context.accessLink.formSnapshot.title}
              </h1>
              {context.accessLink.formSnapshot.description && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600 dark:text-stone-300">
                  {context.accessLink.formSnapshot.description}
                </p>
              )}
            </div>
            <dl className="grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-800 dark:bg-stone-950/70">
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Projekt</dt>
                <dd className="mt-1 font-medium">
                  {context.accessLink.projectId}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Kunde</dt>
                <dd className="mt-1 font-medium">
                  {context.accessLink.customerName}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Status</dt>
                <dd className="mt-1 font-medium">
                  {context.submission.status}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">
                  Zuletzt gespeichert
                </dt>
                <dd className="mt-1 font-medium">
                  {formatTimestamp(locale, context.submission.lastSavedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <IntakeQuestionnaireShell
          submissionId={String(context.submission.id ?? context.submission._id)}
          formSnapshot={formSnapshot}
          initialAnswers={initialAnswers}
          initialStepKey={context.submission.currentStep}
          completionPath={buildQuestionnaireCompletePath(locale, slug)}
        />
      </div>
    </main>
  );
}
