'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { readJsonResponse } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimeProject {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
}

interface TimeActivityType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface TimeEntry {
  id: string;
  staffUserId: string;
  staffUserName: string;
  projectId?: string | null;
  projectName?: string | null;
  projectColor?: string | null;
  activityTypeId?: string | null;
  activityTypeName?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes: number;
  description?: string;
  isRunning: boolean;
  isBillable: boolean;
  createdAt: string;
}

type Tab =
  | 'uebersicht'
  | 'eintraege'
  | 'projekte'
  | 'taetigkeitsarten'
  | 'auswertung';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}min`;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE');
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const HOUR_START = 7;
const HOUR_END = 20;
const PX_PER_MINUTE = 1.5;

// ---------------------------------------------------------------------------
// Color Swatch
// ---------------------------------------------------------------------------

const PROJECT_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#f43f5e',
];

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROJECT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
            value === color
              ? 'scale-110 border-stone-950 dark:border-stone-50'
              : 'border-transparent'
          )}
          style={{ backgroundColor: color }}
          aria-label={color}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project Dot
// ---------------------------------------------------------------------------

function ProjectDot({ color }: { color: string | null | undefined }) {
  if (!color) return null;
  return (
    <span
      className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// ---------------------------------------------------------------------------
// Timer Card
// ---------------------------------------------------------------------------

interface TimerCardProps {
  projects: TimeProject[];
  activityTypes: TimeActivityType[];
  runningEntry: TimeEntry | null;
  onTimerStart: (
    projectId: string | null,
    activityTypeId: string | null,
    description: string
  ) => Promise<void>;
  onTimerStop: () => Promise<void>;
  isTimerLoading: boolean;
}

function TimerCard({
  projects,
  activityTypes,
  runningEntry,
  onTimerStart,
  onTimerStop,
  isTimerLoading,
}: TimerCardProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [description, setDescription] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!runningEntry?.startTime) return;

    const updateElapsed = () => {
      setElapsed(
        Math.floor(
          (Date.now() - new Date(runningEntry.startTime!).getTime()) / 1000
        )
      );
    };
    updateElapsed();
    intervalRef.current = setInterval(updateElapsed, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runningEntry]);

  async function handleStart() {
    await onTimerStart(
      selectedProject || null,
      selectedActivity || null,
      description
    );
    setDescription('');
  }

  const activeProject = projects.find(
    (p) => p.id === (runningEntry?.projectId ?? selectedProject)
  );

  return (
    <div className="bg-white/72 rounded-[1.35rem] border border-stone-200/80 p-5 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Timer display */}
        <div className="flex flex-col items-center gap-1 sm:min-w-[10rem]">
          <div
            className={cn(
              'font-mono text-4xl font-bold tabular-nums tracking-tight',
              runningEntry
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-stone-400 dark:text-stone-500'
            )}
          >
            {formatElapsed(runningEntry ? elapsed : 0)}
          </div>
          {runningEntry && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Timer läuft
            </div>
          )}
        </div>

        {/* Controls */}
        {runningEntry ? (
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              {activeProject && (
                <>
                  <ProjectDot color={activeProject.color} />
                  <span className="font-medium">{activeProject.name}</span>
                </>
              )}
              {runningEntry.activityTypeName && (
                <span className="text-stone-500 dark:text-stone-400">
                  · {runningEntry.activityTypeName}
                </span>
              )}
            </div>
            {runningEntry.description && (
              <p className="text-sm text-stone-600 dark:text-stone-300">
                {runningEntry.description}
              </p>
            )}
            <button
              type="button"
              onClick={() => void onTimerStop()}
              disabled={isTimerLoading}
              className="inline-flex w-full items-center justify-center rounded-full border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60 sm:w-auto"
            >
              Timer stoppen
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                  Projekt
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
                >
                  <option value="">Kein Projekt</option>
                  {projects
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                  Tätigkeit
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
                >
                  <option value="">Keine Angabe</option>
                  {activityTypes
                    .filter((a) => a.isActive)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibung (optional)"
                className="flex-1 rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleStart();
                }}
              />
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={isTimerLoading}
                className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200 dark:hover:bg-amber-300/25"
              >
                Starten
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week Calendar
// ---------------------------------------------------------------------------

interface WeekCalendarProps {
  weekStart: Date;
  entries: TimeEntry[];
  onDayClick: (date: Date) => void;
}

function WeekCalendar({ weekStart, entries, onDayClick }: WeekCalendarProps) {
  const hours = Array.from(
    { length: HOUR_END - HOUR_START },
    (_, i) => HOUR_START + i
  );
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const totalHeight = (HOUR_END - HOUR_START) * 60 * PX_PER_MINUTE;

  function getEntriesForDay(day: Date) {
    return entries.filter((e) => isSameDay(new Date(e.date), day));
  }

  function getEntryStyle(entry: TimeEntry): React.CSSProperties {
    if (!entry.startTime) {
      return {
        top: 0,
        height: Math.max(entry.durationMinutes * PX_PER_MINUTE, 24),
      };
    }
    const start = new Date(entry.startTime);
    const startMinutes =
      start.getHours() * 60 + start.getMinutes() - HOUR_START * 60;
    const clampedStart = Math.max(0, startMinutes);
    const height = Math.max(entry.durationMinutes * PX_PER_MINUTE, 24);
    return {
      top: clampedStart * PX_PER_MINUTE,
      height,
    };
  }

  const today = new Date();

  return (
    <div className="bg-white/72 overflow-hidden rounded-[1.35rem] border border-stone-200/80 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
      {/* Header */}
      <div
        className="grid border-b border-stone-200/80 dark:border-stone-700/80"
        style={{ gridTemplateColumns: '3rem repeat(7, 1fr)' }}
      >
        <div className="border-r border-stone-200/80 dark:border-stone-700/80" />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className="border-r border-stone-200/80 px-1 py-2 text-center last:border-r-0 dark:border-stone-700/80"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {DAY_NAMES[i]}
              </div>
              <div
                className={cn(
                  'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                  isToday
                    ? 'bg-amber-400 text-amber-950'
                    : 'text-stone-800 dark:text-stone-100'
                )}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body — scrollable */}
      <div className="overflow-auto" style={{ maxHeight: '520px' }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: '3rem repeat(7, 1fr)' }}
        >
          {/* Hour labels */}
          <div className="relative" style={{ height: totalHeight }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-stone-400 dark:text-stone-500"
                style={{ top: (h - HOUR_START) * 60 * PX_PER_MINUTE - 7 }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const dayEntries = getEntriesForDay(day);
            return (
              <div
                key={di}
                className="relative cursor-pointer border-l border-stone-200/80 dark:border-stone-700/80"
                style={{ height: totalHeight }}
                onClick={() => onDayClick(day)}
              >
                {/* Hour grid lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-stone-100 dark:border-stone-800"
                    style={{ top: (h - HOUR_START) * 60 * PX_PER_MINUTE }}
                  />
                ))}

                {/* Entries */}
                {dayEntries.map((entry) => {
                  const style = getEntryStyle(entry);
                  const color = entry.projectColor ?? '#6366f1';
                  return (
                    <div
                      key={entry.id}
                      className="absolute inset-x-0.5 overflow-hidden rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight text-white shadow-sm"
                      style={{
                        ...style,
                        backgroundColor: color,
                        opacity: entry.isRunning ? 0.7 : 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      title={[
                        entry.projectName,
                        entry.activityTypeName,
                        entry.description,
                        formatMinutes(entry.durationMinutes),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    >
                      <div className="truncate">
                        {entry.projectName ?? entry.activityTypeName ?? '—'}
                      </div>
                      {Number(style.height) > 30 && (
                        <div className="truncate opacity-80">
                          {entry.isRunning
                            ? '⏱ läuft…'
                            : formatMinutes(entry.durationMinutes)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry Form Modal
// ---------------------------------------------------------------------------

interface EntryFormState {
  projectId: string;
  activityTypeId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: string;
  durationMinutes: string;
  description: string;
  isBillable: boolean;
}

interface EntryFormProps {
  projects: TimeProject[];
  activityTypes: TimeActivityType[];
  initialDate?: string;
  entry?: TimeEntry | null;
  onSave: (data: EntryFormState) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  saveError?: string;
}

function EntryForm({
  projects,
  activityTypes,
  initialDate,
  entry,
  onSave,
  onCancel,
  isSaving,
  saveError,
}: EntryFormProps) {
  const [form, setForm] = useState<EntryFormState>(() => {
    if (entry) {
      const start = entry.startTime
        ? new Date(entry.startTime).toTimeString().slice(0, 5)
        : '';
      const end = entry.endTime
        ? new Date(entry.endTime).toTimeString().slice(0, 5)
        : '';
      const h = Math.floor(entry.durationMinutes / 60);
      const m = entry.durationMinutes % 60;
      return {
        projectId: entry.projectId ?? '',
        activityTypeId: entry.activityTypeId ?? '',
        date: toLocalDateString(new Date(entry.date)),
        startTime: start,
        endTime: end,
        durationHours: String(h),
        durationMinutes: String(m),
        description: entry.description ?? '',
        isBillable: entry.isBillable,
      };
    }
    return {
      projectId: '',
      activityTypeId: '',
      date: initialDate ?? toLocalDateString(new Date()),
      startTime: '',
      endTime: '',
      durationHours: '1',
      durationMinutes: '0',
      description: '',
      isBillable: true,
    };
  });

  function set<K extends keyof EntryFormState>(
    key: K,
    value: EntryFormState[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function calcDurationFromTimes(startTime: string, endTime: string) {
    if (!startTime || !endTime) return;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff > 0) {
      setForm((f) => ({
        ...f,
        durationHours: String(Math.floor(diff / 60)),
        durationMinutes: String(diff % 60),
      }));
    }
  }

  return (
    <div className="bg-white/72 rounded-[1.35rem] border border-stone-200/80 p-5 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
      <h3 className="mb-4 text-base font-semibold">
        {entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Datum *
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Projekt
          </label>
          <select
            value={form.projectId}
            onChange={(e) => set('projectId', e.target.value)}
            className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
          >
            <option value="">Kein Projekt</option>
            {projects
              .filter((p) => p.isActive)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Tätigkeitsart
          </label>
          <select
            value={form.activityTypeId}
            onChange={(e) => set('activityTypeId', e.target.value)}
            className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
          >
            <option value="">Keine Angabe</option>
            {activityTypes
              .filter((a) => a.isActive)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Dauer *
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={form.durationHours}
              onChange={(e) => set('durationHours', e.target.value)}
              className="w-20 rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
            />
            <span className="text-sm text-stone-500">h</span>
            <input
              type="number"
              min="0"
              max="59"
              value={form.durationMinutes}
              onChange={(e) => set('durationMinutes', e.target.value)}
              className="w-20 rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
            />
            <span className="text-sm text-stone-500">min</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Startzeit (optional)
          </label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => {
              set('startTime', e.target.value);
              calcDurationFromTimes(e.target.value, form.endTime);
            }}
            className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Endzeit (optional)
          </label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => {
              set('endTime', e.target.value);
              calcDurationFromTimes(form.startTime, e.target.value);
            }}
            className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Beschreibung
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Was wurde gemacht?"
            className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isBillable}
              onChange={(e) => set('isBillable', e.target.checked)}
              className="rounded border-stone-300 accent-amber-500"
            />
            <span className="text-stone-700 dark:text-stone-300">
              Abrechenbar
            </span>
          </label>
        </div>
      </div>

      {saveError && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {saveError}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => void onSave(form)}
          disabled={isSaving || !form.date}
          className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200 dark:hover:bg-amber-300/25"
        >
          {isSaving ? 'Speichern…' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Übersicht Tab
// ---------------------------------------------------------------------------

interface UebersichtTabProps {
  projects: TimeProject[];
  activityTypes: TimeActivityType[];
  weekEntries: TimeEntry[];
  weekStart: Date;
  runningEntry: TimeEntry | null;
  onTimerStart: (
    p: string | null,
    a: string | null,
    d: string
  ) => Promise<void>;
  onTimerStop: () => Promise<void>;
  isTimerLoading: boolean;
  onWeekChange: (delta: number) => void;
  onDayClick: (date: Date) => void;
  showEntryForm: boolean;
  newEntryDate: string;
  editingEntry: TimeEntry | null;
  onSaveEntry: (data: EntryFormState) => Promise<void>;
  onCancelEntryForm: () => void;
  onShowNewEntry: () => void;
  isSavingEntry: boolean;
  saveEntryError?: string;
  onDeleteEntry: (id: string) => Promise<void>;
  isDeletingEntry: string | null;
}

function UebersichtTab({
  projects,
  activityTypes,
  weekEntries,
  weekStart,
  runningEntry,
  onTimerStart,
  onTimerStop,
  isTimerLoading,
  onWeekChange,
  onDayClick,
  showEntryForm,
  newEntryDate,
  editingEntry,
  onSaveEntry,
  onCancelEntryForm,
  onShowNewEntry,
  isSavingEntry,
  saveEntryError,
  onDeleteEntry,
  isDeletingEntry,
}: UebersichtTabProps) {
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} – ${weekEnd.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  const totalWeekMinutes = weekEntries
    .filter((e) => !e.isRunning)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="space-y-5">
      {/* Timer */}
      <TimerCard
        projects={projects}
        activityTypes={activityTypes}
        runningEntry={runningEntry}
        onTimerStart={onTimerStart}
        onTimerStop={onTimerStop}
        isTimerLoading={isTimerLoading}
      />

      {/* Week navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onWeekChange(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white/80 text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            {weekLabel}
          </span>
          <button
            type="button"
            onClick={() => onWeekChange(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white/80 text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => onWeekChange(0)}
            className="rounded-full border border-stone-300 bg-white/80 px-3 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:border-stone-100"
          >
            Heute
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
            {formatMinutes(totalWeekMinutes)} diese Woche
          </span>
          <button
            type="button"
            onClick={onShowNewEntry}
            className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-4 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200/80 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200 dark:hover:bg-amber-300/25"
          >
            + Eintrag
          </button>
        </div>
      </div>

      {/* Calendar */}
      <WeekCalendar
        weekStart={weekStart}
        entries={weekEntries}
        onDayClick={onDayClick}
      />

      {/* Entry Form */}
      {showEntryForm && (
        <EntryForm
          projects={projects}
          activityTypes={activityTypes}
          initialDate={newEntryDate}
          entry={editingEntry}
          onSave={onSaveEntry}
          onCancel={onCancelEntryForm}
          isSaving={isSavingEntry}
          saveError={saveEntryError}
        />
      )}

      {/* Week entries list */}
      {weekEntries.length > 0 && (
        <div className="bg-white/72 overflow-hidden rounded-[1.35rem] border border-stone-200/80 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
          <div className="border-b border-stone-200/80 px-5 py-3 dark:border-stone-700/80">
            <h3 className="text-sm font-semibold">Einträge dieser Woche</h3>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {weekEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                <ProjectDot color={entry.projectColor} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">
                      {formatDate(entry.date)}
                    </span>
                    {entry.projectName && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{
                          backgroundColor: entry.projectColor ?? '#6366f1',
                        }}
                      >
                        {entry.projectName}
                      </span>
                    )}
                    {entry.activityTypeName && (
                      <span className="text-stone-500 dark:text-stone-400">
                        {entry.activityTypeName}
                      </span>
                    )}
                    {entry.isRunning && (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        läuft
                      </span>
                    )}
                  </div>
                  {entry.description && (
                    <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                      {entry.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {entry.isRunning
                      ? '⏱'
                      : formatMinutes(entry.durationMinutes)}
                  </div>
                  <div className="text-xs text-stone-400">
                    {formatTime(entry.startTime)}
                    {entry.endTime && ` – ${formatTime(entry.endTime)}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void onDeleteEntry(entry.id)}
                  disabled={isDeletingEntry === entry.id || entry.isRunning}
                  className="ml-1 rounded-full px-2 py-1 text-xs text-stone-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  title="Löschen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {weekEntries.length === 0 && (
        <div className="rounded-[1.35rem] border border-dashed border-stone-300 py-12 text-center dark:border-stone-700">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Keine Einträge für diese Woche.
          </p>
          <button
            type="button"
            onClick={onShowNewEntry}
            className="mt-3 inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-4 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-200/80 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200"
          >
            Ersten Eintrag erstellen
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Einträge Tab (All entries with filters)
// ---------------------------------------------------------------------------

interface EintraegeTabProps {
  entries: TimeEntry[];
  projects: TimeProject[];
  activityTypes: TimeActivityType[];
  filterProject: string;
  filterActivity: string;
  filterFrom: string;
  filterTo: string;
  onFilterChange: (key: string, value: string) => void;
  onExport: () => void;
  onPrint: () => void;
  onDelete: (id: string) => Promise<void>;
  isDeletingEntry: string | null;
}

function EintraegeTab({
  entries,
  projects,
  activityTypes,
  filterProject,
  filterActivity,
  filterFrom,
  filterTo,
  onFilterChange,
  onExport,
  onPrint,
  onDelete,
  isDeletingEntry,
}: EintraegeTabProps) {
  const filtered = entries.filter((e) => {
    if (filterProject && e.projectId !== filterProject) return false;
    if (filterActivity && e.activityTypeId !== filterActivity) return false;
    if (filterFrom && new Date(e.date) < new Date(filterFrom)) return false;
    if (filterTo && new Date(e.date) > new Date(filterTo)) return false;
    return true;
  });

  const filteredMinutes = filtered
    .filter((e) => !e.isRunning)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="space-y-4 print:space-y-3">
      {/* Filters */}
      <div className="bg-white/72 rounded-[1.35rem] border border-stone-200/80 p-4 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45 print:hidden">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
              Projekt
            </label>
            <select
              value={filterProject}
              onChange={(e) => onFilterChange('project', e.target.value)}
              className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
            >
              <option value="">Alle Projekte</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
              Tätigkeitsart
            </label>
            <select
              value={filterActivity}
              onChange={(e) => onFilterChange('activity', e.target.value)}
              className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
            >
              <option value="">Alle Tätigkeiten</option>
              {activityTypes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
              Von
            </label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => onFilterChange('from', e.target.value)}
              className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
              Bis
            </label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => onFilterChange('to', e.target.value)}
              className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
            {filtered.length} Einträge · {formatMinutes(filteredMinutes)}
          </span>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white/80 px-4 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/65 dark:text-stone-200 dark:hover:border-stone-100"
          >
            ↓ CSV Export
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white/80 px-4 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/65 dark:text-stone-200 dark:hover:border-stone-100"
          >
            ⎙ Drucken
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h2 className="text-xl font-bold">Zeiterfassung</h2>
        <p className="text-sm text-stone-500">
          Gesamt: {formatMinutes(filteredMinutes)} · {filtered.length} Einträge
        </p>
      </div>

      {/* Table */}
      <div className="bg-white/72 overflow-x-auto rounded-[1.35rem] border border-stone-200/80 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200/80 text-left dark:border-stone-700/80">
              <th className="px-4 py-3 font-semibold text-stone-600 dark:text-stone-400">
                Datum
              </th>
              <th className="px-4 py-3 font-semibold text-stone-600 dark:text-stone-400">
                Mitarbeiter
              </th>
              <th className="px-4 py-3 font-semibold text-stone-600 dark:text-stone-400">
                Projekt
              </th>
              <th className="px-4 py-3 font-semibold text-stone-600 dark:text-stone-400">
                Tätigkeit
              </th>
              <th className="px-4 py-3 font-semibold text-stone-600 dark:text-stone-400">
                Beschreibung
              </th>
              <th className="px-4 py-3 font-semibold text-stone-600 dark:text-stone-400">
                Zeit
              </th>
              <th className="px-4 py-3 font-semibold text-stone-600 dark:text-stone-400">
                Dauer
              </th>
              <th className="px-4 py-3 print:hidden" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-stone-400"
                >
                  Keine Einträge gefunden.
                </td>
              </tr>
            )}
            {filtered.map((entry) => (
              <tr
                key={entry.id}
                className="transition hover:bg-stone-50/60 dark:hover:bg-stone-900/30"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                  {entry.staffUserName}
                </td>
                <td className="px-4 py-3">
                  {entry.projectName ? (
                    <span className="flex items-center gap-1.5">
                      <ProjectDot color={entry.projectColor} />
                      {entry.projectName}
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                  {entry.activityTypeName ?? '—'}
                </td>
                <td className="max-w-[14rem] truncate px-4 py-3 text-stone-600 dark:text-stone-300">
                  {entry.description || '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-stone-500 dark:text-stone-400">
                  {formatTime(entry.startTime)}
                  {entry.endTime && ` – ${formatTime(entry.endTime)}`}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">
                  {entry.isRunning ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      ⏱ läuft
                    </span>
                  ) : (
                    formatMinutes(entry.durationMinutes)
                  )}
                </td>
                <td className="px-4 py-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => void onDelete(entry.id)}
                    disabled={isDeletingEntry === entry.id || entry.isRunning}
                    className="rounded px-2 py-1 text-xs text-stone-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t border-stone-200/80 dark:border-stone-700/80">
                <td
                  colSpan={6}
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400"
                >
                  Gesamt
                </td>
                <td className="px-4 py-3 font-bold text-stone-800 dark:text-stone-100">
                  {formatMinutes(filteredMinutes)}
                </td>
                <td className="print:hidden" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Projekte Tab
// ---------------------------------------------------------------------------

interface ProjekteTabProps {
  projects: TimeProject[];
  onReload: () => Promise<void>;
}

function ProjekteTab({ projects, onReload }: ProjekteTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    color: '#6366f1',
    description: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setForm({ name: '', color: '#6366f1', description: '', isActive: true });
    setEditingId(null);
    setShowForm(true);
    setSaveError(undefined);
  }

  function openEdit(p: TimeProject) {
    setForm({
      name: p.name,
      color: p.color,
      description: p.description ?? '',
      isActive: p.isActive,
    });
    setEditingId(p.id);
    setShowForm(true);
    setSaveError(undefined);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setSaveError('Name ist erforderlich.');
      return;
    }
    setIsSaving(true);
    setSaveError(undefined);
    try {
      const url = editingId
        ? `/api/admin/time-projects/${editingId}`
        : '/api/admin/time-projects';
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setSaveError('Speichern fehlgeschlagen.');
        return;
      }
      setShowForm(false);
      await onReload();
    } catch {
      setSaveError('Netzwerkfehler.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/time-projects/${id}`, { method: 'DELETE' });
      await onReload();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {projects.length} Projekt{projects.length !== 1 ? 'e' : ''}
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-4 py-1.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-200/80 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200 dark:hover:bg-amber-300/25"
        >
          + Neues Projekt
        </button>
      </div>

      {showForm && (
        <div className="bg-white/72 rounded-[1.35rem] border border-stone-200/80 p-5 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
          <h3 className="mb-4 text-sm font-semibold">
            {editingId ? 'Projekt bearbeiten' : 'Neues Projekt'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Projektname"
                className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Farbe *
              </label>
              <ColorPicker
                value={form.color}
                onChange={(c) => setForm((f) => ({ ...f, color: c }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Beschreibung
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Kurze Beschreibung (optional)"
                className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
              />
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="rounded border-stone-300 accent-amber-500"
                />
                <span className="text-stone-700 dark:text-stone-300">
                  Aktiv
                </span>
              </label>
            </div>
          </div>
          {saveError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {saveError}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200/80 disabled:opacity-50 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200"
            >
              {isSaving ? 'Speichern…' : 'Speichern'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/72 overflow-hidden rounded-[1.35rem] border border-stone-200/80 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
        {projects.length === 0 ? (
          <div className="py-10 text-center text-sm text-stone-400">
            Noch keine Projekte. Lege dein erstes Projekt an!
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="h-5 w-5 flex-shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: p.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    {!p.isActive && (
                      <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                        inaktiv
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100"
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-500 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tätigkeitsarten Tab
// ---------------------------------------------------------------------------

interface TaetigkeitsartenTabProps {
  activityTypes: TimeActivityType[];
  onReload: () => Promise<void>;
}

function TaetigkeitsartenTab({
  activityTypes,
  onReload,
}: TaetigkeitsartenTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setForm({ name: '', description: '', isActive: true });
    setEditingId(null);
    setShowForm(true);
    setSaveError(undefined);
  }

  function openEdit(a: TimeActivityType) {
    setForm({
      name: a.name,
      description: a.description ?? '',
      isActive: a.isActive,
    });
    setEditingId(a.id);
    setShowForm(true);
    setSaveError(undefined);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setSaveError('Name ist erforderlich.');
      return;
    }
    setIsSaving(true);
    setSaveError(undefined);
    try {
      const url = editingId
        ? `/api/admin/time-activity-types/${editingId}`
        : '/api/admin/time-activity-types';
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setSaveError('Speichern fehlgeschlagen.');
        return;
      }
      setShowForm(false);
      await onReload();
    } catch {
      setSaveError('Netzwerkfehler.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/time-activity-types/${id}`, { method: 'DELETE' });
      await onReload();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {activityTypes.length} Tätigkeitsart
          {activityTypes.length !== 1 ? 'en' : ''}
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-4 py-1.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-200/80 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200 dark:hover:bg-amber-300/25"
        >
          + Neue Tätigkeitsart
        </button>
      </div>

      {showForm && (
        <div className="bg-white/72 rounded-[1.35rem] border border-stone-200/80 p-5 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
          <h3 className="mb-4 text-sm font-semibold">
            {editingId ? 'Tätigkeitsart bearbeiten' : 'Neue Tätigkeitsart'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="z.B. Entwicklung, Meeting, Beratung…"
                className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Beschreibung
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Kurze Beschreibung (optional)"
                className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
              />
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="rounded border-stone-300 accent-amber-500"
                />
                <span className="text-stone-700 dark:text-stone-300">
                  Aktiv
                </span>
              </label>
            </div>
          </div>
          {saveError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {saveError}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/85 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200/80 disabled:opacity-50 dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200"
            >
              {isSaving ? 'Speichern…' : 'Speichern'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/72 overflow-hidden rounded-[1.35rem] border border-stone-200/80 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
        {activityTypes.length === 0 ? (
          <div className="py-10 text-center text-sm text-stone-400">
            Noch keine Tätigkeitsarten. Beispiele: Entwicklung, Meeting,
            Beratung, Design.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {activityTypes.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{a.name}</span>
                    {!a.isActive && (
                      <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                        inaktiv
                      </span>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {a.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100"
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-500 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auswertung Tab
// ---------------------------------------------------------------------------

interface AuswertungTabProps {
  entries: TimeEntry[];
  projects: TimeProject[];
  activityTypes: TimeActivityType[];
}

function AuswertungTab({
  entries,
  projects,
  activityTypes,
}: AuswertungTabProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const monthEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return (
      !e.isRunning && d.getFullYear() === year && d.getMonth() + 1 === month
    );
  });

  const totalMinutes = monthEntries.reduce((s, e) => s + e.durationMinutes, 0);
  const billableMinutes = monthEntries
    .filter((e) => e.isBillable)
    .reduce((s, e) => s + e.durationMinutes, 0);

  // Per project
  const byProject = projects
    .map((p) => {
      const mins = monthEntries
        .filter((e) => e.projectId === p.id)
        .reduce((s, e) => s + e.durationMinutes, 0);
      return { ...p, minutes: mins };
    })
    .filter((p) => p.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  // Per activity type
  const byActivity = activityTypes
    .map((a) => {
      const mins = monthEntries
        .filter((e) => e.activityTypeId === a.id)
        .reduce((s, e) => s + e.durationMinutes, 0);
      return { ...a, minutes: mins };
    })
    .filter((a) => a.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  // Without project
  const noneMinutes = monthEntries
    .filter((e) => !e.projectId)
    .reduce((s, e) => s + e.durationMinutes, 0);

  const months = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];

  return (
    <div className="space-y-5">
      {/* Month picker */}
      <div className="bg-white/72 rounded-[1.35rem] border border-stone-200/80 p-4 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
          >
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-100"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Gesamt',
            value: formatMinutes(totalMinutes),
            sub: `${monthEntries.length} Einträge`,
          },
          {
            label: 'Abrechenbar',
            value: formatMinutes(billableMinutes),
            sub:
              totalMinutes > 0
                ? `${Math.round((billableMinutes / totalMinutes) * 100)}%`
                : '0%',
          },
          {
            label: 'Projekte aktiv',
            value: String(byProject.length),
            sub: `${byActivity.length} Tätigkeitsarten`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white/72 rounded-[1.35rem] border border-stone-200/80 p-4 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">
              {card.value}
            </p>
            <p className="text-xs text-stone-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* By project */}
      {(byProject.length > 0 || noneMinutes > 0) && (
        <div className="bg-white/72 overflow-hidden rounded-[1.35rem] border border-stone-200/80 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
          <div className="border-b border-stone-200/80 px-5 py-3 dark:border-stone-700/80">
            <h3 className="text-sm font-semibold">Stunden nach Projekt</h3>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {byProject.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold">
                    {formatMinutes(p.minutes)}
                  </span>
                  {totalMinutes > 0 && (
                    <span className="ml-2 text-xs text-stone-400">
                      {Math.round((p.minutes / totalMinutes) * 100)}%
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${totalMinutes > 0 ? (p.minutes / totalMinutes) * 100 : 0}%`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {noneMinutes > 0 && (
              <div className="flex items-center gap-4 px-5 py-3">
                <div className="h-3 w-3 flex-shrink-0 rounded-full bg-stone-300 dark:bg-stone-600" />
                <span className="flex-1 text-sm font-medium text-stone-500">
                  Kein Projekt
                </span>
                <span className="text-sm font-semibold">
                  {formatMinutes(noneMinutes)}
                </span>
                <div className="w-24">
                  <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-1.5 rounded-full bg-stone-300 dark:bg-stone-600"
                      style={{
                        width: `${totalMinutes > 0 ? (noneMinutes / totalMinutes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* By activity type */}
      {byActivity.length > 0 && (
        <div className="bg-white/72 overflow-hidden rounded-[1.35rem] border border-stone-200/80 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/45">
          <div className="border-b border-stone-200/80 px-5 py-3 dark:border-stone-700/80">
            <h3 className="text-sm font-semibold">
              Stunden nach Tätigkeitsart
            </h3>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {byActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                <span className="flex-1 text-sm font-medium">{a.name}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold">
                    {formatMinutes(a.minutes)}
                  </span>
                  {totalMinutes > 0 && (
                    <span className="ml-2 text-xs text-stone-400">
                      {Math.round((a.minutes / totalMinutes) * 100)}%
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-1.5 rounded-full bg-amber-400"
                      style={{
                        width: `${totalMinutes > 0 ? (a.minutes / totalMinutes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthEntries.length === 0 && (
        <div className="rounded-[1.35rem] border border-dashed border-stone-300 py-12 text-center dark:border-stone-700">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Keine Einträge für {months[month - 1]} {year}.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

export function TimeTrackingAdminSection() {
  const [activeTab, setActiveTab] = useState<Tab>('uebersicht');
  const [projects, setProjects] = useState<TimeProject[]>([]);
  const [activityTypes, setActivityTypes] = useState<TimeActivityType[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();

  // Timer state
  const [isTimerLoading, setIsTimerLoading] = useState(false);

  // Week navigation
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(new Date())
  );

  // Entry form state
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [newEntryDate, setNewEntryDate] = useState(
    toLocalDateString(new Date())
  );
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [saveEntryError, setSaveEntryError] = useState<string>();
  const [isDeletingEntry, setIsDeletingEntry] = useState<string | null>(null);

  // Entries filter state
  const [filterProject, setFilterProject] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const runningEntry = entries.find((e) => e.isRunning) ?? null;

  const weekEnd = addDays(weekStart, 6);
  const weekEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d >= weekStart && d <= weekEnd;
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(undefined);
    try {
      const [projectsRes, activityRes, entriesRes] = await Promise.all([
        fetch('/api/admin/time-projects'),
        fetch('/api/admin/time-activity-types'),
        fetch('/api/admin/time-entries'),
      ]);

      const projectsData =
        await readJsonResponse<ApiResponse<TimeProject[]>>(projectsRes);
      const activityData =
        await readJsonResponse<ApiResponse<TimeActivityType[]>>(activityRes);
      const entriesData =
        await readJsonResponse<ApiResponse<TimeEntry[]>>(entriesRes);

      if (projectsData?.data) setProjects(projectsData.data);
      if (activityData?.data) setActivityTypes(activityData.data);
      if (entriesData?.data) setEntries(entriesData.data);
    } catch {
      setLoadError('Daten konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function reloadProjects() {
    const res = await fetch('/api/admin/time-projects');
    const data = await readJsonResponse<ApiResponse<TimeProject[]>>(res);
    if (data?.data) setProjects(data.data);
  }

  async function reloadActivityTypes() {
    const res = await fetch('/api/admin/time-activity-types');
    const data = await readJsonResponse<ApiResponse<TimeActivityType[]>>(res);
    if (data?.data) setActivityTypes(data.data);
  }

  async function reloadEntries() {
    const res = await fetch('/api/admin/time-entries');
    const data = await readJsonResponse<ApiResponse<TimeEntry[]>>(res);
    if (data?.data) setEntries(data.data);
  }

  async function handleTimerStart(
    projectId: string | null,
    activityTypeId: string | null,
    description: string
  ) {
    setIsTimerLoading(true);
    try {
      await fetch('/api/admin/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timerStart: true,
          projectId,
          activityTypeId,
          description,
          isBillable: true,
        }),
      });
      await reloadEntries();
    } finally {
      setIsTimerLoading(false);
    }
  }

  async function handleTimerStop() {
    if (!runningEntry) return;
    setIsTimerLoading(true);
    try {
      await fetch(`/api/admin/time-entries/${runningEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timerStop: true }),
      });
      await reloadEntries();
    } finally {
      setIsTimerLoading(false);
    }
  }

  function handleWeekChange(delta: number) {
    if (delta === 0) {
      setWeekStart(getWeekStart(new Date()));
    } else {
      setWeekStart((prev) => addDays(prev, delta * 7));
    }
  }

  function handleDayClick(date: Date) {
    setNewEntryDate(toLocalDateString(date));
    setEditingEntry(null);
    setShowEntryForm(true);
    setSaveEntryError(undefined);
  }

  function handleShowNewEntry() {
    setNewEntryDate(toLocalDateString(new Date()));
    setEditingEntry(null);
    setShowEntryForm(true);
    setSaveEntryError(undefined);
  }

  function handleCancelEntryForm() {
    setShowEntryForm(false);
    setEditingEntry(null);
    setSaveEntryError(undefined);
  }

  async function handleSaveEntry(data: EntryFormState) {
    setIsSavingEntry(true);
    setSaveEntryError(undefined);
    try {
      const durationMinutes =
        Number(data.durationHours) * 60 + Number(data.durationMinutes);

      const buildDateTime = (dateStr: string, timeStr: string) => {
        if (!timeStr) return null;
        return `${dateStr}T${timeStr}:00`;
      };

      const body = {
        projectId: data.projectId || null,
        activityTypeId: data.activityTypeId || null,
        date: data.date,
        startTime: buildDateTime(data.date, data.startTime),
        endTime: buildDateTime(data.date, data.endTime),
        durationMinutes,
        description: data.description,
        isRunning: false,
        isBillable: data.isBillable,
      };

      const url = editingEntry
        ? `/api/admin/time-entries/${editingEntry.id}`
        : '/api/admin/time-entries';

      const res = await fetch(url, {
        method: editingEntry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setSaveEntryError('Speichern fehlgeschlagen.');
        return;
      }

      setShowEntryForm(false);
      setEditingEntry(null);
      await reloadEntries();
    } catch {
      setSaveEntryError('Netzwerkfehler.');
    } finally {
      setIsSavingEntry(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    setIsDeletingEntry(id);
    try {
      await fetch(`/api/admin/time-entries/${id}`, { method: 'DELETE' });
      await reloadEntries();
    } finally {
      setIsDeletingEntry(null);
    }
  }

  function handleFilterChange(key: string, value: string) {
    if (key === 'project') setFilterProject(value);
    if (key === 'activity') setFilterActivity(value);
    if (key === 'from') setFilterFrom(value);
    if (key === 'to') setFilterTo(value);
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (filterProject) params.set('projectId', filterProject);
    if (filterActivity) params.set('activityTypeId', filterActivity);
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    window.open(
      `/api/admin/time-entries/export?${params.toString()}`,
      '_blank'
    );
  }

  function handlePrint() {
    window.print();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'uebersicht', label: 'Übersicht' },
    { id: 'eintraege', label: 'Alle Einträge' },
    { id: 'projekte', label: 'Projekte' },
    { id: 'taetigkeitsarten', label: 'Tätigkeitsarten' },
    { id: 'auswertung', label: 'Auswertung' },
  ];

  const totalMinutes = entries
    .filter((e) => !e.isRunning)
    .reduce((s, e) => s + e.durationMinutes, 0);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Page header */}
      <div className="print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
              Zeiterfassung
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Zeiten erfassen, Projekte zuordnen, Auswertungen abrufen.
            </p>
          </div>
          {!isLoading && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
                {entries.filter((e) => !e.isRunning).length} Einträge gesamt
              </span>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
                {formatMinutes(totalMinutes)} gesamt
              </span>
              {runningEntry && (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  ⏱ Timer läuft
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                activeTab === tab.id
                  ? 'border-amber-300/80 bg-amber-100/85 text-amber-900 shadow-sm dark:border-amber-300/35 dark:bg-amber-300/15 dark:text-amber-200'
                  : 'bg-white/62 hover:bg-white/88 border-stone-200/70 text-stone-700 hover:border-stone-300/80 dark:border-stone-700/70 dark:bg-stone-900/35 dark:text-stone-200 dark:hover:border-stone-600/80 dark:hover:bg-stone-900/60'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {loadError && (
        <div className="rounded-[1.35rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
          <button
            type="button"
            onClick={() => void loadData()}
            className="ml-3 underline"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
        </div>
      )}

      {/* Tab content */}
      {!isLoading && !loadError && (
        <>
          {activeTab === 'uebersicht' && (
            <UebersichtTab
              projects={projects}
              activityTypes={activityTypes}
              weekEntries={weekEntries}
              weekStart={weekStart}
              runningEntry={runningEntry}
              onTimerStart={handleTimerStart}
              onTimerStop={handleTimerStop}
              isTimerLoading={isTimerLoading}
              onWeekChange={handleWeekChange}
              onDayClick={handleDayClick}
              showEntryForm={showEntryForm}
              newEntryDate={newEntryDate}
              editingEntry={editingEntry}
              onSaveEntry={handleSaveEntry}
              onCancelEntryForm={handleCancelEntryForm}
              onShowNewEntry={handleShowNewEntry}
              isSavingEntry={isSavingEntry}
              saveEntryError={saveEntryError}
              onDeleteEntry={handleDeleteEntry}
              isDeletingEntry={isDeletingEntry}
            />
          )}
          {activeTab === 'eintraege' && (
            <EintraegeTab
              entries={entries}
              projects={projects}
              activityTypes={activityTypes}
              filterProject={filterProject}
              filterActivity={filterActivity}
              filterFrom={filterFrom}
              filterTo={filterTo}
              onFilterChange={handleFilterChange}
              onExport={handleExport}
              onPrint={handlePrint}
              onDelete={handleDeleteEntry}
              isDeletingEntry={isDeletingEntry}
            />
          )}
          {activeTab === 'projekte' && (
            <ProjekteTab projects={projects} onReload={reloadProjects} />
          )}
          {activeTab === 'taetigkeitsarten' && (
            <TaetigkeitsartenTab
              activityTypes={activityTypes}
              onReload={reloadActivityTypes}
            />
          )}
          {activeTab === 'auswertung' && (
            <AuswertungTab
              entries={entries}
              projects={projects}
              activityTypes={activityTypes}
            />
          )}
        </>
      )}
    </div>
  );
}
