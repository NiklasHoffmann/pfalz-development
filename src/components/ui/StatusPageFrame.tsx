import type { ReactNode } from 'react';

interface StatusPageAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'accent';
}

interface StatusPageFrameProps {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  statusValue: string;
  actions?: StatusPageAction[];
  asideEyebrow: string;
  asideTitle: string;
  asideDescription: string;
  asideBody?: ReactNode;
}

function getActionClassName(variant: StatusPageAction['variant']) {
  if (variant === 'outline') {
    return 'border border-stone-300 text-stone-800 hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50';
  }

  if (variant === 'accent') {
    return 'border border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-500 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:border-amber-300 dark:hover:bg-amber-500/20';
  }

  return 'bg-stone-950 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200';
}

export function StatusPageFrame({
  eyebrow,
  title,
  description,
  statusLabel,
  statusValue,
  actions = [],
  asideEyebrow,
  asideTitle,
  asideDescription,
  asideBody,
}: StatusPageFrameProps) {
  return (
    <main className="surface-page relative isolate min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-16 h-44 w-44 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute right-[10%] top-[18%] h-56 w-56 rounded-full bg-orange-300/40 blur-3xl dark:bg-sky-400/10" />
        <div className="absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-stone-200/70 blur-3xl dark:bg-stone-700/20" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:gap-8">
          <div className="bg-white/88 dark:bg-stone-900/82 rounded-[2rem] border border-stone-200/80 p-8 shadow-[0_30px_80px_rgba(28,25,23,0.08)] backdrop-blur dark:border-stone-700/70 dark:shadow-[0_30px_80px_rgba(0,0,0,0.22)] sm:p-10">
            <div className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
              {eyebrow}
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <span className="text-sm font-medium uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                {statusLabel}
              </span>
              <span className="text-sm text-stone-700 dark:text-stone-300">
                {statusValue}
              </span>
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700 dark:text-stone-300 sm:text-lg">
              {description}
            </p>

            {!!actions.length && (
              <div className="mt-8 flex flex-wrap gap-3">
                {actions.map((action) => {
                  const className = `inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${getActionClassName(action.variant)}`;

                  if (action.href) {
                    return (
                      <a
                        key={action.label}
                        href={action.href}
                        className={className}
                      >
                        {action.label}
                      </a>
                    );
                  }

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className={className}
                    >
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="rounded-[2rem] border border-stone-200/80 bg-stone-950 p-8 text-stone-50 shadow-[0_24px_64px_rgba(28,25,23,0.18)] dark:border-stone-700/70 dark:bg-stone-900 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              {asideEyebrow}
            </p>
            <div className="mt-6 rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-br from-amber-400/15 via-transparent to-sky-400/10 p-6">
              <p className="text-lg font-semibold tracking-tight text-white">
                {asideTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-200">
                {asideDescription}
              </p>
              {asideBody ? <div className="mt-6">{asideBody}</div> : null}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
