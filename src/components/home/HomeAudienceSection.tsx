import Image from 'next/image';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeAudienceSectionProps {
  audiencesTitle: string;
  audiences: string[];
  whyMeTitle: string;
  whyMeItems: string[];
}

const audienceFallbackImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=65',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=65',
  'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1200&q=65',
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=65',
];

const AUDIENCE_IMAGE_SIZES =
  '(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 2.5rem), 26rem';

function getAudienceBackgroundImage(audience: string, index: number): string {
  const value = audience.toLowerCase();

  if (
    value.includes('ferien') ||
    value.includes('gastgeber') ||
    value.includes('host')
  ) {
    return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=65';
  }

  if (value.includes('restaurant') || value.includes('gastr')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=65';
  }

  if (
    value.includes('winzer') ||
    value.includes('wein') ||
    value.includes('sekt')
  ) {
    return 'https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?auto=format&fit=crop&w=1200&q=65';
  }

  if (
    value.includes('metzger') ||
    value.includes('handwerk') ||
    value.includes('craft')
  ) {
    return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=65';
  }

  if (
    value.includes('dienstleister') ||
    value.includes('service provider') ||
    value.includes('smaller compan') ||
    value.includes('unternehmen') ||
    value.includes('company') ||
    value.includes('dinschdleischder') ||
    value.includes('unnernehme')
  ) {
    return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=65';
  }

  if (
    value.includes('individuelle') ||
    value.includes('custom website') ||
    value.includes('website-projekte') ||
    value.includes('website projects') ||
    value.includes('projekde')
  ) {
    return 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=65';
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
            className="max-w-3xl text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl"
          >
            {audiencesTitle}
          </h2>
          <ul
            className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            aria-label={audiencesTitle}
          >
            {audiences.map((item, index) => (
              <RevealOnScroll
                as="li"
                key={item}
                delayMs={70 + index * 55}
                className="relative min-h-56 overflow-hidden rounded-[1.25rem] border border-stone-300/70 bg-stone-900 px-6 py-7 dark:border-stone-500/60"
              >
                <Image
                  src={getAudienceBackgroundImage(item, index)}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={AUDIENCE_IMAGE_SIZES}
                  quality={50}
                  className="absolute inset-0 h-full w-full object-cover [filter:brightness(0.78)_saturate(0.95)] dark:[filter:brightness(0.88)_saturate(1.02)]"
                />
                <div
                  aria-hidden="true"
                  className="from-black/72 via-black/42 to-black/18 dark:from-black/58 dark:via-black/26 dark:to-black/8 absolute inset-0 bg-gradient-to-t"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.3),transparent_58%)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.2),transparent_62%)]"
                />
                <div className="relative flex h-full items-end">
                  <p className="bg-black/68 w-full rounded-xl border border-white/25 px-3 py-2.5 text-xl font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,0,0.5)] backdrop-blur-[2px] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] dark:border-white/35 dark:bg-stone-900/50 dark:shadow-[0_10px_22px_rgba(0,0,0,0.34)] sm:text-2xl">
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
        className="surface-section-muted border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="home-why-title"
              className="text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 md:text-4xl"
            >
              {whyMeTitle}
            </h2>
            <div
              aria-hidden="true"
              className="mx-auto mt-6 h-px w-24 bg-amber-500/35 dark:bg-amber-300/30"
            />
          </div>
          <ul
            className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2"
            aria-label={whyMeTitle}
          >
            {whyMeItems.map((item, index) => (
              <RevealOnScroll
                as="li"
                key={item}
                delayMs={110 + index * 70}
                className={`min-w-0 ${index % 2 === 1 ? 'md:translate-y-4' : ''}`}
              >
                <div className="bg-white/82 h-full rounded-[1.5rem] border border-stone-200/85 p-6 shadow-[0_16px_34px_rgba(28,25,23,0.06)] dark:border-stone-700/75 dark:bg-stone-900/55 dark:shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-500/12 inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 text-sm font-bold text-amber-800 dark:border-amber-300/35 dark:bg-amber-300/10 dark:text-amber-100">
                      0{index + 1}
                    </div>
                    <div
                      aria-hidden="true"
                      className="h-px flex-1 bg-amber-500/30 dark:bg-amber-300/30"
                    />
                  </div>
                  <p className="mt-5 text-base leading-7 text-stone-800 dark:text-stone-100">
                    {item}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </ul>
        </div>
      </RevealOnScroll>
    </>
  );
}
