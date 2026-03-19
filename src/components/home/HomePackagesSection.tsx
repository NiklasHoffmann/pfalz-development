import type { PackageItem } from './types';

interface HomePackagesSectionProps {
  title: string;
  items: PackageItem[];
}

export function HomePackagesSection({
  title,
  items,
}: HomePackagesSectionProps) {
  return (
    <section
      id="pakete"
      className="mx-auto max-w-7xl scroll-mt-[3.375rem] px-4 py-16 sm:scroll-mt-[3.875rem] sm:px-6 sm:py-20 md:scroll-mt-[3.625rem] lg:px-10"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
        {title}
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.name}
            className={`min-w-0 overflow-hidden rounded-[1.9rem] border p-6 ${
              index === 1
                ? 'border-amber-300 bg-[linear-gradient(180deg,_#fff7e6,_#f6e7c8)] shadow-[0_20px_70px_rgba(245,158,11,0.18)] dark:border-amber-500 dark:bg-[linear-gradient(180deg,_#5c2b0e,_#3d1d09)]'
                : 'border-stone-200/90 bg-stone-50/95 dark:border-stone-700 dark:bg-stone-900'
            }`}
          >
            <h3
              className={`text-2xl font-bold ${
                index === 1
                  ? 'text-stone-950 dark:text-amber-50'
                  : 'text-stone-950 dark:text-white'
              }`}
            >
              {item.name}
            </h3>
            <p
              className={`mt-4 text-base leading-7 ${
                index === 1
                  ? 'text-stone-800 dark:text-amber-100'
                  : 'text-stone-800 dark:text-stone-100'
              }`}
            >
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
