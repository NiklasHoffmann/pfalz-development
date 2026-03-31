import { Link } from '@/routing';

interface HomeFooterProps {
  note: string;
  imprintLabel: string;
  privacyLabel: string;
}

export function HomeFooter({
  note,
  imprintLabel,
  privacyLabel,
}: HomeFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-stone-300/70 bg-[linear-gradient(180deg,_#f5efe4_0%,_#f1e8d8_100%)] px-4 py-10 dark:border-stone-700/80 dark:bg-[linear-gradient(180deg,_#2a2522_0%,_#1f2a36_100%)] sm:px-6 sm:py-12 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="dark:bg-amber-300/12 absolute -left-16 -top-16 h-44 w-44 rounded-full bg-amber-400/25 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-300/15" />
      </div>

      <div className="relative mx-auto max-w-7xl rounded-[1.5rem] border border-white/55 bg-white/70 p-6 shadow-[0_16px_45px_rgba(28,25,23,0.1)] backdrop-blur-sm dark:border-stone-600/80 dark:bg-stone-900/45 dark:shadow-[0_18px_45px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-200">
              Pfalz Development
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-200">
              {note}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/impressum"
              className="inline-flex items-center rounded-full border border-stone-300/80 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white dark:border-stone-500/80 dark:bg-stone-800/80 dark:text-stone-100 dark:hover:border-stone-400 dark:hover:bg-stone-800"
            >
              {imprintLabel}
            </Link>
            <Link
              href="/datenschutz"
              className="inline-flex items-center rounded-full border border-stone-300/80 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white dark:border-stone-500/80 dark:bg-stone-800/80 dark:text-stone-100 dark:hover:border-stone-400 dark:hover:bg-stone-800"
            >
              {privacyLabel}
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-stone-300/70 pt-4 text-xs text-stone-600 dark:border-stone-600/80 dark:text-stone-300">
          © {currentYear} Pfalz Development
        </div>
      </div>
    </footer>
  );
}
