import { LazyContactForm } from './LazyContactForm';
import type { ContactDetails } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeContactSectionProps {
  navLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  details: ContactDetails;
}

export function HomeContactSection({
  navLabel,
  title,
  description,
  primaryCta,
  secondaryCta,
  details,
}: HomeContactSectionProps) {
  const phoneHref = details.phoneValue.replace(/\s+/g, '');
  const phoneDisplay =
    phoneHref.startsWith('0') && phoneHref.length > 5
      ? `${phoneHref.slice(0, 5)} ${phoneHref.slice(5)}`
      : details.phoneValue;

  return (
    <RevealOnScroll
      as="section"
      id="kontakt"
      className="scroll-mt-[4rem] px-4 pb-16 sm:scroll-mt-[4.5rem] sm:px-6 sm:pb-20 md:scroll-mt-[4.25rem] lg:px-10 lg:pb-24"
    >
      <div className="surface-contact dark:border-amber-300/18 mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-5 py-8 text-stone-50 dark:border sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200 dark:text-amber-200">
          {navLabel}
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="min-w-0">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-200/95 dark:text-stone-200/95">
              {description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={`mailto:${details.emailValue}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-200 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300 sm:w-auto"
              >
                {primaryCta}
              </a>
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:bg-white/10 dark:border-stone-600/90 dark:text-stone-50 dark:hover:bg-stone-700 sm:w-auto"
              >
                {secondaryCta}
              </a>
            </div>

            <div className="mt-8 grid gap-4 border-t border-white/15 pt-8 dark:border-stone-600/70">
              <div className="rounded-2xl bg-white/10 px-5 py-4 dark:bg-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-200 dark:text-stone-200">
                  {details.personLabel}
                </p>
                <p className="mt-3 break-words text-base font-semibold text-stone-50">
                  {details.ownerName}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-5 py-4 dark:bg-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-200 dark:text-stone-200">
                  {details.emailLabel}
                </p>
                <a
                  href={`mailto:${details.emailValue}`}
                  className="mt-3 block break-all text-sm font-semibold text-stone-50 hover:underline sm:text-base"
                >
                  {details.emailValue}
                </a>
              </div>
              <div className="rounded-2xl bg-white/10 px-5 py-4 dark:bg-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-200 dark:text-stone-200">
                  {details.phoneLabel}
                </p>
                <a
                  href={`tel:${phoneHref}`}
                  className="mt-3 block break-all text-sm font-semibold text-stone-50 hover:underline sm:text-base"
                >
                  {phoneDisplay}
                </a>
              </div>
              <div className="rounded-2xl bg-white/10 px-5 py-4 dark:bg-white/10">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-200 dark:text-stone-200">
                  {details.addressLabel}
                </p>
                <div className="mt-3 space-y-1 break-words text-base font-semibold text-stone-50">
                  {details.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-stone-200 dark:text-stone-200">
              {details.regionNote}
            </p>
          </div>

          <LazyContactForm />
        </div>
      </div>
    </RevealOnScroll>
  );
}
