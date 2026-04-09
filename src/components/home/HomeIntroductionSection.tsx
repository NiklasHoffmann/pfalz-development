import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeIntroductionSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  conclusion: string;
}

export function HomeIntroductionSection({
  eyebrow,
  title,
  description,
  points,
  conclusion,
}: HomeIntroductionSectionProps) {
  return (
    <RevealOnScroll
      as="section"
      aria-labelledby="home-introduction-title"
      className="surface-section-muted border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
            {eyebrow}
          </p>
          <h2
            id="home-introduction-title"
            className="mx-auto mt-5 max-w-4xl text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-stone-800 dark:text-stone-100 sm:text-lg">
            {description}
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
            {conclusion}
          </p>
        </div>

        <ul
          className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-label={title}
        >
          {points.map((point, index) => (
            <RevealOnScroll
              as="li"
              key={point}
              delayMs={90 + index * 70}
              className={`min-w-0 ${index === 1 ? 'xl:-translate-y-4' : ''}`}
            >
              <div className="h-full rounded-[1.5rem] border border-amber-200/75 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.9))] p-5 shadow-[0_18px_44px_rgba(120,53,15,0.08)] dark:border-amber-300/20 dark:bg-[linear-gradient(180deg,rgba(41,37,36,0.92),rgba(28,25,23,0.84))] dark:shadow-[0_20px_48px_rgba(0,0,0,0.24)] sm:p-6">
                <div className="flex items-center justify-center gap-3 xl:justify-start">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/12 text-sm font-bold text-amber-800 dark:border-amber-300/35 dark:bg-amber-300/10 dark:text-amber-100">
                    0{index + 1}
                  </div>
                  <div aria-hidden="true" className="h-px w-16 bg-amber-500/35 dark:bg-amber-300/30" />
                </div>
                <p className="mt-5 text-center text-base leading-7 text-stone-800 dark:text-stone-100 xl:text-left">
                  {point}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </ul>
      </div>
    </RevealOnScroll>
  );
}
