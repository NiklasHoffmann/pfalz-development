'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/ui/Form/Input';
import Select from '@/components/ui/Form/Select';
import { readJsonResponse } from '@/lib/api-client';

interface StaffUserRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface NewStaffUserState {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
  isActive: 'true' | 'false';
}

interface EditableStaffState {
  name: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  password: string;
}

const initialNewStaffUserState: NewStaffUserState = {
  name: '',
  email: '',
  password: '',
  role: 'editor',
  isActive: 'true',
};

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('de-DE');
}

export function StaffAdminSection() {
  const [staffUsers, setStaffUsers] = useState<StaffUserRow[]>([]);
  const [editableUsers, setEditableUsers] = useState<
    Record<string, EditableStaffState>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [createError, setCreateError] = useState<string>();
  const [createMessage, setCreateMessage] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [saveMessage, setSaveMessage] = useState<string>();
  const [isCreating, setIsCreating] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string>();
  const [newStaffUser, setNewStaffUser] = useState<NewStaffUserState>(
    initialNewStaffUserState
  );
  const totalStaffUsers = staffUsers.length;
  const activeStaffUsers = staffUsers.filter(
    (staffUser) => staffUser.isActive
  ).length;
  const adminCount = staffUsers.filter(
    (staffUser) => staffUser.role === 'admin'
  ).length;
  const editorCount = staffUsers.filter(
    (staffUser) => staffUser.role === 'editor'
  ).length;

  useEffect(() => {
    let isCancelled = false;

    async function loadStaffUsers() {
      setIsLoading(true);
      setLoadError(undefined);

      const response = await fetch('/api/admin/staff', {
        credentials: 'include',
      });
      const payload = await readJsonResponse<{
        success?: boolean;
        data?: StaffUserRow[];
        error?: string;
      }>(response);

      if (isCancelled) {
        return;
      }

      if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
        setLoadError(
          payload?.error || 'Staff-Nutzer konnten nicht geladen werden'
        );
        setIsLoading(false);
        return;
      }

      setStaffUsers(payload.data);
      setEditableUsers(
        Object.fromEntries(
          payload.data.map((staffUser) => [
            staffUser.id,
            {
              name: staffUser.name,
              role: staffUser.role,
              isActive: staffUser.isActive,
              password: '',
            },
          ])
        )
      );
      setIsLoading(false);
    }

    void loadStaffUsers();

    return () => {
      isCancelled = true;
    };
  }, []);

  function updateEditableUser(
    userId: string,
    changes: Partial<EditableStaffState>
  ) {
    setEditableUsers((currentState) => ({
      ...currentState,
      [userId]: {
        ...currentState[userId],
        ...changes,
      },
    }));
  }

  async function reloadStaffUsers() {
    const response = await fetch('/api/admin/staff', {
      credentials: 'include',
    });
    const payload = await readJsonResponse<{
      success?: boolean;
      data?: StaffUserRow[];
      error?: string;
    }>(response);

    if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
      throw new Error(
        payload?.error || 'Staff-Nutzer konnten nicht geladen werden'
      );
    }

    setStaffUsers(payload.data);
    setEditableUsers(
      Object.fromEntries(
        payload.data.map((staffUser) => [
          staffUser.id,
          {
            name: staffUser.name,
            role: staffUser.role,
            isActive: staffUser.isActive,
            password: '',
          },
        ])
      )
    );
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setCreateError(undefined);
    setCreateMessage(undefined);

    const response = await fetch('/api/admin/staff', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newStaffUser.name.trim(),
        email: newStaffUser.email.trim(),
        password: newStaffUser.password,
        role: newStaffUser.role,
        isActive: newStaffUser.isActive === 'true',
      }),
    });

    const payload = await readJsonResponse<{
      success?: boolean;
      error?: string;
      data?: StaffUserRow;
    }>(response);

    if (!response.ok || !payload?.success || !payload.data) {
      setCreateError(
        payload?.error || 'Staff-Nutzer konnte nicht angelegt werden'
      );
      setIsCreating(false);
      return;
    }

    setNewStaffUser(initialNewStaffUserState);
    setCreateMessage(`Staff-Nutzer ${payload.data.email} wurde angelegt.`);
    await reloadStaffUsers();
    setIsCreating(false);
  }

  async function handleSaveUser(userId: string) {
    const editableUser = editableUsers[userId];

    if (!editableUser) {
      return;
    }

    setSavingUserId(userId);
    setSaveError(undefined);
    setSaveMessage(undefined);

    const response = await fetch(`/api/admin/staff/${userId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editableUser.name.trim(),
        role: editableUser.role,
        isActive: editableUser.isActive,
        password: editableUser.password || undefined,
      }),
    });

    const payload = await readJsonResponse<{
      success?: boolean;
      error?: string;
      data?: StaffUserRow;
    }>(response);

    if (!response.ok || !payload?.success || !payload.data) {
      setSaveError(
        payload?.error || 'Staff-Nutzer konnte nicht aktualisiert werden'
      );
      setSavingUserId(undefined);
      return;
    }

    setSaveMessage(`Staff-Nutzer ${payload.data.email} wurde aktualisiert.`);
    await reloadStaffUsers();
    setSavingUserId(undefined);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="border-b border-stone-200 pb-5 dark:border-stone-800">
          <h1 className="text-3xl font-semibold tracking-tight">
            Staff-Nutzer
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Interne Admin- und Editor-Accounts fuer den Intake-Bereich anlegen
            und verwalten.
          </p>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => void handleCreateUser(event)}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Name"
              required
              value={newStaffUser.name}
              onChange={(event) =>
                setNewStaffUser((currentState) => ({
                  ...currentState,
                  name: event.target.value,
                }))
              }
              disabled={isCreating}
            />
            <Input
              label="E-Mail"
              type="email"
              required
              value={newStaffUser.email}
              onChange={(event) =>
                setNewStaffUser((currentState) => ({
                  ...currentState,
                  email: event.target.value,
                }))
              }
              disabled={isCreating}
            />
            <Input
              label="Startpasswort"
              type="password"
              required
              value={newStaffUser.password}
              onChange={(event) =>
                setNewStaffUser((currentState) => ({
                  ...currentState,
                  password: event.target.value,
                }))
              }
              hint="Mindestens 10 Zeichen."
              disabled={isCreating}
            />
            <Select
              label="Rolle"
              value={newStaffUser.role}
              onChange={(event) =>
                setNewStaffUser((currentState) => ({
                  ...currentState,
                  role: event.target.value as 'admin' | 'editor',
                }))
              }
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'editor', label: 'Editor' },
              ]}
              disabled={isCreating}
            />
          </div>

          {(createError || createMessage) && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${createError ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'}`}
            >
              {createError || createMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
            >
              {isCreating ? 'Wird angelegt...' : 'Staff-Nutzer anlegen'}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Gesamt
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {totalStaffUsers}
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            interne Nutzer
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Aktiv
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {activeStaffUsers}
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            mit Zugriff
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Admins
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {adminCount}
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            volle Berechtigungen
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Editoren
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {editorCount}
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            operativer Zugriff
          </p>
        </div>
      </section>

      {(saveError || saveMessage || loadError) && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${saveError || loadError ? 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'}`}
        >
          {loadError || saveError || saveMessage}
        </div>
      )}

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="border-b border-stone-200 pb-5 dark:border-stone-800">
          <h2 className="text-2xl font-semibold tracking-tight">
            Bestehende Nutzer
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Rolle, Aktiv-Status und Passwort vorhandener Staff-Accounts
            verwalten.
          </p>
        </div>

        {isLoading ? (
          <div className="py-8 text-sm text-stone-600 dark:text-stone-300">
            Staff-Nutzer werden geladen...
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {staffUsers.map((staffUser) => {
              const editableUser = editableUsers[staffUser.id];

              if (!editableUser) {
                return null;
              }

              return (
                <div
                  key={staffUser.id}
                  className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-950/40"
                >
                  <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 dark:border-stone-800 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">
                        {staffUser.email}
                      </p>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                        Letzter Login: {formatDate(staffUser.lastLoginAt)}
                      </p>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                        Erstellt: {formatDate(staffUser.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${staffUser.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'}`}
                      >
                        {staffUser.isActive ? 'Aktiv' : 'Deaktiviert'}
                      </span>
                      <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                        {staffUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_14rem] xl:items-start">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Name"
                        value={editableUser.name}
                        onChange={(event) =>
                          updateEditableUser(staffUser.id, {
                            name: event.target.value,
                          })
                        }
                        disabled={savingUserId === staffUser.id}
                      />
                      <Select
                        label="Rolle"
                        value={editableUser.role}
                        onChange={(event) =>
                          updateEditableUser(staffUser.id, {
                            role: event.target.value as 'admin' | 'editor',
                          })
                        }
                        options={[
                          { value: 'admin', label: 'Admin' },
                          { value: 'editor', label: 'Editor' },
                        ]}
                        disabled={savingUserId === staffUser.id}
                      />
                      <Select
                        label="Aktiv"
                        value={editableUser.isActive ? 'true' : 'false'}
                        onChange={(event) =>
                          updateEditableUser(staffUser.id, {
                            isActive: event.target.value === 'true',
                          })
                        }
                        options={[
                          { value: 'true', label: 'Aktiv' },
                          { value: 'false', label: 'Deaktiviert' },
                        ]}
                        disabled={savingUserId === staffUser.id}
                      />
                      <Input
                        label="Neues Passwort"
                        type="password"
                        value={editableUser.password}
                        onChange={(event) =>
                          updateEditableUser(staffUser.id, {
                            password: event.target.value,
                          })
                        }
                        hint="Optional. Leer lassen, um das Passwort nicht zu aendern."
                        disabled={savingUserId === staffUser.id}
                      />
                    </div>
                    <div className="flex xl:justify-end">
                      <button
                        type="button"
                        onClick={() => void handleSaveUser(staffUser.id)}
                        disabled={savingUserId === staffUser.id}
                        className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 xl:w-auto"
                      >
                        {savingUserId === staffUser.id
                          ? 'Speichert...'
                          : 'Speichern'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {!staffUsers.length && (
              <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-6 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
                Noch keine weiteren Staff-Nutzer vorhanden.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
