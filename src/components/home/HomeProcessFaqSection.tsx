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
    <RevealOnScroll
      as="section"
      id="ablauf"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-200">
            {processTitle}
          </p>
          <div className="mt-10 grid gap-4">
            {processSteps.map((step, index) => (
              <RevealOnScroll
                as="div"
                key={`${step}-${index}`}
                delayMs={80 + index * 75}
                className="bg-white/94 dark:bg-stone-800/82 flex min-w-0 items-start gap-4 overflow-hidden rounded-2xl border border-stone-200/90 px-5 py-4 shadow-sm dark:border-stone-700/80"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-bold text-stone-50 dark:bg-amber-400 dark:text-stone-950">
                  {index + 1}
                </span>
                <p className="pt-2 text-base font-medium text-stone-800 dark:text-stone-100">
                  {step}
                </p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-200">
            {faqTitle}
          </p>
          <div className="mt-10 grid gap-4">
            {faqItems.map((item, index) => (
              <RevealOnScroll
                as="article"
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
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
