import type { Metadata } from 'next';
import { AdminResetPasswordForm } from '@/components/admin/AdminResetPasswordForm';
import { createInternalMetadata } from '@/lib/intake/metadata';

interface AdminResetPasswordPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminResetPasswordPageProps): Promise<Metadata> {
  const { locale } = await params;

  return createInternalMetadata({
    locale,
    path: '/admin/reset-password',
    title: 'Admin-Passwort zurücksetzen',
    description: 'Setze ein neues Passwort für den internen Admin-Zugang.',
  });
}

export default async function AdminResetPasswordPage({
  params,
}: AdminResetPasswordPageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          Interner Bereich
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Passwort zurücksetzen
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
          Vergib ein neues Passwort für deinen Admin-Zugang. Der Link aus der
          E-Mail ist zeitlich begrenzt.
        </p>
        <div className="mt-6">
          <AdminResetPasswordForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
