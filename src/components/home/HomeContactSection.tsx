'use client';

import { useState } from 'react';
import type { ContactDetails } from './types';
import { ContactForm } from '@/components/ui/ContactForm';
import Modal from '@/components/ui/Modal';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface HomeContactSectionProps {
  navLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  openFormLabel: string;
  details: ContactDetails;
}

export function HomeContactSection({
  navLabel,
  title,
  description,
  primaryCta,
  secondaryCta,
  openFormLabel,
  details,
}: HomeContactSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSessionKey, setFormSessionKey] = useState(0);
  const contactDialogId = 'contact-form-dialog';

  const phoneHref = details.phoneValue.replace(/\s+/g, '');
  const phoneDisplay =
    phoneHref.startsWith('0') && phoneHref.length > 5
      ? `${phoneHref.slice(0, 5)} ${phoneHref.slice(5)}`
      : details.phoneValue;

  function handleFormOpenChange(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      setFormSessionKey((current) => current + 1);
    }
  }

  return (
    <RevealOnScroll
      as="section"
      id="kontakt"
      aria-labelledby="home-contact-title"
      className="surface-section-muted px-4 py-20 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-200">
          {navLabel}
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="min-w-0">
            <h2
              id="home-contact-title"
              className="text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 md:text-4xl"
            >
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700 dark:text-stone-200">
              {description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={`mailto:${details.emailValue}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300 sm:w-auto"
              >
                {primaryCta}
              </a>
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white/90 px-6 py-3 text-sm font-semibold text-stone-900 transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-white dark:border-stone-600/90 dark:bg-stone-800/90 dark:text-stone-50 dark:hover:bg-stone-700 sm:w-auto"
              >
                {secondaryCta}
              </a>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                aria-haspopup="dialog"
                aria-controls={contactDialogId}
                aria-expanded={isFormOpen}
                className="inline-flex w-full items-center justify-center rounded-full border border-amber-500/65 bg-amber-100/80 px-6 py-3 text-sm font-semibold text-stone-900 shadow-[0_1px_2px_rgba(146,64,14,0.08)] transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-amber-100 dark:border-amber-300/65 dark:bg-amber-950/55 dark:text-amber-50 dark:hover:bg-amber-900/70 sm:w-auto"
              >
                {openFormLabel}
              </button>
            </div>

            <p className="mt-8 text-sm text-stone-600 dark:text-stone-300">
              {details.regionNote}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-stone-300/70 bg-white/65 p-5 shadow-[0_10px_30px_rgba(28,25,23,0.07)] backdrop-blur-sm dark:border-stone-600/80 dark:bg-stone-900/45 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">
                  {details.personLabel}
                </p>
                <p className="mt-2 break-words text-base font-semibold text-stone-900 dark:text-stone-50">
                  {details.ownerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">
                  {details.emailLabel}
                </p>
                <a
                  href={`mailto:${details.emailValue}`}
                  className="mt-2 block break-all text-sm font-semibold text-stone-900 hover:underline dark:text-stone-50 sm:text-base"
                >
                  {details.emailValue}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">
                  {details.phoneLabel}
                </p>
                <a
                  href={`tel:${phoneHref}`}
                  className="mt-2 block break-all text-sm font-semibold text-stone-900 hover:underline dark:text-stone-50 sm:text-base"
                >
                  {phoneDisplay}
                </a>
              </div>
              <address className="not-italic">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">
                  {details.addressLabel}
                </p>
                <div className="mt-2 space-y-1 break-words text-base font-semibold text-stone-900 dark:text-stone-50">
                  {details.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </address>
            </div>
          </div>
        </div>

        <Modal
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          screenReaderTitle={openFormLabel}
          screenReaderDescription={title}
          size="xl"
          contentId={contactDialogId}
          contentClassName="overflow-hidden rounded-[1.75rem] bg-white p-0 shadow-[0_28px_90px_rgba(0,0,0,0.22)] dark:bg-stone-800 dark:shadow-[0_30px_100px_rgba(0,0,0,0.52)]"
          scrollBody={false}
        >
          <ContactForm key={formSessionKey} />
        </Modal>
      </div>
    </RevealOnScroll>
  );
}
