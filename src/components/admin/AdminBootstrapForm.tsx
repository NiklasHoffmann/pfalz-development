'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Form from '@/components/ui/Form/Form';
import Input from '@/components/ui/Form/Input';
import Select from '@/components/ui/Form/Select';

interface AdminBootstrapFormProps {
  locale: string;
  defaultEmail: string;
  requiresAdminApiKey: boolean;
}

export function AdminBootstrapForm({
  locale,
  defaultEmail,
  requiresAdminApiKey,
}: AdminBootstrapFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('Pfalz Development');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('admin');
  const [adminApiKey, setAdminApiKey] = useState('');
  const [error, setError] = useState<string>();

  const dashboardPath =
    locale === 'de'
      ? '/admin'
      : `/${locale}/admin`;

  async function handleSubmit() {
    setError(undefined);

    const bootstrapResponse = await fetch('/api/admin/staff/bootstrap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminApiKey.trim() ? { 'x-admin-key': adminApiKey.trim() } : {}),
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const bootstrapPayload = (await bootstrapResponse
      .json()
      .catch(() => null)) as {
      error?: string;
    } | null;

    if (!bootstrapResponse.ok) {
      setError(
        bootstrapPayload?.error || 'Benutzer konnte nicht angelegt werden'
      );
      return;
    }

    const loginResponse = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const loginPayload = (await loginResponse.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!loginResponse.ok) {
      setError(
        loginPayload?.error ||
          'Benutzer wurde angelegt, automatische Anmeldung ist aber fehlgeschlagen'
      );
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
        label="Name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
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
        hint="Mindestens 10 Zeichen. Dieses Passwort wird direkt fuer den ersten Admin-Login verwendet."
      />
      <Select
        label="Rolle"
        value={role}
        onChange={(event) => setRole(event.target.value as 'admin' | 'editor')}
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'editor', label: 'Editor' },
        ]}
      />
      {requiresAdminApiKey && (
        <Input
          label="Admin API Key"
          type="password"
          required
          value={adminApiKey}
          onChange={(event) => setAdminApiKey(event.target.value)}
          hint="Wird nur fuer die initiale Benutzeranlage verwendet."
        />
      )}
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
      >
        Ersten Benutzer anlegen
      </button>
    </Form>
  );
}
