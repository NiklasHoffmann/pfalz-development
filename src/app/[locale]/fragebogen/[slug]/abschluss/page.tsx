import type { Metadata } from 'next';
import { createInternalMetadata } from '@/lib/intake/metadata';

interface IntakeCompletePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: IntakeCompletePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  return createInternalMetadata({
    locale,
    path: `/fragebogen/${slug}/abschluss`,
    title: 'Fragebogen erfolgreich uebermittelt',
    description: 'Abschlussseite fuer einen geschuetzten Kundenfragebogen.',
  });
}

export default async function IntakeCompletePage() {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          Uebermittlung erfolgreich
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Danke, dein Briefing wurde gespeichert.
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-300">
          Wir nutzen deine Angaben jetzt fuer die interne Projektvorbereitung
          und melden uns mit den naechsten Schritten.
        </p>
      </div>
    </main>
  );
}
