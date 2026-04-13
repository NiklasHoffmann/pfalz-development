'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ContactDetails, ContactFormCopy } from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { buildWhatsAppHref } from '@/lib/whatsapp';

const ContactForm = dynamic(
  () =>
    import('@/components/ui/ContactForm').then((module) => module.ContactForm),
  {
    loading: () => null,
  }
);

const Modal = dynamic(() => import('@/components/ui/Modal'), {
  loading: () => null,
});

interface HomeContactSectionProps {
  navLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  tertiaryCta: string;
  openFormLabel: string;
  whatsAppMessage: string;
  privacyHref: string;
  form: ContactFormCopy;
  details: ContactDetails;
}

export function HomeContactSection({
  navLabel,
  title,
  description,
  primaryCta,
  secondaryCta,
  tertiaryCta,
  openFormLabel,
  whatsAppMessage,
  privacyHref,
  form,
  details,
}: HomeContactSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasRequestedFormUi, setHasRequestedFormUi] = useState(false);
  const [formSessionKey, setFormSessionKey] = useState(0);
  const contactDialogId = 'contact-form-dialog';

  const phoneHref = details.phoneValue.replace(/\s+/g, '');
  const phoneDisplay =
    phoneHref.startsWith('0') && phoneHref.length > 5
      ? `${phoneHref.slice(0, 5)} ${phoneHref.slice(5)}`
      : details.phoneValue;
  const whatsAppHref = buildWhatsAppHref(
    details.whatsAppValue,
    whatsAppMessage
  );
  const whatsAppDisplay = details.whatsAppValue;

  function handleFormOpenChange(open: boolean) {
    if (open) {
      setHasRequestedFormUi(true);
    }

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
      className="border-t border-stone-200/85 px-4 py-20 dark:border-stone-700/80 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-amber-200/80 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_32%),linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.9))] px-6 py-8 shadow-[0_24px_72px_rgba(120,53,15,0.1)] dark:border-amber-300/20 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,rgba(41,37,36,0.94),rgba(28,25,23,0.88))] dark:shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:px-8 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-800 dark:text-amber-200">
          {navLabel}
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="min-w-0">
            <h2
              id="home-contact-title"
              className="max-w-3xl text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 md:text-4xl"
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
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border border-emerald-500/65 bg-emerald-100/85 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-[0_1px_2px_rgba(6,95,70,0.12)] transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-300/60 dark:bg-emerald-950/50 dark:text-emerald-50 dark:hover:bg-emerald-900/70 sm:w-auto"
              >
                {tertiaryCta}
              </a>
              <button
                type="button"
                onClick={() => {
                  setHasRequestedFormUi(true);
                  setIsFormOpen(true);
                }}
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

          <div className="bg-white/72 dark:bg-stone-950/38 rounded-[1.5rem] border border-white/65 p-5 shadow-[0_14px_36px_rgba(28,25,23,0.08)] backdrop-blur-sm dark:border-stone-600/70 sm:p-6">
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
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">
                  {details.whatsAppLabel}
                </p>
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-sm font-semibold text-stone-900 hover:underline dark:text-stone-50 sm:text-base"
                >
                  {whatsAppDisplay}
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

        {hasRequestedFormUi ? (
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
            <ContactForm
              key={formSessionKey}
              messages={form}
              privacyHref={privacyHref}
            />
          </Modal>
        ) : null}
      </div>
    </RevealOnScroll>
  );
}
