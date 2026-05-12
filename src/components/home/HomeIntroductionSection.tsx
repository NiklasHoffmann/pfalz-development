import Image from 'next/image';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeIntroductionSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  conclusion: string;
  resources?: {
    intro: string;
    items: {
      label: string;
      href: string;
    }[];
  };
  portrait?: {
    src: string;
    alt: string;
    name: string;
    label: string;
  };
}

export function HomeIntroductionSection({
  eyebrow,
  title,
  description,
  points,
  conclusion,
  resources,
  portrait,
}: HomeIntroductionSectionProps) {
  return (
    <RevealOnScroll
      as="section"
      aria-labelledby="home-introduction-title"
      className="surface-section-muted border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`mx-auto grid items-center gap-10 ${portrait ? 'lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-12' : ''}`}
        >
          {portrait ? (
            <RevealOnScroll
              className="relative mx-auto w-full max-w-[17rem] sm:max-w-[19rem] lg:max-w-[21rem]"
              delayMs={60}
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/85 bg-stone-950 shadow-[0_24px_60px_rgba(28,25,23,0.18)] dark:border-stone-700/80 dark:shadow-[0_28px_70px_rgba(0,0,0,0.34)]">
                <div className="absolute inset-x-0 top-0 z-10 h-28 bg-[linear-gradient(180deg,rgba(12,10,9,0.42),transparent)]" />
                <div className="absolute inset-x-0 bottom-0 z-10 h-36 bg-[linear-gradient(180deg,transparent,rgba(12,10,9,0.78))]" />
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  width={960}
                  height={1200}
                  sizes="(max-width: 640px) min(100vw - 3rem, 17rem), (max-width: 1024px) 19rem, 21rem"
                  className="aspect-[4/5] h-full w-full scale-[1.06] object-cover object-[center_16%] [transform:scaleX(-1)]"
                />
                <div className="border-white/18 bg-stone-950/82 absolute inset-x-4 bottom-4 z-20 rounded-[1rem] border px-4 py-3 text-white shadow-[0_12px_24px_rgba(0,0,0,0.32)] backdrop-blur-md">
                  <p className="text-base font-semibold leading-tight tracking-[0.01em] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]">
                    {portrait.name}
                  </p>
                  <p className="mt-1.5 text-[0.74rem] font-medium uppercase tracking-[0.2em] text-amber-50 [text-shadow:0_1px_3px_rgba(0,0,0,0.78)]">
                    {portrait.label}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ) : null}

          <div
            className={
              portrait
                ? 'min-w-0 text-center lg:text-left'
                : 'mx-auto max-w-4xl text-center'
            }
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
              {eyebrow}
            </p>
            <h2
              id="home-introduction-title"
              className={`mt-5 text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl ${portrait ? 'mx-auto max-w-3xl lg:mx-0' : 'mx-auto max-w-4xl'}`}
            >
              {title}
            </h2>
            <p
              className={`mt-5 text-base leading-8 text-stone-800 dark:text-stone-100 sm:text-lg ${portrait ? 'mx-auto max-w-3xl lg:mx-0' : 'mx-auto max-w-3xl'}`}
            >
              {description}
            </p>
            <p
              className={`mt-5 text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base ${portrait ? 'mx-auto max-w-3xl lg:mx-0' : 'mx-auto max-w-3xl'}`}
            >
              {conclusion}
            </p>
            {resources ? (
              <div
                className={`mt-6 ${portrait ? 'mx-auto max-w-3xl lg:mx-0' : 'mx-auto max-w-3xl'}`}
              >
                <p className="text-sm leading-6 text-stone-700 dark:text-stone-200 sm:text-base">
                  {resources.intro}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {resources.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white/92 inline-flex items-center rounded-full border border-stone-300/80 px-4 py-2 text-sm font-medium text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500/55 hover:bg-white dark:border-stone-600/80 dark:bg-stone-900/70 dark:text-stone-50 dark:hover:border-amber-300/55 dark:hover:bg-stone-800"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <ul
          className={`card-grid-balance-md-xl mx-auto mt-10 grid gap-4 [--card-grid-gap:1rem] md:grid-cols-2 xl:grid-cols-3 ${portrait ? 'max-w-6xl' : 'max-w-5xl'}`}
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
                  <div className="bg-amber-500/12 inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/40 text-sm font-bold text-amber-800 dark:border-amber-300/35 dark:bg-amber-300/10 dark:text-amber-100">
                    0{index + 1}
                  </div>
                  <div
                    aria-hidden="true"
                    className="h-px w-16 bg-amber-500/35 dark:bg-amber-300/30"
                  />
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
