import type { SideProjectItem } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeSideProjectSectionProps {
  item: SideProjectItem;
}

export function HomeSideProjectSection({ item }: HomeSideProjectSectionProps) {
  return (
    <RevealOnScroll
      as="section"
      aria-labelledby="home-side-project-title"
      className="border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="min-w-0 rounded-[1.25rem] bg-stone-100/60 p-8 dark:bg-stone-900/40 sm:p-10">
          <span className="inline-flex rounded-full bg-stone-200/70 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-stone-700 dark:bg-stone-700/60 dark:text-stone-200">
            {item.statusLabel}
          </span>
          <h2
            id="home-side-project-title"
            className="mt-4 text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl"
          >
            {item.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700 dark:text-stone-300">
            {item.description}
          </p>
          {item.features.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {item.features.map((feature) => (
                <li
                  key={feature}
                  className="rounded-full bg-stone-200/70 px-3 py-1 text-sm text-stone-700 dark:bg-stone-700/60 dark:text-stone-200"
                >
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:bg-amber-200 dark:text-stone-900 dark:hover:bg-amber-100 dark:focus-visible:ring-amber-300 dark:focus-visible:ring-offset-stone-800"
          >
            {item.linkLabel}
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M7.5 3.5h9v9" />
              <path d="M16.5 3.5 8 12" />
              <path d="M14 11.5v5h-11v-11h5" />
            </svg>
            <span className="sr-only">({item.linkHint})</span>
          </a>
        </div>
      </div>
    </RevealOnScroll>
  );
}
