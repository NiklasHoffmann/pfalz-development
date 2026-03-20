interface HomeHeroSectionProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  trustTitle: string;
  trustItems: string[];
}

export function HomeHeroSection({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  trustTitle,
  trustItems,
}: HomeHeroSectionProps) {
  return (
    <section
      id="start"
      aria-labelledby="home-hero-title"
      className="surface-hero relative overflow-hidden border-b border-stone-300/70 pt-[5.75rem] dark:border-stone-700/80 sm:pt-[6.25rem] md:pt-[5.5rem]"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:pb-24 lg:pt-14">
        <div className="min-w-0 max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-stone-700 dark:text-stone-100">
            {eyebrow}
          </p>
          <h1
            id="home-hero-title"
            className="max-w-4xl text-4xl font-black leading-[0.96] tracking-tight text-stone-950 dark:text-stone-50 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {headline}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-800 dark:text-stone-100 sm:text-lg sm:leading-8">
            {subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#kontakt"
              className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300 dark:focus-visible:ring-amber-200 sm:w-auto"
            >
              {primaryCta}
            </a>
            <a
              href="#leistungen"
              className="inline-flex w-full items-center justify-center rounded-full border border-stone-400/80 bg-stone-50/90 px-6 py-3 text-sm font-semibold text-stone-950 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-stone-700/90 dark:bg-stone-800/85 dark:text-stone-100 dark:hover:bg-stone-700 dark:focus-visible:ring-amber-200 sm:w-auto"
            >
              {secondaryCta}
            </a>
          </div>
        </div>

        <div className="bg-white/82 dark:bg-stone-800/82 min-w-0 overflow-hidden rounded-[2rem] border border-stone-200/90 p-5 shadow-[0_30px_80px_rgba(28,25,23,0.14)] backdrop-blur dark:border-stone-700/80 dark:shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
            {trustTitle}
          </h2>
          <ul className="mt-6 grid gap-4" aria-label={trustTitle}>
            {trustItems.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-stone-200 bg-stone-100/90 px-4 py-4 text-sm leading-6 text-stone-800 dark:border-stone-700/80 dark:bg-stone-700/55 dark:text-stone-100"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
