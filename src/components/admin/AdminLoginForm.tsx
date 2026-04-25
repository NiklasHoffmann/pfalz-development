'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Form from '@/components/ui/Form/Form';
import Input from '@/components/ui/Form/Input';

interface AdminLoginFormProps {
  locale: string;
}

export function AdminLoginForm({ locale }: AdminLoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [resetMessage, setResetMessage] = useState<string>();
  const [resetError, setResetError] = useState<string>();
  const [showResetRequest, setShowResetRequest] = useState(false);
  const [isResetPending, setIsResetPending] = useState(false);

  const dashboardPath =
    locale === 'de'
      ? '/admin'
      : `/${locale}/admin`;

  async function handleSubmit() {
    setError(undefined);
    setResetError(undefined);
    setResetMessage(undefined);

    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setError(payload?.error || 'Login fehlgeschlagen');
      return;
    }

    startTransition(() => {
      router.push(dashboardPath);
      router.refresh();
    });
  }

  async function handleResetRequest() {
    setError(undefined);
    setResetError(undefined);
    setResetMessage(undefined);
    setIsResetPending(true);

    if (!email.trim()) {
      setResetError('Bitte zuerst die Admin-E-Mail eintragen.');
      setIsResetPending(false);
      return;
    }

    const response = await fetch('/api/admin/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, locale }),
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    if (!response.ok) {
      setResetError(
        payload?.error || 'Reset-Link konnte nicht angefordert werden'
      );
      setIsResetPending(false);
      return;
    }

    setResetMessage(
      payload?.message ||
        'Wenn der Zugang existiert, wurde ein Reset-Link versendet.'
    );
    setIsResetPending(false);
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
        label="E-Mail"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label="Passwort"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button
        type="button"
        onClick={() => setShowResetRequest((current) => !current)}
        className="inline-flex items-center justify-start text-sm font-medium text-amber-800 transition hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100"
      >
        {showResetRequest ? 'Reset-Anfrage ausblenden' : 'Passwort vergessen?'}
      </button>
      {showResetRequest ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 dark:border-stone-800 dark:bg-stone-950/60">
          <p className="text-sm text-stone-600 dark:text-stone-300">
            Wir senden einen einmaligen Link zum Zuruecksetzen an die angegebene
            Admin-E-Mail.
          </p>
          <button
            type="button"
            onClick={() => {
              void handleResetRequest();
            }}
            className="mt-3 inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
          >
            {isResetPending ? 'Link wird gesendet...' : 'Reset-Link senden'}
          </button>
          {resetError ? (
            <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {resetError}
            </p>
          ) : null}
          {resetMessage ? (
            <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {resetMessage}
            </p>
          ) : null}
        </div>
      ) : null}
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
      >
        Anmelden
      </button>
    </Form>
  );
}
