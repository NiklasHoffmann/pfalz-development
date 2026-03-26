import type { CardItem } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeServicesSectionProps {
  title: string;
  items: CardItem[];
}

export function HomeServicesSection({
  title,
  items,
}: HomeServicesSectionProps) {
  return (
    <RevealOnScroll
      as="section"
      id="leistungen"
      aria-labelledby="home-services-title"
      className="border-t border-stone-200/85 bg-[linear-gradient(180deg,_rgba(250,247,241,0.7),_rgba(248,245,239,0.5))] px-4 pb-16 pt-10 dark:border-stone-700/80 dark:bg-[linear-gradient(180deg,_rgba(24,24,27,0.5),_rgba(24,24,27,0.15))] sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="home-services-title"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100"
        >
          {title}
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {items.map((item, index) => (
            <RevealOnScroll
              as="article"
              key={item.title}
              delayMs={80 + index * 90}
              className="min-w-0 overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-stone-50 p-6 shadow-[0_18px_45px_rgba(28,25,23,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(28,25,23,0.1)] dark:border-stone-700 dark:bg-stone-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.32)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-2xl font-bold text-stone-950 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-stone-800 dark:text-stone-100">
                {item.description}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
