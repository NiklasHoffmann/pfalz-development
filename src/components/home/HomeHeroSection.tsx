import Image from 'next/image';

interface HomeHeroSectionProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  trustTitle: string;
  trustItems: string[];
}

const HERO_TRUST_STOCK_BACKGROUND_URL =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70';

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
      className="surface-hero relative flex min-h-screen items-center overflow-hidden border-b border-stone-300/70 pt-[6.5rem] dark:border-stone-700/80 sm:pt-[7rem]"
    >
      <div className="bg-amber-500/12 pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24 lg:pt-14">
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
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href="#kontakt"
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300 dark:focus-visible:ring-amber-200"
            >
              {primaryCta}
            </a>
            <a
              href="#leistungen"
              className="inline-flex items-center justify-center rounded-full border border-stone-400/80 bg-stone-50/90 px-6 py-3 text-sm font-semibold text-stone-950 shadow-sm backdrop-blur transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-stone-700/90 dark:bg-stone-800/85 dark:text-stone-100 dark:hover:bg-stone-700 dark:focus-visible:ring-amber-200"
            >
              {secondaryCta}
            </a>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -left-4 -top-5 h-20 w-20 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="bg-white/82 dark:bg-stone-800/82 relative overflow-hidden rounded-[2rem] border border-stone-200/90 p-5 shadow-[0_30px_80px_rgba(28,25,23,0.14)] backdrop-blur dark:border-stone-700/80 dark:shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-6">
            <Image
              src={HERO_TRUST_STOCK_BACKGROUND_URL}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(max-width: 1024px) calc(100vw - 2.5rem), 42vw"
              quality={60}
              className="absolute inset-0 h-full w-full object-cover opacity-24 dark:opacity-20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.86),_rgba(248,245,239,0.94))] dark:bg-[linear-gradient(180deg,_rgba(28,25,23,0.86),_rgba(28,25,23,0.94))]"
            />

            <h2 className="relative z-10 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
              {trustTitle}
            </h2>
            <ul
              className="relative z-10 mt-6 grid gap-4"
              aria-label={trustTitle}
            >
              {trustItems.map((item) => (
                <li
                  key={item}
                  className="bg-stone-100/96 dark:bg-stone-700/72 rounded-2xl border border-stone-200 px-4 py-4 text-sm leading-6 text-stone-800 dark:border-stone-700/80 dark:text-stone-100"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
