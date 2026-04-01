import type { CardItem } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeServicesSectionProps {
  title: string;
  items: CardItem[];
}

const SERVICES_STOCK_BACKGROUND_URL =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80';

export function HomeServicesSection({
  title,
  items,
}: HomeServicesSectionProps) {
  return (
    <RevealOnScroll
      as="section"
      id="leistungen"
      aria-labelledby="home-services-title"
      className="relative isolate overflow-hidden border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${SERVICES_STOCK_BACKGROUND_URL})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,_rgba(250,247,241,0.95),_rgba(248,245,239,0.9))] dark:bg-[linear-gradient(180deg,_rgba(54,45,40,0.84),_rgba(37,49,63,0.72))]"
      />

      <div className="mx-auto max-w-7xl">
        <h2
          id="home-services-title"
          className="bg-stone-50/92 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 shadow-sm dark:bg-stone-900/90 dark:text-amber-100"
        >
          {title}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <RevealOnScroll
              as="article"
              key={item.title}
              delayMs={80 + index * 90}
              className="bg-stone-50/96 flex h-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-stone-200/90 p-8 shadow-[0_18px_45px_rgba(28,25,23,0.06)] backdrop-blur-[1px] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_55px_rgba(28,25,23,0.1)] dark:border-stone-500/65 dark:bg-stone-800/75 dark:shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-2xl font-bold text-stone-950 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-4 flex-1 text-base leading-7 text-stone-800 dark:text-stone-100">
                {item.description}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
