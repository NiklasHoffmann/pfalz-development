'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PackageItem } from './types';
import Modal from '@/components/ui/Modal';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomePackagesSectionProps {
  title: string;
  note: string;
  detailsCta: string;
  modalIncludesTitle: string;
  items: PackageItem[];
}

function splitPriceFromDescription(description: string): {
  priceLine: string | null;
  details: string;
} {
  const trimmed = description.trim();
  const match = trimmed.match(/^(Ab\s[\d.,]+\sEUR\.|From\sEUR\s[\d.,]+\.)\s*/i);

  if (!match) {
    return { priceLine: null, details: trimmed };
  }

  const priceLine = match[1].trim();
  const details = trimmed.slice(match[0].length).trim();

  return { priceLine, details };
}

export function HomePackagesSection({
  title,
  note,
  detailsCta,
  modalIncludesTitle,
  items,
}: HomePackagesSectionProps) {
  const packageDialogId = 'package-details-dialog';
  const closeTimeoutRef = useRef<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePackageName, setActivePackageName] = useState<string | null>(
    null
  );

  const activePackage = useMemo(
    () => items.find((item) => item.name === activePackageName) ?? null,
    [items, activePackageName]
  );

  const activePriceAndDetails = useMemo(() => {
    if (!activePackage) {
      return null;
    }

    return splitPriceFromDescription(activePackage.description);
  }, [activePackage]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <RevealOnScroll
      as="section"
      id="preise"
      className="surface-section-muted border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-100">
            {title}
          </p>
          <div
            aria-hidden="true"
            className="mx-auto mt-6 h-px w-24 bg-amber-500/35 dark:bg-amber-300/30"
          />
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const { priceLine, details } = splitPriceFromDescription(
              item.description
            );
            const normalizedPriceLine = priceLine
              ? priceLine.replace(/^Ab\b/, 'ab').replace(/^From\b/, 'from')
              : null;

            return (
              <RevealOnScroll
                as="article"
                key={item.name}
                delayMs={80 + index * 90}
                className={`flex h-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] border p-8 text-center ${
                  index === 1
                    ? 'border-amber-300 bg-[linear-gradient(180deg,_#fff7e6,_#f6e7c8)] shadow-[0_20px_70px_rgba(245,158,11,0.18)] dark:border-amber-500 dark:bg-[linear-gradient(180deg,_#5c2b0e,_#3d1d09)] md:scale-[1.01]'
                    : 'border-stone-200/90 bg-stone-50/95 dark:border-stone-700 dark:bg-stone-900'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <h3
                    className={`text-2xl font-bold ${
                      index === 1
                        ? 'text-stone-950 dark:text-amber-50'
                        : 'text-stone-950 dark:text-white'
                    }`}
                  >
                    {item.name}
                  </h3>
                  {normalizedPriceLine ? (
                    <p
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.04em] ${
                        index === 1
                          ? 'border-amber-500/45 bg-amber-100/70 text-stone-900 dark:border-amber-300/45 dark:bg-amber-200/15 dark:text-amber-100'
                          : 'border-stone-300/80 bg-white text-stone-800 dark:border-stone-500/80 dark:bg-stone-800 dark:text-stone-100'
                      }`}
                    >
                      {normalizedPriceLine}
                    </p>
                  ) : null}
                </div>
                <p
                  className={`mt-5 flex-1 text-base leading-7 ${
                    index === 1
                      ? 'text-stone-800 dark:text-amber-100'
                      : 'text-stone-800 dark:text-stone-100'
                  }`}
                >
                  {details}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (closeTimeoutRef.current !== null) {
                      window.clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }

                    setActivePackageName(item.name);
                    setIsModalOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-controls={packageDialogId}
                  aria-expanded={isModalOpen && activePackageName === item.name}
                  className={`mt-6 inline-flex items-center self-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    index === 1
                      ? 'border-amber-500/50 bg-amber-100/60 text-stone-900 hover:bg-amber-100 focus-visible:ring-amber-500 focus-visible:ring-offset-amber-100 dark:border-amber-300/50 dark:bg-amber-100/10 dark:text-amber-100 dark:hover:bg-amber-100/20 dark:focus-visible:ring-amber-300 dark:focus-visible:ring-offset-stone-900'
                      : 'border-stone-300/90 bg-white text-stone-900 hover:bg-stone-100 focus-visible:ring-stone-500 focus-visible:ring-offset-white dark:border-stone-500/90 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 dark:focus-visible:ring-stone-300 dark:focus-visible:ring-offset-stone-900'
                  }`}
                >
                  {detailsCta}
                </button>
              </RevealOnScroll>
            );
          })}
        </div>
        <p className="mx-auto mt-14 max-w-3xl text-center text-sm leading-6 text-stone-700 dark:text-stone-200 sm:text-base sm:leading-7">
          {note}
        </p>
      </div>
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsModalOpen(true);
            return;
          }

          setIsModalOpen(false);

          if (closeTimeoutRef.current !== null) {
            window.clearTimeout(closeTimeoutRef.current);
          }

          // Keep content mounted until the close animation fully finishes.
          closeTimeoutRef.current = window.setTimeout(() => {
            setActivePackageName(null);
            closeTimeoutRef.current = null;
          }, 360);
        }}
        title={activePackage?.name}
        description={activePriceAndDetails?.priceLine ?? undefined}
        size="lg"
        contentId={packageDialogId}
      >
        {activePackage && activePriceAndDetails ? (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-stone-700 dark:text-stone-200 sm:text-base">
              {activePriceAndDetails.details}
            </p>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-amber-700 dark:text-amber-200">
                {modalIncludesTitle}
              </h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700 dark:text-stone-200 sm:text-base">
                {activePackage.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-300" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </RevealOnScroll>
  );
}
