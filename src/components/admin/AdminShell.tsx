'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import styles from './AdminShell.module.css';
import { cn } from '@/lib/utils';
import type { IntakeStaffRole } from '@/types/intake';

interface AdminShellProps {
  locale: string;
  staffUser: {
    name: string;
    email: string;
    role: IntakeStaffRole;
  };
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  roles?: IntakeStaffRole[];
  matchMode?: 'exact' | 'prefix';
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

const navigationItems: NavigationItem[] = [
  { href: '/admin', label: 'Übersicht', matchMode: 'exact' },
  { href: '/admin/submissions', label: 'Einreichungen' },
  { href: '/admin/rechnungen', label: 'Rechnungen', matchMode: 'exact' },
  {
    href: '/admin/rechnungen/stammdaten',
    label: 'Rechnungs-Stammdaten',
    matchMode: 'exact',
  },
  {
    href: '/admin/access-links',
    label: 'Zugangslinks',
    roles: ['admin'] as IntakeStaffRole[],
  },
  {
    href: '/admin/forms',
    label: 'Formulare',
    roles: ['admin'] as IntakeStaffRole[],
  },
  {
    href: '/admin/audit',
    label: 'Audit-Log',
    roles: ['admin'] as IntakeStaffRole[],
  },
  {
    href: '/admin/staff',
    label: 'Mitarbeiter',
    roles: ['admin'] as IntakeStaffRole[],
  },
];

function isNavigationItemActive(
  pathname: string,
  href: string,
  matchMode: 'exact' | 'prefix' = 'prefix'
) {
  if (matchMode === 'exact') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ locale, staffUser, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileNavState, setMobileNavState] = useState({
    isOpen: false,
    pathname,
  });
  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(staffUser.role)
  );
  const activeNavigationItem = visibleNavigationItems.find((item) => {
    const href = withLocale(locale, item.href);
    return isNavigationItemActive(pathname, href, item.matchMode);
  });
  const activeSectionLabel = activeNavigationItem?.label || 'Übersicht';
  const isMobileNavOpen =
    mobileNavState.isOpen && mobileNavState.pathname === pathname;

  function toggleMobileNav() {
    setMobileNavState((current) => ({
      isOpen: !(current.isOpen && current.pathname === pathname),
      pathname,
    }));
  }

  function closeMobileNav() {
    setMobileNavState({ isOpen: false, pathname });
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    startTransition(() => {
      router.push(withLocale(locale, '/admin/login'));
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        styles.shell,
        'admin-shell surface-page min-h-screen overflow-x-clip text-stone-950 dark:text-stone-50'
      )}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-7rem] h-64 w-64 rounded-full bg-amber-200/35 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute right-[-6rem] top-20 h-72 w-72 rounded-full bg-stone-300/45 blur-3xl dark:bg-stone-700/25" />
      </div>

      <div className="relative mx-auto box-border w-full max-w-[1800px] px-3 py-4 sm:px-4 xl:px-6">
        <aside className="hidden xl:block">
          <div
            className={cn(
              styles.sidebar,
              'admin-shell-sidebar fixed bottom-4 top-4 z-40 hidden flex-col overflow-hidden rounded-[2rem] xl:flex'
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[2rem] bg-transparent backdrop-blur-md [-webkit-mask-image:linear-gradient(to_right,black_0%,rgba(0,0,0,0.52)_32%,transparent_100%)] [mask-image:linear-gradient(to_right,black_0%,rgba(0,0,0,0.52)_32%,transparent_100%)]"
            />

            <div className="surface-header relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-stone-300/80 p-4 shadow-[0_10px_34px_rgba(28,25,23,0.08)] backdrop-blur-xl dark:border-stone-600/90">
              <div className="bg-white/72 rounded-[1.5rem] border border-stone-200/80 px-4 py-4 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  <span>Adminbereich</span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    {activeSectionLabel}
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold tracking-tight">
                  Arbeitsbereich
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                  Die wichtigsten Admin-Flächen sind hier gebündelt und mit
                  kurzen Wegen erreichbar.
                </p>
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
                    Navigation
                  </p>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
                    {visibleNavigationItems.length} Bereiche
                  </span>
                </div>

                <nav className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {visibleNavigationItems.map((item) => {
                    const href = withLocale(locale, item.href);
                    const isActive = isNavigationItemActive(
                      pathname,
                      href,
                      item.matchMode
                    );

                    return (
                      <Link
                        key={item.href}
                        href={href}
                        className={cn(
                          'block rounded-[1.35rem] border px-4 py-3 text-sm font-medium transition',
                          isActive
                            ? 'border-amber-300/80 bg-amber-100/85 text-amber-900 shadow-sm dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200'
                            : 'bg-white/62 hover:bg-white/88 border-stone-200/70 text-stone-700 hover:border-stone-300/80 dark:border-stone-700/70 dark:bg-stone-900/35 dark:text-stone-200 dark:hover:border-stone-600/80 dark:hover:bg-stone-900/60'
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="bg-white/72 mt-4 rounded-[1.5rem] border border-stone-200/80 px-4 py-4 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
                <p className="font-medium">{staffUser.name}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {staffUser.email}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  Rolle: {staffUser.role}
                </p>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                >
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div
          className={cn(
            styles.content,
            'admin-shell-content min-w-0 pb-10 xl:pb-16'
          )}
        >
          <header
            className={cn(
              styles.header,
              'admin-shell-header sticky top-3 z-30 xl:fixed xl:top-4'
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-4 h-28 bg-transparent backdrop-blur-md [-webkit-mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.58)_24%,rgba(0,0,0,0.22)_52%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.58)_24%,rgba(0,0,0,0.22)_52%,transparent_100%)] sm:h-32"
            />

            <div className="surface-header relative rounded-[2rem] border border-stone-300/80 px-5 py-4 shadow-[0_10px_34px_rgba(28,25,23,0.08)] backdrop-blur-xl dark:border-stone-600/90 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    <span>Adminbereich</span>
                    <span className="rounded-full border border-stone-200 bg-white/80 px-2.5 py-1 text-[10px] text-stone-700 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200">
                      {activeSectionLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                    Interner Arbeitsbereich
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    Klare Navigation, kompakte Statusinfos und schnelle Aktionen
                    für den Tagesbetrieb.
                  </p>
                </div>

                <div className="flex flex-col gap-3 xl:hidden">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 rounded-[1.5rem] border border-stone-200/80 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
                      <p className="truncate font-medium">{staffUser.name}</p>
                      <p className="truncate text-sm text-stone-500 dark:text-stone-400">
                        {staffUser.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMobileNav}
                      aria-expanded={isMobileNavOpen}
                      aria-controls="admin-mobile-nav"
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/65 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                    >
                      {isMobileNavOpen
                        ? 'Navigation schließen'
                        : 'Navigation öffnen'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200">
                      Aktiver Bereich: {activeSectionLabel}
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {visibleNavigationItems.length} Bereiche verfügbar
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={isLoggingOut}
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
              </div>

              {isMobileNavOpen ? (
                <nav
                  id="admin-mobile-nav"
                  className="mt-4 grid gap-2 sm:grid-cols-2 xl:hidden"
                >
                  {visibleNavigationItems.map((item) => {
                    const href = withLocale(locale, item.href);
                    const isActive = isNavigationItemActive(
                      pathname,
                      href,
                      item.matchMode
                    );

                    return (
                      <Link
                        key={item.href}
                        href={href}
                        onClick={closeMobileNav}
                        className={cn(
                          'inline-flex min-h-11 items-center justify-center rounded-[1.15rem] px-4 py-3 text-center text-sm font-medium transition',
                          isActive
                            ? 'border border-amber-300/80 bg-amber-100/85 text-amber-900 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200'
                            : 'border border-stone-300/80 bg-white/80 text-stone-700 hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/65 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50'
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
            </div>
          </header>

          <main className="min-w-0 pt-6 xl:pt-36">{children}</main>
        </div>
      </div>
    </div>
  );
}
