'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Form from '@/components/ui/Form/Form';
import Input from '@/components/ui/Form/Input';
import { readJsonResponse } from '@/lib/api-client';

interface AdminResetPasswordFormProps {
  locale: string;
}

function withLocale(locale: string, path: string) {
  return locale === 'de' ? path : `/${locale}${path}`;
}

export function AdminResetPasswordForm({
  locale,
}: AdminResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const token = searchParams.get('token')?.trim() || '';
  const loginHref = useMemo(() => withLocale(locale, '/admin/login'), [locale]);

  async function handleSubmit() {
    setError(undefined);
    setMessage(undefined);

    if (!token) {
      setError('Der Reset-Link ist unvollständig oder ungültig.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    const response = await fetch('/api/admin/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const payload = await readJsonResponse<{
      error?: string;
      message?: string;
    }>(response);

    if (!response.ok) {
      setError(payload?.error || 'Passwort konnte nicht zurückgesetzt werden');
      return;
    }

    setMessage(payload?.message || 'Passwort wurde aktualisiert.');
    setPassword('');
    setConfirmPassword('');

    startTransition(() => {
      router.push(loginHref);
      router.refresh();
    });
  }

  return (
    <Form
      onSubmit={async () => {
        await handleSubmit();
      }}
      isLoading={isPending}
      className="space-y-5"
    >
      <Input
        label="Neues Passwort"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        hint="Mindestens 10 Zeichen."
      />
      <Input
        label="Passwort bestätigen"
        type="password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
      >
        Neues Passwort setzen
      </button>
      <Link
        href={loginHref}
        className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
      >
        Zurück zum Login
      </Link>
    </Form>
  );
}
