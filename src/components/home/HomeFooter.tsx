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
  return (
    <footer className="border-t border-stone-200/90 bg-stone-50/95 px-4 py-8 dark:border-stone-700/80 dark:bg-[linear-gradient(180deg,_rgba(38,50,64,0.76),_rgba(45,38,34,0.88))] sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-stone-600 dark:text-stone-100 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-center sm:text-left">{note}</p>
        <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
          <Link
            href="/impressum"
            className="font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-100 dark:hover:text-white"
          >
            {imprintLabel}
          </Link>
          <Link
            href="/datenschutz"
            className="font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-100 dark:hover:text-white"
          >
            {privacyLabel}
          </Link>
        </div>
      </div>
    </footer>
  );
}
