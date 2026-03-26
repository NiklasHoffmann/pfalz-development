import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeAudienceSectionProps {
  audiencesTitle: string;
  audiences: string[];
  whyMeTitle: string;
  whyMeItems: string[];
}

export function HomeAudienceSection({
  audiencesTitle,
  audiences,
  whyMeTitle,
  whyMeItems,
}: HomeAudienceSectionProps) {
  return (
    <RevealOnScroll
      as="section"
      aria-labelledby="home-audiences-title"
      className="border-t border-stone-200/85 px-4 pb-16 pt-10 dark:border-stone-700/80 sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <h2
            id="home-audiences-title"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100"
          >
            {audiencesTitle}
          </h2>
          <ul
            className="mt-10 flex flex-wrap gap-3"
            aria-label={audiencesTitle}
          >
            {audiences.map((item, index) => (
              <RevealOnScroll
                as="li"
                key={item}
                delayMs={70 + index * 55}
                className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              >
                {item}
              </RevealOnScroll>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
            {whyMeTitle}
          </h2>
          <ul className="mt-8 grid gap-4" aria-label={whyMeTitle}>
            {whyMeItems.map((item, index) => (
              <RevealOnScroll
                as="li"
                key={item}
                delayMs={110 + index * 70}
                className="bg-white/92 min-w-0 rounded-2xl border border-stone-200/90 px-5 py-4 text-sm leading-6 text-stone-800 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              >
                {item}
              </RevealOnScroll>
            ))}
          </ul>
        </div>
      </div>
    </RevealOnScroll>
  );
}
