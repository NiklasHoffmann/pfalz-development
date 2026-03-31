import type { FaqItem } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeProcessFaqSectionProps {
  processTitle: string;
  processSteps: string[];
  faqTitle: string;
  faqItems: FaqItem[];
}

export function HomeProcessFaqSection({
  processTitle,
  processSteps,
  faqTitle,
  faqItems,
}: HomeProcessFaqSectionProps) {
  return (
    <>
      <RevealOnScroll
        as="section"
        id="ablauf"
        aria-labelledby="home-process-title"
        className="border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="home-process-title"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-200"
          >
            {processTitle}
          </h2>
          <ol
            className="mt-12 grid gap-8 md:grid-cols-3"
            aria-label={processTitle}
          >
            {processSteps.map((step, index) => (
              <RevealOnScroll
                as="li"
                key={`${step}-${index}`}
                delayMs={80 + index * 75}
                className="relative min-w-0 pt-12"
              >
                <span className="pointer-events-none absolute -top-2 left-0 text-7xl font-black leading-none text-amber-500/20 dark:text-amber-300/15">
                  {index + 1}
                </span>
                <p className="text-base leading-7 text-stone-800 dark:text-stone-100">
                  {step}
                </p>
              </RevealOnScroll>
            ))}
          </ol>
        </div>
      </RevealOnScroll>

      <RevealOnScroll
        as="section"
        id="faq"
        aria-labelledby="home-faq-title"
        className="border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="home-faq-title"
            className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-200"
          >
            {faqTitle}
          </h2>
          <ul className="mt-10 grid gap-4" aria-label={faqTitle}>
            {faqItems.map((item, index) => (
              <RevealOnScroll
                as="li"
                key={`${item.question}-${index}`}
                delayMs={110 + index * 80}
                className="bg-white/92 dark:bg-stone-800/82 min-w-0 overflow-hidden rounded-2xl border border-stone-200/90 px-5 py-5 shadow-sm dark:border-stone-700/80"
              >
                <h3 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {item.question}
                </h3>
                <p className="mt-3 text-base leading-7 text-stone-800 dark:text-stone-100">
                  {item.answer}
                </p>
              </RevealOnScroll>
            ))}
          </ul>
        </div>
      </RevealOnScroll>
    </>
  );
}
