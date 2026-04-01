'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Form/Input';
import Textarea from '@/components/ui/Form/Textarea';
import { TurnstileWidget } from '@/components/ui/TurnstileWidget';
import { useZodForm } from '@/hooks/useZodForm';
import { Link } from '@/routing';
import {
  createContactSchema,
  type ContactFormValues,
} from '@/schemas/contact.schema';

type ContactApiResponse = {
  success: boolean;
  error?: string;
};

export function ContactForm() {
  const t = useTranslations('common.home.contact.form');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(
    null
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const contactSchema = useMemo(() => createContactSchema(t), [t]);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const hasTurnstileProtection = Boolean(turnstileSiteKey);
  const form = useZodForm<ContactFormValues>({
    schema: contactSchema,
    defaultValues: {
      name: '',
      business: '',
      email: '',
      phone: '',
      message: '',
      website: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setStatusMessage('');
    setStatusType(null);

    if (hasTurnstileProtection && !turnstileToken) {
      setStatusMessage(t('status.botCheckPending'));
      setStatusType('error');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          turnstileToken: turnstileToken ?? '',
        }),
      });

      const result = (await response.json()) as ContactApiResponse;

      if (!response.ok || !result.success) {
        if (result.error === 'Spam protection verification failed') {
          throw new Error(t('status.botCheckFailed'));
        }

        throw new Error(result.error || t('status.error'));
      }

      setStatusMessage(t('status.success'));
      setStatusType('success');
      reset();
      setTurnstileToken(null);
      setTurnstileResetNonce((value) => value + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('status.error');
      setStatusMessage(message);
      setStatusType('error');
      if (hasTurnstileProtection) {
        setTurnstileToken(null);
        setTurnstileResetNonce((value) => value + 1);
      }
    }
  });

  return (
    <div className="flex max-h-[calc(100dvh-2.5rem)] min-h-0 flex-col overflow-hidden rounded-[1.75rem] bg-white text-stone-900 dark:bg-stone-800 dark:text-stone-100 sm:max-h-[calc(100dvh-4rem)]">
      <div className="relative z-10 shrink-0 bg-white px-6 pb-5 pt-6 shadow-[0_20px_34px_-30px_rgba(28,25,23,0.45)] dark:bg-stone-800 dark:shadow-[0_20px_34px_-28px_rgba(0,0,0,0.72)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200">
          {t('eyebrow')}
        </p>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50">
          {t('title')}
        </h3>
        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
          {t('description')}
        </p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-white/0 via-white/72 to-white dark:from-stone-800/0 dark:via-stone-800/76 dark:to-stone-800" />
      </div>

      <form
        onSubmit={onSubmit}
        className="flex min-h-0 flex-1 flex-col"
        aria-describedby="contact-form-status"
      >
        <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-stone-100/78 via-stone-50/58 to-stone-100/44 px-6 pb-5 pt-5 dark:from-stone-900/52 dark:via-stone-900/28 dark:to-stone-900/12">
          <div className="rounded-[1.6rem] border border-stone-300/70 bg-gradient-to-b from-stone-50/94 via-stone-100/90 to-stone-100/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_16px_36px_-32px_rgba(28,25,23,0.22)] dark:border-stone-700/75 dark:bg-gradient-to-b dark:from-stone-800/96 dark:via-stone-800/94 dark:to-stone-900/84 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_16px_36px_-32px_rgba(0,0,0,0.4)] sm:p-5">
            <fieldset disabled={isSubmitting} className="space-y-4">
              <input
                type="text"
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                {...register('website')}
              />

              <Input
                label={t('fields.name.label')}
                placeholder={t('fields.name.placeholder')}
                error={errors.name?.message}
                className="rounded-2xl border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600/90 dark:bg-stone-800/95 dark:text-stone-50 dark:placeholder-stone-300"
                required
                autoComplete="name"
                {...register('name')}
              />

              <Input
                label={t('fields.business.label')}
                placeholder={t('fields.business.placeholder')}
                error={errors.business?.message}
                className="rounded-2xl border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600/90 dark:bg-stone-800/95 dark:text-stone-50 dark:placeholder-stone-300"
                autoComplete="organization"
                {...register('business')}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="email"
                  label={t('fields.email.label')}
                  placeholder={t('fields.email.placeholder')}
                  error={errors.email?.message}
                  className="rounded-2xl border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600/90 dark:bg-stone-800/95 dark:text-stone-50 dark:placeholder-stone-300"
                  required
                  autoComplete="email"
                  {...register('email')}
                />

                <Input
                  type="tel"
                  label={t('fields.phone.label')}
                  placeholder={t('fields.phone.placeholder')}
                  error={errors.phone?.message}
                  className="rounded-2xl border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600/90 dark:bg-stone-800/95 dark:text-stone-50 dark:placeholder-stone-300"
                  autoComplete="tel"
                  inputMode="tel"
                  {...register('phone')}
                />
              </div>

              <Textarea
                label={t('fields.message.label')}
                placeholder={t('fields.message.placeholder')}
                error={errors.message?.message}
                className="min-h-36 rounded-2xl border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600/90 dark:bg-stone-800/95 dark:text-stone-50 dark:placeholder-stone-300"
                required
                {...register('message')}
              />

              {turnstileSiteKey ? (
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onTokenChange={setTurnstileToken}
                  resetNonce={turnstileResetNonce}
                />
              ) : null}
            </fieldset>
          </div>
        </div>

        <div className="relative z-10 shrink-0 bg-white px-6 pb-6 pt-4 shadow-[0_-20px_34px_-30px_rgba(28,25,23,0.45)] dark:bg-stone-800 dark:shadow-[0_-20px_34px_-28px_rgba(0,0,0,0.72)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-t from-white/0 via-white/72 to-white dark:from-stone-800/0 dark:via-stone-800/76 dark:to-stone-800" />
          {statusMessage ? (
            <p
              id="contact-form-status"
              className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                statusType === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/60 dark:bg-emerald-900/30 dark:text-emerald-200'
                  : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/60 dark:bg-rose-900/30 dark:text-rose-200'
              }`}
              role={statusType === 'error' ? 'alert' : 'status'}
              aria-live={statusType === 'error' ? 'assertive' : 'polite'}
            >
              {statusMessage}
            </p>
          ) : (
            <p id="contact-form-status" className="sr-only" aria-live="polite" />
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-500 dark:text-stone-300">
              {t('privacyNote')}{' '}
              <Link
                href="/datenschutz"
                className="font-semibold underline decoration-amber-600/70 underline-offset-2 hover:decoration-amber-500"
              >
                {t('privacyLinkLabel')}
              </Link>
            </p>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('status.loading') : t('submit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
