'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>
      ) => string;
      execute: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetNonce?: number;
  executeNonce?: number;
  shouldLoadScript?: boolean;
  appearance?: 'interaction-only' | 'always';
  execution?: 'render' | 'execute';
  action?: string;
};

export function TurnstileWidget({
  siteKey,
  onTokenChange,
  resetNonce = 0,
  executeNonce = 0,
  shouldLoadScript = true,
  appearance = 'interaction-only',
  execution = 'render',
  action = 'contact_form',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const hasMountedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isInteractiveVisible, setIsInteractiveVisible] = useState(false);
  const isTurnstileReady =
    scriptLoaded ||
    (typeof window !== 'undefined' && Boolean(window.turnstile));

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (
      !isTurnstileReady ||
      !window.turnstile ||
      widgetIdRef.current ||
      !containerRef.current
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      appearance,
      execution,
      theme: 'auto',
      size: 'flexible',
      action,
      'before-interactive-callback': () => {
        if (appearance === 'interaction-only') {
          setIsInteractiveVisible(true);
        }
      },
      'after-interactive-callback': () => {
        if (appearance === 'interaction-only') {
          setIsInteractiveVisible(false);
        }
      },
      callback: (token: string) => {
        if (appearance === 'interaction-only') {
          setIsInteractiveVisible(false);
        }
        onTokenChangeRef.current(token);
      },
      'expired-callback': () => {
        if (appearance === 'interaction-only') {
          setIsInteractiveVisible(false);
        }
        onTokenChangeRef.current(null);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
      'error-callback': () => {
        if (appearance === 'interaction-only') {
          setIsInteractiveVisible(false);
        }
        onTokenChangeRef.current(null);
      },
      'timeout-callback': () => {
        if (appearance === 'interaction-only') {
          setIsInteractiveVisible(true);
        }
        onTokenChangeRef.current(null);
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, appearance, execution, isTurnstileReady, siteKey]);

  useEffect(() => {
    if (execution !== 'execute') {
      return;
    }

    if (!widgetIdRef.current || !window.turnstile || executeNonce < 1) {
      return;
    }

    onTokenChangeRef.current(null);
    window.turnstile.reset(widgetIdRef.current);
    window.turnstile.execute(widgetIdRef.current);
  }, [executeNonce, execution, isTurnstileReady]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (!widgetIdRef.current || !window.turnstile) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsInteractiveVisible(false);
      onTokenChangeRef.current(null);

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [resetNonce]);

  return (
    <>
      {shouldLoadScript && !isTurnstileReady ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => {
            setScriptLoaded(true);
          }}
        />
      ) : null}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          appearance === 'always' || isInteractiveVisible
            ? 'mt-2 max-h-56 opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="rounded-2xl border border-stone-300/80 bg-stone-50/85 px-4 py-4 shadow-[0_8px_24px_rgba(28,25,23,0.08)] dark:border-stone-600/80 dark:bg-stone-900/55 dark:shadow-none">
          <div className="mx-auto flex max-w-[320px] justify-center">
            <div
              ref={containerRef}
              className="min-h-[65px] w-full"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </>
  );
}
