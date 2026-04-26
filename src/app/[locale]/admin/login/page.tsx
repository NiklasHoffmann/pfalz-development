import type { Metadata } from 'next';
import { AdminBootstrapForm } from '@/components/admin/AdminBootstrapForm';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { getAdminAppUrl } from '@/lib/admin-host';
import { requireAdminPageEntryAccess } from '@/lib/auth/admin-session';
import { createInternalMetadata } from '@/lib/intake/metadata';
import connectToDatabase from '@/lib/mongodb';
import StaffUser from '@/models/StaffUser';

interface AdminLoginPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminLoginPageProps): Promise<Metadata> {
  const { locale } = await params;

  return createInternalMetadata({
    locale,
    path: '/admin/login',
    title: 'Interner Admin-Login',
    description: 'Geschützter Login für den internen Kundenbereich.',
    baseUrl: getAdminAppUrl(),
  });
}

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { locale } = await params;
  await requireAdminPageEntryAccess();
  let hasStaffUsers = true;
  const hasConfiguredAdminApiKey = Boolean(process.env.ADMIN_API_KEY?.trim());
  let canBootstrapWithoutAdminApiKey = false;

  try {
    await connectToDatabase();
    hasStaffUsers = (await StaffUser.countDocuments().exec()) > 0;
    canBootstrapWithoutAdminApiKey =
      !hasStaffUsers &&
      process.env.NODE_ENV !== 'production' &&
      !hasConfiguredAdminApiKey;
  } catch {
    hasStaffUsers = true;
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div
        className={`mx-auto grid max-w-6xl gap-6 ${hasStaffUsers ? 'lg:max-w-md' : 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'}`}
      >
        {!hasStaffUsers && (
          <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Erstsetup
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Ersten Admin anlegen
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
              Es existiert noch kein interner Benutzer. Lege jetzt den ersten
              Staff-Account für den Intake-Admin an.
            </p>
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
              {canBootstrapWithoutAdminApiKey
                ? 'Lokales Erstsetup ist ohne Admin API Key freigeschaltet, weil noch kein Staff-User existiert.'
                : 'Für die erste Benutzeranlage wird der konfigurierte Admin API Key benötigt.'}
            </div>
            <div className="mt-6">
              <AdminBootstrapForm
                locale={locale}
                defaultEmail="kontakt@pfalz-development.de"
                requiresAdminApiKey={!canBootstrapWithoutAdminApiKey}
              />
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Interner Bereich
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Admin-Anmeldung
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Zugriff für Admins und Bearbeiter auf Formulare, Zugangslinks und
            Einreichungen.
          </p>
          <div className="mt-6">
            <AdminLoginForm locale={locale} />
          </div>
        </section>
      </div>
    </main>
  );
}
