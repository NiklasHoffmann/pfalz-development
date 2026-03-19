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
      className="border-y border-stone-200/90 bg-[linear-gradient(180deg,_rgba(250,247,241,0.9),_rgba(243,236,226,0.95))] py-16 dark:border-stone-700/80 dark:bg-[linear-gradient(180deg,_rgba(37,31,27,0.94),_rgba(22,30,40,0.94))] sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
            {audiencesTitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {audiences.map((item, index) => (
              <RevealOnScroll
                as="span"
                key={item}
                delayMs={70 + index * 55}
                className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              >
                {item}
              </RevealOnScroll>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
            {whyMeTitle}
          </p>
          <div className="mt-6 grid gap-4">
            {whyMeItems.map((item, index) => (
              <RevealOnScroll
                as="div"
                key={item}
                delayMs={110 + index * 70}
                className="bg-white/92 min-w-0 rounded-2xl border border-stone-200/90 px-5 py-4 text-sm leading-6 text-stone-800 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              >
                {item}
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
