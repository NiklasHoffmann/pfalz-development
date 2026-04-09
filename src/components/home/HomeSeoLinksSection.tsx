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
    <section className="border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
          {title}
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex h-full min-w-0 flex-col rounded-2xl border border-stone-200/90 bg-stone-50/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500/70 hover:bg-white dark:border-stone-700/80 dark:bg-stone-900/75 dark:hover:border-amber-300/70 dark:hover:bg-stone-800/90"
            >
              <p className="text-base font-bold text-stone-950 transition group-hover:text-amber-800 dark:text-stone-50 dark:group-hover:text-amber-200">
                {item.label}
              </p>
              <p className="mt-2 flex-1 text-sm leading-6 text-stone-700 dark:text-stone-200">
                {item.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-amber-700 dark:text-amber-200">
                {ctaLabel}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
