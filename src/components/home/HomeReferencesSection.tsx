import Image from 'next/image';
import type { ReferenceItem } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeReferencesSectionProps {
  title: string;
  description: string;
  linkLabel: string;
  linkHint: string;
  items: ReferenceItem[];
}

export function HomeReferencesSection({
  title,
  description,
  linkLabel,
  linkHint,
  items,
}: HomeReferencesSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <RevealOnScroll
      as="section"
      id="referenzen"
      aria-labelledby="home-references-title"
      className="border-t border-stone-200/85 bg-stone-100/60 px-4 py-20 dark:border-stone-700/80 dark:bg-stone-900/40 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="home-references-title"
          className="max-w-3xl text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700 dark:text-stone-300">
          {description}
        </p>

        <div className="mt-12 grid gap-8">
          {items.map((item, index) => (
            <RevealOnScroll
              as="article"
              key={item.title}
              delayMs={80 + index * 90}
              className="grid min-w-0 overflow-hidden rounded-[1.25rem] bg-stone-50/95 dark:bg-stone-800/75 lg:grid-cols-[1.15fr_1fr]"
            >
              <div className="p-4 sm:p-6">
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl">
                  {item.image ? (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 1024px) 640px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="h-full w-full bg-[linear-gradient(135deg,_rgba(245,235,220,1),_rgba(226,214,196,1))] dark:bg-[linear-gradient(135deg,_rgba(68,58,50,1),_rgba(44,52,62,1))]"
                    />
                  )}
                </div>
              </div>

              <div className="flex min-w-0 flex-col p-8 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
                  {item.category}
                </p>
                <h3 className="mt-4 text-2xl font-bold text-stone-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-stone-800 dark:text-stone-100">
                  {item.description}
                </p>
                {item.tags.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900 dark:border-amber-300/30 dark:bg-amber-200/10 dark:text-amber-100"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-amber-700 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:bg-amber-200 dark:text-stone-900 dark:hover:bg-amber-100 dark:focus-visible:ring-amber-300 dark:focus-visible:ring-offset-stone-800"
                  >
                    {linkLabel}
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
                    <span className="sr-only">({linkHint})</span>
                  </a>
                ) : null}
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
