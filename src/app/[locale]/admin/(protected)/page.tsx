import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireStaffPageAccess } from '@/lib/auth/admin-session';
import type { IntakeStaffRole } from '@/types/intake';

interface AdminOverviewPageProps {
  params: Promise<{ locale: string }>;
}

interface AdminEntry {
  href: string;
  label: string;
  description: string;
  roles?: IntakeStaffRole[];
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

const adminEntries: AdminEntry[] = [
  {
    href: '/admin/submissions',
    label: 'Einreichungen',
    description:
      'Laufende Projekte, Status und Druckansichten im Blick behalten.',
  },
  {
    href: '/admin/rechnungen',
    label: 'Rechnungen',
    description:
      'Rechnungen erstellen, archivieren und direkt in den Druck geben.',
  },
  {
    href: '/admin/rechnungen/stammdaten',
    label: 'Rechnungs-Stammdaten',
    description:
      'Absender, Zahlungsdaten und Standardhinweise zentral pflegen.',
  },
  {
    href: '/admin/access-links',
    label: 'Zugangslinks',
    description: 'Projektzugriffe anlegen, pruefen und erneut teilen.',
    roles: ['admin'],
  },
  {
    href: '/admin/forms',
    label: 'Formulare',
    description:
      'Intake-Formulare verwalten, duplizieren und weiterentwickeln.',
    roles: ['admin'],
  },
  {
    href: '/admin/audit',
    label: 'Audit-Log',
    description:
      'Nachvollziehen, welche Admin-Aktionen wann ausgefuehrt wurden.',
    roles: ['admin'],
  },
  {
    href: '/admin/staff',
    label: 'Mitarbeiter',
    description: 'Zugaenge, Rollen und Aktiv-Status des Teams verwalten.',
    roles: ['admin'],
  },
];

export default async function AdminOverviewPage({
  params,
}: AdminOverviewPageProps) {
  const { locale } = await params;
  const staffUser = await requireStaffPageAccess(locale, ['admin', 'editor']);
  const visibleEntries = adminEntries.filter(
    (entry) => !entry.roles || entry.roles.includes(staffUser.role)
  );

  return (
    <AdminShell
      locale={locale}
      staffUser={{
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
      }}
    >
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 dark:border-stone-800">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Admin-Start
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Arbeitsbereiche
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
            Alle internen Bereiche liegen jetzt direkt unter /admin und sind
            nach Aufgaben gegliedert statt nach der alten Intake-Herkunft.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleEntries.map((entry) => (
            <Link
              key={entry.href}
              href={withLocale(locale, entry.href)}
              className="group rounded-[1.75rem] border border-stone-200 bg-stone-50/80 p-5 transition hover:border-amber-300 hover:bg-amber-50/70 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-amber-700 dark:hover:bg-amber-950/10"
            >
              <p className="text-sm font-semibold text-stone-950 transition group-hover:text-amber-900 dark:text-stone-50 dark:group-hover:text-amber-200">
                {entry.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                {entry.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
