import type { CardItem } from './types';

interface HomeServicesSectionProps {
  title: string;
  items: CardItem[];
}

export function HomeServicesSection({
  title,
  items,
}: HomeServicesSectionProps) {
  return (
    <section
      id="leistungen"
      className="mx-auto max-w-7xl scroll-mt-[3.375rem] px-4 py-16 sm:scroll-mt-[3.875rem] sm:px-6 sm:py-20 md:scroll-mt-[3.625rem] lg:px-10"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
        {title}
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.title}
            className="min-w-0 overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-stone-50 p-6 shadow-[0_18px_45px_rgba(28,25,23,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(28,25,23,0.1)] dark:border-stone-700 dark:bg-stone-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.32)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
              0{index + 1}
            </p>
            <h2 className="mt-4 text-2xl font-bold text-stone-950 dark:text-white">
              {item.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-800 dark:text-stone-100">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
