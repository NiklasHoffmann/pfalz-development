'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import type {
  ContactDetails,
  ContactEmailRevealCopy,
  ContactFormCopy,
} from './types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { TurnstileWidget } from '@/components/ui/TurnstileWidget';
import {
  readRevealedContact,
  type RevealedContactPayload,
  writeContactRevealUnlocked,
  writeRevealedContact,
} from '@/lib/contact-reveal';
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
  revealEnabled: boolean;
  whatsAppMessage: string;
  privacyHref: string;
  form: ContactFormCopy;
  emailReveal: ContactEmailRevealCopy;
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
  revealEnabled,
  whatsAppMessage,
  privacyHref,
  form,
  emailReveal,
  details,
}: HomeContactSectionProps) {
  const contactDialogId = 'contact-form-dialog';
  const turnstileSiteKey = revealEnabled
    ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
    : undefined;
  const hasProtectedContactReveal = Boolean(revealEnabled && turnstileSiteKey);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasRequestedFormUi, setHasRequestedFormUi] = useState(false);
  const [formSessionKey, setFormSessionKey] = useState(0);
  const [emailRevealToken, setEmailRevealToken] = useState<string | null>(null);
  const [emailRevealResetNonce, setEmailRevealResetNonce] = useState(0);
  const [emailRevealExecuteNonce, setEmailRevealExecuteNonce] = useState(0);
  const [emailRevealStatus, setEmailRevealStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });
  const [contactRevealAnnouncement, setContactRevealAnnouncement] =
    useState('');
  const [hasQueuedInitialReveal, setHasQueuedInitialReveal] = useState(false);
  const [revealedContact, setRevealedContact] =
    useState<RevealedContactPayload | null>(null);
  const [hasRestoredCachedContact, setHasRestoredCachedContact] = useState(
    () => !hasProtectedContactReveal
  );
  const [isContactRevealPending, setIsContactRevealPending] = useState(false);
  const [isEmailRevealSubmitting, setIsEmailRevealSubmitting] = useState(false);
  const [isExplicitRevealSubmitting, setIsExplicitRevealSubmitting] =
    useState(false);

  const fallbackPhoneValue = details.phoneValue.trim();
  const fallbackPhoneHref = fallbackPhoneValue
    ? fallbackPhoneValue.replace(/\s+/g, '')
    : '';
  const fallbackPhoneDisplay =
    fallbackPhoneHref.startsWith('0') && fallbackPhoneHref.length > 5
      ? `${fallbackPhoneHref.slice(0, 5)} ${fallbackPhoneHref.slice(5)}`
      : fallbackPhoneValue;
  const currentMailtoHref =
    revealedContact?.mailto ||
    (!hasProtectedContactReveal && details.emailValue
      ? `mailto:${details.emailValue}`
      : '');
  const currentEmailValue =
    revealedContact?.emailValue ||
    (!hasProtectedContactReveal ? details.emailValue.trim() : '');
  const currentPhoneHref =
    revealedContact?.phoneHref ||
    (!hasProtectedContactReveal ? fallbackPhoneHref : '');
  const currentPhoneDisplay =
    revealedContact?.phoneDisplay ||
    (!hasProtectedContactReveal ? fallbackPhoneDisplay : '');
  const currentWhatsAppValue =
    revealedContact?.whatsAppValue ||
    (!hasProtectedContactReveal ? details.whatsAppValue.trim() : '');
  const currentWhatsAppHref = currentWhatsAppValue
    ? buildWhatsAppHref(currentWhatsAppValue, whatsAppMessage)
    : '';
  const isContactReady = Boolean(revealedContact) || !hasProtectedContactReveal;
  const shouldShowContactLoading =
    hasProtectedContactReveal && !isContactReady && isContactRevealPending;

  function handleFormOpenChange(open: boolean) {
    if (open) {
      setHasRequestedFormUi(true);
    }

    setIsFormOpen(open);

    if (!open) {
      setFormSessionKey((current) => current + 1);
    }
  }

  const requestEmailReveal = useCallback(
    async (token: string, showErrors: boolean) => {
      setIsContactRevealPending(true);
      setIsEmailRevealSubmitting(true);
      setIsExplicitRevealSubmitting(showErrors);

      if (showErrors) {
        setEmailRevealStatus({
          type: null,
          message: '',
        });
      }

      try {
        const response = await fetch('/api/contact/reveal-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            turnstileToken: token,
          }),
        });

        const result = (await response.json()) as {
          success: boolean;
          data?: {
            mailto: string;
            emailValue: string;
            phoneHref: string;
            phoneDisplay: string;
            whatsAppValue: string;
          };
          error?: string;
        };

        if (
          !response.ok ||
          !result.success ||
          !result.data?.mailto ||
          !result.data.emailValue ||
          !result.data.phoneHref ||
          !result.data.phoneDisplay ||
          !result.data.whatsAppValue
        ) {
          if (result.error === 'Spam protection verification failed') {
            throw new Error(form.status.botCheckFailed);
          }

          throw new Error(result.error || emailReveal.unavailable);
        }

        setRevealedContact({
          mailto: result.data.mailto,
          emailValue: result.data.emailValue,
          phoneHref: result.data.phoneHref,
          phoneDisplay: result.data.phoneDisplay,
          whatsAppValue: result.data.whatsAppValue,
        });
        writeRevealedContact(result.data);
        setEmailRevealStatus({
          type: 'success',
          message: showErrors ? emailReveal.success : '',
        });
      } catch (error) {
        setRevealedContact(null);

        if (showErrors) {
          const message =
            error instanceof Error ? error.message : emailReveal.unavailable;

          setEmailRevealStatus({
            type: 'error',
            message,
          });
        }

        setEmailRevealToken(null);
        setEmailRevealResetNonce((current) => current + 1);
      } finally {
        setIsContactRevealPending(false);
        setIsEmailRevealSubmitting(false);
        setIsExplicitRevealSubmitting(false);
      }
    },
    [emailReveal.success, emailReveal.unavailable, form.status.botCheckFailed]
  );

  useEffect(() => {
    if (!hasProtectedContactReveal) {
      setIsContactRevealPending(false);
      setHasRestoredCachedContact(true);
      return;
    }

    const cachedContact = readRevealedContact();

    if (cachedContact) {
      setRevealedContact(cachedContact);
      setIsContactRevealPending(false);
    }

    setHasRestoredCachedContact(true);
  }, [hasProtectedContactReveal]);

  function prepareEmailReveal() {
    if (
      isContactReady ||
      isEmailRevealSubmitting ||
      !hasProtectedContactReveal
    ) {
      return;
    }

    if (emailRevealToken) {
      void requestEmailReveal(emailRevealToken, false);
      return;
    }

    setEmailRevealExecuteNonce((current) => current + 1);
  }

  async function handleEmailRevealRequest() {
    if (
      isContactReady ||
      isEmailRevealSubmitting ||
      !hasProtectedContactReveal
    ) {
      return;
    }

    setEmailRevealStatus({
      type: null,
      message: '',
    });

    if (!emailRevealToken) {
      setIsContactRevealPending(true);
      setEmailRevealExecuteNonce((current) => current + 1);
      return;
    }

    await requestEmailReveal(emailRevealToken, true);
  }

  useEffect(() => {
    if (
      !hasProtectedContactReveal ||
      isContactReady ||
      hasQueuedInitialReveal ||
      !hasRestoredCachedContact
    ) {
      return;
    }

    setIsContactRevealPending(true);
    setHasQueuedInitialReveal(true);
    setEmailRevealExecuteNonce((current) => current + 1);
  }, [
    hasProtectedContactReveal,
    hasQueuedInitialReveal,
    hasRestoredCachedContact,
    isContactReady,
  ]);

  useEffect(() => {
    if (
      !hasProtectedContactReveal ||
      !emailRevealToken ||
      revealedContact ||
      isEmailRevealSubmitting
    ) {
      return;
    }

    void requestEmailReveal(emailRevealToken, false);
  }, [
    emailRevealToken,
    hasProtectedContactReveal,
    isEmailRevealSubmitting,
    requestEmailReveal,
    revealedContact,
  ]);

  useEffect(() => {
    if (!hasProtectedContactReveal || !revealedContact) {
      return;
    }

    setContactRevealAnnouncement(emailReveal.success);
  }, [emailReveal.success, hasProtectedContactReveal, revealedContact]);

  useEffect(() => {
    if (emailRevealStatus.type !== 'error' || !emailRevealStatus.message) {
      return;
    }

    setContactRevealAnnouncement(emailRevealStatus.message);
  }, [emailRevealStatus.message, emailRevealStatus.type]);

  useEffect(() => {
    if (!hasProtectedContactReveal) {
      return;
    }

    writeContactRevealUnlocked(Boolean(revealedContact?.whatsAppValue));
  }, [hasProtectedContactReveal, revealedContact?.whatsAppValue]);

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
        <p
          id="contact-reveal-status"
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          {contactRevealAnnouncement}
        </p>
        <div
          className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"
          aria-busy={
            hasProtectedContactReveal &&
            !isContactReady &&
            isEmailRevealSubmitting
          }
          aria-describedby="contact-reveal-status"
        >
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
              {currentMailtoHref ? (
                <a
                  href={currentMailtoHref}
                  className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300 sm:w-auto"
                >
                  {primaryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void handleEmailRevealRequest();
                  }}
                  onMouseEnter={prepareEmailReveal}
                  onFocus={prepareEmailReveal}
                  disabled={isExplicitRevealSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300 sm:w-auto"
                >
                  {isExplicitRevealSubmitting
                    ? emailReveal.loading
                    : primaryCta}
                </button>
              )}
              {currentPhoneHref ? (
                <a
                  href={`tel:${currentPhoneHref}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white/90 px-6 py-3 text-sm font-semibold text-stone-900 transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-white dark:border-stone-600/90 dark:bg-stone-800/90 dark:text-stone-50 dark:hover:bg-stone-700 sm:w-auto"
                >
                  {secondaryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void handleEmailRevealRequest();
                  }}
                  onMouseEnter={prepareEmailReveal}
                  onFocus={prepareEmailReveal}
                  disabled={isExplicitRevealSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white/90 px-6 py-3 text-sm font-semibold text-stone-900 transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:border-stone-600/90 dark:bg-stone-800/90 dark:text-stone-50 dark:hover:bg-stone-700 sm:w-auto"
                >
                  {isExplicitRevealSubmitting
                    ? emailReveal.loading
                    : secondaryCta}
                </button>
              )}
              {currentWhatsAppHref ? (
                <a
                  href={currentWhatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-emerald-500/65 bg-emerald-100/85 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-[0_1px_2px_rgba(6,95,70,0.12)] transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-300/60 dark:bg-emerald-950/50 dark:text-emerald-50 dark:hover:bg-emerald-900/70 sm:w-auto"
                >
                  {tertiaryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void handleEmailRevealRequest();
                  }}
                  onMouseEnter={prepareEmailReveal}
                  onFocus={prepareEmailReveal}
                  disabled={isExplicitRevealSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full border border-emerald-500/65 bg-emerald-100/85 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-[0_1px_2px_rgba(6,95,70,0.12)] transition-[transform,background-color,color,border-color] duration-200 ease-linear hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-300/60 dark:bg-emerald-950/50 dark:text-emerald-50 dark:hover:bg-emerald-900/70 sm:w-auto"
                >
                  {isExplicitRevealSubmitting
                    ? emailReveal.loading
                    : tertiaryCta}
                </button>
              )}
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

            {hasProtectedContactReveal && turnstileSiteKey ? (
              <div className="mt-3">
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onTokenChange={setEmailRevealToken}
                  resetNonce={emailRevealResetNonce}
                  executeNonce={emailRevealExecuteNonce}
                  execution="execute"
                  action="contact_reveal"
                />
              </div>
            ) : null}

            {shouldShowContactLoading && !emailRevealStatus.message ? (
              <p
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/90 px-3 py-1.5 text-sm font-medium text-amber-900 dark:border-amber-300/30 dark:bg-amber-950/45 dark:text-amber-100"
                role="status"
                aria-live="polite"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500 dark:bg-amber-300" />
                {emailReveal.loading}
              </p>
            ) : null}

            {emailRevealStatus.message ? (
              <p
                id="contact-reveal-feedback"
                className={`mt-3 text-sm ${
                  emailRevealStatus.type === 'error'
                    ? 'text-rose-700 dark:text-rose-300'
                    : 'text-emerald-700 dark:text-emerald-300'
                }`}
                role={emailRevealStatus.type === 'error' ? 'alert' : 'status'}
                aria-live={
                  emailRevealStatus.type === 'error' ? 'assertive' : 'polite'
                }
              >
                {emailRevealStatus.message}
              </p>
            ) : null}

            <p className="mt-8 text-sm text-stone-600 dark:text-stone-300">
              {details.regionNote}
            </p>
          </div>

          <div className="bg-white/72 dark:bg-stone-950/38 rounded-[1.5rem] border border-white/65 p-5 shadow-[0_14px_36px_rgba(28,25,23,0.08)] backdrop-blur-sm dark:border-stone-600/70 sm:p-6">
            {shouldShowContactLoading ? (
              <div className="mb-5 rounded-[1.25rem] border border-amber-300/70 bg-amber-50/85 px-4 py-3 text-sm text-amber-950 dark:border-amber-300/25 dark:bg-amber-950/35 dark:text-amber-100">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500 dark:bg-amber-300" />
                  {emailReveal.loading}
                </div>
              </div>
            ) : null}
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
                {currentMailtoHref && currentEmailValue ? (
                  <a
                    href={currentMailtoHref}
                    className="mt-2 block break-all text-sm font-semibold text-stone-900 hover:underline dark:text-stone-50 sm:text-base"
                  >
                    {currentEmailValue}
                  </a>
                ) : shouldShowContactLoading ? (
                  <div className="mt-2 h-5 w-full animate-pulse rounded-full bg-stone-200/90 dark:bg-stone-700/80" />
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">
                  {details.phoneLabel}
                </p>
                {currentPhoneHref && currentPhoneDisplay ? (
                  <a
                    href={`tel:${currentPhoneHref}`}
                    className="mt-2 block break-all text-sm font-semibold text-stone-900 hover:underline dark:text-stone-50 sm:text-base"
                  >
                    {currentPhoneDisplay}
                  </a>
                ) : shouldShowContactLoading ? (
                  <div className="mt-2 h-5 w-40 animate-pulse rounded-full bg-stone-200/90 dark:bg-stone-700/80" />
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">
                  {details.whatsAppLabel}
                </p>
                {currentWhatsAppHref && currentWhatsAppValue ? (
                  <a
                    href={currentWhatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-sm font-semibold text-stone-900 hover:underline dark:text-stone-50 sm:text-base"
                  >
                    {currentWhatsAppValue}
                  </a>
                ) : shouldShowContactLoading ? (
                  <div className="mt-2 h-5 w-36 animate-pulse rounded-full bg-stone-200/90 dark:bg-stone-700/80" />
                ) : null}
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
