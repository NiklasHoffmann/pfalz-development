import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeAudienceSectionProps {
  audiencesTitle: string;
  audiences: string[];
  whyMeTitle: string;
  whyMeItems: string[];
}

const audienceFallbackImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1400&q=80',
];

function getAudienceBackgroundImage(audience: string, index: number): string {
  const value = audience.toLowerCase();

  if (value.includes('ferien') || value.includes('gastgeber') || value.includes('host')) {
    return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80';
  }

  if (value.includes('restaurant') || value.includes('gastr')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80';
  }

  if (value.includes('winzer') || value.includes('wein') || value.includes('sekt')) {
    return 'https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?auto=format&fit=crop&w=1400&q=80';
  }

  if (value.includes('metzger') || value.includes('handwerk') || value.includes('craft')) {
    return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1400&q=80';
  }

  return audienceFallbackImages[index % audienceFallbackImages.length];
}

export function HomeAudienceSection({
  audiencesTitle,
  audiences,
  whyMeTitle,
  whyMeItems,
}: HomeAudienceSectionProps) {
  return (
    <>
      <RevealOnScroll
        as="section"
        id="zielgruppen"
        aria-labelledby="home-audiences-title"
        className="border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="home-audiences-title"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100"
          >
            {audiencesTitle}
          </h2>
          <ul
            className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            aria-label={audiencesTitle}
          >
            {audiences.map((item, index) => (
              <RevealOnScroll
                as="li"
                key={item}
                delayMs={70 + index * 55}
                className="relative min-h-56 overflow-hidden rounded-[1.25rem] border border-stone-300/70 bg-stone-900 px-6 py-7"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat [filter:brightness(0.78)_saturate(0.95)]"
                  style={{
                    backgroundImage: `url(${getAudienceBackgroundImage(item, index)})`,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/42 to-black/18"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.3),transparent_58%)]"
                />
                <div className="relative flex h-full items-end">
                  <p className="w-full rounded-xl border border-white/25 bg-black/68 px-3 py-2.5 text-xl font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,0,0.5)] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] backdrop-blur-[2px] sm:text-2xl">
                    {item}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </ul>
        </div>
      </RevealOnScroll>

      <RevealOnScroll
        as="section"
        aria-labelledby="home-why-title"
        className="bg-[linear-gradient(180deg,_rgba(246,240,231,0.7),_rgba(251,248,243,0.42))] px-4 py-20 dark:bg-[linear-gradient(180deg,_rgba(36,31,28,0.72),_rgba(30,37,45,0.45))] sm:px-6 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="home-why-title"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100"
          >
            {whyMeTitle}
          </h2>
          <ul
            className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            aria-label={whyMeTitle}
          >
            {whyMeItems.map((item, index) => (
              <RevealOnScroll
                as="li"
                key={item}
                delayMs={110 + index * 70}
                className="min-w-0"
              >
                <div className="mb-4 h-10 w-10 rounded-full border border-amber-500/45 bg-amber-500/10" />
                <p className="text-base leading-7 text-stone-800 dark:text-stone-100">
                  {item}
                </p>
              </RevealOnScroll>
            ))}
          </ul>
        </div>
      </RevealOnScroll>
    </>
  );
}
