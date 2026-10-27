import Image from 'next/image';
import type { ReferenceItem } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeReferencesSectionProps {
  title: string;
  description: string;
  linkLabel: string;
  items: ReferenceItem[];
}

export function HomeReferencesSection({
  title,
  description,
  linkLabel,
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
          className="inline-flex rounded-full bg-stone-50/90 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 shadow-sm dark:bg-stone-900/90 dark:text-amber-100"
        >
          {title}
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700 dark:text-stone-200">
          {description}
        </p>

        <div className="mt-12 grid gap-8">
          {items.map((item, index) => (
            <RevealOnScroll
              as="article"
              key={item.title}
              delayMs={80 + index * 90}
              className="grid min-w-0 overflow-hidden rounded-[1.25rem] border border-stone-200/90 bg-stone-50/95 shadow-[0_18px_45px_rgba(28,25,23,0.06)] dark:border-stone-500/65 dark:bg-stone-800/75 dark:shadow-[0_20px_50px_rgba(0,0,0,0.22)] lg:grid-cols-[1.15fr_1fr]"
            >
              <div className="relative bg-stone-200/70 p-4 dark:bg-stone-900/60 sm:p-6">
                <div className="overflow-hidden rounded-xl border border-stone-300/80 bg-white shadow-[0_12px_30px_rgba(28,25,23,0.12)] dark:border-stone-600">
                  <div
                    aria-hidden="true"
                    className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-3 py-2 dark:border-stone-700 dark:bg-stone-800"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                  </div>
                  {item.image ? (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={item.image.width}
                      height={item.image.height}
                      sizes="(min-width: 1024px) 640px, 100vw"
                      quality={100}
                      className="block h-auto w-full"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="aspect-[16/10] w-full bg-[linear-gradient(135deg,_rgba(245,235,220,1),_rgba(226,214,196,1))] dark:bg-[linear-gradient(135deg,_rgba(68,58,50,1),_rgba(44,52,62,1))]"
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
                    className="mt-8 inline-flex text-sm font-semibold text-amber-700 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 dark:text-amber-200 dark:hover:text-amber-100"
                  >
                    {linkLabel}
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
