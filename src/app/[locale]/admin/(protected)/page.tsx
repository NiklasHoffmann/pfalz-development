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
  roles?: IntakeStaffRole[];
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

const adminEntries: AdminEntry[] = [
  {
    href: '/admin/submissions',
    label: 'Einreichungen',
  },
  {
    href: '/admin/rechnungen',
    label: 'Rechnungen',
  },
  {
    href: '/admin/rechnungen/stammdaten',
    label: 'Rechnungs-Stammdaten',
  },
  {
    href: '/admin/access-links',
    label: 'Zugangslinks',
    roles: ['admin'],
  },
  {
    href: '/admin/forms',
    label: 'Formulare',
    roles: ['admin'],
  },
  {
    href: '/admin/audit',
    label: 'Audit-Log',
    roles: ['admin'],
  },
  {
    href: '/admin/staff',
    label: 'Mitarbeiter',
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
      <section className="rounded-[1.9rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
        <div className="flex flex-col gap-2.5 border-b border-stone-200 pb-4 dark:border-stone-800">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Admin-Start
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Arbeitsbereiche
          </h1>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleEntries.map((entry) => (
            <Link
              key={entry.href}
              href={withLocale(locale, entry.href)}
              className="group rounded-[1.35rem] border border-stone-200 bg-stone-50/80 px-4 py-4 transition hover:border-amber-300 hover:bg-amber-50/70 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-amber-700 dark:hover:bg-amber-950/10"
            >
              <p className="text-sm font-semibold text-stone-950 transition group-hover:text-amber-900 dark:text-stone-50 dark:group-hover:text-amber-200">
                {entry.label}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
