import { Link } from '@/routing';
import type { SeoLinkItem } from './types';

interface HomeSeoLinksSectionProps {
  title: string;
  ctaLabel: string;
  items: SeoLinkItem[];
}

export function HomeSeoLinksSection({
  title,
  ctaLabel,
  items,
}: HomeSeoLinksSectionProps) {
  return (
    <section className="border-t border-stone-200/85 px-4 pb-14 pt-10 dark:border-stone-700/80 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-stone-200/90 bg-white/85 p-6 shadow-[0_20px_50px_rgba(28,25,23,0.08)] backdrop-blur dark:border-stone-700/80 dark:bg-stone-900/85 dark:shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
          {title}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-stone-200 bg-stone-50/90 p-5 transition hover:-translate-y-0.5 hover:border-amber-500/70 hover:bg-white dark:border-stone-700 dark:bg-stone-800/70 dark:hover:border-amber-300/70 dark:hover:bg-stone-800"
            >
              <p className="text-base font-bold text-stone-950 transition group-hover:text-amber-800 dark:text-stone-50 dark:group-hover:text-amber-200">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-200">
                {item.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-amber-800 dark:text-amber-200">
                {ctaLabel}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
