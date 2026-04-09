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
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  resetNonce?: number;
};

export function TurnstileWidget({
  siteKey,
  onTokenChange,
  resetNonce = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const hasMountedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isInteractiveVisible, setIsInteractiveVisible] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (
      !scriptLoaded ||
      !window.turnstile ||
      widgetIdRef.current ||
      !containerRef.current
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      appearance: 'interaction-only',
      execution: 'render',
      theme: 'auto',
      size: 'flexible',
      action: 'contact_form',
      'before-interactive-callback': () => {
        setIsInteractiveVisible(true);
      },
      'after-interactive-callback': () => {
        setIsInteractiveVisible(false);
      },
      callback: (token: string) => {
        setIsInteractiveVisible(false);
        onTokenChangeRef.current(token);
      },
      'expired-callback': () => {
        setIsInteractiveVisible(false);
        onTokenChangeRef.current(null);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
      'error-callback': () => {
        setIsInteractiveVisible(false);
        onTokenChangeRef.current(null);
      },
      'timeout-callback': () => {
        setIsInteractiveVisible(true);
        onTokenChangeRef.current(null);
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey]);

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
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isInteractiveVisible
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
