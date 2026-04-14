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

  const dashboardPath =
    locale === 'de'
      ? '/admin/intake/submissions'
      : `/${locale}/admin/intake/submissions`;

  async function handleSubmit() {
    setError(undefined);

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
