'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import Form from '@/components/ui/Form/Form';
import Input from '@/components/ui/Form/Input';
import Textarea from '@/components/ui/Form/Textarea';
import { useNotification } from '@/hooks/useNotification';
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
  const notification = useNotification();
  const [statusMessage, setStatusMessage] = useState('');
  const contactSchema = useMemo(() => createContactSchema(t), [t]);
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
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as ContactApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.error || t('status.error'));
      }

      notification.success(t('status.success'));
      setStatusMessage(t('status.success'));
      reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('status.error');
      notification.error(message);
      setStatusMessage(message);
    }
  });

  return (
    <>
      <div className="rounded-[1.75rem] bg-white p-6 text-stone-900 shadow-[0_25px_80px_rgba(0,0,0,0.18)] dark:border dark:border-stone-600/90 dark:bg-stone-900 dark:text-stone-100 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200">
            {t('eyebrow')}
          </p>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50">
            {t('title')}
          </h3>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
            {t('description')}
          </p>
        </div>

        <Form
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          className="space-y-4"
          aria-describedby="contact-form-status"
        >
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

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
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

          <p id="contact-form-status" className="sr-only" aria-live="polite">
            {statusMessage}
          </p>
        </Form>
      </div>
      <Toaster position="top-right" />
    </>
  );
}
